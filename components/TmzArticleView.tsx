import React from 'react';
import { useGame } from '../context/GameContext';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

const TmzArticleView: React.FC = () => {
    const { gameState, dispatch } = useGame();
    const post = gameState.activeTmzPost;

    if (!post) {
        return null;
    }

    const { content, image } = post;
    const authorId = post.authorId;

    if (authorId !== 'tmz') {
        return null;
    }

    const handleBack = () => {
        dispatch({ type: 'CHANGE_VIEW', payload: 'x' });
        dispatch({ type: 'SET_ACTIVE_TMZ_POST', payload: null });
    };

    return (
        <div className="bg-white text-black min-h-screen">
            <header className="flex items-center justify-between p-4 border-b border-gray-200">
                <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeftIcon className="w-6 h-6 " />
                </button>
                <div className="font-black text-red-600 text-3xl tracking-tighter">TMZ</div>
                <div className="w-10"></div>
            </header>

            <main className="max-w-2xl mx-auto p-4 space-y-6">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-4 whitespace-pre-wrap">{content.toUpperCase()}</h1>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6 font-bold uppercase">
                        <span className="text-red-600">Exclusive</span>
                        <span>|</span>
                        <span>TMZ Staff</span>
                        <span>|</span>
                        <span>Week {post.date.week}, {post.date.year}</span>
                    </div>
                </div>

                {image && (
                    <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img src={image} alt="TMZ Article" className="w-full h-full object-cover" />
                    </div>
                )}

                <div className="prose prose-lg max-w-none">
                    <p className="text-xl font-medium leading-relaxed">
                        Sources tell us that {content}
                    </p>
                    <p>
                        Our cameras caught the action exclusive, what do you think? Big news coming from the team! Things are looking crazy!
                    </p>
                </div>
            </main>
        </div>
    );
};

export default TmzArticleView;
