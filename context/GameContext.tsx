
import React, { createContext, useReducer, useContext, ReactNode, useEffect, useState } from 'react';
import { db, getActiveSaveId } from '../db/db';
import { useFirebase } from './FirebaseContext';
import type { GameState, GameAction, Email, NpcSong, ChartEntry, ChartHistory, ArtistData, Artist, Group, Song, LabelSubmission, Contract, Release, XUser, XPost, XTrend, XChat, CustomLabel, PopBaseOffer, NpcAlbum, AlbumChartEntry, RedMicProState, GrammyCategory, GrammyAward, GrammyContender, OscarCategory, OscarAward, OscarContender, OnlyFansProfile, OnlyFansPost, XSuspensionStatus, SoundtrackAlbum, SoundtrackTrack, Manager, SecurityTeam, Label, VoguePhotoshoot, FeatureOffer } from '../types';
import { INITIAL_MONEY, STREAM_INCOME_MULTIPLIER, SUBSCRIBER_THRESHOLD_STORE, VIEW_INCOME_MULTIPLIER, NPC_ARTIST_NAMES, NPC_ARTIST_GENRES, NPC_SONG_ADJECTIVES, NPC_SONG_NOUNS, NPC_ARTIST_IMAGES, LABELS, PLAYLIST_PITCH_COST, PLAYLIST_PITCH_SUCCESS_RATE, PLAYLIST_BOOST_MULTIPLIER, PLAYLIST_BOOST_WEEKS, GENRES, MANAGERS, SECURITY_TEAMS, GIGS } from '../constants';
import { generateWeeklyXContent } from '../utils/xContentGenerator';
import { REAL_WORLD_DISCOGRAPHIES } from '../realWorldDiscographies';
import { ActiveEncounter, EncounterChoice } from '../types';
import { createDefaultContract } from '../utils/contractUtils';

export const getPossibleEncounters = (artist: Artist | Group, artistData: ArtistData): ActiveEncounter[] => {
    const isGroup = artist.type === 'group';
    const isMarried = artistData.relationships?.some(r => r.status === 'married');

    const encounters: ActiveEncounter[] = [
        {
            id: 'music_release',
            text: 'A fan approaches you while you are out getting coffee and asks when you are releasing new music.',
            requiresImage: true,
            choices: [
                { label: 'Say "Soon"', tweetTemplate: '"{artist} said new music is coming soon! 😭"', authorName: 'Pop Crave', isTMZ: false, publicImageEffect: 2, hypeEffect: 5 },
                { label: 'Ignore them', tweetTemplate: '{artist} completely ignored a fan asking about new music... 💀', authorName: 'TMZ', isTMZ: true, publicImageEffect: -5, hypeEffect: 2 },
                { label: 'Yell at them', tweetTemplate: '{artist} yells at a fan asking for new music!! Disgusting behavior.', authorName: 'TMZ', isTMZ: true, publicImageEffect: -15, hypeEffect: 10 }
            ]
        },
        {
            id: 'how_many_likes',
            text: 'A fan with a camera runs up to you: "How many likes for us to do a song together??"',
            requiresImage: true,
            choices: [
                { label: '50k likes', tweetTemplate: 'asking {artist} how many likes to do a song 😭 they said 50k!', authorName: 'RandomFan', isTMZ: false, publicImageEffect: 3, hypeEffect: 2 },
                { label: '500k likes', tweetTemplate: 'asking {artist} how many likes to do a song 😭 they said 500k!', authorName: 'RandomFan', isTMZ: false, publicImageEffect: 5, hypeEffect: 3 },
                { label: '1M likes', tweetTemplate: 'asking {artist} how many likes to do a song 😭 1 MILLION?!', authorName: 'RandomFan', isTMZ: false, publicImageEffect: 3, hypeEffect: 1 },
                { label: 'Ignore', tweetTemplate: '{artist} walks right past a fan offering a collab... rude much?', authorName: 'TMZ', isTMZ: true, publicImageEffect: -5, hypeEffect: 2 },
                { label: 'Yell at them', tweetTemplate: '{artist} goes off on a fan offering a collab. YIKES.', authorName: 'TMZ', isTMZ: true, publicImageEffect: -15, hypeEffect: 10 },
            ]
        },
        {
            id: 'outfit_praise',
            text: 'A fan points out your outfit and asks where you got it from.',
            requiresImage: true,
            choices: [
                { label: 'Tell them', tweetTemplate: '"{artist} is so humble, they told me where their outfit is from! ✨"', authorName: 'FashionFan', isTMZ: false, publicImageEffect: 5, hypeEffect: 2 },
                { label: '"It\'s custom"', tweetTemplate: '"{artist} says their outfit is custom. We love a fashion icon!"', authorName: 'Pop Crave', isTMZ: false, publicImageEffect: 2, hypeEffect: 3 },
                { label: 'Ignore', tweetTemplate: '{artist} completely ignores a fan complimenting their outfit 🙄', authorName: 'TMZ', isTMZ: true, publicImageEffect: -3, hypeEffect: 1 }
            ]
        }
    ];

    if (isGroup) {
        encounters.push({
            id: 'group_relationship',
            text: 'Paparazzi ambush you: "What is your relationship really like with the other group members?"',
            requiresImage: true,
            choices: [
                { label: '"They are my family"', tweetTemplate: '"{artist} says the group is like family! So sweet 🥺"', authorName: 'Pop Crave', isTMZ: false, publicImageEffect: 5, hypeEffect: 2 },
                { label: '"We hate each other"', tweetTemplate: '{artist} ADMITS they hate their group members! The drama! 😱', authorName: 'TMZ', isTMZ: true, publicImageEffect: -10, hypeEffect: 20 },
                { label: 'Ignore', tweetTemplate: '{artist} stays silent on group drama rumors...', authorName: 'TMZ', isTMZ: true, publicImageEffect: -2, hypeEffect: 2 },
                { label: 'Yell "Leave us alone!"', tweetTemplate: '{artist} SNAPS at paparazzi asking about group members.', authorName: 'TMZ', isTMZ: true, publicImageEffect: -5, hypeEffect: 8 },
            ]
        });
    }

    if (isMarried) {
        encounters.push({
            id: 'marriage',
            text: 'Paparazzi: "How is married life treating you?"',
            requiresImage: true,
            choices: [
                { label: '"Happily married!"', tweetTemplate: '"{artist} smiling and says they are happily married! ❤️"', authorName: 'Pop Crave', isTMZ: false, publicImageEffect: 5, hypeEffect: 2 },
                { label: 'Ignore', tweetTemplate: '{artist} ignores questions about their marriage... trouble in paradise?', authorName: 'TMZ', isTMZ: true, publicImageEffect: -5, hypeEffect: 5 },
                { label: 'Yell at them', tweetTemplate: '{artist} yells at paparazzi for asking about their marriage.', authorName: 'TMZ', isTMZ: true, publicImageEffect: -10, hypeEffect: 8 },
            ]
        });
    }

    return encounters;
};

export const formatNumber = (num: number): string => {
    if (isNaN(num)) return '0';
    const number = Math.floor(num);

    if (number >= 1e12) {
        return (number / 1e12).toFixed(1).replace(/\.0$/, '') + 'T';
    }
    if (number >= 1e9) {
        return (number / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
    }
    if (number >= 1e6) {
        return (number / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (number >= 1e3) {
        return (number / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return number.toLocaleString();
};

export const getFutureDate = (currentDate: GameDate, weeksOffset: number): GameDate => {
    let year = currentDate.year;
    let week = currentDate.week + weeksOffset;
    while (week > 52) {
        week -= 52;
        year++;
    }
    return { year, week, day: 1 };
};

const getSongCertification = (streams: number): { level: string; multiplier: number } | null => {
    const DIAMOND = 1_200_000_000;
    const PLATINUM = 100_000_000;
    const GOLD = 60_000_000;

    if (streams >= DIAMOND) return { level: 'Diamond', multiplier: Math.floor(streams / DIAMOND) };
    if (streams >= PLATINUM) return { level: 'Platinum', multiplier: Math.floor(streams / PLATINUM) };
    if (streams >= GOLD) return { level: 'Gold', multiplier: 1 };
    return null;
};

const getAlbumCertification = (units: number): { level: string; multiplier: number } | null => {
    const DIAMOND = 10_000_000;
    const PLATINUM = 1_000_000;
    const GOLD = 500_000;

    if (units >= DIAMOND) return { level: 'Diamond', multiplier: Math.floor(units / DIAMOND) };
    if (units >= PLATINUM) return { level: 'Platinum', multiplier: Math.floor(units / PLATINUM) };
    if (units >= GOLD) return { level: 'Gold', multiplier: 1 };
    return null;
};

const formatCertification = (cert: { level: string; multiplier: number } | null): string | null => {
    if (!cert) return null;
    if (cert.multiplier > 1 && cert.level !== 'Gold') {
        return `${cert.multiplier}x ${cert.level}`;
    }
    return cert.level;
};

const getRandomNpcName = (excludedNames: string[] = []): string => {
    let name = "";
    let attempts = 0;
    const lowerExcluded = excludedNames.map(n => n.toLowerCase());
    do {
        name = NPC_ARTIST_NAMES[Math.floor(Math.random() * NPC_ARTIST_NAMES.length)];
        attempts++;
    } while (lowerExcluded.includes(name.toLowerCase()) && attempts < 50);
    return name;
};

const generateNpcs = (count: number, existingNpcs: NpcSong[] = [], npcImages?: Record<string, string>, excludedNames: string[] = []): NpcSong[] => {
    const npcs: NpcSong[] = [];
    const usedNames = new Set<string>(existingNpcs.map(npc => `${npc.title}-${npc.artist}`));

    for (let i = 0; i < count; i++) {
        let title = "";
        let artist = "";
        let combo = "";
        let attempts = 0;

        let baseArtist = "";
        do {
            baseArtist = getRandomNpcName(excludedNames);
            let displayArtist = baseArtist;

            if (Math.random() < 0.05) { // 5% chance
                let collabArtist = baseArtist;
                while (collabArtist === baseArtist) {
                    collabArtist = getRandomNpcName(excludedNames);
                }
                displayArtist = `${baseArtist}, ${collabArtist}`;
            }
            
            artist = displayArtist;
            
            // Try to get a real song
            const realDisco = REAL_WORLD_DISCOGRAPHIES[baseArtist];
            if (realDisco && realDisco.songs.length > 0 && Math.random() < 0.8) { // 80% chance to pick a real song if available
                // Filter out songs already used by this artist
                const availableSongs = realDisco.songs.filter(s => !usedNames.has(`${s}-${artist}`));
                if (availableSongs.length > 0) {
                    title = availableSongs[Math.floor(Math.random() * availableSongs.length)];
                }
            }
            
            // Fallback to random generator if no real song found or randomly chosen
            if (!title) {
                const adj = NPC_SONG_ADJECTIVES[Math.floor(Math.random() * NPC_SONG_ADJECTIVES.length)];
                const noun = NPC_SONG_NOUNS[Math.floor(Math.random() * NPC_SONG_NOUNS.length)];
                title = `${adj} ${noun}`;
            }

            combo = `${title}-${artist}`;
            attempts++;
        } while (usedNames.has(combo) && attempts < 10);
        
        // If we couldn't find a unique name in 10 attempts, just add a random suffix to force uniqueness
        if (usedNames.has(combo)) {
             title = `${title} (Remix)`;
             combo = `${title}-${artist}`;
        }
        
        usedNames.add(combo);

        const basePopularity = Math.floor(75_000_000 * Math.exp(-0.04 * (i + existingNpcs.length)));

        npcs.push({
            uniqueId: `npc_${combo.replace(/[^a-zA-Z0-9]/g, '')}`,
            title,
            artist,
            genre: NPC_ARTIST_GENRES[baseArtist] || GENRES[Math.floor(Math.random() * GENRES.length)],
            basePopularity,
            coverArt: NPC_ARTIST_IMAGES?.[baseArtist] || npcImages?.[baseArtist] || `https://ui-avatars.com/api/?name=${encodeURIComponent(baseArtist)}&background=random&color=fff&size=250`,
        });
    }
    return npcs;
};

const generateNewHits = (count: number, existingNpcs: NpcSong[], npcImages?: Record<string, string>, excludedNames: string[] = []): NpcSong[] => {
    const hits: NpcSong[] = [];
    const usedNames = new Set<string>(existingNpcs.map(npc => `${npc.title}-${npc.artist}`));

    for (let i = 0; i < count; i++) {
        let title = "";
        let artist = "";
        let combo = "";
        let attempts = 0;

        let baseArtist = "";
        do {
            baseArtist = getRandomNpcName(excludedNames);
            let displayArtist = baseArtist;

            if (Math.random() < 0.05) { // 5% chance
                let collabArtist = baseArtist;
                while (collabArtist === baseArtist) {
                    collabArtist = getRandomNpcName(excludedNames);
                }
                displayArtist = `${baseArtist}, ${collabArtist}`;
            }

            artist = displayArtist;
            
            const realDisco = REAL_WORLD_DISCOGRAPHIES[baseArtist];
            if (realDisco && realDisco.songs.length > 0 && Math.random() < 0.8) {
                const availableSongs = realDisco.songs.filter(s => !usedNames.has(`${s}-${artist}`));
                if (availableSongs.length > 0) {
                    title = availableSongs[Math.floor(Math.random() * availableSongs.length)];
                }
            }

            if (!title) {
                const adj = NPC_SONG_ADJECTIVES[Math.floor(Math.random() * NPC_SONG_ADJECTIVES.length)];
                const noun = NPC_SONG_NOUNS[Math.floor(Math.random() * NPC_SONG_NOUNS.length)];
                title = `${adj} ${noun}`;
            }

            combo = `${title}-${artist}`;
            attempts++;
        } while (usedNames.has(combo) && attempts < 10);

         if (usedNames.has(combo)) {
             title = `${title} (Remix)`;
             combo = `${title}-${artist}`;
        }
        usedNames.add(combo);

        const effectiveRank = Math.floor(Math.random() * 100); 
        const basePopularity = Math.floor(75_000_000 * Math.exp(-0.04 * effectiveRank));

        hits.push({
            uniqueId: `npc_${combo.replace(/[^a-zA-Z0-9]/g, '')}`,
            title,
            artist,
            genre: NPC_ARTIST_GENRES[baseArtist] || GENRES[Math.floor(Math.random() * GENRES.length)],
            basePopularity,
            coverArt: NPC_ARTIST_IMAGES?.[baseArtist] || npcImages?.[baseArtist] || `https://ui-avatars.com/api/?name=${encodeURIComponent(baseArtist)}&background=random&color=fff&size=250`,
        });
    }
    return hits;
};

const NPC_ALBUM_ADJECTIVES = ['Eternal', 'Chromatic', 'Digital', 'Fever', 'Concrete', 'Neon', 'Stardust', 'Afterparty', 'American', 'Broken', 'Suburban', 'Melodrama'];
const NPC_ALBUM_NOUNS = ['Summer', 'Dream', 'Jungle', 'Heart', 'Angel', 'Sunset', 'Romance', 'Fantasy', 'Youth', 'Rebellion', 'Mirage', 'Odyssey'];

const generateNpcAlbums = (count: number, allNpcSongs: NpcSong[], npcImages?: Record<string, string>): NpcAlbum[] => {
    const albums: NpcAlbum[] = [];
    const labels: Array<NpcAlbum['label']> = ['UMG', 'Republic', 'RCA', 'Island'];
    let songIndex = 0;

    for (let i = 0; i < count; i++) {
        const albumSongCount = Math.floor(Math.random() * 5) + 8; // 8-12 songs per album
        if (songIndex + albumSongCount > allNpcSongs.length) break;

        const albumSongs = allNpcSongs.slice(songIndex, songIndex + albumSongCount);
        songIndex += albumSongCount;

        if (albumSongs.length === 0) continue;

        const mainArtist = albumSongs[0].artist;
        let title = "";
        
        // Try to find a real album title
        const realDisco = REAL_WORLD_DISCOGRAPHIES[mainArtist];
        if (realDisco && realDisco.albums.length > 0 && Math.random() < 0.8) {
             title = realDisco.albums[Math.floor(Math.random() * realDisco.albums.length)];
        }

        // Fallback if no real title
        if (!title) {
            const adj = NPC_ALBUM_ADJECTIVES[Math.floor(Math.random() * NPC_ALBUM_ADJECTIVES.length)];
            const noun = NPC_ALBUM_NOUNS[Math.floor(Math.random() * NPC_ALBUM_NOUNS.length)];
            title = `${adj} ${noun}`;
        }
        
        const uniqueId = `npcalbum_${title.replace(/[^a-zA-Z0-9]/g, '')}_${mainArtist.replace(/[^a-zA-Z0-9]/g, '')}`;
        if (albums.some(a => a.uniqueId === uniqueId)) continue; // Avoid duplicate albums

        // Ensure top tier sales potential
        // Higher index (later generated) means slightly less potential, but we want chart ready albums.
        // Generate potential between 14,000 and 150,000
        const salesPotential = Math.floor(Math.random() * 136000) + 14000;

        albums.push({
            uniqueId,
            title,
            artist: mainArtist,
            label: labels[Math.floor(Math.random() * labels.length)],
            coverArt: NPC_ARTIST_IMAGES?.[mainArtist] || npcImages?.[mainArtist] || `https://ui-avatars.com/api/?name=${encodeURIComponent(mainArtist)}&background=random&color=fff&size=250`,
            songIds: albumSongs.map(s => s.uniqueId),
            salesPotential,
        });
    }
    return albums;
};


const initialArtistData: ArtistData = {
    money: INITIAL_MONEY,
    hype: 0,
    peakHype: 0,
    publicImage: 80, // Start as Respected/Beloved
    popularity: 10,
    songs: [],
    releases: [],
    monthlyListeners: 0,
    lastFourWeeksStreams: [],
    lastFourWeeksViews: [],
    youtubeSubscribers: 0,
    tiktokFollowers: 0,
    tiktokVideos: [],
    instagramFollowers: 0,
    instagramPosts: [],
    videos: [],
    youtubeStoreUnlocked: false,
    merch: [],
    merchStoreBanner: null,
    inbox: [],
    streamsThisMonth: 0,
    viewsThisQuarter: 0,
    subsThisQuarter: 0,
    promotions: [],
    performedGigThisWeek: false,
    contract: null,
    contractHistory: [],
    labelSubmissions: [],
    customLabels: [],
    artistImages: [],
    artistVideoThumbnails: [],
    paparazziPhotos: [],
    tourPhotos: [],
    tours: [],
    manager: null,
    securityTeamId: null,
    xUsers: [],
    xPosts: [],
    xChats: [],
    xTrends: [],
    xFollowingIds: [],
    xSuspensionStatus: null,
    followers: 0,
    saves: 0,
    artistPick: null,
    listeningNow: 0,
    streamsHistory: [],
    firstChartEntry: null,
    redMicPro: {
        unlocked: false,
        subscriptionType: null,
    },
    salesBoost: 0,
    isGoldTheme: false,
    grammyHistory: [],
    hasSubmittedForBestNewArtist: false,
    oscarHistory: [],
    onlyfans: null,
    fanWarStatus: null,
    // Soundtracks
    soundtrackOfferCount: 0,
    offeredSoundtracks: [],
    weeksUntilNextSoundtrackOffer: Math.floor(Math.random() * 13) + 12, // 12-24 weeks
};


const DEFAULT_SPOTIFY_PLAYLISTS: SpotifyPlaylist[] = [
    { id: 'tth', name: "Today's Top Hits", description: "Top hits right now.", followers: 34000000, type: 'global', coverArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=500&fit=crop', tracks: [] },
    { id: 'megahit', name: "Mega Hit Mix", description: "A mega mix of 75 favorites from the last few years!", followers: 11000000, type: 'global', coverArt: 'https://images.unsplash.com/photo-1493225457124-a1a2a5fa51cc?w=500&h=500&fit=crop', tracks: [] },
    { id: 'rapcaviar', name: "RapCaviar", description: "New est hip hop.", followers: 15000000, type: 'genre', genre: 'Hip Hop/Rap', coverArt: 'https://images.unsplash.com/photo-1544785349-c4a5301826fd?w=500&h=500&fit=crop', tracks: [] },
    { id: 'hiphopcentral', name: "Hip-Hop Central", description: "The center of Hip-Hop.", followers: 8000000, type: 'genre', genre: 'Hip Hop/Rap', coverArt: 'https://images.unsplash.com/photo-1549497554-46328dbbd4f7?w=500&h=500&fit=crop', tracks: [] },
    { id: 'poprising', name: "Pop Rising", description: "The hits of tomorrow.", followers: 3000000, type: 'genre', genre: 'Pop', coverArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=500&fit=crop', tracks: [] },
    { id: 'pophits', name: "Soft Pop Hits", description: "Listen to easy songs from your favorite artists!", followers: 7000000, type: 'genre', genre: 'Pop', coverArt: 'https://images.unsplash.com/photo-1518098042468-208169123863?w=500&h=500&fit=crop', tracks: [] },
    { id: 'newmusicfriday', name: "New Music Friday", description: "New music.", followers: 4000000, type: 'new', coverArt: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&h=500&fit=crop', tracks: [] },
    { id: 'mint', name: "mint", description: "Electronic.", followers: 6000000, type: 'genre', genre: 'Dance/Electronic', coverArt: 'https://images.unsplash.com/photo-1570535921867-0c7f711f185c?w=500&h=500&fit=crop', tracks: [] },
    { id: 'hotcountry', name: "Hot Country", description: "Country.", followers: 7000000, type: 'genre', genre: 'Country', coverArt: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=500&h=500&fit=crop', tracks: [] },
    { id: 'rnb', name: "Are & Be", description: "R&B.", followers: 6000000, type: 'genre', genre: 'R&B', coverArt: 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=500&h=500&fit=crop', tracks: [] },
    { id: 'rockthis', name: "Rock This", description: "Rock.", followers: 5000000, type: 'genre', genre: 'Rock', coverArt: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&h=500&fit=crop', tracks: [] },
    { id: 'latin', name: "Viva Latino", description: "Today's top Latin hits.", followers: 14000000, type: 'genre', genre: 'Latin', coverArt: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&h=500&fit=crop', tracks: [] },
    { id: 'kpop', name: "K-Pop ON!", description: "The best K-Pop songs.", followers: 5000000, type: 'genre', genre: 'K-Pop', coverArt: 'https://images.unsplash.com/photo-1598363650965-0ae09efbd3da?w=500&h=500&fit=crop', tracks: [] },
    { id: 'viral50', name: "Viral 50 - Global", description: "Viral.", followers: 2000000, type: 'viral', coverArt: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&h=500&fit=crop', tracks: [] },
    { id: 'viralhits', name: "Viral Hits", description: "Viral.", followers: 3000000, type: 'viral', coverArt: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=500&h=500&fit=crop', tracks: [] },
    { id: 'bighit', name: "Big on the Internet", description: "Currently trending tracks across the internet.", followers: 4000000, type: 'viral', coverArt: 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?w=500&h=500&fit=crop', tracks: [] },
    { id: 'chillhits', name: "Chill Hits", description: "Kick back to the best new and recent chill hits.", followers: 6000000, type: 'global', coverArt: 'https://images.unsplash.com/photo-1499557404179-880945952db5?w=500&h=500&fit=crop', tracks: [] },
    { id: 'singcar', name: "Songs to Sing in the Car", description: "Sing along and enjoy the drive.", followers: 10000000, type: 'global', coverArt: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=500&h=500&fit=crop', tracks: [] },
    { id: 'coffeetable', name: "Coffee Table Jazz", description: "Relaxing.", followers: 1500000, type: 'global', coverArt: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500&h=500&fit=crop', tracks: [] },
    { id: 'christmas', name: "Christmas Hits", description: "The biggest Christmas songs of all time.", followers: 5000000, type: 'genre', genre: 'Christmas', coverArt: 'https://images.unsplash.com/photo-1543589077-47d81606c1ec?w=500&h=500&fit=crop', tracks: [] },
    { id: 'indie', name: "Lorem", description: "Indie songs.", followers: 2000000, type: 'genre', genre: 'Indie', coverArt: 'https://images.unsplash.com/photo-1482855549413-2a62884c7be6?w=500&h=500&fit=crop', tracks: [] },
    { id: 'afrobeats', name: "African Heat", description: "Top Afrobeats.", followers: 2500000, type: 'genre', genre: 'Afrobeats', coverArt: 'https://images.unsplash.com/photo-1601616858063-4f9e1e765507?w=500&h=500&fit=crop', tracks: [] },
    { id: 'reggae', name: "Dancehall Official", description: "Top Reggae.", followers: 1500000, type: 'genre', genre: 'Reggae', coverArt: 'https://images.unsplash.com/photo-1520696989433-2ba37a90fdd2?w=500&h=500&fit=crop', tracks: [] },
    { id: 'throwback', name: "All Out 2010s", description: "The biggest hits of the 2010s.", followers: 8000000, type: 'global', coverArt: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500&h=500&fit=crop', tracks: [] }
];

const initialState: GameState = {
    offlineMode: true,
    difficultyMode: 'normal',
    careerMode: null,
    soloArtist: null,
    group: null,
    activeArtistId: null,
    artistsData: {},
    spotifyPlaylists: DEFAULT_SPOTIFY_PLAYLISTS,
    date: { week: 1, year: 2000 },
    currentView: 'game',
    activeTab: 'Home',
    activeYoutubeChannel: 'artist',
    npcs: [],
    npcAlbums: [],
    soundtrackAlbums: [],
    billboardHot100: [],
    billboardTopAlbums: [],
    albumChartHistory: {},
    chartHistory: {},
    spotifyGlobal: [],
    hotPopSongs: [],
    hotRapRnb: [],
    electronicChart: [],
    countryChart: [],
    hotPopSongsHistory: {},
    hotRapRnbHistory: {},
    electronicChartHistory: {},
    countryChartHistory: {},
    spotifyNewEntries: 0,
    selectedVideoId: null,
    selectedReleaseId: null,
    selectedSoundtrackId: null,
    activeSubmissionId: null,
    activeGeniusOffer: null,
    activeOnTheRadarOffer: null,
    activeTrshdOffer: null,
    activeEventInvitation: null,
    activeFallonOffer: null,
    activeSoundtrackOffer: null,
    activeFeatureOffer: null,
    selectedXUserId: null,
    selectedXChatId: null,
    contractRenewalOffer: null,
    activeTourId: null,
    viewingPastLabelId: null,
    activeVogueOffer: null,
    grammySubmissions: [],
    grammyCurrentYearNominations: null,
    activeGrammyPerformanceOffer: null,
    activeGrammyRedCarpetOffer: null,
    oscarSubmissions: [],
    oscarCurrentYearNominations: null,
    activeOscarPerformanceOffer: null,
};

const GameContext = createContext<{
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
    activeArtist: Artist | Group | null;
    activeArtistData: ArtistData | null;
    allPlayerArtists: Array<Artist | Group>;
} | undefined>(undefined);

const calculateGenreChart = (
    allContenders: any[],
    genres: string[],
    previousChart: ChartEntry[],
    chartHistory: ChartHistory
): { newChart: ChartEntry[], newHistory: ChartHistory } => {
    const genreContenders = allContenders
        .filter(song => genres.includes(song.genre));
    
    genreContenders.sort((a, b) => b.weeklyStreams - a.weeklyStreams);

    const eligibleGenreContenders = genreContenders.filter((song, index) => {
        const potentialRank = index + 1;
        const history = chartHistory[song.uniqueId];
        if (history && history.weeksOnChart >= 52 && potentialRank > 25) return false;
        if (history && history.weeksOnChart >= 20 && potentialRank > 50) return false;
        return true;
    });

    const top50 = eligibleGenreContenders.slice(0, 50);
    const newHistory: ChartHistory = { ...chartHistory };
    const newChart: ChartEntry[] = [];
    const prevChartMap = new Map(previousChart.map(entry => [entry.uniqueId, entry]));

    top50.forEach((song, index) => {
        const rank = index + 1;
        const history = newHistory[song.uniqueId];
        const prevChartEntry = prevChartMap.get(song.uniqueId);

        if (history) {
            history.weeksOnChart += 1;
            history.lastRank = rank;
            if (rank < history.peak) history.peak = rank;
            if (rank === 1) {
                history.weeksAtNo1 = (history.weeksAtNo1 || 0) + 1;
            }
        } else {
            newHistory[song.uniqueId] = { weeksOnChart: 1, peak: rank, lastRank: rank, weeksAtNo1: rank === 1 ? 1 : 0 };
        }

        newChart.push({
            rank: rank,
            lastWeek: prevChartEntry?.rank ?? null,
            peak: newHistory[song.uniqueId].peak,
            weeksOnChart: newHistory[song.uniqueId].weeksOnChart,
            title: song.title,
            artist: song.artist,
            coverArt: song.coverArt,
            isPlayerSong: song.isPlayerSong,
            songId: song.songId,
            uniqueId: song.uniqueId,
            weeklyStreams: song.weeklyStreams,
        });
    });

    return { newChart, newHistory };
};


const getHypeCap = (artistData: ArtistData): number => {
    if (artistData.redMicPro && artistData.redMicPro.unlocked) {
        if (artistData.redMicPro.hypeMode === 'locked' || artistData.redMicPro.hypeMode === 'manual') {
            return 1000;
        }
    }
    return 100;
};

const gameReducerInternal = (state: GameState, action: GameAction): GameState => {
    const allPlayerArtistsAndGroups: (Artist | Group)[] = [
        ...(state.careerMode === 'solo' && state.soloArtist ? [state.soloArtist] : (state.group ? [state.group, ...state.group.members] : [])),
        ...(state.extraPlayableArtists || [])
    ];
    const tmzUser: XUser = {
        id: 'tmz', name: 'TMZ', username: 'TMZ',
        avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHJ4PSI4IiBmaWxsPSIjRkZGRkZGIi8+PHJlY3QgeD0iNCIgeT0iNCIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNCIgZmlsbD0iI0QzMjYyNiIvPjxwYXRoIGQ9Ik0xNiAyMHYyNGg2VjMybDQtNGg0djIwbC0xMi0xMi0xMiAxMnoiIGZpbGw9IiNGRkYiLz48cGF0aCBkPSJNMzYgMjB2MjRoNlYzMmw0LTRoNHYyMGwtMTItMTItMTIgMTJ6IiBmaWxsPSIjRkZGIi8+PC9zdmc+',
        isVerified: true, bio: 'breaking news & celebrity gossip', followersCount: 19500000, followingCount: 150,
    };

    switch (action.type) {
        case 'SYNC_ONLINE_SONGS':
            return { ...state, onlineSongs: action.payload };
        case 'SYNC_ONLINE_ALBUMS':
            return { ...state, onlineAlbums: action.payload };
        case 'SYNC_ONLINE_ARTISTS':
            return { ...state, onlineArtists: action.payload };
        case 'START_ONLINE_GAME': {
            const { onlineArtist } = action.payload;
            
            const tickRate = 1000 * 60 * 15; // 15 minutes
            // Global epoch set to reset the game server: 2026-06-01T21:24:28Z
            const EPOCH = 1780349068000;
            const now = Date.now();
            const elapsedTime = Math.max(0, now - EPOCH);
            const globalWeekStamp = Math.floor(elapsedTime / tickRate) + 1;
            
            // Re-calculate year and week
            let year = 2000;
            let week = globalWeekStamp;
            while (week > 52) {
                week -= 52;
                year += 1;
            }
            const startDate = { week, year };
            
            // Map the Firebase artist to our internal Artist format
            const mappedArtist: Artist = {
                id: onlineArtist.id,
                name: onlineArtist.name,
                age: 21,
                country: 'US',
                image: `https://ui-avatars.com/api/?name=${encodeURIComponent(onlineArtist.name)}&background=random&color=fff&size=500`,
                pronouns: 'they/them',
                fandomName: "Fans"
            };

            const welcomeEmail: Email = {
                id: crypto.randomUUID(),
                sender: 'Red Mic',
                subject: `Welcome to Red Mic Online, ${mappedArtist.name}!`,
                body: `Hey ${mappedArtist.name},\n\nYou are now in the online servers. You'll be competing in real-time with other real players. One real-world hour is one in-game week.\n\nGood luck!!`,
                date: startDate,
                isRead: false,
                senderIcon: 'default'
            };

            // If we have existing offline state stored online (not yet implemented in basic payload)
            // we will need to load it here. For now we use the initial artist data.
            const newArtistData: ArtistData = {
                ...initialArtistData,
                money: onlineArtist.funds,
                hype: onlineArtist.energy, // map energy to hype roughly
                popularity: onlineArtist.popularity,
                inbox: [welcomeEmail],
            };

            return {
                ...initialState,
                offlineMode: false,
                difficultyMode: 'normal',
                careerMode: 'online',
                soloArtist: mappedArtist,
                onlineArtist: mappedArtist,
                activeArtistId: mappedArtist.id,
                artistsData: {
                    [mappedArtist.id]: newArtistData
                },
                date: startDate,
                npcs: [], 
                npcAlbums: [],
            };
        }
        case 'START_SOLO_GAME': {
            const { artist, startYear } = action.payload;
            const startDate = { week: 1, year: startYear };
            const welcomeEmail: Email = {
                id: crypto.randomUUID(),
                sender: 'Red Mic',
                subject: `Welcome to the Music Industry, ${artist.name}!`,
                body: `Hey ${artist.name},\n\nThis is it, your first step into the world of music. We've given you $100,000 to start. Your fandom, The ${artist.fandomName}, are waiting. Spend your money wisely. Record hits, build your fanbase, and take over the charts. Good luck.\n\nThe Red Mic Team`,
                date: startDate,
                isRead: false,
                senderIcon: 'default'
            };

            const initialSubs = Math.floor(Math.random() * 5000) + 1000;

            const playerXUser: XUser = {
                id: artist.id,
                name: artist.name,
                username: artist.name.replace(/\s/g, '').toLowerCase(),
                avatar: artist.image,
                isVerified: true,
                isPlayer: true,
                bio: `Official account. Leader of the ${artist.fandomName}.`,
                followersCount: Math.floor(initialSubs / 10),
                followingCount: 0,
            };
            const popBaseUser: XUser = {
                id: 'popbase', name: 'Pop Base', username: 'PopBase',
                avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iIzcyOGRmYSIvPjxwYXRoIGQ9Ik0zMiA0MC4yNTdMMjEuMjUgNDRsMy43NS0zLjc0M3ptMTQtOC41MTVMNDIgMjhsLTMuNzUgMy43NDN6IiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTMwLjUgMzMuNUw0MCAyNGw0IDQgTDM0LjUgMzcuNSA1IDU3bDctN3oiIGZpbGw9IiNmZmYiLz48L3N2Zz4=',
                isVerified: true, bio: 'all things pop culture', followersCount: 1800000, followingCount: 50
            };
            const chartDataUser: XUser = {
                id: 'chartdata', name: 'chart data', username: 'chartdata',
                avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNjQgMzJBNzIgNzIgMCAwMS04IDMyQTcyIDcyIDAgMDE2NCAzMnoiIGZpbGw9IiMxZDFkMWQiLz48cGF0aCBkPSJNMCAzMkE3MiA3MiAwIDAwNzIgMzJBNzIgNzIgMCAwMDAtMzJ6IiBmaWxsPSIjZmZmIi8+PC9zdmc+',
                isVerified: true, bio: 'facts & stats', followersCount: 2300000, followingCount: 1,
            };
            const spotifySnapshotUser: XUser = {
                id: 'spotifysnapshot', name: 'Spotify Snapshot', username: 'SnapshotSpotify',
                avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iIzFkMWQxZCIvPjxwYXRoIGQ9Ik00Ni41MzIgNDYuNTMyQzQ2LjUzMiA0Ni41MzIgNDYuNTMy...IiBmaWxsPSIjMThEMzRFIi8+PC9zdmc+',
                isVerified: true, bio: 'Real-time Spotify numbers for your favorite artists.', followersCount: 1100000, followingCount: 0,
            };
            const addictionUser: XUser = {
                id: `addiction_fan_solo`,
                name: `addiction to ${artist.name}`,
                username: `addiction${artist.name.replace(/\s/g, '').toLowerCase()}`,
                avatar: artist.image,
                isVerified: true,
                bio: `the very best of ${artist.name}`,
                followersCount: Math.floor(Math.random() * 300000) + 200000,
                followingCount: 1,
            };

            const chartsFanUser: XUser = {
                id: 'charts_fan_solo',
                name: `${artist.name} Charts`,
                username: `${artist.name.replace(/\s/g, '').toLowerCase()}charts`,
                avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iIzFEQTFGMiIvPjxyZWN0IHg9IjE2IiB5PSIzMiIgd2lkdGg9IjgiIGhlaWdodD0iMTYiIGZpbGw9IndoaXRlIi8+PHJlY3QgeD0iMjgiIHk9IjI0IiB3aWR0aD0iOCIgaGVpZHRoPSIyNCIgZmlsbD0id2hpdGUiLz48cmVjdCB4PSI0MCIgeT0iMTYiIHdpZHRoPSI4IiBoZWlnaHQ9IjMyIiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==',
                isVerified: false,
                bio: `stats & updates for ${artist.name}`,
                followersCount: Math.floor(Math.random() * 40000) + 15000,
                followingCount: 1,
            };

            const statsFanUser: XUser = {
                id: 'stats_fan_solo',
                name: `${artist.name} Stats`,
                username: `${artist.name.replace(/\s/g, '').toLowerCase()}stats`,
                avatar: artist.image,
                isVerified: true,
                bio: `Parody account. Weekly stats & updates for ${artist.name}.`,
                followersCount: Math.floor(Math.random() * 80000) + 35000,
                followingCount: 1,
            };

            const fanAvatars = [
                'https://i.imgur.com/3Y3j3jQ.png', 'https://i.imgur.com/O6G2e1E.png', 'https://i.imgur.com/sW12a89.png',
                'https://i.imgur.com/pBw2r70.png', 'https://i.imgur.com/c2802k5.png', 'https://i.imgur.com/vHqX3ch.png'
            ];
            const fanUsernames = ['StarlightStan', 'PopCultureGuru', 'MusicLover_99', 'LyricLooker', 'ConcertCraver', 'FanAccount_01'];

            const fanUsers: XUser[] = Array.from({ length: 6 }, (_, i) => ({
                id: `fan${i + 1}`,
                name: fanUsernames[i],
                username: fanUsernames[i].toLowerCase(),
                avatar: fanAvatars[i],
                isVerified: false,
                bio: `part of the ${artist.fandomName}!`,
                followersCount: Math.floor(Math.random() * (1500 - 500 + 1)) + 500,
                followingCount: Math.floor(Math.random() * (500 - 50 + 1)) + 50,
            }));

            const initialXUsers: XUser[] = [playerXUser, popBaseUser, chartDataUser, spotifySnapshotUser, tmzUser, addictionUser, chartsFanUser, statsFanUser, ...fanUsers];
            
            const initialXPosts: XPost[] = [{
                id: crypto.randomUUID(), authorId: 'popbase', content: `Welcome to the industry, ${artist.name}! All eyes are on you.`,
                likes: 1200, retweets: 350, views: 25000, date: startDate,
            }];
            
            const newArtistData: ArtistData = {
                ...initialArtistData,
                money: INITIAL_MONEY,
                hype: 10,
                popularity: 10,
                youtubeSubscribers: initialSubs,
                tiktokFollowers: initialSubs * 2,
                instagramFollowers: initialSubs * 3,
                inbox: [welcomeEmail],
                xUsers: initialXUsers,
                xPosts: initialXPosts,
                xChats: [],
                xTrends: [
                    { id: crypto.randomUUID(), category: 'Music · Trending', title: `${artist.name}`, postCount: 18400 },
                    { id: crypto.randomUUID(), category: 'Trending in United States', title: '#newartist', postCount: 98000 }
                ],
                xFollowingIds: [],
                followers: Math.floor(initialSubs / 5),
            };
            // Increase songs and albums for more realistic charts
            const npcs = generateNpcs(600, [], undefined, [action.payload.artist.name]);
            const npcAlbums = generateNpcAlbums(60, npcs);

            return {
                ...initialState,
                difficultyMode: action.payload.difficultyMode || 'normal',
                careerMode: 'solo',
                soloArtist: artist,
                activeArtistId: artist.id,
                artistsData: {
                    [artist.id]: newArtistData
                },
                date: startDate,
                npcs,
                npcAlbums,
            };
        }
        case 'START_GROUP_GAME': {
            const { group, startYear } = action.payload;
            const startDate = { week: 1, year: startYear };

            const newArtistsData: { [artistId: string]: ArtistData } = {};
            
            const createWelcomeEmail = (name: string): Email => ({
                id: crypto.randomUUID(),
                sender: 'Red Mic',
                subject: `Welcome to the Music Industry, ${name}!`,
                body: `Hey ${name},\n\nThis is it, your first step into the world of music. Your fandom, The ${group.fandomName}, is waiting. We've given you $100,000 to start. Spend it wisely. Record hits, build your fanbase, and take over the charts. Good luck.\n\nThe Red Mic Team`,
                date: startDate,
                isRead: false,
                senderIcon: 'default'
            });

            // Social media setup for group
             const playerXUser: XUser = {
                id: group.id, name: group.name, username: group.name.replace(/\s/g, '').toLowerCase(),
                avatar: group.image, isVerified: true, isPlayer: true, bio: `Official account for ${group.name}`, followersCount: 0, followingCount: 0,
            };
            const popBaseUser: XUser = {
                id: 'popbase', name: 'Pop Base', username: 'PopBase',
                avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iIzcyOGRmYSIvPjxwYXRoIGQ9Ik0zMiA0MC4yNTdMMjEuMjUgNDRsMy43NS0zLjc0M3ptMTQtOC41MTVMNDIgMjhsLTMuNzUgMy43NDN6IiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTMwLjUgMzMuNUw0MCAyNGw0IDQgTDM0LjUgMzcuNSA1IDU3bDctN3oiIGZpbGw9IiNmZmYiLz48L3N2Zz4=',
                isVerified: true, bio: 'all things pop culture', followersCount: 1800000, followingCount: 50,
            };
            const chartDataUser: XUser = {
                id: 'chartdata', name: 'chart data', username: 'chartdata',
                avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNjQgMzJBNzIgNzIgMCAwMS04IDMyQTcyIDcyIDAgMDE2NCAzMnoiIGZpbGw9IiMxZDFkMWQiLz48cGF0aCBkPSJNMCAzMkE3MiA3MiAwIDAwNzIgMzJBNzIgNzIgMCAwMDAtMzJ6IiBmaWxsPSIjZmZmIi8+PC9zdmc+',
                isVerified: true, bio: 'facts & stats', followersCount: 2300000, followingCount: 1,
            };
            const spotifySnapshotUser: XUser = {
                id: 'spotifysnapshot', name: 'Spotify Snapshot', username: 'SnapshotSpotify',
                avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iIzFkMWQxZCIvPjxwYXRoIGQ9Ik00Ni41MzIgNDYuNTMyQzQ2LjUzMiA0Ni41MzIgNDYuNTMy...IiBmaWxsPSIjMThEMzRFIi8+PC9zdmc+',
                isVerified: true, bio: 'Real-time Spotify numbers for your favorite artists.', followersCount: 1100000, followingCount: 0,
            };
             const addictionUser: XUser = {
                id: 'addiction_fan_group',
                name: `addiction to ${group.name}`,
                username: `addiction${group.name.replace(/\s/g, '').toLowerCase()}`,
                avatar: group.image,
                isVerified: true,
                bio: `the very best of ${group.name}`,
                followersCount: Math.floor(Math.random() * 400000) + 300000,
                followingCount: 1,
            };
            const chartsFanUser: XUser = {
                id: 'charts_fan_group',
                name: `${group.name} Charts`,
                username: `${group.name.replace(/\s/g, '').toLowerCase()}charts`,
                avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iIzFEQTFGMiIvPjxyZWN0IHg9IjE2IiB5PSIzMiIgd2lkdGg9IjgiIGhlaWdodD0iMTYiIGZpbGw9IndoaXRlIi8+PHJlY3QgeD0iMjgiIHk9IjI0IiB3aWR0aD0iOCIgaGVpZHRoPSIyNCIgZmlsbD0id2hpdGUiLz48cmVjdCB4PSI0MCIgeT0iMTYiIHdpZHRoPSI4IiBoZWlnaHQ9IjMyIiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==',
                isVerified: false,
                bio: `stats & updates for ${group.name}`,
                followersCount: Math.floor(Math.random() * 50000) + 20000,
                followingCount: 1,
            };
            const statsFanUser: XUser = {
                id: 'stats_fan_group',
                name: `${group.name} Stats`,
                username: `${group.name.replace(/\s/g, '').toLowerCase()}stats`,
                avatar: group.image,
                isVerified: true,
                bio: `Parody account. Weekly stats & updates for ${group.name}.`,
                followersCount: Math.floor(Math.random() * 100000) + 40000,
                followingCount: 1,
            };
            const initialXUsers: XUser[] = [playerXUser, popBaseUser, chartDataUser, spotifySnapshotUser, tmzUser, addictionUser, chartsFanUser, statsFanUser];
            const initialXPosts: XPost[] = [{
                id: crypto.randomUUID(), authorId: 'popbase', content: `The industry is buzzing about the debut of ${group.name}!`,
                likes: 2500, retweets: 800, views: 52000, date: startDate,
            }];
            const initialTrends = [
                 { id: crypto.randomUUID(), category: 'Music · Trending', title: `${group.name}`, postCount: 25100 },
                 { id: crypto.randomUUID(), category: 'Trending in United States', title: '#newgroup', postCount: 150000 }
            ];

            // Group data
            newArtistsData[group.id] = {
                ...initialArtistData,
                hype: 15, // Start with a bit more hype
                popularity: 15,
                youtubeSubscribers: Math.floor(Math.random() * 8000) + 2000,
                tiktokFollowers: Math.floor(Math.random() * 16000) + 4000,
                instagramFollowers: Math.floor(Math.random() * 20000) + 5000,
                inbox: [createWelcomeEmail(group.name)],
                xUsers: initialXUsers,
                xPosts: initialXPosts,
                xTrends: initialTrends,
                xFollowingIds: [],
                followers: Math.floor(Math.random() * 4000) + 1000,
            };

            // Member data
            group.members.forEach(member => {
                 const memberXUser: XUser = {
                    id: member.id, name: member.name, username: member.name.replace(/\s/g, '').toLowerCase(),
                    avatar: member.image, isVerified: true, isPlayer: true, bio: `member of ${group.name}`, followersCount: 0, followingCount: 0,
                };
                 newArtistsData[member.id] = {
                    ...initialArtistData,
                    money: 25000, // Members start with less personal cash
                    hype: 5,
                    popularity: 5,
                    youtubeSubscribers: Math.floor(Math.random() * 2000) + 500,
                    tiktokFollowers: Math.floor(Math.random() * 4000) + 1000,
                    instagramFollowers: Math.floor(Math.random() * 5000) + 1000,
                    inbox: [createWelcomeEmail(member.name)],
                    xUsers: [memberXUser, popBaseUser, chartDataUser, spotifySnapshotUser, tmzUser, addictionUser, chartsFanUser],
                    xPosts: initialXPosts,
                    xTrends: initialTrends,
                    xFollowingIds: [],
                    followers: Math.floor(Math.random() * 1000) + 200,
                 }
            });

            // Increase songs and albums for more realistic charts
            const npcs = generateNpcs(600, [], undefined, [action.payload.group.name]);
            const npcAlbums = generateNpcAlbums(60, npcs);

             return {
                ...initialState,
                difficultyMode: action.payload.difficultyMode || 'normal',
                careerMode: 'group',
                group: group,
                activeArtistId: group.id,
                artistsData: newArtistsData,
                date: startDate,
                npcs,
                npcAlbums,
            };
        }
        case 'CHANGE_VIEW':
            return {
                ...state,
                currentView: action.payload,
            };
        case 'CHANGE_TAB':
            return {
                ...state,
                activeTab: action.payload,
            };
        case 'SWITCH_YOUTUBE_CHANNEL':
            return {
                ...state,
                activeYoutubeChannel: action.payload,
            };
        case 'CHANGE_PROFILE_IMAGE': {
            if (!state.activeArtistId) return state;
            const { newImage } = action.payload;
            
            let updatedSoloArtist = state.soloArtist;
            let updatedGroup = state.group;
            let updatedExtra = state.extraPlayableArtists ? [...state.extraPlayableArtists] : undefined;
            let updatedOnlineArtist = state.onlineArtist;
            
            if (state.soloArtist && state.soloArtist.id === state.activeArtistId) {
                updatedSoloArtist = { ...state.soloArtist, image: newImage };
            } else if (state.group && state.group.id === state.activeArtistId) {
                updatedGroup = { ...state.group, image: newImage };
            } else if (updatedExtra) {
                const idx = updatedExtra.findIndex(a => a.id === state.activeArtistId);
                if (idx !== -1) {
                    updatedExtra[idx] = { ...updatedExtra[idx], image: newImage };
                }
            } else if (state.onlineArtist && state.onlineArtist.id === state.activeArtistId) {
                updatedOnlineArtist = { ...state.onlineArtist, image: newImage };
            }

            return {
                ...state,
                soloArtist: updatedSoloArtist,
                group: updatedGroup,
                extraPlayableArtists: updatedExtra,
                onlineArtist: updatedOnlineArtist,
            };
        }

        case 'CHANGE_STAGE_NAME': {
            if (!state.activeArtistId) return state;
            
            const { newName, cost, contractId } = action.payload;
            const activeArtistData = state.artistsData[state.activeArtistId];
            
            let draftArtistData = { ...activeArtistData };
            
            if (cost) {
                draftArtistData.money -= cost;
            }
            
            // If it's an independent change (no cost, no contractId)
            if (!cost && !contractId) {
                draftArtistData.independentNameChanges = (draftArtistData.independentNameChanges || 0) + 1;
            }
            
            let updatedSoloArtist = state.soloArtist;
            let updatedGroup = state.group;
            
            if (state.soloArtist && state.soloArtist.id === state.activeArtistId) {
                updatedSoloArtist = { ...state.soloArtist, name: newName };
            } else if (state.group && state.group.id === state.activeArtistId) {
                updatedGroup = { ...state.group, name: newName };
            }
            
            return {
                ...state,
                soloArtist: updatedSoloArtist,
                group: updatedGroup,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: draftArtistData
                }
            };
        }
        case 'CHANGE_ACTIVE_ARTIST':
            return {
                ...state,
                activeArtistId: action.payload,
            };
        case 'SYNC_DATE': {
            const globalWeekStamp = action.payload;
            let year = 2000;
            let week = globalWeekStamp;
            while (week > 52) {
                week -= 52;
                year++;
            }
            return {
                ...state,
                date: { year, week }
            };
        }
        case 'INIT_CHARTS': {
            if (state.offlineMode || !state.onlineSongs) return state;

            const allContenders = state.onlineSongs.filter((s: any) => s.isReleased).map((s: any) => ({
                uniqueId: s.id || crypto.randomUUID(), title: s.title, artist: s.artistName || 'Unknown Online Artist',
                weeklyStreams: s.lastWeekStreams || 0,
                isPlayerSong: false, 
                coverArt: s.coverArt || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.artistName || 'Unknown')}&background=random&color=fff&size=250`, songId: s.id,
                genre: s.genre || 'Pop',
            }));
            
            allContenders.sort((a, b) => b.weeklyStreams - a.weeklyStreams);
            
            const newBillboardHot100: ChartEntry[] = [];
            const newChartHistory: ChartHistory = { ...state.chartHistory };
            
            const top100 = allContenders.slice(0, 100);
            top100.forEach((song, index) => {
                const rank = index + 1;
                newChartHistory[song.uniqueId] = { weeksOnChart: 1, peak: rank, lastRank: rank, weeksAtNo1: rank === 1 ? 1 : 0 };
                newBillboardHot100.push({
                    rank: rank, lastWeek: null, peak: rank,
                    weeksOnChart: 1, title: song.title, artist: song.artist,
                    coverArt: song.coverArt, isPlayerSong: song.isPlayerSong, songId: song.songId,
                    uniqueId: song.uniqueId, weeklyStreams: song.weeklyStreams,
                });
            });
            
            const onlineAlbumContenders = state.onlineAlbums ? state.onlineAlbums.map((a: any) => ({
                uniqueId: a.id || crypto.randomUUID(),
                title: a.title, artist: a.artistName || 'Unknown', label: a.releasingLabel?.name || 'Independent',
                coverArt: a.coverArt || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.artistName || 'Unknown')}&background=random&color=fff&size=250`,
                isPlayerAlbum: false, albumId: a.id, weeklyActivity: a.weeklySales || 0, weeklySales: a.weeklySales || 0,
            })) : [];
            onlineAlbumContenders.sort((a, b) => b.weeklyActivity - a.weeklyActivity);
            
            const newBillboardTopAlbums: AlbumChartEntry[] = [];
            const top50Albums = onlineAlbumContenders.slice(0, 50);
            top50Albums.forEach((album, index) => {
                newBillboardTopAlbums.push({
                    rank: index + 1, lastWeek: null, peak: index + 1, weeksOnChart: 1,
                    title: album.title, artist: album.artist, coverArt: album.coverArt,
                    isPlayerAlbum: album.isPlayerAlbum, albumId: album.albumId, uniqueId: album.uniqueId,
                    weeklyActivity: album.weeklyActivity, label: album.label || 'Independent'
                });
            });
            
            const { newChart: newHotPopSongs, newHistory: newHotPopSongsHistory } = calculateGenreChart(
                allContenders, ['Pop'], state.hotPopSongs || [], state.hotPopSongsHistory || {}
            );
            const { newChart: newHotRapRnb, newHistory: newHotRapRnbHistory } = calculateGenreChart(
                allContenders, ['Hip Hop', 'R&B'], state.hotRapRnb || [], state.hotRapRnbHistory || {}
            );
            const { newChart: newElectronicChart, newHistory: newElectronicChartHistory } = calculateGenreChart(
                allContenders, ['Electronic'], state.electronicChart || [], state.electronicChartHistory || {}
            );
            const { newChart: newCountryChart, newHistory: newCountryChartHistory } = calculateGenreChart(
                allContenders, ['Country'], state.countryChart || [], state.countryChartHistory || {}
            );

            return {
                ...state,
                billboardHot100: newBillboardHot100,
                spotifyGlobal: newBillboardHot100,
                chartHistory: newChartHistory,
                billboardTopAlbums: newBillboardTopAlbums,
                hotPopSongs: newHotPopSongs,
                hotPopSongsHistory: newHotPopSongsHistory,
                hotRapRnb: newHotRapRnb,
                hotRapRnbHistory: newHotRapRnbHistory,
                electronicChart: newElectronicChart,
                electronicChartHistory: newElectronicChartHistory,
                countryChart: newCountryChart,
                countryChartHistory: newCountryChartHistory
            };
        }
        case 'PROGRESS_WEEK': {
            // NPC Churn Logic: Simulate new songs releasing
            let newNpcsList = [...state.npcs];
            let newNpcAlbums = [...state.npcAlbums];

            if (state.offlineMode) {
                const CHURN_COUNT = 100;
                // Remove 100 NPCs from the bottom of the list.
                if (newNpcsList.length >= CHURN_COUNT) {
                     newNpcsList.splice(newNpcsList.length - CHURN_COUNT, CHURN_COUNT);
                }
               
                // Generate 100 new NPCs, avoiding name collisions
                const allPlayerNamesForNpcs = [...(state.allPlayerArtists?.map(a => a.name) || []), state.soloArtist?.name, state.group?.name].filter((n): n is string => !!n);
                const newlyGeneratedNpcs = generateNewHits(CHURN_COUNT, newNpcsList, state.npcImages, allPlayerNamesForNpcs);

                // Add them back to the list
                newNpcsList.push(...newlyGeneratedNpcs);

                // NPC Album Churn Logic
                const ALBUM_CHURN_COUNT = 5;
                if (newNpcAlbums.length > ALBUM_CHURN_COUNT) {
                    newNpcAlbums.splice(newNpcAlbums.length - ALBUM_CHURN_COUNT, ALBUM_CHURN_COUNT);
                }
                // Generate new albums using the newest songs
                const newestSongsForAlbums = newlyGeneratedNpcs.slice(0, ALBUM_CHURN_COUNT * 12); // Assuming max 12 songs per album
                const newlyGeneratedAlbums = generateNpcAlbums(ALBUM_CHURN_COUNT, newestSongsForAlbums, state.npcImages);
                newNpcAlbums.unshift(...newlyGeneratedAlbums); // Add new albums to the top
            }


            const newWeek = state.date.week + 1;
            const newYear = state.date.year + (newWeek > 52 ? 1 : 0);
            const newDate = { week: newWeek > 52 ? 1 : newWeek, year: newYear };

            // --- NEW MUSIC FRIDAY TWEET LOGIC ---
            let popBaseNewMusicPost: XPost | null = null;
            try {
                const newMusicItems: { artist: string, title: string, type: 'song' | 'album' }[] = [];
                
                for (const artistId in state.artistsData) {
                    const artistData = state.artistsData[artistId];
                    const artistProfile = allPlayerArtistsAndGroups.find(a => a.id === artistId);
                    if (!artistProfile) continue;

                    artistData.releases.forEach(release => {
                        if (!release.releasingLabel && release.releaseDate.week === newDate.week && release.releaseDate.year === newDate.year) {
                            newMusicItems.push({
                                artist: artistProfile.name,
                                title: release.title,
                                type: (release.type === 'Single') ? 'song' : 'album',
                            });
                        }
                    });
                    
                    artistData.labelSubmissions.forEach(sub => {
                        if (sub.status === 'scheduled') {
                            sub.singlesToRelease?.forEach(single => {
                                if (single.releaseDate.week === newDate.week && single.releaseDate.year === newDate.year) {
                                    const song = artistData.songs.find(s => s.id === single.songId);
                                    if (song) {
                                        newMusicItems.push({ artist: artistProfile.name, title: song.title, type: 'song' });
                                    }
                                }
                            });
                            if (sub.projectReleaseDate && sub.projectReleaseDate.week === newDate.week && sub.projectReleaseDate.year === newDate.year) {
                                newMusicItems.push({
                                    artist: artistProfile.name,
                                    title: sub.release.title,
                                    type: 'album'
                                });
                            }
                        }
                    });
                }

                if (state.offlineMode) {
                    const newlyGeneratedAlbums = state.npcAlbums.slice(0, 4); 
                    newlyGeneratedAlbums.forEach(album => {
                        newMusicItems.push({ artist: album.artist, title: album.title, type: 'album' });
                    });
                    const npcAlbumSongIds = new Set(newlyGeneratedAlbums.flatMap(a => a.songIds));
                    state.npcs.filter(song => !npcAlbumSongIds.has(song.uniqueId)).slice(0, 4).forEach(song => {
                        newMusicItems.push({ artist: song.artist, title: song.title, type: 'song' });
                    });
                }

                if (newMusicItems.length > 0) {
                    const shuffledItems = newMusicItems.sort(() => 0.5 - Math.random()).slice(0, 8);
                    const content = "New music out tonight:\n\n" + shuffledItems.map(item => {
                        const emoji = (item.type === 'album') ? '💿' : '🎵';
                        return `• ${item.artist} — ${item.title} ${emoji}`;
                    }).join('\n');
                    
                    popBaseNewMusicPost = {
                        id: crypto.randomUUID(),
                        authorId: 'popbase',
                        content: content,
                        likes: Math.floor(Math.random() * 8000) + 4000,
                        retweets: Math.floor(Math.random() * 1500) + 400,
                        views: Math.floor(Math.random() * 200000) + 80000,
                        date: newDate
                    };
                }
            } catch (e) {
                console.error("Error generating New Music Friday tweet:", e);
            }
            
            let contractRenewalForActivePlayer: GameState['contractRenewalOffer'] = null;
            const updatedArtistsData: { [id: string]: ArtistData } = JSON.parse(JSON.stringify(state.artistsData));
            
            const allCustomLabels: CustomLabel[] = [];
            for (const artistId in updatedArtistsData) {
                allCustomLabels.push(...updatedArtistsData[artistId].customLabels);
            }

            const playerArtistIds = new Set(allPlayerArtistsAndGroups.map(a => a.id));

            for (const artistId in updatedArtistsData) {
                const artistData = updatedArtistsData[artistId];
                let newEmails: Email[] = [];
                const artistProfileForEmail = allPlayerArtistsAndGroups.find(a => a.id === artistId);

                if (popBaseNewMusicPost) {
                    artistData.xPosts.unshift(popBaseNewMusicPost);
                }

                // --- MANAGER LOGIC ---
                if (artistData.manager) {
                    const manager = MANAGERS.find(m => m.id === artistData.manager!.id);
                    const contractEnded = (newDate.year > artistData.manager.contractEndDate.year) || 
                                          (newDate.year === artistData.manager.contractEndDate.year && newDate.week >= artistData.manager.contractEndDate.week);
                
                    if (contractEnded) {
                        artistData.manager = null;
                        if (manager) {
                            artistData.popularity = Math.max(0, artistData.popularity - manager.popularityBoost);
                        }
                        if(artistProfileForEmail) {
                            newEmails.push({
                                id: crypto.randomUUID(),
                                sender: 'Business Alert',
                                senderIcon: 'business',
                                subject: 'Manager Contract Expired',
                                body: `Hi ${artistProfileForEmail.name},\n\nYour yearly contract with ${manager?.name || 'your manager'} has expired. You will need to hire a new one if you wish to continue using management services.\n\n- Red Mic Business Team`,
                                date: newDate,
                                isRead: false,
                            });
                        }
                    } else {
                        // Auto-book gigs
                        const gigsToBook = manager?.autoGigsPerWeek || 0;
                        const availableGigs = GIGS.filter(g => g.isAvailable(artistData)).sort((a,b) => b.cashRange[1] - a.cashRange[1]);
                        let gigsBookedThisWeek = 0;
                        let weeklyGigIncome = 0;
                        let weeklyGigHype = 0;
                        let bookedGigNames = [];
                
                        for (const gig of availableGigs) {
                            if (gigsBookedThisWeek < gigsToBook) {
                                 const cashEarned = Math.floor(Math.random() * (gig.cashRange[1] - gig.cashRange[0] + 1)) + gig.cashRange[0];
                                 weeklyGigIncome += cashEarned;
                                 weeklyGigHype += gig.hype;
                                 bookedGigNames.push(`- ${gig.name}: $${formatNumber(cashEarned)}, +${gig.hype} hype`);
                                 gigsBookedThisWeek++;
                            }
                        }
                        if (gigsBookedThisWeek > 0) {
                            artistData.money += weeklyGigIncome;
                            artistData.hype = Math.min(getHypeCap(artistData), artistData.hype + weeklyGigHype);
                             if(artistProfileForEmail) {
                                newEmails.push({
                                    id: crypto.randomUUID(),
                                    sender: manager?.name || 'Your Manager',
                                    senderIcon: 'business',
                                    subject: `Weekly Gig Report`,
                                    body: `Hi ${artistProfileForEmail.name},\n\nI've booked ${gigsBookedThisWeek} gig(s) for you this week, earning a total of $${formatNumber(weeklyGigIncome)} and +${weeklyGigHype} hype.\n\nDetails:\n${bookedGigNames.join('\n')}\n\nKeep up the great work!\n\nBest,\n${manager?.name}`,
                                    date: newDate,
                                    isRead: false,
                                });
                            }
                        }
                    }
                }

                // --- SECURITY LOGIC ---
                if (artistData.securityTeamId) {
                    const team = SECURITY_TEAMS.find(s => s.id === artistData.securityTeamId);
                    if (team) {
                        if (artistData.money < team.weeklyCost) {
                            artistData.securityTeamId = null;
                            if(artistProfileForEmail) {
                                newEmails.push({
                                    id: crypto.randomUUID(),
                                    sender: 'Business Alert',
                                    senderIcon: 'business',
                                    subject: 'Security Payment Failed',
                                    body: `Hi ${artistProfileForEmail.name},\n\nYour weekly payment of $${formatNumber(team.weeklyCost)} for ${team.name} failed due to insufficient funds. Your security contract has been terminated.\n\n- Red Mic Business Team`,
                                    date: newDate,
                                    isRead: false,
                                });
                            }
                        } else {
                            artistData.money -= team.weeklyCost;
                        }
                    }
                }

                // --- PROMOTION PAYMENT LOGIC ---
                let totalWeeklyPromoCost = artistData.promotions.reduce((sum, p) => sum + p.weeklyCost, 0);

                if (totalWeeklyPromoCost > 0) {
                    let costToArtist = totalWeeklyPromoCost;
                    let coveredByBudget = 0;

                    if (artistData.contract && artistData.contract.marketingBudget && artistData.contract.marketingBudget > 0) {
                        const amountToCover = Math.min(artistData.contract.marketingBudget, costToArtist);
                        artistData.contract.marketingBudget -= amountToCover;
                        coveredByBudget = amountToCover;
                        costToArtist -= amountToCover;
                    }

                    if (costToArtist > 0 && artistData.money < costToArtist) {
                        // Can't afford the remaining cost, cancel all promotions
                        artistData.promotions = [];
                        if (artistProfileForEmail) {
                            newEmails.push({
                                id: crypto.randomUUID(),
                                sender: 'Red Mic Promotions',
                                subject: 'Promotion Payment Failed',
                                body: `Hi ${artistProfileForEmail.name},\n\nYour weekly payment of $${formatNumber(totalWeeklyPromoCost)} for active promotions could not be processed due to insufficient funds.\n\nAll your active promotions have been cancelled.\n\n- The Red Mic Team`,
                                date: newDate,
                                isRead: false,
                                senderIcon: 'default',
                            });
                        }
                    } else {
                        // Can afford, deduct cost and send invoice
                        if (costToArtist > 0) {
                            artistData.money -= costToArtist;
                        }
                        
                        if (artistProfileForEmail) {
                            let invoiceBody = `Hi ${artistProfileForEmail.name},\n\nThis is your invoice for this week's promotions.`;
                            
                            if (coveredByBudget > 0) {
                                invoiceBody += `\nYour label's marketing budget covered $${formatNumber(coveredByBudget)}.\n`;
                            }
                            
                            if (costToArtist > 0) {
                                invoiceBody += `\nA total of $${formatNumber(costToArtist)} has been deducted from your personal account.\n\nBreakdown:\n`;
                            } else {
                                invoiceBody += `\nThe entire cost was covered by your marketing budget.\n\nBreakdown:\n`;
                            }
                            
                            artistData.promotions.forEach(p => {
                                const item = p.itemType === 'video' 
                                    ? artistData.videos.find(v => v.id === p.itemId) 
                                    : artistData.songs.find(s => s.id === p.itemId);
                                invoiceBody += `• ${p.promoType} for "${item?.title || 'Item'}": $${formatNumber(p.weeklyCost)}\n`;
                            });
                            
                            invoiceBody += `\nPromotions will automatically renew next week. You can cancel them at any time in the 'Promote' menu.\n\n- The Red Mic Team`;

                            newEmails.push({
                                id: crypto.randomUUID(),
                                sender: 'Red Mic Promotions',
                                subject: `Weekly Promotion Invoice: $${formatNumber(totalWeeklyPromoCost)}`,
                                body: invoiceBody,
                                date: newDate,
                                isRead: false,
                                senderIcon: 'default',
                            });
                        }
                    }
                }
                
                // --- TOUR LOGIC ---
                artistData.tours = artistData.tours.map(tour => {
                    if (tour.status === 'active') {
                        if (tour.currentVenueIndex < tour.venues.length) {
                            const venue = tour.venues[tour.currentVenueIndex];
                            
                            // Calculate sales
                            // Base demand based on popularity (0-100) and hype (0-1000)
                            // e.g. Pop 50, Hype 100 -> 40000 + 5000 = 45000 base interest
                            let baseDemand = (artistData.popularity * 800) + (artistData.hype * 50); 
                            
                            // Price sensitivity: Suggestion is around $25-$120. 
                            // If price is high, demand drops.
                            const priceSensitivity = 1.2 - (venue.ticketPrice / 200); // Simple linear drop
                            let demand = baseDemand * Math.max(0.1, priceSensitivity);
                            
                            // Random flux
                            demand = demand * (0.8 + Math.random() * 0.4);
                            
                            const ticketsSold = Math.floor(Math.min(venue.capacity, demand));
                            const revenue = ticketsSold * venue.ticketPrice;
                            
                            const updatedVenue = {
                                ...venue,
                                ticketsSold,
                                revenue,
                                soldOut: ticketsSold >= venue.capacity
                            };
                            
                            const newVenues = [...tour.venues];
                            newVenues[tour.currentVenueIndex] = updatedVenue;
                            
                            const nextIndex = tour.currentVenueIndex + 1;
                            const isFinished = nextIndex >= tour.venues.length;
                            
                            // Add income to artist
                            artistData.money += revenue;
                            
                            // Add hype for successful shows
                            if (updatedVenue.soldOut) {
                                artistData.hype = Math.min(getHypeCap(artistData), artistData.hype + 5);
                            }

                            // Notifications/Posts about the tour
                            if (artistProfileForEmail && updatedVenue.soldOut) {
                                 const postContent = `Sold out show in ${venue.city} tonight! Thank you all for coming out! ❤️ #TourLife`;
                                 artistData.xPosts.unshift({
                                    id: crypto.randomUUID(),
                                    authorId: artistProfileForEmail.id,
                                    content: postContent,
                                    likes: Math.floor(ticketsSold * 0.5),
                                    retweets: Math.floor(ticketsSold * 0.1),
                                    views: Math.floor(ticketsSold * 10),
                                    date: newDate
                                 });
                            }

                            return {
                                ...tour,
                                venues: newVenues,
                                currentVenueIndex: nextIndex,
                                ticketsSold: tour.ticketsSold + ticketsSold,
                                totalRevenue: tour.totalRevenue + revenue,
                                status: isFinished ? 'finished' : 'active'
                            };
                        } else {
                            // Should have been marked finished, but just in case
                            return { ...tour, status: 'finished' };
                        }
                    }
                    return tour;
                });

                // --- SOUNDTRACK OFFER LOGIC ---
                if (artistData.weeksUntilNextSoundtrackOffer === undefined) {
                    // Initialize for games started before this feature was added.
                    artistData.weeksUntilNextSoundtrackOffer = Math.floor(Math.random() * 13) + 12;
                }
                
                artistData.weeksUntilNextSoundtrackOffer -= 1;

                if (artistData.weeksUntilNextSoundtrackOffer <= 0) {
                    // Time for an offer, reset for next time.
                    artistData.weeksUntilNextSoundtrackOffer = Math.floor(Math.random() * 13) + 12;

                    if (artistData.offeredSoundtracks.length < 13 && artistProfileForEmail) {
                        const allSoundtracks: Array<keyof typeof Object | string> = ['F1 The Album', 'Wicked', 'Breaking Bad', 'Dune: Part Two', 'Deadpool & Wolverine', 'Barbie', 'Spider-Man: Beyond the Spider-Verse', 'James Bond', 'The Hunger Games', 'Pitch Perfect', 'The Great Gatsby', 'Mamma Mia', 'Twilight'];
                        const availableSoundtracks = allSoundtracks.filter(title => !artistData.offeredSoundtracks.includes(title as any));
                
                        if (availableSoundtracks.length > 0) {
                            const chosenSoundtrack = availableSoundtracks[Math.floor(Math.random() * availableSoundtracks.length)] as 'F1 The Album' | 'Wicked' | 'Breaking Bad' | 'Dune: Part Two' | 'Deadpool & Wolverine' | 'Barbie' | 'Spider-Man: Beyond the Spider-Verse' | 'James Bond' | 'The Hunger Games' | 'Pitch Perfect' | 'The Great Gatsby' | 'Mamma Mia' | 'Twilight';
                            
                            const emailId = crypto.randomUUID();
                            newEmails.push({
                                id: emailId,
                                sender: 'Major Film Studio',
                                senderIcon: 'soundtrack',
                                subject: `Opportunity: Contribute to "${chosenSoundtrack}" Soundtrack`,
                                body: `Hi ${artistProfileForEmail.name},\n\nWe are currently curating the official soundtrack for the upcoming blockbuster "${chosenSoundtrack}" and would be honored to feature your music.\n\nThis is a major opportunity to reach a global audience. If you are interested in contributing 1-3 unreleased songs, please accept this offer.\n\nBest regards,\nMusic Supervisor`,
                                date: newDate,
                                isRead: false,
                                offer: {
                                    type: 'soundtrackOffer',
                                    albumTitle: chosenSoundtrack,
                                    isAccepted: false,
                                    emailId: emailId
                                }
                            });
                
                            artistData.soundtrackOfferCount += 1;
                            artistData.offeredSoundtracks.push(chosenSoundtrack);
                        }
                    }
                }

                // --- VOGUE OFFER LOGIC ---
                const totalWeeksElapsed = newDate.year * 52 + newDate.week;

                if (
                    artistProfileForEmail &&
                    totalWeeksElapsed > 10 &&
                    totalWeeksElapsed % 20 === 0 &&
                    artistData.lastVogueOfferYear !== newDate.year
                ) {
                    const magazines: Array<'Vogue' | 'Vogue Korea' | 'Vogue Italy'> = ['Vogue', 'Vogue Korea', 'Vogue Italy'];
                    const chosenMagazine = magazines[Math.floor(Math.random() * magazines.length)];
                    const emailId = crypto.randomUUID();

                    newEmails.push({
                        id: emailId,
                        sender: chosenMagazine,
                        senderIcon: 'vogue',
                        subject: `Invitation: Grace the Cover of ${chosenMagazine}`,
                        body: `Dear ${artistProfileForEmail.name},\n\nYour recent impact on the music and fashion worlds has not gone unnoticed. We at ${chosenMagazine} would be honored to feature you on our upcoming cover.\n\nThis opportunity includes a full photoshoot and an in-depth interview. Please let us know if you're interested in this prestigious feature.\n\nSincerely,\nThe Editors`,
                        date: newDate,
                        isRead: false,
                        offer: {
                            type: 'vogueOffer',
                            magazine: chosenMagazine,
                            isAccepted: false,
                            emailId: emailId,
                        }
                    });
                    artistData.lastVogueOfferYear = newDate.year;
                }

                // --- EVENTS ---
                if (artistProfileForEmail && artistData.popularity > 20) {
                    if (newDate.week === 17 && Math.random() < 0.5) {
                        const emailId = crypto.randomUUID();
                        newEmails.push({
                            id: emailId,
                            sender: 'Anna Wintour',
                            senderIcon: 'event',
                            subject: `Invitation: The Met Gala ${newDate.year}`,
                            body: `Dear ${artistProfileForEmail.name},\n\nWe cordially invite you to attend The ${newDate.year} Met Gala.\n\nPlease RSVP by responding to this invitation.\n\nYours sincerely,\nAnna Wintour`,
                            date: newDate,
                            isRead: false,
                            offer: { type: 'eventInvitation', eventName: 'The Met Gala', eventType: 'metGala', emailId }
                        });
                    } else if ((newDate.week === 6 || newDate.week === 36) && Math.random() < 0.5) {
                        const emailId = crypto.randomUUID();
                        newEmails.push({
                            id: emailId,
                            sender: 'NYFW Council',
                            senderIcon: 'event',
                            subject: `Invitation: New York Fashion Week`,
                            body: `Hi ${artistProfileForEmail.name},\n\nYou're invited to sit front row at New York Fashion Week.\n\nPlease let us know if you can attend.`,
                            date: newDate,
                            isRead: false,
                            offer: { type: 'eventInvitation', eventName: 'New York Fashion Week', eventType: 'nyfw', emailId }
                        });
                    } else if (newDate.week === 5 && Math.random() < 0.3 && state.offlineMode) {
                        const emailId = crypto.randomUUID();
                        const allPlayerNames = [...(state.allPlayerArtists?.map(a => a.name) || []), state.soloArtist?.name, state.group?.name].filter((n): n is string => !!n);
                        const npcArtistName = getRandomNpcName(allPlayerNames);
                        newEmails.push({
                            id: emailId,
                            sender: npcArtistName,
                            senderIcon: 'event',
                            subject: `Invitation: Grammy After Party`,
                            body: `Hey ${artistProfileForEmail.name},\n\nI'm throwing a huge Grammy after party tonight. You should come thru.\n\n- ${npcArtistName}`,
                            date: newDate,
                            isRead: false,
                            offer: { type: 'eventInvitation', eventName: 'Grammy After Party', eventType: 'afterParty', hostName: npcArtistName, emailId }
                        });
                    } else if (newDate.week === 10 && Math.random() < 0.3 && state.offlineMode) {
                        const emailId = crypto.randomUUID();
                        const allPlayerNames = [...(state.allPlayerArtists?.map(a => a.name) || []), state.soloArtist?.name, state.group?.name].filter((n): n is string => !!n);
                        const npcArtistName = getRandomNpcName(allPlayerNames);
                        newEmails.push({
                            id: emailId,
                            sender: npcArtistName,
                            senderIcon: 'event',
                            subject: `Invitation: Oscar After Party`,
                            body: `Hey ${artistProfileForEmail.name},\n\nI'm throwing an Oscars after party this weekend. Grab a drink with us.\n\n- ${npcArtistName}`,
                            date: newDate,
                            isRead: false,
                            offer: { type: 'eventInvitation', eventName: 'Oscar After Party', eventType: 'afterParty', hostName: npcArtistName, emailId }
                        });
                    } else if (newDate.week === 46 && Math.random() < 0.3 && state.offlineMode) {
                         const emailId = crypto.randomUUID();
                         const allPlayerNames = [...(state.allPlayerArtists?.map(a => a.name) || []), state.soloArtist?.name, state.group?.name].filter((n): n is string => !!n);
                        const npcArtistName = getRandomNpcName(allPlayerNames);
                        newEmails.push({
                            id: emailId,
                            sender: npcArtistName,
                            senderIcon: 'event',
                            subject: `Invitation: AMA After Party`,
                            body: `Hey ${artistProfileForEmail.name},\n\nHosting a post-AMA bash. Would love to see you there.\n\n- ${npcArtistName}`,
                            date: newDate,
                            isRead: false,
                            offer: { type: 'eventInvitation', eventName: 'AMA After Party', eventType: 'afterParty', hostName: npcArtistName, emailId }
                        });
                    }
                }

                // Soundtrack Premieres check
                if (artistProfileForEmail) {
                    state.soundtrackAlbums.forEach(st => {
                       // if replacing the same week, we need player to be the artistId
                       if (st.artistId === artistId && st.releaseDate.year === newDate.year && st.releaseDate.week === newDate.week && !st.isReleased) {
                             const emailId = crypto.randomUUID();
                            newEmails.push({
                                id: emailId,
                                sender: 'Studio Exec',
                                senderIcon: 'event',
                                subject: `Invitation: ${st.title} Red Carpet Premiere`,
                                body: `Hi ${artistProfileForEmail?.name},\n\nThe red carpet premiere for ${st.title} is happening this week. Since you are on the soundtrack, we'd love for you to walk the red carpet.\n\nStudio Exec`,
                                date: newDate,
                                isRead: false,
                                offer: { type: 'eventInvitation', eventName: `${st.title} Premiere`, eventType: 'soundtrackPremiere', associatedSoundtrack: st.title, emailId }
                            });
                       }
                    });
                }

                // --- FEATURE OFFER LOGIC ---
                if (artistData.weeksUntilNextFeatureOffer === undefined) {
                    artistData.weeksUntilNextFeatureOffer = Math.floor(Math.random() * (8 - 2 + 1)) + 2; // 2-8 weeks
                }

                artistData.weeksUntilNextFeatureOffer -= 1;

                if (artistData.weeksUntilNextFeatureOffer <= 0 && artistProfileForEmail && state.offlineMode) {
                    // Reset counter
                    artistData.weeksUntilNextFeatureOffer = Math.floor(Math.random() * (8 - 2 + 1)) + 2;
                    
                    let npcArtistName = '';
                    const allPlayerNames = [...(state.allPlayerArtists?.map(a => a.name) || []), state.soloArtist?.name, state.group?.name].filter((n): n is string => !!n);
                    do {
                        npcArtistName = getRandomNpcName(allPlayerNames);
                    } while (npcArtistName === artistProfileForEmail.name);

                    const npcGenre = NPC_ARTIST_GENRES[npcArtistName];
                    const isEligibleForFeature = npcGenre === 'Indie' ? artistData.popularity >= 5 : artistData.popularity > 30;

                    // Check conditions
                    if (isEligibleForFeature && Math.random() < 0.5) { // 50% chance if eligible
                        const emailId = crypto.randomUUID();
                        let payout = Math.floor(50000 + (artistData.popularity * 2000 * (Math.random() * 1.5 + 0.5)));
                        if (npcGenre === 'Indie') {
                            payout = Math.floor(Math.random() * (25000 - 5000 + 1)) + 5000;
                        }
                        
                        const songQuality = Math.floor(40 + (artistData.popularity / 2.5) + (Math.random() * 10));
                        
                        let promotion: FeatureOffer['promotion'] | undefined = undefined;
                        if (Math.random() < 0.2) { // 20% chance of promotion
                            promotion = {
                                name: "Payola Push", // Generic promo name
                                durationWeeks: Math.floor(Math.random() * 3) + 2 // 2-4 weeks
                            };
                        }

                        const offer: FeatureOffer = {
                            type: 'featureOffer',
                            npcArtistName,
                            payout,
                            songQuality: Math.min(100, songQuality),
                            promotion,
                            isAccepted: false,
                            emailId,
                        };

                        newEmails.push({
                            id: emailId,
                            sender: npcArtistName,
                            senderIcon: 'feature',
                            subject: 'Feature Request',
                            body: `Hey ${artistProfileForEmail.name},\n\nBig fan of your work. I have a track that I think you'd sound perfect on.\n\nI can offer a payout of $${formatNumber(payout)} for your verse. The song quality is looking to be around ${Math.min(100, songQuality)}${promotion ? `, and we'll be running a ${promotion.name} for ${promotion.durationWeeks} weeks` : ''}.\n\nLet me know if you're interested.\n\nBest,\n${npcArtistName}`,
                            date: newDate,
                            isRead: false,
                            offer: offer
                        });
                    }
                }

                let newHype: number;
                const hypeMode = artistData.redMicPro.hypeMode || 'locked';
                const difficulty = state.difficultyMode || 'normal';

                let hypeDecay = 2;
                if (difficulty === 'easy') hypeDecay = 0;
                else if (difficulty === 'hard') hypeDecay = 3;
                else if (difficulty === 'extreme') hypeDecay = 5;

                if (artistData.redMicPro.unlocked && hypeMode === 'locked') {
                    newHype = 1000;
                } else {
                    newHype = Math.max(0, artistData.hype - hypeDecay);
                }

                let newPopularity = artistData.popularity;
                const lastRelease = [...artistData.releases].sort((a,b) => (b.releaseDate.year * 52 + b.releaseDate.week) - (a.releaseDate.year * 52 + a.releaseDate.week))[0];
                
                let popDecay = 0.25;
                if (difficulty === 'easy') popDecay = 0;
                else if (difficulty === 'hard') popDecay = 0.5;
                else if (difficulty === 'extreme') popDecay = 1.0;

                if (lastRelease) {
                    const weeksSinceLastRelease = (newDate.year * 52 + newDate.week) - (lastRelease.releaseDate.year * 52 + lastRelease.week);
                    if (weeksSinceLastRelease > 12) { // 3 months
                        newPopularity = Math.max(0, newPopularity - popDecay);
                    }
                } else if ( (newDate.year * 52 + newDate.week) > 12 ) { // If no releases at all after 12 weeks
                    newPopularity = Math.max(0, newPopularity - popDecay);
                }

                const popularityMultiplier = 1 + (newPopularity / 100);
                const hypeMultiplier = 1 + (newHype / 100);
                
                let leakedSongThisWeek: Song | null = null;
                // --- SONG LEAK LOGIC ---
                artistData.songs.forEach(song => {
                    // Update already leaked songs
                    if (song.leakInfo) {
                        const weeklyIllegalStreams = Math.floor((song.quality * newHype * (Math.random() * 20 + 10)));
                        song.leakInfo.illegalStreams += weeklyIllegalStreams;
                        song.leakInfo.illegalDownloads += Math.floor(weeklyIllegalStreams / (Math.random() * 10 + 5));
                    } 
                    // Check for new leaks
                    else if (!song.isReleased) {
                        let leakChance = newHype / 5000; // 2% chance at 100 hype, 20% at 1000 hype
                        if (artistData.securityTeamId) {
                            const team = SECURITY_TEAMS.find(s => s.id === artistData.securityTeamId);
                            if (team) {
                                leakChance *= team.leakProtection;
                            }
                        }
                        if (Math.random() < leakChance) {
                            const illegalStreams = Math.floor((song.quality * newHype * (Math.random() * 50 + 20)));
                            const illegalDownloads = Math.floor(illegalStreams / (Math.random() * 10 + 5));
                            song.leakInfo = { illegalStreams, illegalDownloads };
                            leakedSongThisWeek = song;

                            let sender = "Music Insider";
                            let senderIcon: Email['senderIcon'] = 'default';
                             if (artistData.contract) {
                                const label = LABELS.find(l => l.id === artistData.contract!.labelId) || allCustomLabels.find(l => l.id === artistData.contract!.labelId);
                                if(label) {
                                    sender = label.name;
                                    senderIcon = 'label';
                                }
                            }
                            
                            const emailId = crypto.randomUUID();
                            newEmails.push({
                                id: emailId,
                                sender: sender,
                                senderIcon: senderIcon,
                                subject: `URGENT: Your song "${song.title}" has leaked!`,
                                body: `Hi ${artistProfileForEmail?.name || 'Artist'},\n\nWe've detected an unauthorized leak of your unreleased song "${song.title}". The track is spreading online via illegal streams and downloads.\n\nThis will likely impact your official release plans. We recommend releasing the song officially as soon as possible to mitigate the damage.\n\n- ${sender}`,
                                date: newDate,
                                isRead: false,
                                offer: { type: 'leak', songId: song.id }
                            });
                        }
                    }
                });

                // --- X SUSPENSION & APPEAL LOGIC ---
                if (!artistData.xSuspensionStatus?.isSuspended) {
                    let suspensionChance = 0.005; // 0.5% random chance per week
                    let suspensionReason: XSuspensionStatus['reason'] = 'random';
                
                    if (artistData.fanWarStatus) {
                        suspensionChance += 0.15; // Add 15% chance if in a fan war
                        suspensionReason = 'fan_war_reports';
                    }
                
                    if (Math.random() < suspensionChance) {
                        const playerAccounts = artistData.xUsers.filter(u => u.isPlayer);
                        const suspendedAccountId = artistData.selectedPlayerXUserId || playerAccounts[0]?.id;
                        artistData.xSuspensionStatus = { 
                            isSuspended: true, 
                            reason: suspensionReason,
                            suspendedDate: newDate,
                            accountId: suspendedAccountId
                        };
                        artistData.hype = Math.max(0, artistData.hype - 50);
                        artistData.popularity = Math.max(0, artistData.popularity - 10);
                
                        const artistProfile = allPlayerArtistsAndGroups.find(a => a.id === artistId);
                        if (artistProfile) {
                            const username = artistProfile.name.replace(/\s/g, '').toLowerCase();
                            artistData.xPosts.unshift({
                                id: crypto.randomUUID(), authorId: 'popbase',
                                content: `X has permanently suspended ${artistProfile.name}'s account (@${username}) for violations of the X Rules.`,
                                likes: Math.floor(Math.random() * 40000) + 15000, retweets: Math.floor(Math.random() * 9000) + 4000, views: Math.floor(Math.random() * 1200000) + 400000, date: newDate,
                            });
                            const fanAccount = artistData.xUsers.find(u => u.id.startsWith('addiction_fan'));
                            if (fanAccount) {
                                artistData.xPosts.unshift({
                                    id: crypto.randomUUID(), authorId: fanAccount.id,
                                    content: `NO WAY ${artistProfile.name} GOT SUSPENDED???? #Free${username}`,
                                    likes: Math.floor(Math.random() * 50000) + 20000, retweets: Math.floor(Math.random() * 15000) + 5000, views: Math.floor(Math.random() * 1000000) + 300000, date: newDate,
                                });
                            }
                            newEmails.push({
                                id: crypto.randomUUID(), sender: 'X Support', senderIcon: 'x', subject: 'Your account has been suspended',
                                body: `Hello,\n\nYour account, @${username}, has been suspended for violating the X Rules.\n\nAfter careful review, we determined your account broke the X Rules. Your account is permanently in read-only mode, which means you can’t post, Repost, or Like content. You won’t be able to create new accounts.\n\nIf you think we got this wrong, you can submit an appeal.\n\nThanks,\nX Support`,
                                date: newDate, isRead: false, offer: { type: 'xSuspension', isSuspended: true }
                            });
                        }
                    }
                } else if (artistData.xSuspensionStatus.isSuspended && artistData.xSuspensionStatus.appealSentDate) {
                    const weeksSinceAppeal = (newDate.year * 52 + newDate.week) - (artistData.xSuspensionStatus.appealSentDate.year * 52 + artistData.xSuspensionStatus.appealSentDate.week);
                    if (weeksSinceAppeal >= 1) {
                        const reason = artistData.xSuspensionStatus.reason;
                        const successChance = reason === 'random' ? 0.9 : 0.1;
                        const isSuccessful = Math.random() < successChance;
                        const artistProfile = allPlayerArtistsAndGroups.find(a => a.id === artistId);
                
                        if (isSuccessful) {
                            artistData.xSuspensionStatus = null;
                            if (artistProfile) {
                                const username = artistProfile.name.replace(/\s/g, '').toLowerCase();
                                artistData.xPosts.unshift({
                                    id: crypto.randomUUID(), authorId: 'popbase',
                                    content: `X has reinstated ${artistProfile.name}'s account (@${username}) following an appeal.`,
                                    likes: Math.floor(Math.random() * 25000) + 10000, retweets: Math.floor(Math.random() * 5000) + 2000, views: Math.floor(Math.random() * 800000) + 300000, date: newDate,
                                });
                                newEmails.push({
                                    id: crypto.randomUUID(), sender: 'X Support', senderIcon: 'x', subject: 'Update on your appeal',
                                    body: `Hello,\n\nAfter a review of your appeal, we've determined that your account, @${username}, did not violate the X Rules. Your account has been reinstated and your suspension has been lifted.\n\nWe apologize for this error.\n\nThanks,\nX Support`,
                                    date: newDate, isRead: false, offer: { type: 'xAppealResult', isSuccessful: true }
                                });
                            }
                        } else {
                            artistData.xSuspensionStatus.appealSentDate = undefined;
                            if (artistProfile) {
                                newEmails.push({
                                    id: crypto.randomUUID(), sender: 'X Support', senderIcon: 'x', subject: 'Update on your appeal',
                                    body: `Hello,\n\nWe've reviewed the appeal for your account, @${artistProfile.name.replace(/\s/g, '').toLowerCase()}.\n\nOur review found that your account broke the X Rules. As a result, your account will remain suspended.\n\nThanks,\nX Support`,
                                    date: newDate, isRead: false, offer: { type: 'xAppealResult', isSuccessful: false }
                                });
                            }
                        }
                    }
                }
                
                if (artistData.xSuspensionStatus?.isSuspended && artistData.xSuspensionStatus.suspendedDate) {
                    const weeksSinceSuspension = (newDate.year * 52 + newDate.week) - (artistData.xSuspensionStatus.suspendedDate.year * 52 + artistData.xSuspensionStatus.suspendedDate.week);
                    if (weeksSinceSuspension >= 4) {
                        const targetAccountId = artistData.xSuspensionStatus.accountId;
                        artistData.xUsers = artistData.xUsers.filter(u => u.id !== targetAccountId);
                        // @ts-ignore
                        artistData.xSuspensionStatus = null;
                        
                        // Pick a new account if we deleted the current one
                        if (artistData.selectedPlayerXUserId === targetAccountId) {
                            artistData.selectedPlayerXUserId = artistData.xUsers.find(u => u.isPlayer)?.id;
                        }
                    }
                }

                // --- CHEATING SCANDAL LOGIC ---
                const activeRelationship = (artistData.relationships || []).find(r => r.endYear === null);
                if (activeRelationship && activeRelationship.isPublic && artistProfileForEmail) {
                    if (Math.random() < 0.005) { // 0.5%
                        const emailId = crypto.randomUUID();
                        newEmails.push({
                            id: emailId,
                            sender: 'PR Team',
                            senderIcon: 'default',
                            subject: 'URGENT: Cheating Allegations',
                            body: `Hi ${artistProfileForEmail.name},\n\nTMZ just published an article alleging that ${activeRelationship.partnerName} was seen getting close with someone else. Social media is blowing up.\n\nHow do you want to handle this scandal?`,
                            date: newDate,
                            isRead: false,
                            offer: { 
                                type: 'cheatingScandal', 
                                relationshipId: activeRelationship.id 
                            }
                        });

                        artistData.xPosts.unshift({
                            id: crypto.randomUUID(), authorId: 'tmz',
                            content: `🚨 EXCLUSIVE: Sources claim they spotted ${activeRelationship.partnerName} acting VERY single despite dating ${artistProfileForEmail.name}. Trouble in paradise? 👀☕️`,
                            likes: Math.floor(Math.random() * 500000) + 150000, 
                            retweets: Math.floor(Math.random() * 150000) + 40000, 
                            views: Math.floor(Math.random() * 12000000) + 4000000, 
                            date: newDate,
                        });
                    }
                }

                // --- PREGNANCY LOGIC ---
                if (artistData.pregnancy) {
                    const conceptionWeeks = artistData.pregnancy.conceptionDate.year * 52 + artistData.pregnancy.conceptionDate.week;
                    const currentWeeks = newDate.year * 52 + newDate.week;
                    if (currentWeeks - conceptionWeeks >= 39) {
                        const hasReceivedBirthEmail = artistData.inbox.some(e => e.offer?.type === 'giveBirth') || newEmails.some(e => e.offer?.type === 'giveBirth');
                        if (!hasReceivedBirthEmail && artistProfileForEmail) {
                            newEmails.push({
                                id: crypto.randomUUID(),
                                sender: 'Personal Update',
                                senderIcon: 'default',
                                subject: 'It\'s Time!',
                                body: `Hi ${artistProfileForEmail.name},\n\nThe big day is here! You're ready to welcome your new baby into the world. It's time to name your child!`,
                                date: newDate,
                                isRead: false,
                                offer: { type: 'giveBirth' }
                            });
                        }
                    }
                }

                let labelMultiplier = 1;
                let playerCut = 1.0;
                if (artistData.contract) {
                    if (artistData.contract.isCustom) {
                        const label = allCustomLabels.find(l => l.id === artistData.contract!.labelId);
                        if (label) {
                            labelMultiplier = label.promotionMultiplier;
                            playerCut = 1.0; // Custom label owners keep 100%
                        }
                    } else {
                        const label = LABELS.find(l => l.id === artistData.contract!.labelId);
                        if (label) {
                            labelMultiplier = label.promotionMultiplier;
                            if (label.contractType === 'petty') playerCut = 0.1;
                            else if (label.id === 'umg') playerCut = 0.2;
                            else if (label.tier === 'Mid-high' || label.tier === 'Mid-Low' || label.tier === 'Top') playerCut = 0.4;
                            else if (label.tier === 'Low') playerCut = 0.5;
                        }
                    }
                }

                let totalWeeklyStreams = 0;
                let artistStreamIncome = 0;
                const updatedSongs = artistData.songs.map(song => {
                    if (song.isReleased && !song.isTakenDown) {
                        const baseStreams = (song.quality ** 2) * 50;
                        const difficulty = state.difficultyMode || 'normal';
                        let diffMultiplier = 1;
                        if (difficulty === 'easy') diffMultiplier = 2.0;
                        else if (difficulty === 'hard') diffMultiplier = 0.6;
                        else if (difficulty === 'extreme') diffMultiplier = 0.3;

                        let weeklyStreams = Math.floor(baseStreams * hypeMultiplier * labelMultiplier * popularityMultiplier * diffMultiplier * (Math.random() * 0.4 + 0.8)); 

                        // Decay logic
                        let releaseDate = song.releaseDate;
                        if (!releaseDate && song.releaseId) {
                            const release = artistData.releases.find(r => r.id === song.releaseId);
                            if (release) releaseDate = release.releaseDate;
                        }
                        
                        if (releaseDate) {
                            let decayIntensity = 0.15;
                            if (difficulty === 'easy') decayIntensity = 0; // No stream decay
                            else if (difficulty === 'hard') decayIntensity = 0.25;
                            else if (difficulty === 'extreme') decayIntensity = 0.4;

                            if (decayIntensity > 0) {
                                const ageInWeeks = Math.max(0, (newDate.year - releaseDate.year) * 52 + (newDate.week - releaseDate.week));
                                const maxAge = Math.min(ageInWeeks, 156); // 3 years max decay
                                const decayFactor = 1 / (1 + decayIntensity * maxAge);
                                weeklyStreams = Math.floor(weeklyStreams * decayFactor);
                            }
                        }

                        // Christmas Genre Seasonal Logic
                        if (song.genre === 'Christmas') {
                            const week = newDate.week;
                            let christmasMultiplier = 1.0;

                            if (week >= 50) { // Peak: Weeks 50-52
                                christmasMultiplier = Math.random() * 5 + 15; // 15x to 20x
                            } else if (week >= 45) { // Huge gains: Weeks 45-49
                                christmasMultiplier = Math.random() * 5 + 8; // 8x to 13x
                            } else if (week >= 41) { // Momentum: Weeks 41-44
                                christmasMultiplier = Math.random() * 1.5 + 1.5; // 1.5x to 3x
                            } else { // Off-season: Before week 41
                                christmasMultiplier = Math.random() * 0.2 + 0.05; // 0.05x to 0.25x (significant reduction)
                            }
                            
                            weeklyStreams = Math.floor(weeklyStreams * christmasMultiplier);
                        }

                        if (song.pitchforkBoost) {
                            weeklyStreams = Math.floor(weeklyStreams * (Math.random() * 2 + 2));
                        }
                        
                        let playlistStreams = 0;
                        const spotifyPlaylists = state.spotifyPlaylists || DEFAULT_SPOTIFY_PLAYLISTS;
                        spotifyPlaylists.forEach(playlist => {
                            const trackIndex = playlist.tracks.findIndex(t => t.songId === song.id);
                            if (trackIndex !== -1) {
                                const percentage = Math.max(0.001, 0.03 - (trackIndex * 0.0006));
                                const pStreams = Math.floor(playlist.followers * percentage);
                                playlistStreams += pStreams;

                                if (!artistData.playlistPlacements) artistData.playlistPlacements = [];
                                let placement = artistData.playlistPlacements.find(p => p.playlistId === playlist.id);
                                if (!placement) {
                                    placement = { playlistId: playlist.id, playlistName: playlist.name, coverArt: playlist.coverArt, totalStreams: 0, songStreams: {} };
                                    artistData.playlistPlacements.push(placement);
                                }
                                placement.totalStreams += pStreams;
                                placement.songStreams[song.id] = (placement.songStreams[song.id] || 0) + pStreams;
                            }
                        });
                        weeklyStreams += playlistStreams;
                        
                        let newPlaylistBoostWeeks = song.playlistBoostWeeks;
                        if (typeof song.playlistBoostWeeks === 'number' && song.playlistBoostWeeks > 0) {
                            newPlaylistBoostWeeks = song.playlistBoostWeeks - 1;
                        }

                        const songPromo = artistData.promotions.find(p => p.itemId === song.id && p.itemType === 'song');
                        if (songPromo) {
                            weeklyStreams = Math.floor(weeklyStreams * songPromo.boostMultiplier);
                        }
                        
                        // Generate daily streams for the week
                        const daily = new Array(7).fill(0);
                        if (weeklyStreams > 0) {
                            const weights = Array(7).fill(0).map(() => Math.random());
                            const totalWeight = weights.reduce((s, w) => s + w, 0);
                            if (totalWeight > 0) {
                                const dailyStreamsUnadjusted = weights.map(w => Math.floor((w / totalWeight) * weeklyStreams));
                                const sum = dailyStreamsUnadjusted.reduce((s, d) => s + d, 0);
                                dailyStreamsUnadjusted[6] += weeklyStreams - sum; // Adjust last day to match total
                                for(let i=0; i<7; i++) daily[i] = dailyStreamsUnadjusted[i];
                            } else {
                                daily[0] = weeklyStreams;
                            }
                        }
                        const newDailyStreams = [...(song.dailyStreams || []), ...daily];

                        totalWeeklyStreams += weeklyStreams;
                        
                        const release = artistData.releases.find(r => r.id === song.releaseId);
                        let firstWeekStreamsData = {};
                        if (release && (newDate.year * 52 + newDate.week) - (release.releaseDate.year * 52 + release.releaseDate.week) === 1) {
                            firstWeekStreamsData = { firstWeekStreams: weeklyStreams };
                        }

                        const generatedGross = weeklyStreams * STREAM_INCOME_MULTIPLIER;
                        
                        let myGross = song.isFeatureToNpc ? 0 : generatedGross;
                        if (song.rightsSoldPercent && song.rightsSoldPercent > 0) {
                            myGross -= generatedGross * (song.rightsSoldPercent / 100);
                        }
                        
                        let generatedNet = myGross * playerCut;
                        
                        // Deduct producer/songwriter/engineer/anr cuts
                        if (song.contributorCutsTotal && song.contributorCutsTotal > 0) {
                            generatedNet = generatedNet * Math.max(0, (1 - (song.contributorCutsTotal / 100)));
                        }

                        artistStreamIncome += generatedNet;

                        return { 
                            ...song, 
                            streams: (song.streams || 0) + weeklyStreams,
                            prevWeekStreams: song.lastWeekStreams || 0,
                            lastWeekStreams: weeklyStreams,
                            ...firstWeekStreamsData,
                            playlistBoostWeeks: newPlaylistBoostWeeks,
                            dailyStreams: newDailyStreams,
                            revenue: (song.revenue || (song.streams || 0) * STREAM_INCOME_MULTIPLIER) + generatedGross,
                            netRevenue: (song.netRevenue || (song.streams || 0) * STREAM_INCOME_MULTIPLIER * playerCut) + generatedNet,
                        };
                    }
                    
                    if (song.isTakenDown) {
                        return {
                            ...song,
                            prevWeekStreams: song.lastWeekStreams || 0,
                            lastWeekStreams: 0,
                        };
                    }
                    return song;
                });

                artistData.songs = updatedSongs;
                
                artistData.releases = artistData.releases.map(release => {
                    if ((newDate.year * 52 + newDate.week) - (release.releaseDate.year * 52 + release.releaseDate.week) === 1) {
                        const firstWeekProjectStreams = release.songIds.reduce((sum, songId) => {
                            const song = updatedSongs.find(s => s.id === songId);
                            return sum + (song?.firstWeekStreams || 0);
                        }, 0);
                        return { ...release, firstWeekStreams: firstWeekProjectStreams };
                    }
                    return release;
                });

                const updatedLastFourWeeksStreams = [totalWeeklyStreams, ...artistData.lastFourWeeksStreams].slice(0, 4);
                const totalStreamsLastMonth = updatedLastFourWeeksStreams.reduce((sum, streams) => sum + streams, 0);
                artistData.monthlyListeners = Math.floor(totalStreamsLastMonth * 0.1);
                artistData.peakMonthlyListeners = Math.max(artistData.monthlyListeners, artistData.peakMonthlyListeners || 0);
                
                artistData.listeningNow = Math.floor(artistData.monthlyListeners * (Math.random() * 0.001));
                artistData.saves = Math.floor((artistData.saves || 0) + (totalWeeklyStreams / 1000) * (Math.random() * 0.5 + 0.5));
                const newFollowers = Math.floor(totalWeeklyStreams / 50000);
                artistData.followers = (artistData.followers || 0) + newFollowers;

                const updatedStreamsHistory = [...(artistData.streamsHistory || []), { date: newDate, streams: totalWeeklyStreams }];
                if (updatedStreamsHistory.length > 52) {
                    updatedStreamsHistory.shift();
                }
                artistData.streamsHistory = updatedStreamsHistory;


                let totalWeeklyViews = 0;
                const updatedVideos = artistData.videos.map(video => {
                    const song = updatedSongs.find(s => s.id === video.songId);
                    if (!song) return video;

                    const videoPromo = artistData.promotions.find(p => p.itemId === video.id && p.itemType === 'video');
                    let weeklyViews;

                    if (videoPromo && videoPromo.boostMultiplier === -1) { // Synergy Campaign
                        weeklyViews = song.lastWeekStreams;
                    } else {
                        let videoTypeMultiplier = 1;
                        switch(video.type) {
                            case 'Music Video': videoTypeMultiplier = 2; break;
                            case 'Lyric Video': videoTypeMultiplier = 1; break;
                            case 'Visualizer': videoTypeMultiplier = 0.5; break;
                            case 'Genius Verified': videoTypeMultiplier = 1.2; break;
                            case 'Live Performance': videoTypeMultiplier = 2.5; break;
                            case 'Interview': videoTypeMultiplier = 1.5; break;
                        }
                        const difficulty = state.difficultyMode || 'normal';
                        let diffMultiplier = 1;
                        if (difficulty === 'easy') diffMultiplier = 2.0;
                        else if (difficulty === 'hard') diffMultiplier = 0.6;
                        else if (difficulty === 'extreme') diffMultiplier = 0.3;

                        weeklyViews = Math.floor((song.quality ** 2) * 10 * videoTypeMultiplier * hypeMultiplier * popularityMultiplier * diffMultiplier * (Math.random() * 0.4 + 0.8)); 
                    }

                    if (song.pitchforkBoost) {
                        weeklyViews = Math.floor(weeklyViews * (Math.random() * 2 + 2));
                    }
                    
                    if (videoPromo && videoPromo.boostMultiplier !== -1) {
                        weeklyViews = Math.floor(weeklyViews * videoPromo.boostMultiplier);
                    }

                    let firstWeekViewsData = {};
                    if ((newDate.year * 52 + newDate.week) - (video.releaseDate.year * 52 + video.releaseDate.week) === 1) {
                        firstWeekViewsData = { firstWeekViews: weeklyViews };
                    }

                    totalWeeklyViews += weeklyViews;
                    return { ...video, views: video.views + weeklyViews, ...firstWeekViewsData };
                });
                artistData.videos = updatedVideos;

                const updatedLastFourWeeksViews = [totalWeeklyViews, ...artistData.lastFourWeeksViews].slice(0, 4);

                const newSubscribersGained = Math.floor(totalWeeklyViews / (350 - Math.min(300, artistData.youtubeSubscribers / 4000)));
                const newYoutubeSubscribers = artistData.youtubeSubscribers + newSubscribersGained;

                const streamIncome = totalWeeklyStreams * STREAM_INCOME_MULTIPLIER;
                const viewIncome = totalWeeklyViews * VIEW_INCOME_MULTIPLIER;
                
                let merchIncome = 0;
                if (artistData.youtubeStoreUnlocked) {
                    artistData.merch.forEach(item => {
                        let weeklySales = Math.floor((artistData.youtubeSubscribers / 50000) * popularityMultiplier * (Math.random() * 5 + 1));
                        if (artistData.redMicPro.unlocked && artistData.salesBoost > 0) {
                            weeklySales = Math.floor(weeklySales * (1 + artistData.salesBoost / 100));
                        }

                        if (item.isPreorder) {
                            const sub = artistData.labelSubmissions.find(s => s.release.id === item.releaseId);
                            if (sub) {
                                sub.preorderSales = (sub.preorderSales || 0) + weeklySales;
                            }
                        }

                        merchIncome += weeklySales * item.price;
                    });
                }
                
                // --- ONLYFANS INCOME ---
                let onlyfansIncome = 0;
                const ofProfile = artistData.onlyfans;
                if (ofProfile) {
                    const ONLYFANS_CUT = 0.2;
                    // 1. Calculate new subscribers
                    const subPrice = ofProfile.subscriptionPrice > 0 ? ofProfile.subscriptionPrice : 4.99;
                    const subscriberPotential = (artistData.hype / (subPrice * 0.5)) * (Math.random() * 20 + 10);
                    const newSubscribers = Math.floor(subscriberPotential);
                    ofProfile.subscribers += newSubscribers;

                    // 2. Calculate engagement and income from existing posts
                    let tipsIncome = 0;
                    ofProfile.posts = ofProfile.posts.map(post => {
                        const newLikes = Math.floor(ofProfile.subscribers * (artistData.hype / 2000) * (Math.random() * 0.05 + 0.01));
                        const newComments = Math.floor(newLikes / (Math.random() * 30 + 15));
                        const newTips = newLikes * (Math.random() * 0.02); // average tip per like
                        
                        tipsIncome += newTips;

                        return {
                            ...post,
                            likes: post.likes + newLikes,
                            comments: post.comments + newComments,
                            tips: post.tips + newTips,
                        };
                    });
                    
                    // 3. Calculate income from new subscribers buying old posts
                    let postPurchaseIncome = 0;
                    const pricedPosts = ofProfile.posts.filter(p => p.price > 0);
                    if (newSubscribers > 0 && pricedPosts.length > 0) {
                        for (let i = 0; i < newSubscribers; i++) {
                            // Assume each new sub has a 25% chance to buy a random priced post
                            if (Math.random() < 0.25) {
                                postPurchaseIncome += pricedPosts[Math.floor(Math.random() * pricedPosts.length)].price;
                            }
                        }
                    }

                    // 4. Calculate total income
                    const subscriptionIncome = ofProfile.subscribers * ofProfile.subscriptionPrice;
                    const weeklyGross = subscriptionIncome + tipsIncome + postPurchaseIncome;
                    const weeklyNet = weeklyGross * (1 - ONLYFANS_CUT);

                    ofProfile.totalGross += weeklyGross;
                    ofProfile.totalNet += weeklyNet;
                    onlyfansIncome = weeklyNet;

                    const yearMonth = `${newDate.year}-${String(Math.floor(newDate.week/4)).padStart(2, '0')}`;
                    if(!ofProfile.earningsByMonth[yearMonth]) {
                        ofProfile.earningsByMonth[yearMonth] = { gross: 0, net: 0 };
                    }
                    ofProfile.earningsByMonth[yearMonth].gross += weeklyGross;
                    ofProfile.earningsByMonth[yearMonth].net += weeklyNet;
                    
                    // 5. Generate new content requests
                    if (ofProfile.subscribers > 50 && Math.random() < 0.15) { // 15% chance per week
                        const emailId = crypto.randomUUID();
                        const payout = Math.floor(Math.random() * 4501) + 500;
                        const requestType = Math.random() > 0.5 ? 'image' : 'video';
                        const senderUsername = `user${Math.floor(Math.random() * 90000) + 10000}`;
                        newEmails.push({
                            id: emailId,
                            sender: 'OnlyFans',
                            senderIcon: 'onlyfans',
                            subject: 'New Content Request from a Subscriber',
                            body: `Hi ${artistProfileForEmail?.name},\n\nA subscriber (@${senderUsername}) has sent a request for custom content.\n\nRequest Type: ${requestType}\nPayout: $${payout.toLocaleString()}\n\nAccepting this will instantly transfer the funds to your account. The content is assumed to be sent privately.\n\n- The OnlyFans Team`,
                            date: newDate,
                            isRead: false,
                            offer: {
                                type: 'onlyfansRequest',
                                requestType,
                                payout,
                                isFulfilled: false,
                                emailId,
                                senderUsername,
                            }
                        });
                    }
                }
                
                let finalStreamIncome = artistStreamIncome;
                
                let npcLabelIncome = 0;
                if (artistData.customLabels && artistData.customLabels.length > 0) {
                    artistData.customLabels = artistData.customLabels.map(label => {
                        if (!label.signedNpcs || label.signedNpcs.length === 0) return label;
                        const updatedSignedNpcs = label.signedNpcs.map(signedNpc => {
                            if (signedNpc.status !== 'active') return signedNpc;
                            
                            const weeksPassed = (newDate.year * 52 + newDate.week) - (signedNpc.contract.startDate.year * 52 + signedNpc.contract.startDate.week);
                            let newStatus = signedNpc.status;

                            if (weeksPassed >= signedNpc.contract.durationWeeks) {
                                newStatus = 'expired';
                                newEmails.push({
                                    id: crypto.randomUUID(),
                                    sender: signedNpc.name,
                                    senderIcon: 'label',
                                    subject: 'Contract Expired! Renegotiate?',
                                    body: `My contract with your label has officially expired. I'd love to stay, but we need to negotiate a new advance. Open the Manage Label view to see my demands.`,
                                    date: newDate,
                                    isRead: false,
                                    offer: { type: 'npcContractRenewal', npcName: signedNpc.name, isAccepted: false, emailId: '' }
                                });
                            }

                            const npcProfile = newNpcsList.find(n => n.artist === signedNpc.name);
                            if (npcProfile) {
                                const weeklyStreams = Math.floor(npcProfile.basePopularity * (Math.random() * 0.4 + 0.8));
                                const grossRevenue = weeklyStreams * 0.003;
                                // Label keeps (100 - artist royaltyRate) % of revenue
                                const labelCut = grossRevenue * ((100 - signedNpc.contract.royaltyRate) / 100);
                                npcLabelIncome += labelCut;
                                return {
                                    ...signedNpc,
                                    revenueGenerated: signedNpc.revenueGenerated + grossRevenue,
                                    status: newStatus
                                };
                            }
                            return { ...signedNpc, status: newStatus };
                        });
                        return { ...label, signedNpcs: updatedSignedNpcs };
                    });
                }

                let xVerifiedMonthlyCost = 0;
                if (newDate.week % 4 === 0) {
                    artistData.xUsers.forEach(u => {
                        if (u.isPlayer) {
                            if (u.isVerified === 'blue') xVerifiedMonthlyCost += 25000;
                            if (u.isVerified === 'gold') xVerifiedMonthlyCost += 250000;
                        }
                    });
                    
                    if (xVerifiedMonthlyCost > 0) {
                        artistData.inbox.unshift({
                            id: crypto.randomUUID(),
                            sender: 'X Accounts & Billing',
                            subject: 'X Premium Receipt',
                            body: `Your X Premium subscription renewed this month.\n\nTotal charged: $${formatNumber(xVerifiedMonthlyCost)}\n\nThank you for trusting X.`,
                            date: state.date,
                            isRead: false
                        });
                    }
                }

                const totalIncome = finalStreamIncome + viewIncome + merchIncome + onlyfansIncome + npcLabelIncome - xVerifiedMonthlyCost;

                const newStreamsThisMonth = artistData.streamsThisMonth + totalWeeklyStreams;
                const newViewsThisQuarter = artistData.viewsThisQuarter + totalWeeklyViews;
                const newSubsThisQuarter = artistData.subsThisQuarter + newSubscribersGained;
                
                // Stream removal logic (every 4 weeks)
                if (newDate.week % 4 === 0 && artistData.promotions.length > 0) {
                    let totalRemovedStreams = 0;
                    const newSongs = [...artistData.songs];
                    
                    const songPromotions = artistData.promotions.filter(p => p.itemType === 'song');

                    for (const promo of songPromotions) {
                        const songIndex = newSongs.findIndex(s => s.id === promo.itemId);
                        if (songIndex !== -1) {
                            const song = newSongs[songIndex];

                            if (song.isReleased && song.streams > 1000) {
                                const getRemovalPercentage = (boost: number, quality?: string): number => {
                                    let basePercentage = 0;
                                    if (boost >= 30) basePercentage = 0.80; // 80%
                                    else if (boost >= 10) basePercentage = 0.25 + Math.random() * 0.15; // 25-40%
                                    else if (boost >= 4) basePercentage = 0.10 + Math.random() * 0.10; // 10-20%
                                    else if (boost >= 2.5) basePercentage = 0.05 + Math.random() * 0.05; // 5-10%
                                    else if (boost >= 1.5) basePercentage = 0.01 + Math.random() * 0.04; // 1-5%
                                    else basePercentage = 0.001 + Math.random() * 0.01; // fallback

                                    let multiplier = 1;
                                    if (quality === 'high') multiplier = 0.1; // 10% of base removal
                                    else if (quality === 'medium') multiplier = 0.4; // 40% of base removal

                                    return basePercentage * multiplier;
                                };
                                
                                const removalPercentage = getRemovalPercentage(promo.boostMultiplier, promo.promoQuality);
                                const streamsToRemove = Math.floor(song.streams * removalPercentage);

                                if (streamsToRemove > 0) {
                                    totalRemovedStreams += streamsToRemove;
                                    newSongs[songIndex] = {
                                        ...song,
                                        streams: song.streams - streamsToRemove,
                                        lastWeekStreams: (song.lastWeekStreams || 0) - streamsToRemove,
                                        removedStreams: (song.removedStreams || 0) + streamsToRemove
                                    };
                                }
                            }
                        }
                    }
                    artistData.songs = newSongs;

                    if (totalRemovedStreams > 0) {
                        if(artistProfileForEmail){
                            newEmails.push({
                                id: crypto.randomUUID(),
                                sender: 'Spotify',
                                subject: 'Adjustment to your stream counts',
                                body: `Hi ${artistProfileForEmail.name},\n\nWe're writing to let you know that we've made an adjustment to your stream counts. After a routine review, we identified and removed approximately ${formatNumber(totalRemovedStreams)} artificial streams from songs in your active promotional campaigns.\n\nThis is a standard process to ensure that our data is accurate and reflects genuine listener activity. For more information on artificial streams, please visit Spotify for Artists.\n\nThanks,\nThe Spotify Team`,
                                date: newDate,
                                isRead: false,
                                senderIcon: 'spotify',
                            });
                            artistData.streamsRemovedThisWeek = totalRemovedStreams;
                        }
                    }
                }

                const artistProfile = state.soloArtist || state.group?.members.find(m => m.id === artistId) || state.group;

                if (newDate.week % 4 === 0 && newStreamsThisMonth > 0 && artistProfile) {
                    newEmails.push({
                        id: crypto.randomUUID(), sender: 'Spotify', subject: 'Your Spotify Recap',
                        body: `Congratulations ${artistProfile.name},\n\nHere's your performance recap for the last month. Your tracks generated a total of ${newStreamsThisMonth.toLocaleString()} new streams!\n\nKeep up the great work.\n- The Spotify Team`,
                        date: newDate, isRead: false, senderIcon: 'spotify'
                    });
                }

                if (newDate.week > 1 && newDate.week % 13 === 0 && (newViewsThisQuarter > 0 || newSubsThisQuarter > 0) && artistProfile) {
                    newEmails.push({
                        id: crypto.randomUUID(), sender: 'YouTube', subject: 'Your Quarterly Channel Recap',
                        body: `Dear ${artistProfile.name},\n\nLet's check out your channel's growth over the last 3 months. You've gained ${newSubsThisQuarter.toLocaleString()} subscribers and your videos received ${newViewsThisQuarter.toLocaleString()} views.\n\nKeep creating!\n- The YouTube Team`,
                        date: newDate, isRead: false, senderIcon: 'youtube'
                    });
                }
                
                // --- CONTRACT & LABEL LOGIC ---
                if (artistData.contract) {
                    const contract = artistData.contract;
                    const label = LABELS.find(l => l.id === contract.labelId);
                    const weeksPassed = (newDate.year * 52 + newDate.week) - (contract.startDate.year * 52 + contract.startDate.week);

                    if (contract.durationWeeks && weeksPassed >= contract.durationWeeks) {
                        if (artistId === state.activeArtistId) {
                            contractRenewalForActivePlayer = {
                                labelId: contract.labelId,
                                isCustom: contract.isCustom,
                                artistId: artistId,
                            };
                        } else {
                            artistData.contractHistory.push(contract);
                            artistData.contract = null;
                            if (label && artistProfile) {
                                newEmails.push({
                                    id: crypto.randomUUID(), sender: label.name, subject: 'Contract Expired',
                                    body: `Dear ${artistProfile.name},\n\nYour contract with ${label.name} has officially ended. You are now an independent artist.\n\nSincerely,\n${label.name}`,
                                    date: newDate, isRead: false, senderIcon: 'label'
                                });
                            }
                        }
                    }

                    // Process pending submissions for approval/rejection
                    artistData.labelSubmissions = artistData.labelSubmissions.map(sub => {
                        if (sub.status === 'pending' && label) {
                            const weeksSinceSubmission = (newDate.year * 52 + newDate.week) - (sub.submittedDate.year * 52 + sub.submittedDate.week);
                            if (weeksSinceSubmission >= 2) {
                                const avgQuality = sub.release.songIds.reduce((sum, id) => sum + (artistData.songs.find(s => s.id === id)?.quality || 0), 0) / sub.release.songIds.length;
                                
                                let minQuality = label.minQuality ?? 0;
                                let feedback = `The average quality of ${avgQuality.toFixed(0)} didn't meet our standard of ${minQuality}. Back to the drawing board.`;

                                if (label.contractType === 'petty' && avgQuality < 70) {
                                    minQuality = 70; // Hard override for petty labels
                                    feedback = `The average quality of ${avgQuality.toFixed(0)} is unacceptable. We require a minimum quality of 70 for all releases. Do better.`;
                                }

                                if (avgQuality >= minQuality) {
                                    newEmails.push({
                                        id: crypto.randomUUID(), sender: label.name, subject: `Submission Approved: "${sub.release.title}"`,
                                        body: `Great news!\n\nWe've approved your submission for "${sub.release.title}". Please head to the 'Labels' tab to select your pre-release singles and set a release date for the project. Get ready!\n\n- ${label.name}`,
                                        date: newDate, isRead: false, senderIcon: 'label'
                                    });
                                    return { ...sub, status: 'awaiting_player_input', decisionDate: newDate };
                                } else {
                                    newEmails.push({
                                        id: crypto.randomUUID(), sender: label.name, subject: `Submission Update: "${sub.release.title}"`,
                                        body: `Hi ${artistProfile?.name},\n\nAfter careful consideration, we've decided to pass on releasing "${sub.release.title}" at this time. ${feedback}\n\n- ${label.name}`,
                                        date: newDate, isRead: false, senderIcon: 'label'
                                    });
                                    return { ...sub, status: 'rejected', decisionDate: newDate, feedback };
                                }
                            }
                        }
                        return sub;
                    });

                    // Process scheduled releases
                    const scheduledSubmissions = [...artistData.labelSubmissions.filter(s => s.status === 'scheduled')];
                    let submissionsToRemove: string[] = [];
                    let submissionsToUpdate: LabelSubmission[] = [];

                    const contractLabel = LABELS.find(l => l.id === artistData.contract!.labelId) || artistData.customLabels.find(l => l.id === artistData.contract!.labelId);
                    let releasingLabelInfo: Release['releasingLabel'] = null;
                    if (contractLabel) {
                        releasingLabelInfo = { name: contractLabel.name };
                        if ('dealWithMajorId' in contractLabel && contractLabel.dealWithMajorId) {
                            const major = LABELS.find(l => l.id === contractLabel.dealWithMajorId);
                            if (major) {
                                releasingLabelInfo.dealWithMajor = major.name;
                            }
                        }
                    }

                    let rightsSoldPercent = 0;
                    let rightsOwnerLabelId = undefined;
                    if (artistData.contract) {
                        rightsOwnerLabelId = artistData.contract.labelId;
                        if (artistData.contract.mastersOwnership === 'Label') {
                            rightsSoldPercent = 100;
                        } else if (artistData.contract.mastersOwnership === 'Split') {
                            rightsSoldPercent = 100 - artistData.contract.mastersSplitPercent;
                        } else {
                            rightsSoldPercent = 0;
                            rightsOwnerLabelId = undefined;
                        }
                    }

                    scheduledSubmissions.forEach(sub => {
                        let subModified = false;
                        // Check for single releases
                        const singlesReadyToRelease = sub.singlesToRelease?.filter(single =>
                            single.releaseDate.week === newDate.week && single.releaseDate.year === newDate.year
                        ) || [];

                        if (singlesReadyToRelease.length > 0) {
                            singlesReadyToRelease.forEach(single => {
                                const songToRelease = artistData.songs.find(s => s.id === single.songId);
                                if (songToRelease) {
                                    if (songToRelease.controversialContributors && songToRelease.controversialContributors.length > 0) {
                        const badName = songToRelease.controversialContributors[0];
                        artistData.publicImage = Math.max(0, (artistData.publicImage || 80) - 20);
                        
                        const controversialTmzPost: XPost = {
                            id: crypto.randomUUID(),
                            authorId: 'tmz',
                            content: `${artistProfile?.name || 'Artist'} has worked with controversial producer ${badName} on their new song "${songToRelease.title}". Are they desperate for a hit? Yikes. 😬`,
                            image: artistData.paparazziPhotos.length > 0 ? artistData.paparazziPhotos[Math.floor(Math.random() * artistData.paparazziPhotos.length)].url : undefined,
                            likes: Math.floor(Math.random() * 60000) + 20000,
                            retweets: Math.floor(Math.random() * 15000) + 5000,
                            views: Math.floor(Math.random() * 2000000) + 800000,
                            date: newDate
                        };
                        const controversialFanPost1: XPost = {
                            id: crypto.randomUUID(),
                            authorId: `hater_${Math.floor(Math.random() * 1000)}`,
                            content: `Ew why is ${artistProfile?.name || 'Artist'} working with ${badName}?? Cancelled.`,
                            likes: Math.floor(Math.random() * 5000) + 1000,
                            retweets: Math.floor(Math.random() * 1000) + 100,
                            views: Math.floor(Math.random() * 100000) + 10000,
                            date: newDate
                        };
                        const controversialFanPost2: XPost = {
                            id: crypto.randomUUID(),
                            authorId: `hater_${Math.floor(Math.random() * 1000)}`,
                            content: `I'm actually shocked ${artistProfile?.name || 'Artist'} would sink this low. The new song is tainted.`,
                            likes: Math.floor(Math.random() * 8000) + 2000,
                            retweets: Math.floor(Math.random() * 2000) + 200,
                            views: Math.floor(Math.random() * 150000) + 20000,
                            date: newDate
                        };
                        artistData.xPosts = [controversialTmzPost, controversialFanPost1, controversialFanPost2, ...artistData.xPosts];
                    }

                                    const singleRelease: Release = {
                                        id: crypto.randomUUID(),
                                        title: songToRelease.title,
                                        type: 'Single',
                                        coverArt: sub.release.coverArt, // Use album cover for pre-release single
                                        songIds: [songToRelease.id],
                                        releaseDate: newDate,
                                        artistId: songToRelease.artistId,
                                        releasingLabel: releasingLabelInfo,
                                        rightsSoldPercent: rightsSoldPercent > 0 ? rightsSoldPercent : undefined,
                                        rightsOwnerLabelId: rightsOwnerLabelId
                                    };
                                    artistData.releases.push(singleRelease);
                                    artistData.songs = artistData.songs.map(s => s.id === single.songId ? { ...s, isReleased: true, releaseId: singleRelease.id, isPreReleaseSingle: true, coverArt: sub.release.coverArt, rightsSoldPercent: rightsSoldPercent > 0 ? rightsSoldPercent : undefined, rightsOwnerLabelId: rightsOwnerLabelId } : s);
                                    artistData.hype = Math.min(getHypeCap(artistData), artistData.hype + 15);

                                    if (!single.isAnnounced) {
                                        const pronounPossessive = artistProfile?.pronouns === 'he/him' ? 'his' : artistProfile?.pronouns === 'she/her' ? 'her' : 'their';
                                        const popBasePost: XPost = {
                                            id: crypto.randomUUID(),
                                            authorId: 'popbase',
                                            content: `${artistProfile?.name} has surprise released ${pronounPossessive} new Single "${songToRelease.title}".`,
                                            image: singleRelease.coverArt,
                                            likes: Math.floor(Math.random() * 80000) + 30000,
                                            retweets: Math.floor(Math.random() * 20000) + 5000,
                                            views: Math.floor(Math.random() * 1500000) + 500000,
                                            date: newDate
                                        };
                                        artistData.xPosts.unshift(popBasePost);

                                        const tmzPost: XPost = {
                                            id: crypto.randomUUID(),
                                            authorId: 'tmz',
                                            content: `${artistProfile.name} just secret-dropped a new track. Desperation for streams or a genuine surprise? You be the judge. 📉🤭`,
                                            image: artistData.paparazziPhotos.length > 0 ? artistData.paparazziPhotos[Math.floor(Math.random() * artistData.paparazziPhotos.length)].url : undefined,
                                            likes: Math.floor(Math.random() * 40000) + 10000,
                                            retweets: Math.floor(Math.random() * 8000) + 2000,
                                            views: Math.floor(Math.random() * 900000) + 300000,
                                            date: newDate
                                        };
                                        artistData.xPosts.unshift(tmzPost);
                                    }

                                    // Genius offer for single
                                    if (artistProfile) {
                                        const emailId = crypto.randomUUID();
                                        newEmails.push({
                                            id: emailId,
                                            sender: 'Genius',
                                            subject: `Verified Interview for "${songToRelease.title}"?`,
                                            body: `Hey ${artistProfile.name},\n\nWe're big fans of your new single "${songToRelease.title}" over at Genius. We'd love to have you for our 'Verified' series to break down the lyrics and meaning behind the track.\n\nLet us know if you're interested.\n\nBest,\nThe Genius Team`,
                                            date: newDate,
                                            isRead: false,
                                            senderIcon: 'genius',
                                            offer: {
                                                type: 'geniusInterview',
                                                songId: songToRelease.id,
                                                isAccepted: false,
                                                emailId: emailId,
                                            }
                                        });
                                    }
                                }
                            });

                            const releasedSingleIds = new Set(singlesReadyToRelease.map(s => s.songId));
                            sub.singlesToRelease = sub.singlesToRelease?.filter(s => !releasedSingleIds.has(s.songId));
                            subModified = true;
                        }

                        // Check for main project release
                        if (sub.projectReleaseDate && sub.projectReleaseDate.week === newDate.week && sub.projectReleaseDate.year === newDate.year) {
                            const release = sub.release;
                            artistData.releases.push({ 
                                ...release, 
                                releaseDate: newDate, 
                                releasingLabel: releasingLabelInfo, 
                                preorderSales: sub.preorderSales || 0,
                                rightsSoldPercent: rightsSoldPercent > 0 ? rightsSoldPercent : undefined,
                                rightsOwnerLabelId: rightsOwnerLabelId
                            });

                            artistData.merch = artistData.merch.map(m => m.releaseId === release.id ? { ...m, isPreorder: false } : m);

                            artistData.songs = artistData.songs.map(s => {
                                if (release.songIds.includes(s.id)) {
                                    return { 
                                        ...s, 
                                        isReleased: true, 
                                        releaseId: release.id,
                                        rightsSoldPercent: rightsSoldPercent > 0 ? rightsSoldPercent : undefined,
                                        rightsOwnerLabelId: rightsOwnerLabelId 
                                    };
                                }
                                return s;
                            });

                            let hypeIncrease = 0;
                            switch (release.type) {
                                case 'EP': hypeIncrease = 25; break;
                                case 'Album': hypeIncrease = 40; break;
                            }
                            artistData.hype = Math.min(getHypeCap(artistData), artistData.hype + hypeIncrease);

                            if (artistData.contract && (release.type === 'Album' || release.type === 'EP')) {
                                artistData.contract.albumsReleased += 1;
                            }

                            if (!sub.isProjectAnnounced) {
                                const pronounPossessive = artistProfile?.pronouns === 'he/him' ? 'his' : artistProfile?.pronouns === 'she/her' ? 'her' : 'their';
                                const popBasePost: XPost = {
                                    id: crypto.randomUUID(),
                                    authorId: 'popbase',
                                    content: `${artistProfile?.name} has surprise released ${pronounPossessive} new ${release.type} "${release.title}".`,
                                    image: release.coverArt,
                                    likes: Math.floor(Math.random() * 80000) + 30000,
                                    retweets: Math.floor(Math.random() * 20000) + 5000,
                                    views: Math.floor(Math.random() * 1500000) + 500000,
                                    date: newDate
                                };
                                artistData.xPosts.unshift(popBasePost);

                                const tmzPost: XPost = {
                                    id: crypto.randomUUID(),
                                    authorId: 'tmz',
                                    content: `${artistProfile.name} just secret-dropped another project. Desperation for streams or a genuine surprise? You be the judge. 📉🤭`,
                                    image: artistData.paparazziPhotos.length > 0 ? artistData.paparazziPhotos[Math.floor(Math.random() * artistData.paparazziPhotos.length)].url : undefined,
                                    likes: Math.floor(Math.random() * 40000) + 10000,
                                    retweets: Math.floor(Math.random() * 8000) + 2000,
                                    views: Math.floor(Math.random() * 900000) + 300000,
                                    date: newDate
                                };
                                artistData.xPosts.unshift(tmzPost);
                            }

                             // Fallon offer for EP/Album
                            if (artistProfile && (release.type === 'EP' || release.type === 'Album')) {
                                const emailId = crypto.randomUUID();
                                const offerTypes: Array<'performance' | 'interview' | 'both'> = ['performance', 'interview', 'both'];
                                const selectedOfferType = offerTypes[Math.floor(Math.random() * offerTypes.length)];
                                
                                let subject = '';
                                let body = '';
                                switch (selectedOfferType) {
                                    case 'performance':
                                        subject = `Performance on The Tonight Show Starring Jimmy Fallon?`;
                                        body = `Hey ${artistProfile.name},\n\nHuge fans of the new ${release.type.toLowerCase()} "${release.title}"! We'd be thrilled to have you on the show to perform a song from it.\n\nLet us know if you're interested.\n\nBest,\nThe Tonight Show Team`;
                                        break;
                                    case 'interview':
                                        subject = `Interview on The Tonight Show Starring Jimmy Fallon?`;
                                        body = `Hey ${artistProfile.name},\n\nThe new ${release.type.toLowerCase()} "${release.title}" is all anyone's talking about! Jimmy would love to have you on the show for an interview to discuss the project.\n\nLet us know if you're interested.\n\nBest,\nThe Tonight Show Team`;
                                        break;
                                    case 'both':
                                        subject = `Appearance on The Tonight Show Starring Jimmy Fallon?`;
                                        body = `Hey ${artistProfile.name},\n\nCongratulations on the new ${release.type.toLowerCase()} "${release.title}"! The whole office has it on repeat. Jimmy would love to have you on the show for an interview AND a performance.\n\nLet us know if you're interested.\n\nBest,\nThe Tonight Show Team`;
                                        break;
                                }

                                newEmails.push({
                                    id: emailId,
                                    sender: 'The Tonight Show',
                                    subject,
                                    body,
                                    date: newDate,
                                    isRead: false,
                                    senderIcon: 'fallon',
                                    offer: {
                                        type: 'fallonOffer',
                                        releaseId: release.id,
                                        offerType: selectedOfferType,
                                        isAccepted: false,
                                        emailId: emailId,
                                    }
                                });
                            }

                            submissionsToRemove.push(sub.id);
                            subModified = false;
                        }

                        if (subModified) {
                            submissionsToUpdate.push(JSON.parse(JSON.stringify(sub)));
                        }
                    });

                    if (submissionsToUpdate.length > 0) {
                        artistData.labelSubmissions = artistData.labelSubmissions.map(sub =>
                            submissionsToUpdate.find(updated => updated.id === sub.id) || sub
                        );
                    }
                    if (submissionsToRemove.length > 0) {
                        artistData.labelSubmissions = artistData.labelSubmissions.filter(sub => !submissionsToRemove.includes(sub.id));
                    }
                }

                // --- POP BASE INTERVIEW/CLARIFICATION LOGIC ---
                if (Math.random() < 0.3) { // 30% chance for a PopBase email
                    const emailId = crypto.randomUUID();
                    let popBaseEmail: Email;

                    const controversialPaparazzi = artistData.paparazziPhotos.find(p => p.category === 'Scandal');
                    const recentLowScoreRelease = artistData.releases
                        .find(r => r.review && r.review.score < 5 && (newDate.year * 52 + newDate.week) - (r.releaseDate.year * 52 + r.releaseDate.week) <= 4);

                    if (controversialPaparazzi && Math.random() < 0.5) { // 50% chance to be about scandal
                        // Clarification email
                        popBaseEmail = {
                            id: emailId,
                            sender: 'Pop Base',
                            senderIcon: 'popbase',
                            subject: `Clarification needed regarding recent photos`,
                            body: `Hi ${artistProfileForEmail?.name},\n\nWe're reaching out about some recent photos that have been circulating. We'd like to give you an opportunity to address the situation directly.\n\nCould you clarify what was happening in these photos?\n\nBest,\nPop Base Team`,
                            date: newDate,
                            isRead: false,
                            offer: {
                                type: 'popBaseClarification',
                                emailId: emailId,
                                isAnswered: false,
                                originalPostContent: 'recent photos',
                                isControversial: true,
                            }
                        };
                        newEmails.push(popBaseEmail);
                        // Remove photo so it's not asked about again
                        artistData.paparazziPhotos = artistData.paparazziPhotos.filter(p => p.id !== controversialPaparazzi.id);
                    } else if (recentLowScoreRelease && Math.random() < 0.5) {
                        popBaseEmail = {
                            id: emailId,
                            sender: 'Pop Base',
                            senderIcon: 'popbase',
                            subject: `Regarding the reviews for "${recentLowScoreRelease.title}"`,
                            body: `Hi ${artistProfileForEmail?.name},\n\nThe reviews for your latest project "${recentLowScoreRelease.title}" have been quite divisive. We'd like to get your thoughts on the reception.\n\nHow do you feel about the critical response to your new music?\n\nBest,\nPop Base Team`,
                            date: newDate,
                            isRead: false,
                            offer: {
                                type: 'popBaseClarification',
                                emailId: emailId,
                                isAnswered: false,
                                originalPostContent: `the reviews for ${recentLowScoreRelease.title}`,
                                isControversial: true,
                            }
                        };
                        newEmails.push(popBaseEmail);
                    } else {
                        // General interview question
                        const questions = [ `What was the inspiration behind your latest project?`, `Fans are dying to know, are you planning a tour soon?`, `What's your songwriting process like?`, `Are there any artists you're hoping to collaborate with in the future?`, `Your style has evolved so much. What can we expect from your next era?` ];
                        const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
                        const question = pickRandom(questions);

                        popBaseEmail = { id: emailId, sender: 'Pop Base', senderIcon: 'popbase', subject: `Quick Question for Pop Base`, body: `Hi ${artistProfileForEmail?.name},\n\nHope you're doing well! We have a quick question for a piece we're running:\n\n${question}\n\nThanks!\nPop Base Team`, date: newDate, isRead: false, offer: { type: 'popBaseInterview', emailId: emailId, isAnswered: false, question: question, } };
                        newEmails.push(popBaseEmail);
                    }
                }

                // --- GRAMMY SUBMISSION OFFER LOGIC ---
                // This logic sends the yearly email inviting the player to submit for the GRAMMYs.
                // It checks if an email for the current year has already been sent to avoid duplicates.
                const hasGrammyEmailThisYear = artistData.inbox.some(e => 
                    e.offer?.type === 'grammySubmission' && e.date.year === newDate.year
                );

                if (newDate.week === 40 && artistProfileForEmail && !hasGrammyEmailThisYear) {
                    const emailId = crypto.randomUUID();
                    newEmails.push({
                        id: emailId,
                        sender: 'Recording Academy',
                        senderIcon: 'grammys',
                        subject: `Submit Your Music for the ${newDate.year + 1} GRAMMY Awards`,
                        body: `Hi ${artistProfileForEmail.name},\n\nThe submission window for the ${newDate.year + 1} GRAMMY Awards is now open. Please submit your eligible releases from this year for consideration.\n\nSubmissions close in a few weeks.\n\n- The Recording Academy`,
                        date: newDate,
                        isRead: false,
                        offer: {
                            type: 'grammySubmission',
                            emailId: emailId,
                            isSubmitted: false
                        }
                    });
                }
                
                const hasAmaEmailThisYear = artistData.inbox.some(e => 
                    e.offer?.type === 'amaSubmission' && e.date.year === newDate.year
                );

                if (newDate.week === 20 && artistProfileForEmail && !hasAmaEmailThisYear) {
                    const emailId = crypto.randomUUID();
                    newEmails.push({
                        id: emailId,
                        sender: 'American Music Awards',
                        senderIcon: 'amas',
                        subject: `Submit Your Music for the ${newDate.year} American Music Awards`,
                        body: `Hi ${artistProfileForEmail.name},\n\nThe submission window for the ${newDate.year} American Music Awards is now open. Please submit your eligible releases from this year for consideration.\n\nSubmissions close in week 23.\n\n- AMAs`,
                        date: newDate,
                        isRead: false,
                        offer: {
                            type: 'amaSubmission',
                            emailId: emailId,
                            isSubmitted: false
                        }
                    });
                }
                
                if (artistData.fanWarStatus) {
                    artistData.fanWarStatus.weeksRemaining -= 1;
                    if (artistData.fanWarStatus.weeksRemaining <= 0) {
                        artistData.fanWarStatus = null;
                    }
                }

                // --- CERTIFICATION POSTS ---
                if (artistProfile) {
                    const newCertificationPosts: XPost[] = [];
            
                    // Song Certifications
                    artistData.songs = artistData.songs.map(song => {
                        if (!song.isReleased) return song;
            
                        const currentCert = getSongCertification(song.streams);
                        const currentCertString = formatCertification(currentCert);
            
                        if (currentCertString && currentCertString !== song.lastCertification) {
                            const country = Math.random() > 0.5 ? 'UK' : 'US';
                            const postContent = `${artistProfile.name}'s "${song.title}" is now certified ${currentCertString} in the ${country}.`;
                            
                            newCertificationPosts.push({
                                id: crypto.randomUUID(),
                                authorId: 'chartdata',
                                content: postContent,
                                image: song.coverArt,
                                likes: Math.floor(Math.random() * 20000) + 8000,
                                retweets: Math.floor(Math.random() * 5000) + 2000,
                                views: Math.floor(Math.random() * 300000) + 100000,
                                date: newDate,
                            });
            
                            const newCertRecords = [...(song.certifications || [])];
                            newCertRecords.push({ level: currentCertString, date: newDate });
                            return { ...song, lastCertification: currentCertString, certifications: newCertRecords };
                        }
                        return song;
                    });
            
                    // Album Certifications
                    artistData.releases = artistData.releases.map(release => {
                        if (release.type === 'Single') return release;
            
                        const totalStreams = release.songIds.reduce((sum, songId) => {
                            const song = artistData.songs.find(s => s.id === songId);
                            return sum + (song?.streams || 0);
                        }, 0);
                        const units = Math.floor(totalStreams / 1500);
            
                        const currentCert = getAlbumCertification(units);
                        const currentCertString = formatCertification(currentCert);
            
                        if (currentCertString && currentCertString !== release.lastCertification) {
                            const country = Math.random() > 0.5 ? 'UK' : 'US';
                            const postContent = `${artistProfile.name}'s '${release.title}' is now certified ${currentCertString} in the ${country}.`;
            
                            newCertificationPosts.push({
                                id: crypto.randomUUID(),
                                authorId: 'chartdata',
                                content: postContent,
                                image: release.coverArt,
                                likes: Math.floor(Math.random() * 30000) + 12000,
                                retweets: Math.floor(Math.random() * 7000) + 3000,
                                views: Math.floor(Math.random() * 450000) + 150000,
                                date: newDate,
                            });
            
                            const newCertRecords = [...(release.certifications || [])];
                            newCertRecords.push({ level: currentCertString, date: newDate });
                            return { ...release, lastCertification: currentCertString, certifications: newCertRecords };
                        }
                        return release;
                    });
            
                    if (newCertificationPosts.length > 0) {
                        artistData.xPosts.unshift(...newCertificationPosts);
                    }
                }

                if (artistProfile && state.offlineMode) {
                    const playerChartSongs = artistData.songs.map(s => {
                        const chartInfo = state.billboardHot100.find(entry => entry.songId === s.id);
                        return { ...s, chartRank: chartInfo?.rank };
                    });

                    const { newPosts, newUsers, newTrends, newChats, newMessages } = generateWeeklyXContent(artistData, { ...state, date: newDate }, artistProfile.name, playerChartSongs, leakedSongThisWeek);

                    const existingUsernames = new Set(artistData.xUsers.map(u => u.username));
                    const uniqueNewUsers = newUsers.filter(u => !existingUsernames.has(u.username));

                    artistData.xUsers.push(...uniqueNewUsers);
                    
                    // Grow followers for X users
                    const weeklyXPop = artistData.popularity / 100; // 0 to 1
                    artistData.xUsers.forEach(u => {
                        let gain = Math.floor(Math.random() * 20) + 5;
                        if (u.isPlayer) {
                            gain = Math.floor(totalWeeklyStreams / 20000) + Math.floor(weeklyXPop * 5000); 
                        } else if (u.id.includes('fan')) {
                            gain = Math.floor(gain * (1 + weeklyXPop * 50)) + Math.floor(totalWeeklyStreams / 500000);
                        } else if (u.isVerified) {
                            gain = Math.floor(Math.random() * 5000) + 2000;
                        }
                        
                        u.followersCount = (u.followersCount || 0) + gain;
                        
                        // Slowly grow following count for some users
                        if (!u.isVerified && !u.isPlayer && Math.random() > 0.5) {
                            u.followingCount = (u.followingCount || 0) + Math.floor(Math.random() * 3);
                        }
                    });

                    // Grow TikTok followers passively
                    const tikTokPopMult = 1 + (artistData.popularity / 100);
                    const tiktokPassiveGain = Math.floor((totalWeeklyStreams / 15000) * tikTokPopMult) + Math.floor(Math.random() * 50);
                    artistData.tiktokFollowers = (artistData.tiktokFollowers || 0) + tiktokPassiveGain;

                    // Grow Instagram followers passively
                    const instagramPassiveGain = Math.floor((totalWeeklyStreams / 12000) * tikTokPopMult) + Math.floor(Math.random() * 60);
                    artistData.instagramFollowers = (artistData.instagramFollowers || 0) + instagramPassiveGain;


                    artistData.xPosts.unshift(...newPosts);
                    artistData.xTrends = newTrends;

                    // Handle new chats and messages
                    if (newChats.length > 0) {
                        artistData.xChats.push(...newChats);
                    }
                    if (newMessages.length > 0) {
                        newMessages.forEach(({ chatId, message }) => {
                            const chat = artistData.xChats.find(c => c.id === chatId);
                            if (chat) {
                                chat.messages.push(message);
                                chat.isRead = false;
                            }
                        });
                    }

                    // Cap the number of posts to prevent performance degradation over time
                    if (artistData.xPosts.length > 250) {
                        artistData.xPosts = artistData.xPosts.slice(0, 250);
                    }

                    // --- REDDIT LOGIC ---
                    if (!artistData.redditPosts) artistData.redditPosts = [];
                    const numRedditPosts = Math.floor(Math.random() * 3) + 3; // 3-5 posts
                    const newRedditPosts: RedditPost[] = [];
                    
                    const recentSongs = [...artistData.songs].filter(s => s.isReleased).sort((a,b) => (b.releaseDate?.year || 0)*52 + (b.releaseDate?.week || 0) - ((a.releaseDate?.year || 0)*52 + (a.releaseDate?.week || 0)));
                    const topSong = [...artistData.songs].filter(s => s.isReleased).sort((a,b) => (b.streams||0) - (a.streams||0))[0];
                    const recentVideos = [...artistData.videos].filter(v => v.artistId === artistId).sort((a,b) => (b.releaseDate?.year || 0)*52 + (b.releaseDate?.week || 0) - ((a.releaseDate?.year || 0)*52 + (a.releaseDate?.week || 0)));

                    const redditPostTemplates: { title: string, content: string, image?: string|null}[] = [];

                    // Milestone
                    if (topSong) {
                        const streams = topSong.streams || 0;
                        let milestone = 0;
                        if (streams >= 1000000000) milestone = 1000000000;
                        else if (streams >= 500000000) milestone = 500000000;
                        else if (streams >= 100000000) milestone = 100000000;
                        else if (streams >= 10000000) milestone = 10000000;
                        else if (streams >= 1000000) milestone = 1000000;
                        else if (streams >= 100000) milestone = 100000;

                        if (milestone > 0 && Math.random() > 0.3) {
                            redditPostTemplates.push({
                                title: `[Milestone] "${topSong.title}" has officially crossed ${Intl.NumberFormat('en-US', {notation: "compact"}).format(milestone)} streams on Spotify!`,
                                content: `I remember when this first dropped, it's so crazy to see the growth. Congrats ${artistProfileForEmail?.name}!`,
                                image: topSong.coverArt
                            });
                        }
                    }

                    // Recent Song
                    if (recentSongs.length > 0) {
                        const song = recentSongs[0];
                        const pronounPossessive = artistProfileForEmail?.pronouns === 'he/him' ? 'his' : artistProfileForEmail?.pronouns === 'she/her' ? 'her' : 'their';
                        redditPostTemplates.push({
                            title: `Discussion: Thoughts on "${song.title}"?`,
                            content: `Now that it's been out for a bit, how are we feeling about "${song.title}"? Honestly I think it's one of ${pronounPossessive} best tracks. The production is so crisp.`,
                            image: song.coverArt
                        });
                        if (Math.random() > 0.5 && recentSongs.length > 1) {
                            redditPostTemplates.push({
                                title: `Which one do you prefer: "${recentSongs[0].title}" or "${recentSongs[1].title}"?`,
                                content: `Both are absolutely stellar but if you had to pick only one to listen to for the rest of your life... what would you choose?`,
                            });
                        }
                    }

                    // Recent Video
                    if (recentVideos.length > 0 && Math.random() > 0.4) {
                        const vid = recentVideos[0];
                        redditPostTemplates.push({
                            title: `The music video for "${vid.title}" is so underrated.`,
                            content: `I was rewatching the MV today and the visuals are literally insane. Does anyone know who styled this?`,
                            image: vid.thumbnail
                        });
                    }

                    // Generic templates
                    const pronounPossessiveEmail = artistProfileForEmail?.pronouns === 'he/him' ? 'his' : artistProfileForEmail?.pronouns === 'she/her' ? 'her' : 'their';
                    redditPostTemplates.push(
                        { title: `Unpopular opinion about ${artistProfileForEmail?.name}'s latest era`, content: `I might get downvoted for this but honestly I preferred ${pronounPossessiveEmail} earlier sound. Please don't hate me! 😭` },
                        { title: `Manifesting a world tour soon 🕯️`, content: `I've been saving up just in case! Does anyone have any rumors or theories on when dates might drop?` },
                        { title: `What do you think of the recent styling?`, content: `Been seeing some new paparazzi photos and I actually love the fits lately.` }
                    );

                    for (let i = 0; i < numRedditPosts; i++) {
                        const randomTemplate = redditPostTemplates[Math.floor(Math.random() * redditPostTemplates.length)];
                        
                        let img = randomTemplate.image;
                        if (!img && Math.random() > 0.7 && artistData.artistImages.length > 0) {
                            img = artistData.artistImages[Math.floor(Math.random() * artistData.artistImages.length)];
                        } else if (!img && Math.random() > 0.6) {
                            const stanGifs = [
                                'https://media.tenor.com/J1yR7XQh7a8AAAAd/stan-twitter-nicki-minaj.gif',
                                'https://media.tenor.com/B7c908-i1R8AAAAC/stan-twitter-reaction.gif',
                                'https://media.tenor.com/nJ2uUeI_gP4AAAAC/stan-twitter-nicki-minaj.gif',
                                'https://media.tenor.com/mYlC9g-5A9wAAAAC/stan-twitter-reaction.gif',
                                'https://media.tenor.com/AByF925u22UAAAAC/stan-twitter.gif',
                                'https://media.tenor.com/e2oBstC8p50AAAAC/stan-twitter-reaction.gif',
                                'https://media.tenor.com/GzBqN-jRpyoAAAAC/stan-twitter-reaction.gif',
                                'https://media.tenor.com/k6w7100e4AIAAAAC/stan-twitter-reaction.gif',
                                'https://media.tenor.com/K_r9k914_J0AAAAM/new-york-ny-tiffany-pollard.gif',
                                'https://media.tenor.com/xH5-J9A9o_QAAAAC/stan-twitter.gif',
                                'https://media.tenor.com/bO0yN0b2KQsAAAAd/floptok.gif'
                            ];
                            img = stanGifs[Math.floor(Math.random() * stanGifs.length)];
                        }

                        const postUpvotes = Math.floor(Math.random() * (artistData.popularity * 10)) + 50;
                        const postCommentCount = Math.floor(Math.random() * 500) + 10;
                        
                        const realisticComments: RedditComment[] = [];
                        const commentPossibilities = [
                            `Honestly I just hope they keep this energy going.`,
                            `If they release on a Friday they'll easily grab the #1 spot, no contest.`,
                            `I WILL DEFEND ${artistProfileForEmail?.name?.toUpperCase()} WITH MY LIFE.`,
                            `Wait, is this real?? Omggg`,
                            `I really want a tour announcement next!`,
                            `Their growth has been insane to watch as a day 1 fan.`,
                            `Does anyone have a link to the MV outtakes?`,
                            `I disagree but I see your point. We all know they can do better.`,
                            `The vocals on the last chorus are heavenly. 😭`,
                            `The charts don't lie. They're dominating.`,
                            `Are we witnessing a new main pop girl/boy era?`,
                            `They really need to drop a vinyl for this!!`,
                            `This is literally my song of the year.`,
                            `I showed this to my friends and they're obsessed now too.`,
                            `This deserves everything, so proud.`
                        ];
                        
                        const numComments = Math.floor(Math.random() * 5) + 2;
                        for (let j = 0; j < numComments; j++) {
                            const hasReply = Math.random() > 0.6;
                            realisticComments.push({
                                id: crypto.randomUUID(),
                                author: `u/fan_account_${Math.floor(Math.random() * 1000)}`,
                                text: commentPossibilities[Math.floor(Math.random() * commentPossibilities.length)],
                                upvotes: Math.floor(postUpvotes * (Math.random() * 0.2 + 0.05)),
                                timeAgo: `${Math.floor(Math.random() * 12) + 1}h ago`,
                                replies: hasReply ? [{
                                    id: crypto.randomUUID(),
                                    author: `u/reply_guy_${Math.floor(Math.random() * 1000)}`,
                                    text: Math.random() > 0.5 ? `Agreed 100%.` : `Wait rlly? I never thought about it like that.`,
                                    upvotes: Math.floor(Math.random() * 50),
                                    timeAgo: `${Math.floor(Math.random() * 60) + 1}m ago`,
                                }] : undefined
                            });
                        }

                        newRedditPosts.unshift({
                            id: crypto.randomUUID(),
                            author: `pop_fanatic_${Math.floor(Math.random() * 1000)}`,
                            timeAgo: `${Math.floor(Math.random() * 24) + 1} hours ago`,
                            title: randomTemplate.title,
                            content: randomTemplate.content,
                            upvotes: postUpvotes,
                            commentCount: postCommentCount,
                            image: img || null,
                            comments: realisticComments,
                        });
                    }

                    artistData.redditPosts = [...newRedditPosts, ...artistData.redditPosts].slice(0, 50); // Keep max 50 posts

                }
                
                // --- YEAR-END ALBUM CHART TWEET LOGIC ---
                if (newDate.week === 50) {
                    // 1. Gather User Albums from this year
                    const userAlbums = artistData.releases.filter(r => 
                        (r.type === 'Album' || r.type === 'Album (Deluxe)' || r.type === 'EP') &&
                        r.releaseDate.year === newDate.year
                    ).map(album => {
                        // Calculate total streams for the album
                        const streams = album.songIds.reduce((sum, songId) => {
                            const song = artistData.songs.find(s => s.id === songId);
                            return sum + (song?.streams || 0);
                        }, 0);
                        // Simple formula for units: streams / 1500.
                        const units = Math.floor(streams / 1500); 
                        return {
                            title: album.title,
                            artist: artistProfile?.name || 'Unknown',
                            coverArt: album.coverArt,
                            units: units
                        };
                    });

                    // 2. Gather NPC Albums from this year
                    const npcAlbumsThisYear = newNpcAlbums.filter(a => {
                        // newNpcAlbums are added to the top, so we just filter by generated "age" implicitly or we need releaseDate on NPC albums. 
                        // Since we don't store releaseDate on NPC albums explicitly in the type yet, we'll approximate by using the current list 
                        // and assuming ones generated this session belong to "this year". 
                        // A better way: In generateNpcAlbums, we could tag them, but for now let's use a heuristic based on index or assume all current `newNpcAlbums` are recent.
                        return true; // Simplified: Consider all active NPC albums as contenders
                    }).map(album => {
                        // Simulate units for NPC albums. 
                        // We don't track release date perfectly for old ones, but let's assume a random "release week" for simulation.
                        const randomReleaseWeek = Math.floor(Math.random() * 48) + 1;
                        const weeksActive = Math.max(1, 50 - randomReleaseWeek);
                        // Units = salesPotential * weeksActive * variance
                        const variance = 0.8 + Math.random() * 0.4;
                        const units = Math.floor(album.salesPotential * weeksActive * variance);
                        
                        return {
                            title: album.title,
                            artist: album.artist,
                            coverArt: album.coverArt,
                            units: units
                        };
                    });

                    // 3. Combine and Sort
                    const allAlbums = [...userAlbums, ...npcAlbumsThisYear];
                    allAlbums.sort((a, b) => b.units - a.units);
                    const top8 = allAlbums.slice(0, 8);

                    // 4. Create Tweet Payload
                    if (top8.length > 0) {
                        const chartData = JSON.stringify({
                            year: newDate.year,
                            items: top8.map(a => ({
                                title: a.title,
                                artist: a.artist,
                                cover: a.coverArt,
                                units: formatNumber(a.units)
                            }))
                        });

                        artistData.xPosts.unshift({
                            id: crypto.randomUUID(),
                            authorId: 'popbase',
                            content: `Best Selling Albums of ${newDate.year} 🇺🇸`,
                            image: `chart:${chartData}`, // Special prefix to trigger custom rendering
                            likes: Math.floor(Math.random() * 50000) + 20000,
                            retweets: Math.floor(Math.random() * 15000) + 5000,
                            views: Math.floor(Math.random() * 2000000) + 500000,
                            date: newDate
                        });
                    }
                }

                artistData.popularity = Math.max(0, Math.min(100, newPopularity));
                artistData.money = Math.floor(artistData.money + totalIncome);
                artistData.hype = newHype;
                artistData.peakHype = Math.max(artistData.peakHype || 0, newHype);
                artistData.lastFourWeeksStreams = updatedLastFourWeeksStreams;
                artistData.lastFourWeeksViews = updatedLastFourWeeksViews;
                artistData.youtubeSubscribers = newYoutubeSubscribers;
                artistData.youtubeStoreUnlocked = artistData.youtubeStoreUnlocked || newYoutubeSubscribers >= SUBSCRIBER_THRESHOLD_STORE;
                artistData.streamsThisMonth = (newDate.week % 4 === 0) ? 0 : newStreamsThisMonth;
                artistData.viewsThisQuarter = (newDate.week % 13 === 0) ? 0 : newViewsThisQuarter;
                artistData.subsThisQuarter = (newDate.week % 13 === 0) ? 0 : newSubsThisQuarter;
                artistData.performedGigThisWeek = false;
                artistData.inbox.push(...newEmails);
            }

            // --- ATTRIBUTE FEATURE STREAMS TO FEATURED ARTISTS ---
            const featureStreamsMap: Record<string, number> = {};
            for (const outId in updatedArtistsData) {
                updatedArtistsData[outId].songs.forEach(song => {
                    if (song.isReleased && song.collaboration && song.collaboration.artistName) {
                        const featArtist = allPlayerArtistsAndGroups.find(a => a.name === song.collaboration!.artistName);
                        if (featArtist && featArtist.id !== outId) {
                            featureStreamsMap[featArtist.id] = (featureStreamsMap[featArtist.id] || 0) + (song.lastWeekStreams || 0);
                        }
                    }
                });
            }

            for (const featId in featureStreamsMap) {
                const fStreams = featureStreamsMap[featId];
                if (fStreams > 0 && updatedArtistsData[featId]) {
                    const featData = updatedArtistsData[featId];
                    if (featData.lastFourWeeksStreams.length > 0) {
                        featData.lastFourWeeksStreams[0] += fStreams;
                    } else {
                        featData.lastFourWeeksStreams = [fStreams];
                    }
                    
                    const totalStreamsLastMonth = featData.lastFourWeeksStreams.reduce((sum, s) => sum + s, 0);
                    featData.monthlyListeners = Math.floor(totalStreamsLastMonth * 0.1);
                    featData.peakMonthlyListeners = Math.max(featData.monthlyListeners, featData.peakMonthlyListeners || 0);
                    featData.listeningNow = Math.floor(featData.monthlyListeners * (Math.random() * 0.001));
                    featData.saves = Math.floor((featData.saves || 0) + (fStreams / 1000) * (Math.random() * 0.5 + 0.5));
                    featData.followers = (featData.followers || 0) + Math.floor(fStreams / 50000);
                    
                    if (featData.streamsHistory && featData.streamsHistory.length > 0) {
                        featData.streamsHistory[featData.streamsHistory.length - 1].streams += fStreams;
                    }
                    if (newDate.week % 4 !== 0) {
                        featData.streamsThisMonth += fStreams;
                    }
                }
            }

            // --- FEATURE SONG RELEASE LOGIC ---
            const newNpcsWithReleases = [...newNpcsList];
            for (const artistId in updatedArtistsData) {
                const artistData = updatedArtistsData[artistId];
                const activeArtist = allPlayerArtistsAndGroups.find(a => a.id === artistId);
                
                artistData.songs = artistData.songs.map(song => {
                    if (song.isFeatureToNpc && !song.isReleased && song.releaseDate && song.releaseDate.week === newDate.week && song.releaseDate.year === newDate.year) {
                        const newReleaseId = crypto.randomUUID();
                        
                        artistData.releases.push({
                            id: newReleaseId,
                            title: song.title, // "Song Title (feat. Player)"
                            type: 'Single',
                            releaseDate: newDate,
                            songIds: [song.id],
                            coverArt: song.coverArt,
                            artistId,
                            isFeatureToNpc: true,
                            npcArtistName: song.npcArtistName,
                        });

                        if (activeArtist) {
                            const releaseEmail: Email = {
                                id: crypto.randomUUID(),
                                sender: 'Spotify',
                                senderIcon: 'spotify',
                                subject: `New Release: "${song.title}"`,
                                body: `Hi ${activeArtist.name},\n\nYour collaboration with ${song.npcArtistName}, "${song.title}", has been released today!\n\nIt is now available on your Spotify profile.\n\n- The Spotify Team`,
                                date: newDate,
                                isRead: false,
                                offer: {
                                    type: 'featureRelease',
                                    songTitle: song.title,
                                    npcArtistName: song.npcArtistName || 'Another Artist',
                                }
                            };
                            artistData.inbox.push(releaseEmail);
                        }
                        return { ...song, isReleased: true, releaseId: newReleaseId };
                    } else if (song.isFeatureToNpc && song.isReleased && song.releaseDate) {
                        const weeksSinceRelease = (newDate.year * 52 + newDate.week) - (song.releaseDate.year * 52 + song.releaseDate.week);
                        
                        if (weeksSinceRelease === 1) {
                            // 75% chance to be offered a music video
                            if (Math.random() < 0.75) {
                                if (activeArtist) {
                                    const offerEmail: Email = {
                                        id: crypto.randomUUID(),
                                        sender: song.npcArtistName || 'Management',
                                        senderIcon: 'default',
                                        subject: `Music Video: ${song.title}`,
                                        body: `Hey ${activeArtist.name},\n\n"${song.title}" is doing well! We are planning to shoot an official music video for it. Do you want to be part of the shoot and handle the thumbnail upload?\n\n- ${song.npcArtistName}`,
                                        date: newDate,
                                        isRead: false,
                                        offer: {
                                            type: 'featureVideoOffer',
                                            songId: song.id,
                                            npcArtistName: song.npcArtistName || 'Another Artist',
                                        }
                                    };
                                    artistData.inbox.push(offerEmail);
                                }
                            }
                        }
                    }
                    return song;
                });
            }

            // --- CHART CALCULATION ---
            const allPlayerSongsFlat = Object.values(updatedArtistsData).flatMap(d => d.songs);
            const allPlayerReleases = Object.values(updatedArtistsData).flatMap(d => d.releases);

            const basePlayerSongs = allPlayerSongsFlat.filter(song => song.isReleased && !song.remixOfSongId);

            const playerChartContenders = basePlayerSongs.map(baseSong => {
                const artist = allPlayerArtistsAndGroups.find(a => a.id === baseSong.artistId);
                
                let totalWeeklyStreams = baseSong.lastWeekStreams;
                const remixes = allPlayerSongsFlat.filter(s => s.isReleased && s.remixOfSongId === baseSong.id);
                remixes.forEach(remix => {
                    totalWeeklyStreams += remix.lastWeekStreams;
                });

                let displayTitle = baseSong.title;
                let displayArtist = artist?.name || 'Unknown';
                
                const escapeRegExp = (string: string) => {
                  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
                };

                if (baseSong.collaboration) {
                    displayArtist = `${displayArtist}, ${baseSong.collaboration.artistName}`;
                    displayTitle = displayTitle.replace(new RegExp(`\\s*\\(feat\\.\\s*${escapeRegExp(baseSong.collaboration.artistName)}\\)`, 'i'), '');
                } else if (baseSong.isFeatureToNpc && baseSong.npcArtistName) {
                    displayArtist = `${baseSong.npcArtistName}, ${artist?.name}`;
                    displayTitle = displayTitle.replace(new RegExp(`\\s*\\(feat\\.\\s*${escapeRegExp(artist?.name || '')}\\)`, 'i'), '');
                }

                return {
                    uniqueId: baseSong.id, title: displayTitle, artist: displayArtist,
                    weeklyStreams: totalWeeklyStreams, isPlayerSong: true, coverArt: baseSong.coverArt, songId: baseSong.id,
                    genre: baseSong.genre,
                    itunesPrice: baseSong.itunesPrice
                }
            });
            
            const npcChartContenders = state.offlineMode ? newNpcsWithReleases.map(npc => ({
                uniqueId: npc.uniqueId, title: npc.title, artist: npc.artist,
                weeklyStreams: Math.floor(npc.basePopularity * (Math.random() * 0.4 + 0.8)),
                isPlayerSong: false, coverArt: npc.coverArt || `https://ui-avatars.com/api/?name=${encodeURIComponent(npc.artist)}&background=random&color=fff&size=250`, songId: undefined,
                genre: npc.genre
            })) : [];

            // Add online songs
            const onlineChartContenders = (!state.offlineMode && state.onlineSongs) ? state.onlineSongs.filter((s: any) => s.isReleased).map((s: any) => ({
                uniqueId: s.id || crypto.randomUUID(), title: s.title, artist: s.artistName || 'Unknown Online Artist',
                weeklyStreams: s.lastWeekStreams || 0,
                isPlayerSong: false, // We treat them as non-player conceptually for UI highlighting unless it happens to be the player's own synced song via their ID
                coverArt: s.coverArt || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.artistName || 'Unknown')}&background=random&color=fff&size=250`, songId: s.id,
                genre: s.genre || 'Pop',
                itunesPrice: s.itunesPrice || 0.99
            })) : [];

            let allContenders: any[] = [];
            if (!state.offlineMode) {
                // Online Mode: use ONLY online songs exactly as they are from the server.
                allContenders = onlineChartContenders.map(oc => ({
                    ...oc,
                    isPlayerSong: playerChartContenders.some(pc => pc.songId === oc.songId)
                }));
                allContenders.sort((a, b) => b.weeklyStreams - a.weeklyStreams);
            } else {
                // Offline Mode: Combine and use local Math.random logic
                const filteredOnlineContenders = onlineChartContenders.filter(oc => !playerChartContenders.some(pc => pc.songId === oc.songId));
                allContenders = [...playerChartContenders, ...npcChartContenders, ...filteredOnlineContenders];
                allContenders.sort((a, b) => b.weeklyStreams - a.weeklyStreams);
            }

            const newChartHistory: ChartHistory = { ...state.chartHistory };

            let hot100Contenders = [];
            if (!state.offlineMode) {
                // Online Mode: Purely stream-based hierarchy from the unified online state
                hot100Contenders = allContenders.map(song => {
                    return { ...song, hot100Points: song.weeklyStreams };
                });
            } else {
                hot100Contenders = allContenders.map(song => {
                    const hash = song.uniqueId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                    const divisor = 750 + (hash % 250);
                    
                    let boost = 1;
                    if (song.isPlayerSong && song.songId) {
                        for (const artistId in updatedArtistsData) {
                            const aData = updatedArtistsData[artistId];
                            const s = aData.songs.find(x => x.id === song.songId);
                            if (s) {
                                const pushWeek = aData.lastPushToItunesWeek;
                                const currentWeek = newDate.year * 52 + newDate.week;
                                if (aData.lastPushedSongId === song.songId && pushWeek && currentWeek - pushWeek <= 1) {
                                    boost = (5 + Math.random() * 5);
                                }
                                if (s.itunesPrice === '$0.69') {
                                    boost *= 2.5;
                                } else if (s.itunesPrice === '$0.99') {
                                    boost *= 1.5;
                                } else if (s.itunesPrice === '$1.29') {
                                    boost *= 0.9;
                                }
                                break;
                            }
                        }
                    }
                    const sales = Math.floor(song.weeklyStreams / divisor) * boost;
                    
                    let points = (song.weeklyStreams * 0.5) + (sales * 150 * 0.5);
                    points += (Math.random() * 20 - 10);
                    
                    return { ...song, hot100Points: points };
                });
            }
            hot100Contenders.sort((a, b) => b.hot100Points - a.hot100Points);

            const eligibleBillboardContenders = hot100Contenders.filter((song, index) => {
                const potentialRank = index + 1;
                const history = state.chartHistory[song.uniqueId];
                if (history && history.weeksOnChart >= 52 && potentialRank > 25) return false;
                if (history && history.weeksOnChart >= 20 && potentialRank > 50) return false;
                return true;
            });

            const top100 = eligibleBillboardContenders.slice(0, 100);
            const newBillboardHot100: ChartEntry[] = [];
            const prevBillboardMap = new Map(state.billboardHot100.map(entry => [entry.uniqueId, entry]));

            top100.forEach((song, index) => {
                const rank = index + 1;
                const history = newChartHistory[song.uniqueId];
                const prevChartEntry = prevBillboardMap.get(song.uniqueId);

                if (history) {
                    history.weeksOnChart += 1;
                    history.lastRank = rank;
                    if (rank < history.peak) history.peak = rank;
                    if (rank === 1) {
                        history.weeksAtNo1 = (history.weeksAtNo1 || 0) + 1;
                    }
                } else {
                    newChartHistory[song.uniqueId] = { weeksOnChart: 1, peak: rank, lastRank: rank, weeksAtNo1: rank === 1 ? 1 : 0 };
                }
                
                newBillboardHot100.push({
                    rank: rank, lastWeek: prevChartEntry?.rank ?? null, peak: newChartHistory[song.uniqueId].peak,
                    weeksOnChart: newChartHistory[song.uniqueId].weeksOnChart, title: song.title, artist: song.artist,
                    coverArt: song.coverArt, isPlayerSong: song.isPlayerSong, songId: song.songId,
                    uniqueId: song.uniqueId, weeklyStreams: song.weeklyStreams,
                });
            });

            const artistsWithFirstChartEntry = new Set<string>();

            for (const entry of newBillboardHot100) {
                if (entry.isPlayerSong && entry.songId) {
                    const song = allPlayerSongsFlat.find(s => s.id === entry.songId);
                    if (song && playerArtistIds.has(song.artistId) && !artistsWithFirstChartEntry.has(song.artistId)) {
                        const artistData = updatedArtistsData[song.artistId];
                        if (artistData && !artistData.firstChartEntry) {
                            if (entry.weeksOnChart === 1) {
                                artistData.firstChartEntry = {
                                    songTitle: entry.title,
                                    rank: entry.rank,
                                    date: newDate,
                                };
                                artistsWithFirstChartEntry.add(song.artistId);
                            }
                        }
                    }
                }
            }
            
            const spotifyLocalTop = allContenders.slice(0, 100);
            const newSpotifyGlobal: ChartEntry[] = [];
            const prevSpotifyMap = new Map(state.spotifyGlobal.map(entry => [entry.uniqueId, entry.rank]));
            let newEntriesCount = 0;
            
            spotifyLocalTop.forEach((song, index) => {
                const rank = index + 1;
                const lastWeekRank = prevSpotifyMap.get(song.uniqueId) ?? null;
                if (lastWeekRank === null) newEntriesCount++;
                newSpotifyGlobal.push({
                    rank: rank, lastWeek: lastWeekRank, peak: newChartHistory[song.uniqueId]?.peak ?? rank,
                    weeksOnChart: newChartHistory[song.uniqueId]?.weeksOnChart ?? 1, title: song.title, artist: song.artist,
                    coverArt: song.coverArt, isPlayerSong: song.isPlayerSong, songId: song.songId,
                    uniqueId: song.uniqueId, weeklyStreams: song.weeklyStreams,
                });
            });

            // --- GENRE CHART CALCULATION ---
            const { newChart: newHotPopSongs, newHistory: newHotPopSongsHistory } = calculateGenreChart(
                allContenders, ['Pop'], state.hotPopSongs, state.hotPopSongsHistory
            );
            const { newChart: newHotRapRnb, newHistory: newHotRapRnbHistory } = calculateGenreChart(
                allContenders, ['Hip Hop', 'R&B'], state.hotRapRnb, state.hotRapRnbHistory
            );
            const { newChart: newElectronicChart, newHistory: newElectronicChartHistory } = calculateGenreChart(
                allContenders, ['Electronic'], state.electronicChart, state.electronicChartHistory
            );
            const { newChart: newCountryChart, newHistory: newCountryChartHistory } = calculateGenreChart(
                allContenders, ['Country'], state.countryChart, state.countryChartHistory
            );

            // --- ALBUM CHART CALCULATION ---
            const releaseRawStreams = new Map<string, number>();
            allPlayerReleases.filter(r => r.type === 'EP' || r.type === 'Album' || r.type === 'Album (Deluxe)' || r.type === 'Compilation').forEach(release => {
                const artistData = updatedArtistsData[release.artistId];
                let rawStreams = 0;
                release.songIds.forEach(songId => {
                    const song = artistData.songs.find(s => s.id === songId);
                    if (song) {
                        rawStreams += song.lastWeekStreams || 0;
                        const remixes = artistData.songs.filter(s => s.isReleased && s.remixOfSongId === song.id);
                        remixes.forEach(remix => { rawStreams += remix.lastWeekStreams || 0; });
                    }
                });
                releaseRawStreams.set(release.id, rawStreams);
            });

            const playerAlbumContenders = allPlayerReleases
                .filter(r => r.type === 'EP' || r.type === 'Album' || r.type === 'Album (Deluxe)' || r.type === 'Compilation')
                .map(release => {
                    const artist = allPlayerArtistsAndGroups.find(a => a.id === release.artistId);
                    const artistData = updatedArtistsData[release.artistId];

                    const totalWeeklyStreams = release.songIds.reduce((sum, songId) => {
                        const song = artistData.songs.find(s => s.id === songId);
                        let songStreams = song?.lastWeekStreams || 0;
                        
                        // Add streams from remixes of this song
                        if (song) {
                            const remixes = artistData.songs.filter(s => s.isReleased && s.remixOfSongId === song.id);
                            remixes.forEach(remix => {
                                songStreams += remix.lastWeekStreams;
                            });
                        }

                        // Check if this song is on a "larger" release
                        const otherReleases = allPlayerReleases.filter(r => r.artistId === release.artistId && (r.type === 'EP' || r.type === 'Album' || r.type === 'Album (Deluxe)' || r.type === 'Compilation') && r.songIds.includes(songId));
                        const thisRaw = releaseRawStreams.get(release.id) || 0;
                        const bestRelease = otherReleases.reduce((best, r) => {
                            const raw = releaseRawStreams.get(r.id) || 0;
                            // If there's a tie, prioritize standard albums/EPs over compilations for fairness, or simply higher ID to be deterministic
                            if (raw > best.raw) return { id: r.id, raw };
                            return best;
                        }, { id: release.id, raw: thisRaw });

                        if (bestRelease.id !== release.id) {
                            return sum; // Streams are credited to the larger release
                        }

                        return sum + songStreams;
                    }, 0);

                    const albumMerch = artistData.merch.filter(m => m.releaseId === release.id);
                    let totalWeeklySales = albumMerch.reduce((sum, item) => {
                        const weeklySales = artistData.youtubeStoreUnlocked ? Math.floor((artistData.youtubeSubscribers / 50000) * (Math.random() * 5 + 1)) : 0;
                        return sum + weeklySales;
                    }, 0);

                    // Inject accumulated preorder sales on the first charting week
                    if ((newDate.year * 52 + newDate.week) - (release.releaseDate.year * 52 + release.releaseDate.week) === 1) {
                        totalWeeklySales += (release.preorderSales || 0);
                    }

                    const weeklyActivity = Math.floor(totalWeeklyStreams / 1500) + totalWeeklySales;
                    const labelName = release.releasingLabel ? release.releasingLabel.name : 'Independent';

                    return {
                        uniqueId: release.id,
                        title: release.title,
                        artist: artist?.name || 'Unknown',
                        label: labelName,
                        coverArt: release.coverArt,
                        isPlayerAlbum: true,
                        albumId: release.id,
                        weeklyActivity,
                        weeklySales: totalWeeklySales,
                    };
                });

            const npcAlbumContenders = state.offlineMode ? newNpcAlbums.map(album => {
                const albumSongs = album.songIds.map(id => newNpcsWithReleases.find(s => s.uniqueId === id)).filter(Boolean);
                
                const totalWeeklyStreams = albumSongs.reduce((sum, song) => {
                    if (!song) return sum;
                    return sum + Math.floor(song.basePopularity * (Math.random() * 0.4 + 0.8));
                }, 0);

                const streamActivity = Math.floor(totalWeeklyStreams / 1500);
                // Use the sales potential to guarantee higher chart positions
                // Sales potential (14k+) ensures chart relevance.
                // Vary sales weekly by +/- 10%
                const variance = 0.9 + (Math.random() * 0.2); 
                const weeklySales = Math.floor((album.salesPotential || 1000) * variance);
                
                const weeklyActivity = streamActivity + weeklySales;

                return {
                    uniqueId: album.uniqueId,
                    title: album.title,
                    artist: album.artist,
                    label: album.label,
                    coverArt: album.coverArt,
                    isPlayerAlbum: false,
                    albumId: album.uniqueId,
                    weeklyActivity,
                    weeklySales,
                };
            }) : [];

            // Add online albums
            const onlineAlbumContenders = (!state.offlineMode && state.onlineAlbums) ? state.onlineAlbums.map((a: any) => ({
                uniqueId: a.id || crypto.randomUUID(),
                title: a.title,
                artist: a.artistName || 'Unknown',
                label: a.releasingLabel?.name || 'Independent',
                coverArt: a.coverArt || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.artistName || 'Unknown')}&background=random&color=fff&size=250`,
                isPlayerAlbum: false,
                albumId: a.id,
                weeklyActivity: a.weeklySales || 0,
                weeklySales: a.weeklySales || 0,
            })) : [];
            
            let allAlbumContenders: any[] = [];
            if (!state.offlineMode) {
                allAlbumContenders = onlineAlbumContenders.map((oc: any) => ({
                    ...oc,
                    isPlayerAlbum: playerAlbumContenders.some(pa => pa.albumId === oc.albumId)
                }));
            } else {
                const filteredOnlineAlbumContenders = onlineAlbumContenders.filter(oa => !playerAlbumContenders.some(pa => pa.albumId === oa.albumId));
                allAlbumContenders = [...playerAlbumContenders, ...npcAlbumContenders, ...filteredOnlineAlbumContenders];
            }
            allAlbumContenders.sort((a, b) => b.weeklyActivity - a.weeklyActivity);

            const top50Albums = allAlbumContenders.slice(0, 50);
            const newAlbumChartHistory: ChartHistory = { ...state.albumChartHistory };
            const newBillboardTopAlbums: AlbumChartEntry[] = [];
            const prevBillboardAlbumsMap = new Map(state.billboardTopAlbums.map(entry => [entry.uniqueId, entry]));

            top50Albums.forEach((album, index) => {
                const rank = index + 1;
                const history = newAlbumChartHistory[album.uniqueId];
                const prevChartEntry = prevBillboardAlbumsMap.get(album.uniqueId);

                if (history) {
                    history.weeksOnChart += 1;
                    history.lastRank = rank;
                    if (rank < history.peak) history.peak = rank;
                    if (rank === 1) {
                        history.weeksAtNo1 = (history.weeksAtNo1 || 0) + 1;
                    }
                } else {
                    newAlbumChartHistory[album.uniqueId] = { weeksOnChart: 1, peak: rank, lastRank: rank, weeksAtNo1: rank === 1 ? 1 : 0 };
                }

                newBillboardTopAlbums.push({
                    rank,
                    lastWeek: prevChartEntry?.rank ?? null,
                    peak: newAlbumChartHistory[album.uniqueId].peak,
                    weeksOnChart: newAlbumChartHistory[album.uniqueId].weeksOnChart,
                    title: album.title,
                    artist: album.artist,
                    label: album.label,
                    coverArt: album.coverArt,
                    isPlayerAlbum: album.isPlayerAlbum,
                    albumId: album.albumId,
                    uniqueId: album.uniqueId,
                    weeklyActivity: album.weeklyActivity,
                    weeklySales: album.weeklySales,
                });
            });

            // --- NPC Pop Base #1 Debut Posts ---
            const npcPopBasePosts: XPost[] = [];
            const hot100One = newBillboardHot100[0];
            const topAlbumsOne = newBillboardTopAlbums[0];

            if (hot100One && hot100One.lastWeek === null && !hot100One.isPlayerSong) {
                npcPopBasePosts.push({
                    id: crypto.randomUUID(), authorId: 'popbase',
                    content: `"${hot100One.title}" by ${hot100One.artist} debuts at #1 on the Billboard Hot 100.`,
                    image: hot100One.coverArt,
                    likes: Math.floor(Math.random() * 80000) + 30000,
                    retweets: Math.floor(Math.random() * 20000) + 5000,
                    views: Math.floor(Math.random() * 1500000) + 500000,
                    date: newDate
                });
            }

            if (topAlbumsOne && topAlbumsOne.lastWeek === null && !topAlbumsOne.isPlayerAlbum) {
                const units = formatNumber(Math.floor(topAlbumsOne.weeklyActivity));
                // If it's a huge number like 1.2M, formatNumber returns "1.2M". If it's 300000, it might return "300000".
                // Wait, formatNumber has T and B and M and K.
                let unitStr = units;
                if (topAlbumsOne.weeklyActivity >= 1000 && topAlbumsOne.weeklyActivity < 1000000) {
                   unitStr = (topAlbumsOne.weeklyActivity / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
                }
                
                npcPopBasePosts.push({
                    id: crypto.randomUUID(), authorId: 'popbase',
                    content: `${topAlbumsOne.title} debuts #1 on the Billboard 200 with ${unitStr} units.`,
                    image: topAlbumsOne.coverArt,
                    likes: Math.floor(Math.random() * 80000) + 30000,
                    retweets: Math.floor(Math.random() * 20000) + 5000,
                    views: Math.floor(Math.random() * 1500000) + 500000,
                    date: newDate
                });
            }

            if (npcPopBasePosts.length > 0) {
                Object.values(updatedArtistsData).forEach(d => {
                    d.xPosts.unshift(...npcPopBasePosts);
                    if (d.xPosts.length > 250) {
                        d.xPosts = d.xPosts.slice(0, 250);
                    }
                });
            }
            
            // --- AWARDS LOGIC ---
            let finalState: GameState = { ...state };
            
            // --- OSCARS LOGIC ---
            let newOscarNominations: GameState['oscarCurrentYearNominations'] = state.oscarCurrentYearNominations;
            
            // --- Spotify Snapshot Posts ---
            const snapshotCandidates: { artistId: string; post: XPost; streams: number }[] = [];

            for (const artistId in updatedArtistsData) {
                const artistData = updatedArtistsData[artistId];
                const artistProfile = allPlayerArtistsAndGroups.find(a => a.id === artistId);
                
                // For songs
                artistData.songs.forEach(song => {
                    const isEligible = song.isReleased && song.lastWeekStreams >= 100000 && !song.remixOfSongId;
                    if (isEligible && song.lastWeekStreams > (song.peakWeeklyStreams || 0)) {
                        // Generate daily streams mockup
                        const dailyStreams = [];
                        let remain = song.lastWeekStreams;
                        for(let i=0; i<6; i++) {
                            const val = Math.floor(song.lastWeekStreams / 7 * (0.8 + Math.random() * 0.4));
                            dailyStreams.push(val);
                            remain -= val;
                        }
                        dailyStreams.push(Math.max(0, remain));
                        
                        const jsonStr = JSON.stringify({
                            type: 'song',
                            songName: song.title,
                            artistName: artistProfile?.name || 'Unknown',
                            coverArt: song.coverArt,
                            streams: song.lastWeekStreams,
                            totalStreams: song.streams,
                            dailyStreams: dailyStreams,
                            date: newDate,
                        });

                        snapshotCandidates.push({
                            artistId,
                            streams: song.lastWeekStreams,
                            post: {
                                id: crypto.randomUUID(), authorId: 'spotifysnapshot',
                                content: `🏆 "${song.title}" by ${artistProfile?.name} has earned its BEST WEEK EVER on Spotify!`,
                                image: `snapshot:${jsonStr}`,
                                likes: Math.floor(Math.random() * 50000) + 10000,
                                retweets: Math.floor(Math.random() * 10000) + 2000,
                                views: Math.floor(Math.random() * 1000000) + 200000,
                                date: newDate
                            }
                        });
                        
                        song.peakWeeklyStreams = song.lastWeekStreams;
                    }
                });

                // For albums
                artistData.releases.filter(r => r.type === 'Album' || r.type === 'EP' || r.type === 'Album (Deluxe)' || r.type === 'Compilation').forEach(release => {
                    const albumSongs = release.songIds.map(id => artistData.songs.find(s => s.id === id)).filter((s): s is Song => !!s);
                    const weeklyAlbumStreams = albumSongs.reduce((sum, s) => sum + s.lastWeekStreams, 0);
                    
                    if (release.isReleased && weeklyAlbumStreams >= 500000 && weeklyAlbumStreams > (release.peakWeeklyStreams || 0)) {
                        const tracks = albumSongs.map(s => ({
                           title: s.title,
                           totalStreams: s.streams,
                           dailyStreams: s.lastWeekStreams, 
                        }));
                        
                        const jsonStr = JSON.stringify({
                            type: 'album',
                            albumName: release.title,
                            artistName: artistProfile?.name || 'Unknown',
                            coverArt: release.coverArt,
                            streams: weeklyAlbumStreams,
                            totalStreams: albumSongs.reduce((sum, s) => sum + s.streams, 0),
                            tracks: tracks,
                            date: newDate,
                        });

                        snapshotCandidates.push({
                            artistId,
                            streams: weeklyAlbumStreams,
                            post: {
                                id: crypto.randomUUID(), authorId: 'spotifysnapshot',
                                content: `🏆 "${release.title}" by ${artistProfile?.name} has earned its BEST WEEK EVER on Spotify!`,
                                image: `snapshot:${jsonStr}`,
                                likes: Math.floor(Math.random() * 80000) + 20000,
                                retweets: Math.floor(Math.random() * 15000) + 3000,
                                views: Math.floor(Math.random() * 1500000) + 300000,
                                date: newDate
                            }
                        });
                        
                        release.peakWeeklyStreams = weeklyAlbumStreams;
                    }
                });
            }

            // Cap Snapshot posts top 3 per week
            snapshotCandidates.sort((a, b) => b.streams - a.streams);
            snapshotCandidates.slice(0, 3).forEach(candidate => {
                if (updatedArtistsData[candidate.artistId]) {
                    updatedArtistsData[candidate.artistId].xPosts.unshift(candidate.post);
                }
            });

            // Week 1: Oscar Submission Email & Pop Crave Logic
            if (newDate.week === 1) {
                // 50% chance to create Pop Crave account each year if it doesn't exist
                for (const artistId in updatedArtistsData) {
                    const artistData = updatedArtistsData[artistId];
                    if (!artistData.xUsers.some(u => u.id === 'popcrave') && Math.random() < 0.5) {
                        artistData.xUsers.push({
                            id: 'popcrave', name: 'Pop Crave', username: 'PopCrave',
                            avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHJ4PSI4IiBmaWxsPSIjMkIzRUREIi8+PHBhdGggZD0iTTI0IDIwaDE2djI0SDI0VjIweiIgZmlsbD0iI0ZGRiIvPjwvc3ZnPg==',
                            isVerified: true, bio: 'Trending news and celebrity gossip.',
                            followersCount: 1550000, followingCount: 0,
                        });
                    }
                }

                for (const artistId in updatedArtistsData) {
                    const artistData = updatedArtistsData[artistId];
                    const artistProfile = allPlayerArtistsAndGroups.find(a => a.id === artistId);
                    const hasOscarEmailThisYear = artistData.inbox.some(e => e.offer?.type === 'oscarSubmission' && e.date.year === newDate.year);
                    
                    if (artistProfile && !hasOscarEmailThisYear) {
                        const eligibleSongs = artistData.songs.filter(s => {
                            const release = artistData.releases.find(r => r.id === s.releaseId);
                            return s.soundtrackTitle && release && release.releaseDate.year === newDate.year - 1;
                        });

                        if (eligibleSongs.length > 0) {
                            const emailId = crypto.randomUUID();
                            artistData.inbox.push({
                                id: emailId,
                                sender: 'The Academy',
                                senderIcon: 'oscars',
                                subject: `Submit for the ${newDate.year} Academy Awards`,
                                body: `Hi ${artistProfile.name},\n\nThe submission window for Best Original Song at the ${newDate.year} Academy Awards is open. Please submit your eligible soundtrack releases from last year.\n\n- The Academy of Motion Picture Arts and Sciences`,
                                date: newDate,
                                isRead: false,
                                offer: { type: 'oscarSubmission', emailId, isSubmitted: false }
                            });
                        }
                    }
                }
            }
            
            // Week 5: Determine Oscar Nominations
            if (newDate.week === 5 && state.oscarSubmissions.length > 0) {
                const categoryName = 'Best Original Song';
                const contenders: OscarContender[] = [];

                // Player contenders
                for (const sub of state.oscarSubmissions) {
                    const artistData = updatedArtistsData[sub.artistId];
                    const artistProfile = allPlayerArtistsAndGroups.find(a => a.id === sub.artistId);
                    const song = artistData.songs.find(s => s.id === sub.itemId);
                    if (artistData && artistProfile && song) {
                        const score = (song.quality * 3) + (song.streams / 1000000);
                        contenders.push({ id: song.id, name: song.title, artistName: artistProfile.name, isPlayer: true, score, coverArt: song.coverArt });
                    }
                }

                // NPC contenders
                const npcSongsForOscars = [...newNpcsList].sort((a,b) => b.basePopularity - a.basePopularity).slice(0, 10);
                npcSongsForOscars.forEach(song => {
                    contenders.push({ id: song.uniqueId, name: song.title, artistName: song.artist, isPlayer: false, score: (song.basePopularity / 100000) * 1.5, coverArt: song.coverArt || `https://ui-avatars.com/api/?name=${encodeURIComponent(song.artist)}&background=random&color=fff&size=250` });
                });

                contenders.sort((a,b) => b.score - a.score);
                const nominees = contenders.slice(0, 5);

                if (nominees.length > 0) {
                    newOscarNominations = [{ name: categoryName, nominees, winner: nominees[0] }];
                    finalState.oscarCurrentYearNominations = newOscarNominations;
                    
                    const playerNominee = nominees.find(n => n.isPlayer);
                    if (playerNominee) {
                        const artistData = updatedArtistsData[playerNominee.artistName === state.soloArtist?.name ? state.soloArtist.id : state.group!.id];
                        const artistProfile = allPlayerArtistsAndGroups.find(a => a.name === playerNominee.artistName);

                        if(artistData && artistProfile) {
                            artistData.popularity = Math.min(100, artistData.popularity + 5);
                            const hasPerformanceOffer = Math.random() < 0.5;
                            let body = `Dear ${artistProfile.name},\n\nCongratulations! The Academy is pleased to announce your nomination for Best Original Song for "${playerNominee.name}".`;
                            if (hasPerformanceOffer) {
                                body += `\n\nAdditionally, we would be honored to have you perform at the ceremony. Please respond to accept.`;
                            }
                            body += `\n\nSincerely,\nThe Academy`;
                            const emailId = crypto.randomUUID();
                            artistData.inbox.push({
                                id: emailId, sender: 'The Academy', senderIcon: 'oscars', subject: 'Congratulations! You\'re an Oscar Nominee!',
                                body, date: newDate, isRead: false, offer: { type: 'oscarNominations', emailId, hasPerformanceOffer }
                            });
                        }
                    }

                    let postContent = `The nominees for Best Original Song at the ${newDate.year} #Oscars have been announced:\n\n`;
                    postContent += nominees.map(n => `• ${n.isPlayer ? `**${n.name}**` : n.name} (${n.artistName})`).join('\n');
                    Object.values(updatedArtistsData).forEach(d => d.xPosts.unshift({
                        id: crypto.randomUUID(), authorId: 'popbase', content: postContent,
                        likes: Math.floor(Math.random() * 60000) + 30000, retweets: Math.floor(Math.random() * 15000) + 7000,
                        views: Math.floor(Math.random() * 2000000) + 800000, date: newDate,
                    }));
                }
                
                // Send Red Carpet invites
                allPlayerArtistsAndGroups.forEach(artistProfile => {
                    const artistData = updatedArtistsData[artistProfile.id];
                    if (artistData) {
                        const isNominated = newOscarNominations?.some(cat => cat.nominees.some(n => n.isPlayer && n.artistName === artistProfile.name));
                        if (isNominated || artistData.popularity >= 80) {
                            const redCarpetEmailId = crypto.randomUUID();
                            const reasonText = isNominated
                                ? `Because of your nomination`
                                : `Due to your undeniable impact on pop culture this year`;

                            artistData.inbox.push({
                                id: redCarpetEmailId,
                                sender: 'The Academy',
                                senderIcon: 'oscars',
                                subject: 'Invitation: Oscars Red Carpet',
                                body: `Dear ${artistProfile.name},\n\n${reasonText}, we would be honored to have you attend the ${newDate.year} Oscars and walk the red carpet.\n\nPlease accept this invitation by sharing your look for the evening.\n\nSincerely,\nThe Academy`,
                                date: newDate,
                                isRead: false,
                                offer: { type: 'oscarRedCarpet', emailId: redCarpetEmailId }
                            });
                        }
                    }
                });
            }

            // Week 10: Oscar Ceremony
            if (newDate.week === 10 && state.oscarCurrentYearNominations) {
                const category = state.oscarCurrentYearNominations[0];
                if (category.winner) {
                     const winner = category.winner;
                     const content = `The Oscar for Best Original Song goes to... "${winner.name}" by ${winner.artistName}! #Oscars`;
                     Object.values(updatedArtistsData).forEach(d => d.xPosts.unshift({
                        id: crypto.randomUUID(), authorId: 'popbase', content, image: winner.coverArt,
                        likes: Math.floor(Math.random() * 100000) + 50000, retweets: Math.floor(Math.random() * 20000) + 10000,
                        views: Math.floor(Math.random() * 5000000) + 2000000, date: newDate,
                     }));
                }

                for (const artistId in updatedArtistsData) {
                    const artistData = updatedArtistsData[artistId];
                    const artistProfile = allPlayerArtistsAndGroups.find(a => a.id === artistId);
                    const nomination = category.nominees.find(n => n.isPlayer && n.artistName === artistProfile?.name);
                    if (nomination) {
                        const isWinner = category.winner?.id === nomination.id;
                        if(isWinner) artistData.popularity = Math.min(100, artistData.popularity + 10);
                        artistData.oscarHistory.push({
                            year: newDate.year, category: 'Best Original Song', itemId: nomination.id,
                            itemName: nomination.name, artistName: nomination.artistName, isWinner
                        });
                    }
                }
                finalState.oscarSubmissions = [];
                finalState.oscarCurrentYearNominations = null;
            }

            // --- COACHELLA LOGIC ---

            // Week 10: Coachella Invitations
            if (newDate.week === 10) {
                for (const artistId in updatedArtistsData) {
                    const artistData = updatedArtistsData[artistId];
                    const artistProfile = allPlayerArtistsAndGroups.find(a => a.id === artistId);
                    
                    if (artistProfile && (artistData.contract || artistData.monthlyListeners >= 10000000)) {
                        artistData.coachella = { year: newDate.year, status: 'invited' };
                        const emailId = crypto.randomUUID();
                        artistData.inbox.push({
                            id: emailId,
                            sender: 'Coachella Booking',
                            senderIcon: 'coachella',
                            subject: `Coachella ${newDate.year} Lineup Submissions`,
                            body: `Hi ${artistProfile.name},\n\nWe are now preparing the lineup for the ${newDate.year} Coachella Valley Music and Arts Festival. Based on your recent numbers, we would like to invite you to submit for a spot on the lineup.\n\nPlease note: This is not a guarantee of placement, but a request for consideration.\n\n- Coachella Team`,
                            date: newDate,
                            isRead: false,
                            offer: { type: 'coachellaOffer', emailId, isSubmitted: false }
                        });
                    }
                }
            }

            // Week 12: Coachella Selection
            if (newDate.week === 12) {
                for (const artistId in updatedArtistsData) {
                    const artistData = updatedArtistsData[artistId];
                    const artistProfile = allPlayerArtistsAndGroups.find(a => a.id === artistId);
                    
                    if (artistData.coachella && artistData.coachella.status === 'submitted') {
                        let status: 'headliner' | 'mid' | 'small' | 'opener' = 'opener';
                        let payoutSize = 0;
                        let openingFor: string | undefined;

                        if (artistData.popularity >= 70) {
                            status = 'headliner';
                            payoutSize = Math.floor(Math.random() * (20000000 - 5500000)) + 5500000;
                        } else if (artistData.popularity >= 50) {
                            status = 'mid';
                            payoutSize = Math.floor(Math.random() * (2000000 - 300000)) + 300000;
                        } else if (artistData.popularity >= 25) {
                            status = 'small';
                            payoutSize = Math.floor(Math.random() * (100000 - 25000)) + 25000;
                        } else {
                            const realOtherArtists = ['Taylor Swift', 'Beyoncé', 'The Weeknd', 'Kendrick Lamar', 'Bad Bunny', 'Rihanna'];
                            status = 'opener';
                            openingFor = realOtherArtists[Math.floor(Math.random() * realOtherArtists.length)];
                            payoutSize = Math.floor(Math.random() * (25000 - 5000)) + 5000;
                        }

                        artistData.coachella.status = status;
                        artistData.coachella.payoutSize = payoutSize;
                        artistData.coachella.openingFor = openingFor;

                        let body = `Hi ${artistProfile?.name},\n\nWe are thrilled to let you know that you have been selected to perform at Coachella ${newDate.year}!\n\n`;
                        if (status === 'headliner') body += `You have been selected as a HEADLINER! You will be paid $${formatNumber(payoutSize)} for your headlining set.`;
                        else if (status === 'opener') body += `You have been selected as an OPENER for ${openingFor}! You will be paid $${formatNumber(payoutSize)} for your performance.`;
                        else body += `You got a ${status === 'mid' ? 'MID-TIER' : 'SMALL'} slot! You will be paid $${formatNumber(payoutSize)} for your performance.`;

                        artistData.inbox.push({
                            id: crypto.randomUUID(),
                            sender: status === 'opener' ? (openingFor || 'The Headliner') : 'Coachella',
                            senderIcon: 'coachella',
                            subject: `Coachella ${newDate.year} Status`,
                            body,
                            date: newDate,
                            isRead: false
                        });
                    }
                }
            }

            // Week 15: Coachella Performance & Tweets
            if (newDate.week === 15) {
                for (const artistId in updatedArtistsData) {
                    const artistData = updatedArtistsData[artistId];
                    const artistProfile = allPlayerArtistsAndGroups.find(a => a.id === artistId);
                    
                    if (artistData.coachella && artistData.coachella.year === newDate.year && ['headliner', 'mid', 'small', 'opener'].includes(artistData.coachella.status)) {
                        // Pay the artist
                        if (artistData.coachella.payoutSize) {
                            artistData.money += artistData.coachella.payoutSize;
                        }
                        
                        let titleStr = '';
                        if (artistData.coachella.status === 'headliner') titleStr = 'is HEADLINING';
                        else if (artistData.coachella.status === 'opener') titleStr = `is OPENING for ${artistData.coachella.openingFor} at`;
                        else titleStr = `is performing at`;

                        artistData.xPosts.unshift({
                             id: crypto.randomUUID(),
                             authorId: 'popbase',
                             content: `${artistProfile?.name} ${titleStr} Coachella ${newDate.year}!`,
                             image: artistData.artistImages.length > 0 ? artistData.artistImages[Math.floor(Math.random() * artistData.artistImages.length)] : undefined,
                             likes: Math.floor(Math.random() * 150000) + 40000,
                             retweets: Math.floor(Math.random() * 25000) + 5000,
                             views: Math.floor(Math.random() * 2000000) + 500000,
                             date: newDate
                        });
                    }
                }
            }

            // --- AMAs LOGIC ---
            let newAmaNominations: GameState['amaCurrentYearNominations'] = state.amaCurrentYearNominations;
            
            // Week 23: Determine AMA Nominations
            if (newDate.week === 23 && state.amaSubmissions && state.amaSubmissions.length > 0) {
                const newNominations: AmaCategory[] = [];
                const amaCategories: AmaCategoryName[] = [
                    'Artist of the Year', 'New Artist of the Year', 'Album of the Year', 'Song of the Year', 'Music Video of the Year',
                    'Favorite Pop Artist', 'Favorite Pop Album', 'Favorite Pop Song',
                    'Favorite Hip-Hop Artist', 'Favorite Hip-Hop Album', 'Favorite Hip-Hop Song',
                    'Favorite R&B Artist', 'Favorite R&B Album', 'Favorite R&B Song',
                    'Favorite Latin Artist', 'Favorite Latin Album', 'Favorite Latin Song',
                    'Favorite Country Artist', 'Favorite Country Album', 'Favorite Country Song',
                    'Favorite Rock Artist', 'Favorite Rock Album', 'Favorite Rock Song',
                    'Favorite Dance/Electronic Artist'
                ];

                for (const categoryName of amaCategories) {
                    const contenders: AmaContender[] = [];
                    let genreFilter: string | null = null;
                    let isAlbumCategory = false;
                    let isSongCategory = false;
                    let isArtistCategory = false;

                    if (categoryName.includes('Album of the Year') || categoryName.includes('Favorite') && categoryName.includes('Album')) isAlbumCategory = true;
                    if (categoryName.includes('Song of the Year') || categoryName.includes('Favorite') && categoryName.includes('Song') || categoryName.includes('Music Video')) isSongCategory = true;
                    if (categoryName.includes('Artist of the Year') || categoryName.includes('Favorite') && categoryName.includes('Artist')) isArtistCategory = true;

                    if (categoryName.includes('Pop')) genreFilter = 'Pop';
                    if (categoryName.includes('Hip-Hop')) genreFilter = 'Hip Hop';
                    if (categoryName.includes('R&B')) genreFilter = 'R&B';
                    if (categoryName.includes('Latin')) genreFilter = 'Latin';
                    if (categoryName.includes('Country')) genreFilter = 'Country';
                    if (categoryName.includes('Rock')) genreFilter = 'Rock';
                    if (categoryName.includes('Dance/Electronic')) genreFilter = 'Dance/Electronic';

                    const playerSubmissions = state.amaSubmissions.filter(s => s.category === categoryName);
                    for (const sub of playerSubmissions) {
                        const artistData = updatedArtistsData[sub.artistId];
                        const artistProfile = allPlayerArtistsAndGroups.find(a => a.id === sub.artistId);
                        if (!artistData || !artistProfile) continue;

                        let score = 0;
                        let isValid = false;

                        if (isAlbumCategory) {
                            const release = artistData.releases.find(r => r.id === sub.itemId);
                            if (release) {
                                score = (release.firstWeekStreams || 0) / 50000;
                                isValid = true;
                            }
                        } else if (isArtistCategory) {
                             score = artistData.popularity + artistData.hype;
                             isValid = true;
                        } else {
                            const song = artistData.songs.find(s => s.id === sub.itemId);
                            if (song) {
                               score = song.streams / 100000;
                               isValid = true;
                            }
                        }
                        
                        if (isValid) {
                            contenders.push({ artistId: sub.artistId, artistName: artistProfile.name, itemId: sub.itemId, itemName: sub.itemName, score });
                        }
                    }
                    
                    const numNpcContenders = 15;
                    if (isAlbumCategory) {
                        newNpcAlbums.slice(0, numNpcContenders * 5)
                            .slice(0, numNpcContenders)
                            .forEach(album => contenders.push({ artistId: `npc_${album.artist}`, artistName: album.artist, itemId: album.uniqueId, itemName: album.title, score: Math.random() * 50 }));
                    } else if (isSongCategory) {
                        newNpcsWithReleases.slice(0, numNpcContenders * 5)
                            .slice(0, numNpcContenders)
                            .forEach(song => contenders.push({ artistId: `npc_${song.artist}`, artistName: song.artist, itemId: song.uniqueId, itemName: song.title, score: Math.random() * 50 }));
                    } else {
                        [...new Set(newNpcAlbums.slice(0, numNpcContenders).map(a => a.artist))].slice(0, 5).forEach(artistName => {
                            contenders.push({ artistId: `npc_${artistName}`, artistName, itemId: `npc_${artistName}`, itemName: artistName, score: Math.random() * 100 + 50 });
                        });
                    }

                    contenders.sort((a, b) => b.score - a.score);
                    const nominees = contenders.slice(0, 5);
                    if (nominees.length > 0) {
                        newNominations.push({ name: categoryName, nominees, winner: nominees[0] });
                    }
                }
                
                newAmaNominations = newNominations;
                finalState.amaCurrentYearNominations = newNominations;

                for (const artistId in updatedArtistsData) {
                    const artistData = updatedArtistsData[artistId];
                    const artistProfile = allPlayerArtistsAndGroups.find(a => a.id === artistId);
                    const artistNominations = newNominations.flatMap(cat => cat.nominees).filter(nom => nom.artistName === artistProfile?.name);
                        
                    if (artistNominations.length > 0 && artistProfile) {
                        artistData.popularity = Math.min(100, artistData.popularity + (artistNominations.length * 3));
                        const hasPerformanceOffer = Math.random() < 0.5;
                        let body = `Dear ${artistProfile.name},\n\nCongratulations! We are pleased to announce your nomination(s) for the ${newDate.year} American Music Awards:\n\n`;
                        artistNominations.forEach(nom => {
                            const category = newNominations.find(c => c.nominees.includes(nom));
                            body += `• ${category?.name} - "${nom.itemName}"\n`;
                        });
                        if(hasPerformanceOffer) body += `\nAdditionally, we would be honored to have you perform at the ceremony. Please respond to this email to accept or decline the offer.\n\n`;
                        body += `\nSincerely,\nAMAs`;
                        const emailId = crypto.randomUUID();
                        artistData.inbox.push({
                            id: emailId, sender: 'American Music Awards', senderIcon: 'amas', subject: 'Congratulations! You\'re an AMA Nominee!',
                            body, date: newDate, isRead: false, offer: { type: 'amaNominations', emailId, hasPerformanceOffer }
                        });

                        const redCarpetEmailId = crypto.randomUUID();
                        artistData.inbox.push({
                            id: redCarpetEmailId,
                            sender: 'American Music Awards',
                            senderIcon: 'amas',
                            subject: 'Invitation: AMAs Red Carpet',
                            body: `Hi ${artistProfile.name},\n\nWe're excited to invite you to walk the red carpet at this year's AMAs. Pop Base and other outlets will be covering the event.\n\nPlease let us know if you'll be attending by sharing your look.\n\n- AMAs`,
                            date: newDate,
                            isRead: false,
                            offer: { type: 'amaRedCarpet', emailId: redCarpetEmailId }
                        });
                    }
                }
            }

            // Week 25: AMA Awards Ceremony
            if (newDate.week === 25 && state.amaCurrentYearNominations) {
                for (const category of state.amaCurrentYearNominations) {
                    if (category.winner) {
                         const winner = category.winner;
                         const content = `American Music Awards 🏆\n\nCongrats ${category.name} winner - '${winner.itemName}' @${winner.artistName.replace(/\s/g, '')} #AMAs`;
                         Object.values(updatedArtistsData).forEach(d => d.xPosts.unshift({
                             id: crypto.randomUUID(), authorId: 'popbase', content,
                             likes: Math.floor(Math.random() * 40000) + 15000, retweets: Math.floor(Math.random() * 10000) + 5000,
                             views: Math.floor(Math.random() * 2000000) + 1000000, date: newDate,
                         }));
                    }
                }

                for(const artistId in updatedArtistsData) {
                    const artistData = updatedArtistsData[artistId];
                    const artistProfile = allPlayerArtistsAndGroups.find(a => a.id === artistId);
                    
                    for (const category of state.amaCurrentYearNominations) {
                        const nomination = category.nominees.find(n => n.artistName === artistProfile?.name);
                        if (nomination) {
                            const isWinner = category.winner?.artistName === nomination.artistName;
                            if (isWinner) {
                                artistData.popularity = Math.min(100, artistData.popularity + 5);
                            }
                            artistData.amaHistory = artistData.amaHistory || [];
                            artistData.amaHistory.push({
                                year: newDate.year, category: category.name, itemId: nomination.itemId,
                                itemName: nomination.itemName, artistName: artistProfile?.name || 'Unknown',
                                isWinner
                            });
                        }
                    }
                }
                
                finalState.amaSubmissions = [];
                finalState.amaCurrentYearNominations = null;
            }

            // --- GRAMMYS LOGIC ---
            let newGrammyNominations: GameState['grammyCurrentYearNominations'] = state.grammyCurrentYearNominations;
            
            // Week 45: Determine Grammy Nominations
            if (newDate.week === 45 && state.grammySubmissions.length > 0) {
                const newNominations: GrammyCategory[] = [];
                const categories: GrammyAward['category'][] = [
                    'Record of the Year', 'Song of the Year', 'Album of the Year', 'Best New Artist',
                    'Best Pop Song', 'Best Rap Song', 'Best R&B Song', 'Pop Album', 'Rap Album', 'R&B Album'
                ];

                for (const categoryName of categories) {
                    const contenders: GrammyContender[] = [];
                    
                    let genreFilter: string | null = null;
                    let isAlbumCategory = false;
                    let isSongCategory = false;

                    switch (categoryName) {
                        case 'Pop Album': genreFilter = 'Pop'; isAlbumCategory = true; break;
                        case 'Rap Album': genreFilter = 'Hip Hop'; isAlbumCategory = true; break;
                        case 'R&B Album': genreFilter = 'R&B'; isAlbumCategory = true; break;
                        case 'Best Pop Song': genreFilter = 'Pop'; isSongCategory = true; break;
                        case 'Best Rap Song': genreFilter = 'Hip Hop'; isSongCategory = true; break;
                        case 'Best R&B Song': genreFilter = 'R&B'; isSongCategory = true; break;
                        case 'Album of the Year': isAlbumCategory = true; break;
                        case 'Record of the Year':
                        case 'Song of the Year':
                            isSongCategory = true;
                            break;
                    }

                    const playerSubmissions = state.grammySubmissions.filter(s => s.category === categoryName);
                    for (const sub of playerSubmissions) {
                        const artistData = updatedArtistsData[sub.artistId];
                        const artistProfile = allPlayerArtistsAndGroups.find(a => a.id === sub.artistId);
                        if (!artistData || !artistProfile) continue;

                        let score = 0;
                        let coverArt: string | undefined = undefined;
                        let isValid = false;

                        if (isAlbumCategory) {
                            const release = artistData.releases.find(r => r.id === sub.itemId);
                            if (release) {
                                const releaseSongs = release.songIds.map(id => artistData.songs.find(s => s.id === id)).filter((s): s is Song => !!s);
                                if (releaseSongs.length > 0) {
                                    let genreMatch = !genreFilter;
                                    if(genreFilter) {
                                        const genreCounts = releaseSongs.reduce((acc, song) => {
                                            acc[song.genre] = (acc[song.genre] || 0) + 1;
                                            return acc;
                                        }, {} as {[genre: string]: number});
                                        const majorGenre = Object.keys(genreCounts).reduce((a, b) => genreCounts[a] > genreCounts[b] ? a : b);
                                        if (majorGenre === genreFilter) genreMatch = true;
                                    }
                                    if(genreMatch) {
                                        const avgQuality = releaseSongs.reduce((sum, s) => sum + s.quality, 0) / releaseSongs.length;
                                        score = (avgQuality * 2) + ((release.firstWeekStreams || 0) / 100000);
                                        coverArt = release.coverArt;
                                        isValid = true;
                                    }
                                }
                            }
                        } else if (categoryName === 'Best New Artist') {
                            const totalStreamsThisYear = artistData.songs.reduce((sum, s) => {
                                const release = artistData.releases.find(r => r.id === s.releaseId);
                                return (release && release.releaseDate.year === newDate.year) ? sum + s.streams : sum;
                            }, 0);
                            score = artistData.hype + (totalStreamsThisYear / 1000000);
                            coverArt = artistProfile.image;
                            isValid = true;
                        } else { // Song categories
                            const song = artistData.songs.find(s => s.id === sub.itemId);
                            if (song) {
                                if (!genreFilter || song.genre === genreFilter) {
                                    score = (song.quality * 2) + ((song.firstWeekStreams || 0) / 25000);
                                    coverArt = song.coverArt;
                                    isValid = true;
                                }
                            }
                        }
                        
                        if (isValid) {
                            contenders.push({ id: sub.itemId, name: sub.itemName, artistName: artistProfile.name, isPlayer: true, score, coverArt });
                        }
                    }
                    
                    const numNpcContenders = 15;
                    if (isAlbumCategory) {
                        newNpcAlbums.slice(0, numNpcContenders * 5)
                            .filter(album => {
                                if (!genreFilter) return true;
                                const albumSongs = album.songIds.map(id => newNpcsWithReleases.find(s => s.uniqueId === id)).filter((s): s is NpcSong => !!s);
                                if (albumSongs.length === 0) return false;
                                const genreCounts = albumSongs.reduce((acc, song) => {
                                    acc[song.genre] = (acc[song.genre] || 0) + 1;
                                    return acc;
                                }, {} as {[genre: string]: number});
                                const majorGenre = Object.keys(genreCounts).reduce((a, b) => genreCounts[a] > genreCounts[b] ? a : b);
                                return majorGenre === genreFilter;
                            })
                            .slice(0, numNpcContenders)
                            .forEach(album => {
                                const albumSongs = album.songIds.map(id => newNpcsWithReleases.find(s => s.uniqueId === id)).filter(Boolean);
                                const avgPopularity = albumSongs.reduce((sum, s) => sum + (s?.basePopularity || 0), 0) / (albumSongs.length || 1);
                                contenders.push({ id: album.uniqueId, name: album.title, artistName: album.artist, isPlayer: false, score: (avgPopularity / 100000) * 1.5, coverArt: album.coverArt });
                            });
                    } else if (categoryName !== 'Best New Artist') {
                        newNpcsWithReleases.slice(0, numNpcContenders * 5)
                            .filter(song => !genreFilter || song.genre === genreFilter)
                            .slice(0, numNpcContenders)
                            .forEach(song => {
                                contenders.push({ id: song.uniqueId, name: song.title, artistName: song.artist, isPlayer: false, score: song.basePopularity / 100000, coverArt: song.coverArt || `https://ui-avatars.com/api/?name=${encodeURIComponent(song.artist)}&background=random&color=fff&size=250` });
                            });
                    } else {
                        [...new Set(newNpcAlbums.slice(0, numNpcContenders).map(a => a.artist))].slice(0, 5).forEach(artistName => {
                            contenders.push({ id: `npc_${artistName}`, name: artistName, artistName, isPlayer: false, score: Math.random() * 100 + 50 });
                        });
                    }

                    contenders.sort((a, b) => b.score - a.score);
                    const nominees = contenders.slice(0, 5);
                    if (nominees.length > 0) {
                        newNominations.push({ name: categoryName, nominees, winner: nominees[0] });
                    }
                }
                
                newGrammyNominations = newNominations;
                finalState.grammyCurrentYearNominations = newNominations;

                const majorCatsForPosts: GrammyAward['category'][] = ['Album of the Year', 'Record of the Year', 'Song of the Year', 'Best New Artist'];
                const nominationPosts: XPost[] = [];
                newNominations.forEach(category => {
                    if (majorCatsForPosts.includes(category.name)) {
                        const playerNominee = category.nominees.find(n => n.isPlayer);
                        let content = `The nominees for ${category.name} at the ${newDate.year + 1} #GRAMMYs have been announced:\n\n`;
                        content += category.nominees.map(n => `• ${n.isPlayer ? `**${n.name}**` : n.name}`).join('\n');
                        
                        const image = playerNominee?.coverArt || category.nominees[0]?.coverArt || undefined;

                        nominationPosts.push({
                            id: crypto.randomUUID(),
                            authorId: 'popbase',
                            content,
                            image,
                            likes: Math.floor(Math.random() * 50000) + 25000,
                            retweets: Math.floor(Math.random() * 12000) + 5000,
                            views: Math.floor(Math.random() * 1500000) + 500000,
                            date: newDate,
                        });
                    }
                });

                if (nominationPosts.length > 0) {
                    for (const artistId in updatedArtistsData) {
                        updatedArtistsData[artistId].xPosts.unshift(...nominationPosts);
                    }
                }


                for (const artistId in updatedArtistsData) {
                    const artistData = updatedArtistsData[artistId];
                    const artistProfile = allPlayerArtistsAndGroups.find(a => a.id === artistId);
                    const artistNominations = newNominations.flatMap(cat => cat.nominees).filter(nom => nom.isPlayer && nom.artistName === artistProfile?.name);
                        
                    if (artistNominations.length > 0 && artistProfile) {
                        artistData.popularity = Math.min(100, artistData.popularity + (artistNominations.length * 3));
                        const hasPerformanceOffer = Math.random() < 0.5;
                        let body = `Dear ${artistProfile.name},\n\nCongratulations! The Recording Academy is pleased to announce your nomination(s) for the ${newDate.year + 1} GRAMMY Awards:\n\n`;
                        artistNominations.forEach(nom => {
                            const category = newNominations.find(c => c.nominees.includes(nom));
                            body += `• ${category?.name} - "${nom.name}"\n`;
                        });
                        if(hasPerformanceOffer) body += `\nAdditionally, we would be honored to have you perform at the ceremony. Please respond to this email to accept or decline the offer.\n\n`;
                        body += `\nSincerely,\nThe Recording Academy`;
                        const emailId = crypto.randomUUID();
                        artistData.inbox.push({
                            id: emailId, sender: 'Recording Academy', senderIcon: 'grammys', subject: 'Congratulations! You\'re a GRAMMY Nominee!',
                            body, date: newDate, isRead: false, offer: { type: 'grammyNominations', emailId, hasPerformanceOffer }
                        });

                        const redCarpetEmailId = crypto.randomUUID();
                        artistData.inbox.push({
                            id: redCarpetEmailId,
                            sender: 'Recording Academy',
                            senderIcon: 'grammys',
                            subject: 'Invitation: GRAMMYs Red Carpet',
                            body: `Hi ${artistProfile.name},\n\nWe're excited to invite you to walk the red carpet at this year's GRAMMY Awards ceremony. Pop Base and other outlets will be covering the event.\n\nPlease let us know if you'll be attending by sharing your look.\n\n- The Recording Academy`,
                            date: newDate,
                            isRead: false,
                            offer: { type: 'grammyRedCarpet', emailId: redCarpetEmailId }
                        });
                    }
                }
            }

            // Week 52: Grammy Awards Ceremony
            if (newDate.week === 52 && state.grammyCurrentYearNominations) {
                for (const category of state.grammyCurrentYearNominations) {
                    if (category.winner) {
                        const winner = category.winner;
                        const content = `Recording Academy / GRAMMYS 🏆\n\nCongrats ${category.name} winner - '${winner.name}' @${winner.artistName.replace(/\s/g, '')} #GRAMMYs`;
                        Object.values(updatedArtistsData).forEach(d => d.xPosts.unshift({
                            id: crypto.randomUUID(), authorId: 'popbase', content, image: winner.coverArt,
                            likes: Math.floor(Math.random() * 40000) + 15000, retweets: Math.floor(Math.random() * 10000) + 5000,
                            views: Math.floor(Math.random() * 2000000) + 1000000, date: newDate,
                        }));
                    }
                }

                for(const artistId in updatedArtistsData) {
                    const artistData = updatedArtistsData[artistId];
                    const artistProfile = allPlayerArtistsAndGroups.find(a => a.id === artistId);
                    
                    for (const category of state.grammyCurrentYearNominations) {
                        const nomination = category.nominees.find(n => n.isPlayer && n.artistName === artistProfile?.name);
                        if (nomination) {
                            const isWinner = category.winner?.id === nomination.id && category.winner.artistName === nomination.artistName;
                            if (isWinner) {
                                artistData.popularity = Math.min(100, artistData.popularity + 5);
                            }
                            artistData.grammyHistory.push({
                                year: newDate.year, category: category.name, itemId: nomination.id,
                                itemName: nomination.name, artistName: artistProfile?.name || 'Unknown',
                                isWinner
                            });
                        }
                    }
                }
                
                finalState.grammySubmissions = [];
                finalState.grammyCurrentYearNominations = null;
            }

            // --- ADD CHART EMAILS TO INBOX ---
            // This is done last, after all other logic for the week.
            for (const artistId in updatedArtistsData) {
                const artistData = updatedArtistsData[artistId];
                const artistProfileForEmail = allPlayerArtistsAndGroups.find(a => a.id === artistId);
                const newChartEmails: Email[] = [];

                 // --- CHART UPDATE EMAILS ---
                if (artistProfileForEmail) {
                    // Billboard Chart Email
                    const playerHot100Entries = newBillboardHot100.filter(e => e.isPlayerSong && allPlayerSongsFlat.find(s => s.id === e.songId)?.artistId === artistId);
                    const playerAlbumEntries = newBillboardTopAlbums.filter(e => e.isPlayerAlbum && allPlayerReleases.find(r => r.id === e.albumId)?.artistId === artistId);

                    if (playerHot100Entries.length > 0 || playerAlbumEntries.length > 0) {
                        let body = `Hi ${artistProfileForEmail.name},\n\nHere's your weekly recap of your performance on the Billboard charts.\n`;
                        
                        if (playerHot100Entries.length > 0) {
                            body += `\n**Billboard Hot 100**\n`;
                            playerHot100Entries.forEach(entry => {
                                body += `#${entry.rank} "${entry.title}"\n`;
                            });
                        }

                        if (playerAlbumEntries.length > 0) {
                            body += `\n**Billboard Top 50 Albums**\n`;
                            playerAlbumEntries.forEach(entry => {
                                body += `#${entry.rank} "${entry.title}"\n`;
                            });
                        }

                        body += `\nCongratulations on your chart success!\n- The Billboard Team`;

                        newChartEmails.push({
                            id: crypto.randomUUID(),
                            sender: 'Billboard',
                            subject: 'Your Weekly Billboard Chart Recap',
                            body: body,
                            date: newDate,
                            isRead: false,
                            senderIcon: 'default',
                        });
                    }

                    // Spotify Chart Email
                    const playerSpotifyEntries = newSpotifyGlobal.filter(e => e.isPlayerSong && allPlayerSongsFlat.find(s => s.id === e.songId)?.artistId === artistId);
                    
                    if (playerSpotifyEntries.length > 0) {
                        let body = `Hi ${artistProfileForEmail.name},\n\nHere are your current entries on the Spotify Global Top 100 chart this week.\n\n**Global Top 100**\n`;
                        playerSpotifyEntries.forEach(entry => {
                            body += `#${entry.rank} "${entry.title}" - ${formatNumber(entry.weeklyStreams)} streams\n`;
                        });
                        body += `\nKeep up the great work!\n- Spotify Charts Team`;

                        newChartEmails.push({
                            id: crypto.randomUUID(),
                            sender: 'Spotify Charts',
                            subject: 'Your Spotify Charts Update',
                            body: body,
                            date: newDate,
                            isRead: false,
                            senderIcon: 'spotify',
                        });
                    }
                }
                artistData.inbox.push(...newChartEmails);
            }

            const newSpotifyPlaylists = (state.spotifyPlaylists || DEFAULT_SPOTIFY_PLAYLISTS).map(playlist => {
                let playlistContenders = allContenders;
                if (playlist.type === 'genre' && playlist.genre) {
                    playlistContenders = playlistContenders.filter(c => {
                        if (playlist.genre === 'Pop' && c.genre === 'Pop') return true;
                        if (playlist.genre === 'Hip Hop/Rap' && c.genre === 'Hip Hop') return true;
                        if (playlist.genre === 'Dance/Electronic' && ['Electronic', 'EDM', 'House'].includes(c.genre)) return true;
                        if (playlist.genre === 'Country' && c.genre === 'Country') return true;
                        if (playlist.genre === 'R&B' && c.genre === 'R&B') return true;
                        if (playlist.genre === 'Rock' && c.genre === 'Rock') return true;
                        if (playlist.genre === 'Christmas' && c.genre === 'Christmas') return true;
                        if (playlist.genre === 'K-Pop' && c.genre === 'K-Pop') return true;
                        if (playlist.genre === 'Latin' && c.genre === 'Latin') return true;
                        if (playlist.genre === 'Indie' && c.genre === 'Indie') return true;
                        if (playlist.genre === 'Afrobeats' && c.genre === 'Afrobeats') return true;
                        if (playlist.genre === 'Reggae' && c.genre === 'Reggae') return true;
                        return false; 
                    });
                }
                
                const scoredContenders = playlistContenders.map(c => {
                    let score = c.weeklyStreams + (Math.random() * 5000); // add a little randomness to the playlist curation
                    
                    if (c.isPlayerSong && c.songId) {
                        const artistDataForBoost = Object.values(updatedArtistsData).find(d => d.songs.some(s => s.id === c.songId));
                        const actualSong = artistDataForBoost?.songs.find(s => s.id === c.songId);
                        if (actualSong && actualSong.playlistBoostWeeks && actualSong.playlistBoostWeeks > 0) {
                            score *= PLAYLIST_BOOST_MULTIPLIER; // High chance to hit playlists
                        }
                        
                        // Independent penalty / Label boost for big playlists
                        if (playlist.followers > 10000000) {
                            if (!artistDataForBoost?.contract) {
                                score *= 0.5; // Harder for independent artists
                            } else if (!artistDataForBoost.contract.isCustom) {
                                const label = LABELS.find(l => l.id === artistDataForBoost.contract?.labelId);
                                if (label?.contractType === 'petty') score *= 3.0; // Major labels push harder
                                else if (label?.contractType === 'major') score *= 2.0;
                            }
                        }
                    }
                    return { ...c, score };
                }).sort((a,b) => b.score - a.score).slice(0, 50);
                
                const newTracks: SpotifyPlaylistTrack[] = scoredContenders.map((c, index) => {
                    const existingTrack = playlist.tracks.find(t => t.songId === c.uniqueId);
                    return {
                        songId: c.uniqueId,
                        artistName: c.artist,
                        artistId: c.isPlayerSong ? (allPlayerSongsFlat.find(s => s.id === c.songId)?.artistId || 'unknown') : 'unknown',
                        title: c.title || 'Unknown Title',
                        coverArt: c.coverArt,
                        position: index + 1,
                        addedDate: existingTrack ? existingTrack.addedDate : newDate,
                    }
                });
                
                return { ...playlist, tracks: newTracks };
            });

            // Generate "This Is [Artist]" playlists for any player artists with >= 10 songs
            allPlayerArtistsAndGroups.forEach(artist => {
                const artistData = updatedArtistsData[artist.id];
                if (artistData) {
                    const releasedSongs = artistData.songs.filter(s => s.isReleased && !s.remixOfSongId);
                    if (releasedSongs.length >= 10) {
                        // Sort by total streams (biggest hits)
                        const biggestHits = [...releasedSongs].sort((a, b) => b.streams - a.streams).slice(0, 50);
                        
                        const playlistId = `this_is_${artist.id}`;
                        const existingPlaylist = newSpotifyPlaylists.find(p => p.id === playlistId);
                        
                        const tracks: SpotifyPlaylistTrack[] = biggestHits.map((song, index) => {
                            const existingTrack = existingPlaylist?.tracks.find(t => t.songId === song.id);
                            return {
                                songId: song.id,
                                artistName: artist.name,
                                artistId: artist.id,
                                title: song.title,
                                coverArt: song.coverArt,
                                position: index + 1,
                                addedDate: existingTrack ? existingTrack.addedDate : newDate,
                                explicit: song.explicit || false,
                            };
                        });

                        const thisIsPlaylist: SpotifyPlaylist = {
                            id: playlistId,
                            name: `This Is ${artist.name}`,
                            description: `This is ${artist.name}. The essential tracks, all in one playlist.`,
                            followers: existingPlaylist ? existingPlaylist.followers : (artistData.spotifyFollowers || 0),
                            coverArt: artist.image,
                            artistPosition: 1,
                            type: 'this_is',
                            tracks: tracks
                        };

                        if (existingPlaylist) {
                            const index = newSpotifyPlaylists.findIndex(p => p.id === playlistId);
                            newSpotifyPlaylists[index] = thisIsPlaylist;
                        } else {
                            newSpotifyPlaylists.push(thisIsPlaylist);
                        }
                    }
                }
            });

            if (contractRenewalForActivePlayer) {
                return {
                    ...finalState,
                    date: newDate,
                    artistsData: updatedArtistsData,
                    spotifyPlaylists: newSpotifyPlaylists,
                    billboardHot100: newBillboardHot100,
                    billboardTopAlbums: newBillboardTopAlbums,
                    chartHistory: newChartHistory,
                    albumChartHistory: newAlbumChartHistory,
                    spotifyGlobal: newSpotifyGlobal,
                    hotPopSongs: newHotPopSongs,
                    hotRapRnb: newHotRapRnb,
                    electronicChart: newElectronicChart,
                    countryChart: newCountryChart,
                    hotPopSongsHistory: newHotPopSongsHistory,
                    hotRapRnbHistory: newHotRapRnbHistory,
                    electronicChartHistory: newElectronicChartHistory,
                    countryChartHistory: newCountryChartHistory,
                    spotifyNewEntries: newEntriesCount,
                    npcs: newNpcsWithReleases,
                    npcAlbums: newNpcAlbums,
                    contractRenewalOffer: contractRenewalForActivePlayer,
                    currentView: 'contractRenewal'
                };
            }

            if (!finalState.disableEncounters && finalState.currentView !== 'contractRenewal' && !finalState.activeEncounter && !finalState.contractOffer) {
                const updatedActiveData = updatedArtistsData[state.activeArtistId];
                if (updatedActiveData) {
                    const artist = allPlayerArtistsAndGroups.find(a => a.id === state.activeArtistId);
                    if (artist && Math.random() < (updatedActiveData.popularity / 100) * 0.33) {
                        const possibleEncounters = getPossibleEncounters(artist, updatedActiveData);
                        if (possibleEncounters.length > 0) {
                            finalState.activeEncounter = possibleEncounters[Math.floor(Math.random() * possibleEncounters.length)];
                        }
                    }
                }
            }

            return {
                ...finalState,
                date: newDate,
                artistsData: updatedArtistsData,
                spotifyPlaylists: newSpotifyPlaylists,
                billboardHot100: newBillboardHot100,
                billboardTopAlbums: newBillboardTopAlbums,
                chartHistory: newChartHistory,
                albumChartHistory: newAlbumChartHistory,
                spotifyGlobal: newSpotifyGlobal,
                hotPopSongs: newHotPopSongs,
                hotRapRnb: newHotRapRnb,
                electronicChart: newElectronicChart,
                countryChart: newCountryChart,
                hotPopSongsHistory: newHotPopSongsHistory,
                hotRapRnbHistory: newHotRapRnbHistory,
                electronicChartHistory: newElectronicChartHistory,
                countryChartHistory: newCountryChartHistory,
                spotifyNewEntries: newEntriesCount,
                npcs: newNpcsWithReleases,
                npcAlbums: newNpcAlbums,
            };
        }
        case 'RECORD_SONG': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            
            let rightsSoldPercent = 0;
            let rightsOwnerLabelId = undefined;
            if (activeData.contract) {
                rightsOwnerLabelId = activeData.contract.labelId;
                if (activeData.contract.mastersOwnership === 'Label') {
                    rightsSoldPercent = 100;
                } else if (activeData.contract.mastersOwnership === 'Split') {
                    rightsSoldPercent = 100 - activeData.contract.mastersSplitPercent;
                } else {
                    rightsSoldPercent = 0;
                    rightsOwnerLabelId = undefined;
                }
            }

            const newSong: Song = {
                ...action.payload.song,
                dailyStreams: [],
                rightsSoldPercent: rightsSoldPercent > 0 ? rightsSoldPercent : undefined,
                rightsOwnerLabelId: rightsOwnerLabelId
            };
            const updatedData = {
                ...activeData,
                money: activeData.money - action.payload.cost,
                songs: [...activeData.songs, newSong],
            };
            return {
                ...state,
                artistsData: { ...state.artistsData, [state.activeArtistId]: updatedData },
            };
        }
        case 'COMBINE_REMIXES': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const originalSongId = action.payload.originalSongId;

            let updatedSongs = [...activeData.songs];
            let originalSong = updatedSongs.find(s => s.id === originalSongId);
            if (!originalSong) return state;

            const remixes = updatedSongs.filter(s => s.remixOfSongId === originalSongId && s.isReleased);
            
            let combinedStreams = 0;
            let combinedLastWeekStreams = 0;
            let combinedPrevWeekStreams = 0;
            let combinedRevenue = 0;
            let combinedNetRevenue = 0;

            const remixReleaseIds = new Set<string>();

            remixes.forEach(remix => {
                combinedStreams += (remix.streams || 0);
                combinedLastWeekStreams += (remix.lastWeekStreams || 0);
                combinedPrevWeekStreams += (remix.prevWeekStreams || 0);
                combinedRevenue += (remix.revenue || 0);
                combinedNetRevenue += (remix.netRevenue || 0);
                if (remix.releaseId) {
                    remixReleaseIds.add(remix.releaseId);
                }
            });

            // Delete the remix songs
            updatedSongs = updatedSongs.filter(s => !(s.remixOfSongId === originalSongId && s.isReleased));

            // Add streams to the original song
            updatedSongs = updatedSongs.map(s => {
                if (s.id === originalSongId) {
                    return {
                        ...s,
                        streams: (s.streams || 0) + combinedStreams,
                        lastWeekStreams: (s.lastWeekStreams || 0) + combinedLastWeekStreams,
                        prevWeekStreams: (s.prevWeekStreams || 0) + combinedPrevWeekStreams,
                        revenue: (s.revenue || 0) + combinedRevenue,
                        netRevenue: (s.netRevenue || 0) + combinedNetRevenue,
                    };
                }
                return s;
            });

            const updatedReleases = activeData.releases.filter(r => {
                if (remixReleaseIds.has(r.id)) {
                    // Check if it's purely a remix release
                    const hasNonRemix = r.songIds.some(id => id !== originalSongId && !remixes.find(remix => remix.id === id));
                    if (!hasNonRemix) return false; // Delete it
                }
                return true;
            });

            const artistProfile = allPlayerArtistsAndGroups.find(a => a.id === state.activeArtistId);
            const username = artistProfile?.name.replace(/\s/g, '').toLowerCase() || 'artist';
            const newXPost: XPost = {
                id: crypto.randomUUID(),
                authorId: 'user_hater',
                content: `not @${username} combining the remix EP with the original because it flopped 😂 desperate for streams much??`,
                likes: Math.floor(Math.random() * 50000) + 10000,
                retweets: Math.floor(Math.random() * 5000) + 1000,
                views: Math.floor(Math.random() * 1000000) + 200000,
                date: state.date,
            };

            const popBasePost: XPost = {
                id: crypto.randomUUID(),
                authorId: 'popbase',
                content: `${artistProfile?.name} has combined all remixes of "${originalSong.title}" into the original track.`,
                likes: Math.floor(Math.random() * 80000) + 30000,
                retweets: Math.floor(Math.random() * 20000) + 5000,
                views: Math.floor(Math.random() * 1500000) + 500000,
                date: state.date
            };

            const updatedData = {
                ...activeData,
                songs: updatedSongs,
                releases: updatedReleases,
                xPosts: [popBasePost, newXPost, ...activeData.xPosts],
            };

            return {
                ...state,
                artistsData: { ...state.artistsData, [state.activeArtistId]: updatedData },
            };
        }
        case 'CREATE_REMIX_PACK': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const newSongs: Song[] = action.payload.songs.map(song => ({
                ...song,
                dailyStreams: [],
            }));
            const updatedData = {
                ...activeData,
                money: activeData.money - action.payload.cost,
                songs: [...activeData.songs, ...newSongs],
            };
            return {
                ...state,
                artistsData: { ...state.artistsData, [state.activeArtistId]: updatedData },
            };
        }
        case 'RELEASE_PROJECT': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];

            if (activeData.contract) return state;

            const releaseWithLabel = { ...action.payload.release, releasingLabel: null };

            let hypeIncrease = 0;
            switch (releaseWithLabel.type) {
                case 'Single': hypeIncrease = 15; break;
                case 'EP': hypeIncrease = 25; break;
                case 'Album': hypeIncrease = 40; break;
            }

            let newEmails: Email[] = [];
            const artistProfile = [state.soloArtist, ...(state.group?.members || []), state.group, ...(state.extraPlayableArtists || [])].find(a => a?.id === state.activeArtistId);
            const artistName = artistProfile?.name || 'Artist';
            const pronounPossessive = artistProfile?.pronouns === 'he/him' ? 'his' : artistProfile?.pronouns === 'she/her' ? 'her' : 'their';

            const popBasePost: XPost = {
                id: crypto.randomUUID(),
                authorId: 'popbase',
                content: `${artistName} has surprise released ${pronounPossessive} new ${releaseWithLabel.type} "${releaseWithLabel.title}".`,
                image: releaseWithLabel.coverArt,
                likes: Math.floor(Math.random() * 80000) + 30000,
                retweets: Math.floor(Math.random() * 20000) + 5000,
                views: Math.floor(Math.random() * 1500000) + 500000,
                date: state.date
            };

            const tmzPost: XPost = {
                id: crypto.randomUUID(),
                authorId: 'tmz',
                content: `${artistName} just secret-dropped ${releaseWithLabel.type === 'Single' ? 'a new track' : 'another project'}. Desperation for streams or a genuine surprise? You be the judge. 📉🤭`,
                image: activeData.paparazziPhotos.length > 0 ? activeData.paparazziPhotos[Math.floor(Math.random() * activeData.paparazziPhotos.length)].url : undefined,
                likes: Math.floor(Math.random() * 40000) + 10000,
                retweets: Math.floor(Math.random() * 8000) + 2000,
                views: Math.floor(Math.random() * 900000) + 300000,
                date: state.date
            };

            if (releaseWithLabel.type === 'Single') {
                const song = activeData.songs.find(s => s.id === releaseWithLabel.songIds[0]);
                if (song) {
                    if (song.controversialContributors && song.controversialContributors.length > 0) {
                        const badName = song.controversialContributors[0];
                        activeData.publicImage = Math.max(0, (activeData.publicImage || 80) - 20);
                        
                        const controversialTmzPost: XPost = {
                            id: crypto.randomUUID(),
                            authorId: 'tmz',
                            content: `${artistName} has worked with controversial producer ${badName} on their new song "${song.title}". Are they desperate for a hit? Yikes. 😬`,
                            image: activeData.paparazziPhotos.length > 0 ? activeData.paparazziPhotos[Math.floor(Math.random() * activeData.paparazziPhotos.length)].url : undefined,
                            likes: Math.floor(Math.random() * 60000) + 20000,
                            retweets: Math.floor(Math.random() * 15000) + 5000,
                            views: Math.floor(Math.random() * 2000000) + 800000,
                            date: state.date
                        };
                        const controversialFanPost1: XPost = {
                            id: crypto.randomUUID(),
                            authorId: `hater_${Math.floor(Math.random() * 1000)}`,
                            content: `Ew why is ${artistName} working with ${badName}?? Cancelled.`,
                            likes: Math.floor(Math.random() * 5000) + 1000,
                            retweets: Math.floor(Math.random() * 1000) + 100,
                            views: Math.floor(Math.random() * 100000) + 10000,
                            date: state.date
                        };
                        const controversialFanPost2: XPost = {
                            id: crypto.randomUUID(),
                            authorId: `hater_${Math.floor(Math.random() * 1000)}`,
                            content: `I'm actually shocked ${artistName} would sink this low. The new song is tainted.`,
                            likes: Math.floor(Math.random() * 8000) + 2000,
                            retweets: Math.floor(Math.random() * 2000) + 200,
                            views: Math.floor(Math.random() * 150000) + 20000,
                            date: state.date
                        };
                        activeData.xPosts = [controversialTmzPost, controversialFanPost1, controversialFanPost2, ...activeData.xPosts];
                        
                        // Spawn a 4-week backlash buff
                        // Let's just drop public image, the game already uses public image to reduce fans growth and stream growth
                    }

                    const emailIdGenius = crypto.randomUUID();
                    newEmails.push({
                        id: emailIdGenius,
                        sender: 'Genius',
                        subject: `Verified Interview for "${song.title}"?`,
                        body: `Hey ${artistName},\n\nWe're big fans of your new single "${song.title}" over at Genius. We'd love to have you for our 'Verified' series to break down the lyrics and meaning behind the track.\n\nLet us know if you're interested.\n\nBest,\nThe Genius Team`,
                        date: releaseWithLabel.releaseDate,
                        isRead: false,
                        senderIcon: 'genius',
                        offer: {
                            type: 'geniusInterview',
                            songId: song.id,
                            isAccepted: false,
                            emailId: emailIdGenius,
                        }
                    });

                    // On The Radar / TRSH'D offer for Hip Hop singles
                    if (song.genre === 'Hip Hop' && Math.random() < 0.75) { // 75% chance
                        const platform = Math.random() < 0.5 ? 'On The Radar' : "TRSH'D";
                        const emailIdPlatform = crypto.randomUUID();
                        if (platform === 'On The Radar') {
                            newEmails.push({
                                id: emailIdPlatform,
                                sender: 'On The Radar',
                                senderIcon: 'ontheradar',
                                subject: `Performance Invite for "${song.title}"`,
                                body: `Yo ${artistName},\n\nWe've been hearing the buzz around your new single "${song.title}". We'd like to invite you to our studio for an "On The Radar" freestyle performance.\n\nThis is a huge look. Let us know.\n\n- On The Radar Team`,
                                date: releaseWithLabel.releaseDate,
                                isRead: false,
                                offer: {
                                    type: 'onTheRadarOffer',
                                    songId: song.id,
                                    isAccepted: false,
                                    emailId: emailIdPlatform,
                                }
                            });
                        } else { // TRSH'D
                             newEmails.push({
                                id: emailIdPlatform,
                                sender: "TRSH'D",
                                senderIcon: 'trshd',
                                subject: `TRSH'D Performance: ${song.title}`,
                                body: `What's good ${artistName},\n\nYour new track "${song.title}" is making waves. We want you to come through and lay down a performance for TRSH'D.\n\nHit us back if you're down.\n\n- TRSH'D`,
                                date: releaseWithLabel.releaseDate,
                                isRead: false,
                                offer: {
                                    type: 'trshdOffer',
                                    songId: song.id,
                                    isAccepted: false,
                                    emailId: emailIdPlatform,
                                }
                            });
                        }
                    }
                }
            }

            if (releaseWithLabel.type === 'EP' || releaseWithLabel.type === 'Album') {
                const emailId = crypto.randomUUID();
                const offerTypes: Array<'performance' | 'interview' | 'both'> = ['performance', 'interview', 'both'];
                const selectedOfferType = offerTypes[Math.floor(Math.random() * offerTypes.length)];
                
                let subject = '';
                let body = '';
                switch (selectedOfferType) {
                    case 'performance':
                        subject = `Performance on The Tonight Show Starring Jimmy Fallon?`;
                        body = `Hey ${artistName},\n\nHuge fans of the new ${releaseWithLabel.type.toLowerCase()} "${releaseWithLabel.title}"! We'd be thrilled to have you on the show to perform a song from it.\n\nLet us know if you're interested.\n\nBest,\nThe Tonight Show Team`;
                        break;
                    case 'interview':
                        subject = `Interview on The Tonight Show Starring Jimmy Fallon?`;
                        body = `Hey ${artistName},\n\nThe new ${releaseWithLabel.type.toLowerCase()} "${releaseWithLabel.title}" is all anyone's talking about! Jimmy would love to have you on the show for an interview to discuss the project.\n\nLet us know if you're interested.\n\nBest,\nThe Tonight Show Team`;
                        break;
                    case 'both':
                        subject = `Appearance on The Tonight Show Starring Jimmy Fallon?`;
                        body = `Hey ${artistName},\n\nCongratulations on the new ${releaseWithLabel.type.toLowerCase()} "${releaseWithLabel.title}"! The whole office has it on repeat. Jimmy would love to have you on the show for an interview AND a performance.\n\nLet us know if you're interested.\n\nBest,\nThe Tonight Show Team`;
                        break;
                }

                newEmails.push({
                    id: emailId,
                    sender: 'The Tonight Show',
                    subject,
                    body,
                    date: releaseWithLabel.releaseDate,
                    isRead: false,
                    senderIcon: 'fallon',
                    offer: {
                        type: 'fallonOffer',
                        releaseId: releaseWithLabel.id,
                        offerType: selectedOfferType,
                        isAccepted: false,
                        emailId: emailId,
                    }
                });
            }

            const newSongs = activeData.songs.map(song => 
                releaseWithLabel.songIds.includes(song.id)
                ? { ...song, isReleased: true, releaseId: releaseWithLabel.id }
                : song
            );
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        releases: [...activeData.releases, releaseWithLabel],
                        songs: newSongs,
                        hype: Math.min(getHypeCap(activeData), activeData.hype + hypeIncrease),
                        inbox: [...activeData.inbox, ...newEmails],
                        xPosts: [popBasePost, tmzPost, ...activeData.xPosts]
                    }
                }
            };
        }
        case 'ADD_REVIEW': {
            const { releaseId, review, cost, artistId } = action.payload;
            const artistData = state.artistsData[artistId];
            if (!artistData) return state;

            let songsWithBoost = [...artistData.songs];
            let hypeIncrease = 0;
            let popularityIncrease = 0;
            if (review.score >= 8.5) {
                hypeIncrease = 20;
                popularityIncrease = 5;
            } else if (review.score >= 7.0) {
                 popularityIncrease = 2;
            }

            if (review.score >= 7) {
                const release = artistData.releases.find(r => r.id === releaseId);
                if (release) {
                    const songIdsToBoost = new Set(release.songIds);
                    songsWithBoost = artistData.songs.map(song => 
                        songIdsToBoost.has(song.id) ? { ...song, pitchforkBoost: true } : song
                    );
                }
            }
            
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [artistId]: {
                        ...artistData,
                        money: artistData.money - cost,
                        songs: songsWithBoost,
                        releases: artistData.releases.map(r => r.id === releaseId ? { ...r, review } : r),
                        hype: Math.min(getHypeCap(artistData), artistData.hype + hypeIncrease),
                        popularity: Math.min(100, artistData.popularity + popularityIncrease),
                    }
                }
            };
        }
        case 'CREATE_VIDEO': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const { video, cost } = action.payload;

            let hypeIncrease = 0;
            switch (video.type) {
                case 'Music Video': hypeIncrease = 20; break;
                case 'Lyric Video': hypeIncrease = 10; break;
                case 'Visualizer': hypeIncrease = 5; break;
            }
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        money: activeData.money - cost,
                        videos: [...activeData.videos, video],
                        hype: Math.min(getHypeCap(activeData), activeData.hype + hypeIncrease),
                    }
                }
            };
        }
        case 'ADD_MERCH': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        merch: [...activeData.merch, action.payload.item]
                    }
                }
            };
        }
        case 'REMOVE_MERCH': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            return {
                ...state,
                 artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        merch: activeData.merch.filter(item => item.id !== action.payload.id)
                    }
                }
            };
        }
        case 'UPDATE_MERCH_BANNER': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        merchStoreBanner: action.payload,
                    }
                }
            };
        }
        case 'UPDATE_GRAMMY_BANNER': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        grammyBanner: action.payload,
                    }
                }
            };
        }
        case 'UPDATE_OSCAR_BANNER': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        oscarBanner: action.payload,
                    }
                }
            };
        }
        case 'MARK_INBOX_READ': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        inbox: activeData.inbox.map(email => ({...email, isRead: true}))
                    }
                }
            };
        }
        case 'TAKE_DOWN_SONG': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        songs: activeData.songs.map(s => s.id === action.payload.songId ? { ...s, isTakenDown: true } : s)
                    }
                }
            };
        }
        case 'BUY_BACK_SONG': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            if (activeData.funds < action.payload.cost) return state;
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        funds: activeData.funds - action.payload.cost,
                        songs: activeData.songs.map(s => s.id === action.payload.songId ? { ...s, isTakenDown: false, rightsSoldPercent: 0, rightsOwnerLabelId: undefined } : s)
                    }
                }
            };
        }
        case 'BUY_BACK_RELEASE': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            if (activeData.funds < action.payload.cost) return state;
            
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        funds: activeData.funds - action.payload.cost,
                        releases: activeData.releases.map(r => r.id === action.payload.releaseId ? { ...r, isTakenDown: false, rightsSoldPercent: 0, rightsOwnerLabelId: undefined } : r),
                        songs: activeData.songs.map(s => s.releaseId === action.payload.releaseId ? { ...s, isTakenDown: false, rightsSoldPercent: 0, rightsOwnerLabelId: undefined } : s)
                    }
                }
            };
        }
        case 'UPDATE_ITUNES_PRICE': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        songs: activeData.songs.map(s => s.id === action.payload.songId ? { ...s, itunesPrice: action.payload.newPriceStr } : s)
                    }
                }
            };
        }
        case 'TOGGLE_APPLE_MUSIC_EXPANDED_COVER': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        releases: activeData.releases.map(r => r.id === action.payload.releaseId ? { ...r, isAppleMusicExpandedCover: action.payload.enabled } : r)
                    }
                }
            };
        }
        case 'MARK_APPLE_MUSIC_ESSENTIAL': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        releases: activeData.releases.map(r => r.id === action.payload.releaseId ? { ...r, isAppleMusicEssential: true, appleMusicEssentialReview: action.payload.reviewText } : { ...r, isAppleMusicEssential: false, appleMusicEssentialReview: undefined })
                    }
                }
            };
        }
        case 'TAKE_DOWN_RELEASE': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const release = activeData.releases.find(r => r.id === action.payload.releaseId);
            if (!release) return state;
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        releases: activeData.releases.map(r => r.id === action.payload.releaseId ? { ...r, isTakenDown: true } : r),
                        songs: activeData.songs.map(s => release.songIds.includes(s.id) ? { ...s, isTakenDown: true } : s)
                    }
                }
            };
        }
        case 'START_PROMOTION': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const { promotion } = action.payload;
            return {
                ...state,
                 artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        money: activeData.money - promotion.weeklyCost,
                        promotions: [...activeData.promotions, promotion]
                    }
                }
            };
        }
        case 'CANCEL_PROMOTION': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        promotions: activeData.promotions.filter(p => p.id !== action.payload.promotionId),
                    }
                }
            };
        }
        case 'SELECT_VIDEO': {
            return { ...state, selectedVideoId: action.payload };
        }
        case 'SELECT_RELEASE': {
            return { ...state, selectedReleaseId: action.payload };
        }
        case 'PERFORM_GIG': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            
            let gigCash = action.payload.cash;
            const contract = activeData.contract;
            if (contract && !contract.isCustom) {
                const label = LABELS.find(l => l.id === contract.labelId);
                if (label) {
                    let playerCut = 1.0;
                    if (label.contractType === 'petty') playerCut = 0.1;
                    else if (label.id === 'umg') playerCut = 0.2;
                    else if (label.tier === 'Mid-high' || label.tier === 'Mid-Low' || label.tier === 'Top') playerCut = 0.4;
                    else if (label.tier === 'Low') playerCut = 0.5;
                    gigCash = gigCash * playerCut;
                }
            }

            return {
                ...state,
                currentView: 'game',
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        money: activeData.money + gigCash,
                        hype: Math.min(getHypeCap(activeData), activeData.hype + action.payload.hype),
                        performedGigThisWeek: true,
                    }
                }
            };
        }
        case 'SIGN_CONTRACT': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            
            const allCustomLabels: CustomLabel[] = Object.values(state.artistsData).flatMap(d => d.customLabels);
            const { contract } = action.payload;

            const label = contract.isCustom 
                ? allCustomLabels.find(l => l.id === contract.labelId)
                : LABELS.find(l => l.id === contract.labelId);
            
            const artist = allPlayerArtistsAndGroups.find(a => a.id === contract.artistId);

            let advance = 0;
            if (label && !contract.isCustom) {
                const stdLabel = label as Label;
                if (stdLabel.contractType === 'petty') advance = 1000000;
                else if (stdLabel.id === 'umg') advance = 2500000;
                else if (stdLabel.tier === 'Mid-high' || stdLabel.tier === 'Mid-Low' || stdLabel.tier === 'Top') advance = 750000;
                else if (stdLabel.tier === 'Low') advance = 300000;
            }

            let newPosts: XPost[] = [];
            if (label && artist) {
                const playerUser = activeData.selectedPlayerXUserId ? activeData.xUsers.find(u => u.id === activeData.selectedPlayerXUserId) : activeData.xUsers.find(u => u.isPlayer);
                if (playerUser) {
                    newPosts.push({
                        id: crypto.randomUUID(),
                        authorId: 'tmz',
                        content: `${artist.name} has officially signed a record deal with ${label.name}. Sources say it's a multi-album deal.`,
                        image: playerUser.avatar,
                        likes: Math.floor(Math.random() * 5000) + 1000,
                        retweets: Math.floor(Math.random() * 1000) + 200,
                        views: Math.floor(Math.random() * 400000) + 150000,
                        date: state.date,
                    });
                }
            }
            
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        money: activeData.money + advance,
                        contract: action.payload.contract,
                        xPosts: [...newPosts, ...activeData.xPosts]
                    }
                }
            };
        }
        case 'END_CONTRACT': {
            if (!state.activeArtistId) return state;
            const activeData = { ...state.artistsData[state.activeArtistId] };
            if (!activeData.contract) {
                return state;
            }

            const label = LABELS.find(l => l.id === activeData.contract!.labelId);
            if (label && label.contractType === 'petty') {
                const fine = Math.floor(Math.random() * 750001) + 250000;
                activeData.money -= fine;

                const takenDownReleaseIds = new Set<string>();
                activeData.releases = activeData.releases.map(release => {
                    if (release.releasingLabel?.name === label.name) {
                        takenDownReleaseIds.add(release.id);
                        return { ...release, isTakenDown: true };
                    }
                    return release;
                });

                activeData.songs = activeData.songs.map(song => {
                    if (song.releaseId && takenDownReleaseIds.has(song.releaseId)) {
                        return { ...song, isTakenDown: true };
                    }
                    return song;
                });

                const artistProfile = allPlayerArtistsAndGroups.find(a => a.id === state.activeArtistId);
                if (artistProfile) {
                    activeData.inbox.push({
                        id: crypto.randomUUID(),
                        sender: label.name,
                        senderIcon: 'label',
                        subject: 'Regarding Your Departure',
                        body: `Hi ${artistProfile.name},\n\nWe've processed your departure from the label. As per our agreement, a fine of $${formatNumber(fine)} has been deducted from your account.\n\nFurthermore, all projects released under our name have been removed from streaming services and digital storefronts.\n\nWe wish you the best in your future endeavors.\n\n- ${label.name}`,
                        date: state.date,
                        isRead: false,
                    });
                }
            }
            
            const updatedData = {
                ...activeData,
                contractHistory: [...(activeData.contractHistory || []), activeData.contract],
                contract: null,
            };

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: updatedData
                }
            };
        }
        case 'SIGN_NPC_TO_LABEL': {
            if (!state.activeArtistId) return state;
            const activeData = { ...state.artistsData[state.activeArtistId] };
            if (!activeData.customLabels || activeData.customLabels.length === 0) return state;

            const { npcName, advance, royaltyRate, durationWeeks } = action.payload;

            // Find custom label
            const labelIndex = 0; // assuming single label owner
            const customLabel = { ...activeData.customLabels[labelIndex] };
            const signedNpcs = [...(customLabel.signedNpcs || [])];

            const existingIndex = signedNpcs.findIndex(n => n.name === npcName);
            if (existingIndex >= 0) {
                // Renegotiating
                signedNpcs[existingIndex] = {
                    ...signedNpcs[existingIndex],
                    status: 'active',
                    contract: {
                        advance,
                        royaltyRate,
                        durationWeeks,
                        startDate: state.date,
                    }
                };
            } else {
                signedNpcs.push({
                    id: crypto.randomUUID(),
                    name: npcName,
                    contract: {
                        advance,
                        royaltyRate,
                        durationWeeks,
                        startDate: state.date,
                    },
                    revenueGenerated: 0,
                    expenses: advance,
                    status: 'active',
                });
            }

            customLabel.signedNpcs = signedNpcs;
            const updatedLabels = [...activeData.customLabels];
            updatedLabels[labelIndex] = customLabel;

            const updatedData = {
                ...activeData,
                money: activeData.money - advance,
                customLabels: updatedLabels
            };
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: updatedData
                }
            };
        }
        case 'RELEASE_NPC_FROM_LABEL': {
            if (!state.activeArtistId) return state;
            const activeData = { ...state.artistsData[state.activeArtistId] };
            if (!activeData.customLabels || activeData.customLabels.length === 0) return state;

            const { npcName } = action.payload;

            const labelIndex = 0;
            const customLabel = { ...activeData.customLabels[labelIndex] };
            const signedNpcs = [...(customLabel.signedNpcs || [])].map(npc => {
                if (npc.name === npcName) {
                    return { ...npc, status: 'dropped' as const };
                }
                return npc;
            });

            customLabel.signedNpcs = signedNpcs;
            const updatedLabels = [...activeData.customLabels];
            updatedLabels[labelIndex] = customLabel;

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        customLabels: updatedLabels
                    }
                }
            };
        }
        case 'EDIT_SUBMISSION_DATE': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const updatedSubmissions = activeData.labelSubmissions.map(s => {
                if (s.id === action.payload.submissionId) {
                    return { ...s, projectReleaseDate: action.payload.newDate };
                }
                return s;
            });
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: { ...activeData, labelSubmissions: updatedSubmissions }
                }
            };
        }
        case 'SUBMIT_TO_LABEL': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        labelSubmissions: [...activeData.labelSubmissions, action.payload.submission],
                    }
                }
            };
        }
        case 'GO_TO_LABEL_PLAN':
            return {
                ...state,
                activeSubmissionId: action.payload.submissionId,
                currentView: 'labelReleasePlan',
            };
        case 'PLAN_LABEL_RELEASE': {
            if (!state.activeArtistId) return state;
            const { submissionId, singles, projectReleaseDate } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];

            const allCustomLabels: CustomLabel[] = [];
             for (const artistId in state.artistsData) {
                allCustomLabels.push(...state.artistsData[artistId].customLabels);
            }

            let labelMultiplier = 1;
            let avgQuality = 0;

            const submission = activeData.labelSubmissions.find(s => s.id === submissionId);
            if (submission) {
                avgQuality = submission.release.songIds.reduce((sum, id) => {
                    const song = activeData.songs.find(s => s.id === id);
                    return sum + (song?.quality || 0);
                }, 0) / (submission.release.songIds.length || 1);
            }

            if (activeData.contract) {
                let label: { promotionMultiplier: number } | undefined;
                if (activeData.contract.isCustom) {
                    label = allCustomLabels.find(l => l.id === activeData.contract!.labelId);
                } else {
                    label = LABELS.find(l => l.id === activeData.contract!.labelId);
                }
                if (label) {
                    labelMultiplier = label.promotionMultiplier;
                }
            }

            const releaseTypeMultiplier = submission?.release.type === 'Album' ? 2 : 1.25;
            const promoBudget = Math.floor((avgQuality * 5000) * labelMultiplier * releaseTypeMultiplier);

            const updatedSubmissions = activeData.labelSubmissions.map((sub): LabelSubmission => {
                if (sub.id === submissionId) {
                    return {
                        ...sub,
                        status: 'scheduled',
                        singlesToRelease: singles,
                        projectReleaseDate: projectReleaseDate,
                        promoBudget: promoBudget,
                        promoBudgetSpent: 0,
                    };
                }
                return sub;
            });

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        labelSubmissions: updatedSubmissions,
                    }
                },
                activeSubmissionId: null,
                currentView: 'game',
            };
        }
        case 'CREATE_INSTAGRAM_POST': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            
            const followers = activeData.instagramFollowers || 0;
            const popFactor = Math.pow(activeData.popularity || 0, 1.5) * 50; 
            const hypeFactor = ((activeData.hype || 0) / 100) * 0.2 + 1;
            
            // Base engagement metrics based on followers and popularity
            const baseLikes = (500 + (followers * 0.1) + popFactor) * hypeFactor;
            const viewVariance = baseLikes * 0.5 * (Math.random() - 0.5);
            let likes = Math.floor(Math.max(10, baseLikes + viewVariance));
            const comments = Math.floor(likes * (Math.random() * 0.05 + 0.01)); // 1% to 6% of likes

            const newPost: InstagramPost = {
                id: crypto.randomUUID(),
                imageUrl: action.payload.imageUrl,
                caption: action.payload.caption,
                likes,
                comments,
                date: state.date
            };

            const hypeGained = Math.floor(likes / 200000); 

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        instagramPosts: [newPost, ...(activeData.instagramPosts || [])],
                        hype: Math.min(100, activeData.hype + hypeGained),
                        instagramFollowers: followers + Math.floor(likes * 0.05)
                    }
                }
            };
        }
        case 'UPLOAD_CANVAS': {
            if (!state.activeArtistId) return state;
            const updatedArtistsData = { ...state.artistsData };
            const activeData = { ...updatedArtistsData[state.activeArtistId] };
            
            const songIndex = activeData.songs.findIndex(s => s.id === action.payload.songId);
            if (songIndex >= 0) {
                const updatedSongs = [...activeData.songs];
                updatedSongs[songIndex] = {
                    ...updatedSongs[songIndex],
                    canvasVideo: action.payload.videoUrl,
                    canvasHashtags: action.payload.hashtags
                };
                activeData.songs = updatedSongs;
                updatedArtistsData[state.activeArtistId] = activeData;
            }
            
            return {
                ...state,
                artistsData: updatedArtistsData
            };
        }
        case 'CREATE_TIKTOK': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            
            const followers = activeData.tiktokFollowers || 0;
            const popFactor = Math.pow(activeData.popularity || 0, 1.5) * 50; 
            const hypeFactor = ((activeData.hype || 0) / 100) * 0.2 + 1;
            const baseViews = (1000 + (followers * 0.2) + popFactor) * hypeFactor;
            
            const viewVariance = baseViews * 0.5 * (Math.random() - 0.5);
            let views = Math.floor(Math.max(10, baseViews + viewVariance));

            // 5-10% chance for viral video (1M-75M views)
            if (Math.random() < 0.08) {
                views = Math.floor(Math.random() * (75000000 - 1000000)) + 1000000;
            }

            const likes = Math.floor(views * (0.05 + Math.random() * 0.05));
            const comments = Math.floor(views * (0.005 + Math.random() * 0.01));

            const newTiktok: TikTokVideo = {
                id: crypto.randomUUID(),
                authorId: state.activeArtistId,
                content: action.payload.content,
                songId: action.payload.songId,
                thumbnail: action.payload.thumbnail,
                views,
                likes,
                comments,
                createdAt: state.date,
            };

            const hypeGained = Math.floor((views / 100000) * 1.5); // reduced hype gain

            let updatedSongs = activeData.songs;
            if (action.payload.songId) {
                const addedStreams = Math.floor(views * 0.05); // 5% of views become streams
                updatedSongs = updatedSongs.map(s => s.id === action.payload.songId ? { ...s, streams: (s.streams || 0) + addedStreams } : s);
            }

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        songs: updatedSongs,
                        tiktokVideos: [newTiktok, ...(activeData.tiktokVideos || [])],
                        hype: Math.min(100, activeData.hype + hypeGained),
                        tiktokFollowers: followers + Math.floor(views * 0.01)
                    }
                }
            };
        }
        case 'ACCEPT_GENIUS_OFFER': {
            if (!state.activeArtistId) return state;
            const { songId, emailId } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];
            const updatedInbox = activeData.inbox.map(email => {
                if (email.id === emailId && email.offer?.type === 'geniusInterview') {
                    return {
                        ...email,
                        offer: { ...email.offer, isAccepted: true }
                    };
                }
                return email;
            });

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        money: activeData.money + 100000,
                        inbox: updatedInbox,
                    }
                },
                activeGeniusOffer: { songId, emailId },
                currentView: 'createGeniusInterview',
            };
        }
        case 'CREATE_GENIUS_INTERVIEW': {
            if (!state.activeArtistId || !state.activeGeniusOffer) return state;
            const { video } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];

            const updatedSongs = activeData.songs.map(song => {
                if (song.id === state.activeGeniusOffer!.songId) {
                    return { ...song, pitchforkBoost: true };
                }
                return song;
            });

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        videos: [...activeData.videos, video],
                        songs: updatedSongs,
                        hype: Math.min(getHypeCap(activeData), activeData.hype + 15),
                    }
                },
                activeGeniusOffer: null,
                currentView: 'youtube',
            };
        }
        case 'CANCEL_GENIUS_OFFER': {
            return {
                ...state,
                activeGeniusOffer: null,
                currentView: 'inbox',
            };
        }
        case 'ACCEPT_ONTHERADAR_OFFER': {
            if (!state.activeArtistId) return state;
            const { songId, emailId } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];
            const updatedInbox = activeData.inbox.map(email => {
                if (email.id === emailId && email.offer?.type === 'onTheRadarOffer') {
                    return { ...email, offer: { ...email.offer, isAccepted: true } };
                }
                return email;
            });

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        hype: Math.min(getHypeCap(activeData), activeData.hype + 10),
                        inbox: updatedInbox,
                    }
                },
                activeOnTheRadarOffer: { songId, emailId },
                currentView: 'createOnTheRadarPerformance',
            };
        }
        case 'CREATE_ONTHERADAR_PERFORMANCE': {
            if (!state.activeArtistId || !state.activeOnTheRadarOffer) return state;
            const { video } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];

            const updatedSongs = activeData.songs.map(song => {
                if (song.id === state.activeOnTheRadarOffer!.songId) {
                    return { ...song, pitchforkBoost: true }; // Re-using for generic boost
                }
                return song;
            });

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        videos: [...activeData.videos, video],
                        songs: updatedSongs,
                        hype: Math.min(getHypeCap(activeData), activeData.hype + 20),
                    }
                },
                activeOnTheRadarOffer: null,
                currentView: 'youtube',
            };
        }
        case 'CANCEL_ONTHERADAR_OFFER': {
            return {
                ...state,
                activeOnTheRadarOffer: null,
                currentView: 'inbox',
            };
        }
        case 'ACCEPT_TRSHD_OFFER': {
            if (!state.activeArtistId) return state;
            const { songId, emailId } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];
            const updatedInbox = activeData.inbox.map(email => {
                if (email.id === emailId && email.offer?.type === 'trshdOffer') {
                    return { ...email, offer: { ...email.offer, isAccepted: true } };
                }
                return email;
            });

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        hype: Math.min(getHypeCap(activeData), activeData.hype + 10),
                        inbox: updatedInbox,
                    }
                },
                activeTrshdOffer: { songId, emailId },
                currentView: 'createTrshdPerformance',
            };
        }
        case 'CREATE_TRSHD_PERFORMANCE': {
            if (!state.activeArtistId || !state.activeTrshdOffer) return state;
            const { video } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];

            const updatedSongs = activeData.songs.map(song => {
                if (song.id === state.activeTrshdOffer!.songId) {
                    return { ...song, pitchforkBoost: true }; // Re-using for generic boost
                }
                return song;
            });

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        videos: [...activeData.videos, video],
                        songs: updatedSongs,
                        hype: Math.min(getHypeCap(activeData), activeData.hype + 20),
                    }
                },
                activeTrshdOffer: null,
                currentView: 'youtube',
            };
        }
        case 'CANCEL_TRSHD_OFFER': {
            return {
                ...state,
                activeTrshdOffer: null,
                currentView: 'inbox',
            };
        }
        case 'ACCEPT_FALLON_OFFER': {
            if (!state.activeArtistId) return state;
            const { releaseId, offerType, emailId } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];
            const updatedInbox = activeData.inbox.map(email => {
                if (email.id === emailId && email.offer?.type === 'fallonOffer') {
                    return { ...email, offer: { ...email.offer, isAccepted: true } };
                }
                return email;
            });

            const firstStepView = offerType === 'interview' ? 'createFallonInterview' : 'createFallonPerformance';
            const firstStep = offerType === 'interview' ? 'interview' : 'performance';

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        inbox: updatedInbox,
                    }
                },
                activeFallonOffer: { releaseId, offerType, emailId, step: firstStep },
                currentView: firstStepView,
            };
        }
        case 'CREATE_FALLON_VIDEO': {
            if (!state.activeArtistId || !state.activeFallonOffer) return state;
            
            const { video, songId } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];
            const artistProfile = state.soloArtist || state.group;
            if (!artistProfile) return state;

            const updatedData: ArtistData = {
                ...activeData,
                videos: [...activeData.videos, video],
                hype: Math.min(getHypeCap(activeData), activeData.hype + 25),
            };

            let postContent = '';
            let postImage: string | undefined = video.thumbnail;
            
            if (video.type === 'Live Performance' && songId) {
                const song = activeData.songs.find(s => s.id === songId);
                if (song) {
                    postContent = `${artistProfile.name} delivers an incredible performance of '${song.title}' on Jimmy Fallon.\n\nWatch: youtu.be/sIdlL8V83Cc`;
                }
            } else if (video.type === 'Interview') {
                const release = activeData.releases.find(r => r.id === state.activeFallonOffer!.releaseId);
                const pronounNominative = artistProfile.pronouns === 'he/him' ? 'he' : artistProfile.pronouns === 'she/her' ? 'she' : 'they';
                const pronounPossessive = artistProfile.pronouns === 'he/him' ? 'his' : artistProfile.pronouns === 'she/her' ? 'her' : 'their';
                const interviewTropes = [
                    `reveals on Jimmy Fallon that ${pronounNominative} want${artistProfile.pronouns === 'they/them' ? '' : 's'} to do more acting: "I'm very scared to freak my fans out... but I really do love acting. I'd love for that."`,
                    `teases a new sound for ${pronounPossessive} next project on Jimmy Fallon: "I'm experimenting a lot right now, it's very different."`,
                    `talks about the meaning behind ${pronounPossessive} new album '${release?.title || ''}' on Jimmy Fallon: "It's my most personal work yet, I poured everything into it."`
                ];
                postContent = `${artistProfile.name} ${interviewTropes[Math.floor(Math.random() * interviewTropes.length)]}`;
            }

            if (postContent) {
                const newPost: XPost = {
                    id: crypto.randomUUID(),
                    authorId: 'popbase',
                    content: postContent,
                    image: postImage,
                    likes: Math.floor(Math.random() * 30000) + 15000,
                    retweets: Math.floor(Math.random() * 7000) + 2000,
                    views: Math.floor(Math.random() * 800000) + 200000,
                    date: state.date,
                };
                updatedData.xPosts.unshift(newPost);
            }
            
            let newState = { ...state };
            if (state.activeFallonOffer.offerType === 'both' && state.activeFallonOffer.step === 'performance') {
                newState.activeFallonOffer = { ...state.activeFallonOffer, step: 'interview' };
                newState.currentView = 'createFallonInterview';
            } else {
                newState.activeFallonOffer = null;
                newState.currentView = 'youtube';
            }
            
            newState.artistsData = { ...state.artistsData, [state.activeArtistId]: updatedData };
            return newState;
        }
        case 'CANCEL_FALLON_OFFER': {
            return {
                ...state,
                activeFallonOffer: null,
                currentView: 'inbox',
            };
        }
        case 'ADD_ARTIST_IMAGE': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            if (activeData.artistImages.length >= 100) return state;
            
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        artistImages: [...activeData.artistImages, action.payload]
                    }
                }
            };
        }
        case 'ADD_ARTIST_VIDEO': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            if (activeData.artistVideoThumbnails.length >= 10) return state;
            
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        artistVideoThumbnails: [...activeData.artistVideoThumbnails, action.payload]
                    }
                }
            };
        }
        case 'ADD_PAPARAZZI_PHOTO': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        paparazziPhotos: [...activeData.paparazziPhotos, action.payload.photo],
                    }
                }
            };
        }
        case 'ANSWER_POPBASE_QUESTION': {
            if (!state.activeArtistId) return state;
            const { emailId, answer } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];
            const playerUser = activeData.selectedPlayerXUserId ? activeData.xUsers.find(u => u.id === activeData.selectedPlayerXUserId) : activeData.xUsers.find(u => u.isPlayer);

            if (!playerUser) return state;

            const email = activeData.inbox.find(e => e.id === emailId);
            const offer = email?.offer as PopBaseOffer | undefined;

            if (!offer) return state;

            const updatedInbox = activeData.inbox.map(email => {
                if (email.id === emailId && email.offer?.type.startsWith('popBase')) {
                    return { ...email, offer: { ...email.offer, isAnswered: true } };
                }
                return email;
            });

            let popBaseContent = '';
            if (offer.type === 'popBaseClarification') {
                popBaseContent = `${playerUser.name} addresses recent controversy regarding ${offer.originalPostContent}:\n\n"${answer}"`;
            } else if (offer.type === 'popBaseInterview') {
                popBaseContent = `${playerUser.name} on ${offer.question?.toLowerCase()}:\n\n"${answer}"`;
            }

            if (!popBaseContent) return state;

            const newPost: XPost = { id: crypto.randomUUID(), authorId: 'popbase', content: popBaseContent, likes: Math.floor(Math.random() * 40000) + 20000, retweets: Math.floor(Math.random() * 8000) + 3000, views: Math.floor(Math.random() * 1000000) + 400000, date: state.date, };
            const hypeBoost = offer.isControversial ? 10 : 5;

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        inbox: updatedInbox,
                        xPosts: [newPost, ...activeData.xPosts],
                        hype: Math.min(getHypeCap(activeData), activeData.hype + hypeBoost),
                    }
                },
                currentView: 'inbox',
            };
        }
        case 'POST_ON_X': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            
            const playerUser = activeData.selectedPlayerXUserId 
                ? activeData.xUsers.find(u => u.id === activeData.selectedPlayerXUserId)
                : activeData.xUsers.find(u => u.isPlayer);
            if (!playerUser) return state;

            const baseFollowers = playerUser.followersCount || 1000;
            const popularityMultiplier = 1 + (activeData.popularity / 100);
            const views = Math.floor(baseFollowers * (Math.random() * 0.8 + 0.4) * popularityMultiplier + (activeData.hype * 1000));
            const likes = Math.floor(views * (Math.random() * 0.08 + 0.02)); // 2-10% of views
            const retweets = Math.floor(likes * (Math.random() * 0.15 + 0.05)); // 5-20% of likes

            const { content, image, postType, targetId, songId, quoteOf } = action.payload;
            let postContent = content;

            if (postType === 'push' && songId) {
                const song = activeData.songs.find(s => s.id === songId);
                if (song) {
                    postContent = content.trim() ? content : `push ${song.title} to top 10 on iTunes`;
                }
            }

            const newPost: XPost = {
                id: action.payload.id || crypto.randomUUID(),
                authorId: playerUser.id,
                content: postContent,
                image: image,
                likes: likes,
                retweets: retweets,
                views: views,
                date: state.date,
                quoteOf: quoteOf,
            };

            const updatedPosts = [newPost, ...activeData.xPosts];
            
            if (postType === 'announce' && action.payload.announceItem) {
                const { type, submissionId, songId } = action.payload.announceItem;
                const submission = activeData.labelSubmissions.find(s => s.id === submissionId);
                const artistName = state.soloArtist?.name || state.group?.name || 'Artist';

                if (submission) {
                    let projectTypeStr = submission.release.type;
                    let projectTitle = submission.release.title;
                    let releaseDateStr = 'soon';
                    
                    if (type === 'project') {
                        submission.isProjectAnnounced = true;
                        if (submission.projectReleaseDate) {
                            releaseDateStr = `Week ${submission.projectReleaseDate.week}, ${submission.projectReleaseDate.year}`;
                        }
                    } else if (type === 'single' && songId) {
                        const single = submission.singlesToRelease?.find(s => s.songId === songId);
                        if (single) {
                            single.isAnnounced = true;
                            if (single.releaseDate) {
                                releaseDateStr = `Week ${single.releaseDate.week}, ${single.releaseDate.year}`;
                            }
                        }
                        const song = activeData.songs.find(s => s.id === songId);
                        if (song) {
                            projectTitle = song.title;
                            projectTypeStr = 'Single';
                        }
                    }

                    // Pop Base Tweet
                    const popBasePost: XPost = {
                        id: crypto.randomUUID(),
                        authorId: 'popbase',
                        content: `${artistName} announces a new ${projectTypeStr} "${projectTitle}" out ${releaseDateStr}.`,
                        image: submission.release.coverArt,
                        likes: Math.floor(Math.random() * 80000) + 30000,
                        retweets: Math.floor(Math.random() * 20000) + 5000,
                        views: Math.floor(Math.random() * 1500000) + 500000,
                        date: state.date
                    };
                    updatedPosts.unshift(popBasePost);

                    const activeArtist = allPlayerArtistsAndGroups.find(a => a.id === state.activeArtistId);
                    const pronounPossessive = (activeArtist && 'pronouns' in activeArtist) ? (activeArtist.pronouns === 'he/him' ? 'his' : activeArtist.pronouns === 'she/her' ? 'her' : 'their') : 'their';
                    const pronounNominative = (activeArtist && 'pronouns' in activeArtist) ? (activeArtist.pronouns === 'he/him' ? 'he' : activeArtist.pronouns === 'she/her' ? 'she' : 'they') : 'they';
                    const isAre = (activeArtist && 'pronouns' in activeArtist && activeArtist.pronouns === 'they/them') ? 'are' : 'is';
                    const addsS = (activeArtist && 'pronouns' in activeArtist && activeArtist.pronouns === 'they/them') ? '' : 's';
                    const tmzPost: XPost = {
                        id: crypto.randomUUID(),
                        authorId: 'tmz',
                        content: `${artistName} is dropping ${projectTypeStr === 'Single' ? 'a new track' : 'another project'} soon... let's hope ${pronounNominative} actually put${addsS} effort into this one, unlike ${pronounPossessive} tragic outfit choices lately. 😬👀`,
                        image: activeData.paparazziPhotos.length > 0 ? activeData.paparazziPhotos[Math.floor(Math.random() * activeData.paparazziPhotos.length)].url : undefined,
                        likes: Math.floor(Math.random() * 40000) + 10000,
                        retweets: Math.floor(Math.random() * 8000) + 2000,
                        views: Math.floor(Math.random() * 900000) + 300000,
                        date: state.date
                    };
                    updatedPosts.unshift(tmzPost);

                    // Add Fan Excitement Quote
                    const fanContent1 = [
                        `we prayed for times like these 😭`,
                        `oh my god ${pronounNominative}'${isAre === 'is' ? 's' : 're'} actually dropping!!`,
                        `${pronounNominative} ${isAre} finally coming to save pop music`,
                        `wait ${pronounNominative} ${isAre} dropping ${projectTypeStr === 'Single' ? 'a single' : 'an album'}? IM SHAKING`,
                        `i literally just screamed. ${pronounPossessive} new era ${isAre} going to end everyone`
                    ][Math.floor(Math.random() * 5)];

                    const fanFanUser = activeData.xUsers.find(u => u.id.startsWith('addiction_fan_')) || activeData.xUsers.find(u => !u.isPlayer && !u.isVerified && !['popbase', 'tmz', 'chartdata', 'spotifysnapshot'].includes(u.id));

                    if (fanFanUser) {
                        const fanPost: XPost = {
                            id: crypto.randomUUID(),
                            authorId: fanFanUser.id,
                            quoteOf: popBasePost,
                            content: fanContent1,
                            likes: Math.floor(Math.random() * 50000) + 10000,
                            retweets: Math.floor(Math.random() * 10000) + 2000,
                            views: Math.floor(Math.random() * 500000) + 100000,
                            date: state.date
                        };
                        updatedPosts.unshift(fanPost);
                    }
                }
            }

            const updatedData: ArtistData = {
                ...activeData,
                xPosts: updatedPosts,
            };

            if (postType === 'push' && songId) {
                updatedData.lastPushToItunesWeek = state.date.year * 52 + state.date.week;
                updatedData.lastPushedSongId = songId;
            }

            if (postType === 'fanWar' && targetId) {
                updatedData.fanWarStatus = {
                    targetArtistName: targetId,
                    weeksRemaining: 4 // Fan wars last 4 weeks
                };
            }

            return {
                ...state,
                artistsData: { ...state.artistsData, [state.activeArtistId]: updatedData },
            };
        }
        case 'REPLY_TO_X_POST': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const { postId, content, image, authorId } = action.payload;

            const newComment: XComment = {
                id: crypto.randomUUID(),
                authorId,
                content,
                image,
                date: state.date,
                likes: 0
            };

            const updatedPosts = activeData.xPosts.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        comments: [...(post.comments || []), newComment]
                    };
                }
                return post;
            });

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        xPosts: updatedPosts
                    }
                }
            };
        }
        case 'SELECT_X_ACCOUNT': {
            if (!state.activeArtistId) return state;
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...state.artistsData[state.activeArtistId],
                        selectedPlayerXUserId: action.payload.accountId,
                    }
                }
            };
        }
        case 'BUY_X_VERIFICATION': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            if (activeData.money < action.payload.cost) return state;

            const updatedUsers = activeData.xUsers.map(u => {
                if (u.id === action.payload.accountId) {
                    return {
                        ...u,
                        isVerified: action.payload.tier,
                        verifiedSince: state.date.year,
                    };
                }
                return u;
            });

            const newEmail: Email = {
                id: crypto.randomUUID(),
                sender: 'X Accounts & Billing',
                subject: 'Welcome to X Premium',
                body: `You have successfully subscribed to X Premium (${action.payload.tier === 'gold' ? 'Gold' : 'Blue'}).\n\nYou were charged $${formatNumber(action.payload.cost)} for your first month. Your subscription will renew automatically every month.\n\nThank you for trusting X.`,
                date: state.date,
                isRead: false
            };

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        xUsers: updatedUsers,
                        money: activeData.money - action.payload.cost,
                        inbox: [newEmail, ...activeData.inbox]
                    }
                }
            };
        }
        case 'START_X_SPACE': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const playerUser = activeData.selectedPlayerXUserId ? activeData.xUsers.find(u => u.id === activeData.selectedPlayerXUserId) : activeData.xUsers.find(u => u.isPlayer);
            if (!playerUser) return state;

            const newPost: XPost = {
                id: crypto.randomUUID(),
                authorId: playerUser.id,
                content: `Listening to ${action.payload.topic}`,
                likes: Math.floor(Math.random() * 5000),
                retweets: Math.floor(Math.random() * 500),
                views: Math.floor(Math.random() * 50000),
                date: state.date,
                isSpace: true,
                spaceInfo: {
                    listeners: Math.floor(Math.random() * 5000) + 1000
                }
            };
            
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        xPosts: [newPost, ...activeData.xPosts]
                    }
                }
            };
        }
        case 'PROMOTE_SONG_ON_X_SPACE': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const { songId, listeners } = action.payload;
            const addedStreams = Math.floor(listeners * (Math.random() * 50 + 50));
            const addedSells = Math.floor(listeners * (Math.random() * 0.5 + 0.1));
            
            const updatedSongs = activeData.songs.map(song => 
                song.id === songId ? {
                    ...song,
                    streams: song.streams + addedStreams,
                    itunesSalesWeek: (song.itunesSalesWeek || 0) + addedSells
                } : song
            );

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        songs: updatedSongs
                    }
                }
            };
        }
        case 'END_X_SPACE': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const playerUser = activeData.selectedPlayerXUserId ? activeData.xUsers.find(u => u.id === activeData.selectedPlayerXUserId) : activeData.xUsers.find(u => u.isPlayer);
            if (!playerUser) return state;

            // Find the most recent space post by user and mark it ended
            const postIndex = activeData.xPosts.findIndex(p => p.authorId === playerUser.id && p.isSpace && (!p.spaceInfo?.isEnded));
            if (postIndex === -1) return state;

            const updatedPosts = [...activeData.xPosts];
            updatedPosts[postIndex] = {
                ...updatedPosts[postIndex],
                spaceInfo: {
                    ...updatedPosts[postIndex].spaceInfo!,
                    isEnded: true
                }
            };
            
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        xPosts: updatedPosts
                    }
                }
            };
        }
        case 'CREATE_X_ACCOUNT': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const playerAccounts = activeData.xUsers.filter(u => u.isPlayer);
            if (playerAccounts.length >= 5) return state; // Limit to 5 accounts

            const newAccount: XUser = {
                id: crypto.randomUUID(),
                name: action.payload.name,
                username: action.payload.username,
                avatar: action.payload.avatar,
                bio: action.payload.bio,
                isPlayer: true,
                isVerified: false,
                followersCount: 0,
                followingCount: 0,
            };

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        xUsers: [...activeData.xUsers, newAccount],
                        selectedPlayerXUserId: newAccount.id,
                    }
                }
            };
        }
        case 'DELETE_X_ACCOUNT': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const playerAccounts = activeData.xUsers.filter(u => u.isPlayer);
            if (playerAccounts.length <= 1) return state; // Must have at least one account

            const updatedUsers = activeData.xUsers.filter(u => u.id !== action.payload.accountId);
            let newSelected = activeData.selectedPlayerXUserId;
            if (newSelected === action.payload.accountId) {
                newSelected = updatedUsers.find(u => u.isPlayer)?.id;
            }

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        xUsers: updatedUsers,
                        selectedPlayerXUserId: newSelected,
                    }
                }
            };
        }
        case 'VIEW_X_PROFILE':
            return { ...state, selectedXUserId: action.payload, currentView: 'xProfile' };
        case 'VIEW_X_CHAT':
            return { ...state, selectedXChatId: action.payload, currentView: 'xChatDetail' };
        case 'FOLLOW_X_USER': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            if (activeData.xFollowingIds.includes(action.payload)) return state;
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        xFollowingIds: [...activeData.xFollowingIds, action.payload],
                    }
                }
            };
        }
        case 'UNFOLLOW_X_USER': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        xFollowingIds: activeData.xFollowingIds.filter(id => id !== action.payload),
                    }
                }
            };
        }
        case 'ADD_X_USER': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            return {
                ...state,
                 artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        xUsers: [...activeData.xUsers, action.payload]
                    }
                }
            };
        }
        case 'CREATE_X_CHAT': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            return {
                ...state,
                 artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        xChats: [...activeData.xChats, action.payload],
                    }
                },
                currentView: 'xChatDetail',
                selectedXChatId: action.payload.id
            };
        }
        case 'SEND_X_MESSAGE': {
             if (!state.activeArtistId) return state;
            const { chatId, message } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];

            const updatedChats = activeData.xChats.map(chat => {
                if (chat.id === chatId) {
                    return { ...chat, messages: [...chat.messages, message] };
                }
                return chat;
            });

            return {
                ...state,
                 artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        xChats: updatedChats,
                    }
                }
            };
        }
        case 'APPEAL_X_SUSPENSION': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
        
            if (activeData.xSuspensionStatus && activeData.xSuspensionStatus.isSuspended && !activeData.xSuspensionStatus.appealSentDate) {
                const updatedSuspensionStatus = {
                    ...activeData.xSuspensionStatus,
                    appealSentDate: state.date,
                };
                return {
                    ...state,
                    artistsData: {
                        ...state.artistsData,
                        [state.activeArtistId]: {
                            ...activeData,
                            xSuspensionStatus: updatedSuspensionStatus,
                        }
                    }
                };
            }
            return state;
        }
        case 'SET_ARTIST_PICK': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        artistPick: action.payload
                    }
                }
            };
        }
        case 'PITCH_TO_PLAYLIST': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            if (activeData.money < PLAYLIST_PITCH_COST) return state;

            let updatedSongs = [...activeData.songs];

            // In the new system, we just set playlistBoostWeeks. The actual inclusion and success
            // is organically calculated every week inside ADVANCE_WEEK based on their resulting score!
            updatedSongs = updatedSongs.map(song => {
                if (song.id === action.payload.songId) {
                    return { ...song, playlistBoostWeeks: PLAYLIST_BOOST_WEEKS };
                }
                return song;
            });

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        money: activeData.money - PLAYLIST_PITCH_COST,
                        songs: updatedSongs,
                    }
                }
            };
        }
        case 'CREATE_CUSTOM_LABEL': {
            if (!state.activeArtistId) return state;
            const { label, cost, membersToSign } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];

            // Create contract for owner
            const ownerContract: Contract = {
                labelId: label.id,
                isCustom: true,
                artistId: state.activeArtistId,
                startDate: state.date,
                albumsReleased: 0,
            };

            const updatedArtistsData = { ...state.artistsData };

            const artist = allPlayerArtistsAndGroups.find(a => a.id === state.activeArtistId);
            let newPosts: XPost[] = [];

            if(artist) {
                const playerUser = activeData.selectedPlayerXUserId ? activeData.xUsers.find(u => u.id === activeData.selectedPlayerXUserId) : activeData.xUsers.find(u => u.isPlayer);
                if (playerUser) {
                    const pronounPossessive = 'pronouns' in artist ? (artist.pronouns === 'he/him' ? 'his' : artist.pronouns === 'she/her' ? 'her' : 'their') : 'their';
                    let content = `${artist.name} is starting ${pronounPossessive} own record label, "${label.name}". Boss moves.`;
                    if (label.dealWithMajorId) {
                        const major = LABELS.find(l => l.id === label.dealWithMajorId);
                        content = `${artist.name} is launching a new imprint, "${label.name}", in partnership with ${major?.name}.`;
                    }
                    newPosts.push({
                        id: crypto.randomUUID(),
                        authorId: 'tmz',
                        content,
                        image: playerUser.avatar,
                        likes: Math.floor(Math.random() * 5000) + 1000,
                        retweets: Math.floor(Math.random() * 1000) + 200,
                        views: Math.floor(Math.random() * 400000) + 150000,
                        date: state.date,
                    });
                }
            }


            // Update owner's data
            updatedArtistsData[state.activeArtistId] = {
                ...activeData,
                customLabels: [...activeData.customLabels, label],
                money: activeData.money - cost,
                contract: ownerContract,
                xPosts: [...newPosts, ...activeData.xPosts],
            };

            // Create contracts for signed members
            for (const memberId of membersToSign) {
                const memberData = state.artistsData[memberId];
                if (memberData) {
                    const memberContract: Contract = {
                        labelId: label.id,
                        isCustom: true,
                        artistId: memberId,
                        startDate: state.date,
                        albumsReleased: 0,
                    };
                    updatedArtistsData[memberId] = {
                        ...memberData,
                        contract: memberContract,
                    };
                }
            }

            return {
                ...state,
                artistsData: updatedArtistsData,
                currentView: 'game',
                activeTab: 'Business',
            };
        }
        case 'DELETE_SONG': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const updatedSongs = activeData.songs.filter(song => song.id !== action.payload.songId);
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        songs: updatedSongs,
                    }
                }
            };
        }
        case 'GO_TO_ALBUM_PROMO':
            return {
                ...state,
                activeSubmissionId: action.payload.submissionId,
                currentView: 'albumPromo',
            };
        case 'LAUNCH_COUNTDOWN_PAGE': {
            if (!state.activeArtistId) return state;
            const { submissionId, cost } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];
        
            const updatedSubmissions = activeData.labelSubmissions.map(sub => {
                if (sub.id === submissionId) {
                    return {
                        ...sub,
                        hasCountdownPage: true,
                        promoBudgetSpent: (sub.promoBudgetSpent || 0) + cost,
                    };
                }
                return sub;
            });
        
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        labelSubmissions: updatedSubmissions,
                    }
                }
            };
        }
        case 'REQUEST_GENIUS_PROMO': {
            if (!state.activeArtistId) return state;
            const { submissionId, songId, cost } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];
        
            const updatedSubmissions = activeData.labelSubmissions.map(sub => {
                if (sub.id === submissionId) {
                    return {
                        ...sub,
                        geniusInterviewRequestedForSongId: songId,
                        promoBudgetSpent: (sub.promoBudgetSpent || 0) + cost,
                    };
                }
                return sub;
            });
        
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        labelSubmissions: updatedSubmissions,
                    }
                }
            };
        }
        case 'REQUEST_FALLON_PROMO': {
            if (!state.activeArtistId) return state;
            const { submissionId, songId, cost } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];
        
            const updatedSubmissions = activeData.labelSubmissions.map(sub => {
                if (sub.id === submissionId) {
                    return {
                        ...sub,
                        fallonPerformanceRequestedForSongId: songId,
                        promoBudgetSpent: (sub.promoBudgetSpent || 0) + cost,
                    };
                }
                return sub;
            });
        
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        labelSubmissions: updatedSubmissions,
                    }
                }
            };
        }
        case 'RESET_GAME':
            return initialState;
        case 'SET_ONLINE_ARTISTS': {
            return {
                ...state,
                onlineArtists: action.payload
            };
        }
        case 'SYNC_ONLINE_POSTS': {
             if (!state.activeArtistId) return state;
             const activeData = state.artistsData[state.activeArtistId];
             // Parse posts from firebase:
             // action.payload = [{id, authorId, authorName, content, createdAt}, ...]
             const syncedPosts: XPost[] = action.payload.map(p => ({
                 id: p.id,
                 authorId: p.authorId,
                 authorName: p.authorName, // Custom field just for viewing
                 content: p.content,
                 likes: p.likes ?? Math.floor(Math.random() * 100),
                 retweets: p.retweets ?? Math.floor(Math.random() * 20),
                 views: p.views ?? Math.floor(Math.random() * 1000),
                 date: state.date, // maybe real timestamp is better
                 createdAt: p.createdAt,
             }));

             // merge with existing, replacing any with same id, avoid duplicates
             const existingPosts = (activeData.xPosts || []).filter(ep => !syncedPosts.find(sp => sp.id === ep.id));

             return {
                 ...state,
                 artistsData: {
                     ...state.artistsData,
                     [state.activeArtistId]: {
                         ...activeData,
                         xPosts: [...syncedPosts, ...existingPosts].sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0))
                     }
                 }
             };
        }
        case 'SYNC_ONLINE_MESSAGES': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            
            // Build chats map from payload
            const chatsMap = new Map<string, XChat>();

            // pre-populate with existing non-firebase chats (NPCs)
            (activeData.xChats || []).forEach(c => {
                if (!c.id.includes('_')) { // Assuming firebase chats have '_'
                    chatsMap.set(c.id, c);
                }
            });
            
            action.payload.forEach(msg => {
                 // chat ID is senderId_receiverId
                 const chatId = msg.chatId;
                 const otherId = msg.senderId === state.activeArtistId ? msg.receiverId : msg.senderId;
                 const otherUser = Object.values(state.onlineArtists || {}).find((a: any) => a.id === otherId) as any;
                 
                 const messageOb: XMessage = {
                     id: msg.id,
                     senderId: msg.senderId,
                     text: msg.text,
                     date: state.date,
                     createdAt: msg.createdAt
                 };
                 
                 if (!chatsMap.has(chatId)) {
                     chatsMap.set(chatId, {
                         id: chatId,
                         name: otherUser?.name || 'Unknown',
                         avatar: 'https://ui-avatars.com/api/?background=random&name=' + encodeURIComponent(otherUser?.name || 'Unknown'),
                         isGroup: false,
                         participants: [state.activeArtistId, otherId],
                         messages: [messageOb],
                         isRead: true
                     });
                 } else {
                     const chat = chatsMap.get(chatId)!;
                     if (!chat.messages.find(m => m.id === messageOb.id)) {
                         chat.messages.push(messageOb);
                     }
                 }
            });
            
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        xChats: Array.from(chatsMap.values())
                    }
                }
            };
        }
        case 'SYNC_FEATURE_REQUESTS': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const requests = action.payload; // array of requests

            let newEmails = [...(activeData.inbox || [])];
            let changed = false;

            requests.forEach(req => {
                const existing = newEmails.find(e => e.offer?.type === 'onlineFeatureOffer' && (e.offer as OnlineFeatureOffer).itemId === req.targetId);
                if (!existing) {
                    newEmails.push({
                        id: crypto.randomUUID(),
                        sender: req.senderName,
                        subject: `Feature Request for ${req.title}`,
                        body: `I'd like you to feature on my new ${req.requestType === 'song' ? 'track' : 'music video'} "${req.title}". My budget for this is $${req.cost.toLocaleString()}.`,
                        date: { ...state.date },
                        isRead: false,
                        offer: {
                            type: 'onlineFeatureOffer',
                            senderId: req.senderId,
                            senderName: req.senderName,
                            requestType: req.requestType,
                            itemId: req.targetId,
                            requestId: req.id,
                            title: req.title,
                            payout: req.cost,
                            emailId: '',
                            isAccepted: false,
                        }
                    });
                    changed = true;
                }
            });

            if (!changed) return state;

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        inbox: newEmails
                    }
                }
            };
        }
        case 'SYNC_FEATURE_APPROVALS': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const approvals = action.payload; // array of accepted requests where we are sender

            let newSongs = [...(activeData.songs || [])];
            let newVideos = [...(activeData.videos || [])];
            let newEmails = [...(activeData.inbox || [])];
            let changed = false;

            approvals.forEach(req => {
                if (req.requestType === 'song') {
                    const song = newSongs.find(s => s.id === req.targetId);
                    if (song && song.pendingFeatureApproval) {
                        song.pendingFeatureApproval = false;
                        changed = true;
                        newEmails.push({
                            id: crypto.randomUUID(),
                            sender: req.receiverId, // would be nice to have name, but this is a system message 
                            subject: `Feature Appoved: ${req.title}`,
                            body: `Your feature request for "${req.title}" was accepted! You can now release it.`,
                            date: { ...state.date },
                            isRead: false,
                        });
                    }
                } else if (req.requestType === 'music_video') {
                    const video = newVideos.find(v => v.id === req.targetId);
                    if (video && video.pendingFeatureApproval) {
                        video.pendingFeatureApproval = false;
                        changed = true;
                        newEmails.push({
                            id: crypto.randomUUID(),
                            sender: req.receiverId,
                            subject: `Video Feature Appoved: ${req.title}`,
                            body: `Your video feature request for "${req.title}" was accepted! The video is now live.`,
                            date: { ...state.date },
                            isRead: false,
                        });
                    }
                }
            });

            if (!changed) return state;

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        songs: newSongs,
                        videos: newVideos,
                        inbox: newEmails,
                    }
                }
            };
        }
        case 'ACCEPT_ONLINE_FEATURE': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const { requestId, payout } = action.payload as OnlineFeatureOffer;

            let updatedEmails = activeData.inbox.map(e => {
                if (e.offer?.type === 'onlineFeatureOffer' && e.offer.requestId === requestId) {
                    return { ...e, offer: { ...e.offer, isAccepted: true } };
                }
                return e;
            });

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        money: activeData.money + payout,
                        inbox: updatedEmails,
                    }
                }
            };
        }
        case 'DECLINE_ONLINE_FEATURE': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const { requestId } = action.payload as OnlineFeatureOffer;

            let updatedEmails = activeData.inbox.map(e => {
                if (e.offer?.type === 'onlineFeatureOffer' && e.offer.requestId === requestId) {
                    return { ...e, offer: { ...e.offer, isAccepted: true } }; // mark as processed
                }
                return e;
            });

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        inbox: updatedEmails,
                    }
                }
            };
        }
        case 'LOAD_GAME': {
            const loadedPlaylists = action.payload.spotifyPlaylists || DEFAULT_SPOTIFY_PLAYLISTS;
            const mergedPlaylists = [...loadedPlaylists];
            
            DEFAULT_SPOTIFY_PLAYLISTS.forEach(defaultPlaylist => {
                if (!mergedPlaylists.find(p => p.id === defaultPlaylist.id)) {
                    mergedPlaylists.push(defaultPlaylist);
                }
            });

            const newState = {
                ...action.payload,
                spotifyGlobal: action.payload.spotifyGlobal || (action.payload as any).spotifyGlobal50 || [],
                spotifyPlaylists: mergedPlaylists,
                difficultyMode: action.payload.difficultyMode || 'normal',
            };
            if (newState.artistsData) {
                for (const id in newState.artistsData) {
                    const data = newState.artistsData[id];
                    newState.artistsData[id] = {
                        ...initialArtistData,
                        ...data,
                    };
                    newState.artistsData[id].videos = newState.artistsData[id].videos || [];
                    newState.artistsData[id].tiktokVideos = newState.artistsData[id].tiktokVideos || [];
                    newState.artistsData[id].merch = newState.artistsData[id].merch || [];
                    newState.artistsData[id].tours = newState.artistsData[id].tours || [];
                    newState.artistsData[id].contractHistory = newState.artistsData[id].contractHistory || [];
                    newState.artistsData[id].customLabels = newState.artistsData[id].customLabels || [];
                    newState.artistsData[id].artistImages = newState.artistsData[id].artistImages || [];
                    newState.artistsData[id].artistVideoThumbnails = newState.artistsData[id].artistVideoThumbnails || [];
                    newState.artistsData[id].paparazziPhotos = newState.artistsData[id].paparazziPhotos || [];
                    newState.artistsData[id].tourPhotos = newState.artistsData[id].tourPhotos || [];
                    newState.artistsData[id].followersHistory = newState.artistsData[id].followersHistory || [];
                    newState.artistsData[id].promotions = newState.artistsData[id].promotions || [];
                    newState.artistsData[id].streamsHistory = newState.artistsData[id].streamsHistory || [];
                    newState.artistsData[id].xFollowingIds = newState.artistsData[id].xFollowingIds || [];
                    newState.artistsData[id].xTrends = newState.artistsData[id].xTrends || [];
                    newState.artistsData[id].xChats = newState.artistsData[id].xChats || [];
                    newState.artistsData[id].lastFourWeeksStreams = newState.artistsData[id].lastFourWeeksStreams || [];
                    newState.artistsData[id].lastFourWeeksViews = newState.artistsData[id].lastFourWeeksViews || [];
                }
            }
            return newState;
        }
        case 'UNLOCK_RED_MIC_PRO': {
            if (!state.activeArtistId) return state;
            const { type, cost } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];

            const newRedMicProState: RedMicProState = {
                unlocked: true,
                subscriptionType: type,
                hypeMode: 'locked',
            };

            if (type === 'yearly') {
                newRedMicProState.subscriptionEndDate = { week: state.date.week, year: state.date.year + 1 };
            }

            const updatedData: ArtistData = {
                ...activeData,
                money: activeData.money - cost,
                hype: 1000,
                redMicPro: newRedMicProState,
            };

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: updatedData,
                },
            };
        }
        case 'UPDATE_SONG_QUALITY': {
            if (!state.activeArtistId) return state;
            const { songId, newQuality } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];
            
            const clampedQuality = Math.max(0, Math.min(100, newQuality));

            const updatedSongs = activeData.songs.map(song =>
                song.id === songId ? { ...song, quality: clampedQuality } : song
            );
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: { ...activeData, songs: updatedSongs },
                },
            };
        }
        case 'SET_MONEY': {
            if (!state.activeArtistId) return state;
            const { newAmount } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: { ...activeData, money: newAmount },
                },
            };
        }
        case 'TOGGLE_GOLD_THEME': {
            if (!state.activeArtistId) return state;
            const { enabled } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: { ...activeData, isGoldTheme: enabled },
                },
            };
        }
        case 'SET_SALES_BOOST': {
            if (!state.activeArtistId) return state;
            const { newBoost } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: { ...activeData, salesBoost: newBoost },
                },
            };
        }
        case 'PRO_SIGN_LABEL': {
            if (!state.activeArtistId) return state;
            const { labelId } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];
            
            const newContract: Contract = createDefaultContract({
                labelId,
                artistId: state.activeArtistId,
                startDate: state.date,
                durationWeeks: 156, // 3 years
                albumQuota: 3,
                albumsReleased: 0,
            });

            const artist = allPlayerArtistsAndGroups.find(a => a.id === state.activeArtistId);
            const label = LABELS.find(l => l.id === labelId);
            let newPosts: XPost[] = [];
            let advance = 0;

            if (label && artist) {
                if (label.contractType === 'petty') advance = 1000000;
                else if (label.id === 'umg') advance = 2500000;
                else if (label.tier === 'Mid-high' || label.tier === 'Mid-Low' || label.tier === 'Top') advance = 750000;
                else if (label.tier === 'Low') advance = 300000;

                const playerUser = activeData.selectedPlayerXUserId ? activeData.xUsers.find(u => u.id === activeData.selectedPlayerXUserId) : activeData.xUsers.find(u => u.isPlayer);
                if(playerUser) {
                    newPosts.push({
                        id: crypto.randomUUID(),
                        authorId: 'tmz',
                        content: `${artist.name} has inked a major deal with ${label.name}. Big things coming.`,
                        image: playerUser.avatar,
                        likes: Math.floor(Math.random() * 5000) + 1000,
                        retweets: Math.floor(Math.random() * 1000) + 200,
                        views: Math.floor(Math.random() * 400000) + 150000,
                        date: state.date,
                    });
                }
            }

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: { 
                        ...activeData, 
                        money: activeData.money + advance,
                        contract: newContract,
                        xPosts: [...newPosts, ...activeData.xPosts]
                    },
                },
            };
        }
        case 'UPDATE_WIKIPEDIA_SUMMARY': {
            if (!state.activeArtistId) return state;
            const { releaseId, summary } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];

            const updatedReleases = activeData.releases.map(r => 
                r.id === releaseId ? { ...r, wikipediaSummary: summary } : r
            );

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        releases: updatedReleases,
                    }
                }
            };
        }
        case 'UPDATE_FEATURE_PRICE': {
            if (!state.activeArtistId) return state;
            const { price } = action.payload;
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...state.artistsData[state.activeArtistId],
                        featurePrice: price
                    }
                }
            };
        }
        case 'UPDATE_ABOUT_SONG_TEXT': {
            if (!state.activeArtistId) return state;
            const { songId, text } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];

            const song = activeData.songs.find(s => s.id === songId);

            const updatedSongs = activeData.songs.map(s => 
                s.id === songId ? { ...s, aboutText: text } : s
            );
            
            let updatedXPosts = activeData.xPosts;
            if (song && text && text.trim() !== '' && song.aboutText !== text) {
                const popBasePost: XPost = {
                    id: crypto.randomUUID(),
                    authorId: 'popbase',
                    content: `${activeData.name || 'Artist'} reveals the meaning of the song "${song.title}":\n\n"${text}"`,
                    image: activeData.image,
                    likes: Math.floor(Math.random() * 40000) + 10000,
                    retweets: Math.floor(Math.random() * 10000) + 2000,
                    views: Math.floor(Math.random() * 1000000) + 200000,
                    date: state.date
                };
                updatedXPosts = [popBasePost, ...activeData.xPosts];
            }

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        songs: updatedSongs,
                        xPosts: updatedXPosts,
                    }
                }
            };
        }
        case 'GO_TO_GRAMMY_SUBMISSIONS': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const updatedInbox = activeData.inbox.map(email => {
                if (email.id === action.payload.emailId) {
                    return { ...email, isRead: true };
                }
                return email;
            });
            return { 
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        inbox: updatedInbox,
                    }
                },
                currentView: 'submitForGrammys' 
            };
        }
        case 'SUBMIT_FOR_GRAMMYS': {
            if (!state.activeArtistId) return state;
            const { submissions, emailId } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];

            const updatedInbox = activeData.inbox.map(email => {
                if (email.id === emailId && email.offer?.type === 'grammySubmission') {
                    return { ...email, offer: { ...email.offer, isSubmitted: true }};
                }
                return email;
            });

            const bnaSubmission = submissions.find(s => s.category === 'Best New Artist');
            const hasSubmittedBna = bnaSubmission ? true : activeData.hasSubmittedForBestNewArtist;

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        inbox: updatedInbox,
                        hasSubmittedForBestNewArtist: hasSubmittedBna
                    }
                },
                grammySubmissions: [...state.grammySubmissions, ...submissions],
                currentView: 'game'
            };
        }
        case 'ACCEPT_GRAMMY_PERFORMANCE': {
            if (!state.activeArtistId) return state;
            return {
                ...state,
                activeGrammyPerformanceOffer: { emailId: action.payload.emailId },
                currentView: 'createGrammyPerformance',
            };
        }
        case 'CREATE_GRAMMY_PERFORMANCE': {
            if (!state.activeArtistId || !state.activeGrammyPerformanceOffer) return state;
            const { video } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];
            const updatedInbox = activeData.inbox.map(email => {
                if (email.id === state.activeGrammyPerformanceOffer!.emailId && email.offer?.type === 'grammyNominations') {
                    return { ...email, offer: { ...email.offer, isPerformanceAccepted: true }};
                }
                return email;
            });
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        videos: [...activeData.videos, video],
                        hype: Math.min(getHypeCap(activeData), activeData.hype + 30),
                        inbox: updatedInbox,
                    }
                },
                activeGrammyPerformanceOffer: null,
                currentView: 'game',
            };
        }
        case 'DECLINE_GRAMMY_PERFORMANCE': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const updatedInbox = activeData.inbox.map(email => {
                if (email.id === action.payload.emailId && email.offer?.type === 'grammyNominations') {
                    return { ...email, offer: { ...email.offer, isPerformanceAccepted: false }};
                }
                return email;
            });
            return {
                ...state,
                artistsData: { ...state.artistsData, [state.activeArtistId]: { ...activeData, inbox: updatedInbox }},
                currentView: 'inbox',
            };
        }
        case 'ACCEPT_GRAMMY_RED_CARPET': {
            if (!state.activeArtistId) return state;
            const { emailId, lookUrl } = action.payload;

            if (lookUrl) { 
                const artistName = state.soloArtist?.name || state.group?.name;
                const popBasePost: XPost = {
                    id: crypto.randomUUID(),
                    authorId: 'popbase',
                    content: `${artistName} arrives at the #GRAMMYs red carpet.`,
                    image: lookUrl,
                    likes: Math.floor(Math.random() * 99000) + 16000,
                    retweets: Math.floor(Math.random() * 16000) + 7000,
                    views: Math.floor(Math.random() * 3100000) + 1200000,
                    date: state.date,
                };
                const activeData = state.artistsData[state.activeArtistId];
                const updatedInbox = activeData.inbox.map(email => {
                    if (email.id === emailId && email.offer?.type === 'grammyRedCarpet') {
                        return { ...email, offer: { ...email.offer, isAttending: true }};
                    }
                    return email;
                });

                const newLook = {
                    id: crypto.randomUUID(),
                    awardShow: 'GRAMMYs',
                    year: state.date.year,
                    imageUrl: lookUrl,
                };

                return {
                    ...state,
                    artistsData: {
                        ...state.artistsData,
                        [state.activeArtistId]: {
                            ...activeData,
                            inbox: updatedInbox,
                            xPosts: [popBasePost, ...activeData.xPosts],
                            pastRedCarpetLooks: [newLook, ...(activeData.pastRedCarpetLooks || [])]
                        }
                    },
                    activeGrammyRedCarpetOffer: null,
                    currentView: 'game',
                };
            } else { 
                 return {
                    ...state,
                    activeGrammyRedCarpetOffer: { emailId },
                    currentView: 'grammyRedCarpet',
                };
            }
        }
        case 'DECLINE_GRAMMY_RED_CARPET': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const updatedInbox = activeData.inbox.map(email => {
                if (email.id === action.payload.emailId && email.offer?.type === 'grammyRedCarpet') {
                    return { ...email, offer: { ...email.offer, isAttending: false }};
                }
                return email;
            });
            return {
                ...state,
                artistsData: { ...state.artistsData, [state.activeArtistId]: { ...activeData, inbox: updatedInbox }},
                currentView: 'inbox',
                activeGrammyRedCarpetOffer: null
            };
        }
        case 'GO_TO_AMA_SUBMISSIONS': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const updatedInbox = activeData.inbox.map(email => {
                if (email.id === action.payload.emailId) {
                    return { ...email, isRead: true };
                }
                return email;
            });
            return {
                ...state,
                artistsData: { ...state.artistsData, [state.activeArtistId]: { ...activeData, inbox: updatedInbox }},
                currentView: 'submitForAmas'
            };
        }
        case 'SUBMIT_FOR_AMAS': {
            if (!state.activeArtistId) return state;
            const { submissions, emailId } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];

            const updatedInbox = activeData.inbox.map(email => {
                if (email.id === emailId && email.offer?.type === 'amaSubmission') {
                    return { ...email, offer: { ...email.offer, isSubmitted: true }};
                }
                return email;
            });

            const newArtistSubmission = submissions.find(s => s.category === 'New Artist of the Year');
            const hasSubmittedNewArtist = newArtistSubmission ? true : activeData.hasSubmittedForAmaNewArtist;

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        inbox: updatedInbox,
                        hasSubmittedForAmaNewArtist: hasSubmittedNewArtist
                    }
                },
                amaSubmissions: [...(state.amaSubmissions || []), ...submissions],
                currentView: 'game'
            };
        }
        case 'ACCEPT_AMA_PERFORMANCE': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const updatedInbox = activeData.inbox.map(email => {
                if (email.id === action.payload.emailId && email.offer?.type === 'amaNominations') {
                    return { ...email, offer: { ...email.offer, isPerformanceAccepted: true }};
                }
                return email;
            });
            return {
                ...state,
                artistsData: { ...state.artistsData, [state.activeArtistId]: { ...activeData, inbox: updatedInbox }},
                activeAmaPerformanceOffer: { emailId: action.payload.emailId },
                currentView: 'createAmaPerformance'
            };
        }
        case 'CREATE_AMA_PERFORMANCE': {
            if (!state.activeArtistId || !state.activeAmaPerformanceOffer) return state;
            
            const artistName = state.soloArtist?.name || state.group?.name;
            const performancePost: XPost = {
                id: crypto.randomUUID(),
                authorId: 'popbase',
                content: `${artistName} performs "${action.payload.video.title}" at the #AMAs`,
                image: action.payload.video.thumbnail,
                likes: Math.floor(Math.random() * 800000) + 100000,
                retweets: Math.floor(Math.random() * 150000) + 20000,
                views: Math.floor(Math.random() * 10000000) + 2000000,
                date: state.date,
            };

            const activeData = state.artistsData[state.activeArtistId];
            
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        hype: Math.min(100, activeData.hype + 5),
                        popularity: Math.min(100, activeData.popularity + 3),
                        xPosts: [performancePost, ...activeData.xPosts]
                    }
                },
                activeAmaPerformanceOffer: null,
                currentView: 'game'
            };
        }
        case 'DECLINE_AMA_PERFORMANCE': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const updatedInbox = activeData.inbox.map(email => {
                if (email.id === action.payload.emailId && email.offer?.type === 'amaNominations') {
                    return { ...email, offer: { ...email.offer, isPerformanceAccepted: false }};
                }
                return email;
            });
            return {
                ...state,
                artistsData: { ...state.artistsData, [state.activeArtistId]: { ...activeData, inbox: updatedInbox }},
                currentView: 'inbox',
                activeAmaPerformanceOffer: null
            };
        }
        case 'ACCEPT_AMA_RED_CARPET': {
            if (!state.activeArtistId) return state;
            const { emailId, lookUrl } = action.payload;

            if (lookUrl) { 
                const artistName = state.soloArtist?.name || state.group?.name;
                const popBasePost: XPost = {
                    id: crypto.randomUUID(),
                    authorId: 'popbase',
                    content: `${artistName} arrives at the #AMAs red carpet.`,
                    image: lookUrl,
                    likes: Math.floor(Math.random() * 99000) + 16000,
                    retweets: Math.floor(Math.random() * 16000) + 7000,
                    views: Math.floor(Math.random() * 3100000) + 1200000,
                    date: state.date,
                };
                const activeData = state.artistsData[state.activeArtistId];
                const updatedInbox = activeData.inbox.map(email => {
                    if (email.id === emailId && email.offer?.type === 'amaRedCarpet') {
                        return { ...email, offer: { ...email.offer, isAttending: true }};
                    }
                    return email;
                });

                const newLook = {
                    id: crypto.randomUUID(),
                    awardShow: 'AMAs',
                    year: state.date.year,
                    imageUrl: lookUrl,
                };

                return {
                    ...state,
                    artistsData: {
                        ...state.artistsData,
                        [state.activeArtistId]: {
                            ...activeData,
                            inbox: updatedInbox,
                            xPosts: [popBasePost, ...activeData.xPosts],
                            pastRedCarpetLooks: [newLook, ...(activeData.pastRedCarpetLooks || [])]
                        }
                    },
                    activeAmaRedCarpetOffer: null,
                    currentView: 'game',
                };
            } else { 
                 return {
                    ...state,
                    activeAmaRedCarpetOffer: { emailId },
                    currentView: 'amaRedCarpet',
                };
            }
        }
        case 'DECLINE_AMA_RED_CARPET': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const updatedInbox = activeData.inbox.map(email => {
                if (email.id === action.payload.emailId && email.offer?.type === 'amaRedCarpet') {
                    return { ...email, offer: { ...email.offer, isAttending: false }};
                }
                return email;
            });
            return {
                ...state,
                artistsData: { ...state.artistsData, [state.activeArtistId]: { ...activeData, inbox: updatedInbox }},
                currentView: 'inbox',
                activeAmaRedCarpetOffer: null
            };
        }
        case 'ACCEPT_VMA_RED_CARPET': {
            if (!state.activeArtistId) return state;
            const { emailId, lookUrl } = action.payload;

            if (lookUrl) { 
                const artistName = state.soloArtist?.name || state.group?.name;
                const popBasePost: XPost = {
                    id: crypto.randomUUID(),
                    authorId: 'popbase',
                    content: `${artistName} arrives at the #VMAs red carpet.`,
                    image: lookUrl,
                    likes: Math.floor(Math.random() * 99000) + 16000,
                    retweets: Math.floor(Math.random() * 16000) + 7000,
                    views: Math.floor(Math.random() * 3100000) + 1200000,
                    date: state.date,
                };
                const activeData = state.artistsData[state.activeArtistId];
                const updatedInbox = activeData.inbox.map(email => {
                    if (email.id === emailId && email.offer?.type === 'vmaRedCarpet') {
                        return { ...email, offer: { ...email.offer, isAttending: true }};
                    }
                    return email;
                });

                const newLook = {
                    id: crypto.randomUUID(),
                    awardShow: 'VMAs',
                    year: state.date.year,
                    imageUrl: lookUrl,
                };

                return {
                    ...state,
                    artistsData: {
                        ...state.artistsData,
                        [state.activeArtistId]: {
                            ...activeData,
                            inbox: updatedInbox,
                            xPosts: [popBasePost, ...activeData.xPosts],
                            pastRedCarpetLooks: [newLook, ...(activeData.pastRedCarpetLooks || [])]
                        }
                    },
                    activeVmaRedCarpetOffer: null,
                    currentView: 'game',
                };
            } else { 
                 return {
                    ...state,
                    activeVmaRedCarpetOffer: { emailId },
                    currentView: 'vmaRedCarpet',
                };
            }
        }
        case 'DECLINE_VMA_RED_CARPET': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const updatedInbox = activeData.inbox.map(email => {
                if (email.id === action.payload.emailId && email.offer?.type === 'vmaRedCarpet') {
                    return { ...email, offer: { ...email.offer, isAttending: false }};
                }
                return email;
            });
            return {
                ...state,
                artistsData: { ...state.artistsData, [state.activeArtistId]: { ...activeData, inbox: updatedInbox }},
                currentView: 'inbox',
                activeVmaRedCarpetOffer: null
            };
        }
        case 'GO_TO_OSCAR_SUBMISSIONS': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const updatedInbox = activeData.inbox.map(email => {
                if (email.id === action.payload.emailId) {
                    return { ...email, isRead: true };
                }
                return email;
            });
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        inbox: updatedInbox,
                    }
                },
                currentView: 'submitForOscars'
            };
        }
        case 'SUBMIT_FOR_OSCARS': {
            if (!state.activeArtistId) return state;
            const { submissions, emailId } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];
            const updatedInbox = activeData.inbox.map(email => {
                if (email.id === emailId && email.offer?.type === 'oscarSubmission') {
                    return { ...email, offer: { ...email.offer, isSubmitted: true }};
                }
                return email;
            });
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        inbox: updatedInbox,
                    }
                },
                oscarSubmissions: [...state.oscarSubmissions, ...submissions],
                currentView: 'game'
            };
        }
        case 'TOGGLE_OFFLINE_MODE': {
            return {
                ...state,
                offlineMode: !state.offlineMode
            };
        }
        case 'SELL_RIGHTS': {
            if (!state.activeArtistId) return state;
            const { itemType, id, percent, labelId, value } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];
            let songs = [...activeData.songs];
            let releases = [...activeData.releases];

            if (itemType === 'song') {
                const index = songs.findIndex(s => s.id === id);
                if (index !== -1) {
                    songs[index] = { 
                        ...songs[index], 
                        rightsSoldPercent: (songs[index].rightsSoldPercent || 0) + percent, 
                        rightsOwnerLabelId: labelId,
                        rightsSoldOriginalValue: value
                    };
                }
            } else {
                const relIndex = releases.findIndex(r => r.id === id);
                if (relIndex !== -1) {
                    releases[relIndex] = {
                        ...releases[relIndex],
                        rightsSoldPercent: (releases[relIndex].rightsSoldPercent || 0) + percent,
                        rightsOwnerLabelId: labelId,
                        rightsSoldOriginalValue: value
                    };
                    const releaseSongIds = releases[relIndex].songIds;
                    songs = songs.map(s => {
                        if (releaseSongIds.includes(s.id)) {
                            return {
                                ...s,
                                rightsSoldPercent: (s.rightsSoldPercent || 0) + percent,
                                rightsOwnerLabelId: labelId,
                                rightsSoldOriginalValue: value
                            };
                        }
                        return s;
                    });
                }
            }

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        songs,
                        releases,
                        money: activeData.money + (value * (percent / 100))
                    }
                }
            };
        }
        case 'BUY_RIGHTS': {
            if (!state.activeArtistId) return state;
            const { itemType, id, percentToBuy, cost } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];
            if (activeData.money < cost) return state;

            let songs = [...activeData.songs];
            let releases = [...activeData.releases];

            if (itemType === 'song') {
                const index = songs.findIndex(s => s.id === id);
                if (index !== -1) {
                    const newPercent = Math.max(0, (songs[index].rightsSoldPercent || 0) - percentToBuy);
                    songs[index] = { 
                        ...songs[index], 
                        rightsSoldPercent: newPercent,
                        rightsOwnerLabelId: newPercent === 0 ? undefined : songs[index].rightsOwnerLabelId
                    };
                }
            } else {
                const relIndex = releases.findIndex(r => r.id === id);
                if (relIndex !== -1) {
                    const newPercent = Math.max(0, (releases[relIndex].rightsSoldPercent || 0) - percentToBuy);
                     releases[relIndex] = {
                        ...releases[relIndex],
                        rightsSoldPercent: newPercent,
                        rightsOwnerLabelId: newPercent === 0 ? undefined : releases[relIndex].rightsOwnerLabelId
                    };
                    const releaseSongIds = releases[relIndex].songIds;
                    songs = songs.map(s => {
                        if (releaseSongIds.includes(s.id)) {
                            return {
                                ...s,
                                rightsSoldPercent: newPercent,
                                rightsOwnerLabelId: newPercent === 0 ? undefined : s.rightsOwnerLabelId
                            };
                        }
                        return s;
                    });
                }
            }

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        songs,
                        releases,
                        money: activeData.money - cost
                    }
                }
            };
        }
        case 'ACCEPT_OSCAR_PERFORMANCE': {
            if (!state.activeArtistId) return state;
            return {
                ...state,
                activeOscarPerformanceOffer: { emailId: action.payload.emailId },
                currentView: 'createOscarPerformance',
            };
        }
        case 'CREATE_OSCAR_PERFORMANCE': {
            if (!state.activeArtistId || !state.activeOscarPerformanceOffer) return state;
            const { video } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];
            const updatedInbox = activeData.inbox.map(email => {
                if (email.id === state.activeOscarPerformanceOffer!.emailId && email.offer?.type === 'oscarNominations') {
                    return { ...email, offer: { ...email.offer, isPerformanceAccepted: true }};
                }
                return email;
            });
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        videos: [...activeData.videos, video],
                        hype: Math.min(getHypeCap(activeData), activeData.hype + 40),
                        inbox: updatedInbox,
                    }
                },
                activeOscarPerformanceOffer: null,
                currentView: 'game',
            };
        }
        case 'DECLINE_OSCAR_PERFORMANCE': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const updatedInbox = activeData.inbox.map(email => {
                if (email.id === action.payload.emailId && email.offer?.type === 'oscarNominations') {
                    return { ...email, offer: { ...email.offer, isPerformanceAccepted: false }};
                }
                return email;
            });
            return {
                ...state,
                artistsData: { ...state.artistsData, [state.activeArtistId]: { ...activeData, inbox: updatedInbox }},
                activeOscarPerformanceOffer: null,
                currentView: 'inbox',
            };
        }
        case 'ACCEPT_OSCAR_RED_CARPET': {
            if (!state.activeArtistId) return state;
            const { emailId, lookUrl } = action.payload;

            if (lookUrl) { 
                const artistName = state.soloArtist?.name || state.group?.name;
                const popBasePost: XPost = {
                    id: crypto.randomUUID(),
                    authorId: 'popbase',
                    content: `${artistName} arrives at the #Oscars red carpet.`,
                    image: lookUrl,
                    likes: Math.floor(Math.random() * 99000) + 16000,
                    retweets: Math.floor(Math.random() * 16000) + 7000,
                    views: Math.floor(Math.random() * 3100000) + 1200000,
                    date: state.date,
                };
                const activeData = state.artistsData[state.activeArtistId];
                const updatedInbox = activeData.inbox.map(email => {
                    if (email.id === emailId && email.offer?.type === 'oscarRedCarpet') {
                        return { ...email, offer: { ...email.offer, isAttending: true }};
                    }
                    return email;
                });

                const newLook = {
                    id: crypto.randomUUID(),
                    awardShow: 'Oscars',
                    year: state.date.year,
                    imageUrl: lookUrl,
                };

                return {
                    ...state,
                    artistsData: {
                        ...state.artistsData,
                        [state.activeArtistId]: {
                            ...activeData,
                            inbox: updatedInbox,
                            xPosts: [popBasePost, ...activeData.xPosts],
                            pastRedCarpetLooks: [newLook, ...(activeData.pastRedCarpetLooks || [])]
                        }
                    },
                    activeOscarRedCarpetOffer: null,
                    currentView: 'game',
                };
            } else { 
                 return {
                    ...state,
                    activeOscarRedCarpetOffer: { emailId },
                    currentView: 'oscarRedCarpet',
                };
            }
        }
        case 'DECLINE_OSCAR_RED_CARPET': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const updatedInbox = activeData.inbox.map(email => {
                if (email.id === action.payload.emailId && email.offer?.type === 'oscarRedCarpet') {
                    return { ...email, offer: { ...email.offer, isAttending: false }};
                }
                return email;
            });
            return {
                ...state,
                artistsData: { ...state.artistsData, [state.activeArtistId]: { ...activeData, inbox: updatedInbox }},
                currentView: 'inbox',
                activeOscarRedCarpetOffer: null
            };
        }
        case 'RENEW_CONTRACT': {
            if (!state.contractRenewalOffer) return state;
            const { labelId, isCustom, artistId } = state.contractRenewalOffer;
            const artistData = state.artistsData[artistId];
            if (!artistData) return state;
    
            const newContract: Contract = createDefaultContract({
                labelId,
                isCustom,
                artistId,
                startDate: state.date,
                durationWeeks: 104, // 2 years
                albumQuota: 2, // A standard renewal deal
                albumsReleased: 0,
            });
    
            const updatedData = { ...artistData, contract: newContract };
    
            return {
                ...state,
                artistsData: { ...state.artistsData, [artistId]: updatedData },
                contractRenewalOffer: null,
                currentView: 'game',
            };
        }
        case 'GO_INDEPENDENT': {
            if (!state.contractRenewalOffer) return state;
            const { artistId } = state.contractRenewalOffer;
            const artistData = state.artistsData[artistId];
            if (!artistData || !artistData.contract) return state;
            
            const updatedData = { 
                ...artistData, 
                contractHistory: [...(artistData.contractHistory || []), artistData.contract],
                contract: null 
            };
    
            return {
                ...state,
                artistsData: { ...state.artistsData, [artistId]: updatedData },
                contractRenewalOffer: null,
                currentView: 'game',
            };
        }
        case 'UPDATE_ARTIST_IMAGE': {
            const { artistId, newImage } = action.payload;
            const newState = { ...state };

            // Update solo artist
            if (newState.soloArtist?.id === artistId) {
                newState.soloArtist = { ...newState.soloArtist, image: newImage };
            }

            // Update group or group member
            if (newState.group) {
                if (newState.group.id === artistId) {
                    newState.group = { ...newState.group, image: newImage };
                } else {
                    const memberIndex = newState.group.members.findIndex(m => m.id === artistId);
                    if (memberIndex > -1) {
                        const updatedMembers = [...newState.group.members];
                        updatedMembers[memberIndex] = { ...updatedMembers[memberIndex], image: newImage };
                        newState.group = { ...newState.group, members: updatedMembers };
                    }
                }
            }

            // Update extraPlayableArtists (kids)
            if (newState.extraPlayableArtists) {
                const kidIndex = newState.extraPlayableArtists.findIndex(k => k.id === artistId);
                if (kidIndex > -1) {
                    const updatedKids = [...newState.extraPlayableArtists];
                    updatedKids[kidIndex] = { ...updatedKids[kidIndex], image: newImage };
                    newState.extraPlayableArtists = updatedKids;
                }
            }

            // Update XUser avatar in the corresponding artistsData
            const artistDataToUpdate = newState.artistsData[artistId];
            if (artistDataToUpdate) {
                const updatedXUsers = artistDataToUpdate.xUsers.map(user =>
                    user.id === artistId ? { ...user, avatar: newImage } : user
                );
                newState.artistsData = {
                    ...newState.artistsData,
                    [artistId]: {
                        ...artistDataToUpdate,
                        xUsers: updatedXUsers,
                    },
                };
            }
            
            return newState;
        }
        case 'CREATE_ONLYFANS_PROFILE': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        onlyfans: action.payload.profile,
                    }
                },
                currentView: 'onlyfans',
            };
        }
        case 'UPDATE_ONLYFANS_SETTINGS': {
            if (!state.activeArtistId || !state.artistsData[state.activeArtistId].onlyfans) return state;
            const activeData = state.artistsData[state.activeArtistId];
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        onlyfans: {
                            ...activeData.onlyfans!,
                            subscriptionPrice: action.payload.price
                        }
                    }
                }
            };
        }
        case 'CREATE_ONLYFANS_POST': {
            if (!state.activeArtistId || !state.artistsData[state.activeArtistId].onlyfans) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const ofProfile = activeData.onlyfans!;
            
            // Calculate initial engagement and income
            const initialLikes = Math.floor(ofProfile.subscribers * (Math.random() * 0.15 + 0.10)); // 10-25% engage on new post
            const initialComments = Math.floor(initialLikes / (Math.random() * 15 + 10));
            const initialTips = initialLikes * (Math.random() * 0.1); // Tip rate is higher for new posts
            
            let postPurchaseIncome = 0;
            if (action.payload.post.price > 0) {
                 // 15-30% of subscribers buy it
                const purchaseRate = Math.random() * 0.15 + 0.15;
                postPurchaseIncome = action.payload.post.price * Math.floor(ofProfile.subscribers * purchaseRate);
            }

            const newPost: OnlyFansPost = { ...action.payload.post, likes: initialLikes, comments: initialComments, tips: initialTips };

            const postGrossIncome = postPurchaseIncome + initialTips;
            const postNetIncome = postGrossIncome * 0.8; // 80% cut
            
            const yearMonth = `${state.date.year}-${String(Math.floor(state.date.week/4)).padStart(2, '0')}`;
            const updatedEarningsByMonth = { ...ofProfile.earningsByMonth };
            if(!updatedEarningsByMonth[yearMonth]) {
                updatedEarningsByMonth[yearMonth] = { gross: 0, net: 0 };
            }
            updatedEarningsByMonth[yearMonth].gross += postGrossIncome;
            updatedEarningsByMonth[yearMonth].net += postNetIncome;

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        money: activeData.money + postNetIncome, // Add income immediately
                        onlyfans: {
                            ...ofProfile,
                            posts: [newPost, ...ofProfile.posts],
                            totalGross: ofProfile.totalGross + postGrossIncome,
                            totalNet: ofProfile.totalNet + postNetIncome,
                            earningsByMonth: updatedEarningsByMonth,
                        }
                    }
                }
            };
        }
        case 'ACCEPT_ONLYFANS_REQUEST': {
            if (!state.activeArtistId) return state;
            const { emailId, payout } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];
            
            const updatedInbox = activeData.inbox.map(email => {
                if (email.id === emailId && email.offer?.type === 'onlyfansRequest') {
                    return { ...email, offer: { ...email.offer, isFulfilled: true } };
                }
                return email;
            });
            
            const updatedData: ArtistData = { ...activeData, inbox: updatedInbox, money: activeData.money + payout };

            if (updatedData.onlyfans) {
                const ONLYFANS_CUT = 0.2;
                const grossPayout = payout / (1 - ONLYFANS_CUT); // Back-calculate gross from net payout
                updatedData.onlyfans.totalGross += grossPayout;
                updatedData.onlyfans.totalNet += payout;
                
                const yearMonth = `${state.date.year}-${String(Math.floor(state.date.week/4)).padStart(2, '0')}`;
                if(!updatedData.onlyfans.earningsByMonth[yearMonth]) {
                    updatedData.onlyfans.earningsByMonth[yearMonth] = { gross: 0, net: 0 };
                }
                updatedData.onlyfans.earningsByMonth[yearMonth].gross += grossPayout;
                updatedData.onlyfans.earningsByMonth[yearMonth].net += payout;
            }

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: updatedData,
                },
                currentView: 'inbox',
            };
        }
        case 'SET_PRO_HYPE_MODE': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            if (!activeData.redMicPro.unlocked) return state;

            const newHype = action.payload === 'locked' ? 1000 : activeData.hype;

            const updatedData: ArtistData = {
                ...activeData,
                hype: newHype,
                redMicPro: {
                    ...activeData.redMicPro,
                    hypeMode: action.payload,
                }
            };
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: updatedData
                }
            };
        }
        case 'SET_HYPE': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            if (!activeData.redMicPro.unlocked || (activeData.redMicPro.hypeMode || 'locked') !== 'manual') return state;
            
            const updatedData: ArtistData = {
                ...activeData,
                hype: Math.max(0, Math.min(1000, action.payload)),
            };
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: updatedData
                }
            };
        }
        case 'SET_PUBLIC_IMAGE': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            if (!activeData.redMicPro.unlocked) return state;
            
            const updatedData: ArtistData = {
                ...activeData,
                publicImage: Math.max(0, Math.min(100, action.payload)),
            };
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: updatedData
                }
            };
        }
        case 'SIGN_BRAND_DEAL': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        money: activeData.money + action.payload.cash,
                        signedBrandDeals: [...(activeData.signedBrandDeals || []), action.payload.id]
                    }
                }
            };
        }
        case 'SIGN_VIDEO_GAME_DEAL': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        money: activeData.money + action.payload.cash,
                        signedVideoGames: [...(activeData.signedVideoGames || []), action.payload.id]
                    }
                }
            };
        }
        case 'SET_POPULARITY': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            if (!activeData.redMicPro.unlocked) return state;

            const updatedData: ArtistData = {
                ...activeData,
                popularity: Math.max(0, Math.min(100, action.payload)),
            };
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: updatedData
                }
            };
        }
        case 'UPDATE_RELEASE_COVER_ART': {
            if (!state.activeArtistId) return state;
            const { releaseId, newCoverArt } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];

            const updatedReleases = activeData.releases.map(r => 
                r.id === releaseId ? { ...r, coverArt: newCoverArt } : r
            );

            // Also update cover art for songs that might be using the album art
            const updatedSongs = activeData.songs.map(s => {
                if (s.releaseId === releaseId) {
                    return { ...s, coverArt: newCoverArt };
                }
                return s;
            });

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        releases: updatedReleases,
                        songs: updatedSongs,
                    }
                }
            };
        }
        case 'ACCEPT_SOUNDTRACK_OFFER': {
            if (!state.activeArtistId) return state;
            const { albumTitle, emailId } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];
            
            const updatedInbox = activeData.inbox.map(email => {
                if (email.id === emailId && email.offer?.type === 'soundtrackOffer') {
                    return { ...email, offer: { ...email.offer, isAccepted: true } };
                }
                return email;
            });
        
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        inbox: updatedInbox,
                    }
                },
                activeSoundtrackOffer: { albumTitle, emailId },
                currentView: 'createSoundtrack',
            };
        }
        case 'CREATE_SOUNDTRACK_CONTRIBUTION': {
            if (!state.activeArtistId) return state;
            const { albumTitle, coverArt, songIds } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];

            const playerTracks: SoundtrackTrack[] = songIds.map(songId => {
                const song = activeData.songs.find(s => s.id === songId)!;
                return {
                    isPlayerSong: true,
                    songId: song.id,
                    title: song.title,
                    artist: state.soloArtist?.name || state.group?.name || 'Artist',
                    streams: 0,
                    lastWeekStreams: 0,
                    prevWeekStreams: 0,
                    duration: song.duration,
                    explicit: song.explicit,
                };
            });
            
            const npcTracks: SoundtrackTrack[] = state.npcs.slice(0, 7).map(npc => ({
                isPlayerSong: false,
                songId: npc.uniqueId,
                title: npc.title,
                artist: npc.artist,
                streams: 0,
                lastWeekStreams: 0,
                prevWeekStreams: 0,
                duration: 180 + Math.floor(Math.random() * 60),
                explicit: Math.random() > 0.7,
            }));
            
            const allTracks = [...playerTracks, ...npcTracks].sort(() => Math.random() - 0.5);

            const newSoundtrack: SoundtrackAlbum = {
                id: crypto.randomUUID(),
                title: albumTitle,
                coverArt,
                tracks: allTracks,
                releaseDate: state.date,
                label: 'Major Film Studio',
                artistId: state.activeArtistId,
                isReleased: true,
            };
            
            const newRelease: Release = {
                id: crypto.randomUUID(),
                title: albumTitle,
                type: 'Album',
                coverArt: coverArt,
                songIds: songIds,
                releaseDate: state.date,
                artistId: state.activeArtistId,
                soundtrackInfo: { albumTitle },
            };
            
            const updatedSongs = activeData.songs.map(song => {
                if (songIds.includes(song.id)) {
                    return {
                        ...song,
                        isReleased: true,
                        soundtrackTitle: albumTitle,
                        releaseId: newRelease.id,
                    };
                }
                return song;
            });

            return {
                ...state,
                soundtrackAlbums: [...state.soundtrackAlbums, newSoundtrack],
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        songs: updatedSongs,
                        releases: [...activeData.releases, newRelease],
                    }
                },
                activeSoundtrackOffer: null,
                selectedSoundtrackId: newSoundtrack.id,
                currentView: 'spotifySoundtrackDetail',
            };
        }
        case 'CANCEL_SOUNDTRACK_OFFER': {
            return {
                ...state,
                activeSoundtrackOffer: null,
                currentView: 'inbox',
            };
        }
        case 'SUBMIT_COACHELLA': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            
            const updatedInbox = activeData.inbox.map(email => {
                if (email.id === action.payload.emailId && email.offer?.type === 'coachellaOffer') {
                    return { ...email, offer: { ...email.offer, isSubmitted: true } };
                }
                return email;
            });

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        inbox: updatedInbox,
                        coachella: activeData.coachella ? { ...activeData.coachella, status: 'submitted' } : undefined
                    }
                }
            };
        }
        case 'ACCEPT_FEATURE_OFFER': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const { emailId, ...offerDetails } = action.payload;

            const updatedInbox = activeData.inbox.map(email => {
                if (email.id === emailId && email.offer?.type === 'featureOffer') {
                    return { ...email, offer: { ...email.offer, isAccepted: true } };
                }
                return email;
            });
            
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        inbox: updatedInbox
                    }
                },
                activeFeatureOffer: { ...offerDetails, emailId },
                currentView: 'createFeature',
            };
        }
        case 'ACCEPT_FEATURE_VIDEO_OFFER': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const { emailId, ...offerDetails } = action.payload;

            const updatedInbox = activeData.inbox.map(email => {
                if (email.id === emailId && email.offer?.type === 'featureVideoOffer') {
                    return { ...email, offer: { ...email.offer, isAccepted: true } };
                }
                return email;
            });

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        inbox: updatedInbox
                    }
                },
                activeFeatureVideoOffer: { ...offerDetails, emailId },
                currentView: 'createFeatureVideo',
            };
        }
        case 'CANCEL_FEATURE_VIDEO_OFFER': {
            return {
                ...state,
                activeFeatureVideoOffer: null,
                currentView: 'inbox',
            };
        }
        case 'CREATE_FEATURE_VIDEO': {
            if (!state.activeArtistId || !state.activeFeatureVideoOffer) return state;
            
            const activeData = state.artistsData[state.activeArtistId];
            const activeArtist = allPlayerArtistsAndGroups.find(a => a.id === state.activeArtistId);
            if (!activeArtist) return state;

            const { thumbnail } = action.payload;
            const { songId, npcArtistName } = state.activeFeatureVideoOffer;
            const song = activeData.songs.find(s => s.id === songId);
            if (!song) return state;

            const newVideo: Video = {
                id: crypto.randomUUID(),
                title: `${npcArtistName}, ${activeArtist.name} - ${song.title.replace(` (feat. ${activeArtist.name})`, '')} (Official Video)`,
                type: 'Music Video',
                views: 0,
                thumbnail: thumbnail,
                releaseDate: state.date,
                artistId: state.activeArtistId,
                songId: songId,
                channelId: 'artist', // It won't show in the artist channel but we'll use a flag
                isFeatureVideo: true,
            };

            const popBasePost: XPost = {
                id: crypto.randomUUID(),
                authorId: 'popbase',
                content: `${npcArtistName} has released the music video for "${song.title.replace(` (feat. ${activeArtist.name})`, '')}" featuring ${activeArtist.name}.`,
                image: thumbnail,
                likes: Math.floor(Math.random() * 80000) + 30000,
                retweets: Math.floor(Math.random() * 20000) + 5000,
                views: Math.floor(Math.random() * 1500000) + 500000,
                date: state.date
            };

            const updatedData = {
                ...activeData,
                videos: [...activeData.videos, newVideo],
                xPosts: [popBasePost, ...activeData.xPosts]
            };

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: updatedData
                },
                activeFeatureVideoOffer: null,
                currentView: 'game'
            };
        }
        case 'CANCEL_FEATURE_OFFER': {
            return {
                ...state,
                activeFeatureOffer: null,
                currentView: 'inbox',
            };
        }
        case 'CREATE_FEATURE_SONG': {
            if (!state.activeArtistId || !state.activeFeatureOffer) return state;
            
            const activeData = state.artistsData[state.activeArtistId];
            const activeArtist = allPlayerArtistsAndGroups.find(a => a.id === state.activeArtistId);
            if (!activeArtist) return state;

            const { songTitle, coverArt, releaseDate } = action.payload;
            const { npcArtistName, payout, songQuality, promotion } = state.activeFeatureOffer;

            const newFeatureSong: Song = {
                id: crypto.randomUUID(),
                title: `${songTitle} (feat. ${activeArtist.name})`,
                genre: NPC_ARTIST_GENRES[npcArtistName] || GENRES[Math.floor(Math.random() * GENRES.length)],
                quality: songQuality, // songQuality is up to 100
                coverArt: coverArt,
                isReleased: false,
                releaseDate: releaseDate,
                streams: 0,
                lastWeekStreams: 0,
                prevWeekStreams: 0,
                duration: 180,
                explicit: false,
                artistId: state.activeArtistId,
                isFeatureToNpc: true,
                npcArtistName: npcArtistName,
                playlistBoostWeeks: promotion?.durationWeeks || 0
            };

            const updatedData = {
                ...activeData,
                money: activeData.money + payout,
                songs: [...activeData.songs, newFeatureSong]
            };

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: updatedData
                },
                activeFeatureOffer: null,
                currentView: 'game'
            };
        }
        case 'SELECT_SOUNDTRACK': {
             return {
                ...state,
                selectedSoundtrackId: action.payload,
                currentView: 'spotifySoundtrackDetail',
            };
        }
        case 'CREATE_TOUR': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        tours: [...activeData.tours, action.payload]
                    }
                }
            };
        }
        case 'START_TOUR': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const updatedTours = activeData.tours.map(tour => {
                if (tour.id === action.payload.tourId) {
                    // Only start a tour if it's in 'planning' status
                    return tour.status === 'planning' ? { ...tour, status: 'active' as 'active' } : tour;
                }
                return tour;
            });
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        tours: updatedTours,
                    }
                },
                activeTourId: action.payload.tourId,
            };
        }
        case 'UPLOAD_TOUR_PHOTO': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            if (activeData.tourPhotos.length >= 9) return state;

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        tourPhotos: [...activeData.tourPhotos, action.payload]
                    }
                }
            }
        }
        case 'SELECT_TOUR':
            return {
                ...state,
                activeTourId: action.payload,
            };
        case 'HIRE_MANAGER': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const manager = MANAGERS.find(m => m.id === action.payload.managerId);
            if (!manager || activeData.money < manager.yearlyCost) return state;
        
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        money: activeData.money - manager.yearlyCost,
                        popularity: Math.min(100, activeData.popularity + manager.popularityBoost),
                        manager: {
                            id: manager.id,
                            contractEndDate: { week: state.date.week, year: state.date.year + 1 }
                        }
                    }
                },
            };
        }
        case 'FIRE_MANAGER': {
            if (!state.activeArtistId || !state.artistsData[state.activeArtistId].manager) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const manager = MANAGERS.find(m => m.id === activeData.manager!.id);
        
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        popularity: Math.max(0, activeData.popularity - (manager?.popularityBoost || 0)),
                        manager: null,
                    }
                },
            };
        }
        case 'HIRE_SECURITY': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const team = SECURITY_TEAMS.find(s => s.id === action.payload.teamId);
            if (!team || activeData.money < team.weeklyCost) return state;
            
            const updatedData = {
                ...activeData,
                money: activeData.money - team.weeklyCost,
                securityTeamId: team.id,
            };
            
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: updatedData,
                }
            };
        }
        case 'FIRE_SECURITY': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        securityTeamId: null,
                    }
                }
            };
        }
        case 'UPDATE_NPC_X_USER': {
            const { userId, newName, newUsername } = action.payload;
            const updatedArtistsData = { ...state.artistsData };

            for (const artistId in updatedArtistsData) {
                const artistData = updatedArtistsData[artistId];
                const updatedXUsers = artistData.xUsers.map(user =>
                    user.id === userId ? { ...user, name: newName, username: newUsername } : user
                );
                updatedArtistsData[artistId] = {
                    ...artistData,
                    xUsers: updatedXUsers,
                };
            }

            return {
                ...state,
                artistsData: updatedArtistsData,
            };
        }
        case 'VIEW_PAST_LABEL_CHANNEL': {
            return {
                ...state,
                viewingPastLabelId: action.payload,
                activeYoutubeChannel: 'label',
                currentView: 'youtube'
            };
        }
        case 'UPDATE_NPC_COVER': {
            const { artistName, newCover } = action.payload;
            const npcImages = { ...(state.npcImages || {}), [artistName]: newCover };
            
            const mapChartEntries = (entries: ChartEntry[]) => entries.map(entry => 
                entry.artist === artistName && !entry.isPlayerSong ? { ...entry, coverArt: newCover } : entry
            );
            
            const mapAlbumChartEntries = (entries: AlbumChartEntry[]) => entries.map(entry => 
                entry.artist === artistName && !entry.isPlayerAlbum ? { ...entry, coverArt: newCover } : entry
            );

            return {
                ...state,
                npcImages,
                npcs: state.npcs.map(npc => npc.artist === artistName ? { ...npc, coverArt: newCover } : npc),
                npcAlbums: state.npcAlbums.map(album => album.artist === artistName ? { ...album, coverArt: newCover } : album),
                billboardHot100: mapChartEntries(state.billboardHot100),
                spotifyGlobal: mapChartEntries(state.spotifyGlobal),
                hotPopSongs: mapChartEntries(state.hotPopSongs || []),
                hotRapRnb: mapChartEntries(state.hotRapRnb || []),
                electronicChart: mapChartEntries(state.electronicChart || []),
                countryChart: mapChartEntries(state.countryChart || []),
                billboardTopAlbums: mapAlbumChartEntries(state.billboardTopAlbums || []),
            };
        }
        case 'UPDATE_NPC_AVATAR': {
            const { userId, newAvatar } = action.payload;
            const updatedArtistsData = { ...state.artistsData };

            for (const artistId in updatedArtistsData) {
                const artistData = updatedArtistsData[artistId];
                const updatedXUsers = artistData.xUsers.map(user =>
                    user.id === userId ? { ...user, avatar: newAvatar } : user
                );
                updatedArtistsData[artistId] = {
                    ...artistData,
                    xUsers: updatedXUsers,
                };
            }

            return {
                ...state,
                artistsData: updatedArtistsData,
            };
        }
        case 'ACCEPT_EVENT_INVITATION': {
            if (!state.activeArtistId) return state;
            const { emailId, eventName, hostName, associatedSoundtrack, eventType } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];
            const updatedInbox = activeData.inbox.map(email => {
                if (email.id === emailId && email.offer?.type === 'eventInvitation') {
                    return { ...email, offer: { ...email.offer, isAccepted: true } };
                }
                return email;
            });
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {  ...activeData, inbox: updatedInbox }
                },
                activeEventInvitation: { emailId, eventName, hostName, associatedSoundtrack, eventType },
                currentView: 'attendEvent'
            };
        }
        case 'CONFIRM_EVENT_ATTENDANCE': {
            if (!state.activeArtistId || !state.activeEventInvitation) return state;
            const { imageUrl } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];
            const eventInfo = state.activeEventInvitation;
            const artistName = activeData.profile?.name || '';
            const newPosts = [...state.xPosts];
            let postContent = '';
            
            if (eventInfo.eventType === 'metGala' || eventInfo.eventType === 'nyfw') {
                postContent = `${artistName} was spotted looking incredible at ${eventInfo.eventName}! 📸✨`;
            } else if (eventInfo.eventType === 'afterParty') {
                postContent = `${artistName} arrived at ${eventInfo.hostName}'s ${eventInfo.eventName} last night! 🥂✨`;
            } else if (eventInfo.eventType === 'soundtrackPremiere') {
                postContent = `${artistName} stunned on the red carpet for the premiere of ${eventInfo.associatedSoundtrack}! 🎬⭐️`;
            } else {
                postContent = `${artistName} attended ${eventInfo.eventName} today!`;
            }
            
            newPosts.push({
                id: crypto.randomUUID(),
                author: 'Pop Base',
                handle: '@PopBase',
                content: postContent,
                imageUrl: imageUrl,
                likes: Math.floor(Math.random() * 200000) + 50000,
                retweets: Math.floor(Math.random() * 20000) + 5000,
                views: Math.floor(Math.random() * 1000000) + 500000,
                date: state.date,
                isPopBasePost: true
            });

            return {
                ...state,
                xPosts: newPosts,
                activeEventInvitation: null,
                currentView: 'game',
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: { 
                        ...activeData, 
                        hype: Math.min(100, activeData.hype + 10),
                        publicImage: Math.min(1000, activeData.publicImage + 15)
                    },
                },
            };
        }
        case 'DECLINE_EVENT_INVITATION': {
            if (!state.activeArtistId) return state;
            const { emailId } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];
            const updatedInbox = activeData.inbox.filter(email => email.id !== emailId);
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: { ...activeData, inbox: updatedInbox },
                },
            };
        }
        case 'ACCEPT_VOGUE_OFFER': {
            if (!state.activeArtistId) return state;
            const { magazine, emailId } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];
            const updatedInbox = activeData.inbox.map(email => {
                if (email.id === emailId && email.offer?.type === 'vogueOffer') {
                    return { ...email, offer: { ...email.offer, isAccepted: true } };
                }
                return email;
            });
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: { ...activeData, inbox: updatedInbox },
                },
                activeVogueOffer: { magazine, emailId },
                currentView: 'createVogueFeature'
            };
        }
        case 'CANCEL_VOGUE_OFFER': {
            return {
                ...state,
                activeVogueOffer: null,
                currentView: 'inbox',
            };
        }
        case 'CREATE_VOGUE_FEATURE': {
            if (!state.activeArtistId || !state.activeVogueOffer) return state;
            const { photoshoot } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];
            const activeArtist = state.soloArtist || state.group;
            if (!activeArtist) return state;
    
            const newPosts: XPost[] = [];
    
            // PopBase posts
            newPosts.push({
                id: crypto.randomUUID(),
                authorId: 'popbase',
                content: `${activeArtist.name} is gorgeous on the cover of ${photoshoot.magazine}.`,
                image: photoshoot.coverImage,
                likes: Math.floor(Math.random() * 40000) + 25000,
                retweets: Math.floor(Math.random() * 8000) + 4000,
                views: Math.floor(Math.random() * 800000) + 300000,
                date: state.date
            });
    
            newPosts.push({
                id: crypto.randomUUID(),
                authorId: 'popbase',
                content: `${activeArtist.name} looks flawless for ${photoshoot.magazine}.`,
                image: photoshoot.photoshootImages[0], // Use one of the photoshoot images
                likes: Math.floor(Math.random() * 20000) + 10000,
                retweets: Math.floor(Math.random() * 3000) + 1000,
                views: Math.floor(Math.random() * 400000) + 150000,
                date: state.date
            });
            
            const interviewAnswer = photoshoot.interviewAnswers[0]; // Take the first Q&A
            newPosts.push({
                id: crypto.randomUUID(),
                authorId: 'popbase',
                content: `${activeArtist.name} tells ${photoshoot.magazine} the craziest rumor they have heard about themself:\n\n“${interviewAnswer.answer}”`,
                image: photoshoot.photoshootImages[1],
                likes: Math.floor(Math.random() * 80000) + 50000,
                retweets: Math.floor(Math.random() * 10000) + 5000,
                views: Math.floor(Math.random() * 5000000) + 1000000,
                date: state.date
            });
    
            // TMZ post (shady)
            const pronounPossessive = activeArtist.pronouns === 'he/him' ? 'his' : activeArtist.pronouns === 'she/her' ? 'her' : 'their';
            const shadyComments = [
                `Is that... hair? ${activeArtist.name}'s new ${photoshoot.magazine} cover has people talking, and not in a good way.`,
                `Sources say ${activeArtist.name} was a nightmare on the set of ${pronounPossessive} ${photoshoot.magazine} shoot. Diva alert?`,
                `Another magazine cover for ${activeArtist.name}. Groundbreaking. 🙄`,
                `Someone's trying hard to stay relevant. ${activeArtist.name}'s ${photoshoot.magazine} spread is... a choice.`
            ];
            
            newPosts.push({
                id: crypto.randomUUID(),
                authorId: 'tmz',
                content: shadyComments[Math.floor(Math.random() * shadyComments.length)],
                image: photoshoot.coverImage,
                likes: Math.floor(Math.random() * 5000) + 1000,
                retweets: Math.floor(Math.random() * 1500) + 500,
                views: Math.floor(Math.random() * 400000) + 100000,
                date: state.date
            });
    
            const updatedData = {
                ...activeData,
                voguePhotoshoots: [...(activeData.voguePhotoshoots || []), photoshoot],
                xPosts: [...newPosts, ...activeData.xPosts],
                hype: Math.min(getHypeCap(activeData), activeData.hype + 50),
                popularity: Math.min(100, activeData.popularity + 5),
            };
            
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: updatedData,
                },
                activeVogueOffer: null,
                currentView: 'game',
            };
        }
        case 'SET_CLOUD_SAVE_ID': {
            return {
                ...state,
                cloudSaveId: action.payload
            };
        }
        case 'START_DATING': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const newRelationship: Relationship = {
                id: crypto.randomUUID(),
                partnerName: action.payload.partnerName,
                partnerType: action.payload.partnerType,
                startYear: state.date.year,
                startWeek: state.date.week,
                endYear: null,
                endWeek: undefined,
                status: 'dating',
                isPublic: false
            };
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        relationships: [...(activeData.relationships || []), newRelationship]
                    }
                }
            };
        }
        case 'REVEAL_RELATIONSHIP': {
            if (!state.activeArtistId) return state;
            
            const activeData = state.artistsData[state.activeArtistId];
            const activeArtist = state.soloArtist || state.group;
            if (!activeArtist) return state;

            const updatedRelationships = (activeData.relationships || []).map(r => 
                r.id === action.payload.relationshipId ? { ...r, isPublic: true } : r
            );

            const rel = updatedRelationships.find(r => r.id === action.payload.relationshipId);

            const postContext = action.payload.outlet === 'popbase' 
                ? `Pop Base has exclusively learned that ${activeArtist.name} is dating ${rel?.partnerName}.`
                : `Sources tell TMZ that ${activeArtist.name} and ${rel?.partnerName} are officially an item.`;

            const newPost: XPost = {
                id: crypto.randomUUID(),
                authorId: action.payload.outlet,
                content: postContext,
                image: activeArtist.image,
                likes: Math.floor(Math.random() * 300000) + 100000,
                retweets: Math.floor(Math.random() * 80000) + 20000,
                views: Math.floor(Math.random() * 5000000) + 2000000,
                date: state.date,
            };

            const updatedPosts = activeData.xPosts ? [newPost, ...activeData.xPosts] : [newPost];

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        relationships: updatedRelationships,
                        hype: Math.min(1000, activeData.hype + 50),
                        xPosts: updatedPosts
                    }
                }
            };
        }
        case 'ADVANCE_RELATIONSHIP': {
            if (!state.activeArtistId) return state;
            
            const activeData = state.artistsData[state.activeArtistId];
            const activeArtist = state.soloArtist || state.group;
            if (!activeArtist) return state;

            const updatedRelationships = (activeData.relationships || []).map(r => 
                r.id === action.payload.relationshipId ? { ...r, status: action.payload.newStatus } : r
            );

            const rel = updatedRelationships.find(r => r.id === action.payload.relationshipId);
            
            let newPosts = activeData.xPosts ? [...activeData.xPosts] : [];
            
            if (rel?.isPublic) {
                const postContext = action.payload.newStatus === 'engaged'
                    ? `💍 ${activeArtist.name} and ${rel?.partnerName} are officially engaged!`
                    : `💒 ${activeArtist.name} and ${rel?.partnerName} are officially married!`;
                
                const newPost: XPost = {
                    id: crypto.randomUUID(),
                    authorId: 'tmz',
                    content: postContext,
                    image: activeArtist.image,
                    likes: Math.floor(Math.random() * 500000) + 200000,
                    retweets: Math.floor(Math.random() * 100000) + 40000,
                    views: Math.floor(Math.random() * 8000000) + 3000000,
                    date: state.date,
                };
                newPosts = [newPost, ...newPosts];
            }

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        relationships: updatedRelationships,
                        hype: rel?.isPublic ? Math.min(1000, activeData.hype + 80) : activeData.hype,
                        xPosts: newPosts
                    }
                }
            };
        }
        case 'BREAK_UP': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const activeArtist = state.soloArtist || state.group;
            if (!activeArtist) return state;

            const updatedRelationships = (activeData.relationships || []).map(r => 
                r.id === action.payload.relationshipId ? { ...r, endYear: state.date.year, endWeek: state.date.week, status: 'ex' as const } : r
            );

            const rel = updatedRelationships.find(r => r.id === action.payload.relationshipId);

            let newPosts = activeData.xPosts ? [...activeData.xPosts] : [];

            if (rel?.isPublic) {
                const postContext = `💔 Following rumors, it is confirmed that ${activeArtist.name} and ${rel?.partnerName} have split.`;
                const newPost: XPost = {
                    id: crypto.randomUUID(),
                    authorId: 'tmz',
                    content: postContext,
                    image: activeArtist.image,
                    likes: Math.floor(Math.random() * 200000) + 50000,
                    retweets: Math.floor(Math.random() * 50000) + 10000,
                    views: Math.floor(Math.random() * 4000000) + 1000000,
                    date: state.date,
                };
                newPosts = [newPost, ...newPosts];
            }

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        relationships: updatedRelationships,
                        hype: rel?.isPublic ? Math.min(1000, activeData.hype + 60) : activeData.hype,
                        xPosts: newPosts
                    }
                }
            };
        }
        case 'UPDATE_RELATIONSHIP_IMAGE': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        relationships: (activeData.relationships || []).map(r => 
                            r.id === action.payload.relationshipId ? { ...r, image: action.payload.image } : r
                        )
                    }
                }
            };
        }
        case 'GET_BACK_WITH_EX': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const activeArtist = state.soloArtist || state.group;
            if (!activeArtist) return state;

            const updatedRelationships = (activeData.relationships || []).map(r => 
                r.id === action.payload.relationshipId ? { ...r, status: 'dating' as const, endYear: null, endWeek: undefined, startYear: state.date.year, startWeek: state.date.week } : r
            );

            const rel = updatedRelationships.find(r => r.id === action.payload.relationshipId);
            let newPosts = activeData.xPosts ? [...activeData.xPosts] : [];

            if (rel?.isPublic) {
                const postContext = `👀 SPOTTED: ${activeArtist.name} and ex ${rel?.partnerName} reportedly back together!`;
                const newPost: XPost = {
                    id: crypto.randomUUID(),
                    authorId: 'popcrave',
                    content: postContext,
                    image: activeArtist.image,
                    likes: Math.floor(Math.random() * 200000) + 50000,
                    retweets: Math.floor(Math.random() * 50000) + 10000,
                    views: Math.floor(Math.random() * 4000000) + 1000000,
                    date: state.date,
                };
                newPosts = [newPost, ...newPosts];
            }

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        relationships: updatedRelationships,
                        hype: rel?.isPublic ? Math.min(1000, activeData.hype + 100) : activeData.hype,
                        xPosts: newPosts
                    }
                }
            };
        }
        case 'MARK_EMAIL_OFFER_ANSWERED': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        inbox: activeData.inbox.map(email => 
                            email.id === action.payload.emailId 
                                ? { ...email, offer: { ...email.offer, isAnswered: true } as any } 
                                : email
                        )
                    }
                }
            };
        }
        case 'RESPOND_TO_CHEATING': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const activeArtist = state.soloArtist || state.group;
            if (!activeArtist) return state;

            const rel = (activeData.relationships || []).find(r => r.id === action.payload.relationshipId);
            if (!rel) return state;

            let updatedRelationships = [...(activeData.relationships || [])];
            let newPosts = activeData.xPosts ? [...activeData.xPosts] : [];

            if (action.payload.response === 'break_up') {
                updatedRelationships = updatedRelationships.map(r => 
                    r.id === action.payload.relationshipId ? { ...r, status: 'ex' as const, endYear: state.date.year, endWeek: state.date.week } : r
                );
                const postContext = `💔 Following cheating allegations, ${activeArtist.name} has officially ended things with ${rel.partnerName}.`;
                const newPost: XPost = {
                    id: crypto.randomUUID(),
                    authorId: 'tmz',
                    content: postContext,
                    likes: Math.floor(Math.random() * 300000) + 50000,
                    retweets: Math.floor(Math.random() * 50000) + 10000,
                    views: Math.floor(Math.random() * 5000000) + 1000000,
                    date: state.date,
                };
                newPosts = [newPost, ...newPosts];
            } else if (action.payload.response === 'forgive') {
                const postContext = `👀 Sources say ${activeArtist.name} has decided to forgive ${rel.partnerName} and work through the recent cheating scandal.`;
                const newPost: XPost = {
                    id: crypto.randomUUID(),
                    authorId: 'popbase',
                    content: postContext,
                    likes: Math.floor(Math.random() * 100000) + 50000,
                    retweets: Math.floor(Math.random() * 20000) + 10000,
                    views: Math.floor(Math.random() * 2000000) + 1000000,
                    date: state.date,
                };
                newPosts = [newPost, ...newPosts];
            } else {
                const postContext = `😶 ${activeArtist.name} remains silent amidst the rumors of ${rel.partnerName} cheating.`;
                const newPost: XPost = {
                    id: crypto.randomUUID(),
                    authorId: 'popcrave',
                    content: postContext,
                    likes: Math.floor(Math.random() * 80000) + 50000,
                    retweets: Math.floor(Math.random() * 10000) + 10000,
                    views: Math.floor(Math.random() * 1500000) + 1000000,
                    date: state.date,
                };
                newPosts = [newPost, ...newPosts];
            }

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        relationships: updatedRelationships,
                        hype: Math.min(1000, activeData.hype + 50),
                        xPosts: newPosts
                    }
                }
            };
        }
        case 'START_PREGNANCY': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        pregnancy: {
                            partnerName: action.payload.partnerName,
                            conceptionDate: state.date,
                            revealed: false
                        }
                    }
                }
            };
        }
        case 'REVEAL_PREGNANCY': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const activeArtist = state.soloArtist || state.group;
            if (!activeArtist || !activeData.pregnancy) return state;

            const postContext = `🚨 BREAKING: ${activeArtist.name} is expecting a baby with ${activeData.pregnancy.partnerName}!`;
            const newPost: XPost = {
                id: crypto.randomUUID(),
                authorId: 'tmz',
                content: postContext,
                image: activeArtist.image,
                likes: Math.floor(Math.random() * 500000) + 100000,
                retweets: Math.floor(Math.random() * 100000) + 20000,
                views: Math.floor(Math.random() * 10000000) + 2000000,
                date: state.date,
            };

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        pregnancy: { ...activeData.pregnancy, revealed: true },
                        hype: Math.min(1000, activeData.hype + 200),
                        xPosts: [newPost, ...(activeData.xPosts || [])]
                    }
                }
            };
        }
        case 'GIVE_BIRTH': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            const activeArtist = state.soloArtist || state.group;
            if (!activeArtist) return state;

            const newKid: Kid = {
                id: crypto.randomUUID(),
                name: action.payload.childName,
                birthDate: state.date,
                isArtist: false
            };

            let newPosts = activeData.xPosts ? [...activeData.xPosts] : [];
            if (activeData.pregnancy?.revealed) {
                const pronounPossessive = activeArtist.pronouns === 'he/him' ? 'his' : activeArtist.pronouns === 'she/her' ? 'her' : 'their';
                const postContext = `👶🍼 IT'S A BABY! ${activeArtist.name} has officially welcomed ${pronounPossessive} new baby, ${newKid.name}!`;
                const newPost: XPost = {
                    id: crypto.randomUUID(),
                    authorId: 'popbase',
                    content: postContext,
                    likes: Math.floor(Math.random() * 800000) + 100000,
                    retweets: Math.floor(Math.random() * 100000) + 20000,
                    views: Math.floor(Math.random() * 12000000) + 2000000,
                    date: state.date,
                };
                newPosts = [newPost, ...newPosts];
            }

            return {
                ...state,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        pregnancy: undefined,
                        kids: [...(activeData.kids || []), newKid],
                        hype: activeData.pregnancy?.revealed ? Math.min(1000, activeData.hype + 150) : activeData.hype,
                        xPosts: newPosts
                    }
                }
            };
        }
        case 'START_KID_CAREER': {
            if (!state.activeArtistId) return state;
            const activeData = state.artistsData[state.activeArtistId];
            
            const kids = activeData.kids || [];
            const kid = kids.find(k => k.id === action.payload.kidId);
            if (!kid) return state;

            const updatedKids = kids.map(k => k.id === action.payload.kidId ? { ...k, isArtist: true } : k);

            const activeArtistProfile = state.soloArtist || state.group;

            const newKidArtistId = kid.id;
            const newKidArtist: Artist = {
                id: newKidArtistId,
                name: kid.name,
                type: 'artist',
                skills: { singing: 50, rapping: 50, writing: 50, production: 50 },
                image: activeArtistProfile?.image || 'https://images.unsplash.com/photo-1516280440502-6c2e39194e80',
            };

            const newKidArtistData: ArtistData = {
                ...initialArtistData,
                id: newKidArtistId,
                money: 0,
                hype: 0,
                popularity: 0,
                xUsers: [{
                    id: 'user',
                    name: newKidArtist.name,
                    username: newKidArtist.name.replace(/\s+/g, '').toLowerCase(),
                    avatar: newKidArtist.image,
                    isVerified: false,
                    bio: 'Official account.',
                    followersCount: 0,
                    followingCount: 0,
                    isPlayer: true
                }],
            };

            return {
                ...state,
                extraPlayableArtists: [...(state.extraPlayableArtists || []), newKidArtist],
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        kids: updatedKids
                    },
                    [newKidArtistId]: newKidArtistData
                }
            };
        }
        case 'TOGGLE_ENCOUNTERS':
            return {
                ...state,
                disableEncounters: !state.disableEncounters
            };
        case 'SET_ACTIVE_TMZ_POST':
            return {
                ...state,
                activeTmzPost: action.payload,
                currentView: action.payload ? 'tmzArticle' : state.currentView,
            };
        case 'RESOLVE_ENCOUNTER': {
            if (!state.activeArtistId) return state;
            const { choice, imageUrl } = action.payload;
            const activeData = state.artistsData[state.activeArtistId];
            if (!activeData) return state;

            let authorId = 'tmz';
            if (!choice.isTMZ) {
                const fanFanUser = activeData.xUsers.find(u => !u.isPlayer && !u.isVerified && !['popbase', 'tmz', 'chartdata', 'spotifysnapshot'].includes(u.id));
                if (fanFanUser) {
                    authorId = fanFanUser.id;
                } else {
                    authorId = choice.authorName; // fallback just in case
                }
            }
            
            const activeArtist = state.careerMode === 'solo' ? state.soloArtist : 
                (state.group?.id === state.activeArtistId ? state.group : state.group?.members.find(m => m.id === state.activeArtistId) || state.extraPlayableArtists?.find(a => a.id === state.activeArtistId));
                
            let newPosts = activeData.xPosts || [];
            if (activeArtist) {
                const tweetText = choice.tweetTemplate.replace(/\{artist\}/g, activeArtist.name);
                const pop = (activeData.popularity || 50);
                const newPost: XPost = {
                    id: 'post-' + Date.now(),
                    authorId: authorId,
                    content: tweetText,
                    likes: Math.floor(pop * 1000 * Math.random()) || 0,
                    retweets: Math.floor(pop * 300 * Math.random()) || 0,
                    views: Math.floor(pop * 5000 * Math.random()) || 0,
                    date: state.date,
                    image: imageUrl || undefined
                };
                newPosts = [newPost, ...newPosts];
            }

            return {
                ...state,
                activeEncounter: null,
                artistsData: {
                    ...state.artistsData,
                    [state.activeArtistId]: {
                        ...activeData,
                        publicImage: Math.max(0, Math.min(100, (activeData.publicImage || 50) + choice.publicImageEffect)),
                        hype: Math.max(0, Math.min(100, (activeData.hype || 50) + choice.hypeEffect)),
                        xPosts: newPosts,
                        xUnreadMentions: (activeData.xUnreadMentions || 0) + 1
                    }
                }
            };
        }
        default:
            return state;
    }
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
    const nextState = gameReducerInternal(state, action);
    
    // Interception to duplicate popbase posts for popcrave and apply public image suppression
    if (nextState.artistsData !== state.artistsData) {
        let modified = false;
        const newArtistsData = { ...nextState.artistsData };
        for (const artistId in newArtistsData) {
            let data = newArtistsData[artistId];
            const oldData = state.artistsData[artistId];
            if (!oldData) continue;
            
            const newPosts = data.xPosts.filter(p => !oldData.xPosts.some(op => op.id === p.id));
            let finalNewPosts = [...newPosts];

            if (data.xUsers.some(u => u.id === 'popcrave')) {
                const newPopBasePosts = newPosts.filter(p => p.authorId === 'popbase');
                if (newPopBasePosts.length > 0) {
                    const popCravePosts = newPopBasePosts.map(p => ({
                        ...p,
                        id: crypto.randomUUID(),
                        authorId: 'popcrave',
                        views: Math.floor(p.views * (Math.random() * 0.4 + 0.8)),
                        likes: Math.floor(p.likes * (Math.random() * 0.4 + 0.8)),
                        retweets: Math.floor(p.retweets * (Math.random() * 0.4 + 0.8)),
                    }));
                    finalNewPosts = [...popCravePosts, ...finalNewPosts];
                }
            }
            
            // Public Image suppression
            const publicImageVal = data.publicImage ?? 80;

            // Generate generic NPC quotes
            if (oldData.xPosts.length > 0 && Math.random() < 0.8) { // 80% chance each week for some engagement
                const targetPost = oldData.xPosts[Math.floor(Math.random() * Math.min(oldData.xPosts.length, 20))];
                if (targetPost && !targetPost.quoteOf) {
                    let quoteAuthorId = 'popbase';
                    let quoteContent = "Thoughts on this?";
                    
                    const rand = Math.random();
                    if (rand < 0.25 && data.xUsers.some(u => u.id === 'popcrave')) {
                        quoteAuthorId = 'popcrave';
                    } else if (rand < 0.5) {
                        const hater = data.xUsers.find(u => u.id.startsWith('hater_'));
                        if (hater) {
                            quoteAuthorId = hater.id;
                            quoteContent = ["This is literally so bad lol", "Flop behavior tbh", "We don't care"][Math.floor(Math.random() * 3)];
                        }
                    } else if (rand < 0.75) {
                        const fan = data.xUsers.find(u => u.id.startsWith('addiction_fan_'));
                        if (fan) {
                            quoteAuthorId = fan.id;
                            quoteContent = ["MOTHER", "OMG YESSS", "I'm literally shaking"][Math.floor(Math.random() * 3)];
                        }
                    }
                    
                    const quotePost: XPost = {
                        id: crypto.randomUUID(),
                        authorId: quoteAuthorId,
                        content: quoteContent,
                        quoteOf: targetPost,
                        likes: Math.floor(Math.random() * 50000) + 1000,
                        retweets: Math.floor(Math.random() * 10000) + 500,
                        views: Math.floor(Math.random() * 800000) + 10000,
                        date: nextState.date
                    };
                    finalNewPosts.push(quotePost);
                }
            }

            if (publicImageVal <= 40 && finalNewPosts.length > 0) {
                const modifier = publicImageVal <= 20 ? 0.05 : 0.15;
                finalNewPosts = finalNewPosts.map(p => {
                    // Suppress likes for fan accounts or news accounts, but let hater posts fly
                    if (p.authorId.startsWith('hater_')) return p;
                    if (p.authorId.startsWith('manager_')) return p; // Don't suppress manager? Or maybe yes because public hates them.
                    
                    return {
                        ...p,
                        likes: Math.floor((p.likes || 10) * modifier),
                        retweets: Math.floor((p.retweets || 2) * modifier),
                        // Views remain same
                    };
                });
            }

            if (finalNewPosts.length !== newPosts.length || publicImageVal <= 40) {
                // Reconstruct xPosts with modified `finalNewPosts` 
                // Wait, finalNewPosts contains our new popcrave tweets AND modified existing new tweets.
                // We need to replace the new tweets that are already in `data.xPosts` with the ones in `finalNewPosts`
                
                const olderOldPosts = data.xPosts.slice(newPosts.length); // The ones that were already there
                
                newArtistsData[artistId] = {
                    ...data,
                    xPosts: [...finalNewPosts, ...olderOldPosts]
                };
                modified = true;
            }
        }
        if (modified) {
            return { ...nextState, artistsData: newArtistsData };
        }
    }
    
    return nextState;
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [gameState, dispatch] = useReducer(gameReducer, initialState);
    const [isLoading, setIsLoading] = useState(true);
    const { user, isLoading: isAuthLoading } = useFirebase();

    // Effect for loading game state
    useEffect(() => {
        if (isAuthLoading) return; // Wait until auth is resolved

        const loadGame = async () => {
            try {
                let stateToLoad = null;

                // Load local DB first (always local-first for fast startup)
                const localSave = await db.saves.get(getActiveSaveId());
                if (localSave && localSave.state.careerMode && localSave.state.artistsData) {
                    stateToLoad = localSave.state;
                }

                if (stateToLoad) {
                    dispatch({ type: 'LOAD_GAME', payload: stateToLoad });
                }
            } catch (err) {
                console.error("Could not load game state", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadGame();
    }, [isAuthLoading]); // Now we only depend on local DB on mount

    // Effect for saving game state to IndexedDB on change
    useEffect(() => {
        if (!isLoading && !isAuthLoading && gameState.careerMode) {
            const saveGameToDB = async () => {
                try {
                    await db.saves.put({ id: getActiveSaveId(), state: gameState });
                } catch (err) {
                    console.error("Could not save game state to local DB", err);
                }
            };
            saveGameToDB();
        }
    }, [gameState, isLoading, isAuthLoading]);

    // Effect for debouncing cloud saves (every 10 seconds of inactivity or periodically)
    useEffect(() => {
        if (!isLoading && !isAuthLoading && gameState.careerMode && user) {
            const timeout = setTimeout(async () => {
                try {
                    let currentSaveId = gameState.cloudSaveId;
                    if (!currentSaveId) {
                        currentSaveId = `save_${Date.now()}_${Math.random().toString(36).substring(7)}`;
                        dispatch({ type: 'SET_CLOUD_SAVE_ID', payload: currentSaveId });
                    }
                    await saveGameToCloud(user.uid, currentSaveId, gameState);
                } catch (err) {
                    console.error("Could not background save to Cloud DB", err);
                }
            }, 10000); // 10 seconds debounce
            return () => clearTimeout(timeout);
        }
    }, [gameState, isLoading, isAuthLoading, user]);

    useEffect(() => {
        if (gameState.careerMode === 'online' && gameState.onlineArtist?.id && user?.uid) {
            const fetchOnlineInfo = async () => {
                const { listenToDirectMessages, listenToFeatureRequests, listenToFeatureRequestApprovals } = await import('../firebase');

                const unsubMessages = listenToDirectMessages(gameState.onlineArtist!.id, (messages) => {
                    dispatch({ type: 'SYNC_ONLINE_MESSAGES', payload: messages });
                });

                const unsubRequests = listenToFeatureRequests(gameState.onlineArtist!.id, (requests) => {
                    dispatch({ type: 'SYNC_FEATURE_REQUESTS', payload: requests });
                });

                const unsubApprovals = listenToFeatureRequestApprovals(gameState.onlineArtist!.id, (approvals) => {
                    dispatch({ type: 'SYNC_FEATURE_APPROVALS', payload: approvals });
                });

                return () => {
                    unsubPosts();
                    unsubMessages();
                    unsubRequests();
                    unsubApprovals();
                };
            };
            const promise = fetchOnlineInfo();
            return () => {
                promise.then(cleanup => cleanup && cleanup());
            };
        }
    }, [gameState.careerMode, gameState.onlineArtist?.id, user?.uid]);

    const { activeArtistId, soloArtist, group, artistsData, careerMode } = gameState;

    // Synchronize released songs/albums to Firebase for global online charts
    useEffect(() => {
        if (!isLoading && !isAuthLoading && gameState.careerMode === 'online' && user && gameState.activeArtistId) {

        }
    }, [gameState.date.week, gameState.date.year, isLoading, isAuthLoading, user, gameState.careerMode]);
    const activeArtistData = activeArtistId ? artistsData[activeArtistId] : null;

    let activeArtist: Artist | Group | null = null;
    let allPlayerArtists: Array<Artist | Group> = [];

    if (careerMode === 'solo' && soloArtist) {
        allPlayerArtists = [soloArtist];
    } else if (careerMode === 'group' && group) {
        allPlayerArtists = [group, ...group.members];
    } else if (careerMode === 'online' && gameState.onlineArtist) {
        allPlayerArtists = [gameState.onlineArtist];
    }
    
    if (gameState.extraPlayableArtists) {
        allPlayerArtists = [...allPlayerArtists, ...gameState.extraPlayableArtists];
    }
    
    activeArtist = allPlayerArtists.find(a => a.id === activeArtistId) || null;
    
    if (isLoading) {
        return (
            <div className="bg-zinc-900 text-white min-h-screen flex items-center justify-center">
                <p className="text-xl animate-pulse">Loading Game...</p>
            </div>
        );
    }

    return (
        <GameContext.Provider value={{ gameState, dispatch, activeArtist, activeArtistData, allPlayerArtists }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};
