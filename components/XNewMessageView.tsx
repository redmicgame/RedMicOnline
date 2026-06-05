import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import SearchIcon from './icons/SearchIcon';

const XNewMessageView: React.FC = () => {
    const { gameState, dispatch, activeArtistData } = useGame();
    const [search, setSearch] = useState('');
    
    // We want to allow DMing online artists if available, OR NPC artists if offline
    const availableUsers = useMemo(() => {
        const users: Array<{ id: string, name: string, avatar?: string, isOnlinePlayer: boolean }> = [];
        
        // We want to allow DMing online artists if available
        if (gameState.onlineArtists) {
             gameState.onlineArtists.forEach(oa => {
                 if (oa.id !== gameState.activeArtistId) {
                     users.push({
                         id: oa.id,
                         name: oa.name,
                         avatar: 'https://ui-avatars.com/api/?background=random&name=' + encodeURIComponent(oa.name),
                         isOnlinePlayer: true
                     });
                 }
             });
        }
        
        return users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));
    }, [gameState.onlineArtists, gameState.npcs, search, gameState.activeArtistId]);

    const handleCreateChat = (user: { id: string, name: string, avatar?: string }) => {
        const existingChat = activeArtistData?.xChats.find(c => !c.isGroup && c.participants.includes(user.id) && c.participants.includes('player'));
        if (existingChat) {
            dispatch({ type: 'CHANGE_VIEW', payload: 'xChatDetail' });
            // need to also set selectedXChatId though, which is handled normally or if we dispatch a special action
            // Actually, we can dispatch VIEW_X_CHAT
            dispatch({ type: 'VIEW_X_CHAT', payload: existingChat.id });
            return;
        }

        const playerXUser = activeArtistData?.xUsers.find(u => u.isPlayer);
        if (!playerXUser) return;

        // If they don't have an xUser profile locally, we might need to add it, 
        // but XChatView looks them up via findUser.
        // Add the target user to xUsers if they are not there.
        const targetId = user.id;
        const exists = activeArtistData?.xUsers.find(u => u.id === targetId);
        if (!exists) {
            dispatch({
                type: 'ADD_X_USER',
                payload: {
                    id: user.id,
                    name: user.name,
                    username: user.name.replace(/\s+/g, '').toLowerCase(),
                    avatar: user.avatar || 'https://ui-avatars.com/api/?background=random',
                    isVerified: true,
                    followersCount: Math.floor(Math.random() * 1000000),
                    followingCount: Math.floor(Math.random() * 100),
                    bio: 'Artist'
                }
            });
        }

        const participants = [playerXUser.id, targetId];
        let chatId = crypto.randomUUID();
        // If it's an online player (targetId starts with artist_), make predictable ID
        if (targetId.startsWith('artist_') || playerXUser.id.startsWith('artist_')) {
             chatId = [...participants].sort().join('_');
        }

        const newChat = {
            id: chatId,
            name: user.name,
            avatar: user.avatar || 'https://ui-avatars.com/api/?background=random',
            isGroup: false,
            participants: participants,
            messages: [],
            isRead: true
        };
        
        dispatch({ type: 'CREATE_X_CHAT', payload: newChat });
    };

    return (
        <div className="bg-black text-white min-h-screen">
             <header className="p-3 border-b border-zinc-700/70 flex items-center gap-4">
                <button onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: 'x' })} className="p-2 hover:bg-zinc-800 rounded-full">
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-bold">New Message</h1>
            </header>
            
            <div className="p-3 border-b border-zinc-800 flex items-center gap-3">
                <SearchIcon className="w-5 h-5 text-zinc-500" />
                <input 
                    type="text" 
                    placeholder="Search people" 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-transparent border-none focus:outline-none w-full text-white" 
                    autoFocus
                />
            </div>
            
            <div className="overflow-y-auto h-[calc(100vh-120px)]">
                {availableUsers.map(user => (
                    <button 
                        key={user.id} 
                        onClick={() => handleCreateChat(user)}
                        className="w-full text-left p-4 hover:bg-zinc-800/50 flex items-center gap-3"
                    >
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                            <p className="font-bold flex items-center gap-1">
                                {user.name} {user.isOnlinePlayer && <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full ml-2">Online</span>}
                            </p>
                            <p className="text-zinc-500 text-sm">@{user.name.replace(/\s+/g, '').toLowerCase()}</p>
                        </div>
                    </button>
                ))}
                {availableUsers.length === 0 && (
                    <div className="p-8 text-center text-zinc-500">
                        No results found
                    </div>
                )}
            </div>
        </div>
    );
};

export default XNewMessageView;
