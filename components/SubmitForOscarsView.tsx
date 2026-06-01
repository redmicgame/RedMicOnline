
import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { Song, OscarAward } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

type CategoryName = OscarAward['category'];

const SubmitForOscarsView: React.FC = () => {
    const { gameState, dispatch, activeArtist, activeArtistData } = useGame();
    const { date } = gameState;
    const [selection, setSelection] = useState<string>('');

    if (!activeArtistData || !activeArtist) return null;

    const eligibleSongs = useMemo(() => {
        const thisYearReleases = activeArtistData.releases.filter(r => r.releaseDate.year === date.year);
        const songIdsFromThisYear = new Set(thisYearReleases.flatMap(r => r.songIds));
        return activeArtistData.songs.filter(s => songIdsFromThisYear.has(s.id) && s.soundtrackTitle);
    }, [activeArtistData.releases, activeArtistData.songs, date.year]);

    const handleSubmit = () => {
        if (!selection) return;

        const song = eligibleSongs.find(s => s.id === selection);
        if (!song) return;

        const submissions = [{
            artistId: activeArtist.id,
            category: 'Best Original Song' as CategoryName,
            itemId: song.id,
            itemName: song.title
        }];
        
        const emailId = activeArtistData.inbox.find(e => e.offer?.type === 'oscarSubmission' && !e.offer.isSubmitted)?.id;
        if (emailId) {
            dispatch({ type: 'SUBMIT_FOR_OSCARS', payload: { submissions, emailId } });
        }
    };

    return (
         <div className="h-screen w-full bg-zinc-900 flex flex-col">
            <header className="p-4 flex items-center gap-4 sticky top-0 bg-zinc-900/80 backdrop-blur-sm z-10 border-b border-zinc-700/50">
                <button onClick={() => dispatch({type: 'CHANGE_VIEW', payload: 'inbox'})} className="p-2 rounded-full hover:bg-white/10">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold">Oscar Submissions</h1>
            </header>
            <main className="flex-grow p-4 space-y-6 overflow-y-auto">
                <div>
                    <label htmlFor="best-original-song" className="block text-lg font-bold text-zinc-300">Best Original Song</label>
                    <p className="text-sm text-zinc-400 mb-2">Only songs written for a film soundtrack are eligible.</p>
                    {eligibleSongs.length === 0 ? (
                        <div className="mt-1 text-sm text-zinc-500 bg-zinc-800 p-3 rounded-md">No eligible soundtrack songs from this year.</div>
                    ) : (
                        <select 
                            id="best-original-song"
                            value={selection}
                            onChange={e => setSelection(e.target.value)}
                            className="mt-1 block w-full bg-zinc-700 border-zinc-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm h-12 px-3"
                        >
                            <option value="">-- Select a song --</option>
                            {eligibleSongs.map(opt => <option key={opt.id} value={opt.id}>{opt.title}</option>)}
                        </select>
                    )}
                </div>
            </main>
            <div className="p-4 border-t border-zinc-700/50">
                <button onClick={handleSubmit} disabled={!selection} className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-lg shadow-red-600/20 disabled:bg-zinc-600">
                    Submit to The Academy
                </button>
            </div>
        </div>
    );
};

export default SubmitForOscarsView;
