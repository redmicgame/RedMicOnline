

import React, { useState, useMemo, useRef } from 'react';
import { useGame, formatNumber } from '../context/GameContext';
import { MERCH_PRODUCT_LIMIT } from '../constants';
import type { MerchProduct, Release } from '../types';
import MenuIcon from './icons/MenuIcon';
import SearchIcon from './icons/SearchIcon';
import ShoppingBagIcon from './icons/ShoppingBagIcon';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
// FIX: Imported ArrowLeftIcon to resolve the "Cannot find name" error.
import ArrowLeftIcon from './icons/ArrowLeftIcon';

const AddMerchModal: React.FC<{
    onClose: () => void;
}> = ({ onClose }) => {
    const { dispatch, activeArtist, activeArtistData } = useGame();
    const [releaseId, setReleaseId] = useState('');
    const [variantName, setVariantName] = useState('');
    const [merchType, setMerchType] = useState<'Vinyl' | 'CD'>('Vinyl');
    const [price, setPrice] = useState(39.98);
    const [image, setImage] = useState<string | null>(null);
    const [error, setError] = useState('');

    if (!activeArtistData || !activeArtist) return null;
    const { merch, releases } = activeArtistData;

    const availableReleases = useMemo(() => {
        const released = releases.filter(r => (r.type === 'Album' || r.type === 'EP' || r.type === 'Album (Deluxe)' || r.type === 'Compilation'));
        const scheduled = activeArtistData.labelSubmissions
            .filter(s => s.status === 'scheduled' && (s.release.type === 'Album' || s.release.type === 'EP' || s.release.type === 'Album (Deluxe)' || s.release.type === 'Compilation'))
            .map(s => s.release);
        return [...released, ...scheduled];
    }, [releases, activeArtistData.labelSubmissions]);
    
    const selectedRelease = useMemo(() => {
        return availableReleases.find(r => r.id === releaseId);
    }, [availableReleases, releaseId]);
    
    const itemsForSelectedRelease = useMemo(() => {
        return merch.filter(m => m.releaseId === releaseId).length;
    }, [merch, releaseId]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleAddMerch = () => {
        setError('');
        if (!selectedRelease) { setError('Please select a release.'); return; }
        if (!image && !selectedRelease.coverArt) { setError('Please provide an image.'); return; }
        if (itemsForSelectedRelease >= 8) { setError('You can only have 8 product variants per release.'); return; }

        const isScheduled = !releases.some(r => r.id === selectedRelease.id);

        const newItem: MerchProduct = {
            id: crypto.randomUUID(),
            releaseId: selectedRelease.id,
            name: `${selectedRelease.title}${variantName ? ` (${variantName})` : ''}`,
            type: merchType,
            price,
            image: image || selectedRelease.coverArt,
            artistId: activeArtist.id,
            isPreorder: isScheduled, // Automatically set based on release status
        };
        dispatch({ type: 'ADD_MERCH', payload: { item: newItem } });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-zinc-800 text-white w-full max-w-md rounded-lg p-6 space-y-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold">Add New Product</h2>
                <select value={releaseId} onChange={e => { setReleaseId(e.target.value); setImage(availableReleases.find(r=>r.id===e.target.value)?.coverArt || null); }} className="w-full bg-zinc-700 p-2 rounded">
                    <option value="">Select a Release...</option>
                    {availableReleases.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                </select>
                {itemsForSelectedRelease >= 8 && <p className="text-sm text-red-400">This release already has the maximum of 8 product variants.</p>}
                <input type="text" value={variantName} onChange={e => setVariantName(e.target.value)} placeholder="Variant Name (e.g., Apple Red Vinyl)" className="w-full bg-zinc-700 p-2 rounded" />
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setMerchType('Vinyl')} className={`py-2 rounded ${merchType === 'Vinyl' ? 'bg-red-500' : 'bg-zinc-700'}`}>Vinyl</button>
                    <button onClick={() => setMerchType('CD')} className={`py-2 rounded ${merchType === 'CD' ? 'bg-red-500' : 'bg-zinc-700'}`}>CD</button>
                </div>
                <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} placeholder="Price" className="w-full bg-zinc-700 p-2 rounded" />
                <label className="block text-sm text-zinc-400">Product Image (defaults to cover art)</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-700 file:text-white hover:file:bg-zinc-600"/>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button onClick={handleAddMerch} disabled={!releaseId || itemsForSelectedRelease >= 8} className="w-full bg-red-600 p-2 rounded font-bold disabled:bg-zinc-600">Add Product</button>
            </div>
        </div>
    );
};

const MerchStoreView: React.FC = () => {
    const { dispatch, activeArtist, activeArtistData } = useGame();
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const [showAddModal, setShowAddModal] = useState(false);

    if (!activeArtistData || !activeArtist) return null;
    const { merch, merchStoreBanner, youtubeStoreUnlocked, releases } = activeArtistData;

    const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                dispatch({ type: 'UPDATE_MERCH_BANNER', payload: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };
    
    if (!youtubeStoreUnlocked) {
        return (
            <div className="h-screen w-full bg-zinc-900 flex flex-col items-center justify-center text-center p-4">
                 <ShoppingBagIcon className="w-16 h-16 text-zinc-500 mb-4" />
                <h1 className="text-2xl font-bold">Merch Store Locked</h1>
                <p className="text-zinc-400 mt-2">
                    Your merch store unlocks when you reach {formatNumber(500000)} subscribers on YouTube.
                </p>
                 <button onClick={() => dispatch({type: 'CHANGE_VIEW', payload: 'game'})} className="mt-6 bg-red-600 text-white font-bold py-2 px-6 rounded-lg">
                    Back to Game
                </button>
            </div>
        );
    }

    return (
        <>
            {showAddModal && <AddMerchModal onClose={() => setShowAddModal(false)} />}
            <div className="bg-white text-black min-h-screen">
                <header className="sticky top-0 bg-white z-20 border-b border-zinc-200">
                    <div className="p-4 flex justify-between items-center">
                        <button><MenuIcon className="w-6 h-6" /></button>
                        <h1 className="text-2xl font-bold tracking-[0.2em] uppercase font-anton">{activeArtist.name}</h1>
                        <div className="flex items-center gap-4">
                            <button><SearchIcon className="w-5 h-5" /></button>
                            <button><ShoppingBagIcon className="w-6 h-6" /></button>
                        </div>
                    </div>
                </header>

                <main>
                    <div className="relative group w-full h-[30vh] md:h-[40vh] bg-zinc-200 flex items-center justify-center">
                        <input type="file" ref={bannerInputRef} onChange={handleBannerUpload} className="hidden" accept="image/*" />
                        {merchStoreBanner ? (
                            <img src={merchStoreBanner} alt="Store Banner" className="w-full h-full object-cover" />
                        ) : (
                            <p className="text-zinc-500">No banner set.</p>
                        )}
                        <button onClick={() => bannerInputRef.current?.click()} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold">
                            Upload Banner
                        </button>
                    </div>

                    <div className="p-4 md:p-8">
                        {merch.length < MERCH_PRODUCT_LIMIT && (
                            <div className="text-right mb-4">
                                <button onClick={() => setShowAddModal(true)} className="bg-black text-white font-bold py-2 px-4 rounded-md inline-flex items-center gap-2">
                                    <PlusIcon className="w-5 h-5" /> Add Product
                                </button>
                            </div>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {merch.map(item => (
                                <div key={item.id} className="group relative">
                                    <img src={item.image} alt={item.name} className="w-full aspect-square object-cover" />
                                    {(item.isPreorder && !releases.some(r => r.id === item.releaseId)) && (
                                        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">PRE-ORDER</div>
                                    )}
                                    <div className="mt-2 text-center md:text-left">
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-zinc-600">${item.price.toFixed(2)} USD</p>
                                    </div>
                                    <button onClick={() => dispatch({type: 'REMOVE_MERCH', payload: {id: item.id}})} className="absolute top-2 right-2 p-1.5 bg-white/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <TrashIcon className="w-5 h-5 text-red-600" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
                 <button onClick={() => dispatch({type: 'CHANGE_VIEW', payload: 'game'})} className="fixed bottom-4 left-4 bg-zinc-800 text-white p-3 rounded-full shadow-lg hover:bg-zinc-700 transition-colors z-30">
                     <ArrowLeftIcon className="w-6 h-6" />
                </button>
            </div>
        </>
    );
};

export default MerchStoreView;