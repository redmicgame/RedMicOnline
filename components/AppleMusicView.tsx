
import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { LABELS } from '../constants';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import StarIcon from './icons/StarIcon';
import DotsHorizontalIcon from './icons/DotsHorizontalIcon';
import PlayRedCircleIcon from './icons/PlayRedCircleIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import { Song, Release, Video, GameDate } from '../types';
import PlusIcon from './icons/PlusIcon';
import LosslessIcon from './icons/LosslessIcon';
import ArrowUpOnBoxIcon from './icons/ArrowUpOnBoxIcon';

const formatDateApple = (gameDate: GameDate) => {
    const date = new Date(gameDate.year, 0, (gameDate.week - 1) * 7 + 1);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
};

const AppleMusicReleaseDetailView: React.FC<{ releaseId: string; onBack: () => void; onSelectRelease: (id: string) => void }> = ({ releaseId, onBack, onSelectRelease }) => {
    const { activeArtist, activeArtistData } = useGame();
    const [isReviewExpanded, setIsReviewExpanded] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    const { releases, songs, videos } = activeArtistData!;
    const release = releases.find(r => r.id === releaseId);

    const otherVersions = useMemo(() => {
        if (!release) return [];
        if (release.type === 'Album') {
            return releases.filter(r => r.standardEditionId === release.id);
        }
        if (release.type === 'Album (Deluxe)' && release.standardEditionId) {
            const standard = releases.find(r => r.id === release.standardEditionId);
            return standard ? [standard] : [];
        }
        return [];
    }, [release, releases]);
    
    const relatedVideos = useMemo(() => {
        if (!release) return [];
        const songIds = new Set(release.songIds);
        return videos.filter(v => songIds.has(v.songId));
    }, [release, videos]);

    if (!release || !activeArtist) {
        return (
            <div className="bg-black text-white min-h-screen p-4">
                <p>Release not found.</p>
                <button onClick={onBack} className="text-rose-400">Back</button>
            </div>
        );
    }
    
    const releaseSongs = release.songIds.map(id => songs.find(s => s.id === id)).filter((s): s is Song => !!s);
    const totalDuration = Math.round(releaseSongs.reduce((sum, s) => sum + s.duration, 0) / 60);

    const isSingle = release.type === 'Single';
    const singleSong = isSingle ? releaseSongs[0] : null;

    const artistDisplay = (isSingle && singleSong && singleSong.collaboration)
        ? `${activeArtist.name} & ${singleSong.collaboration.artistName}`
        : activeArtist.name;
    
    const releaseTitle = (isSingle && singleSong && singleSong.collaboration)
        ? release.title.replace(` (feat. ${singleSong.collaboration.artistName})`, '')
        : release.title;

    return (
        <>
            {isReviewExpanded && release.review && (
                <div className="fixed inset-0 bg-black/90 z-50 p-4 flex flex-col">
                    <div className="flex justify-between items-center pb-4">
                        <h2 className="font-bold text-lg">{releaseTitle}</h2>
                        <button onClick={() => setIsReviewExpanded(false)} className="font-bold text-rose-400">Done</button>
                    </div>
                    <div className="flex-grow overflow-y-auto text-zinc-300 leading-relaxed text-lg">
                        {release.review.text}
                    </div>
                </div>
            )}
            {isDescriptionExpanded && (
                <div className="fixed inset-0 bg-black/90 z-50 p-4 flex flex-col">
                    <div className="flex justify-between items-center pb-4">
                        <h2 className="font-bold text-lg">{releaseTitle}</h2>
                        <button onClick={() => setIsDescriptionExpanded(false)} className="font-bold text-rose-400">Done</button>
                    </div>
                    <div className="flex-grow overflow-y-auto text-zinc-300 leading-relaxed text-lg">
                        {release.wikipediaSummary}
                    </div>
                </div>
            )}

            <div className="bg-black text-white min-h-screen pb-16">
                {(release.isAppleMusicExpandedCover && !isSingle) ? (
                    <div className="relative w-full aspect-square md:aspect-[4/3] group">
                        <img src={release.coverArt} alt={releaseTitle} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
                        <header className="absolute top-0 left-0 right-0 z-10 p-4 mt-8 flex justify-between items-center bg-transparent">
                            <button onClick={onBack} className="bg-black/30 p-1.5 rounded-full backdrop-blur-md"><ChevronLeftIcon className="w-6 h-6 text-white drop-shadow-md" /></button>
                            <div className="flex items-center gap-3">
                                <button className="bg-black/30 p-1.5 rounded-full backdrop-blur-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                </button>
                                <button className="bg-black/30 p-1.5 rounded-full backdrop-blur-md"><DotsHorizontalIcon className="w-5 h-5 text-white drop-shadow-md" /></button>
                            </div>
                        </header>
                        
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-center pb-6">
                            <h2 className="text-3xl font-black drop-shadow-lg tracking-tight px-2">{releaseTitle}</h2>
                            <p className="text-xl font-medium mt-1 drop-shadow-md">{artistDisplay}</p>
                            <p className="text-xs text-white/80 uppercase mt-2 flex items-center justify-center gap-2 drop-shadow-md font-medium">
                                <span>{releaseSongs[0]?.genre || 'Pop'}</span>
                                <span>•</span>
                                <span>{release.releaseDate.year}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <LosslessIcon className="w-4 h-4 fill-white" /> Lossless
                                </span>
                            </p>
                            
                            <div className="flex gap-4 mt-6 justify-center items-center px-4">
                                <button className="bg-zinc-800/80 backdrop-blur-md hover:bg-zinc-700 transition-colors rounded-full w-12 h-12 flex-shrink-0 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 3l4 4m0 0l-4 4m4-4H4m12 14l4-4m0 0l-4-4m4 4H4" />
                                    </svg>
                                </button>
                                <button className="bg-white hover:bg-zinc-200 transition-colors rounded-full flex-1 max-w-[200px] py-3 flex items-center justify-center gap-2 shadow-lg">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-black"><path d="M7 6v12l10-6z" /></svg>
                                    <span className="font-bold text-black text-lg pb-0.5">Play</span>
                                </button>
                                <button className="bg-zinc-800/80 backdrop-blur-md hover:bg-zinc-700 transition-colors rounded-full w-12 h-12 flex-shrink-0 flex items-center justify-center">
                                    <PlusIcon className="w-6 h-6 text-zinc-300" />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <header className="sticky top-0 bg-black/80 backdrop-blur-md z-10 p-4 mt-8 flex justify-between items-center">
                            <button onClick={onBack}><ChevronLeftIcon className="w-7 h-7" /></button>
                            <h1 className="font-bold text-center truncate">{releaseTitle}</h1>
                            <div className="flex items-center gap-4">
                                <button><PlusIcon className="w-6 h-6" /></button>
                                <button><DotsHorizontalIcon className="w-6 h-6" /></button>
                            </div>
                        </header>
                        <section className="text-center p-4">
                            <img src={release.coverArt} className="w-56 h-56 rounded-lg object-cover mx-auto shadow-2xl shadow-black" />
                            <h2 className="text-2xl font-bold mt-4">{releaseTitle}</h2>
                            <p className="text-xl text-rose-400 font-semibold">{artistDisplay}</p>
                            <p className="text-sm text-zinc-400 uppercase mt-1 flex items-center justify-center gap-2">
                                <span>{releaseSongs[0]?.genre || 'Pop'}</span>
                                <span>•</span>
                                <span>{release.releaseDate.year}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <LosslessIcon className="w-5 h-5" /> Lossless
                                </span>
                            </p>
                            <div className="flex gap-4 mt-6 justify-center items-center px-4">
                                <button className="bg-zinc-800/80 backdrop-blur-md hover:bg-zinc-700 transition-colors rounded-full w-12 h-12 flex-shrink-0 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 3l4 4m0 0l-4 4m4-4H4m12 14l4-4m0 0l-4-4m4 4H4" />
                                    </svg>
                                </button>
                                <button className="bg-white hover:bg-zinc-200 transition-colors rounded-full flex-1 max-w-[200px] py-3 flex items-center justify-center gap-2 shadow-lg">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-black"><path d="M7 6v12l10-6z" /></svg>
                                    <span className="font-bold text-black text-lg pb-0.5">Play</span>
                                </button>
                                <button className="bg-zinc-800/80 backdrop-blur-md hover:bg-zinc-700 transition-colors rounded-full w-12 h-12 flex-shrink-0 flex items-center justify-center">
                                    <PlusIcon className="w-6 h-6 text-zinc-300" />
                                </button>
                            </div>
                        </section>
                    </>
                )}

                <main className="p-4 space-y-8">
                    {(release.review || release.wikipediaSummary) && (
                        <section>
                            <p className="text-zinc-300 leading-snug line-clamp-3">
                                {release.review ? release.review.text : release.wikipediaSummary}
                                <button onClick={() => release.review ? setIsReviewExpanded(true) : setIsDescriptionExpanded(true)} className="font-bold text-white ml-1">MORE</button>
                            </p>
                            {release.review && <p className="text-zinc-400 text-sm mt-2">Pitchfork • {release.review.score.toFixed(1)}</p>}
                        </section>
                    )}

                    <section>
                        {releaseSongs.map((song, index) => {
                            const songTitle = song.title.replace(/\s*\(feat\..*\)/i, '');
                            const artistForSong = song.collaboration
                                ? `${activeArtist.name} & ${song.collaboration.artistName}`
                                : null;

                            return (
                                <div key={song.id} className="flex items-start gap-3 py-3 border-b border-zinc-800">
                                    <span className="w-6 text-zinc-400 text-center pt-1">{index + 1}</span>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold truncate text-white">{songTitle}</p>
                                            {song.explicit && <span className="text-xs w-4 h-4 bg-zinc-700 text-zinc-400 font-bold rounded-sm flex items-center justify-center flex-shrink-0">E</span>}
                                        </div>
                                        {artistForSong && (
                                            <p className="text-sm text-zinc-400 truncate">{artistForSong}</p>
                                        )}
                                    </div>
                                    <button className="flex-shrink-0 pt-1"><DotsHorizontalIcon className="w-5 h-5 text-zinc-400" /></button>
                                </div>
                            );
                        })}
                    </section>
                    
                    <section className="text-xs text-zinc-400 space-y-1">
                        <p>&copy; Apple Digital Master</p>
                        <p>{formatDateApple(release.releaseDate)}</p>
                        <p>{releaseSongs.length} Songs, {totalDuration} Minutes</p>
                        <p>&copy; {release.releaseDate.year} {(() => {
                            if (release.rightsOwnerLabelId && release.rightsSoldPercent && release.rightsSoldPercent > 50) {
                                const ownerLabel = LABELS.find(l => l.id === release.rightsOwnerLabelId);
                                return ownerLabel?.name || 'Unknown Label';
                            }
                            return release.releasingLabel ? release.releasingLabel.name : "Independent";
                        })()}</p>
                    </section>
                    
                    {otherVersions.length > 0 && <HorizontalSection title="Other Versions" items={otherVersions} onSelect={onSelectRelease} />}
                    {relatedVideos.length > 0 && <HorizontalSection title="Music Videos" items={relatedVideos} onSelect={() => {}} artistName={activeArtist.name} />}

                </main>
            </div>
        </>
    );
};

const HorizontalSection: React.FC<{title: string, items: (Release | Video)[], onSelect: (id: string) => void, artistName?: string}> = ({title, items, onSelect, artistName}) => {
    const { activeArtistData } = useGame();
    const isVideos = title === 'Music Videos';

    return (
         <section>
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold">{title}</h2>
                <button className="text-zinc-400"><ChevronRightIcon className="w-6 h-6" /></button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {items.map(item => {
                    const containerWidth = isVideos ? 'w-64' : 'w-40';
                    const imageClass = isVideos ? 'w-full aspect-video rounded-lg object-cover' : 'w-40 h-40 rounded-lg object-cover';
                    
                    let isExplicit = false;
                    if (isVideos && 'songId' in item && activeArtistData) {
                        const song = activeArtistData.songs.find(s => s.id === (item as Video).songId);
                        isExplicit = song?.explicit ?? false;
                    }
                    
                    return (
                        <button key={item.id} onClick={() => 'type' in item && onSelect(item.id)} className={`${containerWidth} flex-shrink-0 text-left`}>
                            <img src={'coverArt' in item ? item.coverArt : item.thumbnail} className={imageClass} />
                            <div className="font-semibold truncate mt-1 flex items-center">
                                <span className="truncate">{item.title}</span>
                                {isExplicit && <span className="ml-2 text-xs w-4 h-4 bg-zinc-700/80 text-zinc-300 font-bold rounded-sm flex items-center justify-center flex-shrink-0">E</span>}
                            </div>
                            <p className="text-sm text-zinc-400">{isVideos ? artistName : ('releaseDate' in item && item.releaseDate.year)}</p>
                        </button>
                    );
                })}
            </div>
        </section>
     )
}

const AppleMusicView: React.FC = () => {
    const { dispatch, activeArtist, activeArtistData } = useGame();
    const [view, setView] = useState<'artistProfile' | 'releaseDetail'>('artistProfile');
    const [selectedReleaseId, setSelectedReleaseId] = useState<string | null>(null);


    if (!activeArtist || !activeArtistData) {
        return (
            <div className="bg-black text-white min-h-screen flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }
    
    const handleSelectRelease = (id: string) => {
        setSelectedReleaseId(id);
        setView('releaseDetail');
    };

    const handleBack = () => {
        setSelectedReleaseId(null);
        setView('artistProfile');
    };
    
    if (view === 'releaseDetail' && selectedReleaseId) {
        return <AppleMusicReleaseDetailView releaseId={selectedReleaseId} onBack={handleBack} onSelectRelease={handleSelectRelease} />;
    }


    const { songs, releases, videos } = activeArtistData;

    const isFeature = (r: Release) => r.isFeatureToNpc || r.songIds.some(id => songs.find(s => s.id === id)?.isFeatureToNpc);
    const availableReleases = releases.filter(r => !r.isTakenDown && !r.soundtrackInfo && !isFeature(r));

    const latestRelease = [...availableReleases]
        .filter(r => r.type === 'Album' || r.type === 'EP' || r.type === 'Album (Deluxe)' || r.type === 'Compilation')
        .sort((a, b) => (b.releaseDate.year * 52 + b.releaseDate.week) - (a.releaseDate.year * 52 + a.releaseDate.week))[0];

    const topSongs = [...songs]
        .filter(s => s.isReleased)
        .sort((a, b) => (b.lastWeekStreams || 0) - (a.lastWeekStreams || 0))
        .slice(0, 5);
    
    const albums = availableReleases.filter(r => r.type === 'Album' || r.type === 'Album (Deluxe)' || r.type === 'Compilation').sort((a,b) => b.releaseDate.year - a.releaseDate.year);

    const musicVideos = videos.filter(v => v.type === 'Music Video').sort((a,b) => (b.releaseDate.year * 52 + b.releaseDate.week) - (a.releaseDate.year * 52 + a.releaseDate.week));

    const singlesAndEps = availableReleases.filter(r => r.type === 'Single' || r.type === 'EP').sort((a,b) => (b.releaseDate.year * 52 + b.releaseDate.week) - (a.releaseDate.year * 52 + a.releaseDate.week));

    const essentialAlbums = albums.filter(r => r.isAppleMusicEssential);

    return (
        <div className="bg-black text-white min-h-screen">
            <div className="relative h-[45vh] min-h-[340px]">
                <img src={activeArtist.image} className="absolute w-full h-full object-cover" alt={activeArtist.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/50 to-transparent" />
                <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 mt-8">
                    <button onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: 'game' })}><ChevronLeftIcon className="w-7 h-7" /></button>
                    <h1 className="font-bold opacity-0 transition-opacity">{activeArtist.name}</h1>
                    <div className="flex items-center gap-4">
                        <button><StarIcon className="w-6 h-6" /></button>
                        <button><DotsHorizontalIcon className="w-6 h-6" /></button>
                    </div>
                </header>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex justify-between items-end">
                        <h1 className="text-6xl font-black">{activeArtist.name}</h1>
                        <PlayRedCircleIcon className="w-16 h-16 flex-shrink-0" />
                    </div>
                </div>
            </div>

            <main className="p-4 space-y-8 pb-16">
                {latestRelease && (
                    <section>
                        <button onClick={() => handleSelectRelease(latestRelease.id)} className="flex items-center gap-4 w-full text-left">
                            <img src={latestRelease.coverArt} className="w-32 h-32 rounded-lg object-cover" alt={latestRelease.title} />
                            <div className="flex-grow">
                                <p className="text-xs uppercase text-zinc-400">{formatDateApple(latestRelease.releaseDate)}</p>
                                <h2 className="text-xl font-bold">{latestRelease.title}</h2>
                                <p className="text-zinc-400">{latestRelease.songIds.length} songs</p>
                            </div>
                        </button>
                    </section>
                )}
                
                {topSongs.length > 0 && (
                    <section>
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-2xl font-bold">Top Songs</h2>
                            <button className="text-zinc-400"><ChevronRightIcon className="w-6 h-6" /></button>
                        </div>
                        <div className="divide-y divide-zinc-800">
                            {topSongs.map((song) => {
                                const release = releases.find(r => r.id === song.releaseId);
                                const songTitle = song.collaboration
                                    ? song.title.replace(` (feat. ${song.collaboration.artistName})`, '')
                                    : song.title;
                                
                                let subTitle = '';
                                if (release) {
                                    if (release.type === 'Single') {
                                        subTitle = 'Single';
                                    } else {
                                        subTitle = `${release.title} • ${release.releaseDate.year}`;
                                    }
                                }

                                return (
                                    <div key={song.id} className="flex items-center gap-3 py-2">
                                        <img src={song.coverArt} className="w-12 h-12 rounded-md object-cover" alt={songTitle} />
                                        <div className="flex-grow min-w-0">
                                            <p className="font-semibold truncate">{songTitle}</p>
                                            <p className="text-sm text-zinc-400 truncate">{subTitle}</p>
                                        </div>
                                        <button className="flex-shrink-0"><DotsHorizontalIcon className="w-5 h-5 text-zinc-400" /></button>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {essentialAlbums.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Essential Albums</h2>
                        <div className="space-y-6">
                            {essentialAlbums.map(ea => {
                                const hasExplicit = ea.songIds.some(id => songs.find(s => s.id === id)?.explicit);
                                return (
                                <div key={ea.id} onClick={() => handleSelectRelease(ea.id)} className="cursor-pointer">
                                    <div className="w-full aspect-square rounded-xl overflow-hidden relative">
                                        <img src={ea.coverArt} className="w-full h-full object-cover" alt={ea.title} />
                                    </div>
                                    <div className="mt-3">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg">{ea.title}</h3>
                                            {hasExplicit && <span className="text-xs w-4 h-4 bg-zinc-700/80 text-zinc-300 font-bold rounded-sm flex items-center justify-center flex-shrink-0">E</span>}
                                        </div>
                                        <p className="text-zinc-400 text-sm mt-1 leading-snug line-clamp-2">
                                            {ea.appleMusicEssentialReview || `${activeArtist.name}'s defining album.`}
                                        </p>
                                    </div>
                                </div>
                            )})}
                        </div>
                    </section>
                )}

                {albums.length > 0 && (
                    <HorizontalSection title="Albums" items={albums} onSelect={handleSelectRelease} />
                )}
                {musicVideos.length > 0 && (
                     <HorizontalSection title="Music Videos" items={musicVideos} onSelect={() => {}} artistName={activeArtist.name} />
                )}
                 {singlesAndEps.length > 0 && (
                     <HorizontalSection title="Singles & EPs" items={singlesAndEps} onSelect={handleSelectRelease} />
                )}
            </main>
        </div>
    );
};

export default AppleMusicView;
