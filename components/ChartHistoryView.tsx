import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import { Song, Release, ChartHistory } from '../types';

type ChartType = 'billboardHot100' | 'billboardTopAlbums' | 'hotPopSongs' | 'hotRapRnb' | 'electronicChart' | 'countryChart';

const ChartHistoryView: React.FC = () => {
    const { gameState, dispatch, activeArtistData, activeArtist } = useGame();
    const [selectedChart, setSelectedChart] = useState<ChartType>('billboardHot100');

    if (!activeArtistData || !activeArtist) {
        return <div className="p-4">Loading history...</div>;
    }

    const { songs, releases } = activeArtistData;

    const chartData = useMemo(() => {
        let history: ChartHistory;
        let items: (Song | Release)[];
        let title: string;

        switch (selectedChart) {
            case 'billboardTopAlbums':
                history = gameState.albumChartHistory;
                items = releases.filter(r => r.type !== 'Single');
                title = 'Billboard Top 50 Albums';
                break;
            case 'hotPopSongs':
                history = gameState.hotPopSongsHistory;
                items = [...songs];
                break;
            case 'hotRapRnb':
                history = gameState.hotRapRnbHistory;
                items = [...songs];
                break;
            case 'electronicChart':
                history = gameState.electronicChartHistory;
                items = [...songs];
                break;
            case 'countryChart':
                history = gameState.countryChartHistory;
                items = [...songs];
                break;
            case 'billboardHot100':
            default:
                history = gameState.chartHistory;
                items = [...songs];
                title = 'Billboard Hot 100';
                break;
        }

        if (selectedChart !== 'billboardTopAlbums') {
            Object.values(gameState.artistsData).forEach(data => {
                data.songs.forEach(song => {
                    if (song.collaboration?.artistName === activeArtist.name) {
                        items.push({ ...song, title: `${song.title} (with ${song.collaboration.artistName})` });
                    }
                });
            });
            
            // Define titles after switch block to handle all cases properly
            switch (selectedChart) {
                case 'hotPopSongs': title = 'Hot Pop Songs'; break;
                case 'hotRapRnb': title = 'Hot Rap/R&B Songs'; break;
                case 'electronicChart': title = 'Electronic Chart'; break;
                case 'countryChart': title = 'Country Chart'; break;
                case 'billboardHot100':
                default: title = 'Billboard Hot 100'; break;
            }
        }

        const chartedItems = items
            .filter(item => history[item.id])
            .map(item => ({ item, stats: history[item.id] }))
            .sort((a, b) => a.stats.peak - b.stats.peak);
            
        const stats = {
            ones: chartedItems.filter(s => s.stats.peak === 1).length,
            top10s: chartedItems.filter(s => s.stats.peak <= 10).length,
            entries: chartedItems.length,
        };

        return { title, chartedItems, stats };
    }, [selectedChart, gameState, songs, releases]);

    return (
        <div className="bg-zinc-900 text-white min-h-screen">
            <div className="relative h-64">
                <img src={activeArtist.image} alt={activeArtist.name} className="w-full h-full object-cover opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
                <button onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: 'game' })} className="absolute top-4 left-4 p-2 bg-black/30 rounded-full hover:bg-black/50 z-10">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <div className="absolute bottom-0 p-4 w-full">
                    <p className="text-sm font-semibold text-zinc-400">Chart History</p>
                    <h1 className="text-4xl font-bold">{activeArtist.name}</h1>
                    <div className="flex gap-6 mt-2">
                        <div className="text-center">
                            <p className="text-2xl font-bold">{chartData.stats.ones}</p>
                            <p className="text-xs text-zinc-400">NO. 1 HITS</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">{chartData.stats.top10s}</p>
                            <p className="text-xs text-zinc-400">TOP 10 HITS</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">{chartData.stats.entries}</p>
                            <p className="text-xs text-zinc-400">ENTRIES</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4">
                 <select
                    value={selectedChart}
                    onChange={(e) => setSelectedChart(e.target.value as ChartType)}
                    className="w-full bg-zinc-800 border-zinc-700 rounded-md shadow-sm h-12 px-3 font-semibold focus:ring-red-500 focus:border-red-500"
                >
                    <option value="billboardHot100">Billboard Hot 100</option>
                    <option value="billboardTopAlbums">Billboard Top 50 Albums</option>
                    <option value="hotPopSongs">Hot Pop Songs</option>
                    <option value="hotRapRnb">Hot Rap/R&B Songs</option>
                    <option value="electronicChart">Electronic Chart</option>
                    <option value="countryChart">Country Chart</option>
                </select>
            </div>

            <main className="p-4">
                <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center text-xs font-semibold text-zinc-400 uppercase px-2 pb-2 border-b border-zinc-700">
                    <div className="w-8 text-center">#</div>
                    <div>Title</div>
                    <div className="w-20 text-center">Peak Pos.</div>
                    <div className="w-20 text-center">Wks on Chart</div>
                </div>

                <div className="divide-y divide-zinc-800">
                    {chartData.chartedItems.length > 0 ? chartData.chartedItems.map(({ item, stats }, index) => (
                        <div key={item.id} className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center py-3 px-2">
                            <div className="w-8 text-center text-zinc-400 font-semibold">{index + 1}</div>
                            <div className="flex items-center gap-3 min-w-0">
                                <img src={'coverArt' in item ? item.coverArt : ''} alt={item.title} className="w-12 h-12 rounded-md object-cover flex-shrink-0" />
                                <p className="font-bold truncate">{item.title}</p>
                            </div>
                            <div className="w-20 text-center font-bold text-2xl">{stats.peak}</div>
                            <div className="w-20 text-center font-bold text-2xl">{stats.weeksOnChart}</div>
                        </div>
                    )) : (
                        <p className="text-zinc-500 text-sm bg-zinc-800 p-4 rounded-lg text-center mt-4">No chart history for this category yet.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ChartHistoryView;