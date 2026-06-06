import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useFirebase } from '../context/FirebaseContext';
import ConfirmationModal from './ConfirmationModal';
import type { Artist, Group } from '../types';

const StartScreen: React.FC = () => {
    const { dispatch } = useGame();
    const { user, login } = useFirebase();

    const [mode, setMode] = useState<'classic' | 'online'>('online');
    
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
        alert("The servers have already been fully formatted and wiped as part of the V5 update! All previous version data has been isolated, and you are starting in a 100% fresh, clean database.\n\nPlease proceed by clicking 'ENTER ONLINE SERVER' or 'CREATE ONLINE ARTIST'.");
    };

    useEffect(() => {
        if (user && mode === 'online') {
            const checkOnlineProfile = async () => {
                setIsLoading(true);
                try {
                    const { getOrCreateUser, getArtistData, getArtistByOwnerId } = await import('../firebase');
                    const userData = await getOrCreateUser(user);
                    
                    let artist = null;
                    if (userData?.activeArtistId) {
                        // getArtistData was pulling from old db, maybe try getArtistByOwnerId directly first!
                    }
                    artist = await getArtistByOwnerId(user.uid);
                    
                    if (artist) {
                        setOnlineProfile(artist);
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



                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold px-4 py-2 rounded-lg mb-4 text-center">
                        {error}
                    </div>
                )}

                {showPasswordPopup && (
                    <ConfirmationModal
                        title={`Secure Artist: ${legacyArtistName}`}
                        description="This artist is password protected. Please enter the invite code to resume."
                        confirmText="Resume Career"
                        cancelText="Cancel"
                        onConfirm={async () => {
                             setIsLoading(true);
                             try {
                                 const { resumeOnlineArtist } = await import('../firebase');
                                 const existingArtist = await resumeOnlineArtist(user!.uid, legacyArtistName, inviteCode, true);
                                 if (existingArtist) {
                                      const { loadOnlineGameState } = await import('../firebase');
                                      const savedState = await loadOnlineGameState(user!.uid);
                                      if (savedState) {
                                          dispatch({ type: 'LOAD_GAME', payload: savedState });
                                      } else {
                                          dispatch({ type: 'START_ONLINE_GAME', payload: { onlineArtist: existingArtist } });
                                      }
                                 }
                                 setShowPasswordPopup(false);
                             } catch(err: any) {
                                  setError("Incorrect password.");
                                  setShowPasswordPopup(false);
                             }
                             setIsLoading(false);
                        }}
                        onCancel={() => setShowPasswordPopup(false)}
                    >
                        <input
                            type="password"
                            placeholder="Invite Code / Password"
                            value={inviteCode}
                            onChange={e => setInviteCode(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 mt-4 focus:ring-2 focus:ring-red-500 text-white"
                        />
                    </ConfirmationModal>
                )}



                {mode === 'online' && (
                    <form onSubmit={handleOnlineSubmit} className="space-y-4">
                        {!user ? (
                            <div className="text-center py-4 space-y-4">
                                <h3 className="text-2xl font-black text-emerald-400 mb-2 mt-4 tracking-widest border-b border-emerald-500/30 pb-2 border-dashed">ONLINE LOGIN</h3>
                                <p className="text-sm text-zinc-400 font-medium">To play the live MMO mode, you must sign in with Google.</p>
                                <button type="button" onClick={login} className="w-full bg-white text-black hover:bg-zinc-200 font-bold py-4 px-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-lg">
                                    Sign In with Google
                                </button>
                                <button type="button" onClick={handleWipeServer} className="mt-4 text-xs font-mono text-zinc-500 hover:text-red-400 opacity-50 hover:opacity-100">
                                    [ DEV: SERVER STATUS ]
                                </button>
                            </div>
                        ) : onlineProfile ? (
                            <div className="text-center">
                                <div className="w-24 h-24 mx-auto bg-zinc-800 rounded-full border-4 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] mb-4 overflow-hidden relative">
                                    {onlineProfile.image ? 
                                        <img src={onlineProfile.image} alt="Profile" className="w-full h-full object-cover" /> :
                                        <div className="w-full h-full flex items-center justify-center text-3xl font-bold bg-zinc-700">{onlineProfile.name[0]}</div>
                                    }
                                    <div className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-zinc-800"></div>
                                </div>
                                <h3 className="text-xl font-bold mb-1">{onlineProfile.name}</h3>
                                <p className="text-emerald-400 text-sm font-semibold mb-6 flex items-center justify-center gap-2">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Linked to Live Servers
                                </p>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl shadow-lg shadow-emerald-900/50 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest disabled:opacity-50"
                                >
                                    {isLoading ? 'LOADING SERVER...' : 'ENTER ONLINE SERVER'}
                                </button>
                                <p className="text-xs text-zinc-500 mt-4 max-w-xs mx-auto">
                                    You are resuming an active live career. Your streams and balance have progressed while you were away.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-emerald-900/20 border border-emerald-500/30 p-3 rounded-lg mb-4">
                                    <h4 className="text-emerald-400 font-bold text-sm mb-1 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                        LIVE SEASONS ACTIVE
                                    </h4>
                                    <p className="text-xs text-zinc-300">
                                        Compete against real players on global charts. Create your artist to enter the server. Features cost game cash, streams update globally.
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-zinc-400 text-sm font-bold mb-2">Stage Name <span className="text-red-500">*</span></label>
                                    <input
                                        autoFocus
                                        type="text"
                                        maxLength={25}
                                        placeholder="Globally Unique Name"
                                        value={onlineArtistName}
                                        onChange={(e) => setOnlineArtistName(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg font-semibold"
                                    />
                                    <p className="text-xs text-zinc-500 mt-1">Must be unique on the server.</p>
                                </div>
                                
                                <div>
                                     <label className="block text-zinc-400 text-sm font-bold mb-2">Set Password (Optional)</label>
                                     <input
                                         type="text"
                                         placeholder="Protect your name"
                                         value={inviteCode}
                                         onChange={(e) => setInviteCode(e.target.value)}
                                         className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg font-semibold"
                                     />
                                     <p className="text-xs text-zinc-500 mt-1">Set a password to let you re-claim this name on another device.</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl shadow-lg shadow-emerald-900/50 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest mt-2 disabled:opacity-50"
                                >
                                    {isLoading ? 'SYNCING...' : 'CREATE ONLINE ARTIST'}
                                </button>
                            </div>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
};

export default StartScreen;
