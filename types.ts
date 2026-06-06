

export interface Artist {
    id: string;
    name: string;
    age: number;
    country: 'UK' | 'US';
    image: string;
    pronouns: 'he/him' | 'she/her' | 'they/them';
    fandomName: string;
}

export interface Group {
    id: string;
    name: string;
    image: string;
    members: Artist[];
    fandomName: string;
}

export interface Song {
    id: string;
    title: string;
    genre: string;
    quality: number;
    coverArt: string;
    isReleased: boolean;
    releaseId?: string;
    streams: number;
    lastWeekStreams: number;
    prevWeekStreams: number;
    pitchforkBoost?: boolean;
    duration: number; // in seconds
    explicit: boolean;
    artistId: string;
    isPreReleaseSingle?: boolean;
    firstWeekStreams?: number;
    removedStreams?: number;
    playlistBoostWeeks?: number;
    tourBoostWeeks?: number;
    peakWeeklyStreams?: number;
    remixOfSongId?: string;
    leakInfo?: {
        illegalStreams: number;
        illegalDownloads: number;
    };
    dailyStreams?: number[];
    soundtrackTitle?: 'F1 The Album' | 'Wicked' | 'Breaking Bad' | 'Dune: Part Two' | 'Deadpool & Wolverine' | 'Barbie' | 'Spider-Man: Beyond the Spider-Verse' | 'James Bond' | 'The Hunger Games' | 'Pitch Perfect' | 'The Great Gatsby' | 'Mamma Mia' | 'Twilight' | string;
    collaboration?: {
        artistName: string;
        cost: number;
        qualityBoost: number;
    };
    lastCertification?: string;
    certifications?: { level: string; date: GameDate }[];
    isTakenDown?: boolean;
    isFeatureToNpc?: boolean;
    npcArtistName?: string;
    releaseDate?: GameDate;
    reRecordingOf?: string; // ID of the original song
    revenue?: number;
    netRevenue?: number;
    rightsSoldOriginalValue?: number;
    rightsSoldPercent?: number;
    rightsOwnerLabelId?: string;
    itunesPrice?: string;
    canvasVideo?: string;
    canvasHashtags?: string[];
    producers?: string[];
    songwriters?: string[];
    engineers?: string[];
    anr?: string[];
    contributorCutsTotal?: number;
    controversialContributors?: string[];
    aboutText?: string;
    pendingFeatureApproval?: boolean;
    samples?: {
        songTitle: string;
        artistName: string;
        type: 'Sample' | 'Interpolation';
        coverArt: string;
    }[];
}

export type ReleaseType = 'Single' | 'EP' | 'Album' | 'Album (Deluxe)' | 'Compilation';

export interface Review {
    publication: 'Pitchfork';
    score: number;
    text: string;
    reviewer: string;
}

export interface Release {
    id:string;
    title: string;
    type: ReleaseType;
    coverArt: string;
    songIds: string[];
    releaseDate: GameDate;
    review?: Review;
    artistId: string;
    countdownVideoUrl?: string; // For upcoming albums
    standardEditionId?: string;
    isAppleMusicExpandedCover?: boolean;
    isAppleMusicEssential?: boolean;
    appleMusicEssentialReview?: string;
    releasingLabel?: {
        name: string;
        dealWithMajor?: string;
    } | null;
    firstWeekStreams?: number;
    wikipediaSummary?: string;
    soundtrackInfo?: { albumTitle: string };
    isFeatureToNpc?: boolean;
    npcArtistName?: string;
    lastCertification?: string;
    certifications?: { level: string; date: GameDate }[];
    isTakenDown?: boolean;
    rightsSoldOriginalValue?: number;
    rightsSoldPercent?: number;
    rightsOwnerLabelId?: string;
    isAnnounced?: boolean;
    preorderSales?: number;
    peakWeeklyStreams?: number;
}

export interface Video {
    id: string;
    songId: string;
    title: string;
    type: 'Music Video' | 'Lyric Video' | 'Visualizer' | 'Genius Verified' | 'Live Performance' | 'Interview' | 'Custom';
    views: number;
    thumbnail: string;
    releaseDate: GameDate;
    artistId: string;
    channelId: string; // The active youtube channel
    firstWeekViews?: number;
    description?: string;
    mentionedNpcs?: string[];
    isFeatureVideo?: boolean;
    pendingFeatureApproval?: boolean;
}

export interface MerchProduct {
    id: string;
    releaseId: string; // From an EP or Album
    name: string;
    type: 'Vinyl' | 'CD';
    price: number;
    isPreorder?: boolean;
    image: string;
    artistId: string;
}

export interface GeniusOffer {
    type: 'geniusInterview';
    songId: string;
    isAccepted: boolean;
    emailId: string;
}

export interface OnTheRadarOffer {
    type: 'onTheRadarOffer';
    songId: string;
    isAccepted: boolean;
    emailId: string;
}

export interface TrshdOffer {
    type: 'trshdOffer';
    songId: string;
    isAccepted: boolean;
    emailId: string;
}

export interface FallonOffer {
    type: 'fallonOffer';
    releaseId: string;
    offerType: 'performance' | 'interview' | 'both';
    isAccepted: boolean;
    emailId: string;
}

export interface PopBaseOffer {
    type: 'popBaseInterview' | 'popBaseClarification';
    emailId: string;
    isAnswered: boolean;
    question?: string;
    originalPostContent?: string;
    isControversial?: boolean;
}

export interface AmaSubmissionOffer {
    type: 'amaSubmission';
    emailId: string;
    isSubmitted: boolean;
}

export interface AmaNominationOffer {
    type: 'amaNominations';
    emailId: string;
    hasPerformanceOffer: boolean;
    isPerformanceAccepted?: boolean;
}

export interface AmaRedCarpetOffer {
    type: 'amaRedCarpet';
    emailId: string;
    isAttending?: boolean;
}

export interface EventInvitationOffer {
    type: 'eventInvitation';
    eventName: string;
    eventType: 'metGala' | 'nyfw' | 'afterParty' | 'soundtrackPremiere';
    emailId: string;
    isAccepted?: boolean;
    hostName?: string;
    associatedSoundtrack?: string;
}

export interface GrammySubmissionOffer {
    type: 'grammySubmission';
    emailId: string;
    isSubmitted: boolean;
}

export interface GrammyNominationOffer {
    type: 'grammyNominations';
    emailId: string;
    hasPerformanceOffer: boolean;
    isPerformanceAccepted?: boolean;
}

export interface GrammyRedCarpetOffer {
    type: 'grammyRedCarpet';
    emailId: string;
    isAttending?: boolean;
}

export interface OscarsSubmissionOffer {
    type: 'oscarSubmission';
    emailId: string;
    isSubmitted: boolean;
}

export interface OscarRedCarpetOffer {
    type: 'oscarRedCarpet';
    emailId: string;
    isAttending?: boolean;
}

export interface OscarsNominationOffer {
    type: 'oscarNominations';
    emailId: string;
    hasPerformanceOffer: boolean;
    isPerformanceAccepted?: boolean;
}


export interface LeakNotification {
    type: 'leak';
    songId: string;
}

export interface XSuspensionEmail {
    type: 'xSuspension';
    isSuspended: boolean; // true for suspension, false for reinstatement
}

export interface XAppealResultEmail {
    type: 'xAppealResult';
    isSuccessful: boolean;
}

export interface OnlyFansOffer {
    type: 'onlyfansRequest';
    requestType: 'image' | 'video';
    payout: number;
    isFulfilled: boolean;
    emailId: string;
    senderUsername: string;
}

export interface FeatureVideoOffer {
    type: 'featureVideoOffer';
    songId: string;
    npcArtistName: string;
    isAccepted?: boolean;
}

export interface SoundtrackOffer {
    type: 'soundtrackOffer';
    albumTitle: 'F1 The Album' | 'Wicked' | 'Breaking Bad' | 'Dune: Part Two' | 'Deadpool & Wolverine' | 'Barbie' | 'Spider-Man: Beyond the Spider-Verse' | 'James Bond' | 'The Hunger Games' | 'Pitch Perfect' | 'The Great Gatsby' | 'Mamma Mia' | 'Twilight';
    isAccepted: boolean;
    emailId: string;
}

export interface TouringDataUpdate {
    type: 'touringDataUpdate';
    tourId: string;
    venueIndex: number;
}

export interface VogueOffer {
    type: 'vogueOffer';
    magazine: 'Vogue' | 'Vogue Korea' | 'Vogue Italy';
    isAccepted: boolean;
    emailId: string;
}

export interface SpotifyPlaylistTrack {
    songId: string;
    artistName: string;
    artistId: string;
    title: string;
    coverArt: string;
    position: number;
    addedDate: GameDate;
    explicit?: boolean;
}

export interface SpotifyPlaylist {
    id: string;
    name: string;
    description: string;
    followers: number;
    coverArt: string;
    type: 'global' | 'genre' | 'viral' | 'new' | 'this_is';
    genre?: string;
    tracks: SpotifyPlaylistTrack[];
}

export interface FeatureOffer {
    type: 'featureOffer';
    npcArtistName: string;
    payout: number;
    songQuality: number;
    promotion?: {
        name: string;
        durationWeeks: number;
    };
    isAccepted: boolean;
    emailId: string;
}

export interface FeatureReleaseNotification {
    type: 'featureRelease';
    songTitle: string;
    npcArtistName: string;
}

export interface CoachellaOffer {
    type: 'coachellaOffer';
    emailId: string;
    isSubmitted: boolean;
}

export interface OnlineFeatureOffer {
    type: 'onlineFeatureOffer';
    senderId: string;
    senderName: string;
    requestType: 'song' | 'music_video';
    itemId: string; // The song id or video id on the sender's side
    requestId: string;
    title: string;
    payout: number;
    emailId: string;
    isAccepted?: boolean;
}

export interface CheatingScandalEmail {
    type: 'cheatingScandal';
    relationshipId: string;
    isAnswered?: boolean;
}

export interface GiveBirthEmail {
    type: 'giveBirth';
    isAnswered?: boolean;
}

export interface NpcContractRenewalOffer {
    type: 'npcContractRenewal';
    npcName: string;
    isAccepted: boolean;
    emailId: string;
}

export interface Email {
    id: string;
    sender: string;
    senderIcon?: 'spotify' | 'youtube' | 'default' | 'label' | 'genius' | 'fallon' | 'popbase' | 'grammys' | 'x' | 'onlyfans' | 'soundtrack' | 'touringdata' | 'business' | 'vogue' | 'feature' | 'ontheradar' | 'trshd' | 'oscars' | 'coachella' | 'amas' | 'event';
    subject: string;
    body?: string;
    content?: string;
    date: GameDate;
    isRead: boolean;
    offer?: GeniusOffer | FallonOffer | PopBaseOffer | GrammySubmissionOffer | GrammyNominationOffer | GrammyRedCarpetOffer | LeakNotification | XSuspensionEmail | XAppealResultEmail | OnlyFansOffer | SoundtrackOffer | TouringDataUpdate | VogueOffer | FeatureOffer | FeatureReleaseNotification | FeatureVideoOffer | OnTheRadarOffer | TrshdOffer | OscarsSubmissionOffer | OscarsNominationOffer | OscarRedCarpetOffer | CoachellaOffer | AmaSubmissionOffer | AmaNominationOffer | AmaRedCarpetOffer | CheatingScandalEmail | GiveBirthEmail | EventInvitationOffer | NpcContractRenewalOffer | OnlineFeatureOffer;
}

export interface GameDate {
    week: number;
    year: number;
}

export interface Promotion {
    id: string;
    itemId: string; // songId, releaseId, or videoId
    itemType: 'song' | 'release' | 'video';
    promoType: string; // e.g., 'Playlist Push', 'Nostalgia Campaign'
    promoQuality: 'high' | 'medium' | 'low';
    weeklyCost: number;
    boostMultiplier: number;
    artistId: string;
}

export interface NpcSong {
    uniqueId: string;
    title: string;
    artist: string;
    genre: string;
    basePopularity: number; // A value to derive weekly streams from
    featuring?: string; // Player artist name
    isPlayerFeature?: boolean;
    coverArt?: string;
    isReleased?: boolean;
    releaseDate?: GameDate;
    promotion?: { name: string; boost: number };
    promoWeeksLeft?: number;
}

export interface NpcAlbum {
    uniqueId: string;
    title: string;
    artist: string;
    label: 'UMG' | 'Republic' | 'RCA' | 'Island';
    coverArt: string;
    songIds: string[]; // uniqueId of NpcSong
    salesPotential: number;
}

export interface ChartEntry {
    rank: number;
    lastWeek: number | null;
    peak: number;
    weeksOnChart: number;
    title: string;
    artist: string;
    coverArt: string;
    isPlayerSong: boolean;
    songId?: string;
    uniqueId: string;
    weeklyStreams: number;
    itunesPrice?: string;
}

export interface AlbumChartEntry {
    rank: number;
    lastWeek: number | null;
    peak: number;
    weeksOnChart: number;
    title: string;
    artist: string;
    label: string;
    coverArt: string;
    isPlayerAlbum: boolean;
    albumId?: string;
    uniqueId: string;
    weeklyActivity: number;
    weeklySales: number;
}


export interface ChartHistory {
    [uniqueId: string]: {
        peak: number;
        weeksOnChart: number;
        lastRank: number | null;
        weeksAtNo1?: number;
    }
}

export interface Label {
    id: 'umg' | 'republic' | 'rca' | 'island' | 'interscope' | 'columbia' | 'atlantic' | 'epic' | 'quality_control' | 'tde' | 'roc_nation';
    name: string;
// FIX: Corrected typo 'Mid-High' to 'Mid-high' to match usage.
    tier: 'Top' | 'Mid-high' | 'Mid-Low' | 'Low';
    logo: string;
    promotionMultiplier: number;
    creativeControl: number; // 0-100, lower is less freedom for player
    minQuality: number;
    streamRequirement: number;
    youtubeChannel?: {
        name: string;
        handle: string;
        subscribers: number;
        banner: string;
    };
    contractType?: 'standard' | 'petty';
}

export interface SignedNpc {
    id: string;
    name: string;
    contract: {
        advance: number;
        royaltyRate: number;
        durationWeeks: number;
        startDate: { week: number; year: number; };
    };
    revenueGenerated: number;
    expenses: number;
    status: 'active' | 'negotiating' | 'expired';
}

export interface CustomLabel {
    id: string;
    name: string;
    logo: string;
    artistOwnerId: string;
    dealWithMajorId?: Label['id'];
    tier: 'Indie' | 'Mid' | 'High';
    promotionMultiplier: number;
    signedNpcs?: SignedNpc[];
}

export interface Contract {
    labelId: string;
    isCustom?: boolean;
    artistId: string;
    startDate: GameDate;
    albumsReleased: number;
    
    // Core terms
    durationWeeks: number;
    albumQuota: number;
    advance: number;
    royaltyPercent: number;
    
    // Ownership & Rights
    mastersOwnership: 'Label' | 'Artist' | 'Split';
    mastersSplitPercent: number; // Artist's share if Split
    publishingRights: 'Label' | 'Artist' | 'Split';
    publishingSplitPercent: number; // Artist's share if Split
    reversionClause: boolean; // Ownership reverts to artist after contract
    
    // Financials
    tourSupport: number;
    marketingBudget: number;
    merchPercent: number; // Artist's share
    streamingSplitArtist: number;
    sponsorshipSplitArtist: number;
    recoupmentTerms: string; // '100%', '50%', 'None'
    successBonus: number;
    chartIncentives: string; // e.g. '$10K per #1'
    revenueAuditRights: boolean;
    producerSplitsLabelPaid: boolean;
    
    // Operations & Control
    creativeControl: 'High' | 'Medium' | 'Low';
    releaseDeadlines: boolean;
    exclusivity: boolean;
    collabPermissions: 'Any' | 'Label Approval' | 'Strict';
    socialMediaObligations: 'None' | 'Moderate' | 'Heavy';
    brandingApproval: 'Artist' | 'Label';
    performanceRequirements: string;
    independentRestrictions: boolean;
    distributionRegions: string; // 'Worldwide', 'US Only', 'North America'
    licensingRights: 'Label' | 'Artist' | 'Split';
    
    // Legal
    renewalOptions: boolean;
    earlyTermination: boolean;
    penaltyAmount: number;
    nda: boolean;
    disputeTerms: string;
}

export interface LabelSubmission {
    id: string;
    release: Release;
    submittedDate: GameDate;
    status: 'pending' | 'awaiting_player_input' | 'rejected' | 'scheduled';
    decisionDate?: GameDate;
    projectReleaseDate?: GameDate;
    isProjectAnnounced?: boolean;
    feedback?: string;
    singlesToRelease?: { songId: string; releaseDate: GameDate; isAnnounced?: boolean }[];
    promoBudget?: number;
    promoBudgetSpent?: number;
    hasCountdownPage?: boolean;
    geniusInterviewRequestedForSongId?: string;
    fallonPerformanceRequestedForSongId?: string;
    recommendedSingles?: { songId: string; reason: string }[];
    preorderSales?: number;
}


export interface XUser {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isVerified: boolean | 'blue' | 'gold';
    verifiedSince?: number; // year
    country?: string;
    isPlayer?: boolean;
    bio?: string;
    followersCount: number;
    followingCount: number;
}

export interface XPollOption {
    id: string;
    text: string;
    votes: number;
}

export interface TikTokVideo {
    id: string;
    authorId: string;
    content: string;
    songId?: string;
    thumbnail?: string;
    views: number;
    likes: number;
    comments: number;
    createdAt: GameDate;
}

export interface InstagramPost {
    id: string;
    imageUrl: string;
    caption: string;
    likes: number;
    comments: number;
    date: GameDate;
}

export interface XComment {
    id: string;
    authorId: string;
    content?: string;
    image?: string;
    gif?: string;
    likes: number;
    date: GameDate;
}

export interface XPost {
    id: string;
    authorId: string;
    content: string;
    image?: string;
    video?: string;
    poll?: {
        options: XPollOption[];
        totalVotes: number;
    };
    likes: number;
    retweets: number;
    views: number;
    quoteOf?: XPost;
    date: GameDate;
    comments?: XComment[];
    isSpace?: boolean;
    spaceInfo?: {
        listeners: number;
        songIdPromoted?: string;
        isEnded?: boolean;
    };
}

export interface XMessage {
    id: string;
    senderId: string; // 'player' or a userId
    text: string;
    image?: string;
    date: GameDate;
}

export interface XChat {
    id: string;
    name: string;
    avatar: string;
    isGroup: boolean;
    participants: string[]; // array of userIds, 'player' is one of them
    messages: XMessage[];
    isRead: boolean;
}

export interface XTrend {
    id: string;
    category: string;
    title: string;
    postCount: number;
}

export type PaparazziPhotoCategory = 'Spotted' | 'Scandal' | 'Fashion' | 'Candid';

export interface PaparazziPhoto {
    id: string;
    image: string;
    category: PaparazziPhotoCategory;
}

export interface GrammyAward {
    year: number;
    category: 'Best New Artist' | 'Album of the Year' | 'Record of the Year' | 'Song of the Year' | 'Best Pop Song' | 'Best Rap Song' | 'Best R&B Song' | 'Pop Album' | 'Rap Album' | 'R&B Album';
    itemId: string; // releaseId, songId, or artistId
    itemName: string;
    artistName: string;
    isWinner: boolean;
}

export type AmaCategoryName = 'Artist of the Year' | 'New Artist of the Year' | 'Album of the Year' | 'Song of the Year' | 'Music Video of the Year' | 'Favorite Pop Artist' | 'Favorite Pop Album' | 'Favorite Pop Song' | 'Favorite Hip-Hop Artist' | 'Favorite Hip-Hop Album' | 'Favorite Hip-Hop Song' | 'Favorite R&B Artist' | 'Favorite R&B Album' | 'Favorite R&B Song' | 'Favorite Latin Artist' | 'Favorite Latin Album' | 'Favorite Latin Song' | 'Favorite Country Artist' | 'Favorite Country Album' | 'Favorite Country Song' | 'Favorite Rock Artist' | 'Favorite Rock Album' | 'Favorite Rock Song' | 'Favorite Dance/Electronic Artist';

export interface AmaAward {
    year: number;
    category: AmaCategoryName;
    itemId: string; // releaseId, songId, or artistId
    itemName: string;
    artistName: string;
    isWinner: boolean;
}

export interface OscarAward {
    year: number;
    category: 'Best Original Song';
    itemId: string; // songId
    itemName: string;
    artistName: string;
    isWinner: boolean;
}

export interface GrammyContender {
    id: string;
    name: string;
    artistName: string;
    isPlayer: boolean;
    score: number;
    coverArt?: string;
}

export interface OscarContender {
    id: string;
    name: string;
    artistName: string;
    isPlayer: boolean;
    score: number;
    coverArt?: string;
}


export interface GrammyCategory {
    name: 'Best New Artist' | 'Record of the Year' | 'Song of the Year' | 'Album of the Year' | 'Best Pop Song' | 'Best Rap Song' | 'Best R&B Song' | 'Pop Album' | 'Rap Album' | 'R&B Album';
    nominees: GrammyContender[];
    winner?: GrammyContender;
}

export interface AmaContender {
    artistId: string;
    artistName: string;
    itemId: string; // releaseId, songId, or artistId
    itemName: string;
    score: number;
}

export interface AmaCategory {
    name: AmaCategoryName;
    nominees: AmaContender[];
    winner?: AmaContender;
}

export interface OscarCategory {
    name: 'Best Original Song';
    nominees: OscarContender[];
    winner?: OscarContender;
}

export type GameView = 'game' | 'spotify' | 'studio' | 'release' | 'pitchfork' | 'youtube' | 'createVideo' | 'merchStore' | 'inbox' | 'catalog' | 'promote' | 'billboard' | 'spotifyChart' | 'youtubeVideoDetail' | 'youtubeStudio' | 'gigs' | 'labelReleasePlan' | 'createGeniusInterview' | 'x' | 'xProfile' | 'xChatDetail' | 'xNewMessage' | 'xCreateSpace' | 'xActiveSpace' | 'xAnalytics' | 'spotifyForArtists' | 'createFallonPerformance' | 'createFallonInterview' | 'spotifyAlbumCountdown' | 'createLabel' | 'manageLabel' | 'albumPromo' | 'billboardAlbums' | 'achievements' | 'redMicProUnlock' | 'redMicProDashboard' | 'wikipedia' | 'grammys' | 'submitForGrammys' | 'createGrammyPerformance' | 'grammyRedCarpet' | 'contractRenewal' | 'itunes' | 'onlyfansSetup' | 'onlyfans' | 'createOnlyFansPost' | 'chartHistory' | 'albumSalesChart' | 'labels' | 'releaseHub' | 'createSoundtrack' | 'spotifySoundtrackDetail' | 'gameGuide' | 'tours' | 'createTour' | 'tourDetail' | 'management' | 'security' | 'spotifyTopSongs' | 'spotifyTopAlbums' | 'createVogueFeature' | 'spotifyWrapped' | 'hotPopSongs' | 'hotRapRnb' | 'electronicChart' | 'countryChart' | 'createFeature' | 'createFeatureVideo' | 'createOnTheRadarPerformance' | 'createTrshdPerformance' | 'appleMusic' | 'oscars' | 'submitForOscars' | 'createOscarPerformance' | 'oscarRedCarpet' | 'switchSave' | 'redCarpetHistory' | 'amas' | 'submitForAmas' | 'createAmaPerformance' | 'amaRedCarpet' | 'dating' | 'google' | 'tiktok' | 'instagram' | 'tmzArticle' | 'riaa' | 'attendEvent' | 'globalLeaderboards' | 'store';

export type Tab = 'Home' | 'Apps' | 'Charts' | 'Misc' | 'Business';

export interface RedMicProState {
    unlocked: boolean;
    subscriptionType: 'yearly' | 'lifetime' | 'code' | null;
    subscriptionEndDate?: GameDate;
    hypeMode?: 'locked' | 'manual';
}

export interface OnlyFansPost {
    id: string;
    date: GameDate;
    caption: string;
    image: string;
    price: number;
    likes: number;
    comments: number;
    tips: number;
}

export interface OnlyFansProfile {
    username: string;
    displayName: string;
    bio: string;
    profilePicture: string; 
    bannerPicture: string; 
    subscriptionPrice: number;
    subscribers: number;
    posts: OnlyFansPost[];
    likes: number;
    totalGross: number;
    totalNet: number;
    earningsByMonth: { [yearMonth: string]: { gross: number, net: number } };
}

export interface XSuspensionStatus {
    isSuspended: boolean;
    reason: 'fan_war_reports' | 'random';
    appealSentDate?: GameDate;
    suspendedDate?: GameDate;
    accountId?: string; // tie suspension to a specific account
}

export interface SoundtrackTrack {
  isPlayerSong: boolean;
  songId: string; // Player Song ID or NPC uniqueId
  title: string;
  artist: string;
  streams: number;
  lastWeekStreams: number;
  prevWeekStreams: number;
  duration: number;
  explicit: boolean;
}

export interface SoundtrackAlbum {
    id: string;
    title: 'F1 The Album' | 'Wicked' | 'Breaking Bad' | 'Dune: Part Two' | 'Deadpool & Wolverine' | 'Barbie' | 'Spider-Man: Beyond the Spider-Verse' | 'James Bond' | 'The Hunger Games' | 'Pitch Perfect' | 'The Great Gatsby' | 'Mamma Mia' | 'Twilight';
    coverArt: string;
    tracks: SoundtrackTrack[];
    releaseDate: GameDate;
    label: string;
    artistId: string; // The player who contributed
    isReleased: boolean;
}

export interface Venue {
    id: string;
    name: string;
    city: string;
    capacity: number;
    ticketPrice: number;
    soldOut: boolean;
    revenue: number;
    ticketsSold: number;
}

export interface Tour {
    id: string;
    artistId: string;
    name: string;
    bannerImage: string;
    venues: Venue[];
    setlist: string[];
    status: 'planning' | 'active' | 'finished';
    currentVenueIndex: number;
    totalRevenue: number;
    ticketsSold: number;
}

export interface Manager {
    id: string;
    name: string;
    yearlyCost: number;
    popularityBoost: number;
    autoGigsPerWeek: number;
    unlocksTier: number;
}

export interface SecurityTeam {
    id: string;
    name: string;
    weeklyCost: number;
    leakProtection: number;
}

export interface VoguePhotoshoot {
    id: string;
    magazine: 'Vogue' | 'Vogue Korea' | 'Vogue Italy';
    coverImage: string;
    photoshootImages: string[];
    interviewAnswers: { question: string; answer: string }[];
    date: GameDate;
}

export interface Relationship {
    id: string;
    partnerName: string;
    partnerType: 'npc' | 'custom';
    startYear: number;
    startWeek?: number;
    endYear: number | null;
    endWeek?: number;
    status: 'dating' | 'engaged' | 'married' | 'ex';
    isPublic: boolean;
    image?: string;
}

export interface Kid {
    id: string;
    name: string;
    birthDate: GameDate;
    isArtist: boolean;
}

export interface Pregnancy {
    partnerName: string;
    conceptionDate: GameDate;
    revealed: boolean;
}

export interface RedditComment {
    id: string;
    author: string;
    text: string;
    upvotes: number;
    timeAgo: string;
    replies?: RedditComment[];
}

export interface RedditPost {
    id: string;
    author: string;
    timeAgo: string;
    title: string;
    content: string;
    upvotes: number;
    commentCount: number;
    image: string | null;
    comments?: RedditComment[];
}

export interface ArtistData {
    money: number;
    hype: number;
    peakHype?: number;
    publicImage: number;
    popularity: number;
    songs: Song[];
    releases: Release[];
    monthlyListeners: number;
    peakMonthlyListeners?: number;
    lastFourWeeksStreams: number[];
    lastFourWeeksViews: number[];
    youtubeSubscribers: number;
    tiktokFollowers: number;
    tiktokVideos: TikTokVideo[];
    instagramFollowers?: number;
    instagramPosts?: InstagramPost[];
    videos: Video[];
    youtubeStoreUnlocked: boolean;
    merch: MerchProduct[];
    merchStoreBanner: string | null;
    independentNameChanges?: number;
    relationships?: Relationship[];
    grammyBanner?: string;
    oscarBanner?: string;
    inbox: Email[];
    redditPosts?: RedditPost[];
    streamsThisMonth: number;
    viewsThisQuarter: number;
    subsThisQuarter: number;
    promotions: Promotion[];
    performedGigThisWeek: boolean;
    contract: Contract | null;
    contractHistory: Contract[];
    labelSubmissions: LabelSubmission[];
    customLabels: CustomLabel[];
    artistImages: string[];
    coachella?: {
        year: number;
        status: 'none' | 'invited' | 'submitted' | 'headliner' | 'mid' | 'small' | 'opener';
        openingFor?: string;
        payoutSize?: number;
    };
    artistVideoThumbnails: string[];
    paparazziPhotos: PaparazziPhoto[];
    tourPhotos: string[];
    tours: Tour[];
    featurePrice?: number;
    pastRedCarpetLooks: RedCarpetLook[];
    streamsRemovedThisWeek?: number;
    manager: { id: string; contractEndDate: GameDate } | null;
    lastPushToItunesWeek?: number;
    lastPushedSongId?: string;
    securityTeamId: string | null;
    xUsers: XUser[];
    selectedPlayerXUserId?: string;
    xPosts: XPost[];
    xChats: XChat[];
    xTrends: XTrend[];
    xFollowingIds: string[];
    xSuspensionStatus: XSuspensionStatus | null;
    // Spotify for Artists Stats
    followers: number;
    saves: number;
    artistPick: { itemId: string; itemType: 'song' | 'release'; message: string; } | null;
    listeningNow: number;
    streamsHistory: { date: GameDate; streams: number }[];
    firstChartEntry?: { songTitle: string; rank: number; date: GameDate } | null;
    playlistPlacements?: { playlistId: string; playlistName: string; coverArt: string; totalStreams: number; songStreams: Record<string, number> }[];
    // Red Mic Pro
    redMicPro: RedMicProState;
    salesBoost: number; // percentage
    isGoldTheme: boolean;
    // AMAs
    amaHistory: AmaAward[];
    hasSubmittedForAmaNewArtist: boolean;
    // GRAMMYs
    grammyHistory: GrammyAward[];
    hasSubmittedForBestNewArtist: boolean;
    // Oscars
    oscarHistory: OscarAward[];
    // OnlyFans
    onlyfans: OnlyFansProfile | null;
    fanWarStatus: { targetArtistName: string; weeksRemaining: number; } | null;
    // Soundtracks
    soundtrackOfferCount: number;
    offeredSoundtracks: Array<string>;
    weeksUntilNextSoundtrackOffer?: number;
    lastVogueOfferYear?: number;
    voguePhotoshoots?: VoguePhotoshoot[];
    weeksUntilNextFeatureOffer?: number;
    signedBrandDeals?: string[];
    signedVideoGames?: string[];
    kids?: Kid[];
    pregnancy?: Pregnancy | null;
}

export interface RedCarpetLook {
    id: string;
    awardShow: string;
    year: number;
    imageUrl: string;
}

export interface GameState {
    onlinePosts?: any[];
    onlineSongs?: any[];
    onlineAlbums?: any[];
    onlineArtists?: any[];
    disableEncounters?: boolean;
    activeEncounter?: ActiveEncounter | null;
    activeTmzPost?: XPost | null;
    cloudSaveId?: string;
    offlineMode?: boolean;
    difficultyMode?: 'easy' | 'normal' | 'hard' | 'extreme';
    careerMode: 'solo' | 'group' | 'online' | null;
    soloArtist: Artist | null;
    group: Group | null;
    activeArtistId: string | null;
    extraPlayableArtists?: Artist[];

    artistsData: {
        [artistId: string]: ArtistData;
    };
    spotifyPlaylists: SpotifyPlaylist[];
    
    date: GameDate;
    currentView: GameView;
    activeTab: Tab;
    activeYoutubeChannel: 'artist' | 'label';
    
    npcs: NpcSong[];
    npcAlbums: NpcAlbum[];
    npcImages?: Record<string, string>;
    soundtrackAlbums: SoundtrackAlbum[];
    billboardHot100: ChartEntry[];
    billboardTopAlbums: AlbumChartEntry[];
    albumChartHistory: ChartHistory;
    chartHistory: ChartHistory;
    spotifyGlobal: ChartEntry[];
    hotPopSongs: ChartEntry[];
    hotRapRnb: ChartEntry[];
    electronicChart: ChartEntry[];
    countryChart: ChartEntry[];
    hotPopSongsHistory: ChartHistory;
    hotRapRnbHistory: ChartHistory;
    electronicChartHistory: ChartHistory;
    countryChartHistory: ChartHistory;
    spotifyNewEntries: number;
    selectedVideoId: string | null;
    selectedReleaseId: string | null;
    selectedSoundtrackId: string | null;
    activeSubmissionId: string | null;
    activeGeniusOffer: { songId: string; emailId: string } | null;
    activeOnTheRadarOffer: { songId: string; emailId: string } | null;
    activeTrshdOffer: { songId: string; emailId: string } | null;
    activeEventInvitation: { emailId: string; eventName: string; eventType: string; hostName?: string; associatedSoundtrack?: string } | null;
    activeFallonOffer: { releaseId: string; offerType: 'performance' | 'interview' | 'both'; emailId: string; step?: 'performance' | 'interview' } | null;
    activeSoundtrackOffer: { albumTitle: string; emailId: string } | null;
    activeFeatureOffer: {
        npcArtistName: string;
        payout: number;
        songQuality: number;
        promotion?: { name: string; durationWeeks: number; };
        emailId: string;
    } | null;
    activeFeatureVideoOffer: {
        songId: string;
        npcArtistName: string;
        emailId: string;
    } | null;
    selectedXUserId: string | null;
    selectedSpotifyArtistId?: string | null;
    selectedXChatId: string | null;
    contractRenewalOffer: { labelId: string; isCustom?: boolean; artistId: string } | null;
    activeTourId: string | null;
    viewingPastLabelId: string | null;
    activeVogueOffer: {
        magazine: 'Vogue' | 'Vogue Korea' | 'Vogue Italy';
        emailId: string;
    } | null;
    // VMAs
    vmaSubmissions?: { artistId: string, category: string, itemId: string, itemName: string }[];
    vmaCurrentYearNominations?: any[] | null;
    activeVmaRedCarpetOffer?: { emailId: string } | null;
    activeVmaPerformanceOffer?: { emailId: string } | null;
    // AMAs
    amaSubmissions: { artistId: string, category: AmaCategoryName, itemId: string, itemName: string }[];
    amaCurrentYearNominations: AmaCategory[] | null;
    activeAmaPerformanceOffer: { emailId: string } | null;
    activeAmaRedCarpetOffer: { emailId: string } | null;
    // GRAMMYs
    grammySubmissions: { artistId: string, category: GrammyAward['category'], itemId: string, itemName: string }[];
    grammyCurrentYearNominations: GrammyCategory[] | null;
    activeGrammyPerformanceOffer: { emailId: string } | null;
    activeGrammyRedCarpetOffer: { emailId: string } | null;
    // Oscars
    oscarSubmissions: { artistId: string, category: 'Best Original Song', itemId: string, itemName: string }[];
    oscarCurrentYearNominations: OscarCategory[] | null;
    activeOscarPerformanceOffer: { emailId: string } | null;
    activeOscarRedCarpetOffer: { emailId: string } | null;
}

export interface EncounterChoice {
    label: string;
    tweetTemplate: string;
    authorName: string;
    isTMZ: boolean;
    publicImageEffect: number;
    hypeEffect: number;
}

export interface ActiveEncounter {
    id: string;
    text: string;
    requiresImage: boolean;
    choices: EncounterChoice[];
}

export type GameAction =
    | { type: 'SYNC_ONLINE_POSTS'; payload: any[] }
    | { type: 'SYNC_ONLINE_SONGS'; payload: any[] }
    | { type: 'SYNC_ONLINE_ALBUMS'; payload: any[] }
    | { type: 'SYNC_ONLINE_ARTISTS'; payload: any[] }
    | { type: 'SET_ACTIVE_TMZ_POST'; payload: XPost | null }
    | { type: 'RESOLVE_ENCOUNTER'; payload: { choice: EncounterChoice; imageUrl: string } }
    | { type: 'TOGGLE_ENCOUNTERS' }
    | { type: 'START_SOLO_GAME'; payload: { artist: Artist; startYear: number; difficultyMode?: 'easy' | 'normal' | 'hard' | 'extreme' } }
    | { type: 'START_GROUP_GAME'; payload: { group: Group; startYear: number; difficultyMode?: 'easy' | 'normal' | 'hard' | 'extreme' } }
    | { type: 'START_ONLINE_GAME'; payload: { onlineArtist: any } }
    | { type: 'CHANGE_VIEW'; payload: GameView }
    | { type: 'SUBMIT_COACHELLA'; payload: { emailId: string } }
    | { type: 'CHANGE_TAB'; payload: Tab }
    | { type: 'SWITCH_YOUTUBE_CHANNEL'; payload: 'artist' | 'label' }
    | { type: 'CHANGE_ACTIVE_ARTIST'; payload: string }
    | { type: 'SYNC_DATE'; payload: number }
    | { type: 'PROGRESS_WEEK' }
    | { type: 'RECORD_SONG'; payload: { song: Song; cost: number } }
    | { type: 'CREATE_REMIX_PACK'; payload: { songs: Song[]; cost: number } }
    | { type: 'RELEASE_PROJECT'; payload: { release: Release } }
    | { type: 'ADD_REVIEW'; payload: { releaseId: string; review: Review; cost: number; artistId: string; } }
    | { type: 'CREATE_VIDEO'; payload: { video: Video; cost: number } }
    | { type: 'ADD_MERCH'; payload: { item: MerchProduct } }
    | { type: 'REMOVE_MERCH'; payload: { id: string } }
    | { type: 'UPDATE_MERCH_BANNER'; payload: string }
    | { type: 'UPDATE_GRAMMY_BANNER'; payload: string }
    | { type: 'UPDATE_OSCAR_BANNER'; payload: string }
    | { type: 'MARK_INBOX_READ' }
    | { type: 'TAKE_DOWN_SONG'; payload: { songId: string } }
    | { type: 'TAKE_DOWN_RELEASE'; payload: { releaseId: string } }
    | { type: 'TOGGLE_APPLE_MUSIC_EXPANDED_COVER'; payload: { releaseId: string; enabled: boolean } }
    | { type: 'MARK_APPLE_MUSIC_ESSENTIAL'; payload: { releaseId: string; reviewText: string } }
    | { type: 'UPDATE_ITUNES_PRICE'; payload: { songId: string; newPriceStr: string } }
    | { type: 'BUY_BACK_SONG'; payload: { songId: string, cost: number } }
    | { type: 'BUY_BACK_RELEASE'; payload: { releaseId: string, cost: number } }
    | { type: 'SELL_RIGHTS'; payload: { itemType: 'song' | 'release', id: string, percent: number, labelId: string, value: number } }
    | { type: 'BUY_RIGHTS'; payload: { itemType: 'song' | 'release', id: string, percentToBuy: number, cost: number } }
    | { type: 'START_PROMOTION'; payload: { promotion: Promotion } }
    | { type: 'CANCEL_PROMOTION'; payload: { promotionId: string } }
    | { type: 'SELECT_VIDEO'; payload: string | null }
    | { type: 'SELECT_RELEASE'; payload: string | null }
    | { type: 'PERFORM_GIG'; payload: { cash: number; hype: number } }
    | { type: 'SIGN_CONTRACT'; payload: { contract: Contract } }
    | { type: 'END_CONTRACT' }
    | { type: 'SIGN_NPC_TO_LABEL'; payload: { npcName: string; advance: number; royaltyRate: number; durationWeeks: number; } }
    | { type: 'RELEASE_NPC_FROM_LABEL'; payload: { npcName: string; } }
    | { type: 'SUBMIT_TO_LABEL'; payload: { submission: LabelSubmission } }
    | { type: 'EDIT_SUBMISSION_DATE'; payload: { submissionId: string; newDate: GameDate } }
    | { type: 'GO_TO_LABEL_PLAN'; payload: { submissionId: string } }
    | { type: 'PLAN_LABEL_RELEASE'; payload: { submissionId: string; singles: { songId: string; releaseDate: GameDate }[]; projectReleaseDate: GameDate; } }
    | { type: 'ACCEPT_GENIUS_OFFER'; payload: { songId: string; emailId: string } }
    | { type: 'CREATE_GENIUS_INTERVIEW'; payload: { video: Video } }
    | { type: 'CANCEL_GENIUS_OFFER' }
    | { type: 'ACCEPT_ONTHERADAR_OFFER'; payload: { songId: string; emailId: string } }
    | { type: 'CREATE_ONTHERADAR_PERFORMANCE'; payload: { video: Video } }
    | { type: 'CANCEL_ONTHERADAR_OFFER' }
    | { type: 'ACCEPT_TRSHD_OFFER'; payload: { songId: string; emailId: string } }
    | { type: 'CREATE_TRSHD_PERFORMANCE'; payload: { video: Video } }
    | { type: 'CANCEL_TRSHD_OFFER' }
    | { type: 'ACCEPT_FALLON_OFFER'; payload: { releaseId: string; offerType: 'performance' | 'interview' | 'both'; emailId: string } }
    | { type: 'CREATE_FALLON_VIDEO'; payload: { video: Video; songId?: string } }
    | { type: 'CANCEL_FALLON_OFFER' }
    | { type: 'ADD_ARTIST_IMAGE'; payload: string }
    | { type: 'ADD_ARTIST_VIDEO'; payload: string }
    | { type: 'ADD_PAPARAZZI_PHOTO'; payload: { photo: PaparazziPhoto } }
    | { type: 'ANSWER_POPBASE_QUESTION'; payload: { emailId: string; answer: string } }
    | { type: 'COMBINE_REMIXES'; payload: { originalSongId: string } }
    | { type: 'CHANGE_STAGE_NAME'; payload: { newName: string; cost?: number; contractId?: string } }
    | { type: 'POST_ON_X'; payload: { id?: string; content: string; image?: string; postType: 'normal' | 'fanWar' | 'push' | 'announce'; targetId?: string; songId?: string; quoteOf?: XPost; announceItem?: { type: 'project' | 'single', submissionId: string, songId?: string } } }
    | { type: 'REPLY_TO_X_POST'; payload: { postId: string; content: string; image?: string; authorId: string; } }
    | { type: 'VIEW_X_PROFILE'; payload: string }
    | { type: 'VIEW_SPOTIFY_PROFILE'; payload: string }
    | { type: 'CREATE_X_ACCOUNT'; payload: { username: string; name: string; avatar: string; bio?: string } }
    | { type: 'BUY_X_VERIFICATION'; payload: { accountId: string, tier: 'blue' | 'gold', cost: number } }
    | { type: 'START_X_SPACE'; payload: { topic: string; recordSpace: boolean; enableVideo: boolean; } }
    | { type: 'END_X_SPACE'; payload: undefined }
    | { type: 'PROMOTE_SONG_ON_X_SPACE'; payload: { songId: string; listeners: number; } }
    | { type: 'DELETE_X_ACCOUNT'; payload: { accountId: string } }
    | { type: 'SELECT_X_ACCOUNT'; payload: { accountId: string } }
    | { type: 'VIEW_X_CHAT'; payload: string }
    | { type: 'FOLLOW_X_USER'; payload: string }
    | { type: 'UNFOLLOW_X_USER'; payload: string }
    | { type: 'ADD_X_USER'; payload: XUser }
    | { type: 'SEND_X_MESSAGE'; payload: { chatId: string; message: XMessage; } }
    | { type: 'CREATE_X_CHAT'; payload: XChat }
    | { type: 'APPEAL_X_SUSPENSION' }
    | { type: 'SET_ARTIST_PICK'; payload: { itemId: string; itemType: 'song' | 'release'; message: string; } }
    | { type: 'PITCH_TO_PLAYLIST'; payload: { songId: string } }
    | { type: 'CREATE_CUSTOM_LABEL'; payload: { label: CustomLabel; cost: number; membersToSign: string[] } }
    | { type: 'DELETE_SONG'; payload: { songId: string } }
    | { type: 'GO_TO_ALBUM_PROMO'; payload: { submissionId: string } }
    | { type: 'LAUNCH_COUNTDOWN_PAGE'; payload: { submissionId: string; cost: number } }
    | { type: 'REQUEST_GENIUS_PROMO'; payload: { submissionId: string; songId: string; cost: number } }
    | { type: 'REQUEST_FALLON_PROMO'; payload: { submissionId: string; songId: string; cost: number } }
    | { type: 'RESET_GAME' }
    | { type: 'LOAD_GAME'; payload: GameState }
    | { type: 'SET_ONLINE_ARTISTS'; payload: any[] }
    | { type: 'SYNC_ONLINE_POSTS'; payload: any[] }
    | { type: 'SYNC_ONLINE_MESSAGES'; payload: any[] }
    | { type: 'SYNC_FEATURE_REQUESTS'; payload: any[] }
    | { type: 'SYNC_FEATURE_APPROVALS'; payload: any[] }
    | { type: 'ACCEPT_ONLINE_FEATURE'; payload: OnlineFeatureOffer }
    | { type: 'DECLINE_ONLINE_FEATURE'; payload: OnlineFeatureOffer }
    | { type: 'UNLOCK_RED_MIC_PRO'; payload: { type: 'yearly' | 'lifetime' | 'code'; cost: number; } }
    | { type: 'UPDATE_SONG_QUALITY'; payload: { songId: string; newQuality: number; } }
    | { type: 'SET_MONEY'; payload: { newAmount: number; } }
    | { type: 'TOGGLE_GOLD_THEME'; payload: { enabled: boolean; } }
    | { type: 'SET_SALES_BOOST'; payload: { newBoost: number; } }
    | { type: 'UPDATE_ABOUT_SONG_TEXT'; payload: { songId: string; text: string; } }
    | { type: 'UPDATE_FEATURE_PRICE'; payload: { price: number; } }
    | { type: 'UPDATE_WIKIPEDIA_SUMMARY'; payload: { releaseId: string; summary: string; } }
    | { type: 'TOGGLE_OFFLINE_MODE' }
    | { type: 'PRO_SIGN_LABEL'; payload: { labelId: Label['id']; } }
    | { type: 'GO_TO_GRAMMY_SUBMISSIONS'; payload: { emailId: string } }
    | { type: 'SUBMIT_FOR_GRAMMYS'; payload: { submissions: GameState['grammySubmissions'], emailId: string } }
    | { type: 'ACCEPT_GRAMMY_PERFORMANCE'; payload: { emailId: string } }
    | { type: 'CREATE_GRAMMY_PERFORMANCE'; payload: { video: Video } }
    | { type: 'DECLINE_GRAMMY_PERFORMANCE'; payload: { emailId: string } }
    | { type: 'ACCEPT_GRAMMY_RED_CARPET'; payload: { emailId: string, lookUrl: string } }
    | { type: 'DECLINE_GRAMMY_RED_CARPET'; payload: { emailId: string } }
    | { type: 'GO_TO_AMA_SUBMISSIONS'; payload: { emailId: string } }
    | { type: 'SUBMIT_FOR_AMAS'; payload: { submissions: GameState['amaSubmissions'], emailId: string } }
    | { type: 'ACCEPT_AMA_PERFORMANCE'; payload: { emailId: string } }
    | { type: 'CREATE_AMA_PERFORMANCE'; payload: { video: Video } }
    | { type: 'DECLINE_AMA_PERFORMANCE'; payload: { emailId: string } }
    | { type: 'ACCEPT_AMA_RED_CARPET'; payload: { emailId: string, lookUrl: string } }
    | { type: 'DECLINE_AMA_RED_CARPET'; payload: { emailId: string } }
    | { type: 'ACCEPT_VMA_RED_CARPET'; payload: { emailId: string, lookUrl: string } }
    | { type: 'DECLINE_VMA_RED_CARPET'; payload: { emailId: string } }
    | { type: 'GO_TO_OSCAR_SUBMISSIONS'; payload: { emailId: string } }
    | { type: 'SUBMIT_FOR_OSCARS'; payload: { submissions: GameState['oscarSubmissions'], emailId: string } }
    | { type: 'ACCEPT_OSCAR_PERFORMANCE'; payload: { emailId: string } }
    | { type: 'CREATE_OSCAR_PERFORMANCE'; payload: { video: Video } }
    | { type: 'DECLINE_OSCAR_PERFORMANCE'; payload: { emailId: string } }
    | { type: 'ACCEPT_OSCAR_RED_CARPET'; payload: { emailId: string, lookUrl: string } }
    | { type: 'DECLINE_OSCAR_RED_CARPET'; payload: { emailId: string } }
    | { type: 'RENEW_CONTRACT' }
    | { type: 'GO_INDEPENDENT' }
    | { type: 'UPDATE_ARTIST_IMAGE'; payload: { artistId: string; newImage: string } }
    | { type: 'CREATE_ONLYFANS_PROFILE'; payload: { profile: OnlyFansProfile } }
    | { type: 'UPDATE_ONLYFANS_SETTINGS'; payload: { price: number } }
    | { type: 'CREATE_INSTAGRAM_POST'; payload: { imageUrl: string; caption: string } }
    | { type: 'CREATE_ONLYFANS_POST'; payload: { post: OnlyFansPost } }
    | { type: 'ACCEPT_ONLYFANS_REQUEST'; payload: { emailId: string; payout: number; } }
    | { type: 'ACCEPT_FEATURE_VIDEO_OFFER'; payload: { songId: string; emailId: string; npcArtistName: string; } }
    | { type: 'CANCEL_FEATURE_VIDEO_OFFER' }
    | { type: 'CREATE_FEATURE_VIDEO'; payload: { thumbnail: string } }
    | { type: 'SET_PRO_HYPE_MODE'; payload: 'locked' | 'manual' }
    | { type: 'SET_HYPE'; payload: number }
    | { type: 'SET_PUBLIC_IMAGE'; payload: number }
    | { type: 'SIGN_BRAND_DEAL'; payload: { id: string; cash: number } }
    | { type: 'SIGN_VIDEO_GAME_DEAL'; payload: { id: string; cash: number } }
    | { type: 'SET_POPULARITY'; payload: number }
    | { type: 'UPDATE_RELEASE_COVER_ART'; payload: { releaseId: string; newCoverArt: string } }
    | { type: 'ACCEPT_SOUNDTRACK_OFFER'; payload: { albumTitle: string; emailId: string } }
    | { type: 'CREATE_SOUNDTRACK_CONTRIBUTION'; payload: { albumTitle: string; coverArt: string; songIds: string[] } }
    | { type: 'CANCEL_SOUNDTRACK_OFFER' }
    | { type: 'ACCEPT_FEATURE_OFFER', payload: FeatureOffer }
    | { type: 'CANCEL_FEATURE_OFFER' }
    | { type: 'CREATE_FEATURE_SONG', payload: { songTitle: string, coverArt: string, releaseDate: GameDate } }
    | { type: 'CREATE_TOUR'; payload: Tour }
    | { type: 'START_TOUR'; payload: { tourId: string } }
    | { type: 'UPLOAD_TOUR_PHOTO'; payload: string }
    | { type: 'SELECT_SOUNDTRACK'; payload: string | null }
    | { type: 'SELECT_TOUR'; payload: string | null }
    | { type: 'HIRE_MANAGER'; payload: { managerId: string } }
    | { type: 'FIRE_MANAGER' }
    | { type: 'HIRE_SECURITY'; payload: { teamId: string } }
    | { type: 'FIRE_SECURITY' }
    | { type: 'UPDATE_NPC_X_USER'; payload: { userId: string; newName: string; newUsername: string } }
    | { type: 'VIEW_PAST_LABEL_CHANNEL'; payload: string }
    | { type: 'ACCEPT_EVENT_INVITATION'; payload: { emailId: string; eventName: string; eventType: string; hostName?: string; associatedSoundtrack?: string } }
    | { type: 'CONFIRM_EVENT_ATTENDANCE'; payload: { imageUrl: string } }
    | { type: 'DECLINE_EVENT_INVITATION'; payload: { emailId: string } }
    | { type: 'UPDATE_NPC_AVATAR'; payload: { userId: string; newAvatar: string } }
    | { type: 'UPDATE_NPC_COVER'; payload: { artistName: string; newCover: string } }
    | { type: 'ACCEPT_VOGUE_OFFER'; payload: { magazine: 'Vogue' | 'Vogue Korea' | 'Vogue Italy'; emailId: string; } }
    | { type: 'CANCEL_VOGUE_OFFER' }
    | { type: 'SET_CLOUD_SAVE_ID'; payload: string }
    | { type: 'CREATE_VOGUE_FEATURE'; payload: { photoshoot: VoguePhotoshoot } }
    | { type: 'START_DATING'; payload: { partnerName: string; partnerType: 'npc' | 'custom' } }
    | { type: 'REVEAL_RELATIONSHIP'; payload: { relationshipId: string; outlet: 'popbase' | 'tmz' } }
    | { type: 'ADVANCE_RELATIONSHIP'; payload: { relationshipId: string; newStatus: 'engaged' | 'married' } }
    | { type: 'BREAK_UP'; payload: { relationshipId: string } }
    | { type: 'GET_BACK_WITH_EX'; payload: { relationshipId: string } }
    | { type: 'UPDATE_RELATIONSHIP_IMAGE'; payload: { relationshipId: string, image: string } }
    | { type: 'START_PREGNANCY'; payload: { partnerName: string } }
    | { type: 'REVEAL_PREGNANCY' }
    | { type: 'GIVE_BIRTH'; payload: { childName: string } }
    | { type: 'START_KID_CAREER'; payload: { kidId: string } }
    | { type: 'MARK_EMAIL_OFFER_ANSWERED'; payload: { emailId: string } }
    | { type: 'RESPOND_TO_CHEATING'; payload: { response: 'break_up' | 'forgive' | 'ignore', relationshipId: string } }
    | { type: 'CREATE_TIKTOK'; payload: { content: string; songId?: string; thumbnail?: string } }
    | { type: 'UPLOAD_CANVAS'; payload: { songId: string, videoUrl: string, hashtags: string[] } }
    ;
