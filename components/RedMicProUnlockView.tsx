
import React, { useState, useEffect } from 'react';
import { useGame, formatNumber } from '../context/GameContext';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import StarIcon from './icons/StarIcon';

const RedMicProUnlockView: React.FC = () => {
    const { dispatch, activeArtistData } = useGame();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    
    if (!activeArtistData) return null;
    
    const handleCodeUnlock = () => {
        setError('');
        if (code.toLowerCase() === 'chanel') {
            setShowConfirmation(true);
        } else {
            setError('Invalid secret code.');
        }
    };
    
    const confirmCodeAndNavigate = () => {
        dispatch({ type: 'UNLOCK_RED_MIC_PRO', payload: { type: 'code', cost: 0 }});
        dispatch({ type: 'CHANGE_VIEW', payload: 'redMicProDashboard' });
    };

    const handlePatreonLogin = async () => {
        try {
            setError('');
            const origin = window.location.origin;
            const response = await fetch(`/api/patreon/url?origin=${encodeURIComponent(origin)}`);
            if (!response.ok) {
                setError('Failed to get Patreon auth URL');
                return;
            }
            const { url } = await response.json();
            
            const authWindow = window.open(url, 'oauth_popup', 'width=600,height=700');
            if (!authWindow) {
                setError('Please allow popups for this site to connect Patreon.');
            }
        } catch (e) {
             setError('Error connecting to Patreon');
        }
    };

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const origin = event.origin;
            // Only allow from our app domain / localhost
            if (!origin.endsWith('.run.app') && !origin.includes('localhost') && origin !== window.location.origin) {
                return;
            }
            if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
                if (event.data.isPro) {
                    setShowConfirmation(true);
                } else {
                    setError('We found your Patreon account, but you do not have an active patron status. Please subscribe to a tier to unlock Red Mic Pro!');
                }
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const faqs = [
        {
            question: "How much is Red Mic Pro?",
            answer: "One time payment of $10.99 USD."
        },
        {
            question: "What are all the features of Red Mic Pro?",
            answer: "Red Mic Pro unlocks an infinite hype cap, limitless music video shoots, access to premium analytics to track your rise to stardom, and removes all limits on playlist generation."
        },
        {
            question: "Why does it cost that much?",
            answer: "This is a one-time purchase that supports server costs, ongoing future updates, and keeps the entire game experience completely ad-free and uninterrupted for you."
        }
    ];

    return (
        <>
            {showConfirmation && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-zinc-800 rounded-2xl shadow-lg p-8 border border-yellow-500/50 text-center">
                        <StarIcon className="w-16 h-16 text-yellow-400 mx-auto animate-pulse" />
                        <h2 className="text-2xl font-bold text-yellow-400 mt-4">Success!</h2>
                        <p className="text-zinc-300 mt-2">
                            You have successfully unlocked Red Mic Pro! You now have access to all the exclusive features.
                        </p>
                        <div className="mt-8">
                            <button
                                onClick={confirmCodeAndNavigate}
                                className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition-colors"
                            >
                                Go to Pro Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="h-screen w-full bg-zinc-900 overflow-y-auto">
                <header className="p-4 flex items-center justify-between sticky top-0 bg-zinc-900/80 backdrop-blur-sm z-10 border-b border-zinc-700/50">
                    <div className="flex items-center gap-4">
                        <button onClick={() => dispatch({type: 'CHANGE_VIEW', payload: 'game'})} className="p-2 rounded-full hover:bg-white/10">
                            <ArrowLeftIcon className="w-6 h-6" />
                        </button>
                        <h1 className="text-2xl font-bold">Red Mic Pro</h1>
                    </div>
                    <span className="bg-red-500/20 text-red-400 border border-red-500/50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Launching Soon</span>
                </header>
                <main className="p-4 max-w-2xl mx-auto space-y-6">
                    <div className="text-center py-6">
                        <StarIcon className="w-16 h-16 text-yellow-400 mx-auto" />
                        <h2 className="text-3xl font-bold mt-2">Unlock Your Potential</h2>
                        <p className="text-zinc-400 mt-2">Gain ultimate control over your career. Leaving soon, only payments will be accepted.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-zinc-800 p-4 rounded-xl border border-zinc-700/50 flex flex-col gap-4">
                            <div>
                                <h3 className="text-xl font-bold">Unlock with Patreon</h3>
                                <p className="text-zinc-400 text-sm mt-1">If you are subscribed to any Red Mic Pro tier, login to unlock.</p>
                                <button onClick={handlePatreonLogin} className="w-full mt-3 bg-[#FF424D] hover:bg-[#e03b44] text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 569 546" xmlns="http://www.w3.org/2000/svg"><g><circle cx="362.589996" cy="204.589996" r="204.589996"></circle><rect height="545.799988" width="100" x="0" y="0"></rect></g></svg>
                                    Login with Patreon
                                </button>
                            </div>

                            <div className="border-t border-zinc-700 mt-2 pt-4">
                                <h3 className="text-xl font-bold">Secret Code</h3>
                                <div className="flex gap-2 mt-3">
                                    <input type="text" value={code} onChange={e => { setCode(e.target.value); setError(''); }} placeholder="Enter code..." className="flex-grow bg-zinc-900 border border-zinc-700 p-3 rounded-lg focus:outline-none focus:border-yellow-500/50 transition-colors" />
                                    <button onClick={handleCodeUnlock} className="bg-zinc-700 hover:bg-zinc-600 font-bold px-6 rounded-lg transition-colors">Unlock</button>
                                </div>
                            </div>
                            {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
                        </div>
                    </div>
                    
                    <div className="mt-12 space-y-3">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            Frequently Asked Questions
                        </h3>
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-zinc-800 rounded-xl overflow-hidden transition-all duration-200 border border-zinc-700/50">
                                <button 
                                    className="w-full p-4 flex items-center justify-between font-medium text-left hover:bg-zinc-700/50 transition-colors" 
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                >
                                    <span className="text-zinc-100">{faq.question}</span>
                                    <svg className={`w-5 h-5 text-zinc-400 transition-transform duration-200 ${openFaq === index ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {openFaq === index && (
                                    <div className="p-4 pt-1 text-zinc-400 bg-zinc-800">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </>
    );
};

export default RedMicProUnlockView;