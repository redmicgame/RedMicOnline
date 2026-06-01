

import React, { useState, useMemo } from 'react';
import { useGame, formatNumber } from '../context/GameContext';
import { GENRES, STUDIOS, NPC_ARTIST_NAMES, NPC_ARTIST_GENRES, NPC_ARTIST_IMAGES } from '../constants';
import type { Song } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

const StudioView: React.FC = () => {
    const { gameState, dispatch, activeArtist, activeArtistData, group, allPlayerArtists } = useGame();
    
    const [mode, setMode] = useState<'single' | 'remixPack' | 'rerecord'>('single');

    const [title, setTitle] = useState('');
    const [genre, setGenre] = useState(GENRES[0]);
    const [studioIndex, setStudioIndex] = useState(0);
    const [isExplicit, setIsExplicit] = useState(false);
    const [coverArt, setCoverArt] = useState<string | null>(null);
    const [collaboration, setCollaboration] = useState<{ artistName: string; cost: number } | null>(null);
    const [isRemix, setIsRemix] = useState(false);
    const [remixOfSongId, setRemixOfSongId] = useState<string>('');
    const [error, setError] = useState('');

    const [producers, setProducers] = useState<string[]>([]);
    const [songwriters, setSongwriters] = useState<string[]>([]);
    const [engineers, setEngineers] = useState<string[]>([]);
    const [anr, setAnr] = useState<string[]>([]);
    const [samples, setSamples] = useState<{ songTitle: string; artistName: string; type: 'Sample' | 'Interpolation'; coverArt: string }[]>([]);

    // Auto Remix Pack Maker state
    const [remixPackTargetId, setRemixPackTargetId] = useState<string>('');
    const [reRecordTargetId, setReRecordTargetId] = useState<string>('');
    const [reRecordTitle, setReRecordTitle] = useState<string>('');
    const [selectedRemixTypes, setSelectedRemixTypes] = useState<Set<string>>(new Set());
    const [feature1, setFeature1] = useState<{ artistName: string; cost: number } | null>(null);
    const [feature2, setFeature2] = useState<{ artistName: string; cost: number } | null>(null);

    const REMIX_TYPES = [
        'Sped Up',
        'Slowed Down',
        'Instrumental',
        'Acapella',
        'Super Sped Up',
        'Slowed & Reverb',
        'Feature 1',
        'Feature 2'
    ];

    if (!activeArtistData || !activeArtist) return null;
    const { money, releases, songs } = activeArtistData;
    const { careerMode } = gameState;
    const selectedStudio = STUDIOS[studioIndex];

    const hasReleasedAlbum = useMemo(() => {
        return releases.some(r => r.type === 'Album' || r.type === 'Album (Deluxe)' || r.type === 'Compilation');
    }, [releases]);

    const potentialRemixTargets = useMemo(() => {
        return songs.filter(s => !s.remixOfSongId);
    }, [songs]);

    const potentialReRecordTargets = useMemo(() => {
        return songs.filter(s => s.isTakenDown);
    }, [songs]);

    const handleRemixToggle = (checked: boolean) => {
        setIsRemix(checked);
        if (checked && potentialRemixTargets.length > 0) {
            setRemixOfSongId(potentialRemixTargets[0].id);
        } else {
            setRemixOfSongId('');
        }
    };

    const potentialCollaborators = useMemo(() => {
        const npcs = NPC_ARTIST_NAMES.slice().sort();
        const otherPlayerArtists = allPlayerArtists
            .filter(a => a.id !== activeArtist.id)
            .map(a => a.name)
            .sort();
        return [...otherPlayerArtists, ...npcs];
    }, [allPlayerArtists, activeArtist]);

    const potentialProducers = useMemo(() => {
        return ["Metro Boomin", "Mike Dean", "Rick Rubin", "Pharrell Williams", "Max Martin", "Timbaland", "Benny Blanco", "Mustard", "London on da Track", "Murda Beatz", "Jack Antonoff", "Wheezy", "Boi-1da", "Tay Keith", "Southside", "Dr. Luke", "Kanye West", "Sean Combs", "Phil Spector"].sort();
    }, []);

    const generateRandomNames = (count: number) => {
        const FIRST_NAMES = ["James", "Michael", "Robert", "John", "David", "William", "Richard", "Joseph", "Thomas", "Charles", "Christopher", "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven", "Paul", "Andrew", "Joshua", "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen"];
        const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
        return Array.from({length: count}).map(() => `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`);
    };

    const potentialEngineers = useMemo(() => generateRandomNames(15).sort(), []);
    const potentialAnR = useMemo(() => generateRandomNames(15).sort(), []);

    const handleCoverArtUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverArt(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const getFeatureCost = (artistName: string) => {
        if (allPlayerArtists.some(a => a.name === artistName && a.id !== activeArtist.id)) {
            return 0; // Other playable characters (including kids) are free to feature
        }
        
        const genre = NPC_ARTIST_GENRES[artistName];
        if (genre === 'Indie') {
            return Math.floor(Math.random() * (25000 - 5000 + 1)) + 5000;
        }

        return Math.floor(Math.random() * (7000000 - 25000 + 1)) + 25000;
    };

    const handleCollaborationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const artistName = e.target.value;
        if (artistName) {
            setCollaboration({ artistName, cost: getFeatureCost(artistName) });
        } else {
            setCollaboration(null);
        }
    };

    const handleFeature1Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const artistName = e.target.value;
        if (artistName) {
            setFeature1({ artistName, cost: getFeatureCost(artistName) });
        } else {
            setFeature1(null);
        }
    };

    const handleFeature2Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const artistName = e.target.value;
        if (artistName) {
            setFeature2({ artistName, cost: getFeatureCost(artistName) });
        } else {
            setFeature2(null);
        }
    };

    const toggleRemixType = (type: string) => {
        const newSet = new Set(selectedRemixTypes);
        if (newSet.has(type)) {
            newSet.delete(type);
            if (type === 'Feature 1') setFeature1(null);
            if (type === 'Feature 2') setFeature2(null);
        } else {
            newSet.add(type);
        }
        setSelectedRemixTypes(newSet);
    };

    const handleRecord = () => {
        setError('');
        if (!title.trim() || !coverArt) {
            setError('Song title and cover art are required.');
            return;
        }
        if (isRemix) {
            if (!remixOfSongId) {
                setError('You must select a song to remix.');
                return;
            }
            const existingRemixes = songs.filter(s => s.remixOfSongId === remixOfSongId).length;
            if (existingRemixes >= 8) {
                setError('You can only make up to 8 remixes of a single song.');
                return;
            }
        }
        const totalCost = selectedStudio.cost + (collaboration ? collaboration.cost : 0);
        if (money < totalCost) {
            setError("You don't have enough money for this session.");
            return;
        }
        
        const [min, max] = selectedStudio.qualityRange;
        const qualityBoost = collaboration ? Math.floor(Math.random() * 10) + 1 : 0;
        const quality = (Math.floor(Math.random() * (max - min + 1)) + min) + qualityBoost;
        const finalQuality = Math.min(100, quality);
        
        const songTitle = collaboration ? `${title.trim()} (feat. ${collaboration.artistName})` : title.trim();

        const CONTROVERSIAL_PRODUCERS = ["Dr. Luke", "Kanye West", "Sean Combs", "Phil Spector"];
        const controversialContributors = [
            ...producers,
            ...songwriters,
            ...engineers,
            ...anr
        ].filter(name => CONTROVERSIAL_PRODUCERS.includes(name));

        const generateCut = () => Math.floor(Math.random() * 10) + 1;
        const totalCuts = producers.reduce((sum) => sum + generateCut(), 0) +
                          songwriters.reduce((sum) => sum + generateCut(), 0) +
                          engineers.reduce((sum) => sum + generateCut(), 0) +
                          anr.reduce((sum) => sum + generateCut(), 0);

        const newSong: Song = {
            id: crypto.randomUUID(),
            title: songTitle,
            genre,
            quality: finalQuality,
            coverArt,
            isReleased: false,
            streams: 0,
            lastWeekStreams: 0,
            prevWeekStreams: 0,
            duration: Math.floor(Math.random() * (240 - 120 + 1)) + 120, // 2 to 4 minutes
            explicit: isExplicit,
            artistId: activeArtist.id,
            removedStreams: 0,
            collaboration: collaboration ? { ...collaboration, qualityBoost } : undefined,
            remixOfSongId: isRemix ? remixOfSongId : undefined,
            dailyStreams: [],
            producers,
            songwriters,
            engineers,
            anr,
            samples,
            controversialContributors,
            contributorCutsTotal: totalCuts,
        };

        dispatch({ type: 'RECORD_SONG', payload: { song: newSong, cost: totalCost } });
        dispatch({ type: 'CHANGE_VIEW', payload: 'game' });
    };

    const handleReRecord = () => {
        setError('');
        if (!reRecordTargetId) {
            setError('You must select a song to re-record.');
            return;
        }
        if (!reRecordTitle.trim() || !coverArt) {
            setError('Song title and cover art are required.');
            return;
        }
        
        const totalCost = selectedStudio.cost + (collaboration ? collaboration.cost : 0);
        if (money < totalCost) {
            setError("You don't have enough money for this session.");
            return;
        }

        const targetSong = songs.find(s => s.id === reRecordTargetId);
        if (!targetSong) return;

        // Base quality determined by studio, plus some variance and skill boost
        let baseQuality = 50 + (studioIndex * 15) + (Math.random() * 20 - 10) + (activeArtistData.skill * 0.2);
        
        // Boost quality for re-recorded songs to make them viable replacements
        baseQuality += 10;
        
        const qualityBoost = collaboration ? 15 : 0; 
        const finalQuality = Math.min(100, Math.max(1, Math.floor(baseQuality + qualityBoost)));

        // Fixed contributors for re-recording (same cost applies)
        let producersCut = 0;
        let songwritersCut = 0;
        let engineersCut = 0;
        let anrCut = 0;

        const producersList = Array.from({length: Math.floor(Math.random() * 3) + 1}).map(() => potentialProducers[Math.floor(Math.random() * potentialProducers.length)]);
        const songwritersList = Array.from({length: Math.floor(Math.random() * 4) + 1}).map(() => potentialCollaborators[Math.floor(Math.random() * potentialCollaborators.length)]);
        const engineersList = Array.from({length: Math.floor(Math.random() * 2) + 1}).map(() => potentialEngineers[Math.floor(Math.random() * potentialEngineers.length)]);
        
        if (producersList.length > 0) producersCut = producersList.length * 5;
        if (songwritersList.length > 0) songwritersCut = songwritersList.length * 5;
        if (engineersList.length > 0) engineersCut = engineersList.length * 1;
        anrCut = 2; // Fixed A&R cut

        const totalCuts = producersCut + songwritersCut + engineersCut + anrCut;

        const newSong: Song = {
            id: crypto.randomUUID(),
            title: reRecordTitle,
            genre,
            quality: finalQuality,
            coverArt,
            isReleased: false,
            streams: 0,
            lastWeekStreams: 0,
            prevWeekStreams: 0,
            duration: targetSong.duration,
            explicit: isExplicit,
            artistId: activeArtist.id,
            removedStreams: 0,
            collaboration: collaboration ? { ...collaboration, qualityBoost } : undefined,
            remixOfSongId: undefined, // Re-recordings are standalone versions
            dailyStreams: [],
            producers: producersList,
            songwriters: songwritersList,
            engineers: engineersList,
            anr: [potentialAnR[Math.floor(Math.random() * potentialAnR.length)]],
            samples: [],
            controversialContributors: [],
            contributorCutsTotal: totalCuts,
        };

        dispatch({ type: 'RECORD_SONG', payload: { song: newSong, cost: totalCost } });
        dispatch({ type: 'CHANGE_VIEW', payload: 'game' });
    };

    const handleCreateRemixPack = () => {
        setError('');
        if (!remixPackTargetId) {
            setError('You must select a target song.');
            return;
        }
        if (selectedRemixTypes.size === 0) {
            setError('You must select at least one remix type.');
            return;
        }
        if (selectedRemixTypes.has('Feature 1') && !feature1) {
            setError('Select an artist for Feature 1.');
            return;
        }
        if (selectedRemixTypes.has('Feature 2') && !feature2) {
            setError('Select an artist for Feature 2.');
            return;
        }

        const targetSong = songs.find(s => s.id === remixPackTargetId);
        if (!targetSong) return;

        const existingRemixes = songs.filter(s => s.remixOfSongId === remixPackTargetId).length;
        if (existingRemixes + selectedRemixTypes.size > 8) {
            setError(`You can only have up to 8 remixes for a single song. You currently have ${existingRemixes}.`);
            return;
        }

        let totalFeatureCost = 0;
        if (feature1) totalFeatureCost += feature1.cost;
        if (feature2) totalFeatureCost += feature2.cost;

        const packTotalCost = (selectedStudio.cost * selectedRemixTypes.size) + totalFeatureCost;
        if (money < packTotalCost) {
            setError("You don't have enough money for this remix pack.");
            return;
        }

        const [min, max] = selectedStudio.qualityRange;
        
        const newSongs: Song[] = [];

        const CONTROVERSIAL_PRODUCERS = ["Dr. Luke", "Kanye West", "Sean Combs", "Phil Spector"];
        const controversialContributors = [
            ...producers,
            ...songwriters,
            ...engineers,
            ...anr
        ].filter(name => CONTROVERSIAL_PRODUCERS.includes(name));

        const generateCut = () => Math.floor(Math.random() * 10) + 1;
        const totalCuts = producers.reduce((sum) => sum + generateCut(), 0) +
                          songwriters.reduce((sum) => sum + generateCut(), 0) +
                          engineers.reduce((sum) => sum + generateCut(), 0) +
                          anr.reduce((sum) => sum + generateCut(), 0);

        Array.from(selectedRemixTypes).forEach(type => {
            let typeName = type;
            let currentFeature = null;

            if (type === 'Feature 1') {
                currentFeature = feature1;
                typeName = `feat. ${feature1!.artistName}`;
            } else if (type === 'Feature 2') {
                currentFeature = feature2;
                typeName = `feat. ${feature2!.artistName}`;
            }

            const qualityBoost = currentFeature ? Math.floor(Math.random() * 10) + 1 : 0;
            const quality = (Math.floor(Math.random() * (max - min + 1)) + min) + qualityBoost;
            const finalQuality = Math.min(100, quality);

            newSongs.push({
                ...targetSong,
                id: crypto.randomUUID(),
                title: `${targetSong.title} (${typeName})`,
                quality: finalQuality,
                isReleased: false,
                releaseId: undefined,
                streams: 0,
                lastWeekStreams: 0,
                prevWeekStreams: 0,
                dailyStreams: [],
                collaboration: currentFeature ? { ...currentFeature, qualityBoost } : undefined,
                remixOfSongId: targetSong.id,
                soundtrackTitle: undefined,
                producers,
                songwriters,
                engineers,
                anr,
                samples,
                controversialContributors,
                contributorCutsTotal: totalCuts,
            });
        });

        dispatch({ type: 'CREATE_REMIX_PACK', payload: { songs: newSongs, cost: packTotalCost } });
        dispatch({ type: 'CHANGE_VIEW', payload: 'game' });
    };

    const totalCost = selectedStudio.cost + (collaboration ? collaboration.cost : 0);
    
    let packFeatureCost = 0;
    if (selectedRemixTypes.has('Feature 1') && feature1) packFeatureCost += feature1.cost;
    if (selectedRemixTypes.has('Feature 2') && feature2) packFeatureCost += feature2.cost;
    const packTotalCost = (selectedStudio.cost * selectedRemixTypes.size) + packFeatureCost;

    const renderMultiSelect = (label: string, state: string[], setState: React.Dispatch<React.SetStateAction<string[]>>, options: string[]) => (
        <div className="mt-4">
            <label className="block text-sm font-medium text-zinc-300">{label}</label>
            <div className="flex flex-wrap gap-2 mt-2">
                {state.map(item => (
                    <span key={item} className="bg-zinc-600 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        {item}
                        <button onClick={() => setState(s => s.filter(i => i !== item))} className="hover:text-red-400">×</button>
                    </span>
                ))}
            </div>
            {state.length < 20 && (
                <select 
                    value="" 
                    onChange={e => {
                        if (e.target.value && !state.includes(e.target.value)) {
                            setState(s => [...s, e.target.value]);
                        }
                    }} 
                    className="mt-2 block w-full bg-zinc-700 border-zinc-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm h-10 px-3"
                >
                    <option value="">Add {label}...</option>
                    {options.filter(c => !state.includes(c)).map(name => (
                        <option key={name} value={name}>{name}</option>
                    ))}
                </select>
            )}
        </div>
    );

    const handleAddSample = (artistName: string, type: 'Sample' | 'Interpolation') => {
        const dummyTitles = ["Greatest Hit", "Classic Vibe", "Love Song", "Summer Night", "The Anthem", "Heartbreak", "Memories"];
        const songTitle = dummyTitles[Math.floor(Math.random() * dummyTitles.length)];
        
        let coverArt = `https://ui-avatars.com/api/?name=${encodeURIComponent(artistName)}&background=random&color=fff`;
        const p = allPlayerArtists.find(a => a.name === artistName);
        if (p) coverArt = p.image;
        else if (NPC_ARTIST_IMAGES[artistName]) coverArt = NPC_ARTIST_IMAGES[artistName];

        setSamples(s => [...s, { songTitle: `${songTitle}`, artistName, type, coverArt }]);
    };

    return (
         <div className="h-screen w-full bg-zinc-900 overflow-y-auto">
            <header className="p-4 flex items-center gap-4 sticky top-0 bg-zinc-900/80 backdrop-blur-sm z-10 border-b border-zinc-700/50">
                <button onClick={() => dispatch({type: 'CHANGE_VIEW', payload: 'game'})} className="p-2 rounded-full hover:bg-white/10">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold flex-1">Studio Session</h1>
                
                <div className="flex bg-zinc-800 rounded-lg p-1 overflow-x-auto">
                    <button
                        onClick={() => { setMode('single'); setError(''); }}
                        className={`px-4 py-1 rounded-md text-sm font-semibold transition-colors shrink-0 ${mode === 'single' ? 'bg-zinc-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                    >
                        Single Track
                    </button>
                    <button
                        onClick={() => { setMode('remixPack'); setError(''); }}
                        className={`px-4 py-1 rounded-md text-sm font-semibold transition-colors shrink-0 ${mode === 'remixPack' ? 'bg-zinc-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                    >
                        Auto Remix Pack
                    </button>
                    <button
                        onClick={() => { setMode('rerecord'); setError(''); }}
                        className={`px-4 py-1 rounded-md text-sm font-semibold transition-colors shrink-0 ${mode === 'rerecord' ? 'bg-zinc-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                    >
                        Re-record Song
                    </button>
                </div>
            </header>
            
            <div className="p-4 space-y-6">
                {mode === 'single' && (
                    <>
                        <div className="flex justify-center">
                            <label htmlFor="cover-art" className="cursor-pointer">
                                <div className="w-48 h-48 rounded-lg bg-zinc-800 border-2 border-dashed border-zinc-600 flex items-center justify-center hover:border-red-500 transition-colors">
                                    {coverArt ? (
                                        <img src={coverArt} alt="Cover Art" className="w-full h-full rounded-lg object-cover" />
                                    ) : (
                                        <span className="text-zinc-400 text-sm text-center">Upload Cover Art</span>
                                    )}
                                </div>
                            </label>
                            <input id="cover-art" type="file" accept="image/*" className="hidden" onChange={handleCoverArtUpload} />
                        </div>
                        
                        <div>
                            <label htmlFor="song-title" className="block text-sm font-medium text-zinc-300">Song Title</label>
                            <input type="text" id="song-title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full bg-zinc-700 border-zinc-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm h-10 px-3"/>
                        </div>

                         <div>
                            <label htmlFor="collaboration" className="block text-sm font-medium text-zinc-300">Collaboration (Optional)</label>
                            <select id="collaboration" onChange={handleCollaborationChange} className="mt-1 block w-full bg-zinc-700 border-zinc-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm h-10 px-3">
                                <option value="">None</option>
                                {potentialCollaborators.map(name => <option key={name} value={name}>{name}</option>)}
                            </select>
                            {collaboration && (
                                <p className="text-sm text-yellow-400 mt-2">Feature Cost: ${formatNumber(collaboration.cost)}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="genre" className="block text-sm font-medium text-zinc-300">Genre</label>
                            <select id="genre" value={genre} onChange={e => setGenre(e.target.value)} className="mt-1 block w-full bg-zinc-700 border-zinc-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm h-10 px-3">
                                {GENRES.map(g => <option key={g}>{g}</option>)}
                            </select>
                        </div>
                        
                        <div className="pt-4 border-t border-zinc-700/50 mt-4 space-y-2">
                            <h3 className="text-lg font-bold">Contributors (SongDNA)</h3>
                            <p className="text-xs text-zinc-400">Add up to 20 for each category.</p>
                            {renderMultiSelect('Producers', producers, setProducers, potentialProducers)}
                            {renderMultiSelect('Songwriters', songwriters, setSongwriters, potentialCollaborators)}
                            {renderMultiSelect('Mix & Mastering Engineers', engineers, setEngineers, potentialEngineers)}
                            {renderMultiSelect('A&R', anr, setAnr, potentialAnR)}

                            <div className="mt-6 border-t border-zinc-700/50 pt-4">
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Samples & Interpolations</label>
                                <div className="space-y-2 mb-2">
                                    {samples.map((s, i) => (
                                        <div key={i} className="flex justify-between items-center bg-zinc-800 p-2 rounded">
                                            <div>
                                                <p className="text-sm font-bold">{s.songTitle}</p>
                                                <p className="text-xs text-zinc-400">{s.artistName} • {s.type}</p>
                                            </div>
                                            <button onClick={() => setSamples(arr => arr.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300 text-sm">Remove</button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                                    <select id="sampleArtist" className="flex-1 bg-zinc-700 border-zinc-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm h-10 px-3">
                                        <option value="">Select Artist to Sample...</option>
                                        {potentialCollaborators.map(name => <option key={name} value={name}>{name}</option>)}
                                    </select>
                                    <div className="flex gap-2">
                                        <button onClick={() => {
                                            const select = document.getElementById('sampleArtist') as HTMLSelectElement;
                                            if(select.value) { handleAddSample(select.value, 'Sample'); select.value = ''; }
                                        }} className="bg-zinc-600 px-3 py-2 rounded-md text-sm hover:bg-zinc-500 font-bold whitespace-nowrap">Sample</button>
                                        <button onClick={() => {
                                            const select = document.getElementById('sampleArtist') as HTMLSelectElement;
                                            if(select.value) { handleAddSample(select.value, 'Interpolation'); select.value = ''; }
                                        }} className="bg-zinc-600 px-3 py-2 rounded-md text-sm hover:bg-zinc-500 font-bold whitespace-nowrap">Interpolate</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                id="explicit-checkbox"
                                type="checkbox"
                                checked={isExplicit}
                                onChange={(e) => setIsExplicit(e.target.checked)}
                                className="h-4 w-4 rounded border-zinc-500 bg-zinc-700 text-red-600 focus:ring-red-500"
                            />
                            <label htmlFor="explicit-checkbox" className="ml-2 block text-sm text-zinc-300">
                                Explicit Content <span className="text-xs text-zinc-400">(more hype on release)</span>
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                id="remix-checkbox"
                                type="checkbox"
                                checked={isRemix}
                                onChange={(e) => handleRemixToggle(e.target.checked)}
                                disabled={potentialRemixTargets.length === 0}
                                className="h-4 w-4 rounded border-zinc-500 bg-zinc-700 text-red-600 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <label htmlFor="remix-checkbox" className="ml-2 block text-sm text-zinc-300">
                                Manual Song Remix
                            </label>
                        </div>

                        {isRemix && (
                            <div>
                                <label htmlFor="remix-target" className="block text-sm font-medium text-zinc-300">Select Song to Remix</label>
                                <select id="remix-target" value={remixOfSongId} onChange={e => setRemixOfSongId(e.target.value)} className="mt-1 block w-full bg-zinc-700 border-zinc-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm h-10 px-3">
                                    <option value="">Select a song</option>
                                    {potentialRemixTargets.map(song => (
                                        <option key={song.id} value={song.id}>{song.title}</option>
                                    ))}
                                </select>
                                {remixOfSongId && (
                                   <p className="text-xs text-zinc-400 mt-1">
                                       Remixes: {songs.filter(s => s.remixOfSongId === remixOfSongId).length} / 8
                                   </p>
                                )}
                            </div>
                        )}

                        <div>
                            <h3 className="block text-sm font-medium text-zinc-300 mb-2">Select Studio</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {STUDIOS.map((studio, index) => (
                                    <button key={studio.name} onClick={() => setStudioIndex(index)} className={`p-4 rounded-lg text-left transition-all border-2 ${studioIndex === index ? 'border-red-500 bg-red-500/10' : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'}`}>
                                        <p className="font-bold">{studio.name}</p>
                                        <p className="text-sm text-green-400">-${studio.cost.toLocaleString()}</p>
                                        <p className="text-xs text-zinc-400 mt-1">Est. Quality: ???</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        
                        <button onClick={handleRecord} className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-lg shadow-red-600/20 disabled:bg-zinc-600 disabled:shadow-none" disabled={money < totalCost}>
                            Record Song (-${totalCost.toLocaleString()})
                        </button>
                    </>
                )}
                {mode === 'remixPack' && (
                    <>
                        <div className="bg-zinc-800/50 border border-zinc-700 p-6 rounded-xl">
                            <h2 className="text-lg font-bold mb-4">Auto Remix Pack Maker</h2>
                            <p className="text-sm text-zinc-400 mb-6">Instantly generate a bundle of remixes for a track. Remixed songs share cover art and automatically link to the original track on charts.</p>
                            
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="pack-remix-target" className="block text-sm font-medium text-zinc-300">Original Song</label>
                                    <select id="pack-remix-target" value={remixPackTargetId} onChange={e => { setRemixPackTargetId(e.target.value); setSelectedRemixTypes(new Set()); setError(''); }} className="mt-1 block w-full bg-zinc-700 border-zinc-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm h-10 px-3">
                                        <option value="">Select a song</option>
                                        {potentialRemixTargets.map(song => (
                                            <option key={song.id} value={song.id}>{song.title}</option>
                                        ))}
                                    </select>
                                    {remixPackTargetId && (
                                       <p className="text-xs text-zinc-400 mt-2">
                                           Existing Remixes: {songs.filter(s => s.remixOfSongId === remixPackTargetId).length} / 8 allowable
                                       </p>
                                    )}
                                </div>

                                {remixPackTargetId && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-300 mb-3">Select Remix Types <span className="text-zinc-500 text-xs font-normal ml-2">(${formatNumber(selectedStudio.cost)} studio time per track)</span></label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {REMIX_TYPES.map(type => {
                                                    const isSelected = selectedRemixTypes.has(type);
                                                    return (
                                                        <button 
                                                            key={type}
                                                            onClick={() => toggleRemixType(type)}
                                                            className={`p-3 rounded-lg border flex flex-col items-start transition-all ${isSelected ? 'border-red-500 bg-red-500/10' : 'border-zinc-700 bg-zinc-800 hover:border-zinc-500'}`}
                                                        >
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'border-red-500 bg-red-500' : 'border-zinc-500'}`}>
                                                                    {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                                                                </div>
                                                                <span className="font-semibold text-sm">{type}</span>
                                                            </div>
                                                            <span className="text-xs text-zinc-500 text-left w-full pl-6">+1 track</span>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {selectedRemixTypes.has('Feature 1') && (
                                            <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
                                                <label htmlFor="feature1" className="block text-sm font-medium text-zinc-300">Feature 1 Artist</label>
                                                <select id="feature1" onChange={handleFeature1Change} className="mt-1 block w-full bg-zinc-700 border-zinc-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm h-10 px-3">
                                                    <option value="">None</option>
                                                    {potentialCollaborators.map(name => <option key={name} value={name}>{name}</option>)}
                                                </select>
                                                {feature1 && (
                                                    <p className="text-sm text-yellow-400 mt-2">Feature Cost: ${formatNumber(feature1.cost)}</p>
                                                )}
                                            </div>
                                        )}

                                        {selectedRemixTypes.has('Feature 2') && (
                                            <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
                                                <label htmlFor="feature2" className="block text-sm font-medium text-zinc-300">Feature 2 Artist</label>
                                                <select id="feature2" onChange={handleFeature2Change} className="mt-1 block w-full bg-zinc-700 border-zinc-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm h-10 px-3">
                                                    <option value="">None</option>
                                                    {potentialCollaborators.map(name => <option key={name} value={name}>{name}</option>)}
                                                </select>
                                                {feature2 && (
                                                    <p className="text-sm text-yellow-400 mt-2">Feature Cost: ${formatNumber(feature2.cost)}</p>
                                                )}
                                            </div>
                                        )}
                                        
                                        <div>
                                            <h3 className="block text-sm font-medium text-zinc-300 mb-2">Select Studio (Affects all remixes in pack)</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                {STUDIOS.map((studio, index) => (
                                                    <button key={studio.name} onClick={() => setStudioIndex(index)} className={`p-4 rounded-lg text-left transition-all border-2 ${studioIndex === index ? 'border-red-500 bg-red-500/10' : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'}`}>
                                                        <p className="font-bold">{studio.name}</p>
                                                        <p className="text-sm text-green-400">-${studio.cost.toLocaleString()} / track</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                                
                                {remixPackTargetId && selectedRemixTypes.size > 0 && (
                                    <div className="mt-8 pt-6 border-t border-zinc-700">
                                        <div className="flex justify-between items-center mb-4 text-zinc-300">
                                            <span>Studio Cost ({selectedRemixTypes.size} tracks x ${formatNumber(selectedStudio.cost)})</span>
                                            <span>${formatNumber(selectedStudio.cost * selectedRemixTypes.size)}</span>
                                        </div>
                                        {packFeatureCost > 0 && (
                                            <div className="flex justify-between items-center mb-4 text-zinc-300">
                                                <span>Features Cost</span>
                                                <span>${formatNumber(packFeatureCost)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center mb-6 text-xl font-bold text-white">
                                            <span>Total Valid Cost</span>
                                            <span>${formatNumber(packTotalCost)}</span>
                                        </div>
                                        <button onClick={handleCreateRemixPack} className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-lg shadow-red-600/20 disabled:bg-zinc-600 disabled:shadow-none" disabled={money < packTotalCost}>
                                            Generate Remix Pack (-${formatNumber(packTotalCost)})
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
                {mode === 'rerecord' && (
                    <>
                        <div className="bg-zinc-800/50 border border-zinc-700 p-6 rounded-xl space-y-6">
                            <h2 className="text-lg font-bold mb-4">Re-Record Taken Down Song</h2>
                            <p className="text-sm text-zinc-400 mb-6">Reclaiming your masters by re-recording taken down material. Re-recording restores streaming to a new master recording.</p>
                            
                            <div>
                                <label htmlFor="rerecord-target" className="block text-sm font-medium text-zinc-300">Select Taken Down Song</label>
                                <select 
                                    id="rerecord-target" 
                                    value={reRecordTargetId} 
                                    onChange={e => { 
                                        const song = songs.find(s => s.id === e.target.value);
                                        setReRecordTargetId(e.target.value); 
                                        if (song) setReRecordTitle(`${song.title} (Your Version)`);
                                    }} 
                                    className="mt-1 block w-full bg-zinc-700 border-zinc-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm h-10 px-3"
                                >
                                    <option value="">Select a song</option>
                                    {potentialReRecordTargets.map(song => (
                                        <option key={song.id} value={song.id}>{song.title}</option>
                                    ))}
                                </select>
                            </div>
                            
                            {reRecordTargetId && (
                                <>
                                    <div className="flex justify-center mt-6">
                                        <label htmlFor="rerecord-cover-art" className="cursor-pointer">
                                            <div className="w-48 h-48 rounded-lg bg-zinc-800 border-2 border-dashed border-zinc-600 flex items-center justify-center hover:border-red-500 transition-colors">
                                                {coverArt ? (
                                                    <img src={coverArt} alt="Cover Art" className="w-full h-full rounded-lg object-cover" />
                                                ) : (
                                                    <span className="text-zinc-400 text-sm text-center">Upload Cover Art</span>
                                                )}
                                            </div>
                                        </label>
                                        <input id="rerecord-cover-art" type="file" accept="image/*" className="hidden" onChange={handleCoverArtUpload} />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="rerecord-title" className="block text-sm font-medium text-zinc-300">New Song Title</label>
                                        <input type="text" id="rerecord-title" value={reRecordTitle} onChange={e => setReRecordTitle(e.target.value)} className="mt-1 block w-full bg-zinc-700 border-zinc-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm h-10 px-3"/>
                                    </div>

                                    <div>
                                        <h3 className="block text-sm font-medium text-zinc-300 mb-2">Select Studio</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {STUDIOS.map((studio, index) => (
                                                <button key={studio.name} onClick={() => setStudioIndex(index)} className={`p-4 rounded-lg text-left transition-all border-2 ${studioIndex === index ? 'border-red-500 bg-red-500/10' : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'}`}>
                                                    <p className="font-bold">{studio.name}</p>
                                                    <p className="text-sm text-green-400">-${studio.cost.toLocaleString()}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                                    
                                    <button onClick={handleReRecord} className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-lg shadow-red-600/20 disabled:bg-zinc-600 disabled:shadow-none" disabled={money < selectedStudio.cost}>
                                        Re-record Song (-${selectedStudio.cost.toLocaleString()})
                                    </button>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default StudioView;
