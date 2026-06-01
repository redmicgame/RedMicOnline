import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useFirebase } from '../context/FirebaseContext';
import ConfirmationModal from './ConfirmationModal';
import type { Artist, Group } from '../types';

type Mode = 'solo' | 'group' | 'online';

interface MemberState {
    name: string;
    image: string | null;
}

const StartScreen: React.FC = () => {
    const { dispatch } = useGame();
    const { user, login } = useFirebase();
    const [mode, setMode] = useState<Mode>('solo');
    
    // Solo state
    const [soloName, setSoloName] = useState('');
    const [soloAge, setSoloAge] = useState(18);
    const [soloCountry, setSoloCountry] = useState<'UK' | 'US'>('US');
    const [soloImage, setSoloImage] = useState<string | null>(null);
    const [soloFandomName, setSoloFandomName] = useState('');
    const [soloPronouns, setSoloPronouns] = useState<'he/him' | 'she/her' | 'they/them'>('they/them');
    const [startYear, setStartYear] = useState(new Date().getFullYear());
    const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard' | 'extreme'>('normal');
    
    // Online specific state
    const [onlineArtistName, setOnlineArtistName] = useState('');
    const [onlineGenre, setOnlineGenre] = useState('Pop');
    
    // Group state
    const [groupName, setGroupName] = useState('');
    const [groupFandomName, setGroupFandomName] = useState('');
    const [groupImage, setGroupImage] = useState<string | null>(null);
    const [memberCount, setMemberCount] = useState(2);
    const [members, setMembers] = useState<MemberState[]>(Array(2).fill({ name: '', image: null }));

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [onlineProfile, setOnlineProfile] = useState<any>(null);

    useEffect(() => {
        if (user && mode === 'online') {
            const checkOnlineProfile = async () => {
                setIsLoading(true);
                const { getOrCreateUser, getArtistData } = await import('../firebase');
                const userData = await getOrCreateUser(user);
                if (userData?.activeArtistId) {
                    const artist = await getArtistData(userData.activeArtistId);
                    if (artist) {
                        setOnlineProfile(artist);
                    }
                }
                setIsLoading(false);
            };
            checkOnlineProfile();
        }
    }, [user, mode]);

    const handleMemberCountChange = (count: number) => {
        const newCount = Math.max(2, Math.min(4, count));
        setMemberCount(newCount);
        const newMembers = [...members];
        while (newMembers.length < newCount) {
            newMembers.push({ name: '', image: null });
        }
        setMembers(newMembers.slice(0, newCount));
    };

    const handleMemberChange = (index: number, field: keyof MemberState, value: string | null) => {
        const newMembers = [...members];
        newMembers[index] = { ...newMembers[index], [field]: value };
        setMembers(newMembers);
    };

    const handleImageUpload = (setter: (value: string | null) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setter(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (mode === 'online') {
            if (!user) {
                setError('You must sign in to play Online Mode.');
                return;
            }
            if (onlineProfile) {
                // Load existing online profile
                dispatch({ type: 'START_ONLINE_GAME', payload: { onlineArtist: onlineProfile } });
                return;
            }
            if (!onlineArtistName.trim() || !onlineGenre.trim()) {
                setError('Artist name and genre are required.'); return;
            }
            setIsLoading(true);
            try {
                const { createOnlineArtist } = await import('../firebase');
                const newArtist = await createOnlineArtist(user.uid, onlineArtistName.trim(), onlineGenre.trim());
                if (newArtist) {
                    dispatch({ type: 'START_ONLINE_GAME', payload: { onlineArtist: newArtist } });
                }
            } catch (err: any) {
                setError('Failed to create online artist: ' + err.message);
            }
            setIsLoading(false);
            return;
        }

        if (mode === 'solo') {
            if (!soloName.trim() || !soloImage || !soloFandomName.trim()) {
                setError('Artist name, image, and fandom name are required.'); return;
            }
            if (soloAge < 16) {
                setError('Artist must be at least 16 years old.'); return;
            }
            const newArtist: Artist = {
                id: crypto.randomUUID(),
                name: soloName.trim(),
                age: soloAge,
                country: soloCountry,
                image: soloImage,
                pronouns: soloPronouns,
                fandomName: soloFandomName.trim()
            };
            dispatch({ type: 'START_SOLO_GAME', payload: { artist: newArtist, startYear, difficultyMode: difficulty } });
        } else if (mode === 'group') {
            if (!groupName.trim() || !groupImage || !groupFandomName.trim()) {
                setError('Group name, image, and fandom name are required.'); return;
            }
            if (members.some(m => !m.name.trim() || !m.image)) {
                setError('All group members must have a name and image.'); return;
            }

            const newGroup: Group = {
                id: crypto.randomUUID(),
                name: groupName.trim(),
                image: groupImage,
                fandomName: groupFandomName.trim(),
                members: members.map(m => ({
                    id: crypto.randomUUID(),
                    name: m.name.trim(),
                    image: m.image!,
                    age: Math.floor(Math.random() * 5) + 18,
                    country: Math.random() > 0.5 ? 'US' : 'UK',
                    pronouns: 'they/them', // Group members get default pronouns
                    fandomName: groupFandomName.trim()
                }))
            };
            dispatch({ type: 'START_GROUP_GAME', payload: { group: newGroup, startYear, difficultyMode: difficulty } });
        }
    };

    const handleFileUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }
    
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error('Failed to read file content.');
                }
    
                const loadedState = JSON.parse(text);
                if (loadedState.careerMode && loadedState.artistsData) {
                    dispatch({ type: 'LOAD_GAME', payload: loadedState });
                } else {
                    throw new Error('Invalid save data structure.');
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
                console.error("Failed to import save data:", err);
                setError(`Invalid or corrupted save file. ${errorMessage}`);
            }
        };
        reader.onerror = () => {
             setError('Failed to read the save file.');
        }
        reader.readAsText(file);
    
        // Reset file input value to allow re-uploading the same file
        event.target.value = '';
    };

    const [cloudSaves, setCloudSaves] = useState<any[]>([]);
    const [isLoadingSaves, setIsLoadingSaves] = useState(false);
    const [showSavesList, setShowSavesList] = useState(false);

    const [saveToDelete, setSaveToDelete] = useState<string | null>(null);

    React.useEffect(() => {
        if (user) {
            const fetchSaves = async () => {
                setIsLoadingSaves(true);
                const { getUserSaves } = await import('../firebase');
                const saves = await getUserSaves(user.uid);
                // Sort by most recently updated
                saves.sort((a, b) => b.updatedAt?.seconds - a.updatedAt?.seconds);
                setCloudSaves(saves);
                setIsLoadingSaves(false);
            };
            fetchSaves();
        } else {
            setShowSavesList(false);
            setCloudSaves([]);
        }
    }, [user]);

    const handleLoadCloudSave = (save: any) => {
        if (save.gameState) {
            // Need to set the current cloudSaveId so future saves overwrite it instead of creating new
            dispatch({ type: 'SET_CLOUD_SAVE_ID', payload: save.id });
            dispatch({ type: 'LOAD_GAME', payload: save.gameState });
        }
    };

    const confirmDeleteCloudSave = async () => {
        if (user && saveToDelete) {
            const { deleteCloudSave } = await import('../firebase');
            await deleteCloudSave(user.uid, saveToDelete);
            setCloudSaves(saves => saves.filter(s => s.id !== saveToDelete));
            if (cloudSaves.length <= 1) {
                setShowSavesList(false);
            }
            setSaveToDelete(null);
        }
    };

    if (showSavesList) {
        return (
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
                <ConfirmationModal 
                    isOpen={saveToDelete !== null} 
                    onClose={() => setSaveToDelete(null)}
                    onConfirm={confirmDeleteCloudSave}
                    title="Delete Cloud Save"
                    message="Are you sure you want to delete this cloud save? This action cannot be undone."
                    confirmText="Delete Save"
                />
                <div className="w-full max-w-md bg-zinc-800 rounded-2xl shadow-lg p-8 border border-red-500/30">
                    <h1 className="text-3xl font-black text-center text-red-500 mb-6">YOUR CLOUD SAVES</h1>
                    
                    {isLoadingSaves ? (
                        <p className="text-center animate-pulse text-zinc-400">Loading your saves...</p>
                    ) : cloudSaves.length === 0 ? (
                        <p className="text-center text-zinc-400 mb-6 font-medium">No saves found.</p>
                    ) : (
                        <div className="space-y-4 max-h-[50vh] overflow-y-auto mb-6 pr-2">
                            {cloudSaves.map((save) => (
                                <div key={save.id} className="relative group">
                                    <button 
                                        onClick={() => handleLoadCloudSave(save)}
                                        className="w-full text-left bg-zinc-700 hover:bg-zinc-600 transition-colors rounded-xl p-4 flex justify-between items-center border border-transparent hover:border-red-500/50"
                                    >
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{save.artistName || 'Unknown Artist'}</h3>
                                            <p className="text-zinc-400 text-sm">Year {save.year || 2024}, Week {save.week || 1}</p>
                                        </div>
                                        <span className="text-zinc-400 group-hover:text-red-400 group-hover:mr-8 transition-all">
                                            Load
                                        </span>
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSaveToDelete(save.id); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        title="Delete Save"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="border-t border-zinc-700 pt-6">
                        <button 
                            onClick={() => setShowSavesList(false)}
                            className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                        >
                            Start New Game
                        </button>
                        <p className="text-center text-xs text-zinc-500 mt-4">Signed in as {user?.email}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-zinc-800 rounded-2xl shadow-lg p-8 border border-red-500/30">
                    <h1 className="text-4xl font-black text-center text-red-500 mb-2">RED MIC</h1>
                    <h2 className="text-xl font-bold text-center text-white mb-6">ARTIST SIMULATOR</h2>
                    
                    {!user ? (
                        <div className="mb-6 flex justify-center">
                            <button onClick={login} className="flex items-center gap-2 bg-white text-black font-bold px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                                Sign in to use Cloud Saves & Online
                            </button>
                        </div>
                    ) : (
                        <div className="mb-6 text-center text-zinc-400 text-sm">
                            Signed in as {user.email}
                        </div>
                    )}

                    <div className={`grid gap-2 mb-6 ${user ? 'grid-cols-4' : 'grid-cols-3'}`}>
                        <button onClick={() => setMode('solo')} className={`py-3 px-1 rounded-lg font-bold text-sm transition-colors ${mode === 'solo' ? 'bg-red-600' : 'bg-zinc-700 hover:bg-zinc-600'}`}>Solo</button>
                        <button onClick={() => setMode('group')} className={`py-3 px-1 rounded-lg font-bold text-sm transition-colors ${mode === 'group' ? 'bg-red-600' : 'bg-zinc-700 hover:bg-zinc-600'}`}>Group</button>
                        <button onClick={() => setMode('online')} className={`py-3 px-1 rounded-lg font-bold text-sm transition-colors flex flex-col items-center justify-center ${mode === 'online' ? 'bg-blue-600' : 'bg-zinc-700 hover:bg-zinc-600'}`}>Online<span className="text-[10px] uppercase block tracking-wider font-normal">Realtime</span></button>
                        {user && (
                             <button type="button" onClick={() => setShowSavesList(true)} className="py-3 px-1 rounded-lg font-bold text-sm transition-colors bg-zinc-700 hover:bg-zinc-600">Saves</button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'online' ? (
                            <>
                                {!user ? (
                                    <div className="text-center text-zinc-300 mb-4 p-4 bg-zinc-700 rounded-lg">
                                        <p>You need to sign in with Google to play online against real players.</p>
                                    </div>
                                ) : isLoading ? (
                                    <p className="text-center animate-pulse text-zinc-400 h-24 flex items-center justify-center">Checking online profile...</p>
                                ) : onlineProfile ? (
                                    <div className="bg-zinc-700 p-4 rounded-lg text-center mb-4 border border-blue-500/30">
                                        <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-2xl mb-4 font-bold">
                                            {onlineProfile.name.charAt(0)}
                                        </div>
                                        <h3 className="text-xl font-bold text-white">{onlineProfile.name}</h3>
                                        <p className="text-red-400 font-bold mt-1">${(onlineProfile.funds).toLocaleString()}</p>
                                        <p className="text-zinc-300 text-sm mt-2">Ready to enter the servers?</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-center text-blue-400 text-sm font-semibold mb-4 bg-blue-900/20 p-2 rounded">
                                            Create your permanent Online Persona. Artists live in real-time, 1 Week = 1 Hour.
                                        </div>
                                        <div>
                                            <label htmlFor="online-artist-name" className="block text-sm font-medium text-zinc-300">Artist Name</label>
                                            <input type="text" id="online-artist-name" value={onlineArtistName} onChange={e => setOnlineArtistName(e.target.value)} className="mt-1 block w-full bg-zinc-700 border-zinc-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-10 px-3"/>
                                        </div>
                                        <div>
                                            <label htmlFor="online-genre" className="block text-sm font-medium text-zinc-300">Genre</label>
                                            <select id="online-genre" value={onlineGenre} onChange={e => setOnlineGenre(e.target.value)} className="mt-1 block w-full bg-zinc-700 border-zinc-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-10 px-3">
                                                <option>Pop</option>
                                                <option>Hip Hop / Rap</option>
                                                <option>R&B</option>
                                                <option>Rock</option>
                                                <option>Country</option>
                                                <option>Electronic</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                            </>
                        ) : mode === 'solo' ? (
                            <>
                                <div className="flex justify-center">
                                    <label htmlFor="artist-image" className="cursor-pointer">
                                        <div className="w-32 h-32 rounded-full bg-zinc-700 border-2 border-dashed border-zinc-500 flex items-center justify-center hover:border-red-500 transition-colors">
                                            {soloImage ? (
                                                <img src={soloImage} alt="Artist" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <span className="text-zinc-400 text-sm text-center">Upload Image</span>
                                            )}
                                        </div>
                                    </label>
                                    <input id="artist-image" type="file" accept="image/*" className="hidden" onChange={handleImageUpload(setSoloImage)} />
                                </div>
                                <div>
                                    <label htmlFor="artist-name" className="block text-sm font-medium text-zinc-300">Artist Name</label>
                                    <input type="text" id="artist-name" value={soloName} onChange={e => setSoloName(e.target.value)} className="mt-1 block w-full bg-zinc-700 border-zinc-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm h-10 px-3"/>
                                </div>
                                <div>
                                    <label htmlFor="fandom-name" className="block text-sm font-medium text-zinc-300">Fandom Name</label>
                                    <input type="text" id="fandom-name" value={soloFandomName} onChange={e => setSoloFandomName(e.target.value)} placeholder="e.g. Swifties, The Hive" className="mt-1 block w-full bg-zinc-700 border-zinc-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm h-10 px-3"/>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="artist-age" className="block text-sm font-medium text-zinc-300">Age</label>
                                        <input type="number" id="artist-age" value={soloAge} onChange={e => setSoloAge(parseInt(e.target.value))} className="mt-1 block w-full bg-zinc-700 border-zinc-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm h-10 px-3"/>
                                    </div>
                                    <div>
                                    <label htmlFor="pronouns" className="block text-sm font-medium text-zinc-300">Pronouns</label>
                                        <select id="pronouns" value={soloPronouns} onChange={e => setSoloPronouns(e.target.value as any)} className="mt-1 block w-full bg-zinc-700 border-zinc-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm h-10 px-3">
                                            <option>they/them</option>
                                            <option>she/her</option>
                                            <option>he/him</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="country" className="block text-sm font-medium text-zinc-300">Country</label>
                                        <select id="country" value={soloCountry} onChange={e => setSoloCountry(e.target.value as 'UK' | 'US')} className="mt-1 block w-full bg-zinc-700 border-zinc-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm h-10 px-3">
                                            <option>US</option>
                                            <option>UK</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="start-year" className="block text-sm font-medium text-zinc-300">Start Year</label>
                                        <input type="number" id="start-year" value={startYear} onChange={e => setStartYear(parseInt(e.target.value))} className="mt-1 block w-full bg-zinc-700 border-zinc-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm h-10 px-3"/>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex justify-center">
                                    <label htmlFor="group-image" className="cursor-pointer">
                                        <div className="w-32 h-32 rounded-lg bg-zinc-700 border-2 border-dashed border-zinc-500 flex items-center justify-center hover:border-red-500 transition-colors">
                                            {groupImage ? (
                                                <img src={groupImage} alt="Group" className="w-full h-full rounded-lg object-cover" />
                                            ) : (
                                                <span className="text-zinc-400 text-sm text-center">Upload Group Image</span>
                                            )}
                                        </div>
                                    </label>
                                    <input id="group-image" type="file" accept="image/*" className="hidden" onChange={handleImageUpload(setGroupImage)} />
                                </div>
                                <div>
                                    <label htmlFor="group-name" className="block text-sm font-medium text-zinc-300">Group Name</label>
                                    <input type="text" id="group-name" value={groupName} onChange={e => setGroupName(e.target.value)} className="mt-1 block w-full bg-zinc-700 border-zinc-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm h-10 px-3"/>
                                </div>
                                <div>
                                    <label htmlFor="group-fandom-name" className="block text-sm font-medium text-zinc-300">Fandom Name</label>
                                    <input type="text" id="group-fandom-name" value={groupFandomName} onChange={e => setGroupFandomName(e.target.value)} placeholder="e.g. The Army, Directioners" className="mt-1 block w-full bg-zinc-700 border-zinc-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm h-10 px-3"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300">Members</label>
                                    <div className="mt-1 grid grid-cols-3 gap-2">
                                        {[2, 3, 4].map(count => (
                                            <button type="button" key={count} onClick={() => handleMemberCountChange(count)} className={`py-2 rounded-lg font-bold text-sm transition-colors ${memberCount === count ? 'bg-red-600' : 'bg-zinc-700 hover:bg-zinc-600'}`}>{count}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                                    {members.map((member, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <label htmlFor={`member-image-${index}`} className="cursor-pointer">
                                                <div className="w-12 h-12 rounded-full bg-zinc-700 border-2 border-dashed border-zinc-600 flex items-center justify-center hover:border-red-500 transition-colors flex-shrink-0">
                                                    {member.image ? (
                                                        <img src={member.image} alt={`Member ${index + 1}`} className="w-full h-full rounded-full object-cover" />
                                                    ) : <span className="text-zinc-400 text-[10px] text-center">Img</span>}
                                                </div>
                                            </label>
                                            <input id={`member-image-${index}`} type="file" accept="image/*" className="hidden" onChange={handleImageUpload((val) => handleMemberChange(index, 'image', val))} />
                                            <input type="text" placeholder={`Member ${index + 1} Name`} value={member.name} onChange={e => handleMemberChange(index, 'name', e.target.value)} className="block w-full bg-zinc-700 border-zinc-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm h-10 px-3"/>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        <div>
                             <label htmlFor="difficulty" className="block text-sm font-medium text-zinc-300">Difficulty</label>
                             <select id="difficulty" value={difficulty} onChange={e => setDifficulty(e.target.value as any)} className="mt-1 block w-full bg-zinc-700 border-zinc-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm h-10 px-3">
                                  <option value="easy">Easy (Easier streams & charts, no stream decay)</option>
                                  <option value="normal">Normal (Classic experience)</option>
                                  <option value="hard">Hard (Harder charting & streams)</option>
                                  <option value="extreme">Extreme (Super hard)</option>
                             </select>
                        </div>

                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                        <button type="submit" className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-lg shadow-red-600/20">
                            START CAREER
                        </button>
                    </form>
                    <div className="mt-4 text-center">
                         <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileImport}
                            className="hidden"
                            accept=".json,application/json"
                        />
                        <button onClick={handleFileUploadClick} className="text-sm text-zinc-400 hover:text-white hover:underline">
                            Upload Save File (.json)
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StartScreen;