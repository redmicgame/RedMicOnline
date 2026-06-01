
import React, { useState } from 'react';
import { useGame, formatNumber } from '../context/GameContext';
import { LABELS } from '../constants';
import { createDefaultContract } from '../utils/contractUtils';
import type { Contract, Label, CustomLabel, LabelSubmission } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import ConfirmationModal from './ConfirmationModal';

import { ContractNegotiationModal } from './ContractNegotiationModal';

const getLabelAdvance = (label: Label) => {
    if (label.contractType === 'petty') return 1000000;
    if (label.id === 'umg') return 2500000;
    if (label.tier === 'Mid-high' || label.tier === 'Mid-Low' || label.tier === 'Top') return 750000;
    return 300000;
};

const getLabelSplit = (label: Label) => {
    if (label.contractType === 'petty') return '10% / 90%';
    if (label.id === 'umg') return '20% / 80%';
    if (label.tier === 'Mid-high' || label.tier === 'Mid-Low' || label.tier === 'Top') return '40% / 60%';
    return '50% / 50%';
};

const LabelCard: React.FC<{ label: Label, onSign: (label: Label) => void, canSign: boolean }> = ({ label, onSign, canSign }) => (
    <div className={`bg-zinc-800 p-4 rounded-lg flex flex-col items-center text-center transition-opacity ${!canSign ? 'opacity-50' : ''}`}>
        <img src={label.logo} alt={label.name} className="w-20 h-20 rounded-full object-cover mb-3" />
        <h3 className="text-lg font-bold">{label.name}</h3>
        <p className="text-sm font-semibold" style={{ color: label.tier === 'Top' ? '#f59e0b' : '#a1a1aa' }}>{label.tier} Tier</p>
        <div className="mt-3 text-xs text-zinc-400 space-y-1">
            <p>Promotion: <span className="font-bold text-white">{label.promotionMultiplier}x</span></p>
            <p>Adv: <span className="font-bold text-green-400 font-mono">${formatNumber(getLabelAdvance(label))}</span></p>
            <p>Cut (You/Label): <span className="font-bold text-yellow-400">{getLabelSplit(label)}</span></p>
            <p>Requires: <span className="font-bold text-white">{label.streamRequirement > 0 ? formatNumber(label.streamRequirement) + ' streams' : 'None'}</span></p>
        </div>
        <button 
            onClick={() => onSign(label)}
            disabled={!canSign}
            className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition-colors text-sm disabled:bg-zinc-600 disabled:cursor-not-allowed"
        >
            {canSign ? (label.contractType === 'petty' ? 'Join Label' : 'View Offer') : 'Locked'}
        </button>
    </div>
);

const SubmissionStatusBadge: React.FC<{ status: LabelSubmission['status'] }> = ({ status }) => {
    switch (status) {
        case 'pending':
            return <span className="text-xs font-bold text-yellow-400 bg-yellow-900/50 px-2 py-1 rounded-full">Pending</span>;
        case 'awaiting_player_input':
            return <span className="text-xs font-bold text-blue-400 bg-blue-900/50 px-2 py-1 rounded-full">Action Required</span>;
        case 'scheduled':
            return <span className="text-xs font-bold text-purple-400 bg-purple-900/50 px-2 py-1 rounded-full">Scheduled</span>;
        case 'rejected':
            return <span className="text-xs font-bold text-red-400 bg-red-900/50 px-2 py-1 rounded-full">Rejected</span>;
    }
}

const SubmissionItem: React.FC<{ submission: LabelSubmission }> = ({ submission }) => {
    const { dispatch } = useGame();

    const handlePlanRelease = () => {
        dispatch({ type: 'GO_TO_LABEL_PLAN', payload: { submissionId: submission.id } });
    };

    return (
        <div className="bg-zinc-800 p-3 rounded-lg flex items-center gap-4">
            <img src={submission.release.coverArt} alt={submission.release.title} className="w-16 h-16 rounded-md object-cover"/>
            <div className="flex-grow">
                <p className="font-bold">{submission.release.title}</p>
                <p className="text-sm text-zinc-400">{submission.release.type.replace(" (Deluxe)", "")}</p>
                {submission.status === 'scheduled' && submission.projectReleaseDate && (
                    <p className="text-xs text-green-300">Releasing W{submission.projectReleaseDate.week}, {submission.projectReleaseDate.year}</p>
                )}
            </div>
            <div className="flex flex-col items-end gap-2">
                <SubmissionStatusBadge status={submission.status} />
                {submission.status === 'awaiting_player_input' && (
                    <button onClick={handlePlanRelease} className="text-sm bg-blue-500 text-white font-semibold px-3 py-1 rounded-md hover:bg-blue-600">
                        Plan Release
                    </button>
                )}
            </div>
        </div>
    );
};


const SignedView: React.FC<{ contract: Contract }> = ({ contract }) => {
    const { gameState, dispatch, activeArtistData } = useGame();
    const { date } = gameState;
    const { labelSubmissions, contractHistory } = activeArtistData!;

    const allCustomLabels = Object.values(gameState.artistsData).flatMap(data => data.customLabels);

    const label = contract.isCustom 
        ? allCustomLabels.find(l => l.id === contract.labelId)
        : LABELS.find(l => l.id === contract.labelId);

    if (!label) return <p>Error: Label not found.</p>;

    if (contract.isCustom) {
        const customLabel = label as CustomLabel;
        const deal = LABELS.find(l => l.id === customLabel.dealWithMajorId);
        return (
            <div className="space-y-6">
                <div className="bg-zinc-800 rounded-lg p-6 flex flex-col items-center">
                    <img src={customLabel.logo} alt={customLabel.name} className="w-24 h-24 rounded-full object-cover mb-4" />
                    <h3 className="text-2xl font-bold">{customLabel.name}</h3>
                    <p className="text-zinc-400 mt-1">You are signed to your own label.</p>
                    {deal && (
                        <p className="text-sm text-blue-300 mt-2">Distribution deal with {deal.name}</p>
                    )}
                    <div className="w-full mt-6 text-center text-sm">
                        <p className="text-zinc-300">As the owner, you have full creative control. Submissions are auto-approved.</p>
                        {deal ? (
                             <p className="text-zinc-400 mt-2">Your releases must meet the quality standards of {deal.name}.</p>
                        ) : (
                            <p className="text-zinc-400 mt-2">You can seek a major label distribution deal to improve your promotional power.</p>
                        )}
                        <button onClick={() => dispatch({type: 'CHANGE_VIEW', payload: 'manageLabel'})} className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors text-base">
                            Manage Artists & Roster
                        </button>
                    </div>
                </div>
                 <button onClick={() => dispatch({type: 'END_CONTRACT'})} className="w-full text-center text-sm text-zinc-500 hover:text-red-500">
                    Go Independent
                </button>
            </div>
        )
    }

    const majorLabel = label as Label;
    const isPetty = majorLabel.contractType === 'petty';

    const weeksPassed = (date.year * 52 + date.week) - (contract.startDate.year * 52 + contract.startDate.week);
    const weeksRemaining = contract.durationWeeks ? contract.durationWeeks - weeksPassed : Infinity;
    const yearsRemaining = contract.durationWeeks ? (weeksRemaining / 52).toFixed(1) : '∞';

    const progressPercentage = contract.albumQuota ? (contract.albumsReleased / contract.albumQuota) * 100 : 0;

    return (
        <div className="space-y-6">
            <div className="bg-zinc-800 rounded-lg p-6 flex flex-col items-center">
                <img src={majorLabel.logo} alt={majorLabel.name} className="w-24 h-24 rounded-full object-cover mb-4" />
                <h3 className="text-2xl font-bold">{majorLabel.name}</h3>
                <p className="text-zinc-400">{majorLabel.tier} Tier Label</p>
                <div className="mt-3 text-sm text-center">
                    <p className="text-zinc-300">Revenue Split (You/Label): <span className="font-bold text-yellow-400">{getLabelSplit(majorLabel)}</span></p>
                </div>
                {isPetty && (
                    <button onClick={() => dispatch({type: 'END_CONTRACT'})} className="mt-4 bg-red-900/50 text-red-400 font-bold px-4 py-2 rounded-md text-sm hover:bg-red-900">
                        Leave Label
                    </button>
                )}
                <div className="w-full mt-6 space-y-4">
                    {!isPetty && contract.durationWeeks && (
                        <>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-semibold text-zinc-300">Time Remaining</span>
                                    <span className="text-zinc-400">{weeksRemaining} weeks (~{yearsRemaining} years)</span>
                                </div>
                                <div className="w-full bg-zinc-700 rounded-full h-2.5">
                                    <div className="bg-red-600 h-2.5 rounded-full" style={{width: `${Math.max(0, Math.min(100, (weeksRemaining / contract.durationWeeks) * 100))}%`}}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-semibold text-zinc-300">Album Quota</span>
                                    <span className="text-zinc-400">{contract.albumsReleased} / {contract.albumQuota} Albums</span>
                                </div>
                                <div className="w-full bg-zinc-700 rounded-full h-2.5">
                                    <div className="bg-blue-500 h-2.5 rounded-full" style={{width: `${progressPercentage}%`}}></div>
                                </div>
                            </div>
                        </>
                    )}
                    
                    {!isPetty && (
                        <div className="bg-zinc-700/30 p-4 rounded-xl space-y-3 text-sm text-zinc-300 mt-4">
                            <h4 className="font-bold text-white mb-2 uppercase text-xs tracking-widest text-zinc-400">Contract Terms</h4>
                            <div className="flex justify-between border-b border-zinc-700/50 pb-2">
                                <span>Advance:</span>
                                <span className="font-mono text-green-400">${formatNumber(contract.advance || 0)}</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-700/50 pb-2">
                                <span>Royalty Split:</span>
                                <span className="font-mono">{contract.royaltyPercent || 15}% Artist</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-700/50 pb-2">
                                <span>Masters Ownership:</span>
                                <span className="font-mono">
                                    {contract.mastersOwnership === 'Label' ? '0% Artist' 
                                    : contract.mastersOwnership === 'Artist' ? '100% Artist' 
                                    : `${contract.mastersSplitPercent || 0}% Artist`}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-700/50 pb-2">
                                <span>Marketing Budget:</span>
                                <span className="font-mono text-blue-400">${formatNumber(contract.marketingBudget || 0)} <span className="text-xs text-zinc-500">(Available for Promo)</span></span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-700/50 pb-2">
                                <span>Tour Support:</span>
                                <span className="font-mono text-blue-400">${formatNumber(contract.tourSupport || 0)}</span>
                            </div>
                            <div className="flex justify-between pb-2">
                                <span>Recoupment:</span>
                                <span className="font-mono">{contract.recoupmentTerms || '100%'}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {labelSubmissions.length > 0 && (
                 <div className="space-y-4">
                    <h2 className="text-xl font-bold">Label Submissions</h2>
                    <div className="space-y-3">
                        {labelSubmissions.map(sub => <SubmissionItem key={sub.id} submission={sub} />)}
                    </div>
                </div>
            )}
            {contractHistory.length > 0 && (
                <div className="space-y-4 mt-6">
                    <h2 className="text-xl font-bold">Past Contracts</h2>
                    <div className="space-y-3">
                        {contractHistory.map(pastContract => {
                            const pastLabel = pastContract.isCustom 
                                ? allCustomLabels.find(l => l.id === pastContract.labelId) 
                                : LABELS.find(l => l.id === pastContract.labelId);
                            if (!pastLabel) return null;

                            const hasLabelChannel = !pastContract.isCustom && (pastLabel as Label).youtubeChannel;

                            const durationWeeks = pastContract.durationWeeks || 0;
                            const endWeekRaw = pastContract.startDate.week + durationWeeks;
                            const endDate = {
                                week: (endWeekRaw - 1) % 52 + 1,
                                year: pastContract.startDate.year + Math.floor((endWeekRaw - 1) / 52)
                            };

                            return (
                                <div key={pastLabel.id} className="bg-zinc-800 p-3 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <img src={pastLabel.logo} alt={pastLabel.name} className="w-12 h-12 rounded-full object-cover"/>
                                        <div className="flex-grow">
                                            <p className="font-bold">{pastLabel.name}</p>
                                            <p className="text-sm text-zinc-400">Ended: W{endDate.week}, {endDate.year}</p>
                                        </div>
                                        {hasLabelChannel && (
                                            <button
                                                onClick={() => dispatch({ type: 'VIEW_PAST_LABEL_CHANNEL', payload: pastLabel.id })}
                                                className="bg-blue-600/20 text-blue-300 font-bold px-3 py-1.5 rounded-md text-sm hover:bg-blue-600/40"
                                            >
                                                View Channel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

const UnsignedView: React.FC = () => {
    const { gameState, dispatch, activeArtist, activeArtistData } = useGame();
    // offerModalLabel is used to start the name check process
    const [offerModalLabel, setOfferModalLabel] = useState<Label | null>(null);
    const [confirmPettyJoin, setConfirmPettyJoin] = useState<Label | null>(null);
    
    // negotiationLabel is used to show the negotiation UI after name check
    const [negotiationLabel, setNegotiationLabel] = useState<Label | null>(null);
    
    const [nameChangeReq, setNameChangeReq] = useState<{
        label: Label;
        type: 'petty' | 'small';
        options?: string[];
        fee?: number;
    } | null>(null);
    const [nameChangeInput, setNameChangeInput] = useState('');

    if (!activeArtistData || !activeArtist) return null;
    const careerStreams = activeArtistData.songs.reduce((sum, song) => sum + song.streams, 0);

    const standardLabels = LABELS.filter(l => l.contractType !== 'petty');
    const pettyLabels = LABELS.filter(l => l.contractType === 'petty');

    const handleSignWithCheck = (label: Label, isPetty: boolean = false) => {
        // 50% chance for small/petty labels to require a name change
        if ((label.contractType === 'petty' || label.tier === 'Low') && Math.random() < 0.5) {
            if (label.contractType === 'petty') {
                const randomNames = [
                    `${activeArtist.name} The Creator`,
                    `Lil ${activeArtist.name.split(' ')[0]}`,
                    `${activeArtist.name} Da Don`
                ];
                setNameChangeReq({ label, type: 'petty', options: randomNames });
                setNameChangeInput(randomNames[0]);
            } else {
                setNameChangeReq({ label, type: 'small', fee: Math.floor(Math.random() * (30000 - 20000 + 1)) + 20000 });
                setNameChangeInput(activeArtist.name); // Default to current name if they decide to change it anyway
            }
            if (isPetty) setConfirmPettyJoin(null);
            else setOfferModalLabel(null);
            return;
        }

        if (isPetty) handleSignPetty(label);
        else {
            setOfferModalLabel(null);
            setNegotiationLabel(label); // Open negotiation
        }
    };

    const handleSignNegotiatedContract = (contract: Contract) => {
        dispatch({ type: 'SIGN_CONTRACT', payload: { contract } });
        setNegotiationLabel(null);
    };

     const handleSignPetty = (label: Label) => {
        const newContract: Contract = createDefaultContract({
            labelId: label.id,
            artistId: activeArtist!.id,
            startDate: gameState.date,
            albumsReleased: 0
        });
        dispatch({ type: 'SIGN_CONTRACT', payload: { contract: newContract } });
        setConfirmPettyJoin(null);
    };

    const confirmNameChangeAndSign = (payFee: boolean = false) => {
        if (!nameChangeReq) return;
        
        const isPetty = nameChangeReq.label.contractType === 'petty';
        
        if (payFee && nameChangeReq.fee) {
            if (activeArtistData.money < nameChangeReq.fee) return;
            // Pay fee and keep name
            dispatch({ type: 'CHANGE_STAGE_NAME', payload: { newName: activeArtist.name, cost: nameChangeReq.fee, contractId: 'TEMP' } });
        } else {
            // Change name
            if (!nameChangeInput.trim()) return;
            dispatch({ type: 'CHANGE_STAGE_NAME', payload: { newName: nameChangeInput.trim(), contractId: 'TEMP' } });
        }

        if (isPetty) handleSignPetty(nameChangeReq.label);
        else setNegotiationLabel(nameChangeReq.label);
        
        setNameChangeReq(null);
    };
    
    return (
        <>
            {negotiationLabel && (
                <ContractNegotiationModal
                    label={negotiationLabel}
                    careerStreams={careerStreams}
                    onClose={() => setNegotiationLabel(null)}
                    onSign={handleSignNegotiatedContract}
                />
            )}
            {offerModalLabel && (
                <ConfirmationModal
                    isOpen={!!offerModalLabel}
                    onClose={() => setOfferModalLabel(null)}
                    onConfirm={() => handleSignWithCheck(offerModalLabel)}
                    title="Contract Offer"
                    message={`Begin negotiations with ${offerModalLabel.name}?`}
                    confirmText="Negotiate"
                />
            )}
            {confirmPettyJoin && (
                 <ConfirmationModal
                    isOpen={!!confirmPettyJoin}
                    onClose={() => setConfirmPettyJoin(null)}
                    onConfirm={() => handleSignWithCheck(confirmPettyJoin, true)}
                    title={`Join ${confirmPettyJoin.name}?`}
                    message={`By joining ${confirmPettyJoin.name}, you agree to their terms: a minimum release quality of 70. You can leave at any time, but they may fine you up to $1M and remove all music released under their name from streaming services.`}
                    confirmText="Agree & Join"
                />
            )}
            {nameChangeReq && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setNameChangeReq(null)}>
                    <div className="bg-white rounded-lg w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold mb-4 text-black">Stage Name Change Requested</h2>
                        
                        {nameChangeReq.type === 'petty' ? (
                            <>
                                <p className="text-zinc-600 mb-4">The label expects you to adopt a new stage name. Please select one of the following options:</p>
                                <div className="space-y-2 mb-4">
                                    {nameChangeReq.options?.map(opt => (
                                        <button 
                                            key={opt}
                                            onClick={() => setNameChangeInput(opt)}
                                            className={`w-full p-3 rounded-lg text-left ${nameChangeInput === opt ? 'bg-red-100 text-red-900 border-2 border-red-500' : 'bg-zinc-100 text-black border-2 border-transparent'}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setNameChangeReq(null)} className="w-full bg-zinc-200 text-black py-2 rounded-full font-semibold">Cancel</button>
                                    <button onClick={() => confirmNameChangeAndSign()} className="w-full bg-black text-white py-2 rounded-full font-semibold">Accept & Sign</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-zinc-600 mb-4">The label would prefer you change your stage name. You can either change it now, or pay a <strong>Name Change Settlement Fee</strong> to keep your current name.</p>
                                
                                <label className="block mb-4">
                                    <span className="text-black font-semibold">New Stage Name</span>
                                    <input 
                                        type="text" 
                                        className="w-full p-2 border border-zinc-300 rounded-lg text-black mt-1" 
                                        value={nameChangeInput}
                                        onChange={(e) => setNameChangeInput(e.target.value)}
                                        maxLength={30}
                                    />
                                </label>

                                <div className="flex flex-col gap-3">
                                    <button 
                                        onClick={() => confirmNameChangeAndSign()} 
                                        disabled={!nameChangeInput.trim()} 
                                        className="w-full bg-black text-white py-2 rounded-full font-semibold disabled:bg-zinc-400"
                                    >
                                        Change Name & Sign
                                    </button>
                                    
                                    <button 
                                        onClick={() => confirmNameChangeAndSign(true)} 
                                        disabled={activeArtistData.money < (nameChangeReq.fee || 0)} 
                                        className="w-full bg-red-600 text-white py-2 rounded-full font-semibold disabled:bg-zinc-400 flex flex-col items-center"
                                    >
                                        <span>Keep Current Name (-${(nameChangeReq.fee || 0).toLocaleString()})</span>
                                    </button>

                                    <button onClick={() => setNameChangeReq(null)} className="w-full bg-zinc-200 text-black py-2 rounded-full font-semibold mt-2">Cancel Contract</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
            <div className="space-y-8">
                <div className="text-center">
                    <p className="text-zinc-400 mt-1">Sign with a major label or create your own.</p>
                     <button 
                        onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: 'createLabel' })}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors text-base"
                    >
                        Create Your Own Label
                    </button>
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-4">Boutique Labels</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pettyLabels.map(label => (
                            <LabelCard 
                                key={label.id} 
                                label={label} 
                                onSign={setConfirmPettyJoin} 
                                canSign={true}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-4">Major Labels</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {standardLabels.map(label => {
                            const canSign = careerStreams >= label.streamRequirement;
                            return (
                                <LabelCard 
                                    key={label.id} 
                                    label={label} 
                                    onSign={setOfferModalLabel} 
                                    canSign={canSign}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
};


const LabelsView: React.FC = () => {
    const { dispatch, activeArtistData } = useGame();
    if (!activeArtistData) return null;

    const { contract } = activeArtistData;

    return (
        <div className="h-screen w-full bg-zinc-900 overflow-y-auto">
            <header className="p-4 flex items-center gap-4 sticky top-0 bg-zinc-900/80 backdrop-blur-sm z-10 border-b border-zinc-700/50">
                <button onClick={() => dispatch({type: 'CHANGE_VIEW', payload: 'game'})} className="p-2 rounded-full hover:bg-white/10">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold">{contract ? 'Current Contract' : 'Record Labels'}</h1>
            </header>
            <main className="p-4">
                {contract ? <SignedView contract={contract} /> : <UnsignedView />}
            </main>
        </div>
    );
};

export default LabelsView;
