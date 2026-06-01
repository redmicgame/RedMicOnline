import { initializeApp } from 'firebase/app';
import { getFirestore, getDoc, doc } from 'firebase/firestore';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function testFetch() {
    try {
        console.log("Fetching...");
        const d = await getDoc(doc(db, 'users', 'test'));
        console.log("Exists:", d.exists());
    } catch(err) {
        console.error("Error!!!", err);
    }
    process.exit(0);
}

testFetch();
