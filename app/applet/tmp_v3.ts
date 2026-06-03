import fs from 'fs';
const files = [
  './firebase.ts', 
  './hooks/useOnlineSync.ts', 
  './hooks/useOnlinePush.ts', 
  './components/StartScreen.tsx',
  './clearDb.ts'
];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let content = fs.readFileSync(f, 'utf8');
  
  content = content.replace(/artists_v2/g, "artists_v3");
  content = content.replace(/songs_v2/g, "songs_v3");
  content = content.replace(/albums_v2/g, "albums_v3");
  content = content.replace(/x_posts_v2/g, "x_posts_v3");
  content = content.replace(/x_trends_v2/g, "x_trends_v3");
  content = content.replace(/news_v2/g, "news_v3");
  content = content.replace(/online_songs_v2/g, "online_songs_v3");
  content = content.replace(/online_albums_v2/g, "online_albums_v3");

  fs.writeFileSync(f, content);
}

let dbContent = fs.readFileSync('./db/db.ts', 'utf8');
dbContent = dbContent.replace(/super\('red-mic-game'\);/g, "super('red-mic-v3');");
fs.writeFileSync('./db/db.ts', dbContent);
console.log("Renamed to v3");
