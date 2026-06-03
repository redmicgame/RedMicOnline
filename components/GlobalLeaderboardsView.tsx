import React from 'react';
import { useGame, formatNumber } from '../context/GameContext';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

const GlobalLeaderboardsView: React.FC = () => {
    const { gameState, dispatch } = useGame();
    
    // Aggregate top artists
    const allArtists = [];
    
    // Add local player artists
    const localArtists = [];
    if (gameState.soloArtist) localArtists.push(gameState.soloArtist);
    if (gameState.group) localArtists.push(gameState.group, ...gameState.group.members);
    
    for (const la of localArtists) {
        const data = gameState.artistsData[la.id];
        if (data) {
            allArtists.push({
                id: la.id,
                name: la.name,
                popularity: data.popularity || 0,
                monthlyListeners: data.monthlyListeners || 0,
                money: data.money || 0,
                totalAwards: (data.grammyHistory?.filter(a => a.isWinner).length || 0) + (data.amaHistory?.filter(a => a.isWinner).length || 0) + (data.vmaHistory?.filter(a => a.isWinner).length || 0) + (data.oscarHistory?.filter(a => a.isWinner).length || 0),
                isPlayer: true
            });
        }
    }
    
    // Add online artists
    if (!gameState.offlineMode && gameState.onlineArtists) {
        for (const oa of gameState.onlineArtists) {
            // Avoid duplicating local player
            if (!localArtists.some(la => la.id === oa.id)) {
                allArtists.push({
                    id: oa.id,
                    name: oa.name,
                    popularity: oa.popularity || 0,
                    monthlyListeners: oa.monthlyListeners || 0,
                    money: oa.money || 0,
                    totalAwards: oa.totalAwards || 0,
                    isPlayer: false
                });
            }
        }
    }
    
    // Sorting
    const [sortBy, setSortBy] = React.useState<'popularity' | 'listeners' | 'wealth' | 'awards'>('popularity');
    
    const sortedArtists = [...allArtists].sort((a, b) => {
        if (sortBy === 'popularity') return b.popularity - a.popularity;
        if (sortBy === 'listeners') return b.monthlyListeners - a.monthlyListeners;
        if (sortBy === 'wealth') return b.money - a.money;
        if (sortBy === 'awards') return b.totalAwards - a.totalAwards;
        return 0;
    });

    return (
        <div className="bg-zinc-950 min-h-screen text-white font-sans pb-24">
            <header className="bg-zinc-900 border-b border-zinc-800 p-4 sticky top-0 z-10 flex items-center gap-3">
                <button onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: 'game' })} className="p-2 -ml-2 rounded-full hover:bg-white/10">
                    <ArrowLeftIcon className="w-5 h-5 text-zinc-300" />
                </button>
                <h1 className="text-xl font-bold">Global Leaderboards</h1>
            </header>
            
            <div className="p-4">
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                    <button 
                        onClick={() => setSortBy('popularity')}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${sortBy === 'popularity' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
                    >
                        Most Popular (Hype)
                    </button>
                    <button 
                        onClick={() => setSortBy('listeners')}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${sortBy === 'listeners' ? 'bg-green-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
                    >
                        Most Monthly Listeners
                    </button>
                    <button 
                        onClick={() => setSortBy('awards')}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${sortBy === 'awards' ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
                    >
                        Most Awards Won
                    </button>
                    <button 
                        onClick={() => setSortBy('wealth')}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${sortBy === 'wealth' ? 'bg-yellow-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
                    >
                        Highest Wealth
                    </button>
                </div>
                
                <div className="space-y-3">
                    {sortedArtists.map((artist, index) => (
                        <div key={artist.id} className={`flex items-center gap-4 p-4 rounded-xl ${artist.isPlayer ? 'bg-zinc-800 border border-zinc-600' : 'bg-zinc-900 border border-zinc-800'}`}>
                            <div className="w-8 text-center text-xl font-bold text-zinc-500">#{index + 1}</div>
                            <div className="flex-1">
                                <h3 className={`font-bold text-lg ${artist.isPlayer ? 'text-blue-400' : 'text-white'}`}>{artist.name} {artist.isPlayer && '(You)'}</h3>
                                <p className="text-sm text-zinc-400">
                                    {sortBy === 'popularity' && `Popularity: ${formatNumber(artist.popularity)}`}
                                    {sortBy === 'listeners' && `Monthly Listeners: ${formatNumber(artist.monthlyListeners)}`}
                                    {sortBy === 'wealth' && `Net Worth: $${formatNumber(artist.money)}`}
                                    {sortBy === 'awards' && `Awards Won: ${formatNumber(artist.totalAwards)}`}
                                </p>
                            </div>
                        </div>
                    ))}
                    
                    {sortedArtists.length === 0 && (
                        <div className="text-center p-8 text-zinc-500">
                            No leaderboard data available yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GlobalLeaderboardsView;
