import React from 'react';
import { useGame, formatNumber } from '../context/GameContext';
import ChevronLeftIcon from './icons/ChevronLeftIcon';

const StoreView: React.FC = () => {
    const { dispatch } = useGame();

    const handleBuy = (item: string) => {
        // Implement purchase logic here later
    };

    return (
        <div className="bg-zinc-950 text-white min-h-screen p-4 pb-24">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: 'inbox' })} className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700">
                    <ChevronLeftIcon className="w-6 h-6 text-white" />
                </button>
                <h1 className="text-2xl font-black uppercase tracking-wider">In-Game Store</h1>
            </div>

            <div className="space-y-8">
                {/* Popularity Shop */}
                <div>
                    <h2 className="text-xl font-bold mb-4 text-pink-400">Boost Popularity</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center bg-gradient-to-r from-zinc-900 to-pink-900/20">
                            <div>
                                <h3 className="font-bold text-lg">+10 Popularity</h3>
                                <p className="text-sm text-zinc-400">Small boost to get recognized</p>
                            </div>
                            <button onClick={() => handleBuy('pop_10')} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg">
                                $2.99
                            </button>
                        </div>
                        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center bg-gradient-to-r from-zinc-900 to-pink-900/20">
                            <div>
                                <h3 className="font-bold text-lg">+30 Popularity</h3>
                                <p className="text-sm text-zinc-400">Great for rising stars</p>
                            </div>
                            <button onClick={() => handleBuy('pop_30')} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg">
                                $4.99
                            </button>
                        </div>
                        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center bg-gradient-to-r from-zinc-900 to-pink-900/20">
                            <div>
                                <h3 className="font-bold text-lg">+50 Popularity</h3>
                                <p className="text-sm text-zinc-400">Become heavily talked about</p>
                            </div>
                            <button onClick={() => handleBuy('pop_50')} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg">
                                $7.99
                            </button>
                        </div>
                        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center bg-gradient-to-r from-zinc-900 to-pink-900/20">
                            <div>
                                <h3 className="font-bold text-lg">+75 Popularity</h3>
                                <p className="text-sm text-zinc-400">Massive industry boost</p>
                            </div>
                            <button onClick={() => handleBuy('pop_75')} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg">
                                $10.99
                            </button>
                        </div>
                        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center bg-gradient-to-r from-zinc-900 to-pink-900/20">
                            <div>
                                <h3 className="font-bold text-lg">+100 Popularity</h3>
                                <p className="text-sm text-zinc-400">Maximum mainstream attention</p>
                            </div>
                            <button onClick={() => handleBuy('pop_100')} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg">
                                $14.99
                            </button>
                        </div>
                        <div className="bg-zinc-900 border border-zinc-800 border-pink-500/50 p-4 rounded-xl flex justify-between items-center bg-gradient-to-r from-pink-900/30 to-pink-600/30">
                            <div>
                                <h3 className="font-bold text-lg text-pink-300">Permanent +100 Popularity</h3>
                                <p className="text-sm text-pink-200/70">Never lose popularity again</p>
                            </div>
                            <button onClick={() => handleBuy('pop_100_perm')} className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-lg shadow-[0_0_15px_rgba(236,72,153,0.5)]">
                                $24.99
                            </button>
                        </div>
                    </div>
                </div>

                {/* Cash Shop */}
                <div>
                    <h2 className="text-xl font-bold mb-4 text-emerald-400">Buy Game Cash</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center bg-gradient-to-r from-zinc-900 to-emerald-900/20">
                            <div>
                                <h3 className="font-bold text-lg text-emerald-400">$100K Cash</h3>
                                <p className="text-sm text-zinc-400">A quick influx of funds</p>
                            </div>
                            <button onClick={() => handleBuy('cash_100k')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg">
                                $2.99
                            </button>
                        </div>
                        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center bg-gradient-to-r from-zinc-900 to-emerald-900/20">
                            <div>
                                <h3 className="font-bold text-lg text-emerald-400">$1M Cash</h3>
                                <p className="text-sm text-zinc-400">Serious money for major moves</p>
                            </div>
                            <button onClick={() => handleBuy('cash_1m')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg">
                                $19.99
                            </button>
                        </div>
                        <div className="bg-zinc-900 border border-zinc-800 border-emerald-500/50 p-4 rounded-xl flex justify-between items-center bg-gradient-to-r from-emerald-900/30 to-emerald-600/30 md:col-span-2">
                            <div>
                                <h3 className="font-bold text-xl text-emerald-300">$10M Cash</h3>
                                <p className="text-sm text-emerald-200/70">The ultimate bankroll to dominate the industry</p>
                            </div>
                            <button onClick={() => handleBuy('cash_10m')} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.5)] text-lg">
                                $99.99
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreView;
