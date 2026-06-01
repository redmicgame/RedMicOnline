

import React from 'react';
import { useGame, formatNumber } from '../context/GameContext';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import TicketIcon from './icons/TicketIcon';
import { Tour } from '../types';

const TourItem: React.FC<{ tour: Tour; onClick: () => void }> = ({ tour, onClick }) => (
    <button onClick={onClick} className="w-full bg-zinc-800 p-3 rounded-lg flex items-center gap-4 hover:bg-zinc-700 transition-colors">
        <img src={tour.bannerImage} alt={tour.name} className="w-20 h-20 rounded-md object-cover"/>
        <div className="flex-grow text-left">
            <p className="font-bold text-lg">{tour.name}</p>
            <p className="text-sm text-zinc-400">{tour.venues.length} shows</p>
            {tour.status === 'active' && <p className="text-xs font-bold text-green-400 bg-green-900/50 px-2 py-0.5 rounded-full inline-block mt-1">ON TOUR</p>}
            {tour.status === 'finished' && <p className="text-xs font-bold text-zinc-500 bg-zinc-700/50 px-2 py-0.5 rounded-full inline-block mt-1">COMPLETED</p>}
        </div>
        <div className="text-right">
            <p className="font-bold text-green-400">${formatNumber(tour.totalRevenue)}</p>
            <p className="text-sm text-zinc-400">{formatNumber(tour.ticketsSold)} tickets</p>
        </div>
    </button>
);


const ToursView: React.FC = () => {
    const { dispatch, activeArtistData } = useGame();
    if (!activeArtistData) return null;
    const { tours } = activeArtistData;

    const activeTour = tours.find(t => t.status === 'active');
    const pastTours = tours.filter(t => t.status === 'finished');
    const plannedTours = tours.filter(t => t.status === 'planning');

    const handleSelectTour = (tourId: string) => {
        dispatch({ type: 'SELECT_TOUR', payload: tourId });
        dispatch({ type: 'CHANGE_VIEW', payload: 'tourDetail' });
    };

    return (
        <div className="h-screen w-full bg-zinc-900 overflow-y-auto">
            <header className="p-4 flex items-center gap-4 sticky top-0 bg-zinc-900/80 backdrop-blur-sm z-10 border-b border-zinc-700/50">
                <button onClick={() => dispatch({type: 'CHANGE_VIEW', payload: 'game'})} className="p-2 rounded-full hover:bg-white/10">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold">Ticketmaster</h1>
            </header>
            <main className="p-4 space-y-6">
                <button onClick={() => dispatch({type: 'CHANGE_VIEW', payload: 'createTour'})} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-6 text-left flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">Plan a New Tour</h2>
                        <p className="text-blue-200">Set up venues, prices, and setlists.</p>
                    </div>
                    <ChevronRightIcon className="w-8 h-8"/>
                </button>

                {activeTour && (
                     <div>
                        <h2 className="text-xl font-bold mb-3">Active Tour</h2>
                        <TourItem tour={activeTour} onClick={() => handleSelectTour(activeTour.id)} />
                    </div>
                )}
                
                {plannedTours.length > 0 && (
                     <div>
                        <h2 className="text-xl font-bold mb-3">Planned Tours</h2>
                        <div className="space-y-3">
                        {plannedTours.map(tour => (
                            <TourItem key={tour.id} tour={tour} onClick={() => handleSelectTour(tour.id)} />
                        ))}
                        </div>
                    </div>
                )}

                {pastTours.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold mb-3">Past Tours</h2>
                        <div className="space-y-3">
                        {pastTours.map(tour => (
                             <TourItem key={tour.id} tour={tour} onClick={() => handleSelectTour(tour.id)} />
                        ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ToursView;