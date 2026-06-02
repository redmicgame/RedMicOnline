import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, remove } from "firebase/database";
import { getAuth, signInAnonymously } from "firebase/auth";
import * as fs from "fs";

const rawConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp({
  ...rawConfig,
  databaseURL: `https://${rawConfig.projectId}-default-rtdb.firebaseio.com`
});
const db = getDatabase(app);
const auth = getAuth(app);

async function run() {
    console.log("Authenticating...");
    try {
        await signInAnonymously(auth);
        console.log("Clearing nodes...");
        const nodes = ['artists', 'songs', 'albums', 'x_posts', 'x_trends', 'news'];
        for (const node of nodes) {
            await remove(ref(db, node));
            console.log("Cleared", node);
        }
        console.log("DB cleared");
    } catch(err) {
        console.error("Failed:", err);
    }
    process.exit(0);
}
run();
