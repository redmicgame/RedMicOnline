

import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import HomeTab from './HomeTab';
import AppsTab from './AppsTab';
import ChartsTab from './ChartsTab';
import MiscTab from './MiscTab';
import BusinessTab from './BusinessTab';
import BottomNav from './BottomNav';
import { useOnlineSync } from '../hooks/useOnlineSync';
import { useOnlinePush } from '../hooks/useOnlinePush';

const GameUI: React.FC = () => {
    useOnlineSync();
    useOnlinePush();
    const { gameState, dispatch } = useGame();
    const { activeTab, offlineMode } = gameState;
    const [msUntilNextWeek, setMsUntilNextWeek] = useState(0);

    // Online Mode Time Logic
    useEffect(() => {
        if (offlineMode) return;

        // 30 minutes = 1 week
        const tickRate = 1000 * 60 * 30; // 30 minutes in ms
        const EPOCH = 1780349068000; 
        const baseYear = 2000;

        const checkTime = () => {
            const now = Date.now();
            const elapsedTime = Math.max(0, now - EPOCH);
            const globalWeekStamp = Math.floor(elapsedTime / tickRate) + 1; // 1-indexed

            const nextTick = EPOCH + (globalWeekStamp * tickRate);
            setMsUntilNextWeek(nextTick - now);
        };

        checkTime();
        const interval = setInterval(checkTime, 1000);
        return () => clearInterval(interval);
    }, [offlineMode]);

    // Separate effect for progressing week to avoid infinite loops
    useEffect(() => {
        if (offlineMode) return;
        const tickRate = 1000 * 60 * 30; // 30 minutes in ms
        const EPOCH = 1780349068000;
        const baseYear = 2000;

        const checkProgress = () => {
            const now = Date.now();
            const elapsedTime = Math.max(0, now - EPOCH);
            const globalWeekStamp = Math.floor(elapsedTime / tickRate) + 1;

            const localAbsoluteWeek = ((gameState.date.year - baseYear) * 52) + gameState.date.week;
            
            if (globalWeekStamp > localAbsoluteWeek) {
                dispatch({ type: 'PROGRESS_WEEK' });
            } else if (globalWeekStamp < localAbsoluteWeek) {
                dispatch({ type: 'SYNC_DATE', payload: globalWeekStamp });
            }
        };

        checkProgress();
        const interval = setInterval(checkProgress, 5000); // Check every 5 seconds
        return () => clearInterval(interval);
    }, [offlineMode, gameState.date.week, gameState.date.year, dispatch]);

    const formatTime = (ms: number) => {
        if (ms <= 0) return "00:00";
        const totalSeconds = Math.floor(ms / 1000);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'Home':
                return <HomeTab />;
            case 'Apps':
                return <AppsTab />;
            case 'Charts':
                return <ChartsTab />;
            case 'Business':
                return <BusinessTab />;
            case 'Misc':
                return <MiscTab />;
            default:
                return <HomeTab />;
        }
    };

    const handleProgressWeek = () => {
        dispatch({ type: 'PROGRESS_WEEK' });
    };

    return (
        <div className="h-screen w-full flex flex-col bg-zinc-900 text-white">
            <main className="flex-grow overflow-y-auto pb-24">
                {renderActiveTab()}
            </main>
            
            {offlineMode ? (
                <button 
                  onClick={handleProgressWeek}
                  className="fixed z-20 bottom-24 right-4 bg-red-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-red-700 transition-all transform hover:scale-105 shadow-red-600/30">
                  <span className="font-bold text-sm text-center leading-tight">Next Week</span>
                </button>
            ) : (
                <div className="fixed z-20 bottom-24 right-4 bg-zinc-800 border border-blue-500/50 text-white h-16 px-4 rounded-full shadow-lg flex flex-col items-center justify-center shadow-blue-600/30">
                  <span className="font-bold text-xs text-blue-400">NEXT WEEK</span>
                  <span className="font-mono text-sm leading-none mt-1">{formatTime(msUntilNextWeek)}</span>
                </div>
            )}
            
            <BottomNav />
        </div>
    );
};

export default GameUI;
