

import React, { useState, useMemo } from 'react';
import { useGame, formatNumber } from '../context/GameContext';
import { VENUES, TOUR_TIER_REQUIREMENTS, TOUR_TICKET_PRICE_SUGGESTIONS } from '../constants';
import { Tour, Venue, Song } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

type TourTier = 'Small Halls' | 'Large Halls' | 'Arenas' | 'Stadiums';

const CreateTourView: React.FC = () => {
    const { dispatch, activeArtist, activeArtistData } = useGame();
    const [step, setStep] = useState(1);
    const [tourName, setTourName] = useState('');
    const [bannerImage, setBannerImage] = useState<string | null>(null);
    const [tier, setTier] = useState<TourTier | null>(null);
    const [venuesForSelection, setVenuesForSelection] = useState<(typeof VENUES[TourTier][0] & {id: string})[]>([]);
    const [chosenVenueIds, setChosenVenueIds] = useState<Set<string>>(new Set());
    const [ticketPrice, setTicketPrice] = useState(0);
    const [setlist, setSetlist] = useState<Set<string>>(new Set());
    const [error, setError] = useState('');

    if (!activeArtistData || !activeArtist) return null;
    const { popularity, songs } = activeArtistData;
    const allSongs = useMemo(() => songs, [songs]);

    const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => setBannerImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleTierSelect = (selectedTier: TourTier) => {
        setTier(selectedTier);
        setTicketPrice(TOUR_TICKET_PRICE_SUGGESTIONS[selectedTier]);
        setVenuesForSelection(VENUES[selectedTier].map(v => ({...v, id: crypto.randomUUID() })));
        setChosenVenueIds(new Set());
        setStep(2);
    };

    const handleToggleVenue = (venueId: string) => {
        const newSelection = new Set(chosenVenueIds);
        if (newSelection.has(venueId)) {
            newSelection.delete(venueId);
        } else {
            newSelection.add(venueId);
        }
        setChosenVenueIds(newSelection);
    };

    const handleToggleSetlist = (songId: string) => {
        const newSetlist = new Set(setlist);
        if (newSetlist.has(songId)) newSetlist.delete(songId);
        else newSetlist.add(songId);
        setSetlist(newSetlist);
    };

    const handleCreateTour = () => {
        if (!tourName.trim() || !bannerImage || !tier) {
            setError('Please fill out all fields.'); return;
        }

        const finalVenues = venuesForSelection
            .filter(v => chosenVenueIds.has(v.id))
            .map(v => ({
                ...v,
                ticketPrice: ticketPrice,
                soldOut: false,
                revenue: 0,
                ticketsSold: 0,
            }));
        
        if (finalVenues.length === 0) {
            setError('You must select at least one venue for your tour.');
            setStep(2);
            return;
        }

        const newTour: Tour = {
            id: crypto.randomUUID(),
            artistId: activeArtist.id,
            name: tourName.trim(),
            bannerImage: bannerImage,
            venues: finalVenues,
            setlist: Array.from(setlist),
            status: 'planning',
            currentVenueIndex: 0,
            totalRevenue: 0,
            ticketsSold: 0,
        };

        dispatch({ type: 'CREATE_TOUR', payload: newTour });
        dispatch({ type: 'CHANGE_VIEW', payload: 'tours' });
    };

    const renderStep = () => {
        switch (step) {
            case 1: // Name, Banner, Tier
                return (
                    <div className="space-y-4">
                        <label htmlFor="banner-upload" className="cursor-pointer w-full aspect-[2/1] bg-zinc-800 rounded-lg border-2 border-dashed flex items-center justify-center">
                            {bannerImage ? <img src={bannerImage} className="w-full h-full object-cover rounded-lg"/> : <span className="text-zinc-400">Upload Tour Banner</span>}
                        </label>
                        <input id="banner-upload" type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
                        <input type="text" value={tourName} onChange={e => setTourName(e.target.value)} placeholder="Tour Name" className="w-full bg-zinc-700 p-3 rounded-md" />
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(TOUR_TIER_REQUIREMENTS).map(([tierName, req]) => {
                                const isAvailable = popularity >= req;
                                return (
                                    <button key={tierName} onClick={() => handleTierSelect(tierName as TourTier)} disabled={!isAvailable} className="bg-zinc-800 p-3 rounded-lg disabled:opacity-50 text-left">
                                        <h3 className="font-bold">{tierName}</h3>
                                        <p className="text-xs text-zinc-400">Requires: {req} Popularity</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            case 2: // Venues and Pricing
                return (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold">{tier} Tour ({chosenVenueIds.size} shows)</h2>
                        <div>
                            <label className="block text-sm font-medium text-zinc-300">Ticket Price</label>
                            <input type="number" value={ticketPrice} onChange={e => setTicketPrice(Number(e.target.value))} className="mt-1 w-full bg-zinc-700 p-2 rounded-md" />
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {venuesForSelection.map(v => (
                                <button key={v.id} onClick={() => handleToggleVenue(v.id)} className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${chosenVenueIds.has(v.id) ? 'bg-red-500/20' : 'bg-zinc-800'}`}>
                                    <input type="checkbox" readOnly checked={chosenVenueIds.has(v.id)} className="form-checkbox h-5 w-5 rounded bg-zinc-700 border-zinc-600 text-red-600 focus:ring-red-500" />
                                    <div className="flex-grow">
                                        <p className="font-semibold">{v.name}</p>
                                        <p className="text-xs text-zinc-400">{v.city}</p>
                                    </div>
                                    <p className="text-sm text-zinc-300">{formatNumber(v.capacity)} cap.</p>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setStep(3)} disabled={chosenVenueIds.size === 0} className="w-full bg-red-600 p-3 rounded-lg font-bold disabled:bg-zinc-600">Next: Setlist</button>
                    </div>
                );
            case 3: // Setlist
                return (
                     <div className="space-y-4">
                        <h2 className="text-xl font-bold">Setlist ({setlist.size})</h2>
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                            {allSongs.map(song => (
                                <button key={song.id} onClick={() => handleToggleSetlist(song.id)} className={`w-full flex items-center gap-3 p-2 rounded-lg ${setlist.has(song.id) ? 'bg-red-500/20' : 'bg-zinc-800'}`}>
                                    <input type="checkbox" readOnly checked={setlist.has(song.id)} className="form-checkbox h-5 w-5 rounded bg-zinc-700 border-zinc-600 text-red-600 focus:ring-red-500" />
                                    <img src={song.coverArt} className="w-12 h-12 rounded-md"/>
                                    <div className="text-left">
                                        <p className="font-semibold">{song.title}</p>
                                        {!song.isReleased && <p className="text-xs font-bold text-yellow-300 bg-yellow-900/50 px-2 py-0.5 rounded-full inline-block">Unreleased</p>}
                                    </div>
                                </button>
                            ))}
                        </div>
                        <button onClick={handleCreateTour} className="w-full bg-green-600 p-3 rounded-lg font-bold">Finalize Tour</button>
                    </div>
                );
        }
    };


    return (
        <div className="h-screen w-full bg-zinc-900 overflow-y-auto">
            <header className="p-4 flex items-center gap-4 sticky top-0 bg-zinc-900/80 backdrop-blur-sm z-10 border-b border-zinc-700/50">
                <button onClick={() => step > 1 ? setStep(s => s - 1) : dispatch({type: 'CHANGE_VIEW', payload: 'tours'})} className="p-2 rounded-full hover:bg-white/10">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold">Create Tour</h1>
            </header>
            <main className="p-4">
                {error && <p className="text-red-400 mb-4">{error}</p>}
                {renderStep()}
            </main>
        </div>
    );
};

export default CreateTourView;