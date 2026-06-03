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
        const postsQuery = query(ref(db, 'x_posts_v3'), orderByChild('createdAt'), limitToLast(50));
        const unsubPosts = onValue(postsQuery, (snapshot) => {
            let posts: any[] = [];
            if (snapshot.exists()) {
                snapshot.forEach(child => {
                    posts.push({ id: child.key, ...child.val() });
                });
            }
            dispatch({ type: 'SYNC_ONLINE_POSTS', payload: posts.reverse() });
        }, (error) => console.error("Error syncing posts:", error));

        // Listen to songs (sort by lastWeekStreams)
        const songsQuery = query(ref(db, 'online_songs_v3'), orderByChild('weeklyStreams'), limitToLast(100));
        const unsubSongs = onValue(songsQuery, (snapshot) => {
            let songs: any[] = [];
            if (snapshot.exists()) {
                snapshot.forEach(child => {
                    const data = child.val();
                    songs.push({ id: child.key, ...data, lastWeekStreams: data.weeklyStreams });
                });
            }
            dispatch({ type: 'SYNC_ONLINE_SONGS', payload: songs.reverse() });
        }, (error) => console.error("Error syncing songs:", error));
        
        // Listen to albums
        const albumsQuery = query(ref(db, 'online_albums_v3'), orderByChild('weeklySales'), limitToLast(50));
        const unsubAlbums = onValue(albumsQuery, (snapshot) => {
            let albums: any[] = [];
            if (snapshot.exists()) {
                snapshot.forEach(child => {
                    const data = child.val();
                    if ((!data.type || data.type === 'Album' || data.type === 'EP' || data.type === 'Album (Deluxe)' || data.type === 'Compilation')) {
                        albums.push({ id: child.key, ...data });
                    }
                });
            }
            dispatch({ type: 'SYNC_ONLINE_ALBUMS', payload: albums.reverse() });
        }, (error) => console.error("Error syncing albums:", error));

        // Listen to artists
        const artistsQuery = query(ref(db, 'artists_v3'), orderByChild('createdAt'), limitToLast(50));
        const unsubArtists = onValue(artistsQuery, (snapshot) => {
            let artists: any[] = [];
            if (snapshot.exists()) {
                snapshot.forEach(child => {
                    artists.push({ id: child.key, ...child.val() });
                });
            }
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

