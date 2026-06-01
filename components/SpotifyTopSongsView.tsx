
import React from 'react';
import { useGame, formatNumber } from '../context/GameContext';
import { ChartEntry } from '../types';
import SpotifyIcon from './icons/SpotifyIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import DownloadIcon from './icons/DownloadIcon';
import ArrowUpIcon from './icons/ArrowUpIcon';
import ArrowDownIcon from './icons/ArrowDownIcon';
import ArrowRightIcon from './icons/ArrowRightIcon';

const ChartRow: React.FC<{ entry: ChartEntry }> = ({ entry }) => {
    const { rank, lastWeek, title, artist, coverArt, peak, weeksOnChart, weeklyStreams } = entry;

    const renderMovement = () => {
        if (!lastWeek || lastWeek === rank) {
            return <div className="text-gray-400">-</div>;
        }
        if (rank < lastWeek) {
            return (
                <div className="flex items-center text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                    <ArrowUpIcon className="w-3 h-3 text-green-600" />
                    <span className="text-[10px] font-semibold">{lastWeek - rank}</span>
                </div>
            );
        }
        return (
            <div className="flex items-center text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">
                <ArrowDownIcon className="w-3 h-3 text-red-500" />
                <span className="text-[10px] font-semibold">{rank - lastWeek}</span>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-[auto_auto_1fr_auto] sm:grid-cols-[auto_auto_1fr_repeat(4,_minmax(0,_1fr))] items-center gap-2 sm:gap-4 py-3 text-sm">
            <div className="font-bold text-gray-900 w-6 text-center">{rank} {(!lastWeek && weeksOnChart === 1) && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold ml-1">New</span>}</div>
            <div className="w-12 flex items-center justify-center">{renderMovement()}</div>
            <div className="flex items-center gap-3 min-w-0">
                <img src={coverArt} alt={title} className="w-12 h-12 rounded-sm object-cover flex-shrink-0" />
                <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">{title}</p>
                    <p className="text-xs text-gray-500 truncate">{artist}</p>
                </div>
            </div>
            <div className="hidden sm:block text-center text-gray-500">{peak}</div>
            <div className="hidden sm:block text-center text-gray-500">{lastWeek || '—'}</div>
            <div className="hidden sm:block text-center text-gray-500">{weeksOnChart}</div>
            <div className="text-right text-gray-600 font-medium">{formatNumber(weeklyStreams)}</div>
        </div>
    );
};

const SpotifyTopSongsView: React.FC = () => {
    const { gameState, dispatch } = useGame();
    const { spotifyGlobal = [], date } = gameState;
    const [region, setRegion] = React.useState<'Global' | 'USA'>('Global');

    const getWeekDate = (d: { week: number; year: number; }) => {
        const dateObj = new Date(d.year, 0, (d.week - 1) * 7 + 1);
        return `Week of ${dateObj.toLocaleString('en-US', { month: 'short' })} ${dateObj.getDate()}`;
    };

    const highestNewEntry = spotifyGlobal.find(s => s.lastWeek === null && s.weeksOnChart === 1);

    const usaMultiplier = 0.62; // roughly 38% less than global
    
    // Derived USA chart
    const currentChart = React.useMemo(() => {
        if (region === 'Global') return spotifyGlobal;
        return spotifyGlobal.map(entry => ({
            ...entry,
            weeklyStreams: Math.floor(entry.weeklyStreams * usaMultiplier)
        }));
    }, [spotifyGlobal, region]);

    return (
        <div className="bg-[#121212] min-h-screen text-white">
            <header className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <SpotifyIcon className="w-7 h-7" />
                    <h1 className="text-2xl font-bold">Charts</h1>
                </div>
                <select 
                    value={region}
                    onChange={(e) => setRegion(e.target.value as 'Global' | 'USA')}
                    className="bg-transparent border border-zinc-600 rounded-full px-3 py-1 text-sm font-semibold appearance-none outline-none cursor-pointer"
                >
                    <option value="Global">Global</option>
                    <option value="USA">USA</option>
                </select>
            </header>

            <button onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: 'spotifyChart' })} className="px-4 text-sm font-semibold text-zinc-400 flex items-center gap-1">
                <ChevronLeftIcon className="w-5 h-5" /> All Global Charts
            </button>

            {highestNewEntry && (
                <div className="p-4 mt-2">
                    <div className="bg-rose-800 rounded-lg p-4 flex justify-between items-center">
                        <div className="w-2/3">
                            <p className="text-lg font-bold">“{highestNewEntry.title}” by {highestNewEntry.artist} is the highest new entry on Top Songs {region} at #{highestNewEntry.rank}.</p>
                            <p className="text-xs opacity-80 mt-1">Top Songs {region} · Week of {date.week}</p>
                        </div>
                        <img src={highestNewEntry.coverArt} alt={highestNewEntry.title} className="w-24 h-24 rounded-lg object-cover" />
                    </div>
                </div>
            )}
            
            <main className="p-4 bg-white text-black mt-2 rounded-t-3xl min-h-screen">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold tracking-tight">Weekly Top Songs {region}</h2>
                    <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center">
                        <DownloadIcon className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">Your weekly update of the most played tracks right now.</p>
                
                <div className="flex gap-2 mt-6">
                    <button className="border border-gray-300 px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">Weekly <ChevronDownIcon className="w-4 h-4"/></button>
                    <button className="border border-gray-300 px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">{getWeekDate(date)} <ChevronDownIcon className="w-4 h-4"/></button>
                </div>

                <div className="mt-8 border-b border-gray-200 pb-2 text-xs text-gray-500 font-semibold grid grid-cols-[auto_auto_1fr_auto] sm:grid-cols-[auto_auto_1fr_repeat(4,_minmax(0,_1fr))] gap-2 sm:gap-4 uppercase">
                    <div className="w-6 text-center">#</div>
                    <div className="w-8"></div>
                    <div>Track</div>
                    <div className="hidden sm:flex text-center items-center gap-1 justify-center"><span className="border border-gray-300 rounded-full w-3 h-3 inline-block text-[8px] leading-[10px]">?</span> Peak</div>
                    <div className="hidden sm:flex text-center items-center gap-1 justify-center">Prev</div>
                    <div className="hidden sm:flex text-center items-center gap-1 justify-center"><span className="border border-gray-300 rounded-full w-3 h-3 inline-block text-[8px] leading-[10px]">?</span> Streak</div>
                    <div className="text-right flex items-center gap-1 justify-end"><span className="border border-gray-300 rounded-full w-3 h-3 inline-block text-[8px] leading-[10px]">?</span> Streams</div>
                </div>

                <div className="divide-y divide-gray-100">
                    {currentChart.map(entry => <ChartRow key={entry.uniqueId} entry={entry} />)}
                </div>
            </main>
        </div>
    );
};

export default SpotifyTopSongsView;