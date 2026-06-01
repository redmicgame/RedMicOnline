
import React, { useState } from 'react';
import { useGame, formatNumber } from '../context/GameContext';
import { Song, Label, XUser } from '../types';
import { LABELS } from '../constants';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

const QualityEditor: React.FC<{ song: Song }> = ({ song }) => {
    const { dispatch } = useGame();
    const [quality, setQuality] = useState(song.quality);

    const handleUpdate = () => {
        dispatch({ type: 'UPDATE_SONG_QUALITY', payload: { songId: song.id, newQuality: quality } });
    };

    return (
        <div className="flex items-center gap-3">
            <p className="flex-grow font-semibold">{song.title}</p>
            <input 
                type="number" 
                value={quality} 
                onChange={e => setQuality(parseInt(e.target.value))}
                onBlur={handleUpdate}
                min="0" max="100"
                className="w-20 bg-zinc-700 p-1 rounded-md text-center"
            />
        </div>
    );
};

const NpcUserEditor: React.FC<{ user: XUser }> = ({ user }) => {
    const { dispatch } = useGame();
    const [name, setName] = useState(user.name);
    const [username, setUsername] = useState(user.username);

    const handleUpdate = () => {
        const newName = name.trim();
        const newUsername = username.trim();
        if (newName !== user.name || newUsername !== user.username) {
             if (newName && newUsername) {
                dispatch({ type: 'UPDATE_NPC_X_USER', payload: { userId: user.id, newName: newName, newUsername: newUsername } });
             }
        }
    };

    return (
        <div className="flex items-center gap-4">
            <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover"/>
            <div className="flex-grow grid grid-cols-2 gap-2">
                <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    onBlur={handleUpdate}
                    className="bg-zinc-700 p-2 rounded-md text-sm"
                    placeholder="Display Name"
                />
                <div className="flex items-center">
                    <span className="text-zinc-500 mr-1">@</span>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={e => setUsername(e.target.value)}
                        onBlur={handleUpdate}
                        className="bg-zinc-700 p-2 rounded-md text-sm w-full"
                        placeholder="Username"
                    />
                </div>
            </div>
        </div>
    );
};


const RedMicProDashboardView: React.FC = () => {
    const { dispatch, activeArtistData, gameState } = useGame();
    if (!activeArtistData) return null;
    
    const { money, songs, isGoldTheme, salesBoost, contract, hype, redMicPro, popularity } = activeArtistData;

    const [newMoney, setNewMoney] = useState(money);
    const [newBoost, setNewBoost] = useState(salesBoost);
    const [newHype, setNewHype] = useState(hype);
    const [newPopularity, setNewPopularity] = useState(popularity);
    const [adminCode, setAdminCode] = useState('');
    const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
    const hypeMode = redMicPro.hypeMode || 'locked';

    const unreleasedSongs = songs.filter(s => !s.isReleased);
    
    const uniqueNpcArtists = Array.from(new Set([
        ...gameState.npcs.map((n: any) => n.artist),
        ...gameState.npcAlbums.map((a: any) => a.artist)
    ])).sort();
    
    const editableFanAccounts = activeArtistData.xUsers.filter(user => 
        !user.isPlayer && 
        !['popbase', 'tmz', 'chartdata'].includes(user.id) &&
        !user.id.startsWith('addiction_') &&
        !user.id.startsWith('charts_') &&
        !user.id.startsWith('stats_')
    );

    const handleAdminUnlock = () => {
        if (adminCode.toLowerCase() === 'queenlayabtch') {
            setIsAdminUnlocked(true);
        }
    };

    return (
        <div className="h-screen w-full bg-zinc-900 overflow-y-auto">
            <header className="p-4 flex items-center gap-4 sticky top-0 bg-zinc-900/80 backdrop-blur-sm z-10 border-b border-zinc-700/50">
                <button onClick={() => dispatch({type: 'CHANGE_VIEW', payload: 'game'})} className="p-2 rounded-full hover:bg-white/10">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold text-yellow-400">Red Mic Pro Dashboard</h1>
            </header>
            <main className="p-4 space-y-6">
                <div className="bg-zinc-800 p-4 rounded-lg">
                    <h2 className="text-lg font-bold">Pro Status</h2>
                    <p className="text-sm text-green-400">{hypeMode === 'locked' ? 'Hype is permanently locked at 1000.' : 'Manual hype control is active.'}</p>
                </div>

                <div className="bg-zinc-800 p-4 rounded-lg space-y-3">
                    <h2 className="text-lg font-bold">Hype Management</h2>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => dispatch({ type: 'SET_PRO_HYPE_MODE', payload: 'locked' })}
                            className={`py-2 rounded-md font-semibold text-sm transition-colors ${hypeMode === 'locked' ? 'bg-yellow-500 text-black' : 'bg-zinc-700'}`}
                        >
                            Locked Hype (1000)
                        </button>
                        <button
                            onClick={() => dispatch({ type: 'SET_PRO_HYPE_MODE', payload: 'manual' })}
                            className={`py-2 rounded-md font-semibold text-sm transition-colors ${hypeMode === 'manual' ? 'bg-yellow-500 text-black' : 'bg-zinc-700'}`}
                        >
                            Manual Hype
                        </button>
                    </div>
                    {hypeMode === 'manual' && (
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={newHype}
                                onChange={e => setNewHype(parseInt(e.target.value))}
                                min="0"
                                className="w-full bg-zinc-700 p-2 rounded-md"
                            />
                            <button
                                onClick={() => dispatch({ type: 'SET_HYPE', payload: newHype })}
                                className="bg-zinc-600 font-bold px-4 rounded-md"
                            >
                                Set
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="bg-zinc-800 p-4 rounded-lg space-y-3">
                    <h2 className="text-lg font-bold">Public Image Management</h2>
                    <p className="text-sm text-zinc-400">Change your public image level instantly. Lower values cause controversy and backlash.</p>
                    <div className="flex gap-2">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={activeArtistData.publicImage ?? 80}
                            onChange={(e) => dispatch({ type: 'SET_PUBLIC_IMAGE', payload: parseInt(e.target.value) })}
                            className="w-full"
                        />
                        <span className="w-12 text-right font-bold">{activeArtistData.publicImage ?? 80}</span>
                    </div>
                </div>

                <div className="bg-zinc-800 p-4 rounded-lg space-y-3">
                    <h2 className="text-lg font-bold">Theme</h2>
                    <div className="flex items-center justify-between">
                        <label htmlFor="gold-theme-toggle" className="font-semibold">Enable Gold Theme</label>
                        <button 
                            onClick={() => dispatch({ type: 'TOGGLE_GOLD_THEME', payload: { enabled: !isGoldTheme } })}
                            className={`w-14 h-8 rounded-full p-1 transition-colors ${isGoldTheme ? 'bg-yellow-500' : 'bg-zinc-600'}`}
                            id="gold-theme-toggle"
                        >
                            <span className={`block w-6 h-6 rounded-full bg-white transform transition-transform ${isGoldTheme ? 'translate-x-6' : ''}`} />
                        </button>
                    </div>
                </div>

                <div className="bg-zinc-800 p-4 rounded-lg space-y-3">
                    <h2 className="text-lg font-bold">Edit Money</h2>
                    <div className="flex gap-2">
                        <input type="number" value={newMoney} onChange={e => setNewMoney(parseInt(e.target.value))} className="w-full bg-zinc-700 p-2 rounded-md" />
                        <button onClick={() => dispatch({ type: 'SET_MONEY', payload: { newAmount: newMoney }})} className="bg-zinc-600 font-bold px-4 rounded-md">Set</button>
                    </div>
                </div>

                <div className="bg-zinc-800 p-4 rounded-lg space-y-3">
                    <h2 className="text-lg font-bold">Edit Popularity (1-100)</h2>
                    <div className="flex gap-2">
                        <input 
                            type="number" 
                            value={newPopularity} 
                            onChange={e => setNewPopularity(parseInt(e.target.value))} 
                            min="1" 
                            max="100" 
                            className="w-full bg-zinc-700 p-2 rounded-md" 
                        />
                        <button onClick={() => dispatch({ type: 'SET_POPULARITY', payload: newPopularity })} className="bg-zinc-600 font-bold px-4 rounded-md">Set</button>
                    </div>
                </div>
                
                <div className="bg-zinc-800 p-4 rounded-lg space-y-3">
                    <h2 className="text-lg font-bold">Edit Merch Sales Boost (%)</h2>
                    <div className="flex gap-2">
                        <input type="number" value={newBoost} onChange={e => setNewBoost(parseInt(e.target.value))} className="w-full bg-zinc-700 p-2 rounded-md" />
                        <button onClick={() => dispatch({ type: 'SET_SALES_BOOST', payload: { newBoost: newBoost }})} className="bg-zinc-600 font-bold px-4 rounded-md">Set</button>
                    </div>
                </div>

                <div className="bg-zinc-800 p-4 rounded-lg space-y-3">
                    <h2 className="text-lg font-bold">Edit NPC Album/Song Covers</h2>
                    <p className="text-sm text-zinc-400">Change the cover art for NPC artists. This will apply to their new releases and some charts.</p>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {uniqueNpcArtists.map(artistName => (
                            <div key={artistName} className="flex items-center gap-4">
                                <label htmlFor={`npc-cover-upload-${artistName}`} className="cursor-pointer group relative">
                                    <img src={gameState.npcImages?.[artistName] || `https://ui-avatars.com/api/?name=${encodeURIComponent(artistName)}&background=random&color=fff&size=250`} alt={artistName} className="w-12 h-12 rounded object-cover"/>
                                    <div className="absolute inset-0 bg-black/60 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                </label>
                                <input
                                    id={`npc-cover-upload-${artistName}`}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            const file = e.target.files[0];
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                dispatch({ type: 'UPDATE_NPC_COVER', payload: { artistName, newCover: reader.result as string } });
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                <div className="flex-grow">
                                    <p className="font-semibold">{artistName}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="bg-zinc-800 p-4 rounded-lg space-y-3">
                    <h2 className="text-lg font-bold">Edit NPC Avatars</h2>
                    <p className="text-sm text-zinc-400">Change the profile pictures for fan accounts, media, and haters.</p>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {activeArtistData.xUsers
                            .filter(user => !user.isPlayer)
                            .map(user => (
                                <div key={user.id} className="flex items-center gap-4">
                                    <label htmlFor={`avatar-upload-${user.id}`} className="cursor-pointer group relative">
                                        <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover"/>
                                        <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                    </label>
                                    <input
                                        id={`avatar-upload-${user.id}`}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                const file = e.target.files[0];
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    dispatch({ type: 'UPDATE_NPC_AVATAR', payload: { userId: user.id, newAvatar: reader.result as string } });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    <div className="flex-grow">
                                        <p className="font-semibold">{user.name}</p>
                                        <p className="text-sm text-zinc-400">@{user.username}</p>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
                
                <div className="bg-zinc-800 p-4 rounded-lg space-y-3">
                    <h2 className="text-lg font-bold">Edit Fan Account Names</h2>
                    <p className="text-sm text-zinc-400">Change the display names and usernames for generic fan and hater accounts.</p>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {editableFanAccounts.map(user => (
                            <NpcUserEditor key={user.id} user={user} />
                        ))}
                    </div>
                </div>

                <div className="bg-zinc-800 p-4 rounded-lg space-y-3">
                    <h2 className="text-lg font-bold">Edit Unreleased Song Quality</h2>
                    {unreleasedSongs.length > 0 ? unreleasedSongs.map(song => (
                        <QualityEditor key={song.id} song={song} />
                    )) : <p className="text-sm text-zinc-500">No unreleased songs to edit.</p>}
                </div>

                <div className="bg-zinc-800 p-4 rounded-lg space-y-3">
                    <h2 className="text-lg font-bold">Sign With Any Label</h2>
                    <p className="text-sm text-zinc-400">Instantly sign a 3-year, 3-album deal with any label, regardless of requirements.</p>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                        {LABELS.map(label => (
                            <button 
                                key={label.id}
                                onClick={() => dispatch({ type: 'PRO_SIGN_LABEL', payload: { labelId: label.id }})}
                                className="bg-zinc-700 p-3 rounded-md hover:bg-zinc-600 disabled:opacity-50"
                                disabled={contract?.labelId === label.id && !contract.isCustom}
                            >
                                <img src={label.logo} className="w-12 h-12 mx-auto rounded-full" />
                                <p className="font-bold mt-2">{label.name}</p>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="bg-zinc-900/50 border-2 border-purple-500/30 p-4 rounded-lg space-y-3">
                    <h2 className="text-lg font-bold text-purple-400">Admin Panel</h2>
                    {isAdminUnlocked ? (
                        <div className="text-center py-4">
                            <p className="text-zinc-300">Admin features coming soon.</p>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <input 
                                type="password" 
                                value={adminCode} 
                                onChange={e => setAdminCode(e.target.value)} 
                                placeholder="Enter secret code..."
                                className="w-full bg-zinc-700 p-2 rounded-md"
                            />
                            <button 
                                onClick={handleAdminUnlock} 
                                className="bg-purple-600 hover:bg-purple-700 font-bold px-4 rounded-md"
                            >
                                Unlock
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
export default RedMicProDashboardView;
