
import React, { useState, useMemo, useRef } from 'react';
import { useGame, formatNumber } from '../context/GameContext';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import DotsHorizontalIcon from './icons/DotsHorizontalIcon';
import ShuffleIcon from './icons/ShuffleIcon';
import TrianglePlayIcon from './icons/TrianglePlayIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import MusicNoteIcon from './icons/MusicNoteIcon';
import SpotifyIcon from './icons/SpotifyIcon';
import UserIcon from './icons/UserIcon';
import VerifiedBadgeIcon from './icons/VerifiedBadgeIcon';
import type { Song, Release, GameDate } from '../types';
import { NPC_ARTIST_IMAGES } from '../constants';
import SpotifyDiscographyView from './SpotifyDiscographyView';
import SpotifyReleaseDetailView from './SpotifyReleaseDetailView';
import SpotifyPlaylistDetailView from './SpotifyPlaylistDetailView';
import { SpotifyPlaylistCover } from './SpotifyPlaylistCover';

const PopularSongItem: React.FC<{ song: Song; index: number }> = ({ song, index }) => {
    return (
        <div className="flex items-center gap-4 group cursor-pointer p-2 -mx-2 rounded-md hover:bg-white/10">
            <div className="text-zinc-400 font-semibold w-5 text-right">{index + 1}</div>
            <img src={song.coverArt} alt={song.title} className="w-10 h-10 rounded-sm object-cover" />
            <div className="flex-grow">
                <p className="font-semibold text-white">{song.title}</p>
                <div className="flex items-center gap-2">
                    {song.explicit && <span className="text-xs w-4 h-4 bg-zinc-600/80 text-zinc-300 font-bold rounded-sm flex items-center justify-center">E</span>}
                    <p className="text-sm text-zinc-400">{song.streams.toLocaleString()}</p>
                </div>
            </div>
            <DotsHorizontalIcon className="w-5 h-5 text-zinc-300 invisible group-hover:visible" />
        </div>
    );
};

const PopularReleaseItem: React.FC<{ release: Release; isLatest: boolean; onClick: () => void; }> = ({ release, isLatest, onClick }) => {
    return (
        <button onClick={onClick} className="flex w-full text-left items-center gap-4 group cursor-pointer">
            <img src={release.coverArt} alt={release.title} className="w-16 h-16 rounded object-cover" />
            <div className="flex-grow">
                <p className="font-semibold text-white text-lg">{release.title}</p>
                <p className="text-sm text-zinc-400">
                    {isLatest ? 'Latest release' : release.releaseDate.year} • {release.type.replace(" (Deluxe)", "")}
                </p>
            </div>
        </button>
    );
};

const UpcomingReleaseItem: React.FC<{ release: Release; releaseDate: GameDate; onClick: () => void; }> = ({ release, releaseDate, onClick }) => {
    return (
        <button onClick={onClick} className="flex w-full text-left items-center gap-4 group cursor-pointer">
            <img src={release.coverArt} alt={release.title} className="w-16 h-16 rounded object-cover" />
            <div className="flex-grow">
                <p className="font-semibold text-white text-lg">{release.title}</p>
                <p className="text-sm text-zinc-400">
                    Coming Soon • Releasing W{releaseDate.week}, {releaseDate.year}
                </p>
            </div>
        </button>
    );
};

const formatPlaylistsList = (playlists: string[]) => {
    if (playlists.length === 0) return '';
    if (playlists.length === 1) return playlists[0];
    if (playlists.length === 2) return `${playlists[0]} and ${playlists[1]}`;
    return playlists.slice(0, -1).join(', ') + ', and ' + playlists[playlists.length - 1];
};

const VerifiedModal: React.FC<{ isOpen: boolean; onClose: () => void; sinceYear: number; releasesCount: number; playlists: string[] }> = ({ isOpen, onClose, sinceYear, releasesCount, playlists }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 sm:items-center p-0 sm:p-4">
            <div className="bg-zinc-900 w-full max-w-md sm:rounded-2xl rounded-t-2xl p-6 pb-12 sm:pb-6 relative animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:fade-in duration-300" onClick={e => e.stopPropagation()}>
                <div className="w-10 h-1 bg-zinc-600 rounded-full mx-auto mb-6 sm:hidden"></div>
                
                <h2 className="text-base font-bold text-white text-center mb-6">Artist badges</h2>

                <div className="bg-zinc-800/50 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <VerifiedBadgeIcon className="w-5 h-5 text-[#A0D9B1]" />
                        <span className="font-bold text-white">Verified by Spotify</span>
                    </div>
                    <p className="text-sm text-zinc-300">
                        This artist has grown an active fanbase to be eligible for review and has met Spotify's criteria for profile authenticity. <a href="#" className="text-zinc-400 hover:text-white underline">Learn more</a>
                    </p>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-base font-bold text-white">Artist details</h3>
                    <span className="text-[10px] font-bold text-black bg-[#1ed760] px-1.5 py-0.5 rounded-sm">Beta</span>
                </div>

                <div className="space-y-6 mt-6">
                    <div className="flex gap-4">
                        <MusicNoteIcon className="w-6 h-6 text-zinc-400 shrink-0" />
                        <p className="text-sm text-zinc-300">Has released music since {sinceYear}, with {releasesCount} {releasesCount === 1 ? 'album, EP, single, or remix' : 'albums, EPs, singles, or remixes'} on Spotify globally.</p>
                    </div>
                    
                    {playlists.length > 0 && (
                        <div className="flex gap-4">
                            <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                                <SpotifyIcon className="w-5 h-5 text-zinc-400 grayscale opacity-80" />
                            </div>
                            <p className="text-sm text-zinc-300">Playlisted by Spotify's editors on {formatPlaylistsList(playlists)} in the past year.</p>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <UserIcon className="w-6 h-6 text-zinc-400 shrink-0" />
                        <p className="text-sm text-zinc-300">This artist has a claimed profile in Spotify for Artists.</p>
                    </div>
                </div>
            </div>
            <div className="absolute inset-0 z-[-1]" onClick={onClose}></div>
        </div>
    );
};


const SpotifyView: React.FC = () => {
    const { gameState, dispatch, activeArtist, activeArtistData, allPlayerArtists } = useGame();
    const [view, setView] = useState<'profile' | 'discography' | 'releaseDetail' | 'playlistDetail'>('profile');
    const [selectedReleaseId, setSelectedReleaseId] = useState<string | null>(null);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
    const [history, setHistory] = useState<Array<'profile' | 'discography' | 'playlistDetail'>>(['profile']);
    const [isPopularExpanded, setIsPopularExpanded] = useState(false);
    const [showVerifiedModal, setShowVerifiedModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!activeArtist || !activeArtistData) return null;
    const { monthlyListeners, songs, releases, artistPick, labelSubmissions } = activeArtistData;
    const { date } = gameState;

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && activeArtist) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const newImage = reader.result as string;
                dispatch({ type: 'UPDATE_ARTIST_IMAGE', payload: { artistId: activeArtist.id, newImage } });
            };
            reader.readAsDataURL(file);
        }
        if (e.target) e.target.value = '';
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const allSongs = useMemo(() => {
        const playerFeatureSongs: Song[] = [];
        const activeArtistName = activeArtist?.name;
        
        if (activeArtistName) {
            Object.entries(gameState.artistsData).forEach(([artistId, data]) => {
                if (artistId === activeArtist?.id) return;
                data.songs.forEach(song => {
                    if (song.isReleased && !song.isTakenDown && song.collaboration?.artistName === activeArtistName) {
                        playerFeatureSongs.push(song);
                    }
                });
            });
        }
        return [...songs, ...playerFeatureSongs];
    }, [songs, activeArtist, gameState.artistsData]);

    const topSongs = allSongs
        .filter(s => s.isReleased && !s.isTakenDown)
        .sort((a, b) => (b.lastWeekStreams || 0) - (a.lastWeekStreams || 0))
        .slice(0, 10);
        
    const popularSongsToShow = isPopularExpanded ? topSongs : topSongs.slice(0, 5);

    const popularReleases = (() => {
        const isFeature = (r: Release) => r.isFeatureToNpc || r.songIds.some(id => songs.find(s => s.id === id)?.isFeatureToNpc);
        const availableReleases = releases.filter(r => !r.isTakenDown && !r.soundtrackInfo && !isFeature(r));

        if (availableReleases.length === 0) {
            return [];
        }

        const releasesWithStreams = availableReleases.map(release => {
            const totalStreams = release.songIds.reduce((sum, songId) => {
                const song = songs.find(s => s.id === songId);
                return sum + (song?.streams || 0);
            }, 0);
            return { ...release, totalStreams };
        });

        const latestRelease = releasesWithStreams.reduce((latest, current) => {
            const latestDate = latest.releaseDate.year * 52 + latest.releaseDate.week;
            const currentDate = current.releaseDate.year * 52 + current.releaseDate.week;
            return currentDate > latestDate ? current : latest;
        });

        const otherReleases = releasesWithStreams
            .filter(r => r.id !== latestRelease.id)
            .sort((a, b) => b.totalStreams - a.totalStreams);
        
        const sortedPopularReleases = [latestRelease, ...otherReleases].slice(0, 4);

        return sortedPopularReleases.map(r => ({ ...r, isLatest: r.id === latestRelease.id }));
    })();

    const artistPickItem = useMemo(() => {
        if (!artistPick) return null;
        if (artistPick.itemType === 'song') {
            return songs.find(s => s.id === artistPick.itemId);
        }
        if (artistPick.itemType === 'release') {
            return releases.find(r => r.id === artistPick.itemId);
        }
        return null;
    }, [artistPick, songs, releases]);

    const upcomingReleases = useMemo(() => {
        if (!labelSubmissions) return [];
        
        const toTotalWeeks = (d: GameDate) => d.year * 52 + d.week;
        const nowTotalWeeks = toTotalWeeks(date);
    
        return labelSubmissions
            .filter(sub => 
                sub.status === 'scheduled' && 
                sub.hasCountdownPage &&
                sub.projectReleaseDate &&
                toTotalWeeks(sub.projectReleaseDate) > nowTotalWeeks
            )
            .map(sub => ({
                release: sub.release,
                releaseDate: sub.projectReleaseDate!
            }))
            .sort((a, b) => toTotalWeeks(a.releaseDate) - toTotalWeeks(b.releaseDate));
    }, [labelSubmissions, date]);

    const appearsOnPlaylists = useMemo(() => {
        const playlists = gameState.spotifyPlaylists || [];
        return playlists.filter(p => 
            p.tracks.some(t => t.artistName === activeArtist.name)
        ).map(p => {
            const track = p.tracks.find(t => t.artistName === activeArtist.name);
            return {
                ...p,
                artistPosition: track?.position
            };
        });
    }, [gameState.spotifyPlaylists, activeArtist.name]);
    
    const isVerified = monthlyListeners >= 1000000 || appearsOnPlaylists.length > 0;
    const sinceYear = useMemo(() => releases.length > 0 ? Math.min(...releases.map(r => r.releaseDate.year)) : date.year, [releases, date.year]);
    const playlistsNames = useMemo(() => appearsOnPlaylists.map(p => p.name), [appearsOnPlaylists]);

    const navigateTo = (newView: 'profile' | 'discography' | 'releaseDetail' | 'playlistDetail') => {
        if (newView !== view) {
            if (view !== 'releaseDetail' && view !== 'playlistDetail') {
                setHistory(prev => [...prev, view]);
            }
        }
        setView(newView);
    };

    const handleBack = () => {
        const previousView = history[history.length - 1] || 'profile';
        setHistory(prev => prev.slice(0, -1));
        setView(previousView);
    };

    const handleShowDiscography = () => {
        navigateTo('discography');
    };

    const handleShowReleaseDetail = (releaseId: string) => {
        setSelectedReleaseId(releaseId);
        navigateTo('releaseDetail');
    };

    const handleShowPlaylistDetail = (playlistId: string) => {
        setSelectedPlaylistId(playlistId);
        navigateTo('playlistDetail');
    };

    const handleShowCompilationDetail = (compilationId: string) => {
        dispatch({ type: 'SELECT_SOUNDTRACK', payload: compilationId });
    }

    if (view === 'discography') {
        return <SpotifyDiscographyView onBack={handleBack} onSelectRelease={handleShowReleaseDetail} onSelectCompilation={handleShowCompilationDetail} />;
    }

    if (view === 'releaseDetail' && selectedReleaseId) {
        return <SpotifyReleaseDetailView releaseId={selectedReleaseId} onBack={handleBack} />;
    }

    if (view === 'playlistDetail' && selectedPlaylistId) {
        return <SpotifyPlaylistDetailView playlistId={selectedPlaylistId} onBack={handleBack} />;
    }


    return (
        <div className="bg-[#121212] text-white min-h-screen">
            {/* Header with Background Image */}
            <div className="relative h-[40vh] min-h-[340px] w-full group cursor-pointer" onClick={triggerFileInput}>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                <img src={activeArtist.image} alt={activeArtist.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-[#121212] pointer-events-none"></div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="text-white font-bold text-lg bg-black/50 px-4 py-2 rounded-full">Change Photo</span>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); dispatch({ type: 'CHANGE_VIEW', payload: 'game' }); }} 
                    className="absolute top-12 left-4 bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors z-10"
                    aria-label="Go back"
                >
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <div className="absolute bottom-8 left-4 right-4 z-10 pointer-events-none">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
                        {activeArtist.name}
                    </h1>
                    {isVerified && (
                        <div 
                            className="flex items-center gap-2 mt-2 cursor-pointer pointer-events-auto hover:opacity-80 transition-opacity w-max"
                            onClick={(e) => { e.stopPropagation(); setShowVerifiedModal(true); }}
                        >
                            <VerifiedBadgeIcon className="w-6 h-6 text-[#A0D9B1]" />
                            <span className="font-semibold text-white drop-shadow-md">Verified by Spotify</span>
                        </div>
                    )}
                </div>
            </div>

            <VerifiedModal 
                isOpen={showVerifiedModal} 
                onClose={() => setShowVerifiedModal(false)}
                sinceYear={sinceYear}
                releasesCount={releases.length}
                playlists={playlistsNames}
            />

            {/* Main Content */}
            <div className="p-4 space-y-8 pb-20">
                {/* Listeners and Actions */}
                <div>
                    <p className="text-zinc-400 text-sm">
                        {monthlyListeners >= 1000000 
                            ? `${(monthlyListeners / 1000000).toFixed(1).replace(/\.0$/, '')}M` 
                            : monthlyListeners.toLocaleString()} monthly listeners
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button className="px-4 py-1 border border-zinc-400 rounded-full text-sm font-semibold hover:border-white">
                                Following
                            </button>
                            <button>
                                <DotsHorizontalIcon className="w-6 h-6 text-zinc-400" />
                            </button>
                        </div>
                        <div className="flex items-center gap-4">
                             <button>
                                <ShuffleIcon className="w-6 h-6 text-green-500" />
                            </button>
                            <button className="bg-green-500 rounded-full w-14 h-14 flex items-center justify-center shadow-lg shadow-green-500/30">
                               <TrianglePlayIcon className="w-7 h-7 text-black" />
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Placeholder for Music/Clips/Events/Merch tabs */}
                <div className="border-b border-zinc-800">
                    <div className="flex gap-6">
                        <button className="py-2 text-sm font-semibold border-b-2 border-green-500">Music</button>
                        <button className="py-2 text-sm font-semibold text-zinc-400 hover:text-white">Clips</button>
                        <button className="py-2 text-sm font-semibold text-zinc-400 hover:text-white">Events</button>
                        <button className="py-2 text-sm font-semibold text-zinc-400 hover:text-white">Merch</button>
                    </div>
                </div>

                {/* Artist Pick */}
                {artistPickItem && (
                    <div className="space-y-3">
                        <h2 className="text-xl font-bold">Artist Pick</h2>
                        <button onClick={() => handleShowReleaseDetail(artistPick.itemType === 'release' ? artistPick.itemId : (songs.find(s=>s.id === artistPick.itemId)?.releaseId || ''))} className="w-full text-left flex items-center gap-4 p-3 -m-3 rounded-lg hover:bg-white/10">
                            <img src={artistPickItem.coverArt} alt={artistPickItem.title} className="w-20 h-20 rounded object-cover" />
                            <div>
                                <p className="font-semibold text-white">{artistPickItem.title}</p>
                                <p className="text-sm text-zinc-400">
                                    {'songIds' in artistPickItem ? artistPickItem.type : 'Single'} • New Release
                                </p>
                            </div>
                        </button>
                    </div>
                )}

                {/* Popular Songs */}
                {topSongs.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold">Popular</h2>
                        <div className="space-y-2">
                            {popularSongsToShow.map((song, index) => (
                                <PopularSongItem key={song.id} song={song} index={index} />
                            ))}
                        </div>
                        {topSongs.length > 5 && (
                             <div className="pt-2">
                                <button 
                                    onClick={() => setIsPopularExpanded(!isPopularExpanded)} 
                                    className="px-6 py-2 border border-zinc-400 rounded-full text-sm font-semibold hover:border-white hover:scale-105 transition-transform"
                                >
                                    {isPopularExpanded ? 'Show less' : 'See more'}
                                </button>
                            </div>
                        )}
                    </div>
                )}


                {/* Popular Releases */}
                {popularReleases.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Popular releases</h2>
                            <button onClick={handleShowDiscography} className="text-xs font-semibold text-zinc-400 hover:text-white">Show all</button>
                        </div>
                        <div className="space-y-4">
                            {popularReleases.map(release => (
                                <PopularReleaseItem key={release.id} release={release} isLatest={release.isLatest} onClick={() => handleShowReleaseDetail(release.id)}/>
                            ))}
                        </div>
                        <div className="text-center pt-4">
                            <button onClick={handleShowDiscography} className="px-6 py-2 border border-zinc-400 rounded-full text-sm font-semibold hover:border-white hover:scale-105 transition-transform">
                                See discography
                            </button>
                        </div>
                    </div>
                )}

                {/* Upcoming Releases */}
                {upcomingReleases.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Upcoming</h2>
                        </div>
                        <div className="space-y-4">
                            {upcomingReleases.map(({ release, releaseDate }) => (
                                <UpcomingReleaseItem 
                                    key={release.id} 
                                    release={release} 
                                    releaseDate={releaseDate} 
                                    onClick={() => {
                                        dispatch({ type: 'SELECT_RELEASE', payload: release.id });
                                        dispatch({ type: 'CHANGE_VIEW', payload: 'spotifyAlbumCountdown' });
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Appears On */}
                {appearsOnPlaylists.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold">Appears on</h2>
                        <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
                            {appearsOnPlaylists.map(playlist => {
                                let playlistCover = playlist.coverArt;
                                if (playlist.tracks && playlist.tracks.length > 0) {
                                    const topTrack = playlist.tracks[0];
                                    if (topTrack.artistId !== 'unknown') {
                                        const topPlayerArtist = allPlayerArtists.find(a => a.id === topTrack.artistId);
                                        if (topPlayerArtist) playlistCover = topPlayerArtist.image;
                                    } else {
                                        playlistCover = NPC_ARTIST_IMAGES?.[topTrack.artistName] || topTrack.coverArt || playlist.coverArt;
                                    }
                                }
                                return (
                                <div key={playlist.id} onClick={() => handleShowPlaylistDetail(playlist.id)} className="min-w-[140px] max-w-[140px] flex-shrink-0 snap-start bg-zinc-800/40 p-3 rounded-md hover:bg-zinc-800 transition-colors cursor-pointer group">
                                    <div className="relative w-full aspect-square bg-[#282828] rounded-md mb-3 shadow-lg overflow-hidden">
                                        <SpotifyPlaylistCover 
                                            name={playlist.name} 
                                            imageUrl={playlistCover} 
                                            size="small" 
                                        />
                                    </div>
                                    <h3 className="font-bold text-sm truncate">{playlist.name}</h3>
                                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-tight flex flex-col gap-1">
                                        <span>Position: #{playlist.artistPosition}</span>
                                        <span>{formatNumber(playlist.followers)} likes</span>
                                    </p>
                                </div>
                            )})}
                        </div>
                    </div>
                )}
                
            </div>
        </div>
    );
};

export default SpotifyView;
