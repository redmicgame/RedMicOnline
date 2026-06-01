import React from 'react';
import { useGame, formatNumber } from '../context/GameContext';
import { XPost, XUser } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import UserVerifiedBadge from './icons/UserVerifiedBadge';
import MessageIcon from './icons/MessageIcon';
import CommentIcon from './icons/CommentIcon';
import RetweetIcon from './icons/RetweetIcon';
import HeartIcon from './icons/HeartIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import { ComposeXPostModal } from './XView';

const Post: React.FC<{ post: XPost; author: XUser; onQuote?: (post: XPost) => void }> = ({ post, author, onQuote }) => {
    const { activeArtistData } = useGame();
    const timeAgo = (postDate: { week: number, year: number }) => `${postDate.week}w`;

    const isSuspended = activeArtistData!.xSuspensionStatus?.isSuspended && activeArtistData!.xSuspensionStatus.accountId === (activeArtistData!.selectedPlayerXUserId || activeArtistData!.xUsers.find(u => u.isPlayer)?.id);

    return (
        <div className="flex gap-3 p-3 border-b border-zinc-700/70">
            <img src={author.avatar} alt={author.name} className="w-10 h-10 rounded-full flex-shrink-0 object-cover" />
            <div className="w-full">
                <div className="flex items-center gap-1 text-sm">
                    <span className="font-bold">{author.name}</span>
                    <UserVerifiedBadge isVerified={author.isVerified} className="w-4 h-4 flex-shrink-0" />
                    <span className="text-zinc-500">@{author.username}</span>
                    <span className="text-zinc-500">·</span>
                    <span className="text-zinc-500">{timeAgo(post.date)}</span>
                </div>
                <p className="text-white whitespace-pre-wrap">{post.content}</p>
                {post.video ? (
                    <video src={post.video} className="mt-2 rounded-xl border border-zinc-700 max-w-full h-auto w-full object-cover" autoPlay loop muted playsInline />
                ) : post.image && !post.image.startsWith('chart:') && (
                    <img src={post.image} alt="Post image" className="mt-2 rounded-xl border border-zinc-700 max-w-full h-auto" />
                )}
                
                {post.quoteOf && (
                    <div className="mt-2 border border-zinc-700 rounded-xl p-3">
                        <div className="flex items-center gap-1 text-sm mb-1">
                            <span className="font-bold">{activeArtistData?.xUsers.find(u => u.id === post.quoteOf?.authorId)?.name || 'User'}</span>
                            <span className="text-zinc-500">@{activeArtistData?.xUsers.find(u => u.id === post.quoteOf?.authorId)?.username || 'user'}</span>
                            <span className="text-zinc-500 flex-shrink-0">·</span>
                            <span className="text-zinc-500 flex-shrink-0">{timeAgo(post.quoteOf.date)}</span>
                        </div>
                        <p className="text-sm text-white whitespace-pre-wrap">{post.quoteOf.content}</p>
                        {post.quoteOf.video ? (
                            <video src={post.quoteOf.video} className="mt-2 rounded-xl border border-zinc-700 max-w-full h-auto max-h-48 w-full object-cover" autoPlay loop muted playsInline />
                        ) : post.quoteOf.image && !post.quoteOf.image.startsWith('chart:') ? (
                            <img src={post.quoteOf.image} alt="Quoted image" className="mt-2 rounded-xl border border-zinc-700 max-w-full h-auto max-h-48 object-cover" />
                        ) : null}
                    </div>
                )}

                 <div className="flex justify-between items-center mt-3 text-zinc-500 max-w-sm">
                    <div className="flex items-center gap-1 group">
                        <button disabled={isSuspended} className="p-1.5 group-hover:bg-blue-500/10 rounded-full disabled:cursor-not-allowed"><CommentIcon className="w-5 h-5 group-hover:text-blue-500" /></button>
                        <span className="text-xs group-hover:text-blue-500">0</span>
                    </div>
                     <div className="flex items-center gap-1 group">
                        <button disabled={isSuspended} onClick={() => onQuote && onQuote(post)} className="p-1.5 group-hover:bg-green-500/10 rounded-full disabled:cursor-not-allowed"><RetweetIcon className="w-5 h-5 group-hover:text-green-500" /></button>
                        <span className="text-xs group-hover:text-green-500">{formatNumber(post.retweets)}</span>
                    </div>
                     <div className="flex items-center gap-1 group">
                        <button disabled={isSuspended} className="p-1.5 group-hover:bg-pink-500/10 rounded-full disabled:cursor-not-allowed"><HeartIcon className="w-5 h-5 group-hover:text-pink-500" /></button>
                        <span className="text-xs group-hover:text-pink-500">{formatNumber(post.likes)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <ChartBarIcon className="w-5 h-5" />
                        <span className="text-xs">{formatNumber(post.views)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};


const XProfileView: React.FC = () => {
    const { gameState, dispatch, activeArtistData } = useGame();
    const [quotePostTarget, setQuotePostTarget] = React.useState<XPost | null>(null);
    const [showAbout, setShowAbout] = React.useState(false);
    const [showPremiumModal, setShowPremiumModal] = React.useState(false);
    const { selectedXUserId } = gameState;
    const { xUsers, xPosts, xFollowingIds, xSuspensionStatus, selectedPlayerXUserId } = activeArtistData!;

    const user = xUsers.find(u => u.id === selectedXUserId);
    const playerUser = selectedPlayerXUserId ? xUsers.find(u => u.id === selectedPlayerXUserId) : xUsers.find(u => u.isPlayer);
    const userPosts = xPosts
        .filter(p => p.authorId === selectedXUserId)
        .sort((a, b) => {
            const dateA = a.date.year * 52 + a.date.week;
            const dateB = b.date.year * 52 + b.date.week;
            return dateB - dateA;
        }).slice(0, 20);

    const isFollowing = user ? xFollowingIds.includes(user.id) : false;

    const handleFollow = () => {
        if (!user) return;
        if (isFollowing) {
            dispatch({ type: 'UNFOLLOW_X_USER', payload: user.id });
        } else {
            dispatch({ type: 'FOLLOW_X_USER', payload: user.id });
        }
    };
    
    const handleMessage = () => {
        if (!user || !isFollowing) return;
        const chat = activeArtistData!.xChats.find(c => !c.isGroup && c.participants.includes(user.id));
        if (chat) {
            dispatch({ type: 'VIEW_X_CHAT', payload: chat.id });
        } else {
            // Future: Implement DM creation
            alert("No direct message found with this user.");
        }
    };

    if (!user) {
        return <div className="p-4">User not found. <button onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: 'x' })}>Back</button></div>;
    }

    return (
        <div className="bg-black text-white min-h-screen">
            <header className="sticky top-0 bg-black/80 backdrop-blur-sm z-20 p-3 flex items-center gap-4">
                <button onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: 'x' })} className="p-2 rounded-full hover:bg-zinc-800">
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="font-bold text-lg">{user.name}</h2>
                    <p className="text-xs text-zinc-500">{userPosts.length} posts</p>
                </div>
            </header>
            
            {user.isPlayer && xSuspensionStatus?.isSuspended && xSuspensionStatus.accountId === user.id && (
                <div className="bg-zinc-800 p-3 text-center text-sm text-zinc-300">
                    <strong>Account suspended</strong>
                    <p className="text-xs">X suspends accounts which violate the X Rules.</p>
                </div>
            )}

            <div className="h-32 bg-zinc-800"></div>
            <div className="p-3">
                <div className="flex justify-between items-start -mt-14">
                    <img src={user.avatar} alt={user.name} className="w-28 h-28 rounded-full object-cover border-4 border-black" />
                    <div className="flex items-center gap-2 pt-14">
                        {!user.isPlayer ? (
                             <>
                                {isFollowing && (
                                    <button onClick={handleMessage} className="border border-zinc-600 rounded-full p-2 hover:bg-zinc-800">
                                        <MessageIcon className="w-5 h-5"/>
                                    </button>
                                )}
                                <button 
                                    onClick={handleFollow}
                                    className={`font-bold px-4 py-1.5 rounded-full text-sm ${isFollowing ? 'bg-transparent text-white border border-zinc-600' : 'bg-white text-black'}`}
                                >
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                             </>
                        ) : (
                            !user.isVerified && (
                                <button 
                                    onClick={() => setShowPremiumModal(true)}
                                    className="font-bold px-4 py-1.5 rounded-full text-sm text-black bg-white"
                                >
                                    Get Verified
                                </button>
                            )
                        )}
                    </div>
                </div>

                <div className="mt-3">
                    <div className="flex items-center gap-1">
                        <h1 className="text-xl font-bold">{user.name}</h1>
                                <UserVerifiedBadge isVerified={user.isVerified} className="w-5 h-5 flex-shrink-0" />
                    </div>
                    <button onClick={() => setShowAbout(true)} className="text-zinc-500 hover:text-white transition-colors">@{user.username}</button>
                    {user.bio && <p className="mt-2">{user.bio}</p>}
                    <div className="flex gap-4 text-sm text-zinc-500 mt-2">
                        <p><span className="font-bold text-white">{formatNumber(user.followingCount)}</span> Following</p>
                        <p><span className="font-bold text-white">{formatNumber(user.followersCount)}</span> Followers</p>
                    </div>
                    {user.isPlayer && (
                        <button 
                            onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: 'xAnalytics' })}
                            className="mt-3 flex items-center justify-center gap-2 w-full border border-zinc-700 py-1.5 rounded-full text-sm font-bold hover:bg-zinc-900 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                            View Analytics
                        </button>
                    )}
                </div>
            </div>
            
            <div className="border-b border-zinc-700/70 mt-3">
                <div className="flex justify-around">
                    <div className="flex-1 text-center font-bold p-3 border-b-2 border-blue-500">Posts</div>
                </div>
            </div>

            <div>
                {userPosts.map(post => <Post key={post.id} post={post} author={user} onQuote={setQuotePostTarget} />)}
            </div>

            {quotePostTarget && playerUser && (
                <ComposeXPostModal 
                    user={playerUser}
                    quotePost={quotePostTarget}
                    onClose={() => setQuotePostTarget(null)}
                    onPost={(payload) => {
                        dispatch({ type: 'POST_ON_X', payload });
                        setQuotePostTarget(null);
                    }}
                />
            )}

            {showAbout && (
                <div className="fixed inset-0 bg-black/80 flex justify-center items-center p-4 z-50">
                    <div className="bg-black border border-zinc-800 rounded-3xl w-full max-w-sm flex flex-col">
                        <header className="p-4 flex items-center gap-6 pb-2">
                            <button onClick={() => setShowAbout(false)}><ArrowLeftIcon className="w-5 h-5 text-white"/></button>
                            <h2 className="font-bold text-xl">About this account</h2>
                        </header>
                        <div className="flex flex-col items-center mt-6">
                            <img src={user.avatar} className="w-20 h-20 rounded-full object-cover filter grayscale" alt={user.name} />
                            <h3 className="font-bold text-lg mt-3 flex items-center gap-1">{user.name} <UserVerifiedBadge isVerified={user.isVerified} className="w-5 h-5" /></h3>
                            <p className="text-zinc-500">@{user.username}</p>
                            <p className="font-bold text-xl mt-3">𝕏.com</p>
                        </div>
                        <div className="mt-8 p-4 space-y-6">
                            <div className="flex items-center gap-4">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                <div>
                                    <p className="font-bold text-white text-lg">Date joined</p>
                                    <p className="text-zinc-500">{['January', 'March', 'August', 'October', 'December'][(user.username.charCodeAt(0) || 0) % 5]} {(2008 + (user.id.charCodeAt(1) || 0) % 15)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                <div className="flex-grow">
                                    <p className="font-bold text-white text-lg">Account based in</p>
                                    <p className="text-zinc-500">{user.country || ['United States', 'United Kingdom', 'Canada', 'Brazil', 'Philippines'][(user.id.charCodeAt(0) || 0) % 5]}</p>
                                </div>
                            </div>
                            {user.isVerified && (
                                <div className="flex items-center gap-4">
                                    <UserVerifiedBadge isVerified={user.isVerified} className="w-6 h-6" />
                                    <div>
                                        <p className="font-bold text-white text-lg">Verified</p>
                                        <p className="text-zinc-500">Since {user.verifiedSince || `August ${(2010 + (user.id.charCodeAt(0) || 0) % 13)}`}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-4 pb-6">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                                <div>
                                    <p className="font-bold text-white text-lg">Connected via</p>
                                    <p className="text-zinc-500">{['X for Android', 'X for iPhone', 'X Web App', 'United States App Store'][(user.username.length || 0) % 4]}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showPremiumModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-sm p-6 text-center">
                        <h2 className="text-2xl font-bold mb-2">Upgrade to Premium</h2>
                        <p className="text-zinc-400 mb-6">Choose your verification tier.</p>
                        
                        <div className="space-y-4">
                            <button 
                                onClick={() => {
                                    if(activeArtistData && activeArtistData.money >= 25000) {
                                        dispatch({ type: 'BUY_X_VERIFICATION', payload: { accountId: user.id, tier: 'blue', cost: 25000 }});
                                        setShowPremiumModal(false);
                                    } else {
                                        alert('Not enough funds!');
                                    }
                                }}
                                className="w-full bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border border-[#1DA1F2] p-4 rounded-2xl flex flex-col items-center transition-colors"
                            >
                                <UserVerifiedBadge isVerified="blue" className="w-10 h-10 mb-2" />
                                <span className="font-bold text-lg text-[#1DA1F2]">Blue</span>
                                <span className="text-zinc-300 text-sm">$25K / month</span>
                            </button>
                            
                            <button 
                                onClick={() => {
                                    if(activeArtistData && activeArtistData.money >= 250000) {
                                        dispatch({ type: 'BUY_X_VERIFICATION', payload: { accountId: user.id, tier: 'gold', cost: 250000 }});
                                        setShowPremiumModal(false);
                                    } else {
                                        alert('Not enough funds!');
                                    }
                                }}
                                className="w-full bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400 p-4 rounded-2xl flex flex-col items-center transition-colors"
                            >
                                <UserVerifiedBadge isVerified="gold" className="w-10 h-10 mb-2" />
                                <span className="font-bold text-lg text-yellow-400">Gold</span>
                                <span className="text-zinc-300 text-sm">$250K / month</span>
                            </button>
                        </div>
                        
                        <button onClick={() => setShowPremiumModal(false)} className="mt-6 font-bold text-zinc-500 hover:text-white">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default XProfileView;