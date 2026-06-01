
import React, { useState } from 'react';
import { useGame, formatNumber } from '../context/GameContext';
import { MANAGERS } from '../constants';
import { Manager } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import ConfirmationModal from './ConfirmationModal';

const ManagementView: React.FC = () => {
    const { gameState, dispatch, activeArtistData } = useGame();
    const [confirmHire, setConfirmHire] = useState<Manager | null>(null);
    const [confirmFire, setConfirmFire] = useState(false);

    if (!activeArtistData) return null;
    const { money, manager } = activeArtistData;

    const currentManager = manager ? MANAGERS.find(m => m.id === manager.id) : null;

    const handleHire = (managerToHire: Manager) => {
        dispatch({ type: 'HIRE_MANAGER', payload: { managerId: managerToHire.id } });
        setConfirmHire(null);
    };

    const handleFire = () => {
        dispatch({ type: 'FIRE_MANAGER' });
        setConfirmFire(false);
    };

    return (
        <>
            {confirmHire && (
                <ConfirmationModal
                    isOpen={!!confirmHire}
                    onClose={() => setConfirmHire(null)}
                    onConfirm={() => handleHire(confirmHire)}
                    title={`Hire ${confirmHire.name}?`}
                    message={`This will immediately deduct the yearly salary of $${formatNumber(confirmHire.yearlyCost)} from your account. Are you sure?`}
                    confirmText="Confirm Hire"
                />
            )}
            {confirmFire && currentManager && (
                 <ConfirmationModal
                    isOpen={confirmFire}
                    onClose={() => setConfirmFire(false)}
                    onConfirm={handleFire}
                    title={`Fire ${currentManager.name}?`}
                    message={`Are you sure you want to fire your manager? Their contract will be terminated immediately. You will not be refunded for the remainder of the year.`}
                    confirmText="Fire Manager"
                />
            )}
            <div className="h-screen w-full bg-zinc-900 overflow-y-auto">
                <header className="p-4 flex items-center gap-4 sticky top-0 bg-zinc-900/80 backdrop-blur-sm z-10 border-b border-zinc-700/50">
                    <button onClick={() => dispatch({type: 'CHANGE_VIEW', payload: 'game'})} className="p-2 rounded-full hover:bg-white/10">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold">Management</h1>
                </header>
                <main className="p-4 space-y-6">
                    {currentManager ? (
                         <div className="bg-zinc-800 p-4 rounded-lg">
                            <h2 className="text-xl font-bold">Your Manager</h2>
                            <div className="mt-4 text-center">
                                <h3 className="text-2xl font-bold">{currentManager.name}</h3>
                                <p className="text-zinc-400 mt-2">Contract ends: W{manager!.contractEndDate.week}, {manager!.contractEndDate.year}</p>
                                <button onClick={() => setConfirmFire(true)} className="mt-4 bg-red-600/20 text-red-400 font-bold px-4 py-2 rounded-md text-sm hover:bg-red-600/40">
                                    Fire Manager
                                </button>
                            </div>
                        </div>
                    ) : (
                         <div>
                            <h2 className="text-xl font-bold mb-3">Available Managers</h2>
                            <div className="space-y-4">
                                {MANAGERS.map(m => {
                                    const canAfford = money >= m.yearlyCost;
                                    return (
                                        <div key={m.id} className="bg-zinc-800 p-4 rounded-lg">
                                            <h3 className="text-xl font-bold">{m.name}</h3>
                                            <p className={`font-bold text-lg ${canAfford ? 'text-green-400' : 'text-red-500'}`}>${formatNumber(m.yearlyCost)}<span className="text-sm font-normal text-zinc-400">/year</span></p>
                                            <ul className="list-disc list-inside text-sm text-zinc-300 mt-2 space-y-1">
                                                <li>+{m.popularityBoost} yearly popularity</li>
                                                <li>Auto-books {m.autoGigsPerWeek} gig{m.autoGigsPerWeek > 1 ? 's' : ''} per week</li>
                                                <li>Unlocks Tier {m.unlocksTier} gigs</li>
                                            </ul>
                                            <button onClick={() => setConfirmHire(m)} disabled={!canAfford} className="mt-4 w-full bg-red-600 font-bold p-2 rounded-lg disabled:bg-zinc-600">
                                                Hire
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
};

export default ManagementView;
