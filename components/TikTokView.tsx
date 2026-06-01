import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useGame, formatNumber } from '../context/GameContext';
import PlusIcon from './icons/PlusIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import HeartIcon from './icons/HeartIcon';
import CommentIcon from './icons/CommentIcon';
import ShareIcon from './icons/ShareIcon';
import MusicNoteIcon from './icons/MusicNoteIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import PlayIcon from './icons/PlayIcon';
import UserIcon from './icons/UserIcon';
import HomeIcon from './icons/HomeIcon';
import TikTokIcon from './icons/TikTokIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import VideoIcon from './icons/VideoIcon';
import { TikTokVideo } from '../types';

const TikTokFeedVideo: React.FC<{ video: TikTokVideo & { username: string, userAvatar: string, songName?: string, isVerified?: boolean } }> = ({ video }) => {
    return (
        <div className="relative w-full h-full min-h-full bg-black snap-start flex-shrink-0 flex flex-col justify-end text-white pb-20 px-4">
            {/* Background "video" placeholder */}
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 to-zinc-900 opacity-50 z-0 flex items-center justify-center overflow-hidden">
                <img src={video.thumbnail || video.userAvatar} className={`w-full h-full object-cover ${!video.thumbnail ? 'blur-sm opacity-30' : 'opacity-80'}`} />
            </div>

            {/* Right side actions */}
            <div className="absolute right-4 bottom-28 z-10 flex flex-col items-center gap-6">
                <div className="relative">
                    <img src={video.userAvatar} className="w-12 h-12 rounded-full border-2 border-white object-cover" />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center">
                        <PlusIcon className="w-3 h-3 text-white" />
                    </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <button className="bg-zinc-800/50 p-2.5 rounded-full"><HeartIcon className="w-7 h-7 text-white" /></button>
                    <span className="text-xs font-semibold">{formatNumber(video.likes)}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <button className="bg-zinc-800/50 p-2.5 rounded-full"><CommentIcon className="w-7 h-7 text-white" /></button>
                    <span className="text-xs font-semibold">{formatNumber(video.comments)}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <button className="bg-zinc-800/50 p-2.5 rounded-full"><ShareIcon className="w-7 h-7 text-white" /></button>
                    <span className="text-xs font-semibold">Share</span>
                </div>
                <div className="mt-4 rounded-full border-8 border-zinc-800 animate-spin" style={{ animationDuration: '3s' }}>
                    <img src={video.userAvatar} className="w-6 h-6 rounded-full" />
                </div>
            </div>

            {/* Bottom info */}
            <div className="relative z-10 pr-20 pb-4">
                <div className="flex items-center gap-1 mb-1">
                    <p className="font-bold text-base">@{video.username}</p>
                    {video.isVerified && <CheckCircleIcon className="w-4 h-4 text-[#20D5EC]" />}
                </div>
                <p className="text-sm mb-3">
                    {video.content}
                </p>
                <div className="flex items-center gap-2 mb-2">
                    <MusicNoteIcon className="w-4 h-4" />
                    <div className="w-48 overflow-hidden whitespace-nowrap">
                        <div className="inline-block animate-[marquee_10s_linear_infinite]">
                            {video.songName || "Original Sound - " + video.username}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TikTokView: React.FC = () => {
    const { activeArtist, activeArtistData, dispatch, gameState } = useGame();
    const [currentTab, setCurrentTab] = useState<'foryou' | 'profile' | 'create' | 'charts'>('profile');
    const [profileTab, setProfileTab] = useState<'videos' | 'sounds' | 'liked'>('videos');
    const [chartsTab, setChartsTab] = useState<'top50' | 'viral50'>('top50');
    const [createContent, setCreateContent] = useState('');
    const [createSongId, setCreateSongId] = useState<string>('');
    const [createThumbnail, setCreateThumbnail] = useState<string>('');

    const containerRef = useRef<HTMLDivElement>(null);

    const releasedSongs = useMemo(() => {
        if (!activeArtistData) return [];
        return activeArtistData.songs.filter(s => s.isReleased).sort((a,b) => b.streams! - a.streams!);
    }, [activeArtistData]);

    const handleCreateTikTok = () => {
        if (!createContent.trim()) return;
        dispatch({ type: 'CREATE_TIKTOK', payload: { content: createContent, songId: createSongId || undefined, thumbnail: createThumbnail || undefined } });
        setCreateContent('');
        setCreateSongId('');
        setCreateThumbnail('');
        setCurrentTab('profile');
    };

    const [selectedVideo, setSelectedVideo] = useState<TikTokVideo | null>(null);

    const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCreateThumbnail(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    if (!activeArtist || !activeArtistData) return null;

    const myVideos = activeArtistData.tiktokVideos || [];

    const videosBySongMap = useMemo(() => {
        const map = new Map<string, any[]>();
        myVideos.forEach(v => {
            if (v.songId) {
                if (!map.has(v.songId)) map.set(v.songId, []);
                map.get(v.songId)!.push(v);
            }
        });
        map.forEach((videos, key) => {
            map.set(key, videos.sort((a,b) => b.likes - a.likes));
        });
        return map;
    }, [myVideos]);

    const top50 = useMemo(() => {
        return (gameState.spotifyGlobal || []).slice(0, 50).map((entry, index) => ({
            ...entry,
            rank: index + 1,
            tiktokVideos: videosBySongMap.get(entry.uniqueId) || [],
            isNew: entry.lastWeek === null
        }));
    }, [gameState.spotifyGlobal, videosBySongMap]);

    const viral50 = useMemo(() => {
        if (!gameState.spotifyGlobal) return [];
        let entries = (gameState.spotifyGlobal || []).map(entry => {
            const videos = videosBySongMap.get(entry.uniqueId) || [];
            const likes = videos.reduce((sum, v) => sum + v.likes, 0);
            return {
                ...entry,
                tiktokVideos: videos,
                score: likes > 0 ? likes * 100 : (entry.lastWeek === null ? 50000 : Math.random() * 20000),
                isNew: entry.lastWeek === null || likes > 0
            };
        });
        
        activeArtistData.songs.forEach(song => {
            if (videosBySongMap.has(song.id)) {
                const hasEntry = entries.find(e => e.uniqueId === song.id);
                if (!hasEntry) {
                    const videos = videosBySongMap.get(song.id)!;
                    const likes = videos.reduce((sum, v) => sum + v.likes, 0);
                    entries.push({
                        uniqueId: song.id,
                        title: song.title,
                        artist: activeArtist.name,
                        coverArt: song.coverArt || activeArtist.image,
                        rank: 0,
                        isPlayerSong: true,
                        tiktokVideos: videos,
                        score: likes * 100,
                        isNew: true,
                        lastWeek: null,
                        weeksOnChart: 1,
                        peak: 1,
                        weeklyStreams: 0
                    });
                }
            }
        });
        
        return entries.sort((a,b) => b.score - a.score).slice(0, 50).map((e, index) => ({...e, rank: index + 1}));
    }, [gameState.spotifyGlobal, activeArtistData.songs, videosBySongMap, activeArtist.name, activeArtist.image]);

    if (selectedVideo) {
        return (
            <div className="h-full w-full bg-black relative max-w-[400px] mx-auto overflow-hidden">
                <button 
                    onClick={() => setSelectedVideo(null)} 
                    className="absolute top-4 left-4 z-50 text-white drop-shadow-md bg-black/30 p-2 rounded-full"
                >
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <TikTokFeedVideo video={{
                    ...selectedVideo,
                    username: activeArtist.name.replace(/\s/g, '').toLowerCase(),
                    userAvatar: activeArtist.image,
                    isVerified: (activeArtistData.tiktokFollowers || 0) >= 100000,
                    songName: selectedVideo.songId ? activeArtistData.songs.find(s => s.id === selectedVideo.songId)?.title : undefined
                }} />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-black text-white relative font-sans max-w-[400px] mx-auto overflow-hidden">
            {/* Top Bar for Profile/Create Tabs */}
            {currentTab !== 'foryou' && currentTab !== 'charts' && (
               <div className="absolute top-0 w-full z-20 flex justify-between items-center px-4 py-4 bg-black">
                   <button onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: 'game' })} className="text-white flex items-center">
                       <ArrowLeftIcon className="w-6 h-6 mr-1" />
                   </button>
                   <h1 className="text-lg font-bold">
                        {currentTab === 'profile' ? activeArtist.name : 'Create Video'}
                   </h1>
                   <button onClick={() => setCurrentTab('charts')} className="text-white">
                        <ChartBarIcon className="w-6 h-6" />
                   </button>
               </div>
            )}

            {currentTab === 'foryou' && (
                <div className="absolute top-0 w-full z-20 flex justify-center items-center py-4 text-gray-300 font-semibold gap-4">
                    <span>Following</span>
                    <span className="text-white border-b-2 border-white pb-1">For You</span>
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 flex flex-col overflow-y-scroll snap-y snap-mandatory hide-scrollbar relative">
                {currentTab === 'foryou' && (
                   <div className="h-full w-full bg-black flex flex-col items-center justify-center text-center px-8 relative">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 pointer-events-none"></div>
                        <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6 border border-zinc-800 shadow-xl relative mt-[-40px]">
                            <TikTokIcon className="w-8 h-8 text-[#25F4EE] absolute -translate-x-[2px] opacity-70" />
                            <TikTokIcon className="w-8 h-8 text-[#FE2C55] absolute translate-x-[2px] opacity-70" />
                            <TikTokIcon className="w-8 h-8 text-white relative z-10" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">For You Page</h2>
                        <h3 className="text-[#25F4EE] font-bold text-lg mb-4">Coming Soon</h3>
                        <p className="text-zinc-400 text-sm max-w-[250px] leading-relaxed">
                            We're teaching our algorithm how to show you the perfect videos. Check back later!
                        </p>
                   </div>
                )}

                {currentTab === 'create' && (
                    <div className="pt-20 px-6 pb-24 w-full h-full flex-shrink-0 bg-zinc-900 overflow-y-auto">
                        <textarea 
                            value={createContent}
                            onChange={(e) => setCreateContent(e.target.value)}
                            placeholder="Caption your TikTok..."
                            className="w-full h-32 bg-zinc-800 rounded-xl p-4 text-white resize-none outline-none focus:ring-1 focus:ring-[#25F4EE] mb-6"
                        />
                        
                        <div className="mb-6">
                            <label className="block text-sm font-semibold mb-2">Add Sound (Optional)</label>
                            <select 
                                value={createSongId} 
                                onChange={e => setCreateSongId(e.target.value)}
                                className="w-full bg-zinc-800 p-4 rounded-xl text-white outline-none focus:ring-1 focus:ring-[#25F4EE] appearance-none"
                            >
                                <option value="">Original Sound</option>
                                {releasedSongs.map(s => (
                                    <option key={s.id} value={s.id}>{s.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold mb-2">Thumbnail Upload (Optional) 9:16</label>
                            <label className="w-full flex-col flex items-center justify-center p-6 border-2 border-dashed border-zinc-700 bg-zinc-800 rounded-xl cursor-pointer hover:border-[#25F4EE] hover:bg-zinc-800/80 transition-all cursor-pointer">
                                <span className="text-zinc-400 text-sm mb-2">{createThumbnail ? 'Change Thumbnail' : 'Click to Upload Thumbnail'}</span>
                                <input 
                                    type="file"
                                    accept="image/*"
                                    onChange={handleThumbnailUpload}
                                    className="hidden"
                                />
                            </label>
                            {createThumbnail && (
                                <img src={createThumbnail} className="mt-4 w-32 aspect-[9/16] object-cover rounded-lg border border-zinc-700" alt="Thumbnail Preview" />
                            )}
                        </div>
                        
                        <button 
                            onClick={handleCreateTikTok}
                            disabled={!createContent.trim()}
                            className="w-full bg-[#FE2C55] disabled:bg-zinc-700 disabled:text-zinc-400 font-bold py-4 rounded-xl hover:bg-[#E0264B] transition-colors"
                        >
                            Post Video
                        </button>
                    </div>
                )}

                {currentTab === 'profile' && (
                    <div className="pt-16 pb-20 overflow-y-auto w-full h-full flex-shrink-0 text-center">
                        <div className="mt-4">
                             <img src={activeArtist.image} className="w-24 h-24 mx-auto rounded-full object-cover border-2 border-black" />
                             <div className="mt-3 flex items-center justify-center gap-1">
                                 <p className="font-bold text-xl">@{activeArtist.name.replace(/\s/g, '').toLowerCase()}</p>
                                 {(activeArtistData.tiktokFollowers || 0) >= 100000 && (
                                     <CheckCircleIcon className="w-5 h-5 text-[#20D5EC]" />
                                 )}
                             </div>
                             
                             <div className="flex justify-center gap-6 mt-4">
                                 <div className="flex flex-col items-center">
                                     <span className="font-bold text-lg">0</span>
                                     <span className="text-xs text-zinc-400">Following</span>
                                 </div>
                                 <div className="flex flex-col items-center">
                                     <span className="font-bold text-lg">{formatNumber(activeArtistData.tiktokFollowers || 0)}</span>
                                     <span className="text-xs text-zinc-400">Followers</span>
                                 </div>
                                 <div className="flex flex-col items-center">
                                     <span className="font-bold text-lg">{formatNumber(myVideos.reduce((sum, v) => sum + v.likes, 0))}</span>
                                     <span className="text-xs text-zinc-400">Likes</span>
                                 </div>
                             </div>

                             <div className="mt-6 flex justify-center gap-2 px-8">
                                 <button className="flex-1 bg-zinc-800 py-2.5 rounded text-sm font-semibold hover:bg-zinc-700">Edit profile</button>
                                 <button className="bg-zinc-800 px-3 rounded flex items-center justify-center hover:bg-zinc-700"><ShareIcon className="w-5 h-5"/></button>
                             </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-zinc-800 mt-6 text-sm font-semibold relative text-zinc-500">
                            <button onClick={() => setProfileTab('videos')} className={`flex-1 py-3 flex justify-center border-b-2 ${profileTab === 'videos' ? 'border-white text-white' : 'border-transparent hover:text-gray-300'}`}>
                                <svg width="24" height="24" viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M16 6H8C6.89543 6 6 6.89543 6 8V16C6 17.1046 6.89543 18 8 18H16C17.1046 18 18 17.1046 18 16V8C18 6.89543 17.1046 6 16 6Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/><path d="M16 30H8C6.89543 30 6 30.8954 6 32V40C6 41.1046 6.89543 42 8 42H16C17.1046 42 18 41.1046 18 40V32C18 30.8954 17.1046 30 16 30Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/><path d="M40 30H32C30.8954 30 30 30.8954 30 32V40C30 41.1046 30.8954 42 32 42H40C41.1046 42 42 41.1046 42 40V32C42 30.8954 41.1046 30 40 30Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/><path d="M40 6H32C30.8954 6 30 6.89543 30 8V16C30 17.1046 30.8954 18 32 18H40C41.1046 18 42 17.1046 42 16V8C42 6.89543 41.1046 6 40 6Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/></svg>
                            </button>
                            <button onClick={() => setProfileTab('sounds')} className={`flex-1 py-3 flex justify-center border-b-2 ${profileTab === 'sounds' ? 'border-white text-white' : 'border-transparent hover:text-gray-300'}`}>
                                <MusicNoteIcon className="w-6 h-6" />
                            </button>
                            <button onClick={() => setProfileTab('liked')} className={`flex-1 py-3 flex justify-center border-b-2 ${profileTab === 'liked' ? 'border-white text-white' : 'border-transparent hover:text-gray-300'}`}>
                                <HeartIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {profileTab === 'videos' && (
                            <>
                                <div className="grid grid-cols-3 gap-0.5">
                                    {myVideos.map(video => (
                                        <div key={video.id} className="aspect-[3/4] bg-zinc-900 relative cursor-pointer group" onClick={() => setSelectedVideo(video)}>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 flex items-end p-1">
                                                <div className="flex items-center text-xs font-semibold gap-1">
                                                    <PlayIcon className="w-3 h-3"/>
                                                    <span>{formatNumber(video.views)}</span>
                                                </div>
                                            </div>
                                            <div className="w-full h-full bg-cover bg-center opacity-70 group-hover:opacity-90 transition-opacity" style={{ backgroundImage: `url(${video.thumbnail || activeArtist.image})` }}></div>
                                        </div>
                                    ))}
                                </div>
                                {myVideos.length === 0 && (
                                    <div className="mt-20 flex flex-col items-center text-center px-8">
                                        <p className="font-bold text-lg mb-1">No videos yet</p>
                                        <p className="text-zinc-500 text-sm">Post a video to get started</p>
                                    </div>
                                )}
                            </>
                        )}

                        {profileTab === 'sounds' && (
                            <div className="flex flex-col gap-4 p-4 text-left">
                                {releasedSongs.map(song => (
                                    <div key={song.id} className="flex items-center gap-3 bg-zinc-900 p-3 rounded-lg border border-zinc-800 hover:bg-zinc-800 transition-colors">
                                        <div className="w-12 h-12 bg-zinc-800 rounded flex items-center justify-center shrink-0 border border-zinc-700 aspect-square overflow-hidden">
                                            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${activeArtistData.releases.find(r => r.id === song.releaseId)?.coverArt || activeArtist.image})` }}></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm truncate text-white">{song.title}</p>
                                            <p className="text-xs text-zinc-400 mt-1">{formatNumber(Math.max(1, Math.floor((song.streams || 0) * 0.005)))} videos</p>
                                        </div>
                                    </div>
                                ))}
                                {releasedSongs.length === 0 && (
                                    <div className="mt-12 flex flex-col items-center text-center px-8 text-zinc-500">
                                        <MusicNoteIcon className="w-12 h-12 mb-2 opacity-50" />
                                        <p className="font-bold text-lg mb-1">No sounds yet</p>
                                        <p className="text-sm">Release songs to see them here</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {profileTab === 'liked' && (
                            <div className="mt-20 flex flex-col items-center text-center px-8 text-zinc-500">
                                <HeartIcon className="w-12 h-12 mb-2 opacity-50" />
                                <p className="font-bold text-lg mb-1">Only you can see which videos you liked</p>
                            </div>
                        )}
                    </div>
                )}

                {currentTab === 'charts' && (
                    <div className="w-full h-full bg-white text-black overflow-y-auto flex-shrink-0">
                        {/* Header */}
                        <div className="flex flex-col px-4 pt-10 pb-2 relative overflow-hidden">
                            <button onClick={() => setCurrentTab('profile')} className="mb-6 relative z-10 w-fit"><ArrowLeftIcon className="w-7 h-7 text-black drop-shadow-md" /></button>
                            <div className="flex relative z-10 w-full mb-2">
                                <div>
                                    <h1 className="text-5xl font-black leading-none tracking-tight flex flex-col items-start gap-1">
                                        <div className="flex items-center text-lg gap-1 border-b-2 border-black pb-1 mb-1 font-sans font-bold">
                                            <TikTokIcon className="w-5 h-5 text-black"/> TikTok
                                        </div>
                                        <span>Music</span>
                                        <span>Charts</span>
                                    </h1>
                                </div>
                                <div className="absolute right-[-10px] top-[-30px] w-40 h-40 opacity-90">
                                    <img src={activeArtist.image} className="w-full h-full object-cover" style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }} />
                                </div>
                            </div>
                        </div>
                        
                        {/* Tabs */}
                        <div className="flex px-4 border-b border-zinc-200 text-lg font-bold gap-6 mt-2 relative">
                            <button onClick={() => setChartsTab('top50')} className={`pb-2 transition-colors ${chartsTab === 'top50' ? 'border-b-2 border-black text-black' : 'text-zinc-400 hover:text-zinc-600'}`}>Top 50</button>
                            <button onClick={() => setChartsTab('viral50')} className={`pb-2 transition-colors ${chartsTab === 'viral50' ? 'border-b-2 border-black text-black' : 'text-zinc-400 hover:text-zinc-600'}`}>Viral 50</button>
                            <div className="ml-auto text-sm text-zinc-600 font-semibold flex items-center justify-center bg-zinc-100 rounded-full h-8 px-4 cursor-pointer mt-0 mb-2 border border-zinc-200">
                                US <ChevronDownIcon className="w-4 h-4 ml-1 opacity-70" />
                            </div>
                        </div>
                        
                        {/* List */}
                        <div className="pb-24">
                            {(chartsTab === 'top50' ? top50 : viral50).map(entry => (
                                <div key={entry.uniqueId} className="py-4 border-b border-zinc-100 px-4">
                                    <div className="flex items-center">
                                        <div className="w-8 flex flex-col items-center mr-2 relative z-10">
                                            <span className="font-bold text-lg leading-tight">{entry.rank}</span>
                                            {entry.isNew ? (
                                                <span className="text-[#25F4EE] text-3xl leading-[0] mt-[-10px] drop-shadow-sm">.</span>
                                            ) : (
                                                <span className="text-zinc-300 text-3xl leading-[0] mt-[-10px]">-</span>
                                            )}
                                        </div>
                                        <img src={entry.coverArt} className="w-14 h-14 rounded-lg object-cover mr-3 bg-zinc-100 shadow-sm" />
                                        <div className="flex-1 min-w-0 pr-2 pb-1">
                                            <p className="font-bold truncate text-[17px] leading-tight text-black">{entry.title}</p>
                                            <div className="flex items-center gap-2 text-sm mt-0.5">
                                                <span className="truncate text-zinc-500 font-medium">{entry.artist}</span>
                                                {entry.isNew && <span className="text-[#FE2C55] font-bold text-[11px] tracking-wider uppercase ml-1">New</span>}
                                            </div>
                                        </div>
                                        <button className="bg-[#FE2C55] p-2.5 rounded-xl flex-shrink-0 ml-1 shadow-md shadow-red-500/20 hover:bg-[#E0264B] transition-colors relative">
                                            <VideoIcon className="w-6 h-6 text-white" />
                                        </button>
                                    </div>
                                    
                                    {entry.tiktokVideos && entry.tiktokVideos.length > 0 && (
                                        <div className="mt-4 flex gap-2 overflow-hidden w-full pl-12 pr-2">
                                            {entry.tiktokVideos.slice(0, 2).map((v: any, idx: number) => (
                                                <div key={idx} className="relative flex-1 aspect-[9/16] bg-zinc-900 rounded-xl overflow-hidden group shadow-md cursor-pointer" onClick={() => setSelectedVideo(v)}>
                                                    <img src={v.thumbnail || activeArtist.image} className="w-full h-full object-cover opacity-90 transition-transform group-hover:scale-105 duration-300" />
                                                    <div className="absolute bottom-2 left-2 flex items-center text-xs font-bold text-white drop-shadow-md z-10">
                                                        <HeartIcon className="w-4 h-4 mr-1 text-white opacity-90 drop-shadow-sm" />
                                                        {formatNumber(v.likes)}
                                                    </div>
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-90 pointer-events-none"></div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {chartsTab === 'top50' && top50.length === 0 && (
                                <div className="p-8 text-center text-zinc-500 font-semibold mt-10">Chart calculating...</div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Nav */}
            <div className="absolute bottom-0 w-full bg-black border-t border-zinc-800 z-30 px-2 py-2 flex justify-between items-center text-xs font-semibold text-zinc-400">
                <button onClick={() => setCurrentTab('foryou')} className={`flex flex-col items-center flex-1 ${currentTab === 'foryou' ? 'text-white' : ''}`}>
                    <HomeIcon className="w-6 h-6 mb-1"/>
                    Home
                </button>
                <div className="flex-1"></div>
                <button onClick={() => setCurrentTab('create')} className="flex flex-col items-center flex-shrink-0 relative top-[-10px]">
                    <div className="bg-[#25F4EE] w-[46px] h-[30px] rounded-lg absolute -left-1"></div>
                    <div className="bg-[#FE2C55] w-[46px] h-[30px] rounded-lg absolute -right-1"></div>
                    <div className="bg-white w-[46px] h-[30px] rounded-lg relative z-10 flex items-center justify-center text-black">
                        <PlusIcon className="w-5 h-5"/>
                    </div>
                </button>
                <div className="flex-1"></div>
                <button onClick={() => setCurrentTab('profile')} className={`flex flex-col items-center flex-1 ${currentTab === 'profile' ? 'text-white' : ''}`}>
                    <UserIcon className="w-6 h-6 mb-1"/>
                    Profile
                </button>
            </div>
            
             <style dangerouslySetInnerHTML={{__html: `
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}} />
        </div>
    );
};

export default TikTokView;
