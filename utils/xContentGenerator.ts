
import { ArtistData, GameState, XPost, XUser, XTrend, Song, Video, XChat, XMessage } from '../types';
import { formatNumber } from '../context/GameContext';
import { LABELS } from '../constants';

type PlayerSongWithChart = Song & { chartRank?: number };

const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateFanUsername = (artistName: string): string => {
    const prefixes = ['stan', 'lover', 'fan', 'archive', 'daily', 'bestof'];
    const suffixes = ['updates', 'hq', 'source', 'forever', 'stanacc'];
    const cleanedName = artistName.replace(/\s/g, '');
    if (Math.random() > 0.5) {
        return `${pickRandom(prefixes)}${cleanedName}`;
    }
    return `${cleanedName}${pickRandom(suffixes)}`;
};

const generateHaterUsername = (): string => {
    const prefixes = ['user', 'anon', 'hater', 'critic', 'reality'];
    const suffixes = ['123', ' Speaks', 'Facts', 'XoXo', '001'];
    return `${pickRandom(prefixes)}${pickRandom(suffixes)}`;
};

const generateLeakChannelUsername = (artistName: string): { name: string; username: string } => {
    const cleanedName = artistName.replace(/\s/g, '').toLowerCase();
    const suffixes = ['Leaks', 'Unreleased', 'Archive', 'LostMedia', 'Vault', 'Demos', 'Files'];
    const randomSuffix = pickRandom(suffixes);

    const username = `${cleanedName}${randomSuffix.toLowerCase()}`;
    const name = `${artistName} ${randomSuffix}`;

    return { name, username };
};

const getGameDateString = (gameDate: { week: number; year: number }) => {
    const date = new Date(gameDate.year, 0, (gameDate.week - 1) * 7 + 1);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

export const generateWeeklyXContent = (
    artistData: ArtistData,
    gameState: GameState,
    artistName: string,
    playerSongs: PlayerSongWithChart[],
    leakedSong: Song | null
): { newPosts: XPost[], newUsers: XUser[], newTrends: XTrend[], newChats: XChat[], newMessages: {chatId: string, message: XMessage}[] } => {
    const newPosts: XPost[] = [];
    const newUsers: XUser[] = [];
    const newTrends: XTrend[] = [];
    const newChats: XChat[] = [];
    const newMessages: {chatId: string, message: XMessage}[] = [];
    const { date } = gameState;
    const { artistImages, artistVideoThumbnails, releases, streamsRemovedThisWeek, paparazziPhotos, tours, voguePhotoshoots, songs, tourPhotos, popularity, xChats } = artistData;

    const artistProfile = [gameState.soloArtist, ...(gameState.group?.members || []), gameState.group, ...(gameState.extraPlayableArtists || [])].find(a => a?.id === gameState.activeArtistId);
    // @ts-ignore
    const pronouns = artistProfile?.pronouns || 'they/them';
    const pronounNominative = pronouns === 'he/him' ? 'he' : pronouns === 'she/her' ? 'she' : 'they';
    const pronounPossessive = pronouns === 'he/him' ? 'his' : pronouns === 'she/her' ? 'her' : 'their';
    const pronounObjective = pronouns === 'he/him' ? 'him' : pronouns === 'she/her' ? 'her' : 'them';
    const isAre = pronouns === 'they/them' ? 'are' : 'is';
    const hasHave = pronouns === 'they/them' ? 'have' : 'has';

    // --- GRAMMY PREDICTION POST (WEEK 50) ---
    if (date.week === 50) {
        const chartDataUser = artistData.xUsers.find(u => u.id === 'chartdata');
        if (chartDataUser) {
            const categories: Array<{
                name: 'Record of the Year' | 'Song of the Year' | 'Album of the Year' | 'Best New Artist';
                getContenders: () => Array<{ name: string; artist: string; image?: string }>;
            }> = [
                {
                    name: 'Record of the Year',
                    getContenders: () => gameState.billboardHot100.slice(0, 5).map(s => ({ name: s.title, artist: s.artist, image: s.coverArt }))
                },
                {
                    name: 'Song of the Year',
                    getContenders: () => gameState.billboardHot100.slice(0, 5).map(s => ({ name: s.title, artist: s.artist, image: s.coverArt }))
                },
                {
                    name: 'Album of the Year',
                    getContenders: () => gameState.billboardTopAlbums.slice(0, 5).map(a => ({ name: a.title, artist: a.artist, image: a.coverArt }))
                },
                {
                    name: 'Best New Artist',
                    getContenders: () => {
                        const bnaNpcs = ['Sabrina Carpenter', 'Tate McRae', 'Chappell Roan', 'Ice Spice', 'Zach Bryan'];
                        const contenders = bnaNpcs.map(name => {
                            const song = gameState.billboardHot100.find(s => s.artist === name);
                            const album = gameState.billboardTopAlbums.find(a => a.artist === name);
                            return {
                                name: name,
                                artist: name,
                                image: song?.coverArt || album?.coverArt
                            };
                        }).filter((c): c is { name: string; artist: string; image: string } => !!c.image);
                        return contenders;
                    }
                }
            ];

            for (const categoryToPost of categories) {
                const contenders = categoryToPost.getContenders();

                if (contenders.length >= 2) {
                    const predictedWinner = contenders[0];
                    const shouldWinIndex = Math.floor(Math.random() * (contenders.length - 1)) + 1;
                    const shouldWin = contenders[shouldWinIndex];
                    
                    if(predictedWinner && shouldWin) {
                        const formatContender = (contender: { name: string; artist: string; image?: string }) => {
                            if (categoryToPost.name === 'Best New Artist') {
                                return contender.artist;
                            }
                            return `${contender.artist}'s "${contender.name}"`;
                        };

                        const content = `Rolling Stone predicts ${formatContender(predictedWinner)} will win '${categoryToPost.name}' at this year's #GRAMMYs.\n\nThe publication states ${formatContender(shouldWin)} "should" win.`;

                        newPosts.push({
                            id: crypto.randomUUID(),
                            authorId: chartDataUser.id,
                            content,
                            image: shouldWin.image,
                            likes: Math.floor(Math.random() * 25000) + 10000,
                            retweets: Math.floor(Math.random() * 6000) + 2000,
                            views: Math.floor(Math.random() * 600000) + 200000,
                            date
                        });
                    }
                }
            }
        }
    }


    // --- UNRELEASED SONG TOUR DEBUT TWEET ---
    const activeTour = tours.find(t => t.status === 'active' && t.currentVenueIndex === 1);
    if (activeTour) {
        const unreleasedSongsOnSetlist = activeTour.setlist
            .map(songId => songs.find(s => s.id === songId))
            .filter((song): song is Song => !!song && !song.isReleased);

        if (unreleasedSongsOnSetlist.length > 0 && tourPhotos.length > 0) {
            const featuredSong = pickRandom(unreleasedSongsOnSetlist);
            const tourPhoto = pickRandom(tourPhotos);
            const venue = activeTour.venues[0];

            const content = `${artistName} performs her unreleased song ‘${featuredSong.title}’ at her concert in ${venue.city}.`;

            newPosts.push({
                id: crypto.randomUUID(),
                authorId: 'popbase',
                content,
                image: tourPhoto,
                likes: Math.floor(Math.random() * 150000) + 80000, // 80k-230k likes
                retweets: Math.floor(Math.random() * 12000) + 5000,
                views: Math.floor(Math.random() * 2000000) + 500000,
                date
            });
        }
    }


    // --- TOURING DATA LOGIC ---
    const touringDataUser: XUser = {
        id: 'touringdata',
        name: 'Touring Data',
        username: 'touringdata',
        avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iIzAwMCIvPjxwYXRoIGQ9Ik00NCAxOEwyMCA0NE0yMCAxOEw0NCA0NCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNMzIgMTZMMzIgNDgiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+', // Stylized light/spotlight icon
        isVerified: true,
        bio: 'The most comprehensive source for concert touring data.',
        followersCount: 150000,
        followingCount: 50,
    };
    
    // Add Touring Data to new users if not already present (checked in main loop usually, but safe to add)
    newUsers.push(touringDataUser);

    const activeOrFinishedTours = tours.filter(t => t.status === 'active' || (t.status === 'finished' && t.currentVenueIndex === t.venues.length));

    activeOrFinishedTours.forEach(tour => {
        const lastVenueIndex = tour.currentVenueIndex - 1;
        
        // 1. Single Venue Report (If a show just happened this week)
        // We simulate "just happened" if there is a completed venue
        if (lastVenueIndex >= 0 && tour.status === 'active') {
            const venue = tour.venues[lastVenueIndex];
            // Only post if it was a good show (sold out or high capacity) to avoid spamming every small gig
            if (venue.soldOut || venue.capacity > 2000) {
                const isHighestGrossing = Math.random() > 0.5;
                const typeText = isHighestGrossing ? "highest-grossing" : "most-attended";
                const dateString = getGameDateString(date);
                
                let content = '';
                if (isHighestGrossing) {
                    content = `${artistName} earned their highest-grossing concert of all time on ${dateString}, with $${venue.revenue.toLocaleString()} at ${venue.name} in ${venue.city} as part of the "${tour.name}".`;
                } else {
                    content = `${artistName} earned their most-attended concert of all time on ${dateString}, with ${venue.ticketsSold.toLocaleString()} tickets sold at ${venue.name} in ${venue.city} as part of the "${tour.name}".`;
                }

                newPosts.push({
                    id: crypto.randomUUID(),
                    authorId: touringDataUser.id,
                    content: content,
                    likes: Math.floor(Math.random() * 5000) + 1000,
                    retweets: Math.floor(Math.random() * 1500) + 200,
                    views: Math.floor(Math.random() * 100000) + 20000,
                    date
                });
            }
        }

        // 2. Box Office Summary (Periodic or End of Tour)
        // Chance to post summary: High if tour finished this week, Low if active
        const isTourFinishedThisWeek = tour.status === 'finished' && tour.currentVenueIndex === tour.venues.length; // Simplified check
        const shouldPostSummary = isTourFinishedThisWeek || (tour.status === 'active' && Math.random() < 0.25 && tour.currentVenueIndex > 0);

        if (shouldPostSummary) {
            const reportedShows = tour.currentVenueIndex;
            const totalRevenue = tour.totalRevenue;
            const totalTickets = tour.ticketsSold;
            
            if (reportedShows > 0) {
                const avgRevenue = Math.floor(totalRevenue / reportedShows);
                const avgTickets = Math.floor(totalTickets / reportedShows);
                const avgPrice = Math.floor(totalRevenue / totalTickets);

                const summaryContent = `${tour.name.toUpperCase()}, ${artistName}\n$${totalRevenue.toLocaleString()} Revenue ($${avgRevenue.toLocaleString()} avg.)\n${totalTickets.toLocaleString()} Tickets Sold (${avgTickets.toLocaleString()} avg.)\n$${avgPrice.toFixed(2)} Average Price\n${reportedShows}/${tour.venues.length} Reported Shows\n#BoxOffice`;

                newPosts.push({
                    id: crypto.randomUUID(),
                    authorId: touringDataUser.id,
                    content: summaryContent,
                    likes: Math.floor(Math.random() * 8000) + 2000,
                    retweets: Math.floor(Math.random() * 2000) + 500,
                    views: Math.floor(Math.random() * 150000) + 40000,
                    date
                });
            }
        }
    });


    // --- LEAK POSTS ---
    if (leakedSong) {
        // PopBase Post
        newPosts.push({
            id: crypto.randomUUID(),
            authorId: 'popbase',
            content: `${artistName}'s unreleased song "${leakedSong.title}" has reportedly leaked online.`,
            image: leakedSong.coverArt,
            likes: Math.floor(Math.random() * 20000) + 10000,
            retweets: Math.floor(Math.random() * 5000) + 2000,
            views: Math.floor(Math.random() * 400000) + 100000,
            date
        });

        // TMZ post for leak
        const tmzAccount = artistData.xUsers.find(u => u.id === 'tmz');
        const playerUser = artistData.xUsers.find(u => u.isPlayer);
        if (tmzAccount && playerUser) {
            newPosts.push({
                id: crypto.randomUUID(),
                authorId: tmzAccount.id,
                content: `LEAKED: ${artistName}'s highly anticipated track "${leakedSong.title}" has surfaced online ahead of its official release.`,
                image: playerUser.avatar,
                likes: Math.floor(Math.random() * 4000) + 800, 
                retweets: Math.floor(Math.random() * 1500) + 200, 
                views: Math.floor(Math.random() * 300000) + 50000, 
                date
            });
        }


        // Supportive Fan Post
        const fanAccount = artistData.xUsers.find(u => u.id.startsWith('addiction_fan'));
        if (fanAccount) {
            newPosts.push({
                id: crypto.randomUUID(),
                authorId: fanAccount.id,
                content: `i'm seeing "${leakedSong.title}" leak links everywhere but i'm NOT listening!! we have to support ${artistName} and wait for the official release!! don't give the hackers what they want! #Support${artistName.replace(/\s/g, '')}`,
                image: undefined,
                likes: Math.floor(Math.random() * 15000) + 8000,
                retweets: Math.floor(Math.random() * 4000) + 1500,
                views: Math.floor(Math.random() * 250000) + 70000,
                date
            });
        }
        
        // Listening Fan Post
        const fanUser = artistData.xUsers.find(u => u.id === 'fan1'); // a generic fan from the initial setup
        if (fanUser) {
             newPosts.push({
                id: crypto.randomUUID(),
                authorId: fanUser.id,
                content: `omg i'm sorry i couldn't resist i listened to the ${leakedSong.title} leak and it's a MASTERPIECE... ${artistName} is about to save music again`,
                image: undefined,
                likes: Math.floor(Math.random() * 5000) + 1000,
                retweets: Math.floor(Math.random() * 800) + 200,
                views: Math.floor(Math.random() * 50000) + 10000,
                date
            });
        }

        // Hater Post
        const haterUsername = generateHaterUsername();
        const haterId = `hater_${haterUsername}`;
        newUsers.push({ id: haterId, name: haterUsername, username: haterUsername, avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iI2QzMjYyNiIvPjwvc3ZnPg==', isVerified: false, followersCount: 0, followingCount: 0, bio: '' });
        newPosts.push({
            id: crypto.randomUUID(),
            authorId: haterId,
            content: `not ${artistName}'s song "${leakedSong.title}" leaking already 💀 their team is in shambles. can't even protect a song that's gonna flop anyway.`,
            image: undefined,
            likes: Math.floor(Math.random() * 800) + 100,
            retweets: Math.floor(Math.random() * 100) + 10,
            views: Math.floor(Math.random() * 15000) + 3000,
            date
        });

        // --- FAN LEAK VIDEO LOGIC ---
        if (Math.random() < 0.9) { // 90% chance to upload a leak video
            const playerUser = artistData.xUsers.find(u => u.isPlayer);
            if (playerUser) {
                const { name: fanChannelName, username: fanChannelUsername } = generateLeakChannelUsername(artistName);
                const fanId = `fan_leak_video_${fanChannelUsername}`;

                // Check if this fan user already exists, if not, create it
                let fanUser = artistData.xUsers.find(u => u.id === fanId);
                if (!fanUser) {
                    const avatarSources = [playerUser.avatar, leakedSong.coverArt, ...artistData.artistImages];
                    const fanAvatar = pickRandom(avatarSources);
                    fanUser = {
                        id: fanId,
                        name: fanChannelName,
                        username: fanChannelUsername,
                        avatar: fanAvatar,
                        isVerified: false,
                        bio: `leaks & unreleased music from ${artistName}`,
                        followersCount: Math.floor(Math.random() * 50000) + 1000,
                        followingCount: 1
                    };
                    newUsers.push(fanUser); // Add to be created this week
                }
                
                // Thumbnail selection
                const thumbnailSources = [leakedSong.coverArt, playerUser.avatar, ...artistData.artistImages];
                const thumbnail = pickRandom(thumbnailSources);

                // Views based on quality. Higher quality = more viral potential.
                const views = Math.floor((leakedSong.quality / 100) * (Math.random() * 1000000 + 50000));

                const newVideo: Video = {
                    id: crypto.randomUUID(),
                    songId: leakedSong.id,
                    title: `${artistName} - ${leakedSong.title.replace(/\s*\(feat\..*\)/, '')} (leaked song)`,
                    type: 'Custom',
                    views: views,
                    thumbnail: thumbnail,
                    releaseDate: date,
                    artistId: leakedSong.artistId,
                    channelId: fanUser.id,
                    description: `unreleased track by ${artistName}. enjoy before it's taken down!\n\n#${artistName.replace(/\s/g, '')} #leak #unreleased`,
                };
                
                artistData.videos.push(newVideo);
            }
        }
    }


    const releasedSongs = playerSongs.filter(s => s.isReleased);
    const topSong = [...releasedSongs].sort((a,b) => b.lastWeekStreams - a.lastWeekStreams)[0];

    // PopBase Post for stream removal
    if (streamsRemovedThisWeek && streamsRemovedThisWeek > 0) {
        newPosts.push({
            id: crypto.randomUUID(),
            authorId: 'popbase',
            content: `Spotify has reportedly removed approximately ${formatNumber(streamsRemovedThisWeek)} artificial streams from ${artistName}'s catalog following a routine review.`,
            image: undefined,
            likes: Math.floor(Math.random() * 8000) + 3000,
            retweets: Math.floor(Math.random() * 2000) + 500,
            views: Math.floor(Math.random() * 150000) + 40000,
            date
        });
        delete artistData.streamsRemovedThisWeek;
    }

    // (artist name) Stats post
    const statsAccount = artistData.xUsers.find(u => u.username === `${artistName.replace(/\s/g, '').toLowerCase()}stats`);

    if (statsAccount && releasedSongs.length > 0 && Math.random() < 0.8) { // 80% chance each week to post
        const topSongsForPost = [...releasedSongs]
            .sort((a, b) => b.lastWeekStreams - a.lastWeekStreams)
            .slice(0, 10);

        let postContent = `${artistName}'s most streamed songs on Spotify this week:\n\n`;

        topSongsForPost.forEach((song) => {
            let changeDisplay = '';
            if (song.prevWeekStreams > 0) {
                const change = ((song.lastWeekStreams - song.prevWeekStreams) / song.prevWeekStreams) * 100;
                changeDisplay = ` (+${change.toFixed(2)}%)`;
            }
            
            postContent += `"${song.title}" — ${formatNumber(song.lastWeekStreams)}${changeDisplay}\n`;
        });
        
        let image: string | undefined = undefined;
        let video: string | undefined = undefined;
        
        if (topSongsForPost[0] && topSongsForPost[0].canvasVideo) {
            video = topSongsForPost[0].canvasVideo;
        } else if (artistImages.length > 0 && Math.random() > 0.3) {
            image = pickRandom(artistImages);
        }

        newPosts.push({
            id: crypto.randomUUID(),
            authorId: statsAccount.id,
            content: postContent.trim(),
            image: image,
            video: video,
            likes: Math.floor(Math.random() * 20000) + 5000,
            retweets: Math.floor(Math.random() * 5000) + 1000,
            views: Math.floor(Math.random() * 300000) + 80000,
            date
        });
    }

    // Check for Debut Release this week
    const debutRelease = releases.find(r => 
        r.releaseDate.week === date.week && 
        r.releaseDate.year === date.year && 
        releases.filter(rel => rel.artistId === r.artistId).length === 1 // It's a debut if it's the first release for this artist
    );

    if (debutRelease) {
        newPosts.push({
            id: crypto.randomUUID(), authorId: 'popbase',
            content: `${artistName} has officially released their debut ${debutRelease.type.toLowerCase()} "${debutRelease.title}".`,
            image: debutRelease.coverArt,
            likes: Math.floor(Math.random() * 30000) + 10000, 
            retweets: Math.floor(Math.random() * 8000) + 3000, 
            views: Math.floor(Math.random() * 500000) + 150000, 
            date
        });
    }

    // Weekly stream gain post for top song (if not debut week)
    if (topSong && !debutRelease && topSong.lastWeekStreams > 1_000_000) {
         if (Math.random() > 0.4) { // 60% chance of this post
            newPosts.push({
                id: crypto.randomUUID(), authorId: 'chartdata',
                content: `${artistName}'s "${topSong.title}" earned ${formatNumber(topSong.lastWeekStreams)} streams in the US this week.`,
                likes: Math.floor(Math.random() * 12000) + 4000, 
                retweets: Math.floor(Math.random() * 3000) + 800, 
                views: Math.floor(Math.random() * 180000) + 40000, 
                date
            });
         }
    }
    
    // TMZ Post Logic
    const tmzAccount = artistData.xUsers.find(u => u.id === 'tmz');
    if (tmzAccount && paparazziPhotos.length > 0 && Math.random() < 0.5) { // 50% chance
        const photo = pickRandom(paparazziPhotos);
        let content = '';
        switch(photo.category) {
            case 'Scandal':
                content = `EXCLUSIVE: ${artistName} seen in a heated argument in downtown LA. Is there trouble in paradise?`;
                break;
            case 'Fashion':
                content = `${artistName} turns heads with a stunning new look while out shopping today.`;
                break;
            case 'Candid':
                content = `${artistName} enjoys some downtime, spotted grabbing coffee this morning.`;
                break;
            case 'Spotted':
            default:
                content = `${artistName} was spotted out and about in New York City earlier today.`;
                break;
        }
        
        newPosts.push({
            id: crypto.randomUUID(), authorId: tmzAccount.id, content: content, image: photo.image,
            likes: Math.floor(Math.random() * 4000) + 800, 
            retweets: Math.floor(Math.random() * 1500) + 200, 
            views: Math.floor(Math.random() * 3000000) + 500000, 
            date
        });
    }

    // --- FAN WAR LOGIC ---
    if (artistData.fanWarStatus) {
        const { targetArtistName } = artistData.fanWarStatus;
        
        const rivalTopSong = gameState.npcs.find(s => s.artist === targetArtistName);
        const playerTopSong = playerSongs.sort((a, b) => (b.lastWeekStreams ?? 0) - (a.lastWeekStreams ?? 0))[0];

        const playerFanAccount = artistData.xUsers.find(u => u.id.startsWith('addiction_fan'));

        if (playerFanAccount && playerTopSong && rivalTopSong) {
            const dissTemplates = [
                `ur fav ${targetArtistName} could never pull the numbers ${artistName} is doing with "${playerTopSong.title}". just facts.`,
                `heard that new ${rivalTopSong.title} song... it's giving background music at a department store. meanwhile "${playerTopSong.title}" is a cultural reset.`,
                `Not floppy ${targetArtistName} struggling to stay in the top 20 while ${artistName} is just getting started. Tanked.`,
                `"${targetArtistName}" fans are so quiet right now... wonder why 🤔 couldn't be because their fave's new single debuted at #47 and is already gone`,
            ];
            newPosts.push({
                id: crypto.randomUUID(),
                authorId: playerFanAccount.id,
                content: pickRandom(dissTemplates),
                likes: Math.floor(Math.random() * 12000) + 4000, 
                retweets: Math.floor(Math.random() * 2500) + 800, 
                views: Math.floor(Math.random() * 150000) + 50000, 
                date
            });

            // Rival fan retaliation
            const rivalFanUsername = generateFanUsername(targetArtistName);
            const rivalFanId = `fanwar_rival_${rivalFanUsername}`;
            let rivalFanUser = artistData.xUsers.find(u => u.username === rivalFanUsername);
            if (!rivalFanUser) {
                 rivalFanUser = {
                    id: rivalFanId, 
                    name: `${targetArtistName} fan`, 
                    username: rivalFanUsername, 
                    avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iIzM2NjJlYiIvPjwvc3ZnPg==',
                    isVerified: false, bio: `stan account for ${targetArtistName}`,
                    followersCount: Math.floor(Math.random() * 20000) + 500,
                    followingCount: Math.floor(Math.random() * 500) + 50
                 };
                 newUsers.push(rivalFanUser);
            }
           
            const retaliationTemplates = [
                `at least ${targetArtistName} has a grammy... when will ${artistName}?`,
                `${artistName}'s fans are the most annoying fandom I swear. insecure because their fave is a local artist.`,
                `"cultural reset"?? ${artistName}'s song sounds like every other song on the radio. ${targetArtistName} is an innovator.`,
                `all i hear is crickets from ${artistName}'s song on the charts. it TANKED.`,
            ];
            newPosts.push({
                id: crypto.randomUUID(),
                authorId: rivalFanUser.id,
                content: pickRandom(retaliationTemplates),
                likes: Math.floor(Math.random() * 9000) + 2000, 
                retweets: Math.floor(Math.random() * 1500) + 400, 
                views: Math.floor(Math.random() * 100000) + 30000, 
                date
            });

            newTrends.push({
                id: crypto.randomUUID(),
                category: 'Music · Trending',
                title: `${artistName.replace(/\s/g, '')} vs ${targetArtistName.replace(/\s/g, '')}`,
                postCount: Math.floor(Math.random() * 40000) + 15000
            });

            // PopBase about the fan war
            if (Math.random() > 0.4) {
                newPosts.push({
                    id: crypto.randomUUID(),
                    authorId: 'popbase',
                    content: `${artistName} and ${targetArtistName} have been going back on forth on twitter`,
                    likes: Math.floor(Math.random() * 85000) + 20000,
                    retweets: Math.floor(Math.random() * 15000) + 5000,
                    views: Math.floor(Math.random() * 2000000) + 500000,
                    date
                });
            }
        }
    }

    // --- PUSH CAMPAIGN LOGIC ---
    const playerUser = artistData.xUsers.find(u => u.isPlayer);
    const recentPushPost = playerUser ? artistData.xPosts.find(p => p.authorId === playerUser.id && p.content.toLowerCase().startsWith('push ')) : undefined;
    
    if (recentPushPost) {
        const postAge = (date.year * 52 + date.week) - (recentPushPost.date.year * 52 + recentPushPost.date.week);
        if (postAge <= 1) { // Check if post is from this week or last week
            const chartFanAccount = artistData.xUsers.find(u => u.username.endsWith('charts'));
            if (chartFanAccount) {
                 const playerFandomName = (gameState.soloArtist?.fandomName || gameState.group?.fandomName || `${artistName} Fans`);
                 newPosts.push({
                     id: crypto.randomUUID(), authorId: chartFanAccount.id,
                     content: `${playerFandomName.toUpperCase()}!! ${artistName} said it! ${recentPushPost.content.toUpperCase()}!!! LET'S GO!`,
                     likes: Math.floor(Math.random() * 15000) + 5000,
                     retweets: Math.floor(Math.random() * 4000) + 1500,
                     views: Math.floor(Math.random() * 200000) + 70000,
                     date
                 });
            }
        }
    }


    // --- TAKEDOWN POP BASE TWEETS ---
    const takenDownSongs = songs.filter(s => s.isTakenDown && s.prevWeekStreams > 0);
    for (const song of takenDownSongs) {
        let isPettyLabel = false;
        let labelName = '';
        if (song.releaseId) {
            const release = releases.find(r => r.id === song.releaseId);
            if (release && release.releasingLabel) {
                const label = LABELS.find(l => l.name === release.releasingLabel?.name);
                if (label && label.contractType === 'petty') {
                    isPettyLabel = true;
                    labelName = label.name;
                }
            }
        }

        let content = '';
        if (isPettyLabel) {
            content = `${artistName}'s song "${song.title}" has been removed from all streaming platforms by their former label, ${labelName}.`;
        } else {
            content = `${artistName}'s song "${song.title}" has been taken down from all streaming platforms.`;
        }

        newPosts.push({
            id: crypto.randomUUID(),
            authorId: 'popbase',
            content,
            image: song.coverArt,
            likes: Math.floor(Math.random() * 30000) + 10000,
            retweets: Math.floor(Math.random() * 5000) + 2000,
            views: Math.floor(Math.random() * 500000) + 100000,
            date
        });
    }

    // --- RANDOM ARTIST POSTS (SHADING/DISSING) ---
    if (Math.random() < 0.15) { // 15% chance per week
        const uniqueNpcArtists = Array.from(new Set(gameState.npcs.map(n => n.artist)));
        if (uniqueNpcArtists.length > 0) {
            const randomArtist = pickRandom(uniqueNpcArtists);
            const isDiss = Math.random() < 0.4; // 40% chance it's a diss/shade towards the player
            
            const npcUsername = randomArtist.replace(/\s/g, '').toLowerCase();
            const npcUserId = `npc_${npcUsername}`;
            let npcUser = artistData.xUsers.find(u => u.id === npcUserId);
            
            if (!npcUser) {
                npcUser = {
                    id: npcUserId,
                    name: randomArtist,
                    username: npcUsername,
                    avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iIzMzMyIvPjwvc3ZnPg==',
                    isVerified: true,
                    bio: `Official X account for ${randomArtist}`,
                    followersCount: Math.floor(Math.random() * 5000000) + 1000000,
                    followingCount: Math.floor(Math.random() * 100) + 10
                };
                newUsers.push(npcUser);
            }

            let content = '';
            if (isDiss) {
                const dissTemplates = [
                    `Some of these new artists really think they're doing something... cute. 😂`,
                    `Numbers don't mean quality. Just saying. ☕️`,
                    `I remember when music used to take actual talent to make.`,
                    `Not everyone is meant to be a superstar. Some people should just stick to writing jingles.`,
                    `It's funny how people get one hit and suddenly think they run the industry. Humble yourself.`,
                    `My unreleased throwaways are better than your entire discography.`
                ];
                content = pickRandom(dissTemplates);
                
                if (Math.random() < 0.5) {
                    newPosts.push({
                        id: crypto.randomUUID(),
                        authorId: 'popbase',
                        content: `Fans are speculating that ${randomArtist}'s recent tweet is throwing shade at ${artistName}. 👀`,
                        likes: Math.floor(Math.random() * 50000) + 10000,
                        retweets: Math.floor(Math.random() * 10000) + 2000,
                        views: Math.floor(Math.random() * 1000000) + 200000,
                        date
                    });
                }
            } else {
                const randomTemplates = [
                    `Studio vibes tonight. 🎵✨`,
                    `Can't wait to show you guys what I've been working on!`,
                    `Just had the best coffee of my life.`,
                    `Tour life is crazy but I love seeing all your faces! ❤️`,
                    `What movie should I watch tonight?`,
                    `Thinking about dropping something special soon... 👀`
                ];
                content = pickRandom(randomTemplates);
            }

            newPosts.push({
                id: crypto.randomUUID(),
                authorId: npcUser.id,
                content,
                likes: Math.floor(Math.random() * 100000) + 20000,
                retweets: Math.floor(Math.random() * 20000) + 5000,
                views: Math.floor(Math.random() * 2000000) + 500000,
                date
            });
        }
    }

    // 1. Generate Posts
    const postCount = Math.floor(Math.random() * 4) + 2; // 2-5 new posts per week
    const publicImageVal = artistData.publicImage ?? 80;
    
    let haterChance = 0.4;
    let engagementModifier = 1.0;
    if (publicImageVal <= 20) { haterChance = 0.9; engagementModifier = 0.05; } // Cancelled (Bad 1)
    else if (publicImageVal <= 40) { haterChance = 0.7; engagementModifier = 0.15; } // Problematic (Bad 2)
    else if (publicImageVal <= 60) { haterChance = 0.4; engagementModifier = 0.8; } // Controversial
    else if (publicImageVal <= 80) { haterChance = 0.2; engagementModifier = 1.2; } // Respected
    else { haterChance = 0.05; engagementModifier = 1.5; } // Beloved

    for (let i = 0; i < postCount; i++) {
        const postType = Math.random();

        // chance for a fan post, chance for a hater
        if (postType > haterChance && topSong) { // Fan Post
            const fanUsername = generateFanUsername(artistName);
            const fanId = `fan_${fanUsername}`;
            
            const fanAvatar = artistImages.length > 0 
                ? pickRandom(artistImages) 
                : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iI2FlYWVhZSIvPjxwYXRoIGQ9Ik0zMiA0Ni4zMDRjLTUuNjcgMC0xMC44MDQtMi4zMjItMTQuNDA0LTYuMTYyLTMuNjA0LTMuODQtNS41OTYtOC45OTYtNS41OTYtMTQuMzk2aDYuODE2Yy4wMDQgNC4yNDQgMS41NjQgOC4yMzIgNC40MDQgMTEuMjc2IDIuODQgMy4wNDQgNi42ODQgNC42NzggMTAuOTMyIDQuNjc4djYuMTYyem0tMTUuNS0xMS41djBoLjAwNHptLjc1Ni0xNC40MDhjLjg0NC0zLjA0OCAzLjEyOC01LjQ4IDUuOTcyLTguMTY0IiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTMyIDQ2LjMwNGM1LjY3IDAgMTAuODA0LTIuMzIyIDE0LjQwNC02LjE2MiAzLjYwNC0zLjggNTEuNTk2LTguOTk2IDUuNTk2LTE0LjM5NmgtNi44MTZjLS4wMDQgNC4yNDQtMS41NjQgOC4yMzItNC40MDQgMTEuMjc2LTIuODQgMy4wNDQtNi42ODQgNC42NzgtMTAuOTMyIDQuNjc4djYuMTYyem0xNS41LTExLjV2MGgtLjAwNHptLS43NTYtMTQuNDA4YzAtNC4zMjQtMy4wNC03LjQ4OC03LjI0OC03LjQ4OHM3LjI0OC0uNDggNy4yNDggNy40ODgiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJfid2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==';
            
            newUsers.push({ 
                id: fanId, 
                name: fanUsername, 
                username: fanUsername, 
                avatar: fanAvatar, 
                isVerified: false,
                bio: `stan account for the one and only ${artistName}`,
                followersCount: Math.floor(Math.random() * 5000) + 100,
                followingCount: Math.floor(Math.random() * 500) + 50
            });
            
            const fanTemplates = [
                `STREAMING ${topSong.title.toUpperCase()} ALL DAY!! Let's get it to #1.`,
                `${artistName} is the best artist of our generation and I'm tired of pretending ${pronounNominative}'re not.`.replace("they're", "they're").replace("she're", "she's").replace("he're", "he's"),
                `I can't get "${topSong.title}" out of my head! 😭❤️`,
                `obsessed with ${artistName}'s new era. the visuals, the music... everything is perfect.`,
                `Listening to ${topSong.title} on repeat! What a masterpiece.`,
                `Anyone else think ${artistName} deserves a Grammy for this? Just me? okay.`,
                `the vocal arrangement on "${topSong.title}" ??? ${artistName} put crack in this song omg`,
                `pop emergency!! ${artistName} just saved the music industry with ${topSong.title}`,
                `no because ${artistName} really ate that up... the production is insane.`,
                `everyone saying ${artistName} fell off is quiet right now 🤫`
            ];
            let image: string | undefined = undefined;
            if (artistImages.length > 0 && Math.random() > 0.5) {
                image = pickRandom(artistImages);
            } else if (Math.random() > 0.4) {
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
                image = pickRandom(stanGifs);
            }
            let quoteTarget: XPost | undefined = undefined;
            if (artistData?.xPosts?.length > 0 && Math.random() > 0.7) {
                const recentPosts = artistData.xPosts.slice(0, 10);
                quoteTarget = pickRandom(recentPosts);
            }

            newPosts.push({
                id: crypto.randomUUID(), authorId: fanId, content: pickRandom(fanTemplates), image, quoteOf: quoteTarget,
                likes: Math.floor(Math.floor(Math.random() * 2000) * engagementModifier), 
                retweets: Math.floor(Math.floor(Math.random() * 500) * engagementModifier), 
                views: Math.floor(Math.random() * 15000), date
            });

        } else if (postType <= haterChance && topSong) { // Hater Post
            const haterUsername = generateHaterUsername();
            const haterId = `hater_${haterUsername}`;
            newUsers.push({ id: haterId, name: haterUsername, username: haterUsername, avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iI2QzMjYyNiIvPjwvc3ZnPg==', isVerified: false, followersCount: 0, followingCount: 0, bio: '' });
            
            const haterTemplates = [
                `${artistName} fell off so hard. the new music is not it.`,
                `Is anyone actually listening to "${topSong.title}"? 😬`,
                `Another generic song from ${artistName}. Shocker.`,
                `The hype around ${artistName} is manufactured. #industryplant`,
                `${pronounNominative} really think${pronouns === 'they/them' ? '' : 's'} ${pronounNominative === 'they' ? "they're" : pronounNominative + "'s"} an artist huh`,
                `paying for streams again I see... "${topSong.title}" is nowhere to be heard in public 💀`,
                `who is streaming this?? it's unlistenable noise.`,
                `${artistName} making the exact same song for the 5th time in a row 😭`,
                `the absolute state of the music industry if this is what y'all are charting`
            ];
            
            let image: string | undefined = undefined;
            if (Math.random() > 0.5) {
                const haterGifs = [
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
                image = pickRandom(haterGifs);
            }

            let quoteTarget: XPost | undefined = undefined;
            if (artistData?.xPosts?.length > 0 && Math.random() > 0.6) {
                const recentPosts = artistData.xPosts.slice(0, 10);
                quoteTarget = pickRandom(recentPosts);
            }

            newPosts.push({
                id: crypto.randomUUID(), authorId: haterId, content: pickRandom(haterTemplates), image, quoteOf: quoteTarget,
                likes: Math.floor(Math.random() * 500), retweets: Math.floor(Math.random() * 50), views: Math.floor(Math.random() * 8000), date
            });
        }
    }

    // Addiction Account Post
    const allMedia = [...artistImages, ...artistVideoThumbnails, ...(voguePhotoshoots?.flatMap(p => p.photoshootImages) || [])];
    const addictionAccount = artistData.xUsers.find(u => u.id.startsWith('addiction_fan'));

    if (addictionAccount && allMedia.length > 0 && Math.random() < 0.75) { // 75% chance each week
        const templates = [
            `thinking about this ${artistName}`,
            `obsessed.`,
            `${artistName}`,
            `this moment.`,
            `can't stop watching this`
        ];
        newPosts.push({
            id: crypto.randomUUID(),
            authorId: addictionAccount.id,
            content: pickRandom(templates),
            image: pickRandom(allMedia),
            likes: Math.floor(Math.random() * 150000) + 50000, // 50k - 200k
            retweets: Math.floor(Math.random() * 15000) + 5000, // 5k - 20k
            views: Math.floor(Math.random() * 1500000) + 500000, // 500k - 2M
            date
        });
    }

    // Fan account post about vogue photoshoot
    const fanAccount = artistData.xUsers.find(u => u.id.startsWith('fan'));
    if (fanAccount && voguePhotoshoots && voguePhotoshoots.length > 0 && Math.random() < 0.2) {
        const randomShoot = pickRandom(voguePhotoshoots);
        const randomPhoto = pickRandom(randomShoot.photoshootImages);
        const templates = [
            `still not over this shoot for ${randomShoot.magazine}!!`,
            `this look lives in my mind rent free`,
            `${artistName} in ${randomShoot.magazine} was a cultural reset`,
        ];

        newPosts.push({
            id: crypto.randomUUID(),
            authorId: fanAccount.id,
            content: pickRandom(templates).replace('[Artist Name]', artistName),
            image: randomPhoto,
            likes: Math.floor(Math.random() * 8000),
            retweets: Math.floor(Math.random() * 1500),
            views: Math.floor(Math.random() * 90000),
            date
        });
    }
    
    // 2. Chart Post if applicable
    const chartedSong = playerSongs.find(s => s.chartRank && s.chartRank <= 100);
    if (chartedSong && chartedSong.chartRank) {
        newPosts.push({
            id: crypto.randomUUID(), authorId: 'chartdata',
            content: `${artistName}'s "${chartedSong.title}" debuts at #${chartedSong.chartRank} on this week's Billboard Hot 100.`,
            likes: Math.floor(Math.random() * 15000) + 5000, retweets: Math.floor(Math.random() * 4000) + 1000, views: Math.floor(Math.random() * 200000) + 50000, date
        });
    }

    // 2.5 Spotify Global #1 Post from Chart Data
    const spotifyNumberOne = gameState.spotifyGlobal[0];
    if (spotifyNumberOne && spotifyNumberOne.isPlayerSong && spotifyNumberOne.songId) {
        const matchingPlayerSong = playerSongs.find(s => s.id === spotifyNumberOne.songId);
        if (matchingPlayerSong && matchingPlayerSong.lastWeekStreams > 0) {
            newPosts.push({
                id: crypto.randomUUID(), 
                authorId: 'chartdata',
                content: `${artistName}'s "${matchingPlayerSong.title}" is #1 on Global Spotify this week with ${formatNumber(matchingPlayerSong.lastWeekStreams)} streams.`,
                image: matchingPlayerSong.coverArt,
                likes: Math.floor(Math.random() * 45000) + 15000,
                retweets: Math.floor(Math.random() * 12000) + 3000,
                views: Math.floor(Math.random() * 700000) + 200000,
                date
            });
        }
    }

     // 3. PopBase post if song is doing well (and not a debut, to avoid duplicate posts)
    if (topSong && !debutRelease && topSong.lastWeekStreams > 5_000_000) {
        if (Math.random() > 0.5) { // 50% chance
            newPosts.push({
                id: crypto.randomUUID(), authorId: 'popbase',
                content: `${artistName}'s new single "${topSong.title}" is gaining major traction, racking up over ${formatNumber(topSong.lastWeekStreams)} streams this week alone.`,
                image: topSong.coverArt,
                likes: Math.floor(Math.random() * 25000) + 8000, retweets: Math.floor(Math.random() * 7000) + 2000, views: Math.floor(Math.random() * 400000) + 100000, date
            });
        }
    }

    // 4. Generate Trends
    const potentialTrends = [{ category: 'Trending in United States', title: artistName, postCount: Math.floor(Math.random() * 50000) + 10000 }];
    if (leakedSong) {
        potentialTrends.unshift({
            category: 'Music · Trending',
            title: `${leakedSong.title} Leak`,
            postCount: Math.floor(Math.random() * 100000) + 45000,
        });
    }
    if (topSong && topSong.lastWeekStreams > 1_000_000) {
        potentialTrends.push({ category: 'Music · Trending', title: `#${topSong.title.replace(/\W/g, '')}`, postCount: Math.floor(Math.random() * 80000) + 20000 });
        if (Math.random() > 0.5) potentialTrends.push({ category: 'Music · Trending', title: `WE LOVE ${artistName.toUpperCase()}`, postCount: Math.floor(Math.random() * 40000) + 15000 });
    }
    if (artistData.tours.some(t => t.isActive)) {
        potentialTrends.push({ category: 'Music · Trending', title: `${artistName} Tour`, postCount: Math.floor(Math.random() * 60000) + 20000 });
    }
    const latestRelease = artistData.releases.sort((a,b) => (b.releaseDate.year * 52 + b.releaseDate.week) - (a.releaseDate.year * 52 + a.releaseDate.week))[0];
    if(latestRelease && latestRelease.review && latestRelease.review.score < 5) {
        potentialTrends.push({ category: 'Music · Trending', title: `${artistName.replace(/\W/g, '')}IsOverParty`, postCount: Math.floor(Math.random() * 30000) + 10000 });
    }
    
    // Realistic placeholder trends
    const realOtherArtists = ['Taylor Swift', 'Beyoncé', 'Drake', 'The Weeknd', 'Ariana Grande', 'Billie Eilish', 'Dua Lipa', 'Kendrick Lamar', 'Bad Bunny', 'Olivia Rodrigo', 'Rihanna', 'Justin Bieber', 'Post Malone', 'Lady Gaga', 'Doja Cat'];
    const otherArtist1 = pickRandom(realOtherArtists);
    let otherArtist2 = pickRandom(realOtherArtists);
    while (otherArtist2 === otherArtist1) otherArtist2 = pickRandom(realOtherArtists);

    const realisticPlaceholders = [
        { category: 'Music · Trending', title: otherArtist1, postCount: Math.floor(Math.random() * 300000) + 50000 },
        { category: 'Music · Trending', title: `#${otherArtist2.replace(/\s/g, '')}`, postCount: Math.floor(Math.random() * 150000) + 50000 },
        { category: 'Entertainment · Trending', title: 'Pop Crave', postCount: Math.floor(Math.random() * 80000) + 15000 },
        { category: 'Entertainment · Trending', title: 'Pop Base', postCount: Math.floor(Math.random() * 60000) + 10000 },
        { category: 'Music · Trending', title: 'Spotify', postCount: Math.floor(Math.random() * 200000) + 50000 },
        { category: 'Music · Trending', title: 'Billboard', postCount: Math.floor(Math.random() * 50000) + 10000 }
    ];

    if (date.week >= 48) {
        realisticPlaceholders.push({ category: 'Music · Trending', title: '#SpotifyWrapped', postCount: Math.floor(Math.random() * 1500000) + 500000 });
    }
    if (date.week === 6) { // near Grammys
        realisticPlaceholders.push({ category: 'Music · Trending', title: '#GRAMMYs', postCount: Math.floor(Math.random() * 1000000) + 200000 });
    }
    if (date.week === 15) { // near Coachella
        realisticPlaceholders.push({ category: 'Music · Trending', title: 'Coachella', postCount: Math.floor(Math.random() * 800000) + 100000 });
    }
    if (date.week === 35) { // near VMAs
        realisticPlaceholders.push({ category: 'Music · Trending', title: '#VMAs', postCount: Math.floor(Math.random() * 600000) + 100000 });
    }
    if (date.week === 18) { // near Met Gala
        realisticPlaceholders.push({ category: 'Entertainment · Trending', title: 'Met Gala', postCount: Math.floor(Math.random() * 900000) + 200000 });
    }

    const generalPlaceholders = [
        { category: 'Entertainment · Trending', title: 'Netflix', postCount: Math.floor(Math.random() * 300000) + 50000 },
        { category: 'Trending in United States', title: 'BREAKING', postCount: Math.floor(Math.random() * 500000) + 100000 },
        { category: 'Gaming · Trending', title: 'GTA VI', postCount: Math.floor(Math.random() * 500000) + 100000 }
    ];

    const placeholders = [...realisticPlaceholders, ...generalPlaceholders];
    
    // Shuffle and pick
    const shuffledTrends = [...potentialTrends, ...placeholders].sort(() => 0.5 - Math.random());
    for(let i = 0; i < 5 && i < shuffledTrends.length; i++) {
        // Avoid duplicate trends
        if (!newTrends.some(t => t.title === shuffledTrends[i].title)) {
            newTrends.push({ id: crypto.randomUUID(), ...shuffledTrends[i] });
        }
    }

    // 5. Generate Posts from Chart Fan Account
    const playerUsername = artistData.xUsers.find(u => u.isPlayer)?.username || artistName.replace(/\s/g, '').toLowerCase();
    const chartFanAccount = artistData.xUsers.find(u => u.username.endsWith('charts'));

    if (chartFanAccount) {
        // Monthly Listeners Post
        const shouldPostListeners = (date.week % 4 === 1 && Math.random() < 0.75) || Math.random() < 0.25;
        if (artistData.monthlyListeners > 1000 && shouldPostListeners) {
            const change = Math.floor(artistData.monthlyListeners * (Math.random() * 0.03 + 0.005));
            const postContent = `Spotify Update — Monthly Listeners:\n\n• @${playerUsername} — ${formatNumber(artistData.monthlyListeners)} (+${formatNumber(change)})`;
            const image = artistImages.length > 0 ? pickRandom(artistImages) : (artistVideoThumbnails.length > 0 ? pickRandom(artistVideoThumbnails) : undefined);
            
            newPosts.push({
                id: crypto.randomUUID(), authorId: chartFanAccount.id, content: postContent, image,
                likes: Math.floor(Math.random() * 5000) + 1000, retweets: Math.floor(Math.random() * 1000) + 200, views: Math.floor(Math.random() * 80000) + 20000, date
            });
        }

        // Milestone Post
        if (Math.random() < 0.4) {
            const milestones = [1e8, 2e8, 3e8, 4e8, 5e8, 6e8, 7e8, 8e8, 9e8, 1e9, 1.5e9, 2e9];
            const songsNearMilestone: Song[] = [];
            for (const song of releasedSongs) {
                const nextMilestone = milestones.find(m => m > song.streams);
                if (nextMilestone && (song.streams / nextMilestone) > 0.95 && (song.streams / nextMilestone) < 1.0) {
                    songsNearMilestone.push(song);
                }
            }

            if (songsNearMilestone.length > 0) {
                let postContent = `${artistName}'s next songs to reach a milestone on Spotify:\n\n`;
                songsNearMilestone
                    .sort((a, b) => b.streams - a.streams)
                    .slice(0, 4)
                    .forEach(song => {
                        postContent += `${song.title}: ${formatNumber(song.streams)} streams\n`;
                    });
                postContent += `\n🚀 Keep streaming to these songs on Spotify.`;
                const image = artistImages.length > 0 ? pickRandom(artistImages) : undefined;

                newPosts.push({
                    id: crypto.randomUUID(), authorId: chartFanAccount.id, content: postContent.trim(), image,
                    likes: Math.floor(Math.random() * 3000) + 500, retweets: Math.floor(Math.random() * 800) + 100, views: Math.floor(Math.random() * 60000) + 10000, date
                });
            }
        }

        // Upcoming Release Post
        const scheduledSubmissions = artistData.labelSubmissions.filter(s => s.status === 'scheduled');
        if (scheduledSubmissions.length > 0) {
            const upcomingReleases: { name: string, cover: string, weeks: number, type: string }[] = [];
            const toTotalWeeks = (d: GameState['date']) => d.year * 52 + d.week;
            const nowTotalWeeks = toTotalWeeks(date);
            
            scheduledSubmissions.forEach(sub => {
                if (sub.projectReleaseDate) {
                    const weeksUntil = toTotalWeeks(sub.projectReleaseDate) - nowTotalWeeks;
                    if (weeksUntil > 0 && weeksUntil <= 4) {
                        upcomingReleases.push({ name: sub.release.title, cover: sub.release.coverArt, weeks: weeksUntil, type: sub.release.type });
                    }
                }
                sub.singlesToRelease?.forEach(single => {
                    const weeksUntil = toTotalWeeks(single.releaseDate) - nowTotalWeeks;
                    const song = playerSongs.find(s => s.id === single.songId);
                    if (weeksUntil > 0 && weeksUntil <= 4 && song) {
                        upcomingReleases.push({ name: song.title, cover: song.coverArt, weeks: weeksUntil, type: 'Single' });
                    }
                });
            });

            if (upcomingReleases.length > 0) {
                const soonest = upcomingReleases.sort((a, b) => a.weeks - b.weeks)[0];
                const daysUntil = soonest.weeks * 7 - Math.floor(Math.random() * 4);
                const postContent = `.@${playerUsername}’s “${soonest.name}” will be released in ${daysUntil} days.`;
                
                newPosts.push({
                    id: crypto.randomUUID(), authorId: chartFanAccount.id, content: postContent, image: soonest.cover,
                    likes: Math.floor(Math.random() * 40000) + 15000, retweets: Math.floor(Math.random() * 10000) + 4000, views: Math.floor(Math.random() * 800000) + 300000, date
                });
            }
        }
    }

    // --- X CHAT LOGIC ---
    const popularityFactor = Math.min(100, popularity) / 100; // 0 to 1
    
    // Group Chats Logic
    const existingGroupChats = xChats.filter(c => c.isGroup);
    
    // Chance to create a new group chat scales with popularity (max ~15% per week)
    if (existingGroupChats.length < 15 && Math.random() < (0.05 + popularityFactor * 0.1)) {
        const gcNames = [`${artistName} Updates`, `${artistName.toUpperCase()} HQ`, `${artistName} daily`, `${artistName} stan group`];
        const newGcName = pickRandom(gcNames);
        const gcAvatar = artistImages.length > 0 ? pickRandom(artistImages) : undefined;
        
        // Randomly pick 2-5 fans
        const allFans = artistData.xUsers.filter(u => u.id.startsWith('fan'));
        const participants = ['player'];
        for (let i = 0; i < Math.floor(Math.random() * 4) + 2; i++) {
            if (allFans[i]) participants.push(allFans[i].id);
        }
        
        newChats.push({
            id: crypto.randomUUID(),
            name: newGcName,
            avatar: gcAvatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iI2QzMjYyNiIvPjwvc3ZnPg==',
            isGroup: true,
            participants,
            messages: [{
                id: crypto.randomUUID(), senderId: participants[1] || 'fan1',
                text: `Just made this GC! Omg let's hope ${artistName} sees this!`, date
            }],
            isRead: false
        });
    }

    // Add messages to existing group chats (scales with popularity)
    existingGroupChats.forEach(gc => {
        if (Math.random() < (0.2 + popularityFactor * 0.6)) {
            const senderId = pickRandom(gc.participants.filter(p => p !== 'player')) || 'fan1';
            const gcMessages = [
                `did you guys see ${artistName}'s latest post??`,
                `we need tour dates like RIGHT NOW`,
                `obsessed with the new aesthetic`,
                `what do we think the next single is gonna be?`,
                `crying throwing up over ${artistName}`,
                `${artistName} is literally mother/father`,
                `stream the new era 🗣️🗣️`,
                `i can't stop listening to ${artistName} omg`,
                `${artistName} if you see this we love you!!`,
                `so glad to be part of the fandom rn`,
                `everyone is talking about ${artistName} today!`,
            ];
            // Offline mode / random message loop handles "more messages"
            const numMessages = Math.floor(Math.random() * 3) + 1; // 1 to 3 messages
            for (let m = 0; m < numMessages; m++) {
                newMessages.push({
                    chatId: gc.id,
                    message: {
                        id: crypto.randomUUID(),
                        senderId,
                        text: pickRandom(gcMessages),
                        date
                    }
                });
            }
        }
    });

    // Individual DMs Logic
    // Chance to get a random fan DM scales with popularity (max ~40% per week)
    if (Math.random() < (0.1 + popularityFactor * 0.3)) {
        const allFans = artistData.xUsers.filter(u => u.id.startsWith('fan'));
        const dmFan = pickRandom(allFans);
        if (dmFan) {
            // Check if DM chat already exists
            let dmChat = xChats.find(c => !c.isGroup && c.participants.includes(dmFan.id));
            if (!dmChat) {
                // check newChats
                dmChat = newChats.find(c => !c.isGroup && c.participants.includes(dmFan.id));
            }
            
            const messages = [
                `omg i love you so much!! ${artistName} please reply 😭`,
                `you literally saved my life with your music`,
                `are we getting a tour soon? love from brazil 🇧🇷`,
                `please unblock me from your spam account`,
                `bestie drop the skincare routine immediately`,
                `your last song was incredible. keeping it on repeat!`,
                `hi ${pronouns === 'he/him' ? 'king' : pronouns === 'she/her' ? 'queen' : 'icon'} just wanted to say i'm your biggest fan!!`,
                `is there a deluxe album coming??`,
                `so proud of you ${artistName}!!`,
                `hope you receive this... thank you for everything!`
            ];
            
            const numMessages = Math.floor(Math.random() * 2) + 1; // 1 to 2 messages
            for (let m = 0; m < numMessages; m++) {
                const msgObj: XMessage = { id: crypto.randomUUID(), senderId: dmFan.id, text: pickRandom(messages), date };
                
                if (dmChat) {
                    newMessages.push({ chatId: dmChat.id, message: msgObj });
                } else {
                    dmChat = {
                        id: crypto.randomUUID(),
                        name: dmFan.name,
                        avatar: dmFan.avatar,
                        isGroup: false,
                        participants: ['player', dmFan.id],
                        messages: [msgObj],
                        isRead: false
                    };
                    newChats.push(dmChat);
                }
            }
        }
    }

    return { newPosts, newUsers, newTrends, newChats, newMessages };
};
