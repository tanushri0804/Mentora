import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext(null);

const DEFAULT_THEME = {
    name: null,
    chatBackground: '#0a0b10',
    backgroundImage: null,
    backgroundOpacity: 0.5,
    userBubbleColor: 'var(--primary-gradient)',
    botBubbleColor: 'rgba(255, 255, 255, 0.05)',
    fontSize: 'medium',
    messageStyle: 'rounded', // 'rounded', 'square'
    isCompact: false
};

export const THEME_PRESETS = {
    'Dark Night': {
        chatBackground: '#050505',
        backgroundImage: null,
        userBubbleColor: 'linear-gradient(135deg, #2a9d8f 0%, #264653 100%)',
        botBubbleColor: 'rgba(255, 255, 255, 0.03)',
        messageStyle: 'rounded'
    },
    'Ocean Blue': {
        chatBackground: '#001d3d',
        backgroundImage: 'https://images.unsplash.com/photo-1544465544-1b71aee9dfa3?auto=format&fit=crop&q=80&w=1200',
        backgroundOpacity: 0.4,
        userBubbleColor: 'linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)',
        botBubbleColor: 'rgba(0, 119, 182, 0.15)',
        messageStyle: 'rounded'
    },
    'Sunset': {
        chatBackground: '#2d1b1b',
        backgroundImage: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=1200',
        backgroundOpacity: 0.3,
        userBubbleColor: 'linear-gradient(135deg, #e76f51 0%, #f4a261 100%)',
        botBubbleColor: 'rgba(231, 111, 81, 0.15)',
        messageStyle: 'rounded'
    },
    'Minimal Light': {
        chatBackground: '#f8f9fa',
        backgroundImage: null,
        userBubbleColor: '#2a9d8f',
        botBubbleColor: '#e9ecef',
        messageStyle: 'square'
    }
};

export const BACKGROUND_IMAGES = [
    'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1502481851512-e9e2529bbbf9?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&q=80&w=800'
];

export const ThemeProvider = ({ children }) => {
    const { user, token, getProfile } = useAuth();
    const [theme, setTheme] = useState(DEFAULT_THEME);
    const [hasLoaded, setHasLoaded] = useState(false);

    // Load user preferences from profile
    useEffect(() => {
        if (user && !hasLoaded) {
            // Check if preferences exist in the user's profile array
            const profile = user.profiles && user.profiles.length > 0 ? user.profiles[0] : null;
            const preferences = profile ? profile.preferences : null;

            if (preferences) {
                try {
                    const prefs = typeof preferences === 'string' 
                        ? JSON.parse(preferences) 
                        : preferences;
                    
                    if (prefs.chatTheme) {
                        setTheme({ ...DEFAULT_THEME, ...prefs.chatTheme });
                        console.log('Loaded theme preferences from DB:', prefs.chatTheme);
                    }
                } catch (e) {
                    console.error('Error loading theme preferences:', e);
                }
            }
            setHasLoaded(true);
        }
    }, [user, hasLoaded]);

    const applyTheme = async (newTheme) => {
        setTheme(newTheme);
        
        // Save to backend if user is logged in
        if (token) {
            try {
                // Get existing preferences from the user's profile
                const profile = user?.profiles && user.profiles.length > 0 ? user.profiles[0] : null;
                let existingPrefs = {};
                
                if (profile && profile.preferences) {
                    try {
                        existingPrefs = typeof profile.preferences === 'string' 
                            ? JSON.parse(profile.preferences) 
                            : profile.preferences;
                    } catch (e) {
                        console.error('Error parsing existing preferences:', e);
                    }
                }

                const response = await fetch('http://localhost:5000/api/profile/update', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        preferences: {
                            ...existingPrefs,
                            chatTheme: newTheme
                        }
                    })
                });

                if (response.ok) {
                    console.log('Theme saved to profile successfully');
                    // Refresh user profile to keep AuthContext in sync
                    if (getProfile) {
                        getProfile();
                    }
                }
            } catch (error) {
                console.error('Failed to save theme preferences:', error);
            }
        }
    };

    const resetTheme = () => {
        applyTheme(DEFAULT_THEME);
    };

    return (
        <ThemeContext.Provider value={{ theme, applyTheme, resetTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
