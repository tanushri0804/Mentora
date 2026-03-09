import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
    const [isGuest, setIsGuest] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check for existing token on mount
    useEffect(() => {
        const savedToken = localStorage.getItem('mentora_token');
        const savedUser = localStorage.getItem('mentora_user');
        
        if (savedToken && savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                setUser(userData);
                setToken(savedToken);
                setIsGuest(false);
            } catch (error) {
                console.error('Error parsing saved user data:', error);
                localStorage.removeItem('mentora_token');
                localStorage.removeItem('mentora_user');
            }
        }
        setLoading(false);
    }, []);

    // Save token and user to localStorage
    const saveAuthData = (userData, authToken) => {
        localStorage.setItem('mentora_token', authToken);
        localStorage.setItem('mentora_user', JSON.stringify(userData));
        setUser(userData);
        setToken(authToken);
        setIsGuest(false);
        setError(null);
    };

    // Clear auth data
    const clearAuthData = () => {
        localStorage.removeItem('mentora_token');
        localStorage.removeItem('mentora_user');
        setUser(null);
        setToken(null);
        setIsGuest(false);
        setError(null);
    };

    // Register new user
    const register = async (userData) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            saveAuthData(data.data.user, data.data.token);
            return data;
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Login user
    const login = async (credentials) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            saveAuthData(data.data.user, data.data.token);
            return data;
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Login as guest
    const loginAsGuest = () => {
        clearAuthData();
        setIsGuest(true);
        setError(null);
    };

    // Logout
    const logout = () => {
        clearAuthData();
    };

    // Get user profile
    const getProfile = async () => {
        try {
            if (!token) throw new Error('No token found');
            
            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to get profile');
            }

            setUser(data.data);
            return data;
        } catch (error) {
            setError(error.message);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ 
            isGuest, 
            user, 
            token, 
            loading, 
            error,
            register, 
            login, 
            loginAsGuest, 
            logout, 
            getProfile 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
