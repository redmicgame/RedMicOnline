

import React, { useState, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import StartScreen from './components/StartScreen';
import GameUI from './components/GameUI';
import EncounterModalView from './components/EncounterModalView';
import SpotifyView from './components/SpotifyView';
import StudioView from './components/StudioView';
import ReleaseView from './components/ReleaseView';
import PitchforkView from './components/PitchforkView';
import YouTubeView from './components/YouTubeView';
import CreateVideoView from './components/CreateVideoView';
import YouTubeStoreView from './components/YouTubeStoreView';
import InboxView from './components/InboxView';
import CatalogView from './components/CatalogView';
import PromoteView from './components/PromoteView';
import BillboardView from './components/BillboardView';
import BillboardAlbumsView from './components/BillboardAlbumsView';
import SpotifyChartView from './components/SpotifyChartView';
import YouTubeVideoDetailView from './components/YouTubeVideoDetailView';
import YouTubeStudioView from './components/YouTubeStudioView';
import GigsView from './components/GigsView';
import LabelReleasePlanView from './components/LabelReleasePlanView';
import CreateGeniusInterviewView from './components/CreateGeniusInterviewView';
import XView from './components/XView';
import XProfileView from './components/XProfileView';
import XChatView from './components/XChatView';
import XNewMessageView from './components/XNewMessageView';
import XCreateSpaceView from './components/XCreateSpaceView';
import XActiveSpaceView from './components/XActiveSpaceView';
import XAnalyticsView from './components/XAnalyticsView';
import SpotifyForArtistsView from './components/SpotifyForArtistsView';
import AppleMusicForArtistsView from './components/AppleMusicForArtistsView';
import './utils/xContentGenerator';
import CreateFallonPerformanceView from './components/CreateFallonPerformanceView';
import CreateFallonInterviewView from './components/CreateFallonInterviewView';
import SpotifyAlbumCountdownView from './components/SpotifyAlbumCountdownView';
import CreateLabelView from './components/CreateLabelView';
import ManageLabelView from './components/ManageLabelView';
import AlbumPromoView from './components/AlbumPromoView';
import AchievementsView from './components/AchievementsView';
import RedMicProUnlockView from './components/RedMicProUnlockView';
import RedMicProDashboardView from './components/RedMicProDashboardView';
import WikipediaView from './components/WikipediaView';
import GrammysView from './components/GrammysView';
import SubmitForGrammysView from './components/SubmitForGrammysView';
import CreateGrammyPerformanceView from './components/CreateGrammyPerformanceView';
import GrammyRedCarpetView from './components/GrammyRedCarpetView';
import AmasView from './components/AmasView';
import SubmitForAmasView from './components/SubmitForAmasView';
import CreateAmaPerformanceView from './components/CreateAmaPerformanceView';
import AmaRedCarpetView from './components/AmaRedCarpetView';
import ContractRenewalView from './components/ContractRenewalView';
import ITunesView from './components/ITunesView';
import OnlyFansSetupView from './components/OnlyFansSetupView';
import OnlyFansView from './components/OnlyFansView';
import CreateOnlyFansPostView from './components/CreateOnlyFansPostView';
import ChartHistoryView from './components/ChartHistoryView';
import AlbumSalesChartView from './components/AlbumSalesChartView';
import LabelsView from './components/LabelsView';
import ReleaseHubView from './components/ReleaseHubView';
import CreateSoundtrackView from './components/CreateSoundtrackView';
import SpotifySoundtrackDetailView from './components/SpotifySoundtrackDetailView';
import GameGuideView from './components/GameGuideView';
import ToursView from './components/ToursView';
import CreateTourView from './components/CreateTourView';
import TourDetailView from './components/TourDetailView';
import ManagementView from './components/ManagementView';
import SecurityView from './components/SecurityView';
import SpotifyTopSongsView from './components/SpotifyTopSongsView';
import SpotifyTopAlbumsView from './components/SpotifyTopAlbumsView';
import CreateVogueFeatureView from './components/CreateVogueFeatureView';
import SpotifyWrappedView from './components/SpotifyWrappedView';
import HotPopSongsView from './components/HotPopSongsView';
import HotRapRnbView from './components/HotRapRnbView';
import ElectronicChartView from './components/ElectronicChartView';
import CountryChartView from './components/CountryChartView';
import CreateFeatureView from './components/CreateFeatureView';
import { CreateFeatureVideoView } from './components/CreateFeatureVideoView';
import CreateOnTheRadarPerformanceView from './components/CreateOnTheRadarPerformanceView';
import CreateTrshdPerformanceView from './components/CreateTrshdPerformanceView';
import AppleMusicView from './components/AppleMusicView';
import OscarsView from './components/OscarsView';
import SubmitForOscarsView from './components/SubmitForOscarsView';
import CreateOscarPerformanceView from './components/CreateOscarPerformanceView';
import OscarRedCarpetView from './components/OscarRedCarpetView';
import SwitchSaveView from './components/SwitchSaveView';
import RedCarpetHistoryView from './components/RedCarpetHistoryView';
import DatingView from './components/DatingView';
import GoogleView from './components/GoogleView';
import TikTokView from './components/TikTokView';
import InstagramView from './components/InstagramView';
import TmzArticleView from './components/TmzArticleView';
import RiaaView from './components/RiaaView';
import AttendEventView from './components/AttendEventView';
import GlobalLeaderboardsView from './components/GlobalLeaderboardsView';

const AppContent: React.FC = () => {
    const { gameState, activeArtistData } = useGame();
    const { careerMode, currentView } = gameState;
    const isGoldTheme = activeArtistData?.isGoldTheme ?? false;

    if (!careerMode) {
        return <StartScreen />;
    }

    const renderView = () => {
        switch (currentView) {
            case 'globalLeaderboards':
                return <GlobalLeaderboardsView />;
            case 'attendEvent':
                return <AttendEventView />;
            case 'instagram':
                return <InstagramView />;
            case 'tiktok':
                return <TikTokView />;
            case 'google':
                return <GoogleView />;
            case 'spotify':
                return <SpotifyView />;
            case 'spotifyAlbumCountdown':
                return <SpotifyAlbumCountdownView />;
            case 'spotifyForArtists':
                return <SpotifyForArtistsView />;
            case 'spotifyWrapped':
                return <SpotifyWrappedView />;
            case 'studio':
                return <StudioView />;
            case 'release':
                return <ReleaseView />;
            case 'releaseHub':
                return <ReleaseHubView />;
            case 'pitchfork':
                return <PitchforkView />;
            case 'youtube':
                return <YouTubeView />;
            case 'youtubeVideoDetail':
                return <YouTubeVideoDetailView />;
            case 'createVideo':
                return <CreateVideoView />;
            case 'merchStore':
                return <YouTubeStoreView />;
            case 'youtubeStudio':
                return <YouTubeStudioView />;
            case 'inbox':
                return <InboxView />;
            case 'catalog':
                return <CatalogView />;
            case 'promote':
                return <PromoteView />;
            case 'billboard':
                return <BillboardView />;
            case 'billboardAlbums':
                return <BillboardAlbumsView />;
            case 'spotifyChart':
                return <SpotifyChartView />;
            case 'hotPopSongs':
                return <HotPopSongsView />;
            case 'hotRapRnb':
                return <HotRapRnbView />;
            case 'electronicChart':
                return <ElectronicChartView />;
            case 'countryChart':
                return <CountryChartView />;
            case 'spotifyTopSongs':
                return <SpotifyTopSongsView />;
            case 'spotifyTopAlbums':
                return <SpotifyTopAlbumsView />;
            case 'gigs':
                return <GigsView />;
            case 'tours':
                return <ToursView />;
            case 'createTour':
                return <CreateTourView />;
            case 'tourDetail':
                return <TourDetailView />;
            case 'labels':
                return <LabelsView />;
            case 'labelReleasePlan':
                return <LabelReleasePlanView />;
            case 'createLabel':
                return <CreateLabelView />;
            case 'manageLabel':
                return <ManageLabelView />;
            case 'albumPromo':
                return <AlbumPromoView />;
            case 'achievements':
                return <AchievementsView />;
            case 'chartHistory':
                return <ChartHistoryView />;
            case 'albumSalesChart':
                return <AlbumSalesChartView />;
            case 'createGeniusInterview':
                return <CreateGeniusInterviewView />;
            case 'createOnTheRadarPerformance':
                return <CreateOnTheRadarPerformanceView />;
            case 'createTrshdPerformance':
                return <CreateTrshdPerformanceView />;
            case 'createFallonPerformance':
                return <CreateFallonPerformanceView />;
            case 'createFallonInterview':
                return <CreateFallonInterviewView />;
            case 'createFeature':
                return <CreateFeatureView />;
            case 'createFeatureVideo':
                return <CreateFeatureVideoView />;
            case 'x':
                return <XView />;
            case 'xProfile':
                return <XProfileView />;
            case 'xCreateSpace':
                return <XCreateSpaceView />;
            case 'xActiveSpace':
                return <XActiveSpaceView />;
            case 'xAnalytics':
                return <XAnalyticsView />;
            case 'xChatDetail':
                return <XChatView />;
            case 'xNewMessage':
                return <XNewMessageView />;
            case 'redMicProUnlock':
                return <RedMicProUnlockView />;
            case 'redMicProDashboard':
                return <RedMicProDashboardView />;
            case 'wikipedia':
                return <WikipediaView />;
            case 'grammys':
                return <GrammysView />;
            case 'submitForGrammys':
                return <SubmitForGrammysView />;
            case 'createGrammyPerformance':
                return <CreateGrammyPerformanceView />;
            case 'grammyRedCarpet':
                return <GrammyRedCarpetView />;
            case 'amas':
                return <AmasView />;
            case 'submitForAmas':
                return <SubmitForAmasView />;
            case 'createAmaPerformance':
                return <CreateAmaPerformanceView />;
            case 'amaRedCarpet':
                return <AmaRedCarpetView />;
            case 'oscars':
                return <OscarsView />;
            case 'submitForOscars':
                return <SubmitForOscarsView />;
            case 'createOscarPerformance':
                return <CreateOscarPerformanceView />;
            case 'oscarRedCarpet':
                return <OscarRedCarpetView />;
            case 'switchSave':
                return <SwitchSaveView />;
            case 'redCarpetHistory':
                return <RedCarpetHistoryView />;
            case 'dating':
                return <DatingView />;
            case 'contractRenewal':
                return <ContractRenewalView />;
            case 'itunes':
                return <ITunesView />;
            case 'itunesDashboard':
                return <AppleMusicForArtistsView />;
            case 'appleMusic':
                return <AppleMusicView />;
            case 'onlyfansSetup':
                return <OnlyFansSetupView />;
            case 'onlyfans':
                return <OnlyFansView />;
            case 'createOnlyFansPost':
                return <CreateOnlyFansPostView />;
            case 'createSoundtrack':
                return <CreateSoundtrackView />;
            case 'spotifySoundtrackDetail':
                return <SpotifySoundtrackDetailView />;
            case 'gameGuide':
                return <GameGuideView />;
            case 'management':
                return <ManagementView />;
            case 'security':
                return <SecurityView />;
            case 'createVogueFeature':
                return <CreateVogueFeatureView />;
            case 'tmzArticle':
                return <TmzArticleView />;
            case 'riaa':
                return <RiaaView />;
            case 'game':
            default:
                return <GameUI />;
        }
    };

    return (
        <div className={`bg-zinc-900 text-white min-h-screen ${isGoldTheme ? 'gold-theme' : ''}`}>
            {renderView()}
            {gameState.activeEncounter && <EncounterModalView />}
        </div>
    );
};

const App: React.FC = () => {
    return (
        <GameProvider>
            <AppContent />
        </GameProvider>
    );
};

export default App;
