

import React, { useState, useMemo } from 'react';
import { useGame, formatNumber } from '../context/GameContext';
import { PROMOTION_PACKAGES, LABELS, TIER_LEVELS } from '../constants';
import type { Song, Video, Promotion, Label } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import ConfirmationModal from './ConfirmationModal';

type Section = 'songs' | 'videos' | 'resurgence';

type PromotionPackage = (typeof PROMOTION_PACKAGES.song)[0] | (typeof PROMOTION_PACKAGES.video)[0] | (typeof PROMOTION_PACKAGES.resurgence)[0];

const PromotionModal: React.FC<{
    title: string;
    packages: Array<PromotionPackage>;
    onClose: () => void;
    onSelectPackage: (pkg: PromotionPackage, quality: 'low' | 'medium' | 'high') => void;
    money: number;
    marketingBudget?: number;
    selectedCount?: number;
}> = ({ title, packages, onClose, onSelectPackage, money, marketingBudget = 0, selectedCount = 1 }) => {
    const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('low');

    const qualityMultiplier = quality === 'high' ? 3 : quality === 'medium' ? 1.5 : 1;
    const totalFunds = money + marketingBudget;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-lg bg-zinc-800 rounded-2xl shadow-lg border border-red-500/30 p-6 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-center mb-4">{title}</h2>
                
                {marketingBudget > 0 && (
                    <div className="mb-4 bg-zinc-700/50 rounded-lg p-3 border border-blue-500/30">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-semibold text-blue-400">Marketing Budget Available</span>
                            <span className="font-mono text-sm">${formatNumber(marketingBudget)}</span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-1.5">
                            <div className="bg-blue-500 h-1.5 rounded-full" style={{width: '100%'}}></div>
                        </div>
                    </div>
                )}
                
                <div className="mb-6 bg-zinc-900 rounded-lg p-1 flex">
                    <button 
                        onClick={() => setQuality('low')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${quality === 'low' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                    >
                        Low Quality
                    </button>
                    <button 
                        onClick={() => setQuality('medium')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${quality === 'medium' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                    >
                        Medium Quality
                    </button>
                    <button 
                        onClick={() => setQuality('high')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${quality === 'high' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                    >
                        High Quality
                    </button>
                </div>

                <div className="overflow-y-auto space-y-4 pr-2">
                    {packages.map(pkg => {
                        const totalCost = pkg.weeklyCost * selectedCount * qualityMultiplier;
                        const canAfford = totalFunds >= totalCost;
                        const usedBudget = Math.min(marketingBudget, totalCost);
                        return (
                            <button
                                key={pkg.name}
                                onClick={() => onSelectPackage(pkg, quality)}
                                disabled={!canAfford}
                                className="w-full p-4 rounded-lg text-left transition-colors border-2 border-zinc-700 bg-zinc-800 hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-zinc-700"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg">{pkg.name}</h3>
                                        <p className="text-sm text-zinc-400">{pkg.description}</p>
                                        {usedBudget > 0 && <span className="inline-block mt-1 bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded border border-blue-500/30 font-semibold">Uses Budget</span>}
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-4">
                                        <p className={`font-bold ${canAfford ? 'text-green-400' : 'text-red-500'}`}>
                                            ${formatNumber(totalCost)}
                                        </p>
                                        {'boost' in pkg && pkg.boost > 0 && <p className="text-sm text-blue-400">{pkg.boost}x Boost</p>}
                                        <p className="text-xs text-zinc-500">per week</p>
                                    </div>
                                </div>
                            </button>
                        )
                    })}
                </div>
                <button onClick={onClose} className="mt-6 w-full text-center text-sm text-zinc-400 hover:text-white">Cancel</button>
            </div>
        </div>
    );
};


const PromoteView: React.FC = () => {
    const { gameState, dispatch, activeArtistData } = useGame();
    const { date } = gameState;
    const [activeSection, setActiveSection] = useState<Section>('songs');
    
    // State for multi-select songs
    const [selectedSongIds, setSelectedSongIds] = useState<Set<string>>(new Set());
    const [isSongModalOpen, setIsSongModalOpen] = useState(false);

    // State for single-select videos/resurgence
    const [selectedSingleItem, setSelectedSingleItem] = useState<{ item: Video | Song; type: 'video' | 'song' } | null>(null);
    const [confirmCancel, setConfirmCancel] = useState<string | null>(null); // store promotionId


    if (!activeArtistData) return null;
    const { songs, releases, videos, promotions, contract, customLabels, money } = activeArtistData;

    const promotedItemIds = useMemo(() => new Set(promotions.map(p => p.itemId)), [promotions]);

    const promotableSongs = useMemo(() => {
        return songs.filter(s => s.isReleased && !promotedItemIds.has(s.id));
    }, [songs, promotedItemIds]);

    const promotableVideos = useMemo(() => {
        return videos.filter(v => !promotedItemIds.has(v.id));
    }, [videos, promotedItemIds]);

    const promotableOldSongs = useMemo(() => {
        return songs.filter(s => {
            const release = releases.find(r => r.id === s.releaseId);
            if (!s.isReleased || !release || promotedItemIds.has(s.id)) return false;
            return date.year - release.releaseDate.year >= 3;
        });
    }, [songs, releases, date, promotedItemIds]);
    
    // --- LABEL & PROMOTION TIER LOGIC ---
    const { availableSongPackages, isIndie } = useMemo(() => {
        if (!contract) return { availableSongPackages: [], isIndie: false };

        let effectiveLabel: Label | undefined;
        let isIndie = false;

        if (contract.isCustom) {
            const customLabel = customLabels.find(l => l.id === contract.labelId);
            if (customLabel?.dealWithMajorId) {
                effectiveLabel = LABELS.find(l => l.id === customLabel.dealWithMajorId);
            } else {
                isIndie = true;
            }
        } else {
            effectiveLabel = LABELS.find(l => l.id === contract.labelId);
        }

        if (isIndie) {
            return { availableSongPackages: [PROMOTION_PACKAGES.song[0]], isIndie: true };
        }
        
        if (effectiveLabel) {
            const tierLevel = TIER_LEVELS[effectiveLabel.tier];
            const packages = PROMOTION_PACKAGES.song.filter(p => TIER_LEVELS[p.requiredTier] <= tierLevel);
            return { availableSongPackages: packages, isIndie: false };
        }

        return { availableSongPackages: [], isIndie: false };

    }, [contract, customLabels]);

    // --- HANDLERS ---
    const handleToggleSong = (songId: string) => {
        const newSelection = new Set(selectedSongIds);
        if (newSelection.has(songId)) {
            newSelection.delete(songId);
        } else {
            newSelection.add(songId);
        }
        setSelectedSongIds(newSelection);
    };

    const handleSelectAllSongs = () => {
        setSelectedSongIds(new Set(promotableSongs.map(s => s.id)));
    };
    
    const handleDeselectAllSongs = () => {
        setSelectedSongIds(new Set());
    };

    const handleSelectPackageForSongs = (pkg: PromotionPackage, quality: 'low' | 'medium' | 'high') => {
        const qualityMultiplier = quality === 'high' ? 3 : quality === 'medium' ? 1.5 : 1;
        const totalCost = pkg.weeklyCost * selectedSongIds.size * qualityMultiplier;
        const totalFunds = money + (contract?.marketingBudget || 0);
        if (totalFunds < totalCost) return;

        for (const songId of selectedSongIds) {
            const song = promotableSongs.find(s => s.id === songId);
            if (song) {
                const newPromotion: Promotion = {
                    id: crypto.randomUUID(),
                    itemId: song.id,
                    itemType: 'song',
                    promoType: pkg.name,
                    promoQuality: quality,
                    weeklyCost: pkg.weeklyCost * qualityMultiplier,
                    boostMultiplier: 'boost' in pkg ? pkg.boost : 1,
                    artistId: song.artistId,
                };
                dispatch({ type: 'START_PROMOTION', payload: { promotion: newPromotion } });
            }
        }
        setIsSongModalOpen(false);
        setSelectedSongIds(new Set());
    };
    
    const handleSelectPackageForSingleItem = (pkg: PromotionPackage, quality: 'low' | 'medium' | 'high') => {
        const qualityMultiplier = quality === 'high' ? 3 : quality === 'medium' ? 1.5 : 1;
        const totalCost = pkg.weeklyCost * qualityMultiplier;
        const totalFunds = money + (contract?.marketingBudget || 0);
        if (!selectedSingleItem || totalFunds < totalCost) return;

        const newPromotion: Promotion = {
            id: crypto.randomUUID(),
            itemId: selectedSingleItem.item.id,
            itemType: selectedSingleItem.type,
            promoType: pkg.name,
            promoQuality: quality,
            weeklyCost: pkg.weeklyCost * qualityMultiplier,
            boostMultiplier: 'boost' in pkg ? pkg.boost : 1,
            artistId: selectedSingleItem.item.artistId,
        };
        dispatch({ type: 'START_PROMOTION', payload: { promotion: newPromotion } });
        setSelectedSingleItem(null);
    };
    
    const handleCancelPromotion = (promotionId: string) => {
        setConfirmCancel(promotionId);
    };
    
    const handleConfirmCancel = () => {
        if (confirmCancel) {
            dispatch({ type: 'CANCEL_PROMOTION', payload: { promotionId: confirmCancel } });
            setConfirmCancel(null);
        }
    };


    const renderContent = () => {
        switch (activeSection) {
            case 'songs':
                if (!contract) {
                    return <div className="text-center text-zinc-400 p-8 bg-zinc-800 rounded-lg">You must be signed to a label to run song promotion campaigns. Visit the 'Labels' tab to get a deal.</div>;
                }
                return (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Select songs to promote</h3>
                            <div className="flex gap-2">
                                <button onClick={handleDeselectAllSongs} className="text-xs font-semibold text-zinc-400 hover:text-white">Deselect All</button>
                                <button onClick={handleSelectAllSongs} className="text-xs font-semibold text-zinc-400 hover:text-white">Select All</button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {promotableSongs.map(item => {
                                const isSelected = selectedSongIds.has(item.id);
                                return (
                                <button key={item.id} onClick={() => handleToggleSong(item.id)} className={`w-full flex items-center gap-4 p-2 rounded-lg transition-colors ${isSelected ? 'bg-red-500/20 ring-2 ring-red-500' : 'hover:bg-zinc-800'}`}>
                                    <input type="checkbox" readOnly checked={isSelected} className="form-checkbox h-5 w-5 rounded bg-zinc-700 border-zinc-600 text-red-600 focus:ring-red-500 flex-shrink-0" />
                                    <img src={item.coverArt} alt={item.title} className="w-12 h-12 rounded-md object-cover"/>
                                    <div className="text-left">
                                        <p className="font-semibold">{item.title}</p>
                                        <p className="text-xs text-zinc-400">{releases.find(r => r.id === item.releaseId)?.title}</p>
                                    </div>
                                </button>
                                )
                            })}
                            {promotableSongs.length === 0 && <p className="text-sm text-zinc-500 p-4 text-center">No eligible songs to promote right now.</p>}
                        </div>
                    </>
                );
            case 'videos':
                 return (
                    <div className="space-y-2">
                         {promotableVideos.map(item => (
                            <button key={item.id} onClick={() => setSelectedSingleItem({item, type: 'video'})} className="w-full flex items-center gap-4 p-2 rounded-lg hover:bg-zinc-800">
                                <img src={item.thumbnail} alt={item.title} className="w-20 aspect-video rounded-md object-cover"/>
                                <div className="text-left"><p className="font-semibold">{item.title}</p><p className="text-xs text-zinc-400">{formatNumber(item.views)} views</p></div>
                            </button>
                        ))}
                        {promotableVideos.length === 0 && <p className="text-sm text-zinc-500 p-4 text-center">No eligible videos.</p>}
                    </div>
                );
            case 'resurgence':
                if (!contract) {
                     return <div className="text-center text-zinc-400 p-8 bg-zinc-800 rounded-lg">You must be signed to a label to run resurgence campaigns.</div>;
                }
                return (
                    <div className="space-y-2">
                         {promotableOldSongs.map(item => (
                            <button key={item.id} onClick={() => setSelectedSingleItem({item, type: 'song'})} className="w-full flex items-center gap-4 p-2 rounded-lg hover:bg-zinc-800">
                                <img src={item.coverArt} alt={item.title} className="w-12 h-12 rounded-md object-cover"/>
                                <div className="text-left"><p className="font-semibold">{item.title}</p><p className="text-xs text-zinc-400">Released {date.year - releases.find(r=>r.id === item.releaseId)!.releaseDate.year} years ago</p></div>
                            </button>
                        ))}
                        {promotableOldSongs.length === 0 && <p className="text-sm text-zinc-500 p-4 text-center">No songs are 3+ years old yet.</p>}
                    </div>
                );
        }
    }
    
    return (
        <>
            {isSongModalOpen && (
                <PromotionModal
                    title={`Payola for ${selectedSongIds.size} Songs`}
                    packages={availableSongPackages}
                    onClose={() => setIsSongModalOpen(false)}
                    onSelectPackage={handleSelectPackageForSongs}
                    money={money}
                    marketingBudget={contract?.marketingBudget}
                    selectedCount={selectedSongIds.size}
                />
            )}
            {selectedSingleItem && (
                 <PromotionModal
                    title={`Payola for "${selectedSingleItem.item.title}"`}
                    packages={selectedSingleItem.type === 'video' ? PROMOTION_PACKAGES.video : PROMOTION_PACKAGES.resurgence}
                    onClose={() => setSelectedSingleItem(null)}
                    onSelectPackage={handleSelectPackageForSingleItem}
                    money={money}
                    marketingBudget={contract?.marketingBudget}
                />
            )}
             <ConfirmationModal
                isOpen={!!confirmCancel}
                onClose={() => setConfirmCancel(null)}
                onConfirm={handleConfirmCancel}
                title="Cancel Campaign?"
                message="Are you sure you want to cancel this campaign? It will stop at the end of the week."
                confirmText="Cancel Campaign"
            />
            <div className="h-screen w-full bg-zinc-900 flex flex-col">
                <header className="p-4 flex items-center gap-4 sticky top-0 bg-zinc-900/80 backdrop-blur-sm z-10 border-b border-zinc-700/50">
                    <button onClick={() => dispatch({type: 'CHANGE_VIEW', payload: 'game'})} className="p-2 rounded-full hover:bg-white/10">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold">Payola</h1>
                </header>
                
                <main className="flex-grow p-4 space-y-6 overflow-y-auto pb-24">
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold">Active Campaigns</h2>
                        {promotions.length > 0 ? (
                            <div className="space-y-2">
                                {promotions.map(promo => {
                                    const item = promo.itemType === 'song' 
                                        ? songs.find(s => s.id === promo.itemId)
                                        : videos.find(v => v.id === promo.itemId);
                                    if (!item) return null;
                                    return (
                                        <div key={promo.id} className="bg-zinc-800 p-3 rounded-lg flex items-center gap-4">
                                            <img src={promo.itemType === 'song' ? (item as Song).coverArt : (item as Video).thumbnail} alt={item.title} className="w-12 h-12 rounded-md object-cover"/>
                                            <div className="flex-grow">
                                                <p className="font-semibold">{promo.promoType} <span className="text-xs font-normal bg-zinc-700 px-2 py-0.5 rounded ml-2 capitalize">{promo.promoQuality} Quality</span></p>
                                                <p className="text-sm text-zinc-400">for "{item.title}"</p>
                                                <p className="text-xs text-green-400 font-mono">${formatNumber(promo.weeklyCost)} / week</p>
                                            </div>
                                            <button onClick={() => handleCancelPromotion(promo.id)} className="bg-red-600/20 text-red-400 font-bold px-3 py-1.5 rounded-md text-sm hover:bg-red-600/40">
                                                Cancel
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-zinc-500 text-center py-4 bg-zinc-800/50 rounded-lg">No active campaigns.</p>
                        )}
                    </div>
                     <div className="space-y-4 pt-6 border-t border-zinc-700">
                         <h2 className="text-xl font-bold">Start a New Campaign</h2>
                         <div className="grid grid-cols-3 gap-2">
                            <button onClick={() => setActiveSection('songs')} className={`py-2 px-4 rounded-md text-sm font-semibold transition-colors ${activeSection === 'songs' ? 'bg-red-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600'}`}>Songs</button>
                            <button onClick={() => setActiveSection('videos')} className={`py-2 px-4 rounded-md text-sm font-semibold transition-colors ${activeSection === 'videos' ? 'bg-red-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600'}`}>Videos</button>
                            <button onClick={() => setActiveSection('resurgence')} className={`py-2 px-4 rounded-md text-sm font-semibold transition-colors ${activeSection === 'resurgence' ? 'bg-red-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600'}`}>Resurgence</button>
                        </div>
                        {renderContent()}
                    </div>
                </main>

                {activeSection === 'songs' && selectedSongIds.size > 0 && (
                    <div className="fixed bottom-0 left-0 right-0 bg-zinc-800/80 backdrop-blur-sm p-4 border-t border-zinc-700 z-20">
                        <button onClick={() => setIsSongModalOpen(true)} className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors">
                            Pay for {selectedSongIds.size} Song{selectedSongIds.size > 1 ? 's' : ''}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default PromoteView;
