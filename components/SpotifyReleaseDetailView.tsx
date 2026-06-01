import React, { useEffect, useState, useMemo } from 'react';
import { useGame, formatNumber } from '../context/GameContext';
import { LABELS } from '../constants';
import type { Release, Song, GameDate } from '../types';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import PlusCircleIcon from './icons/PlusCircleIcon';
import DownloadIcon from './icons/DownloadIcon';
import DotsHorizontalIcon from './icons/DotsHorizontalIcon';
import CameraIcon from './icons/CameraIcon';
import TrianglePlayIcon from './icons/TrianglePlayIcon';
import SpotifySnapshotView from './SpotifySnapshotView';
import SpotifyNowPlayingView from './SpotifyNowPlayingView';
import { SpotifySongDNAView } from './SpotifySongDNAView';

const getDominantColor = (imageUrl: string, onColorReady: (color: string) => void) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
            onColorReady('#121212');
            return;
        }
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);

        let data;
        try {
            data = context.getImageData(0, 0, img.width, img.height).data;
        } catch (e) {
            console.error("Can't get image data for color extraction", e);
            onColorReady('#121212');
            return;
        }

        const sampleRate = 10;
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4 * sampleRate) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
        }

        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        onColorReady(`rgb(${r},${g},${b})`);
    };
    img.onerror = () => {
        onColorReady('#121212'); // Fallback color
    };
};

const formatGameDate = (gameDate: GameDate) => {
    const date = new Date(gameDate.year, 0, (gameDate.week - 1) * 7 + 1);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const formatTotalDuration = (totalSeconds: number) => {
    const minutes = Math.round(totalSeconds / 60);
    return `${minutes}min`;
};


const SpotifyReleaseDetailView: React.FC<{ releaseId: string; onBack: () => void; }> = ({ releaseId, onBack }) => {
    const { activeArtist, activeArtistData, dispatch } = useGame();
    const [bgColor, setBgColor] = useState('#121212');
    const [showSnapshot, setShowSnapshot] = useState(false);
    const [showStatsModalForSong, setShowStatsModalForSong] = useState<Song | null>(null);
    const [showSongDNAFor, setShowSongDNAFor] = useState<Song | null>(null);
    const [nowPlayingSong, setNowPlayingSong] = useState<Song | null>(null);
    
    // About the song edit state
    const [isEditingAboutSong, setIsEditingAboutSong] = useState(false);
    const [editAboutSongText, setEditAboutSongText] = useState('');

    const { releases, songs } = activeArtistData!;

    const release = useMemo(() => releases.find(r => r.id === releaseId), [releases, releaseId]);
    const releaseSongs = useMemo(() => {
        if (!release) return [];
        return release.songIds.map(id => songs.find(s => s.id === id)).filter(Boolean) as Song[];
    }, [release, songs]);

    useEffect(() => {
        if (release) {
            getDominantColor(release.coverArt, setBgColor);
        } else {
            setBgColor('#121212');
        }
    }, [release]);
    
    const totalDuration = useMemo(() => {
        return releaseSongs.reduce((sum, song) => sum + song.duration, 0);
    }, [releaseSongs]);

    if (nowPlayingSong) {
        return <SpotifyNowPlayingView song={nowPlayingSong} onBack={() => setNowPlayingSong(null)} />;
    }

    if (!release || !activeArtist) {
        return (
            <div className="bg-black text-white min-h-screen flex items-center justify-center">
                <p>Release not found.</p>
                <button onClick={onBack} className="absolute top-4 left-4">Back</button>
            </div>
        );
    }
    
    let labelText: string;
    
    if (release.rightsOwnerLabelId && release.rightsSoldPercent && release.rightsSoldPercent > 50) {
        const ownerLabel = LABELS.find(l => l.id === release.rightsOwnerLabelId);
        labelText = ownerLabel ? ownerLabel.name : 'Unknown Label';
    } else if (release.releasingLabel) {
        labelText = release.releasingLabel.name;
        if (release.releasingLabel.dealWithMajor) {
            labelText += `, a division of ${release.releasingLabel.dealWithMajor}`;
        }
    } else {
        const hash = Array.from(release.id).reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const dkNumber = (hash * 1234567 % 9000000) + 1000000;
        labelText = `${Math.abs(dkNumber)} Records DK`;
    }
    const copyrightText = `© ${release.releaseDate.year} ${labelText}`;
    const phonogramText = `℗ ${release.releaseDate.year} ${labelText}`;

    return (
        <>
            {showSongDNAFor && <SpotifySongDNAView song={showSongDNAFor} onBack={() => setShowSongDNAFor(null)} />}
            {showSnapshot && <SpotifySnapshotView release={release} onBack={() => setShowSnapshot(false)} />}
            {showStatsModalForSong && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowStatsModalForSong(null)}>
                    <div className="bg-zinc-800 rounded-lg p-4 w-full max-w-md" onClick={e => e.stopPropagation()}>
                    <h2 className="font-bold text-lg mb-2">Daily Streams: "{showStatsModalForSong.title}"</h2>
                    <div className="max-h-60 overflow-y-auto space-y-1 pr-2">
                        {showStatsModalForSong.dailyStreams?.map((streams, index) => (
                        <div key={index} className="flex justify-between text-sm">
                            <span className="text-zinc-400">Day {index + 1}</span>
                            <span className="font-semibold">{formatNumber(streams)}</span>
                        </div>
                        ))}
                        {(!showStatsModalForSong.dailyStreams || showStatsModalForSong.dailyStreams.length === 0) && (
                        <p className="text-zinc-500">No daily stream data available yet.</p>
                        )}
                    </div>
                    </div>
                </div>
            )}
            <div className="min-h-screen text-white transition-colors duration-500" style={{ background: `linear-gradient(to bottom, ${bgColor} 0%, #121212 40%)` }}>
                <button 
                    onClick={onBack} 
                    className="absolute top-12 left-4 bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors z-10"
                    aria-label="Go back"
                >
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <div className="pt-28 p-4">
                    <div className="flex flex-col items-center space-y-4">
                        <img src={release.coverArt} alt={release.title} className="w-48 h-48 md:w-56 md:h-56 shadow-2xl shadow-black/50" />
                        <div className="text-center">
                            <h1 className="text-2xl font-bold">{release.title}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <img src={activeArtist.image} alt={activeArtist.name} className="w-6 h-6 rounded-full object-cover" />
                                <span className="font-semibold">{activeArtist.name}</span>
                            </div>
                            <p className="text-sm text-zinc-400 mt-1">{release.type.replace(" (Deluxe)", "")} • {release.releaseDate.year}</p>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-zinc-400">
                             <button onClick={() => !release.isTakenDown && releaseSongs.length > 0 && setNowPlayingSong(releaseSongs[0])} disabled={release.isTakenDown}>
                                <img src={release.coverArt} alt={release.title} className="w-6 h-6 rounded-sm" />
                             </button>
                             <PlusCircleIcon className={`w-7 h-7 ${!release.isTakenDown && 'hover:text-white'}`}/>
                             <DownloadIcon className={`w-7 h-7 ${!release.isTakenDown && 'hover:text-white'}`} />
                             <DotsHorizontalIcon className={`w-7 h-7 ${!release.isTakenDown && 'hover:text-white'}`} />
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => !release.isTakenDown && setShowSnapshot(true)} disabled={release.isTakenDown} className="p-1">
                                <CameraIcon className={`w-7 h-7 text-zinc-400 ${!release.isTakenDown && 'hover:text-white'}`} />
                            </button>
                            <button 
                                className={`rounded-full w-14 h-14 flex items-center justify-center shadow-lg ${release.isTakenDown ? 'bg-zinc-700' : 'bg-green-500 shadow-green-500/30'}`}
                                disabled={release.isTakenDown}
                            >
                               <TrianglePlayIcon className={`w-7 h-7 ${release.isTakenDown ? 'text-zinc-500' : 'text-black'}`} />
                            </button>
                        </div>
                    </div>
                    
                    {release.isTakenDown ? (
                        <div className="mt-6 text-center py-8">
                            <p className="text-zinc-400">The tracks on this release are not available.</p>
                        </div>
                    ) : (
                        <div className="mt-6 space-y-4">
                            {releaseSongs.map(song => (
                                <div key={song.id} className="flex items-center">
                                    <div className="flex-grow">
                                        <p className="font-semibold">{song.title}</p>
                                        <div className="flex items-center gap-2">
                                            {song.explicit && <span className="text-xs w-4 h-4 bg-zinc-600/80 text-zinc-300 font-bold rounded-sm flex items-center justify-center">E</span>}
                                            <p className="text-sm text-zinc-400">{activeArtist.name}</p>
                                        </div>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); setShowStatsModalForSong(song); }} className="p-2 -m-2">
                                     <DotsHorizontalIcon className="w-5 h-5 text-zinc-400" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {release.type === 'Single' && releaseSongs.length === 1 && (
                        <>
                        <div className="mt-6 rounded-xl p-4 shadow-2xl pb-4 relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #442a20 0%, #281711 100%)' }}>
                            <div className="flex items-center gap-1.5 mb-4 relative z-10">
                                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M11.996 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12 12 12 0 0 0-12-12zm5.772 17.27a.754.754 0 0 1-1.037.248c-2.842-1.735-6.42-2.127-10.638-1.164a.755.755 0 0 1-.341-1.47c4.61-1.054 8.56-.607 11.768 1.35.372.227.491.716.248 1.036zm1.471-3.284a.94.94 0 0 1-1.294.305c-3.242-1.991-8.225-2.584-12.029-1.428a.941.941 0 0 1-.555-1.802c4.341-1.317 9.873-.655 13.573 1.62.43.264.566.837.305 1.295l-.001.01zm.105-3.41c-3.921-2.327-10.37-2.54-14.122-1.405a1.127 1.127 0 1 1-.652-2.155c4.321-1.31 11.455-1.055 16.023 1.656a1.127 1.127 0 1 1-1.25 1.904z"/></svg>
                                <span className="font-bold text-[15px] leading-none tracking-tight">SongDNA</span>
                                <span className="bg-[#1ed760] text-black text-[9px] px-1.5 py-0.5 rounded leading-none font-bold uppercase tracking-wide">Beta</span>
                            </div>
                            
                            <div className="flex items-start justify-center gap-4 mb-4 relative z-10 w-full">
                                <div className="text-center flex flex-col items-center flex-1 max-w-[120px]">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-white/5 shadow-xl overflow-hidden bg-black mb-2">
                                        <img src={activeArtist.image} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <p className="font-bold text-[13px] truncate w-full px-1">{activeArtist.name}</p>
                                    <p className="text-[11px] text-zinc-300 mt-0.5">Main Artist {(() => {
                                        const c = releaseSongs[0].collaboration;
                                        return c ? `+ ${1} more` : '';
                                    })()}</p>
                                </div>
                                {releaseSongs[0].samples && releaseSongs[0].samples.length > 0 && (
                                    <div className="text-center flex flex-col items-center flex-1 max-w-[120px]">
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl shadow-xl overflow-hidden bg-black mb-2 border border-white/5">
                                            <img src={releaseSongs[0].samples[0].coverArt} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <p className="font-bold text-[13px] truncate w-full px-1">{releaseSongs[0].samples[0].songTitle}</p>
                                        <p className="text-[11px] text-zinc-300 mt-0.5">Sample</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-end mb-2 relative z-10">
                                <div className="pr-2">
                                    <h3 className="font-bold text-xl mb-0.5 tracking-tight truncate max-w-[160px] sm:max-w-xs">{releaseSongs[0].title}</h3>
                                    <p className="text-[12px] text-zinc-300">
                                        {Array.from(new Set([
                                            activeArtist.name,
                                            ...(releaseSongs[0].collaboration ? [releaseSongs[0].collaboration.artistName] : []),
                                            ...(releaseSongs[0].isFeatureToNpc && releaseSongs[0].npcArtistName ? [releaseSongs[0].npcArtistName] : []),
                                            ...(releaseSongs[0].producers || []),
                                            ...(releaseSongs[0].songwriters || []),
                                            ...(releaseSongs[0].engineers || []),
                                            ...(releaseSongs[0].anr || [])
                                        ])).length} contributors • {releaseSongs[0].samples ? releaseSongs[0].samples.length : 0} sample{releaseSongs[0].samples && releaseSongs[0].samples.length === 1 ? '' : 's'}
                                    </p>
                                </div>
                                <button className="border border-white/70 hover:border-white transition-colors rounded-full px-3 py-1 font-bold text-[12px] bg-transparent text-white" onClick={() => setShowSongDNAFor(releaseSongs[0])}>Explore</button>
                            </div>
                            <p className="text-[12px] text-white/70 relative z-10 mt-1 truncate pr-4">Discover the people -- and the samples -- behind the so...</p>
                        </div>

                        <div className="mt-3 rounded-lg p-3 bg-[#242424] cursor-pointer hover:bg-[#2a2a2a] transition-colors" onClick={() => {
                            setEditAboutSongText(releaseSongs[0].aboutText || '');
                            setIsEditingAboutSong(true);
                        }}>
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <span className="font-bold text-[14px] tracking-tight">About the song</span>
                                <span className="bg-[#1ed760] text-black text-[9px] px-1.5 py-0.5 rounded leading-none font-bold uppercase tracking-wide">Beta</span>
                            </div>
                            <p className="text-[12px] text-zinc-300 leading-snug line-clamp-3">
                                {releaseSongs[0].aboutText || "This song has no description yet. Tap to edit."}
                            </p>
                        </div>
                        </>
                    )}

                    <div className="mt-6 text-sm text-zinc-400 space-y-4">
                        <p>{formatGameDate(release.releaseDate)}</p>
                        <p>{releaseSongs.length} song{releaseSongs.length > 1 ? 's' : ''} • {formatTotalDuration(totalDuration)}</p>
                        <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                            <img src={activeArtist.image} alt={activeArtist.name} className="w-10 h-10 rounded-full object-cover"/>
                            <p className="font-semibold text-white">{activeArtist.name}</p>
                        </div>
                    </div>
                    <div className="mt-8 py-4 text-center text-zinc-400 text-xs">
                        <p>{copyrightText}</p>
                        <p>{phonogramText}</p>
                    </div>

                </div>
            </div>

            {isEditingAboutSong && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setIsEditingAboutSong(false)}>
                    <div className="bg-zinc-800 rounded-lg p-5 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <h2 className="font-bold text-lg mb-4">Edit "About the song"</h2>
                        <textarea 
                            className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 min-h-[150px] mb-4 text-white resize-none"
                            placeholder="Enter the meaning of the song..."
                            value={editAboutSongText}
                            onChange={e => setEditAboutSongText(e.target.value)}
                        />
                        <div className="flex justify-end gap-3">
                            <button className="px-4 py-2 font-bold text-zinc-400 hover:text-white transition-colors" onClick={() => setIsEditingAboutSong(false)}>Cancel</button>
                            <button className="px-4 py-2 font-bold bg-[#1ed760] text-black rounded-full hover:bg-[#1fdf64] transition-colors" onClick={() => {
                                dispatch({ type: 'UPDATE_ABOUT_SONG_TEXT', payload: { songId: releaseSongs[0].id, text: editAboutSongText } });
                                setIsEditingAboutSong(false);
                            }}>Save & Publish</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SpotifyReleaseDetailView;