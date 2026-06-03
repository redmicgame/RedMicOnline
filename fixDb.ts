import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, remove, update } from "firebase/database";
import fs from "fs";

const firebaseConfigRaw = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const firebaseConfig = {
  ...firebaseConfigRaw,
  databaseURL: `https://${firebaseConfigRaw.projectId}-default-rtdb.firebaseio.com`
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const run = async () => {
    const targets = ["Cardi B", "Beyoncé", "Tinashe", "Beyonce"];
    try {
        const artistsRef = ref(db, 'artists_v3');
        const snapshot = await get(artistsRef);
        if (snapshot.exists()) {
            const updates = {};
            snapshot.forEach((child) => {
                const data = child.val();
                if (targets.includes(data.name)) {
                    console.log(`Deleting ${data.name} (id: ${child.key})`);
                    remove(child.ref);
                }
            });
        }
        console.log("Done");
    } catch(err) {
        console.error(err);
    }
    process.exit(0);
};

run();
