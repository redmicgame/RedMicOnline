
import React, { useState, useMemo } from 'react';
import { useGame, formatNumber } from '../context/GameContext';
import ChevronDownIcon from './icons/ChevronDownIcon';
import StarIcon from './icons/StarIcon';
import FireIcon from './icons/FireIcon';
import { Artist, Group, LabelSubmission, Song } from '../types';
import ChevronRightIcon from './icons/ChevronRightIcon';

const QualityBadge: React.FC<{ quality: number; showNumber: boolean }> = ({ quality, showNumber }) => {
    const getQualityColor = () => {
        if (quality < 50) return 'bg-red-500 text-white';
        if (quality < 70) return 'bg-yellow-500 text-black';
        if (quality < 96) return 'bg-green-400 text-black';
        return 'bg-green-600 text-white';
    };
    return (
        <div className={`w-12 h-12 flex items-center justify-center rounded-lg font-bold text-lg ${getQualityColor()}`}>
            {showNumber ? quality : ''}
        </div>
    );
};

const UnreleasedSongItem: React.FC<{ song: Song; showQualityNumber: boolean }> = ({ song, showQualityNumber }) => (
    <div className="bg-zinc-800 p-3 rounded-lg flex items-center gap-4">
        <img src={song.coverArt} alt={song.title} className="w-16 h-16 rounded-md object-cover"/>
        <div className="flex-grow">
            <p className="font-bold">{song.title}</p>
            <p className="text-sm text-zinc-400">{song.genre}</p>
        </div>
        <QualityBadge quality={song.quality} showNumber={showQualityNumber} />
    </div>
);

const SubmissionStatusBadge: React.FC<{ status: LabelSubmission['status'] }> = ({ status }) => {
    switch (status) {
        case 'pending':
            return <span className="text-xs font-bold text-yellow-400 bg-yellow-900/50 px-2 py-1 rounded-full">Pending</span>;
        case 'awaiting_player_input':
            return <span className="text-xs font-bold text-blue-400 bg-blue-900/50 px-2 py-1 rounded-full">Action Required</span>;
        case 'scheduled':
            return <span className="text-xs font-bold text-purple-400 bg-purple-900/50 px-2 py-1 rounded-full">Scheduled</span>;
        case 'rejected':
            return <span className="text-xs font-bold text-red-400 bg-red-900/50 px-2 py-1 rounded-full">Rejected</span>;
    }
}

const SubmissionItem: React.FC<{ submission: LabelSubmission }> = ({ submission }) => {
    const { dispatch } = useGame();

    const handlePlanRelease = () => {
        dispatch({ type: 'GO_TO_LABEL_PLAN', payload: { submissionId: submission.id } });
    };

    return (
        <div className="bg-zinc-800 p-3 rounded-lg flex items-center gap-4">
            <img src={submission.release.coverArt} alt={submission.release.title} className="w-16 h-16 rounded-md object-cover"/>
            <div className="flex-grow">
                <p className="font-bold">{submission.release.title}</p>
                <p className="text-sm text-zinc-400">{submission.release.type.replace(" (Deluxe)", "")}</p>
                {submission.status === 'scheduled' && submission.projectReleaseDate && (
                    <p className="text-xs text-green-300">Releasing W{submission.projectReleaseDate.week}, {submission.projectReleaseDate.year}</p>
                )}
            </div>
            <div className="flex flex-col items-end gap-2">
                <SubmissionStatusBadge status={submission.status} />
                {submission.status === 'awaiting_player_input' && (
                    <button onClick={handlePlanRelease} className="text-sm bg-blue-500 text-white font-semibold px-3 py-1 rounded-md hover:bg-blue-600">
                        Plan Release
                    </button>
                )}
            </div>
        </div>
    );
};

const RegionalPopularityBar: React.FC<{ region: string; score: number; color: string }> = ({ region, score, color }) => (
    <div>
        <div className="flex justify-between items-baseline text-sm">
            <p className="font-semibold text-zinc-300">{region}</p>
            <p className="font-mono text-zinc-400">{score.toFixed(0)}/100</p>
        </div>
        <div className="w-full bg-zinc-700 rounded-full h-2 mt-1">
            <div className={`h-2 rounded-full ${color}`} style={{ width: `${score}%` }}></div>
        </div>
    </div>
);


const HomeTab: React.FC = () => {
    const { gameState, dispatch, activeArtist, activeArtistData, allPlayerArtists } = useGame();
    const { date, careerMode, activeArtistId } = gameState;
    const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
    const [isPopularityExpanded, setIsPopularityExpanded] = useState(false);

    if (!activeArtistData || !activeArtist) return null;
    
    const { money, hype, popularity, songs, labelSubmissions, contract, redMicPro } = activeArtistData;

    const regionalScores = useMemo(() => {
        const base = popularity;
        const regions = ['US', 'Canada', 'Latin America', 'Asia', 'UK'];
        const scores: { region: string, score: number }[] = [];
        let scoreSum = 0;

        for (let i = 0; i < regions.length - 1; i++) {
            const variance = (Math.random() - 0.5) * 20; // -10 to +10 variance
            let score = base + variance;
            if ((activeArtist as Artist).country === regions[i]) {
                score += 5; // Home country boost
            }
            score = Math.max(0, Math.min(100, score));
            scores.push({ region: regions[i], score });
            scoreSum += score;
        }

        // Adjust the last region to make the average roughly equal to the base popularity
        const lastRegion = regions[regions.length - 1];
        let lastScore = (base * regions.length) - scoreSum;
         if ((activeArtist as Artist).country === lastRegion) {
            lastScore += 5;
        }
        lastScore = Math.max(0, Math.min(100, lastScore));
        scores.push({ region: lastRegion, score: lastScore });

        return scores.sort((a, b) => b.score - a.score);
    }, [popularity, activeArtist]);

    const getWeekDate = (d: { week: number; year: number; }) => {
         const date = new Date(d.year, 0, (d.week - 1) * 7 + 1);
         const month = date.toLocaleString('en-US', { month: 'long' });
         const day = date.getDate();
         return `${month} ${day}, ${d.year}`;
    }

    const widthPercentagePopularity = `${popularity}%`;
    const widthPercentageHype = `${hype}%`;
    const publicImageVal = activeArtistData.publicImage ?? 80;
    const widthPercentagePublicImage = `${publicImageVal}%`;

    const getPopularityColor = (p: number) => {
        if (p < 50) return 'from-red-600 to-red-500';
        if (p < 70) return 'from-yellow-500 to-yellow-400';
        if (p < 91) return 'from-green-500 to-green-400';
        return 'from-emerald-600 to-emerald-500';
    };

    const getPublicImageInfo = (score: number) => {
        if (score <= 20) return { label: 'Cancelled', color: 'bg-red-600', textColor: 'text-red-500' };
        if (score <= 40) return { label: 'Problematic', color: 'bg-orange-500', textColor: 'text-orange-500' };
        if (score <= 60) return { label: 'Controversial', color: 'bg-yellow-500', textColor: 'text-yellow-500' };
        if (score <= 80) return { label: 'Respected', color: 'bg-green-400', textColor: 'text-green-400' };
        return { label: 'Beloved', color: 'bg-emerald-500', textColor: 'text-emerald-500' };
    };

    const unreleasedSongs = songs.filter(s => !s.isReleased && !s.releaseId);
    
    const hasUnreleased = unreleasedSongs.length > 0;

    return (
        <div className="p-4 space-y-8">
            {isSwitcherOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsSwitcherOpen(false)}>
                    <div className="bg-zinc-800 rounded-lg p-4 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold mb-4">Switch Artist</h2>
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                            {allPlayerArtists.map((artist: Artist | Group) => (
                                <button key={artist.id} onClick={() => { dispatch({ type: 'CHANGE_ACTIVE_ARTIST', payload: artist.id }); setIsSwitcherOpen(false); }}
                                    className={`w-full flex items-center gap-3 p-2 rounded-md transition-colors ${activeArtistId === artist.id ? 'bg-red-600' : 'hover:bg-zinc-700'}`}>
                                    <img src={artist.image} alt={artist.name} className="w-10 h-10 rounded-full object-cover" />
                                    <span className="font-semibold">{artist.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            <header className="flex justify-between items-center flex-shrink-0">
                <div>
                    <p className="text-lg font-bold">Week {date.week}, {date.year}</p>
                    <p className="text-sm text-zinc-400">{getWeekDate(date)}</p>
                    <p className="text-3xl font-bold text-green-400 mt-1">${formatNumber(money)}</p>
                </div>
                {allPlayerArtists.length > 1 && (
                    <button onClick={() => setIsSwitcherOpen(true)} className="flex items-center gap-2 bg-zinc-800 p-2 rounded-lg hover:bg-zinc-700 transition-colors">
                        <img src={activeArtist.image} alt={activeArtist.name} className="w-10 h-10 rounded-full object-cover" />
                        <div className="text-left">
                            <p className="text-xs text-zinc-400">Active</p>
                            <p className="font-semibold">{activeArtist.name}</p>
                        </div>
                        <ChevronDownIcon className="w-5 h-5" />
                    </button>
                )}
            </header>
            
            <div>
                 <div className="mb-4">
                    <button onClick={() => setIsPopularityExpanded(!isPopularityExpanded)} className="w-full text-left">
                        <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2">
                                <StarIcon className="w-5 h-5 text-yellow-400" />
                                <h2 className="text-xl font-bold">Popularity</h2>
                                <ChevronDownIcon className={`w-5 h-5 text-zinc-400 transition-transform ${isPopularityExpanded ? 'rotate-180' : ''}`} />
                            </div>
                            <span className="font-bold text-lg">{Math.round(popularity)}/100</span>
                        </div>
                    </button>
                    <div className="w-full bg-zinc-700 rounded-full h-4 overflow-hidden">
                        <div 
                            className={`bg-gradient-to-r ${getPopularityColor(popularity)} h-4 rounded-full transition-all duration-500 ease-out`} 
                            style={{ width: widthPercentagePopularity }}
                        ></div>
                    </div>
                    <div 
                        className="grid transition-all duration-300 ease-in-out overflow-hidden"
                        style={{ gridTemplateRows: isPopularityExpanded ? '1fr' : '0fr' }}
                    >
                        <div className="min-h-0">
                            <div className="bg-zinc-800/50 p-3 mt-2 rounded-lg space-y-2">
                                {regionalScores.map(item => (
                                    <RegionalPopularityBar key={item.region} region={item.region} score={item.score} color={getPopularityColor(item.score).replace('from-', 'bg-').split(' ')[0]} />
                                ))}
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 text-right">Increases streams, views, sales, and likes.</p>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                            <svg className={`w-5 h-5 ${getPublicImageInfo(publicImageVal).textColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h2 className="text-xl font-bold">Public Image</h2>
                        </div>
                        <span className={`font-bold text-lg ${getPublicImageInfo(publicImageVal).textColor}`}>{getPublicImageInfo(publicImageVal).label}</span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-4 overflow-hidden">
                        <div 
                            className={`${getPublicImageInfo(publicImageVal).color} h-4 rounded-full transition-all duration-500 ease-out`} 
                            style={{ width: widthPercentagePublicImage }}
                        ></div>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 text-right">Impacts fan & media reaction to your actions.</p>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                            <FireIcon className="w-5 h-5 text-red-500" />
                            <h2 className="text-xl font-bold">Hype</h2>
                        </div>
                        <span className="font-bold text-lg">{Math.round(hype)}/100</span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-4 overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 h-4 rounded-full transition-all duration-500 ease-out" 
                            style={{ width: widthPercentageHype }}
                        ></div>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 text-right">Higher hype leads to more streams for all your songs.</p>
                </div>
            </div>

             {contract && labelSubmissions.length > 0 && (
                 <div className="space-y-4">
                    <h2 className="text-xl font-bold">Submitted to Label</h2>
                    <div className="space-y-3">
                        {labelSubmissions.map(sub => <SubmissionItem key={sub.id} submission={sub} />)}
                    </div>
                </div>
            )}
            
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Unreleased Songs</h2>
                    {hasUnreleased && (
                        <button onClick={() => dispatch({type: 'CHANGE_VIEW', payload: 'releaseHub'})} className="flex items-center gap-1 text-red-500 hover:text-red-400 font-semibold">
                           View All <ChevronRightIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
                {hasUnreleased ? (
                    <div className="space-y-3">
                        {unreleasedSongs.slice(0, 3).map(song => <UnreleasedSongItem key={song.id} song={song} showQualityNumber={redMicPro.unlocked} />)}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-zinc-800 rounded-lg">
                        <p className="text-zinc-400">No unreleased songs.</p>
                        <p className="text-zinc-500 text-sm">Go to the "Studio" app to record something new!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeTab;
