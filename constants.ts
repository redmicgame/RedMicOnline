
import { Label, Manager, SecurityTeam } from './types';
import { ArtistData } from './types';

export const INITIAL_MONEY = 100000;

export const GENRES = ['Pop', 'Hip Hop', 'R&B', 'Rock', 'Electronic', 'Indie', 'Country', 'Christmas', 'K-Pop', 'Latin', 'Afrobeats', 'Reggae'];

export const STUDIOS = [
    { name: 'Voice Memos', cost: 0, qualityRange: [1, 5] },
    { name: 'Bedroom Studio', cost: 5000, qualityRange: [10, 50] },
    { name: 'Local Studio', cost: 20000, qualityRange: [30, 70] },
    { name: 'Pro Studio', cost: 80000, qualityRange: [50, 90] },
    { name: 'Legendary Studio', cost: 250000, qualityRange: [70, 100] },
];

export const REVIEW_COST = 1000;

export const REVIEWER_NAMES = [
    'Jianna Dominguez',
    'Marcus Finch',
    'Corinne Bailey',
    'Leo Valdez',
    'Simone Dubois',
    'Rich Juzwiak',
    'Elena Petrova',
    'Samir Gupta'
];

// YouTube Constants
export const VIDEO_COSTS = {
    'Visualizer': 5000,
    'Lyric Video': 15000,
    'Music Video': 50000,
    'Custom': 2500,
};

export const SUBSCRIBER_THRESHOLD_STORE = 500000;
export const SUBSCRIBER_THRESHOLD_VERIFIED = 1000000;
export const VIEWS_THRESHOLD_VERIFIED = 10000000;

// Merch Constants
export const MERCH_PRODUCT_LIMIT = 30;

// Economy Constants
export const STREAM_INCOME_MULTIPLIER = 0.004; // $0.004 per stream
export const VIEW_INCOME_MULTIPLIER = 0.001; // $0.001 per view
export const CATALOG_VALUE_MULTIPLIER = 0.5; // Catalog is worth $0.50 per total stream

export const TIER_LEVELS: { [key in Label['tier']]: number } = {
    'Low': 1,
    'Mid-Low': 2,
    'Mid-high': 3,
    'Top': 4,
};


// Promotion Constants
export const PROMOTION_PACKAGES = {
    song: [
        { name: 'Guaranteed Placement', weeklyCost: 2500, boost: 1.5, description: 'Your song, their playlist. No questions asked.', requiredTier: 'Low' as const },
        { name: 'Airwave Saturation', weeklyCost: 12500, boost: 2.5, description: 'Ensure your track is on repeat across all stations.', requiredTier: 'Mid-Low' as const },
        { name: 'Viral Injection', weeklyCost: 75000, boost: 4.0, description: 'Forge a viral moment. Authenticity not included.', requiredTier: 'Mid-high' as const },
        { name: 'Industry Plant Initiative', weeklyCost: 125000, boost: 10, description: 'The full package. We make them a star.', requiredTier: 'Top' as const },
    ],
    video: [
        { name: 'Homepage Hijack', weeklyCost: 5000, boost: 2, description: 'Front page placement. Guaranteed.' },
        { name: 'Algorithmic Manipulation', weeklyCost: 18750, boost: 3.5, description: 'Force your video into the recommendation engine.' },
        { name: 'Bot Farm Boost', weeklyCost: 125000, boost: 10, description: 'Simulate viral engagement with our network.' },
        { name: 'Stream Laundering', weeklyCost: 75000, boost: -1, description: 'Convert song streams into "organic" video views.' },
        { name: 'Manufactured Event', weeklyCost: 250000, boost: 30, description: 'Create the illusion of a worldwide premiere event.' },
        { name: 'The Takeover', weeklyCost: 2500000, boost: 75, description: 'An offer you can\'t refuse. Your video will be everywhere.' }
    ],
    resurgence: [
        { name: 'Memory Machine', weeklyCost: 31250, boost: 10, description: 'Revive a classic with a modern "organic" trend.' },
        { name: 'Zombie Hit Revival', weeklyCost: 125000, boost: 30, description: 'Resurrect a forgotten hit and make it a legend.' }
    ]
};

// Spotify Constants
export const PLAYLIST_PITCH_COST = 5000;
export const PLAYLIST_PITCH_SUCCESS_RATE = 0.5; // 50%
export const PLAYLIST_BOOST_MULTIPLIER = 1.2;
export const PLAYLIST_BOOST_WEEKS = 2;


// Chart Constants
export const NPC_ARTIST_NAMES = [
    'Taylor Swift', 'Ariana Grande', 'Billie Eilish', 'The Weeknd', 'Drake', 
    'Justin Bieber', 'Ed Sheeran', 'Beyoncé', 'Rihanna', 'Adele', 
    'Post Malone', 'Dua Lipa', 'Olivia Rodrigo', 'Harry Styles', 'Bad Bunny',
    'Kendrick Lamar', 'J. Cole', 'Travis Scott', 'Doja Cat', 'SZA',
    'Lana Del Rey', 'Frank Ocean', 'Tyler, the Creator', 'Lil Nas X', 'Cardi B',
    'Nicki Minaj', 'Megan Thee Stallion', 'Kanye West', 'Jay-Z', 'Eminem',
    'Lady Gaga', 'Bruno Mars', 'Miley Cyrus', 'Selena Gomez', 'Demi Lovato',
    'Shawn Mendes', 'Camila Cabello', 'Halsey', 'Lorde', 'Charli XCX',
    'Coldplay', 'Imagine Dragons', 'Maroon 5', 'OneRepublic', 'Arctic Monkeys',
    'The 1975', 'Tame Impala', 'Glass Animals', 'FINNEAS', 'Jack Harlow',
    'Sabrina Carpenter', 'Tate McRae', 'Chappell Roan', 'Ice Spice', '21 Savage',
    'Future', 'Metro Boomin', 'Morgan Wallen', 'Luke Combs', 'Zach Bryan',
    'Peso Pluma', 'Karol G', 'Shakira', 'Rauw Alejandro', 'Anitta',
    // Added for more collaboration options
    // Female Rappers
    'Latto', 'GloRilla', 'Sexyy Red', 'Coi Leray', 'Flo Milli',
    // K-Pop Artists
    'BTS', 'BLACKPINK', 'NewJeans', 'Stray Kids', 'TWICE', 'SEVENTEEN', 'LE SSERAFIM', '(G)I-DLE', 'Jungkook', 'Jennie', 'Lisa', 'aespa',
    // Latin Artists
    'J Balvin', 'Maluma', 'Rosalía', 'Feid', 'Myke Towers', 'Young Miko', 'Ozuna', 'Bizarrap',
    // Electronic Artists
    'Calvin Harris', 'David Guetta', 'Skrillex', 'Diplo', 'Zedd', 'Martin Garrix',
    // Reggae Artists
    'Bob Marley', 'Sean Paul', 'Koffee', 'Shaggy', 'Popcaan',
    // Afrobeats Artists
    'Burna Boy', 'Wizkid', 'Davido', 'Rema', 'Tems', 'Asake', 'Omah Lay',
    // Indie Artists
    'Huda Mustafa', 'TRIM', 'Sunshine Benzi', 'Stunna Sandy'
];

export const NPC_ARTIST_GENRES: Record<string, string> = {
    'Taylor Swift': 'Pop', 'Ariana Grande': 'Pop', 'Billie Eilish': 'Pop', 'The Weeknd': 'Pop', 'Drake': 'Hip Hop', 
    'Justin Bieber': 'Pop', 'Ed Sheeran': 'Pop', 'Beyoncé': 'R&B', 'Rihanna': 'Pop', 'Adele': 'Pop', 
    'Post Malone': 'Hip Hop', 'Dua Lipa': 'Pop', 'Olivia Rodrigo': 'Pop', 'Harry Styles': 'Pop', 'Bad Bunny': 'Latin',
    'Kendrick Lamar': 'Hip Hop', 'J. Cole': 'Hip Hop', 'Travis Scott': 'Hip Hop', 'Doja Cat': 'Hip Hop', 'SZA': 'R&B',
    'Lana Del Rey': 'Indie', 'Frank Ocean': 'R&B', 'Tyler, the Creator': 'Hip Hop', 'Lil Nas X': 'Hip Hop', 'Cardi B': 'Hip Hop',
    'Nicki Minaj': 'Hip Hop', 'Megan Thee Stallion': 'Hip Hop', 'Kanye West': 'Hip Hop', 'Jay-Z': 'Hip Hop', 'Eminem': 'Hip Hop',
    'Lady Gaga': 'Pop', 'Bruno Mars': 'Pop', 'Miley Cyrus': 'Pop', 'Selena Gomez': 'Pop', 'Demi Lovato': 'Pop',
    'Shawn Mendes': 'Pop', 'Camila Cabello': 'Pop', 'Halsey': 'Pop', 'Lorde': 'Indie', 'Charli XCX': 'Pop',
    'Coldplay': 'Rock', 'Imagine Dragons': 'Rock', 'Maroon 5': 'Pop', 'OneRepublic': 'Pop', 'Arctic Monkeys': 'Rock',
    'The 1975': 'Rock', 'Tame Impala': 'Indie', 'Glass Animals': 'Indie', 'FINNEAS': 'Indie', 'Jack Harlow': 'Hip Hop',
    'Sabrina Carpenter': 'Pop', 'Tate McRae': 'Pop', 'Chappell Roan': 'Pop', 'Ice Spice': 'Hip Hop', '21 Savage': 'Hip Hop',
    'Future': 'Hip Hop', 'Metro Boomin': 'Hip Hop', 'Morgan Wallen': 'Country', 'Luke Combs': 'Country', 'Zach Bryan': 'Country',
    'Peso Pluma': 'Latin', 'Karol G': 'Latin', 'Shakira': 'Latin', 'Rauw Alejandro': 'Latin', 'Anitta': 'Latin',
    'Latto': 'Hip Hop', 'GloRilla': 'Hip Hop', 'Sexyy Red': 'Hip Hop', 'Coi Leray': 'Hip Hop', 'Flo Milli': 'Hip Hop',
    'BTS': 'K-Pop', 'BLACKPINK': 'K-Pop', 'NewJeans': 'K-Pop', 'Stray Kids': 'K-Pop', 'TWICE': 'K-Pop', 'SEVENTEEN': 'K-Pop', 'LE SSERAFIM': 'K-Pop', '(G)I-DLE': 'K-Pop', 'Jungkook': 'K-Pop', 'Jennie': 'K-Pop', 'Lisa': 'K-Pop', 'aespa': 'K-Pop',
    'J Balvin': 'Latin', 'Maluma': 'Latin', 'Rosalía': 'Latin', 'Feid': 'Latin', 'Myke Towers': 'Latin', 'Young Miko': 'Latin', 'Ozuna': 'Latin', 'Bizarrap': 'Latin',
    'Calvin Harris': 'Electronic', 'David Guetta': 'Electronic', 'Skrillex': 'Electronic', 'Diplo': 'Electronic', 'Zedd': 'Electronic', 'Martin Garrix': 'Electronic',
    'Bob Marley': 'Reggae', 'Sean Paul': 'Reggae', 'Koffee': 'Reggae', 'Shaggy': 'Reggae', 'Popcaan': 'Reggae',
    'Burna Boy': 'Afrobeats', 'Wizkid': 'Afrobeats', 'Davido': 'Afrobeats', 'Rema': 'Afrobeats', 'Tems': 'Afrobeats', 'Asake': 'Afrobeats', 'Omah Lay': 'Afrobeats',
    'Huda Mustafa': 'Indie', 'TRIM': 'Indie', 'Sunshine Benzi': 'Indie', 'Stunna Sandy': 'Indie'
};
export const NPC_SONG_ADJECTIVES = ['Golden', 'Ordinary', 'What I', 'Your', 'Midnight', 'Electric', 'Fading', 'Broken', 'Summer', 'Winter', 'Lost', 'Found', 'Starlight', 'City', 'Velvet', 'Crystal', 'Silent', 'Cosmic', 'Wild', 'Sweet', 'Bitter'];
export const NPC_SONG_NOUNS = ['Idol', 'Want', 'Dreams', 'Rain', 'Lights', 'Hearts', 'Echoes', 'Sky', 'Moon', 'Sun', 'Stars', 'Ocean', 'River', 'Memories', 'Secrets', 'Lies', 'Truth', 'Flames', 'Sparks', 'Ghosts'];
export const NPC_COVER_ART = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I2NjY2NjYztzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOTk5OTk5O3N0b3Atb3BhY2l0eToxIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjZykiIC8+CiAgPHRleHQgeD0iNTAlIiB5PSI1NCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzAwMCI+YmlsbGJvYXJkPC90ZXh0Pgo8L3N2Zz4=';


// Record Label Constants
export const LABELS: Label[] = [
    { 
        id: 'umg', 
        name: 'UMG', 
        tier: 'Top',
        logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iIzE5MTkxOSIvPjxwYXRoIGQ9Ik0zMiA1Mi4yODhjLTExLjIxMyAwLTIwLjI4OC05LjA3NS0yMC4yODgtMjAuMjg4IDAtMTEuMjEzIDkuMDc1LTIwLjI4OCAyMC4yODgtMjAuMjg4IDExLjIxMyAwIDIwLjI4OCA5LjA3NSAyMC4yODggMjAuMjg4IDAgMTEuMjEzLTkuMDc1IDIwLjI4OC0yMC4yODggMjAuMjg4ek0zMiAxNS43ODhjLTYuNzUgMC0xMi4yMjUgNS40NzYtMTIuMjI1IDEyLjIyNCAwIDYuNzUgNS40NzUgMTIuMjI1IDEyLjIyNSAxMi4yIjc1IDYuNzQ4IDAgMTIuMjI0LTUuNDc1IDEyLjIyNC0xMi4yMjUgMC02Ljc0OC01LjQ3NC0xMi4yMjQtMTIuMjI0LTEyLjIyNHoiIGZpbGw9IndoaXRlIi8+PC9zdmc+', 
        promotionMultiplier: 2.0, 
        creativeControl: 80,
        minQuality: 68,
        streamRequirement: 1_000_000_000,
        youtubeChannel: {
            name: 'Universal Music Group',
            handle: '@universalmusicgroup',
            subscribers: 58_000_000,
            banner: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
        }
    },
    { 
        id: 'interscope', 
        name: 'Interscope Records', 
        tier: 'Mid-high',
        logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iYmxhY2siLz48cGF0aCBkPSJNMjggMjBIMzZWMjRIMjhWMjBaIiBmaWxsPSJ3aGl0ZSIvPjxwYXRoIGQ9Ik0zMCAyNkgzNFY0NEgzMFYyNloiIGZpbGw9IndoaXRlIi8+PC9zdmc+', 
        promotionMultiplier: 1.7, 
        creativeControl: 70,
        minQuality: 60,
        streamRequirement: 750_000_000,
    },
    { 
        id: 'republic', 
        name: 'Republic Records', 
        tier: 'Mid-high',
        logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHJ4PSI4IiBmaWxsPSIjRkZGRkZGIi8+PHBhdGggZD0iTTMyIDYuMzk4YzQuMjY0IDAgOC40NTYgMS40MyAxMS45NDQgNC4wNDVMOC4zNiAzMS4xMjhWMTAuNDQzQzE1MjIgNy44MyAyMy4yNTYgNi40IDMyIDYuNHpNMzIgNTcuNmMtNC4yNjQgMC04LjQ1Ni0xLjQzLTExLjk0NC00LjA0NUw1NS42NCAzMi44NzJ2MjAuNjg1Yy02LjgtMi42MTItMTQuODU2LTQuMDQzLTIzLjY0LTQuMDQzeiIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==', 
        promotionMultiplier: 1.5, 
        creativeControl: 60,
        minQuality: 50,
        streamRequirement: 500_000_000,
    },
    { 
        id: 'columbia', 
        name: 'Columbia Records', 
        tier: 'Mid-Low',
        logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9ImJsYWNrIi8+PHBhdGggZD0iTTMyIDE2QzE2IDE2IDggMzIgOCAzMkM4IDMyIDE2IDQ4IDMyIDQ4QzQ4IDQ4IDU2IDMyIDU2IDMyQzU2IDMyIDQ4IDE2IDMyIDE2WiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI0Ii8+PGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iOCIgZmlsbD0id2hpdGUiLz48L3N2Zz4=', 
        promotionMultiplier: 1.4, 
        creativeControl: 50,
        minQuality: 45,
        streamRequirement: 275_000_000,
        youtubeChannel: {
            name: 'Columbia Records',
            handle: '@columbiarecords',
            subscribers: 12_500_000,
            banner: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
        }
    },
    { 
        id: 'rca', 
        name: 'RCA Records', 
        tier: 'Mid-Low',
        logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iIzAwMCIvPjxwYXRoIGQ9Ik0zMiA1MC42NjdjLTEwLjMxIDAtMTguNjY3LTguMzU3LTE4LjY2Ny0xOC42NjdzOC4zNTctMTguNjY3IDE4LjY2Ny0xOC42NjcgMTguNjY3IDguMzU3IDE4LjY2NyAxOC42NjctOC4zNTcgMTguNjY3LTE4LjY2NyAxOC42Njd6IiBmaWxsPSIjRTQxRTI3Ii8+PHBhdGggZD0iTTMyIDE4LjY2N2MtMi43NTIgMC01LjM5IDEuMTU1LTYuNTM0IDMuMzQybC0uMDA4LjAxM2MtLjE0OS4yNTYtLjIyNi41NTYtLjIyNi44NjggMCAuNzY1LjYxOCAxLjM4MyAxLjM4MyAxLjM4My4zMTIgMCAuNjA3LS4xMDMuODU1LS4yNzggMS40NjgtMS4wMzQgMy4xODUtMS41OTQgNC44NzUtMS42MS4wNTQgMCAuMTA2LjAwMi4xNi4wMDJhMS4zNjggMS4zNjggMCAwMC44MTMtLjU0MyAxLjM4MiAxLjM4MiAwIDAwLjM2OC0xLjYyNWMtLjA1My0uMDk1LS4xMTYtLjE4My0uMTg4LS4yNjQtLjk4LTEuMzMtMi40Ny0yLjA3NC00LjA5NS0yLjA3NHptLTkuMDI2IDE0LjYyNWMxLjQ0OC4wMDQgMi44OTU-.27IDQuMjM1LS44MDJsLjEyNC0uMDQ4Yy4yMDctLjA3OC40My0uMTE4LjY1LS4xMTguNzc1IDAgMS40MDQuNjMgMS40MDQgMS40MDQgMCAuMjE4LS4wNTIuNDM1LS4xNDguNjM0bC0uMDIuMDQyYy0xLjgwNyAzLjA0Mi00LjQ4IDQuNzctNy4xNzQgNC43Ny0zLjQ0NyAwLTYuNTYtMi4zNDYtNy42NzMtNS44MDgtLjA1NC0uMTcxLS4wODQtLjM1LS4wODQtLjUzNCAwLS43NzUuNjMtMS40MDQgMS40MDQtMS40MDQuMjM1IDAgLjQ2LjA2LjY2LjE2OGwxLjQ5LjY3OGMxLjMyLjYgMi43NS45MzYgNC4yNDIuOTM2em0xOC45MDgtMi40MjJjLTEuMjgtLjg4OC0yLjczLTEuMzk0LTQuMjYtMS40MDgtMi4zOTgtLjAyLTIuNTU4LS4wMi00LjY2Ni4wMDItLjg3NS4wMDItMS42NzctLjMxMi0yLjQ5LS44NzUtMS44MTctMS4yNi0yLjQxNy0zLjM4My0xLjczNC01LjU4LjU1NC0xLjc3NiAyLjA1OC0zLjA2NyAzLjg1NC0zLjQ0OC4yMS0uMDQ0LjQzLS4wNjYuNjUtLjA2Ni43NzUgMCAxLjQwNC42MyAxLjQwNCAxLjQwNCAwIC4yOS0uMDkgLjU2OC0uMjQ4LjgwMmwtLjQzMi42NDhjLS40MTcuNjI0LS45OC45OTYtMS42MTguOTk2LS4zMSAwLS41OTgtLjA3OC0uODYyLS4yMzZsLS4xMy0uMDhjLS4xOC0uMTE1LS4yODMtLjMxMi0uMjgzLS41MiAwLS4zMTIuMTY0LS42LjQyNC0uNzY2bC4wNTctLjAzNWMuNTE0LS4zMiAxLjA3My0uNDggMS42Ni0uNDgucDEuNzM4Yy4zOTIgMCAuNzU3LjE1NSAxLjAyNC40MzZsLjAzNi4wMzRjLjI2LjI1LjM5Ny41OTIuMzk3Ljk1IDAgLjM2LS4xNDIuNzA4LS4zOTcuOTYybC0uMDc0LjA3Yy0uNTU0LjUzNC0xLjI4NC44My0yLjA1LjgzLS4wMiAwIDAgMCAwIDBsLTMuMTQ4LjAwMmMtLjMxMiAwLS42LS4xMi0uODI4LS4zMjgtLjIzLS4yMi0uMzYtLjUxLS4zNi0uODI2IDAtLjI4OC4xLS4wNjIuMjgzLS43NzZsLjAxLS4wMTJjLjc3NS0uOTEyIDEuODQtMS40MTggMi45Ny0xLjQxOCAxLjI5IDAgMi40NjIuNTggMy4yMzggMS41MzZsLjA0Mi4wNTFjLjM4LjQ2LjU4MyAxLjA0LjU4MyAxLjY0IDAgLjYtLjIwMyAxLjE4LS41OSAxLjY0eiIgZmlsbD0iI0ZGRiIvPjwvc3ZnPg==',
        promotionMultiplier: 1.2, 
        creativeControl: 40,
        minQuality: 40,
        streamRequirement: 200_000_000,
    },
    { 
        id: 'atlantic', 
        name: 'Atlantic Records', 
        tier: 'Mid-Low',
        logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0id2hpdGUiLz48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIyOCIgZmlsbD0iYmxhY2siLz48cGF0aCBkPSJNMzIgMTZMNDQgNDhIMzlMMzUuNSAzOEgyOC41TDI1IDQ4SDIwTDMyIDE2Wk0zMCAzNEgzNEwzMiAyOEwzMCAzNFoiIGZpbGw9IndoaXRlIi8+PC9zdmc+',
        promotionMultiplier: 1.15, 
        creativeControl: 30,
        minQuality: 30,
        streamRequirement: 50_000_000,
    },
    { 
        id: 'epic', 
        name: 'Epic Records', 
        tier: 'Low',
        logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9ImJsYWNrIi8+PHBhdGggZD0iTTIwIDIwSDQ0VjI2SDIwVjIwWiIgZmlsbD0id2hpdGUiLz48cGF0aCBkPSJNMjAgMzBIMzhWMzZIMjBWMzBaIiBmaWxsPSJ3aGl0ZSIvPjxwYXRoIGQ9Ik0yMCA0MEg0NFY0NkgMjBWMDRaIiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==', 
        promotionMultiplier: 1.12, 
        creativeControl: 25,
        minQuality: 20,
        streamRequirement: 10_000_000,
        youtubeChannel: {
            name: 'Epic Records',
            handle: '@epicrecords',
            subscribers: 9_200_000,
            banner: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
        }
    },
    { 
        id: 'island', 
        name: 'Island Records', 
        tier: 'Low',
        logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNjQgMzJDMjguNjU0IDMyIDAgMzIgMCAzMiIgZmlsbD0id2hpdGUiLz48cGF0aCBkPSJNMCAzMkM1IDMyIDMyIDU5IDMyIDU5IiBmaWxsPSJ3aGl0ZSIvPjxwYXRoIGQ9Ik02NCAzMkM1OSA0MSAzMiA1OSAzMiA1OSIgZmlsbD0iIzAwQjk5RiIvPjxwYXRoIGQ9Ik0wIDMyQzUgMjMgMzIgNSAzMiA1IiBmaWxsPSIjRkZBMDNDIi8+PHBhdGggZD0iTTY0IDMyQzU5IDIzIDMyIDUgMzIgNSIgZmlsbD0id2hpdGUiLz48cGF0aCBkPSJNMCAzMkMzLjUgMzIgMzIgMzIgMzIgMzIiIGZpbGw9IiMwMEI5OUYiLz48L3N2Zz4=',
        promotionMultiplier: 1.1, 
        creativeControl: 20,
        minQuality: 0,
        streamRequirement: 1_000_000,
        youtubeChannel: {
            name: 'Island Records',
            handle: '@islandrecords',
            subscribers: 5_100_000,
            banner: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
        }
    },
    { 
        id: 'quality_control', 
        name: 'Quality Control Music', 
        tier: 'Mid-high',
        logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iYmxhY2siLz48dGV4dCB4PSIzMiIgeT0iMzciIGZvbnQtZmFtaWx5PSJzZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5RQzwvdGV4dD48L3N2Zz4=',
        promotionMultiplier: 1.6, 
        creativeControl: 65,
        minQuality: 70,
        streamRequirement: 0,
        contractType: 'petty'
    },
    { 
        id: 'tde', 
        name: 'Top Dawg Entertainment', 
        tier: 'Top',
        logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iYmxhY2siLz48dGV4dCB4PSIzMiIgeT0iMzciIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjIyIiBmb250LXdlaWdodD0iOTAwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VERFPC90ZXh0Pjwvc3ZnPg==',
        promotionMultiplier: 1.8, 
        creativeControl: 85,
        minQuality: 70,
        streamRequirement: 0,
        contractType: 'petty'
    },
    { 
        id: 'roc_nation', 
        name: 'Roc Nation', 
        tier: 'Top',
        logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iYmxhY2siLz48cGF0aCBkPSJNMjEuNSA0MC41TDUwLjUgMTguNUwzMi41IDM0LjVMMzggNDUuNUwyMS41IDQwLjVaIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==',
        promotionMultiplier: 1.9, 
        creativeControl: 80,
        minQuality: 70,
        streamRequirement: 0,
        contractType: 'petty'
    }
];

export const CUSTOM_LABEL_TIERS = {
    'Indie': { cost: 50000, promotionMultiplier: 1.1, requiredStreams: 0 },
    'Mid': { cost: 500000, promotionMultiplier: 1.35, requiredStreams: 100_000_000 },
    'High': { cost: 1000000, promotionMultiplier: 1.75, requiredStreams: 350_000_000 },
};

// Tour Constants
export const TOUR_TIER_REQUIREMENTS: { [key: string]: number } = {
    'Small Halls': 20,
    'Large Halls': 40,
    'Arenas': 60,
    'Stadiums': 80,
};

export const TOUR_TICKET_PRICE_SUGGESTIONS: { [key: string]: number } = {
    'Small Halls': 25,
    'Large Halls': 45,
    'Arenas': 75,
    'Stadiums': 120,
};

export const VENUES = {
    'Small Halls': [
        { name: 'The Roxy', city: 'Los Angeles', capacity: 500 }, { name: 'The Bowery Ballroom', city: 'New York', capacity: 575 }, { name: 'The Independent', city: 'San Francisco', capacity: 500 }, { name: 'Lincoln Hall', city: 'Chicago', capacity: 500 }, { name: 'The Masquerade', city: 'Atlanta', capacity: 1000 },
        { name: 'The Fillmore', city: 'San Francisco', capacity: 1315 }, { name: '9:30 Club', city: 'Washington D.C.', capacity: 1200 }, { name: 'First Avenue', city: 'Minneapolis', capacity: 1550 }, { name: 'The Showbox', city: 'Seattle', capacity: 1150 }, { name: "Stubb's BBQ", city: 'Austin', capacity: 1800 },
        { name: 'The Fonda Theatre', city: 'Los Angeles', capacity: 1200 }, { name: 'Brooklyn Steel', city: 'Brooklyn', capacity: 1800 }, { name: 'Paradise Rock Club', city: 'Boston', capacity: 933 }, { name: 'The Metro', city: 'Chicago', capacity: 1100 }, { name: 'Ogden Theatre', city: 'Denver', capacity: 1600 },
        { name: 'The Tabernacle', city: 'Atlanta', capacity: 2600 }, { name: 'House of Blues', city: 'New Orleans', capacity: 843 }, { name: 'The Wiltern', city: 'Los Angeles', capacity: 1850 }, { name: "King Tut's Wah Wah Hut", city: 'Glasgow', capacity: 300 }, { name: 'The Troubadour', city: 'London', capacity: 550 },
    ],
    'Large Halls': [
        { name: 'Hollywood Palladium', city: 'Los Angeles', capacity: 3700 }, { name: 'Hammerstein Ballroom', city: 'New York', capacity: 3500 }, { name: 'Aragon Ballroom', city: 'Chicago', capacity: 5000 }, { name: 'The Anthem', city: 'Washington D.C.', capacity: 6000 }, { name: 'Ryman Auditorium', city: 'Nashville', capacity: 2362 },
        { name: 'Radio City Music Hall', city: 'New York', capacity: 6015 }, { name: 'Greek Theatre', city: 'Los Angeles', capacity: 5870 }, { name: 'Red Rocks Amphitheatre', city: 'Morrison', capacity: 9525 }, { name: 'Bill Graham Civic Auditorium', city: 'San Francisco', capacity: 8500 }, { name: 'The Met', city: 'Philadelphia', capacity: 3500 },
        { name: 'O2 Academy Brixton', city: 'London', capacity: 4921 }, { name: 'Eventim Apollo', city: 'London', capacity: 5300 }, { name: "L'Olympia", city: 'Paris', capacity: 2000 }, { name: 'Massey Hall', city: 'Toronto', capacity: 2752 }, { name: 'Fox Theater', city: 'Oakland', capacity: 2800 },
        { name: 'The Chicago Theatre', city: 'Chicago', capacity: 3600 }, { name: 'The Armory', city: 'Minneapolis', capacity: 8400 }, { name: 'ACL Live at The Moody Theater', city: 'Austin', capacity: 2750 }, { name: 'WaMu Theater', city: 'Seattle', capacity: 7000 }, { name: 'The Fillmore', city: 'Detroit', capacity: 2900 },
    ],
    'Arenas': [
        { name: 'Madison Square Garden', city: 'New York', capacity: 20000 }, { name: 'The Forum', city: 'Los Angeles', capacity: 17500 }, { name: 'United Center', city: 'Chicago', capacity: 23500 }, { name: 'American Airlines Arena', city: 'Miami', capacity: 21000 }, { name: 'The O2', city: 'London', capacity: 20000 },
        { name: 'Crypto.com Arena', city: 'Los Angeles', capacity: 19067 }, { name: 'Barclays Center', city: 'Brooklyn', capacity: 17732 }, { name: 'Scotiabank Arena', city: 'Toronto', capacity: 19800 }, { name: 'Lanxess Arena', city: 'Cologne', capacity: 20000 }, { name: 'Accor Arena', city: 'Paris', capacity: 20300 },
        { name: '3Arena', city: 'Dublin', capacity: 13000 }, { name: 'Rod Laver Arena', city: 'Melbourne', capacity: 14820 }, { name: 'Qudos Bank Arena', city: 'Sydney', capacity: 21032 }, { name: 'TD Garden', city: 'Boston', capacity: 19580 }, { name: 'Capital One Arena', city: 'Washington D.C.', capacity: 20356 },
        { name: 'American Airlines Center', city: 'Dallas', capacity: 20000 }, { name: 'State Farm Arena', city: 'Atlanta', capacity: 21000 }, { name: 'Wells Fargo Center', city: 'Philadelphia', capacity: 21000 }, { name: 'Chase Center', city: 'San Francisco', capacity: 18064 }, { name: 'Climate Pledge Arena', city: 'Seattle', capacity: 18100 },
    ],
    'Stadiums': [
        { name: 'SoFi Stadium', city: 'Los Angeles', capacity: 70000 }, { name: 'MetLife Stadium', city: 'New York', capacity: 82500 }, { name: 'Wembley Stadium', city: 'London', capacity: 90000 }, { name: 'AT&T Stadium', city: 'Dallas', capacity: 80000 }, { name: 'Mercedes-Benz Stadium', city: 'Atlanta', capacity: 71000 },
        { name: 'Rose Bowl', city: 'Pasadena', capacity: 92542 }, { name: 'Soldier Field', city: 'Chicago', capacity: 61500 }, { name: 'Gillette Stadium', city: 'Foxborough', capacity: 65878 }, { name: 'Lincoln Financial Field', city: 'Philadelphia', capacity: 69796 }, { name: "Levi's Stadium", city: 'Santa Clara', capacity: 68500 },
        { name: 'NRG Stadium', city: 'Houston', capacity: 72220 }, { name: 'Hard Rock Stadium', city: 'Miami', capacity: 64767 }, { name: 'Estadio Azteca', city: 'Mexico City', capacity: 87523 }, { name: 'Maracanã Stadium', city: 'Rio de Janeiro', capacity: 78838 }, { name: 'Stade de France', city: 'Paris', capacity: 80698 },
        { name: 'Allianz Arena', city: 'Munich', capacity: 75024 }, { name: 'Tokyo Dome', city: 'Tokyo', capacity: 55000 }, { name: 'Anfield', city: 'Liverpool', capacity: 61000 }, { name: 'Old Trafford', city: 'Manchester', capacity: 74310 }, { name: 'Melbourne Cricket Ground', city: 'Melbourne', capacity: 100024 },
    ],
};

// Business Constants
export const MANAGERS: Manager[] = [
    { id: 'm1', name: 'Local Booker', yearlyCost: 150000, popularityBoost: 2, autoGigsPerWeek: 1, unlocksTier: 5 },
    { id: 'm2', name: 'Industry Veteran', yearlyCost: 500000, popularityBoost: 5, autoGigsPerWeek: 2, unlocksTier: 6 },
    { id: 'm3', name: 'Power Broker', yearlyCost: 2000000, popularityBoost: 10, autoGigsPerWeek: 3, unlocksTier: 7 },
];

export const SECURITY_TEAMS: SecurityTeam[] = [
    { id: 's1', name: 'Mall Cop Security', weeklyCost: 5000, leakProtection: 0.75 },
    { id: 's2', name: 'Ex-Cop Bodyguards', weeklyCost: 25000, leakProtection: 0.40 },
    { id: 's3', name: 'Elite Private Security', weeklyCost: 100000, leakProtection: 0.10 },
];

export const GIGS = [
    { name: 'Open Mic Night', description: 'Perform at a local coffee shop.', cashRange: [100, 500], hype: 2, isAvailable: (state: ArtistData) => true, requirements: 'None' },
    { name: 'Local Bar Show', description: 'A proper gig at a downtown bar.', cashRange: [500, 2000], hype: 5, isAvailable: (state: ArtistData) => state.songs.some(s => s.isReleased), requirements: 'Requires 1+ released song' },
    { name: 'Opening Act', description: 'Open for an established local band.', cashRange: [2000, 5000], hype: 10, isAvailable: (state: ArtistData) => state.songs.filter(s => s.isReleased).length >= 3 && state.monthlyListeners > 10000, requirements: '3+ released songs & 10K listeners' },
    { name: 'Headlining Small Venue', description: 'Your own show at a 200-cap venue.', cashRange: [5000, 15000], hype: 15, isAvailable: (state: ArtistData) => state.releases.some(r => r.type === 'EP' || r.type === 'Album') && state.monthlyListeners > 50000, requirements: 'EP/Album & 50K listeners' },
    { name: 'College Music Festival', description: 'Headline a university music fest.', cashRange: [20000, 50000], hype: 20, isAvailable: (state: ArtistData) => state.manager && MANAGERS.find(m => m.id === state.manager!.id)!.unlocksTier >= 5, requirements: 'Requires a Tier 1 Manager' },
    { name: 'Late Night Show Performance', description: 'Perform on a major late-night TV show.', cashRange: [50000, 100000], hype: 35, isAvailable: (state: ArtistData) => state.manager && MANAGERS.find(m => m.id === state.manager!.id)!.unlocksTier >= 6, requirements: 'Requires a Tier 2 Manager' },
    { name: 'Major Festival Slot', description: 'Perform at a world-renowned festival like Coachella.', cashRange: [150000, 400000], hype: 60, isAvailable: (state: ArtistData) => state.manager && MANAGERS.find(m => m.id === state.manager!.id)!.unlocksTier >= 7, requirements: 'Requires a Tier 3 Manager' },
];

export const NPC_ARTIST_IMAGES: Record<string, string> = {
  "Taylor Swift": "https://cdn-images.dzcdn.net/images/artist/e528e270424103b527f8a27ac625563b/250x250-000000-80-0-0.jpg",
  "Ariana Grande": "https://cdn-images.dzcdn.net/images/artist/3504ffe2519090026bc359b689d22e20/250x250-000000-80-0-0.jpg",
  "Billie Eilish": "https://cdn-images.dzcdn.net/images/artist/8eab1a9a644889aabaca1e193e05f984/250x250-000000-80-0-0.jpg",
  "The Weeknd": "https://cdn-images.dzcdn.net/images/artist/581693b4724a7fcfa754455101e13a44/250x250-000000-80-0-0.jpg",
  "Drake": "https://cdn-images.dzcdn.net/images/artist/eb0ed5b21d1ea5af021fc074ded0e91f/250x250-000000-80-0-0.jpg",
  "Justin Bieber": "https://cdn-images.dzcdn.net/images/artist/fe097f693cebf1f882e3da79e99e3bf9/250x250-000000-80-0-0.jpg",
  "Ed Sheeran": "https://cdn-images.dzcdn.net/images/artist/d6bb84390641d8ae9118228d9544e53d/250x250-000000-80-0-0.jpg",
  "Beyoncé": "https://cdn-images.dzcdn.net/images/artist/0aa9d669be4e7310b8647afae37ffaab/250x250-000000-80-0-0.jpg",
  "Rihanna": "https://cdn-images.dzcdn.net/images/artist/b78cdc205fae2641b89208e78b30e1b3/250x250-000000-80-0-0.jpg",
  "Adele": "https://cdn-images.dzcdn.net/images/artist/e5fc443d2abc03b487234ba4de65a001/250x250-000000-80-0-0.jpg",
  "Post Malone": "https://cdn-images.dzcdn.net/images/artist/a5a8cca44e7eab2db7d44e039bed2574/250x250-000000-80-0-0.jpg",
  "Dua Lipa": "https://cdn-images.dzcdn.net/images/artist/7375742a46dbebb6efc0ae362e18eb24/250x250-000000-80-0-0.jpg",
  "Olivia Rodrigo": "https://cdn-images.dzcdn.net/images/artist/2c9e480317183c037eaebcd7ba96daf4/250x250-000000-80-0-0.jpg",
  "Harry Styles": "https://cdn-images.dzcdn.net/images/artist/1151dba9b3edc0633adf35b64c21713f/250x250-000000-80-0-0.jpg",
  "Bad Bunny": "https://cdn-images.dzcdn.net/images/artist/45aaf836629158d714432ae37e552ee7/250x250-000000-80-0-0.jpg",
  "Kendrick Lamar": "https://cdn-images.dzcdn.net/images/artist/be0a7c550567f4af0ed202d7235b74d6/250x250-000000-80-0-0.jpg",
  "J. Cole": "https://cdn-images.dzcdn.net/images/artist/dc8d97f19855c8ea3f15ee6db784198e/250x250-000000-80-0-0.jpg",
  "Travis Scott": "https://cdn-images.dzcdn.net/images/artist/8d8316146026d7e6ce377e314536df62/250x250-000000-80-0-0.jpg",
  "Doja Cat": "https://cdn-images.dzcdn.net/images/artist/9e3a3b8792a04c4578da7b905ffeaf2b/250x250-000000-80-0-0.jpg",
  "SZA": "https://cdn-images.dzcdn.net/images/artist/8ced041da2bed70d5715f0860956169b/250x250-000000-80-0-0.jpg",
  "Lana Del Rey": "https://cdn-images.dzcdn.net/images/artist/8994d3be1a59a72f887f1f8afd2d4c6c/250x250-000000-80-0-0.jpg",
  "Frank Ocean": "https://cdn-images.dzcdn.net/images/artist/882155c08dc31d6464d6d580083c968c/250x250-000000-80-0-0.jpg",
  "Tyler, the Creator": "https://cdn-images.dzcdn.net/images/artist/5eceecd683beab6dd901a7931294a121/250x250-000000-80-0-0.jpg",
  "Lil Nas X": "https://cdn-images.dzcdn.net/images/artist/0f5f0e176c544db5f89b5cd837e279aa/250x250-000000-80-0-0.jpg",
  "Cardi B": "https://cdn-images.dzcdn.net/images/artist/af776cd99efbc010c3782030df0e7e1e/250x250-000000-80-0-0.jpg",
  "Nicki Minaj": "https://cdn-images.dzcdn.net/images/artist/cf30ba4b709168aee196dcf16f259f22/250x250-000000-80-0-0.jpg",
  "Megan Thee Stallion": "https://cdn-images.dzcdn.net/images/artist/55a20b812fec74d0a72d870545fc2123/250x250-000000-80-0-0.jpg",
  "Kanye West": "https://cdn-images.dzcdn.net/images/artist/bb76c2ee3b068726ab4c37b0aabdb57a/250x250-000000-80-0-0.jpg",
  "Jay-Z": "https://cdn-images.dzcdn.net/images/artist/a59aabd18e84d732ce3b9f6f5c4e5f50/250x250-000000-80-0-0.jpg",
  "Eminem": "https://cdn-images.dzcdn.net/images/artist/0f30bbd33a680030054af004d698d6ac/250x250-000000-80-0-0.jpg",
  "Lady Gaga": "https://cdn-images.dzcdn.net/images/artist/7565262f7661b0d762621a8d69ba6f49/250x250-000000-80-0-0.jpg",
  "Bruno Mars": "https://cdn-images.dzcdn.net/images/artist/90f0b5b11df4f87ee878f38569b5995b/250x250-000000-80-0-0.jpg",
  "Miley Cyrus": "https://cdn-images.dzcdn.net/images/artist/1125de234fd142a03ba849e9f90c0f7c/250x250-000000-80-0-0.jpg",
  "Selena Gomez": "https://cdn-images.dzcdn.net/images/artist/26b3660183a4a626bb185a7089f090b4/250x250-000000-80-0-0.jpg",
  "Demi Lovato": "https://cdn-images.dzcdn.net/images/artist/ed77e3a8268b3ae1e0b73183da3896e7/250x250-000000-80-0-0.jpg",
  "Shawn Mendes": "https://cdn-images.dzcdn.net/images/artist/3d8ed563d628c5c61ec4569d032ab682/250x250-000000-80-0-0.jpg",
  "Camila Cabello": "https://cdn-images.dzcdn.net/images/artist/4591e8a49868c2494652767f47695a90/250x250-000000-80-0-0.jpg",
  "Halsey": "https://cdn-images.dzcdn.net/images/artist/dbfcb38ac398f2c09d18b16868426f41/250x250-000000-80-0-0.jpg",
  "Lorde": "https://cdn-images.dzcdn.net/images/artist/c38f17b73ad22d280c5dfc8a8b3d1865/250x250-000000-80-0-0.jpg",
  "Charli XCX": "https://cdn-images.dzcdn.net/images/artist/5a4f593c65c71292b4389e871f76c023/250x250-000000-80-0-0.jpg",
  "Coldplay": "https://cdn-images.dzcdn.net/images/artist/3087954bca22f306324912e5ac8375c3/250x250-000000-80-0-0.jpg",
  "Imagine Dragons": "https://cdn-images.dzcdn.net/images/artist/1ba025c23cae3dee14b51152990285fc/250x250-000000-80-0-0.jpg",
  "Maroon 5": "https://cdn-images.dzcdn.net/images/artist/bbb526b9666c7e31dee295bcabbbdd8e/250x250-000000-80-0-0.jpg",
  "OneRepublic": "https://cdn-images.dzcdn.net/images/artist/36556d769dc4052d915eb78c8daf98fb/250x250-000000-80-0-0.jpg",
  "Arctic Monkeys": "https://cdn-images.dzcdn.net/images/artist/6c03e4c7c36800897fd468633286db24/250x250-000000-80-0-0.jpg",
  "The 1975": "https://cdn-images.dzcdn.net/images/artist/3408c43ed74f73c88281b37a62a51638/250x250-000000-80-0-0.jpg",
  "Tame Impala": "https://cdn-images.dzcdn.net/images/artist/879015e713cc6ad6ffaeec154c027505/250x250-000000-80-0-0.jpg",
  "Glass Animals": "https://cdn-images.dzcdn.net/images/artist/b2e9164dfa2a293330ce341905710034/250x250-000000-80-0-0.jpg",
  "FINNEAS": "https://cdn-images.dzcdn.net/images/artist/d4cf2dedbdf65c8b42050fe987358d0c/250x250-000000-80-0-0.jpg",
  "Jack Harlow": "https://cdn-images.dzcdn.net/images/artist/acf97ceb30d48a97e47afd1c3f9b68ce/250x250-000000-80-0-0.jpg",
  "Sabrina Carpenter": "https://cdn-images.dzcdn.net/images/artist/4a9cdc7737e2a0e59b4917b47884b859/250x250-000000-80-0-0.jpg",
  "Tate McRae": "https://cdn-images.dzcdn.net/images/artist/b3578bcbd54124c8125c9a9d52f38716/250x250-000000-80-0-0.jpg",
  "Chappell Roan": "https://cdn-images.dzcdn.net/images/artist/14ca3aea25950189f30efe0fa79ac4f9/250x250-000000-80-0-0.jpg",
  "Ice Spice": "https://cdn-images.dzcdn.net/images/artist/175bb716a4289c50e39c048ad35b491e/250x250-000000-80-0-0.jpg",
  "21 Savage": "https://cdn-images.dzcdn.net/images/artist/76b4cd56c7e94e8d2bdc3e2157e1080f/250x250-000000-80-0-0.jpg",
  "Future": "https://cdn-images.dzcdn.net/images/artist/c8c8fea7e2b8613b3ba7328d22d3016c/250x250-000000-80-0-0.jpg",
  "Metro Boomin": "https://cdn-images.dzcdn.net/images/artist/bc031b73f958987fa103031070be5c16/250x250-000000-80-0-0.jpg",
  "Morgan Wallen": "https://cdn-images.dzcdn.net/images/artist/75488d12757f5809b9e6c7f53e5bb455/250x250-000000-80-0-0.jpg",
  "Luke Combs": "https://cdn-images.dzcdn.net/images/artist/c2a8e5d0d293a06bf887bb2724a780bc/250x250-000000-80-0-0.jpg",
  "Zach Bryan": "https://cdn-images.dzcdn.net/images/artist/552d448a0c2cb72f40c3de3a384949bd/250x250-000000-80-0-0.jpg",
  "Peso Pluma": "https://cdn-images.dzcdn.net/images/artist/dde2bf89c1e8da0aeb94436681bc3aac/250x250-000000-80-0-0.jpg",
  "Karol G": "https://cdn-images.dzcdn.net/images/artist/dd8c6b3068d2761955eb6e432046ed91/250x250-000000-80-0-0.jpg",
  "Shakira": "https://cdn-images.dzcdn.net/images/artist/69c569506a8ff6ab0edfecbd1adf94b0/250x250-000000-80-0-0.jpg",
  "Rauw Alejandro": "https://cdn-images.dzcdn.net/images/artist/0e7b2b93b91789a054bc3f08bb3df3a8/250x250-000000-80-0-0.jpg",
  "Anitta": "https://cdn-images.dzcdn.net/images/artist/bab6017df606c55ba0b5418fc345c3ca/250x250-000000-80-0-0.jpg",
  "Latto": "https://cdn-images.dzcdn.net/images/artist/01a5b9598e1de78a0cfad893c0e4e161/250x250-000000-80-0-0.jpg",
  "GloRilla": "https://cdn-images.dzcdn.net/images/artist/6bccd80c250c642b7d5262480e8af617/250x250-000000-80-0-0.jpg",
  "Sexyy Red": "https://cdn-images.dzcdn.net/images/artist/5b4a7d84536a2f0edde7eca15469057d/250x250-000000-80-0-0.jpg",
  "Coi Leray": "https://cdn-images.dzcdn.net/images/artist/8aebf8da8832f87d840330bf994cfb59/250x250-000000-80-0-0.jpg",
  "Flo Milli": "https://cdn-images.dzcdn.net/images/artist/db4c9e92ebbb65eaca8d4f8ef5bf82d3/250x250-000000-80-0-0.jpg",
  "BTS": "https://cdn-images.dzcdn.net/images/artist/b5c64fa8216ca158e52b4d88bd9388ff/250x250-000000-80-0-0.jpg",
  "BLACKPINK": "https://cdn-images.dzcdn.net/images/artist/89675729453893a91be35bde691050ff/250x250-000000-80-0-0.jpg",
  "NewJeans": "https://cdn-images.dzcdn.net/images/artist/0866c2c1d7d00879f5db46ddc1250db8/250x250-000000-80-0-0.jpg",
  "Stray Kids": "https://cdn-images.dzcdn.net/images/artist/004d3950684af2157081072af2df192b/250x250-000000-80-0-0.jpg",
  "TWICE": "https://cdn-images.dzcdn.net/images/artist/1f4acadade675899b7f775ae4ac67faa/250x250-000000-80-0-0.jpg",
  "SEVENTEEN": "https://cdn-images.dzcdn.net/images/artist/f24702900c1454ea23c573a3eed5b149/250x250-000000-80-0-0.jpg",
  "LE SSERAFIM": "https://cdn-images.dzcdn.net/images/artist/e789ab2d16cad9a738cd83722940512b/250x250-000000-80-0-0.jpg",
  "(G)I-DLE": "https://cdn-images.dzcdn.net/images/artist/0b381aacaf9b4c4c1b60664431c815bf/250x250-000000-80-0-0.jpg",
  "Jungkook": "https://cdn-images.dzcdn.net/images/artist/7e8a65d06b7c0293ff33f44e34a8b7e6/250x250-000000-80-0-0.jpg",
  "Jennie": "https://cdn-images.dzcdn.net/images/artist/56c65ac9ea451119ddc8c0b02915d103/250x250-000000-80-0-0.jpg",
  "Lisa": "https://cdn-images.dzcdn.net/images/artist/040c7161f753b46331aad225cb8bac38/250x250-000000-80-0-0.jpg",
  "aespa": "https://cdn-images.dzcdn.net/images/artist/0031639b755895dc9d638628587c5459/250x250-000000-80-0-0.jpg",
  "J Balvin": "https://cdn-images.dzcdn.net/images/artist/325eaa46bc25052d0e3d549d60cc8225/250x250-000000-80-0-0.jpg",
  "Maluma": "https://cdn-images.dzcdn.net/images/artist/a1627f420e880b7229e52890b99626c9/250x250-000000-80-0-0.jpg",
  "Rosalía": "https://cdn-images.dzcdn.net/images/artist/96636156440182f1e7db3f77d39e6545/250x250-000000-80-0-0.jpg",
  "Feid": "https://cdn-images.dzcdn.net/images/artist/a37d75aa98b04da700412398a988c31a/250x250-000000-80-0-0.jpg",
  "Myke Towers": "https://cdn-images.dzcdn.net/images/artist/d3a7418b4e44bf8ee3ae268067a86f09/250x250-000000-80-0-0.jpg",
  "Young Miko": "https://cdn-images.dzcdn.net/images/artist/5912325ca89e72e925de22d05001ed4a/250x250-000000-80-0-0.jpg",
  "Ozuna": "https://cdn-images.dzcdn.net/images/artist/df2030b9e796f55f58d2c4b68aecb18f/250x250-000000-80-0-0.jpg",
  "Bizarrap": "https://cdn-images.dzcdn.net/images/artist/e121c1ef9b1135e6a5b71c1e65ab10b4/250x250-000000-80-0-0.jpg"
};
