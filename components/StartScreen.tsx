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
        alert("The servers have already been fully formatted and wiped as part of the V5 update! All previous version data has been isolated, and you are starting in a 100% fresh, clean database.\n\nPlease proceed by clicking 'ENTER ONLINE SERVER' or 'CREATE ONLINE ARTIST'.");
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

                <div className="bg-red-900/40 border border-red-500/50 rounded-xl p-6 text-center shadow-lg mt-8">
                    <span className="text-4xl block mb-4">🚧</span>
                    <h3 className="text-xl font-bold text-white mb-2">Servers Locked</h3>
                    <p className="text-zinc-300 text-sm leading-relaxed font-medium">
                        Servers have been extremely overloaded.. Red Mic Online will return June 9th, saved data will still be there and servers will just be paused! Thank you for the support
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StartScreen;
