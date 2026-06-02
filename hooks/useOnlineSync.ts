import { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import { db } from '../firebase';

export const useOnlineSync = () => {
    const { gameState, dispatch } = useGame();
    
    useEffect(() => {
        if (gameState.offlineMode) return;
        
        const EPOCH = 1780344837000;

        // Listen to top posts
        const unsubPosts = onValue(ref(db, 'x_posts'), (snapshot) => {
            let posts: any[] = [];
            if (snapshot.exists()) {
                snapshot.forEach(child => {
                    const data = child.val();
                    if ((data.createdAt || data.date?.year) >= 0) posts.push({ id: child.key, ...data });
                });
            }
            posts.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
            posts = posts.slice(-50);
            dispatch({ type: 'SYNC_ONLINE_POSTS', payload: posts.reverse() });
        }, (error) => console.error("Error syncing posts:", error));

        // Listen to songs
        const unsubSongs = onValue(ref(db, 'songs'), (snapshot) => {
            let songs: any[] = [];
            if (snapshot.exists()) {
                snapshot.forEach(child => {
                    const data = child.val();
                    if (((data.createdAt || data.updatedAt) >= EPOCH || true) && (!data.type || data.type === 'Single')) {
                        songs.push({ id: child.key, ...data });
                    }
                });
            }
            songs.sort((a, b) => (b.lastWeekStreams || 0) - (a.lastWeekStreams || 0));
            songs = songs.slice(0, 300);
            dispatch({ type: 'SYNC_ONLINE_SONGS', payload: songs });
        }, (error) => console.error("Error syncing songs:", error));
        
        // Listen to albums
        const unsubAlbums = onValue(ref(db, 'albums'), (snapshot) => {
            let albums: any[] = [];
            if (snapshot.exists()) {
                snapshot.forEach(child => {
                    const data = child.val();
                    if (((data.createdAt || data.updatedAt) >= EPOCH || true) && (!data.type || data.type === 'Album' || data.type === 'EP' || data.type === 'Album (Deluxe)' || data.type === 'Compilation')) {
                        albums.push({ id: child.key, ...data });
                    }
                });
            }
            albums.sort((a, b) => (b.weeklySales || 0) - (a.weeklySales || 0));
            albums = albums.slice(0, 200);
            dispatch({ type: 'SYNC_ONLINE_ALBUMS', payload: albums });
        }, (error) => console.error("Error syncing albums:", error));

        // Listen to artists
        const unsubArtists = onValue(ref(db, 'artists'), (snapshot) => {
            let artists: any[] = [];
            if (snapshot.exists()) {
                snapshot.forEach(child => {
                    const data = child.val();
                    if (data.createdAt >= EPOCH) artists.push({ id: child.key, ...data });
                });
            }
            artists.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
            artists = artists.slice(-100);
            dispatch({ type: 'SYNC_ONLINE_ARTISTS', payload: artists.reverse() });
        }, (error) => console.error("Error syncing artists:", error));

        return () => {
            unsubPosts();
            unsubSongs();
            unsubAlbums();
            unsubArtists();
        };
    }, [gameState.offlineMode, dispatch]);
};

