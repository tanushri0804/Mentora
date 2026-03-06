import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaCamera, FaFireAlt, FaRegComments, FaHeartbeat, FaSignOutAlt, FaBell, FaMoon, FaLock } from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const [themeDark, setThemeDark] = useState(true);
    const [notifications, setNotifications] = useState(true);
    const [privateMode, setPrivateMode] = useState(false);

    const handleLogout = () => {
        // Basic logout handling
        navigate('/login');
    };

    return (
        <div className="profile-container">
            <header className="profile-header">
                <h1>Profile</h1>
                <p>Manage your account and preferences</p>
            </header>

            <div className="profile-card">
                <div className="profile-avatar-wrapper">
                    <div className="profile-avatar">
                        <FaUser />
                    </div>
                    <button className="edit-avatar-btn">
                        <FaCamera size={14} />
                    </button>
                </div>
                <div className="profile-info">
                    <h2>Seeker 732</h2>
                    <p>Joined March 2026 • Premium Member</p>
                </div>
            </div>

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
