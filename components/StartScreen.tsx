import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useFirebase } from '../context/FirebaseContext';
import ConfirmationModal from './ConfirmationModal';
import type { Artist, Group } from '../types';

const StartScreen: React.FC = () => {
    const { dispatch } = useGame();
    const { user, login } = useFirebase();

    const [mode, setMode] = useState<'classic' | 'online'>('classic');
    
    // Classic specific state
    const [artistName, setArtistName] = useState('');
    const [difficulty, setDifficulty] = useState<'easy'|'normal'|'hard'|'extreme'>('normal');
    
    // Online specific state
    const [onlineArtistName, setOnlineArtistName] = useState('');
    const [onlineGenre, setOnlineGenre] = useState('Pop');
    const [inviteCode, setInviteCode] = useState('');

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [onlineProfile, setOnlineProfile] = useState<any>(null);

    useEffect(() => {
        if (user && mode === 'online') {
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
    }, [user, mode]);

    const handleClassicSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!artistName.trim()) {
            setError('Artist name is required.'); return;
        }

        const newArtist: Artist = {
            id: crypto.randomUUID(),
            name: artistName.trim(),
            funds: difficulty === 'easy' ? 500000 : difficulty === 'normal' ? 250000 : difficulty === 'hard' ? 50000 : 0,
            popularity: 0,
            energy: 100,
            createdAt: Date.now()
        };

        dispatch({ type: 'START_SOLO_GAME', payload: { artist: newArtist, startYear: 2024, difficultyMode: difficulty } });
    };

    const handleOnlineSubmit = async (e: React.FormEvent) => {
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
            const newArtist = await createOnlineArtist(user.uid, onlineArtistName.trim(), onlineGenre.trim(), inviteCode.trim());
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
        if (!file) return;
    
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error('Failed to read file content.');
                const loadedState = JSON.parse(text);
                if (loadedState.careerMode && loadedState.artistsData) {
                    dispatch({ type: 'LOAD_GAME', payload: loadedState });
                } else {
                    throw new Error('Invalid save data structure.');
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
                setError(`Invalid or corrupted save file. ${errorMessage}`);
            }
        };
        reader.onerror = () => setError('Failed to read the save file.');
        reader.readAsText(file);
        event.target.value = '';
    };

    return (
        <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4 text-white">
            <div className="w-full max-w-md bg-zinc-800 rounded-2xl shadow-lg p-8 border border-zinc-700/50">
                <h1 className="text-4xl font-black text-center text-red-500 mb-2">RED MIC</h1>
                <p className="text-center text-zinc-400 mb-6 font-semibold">THE MUSIC INDUSTRY SIMULATOR</p>

                <div className="flex gap-2 p-1 bg-zinc-900 rounded-lg mb-6">
                    <button 
                        onClick={() => setMode('classic')}
                        className={`flex-1 py-2 rounded-md font-bold transition-colors ${mode === 'classic' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Local
                    </button>
                    <button 
                        onClick={() => setMode('online')}
                        className={`flex-1 py-2 rounded-md font-bold transition-colors ${mode === 'online' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Online
                    </button>
                </div>

                {mode === 'classic' && (
                    <form onSubmit={handleClassicSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1">Artist Name</label>
                            <input type="text" value={artistName} onChange={e => setArtistName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg h-12 px-4 focus:ring-2 focus:ring-red-500 outline-none" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1">Difficulty</label>
                            <select value={difficulty} onChange={e => setDifficulty(e.target.value as any)} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg h-12 px-4 focus:ring-2 focus:ring-red-500 outline-none">
                                <option value="easy">Easy (Start with $500k)</option>
                                <option value="normal">Normal (Start with $250k)</option>
                                <option value="hard">Hard (Start with $50k)</option>
                                <option value="extreme">Extreme (Start with $0)</option>
                            </select>
                        </div>
                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        <button type="submit" className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors mt-2 text-lg tracking-wide">
                            START GAME
                        </button>
                        
                        <div className="pt-4 border-t border-zinc-700 mt-6">
                            <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".json" className="hidden" />
                            <button type="button" onClick={handleFileUploadClick} className="w-full h-12 bg-zinc-700 text-white font-bold rounded-lg hover:bg-zinc-600 transition-colors">
                                LOAD SAVE
                            </button>
                        </div>
                    </form>
                )}

                {mode === 'online' && (
                    <div className="space-y-4">
                        <div className="bg-zinc-900 border-2 border-red-900/50 p-6 rounded-xl text-center">
                            <div className="w-16 h-16 bg-red-900/20 rounded-full mx-auto flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <h2 className="text-2xl font-black text-white mb-2">SERVERS OFFLINE</h2>
                            <p className="text-zinc-400 mb-4 text-sm leading-relaxed">
                                Red Mic Online servers are currently down for maintenance and upgrades. 
                                We are working to bring them back online soon. In the meantime, you can continue playing 
                                Local career mode.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StartScreen;
