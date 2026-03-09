import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHeartbeat, FaLeaf, FaRainbow, FaCompass, FaRegCommentDots, FaUser } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './BottomNav.css';

const BottomNav = () => {
    const { isGuest } = useAuth();

    return (
        <nav className="bottom-nav">
            <div className="nav-logo-desktop">
                <span className="logo-dot"></span>
                <span className="logo-text">M</span>
            </div>

            <NavLink
                to="/chat/discover"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
                <FaCompass />
                <span>Discover</span>
            </NavLink>

            <NavLink
                to="/chat/chats"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
                <FaRegCommentDots />
                <span>Chats</span>
            </NavLink>


            <NavLink
                to="/chat/mood-tracker"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
                <FaHeartbeat />
                <span>Mood</span>
            </NavLink>

            <NavLink
                to="/chat/self-care"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
                <FaLeaf />
                <span>Care</span>
            </NavLink>

            <NavLink
                to="/chat/story"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
                <FaRainbow />
                <span>Story</span>
            </NavLink>

            <NavLink
                to="/chat/profile"
                className={({ isActive }) => `nav-link profile-link ${isActive ? 'active' : ''}`}
            >
                <FaUser />
                <span>{isGuest ? 'Login' : 'Profile'}</span>
            </NavLink>
        </nav>
    );
};

export default BottomNav;


