import React, { useState } from 'react';
import { useGame, formatNumber } from '../context/GameContext';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import SearchIcon from './icons/SearchIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import { Artist, Group } from '../types';

export const RedditSiteView: React.FC<{ initialPost?: any, onClose: () => void }> = ({ initialPost, onClose }) => {
    const { gameState, activeArtistData } = useGame();
    const [currentView, setCurrentView] = useState<'home' | 'post'>('home');
    const [selectedPost, setSelectedPost] = useState<any | null>(initialPost || null);
    const [activeSort, setActiveSort] = useState<'Hot' | 'New' | 'Top'>('Hot');

    const allPlayerArtistsAndGroups: (Artist | Group)[] = gameState.careerMode === 'solo' && gameState.soloArtist ? [gameState.soloArtist] : (gameState.group ? [gameState.group, ...gameState.group.members] : []);
    const artistProfile = allPlayerArtistsAndGroups.find(a => a.id === gameState.activeArtistId);
    
    const subredditName = `r/${artistProfile?.name.replace(/ /g, '') || 'popheads'}`;

    React.useEffect(() => {
        if (initialPost) {
            setSelectedPost(initialPost);
            setCurrentView('post');
        }
    }, [initialPost]);

    const mockPosts = [
        {
            id: 1,
            author: 'stan_account',
            timeAgo: '5 hours ago',
            title: `Discussion: Unpopular Opinions about ${artistProfile?.name}?`,
            content: `I've been thinking a lot about the trajectory of ${artistProfile?.name} lately and wanted to see what the subreddit thinks. Let's discuss...`,
            upvotes: '14.2k',
            commentCount: '3.4k',
            image: null
        },
        {
            id: 2,
            author: 'chart_nerd',
            timeAgo: '2 hours ago',
            title: `[CHART UPDATE] ${artistProfile?.name} just hit a massive new streaming peak!`,
            content: `Just looking at the Spotify numbers and it's insane. The daily streams are up 40% globally. Are we witnessing a new main pop girl/boy era?`,
            upvotes: '8.9k',
            commentCount: '1.2k',
            image: null
        },
        {
            id: 3,
            author: 'paparazzi_watcher',
            timeAgo: '12 hours ago',
            title: `Spotted: ${artistProfile?.name} out in LA last night`,
            content: `Looks like someone is taking a break from the studio!`,
            upvotes: '24k',
            commentCount: '5.6k',
            image: activeArtistData?.artistImages?.[0] || null
        }
    ];

    const actualPosts = activeArtistData?.redditPosts || mockPosts;

    const sortedPosts = [...actualPosts].sort((a: any, b: any) => {
        if (activeSort === 'Hot') return typeof b.id === 'string' ? -1 : b.id - a.id;
        if (activeSort === 'Top') {
            const upa = typeof a.upvotes === 'string' ? parseFloat(a.upvotes) : a.upvotes;
            const upb = typeof b.upvotes === 'string' ? parseFloat(b.upvotes) : b.upvotes;
            return upb - upa;
        }
        return -1; // New
    });

    const mockComments = [
        { author: 'PopLover99', upvotes: '5.2k', text: `Honestly I just hope the next album has the same energy as the early stuff.`, timeAgo: '4h ago' },
        { author: 'ChartMaster', upvotes: '2.1k', text: `If they release on a Friday they'll easily grab the #1 spot, no contest.`, timeAgo: '3h ago', replies: [
            { author: 'MusicNerd', upvotes: '800', text: `Exactly, the competition is weak right now.`, timeAgo: '2h ago' }
        ]},
        { author: 'StanFan123', upvotes: '950', text: `I WILL DEFEND ${artistProfile?.name?.toUpperCase()} WITH MY LIFE.`, timeAgo: '1h ago' }
    ];

    return (
        <div className="bg-[#DAE0E6] text-[#1c1c1c] min-h-screen font-sans relative">
            {/* Header */}
            <header className="bg-white border-b border-gray-300 sticky top-0 z-20 w-full flex items-center px-4 py-2 shadow-sm h-12">
                <button onClick={onClose} className="p-1.5 mr-2 text-gray-500 hover:text-black rounded-full hover:bg-gray-100 transition-colors">
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div className="text-orange-500 mr-4">
                    {/* Reddit Logo Icon */}
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="10" fill="#FF4500"/><path d="M16.67,10A1.46,1.46,0,0,0,14.2,9a7.12,7.12,0,0,0-3.85-1.23L11.1,4.27,13.02,4.7a1.56,1.56,0,1,0,2-1.4,1.59,1.59,0,0,0-1.7,1.05l-2.12-.46a.32.32,0,0,0-.37.24L10,7.71a7.14,7.14,0,0,0-3.9,1.23A1.46,1.46,0,1,0,4.2,11.33a2.87,2.87,0,0,0,0,.44c0,2.24,2.61,4.06,5.83,4.06s5.83-1.82,5.83-4.06a2.87,2.87,0,0,0,0-.44A1.46,1.46,0,0,0,16.67,10Zm-8.15,3.26c-1,0-1.8-.62-1.8-1.38s.8-1.38,1.8-1.38,1.8.62,1.8,1.38S9.52,13.26,8.52,13.26Zm4,0c-1,0-1.8-.62-1.8-1.38s.8-1.38,1.8-1.38,1.8.62,1.8,1.38S13.52,13.26,12.52,13.26Zm1.43,2A5.15,5.15,0,0,1,10,16a5.15,5.15,0,0,1-3.95-.73.28.28,0,0,1,.13-.5.29.29,0,0,1,.15.05A4.54,4.54,0,0,0,10,15.43a4.54,4.54,0,0,0,3.62-.61.29.29,0,0,1,.15-.05A.28.28,0,0,1,14,14.22a.28.28,0,0,1-.05.1Zm-4-3.56a.71.71,0,1,1,.71-.71A.71.71,0,0,1,10,11.71Z" fill="#FFF"/></svg>
                </div>
                <div className="flex-1 max-w-2xl bg-gray-100 rounded-md border border-transparent focus-within:border-blue-500 focus-within:bg-white flex items-center px-3 py-1.5 transition-colors">
                    <SearchIcon className="w-5 h-5 text-gray-400 mr-2" />
                    <input type="text" placeholder={`Search ${subredditName}`} className="bg-transparent outline-none flex-1 text-sm text-gray-900" />
                </div>
            </header>

            {/* Subreddit Banner */}
            <div className="bg-white mb-4">
                <div className="h-20 sm:h-32 bg-blue-500 overflow-hidden relative">
                    {activeArtistData?.artistImages?.[0] && (
                        <img src={activeArtistData.artistImages[0]} className="w-full h-full object-cover opacity-50 blur-sm" alt="Banner" />
                    )}
                </div>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-end gap-4 pb-4 -mt-4 sm:-mt-8 relative z-10">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white bg-orange-600 flex items-center justify-center text-2xl font-bold text-white shadow-sm overflow-hidden">
                        {activeArtistData?.artistImages?.[0] ? (
                            <img src={activeArtistData.artistImages[0]} className="w-full h-full object-cover" />
                        ) : 'r/'}
                    </div>
                    <div className="flex-1 mt-2 sm:mt-0 pb-1">
                        <h1 className="text-2xl font-bold text-gray-900 leading-tight">{subredditName}</h1>
                        <p className="text-sm text-gray-500 font-medium">r/{artistProfile?.name.replace(/ /g, '').toLowerCase()}</p>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-1.5 rounded-full mt-2 sm:mt-0 transition-colors">
                        Join
                    </button>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-0 sm:px-4 py-4 flex gap-6">
                {/* Main Feed/Content */}
                <div className="flex-1 w-full relative">
                    {currentView === 'home' ? (
                        <>
                            {/* Sort Bar */}
                            <div className="bg-white sm:rounded-md border border-gray-300 p-2 mb-4 flex gap-2">
                                {(['Hot', 'New', 'Top'] as const).map(sort => (
                                    <button 
                                        key={sort}
                                        onClick={() => setActiveSort(sort)}
                                        className={`px-3 py-1.5 rounded-full text-sm font-bold flex items-center ${activeSort === sort ? 'bg-gray-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                                    >
                                        {sort}
                                    </button>
                                ))}
                            </div>

                            {/* Posts List */}
                            <div className="space-y-3">
                                {sortedPosts.map(post => (
                                    <div key={post.id} className="bg-white sm:rounded-md border border-gray-300 hover:border-gray-400 cursor-pointer transition-colors flex" onClick={() => { setSelectedPost(post); setCurrentView('post'); }}>
                                        {/* Vote Column */}
                                        <div className="w-10 bg-gray-50 rounded-l-md p-2 hidden sm:flex flex-col items-center gap-1 border-r border-gray-100">
                                            <button className="text-gray-400 hover:text-orange-500 font-bold">▲</button>
                                            <span className="text-xs font-bold text-gray-900">{typeof post.upvotes === 'number' ? formatNumber(post.upvotes) : post.upvotes}</span>
                                            <button className="text-gray-400 hover:text-blue-500 font-bold">▼</button>
                                        </div>
                                        {/* Content Column */}
                                        <div className="p-2 sm:p-3 flex-1 overflow-hidden">
                                            <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                                <span className="font-bold text-gray-900 hover:underline">u/{post.author}</span>
                                                <span>•</span>
                                                <span>{post.timeAgo}</span>
                                            </div>
                                            <h2 className="text-lg font-medium text-gray-900 mb-2 leading-snug">{post.title}</h2>
                                            <p className="text-sm text-gray-800 line-clamp-3 mb-2">{post.content}</p>
                                            {post.image && (
                                                <div className="max-h-96 overflow-hidden rounded-md border border-gray-200 mt-2 mb-2 bg-black flex items-center justify-center">
                                                    <img src={post.image} className="max-w-full max-h-96 object-contain" alt="Post thumbnail" />
                                                </div>
                                            )}
                                            
                                            {/* Action bar */}
                                            <div className="flex items-center gap-1 text-xs font-bold text-gray-500 mt-2">
                                                <div className="flex items-center gap-1 hover:bg-gray-100 p-1.5 rounded text-gray-800 sm:hidden">
                                                    ▲ {typeof post.upvotes === 'number' ? formatNumber(post.upvotes) : post.upvotes} ▼
                                                </div>
                                                <div className="flex items-center gap-2 hover:bg-gray-100 p-1.5 rounded cursor-pointer">
                                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M10 15l-4 4v-4H2a2 2 0 01-2-2V3c0-1.1.9-2 2-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-8z"/></svg> 
                                                    {typeof post.commentCount === 'number' ? formatNumber(post.commentCount) : post.commentCount} Comments
                                                </div>
                                                <div className="flex items-center gap-2 hover:bg-gray-100 p-1.5 rounded cursor-pointer">Share</div>
                                                <div className="flex items-center gap-2 hover:bg-gray-100 p-1.5 rounded cursor-pointer">Save</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="bg-white sm:rounded-md border border-gray-300 flex flex-col relative pb-8">
                            <button onClick={() => setCurrentView('home')} className="absolute -top-12 left-0 text-white font-bold flex items-center gap-1 bg-black/50 px-3 py-1 rounded-full text-sm hover:bg-black/70 z-30">
                                <ArrowLeftIcon className="w-4 h-4" /> Close
                            </button>
                            <div className="flex">
                                {/* Vote Column */}
                                <div className="w-10 sm:w-12 bg-white rounded-tl-md p-2 flex flex-col items-center gap-1 border-r border-gray-100 mt-2">
                                    <button className="text-gray-400 hover:text-orange-500 font-bold text-xl">▲</button>
                                    <span className="text-sm font-bold text-gray-900">{selectedPost.upvotes ? (typeof selectedPost.upvotes === 'number' ? formatNumber(selectedPost.upvotes) : selectedPost.upvotes) : '14.2k'}</span>
                                    <button className="text-gray-400 hover:text-blue-500 font-bold text-xl">▼</button>
                                </div>
                                
                                {/* Post Content */}
                                <div className="p-3 sm:p-4 flex-1">
                                    <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                        <div className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center text-[10px] text-white font-bold mr-1">r/</div>
                                        <span className="font-bold text-black hover:underline">{subredditName}</span>
                                        <span>•</span>
                                        <span>Posted by u/{selectedPost.author || 'stan_account'}</span>
                                        <span>{selectedPost.timeAgo || '5 hours ago'}</span>
                                    </div>
                                    <h1 className="text-xl sm:text-2xl font-medium text-gray-900 mb-4 leading-tight">{selectedPost.title}</h1>
                                    <div className="text-sm leading-relaxed text-gray-800 space-y-4 mb-6 whitespace-pre-wrap">
                                        {selectedPost.content}
                                    </div>
                                    
                                    {selectedPost.image && (
                                        <div className="max-h-[600px] overflow-auto rounded-md border border-gray-200 mt-2 mb-6 bg-black flex items-center justify-center">
                                            <img src={selectedPost.image} className="max-w-full object-contain" alt="Post" />
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 border-b border-gray-200 pb-4 mb-4">
                                        <div className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded cursor-pointer">
                                            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M10 15l-4 4v-4H2a2 2 0 01-2-2V3c0-1.1.9-2 2-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-8z"/></svg> 
                                            {selectedPost.commentCount ? (typeof selectedPost.commentCount === 'number' ? formatNumber(selectedPost.commentCount) : selectedPost.commentCount) : '3.4k'} Comments
                                        </div>
                                        <div className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded cursor-pointer">Share</div>
                                        <div className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded cursor-pointer">Save</div>
                                    </div>

                                    {/* Sort Comments */}
                                    <div className="mb-6 flex items-center gap-2 text-sm text-gray-500 font-bold px-2">
                                        Sort by: 
                                        <span className="text-blue-600 flex items-center cursor-pointer uppercase">Beat <ChevronDownIcon className="w-4 h-4 ml-1" /></span>
                                    </div>

                                    {/* Comments Section */}
                                    <div className="space-y-4 px-2">
                                        {(selectedPost.comments || mockComments).map((comment: any, i: number) => (
                                            <div key={i} className="flex gap-2">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 object-cover flex-shrink-0" />
                                                    <div className="w-0.5 h-full bg-gray-200 mt-2 hover:bg-blue-500 transition-colors cursor-pointer"></div>
                                                </div>
                                                <div className="flex-1 pb-4">
                                                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-2">
                                                        <span className="font-bold text-gray-900">{comment.author}</span>
                                                        <span>•</span>
                                                        <span>{comment.timeAgo}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-800 mb-2">{comment.text}</p>
                                                    <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                                                        <div className="flex items-center gap-1"><button className="hover:text-orange-500">▲</button> {formatNumber(comment.upvotes)} <button className="hover:text-blue-500">▼</button></div>
                                                        <div className="flex items-center gap-1 hover:bg-gray-100 p-1 rounded cursor-pointer"><svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M10 15l-4 4v-4H2a2 2 0 01-2-2V3c0-1.1.9-2 2-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-8z"/></svg> Reply</div>
                                                        <div className="hover:bg-gray-100 p-1 rounded cursor-pointer">Share</div>
                                                        <div className="hover:bg-gray-100 p-1 rounded cursor-pointer">Report</div>
                                                    </div>
                                                    
                                                    {/* Nested replies */}
                                                    {comment.replies && comment.replies.map((reply: any, j: number) => (
                                                        <div key={j} className="flex gap-2 mt-4 -ml-4 pl-4">
                                                            <div className="flex flex-col items-center">
                                                                <div className="w-8 h-8 rounded-full bg-gray-200 object-cover flex-shrink-0" />
                                                                <div className="w-0.5 h-full bg-gray-200 mt-2 hover:bg-blue-500 transition-colors cursor-pointer"></div>
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="text-xs text-gray-500 mb-1 flex items-center gap-2">
                                                                    <span className="font-bold text-blue-600">{reply.author}</span>
                                                                    <span className="text-[10px] bg-blue-100 text-blue-800 px-1 rounded font-bold">OP</span>
                                                                    <span>•</span>
                                                                    <span>{reply.timeAgo}</span>
                                                                </div>
                                                                <p className="text-sm text-gray-800 mb-2">{reply.text}</p>
                                                                <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                                                                    <div className="flex items-center gap-1"><button className="hover:text-orange-500">▲</button> {formatNumber(reply.upvotes)} <button className="hover:text-blue-500">▼</button></div>
                                                                    <div className="flex items-center gap-1 hover:bg-gray-100 p-1 rounded cursor-pointer"><svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M10 15l-4 4v-4H2a2 2 0 01-2-2V3c0-1.1.9-2 2-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-8z"/></svg> Reply</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="w-80 hidden lg:block flex-shrink-0 space-y-4">
                    <div className="bg-white border border-gray-300 rounded-md p-3">
                        <h2 className="font-bold text-gray-900 text-sm mb-2">About Community</h2>
                        <p className="text-sm text-gray-700 mb-4 pb-4 border-b border-gray-200">
                            The official subreddit to discuss everything about {artistProfile?.name}, their music, tours, charting, and pop culture impact.
                        </p>
                        <div className="flex gap-4 mb-4">
                            <div>
                                <div className="font-bold text-gray-900">1.2m</div>
                                <div className="text-xs text-gray-500 font-medium">Members</div>
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 flex items-center before:content-[''] before:w-2 before:h-2 before:bg-green-500 before:rounded-full before:mr-1">8.5k</div>
                                <div className="text-xs text-gray-500 font-medium">Online</div>
                            </div>
                        </div>
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 rounded-full mb-3 transition-colors">
                            Create Post
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RedditSiteView;
