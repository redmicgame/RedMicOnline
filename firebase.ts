import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, query, where, orderBy, onSnapshot, serverTimestamp, limit, addDoc, deleteDoc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
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
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  
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
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
            return userDoc.data();
        } else {
            const newUser = {
                uid: user.uid,
                email: user.email,
                createdAt: Date.now()
            };
            await setDoc(doc(db, 'users', user.uid), newUser);
            return newUser;
        }
    } catch(err) {
        handleFirestoreError(err, OperationType.GET, path);
    }
}

export const createOnlineArtist = async (userId: string, name: string, genre: string, code?: string) => {
    try {
        const uppercaseName = name.toUpperCase();
        if ((uppercaseName === 'RIHANNA' || uppercaseName === 'ADÉLA') && code !== '2345') {
            throw new Error(`The name "${name}" is reserved. You must enter a valid invite code to use it.`);
        }

        const q = query(collection(db, 'artists'), where('name', '==', name));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            throw new Error(`The artist name "${name}" is already taken by another online player.`);
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
        await setDoc(doc(db, 'artists', artistId), newArtist);
        
        // Update user
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        if(userDoc.exists()) {
            const userData = userDoc.data();
            await setDoc(userRef, {
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
        const artistDoc = await getDoc(doc(db, 'artists', artistId));
        if (artistDoc.exists()) {
            return { id: artistDoc.id, ...artistDoc.data() };
        }
        return null;
    } catch (err) {
        handleFirestoreError(err, OperationType.GET, path);
    }
}

export const updateOnlineArtistFeaturePrice = async (artistId: string, price: number) => {
    try {
        await setDoc(doc(db, 'artists', artistId), {
            featurePrice: price,
            updatedAt: Date.now()
        }, { merge: true });
    } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `artists/${artistId}`);
    }
};

export const getAllOnlineArtists = async () => {
    try {
        const q = query(collection(db, 'artists'), orderBy('createdAt', 'desc'), limit(100));
        const querySnapshot = await getDocs(q);
        const artists: any[] = [];
        querySnapshot.forEach((doc) => {
            artists.push({ id: doc.id, ...doc.data() });
        });
        return artists;
    } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'artists');
        return [];
    }
}

export const getUserSaves = async (userId: string) => {
    const path = 'saves';
    try {
        const q = query(collection(db, 'saves'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const saves: any[] = [];
        querySnapshot.forEach((doc) => {
            saves.push({ id: doc.id, ...doc.data() });
        });
        return saves;
    } catch(err) {
        handleFirestoreError(err, OperationType.LIST, path);
        return [];
    }
};

export const deleteCloudSave = async (userId: string, saveId: string) => {
    const path = `saves/${saveId}`;
    try {
        await deleteDoc(doc(db, 'saves', saveId));
    } catch(err) {
        handleFirestoreError(err, OperationType.DELETE, path);
    }
};

export const saveGameToCloud = async (userId: string, saveId: string | null, gameState: any) => {
    const newSaveId = saveId || crypto.randomUUID();
    const path = `saves/${newSaveId}`;
    try {
        const activeArtist = gameState.onlineArtist || gameState.soloArtist;
        await setDoc(doc(db, 'saves', newSaveId), {
            userId,
            gameState,
            artistName: activeArtist?.name || 'Unknown',
            year: gameState.date?.year || 2024,
            week: gameState.date?.week || 1,
            updatedAt: serverTimestamp()
        });
        return newSaveId;
    } catch(err) {
        handleFirestoreError(err, OperationType.WRITE, path);
    }
};

// X posts
export const publishXPost = async (authorId: string, authorName: string, text: string, postId?: string) => {
    try {
        const postsRef = collection(db, 'x_posts');
        await addDoc(postsRef, {
            id: postId,
            authorId,
            authorName,
            content: text,
            createdAt: Date.now()
        });
    } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'x_posts');
    }
};

export const listenToXPosts = (callback: (posts: any[]) => void) => {
    const q = query(collection(db, 'x_posts'), orderBy('createdAt', 'desc'), limit(50));
    return onSnapshot(q, (snapshot) => {
        const posts: any[] = [];
        snapshot.forEach((doc) => {
            posts.push({ id: doc.id, ...doc.data() });
        });
        callback(posts);
    });
};

// Messages
export const sendDirectMessage = async (senderId: string, receiverId: string, text: string, messageId?: string) => {
    try {
        const messagesRef = collection(db, 'x_messages');
        const participants = [senderId, receiverId].sort();
        const chatId = participants.join('_');
        
        await addDoc(messagesRef, {
            id: messageId || crypto.randomUUID(),
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
    const messagesRef = collection(db, 'x_messages');
    return onSnapshot(messagesRef, (snapshot) => {
        const messages: any[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.senderId === userId || data.receiverId === userId) {
                messages.push({ id: doc.id, ...data });
            }
        });
        // sort by createdAt
        messages.sort((a, b) => a.createdAt - b.createdAt);
        callback(messages);
    });
};

// Online Music Distribution & Charts
export const sendFeatureRequest = async (senderId: string, senderName: string, receiverId: string, requestType: 'song' | 'music_video', title: string, cost: number, targetId: string) => {
    try {
        const requestsRef = collection(db, 'feature_requests');
        await addDoc(requestsRef, {
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
    const q = query(collection(db, 'feature_requests'), where('receiverId', '==', userId), where('status', '==', 'pending'));
    return onSnapshot(q, (snapshot) => {
        const requests: any[] = [];
        snapshot.forEach((doc) => {
            requests.push({ id: doc.id, ...doc.data() });
        });
        callback(requests);
    });
};

export const listenToFeatureRequestApprovals = (userId: string, callback: (approvals: any[]) => void) => {
    const q = query(collection(db, 'feature_requests'), where('senderId', '==', userId), where('status', '==', 'accepted'));
    return onSnapshot(q, (snapshot) => {
        const requests: any[] = [];
        snapshot.forEach((doc) => {
            requests.push({ id: doc.id, ...doc.data() });
        });
        callback(requests);
    });
};

export const updateFeatureRequestStatus = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
        await setDoc(doc(db, 'feature_requests', requestId), {
            status,
            updatedAt: Date.now()
        }, { merge: true });
    } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `feature_requests/${requestId}`);
    }
};

export const publishOnlineSong = async (artistId: string, artistName: string, songId: string, title: string, quality: number, genre: string) => {
    try {
        await setDoc(doc(db, 'online_songs', songId), {
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
        handleFirestoreError(err, OperationType.WRITE, 'online_songs');
    }
};

export const updateOnlineSongStreams = async (songId: string, allTimeStreams: number, weeklyStreams: number) => {
    try {
        await setDoc(doc(db, 'online_songs', songId), {
            allTimeStreams,
            weeklyStreams,
            updatedAt: Date.now()
        }, { merge: true });
    } catch(err) {
        handleFirestoreError(err, OperationType.WRITE, 'online_songs');
    }
};

export const getOnlineSpotifySongsChart = async () => {
    try {
        const q = query(collection(db, 'online_songs'), orderBy('weeklyStreams', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        const songs: any[] = [];
        snapshot.forEach(doc => songs.push({ id: doc.id, ...doc.data() }));
        return songs;
    } catch(err) {
        handleFirestoreError(err, OperationType.LIST, 'online_songs');
        return [];
    }
};

export const publishOnlineAlbum = async (artistId: string, artistName: string, albumId: string, title: string, type: string) => {
    try {
        await setDoc(doc(db, 'online_albums', albumId), {
            artistId,
            artistName,
            title,
            type,
            allTimeStreams: 0,
            weeklyStreams: 0,
            createdAt: Date.now()
        });
    } catch(err) {
        handleFirestoreError(err, OperationType.WRITE, 'online_albums');
    }
};

export const updateOnlineAlbumStreams = async (albumId: string, allTimeStreams: number, weeklyStreams: number) => {
    try {
        await setDoc(doc(db, 'online_albums', albumId), {
            allTimeStreams,
            weeklyStreams,
            updatedAt: Date.now()
        }, { merge: true });
    } catch(err) {
        handleFirestoreError(err, OperationType.WRITE, 'online_albums');
    }
};

export const getOnlineSpotifyAlbumsChart = async () => {
    try {
        const q = query(collection(db, 'online_albums'), orderBy('weeklyStreams', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        const albums: any[] = [];
        snapshot.forEach(doc => albums.push({ id: doc.id, ...doc.data() }));
        return albums;
    } catch(err) {
        handleFirestoreError(err, OperationType.LIST, 'online_albums');
        return [];
    }
};

// Test connection strictly
import { getDocFromServer } from 'firebase/firestore';
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
