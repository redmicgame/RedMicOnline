import { initializeApp } from "firebase/app";
import { getDatabase, ref, remove } from "firebase/database";
import fs from "fs";

const firebaseConfigRaw = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const firebaseConfig = {
  ...firebaseConfigRaw,
  databaseURL: `https://${firebaseConfigRaw.projectId}-default-rtdb.firebaseio.com`
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const run = async () => {
    try {
        const nodes = [
            'artists', 'songs', 'albums', 'x_posts', 'x_trends', 'news', 'online_songs', 'online_albums', 'saves', 'users', 'saves_v2',
            'artists_v3', 'songs_v3', 'albums_v3', 'x_posts_v3', 'x_trends_v3', 'news_v3', 'online_songs_v3', 'online_albums_v3', 'saves_v3',
            'artists_v4', 'songs_v4', 'albums_v4', 'x_posts_v4', 'x_trends_v4', 'news_v4', 'online_songs_v4', 'online_albums_v4', 'saves_v4'
        ];
        for (const n of nodes) {
            console.log(`Deleting ${n}`);
            await remove(ref(db, n));
        }
        console.log("Deleted old DB nodes.");
    } catch(err) {
        console.error(err);
    }
    process.exit(0);
};

run();
