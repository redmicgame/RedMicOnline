import React, { useEffect, useState, useRef } from 'react';
import { useGame, formatNumber } from '../context/GameContext';
import { db, getActiveSaveId, setActiveSaveId } from '../db/db';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import TrashIcon from './icons/TrashIcon'; // need this? Or use button text

const SwitchSaveView: React.FC = () => {
    const { gameState, dispatch } = useGame();
    const [saves, setSaves] = useState<Record<number, any>>({});
    const activeSaveId = getActiveSaveId();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadSaves = async () => {
        const allSaves = await db.saves.toArray();
        const savesMap: Record<number, any> = {};
        allSaves.forEach(save => {
            if (save.id !== undefined) {
                savesMap[save.id] = save.state;
            }
        });
        setSaves(savesMap);
    };

    useEffect(() => {
        loadSaves();
    }, []);

    const handleSwitch = (id: number) => {
        setActiveSaveId(id);
        window.location.reload();
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this save? This action cannot be undone.')) {
            await db.saves.delete(id);
            if (id === activeSaveId) {
                dispatch({ type: 'RESET_GAME' });
            } else {
                await loadSaves();
            }
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, slotId: number) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const content = e.target?.result as string;
                const parsedState = JSON.parse(content);
                if (parsedState && parsedState.date && parsedState.careerMode) {
                    await db.saves.put({ id: slotId, state: parsedState });
                    if (slotId === activeSaveId) {
                        dispatch({ type: 'LOAD_GAME', payload: parsedState });
                        window.location.reload();
                    } else {
                        await loadSaves();
                    }
                } else {
                    alert('Invalid save file format.');
                }
            } catch (err) {
                alert('Error parsing save file.');
            }
        };
        reader.readAsText(file);
    };

    const maxSlots = 6;
    const slots = Array.from({ length: maxSlots }, (_, i) => i + 1);

    return (
        <div className="space-y-6 pb-20 p-4">
             <div className="flex items-center space-x-4 mb-6">
                <button onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: 'game' })} className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold">Switch Save</h2>
            </div>
            
            <p className="text-zinc-400 text-sm">Manage up to {maxSlots} separate game saves. Click Switch to load a save or create a new one.</p>

            <div className="space-y-4">
                {slots.map(slotId => {
                    const saveState = saves[slotId];
                    const isActive = slotId === activeSaveId;

                    return (
                        <div key={slotId} className={`p-4 rounded-xl border-2 ${isActive ? 'bg-red-900/20 border-red-500' : 'bg-zinc-800 border-zinc-700'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-lg">Save Slot {slotId} {isActive && <span className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded-full uppercase tracking-wider">Active</span>}</h3>
                                    {saveState ? (
                                        <div className="text-sm text-zinc-400 space-y-1 mt-2">
                                            {saveState.careerMode === 'solo' && saveState.soloArtist && (
                                                <p>Artist: <span className="text-white font-medium">{saveState.soloArtist.name}</span></p>
                                            )}
                                            {saveState.careerMode === 'group' && saveState.group && (
                                                <p>Group: <span className="text-white font-medium">{saveState.group.name}</span></p>
                                            )}
                                            <p>Date: Year {saveState.date?.year}, Week {saveState.date?.week}</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-zinc-500 mt-2">Empty Slot</p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 items-end">
                                    {saveState ? (
                                        <>
                                            {!isActive && (
                                                <button onClick={() => handleSwitch(slotId)} className="px-4 py-2 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors text-sm">
                                                    Load Save
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(slotId)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors text-sm">
                                                Delete
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => handleSwitch(slotId)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors text-sm">
                                                Create New Game
                                            </button>
                                            <label className="cursor-pointer px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white font-bold rounded-lg transition-colors text-sm">
                                                Upload Save File
                                                <input
                                                    type="file"
                                                    accept=".json"
                                                    className="hidden"
                                                    onChange={(e) => handleFileUpload(e, slotId)}
                                                />
                                            </label>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SwitchSaveView;
