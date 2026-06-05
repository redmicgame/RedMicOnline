
import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { XChat, XUser, XMessage } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import PlusCircleIcon from './icons/PlusCircleIcon';
import HeartIcon from './icons/HeartIcon';




const MessageBubble: React.FC<{ message: XMessage, author: XUser | undefined, isPlayer: boolean, isGroup: boolean }> = ({ message, author, isPlayer, isGroup }) => {
    if (!author) return null;

    if (isPlayer) {
        return (
            <div className="flex justify-end">
                <div className="bg-blue-500 rounded-2xl px-4 py-2 max-w-xs sm:max-w-sm">
                    {message.text}
                </div>
            </div>
        );
    }

    return (
         <div className="flex items-end gap-2">
            <img src={author.avatar} alt={author.name} className="w-7 h-7 rounded-full object-cover"/>
             <div className="flex flex-col">
                {isGroup && <p className="text-xs text-zinc-400 ml-3">{author.name}</p>}
                <div className="bg-zinc-700 rounded-2xl px-4 py-2 max-w-xs sm:max-w-sm">
                    {message.text}
                </div>
            </div>
        </div>
    );
};


const XChatView: React.FC = () => {
    const { gameState, dispatch, activeArtistData, activeArtist } = useGame();
    const { selectedXChatId } = gameState;
    const { xUsers, xChats } = activeArtistData!;
    const [messageText, setMessageText] = useState('');
    const [isAiReplying, setIsAiReplying] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const chat = xChats.find(c => c.id === selectedXChatId);
    const playerUser = xUsers.find(u => u.isPlayer);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat?.messages]);
    
    const findUser = (id: string) => {
        if (!gameState.offlineMode && id.startsWith('artist_') && gameState.onlineArtists) {
            const onlineAuthor = gameState.onlineArtists.find(a => a.id === id);
            if (onlineAuthor) {
                return {
                    id: onlineAuthor.id,
                    name: onlineAuthor.name,
                    username: onlineAuthor.name.replace(/\s+/g, '').toLowerCase(),
                    avatar: onlineAuthor.avatar || 'https://ui-avatars.com/api/?background=random',
                    isVerified: true
                } as XUser;
            }
        }
        return xUsers.find(u => u.id === id);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chat || !playerUser || !messageText.trim() || isAiReplying) return;
    
        const playerMessage: XMessage = {
            id: crypto.randomUUID(),
            senderId: playerUser.id,
            text: messageText.trim(),
            date: gameState.date,
        };
        
        const currentMessageText = messageText;
        dispatch({ type: 'SEND_X_MESSAGE', payload: { chatId: chat.id, message: playerMessage }});
        setMessageText('');

        // If it's a firebase chat (chatId contains '_'), we send to firebase and return
        if (chat.id.includes('_') && !chat.isGroup) {
            const receiverId = chat.participants.find(p => p !== playerUser.id);
            if (receiverId) {
                 import('../firebase').then(({ sendDirectMessage }) => {
                     sendDirectMessage(playerUser.id, receiverId, currentMessageText, playerMessage.id);
                 }).catch(console.error);
                 return;
            }
        }

        setIsAiReplying(true);
    
        try {
            const otherParticipants = chat.participants
                .filter(pId => pId !== playerUser.id)
                .map(findUser)
                .filter((u): u is XUser => !!u);
    
            // Pick a random replier from the chat
            const replier = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
            if (!replier) {
                setIsAiReplying(false);
                return;
            }
    
            const chatHistory = chat.messages
                .map(msg => {
                    const author = findUser(msg.senderId);
                    return `${author?.name || 'Unknown'}: ${msg.text}`;
                })
                .join('\n');
    
            const persona = chat.isGroup 
                ? `You are a music artist. Your username is ${replier.name}. You are in a group chat with the artist ${activeArtist?.name} and other artists/people. Be collegial, casual, and talk about the industry or life. Use casual, internet slang.`
                : `You are a music artist. Your username is ${replier.name}. You are direct messaging another artist, ${activeArtist?.name}. Be realistic to how artists talk to each other (collaborations, hangouts, praising work). Use casual internet slang.`;
    
            let aiReplyText = '';
                const genericReplies = [
                    "Interesting...", 
                    "Wow!", 
                    "Gotcha.", 
                    "That makes sense.", 
                    "I see.",
                    "If you say so!",
                    "Noted.",
                    "Cool cool.",
                    "Hmm..."
                ];
                aiReplyText = genericReplies[Math.floor(Math.random() * genericReplies.length)];
    
            if (aiReplyText) {
                const aiMessage: XMessage = {
                    id: crypto.randomUUID(),
                    senderId: replier.id,
                    text: aiReplyText,
                    date: gameState.date,
                };
                // Delay for realism
                setTimeout(() => {
                    dispatch({ type: 'SEND_X_MESSAGE', payload: { chatId: chat.id, message: aiMessage }});
                    setIsAiReplying(false);
                }, Math.random() * 1500 + 500); // 0.5s to 2s delay
            } else {
                setIsAiReplying(false);
            }
    
        } catch (error) {
            console.error("Error getting AI reply:", error);
            setIsAiReplying(false);
        }
    };

    if (!chat || !playerUser) {
        return <div className="p-4">Chat not found. <button onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: 'x' })}>Back</button></div>;
    }
    
    return (
         <div className="bg-black text-white min-h-screen flex flex-col">
            <header className="sticky top-0 bg-black/80 backdrop-blur-sm z-20 p-3 flex items-center gap-4 border-b border-zinc-700/70">
                <button onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: 'x' })} className="p-2 rounded-full hover:bg-zinc-800">
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                    <img src={chat.avatar} alt={chat.name} className="w-8 h-8 rounded-full object-cover"/>
                    <h2 className="font-bold text-lg">{chat.name}</h2>
                </div>
            </header>
            
            <main className="flex-grow p-4 overflow-y-auto space-y-4">
                {chat.messages.map(msg => (
                    <MessageBubble key={msg.id} message={msg} author={findUser(msg.senderId)} isPlayer={msg.senderId === playerUser.id} isGroup={chat.isGroup} />
                ))}
                 <div ref={messagesEndRef} />
            </main>

            <footer className="sticky bottom-0 bg-black p-2 border-t border-zinc-700/70">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <button type="button" className="p-2"><PlusCircleIcon className="w-6 h-6 text-zinc-400" /></button>
                    <input 
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder={isAiReplying ? "..." : "Start a message"}
                        disabled={isAiReplying}
                        className="flex-grow bg-zinc-800 rounded-full h-10 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                     <button type="submit" disabled={isAiReplying || !messageText.trim()} className="p-2 disabled:opacity-50">
                        <HeartIcon className="w-6 h-6 text-zinc-400" />
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default XChatView;