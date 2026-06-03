import { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { ref, set } from 'firebase/database';
import { db } from '../firebase';

export const useOnlinePush = () => {
    const { gameState } = useGame();
    const lastPushedWeekRef = useRef<{ week: number, year: number } | null>(null);

    useEffect(() => {
        if (gameState.offlineMode || !gameState.activeArtistId) return;

        const currentWeek = gameState.date.week;
        const currentYear = gameState.date.year;
        
        // Push only once per game week
        if (
            lastPushedWeekRef.current && 
            lastPushedWeekRef.current.week === currentWeek && 
            lastPushedWeekRef.current.year === currentYear
        ) {
            return;
        }

        const pushData = async () => {
            try {
                // Determine active artist data
                const artistData = gameState.artistsData[gameState.activeArtistId];
                if (!artistData) return;
                
                const artistProfile = gameState.soloArtist?.id === gameState.activeArtistId 
                    ? gameState.soloArtist 
                    : gameState.group?.id === gameState.activeArtistId ? gameState.group : null;
                
                if (!artistProfile) return;

                // Push artist entity
                await set(ref(db, `artists/${artistProfile.id}`), {
                    id: artistProfile.id,
                    name: artistProfile.name,
                    age: 'age' in artistProfile ? artistProfile.age : 20,
                    fandomName: artistProfile.fandomName,
                    avatar: artistProfile.image || null,
                    publicImage: artistData.publicImage || 50,
                    popularity: artistData.popularity || 0,
                    monthlyListeners: artistData.monthlyListeners || 0,
                    money: artistData.money || 0,
                    createdAt: Date.now(), // keeps sorting static if needed, or update it
                    updatedAt: Date.now()
                });

                // Push released songs
                for (const song of artistData.songs) {
                    if (song.isReleased && !song.remixOfSongId) {
                        await set(ref(db, `online_songs_v2/${song.id}`), {
                            id: song.id,
                            artistId: artistProfile.id,
                            artistName: artistProfile.name,
                            title: song.title,
                            genre: song.genre,
                            coverArt: song.coverArt || null,
                            weeklyStreams: song.lastWeekStreams || 0,
                            allTimeStreams: song.streams || 0,
                            isReleased: true,
                            itunesPrice: song.itunesPrice || 0.99,
                            gameYear: currentYear,
                            gameWeek: currentWeek,
                            updatedAt: Date.now()
                        });
                    }
                }

                // Push released albums
                for (const release of artistData.releases) {
                    if ((release.type === 'Album' || release.type === 'EP') && release.isReleased) {
                        await set(ref(db, `online_albums_v2/${release.id}`), {
                            id: release.id,
                            artistId: artistProfile.id,
                            artistName: artistProfile.name,
                            title: release.title,
                            coverArt: release.coverArt || null,
                            weeklySales: release.sales || 0,
                            releasingLabel: release.releasingLabel ? { name: release.releasingLabel.name } : null,
                            gameYear: currentYear,
                            gameWeek: currentWeek,
                            updatedAt: Date.now()
                        });
                    }
                }

                lastPushedWeekRef.current = { week: currentWeek, year: currentYear };
            } catch (err) {
                console.error("Failed to push online data: ", err);
            }
        };

        pushData();
        
    }, [gameState.date, gameState.offlineMode, gameState.activeArtistId]);
};
