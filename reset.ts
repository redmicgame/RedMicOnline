import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function reset() {
    const collections = ['artists', 'users', 'x_posts', 'x_messages', 'saves', 'posts', 'songs', 'albums', 'playlists', 'charts'];
    for (const c of collections) {
        const snap = await getDocs(collection(db, c));
        let count = 0;
        for (const d of snap.docs) {
            await deleteDoc(doc(db, c, d.id));
            count++;
        }
        console.log(`Deleted ${count} from ${c}`);
    }
    process.exit(0);
}

reset().catch(console.error);
