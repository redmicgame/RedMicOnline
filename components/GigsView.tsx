
import React from 'react';
import { useGame, formatNumber } from '../context/GameContext';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import { GIGS, MANAGERS } from '../constants';
import { ArtistData } from '../types';

interface Gig {
    name: string;
    description: string;
    cashRange: [number, number];
    hype: number;
    isAvailable: (state: ArtistData) => boolean;
    requirements: string;
}

const GigsView: React.FC = () => {
    const { dispatch, activeArtistData } = useGame();

    if (!activeArtistData) return null;
    const { performedGigThisWeek, manager } = activeArtistData;

    const handlePerform = (gig: Gig) => {
        if (performedGigThisWeek || !gig.isAvailable(activeArtistData)) return;

        const cashEarned = Math.floor(Math.random() * (gig.cashRange[1] - gig.cashRange[0] + 1)) + gig.cashRange[0];
        dispatch({ type: 'PERFORM_GIG', payload: { cash: cashEarned, hype: gig.hype } });
    };

    const currentManager = manager ? MANAGERS.find(m => m.id === manager.id) : null;

    return (
        <div className="h-screen w-full bg-zinc-900 overflow-y-auto">
            <header className="p-4 flex items-center gap-4 sticky top-0 bg-zinc-900/80 backdrop-blur-sm z-10 border-b border-zinc-700/50">
                <button onClick={() => dispatch({type: 'CHANGE_VIEW', payload: 'game'})} className="p-2 rounded-full hover:bg-white/10">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold">Perform Live</h1>
            </header>
            <main className="p-4 space-y-4">
                {currentManager && (
                    <div className="bg-blue-900/50 border border-blue-700 text-blue-300 text-center p-3 rounded-lg">
                        Your manager, {currentManager.name}, is automatically booking {currentManager.autoGigsPerWeek} gig{currentManager.autoGigsPerWeek > 1 ? 's' : ''} for you each week. You can still perform one additional gig yourself.
                    </div>
                )}
                {performedGigThisWeek && (
                    <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-300 text-center p-3 rounded-lg">
                        You've already performed your manual gig this week. Come back next week!
                    </div>
                )}
                {GIGS.map(gig => {
                    const available = gig.isAvailable(activeArtistData);
                    const canPerform = available && !performedGigThisWeek;
                    return (
                        <div key={gig.name} className={`bg-zinc-800 p-4 rounded-lg transition-opacity ${!available ? 'opacity-50' : ''}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold">{gig.name}</h2>
                                    <p className="text-sm text-zinc-400 mt-1">{gig.description}</p>
                                    {!available && (
                                        <p className="text-xs text-red-400 mt-2 font-semibold">Requires: {gig.requirements}</p>
                                    )}
                                </div>
                                <div className="text-right flex-shrink-0 ml-4">
                                    <p className="font-bold text-green-400">${formatNumber(gig.cashRange[0])} - ${formatNumber(gig.cashRange[1])}</p>
                                    <p className="text-sm text-red-400">+{gig.hype} Hype</p>
                                </div>
                            </div>
                             <button 
                                onClick={() => handlePerform(gig)}
                                disabled={!canPerform}
                                className="mt-4 w-full h-10 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-lg shadow-red-600/20 disabled:bg-zinc-600 disabled:shadow-none disabled:cursor-not-allowed"
                             >
                                Perform
                            </button>
                        </div>
                    );
                })}
            </main>
        </div>
    );
};

export default GigsView;
