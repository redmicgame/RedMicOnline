


import React, { useMemo, useState } from 'react';
import { useGame, formatNumber } from '../context/GameContext';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import SpotifyIcon from './icons/SpotifyIcon';
import GeniusIcon from './icons/GeniusIcon';
import TonightShowIcon from './icons/TonightShowIcon';
import { Song, Video } from '../types';

const AlbumPromoView: React.FC = () => {
    const { gameState, dispatch, activeArtist, activeArtistData } = useGame();
    const { activeSubmissionId, date } = gameState;
    const { labelSubmissions, songs } = activeArtistData!;

    const [selectedSongId, setSelectedSongId] = useState<string | null>(null);

    const submission = useMemo(() => {
        return labelSubmissions.find(s => s.id === activeSubmissionId);
    }, [labelSubmissions, activeSubmissionId]);

    const projectSongs = useMemo(() => {
        if (!submission) return [];
        return submission.release.songIds.map(id => songs.find(s => s.id === id)).filter((s): s is Song => !!s);
    }, [submission, songs]);

    const handleAction = (actionType: 'countdown' | 'genius' | 'fallon') => {
        if (!submission) return;

        switch (actionType) {
            case 'countdown':
                if (submission.promoBudgetSpent! + 100000 <= submission.promoBudget!) {
                    dispatch({ type: 'LAUNCH_COUNTDOWN_PAGE', payload: { submissionId: submission.id, cost: 100000 } });
                }
                break;
            case 'genius':
                if (selectedSongId && submission.promoBudgetSpent! + 150000 <= submission.promoBudget!) {
                    dispatch({ type: 'REQUEST_GENIUS_PROMO', payload: { submissionId: submission.id, songId: selectedSongId, cost: 150000 } });
                    setSelectedSongId(null);
                }
                break;
            case 'fallon':
                 if (selectedSongId && submission.promoBudgetSpent! + 500000 <= submission.promoBudget!) {
                    dispatch({ type: 'REQUEST_FALLON_PROMO', payload: { submissionId: submission.id, songId: selectedSongId, cost: 500000 } });
                    setSelectedSongId(null);
                }
                break;
        }
    };
    
    if (!submission || !activeArtist) {
        return <div className="p-4">Could not load promotion page.</div>;
    }
    
    const budget = submission.promoBudget || 0;
    const spent = submission.promoBudgetSpent || 0;
    const budgetPercentage = (spent / budget) * 100;

    return (
        <div className="h-screen w-full bg-zinc-900 overflow-y-auto">
            <header className="p-4 flex items-center gap-4 sticky top-0 bg-zinc-900/80 backdrop-blur-sm z-10 border-b border-zinc-700/50">
                <button onClick={() => dispatch({type: 'CHANGE_VIEW', payload: 'game'})} className="p-2 rounded-full hover:bg-white/10">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold truncate">Promo: {submission.release.title}</h1>
            </header>
            <main className="p-4 space-y-6">
                <div>
                    <div className="flex justify-between items-baseline mb-1">
                        <h2 className="text-xl font-bold">Promo Budget</h2>
                        <span className="font-semibold text-zinc-300">
                            <span className="text-green-400">${formatNumber(budget - spent)}</span> / ${formatNumber(budget)}
                        </span>
                    </div>
                     <div className="w-full bg-zinc-700 rounded-full h-4 overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-400 h-4 rounded-full transition-all duration-500 ease-out" 
                            style={{ width: `${budgetPercentage}%` }}
                        ></div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold">Actions</h2>
                     {/* Spotify Countdown */}
                    <div className={`p-4 rounded-lg border-2 ${submission.hasCountdownPage ? 'border-green-500 bg-green-900/30' : 'border-zinc-700 bg-zinc-800'}`}>
                        <div className="flex items-center gap-3">
                            <SpotifyIcon className="w-10 h-10 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-lg">Launch Spotify Countdown</h3>
                                <p className="text-sm text-zinc-400">Create a pre-save page with a live countdown. Generates significant initial hype.</p>
                            </div>
                        </div>
                         <button 
                            onClick={() => handleAction('countdown')}
                            disabled={submission.hasCountdownPage || budget - spent < 100000}
                            className="mt-3 w-full h-10 bg-green-500 text-black font-bold rounded-lg text-sm disabled:bg-zinc-600 disabled:text-zinc-400"
                        >
                            {submission.hasCountdownPage ? 'Launched' : 'Launch (-$100K)'}
                        </button>
                    </div>

                     {/* Genius & Fallon Promos */}
                    {['genius', 'fallon'].map(type => {
                        const isGenius = type === 'genius';
                        const cost = isGenius ? 150000 : 500000;
                        const requestedSongId = isGenius ? submission.geniusInterviewRequestedForSongId : submission.fallonPerformanceRequestedForSongId;

                        return (
                            <div key={type} className={`p-4 rounded-lg border-2 ${requestedSongId ? 'border-green-500 bg-green-900/30' : 'border-zinc-700 bg-zinc-800'}`}>
                                <div className="flex items-center gap-3">
                                    {isGenius ? <GeniusIcon className="w-10 h-10 text-yellow-300 flex-shrink-0" /> : <TonightShowIcon className="w-10 h-10 flex-shrink-0" />}
                                    <div>
                                        <h3 className="font-bold text-lg">Request {isGenius ? "Genius 'Verified'" : "Fallon Performance"}</h3>
                                        <p className="text-sm text-zinc-400">{isGenius ? "An official lyric breakdown video." : "A high-profile live TV performance."}</p>
                                    </div>
                                </div>
                                {!requestedSongId ? (
                                    <div className="mt-3 space-y-2">
                                        <select
                                            onChange={(e) => setSelectedSongId(e.target.value)}
                                            defaultValue=""
                                            className="w-full bg-zinc-700 p-2 rounded-md text-sm"
                                        >
                                            <option value="" disabled>Select a song to feature...</option>
                                            {projectSongs.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                        </select>
                                        <button
                                            onClick={() => handleAction(isGenius ? 'genius' : 'fallon')}
                                            disabled={!selectedSongId || budget - spent < cost}
                                            className={`w-full h-10 font-bold rounded-lg text-sm ${isGenius ? 'bg-yellow-300 text-black' : 'bg-blue-500 text-white'} disabled:bg-zinc-600 disabled:text-zinc-400`}
                                        >
                                            Request (-${formatNumber(cost)})
                                        </button>
                                    </div>
                                ) : (
                                    <p className="mt-3 text-center text-green-300 font-semibold p-2 bg-green-900/50 rounded-md">
                                        {isGenius ? 'Genius Interview' : 'Fallon Performance'} for "{songs.find(s => s.id === requestedSongId)?.title}" requested.
                                    </p>
                                )}
                            </div>
                        )
                    })}
                </div>
            </main>
        </div>
    );
};
export default AlbumPromoView;