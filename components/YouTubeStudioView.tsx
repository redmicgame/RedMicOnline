
import React, { useMemo } from 'react';
import { useGame, formatNumber } from '../context/GameContext';
import { VIEW_INCOME_MULTIPLIER } from '../constants';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import ThumbUpIcon from './icons/ThumbUpIcon';
import CommentIcon from './icons/CommentIcon';
import ArrowDownIcon from './icons/ArrowDownIcon';

const YouTubeStudioView: React.FC = () => {
    const { gameState, dispatch, activeArtist, activeArtistData } = useGame();
    const { date } = gameState;

    if (!activeArtist || !activeArtistData) return null;
    const { youtubeSubscribers, videos, lastFourWeeksViews } = activeArtistData;

    const last28DaysViews = useMemo(() => {
        return lastFourWeeksViews.reduce((sum, weeklyViews) => sum + weeklyViews, 0);
    }, [lastFourWeeksViews]);

    const last28DaysRevenue = useMemo(() => {
        return last28DaysViews * VIEW_INCOME_MULTIPLIER;
    }, [last28DaysViews]);
    
    const latestVideos = useMemo(() => {
        return [...videos]
            .filter(v => !v.isFeatureVideo)
            .sort((a, b) => (b.releaseDate.year * 52 + b.releaseDate.week) - (a.releaseDate.year * 52 + a.releaseDate.week))
            .slice(0, 5);
    }, [videos]);

    const weeksAgo = (releaseDate: { week: number, year: number }): number => {
        return (date.year * 52 + date.week) - (releaseDate.year * 52 + releaseDate.week);
    }

    return (
        <div className="bg-[#0f0f0f] text-white min-h-screen">
             <header className="p-4 flex items-center gap-4 sticky top-0 bg-[#0f0f0f]/80 backdrop-blur-sm z-10 border-b border-white/10">
                <button onClick={() => dispatch({type: 'CHANGE_VIEW', payload: 'youtube'})} className="p-2 rounded-full hover:bg-white/10">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold">YouTube Studio</h1>
            </header>

            <main className="p-4 space-y-6">
                <div className="flex items-center gap-4">
                    <img src={activeArtist.image} alt={activeArtist.name} className="w-20 h-20 rounded-full object-cover"/>
                    <div>
                        <h2 className="text-2xl font-bold">{activeArtist.name}</h2>
                        <p className="text-sm text-zinc-400">{formatNumber(youtubeSubscribers)} Total subscribers</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold">Channel analytics</h3>
                        <p className="text-xs text-zinc-400">Last 28 days</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#282828] p-4 rounded-lg">
                            <p className="text-sm text-zinc-400">Views</p>
                            <p className="text-2xl font-bold">{formatNumber(last28DaysViews)}</p>
                        </div>
                        <div className="bg-[#282828] p-4 rounded-lg">
                            <p className="text-sm text-zinc-400">Revenue</p>
                            <p className="text-2xl font-bold">${formatNumber(last28DaysRevenue)}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xl font-bold">Latest published content</h3>
                    <div className="space-y-3">
                        {latestVideos.map(video => {
                            const likes = Math.floor(video.views * 0.2);
                            const comments = Math.floor(video.views / (Math.random() * 500 + 400));
                            const weeksSinceRelease = weeksAgo(video.releaseDate);

                            return (
                                <div key={video.id} className="bg-[#282828] p-3 rounded-lg space-y-2">
                                    <div className="flex gap-3">
                                        <img src={video.thumbnail} alt={video.title} className="w-24 aspect-video rounded-md object-cover"/>
                                        <div className="flex-grow">
                                            <p className="font-semibold line-clamp-2">{video.title}</p>
                                            <p className="text-xs text-zinc-400">First {weeksSinceRelease * 7} days</p>
                                        </div>
                                    </div>
                                    <div className="border-t border-white/10 pt-2 flex justify-around items-center text-sm">
                                        <div className="flex items-center gap-1.5">
                                            <ChartBarIcon className="w-5 h-5 text-zinc-400" />
                                            <span>{formatNumber(video.views)}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <ThumbUpIcon className="w-5 h-5 text-zinc-400" />
                                            <span>{formatNumber(likes)}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <CommentIcon className="w-5 h-5 text-zinc-400" />
                                            <span>{formatNumber(comments)}</span>
                                        </div>
                                        <ArrowDownIcon className="w-4 h-4 text-zinc-400" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default YouTubeStudioView;
