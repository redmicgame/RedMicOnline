
import React from 'react';
import { useGame, formatNumber } from '../context/GameContext';
import { Song } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import DownloadIconSimple from './icons/DownloadIconSimple';

const QualityBadge: React.FC<{ quality: number; showNumber: boolean }> = ({ quality, showNumber }) => {
    const getQualityColor = () => {
        if (quality < 50) return 'bg-red-500 text-white';
        if (quality < 70) return 'bg-yellow-500 text-black';
        if (quality < 96) return 'bg-green-400 text-black';
        return 'bg-green-600 text-white';
    };
    return (
        <div className={`w-12 h-12 flex items-center justify-center rounded-lg font-bold text-lg ${getQualityColor()}`}>
            {showNumber ? quality : ''}
        </div>
    );
};

const UnreleasedSongItem: React.FC<{ song: Song; showQuality: boolean }> = ({ song, showQuality }) => (
    <div className="bg-zinc-800 p-3 rounded-lg flex items-center gap-4">
        <img src={song.coverArt} alt={song.title} className="w-16 h-16 rounded-md object-cover"/>
        <div className="flex-grow">
            <p className="font-bold">{song.title}</p>
            <p className="text-sm text-zinc-400">{song.genre}</p>
            {song.leakInfo && (
              <div className="mt-1 text-xs font-semibold flex items-center gap-3">
                <span className="bg-yellow-900/50 px-2 py-0.5 rounded-full text-yellow-300">LEAKED</span>
                <div className="flex items-center gap-1 text-yellow-400">
                    <ChartBarIcon className="w-4 h-4"/>
                    <span>{formatNumber(song.leakInfo.illegalStreams)}</span>
                </div>
                <div className="flex items-center gap-1 text-yellow-400">
                    <DownloadIconSimple className="w-4 h-4"/>
                    <span>{formatNumber(song.leakInfo.illegalDownloads)}</span>
                </div>
              </div>
            )}
        </div>
        <QualityBadge quality={song.quality} showNumber={showQuality} />
    </div>
);


const ReleaseHubView: React.FC = () => {
    const { dispatch, activeArtistData } = useGame();
    
    if (!activeArtistData) return null;

    const { songs, contract, redMicPro } = activeArtistData;

    const unreleasedSongs = songs.filter(s => !s.isReleased && !s.releaseId);
    
    const hasUnreleased = unreleasedSongs.length > 0;

    return (
        <div className="h-screen w-full bg-zinc-900 overflow-y-auto">
            <header className="p-4 flex items-center gap-4 sticky top-0 bg-zinc-900/80 backdrop-blur-sm z-10 border-b border-zinc-700/50">
                <button onClick={() => dispatch({type: 'CHANGE_VIEW', payload: 'game'})} className="p-2 rounded-full hover:bg-white/10">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold">Release Hub</h1>
            </header>
            <main className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Unreleased Songs</h2>
                    {hasUnreleased && (
                        <button onClick={() => dispatch({type: 'CHANGE_VIEW', payload: 'release'})} className="flex items-center gap-1 text-red-500 hover:text-red-400 font-semibold">
                           {contract ? 'Submit to Label' : 'Release Music'} <ChevronRightIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
                {hasUnreleased ? (
                    <div className="space-y-3">
                        {unreleasedSongs.map(song => <UnreleasedSongItem key={song.id} song={song} showQuality={redMicPro.unlocked} />)}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-zinc-800 rounded-lg">
                        <p className="text-zinc-400">No unreleased songs.</p>
                        <p className="text-zinc-500 text-sm">Go to the "Studio" app to record something new!</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ReleaseHubView;
