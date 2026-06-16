import React, { useState, useEffect } from 'react';
import { FaRobot, FaComment, FaClock, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './RecentChats.css';

const RecentChats = () => {
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadRecentChats();
  }, []);

  const loadRecentChats = async () => {
    try {
      const token = localStorage.getItem('mentora_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/chat/recent', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRecentChats(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to load recent chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleChatClick = (chatbot) => {
    navigate(`/chat/chatbot/${chatbot.id}`);
  };

  if (loading) {
    return (
      <div className="recent-chats-container">
        <h3>Recent Chats</h3>
        <div className="loading-recent">Loading recent chats...</div>
      </div>
    );
  }

  if (recentChats.length === 0) {
    return (
      <div className="recent-chats-container">
        <h3>Recent Chats</h3>
        <div className="no-recent-chats">
          <FaComment className="no-chats-icon" />
          <p>No recent chats yet</p>
          <small>Start a conversation to see it here!</small>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-chats-container">
      <h3>Recent Chats</h3>
      <div className="recent-chats-list">
        {recentChats.map((chatbot) => (
          <div 
            key={chatbot.id} 
            className="recent-chat-item"
            onClick={() => handleChatClick(chatbot)}
          >
            <div className="recent-chat-avatar">
              <img 
                src={chatbot.avatar || '/assets/default-avatar.png'} 
                alt={chatbot.name}
                onError={(e) => { e.target.src = '/assets/default-avatar.png'; }}
              />
              {chatbot.isOfficial && (
                <div className="official-badge">
                  <FaRobot size={8} />
                </div>
              )}
            </div>
            
            <div className="recent-chat-info">
              <div className="recent-chat-header">
                <h4>{chatbot.name}</h4>
                <span className="chat-time">
                  <FaClock size={10} />
                  {formatTimeAgo(chatbot.lastChatAt)}
                </span>
              </div>
              
              <div className="recent-chat-meta">
                <span className="message-count">
                  <FaComment size={10} />
                  {chatbot.messageCount} messages
                </span>
                {chatbot.isOfficial ? (
                  <span className="chat-type official">Official</span>
                ) : chatbot.isPublic ? (
                  <span className="chat-type public">Public</span>
                ) : (
                  <span className="chat-type private">
                    <FaUser size={8} /> Private
                  </span>
                )}
              </div>
              
              <p className="recent-chat-desc">{chatbot.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentChats;
