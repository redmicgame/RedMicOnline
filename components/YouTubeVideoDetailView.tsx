

import React, { useState, useMemo } from 'react';
import { useGame, formatNumber } from '../context/GameContext';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import ThumbUpIcon from './icons/ThumbUpIcon';
import ThumbDownIcon from './icons/ThumbDownIcon';
import ShareIcon from './icons/ShareIcon';
import SaveIcon from './icons/SaveIcon';
import DownloadIconSimple from './icons/DownloadIconSimple';
import DotsHorizontalIcon from './icons/DotsHorizontalIcon';
import { Video, Song, Release } from '../types';
import ShoppingBagIcon from './icons/ShoppingBagIcon';
import { LABELS, SUBSCRIBER_THRESHOLD_VERIFIED, VIEWS_THRESHOLD_VERIFIED } from '../constants';

const ActionButton: React.FC<{
    icon: React.ReactNode;
    label: string;
}> = ({ icon, label }) => (
    <button className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 rounded-full py-2 px-4 transition-colors">
        {icon}
        <span className="text-sm font-semibold">{label}</span>
    </button>
);

const DescriptionOverlay: React.FC<{ video: Video; onClose: () => void }> = ({ video, onClose }) => {
    const { activeArtist, activeArtistData, dispatch, gameState } = useGame();
    const { songs, releases, merch } = activeArtistData!;

    const song = songs.find(s => s.id === video.songId);
    const release = song ? releases.find(r => r.id === song.releaseId) : null;
    
    const mentionedPeople: {name: string, image: string}[] = [];
    if (activeArtist) {
        mentionedPeople.push({ name: activeArtist.name, image: activeArtist.image });
    }
    
    if (video.mentionedNpcs) {
        for (const npcName of video.mentionedNpcs) {
            if (!mentionedPeople.some(p => p.name === npcName)) {
                mentionedPeople.push({ name: npcName, image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2E1YTVhNSIgY2xhc3M9InctNiBoLTYiPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0iTTE4Ljc1IDE5LjEyNWExLjEyNSAxLjEyNSAwIDAgMS0xLjEyNSAxLjEyNUg2LjM3MmExLjEyNSAxLjEyNSAwIDAgMS0xLjEyNS0xLjEyNVY2LjE4OGExLjEyNSAxLjEyNSAwIDAgMSAxLjEyNS0xLjEyNWgxMS4yNVYxOS4xMjV6TTEyIDIuMjVjLTUuMzg1IDAtOS43NSA0LjM2NS05Ljc1IDkuNzVzNC4zNjUgOS43NSA5Ljc1IDkuNzUgOS43NS00LjM2NSA5Ljc1LTkuNzVTMTcuMzg1IDIuMjUgMTIgMi4yNXptMCAxLjVjNC41NTQgMCA4LjI1IDMuNjk2IDguMjUgOC4yNXMtMy42OTYgOC4yNS04LjI1IDguMjUtOC4yNS0zLjY5Ni04LjI1LTguMjVNNy40NDYgMy43NSAxMiAzLjc1em0tMi40IDEwLjVhMS4xMjUgMS4xMjUgMCAxIDEgMCAyLjI1IDEuMTI1IDEuMTI1IDAgMCAxIDAtMi4yNXptMy4zNDEtLjAyMmExLjEyNSAxLjEyNSAwIDEgMCAyLjI1IDAgMS4xMjUgMS4xMjUgMCAxIDAtMi4yNSAwem0zLjY4OS0xLjEyNWExLjEyNSAxLjEyNSAwIDEgMSAwLTIuMjUgMS4xMjUgMS4xMjUgMCAwIDEgMCAyLjI1eiIgY2xpcC1ydWxlPSJldmVub2RkIiAvPjwvc3ZnPg==' });
            }
        }
    }
    
    const storeItems = merch.slice(0, 3);
    
    return (
        <>
            <div className="p-4 border-b border-zinc-700 sticky top-0 bg-[#181818] z-10 flex justify-between items-center">
                <h2 className="text-xl font-bold">Description</h2>
                <button onClick={onClose} className="text-3xl text-zinc-400">&times;</button>
            </div>
            
            <div className="p-4 space-y-6">
                <div className="bg-zinc-800 rounded-xl p-4">
                    <h3 className="text-lg font-bold">{video.title}</h3>
                    <div className="grid grid-cols-3 gap-4 text-zinc-300 mt-4 text-center">
                        <div>
                            <p className="font-bold text-lg">{formatNumber(Math.floor(video.views * 0.01))}</p>
                            <p className="text-xs text-zinc-400">Likes</p>
                        </div>
                        <div>
                            <p className="font-bold text-lg">{video.views.toLocaleString()}</p>
                            <p className="text-xs text-zinc-400">Views</p>
                        </div>
                        <div>
                            <p className="font-bold text-lg">{new Date(video.releaseDate.year, 0, (video.releaseDate.week - 1) * 7 + 1).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                            <p className="text-xs text-zinc-400">Date</p>
                        </div>
                    </div>
                    <hr className="border-zinc-700 my-4" />
                    <p className="text-zinc-300 whitespace-pre-wrap text-sm">{video.description || 'No description available.'}</p>
                </div>

                {mentionedPeople.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="font-bold text-lg">People mentioned</h4>
                        <div className="grid grid-cols-3 gap-4">
                            {mentionedPeople.map(person => (
                                <div key={person.name} className="flex flex-col items-center text-center">
                                    <img src={person.image} alt={person.name} className="w-20 h-20 rounded-full object-cover mb-2" />
                                    <p className="font-semibold text-sm">{person.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {song && (
                    <div className="space-y-3">
                         <h4 className="font-bold text-lg">Music</h4>
                         <div className="bg-zinc-800 rounded-lg p-3 flex items-center gap-4">
                             <img src={song.coverArt} alt={song.title} className="w-16 h-16 rounded-md object-cover" />
                             <div className="flex-grow">
                                 <p className="font-bold">{song.title}</p>
                                 <p className="text-sm text-zinc-400">{activeArtist?.name}</p>
                                 <p className="text-xs text-zinc-500">{release ? release.title : song.title}</p>
                             </div>
                             <button className="ml-auto text-zinc-400"><DotsHorizontalIcon className="w-6 h-6" /></button>
                         </div>
                    </div>
                )}
                
                {storeItems.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="font-bold text-lg">{activeArtist!.name} store</h4>
                        <div className="bg-zinc-800 rounded-xl p-4 space-y-4">
                            {storeItems.map(item => (
                                <div key={item.id} className="flex items-center gap-3">
                                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-sm object-cover" />
                                    <div className="flex-grow">
                                        <p className="font-semibold text-sm line-clamp-2">{item.name}</p>
                                        <p className="text-xs text-zinc-400">shop.{activeArtist?.name.replace(/\s/g, '').toLowerCase()}.com</p>
                                    </div>
                                </div>
                            ))}
                             <button onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: 'merchStore' })} className="w-full bg-zinc-700 hover:bg-zinc-600 rounded-full py-2.5 font-semibold text-sm mt-2 flex items-center justify-center gap-2">
                                <ShoppingBagIcon className="w-5 h-5" /> View {activeArtist!.name} store
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};


const YouTubeVideoDetailView: React.FC = () => {
    const { gameState, dispatch, activeArtist, activeArtistData } = useGame();
    const { selectedVideoId, date } = gameState;
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    if (!activeArtist || !activeArtistData) return null;
    const { videos, youtubeSubscribers } = activeArtistData;

    const video = videos.find(v => v.id === selectedVideoId);

    const channelData = useMemo(() => {
        const isLabelVideo = video && video.channelId !== activeArtist.id;
        if (isLabelVideo) {
            const label = LABELS.find(l => l.id === video.channelId);
            if (label && label.youtubeChannel) {
                return {
                    name: label.youtubeChannel.name,
                    avatar: label.logo,
                    subscribers: label.youtubeChannel.subscribers,
                };
            }
        }
        // Fallback to personal channel
        return {
            name: activeArtist.name,
            avatar: activeArtist.image,
            subscribers: youtubeSubscribers,
        };
    }, [video, activeArtist, youtubeSubscribers]);


    const handleBack = () => {
        dispatch({ type: 'SELECT_VIDEO', payload: null });
        dispatch({ type: 'CHANGE_VIEW', payload: 'youtube' });
    };

    if (!video) {
        return (
            <div className="bg-[#0f0f0f] text-white min-h-screen p-4">
                <p>Video not found.</p>
                <button onClick={handleBack} className="mt-4 text-red-500">Back to YouTube</button>
            </div>
        );
    }

    const likes = Math.floor(video.views * 0.01);
    const timeAgo = (releaseDate: { week: number, year: number }, currentDate: { week: number, year: number }): string => {
        const weeksAgo = (currentDate.year * 52 + currentDate.week) - (releaseDate.year * 52 + releaseDate.week);
    
        if (weeksAgo <= 0) return 'Just now';
        if (weeksAgo === 1) return `1w ago`;
        if (weeksAgo < 4) return `${weeksAgo}w ago`;
    
        if (weeksAgo < 52) {
            const monthsAgo = Math.floor(weeksAgo / 4);
            return `${monthsAgo}mo ago`;
        }
    
        const yearsAgo = Math.floor(weeksAgo / 52);
        if (yearsAgo === 1) return `1 year ago`;
        return `${yearsAgo} years ago`;
    };

    return (
        <div className="bg-[#0f0f0f] text-white min-h-screen">
            <div className="w-full aspect-video bg-black flex items-center justify-center relative">
                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-contain"/>
                 <button onClick={handleBack} className="absolute top-4 left-4 z-20 p-2 bg-black/50 rounded-full">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
            </div>

            <main className="p-3 space-y-4">
                <h1 className="text-xl font-semibold leading-tight">{video.title}</h1>

                <div className="flex items-center gap-4 text-sm text-zinc-400">
                    <span>{formatNumber(video.views)} views</span>
                    <span>{timeAgo(video.releaseDate, date)}</span>
                    <button onClick={() => setIsDescriptionExpanded(true)} className="font-semibold text-white">...more</button>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src={channelData.avatar} alt={channelData.name} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                            <p className="font-semibold">{channelData.name}</p>
                            <p className="text-xs text-zinc-400">{formatNumber(channelData.subscribers)} subscribers</p>
                        </div>
                    </div>
                    <button className="bg-white text-black font-semibold py-2 px-4 rounded-full text-sm hover:bg-zinc-200 transition-colors">Subscribe</button>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                    <div className="flex items-center bg-zinc-800 rounded-full flex-shrink-0">
                        <button className="flex items-center gap-2 p-2 px-4 hover:bg-zinc-700 rounded-l-full">
                            <ThumbUpIcon className="w-5 h-5"/>
                            <span className="text-sm font-semibold">{formatNumber(likes)}</span>
                        </button>
                        <div className="w-px h-6 bg-zinc-600"></div>
                        <button className="p-2 px-4 hover:bg-zinc-700 rounded-r-full">
                            <ThumbDownIcon className="w-5 h-5"/>
                        </button>
                    </div>
                    <ActionButton icon={<ShareIcon className="w-5 h-5"/>} label="Share" />
                    <ActionButton icon={<DownloadIconSimple className="w-5 h-5"/>} label="Download" />
                    <ActionButton icon={<SaveIcon className="w-5 h-5"/>} label="Save" />
                </div>

                <div className="bg-zinc-800 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                        <h2 className="font-bold">Comments <span className="text-zinc-400 font-normal">55K</span></h2>
                        <DotsHorizontalIcon className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                        <img src="https://yt3.ggpht.com/ytc/AIdro_k-3so1DbSCxCHB4enrEu2aZwe7fN0iUTaUKdCa0w=s48-c-k-c0x00ffffff-no-rj" alt="Rosanna Pansino" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        <p className="text-sm">This video feels like no one was allowed to say no to a single idea... and I love it.</p>
                    </div>
                </div>
            </main>

            <div className={`fixed inset-0 bg-black/80 z-40 transition-opacity duration-300 ${isDescriptionExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsDescriptionExpanded(false)}>
                <div 
                    className={`absolute bottom-0 left-0 right-0 bg-[#181818] rounded-t-2xl max-h-[85vh] transition-transform duration-300 ease-in-out ${isDescriptionExpanded ? 'translate-y-0' : 'translate-y-full'}`}
                    onClick={e => e.stopPropagation()}
                >
                    {isDescriptionExpanded && <DescriptionOverlay video={video} onClose={() => setIsDescriptionExpanded(false)} />}
                </div>
            </div>
        </div>
    );
};

export default YouTubeVideoDetailView;
