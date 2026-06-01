import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import type { Song, GameDate } from '../types';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import PlusIcon from './icons/PlusIcon';
import DotsHorizontalIcon from './icons/DotsHorizontalIcon';
import ArrowUpTrayIcon from './icons/ArrowUpTrayIcon';

const formatReleaseDateString = (gameDate: GameDate): string => {
    const date = new Date(gameDate.year, 0, 1);
    date.setDate(date.getDate() + (gameDate.week - 1) * 7);
    return date.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const gameDateToFutureDate = (gameDate: GameDate, currentRealDate: Date, currentGameDate: GameDate): Date => {
    const weeksInFuture = (gameDate.year * 52 + gameDate.week) - (currentGameDate.year * 52 + currentGameDate.week);
    const futureDate = new Date(currentRealDate);
    futureDate.setDate(futureDate.getDate() + weeksInFuture * 7);
    return futureDate;
};

const CountdownUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="text-center w-16">
        <p className="text-3xl font-bold">{String(value).padStart(2, '0')}</p>
        <p className="text-[10px] uppercase tracking-widest text-zinc-400">{label}</p>
    </div>
);

const SpotifyAlbumCountdownView: React.FC = () => {
    const { gameState, dispatch, activeArtist, activeArtistData } = useGame();
    const [timeLeft, setTimeLeft] = useState({ days: 33, hours: 18, minutes: 18, seconds: 46 });

    const { selectedReleaseId, date: gameDate } = gameState;

    const { labelSubmissions, songs } = activeArtistData!;
    const submission = useMemo(() => labelSubmissions.find(sub => sub.release.id === selectedReleaseId), [labelSubmissions, selectedReleaseId]);
    const release = submission?.release;
    const releaseSongs = useMemo(() => {
        if (!release) return [];
        return release.songIds.map(id => songs.find(s => s.id === id)).filter(Boolean) as Song[];
    }, [release, songs]);

    useEffect(() => {
        if (!submission?.projectReleaseDate) return;

        const targetDate = gameDateToFutureDate(submission.projectReleaseDate, new Date(), gameDate);

        const interval = setInterval(() => {
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [submission, gameDate]);

    if (!submission || !release || !activeArtist) {
        dispatch({ type: 'CHANGE_VIEW', payload: 'spotify' });
        return null;
    }

    const tracklistPreview = releaseSongs.slice(0, 5);

    return (
        <div className="h-screen w-full bg-black text-white overflow-y-auto">
            <header className="p-4 sticky top-0 bg-black/80 backdrop-blur-sm z-10">
                <button onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: 'spotify' })} className="p-2 -m-2">
                    <ChevronLeftIcon className="w-7 h-7" />
                </button>
            </header>
            <main className="p-4 space-y-6">
                <img src={release.coverArt} alt={release.title} className="w-full aspect-square rounded-lg shadow-2xl shadow-black/50" />
                
                <div className="flex items-center gap-3 bg-[#121212] p-3 rounded-lg">
                    <img src={release.coverArt} alt={release.title} className="w-12 h-12 rounded-md object-cover" />
                    <div className="flex-grow flex justify-around items-center">
                        <CountdownUnit value={timeLeft.days} label="Days" />
                        <div className="border-l border-zinc-700 h-8"></div>
                        <CountdownUnit value={timeLeft.hours} label="Hours" />
                        <div className="border-l border-zinc-700 h-8"></div>
                        <CountdownUnit value={timeLeft.minutes} label="Minutes" />
                        <div className="border-l border-zinc-700 h-8"></div>
                        <CountdownUnit value={timeLeft.seconds} label="Seconds" />
                    </div>
                </div>

                <div className="px-1">
                    <h1 className="text-2xl font-bold">{release.title}</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="w-5 h-5 bg-black rounded-full border-2 border-zinc-800"></div>
                        <p className="font-semibold">{activeArtist.name}</p>
                    </div>
                    <p className="text-zinc-400 text-sm mt-1">{release.type.replace(" (Deluxe)", "")} • Releases on {formatReleaseDateString(submission.projectReleaseDate)}</p>
                </div>

                <div className="flex justify-between items-center px-1">
                    <div className="flex items-center gap-6 text-zinc-400">
                        <button><ArrowUpTrayIcon className="w-6 h-6 hover:text-white" /></button>
                        <button><DotsHorizontalIcon className="w-6 h-6 hover:text-white" /></button>
                    </div>
                    <button className="flex items-center gap-2 bg-[#1DB954] text-black font-bold px-5 py-2 rounded-full">
                        Pre-save
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="pt-4 border-t border-zinc-800 px-1">
                    <h2 className="font-bold text-lg mb-3">Tracklist preview</h2>
                    <div className="space-y-4">
                        {tracklistPreview.map(song => (
                            <div key={song.id}>
                                <p className="font-bold text-lg">{song.title.replace(/\s*\(feat\..*\)/, '')}</p>
                                <div className="flex items-center gap-2 text-zinc-400">
                                    {song.explicit && <span className="w-4 h-4 bg-zinc-600 text-zinc-300 text-xs font-bold rounded-sm flex items-center justify-center">E</span>}
                                    <p>{activeArtist.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SpotifyAlbumCountdownView;
