import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaCamera, FaFireAlt, FaRegComments, FaHeartbeat, FaSignOutAlt, FaBell, FaMoon, FaLock, FaSignInAlt, FaEdit, FaMapMarkerAlt, FaGlobe, FaPalette, FaSave, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Profile.css';
import './ProfileEnhanced.css';

// List of premium avatars from DiceBear API (60 total: 12 per category)
const CATEGORIES = ['lorelei', 'adventurer', 'avataaars', 'bottts', 'notionists'];
const PREMIUM_AVATARS = CATEGORIES.flatMap(cat =>
    Array.from({ length: 12 }, (_, i) => ({
        id: `${cat}-${i + 1}`,
        name: `${cat.charAt(0).toUpperCase() + cat.slice(1)} ${i + 1}`,
        image: `https://api.dicebear.com/7.x/${cat}/svg?seed=${cat}${i + 1}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
        category: cat
    }))
);

const Profile = () => {
    const navigate = useNavigate();
    const { isGuest, user, logout, token } = useAuth();
    const [themeDark, setThemeDark] = useState(true);
    const [notifications, setNotifications] = useState(true);
    const [privateMode, setPrivateMode] = useState(false);

    // Profile editing states
    const [isEditing, setIsEditing] = useState(false);
    const [editType, setEditType] = useState('profile'); // 'avatar' or 'profile'
    const [selectedAvatarCategory, setSelectedAvatarCategory] = useState('lorelei');
    const [profileData, setProfileData] = useState({
        displayName: '',
        avatar: 'premium-1',
        pronouns: '',
        bio: '',
        location: '',
        website: '',
        interests: [],
        moodColor: 'blue'
    });

    // Available options
    const [profileOptions, setProfileOptions] = useState({
        avatars: PREMIUM_AVATARS,
        pronouns: [
            { value: 'he/him', label: 'he/him' },
            { value: 'she/her', label: 'she/her' },
            { value: 'they/them', label: 'they/them' },
            { value: 'rather not say', label: 'rather not say' }
        ],
        interests: ['Meditation', 'Journaling', 'Yoga', 'Reading', 'Nature', 'Music', 'Art', 'Fitness'],
        moodColors: [
            { value: 'blue', label: 'Calm Blue', color: '#4a90e2' },
            { value: 'green', label: 'Heal Green', color: '#2a9d8f' },
            { value: 'purple', label: 'Zen Purple', color: '#9b59b6' },
            { value: 'orange', label: 'Enthusiast', color: '#e67e22' }
        ]
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user && !isGuest) {
            fetchProfileOptions();
            loadUserProfile();
        }
    }, [user, isGuest]);

    // Save profile data to localStorage whenever it changes
    useEffect(() => {
        if (profileData.displayName || profileData.avatar !== 'premium-1') {
            localStorage.setItem('mentora_profile', JSON.stringify(profileData));
        }
    }, [profileData]);

    // Load profile data from localStorage on mount
    useEffect(() => {
        const savedProfile = localStorage.getItem('mentora_profile');
        if (savedProfile) {
            try {
                const parsed = JSON.parse(savedProfile);
                setProfileData(prev => ({ ...prev, ...parsed }));
            } catch (error) {
                console.error('Failed to parse saved profile:', error);
            }
        }
    }, []);

    const fetchProfileOptions = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/profile/options');
            const data = await response.json();
            if (data.success) {
                setProfileOptions({
                    ...data.data,
                    // Prepend premium avatars to the list
                    avatars: [...PREMIUM_AVATARS, ...(data.data.avatars || [])]
                });
            }
        } catch (error) {
            console.error('Failed to fetch profile options:', error);
            // On error, we still have our default premium ones
        }
    };

    const loadUserProfile = async () => {
        try {
            console.log('Loading user profile...');
            const response = await fetch('http://localhost:5000/api/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            console.log('Profile response:', data);

            if (data.success && data.data.profile) {
                const profile = data.data.profile;
                console.log('Setting profile data:', profile);
                setProfileData({
                    displayName: profile.displayName || user?.name || '',
                    avatar: profile.avatar || 'premium-1', // Default to premium-1 if no avatar
                    pronouns: profile.pronouns || '',
                    bio: profile.bio || '',
                    location: profile.location || '',
                    website: profile.website || '',
                    interests: profile.interests || [],
                    moodColor: profile.moodColor || 'blue'
                });
            } else if (data.success && !data.data.profile) {
                // No profile exists, set defaults
                console.log('No profile found, setting defaults');
                setProfileData({
                    displayName: user?.name || '',
                    avatar: 'premium-1',
                    pronouns: '',
                    bio: '',
                    location: '',
                    website: '',
                    interests: [],
                    moodColor: 'blue'
                });
            }
        } catch (error) {
            console.error('Failed to load profile:', error);
            // On error, set defaults
            setProfileData({
                displayName: user?.name || '',
                avatar: 'premium-1',
                pronouns: '',
                bio: '',
                location: '',
                website: '',
                interests: [],
                moodColor: 'blue'
            });
        }
    };

    const handleSaveProfile = async () => {
        try {
            setLoading(true);
            setError('');
            setSuccess('');

            const response = await fetch('http://localhost:5000/api/profile/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Profile updated successfully!');
                setIsEditing(false);
                // Clear localStorage after successful save to ensure fresh data from backend
                localStorage.removeItem('mentora_profile');
            } else {
                setError(data.message || 'Failed to update profile');
            }
        } catch (error) {
            setError('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleLogin = () => {
        navigate('/login');
    };

    const toggleInterest = (interest) => {
        setProfileData(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }));
    };

    if (isGuest) {
        return (
            <div className="profile-container">
                <header className="profile-header">
                    <h1>Profile</h1>
                    <p>Unlock the full potential of Mentora</p>
                </header>

                <div className="guest-login-card fade-in-up">
                    <div className="guest-icon-wrapper">
                        <FaUser size={40} />
                    </div>
                    <h2>You're using Mentora as a Guest</h2>
                    <p>Log in or sign up to customize your profile, track your mood over time, keep your chats persistent across devices, and get personalized wellness insights.</p>
                    <button className="profile-login-btn" onClick={handleLogin}>
                        <FaSignInAlt /> Log In / Sign Up
                    </button>
                </div>

                <div className="settings-section disabled fade-in-up" style={{ animationDelay: '0.2s', opacity: 0.6, pointerEvents: 'none' }}>
                    <div className="overlay-badge">Logged-in only</div>
                    <h3>App Settings</h3>
                    <div className="setting-item">
                        <div className="setting-info">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaMoon style={{ color: 'var(--text-muted)' }} />
                                <h4>Dark Mode</h4>
                            </div>
                        </div>
                        <div className="toggle-switch active"><div className="toggle-knob"></div></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <header className="profile-header">
                <h1>Profile</h1>
                <p>Manage your account and preferences</p>
            </header>

            {/* Profile Card */}
            <div className="profile-card">
                <div className="profile-avatar-wrapper">
                    <div className="profile-avatar">
                        {profileData.avatar ?
                            (() => {
                                const selectedAvatar = profileOptions.avatars.find(a => a.id === profileData.avatar);
                                return (
                                    <>
                                        {selectedAvatar?.image ? (
                                            <img
                                                src={selectedAvatar.image}
                                                alt={selectedAvatar.name}
                                                className="profile-avatar-image"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'block';
                                                }}
                                            />
                                        ) : null}
                                        <span
                                            className="profile-avatar-emoji"
                                            style={{ display: selectedAvatar?.image ? 'none' : 'block' }}
                                        >
                                            {selectedAvatar?.emoji || <FaUser />}
                                        </span>
                                    </>
                                );
                            })()
                            : <FaUser />
                        }
                    </div>
                    {!isEditing && (
                        <button className="edit-avatar-btn" onClick={() => { setEditType('avatar'); setIsEditing(true); }}>
                            <FaCamera size={14} />
                        </button>
                    )}
                </div>
                <div className="profile-info">
                    <h2>{profileData.displayName || user?.name || 'Seeker 732'}</h2>
                    {profileData.pronouns && <p className="profile-pronouns">{profileData.pronouns}</p>}
                    {profileData.bio && <p className="profile-bio">{profileData.bio}</p>}
                </div>
                {!isEditing && (
                    <button className="edit-profile-icon-btn" onClick={() => { setEditType('profile'); setIsEditing(true); }} title="Edit Profile">
                        <FaEdit />
                    </button>
                )}
                <div className="profile-joined-date">
                    Joined March 2026
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditing && (
                <div className="profile-edit-modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editType === 'avatar' ? 'Change Avatar' : 'Edit Profile'}</h3>
                            <button className="close-btn" onClick={() => setIsEditing(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="modal-body">
                            {/* Avatar Selection View */}
                            {editType === 'avatar' && (
                                <div className="form-section">
                                    <label>Choose your appearance</label>

                                    <div className="avatar-category-tabs">
                                        {CATEGORIES.map(cat => (
                                            <button
                                                key={cat}
                                                className={`category-tab ${selectedAvatarCategory === cat ? 'active' : ''}`}
                                                onClick={() => setSelectedAvatarCategory(cat)}
                                            >
                                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="avatar-grid">
                                        {profileOptions.avatars.filter(a => a.category === selectedAvatarCategory).length > 0 ? (
                                            profileOptions.avatars.filter(a => a.category === selectedAvatarCategory).map(avatar => (
                                                <button
                                                    key={avatar.id}
                                                    className={`avatar-option ${profileData.avatar === avatar.id ? 'selected' : ''}`}
                                                    onClick={() => setProfileData(prev => ({ ...prev, avatar: avatar.id }))}
                                                >
                                                    {avatar.image ? (
                                                        <img
                                                            src={avatar.image}
                                                            alt={avatar.name}
                                                            className="avatar-image"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'block';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <span
                                                        className="avatar-emoji"
                                                        style={{ display: avatar.image ? 'none' : 'block' }}
                                                    >
                                                        {avatar.emoji || '👤'}
                                                    </span>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="no-options">No avatars available in this category</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Profile Details View */}
                            {editType === 'profile' && (
                                <>
                                    <div className="form-section">
                                        <label>Display Name</label>
                                        <input
                                            type="text"
                                            value={profileData.displayName}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                                            placeholder="How should we call you?"
                                        />
                                    </div>

                                    <div className="form-section">
                                        <label>Pronouns</label>
                                        <select
                                            value={profileData.pronouns}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, pronouns: e.target.value }))}
                                        >
                                            <option value="">Select pronouns</option>
                                            {profileOptions.pronouns.map(pronoun => (
                                                <option key={pronoun.value} value={pronoun.value}>
                                                    {pronoun.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-section">
                                        <label>Bio</label>
                                        <textarea
                                            value={profileData.bio}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                                            placeholder="Tell us about yourself..."
                                            rows={3}
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-section">
                                            <label><FaMapMarkerAlt /> Location</label>
                                            <input
                                                type="text"
                                                value={profileData.location}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                                                placeholder="City, Country"
                                            />
                                        </div>
                                        <div className="form-section">
                                            <label><FaGlobe /> Website</label>
                                            <input
                                                type="url"
                                                value={profileData.website}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                                                placeholder="https://yourwebsite.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-section">
                                        <label>Interests</label>
                                        <div className="interests-grid">
                                            {profileOptions.interests.map(interest => (
                                                <button
                                                    key={interest}
                                                    type="button"
                                                    className={`interest-tag ${profileData.interests.includes(interest) ? 'selected' : ''}`}
                                                    onClick={() => toggleInterest(interest)}
                                                >
                                                    {interest}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="form-section">
                                        <label><FaPalette /> Mood Theme Color</label>
                                        <div className="color-options">
                                            {profileOptions.moodColors.map(color => (
                                                <button
                                                    key={color.value}
                                                    className={`color-option ${profileData.moodColor === color.value ? 'selected' : ''}`}
                                                    style={{ backgroundColor: color.color }}
                                                    onClick={() => setProfileData(prev => ({ ...prev, moodColor: color.value }))}
                                                >
                                                    {color.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {error && <div className="error-message">{error}</div>}
                            {success && <div className="success-message">{success}</div>}
                        </div>

                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                                Cancel
                            </button>
                            <button
                                className="save-btn"
                                onClick={handleSaveProfile}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : (
                                    <>
                                        <FaSave /> {editType === 'avatar' ? 'Save Avatar' : 'Save Profile'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="profile-stats-grid">
                <div className="stat-card fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <FaFireAlt className="stat-icon" />
                    <h3 className="stat-value">14</h3>
                    <p className="stat-label">Day Streak</p>
                </div>
                <div className="stat-card fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <FaRegComments className="stat-icon" />
                    <h3 className="stat-value">32</h3>
                    <p className="stat-label">Conversations</p>
                </div>
                <div className="stat-card fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <FaHeartbeat className="stat-icon" />
                    <h3 className="stat-value">Stable</h3>
                    <p className="stat-label">Mood Trend</p>
                </div>
            </div>

            {/* Settings */}
            <div className="settings-section fade-in-up" style={{ animationDelay: '0.4s' }}>
                <h3>App Settings</h3>

                <div className="setting-item">
                    <div className="setting-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaBell style={{ color: 'var(--text-muted)' }} />
                            <h4>Daily Reminders</h4>
                        </div>
                        <p>Get notified for your daily check-ins</p>
                    </div>
                    <div
                        className={`toggle-switch ${notifications ? 'active' : ''}`}
                        onClick={() => setNotifications(!notifications)}
                    >
                        <div className="toggle-knob"></div>
                    </div>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaMoon style={{ color: 'var(--text-muted)' }} />
                            <h4>Dark Mode</h4>
                        </div>
                        <p>Toggle dark or light theme</p>
                    </div>
                    <div
                        className={`toggle-switch ${themeDark ? 'active' : ''}`}
                        onClick={() => setThemeDark(!themeDark)}
                    >
                        <div className="toggle-knob"></div>
                    </div>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaLock style={{ color: 'var(--text-muted)' }} />
                            <h4>Private Mode</h4>
                        </div>
                        <p>Hide chat content when multitasking</p>
                    </div>
                    <div
                        className={`toggle-switch ${privateMode ? 'active' : ''}`}
                        onClick={() => setPrivateMode(!privateMode)}
                    >
                        <div className="toggle-knob"></div>
                    </div>
                </div>
            </div>

            <div className="logout-btn-wrapper fade-in-up" style={{ animationDelay: '0.5s' }}>
                <button className="logout-btn" onClick={handleLogout}>
                    <FaSignOutAlt />
                    Log Out
                </button>
            </div>
        </div>
    );
};

export default Profile;
