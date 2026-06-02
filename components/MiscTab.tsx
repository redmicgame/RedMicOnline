import React, { useState, ChangeEvent } from 'react';
import { useGame, formatNumber } from '../context/GameContext';
import { useFirebase } from '../context/FirebaseContext';
import ChevronRightIcon from './icons/ChevronRightIcon';
import { PaparazziPhoto, PaparazziPhotoCategory } from '../types';
import { db, getActiveSaveId } from '../db/db';
import BookOpenIcon from './icons/BookOpenIcon';

const MiscTab: React.FC = () => {
    const { gameState, dispatch, activeArtist, activeArtistData } = useGame();
    const { user, login, logout } = useFirebase();
    const { date } = gameState;
    const [showEndCareerConfirm, setShowEndCareerConfirm] = useState(false);
    const [showExportOptions, setShowExportOptions] = useState(false);
    
    // State for paparazzi photos
    const [paparazziImage, setPaparazziImage] = useState<string | null>(null);
    const [paparazziCategory, setPaparazziCategory] = useState<PaparazziPhotoCategory>('Spotted');

    if (!activeArtist || !activeArtistData) {
        return null;
    }

    const unreadCount = activeArtistData.inbox.filter(e => !e.isRead).length;
    
    const handleInboxClick = () => {
        dispatch({ type: 'CHANGE_VIEW', payload: 'inbox' });
    };

    const handleEndCareer = async () => {
        await db.saves.delete(getActiveSaveId());
        dispatch({ type: 'RESET_GAME' });
        setShowEndCareerConfirm(false);
    };
    
    const handleExport = () => {
        if (!activeArtist) {
            alert('Cannot export, no active artist.');
            return;
        }
        try {
            const artistName = activeArtist.name.replace(/\s/g, '_');
            const dateStr = `${gameState.date.year}-W${gameState.date.week}`;
            
            const fileContent = JSON.stringify(gameState, null, 2); // Pretty print
            const mimeType = 'application/json';
            const fileName = `red-mic-save_${artistName}_${dateStr}.json`;

            const blob = new Blob([fileContent], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (err) {
            console.error("Failed to export save data:", err);
            alert('Error exporting data. Please check the console.');
        }
        setShowExportOptions(false);
    };


    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, setter: (value: string | null) => void) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setter(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleMultipleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            for (const file of Array.from(e.target.files)) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result as string;
                    dispatch({ type: 'ADD_ARTIST_IMAGE', payload: base64String });
                };
                reader.readAsDataURL(file);
            }
        }
    };
    
    const handleVideoUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && activeArtistData.artistVideoThumbnails.length < 10) {
            const file = e.target.files[0];
            const video = document.createElement('video');
            video.preload = 'metadata';

            video.onloadedmetadata = () => {
                video.currentTime = Math.min(1, video.duration / 2);
            };
            
            video.onseeked = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
                    dispatch({ type: 'ADD_ARTIST_VIDEO', payload: thumbnailUrl });
                }
            };

            // FIX: Use FileReader to create a data URL instead of URL.createObjectURL to avoid Blob type conflicts.
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    video.src = event.target.result as string;
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleAddPaparazziPhoto = () => {
        if (paparazziImage) {
            const newPhoto: PaparazziPhoto = {
                id: crypto.randomUUID(),
                image: paparazziImage,
                category: paparazziCategory,
            };
            dispatch({ type: 'ADD_PAPARAZZI_PHOTO', payload: { photo: newPhoto } });
            setPaparazziImage(null);
            setPaparazziCategory('Spotted');
        }
    };

    return (
        <>
            {showEndCareerConfirm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-zinc-800 rounded-2xl shadow-lg p-8 border border-red-500/50">
                        <h2 className="text-2xl font-bold text-red-500 text-center">End Career?</h2>
                        <p className="text-zinc-300 text-center mt-4">
                            Are you sure you want to end your career? All of your progress, including songs, stats, and money, will be permanently deleted. This action cannot be undone.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => setShowEndCareerConfirm(false)}
                                className="w-full h-12 bg-zinc-600 hover:bg-zinc-700 text-white font-bold rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEndCareer}
                                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                            >
                                Confirm & End Career
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showExportOptions && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowExportOptions(false)}>
                    <div className="w-full max-w-md bg-zinc-800 rounded-2xl shadow-lg p-8 border border-red-500/50" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold text-red-500 text-center">Export Save Data</h2>
                        <p className="text-zinc-300 text-center mt-4">
                            Your game progress will be saved as a `.json` file.
                        </p>
                        <div className="mt-8">
                            <button
                                onClick={handleExport}
                                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                            >
                                Export .json file
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-red-500">Misc & Stats</h2>

                <button onClick={handleInboxClick} className="w-full bg-zinc-800 p-4 rounded-lg text-left hover:bg-zinc-700 transition-colors flex justify-between items-center">
                    <div className="relative">
                        <h3 className="font-bold text-lg">Inbox</h3>
                        <p className="text-sm text-zinc-400">View messages and reports</p>
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-7 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <ChevronRightIcon className="w-6 h-6 text-zinc-500" />
                </button>
                
                <button onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: 'achievements' })} className="w-full bg-zinc-800 p-4 rounded-lg text-left hover:bg-zinc-700 transition-colors flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg">Achievements</h3>
                        <p className="text-sm text-zinc-400">View your career milestones</p>
                    </div>
                    <ChevronRightIcon className="w-6 h-6 text-zinc-500" />
                </button>

                <button onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: 'grammys' })} className="w-full bg-zinc-800 p-4 rounded-lg text-left hover:bg-zinc-700 transition-colors flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg">GRAMMY History</h3>
                        <p className="text-sm text-zinc-400">View your lifetime GRAMMY performance.</p>
                    </div>
                    <ChevronRightIcon className="w-6 h-6 text-zinc-500" />
                </button>
                
                <button onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: 'amas' })} className="w-full bg-zinc-800 p-4 rounded-lg text-left hover:bg-zinc-700 transition-colors flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg text-red-500">AMA History</h3>
                        <p className="text-sm text-zinc-400">View your lifetime American Music Awards performance.</p>
                    </div>
                    <ChevronRightIcon className="w-6 h-6 text-zinc-500" />
                </button>

                <button onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: 'redCarpetHistory' })} className="w-full bg-zinc-800 p-4 rounded-lg text-left hover:bg-zinc-700 transition-colors flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg">Red Carpet History</h3>
                        <p className="text-sm text-zinc-400">View your past red carpet looks</p>
                    </div>
                    <ChevronRightIcon className="w-6 h-6 text-zinc-500" />
                </button>

                 <button onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: 'globalLeaderboards' })} className="w-full bg-blue-900/20 p-4 rounded-lg text-left hover:bg-blue-900/30 transition-colors flex justify-between items-center border border-blue-900/50">
                    <div>
                        <h3 className="font-bold text-lg text-blue-500">Global Leaderboards</h3>
                        <p className="text-sm text-blue-300/70">See the top online players around the world.</p>
                    </div>
                    <ChevronRightIcon className="w-6 h-6 text-blue-500/50" />
                </button>

                 <button onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: 'dating' })} className="w-full bg-red-900/20 p-4 rounded-lg text-left hover:bg-red-900/30 transition-colors flex justify-between items-center border border-red-900/50">
                    <div>
                        <h3 className="font-bold text-lg text-red-500">Dating History</h3>
                        <p className="text-sm text-red-300/70">Manage your relationships and public image.</p>
                    </div>
                    <ChevronRightIcon className="w-6 h-6 text-red-500/50" />
                </button>

                 <button onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: 'chartHistory' })} className="w-full bg-zinc-800 p-4 rounded-lg text-left hover:bg-zinc-700 transition-colors flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg">Chart History</h3>
                        <p className="text-sm text-zinc-400">View your lifetime chart performance.</p>
                    </div>
                    <ChevronRightIcon className="w-6 h-6 text-zinc-500" />
                </button>

                <button onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: 'gameGuide' })} className="w-full bg-zinc-800 p-4 rounded-lg text-left hover:bg-zinc-700 transition-colors flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg">Game Guide</h3>
                        <p className="text-sm text-zinc-400">Learn how to play and master the game.</p>
                    </div>
                    <ChevronRightIcon className="w-6 h-6 text-zinc-500" />
                </button>

                <div className="bg-zinc-800 p-4 rounded-lg flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg">Public Encounters</h3>
                        <p className="text-sm text-zinc-400">Random popups from paparazzi or fans.</p>
                    </div>
                    <button 
                        onClick={() => dispatch({ type: 'TOGGLE_ENCOUNTERS' })}
                        className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors ${!gameState.disableEncounters ? 'bg-red-500' : 'bg-zinc-600'}`}
                    >
                        <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${!gameState.disableEncounters ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                </div>

                {gameState.careerMode !== 'online' && (
                    <div className="bg-zinc-800 p-4 rounded-lg">
                        <h3 className="font-bold text-lg mb-2">Red Mic Pro</h3>
                        {activeArtistData.redMicPro.unlocked ? (
                            <>
                                <p className="text-sm text-green-400 mb-2">You have Red Mic Pro! Enjoy exclusive features.</p>
                                <button onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: 'redMicProDashboard' })} className="w-full bg-yellow-500/20 text-yellow-300 p-3 rounded-lg text-left hover:bg-yellow-500/30 transition-colors flex justify-between items-center">
                                    <span>Open Pro Dashboard</span>
                                    <ChevronRightIcon className="w-6 h-6" />
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-zinc-400 mb-2">Unlock exclusive features to supercharge your career.</p>
                                <button onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: 'redMicProUnlock' })} className="w-full bg-red-900/50 p-3 rounded-lg text-left text-red-300 hover:bg-red-900 transition-colors flex justify-between items-center">
                                    <span>Learn More & Unlock</span>
                                    <ChevronRightIcon className="w-6 h-6" />
                                </button>
                            </>
                        )}
                    </div>
                )}

                 <div className="bg-zinc-800 p-4 rounded-lg">
                    <h3 className="font-bold text-lg mb-2">X Fan Content (Images)</h3>
                    <p className="text-sm text-zinc-400 mb-4">Upload images of your artist here. Fan accounts on X will randomly use them in their posts about you.</p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-4">
                        {activeArtistData.artistImages.map((img, index) => (
                            <img key={index} src={img} className="w-full aspect-square object-cover rounded-md bg-zinc-700"/>
                        ))}
                         {activeArtistData.artistImages.length < 100 && (
                            <label htmlFor="image-upload" className="w-full aspect-square bg-zinc-700 rounded-md border-2 border-dashed border-zinc-500 flex items-center justify-center cursor-pointer hover:border-red-500">
                                <span className="text-3xl text-zinc-500">+</span>
                                <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleMultipleImageUpload} multiple />
                            </label>
                        )}
                    </div>
                    <p className="text-xs text-zinc-500 text-right">{activeArtistData.artistImages.length} / 100 images</p>
                </div>
                
                 <div className="bg-zinc-800 p-4 rounded-lg">
                    <h3 className="font-bold text-lg mb-2">X Fan Content (Videos)</h3>
                    <p className="text-sm text-zinc-400 mb-4">Upload short video clips. Fan accounts will post them. A thumbnail will be generated automatically.</p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-4">
                        {activeArtistData.artistVideoThumbnails.map((thumb, index) => (
                            <div key={index} className="w-full aspect-square object-cover rounded-md bg-zinc-700 relative">
                                <img src={thumb} className="w-full h-full object-cover rounded-md"/>
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                </div>
                            </div>
                        ))}
                         {activeArtistData.artistVideoThumbnails.length < 10 && (
                            <label htmlFor="video-upload" className="w-full aspect-square bg-zinc-700 rounded-md border-2 border-dashed border-zinc-500 flex items-center justify-center cursor-pointer hover:border-red-500">
                                <span className="text-3xl text-zinc-500">+</span>
                                <input id="video-upload" type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                            </label>
                        )}
                    </div>
                    <p className="text-xs text-zinc-500 text-right">{activeArtistData.artistVideoThumbnails.length} / 10 videos</p>
                </div>

                <div className="bg-zinc-800 p-4 rounded-lg">
                    <h3 className="font-bold text-lg mb-2">Paparazzi Photos (for TMZ)</h3>
                    <p className="text-sm text-zinc-400 mb-4">Upload "paparazzi" style photos. TMZ may post these on X, creating news and controversy.</p>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label htmlFor="paparazzi-upload" className="w-full aspect-video bg-zinc-700 rounded-md border-2 border-dashed border-zinc-500 flex items-center justify-center cursor-pointer hover:border-red-500">
                                {paparazziImage ? <img src={paparazziImage} className="w-full h-full object-cover rounded-md"/> : <span className="text-zinc-400 text-sm">Upload Image</span>}
                                <input id="paparazzi-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setPaparazziImage)} />
                            </label>
                            <div className="space-y-2">
                                <select value={paparazziCategory} onChange={(e) => setPaparazziCategory(e.target.value as PaparazziPhotoCategory)} className="w-full bg-zinc-700 border-zinc-600 rounded-md shadow-sm h-10 px-3">
                                    <option>Spotted</option>
                                    <option>Scandal</option>
                                    <option>Fashion</option>
                                    <option>Candid</option>
                                </select>
                                <button onClick={handleAddPaparazziPhoto} disabled={!paparazziImage} className="w-full h-10 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg disabled:bg-zinc-600">
                                    Add Photo
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                             {activeArtistData.paparazziPhotos.map((photo) => (
                                <div key={photo.id} className="relative group">
                                    <img src={photo.image} className="w-full aspect-square object-cover rounded-md bg-zinc-700"/>
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs text-center p-1 rounded-b-md">{photo.category}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>


                <div className="bg-zinc-800 p-4 rounded-lg">
                    <h3 className="font-bold text-lg mb-2">Options</h3>
                    
                    {gameState.careerMode === 'online' && (
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-700">
                            <div>
                                <p className="font-bold">Feature Price</p>
                                <p className="text-xs text-zinc-400">Set the price for other online players to feature you on their songs.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-green-400">$</span>
                                <input 
                                    type="number" 
                                    min="0"
                                    value={activeArtistData.featurePrice || 50000}
                                    onChange={async (e) => {
                                        const price = parseInt(e.target.value) || 0;
                                        dispatch({ type: 'UPDATE_FEATURE_PRICE', payload: { price } });
                                        if (gameState.onlineArtist) {
                                            const { updateOnlineArtistFeaturePrice } = await import('../firebase');
                                            await updateOnlineArtistFeaturePrice(gameState.onlineArtist.id, price);
                                        }
                                    }}
                                    className="w-24 bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm font-bold focus:outline-none focus:border-red-500"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="font-bold">Switch Save</p>
                            <p className="text-xs text-zinc-400">Manage up to 6 completely separate game saves.</p>
                        </div>
                        <button 
                            onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: 'switchSave' })}
                            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm font-bold transition-colors"
                        >
                            Manage
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-bold flex items-center gap-2">
                                AI Features
                                {(!activeArtistData?.redMicPro?.unlocked) && <span className="text-[10px] bg-red-900 border border-red-700 text-red-100 px-1.5 py-0.5 rounded flex items-center gap-1 font-bold">PRO</span>}
                            </p>
                            <p className="text-xs text-zinc-400">Generate creative text using AI depending on your status.</p>
                        </div>
                        <button 
                            onClick={() => {
                                if (!activeArtistData?.redMicPro?.unlocked) {
                                    dispatch({ type: 'CHANGE_VIEW', payload: 'redMicProUnlock' });
                                } else {
                                    dispatch({ type: 'TOGGLE_OFFLINE_MODE' });
                                }
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${!gameState.offlineMode ? 'bg-red-500' : 'bg-zinc-600'} ${!activeArtistData?.redMicPro?.unlocked ? 'opacity-50' : ''}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${!gameState.offlineMode ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>

                <div className="bg-zinc-800 p-4 rounded-lg">
                    <h3 className="font-bold text-lg mb-2">Cloud Saves & Game Data</h3>
                    {user ? (
                        <>
                            <p className="text-sm text-green-400 mb-2">Signed in as <strong>{user.email}</strong>.</p>
                            <p className="text-xs text-zinc-400 mb-4">
                                Your game state automatically syncs to the cloud. <br/>
                                <span className="opacity-70">Current Save ID: {gameState.cloudSaveId || 'Pending...'}</span>
                            </p>
                            <button onClick={logout} className="w-full mb-4 bg-zinc-700 p-3 rounded-lg text-left text-white hover:bg-zinc-600 transition-colors flex justify-between items-center">
                                <span>Sign Out</span>
                                <ChevronRightIcon className="w-6 h-6" />
                            </button>
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-zinc-400 mb-2">Sign in to automatically sync your save to the cloud across devices.</p>
                            <button onClick={login} className="w-full mb-4 bg-blue-600 p-3 rounded-lg text-left text-white hover:bg-blue-700 transition-colors flex justify-between items-center">
                                <span>Sign In with Google</span>
                                <ChevronRightIcon className="w-6 h-6" />
                            </button>
                        </>
                    )}
                    <button onClick={() => setShowExportOptions(true)} className="w-full bg-zinc-700/50 p-3 rounded-lg text-left text-zinc-300 hover:bg-zinc-700 transition-colors flex justify-between items-center">
                        <span>Download Manual Save File</span>
                    </button>
                    <p className="text-xs text-zinc-500 mt-2">Download your game progress as a local file.</p>
                </div>

                <div className="bg-zinc-800 p-4 rounded-lg">
                    <h3 className="font-bold text-lg mb-2">Danger Zone</h3>
                    <button onClick={() => setShowEndCareerConfirm(true)} className="w-full bg-red-900/50 p-3 rounded-lg text-left text-red-300 hover:bg-red-900 transition-colors flex justify-between items-center">
                        <span>End Career</span>
                    </button>
                    <p className="text-xs text-zinc-500 mt-2">Permanently delete your saved game and start over. You will be returned to the main menu.</p>
                </div>
                <p className="text-center text-zinc-500 text-sm mt-8">Red Mic v1.0.0</p>
            </div>
        </>
    );
};

export default MiscTab;