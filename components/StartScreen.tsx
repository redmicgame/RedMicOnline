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
    const [showPasswordPopup, setShowPasswordPopup] = useState(false);
    const [legacyArtistName, setLegacyArtistName] = useState('');

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [onlineProfile, setOnlineProfile] = useState<any>(null);

    const handleWipeServer = async () => {
        if (!window.confirm("ARE YOU SURE YOU WANT TO FORMAT THE SERVERS AND DELETE ALL DB DATA? THIS CANNOT BE UNDONE.")) return;
        const pwd = window.prompt("Enter admin password to format servers:");
        if (pwd !== "redmic-admin") {
            alert("Incorrect password.");
            return;
        }
        try {
            const { ref, get, remove } = await import('firebase/database');
            const { db } = await import('../firebase');
            console.log("Wiping...");
            const nodes = [
                'artists', 'songs', 'albums', 'x_posts', 'x_trends', 'news', 'online_songs', 'online_albums',
                'artists_v2', 'songs_v2', 'albums_v2', 'x_posts_v2', 'x_trends_v2', 'news_v2', 'online_songs_v2', 'online_albums_v2', 'saves_v2',
                'artists_v3', 'songs_v3', 'albums_v3', 'x_posts_v3', 'x_trends_v3', 'news_v3', 'online_songs_v3', 'online_albums_v3', 'saves_v3',
                'artists_v4', 'songs_v4', 'albums_v4', 'x_posts_v4', 'x_trends_v4', 'news_v4', 'online_songs_v4', 'online_albums_v4', 'saves_v4',
                'artists_v5', 'songs_v5', 'albums_v5', 'x_posts_v5', 'x_trends_v5', 'news_v5', 'online_songs_v5', 'online_albums_v5', 'saves_v5'
            ];
            for (const node of nodes) {
                const snapshot = await get(ref(db, node));
                if (snapshot.exists()) {
                    const promises: any[] = [];
                    snapshot.forEach((child) => {
                        promises.push(remove(child.ref));
                    });
                    await Promise.all(promises);
                }
            }
            alert("Database Wiped!");
        } catch(err) {
            alert("Failed to wipe DB: " + String(err));
        }
    };

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
            // Check if profile needs a password upgrade
            if (!onlineProfile.inviteCode && !showPasswordPopup) {
                setLegacyArtistName(onlineProfile.name);
                setShowPasswordPopup(true);
                return;
            }
            // Load existing online profile with save data if exists
            setIsLoading(true);
            try {
                const { loadOnlineGameState } = await import('../firebase');
                const savedState = await loadOnlineGameState(user.uid);
                if (savedState) {
                    // Start online game basically acts as a reset, so use LOAD_GAME if we have a state
                    dispatch({ type: 'LOAD_GAME', payload: savedState });
                } else {
                    dispatch({ type: 'START_ONLINE_GAME', payload: { onlineArtist: onlineProfile } });
                }
            } catch(e) {
                dispatch({ type: 'START_ONLINE_GAME', payload: { onlineArtist: onlineProfile } });
            }
            setIsLoading(false);
            return;
        }
        if (!onlineArtistName.trim() || !onlineGenre.trim()) {
            setError('Artist name and genre are required.'); return;
        }
        const lockedArtists: Record<string, string> = {
            'Melanie Martinez': 'crybaby',
            'Doja Cat': 'scarlet',
            'Tinashe': 'nasty'
        };
        const trimmedName = onlineArtistName.trim();
        
        if (lockedArtists[trimmedName]) {
            if (inviteCode !== lockedArtists[trimmedName]) {
                setError(`Incorrect password for protected artist: ${trimmedName}`);
                return;
            }
        }

        setIsLoading(true);
        try {
            if (lockedArtists[trimmedName]) {
                const { resetProtectedOnlineArtist } = await import('../firebase');
                const newArtist = await resetProtectedOnlineArtist(user.uid, trimmedName, onlineGenre.trim(), inviteCode.trim());
                if (newArtist) {
                    dispatch({ type: 'START_ONLINE_GAME', payload: { onlineArtist: newArtist } });
                }
            } else {
                const { createOnlineArtist, resumeOnlineArtist } = await import('../firebase');
                try {
                    const newArtist = await createOnlineArtist(user.uid, trimmedName, onlineGenre.trim(), inviteCode.trim());
                    if (newArtist) {
                        dispatch({ type: 'START_ONLINE_GAME', payload: { onlineArtist: newArtist } });
                    }
                } catch (createErr: any) {
                    if (createErr.message.includes('already taken')) {
                        // Try to resume instead if we own it
                        const existingArtist = await resumeOnlineArtist(user.uid, trimmedName, inviteCode.trim());
                        if (existingArtist) {
                            const { loadOnlineGameState } = await import('../firebase');
                            const savedState = await loadOnlineGameState(user.uid);
                            if (savedState) {
                                dispatch({ type: 'LOAD_GAME', payload: savedState });
                            } else {
                                dispatch({ type: 'START_ONLINE_GAME', payload: { onlineArtist: existingArtist } });
                            }
                        }
                    } else {
                        throw createErr;
                    }
                }
            }
        } catch (err: any) {
            if (err.message === 'NO_INVITE_CODE_SET') {
                setLegacyArtistName(trimmedName);
                setShowPasswordPopup(true);
            } else {
                setError('Failed: ' + err.message);
            }
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

                {!user ? (
                    <div className="space-y-6 mt-8">
                        <div className="flex justify-center flex-col items-center gap-4">
                            <p className="text-zinc-400 text-center text-sm">To enter the global servers and protect your artist, please sign in.</p>
                            <button type="button" onClick={login} className="flex items-center justify-center w-full gap-3 bg-white text-black font-bold h-12 rounded-lg hover:bg-zinc-200 transition-colors">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                                Sign in with Google
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleOnlineSubmit} className="space-y-4">
                        {showPasswordPopup && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                                <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-[90%] max-w-md shadow-2xl">
                                    <h3 className="text-xl font-bold text-white mb-2">Notice: Account Protection</h3>
                                    <p className="text-zinc-400 text-sm mb-4">
                                        The artist <b>{legacyArtistName}</b> was created before the new security update. Please choose a password to protect it from being stolen by other players.
                                    </p>
                                    <input type="text" value={inviteCode} onChange={e => setInviteCode(e.target.value)} placeholder="Choose a secure password/invite code" className="w-full bg-black border border-zinc-700 rounded-lg h-12 px-4 mb-4 text-white focus:ring-2 focus:ring-blue-500 outline-none" required />
                                    <div className="flex gap-3">
                                        <button type="button" onClick={() => setShowPasswordPopup(false)} className="flex-1 h-10 rounded-lg font-bold text-sm bg-zinc-800 hover:bg-zinc-700 transition">Cancel</button>
                                        <button type="button" onClick={async () => {
                                            if(!inviteCode.trim()) { alert("Please enter a password."); return; }
                                            try {
                                                const { resumeOnlineArtist, loadOnlineGameState } = await import('../firebase');
                                                const upgradedArtist = await resumeOnlineArtist(user!.uid, legacyArtistName, inviteCode.trim(), true);
                                                const savedState = await loadOnlineGameState(user!.uid);
                                                if (savedState) {
                                                    dispatch({ type: 'LOAD_GAME', payload: savedState });
                                                } else {
                                                    dispatch({ type: 'START_ONLINE_GAME', payload: { onlineArtist: upgradedArtist } });
                                                }
                                                setShowPasswordPopup(false);
                                            } catch(err: any) { alert(err.message); }
                                        }} className="flex-1 h-10 rounded-lg font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow shadow-blue-500/20 transition">Set Password & Enter</button>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="mb-4 text-center text-zinc-400 text-xs">
                            Signed in as {user.email}
                        </div>

                        {isLoading ? (
                            <p className="text-center animate-pulse text-zinc-400 h-24 flex items-center justify-center">Checking online profile...</p>
                        ) : onlineProfile ? (
                            <div className="bg-zinc-900 p-4 rounded-lg text-center border border-blue-500/30">
                                <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-2xl mb-3 font-bold">
                                    {(onlineProfile.name || '?').charAt(0)}
                                </div>
                                <h3 className="text-xl font-bold text-white">{onlineProfile.name || 'Unknown User'}</h3>
                                <p className="text-red-400 font-bold mt-1">${(onlineProfile.funds || 0).toLocaleString()}</p>
                                <p className="text-zinc-400 text-sm mt-3 border-t border-zinc-800 pt-3">Ready to enter the servers?</p>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-1">Artist Name</label>
                                    <input type="text" value={onlineArtistName} onChange={e => setOnlineArtistName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg h-12 px-4 focus:ring-2 focus:ring-blue-500 outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-1">Genre</label>
                                    <select value={onlineGenre} onChange={e => setOnlineGenre(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg h-12 px-4 focus:ring-2 focus:ring-blue-500 outline-none">
                                        <option>Pop</option>
                                        <option>Hip Hop / Rap</option>
                                        <option>R&B</option>
                                        <option>Rock</option>
                                        <option>Country</option>
                                        <option>Electronic</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-1">Password (Required to protect your artist)</label>
                                    <input type="text" value={inviteCode} onChange={e => setInviteCode(e.target.value)} placeholder="Choose a password" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg h-12 px-4 focus:ring-2 focus:ring-blue-500 outline-none" required />
                                </div>
                            </>
                        )}

                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        
                        <button type="button" onClick={handleWipeServer} className="w-full mt-4 h-12 bg-red-900/50 hover:bg-red-800 border-2 border-red-500 text-red-100 font-bold rounded-lg transition-colors text-lg tracking-wide uppercase">
                            Format Servers (Admin)
                        </button>

                        <button type="submit" disabled={isLoading} className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors mt-2 shadow-lg shadow-blue-500/20 text-lg tracking-wide">
                            {onlineProfile ? "ENTER ONLINE SERVER" : "CREATE ONLINE ARTIST"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default StartScreen;
