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
        const unsubPosts = onValue(ref(db, 'posts'), (snapshot) => {
            let posts: any[] = [];
            if (snapshot.exists()) {
                snapshot.forEach(child => {
                    const data = child.val();
                    if (data.createdAt >= EPOCH) posts.push({ id: child.key, ...data });
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
                    if (data.createdAt >= EPOCH) songs.push({ id: child.key, ...data });
                });
            }
            songs.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
            songs = songs.slice(-100);
            dispatch({ type: 'SYNC_ONLINE_SONGS', payload: songs.reverse() });
        }, (error) => console.error("Error syncing songs:", error));
        
        // Listen to albums
        const unsubAlbums = onValue(ref(db, 'albums'), (snapshot) => {
            let albums: any[] = [];
            if (snapshot.exists()) {
                snapshot.forEach(child => {
                    const data = child.val();
                    if (data.createdAt >= EPOCH) albums.push({ id: child.key, ...data });
                });
            }
            albums.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
            albums = albums.slice(-50);
            dispatch({ type: 'SYNC_ONLINE_ALBUMS', payload: albums.reverse() });
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

