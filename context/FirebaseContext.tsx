import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithGoogle, logout } from '../firebase';

interface FirebaseContextType {
    user: User | null;
    isLoading: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType>({
    user: null,
    isLoading: true,
    login: async () => {},
    logout: async () => {},
});

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async () => {
        await loginWithGoogle();
    };

    const handleLogout = async () => {
        await logout();
    };

    return (
        <FirebaseContext.Provider value={{ user, isLoading, login, logout: handleLogout }}>
            {children}
        </FirebaseContext.Provider>
    );
};
