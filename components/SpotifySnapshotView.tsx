
import React from 'react';
import { useGame } from '../context/GameContext';
import type { Release, Song } from '../types';

const SpotifySnapshotView: React.FC<{ release: Release; onBack: () => void; }> = ({ release, onBack }) => {
    const { gameState, activeArtist, activeArtistData } = useGame();
    const { date } = gameState;

    if (!activeArtist || !activeArtistData) return null;
    const { songs } = activeArtistData;

    const releaseSongs = release.songIds.map(id => songs.find(s => s.id === id)).filter(Boolean) as Song[];
    
    const totalStreams = releaseSongs.reduce((acc, song) => acc + (song.streams || 0), 0);
    const totalWeeklyStreams = releaseSongs.reduce((acc, song) => acc + (song.lastWeekStreams || 0), 0);
    const totalPrevWeeklyStreams = releaseSongs.reduce((acc, song) => acc + (song.prevWeekStreams || 0), 0);

    let totalChangeDisplay = '-';
    if (totalPrevWeeklyStreams > 0) {
        const change = ((totalWeeklyStreams - totalPrevWeeklyStreams) / totalPrevWeeklyStreams) * 100;
        totalChangeDisplay = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
    } else if (totalWeeklyStreams > 0) {
        totalChangeDisplay = '+NEW';
    }
    
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 p-4 flex items-center justify-center overflow-y-auto" onClick={onBack}>
            <div className="w-full max-w-2xl bg-white shadow-2xl rounded-lg overflow-hidden" onClick={e => e.stopPropagation()} style={{ transform: `scale(${releaseSongs.length > 8 ? 8 / releaseSongs.length : 1})` }}>
                {/* Red header */}
                <div className="bg-[#c83b37] p-6 text-white flex gap-6 items-center">
                    <img src={release.coverArt} className="w-36 h-36 rounded-lg shadow-lg flex-shrink-0" alt={release.title} />
                    <div className="flex flex-col justify-end">
                        <p className="font-semibold text-sm uppercase">{release.type.replace(" (Deluxe)", "")}</p>
                        <h1 className="text-4xl font-black leading-tight tracking-tighter">{release.title}</h1>
                        <div className="flex items-center gap-2 mt-2">
                           <img src={activeArtist.image} className="w-6 h-6 rounded-full object-cover" alt={activeArtist.name}/>
                           <p className="text-sm font-semibold">{activeArtist.name} • Week {date.week}, {date.year}</p>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="text-black">
                    <table className="w-full text-sm">
                        <thead className="border-b-2 border-red-200">
                            <tr>
                                <th className="text-left p-2 font-semibold text-gray-500">Song</th>
                                <th className="text-right p-2 font-semibold text-gray-500">Total Streams</th>
                                <th className="text-right p-2 font-semibold text-gray-500">Weekly Streams</th>
                                <th className="text-right p-2 font-semibold text-gray-500">Change</th>
                            </tr>
                        </thead>
                        <tbody>
                            {releaseSongs.map((song, index) => {
                                let changeDisplay = '-';
                                if (song.prevWeekStreams > 0) {
                                    const change = ((song.lastWeekStreams - song.prevWeekStreams) / song.prevWeekStreams) * 100;
                                    changeDisplay = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
                                } else if (song.lastWeekStreams > 0) {
                                    changeDisplay = '+NEW';
                                }

                                const netWeekly = song.lastWeekStreams || 0;
                                const isNegative = netWeekly < 0;

                                return (
                                    <tr key={song.id} className={index % 2 === 0 ? 'bg-white' : 'bg-red-50'}>
                                        <td className="p-2 font-bold text-black">{song.title}</td>
                                        <td className="text-right p-2 text-gray-700">{(song.streams || 0).toLocaleString()}</td>
                                        <td className={`text-right p-2 font-bold ${isNegative ? 'text-red-600' : 'text-gray-800'}`}>
                                            {isNegative ? '' : '+'}{netWeekly.toLocaleString()}
                                        </td>
                                        <td className={`text-right p-2 font-semibold ${changeDisplay.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>
                                            {changeDisplay}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-red-200 font-bold bg-gray-100">
                                <td className="p-2"></td>
                                <td className="text-right p-2 text-black">{totalStreams.toLocaleString()}</td>
                                <td className={`text-right p-2 ${totalWeeklyStreams < 0 ? 'text-red-600' : 'text-black'}`}>
                                    {totalWeeklyStreams >= 0 ? '+' : ''}{totalWeeklyStreams.toLocaleString()}
                                </td>
                                <td className={`text-right p-2 ${totalChangeDisplay.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>
                                    {totalChangeDisplay}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-3 text-center text-sm font-semibold text-gray-600 bg-white border-t border-gray-200">
                    @Red Mic
                </div>
            </div>
        </div>
    );
};

export default SpotifySnapshotView;
