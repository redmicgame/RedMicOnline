import { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { onSnapshot, collection, query, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export const useOnlineSync = () => {
    const { gameState, dispatch } = useGame();
    
    useEffect(() => {
        if (gameState.offlineMode) return;
        
        // Listen to top posts
        const qPosts = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
        const unsubPosts = onSnapshot(qPosts, (snapshot) => {
            const posts: any[] = [];
            snapshot.forEach(doc => posts.push({ id: doc.id, ...doc.data() }));
            dispatch({ type: 'SYNC_ONLINE_POSTS', payload: posts });
        });

        // Listen to songs
        const qSongs = query(collection(db, 'songs'), orderBy('createdAt', 'desc'), limit(100));
        const unsubSongs = onSnapshot(qSongs, (snapshot) => {
            const songs: any[] = [];
            snapshot.forEach(doc => songs.push({ id: doc.id, ...doc.data() }));
            dispatch({ type: 'SYNC_ONLINE_SONGS', payload: songs });
        });
        
        // Listen to albums
        const qAlbums = query(collection(db, 'albums'), orderBy('createdAt', 'desc'), limit(50));
        const unsubAlbums = onSnapshot(qAlbums, (snapshot) => {
            const albums: any[] = [];
            snapshot.forEach(doc => albums.push({ id: doc.id, ...doc.data() }));
            dispatch({ type: 'SYNC_ONLINE_ALBUMS', payload: albums });
        });

        // Listen to artists
        const qArtists = query(collection(db, 'artists'), orderBy('createdAt', 'desc'), limit(100));
        const unsubArtists = onSnapshot(qArtists, (snapshot) => {
            const artists: any[] = [];
            snapshot.forEach(doc => artists.push({ id: doc.id, ...doc.data() }));
            dispatch({ type: 'SYNC_ONLINE_ARTISTS', payload: artists });
        });

        return () => {
            unsubPosts();
            unsubSongs();
            unsubAlbums();
            unsubArtists();
        };
    }, [gameState.offlineMode, dispatch]);
};
