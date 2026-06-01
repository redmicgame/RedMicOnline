import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useFirebase } from '../context/FirebaseContext';
import ConfirmationModal from './ConfirmationModal';
import type { Artist, Group } from '../types';

const StartScreen: React.FC = () => {
    const { dispatch } = useGame();
    const { user, login } = useFirebase();
    
    // Online specific state
    const [onlineArtistName, setOnlineArtistName] = useState('');
    const [onlineGenre, setOnlineGenre] = useState('Pop');

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [onlineProfile, setOnlineProfile] = useState<any>(null);

    useEffect(() => {
        if (user) {
            const checkOnlineProfile = async () => {
                setIsLoading(true);
                try {
                    const { getOrCreateUser, getArtistData } = await import('../firebase');
                    const userData = await getOrCreateUser(user);
                    if (userData?.activeArtistId) {
                        const artist = await getArtistData(userData.activeArtistId);
                        if (artist) {
                            setOnlineProfile(artist);
                        }
                    }
                } catch (err) {
                    console.error("Error checking online profile:", err);
                } finally {
                    setIsLoading(false);
                }
            };
            checkOnlineProfile();
        }
    }, [user]);

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

        if (!user) {
            setError('You must sign in to play.');
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

    return (
        <>
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-zinc-800 rounded-2xl shadow-lg p-8 border border-red-500/30">
                    <h1 className="text-4xl font-black text-center text-red-500 mb-2">RED MIC</h1>
                    <h2 className="text-xl font-bold text-center text-white mb-6">ONLINE MULTIPLAYER</h2>
                    
                    {!user ? (
                        <div className="mb-6 flex justify-center flex-col items-center gap-4">
                            <p className="text-zinc-400 text-center">To enter the global servers, please sign in.</p>
                            <button onClick={login} className="flex items-center gap-2 bg-white text-black font-bold px-4 py-3 rounded-lg hover:bg-zinc-200 transition-colors">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                                Sign in with Google
                            </button>
                        </div>
                    ) : (
                        <div className="mb-6 text-center text-zinc-400 text-sm">
                            Signed in as {user.email}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <>
                            {!user ? null : isLoading ? (
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

                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                        {user && (
                            <button type="submit" disabled={isLoading} className="w-full h-12 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-lg shadow-red-600/20">
                                {onlineProfile ? "ENTER GAME" : "CREATE ARTIST"}
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </>
    );
};

export default StartScreen;