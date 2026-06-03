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
                await set(ref(db, `artists_v5/${artistProfile.id}`), {
                    id: artistProfile.id,
                    name: artistProfile.name,
                    age: 'age' in artistProfile ? artistProfile.age : 20,
                    fandomName: artistProfile.fandomName,
                    avatar: artistProfile.image || null,
                    publicImage: artistData.publicImage || 50,
                    popularity: artistData.popularity || 0,
                    monthlyListeners: artistData.monthlyListeners || 0,
                    money: artistData.money || 0,
                    genre: artistData.songs[0]?.genre || "Pop",
                    totalAwards: (artistData.grammyHistory?.filter(a => a.isWinner).length || 0) + (artistData.amaHistory?.filter(a => a.isWinner).length || 0),
                    awards: {
                        grammys: artistData.grammyHistory?.filter(a => a.isWinner) || [],
                        amas: artistData.amaHistory?.filter(a => a.isWinner) || []
                    },
                    labelSubmissions: artistData.labelSubmissions?.map(sub => ({
                        status: sub.status,
                        hasCountdownPage: sub.hasCountdownPage || false,
                        projectReleaseDate: sub.projectReleaseDate || null,
                        release: sub.release ? {
                            id: sub.release.id,
                            title: sub.release.title,
                            coverArt: sub.release.coverArt,
                            songIds: sub.release.songIds
                        } : null
                    })) || [],
                    createdAt: Date.now(), // keeps sorting static if needed, or update it
                    updatedAt: Date.now()
                });

                // Push released songs
                for (const song of artistData.songs) {
                    if (song.isReleased && !song.remixOfSongId) {
                        await set(ref(db, `online_songs_v5/${song.id}`), {
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
                    if (release.type === 'Album' || release.type === 'EP') {
                        const albumChartEntry = gameState.billboardTopAlbums?.find(a => a.albumId === release.id);
                        const weeklyActivity = albumChartEntry ? albumChartEntry.weeklyActivity : 0;
                        const weeklySalesNum = albumChartEntry ? (albumChartEntry.weeklySales || 0) : 0;

                        await set(ref(db, `online_albums_v5/${release.id}`), {
                            id: release.id,
                            artistId: artistProfile.id,
                            artistName: artistProfile.name,
                            title: release.title,
                            type: release.type,
                            coverArt: release.coverArt || null,
                            weeklySales: weeklyActivity, // In DB, we use weeklySales to sort, so let's push weeklyActivity to it so we sort by activity
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
