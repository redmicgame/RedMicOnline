import React from 'react';
import { useGame, formatNumber } from '../context/GameContext';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import DotsHorizontalIcon from './icons/DotsHorizontalIcon';
import ShuffleIcon from './icons/ShuffleIcon';
import TrianglePlayIcon from './icons/TrianglePlayIcon';
import VerifiedBadgeIcon from './icons/VerifiedBadgeIcon';

const SpotifyOtherProfileView: React.FC<{ artistId: string }> = ({ artistId }) => {
    const { gameState, dispatch } = useGame();

    // Determine the artist data
    let artistInfo: any = null;
    let songs: any[] = [];
    let albums: any[] = [];

    // Is it an online player?
    if (gameState.onlineArtists && gameState.careerMode === 'online') {
        const found = gameState.onlineArtists.find(a => a.id === artistId);
        if (found) {
            artistInfo = found;
            songs = (gameState.onlineSongs || []).filter(s => s.artistId === artistId);
            albums = (gameState.onlineAlbums || []).filter(a => a.artistId === artistId);
        }
    }

    // Is it an NPC?
    if (!artistInfo) {
        const npc = gameState.npcs.find(n => n.id === artistId || n.uniqueId === artistId);
        if (npc) {
            artistInfo = {
                name: npc.artist,
                image: npc.coverArt,
                popularity: npc.basePopularity,
                // roughly translate popularity to listeners for NPCs
                listeners: Math.floor(npc.basePopularity * 0.4),
                isVerified: true
            };
        } else {
             // Not found fallback, maybe it was a click on an empty name or something
             artistInfo = {
                 name: "Unknown Artist",
                 image: "https://ui-avatars.com/api/?background=random",
                 listeners: 0
             }
        }
    }

    const listeners = artistInfo.listeners || (artistInfo.funds ? artistInfo.funds / 10 : 0);

    return (
        <div className="bg-[#121212] text-white min-h-screen pb-20">
            {/* Header */}
            <div className="relative h-[40vh] min-h-[340px] w-full">
                <img src={artistInfo.image || artistInfo.avatar || `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(artistInfo.name)}&size=500`} alt={artistInfo.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-[#121212]"></div>
                
                <button 
                    onClick={() => dispatch({ type: 'VIEW_SPOTIFY_PROFILE', payload: gameState.activeArtistId! })} 
                    className="absolute top-12 left-4 bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors z-10"
                >
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                
                <div className="absolute bottom-8 left-4 right-4 z-10">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
                        {artistInfo.name}
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                        <VerifiedBadgeIcon className="w-6 h-6 text-[#A0D9B1]" />
                        <span className="font-semibold text-white drop-shadow-md">Verified by Spotify</span>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-8">
                <div>
                    <p className="text-zinc-400 text-sm">
                        {formatNumber(Math.floor(listeners))} monthly listeners
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button className="px-4 py-1 border border-zinc-400 rounded-full text-sm font-semibold hover:border-white">
                                Follow
                            </button>
                            <button>
                                <DotsHorizontalIcon className="w-6 h-6 text-zinc-400" />
                            </button>
                        </div>
                        <div className="flex items-center gap-4">
                             <button>
                                <ShuffleIcon className="w-6 h-6 text-zinc-400" />
                            </button>
                            <button className="bg-green-500 rounded-full w-14 h-14 flex items-center justify-center shadow-lg shadow-green-500/30">
                               <TrianglePlayIcon className="w-7 h-7 text-black" />
                            </button>
                        </div>
                    </div>
                </div>

                {songs.length > 0 && (
                     <div className="space-y-4">
                         <h2 className="text-2xl font-bold">Popular</h2>
                         <div className="space-y-2">
                             {songs.slice(0, 5).map((song, idx) => (
                                 <div key={song.id || idx} className="flex items-center gap-4 group p-2 -mx-2 rounded-md hover:bg-white/10">
                                    <div className="text-zinc-400 font-semibold w-5 text-right">{idx + 1}</div>
                                    {/* Cover art fallback */}
                                     <div className="w-10 h-10 bg-zinc-800 rounded-sm"></div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-white">{song.title}</p>
                                        <p className="text-sm text-zinc-400">{formatNumber(song.weeklyStreams || 0)}</p>
                                    </div>
                                </div>
                             ))}
                         </div>
                     </div>
                )}

                {albums.length > 0 && (
                     <div className="space-y-4">
                         <h2 className="text-2xl font-bold">Releases</h2>
                         <div className="space-y-4">
                             {albums.map((album) => (
                                 <div key={album.id} className="flex w-full text-left items-center gap-4 group">
                                     {/* Cover art fallback */}
                                     <div className="w-16 h-16 bg-zinc-800 rounded"></div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-white text-lg">{album.title}</p>
                                        <p className="text-sm text-zinc-400">
                                            {album.type || 'Release'}
                                        </p>
                                    </div>
                                </div>
                             ))}
                         </div>
                     </div>
                )}
            </div>
        </div>
    );
};

export default SpotifyOtherProfileView;
