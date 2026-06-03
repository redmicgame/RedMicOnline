import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getDatabase, ref, set, get, child, push, remove, onValue, query as rtdbQuery, orderByChild, equalTo, limitToLast, serverTimestamp } from 'firebase/database';
import firebaseConfigRaw from './firebase-applet-config.json';

const firebaseConfig = {
  ...firebaseConfigRaw,
  databaseURL: `https://${firebaseConfigRaw.projectId}-default-rtdb.firebaseio.com`
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Database Error: ', JSON.stringify(errInfo));
  
  if (errInfo.error.includes('resource-exhausted') || errInfo.error.includes('Quota limit exceeded')) {
     window.dispatchEvent(new Event('server-down'));
  }

  throw new Error(JSON.stringify(errInfo));
}

export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("Error signing in with Google:", error);
        throw error;
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out:", error);
    }
};

export const getOrCreateUser = async (user: any) => {
    const path = `users/${user.uid}`;
    try {
        const snapshot = await get(child(ref(db), path));
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            const newUser = {
                uid: user.uid,
                email: user.email,
                createdAt: Date.now()
            };
            await set(ref(db, path), newUser);
            return newUser;
        }
    } catch(err) {
        handleFirestoreError(err, OperationType.GET, path);
    }
}

export const resumeOnlineArtist = async (userId: string, name: string) => {
    try {
        const artistsRef = ref(db, 'artists_v3');
        const snapshot = await get(artistsRef);
        let foundArtist: any = null;
        let foundArtistId: string = '';
        if (snapshot.exists()) {
            snapshot.forEach((child) => {
                if (child.val().name === name) {
                    foundArtist = child.val();
                    foundArtistId = child.key as string;
                }
            });
        }
        
        if (foundArtist) {
            // Check if this artist is protected or if the user owns it
            const isOwner = foundArtist.ownerId === userId;
            const isProtected = ['Melanie Martinez', 'Doja Cat', 'Tinashe'].includes(name);
            
            if (!isOwner && !isProtected) {
                throw new Error(`The artist name "${name}" is registered to another user.`);
            }

            // Update user to point to this artist
            const userPath = `users/${userId}`;
            const userSnapshot = await get(child(ref(db), userPath));
            if(userSnapshot.exists()) {
                const userData = userSnapshot.val();
                await set(ref(db, userPath), {
                    ...userData,
                    activeArtistId: foundArtistId,
                    updatedAt: Date.now()
                });
            }
            return { id: foundArtistId, ...foundArtist };
        } else {
            throw new Error(`The artist name "${name}" does not exist to resume.`);
        }
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const createOnlineArtist = async (userId: string, name: string, genre: string, code?: string) => {
    try {
        const uppercaseName = name.toUpperCase();
        if ((uppercaseName === 'RIHANNA' || uppercaseName === 'ADÉLA') && code !== '2345') {
            throw new Error(`The name "${name}" is reserved. You must enter a valid invite code to use it.`);
        }

        const artistsRef = ref(db, 'artists_v3');
        const snapshot = await get(artistsRef);
        if (snapshot.exists()) {
            let nameTaken = false;
            snapshot.forEach((child) => {
                if (child.val().name === name) nameTaken = true;
            });
            if (nameTaken) {
                throw new Error(`The artist name "${name}" is already taken by another online player.`);
            }
        }
    } catch (err: any) {
        throw new Error(err.message);
    }

    const artistId = `artist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const path = `artists/${artistId}`;
    try {
        const newArtist = {
            ownerId: userId,
            name,
            genre,
            funds: 100000,
            popularity: 0,
            energy: 100,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        await set(ref(db, path), newArtist);
        
        // Update user
        const userPath = `users/${userId}`;
        const userSnapshot = await get(child(ref(db), userPath));
        if(userSnapshot.exists()) {
            const userData = userSnapshot.val();
            await set(ref(db, userPath), {
                ...userData,
                activeArtistId: artistId,
                updatedAt: Date.now()
            });
        }
        
        return { id: artistId, ...newArtist };
    } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
    }
}

export const getArtistData = async (artistId: string) => {
    const path = `artists/${artistId}`;
    try {
        const snapshot = await get(child(ref(db), path));
        if (snapshot.exists()) {
            return { id: artistId, ...snapshot.val() };
        }
        return null;
    } catch (err) {
        handleFirestoreError(err, OperationType.GET, path);
    }
}

export const updateOnlineArtistProfileImage = async (artistId: string, image: string) => {
    try {
        const artistRef = ref(db, `artists_v3/${artistId}`);
        const snapshot = await get(artistRef);
        if (snapshot.exists()) {
            await set(artistRef, {
                ...snapshot.val(),
                image,
                updatedAt: Date.now()
            });
        }
    } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `artists/${artistId}`);
    }
};

export const updateOnlineArtistName = async (artistId: string, name: string) => {
    try {
        const artistRef = ref(db, `artists_v3/${artistId}`);
        const snapshot = await get(artistRef);
        if (snapshot.exists()) {
            await set(artistRef, {
                ...snapshot.val(),
                name,
                updatedAt: Date.now()
            });
        }
    } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `artists/${artistId}`);
    }
};

export const updateOnlineArtistFeaturePrice = async (artistId: string, price: number) => {
    try {
        const artistRef = ref(db, `artists_v3/${artistId}`);
        const snapshot = await get(artistRef);
        if (snapshot.exists()) {
            await set(artistRef, {
                ...snapshot.val(),
                featurePrice: price,
                updatedAt: Date.now()
            });
        }
    } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `artists/${artistId}`);
    }
};

export const getAllOnlineArtists = async () => {
    try {
        const artistsRef = ref(db, 'artists_v3');
        const snapshot = await get(artistsRef);
        const artists: any[] = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                artists.push({ id: childSnapshot.key, ...childSnapshot.val() });
            });
            artists.sort((a, b) => b.createdAt - a.createdAt);
        }
        return artists.slice(0, 100);
    } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'artists');
        return [];
    }
}

export const getUserSaves = async (userId: string) => {
    const path = 'saves';
    try {
        const savesRef = ref(db, 'saves');
        const snapshot = await get(savesRef);
        const saves: any[] = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                if (data.userId === userId) {
                    saves.push({ id: childSnapshot.key, ...data });
                }
            });
        }
        return saves;
    } catch(err) {
        handleFirestoreError(err, OperationType.LIST, path);
        return [];
    }
};

export const deleteCloudSave = async (userId: string, saveId: string) => {
    const path = `saves/${saveId}`;
    try {
        await remove(ref(db, path));
    } catch(err) {
        handleFirestoreError(err, OperationType.DELETE, path);
    }
};

export const saveGameToCloud = async (userId: string, saveId: string | null, gameState: any) => {
    const newSaveId = saveId || crypto.randomUUID();
    const path = `saves/${newSaveId}`;
    try {
        const activeArtist = gameState.onlineArtist || gameState.soloArtist;
        await set(ref(db, path), {
            userId,
            gameState,
            artistName: activeArtist?.name || 'Unknown',
            year: gameState.date?.year || 2024,
            week: gameState.date?.week || 1,
            updatedAt: Date.now() // Realtime DB has proper rules logic, but we use simple dates here
        });
        return newSaveId;
    } catch(err) {
        handleFirestoreError(err, OperationType.WRITE, path);
    }
};

// X posts
export const publishXPost = async (authorId: string, authorName: string, text: string, postId?: string) => {
    try {
        const actualPostId = postId || push(ref(db, 'x_posts_v3')).key;
        if (!actualPostId) return;
        const postsRef = ref(db, `x_posts_v3/${actualPostId}`);
        await set(postsRef, {
            id: actualPostId,
            authorId,
            authorName,
            content: text,
            createdAt: Date.now(),
            likes: Math.floor(Math.random() * 100),
            retweets: Math.floor(Math.random() * 20),
            views: Math.floor(Math.random() * 1000)
        });
    } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'x_posts');
    }
};

// Messages
export const sendDirectMessage = async (senderId: string, receiverId: string, text: string, messageId?: string) => {
    try {
        const actualMessageId = messageId || push(ref(db, 'x_messages')).key;
        if (!actualMessageId) return;
        const messagesRef = ref(db, `x_messages/${actualMessageId}`);
        const participants = [senderId, receiverId].sort();
        const chatId = participants.join('_');
        
        await set(messagesRef, {
            id: actualMessageId,
            chatId,
            senderId,
            receiverId,
            text,
            createdAt: Date.now()
        });
    } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'x_messages');
    }
};

export const listenToDirectMessages = (userId: string, callback: (messages: any[]) => void) => {
    const messagesRef = ref(db, 'x_messages');
    // In RTDB, we can't do complex OR queries easily. We just pull messages that contain us in chatId.
    // Or we just get all and filter (for client side since this is simple free tier).
    // Or we could have structured data as x_messages/chatId/... maybe better.
    const unsubscribe = onValue(messagesRef, (snapshot) => {
        const messages: any[] = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                if (data.senderId === userId || data.receiverId === userId) {
                    messages.push({ id: childSnapshot.key, ...data });
                }
            });
            messages.sort((a, b) => a.createdAt - b.createdAt);
        }
        callback(messages);
    });
    return () => unsubscribe();
};

// Online Music Distribution & Charts
export const sendFeatureRequest = async (senderId: string, senderName: string, receiverId: string, requestType: 'song' | 'music_video', title: string, cost: number, targetId: string) => {
    try {
        const actualRequestId = push(ref(db, 'feature_requests')).key;
        if (!actualRequestId) return;
        const requestsRef = ref(db, `feature_requests/${actualRequestId}`);
        await set(requestsRef, {
            senderId,
            senderName,
            receiverId,
            requestType,
            title,
            cost,
            targetId,
            status: 'pending',
            createdAt: Date.now()
        });
    } catch(err) {
        handleFirestoreError(err, OperationType.CREATE, 'feature_requests');
    }
};

export const listenToFeatureRequests = (userId: string, callback: (requests: any[]) => void) => {
    const unsubscribe = onValue(ref(db, 'feature_requests'), (snapshot) => {
        const requests: any[] = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                if (data.receiverId === userId && data.status === 'pending') {
                    requests.push({ id: childSnapshot.key, ...data });
                }
            });
        }
        callback(requests);
    });
    return () => unsubscribe();
};

export const listenToFeatureRequestApprovals = (userId: string, callback: (approvals: any[]) => void) => {
    const unsubscribe = onValue(ref(db, 'feature_requests'), (snapshot) => {
        const requests: any[] = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                if (data.senderId === userId && data.status === 'accepted') {
                    requests.push({ id: childSnapshot.key, ...data });
                }
            });
        }
        callback(requests);
    });
    return () => unsubscribe();
};

export const updateFeatureRequestStatus = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
        const requestRef = ref(db, `feature_requests/${requestId}`);
        const snapshot = await get(requestRef);
        if (snapshot.exists()) {
            await set(requestRef, {
                ...snapshot.val(),
                status,
                updatedAt: Date.now()
            });
        }
    } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `feature_requests/${requestId}`);
    }
};

export const publishOnlineSong = async (artistId: string, artistName: string, songId: string, title: string, quality: number, genre: string) => {
    try {
        await set(ref(db, `online_songs_v3/${songId}`), {
            artistId,
            artistName,
            title,
            quality,
            genre,
            allTimeStreams: 0,
            weeklyStreams: 0,
            createdAt: Date.now()
        });
    } catch(err) {
        handleFirestoreError(err, OperationType.WRITE, 'online_songs_v3');
    }
};

export const updateOnlineSongStreams = async (songId: string, allTimeStreams: number, weeklyStreams: number) => {
    try {
        const songRef = ref(db, `online_songs_v3/${songId}`);
        const snapshot = await get(songRef);
        if (snapshot.exists()) {
            await set(songRef, {
                ...snapshot.val(),
                allTimeStreams,
                weeklyStreams,
                updatedAt: Date.now()
            });
        }
    } catch(err) {
        handleFirestoreError(err, OperationType.WRITE, 'online_songs_v3');
    }
};

export const getOnlineSpotifySongsChart = async () => {
    try {
        const snapshot = await get(ref(db, 'online_songs_v3'));
        let songs: any[] = [];
        if (snapshot.exists()) {
            snapshot.forEach(childSnapshot => {
                songs.push({ id: childSnapshot.key, ...childSnapshot.val() });
            });
            songs.sort((a, b) => (b.weeklyStreams || 0) - (a.weeklyStreams || 0));
            songs = songs.slice(0, 50);
        }
        return songs;
    } catch(err) {
        handleFirestoreError(err, OperationType.LIST, 'online_songs_v3');
        return [];
    }
};

export const publishOnlineAlbum = async (artistId: string, artistName: string, albumId: string, title: string, type: string) => {
    try {
        await set(ref(db, `online_albums_v3/${albumId}`), {
            artistId,
            artistName,
            title,
            type,
            allTimeStreams: 0,
            weeklyStreams: 0,
            createdAt: Date.now()
        });
    } catch(err) {
        handleFirestoreError(err, OperationType.WRITE, 'online_albums_v3');
    }
};

export const updateOnlineAlbumStreams = async (albumId: string, allTimeStreams: number, weeklyStreams: number) => {
    try {
        const albumRef = ref(db, `online_albums_v3/${albumId}`);
        const snapshot = await get(albumRef);
        if (snapshot.exists()) {
            await set(albumRef, {
                ...snapshot.val(),
                allTimeStreams,
                weeklyStreams,
                updatedAt: Date.now()
            });
        }
    } catch(err) {
        handleFirestoreError(err, OperationType.WRITE, 'online_albums_v3');
    }
};

export const getOnlineSpotifyAlbumsChart = async () => {
    try {
        const snapshot = await get(ref(db, 'online_albums_v3'));
        let albums: any[] = [];
        if (snapshot.exists()) {
            snapshot.forEach(childSnapshot => {
                albums.push({ id: childSnapshot.key, ...childSnapshot.val() });
            });
            albums.sort((a, b) => (b.weeklyStreams || 0) - (a.weeklyStreams || 0));
            albums = albums.slice(0, 50);
        }
        return albums;
    } catch(err) {
        handleFirestoreError(err, OperationType.LIST, 'online_albums_v3');
        return [];
    }
};

async function testConnection() {
  try {
    const snap = await get(ref(db, 'test/connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

