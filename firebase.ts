import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, query, where, serverTimestamp } from 'firebase/firestore';
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

export const createOnlineArtist = async (userId: string, name: string, genre: string) => {
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
