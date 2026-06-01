

import React from 'react';
import { useGame } from '../context/GameContext';
import type { Tab } from '../types';
import HomeIcon from './icons/HomeIcon';
import AppsIcon from './icons/AppsIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import CogIcon from './icons/CogIcon';
import BriefcaseIcon from './icons/BriefcaseIcon';

const NavItem: React.FC<{
    label: Tab;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center flex-1 transition-colors duration-200 ${isActive ? 'text-red-500' : 'text-zinc-400 hover:text-white'}`}
        >
            {icon}
            <span className="text-xs font-medium mt-1">{label}</span>
        </button>
    );
};

const BottomNav: React.FC = () => {
    const { gameState, dispatch } = useGame();
    const { activeTab } = gameState;

    const handleTabChange = (tab: Tab) => {
        dispatch({ type: 'CHANGE_TAB', payload: tab });
        dispatch({ type: 'CHANGE_VIEW', payload: 'game' });
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-zinc-800 border-t border-zinc-700 flex justify-around items-center z-30">
            <NavItem
                label="Home"
                icon={<HomeIcon className="h-6 w-6" />}
                isActive={activeTab === 'Home'}
                onClick={() => handleTabChange('Home')}
            />
            <NavItem
                label="Apps"
                icon={<AppsIcon className="h-6 w-6" />}
                isActive={activeTab === 'Apps'}
                onClick={() => handleTabChange('Apps')}
            />
            <NavItem
                label="Charts"
                icon={<ChartBarIcon className="h-6 w-6" />}
                isActive={activeTab === 'Charts'}
                onClick={() => handleTabChange('Charts')}
            />
            <NavItem
                label="Business"
                icon={<BriefcaseIcon className="h-6 w-6" />}
                isActive={activeTab === 'Business'}
                onClick={() => handleTabChange('Business')}
            />
            <NavItem
                label="Misc"
                icon={<CogIcon className="h-6 w-6" />}
                isActive={activeTab === 'Misc'}
                onClick={() => handleTabChange('Misc')}
            />
        </nav>
    );
};

export default BottomNav;
