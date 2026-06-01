
import React, { useState } from 'react';
import { useGame, formatNumber } from '../context/GameContext';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import { Tour } from '../types';

const TourDetailView: React.FC = () => {
    const { dispatch, gameState, activeArtistData } = useGame();
    const { activeTourId } = gameState;
    const [error, setError] = useState('');
    
    if (!activeTourId || !activeArtistData) {
        dispatch({ type: 'CHANGE_VIEW', payload: 'tours' });
        return null;
    }

    const tour = activeArtistData.tours.find(t => t.id === activeTourId);
    
    if (!tour) return <div className="p-4">Tour not found.</div>;

    const { songs, tourPhotos } = activeArtistData;
    const setlistSongs = tour.setlist.map(id => songs.find(s => s.id === id)).filter(Boolean);
    const progress = (tour.currentVenueIndex / tour.venues.length) * 100;

    const handleStartTour = () => {
        if (tour.status === 'planning') {
            dispatch({ type: 'START_TOUR', payload: { tourId: tour.id }});
        }
    };
    
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                dispatch({ type: 'UPLOAD_TOUR_PHOTO', payload: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };


    return (
        <div className="h-screen w-full bg-zinc-900 overflow-y-auto">
            <header className="relative h-48">
                <img src={tour.bannerImage} className="w-full h-full object-cover"/>
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent"/>
                <button onClick={() => dispatch({type: 'CHANGE_VIEW', payload: 'tours'})} className="absolute top-4 left-4 p-2 bg-black/50 rounded-full hover:bg-black/70">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="absolute bottom-4 left-4 text-4xl font-black">{tour.name}</h1>
            </header>
            <main className="p-4 space-y-6">
                {tour.status === 'planning' && (
                    <button onClick={handleStartTour} className="w-full bg-green-600 p-3 rounded-lg font-bold">Start Tour</button>
                )}
                
                <div>
                    <div className="flex justify-between text-sm mb-1"><p>Progress</p><p>{tour.currentVenueIndex} / {tour.venues.length}</p></div>
                    <div className="w-full bg-zinc-700 h-3 rounded-full"><div className="bg-red-500 h-3 rounded-full" style={{width: `${progress}%`}}></div></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-800 p-3 rounded-lg text-center"><p className="text-xs text-zinc-400">Total Revenue</p><p className="font-bold text-2xl text-green-400">${formatNumber(tour.totalRevenue)}</p></div>
                    <div className="bg-zinc-800 p-3 rounded-lg text-center"><p className="text-xs text-zinc-400">Tickets Sold</p><p className="font-bold text-2xl">{formatNumber(tour.ticketsSold)}</p></div>
                </div>

                <div className="space-y-3">
                    <h2 className="text-xl font-bold">Shows</h2>
                    {tour.venues.map((v, i) => {
                        const isCompleted = i < tour.currentVenueIndex;
                        const isCurrent = i === tour.currentVenueIndex && tour.status === 'active';
                        return (
                            <div key={v.id} className={`p-3 rounded-lg ${isCurrent ? 'bg-blue-900/50' : 'bg-zinc-800'}`}>
                                <div className="flex justify-between">
                                    <div><p className="font-semibold">{v.name}</p><p className="text-xs text-zinc-400">{v.city}</p></div>
                                    {isCompleted && (
                                        <div className="text-right">
                                            <p className={`font-semibold ${v.soldOut ? 'text-yellow-400' : 'text-green-400'}`}>${formatNumber(v.revenue)}</p>
                                            <p className="text-xs text-zinc-400">{formatNumber(v.ticketsSold)} / {formatNumber(v.capacity)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                 <div className="space-y-3">
                    <h2 className="text-xl font-bold">Setlist</h2>
                    <div className="grid grid-cols-2 gap-2">
                    {setlistSongs.map(song => song && (
                        <div key={song.id} className="bg-zinc-800 p-2 rounded-md flex items-center gap-2">
                             <img src={song.coverArt} className="w-8 h-8 rounded-sm"/>
                             <p className="text-sm font-semibold truncate">{song.title}</p>
                        </div>
                    ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <h2 className="text-xl font-bold">Tour Photos</h2>
                     <div className="grid grid-cols-3 gap-2">
                         {tourPhotos.map((photo, i) => <img key={i} src={photo} className="w-full aspect-square object-cover rounded-md"/>)}
                         {tourPhotos.length < 9 && (
                            <label htmlFor="photo-upload" className="w-full aspect-square bg-zinc-800 rounded-md flex items-center justify-center cursor-pointer">
                                <span className="text-3xl text-zinc-500">+</span>
                            </label>
                         )}
                    </div>
                    <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </div>
            </main>
        </div>
    );
};

export default TourDetailView;
