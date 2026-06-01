import React, { useState, useMemo } from 'react';
import { useGame, formatNumber } from '../context/GameContext';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import PlusIcon from './icons/PlusIcon';
import UserIcon from './icons/UserIcon';
import HeartIcon from './icons/HeartIcon';
import CommentIcon from './icons/CommentIcon';
import HomeIcon from './icons/HomeIcon';
import { InstagramPost } from '../types';

const InstagramFeedPost: React.FC<{ post: InstagramPost, username: string, userAvatar: string }> = ({ post, username, userAvatar }) => {
    return (
        <div className="w-full bg-black text-white mb-6">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                    <img src={userAvatar} className="w-8 h-8 rounded-full object-cover border border-zinc-800" />
                    <span className="font-semibold text-[13px]">{username}</span>
                </div>
                <div className="flex gap-1">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                </div>
            </div>

            {/* Image */}
            <div className="w-full aspect-square bg-zinc-900 border-y border-zinc-900 overflow-hidden">
                <img src={post.imageUrl} className="w-full h-full object-cover" />
            </div>

            {/* Actions */}
            <div className="px-3 pt-3 pb-1 flex justify-between">
                <div className="flex gap-4 items-center">
                    <HeartIcon className="w-6 h-6 hover:text-zinc-400 cursor-pointer text-white" />
                    <CommentIcon className="w-6 h-6 hover:text-zinc-400 cursor-pointer text-white" />
                    <svg aria-label="Share Post" fill="currentColor" height="24" viewBox="0 0 24 24" width="24" className="hover:text-zinc-400 cursor-pointer"><line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" x1="22" x2="9.218" y1="3" y2="10.083"></line><polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></polygon></svg>
                </div>
                <svg aria-label="Save" fill="currentColor" height="24" viewBox="0 0 24 24" width="24" className="hover:text-zinc-400 cursor-pointer"><polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon></svg>
            </div>

            {/* Likes */}
            <div className="px-3 pb-1">
                <span className="font-semibold text-[13px]">{formatNumber(post.likes)} likes</span>
            </div>

            {/* Caption */}
            <div className="px-3 pb-2 text-[13px]">
                <span className="font-semibold mr-2">{username}</span>
                <span>{post.caption}</span>
            </div>

            {/* Comments */}
            <div className="px-3 pb-2 text-[13px] text-zinc-400">
                View all {formatNumber(post.comments)} comments
            </div>
        </div>
    );
};

const InstagramView: React.FC = () => {
    const { activeArtist, activeArtistData, dispatch } = useGame();
    const [currentTab, setCurrentTab] = useState<'home' | 'profile' | 'create'>('profile');
    
    // Create state
    const [createCaption, setCreateCaption] = useState('');
    const [createImageUrl, setCreateImageUrl] = useState('');

    const handleCreatePost = () => {
        if (!createImageUrl.trim()) return;
        dispatch({ type: 'CREATE_INSTAGRAM_POST', payload: { caption: createCaption, imageUrl: createImageUrl } });
        setCreateCaption('');
        setCreateImageUrl('');
        setCurrentTab('profile');
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCreateImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    if (!activeArtist || !activeArtistData) return null;

    const myPosts = activeArtistData.instagramPosts || [];
    const username = activeArtist.name.replace(/\s/g, '').toLowerCase();

    return (
        <div className="h-full flex flex-col bg-black text-white relative font-sans max-w-[400px] border-x border-zinc-900 mx-auto overflow-hidden">
            {/* Top Bar for Profile/Create Tabs */}
            <div className="flex-shrink-0 flex justify-between items-center px-4 h-12 bg-black border-b border-zinc-900">
                <button onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: 'game' })} className="text-white hover:text-zinc-300 transition-colors">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <div className="font-semibold text-base flex items-center gap-1">
                    {currentTab === 'profile' && <span>{username}</span>}
                    {currentTab === 'create' && <span>New post</span>}
                    {currentTab === 'home' && <span className="font-serif italic font-bold text-xl tracking-tight">Instagram</span>}
                </div>
                <div className="w-6 h-6"></div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar bg-black">
                {currentTab === 'home' && (
                    <div className="w-full flex-col flex">
                        {myPosts.length > 0 ? (
                            myPosts.slice(0, 5).map(post => (
                                <InstagramFeedPost key={post.id} post={post} username={username} userAvatar={activeArtist.image} />
                            ))
                        ) : (
                            <div className="flex-1 flex items-center justify-center pt-24 text-zinc-500">
                                <p>No posts to show.</p>
                            </div>
                        )}
                    </div>
                )}

                {currentTab === 'create' && (
                    <div className="p-4 w-full h-full flex flex-col pt-8">
                        
                        <div className="mb-8">
                            <div className="flex gap-4">
                                <label className="flex-1 flex-col flex items-center justify-center p-8 border border-zinc-800 bg-zinc-900 rounded-sm cursor-pointer hover:bg-zinc-800/80 transition-all">
                                    <svg aria-label="Icon to represent media such as images or videos" fill="currentColor" height="32" viewBox="0 0 48 48" width="32" className="text-zinc-300 mb-4"><path clipRule="evenodd" d="M24 6C14.059 6 6 14.059 6 24s8.059 18 18 18 18-8.059 18-18S33.941 6 24 6Zm-1.892 34.908c-1.425-.138-2.79-.475-4.08-.985V24.5a3.992 3.992 0 0 1-2.909-3.83A3.995 3.995 0 0 1 20 16.522 3.996 3.996 0 0 1 24.184 17a3.995 3.995 0 0 1 3.513 3.652 3.991 3.991 0 0 1-2.697 4.018v15.253a15.932 15.932 0 0 0-2.892.985ZM12.756 36.31A15.96 15.96 0 0 1 8.04 24c0-8.822 7.178-16 16-16s16 7.178 16 16a15.961 15.961 0 0 1-4.716 12.31A15.82 15.82 0 0 0 24.5 26.5v-1.127a5.98 5.98 0 0 0 3.235-5.26 5.993 5.993 0 0 0-5.836-6.096A5.994 5.994 0 0 0 16 20.113a5.98 5.98 0 0 0 3.2 5.26v1.127a15.82 15.82 0 0 0-6.444 9.81Z" fillRule="evenodd"></path></svg>
                                    <span className="text-white text-sm font-semibold">{createImageUrl ? 'Change Image' : 'Select from computer'}</span>
                                    <input 
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                                <button onClick={() => setCreateImageUrl(activeArtist.image)} className="flex-1 flex flex-col items-center justify-center p-8 border border-zinc-800 bg-zinc-900 rounded-sm cursor-pointer hover:bg-zinc-800/80 transition-all">
                                    <UserIcon className="w-8 h-8 text-zinc-300 mb-4" />
                                    <span className="text-white text-sm font-semibold text-center">Use profile<br />picture</span>
                                </button>
                            </div>
                            {createImageUrl && (
                                <img src={createImageUrl} className="mt-4 w-full aspect-square object-cover rounded-sm border border-zinc-800" alt="Preview" />
                            )}
                        </div>

                        <div className="mb-6 flex-1">
                            <textarea 
                                value={createCaption}
                                onChange={(e) => setCreateCaption(e.target.value)}
                                placeholder="Write a caption..."
                                className="w-full h-24 bg-transparent border-b border-zinc-800 text-white resize-none outline-none focus:border-zinc-500 mb-6 text-sm py-2"
                            />
                        </div>
                        
                        <button 
                            onClick={handleCreatePost}
                            disabled={!createImageUrl.trim()}
                            className="w-full bg-[#0095F6] text-white disabled:bg-[#005286] disabled:text-zinc-400 font-semibold py-2.5 rounded-lg hover:bg-[#1877F2] transition-colors"
                        >
                            Share
                        </button>
                    </div>
                )}

                {currentTab === 'profile' && (
                    <div className="w-full">
                        {/* Profile Info */}
                        <div className="px-4 py-4">
                            <div className="flex items-center justify-between mb-4">
                                <img src={activeArtist.image} className="w-20 h-20 rounded-full object-cover p-1 border-2 border-zinc-700" />
                                <div className="flex-1 flex justify-around pl-4">
                                    <div className="flex flex-col items-center">
                                        <span className="font-bold text-base">{formatNumber(myPosts.length)}</span>
                                        <span className="text-[13px] text-zinc-300">posts</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="font-bold text-base">{formatNumber(activeArtistData.instagramFollowers || 0)}</span>
                                        <span className="text-[13px] text-zinc-300">followers</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="font-bold text-base">0</span>
                                        <span className="text-[13px] text-zinc-300">following</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mb-4 text-[13px]">
                                <h2 className="font-semibold">{activeArtist.name}</h2>
                                <p className="text-zinc-300">Musician/band</p>
                                <p className="whitespace-pre-wrap mt-0.5">Official Instagram account.</p>
                            </div>

                            <div className="flex gap-2 mb-4">
                                <button className="flex-1 bg-zinc-800 py-1.5 rounded-lg text-sm font-semibold text-white hover:bg-zinc-700">Edit profile</button>
                                <button className="flex-1 bg-zinc-800 py-1.5 rounded-lg text-sm font-semibold text-white hover:bg-zinc-700">Share profile</button>
                            </div>
                        </div>

                        {/* Grid/Feed Tabs */}
                        <div className="flex border-t border-zinc-900 border-b border-black">
                            <button className="flex-1 py-2 flex justify-center border-b-[1px] border-white text-white">
                                <svg aria-label="Posts" fill="currentColor" height="24" viewBox="0 0 24 24" width="24"><rect fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" width="18" x="3" y="3"></rect><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="9.015" x2="9.015" y1="3" y2="21"></line><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="14.985" x2="14.985" y1="3" y2="21"></line><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="9.015" y2="9.015"></line><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="14.985" y2="14.985"></line></svg>
                            </button>
                            <button className="flex-1 py-2 flex justify-center text-zinc-500">
                                <UserIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Image Grid */}
                        <div className="grid grid-cols-3 gap-[1px]">
                            {myPosts.map(post => (
                                <div key={post.id} className="aspect-square bg-zinc-900 relative cursor-pointer group">
                                    <img src={post.imageUrl} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                        {myPosts.length === 0 && (
                            <div className="mt-12 flex flex-col items-center text-center px-8 text-zinc-500 pb-20">
                                <p className="font-bold text-lg mb-1">No posts yet</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Nav */}
            <div className="flex-shrink-0 w-full bg-black border-t border-zinc-900 z-30 px-6 py-3 flex justify-between items-center text-white pb-6">
                <button onClick={() => setCurrentTab('home')} className={`hover:text-zinc-300 transition-colors ${currentTab === 'home' ? 'text-white' : 'text-zinc-400'}`}>
                    <HomeIcon className="w-7 h-7" />
                </button>
                <button className="hover:text-zinc-300 transition-colors text-zinc-400">
                    <svg aria-label="Search" fill="currentColor" height="24" viewBox="0 0 24 24" width="24"><path d="M19 10.5A8.5 8.5 0 1 1 10.5 2a8.5 8.5 0 0 1 8.5 8.5Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="16.511" x2="22" y1="16.511" y2="22"></line></svg>                
                </button>
                <button onClick={() => setCurrentTab('create')} className={`hover:text-zinc-300 transition-colors ${currentTab === 'create' ? 'text-white' : 'text-zinc-400'}`}>
                    <PlusIcon className="w-7 h-7 border-[2.5px] border-current rounded-lg p-0.5" />
                </button>
                <button className={`hover:text-zinc-300 transition-colors text-zinc-400`}>
                    <svg aria-label="Reels" fill="currentColor" height="24" viewBox="0 0 24 24" width="24"><line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" x1="2.049" x2="21.95" y1="7.002" y2="7.002"></line><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="9.725" x2="13.764" y1="17.018" y2="17.018"></line><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="11.744" x2="11.744" y1="15" y2="19.036"></line><rect fill="none" height="20" rx="3.003" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" width="20" x="2" y="2"></rect></svg>
                </button>
                <button onClick={() => setCurrentTab('profile')} className={`rounded-full border border-transparent overflow-hidden hover:border-zinc-300 transition-colors ${currentTab === 'profile' ? 'border-white' : ''}`}>
                    <img src={activeArtist.image} className="w-7 h-7 object-cover" />
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

export default InstagramView;
