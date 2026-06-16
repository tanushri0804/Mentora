import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaRobot, FaCalendar, FaMapMarkerAlt, FaLink, FaUserCircle } from 'react-icons/fa';
import './PublicProfile.css';

// Premium avatars from DiceBear API (same as in Profile component)
const CATEGORIES = ['lorelei', 'adventurer', 'avataaars', 'bottts', 'notionists'];
const PREMIUM_AVATARS = CATEGORIES.flatMap(cat =>
    Array.from({ length: 12 }, (_, i) => ({
        id: `${cat}-${i + 1}`,
        name: `${cat.charAt(0).toUpperCase() + cat.slice(1)} ${i + 1}`,
        image: `https://api.dicebear.com/7.x/${cat}/svg?seed=${cat}${i + 1}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
        category: cat
    }))
);

const PublicProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        setLoading(true);
        const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_BASE}/profile/public/${username}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setProfileData(data.data);
            setError('');
          } else {
            setError(data.error || 'Failed to load profile');
          }
        } else if (response.status === 404) {
          setError('User not found');
        } else {
          setError('Failed to load profile');
        }
      } catch (error) {
        console.error('Error fetching public profile:', error);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchPublicProfile();
    }
  }, [username]);

  const handleChatWithBot = (chatbotId) => {
    navigate(`/chat/chatbot/${chatbotId}`, { replace: true });
  };

  if (loading) {
    return (
      <div className="public-profile-container">
        <div className="loading-profile">
          <div className="profile-loader"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-profile-container">
        <div className="error-profile">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back
          </button>
          <div className="error-message">
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="public-profile-container">
        <div className="error-profile">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back
          </button>
          <div className="error-message">
            <h3>Profile Not Found</h3>
            <p>This user profile could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  const { user, profile, chatbots } = profileData;
  const displayName = profile?.displayName || user.name;
  const avatarId = profile?.avatar || null;
  const interests = profile?.interests ? (typeof profile.interests === 'string' ? JSON.parse(profile.interests) : profile.interests) : [];

  // Lookup avatar image from ID
  const selectedAvatar = avatarId ? PREMIUM_AVATARS.find(a => a.id === avatarId) : null;
  const avatarImage = selectedAvatar?.image || null;

  // Debug logging
  console.log('Profile data:', profileData);
  console.log('Avatar ID:', avatarId);
  console.log('Selected avatar:', selectedAvatar);
  console.log('Avatar image:', avatarImage);

  return (
    <div className="public-profile-container">
      <div className="public-profile-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
      </div>

      <div className="public-profile-content">
        {/* Profile Section */}
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar-section">
              {avatarImage ? (
                <img 
                  src={avatarImage} 
                  alt={displayName} 
                  className="profile-avatar"
                  onError={(e) => {
                    console.log('Avatar image failed to load:', avatarImage);
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  <FaUserCircle size={80} />
                </div>
              )}
            </div>

            <div className="profile-info">
              <h1 className="profile-name">{displayName}</h1>
              <p className="profile-username">@{user.username}</p>
              
              {profile?.pronouns && (
                <p className="profile-pronouns">{profile.pronouns}</p>
              )}

              {profile?.bio && (
                <p className="profile-bio">{profile.bio}</p>
              )}
            </div>
          </div>

          <div className="profile-details">
            <div className="profile-meta">
              {profile?.location && (
                <div className="meta-item">
                  <FaMapMarkerAlt className="meta-icon" />
                  <span>{profile.location}</span>
                </div>
              )}
              
              {profile?.website && (
                <div className="meta-item">
                  <FaLink className="meta-icon" />
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="website-link">
                    {profile.website}
                  </a>
                </div>
              )}
              
              <div className="meta-item">
                <FaCalendar className="meta-icon" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {interests.length > 0 && (
              <div className="profile-interests">
                <h3>Interests</h3>
                <div className="interests-list">
                  {interests.map((interest, index) => (
                    <span key={index} className="interest-tag">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chatbots Section */}
        {chatbots.length > 0 && (
          <div className="chatbots-section">
            <h2 className="section-title">
              <FaRobot className="section-icon" />
              Public Chatbots ({chatbots.length})
            </h2>
            <div className="chatbots-grid">
              {chatbots.map((chatbot) => (
                <div 
                  key={chatbot.id} 
                  className="chatbot-card"
                  onClick={() => handleChatWithBot(chatbot.id)}
                >
                  <div className="chatbot-avatar">
                    {chatbot.avatar ? (
                      chatbot.avatar.startsWith('http') ? (
                        <img src={chatbot.avatar} alt={chatbot.name} />
                      ) : (
                        <div className="chatbot-avatar-emoji">{chatbot.avatar}</div>
                      )
                    ) : (
                      <div className="chatbot-avatar-placeholder">
                        <FaRobot />
                      </div>
                    )}
                  </div>
                  <div className="chatbot-info">
                    <h3>{chatbot.name}</h3>
                    <p>{chatbot.description}</p>
                    <div className="chatbot-stats">
                      <span className="interactions">
                        <FaRobot /> {chatbot.interactions || 0} interactions
                      </span>
                      <span className="category">{chatbot.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {chatbots.length === 0 && (
          <div className="no-chatbots">
            <FaRobot className="empty-icon" />
            <h3>No Public Chatbots</h3>
            <p>This user hasn't created any public chatbots yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;
