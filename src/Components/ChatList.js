import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatList.css';

const ChatList = () => {
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
                    // Transform data to match original UI format
                    const formattedChats = data.data.map(chatbot => ({
                        id: chatbot.id,
                        name: chatbot.name,
                        avatar: chatbot.avatar || '/assets/default-avatar.png',
                        lastMsg: chatbot.description || 'Start a conversation...',
                        time: formatTimeAgo(chatbot.lastChatAt),
                        interactions: chatbot.interactions || 0
                    }));
                    setRecentChats(formattedChats);
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

    const handleOpenChat = (id) => {
        navigate(`/chat/chatbot/${id}`);
    };

    if (loading) {
        return (
            <div className="chat-list-container">
                <header className="chat-list-header">
                    <h1>Recent Chats</h1>
                    <p>Your mental wellness conversations</p>
                </header>
                <div className="empty-state">
                    <h3>Loading chats...</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-list-container">
            <header className="chat-list-header">
                <h1>Recent Chats</h1>
                <p>Your mental wellness conversations</p>
            </header>

            {recentChats.length > 0 ? (
                <div className="list-wrapper">
                    {recentChats.map(chat => (
                        <div
                            key={chat.id}
                            className="chat-item-card"
                            onClick={() => handleOpenChat(chat.id)}
                        >
                            <img 
                                src={chat.avatar} 
                                alt={chat.name} 
                                className="chat-item-avatar"
                                onError={(e) => { e.target.src = '/assets/default-avatar.png'; }}
                            />
                            <div className="chat-item-info">
                                <h3>{chat.name}</h3>
                                <p className="chat-item-last-msg">{chat.lastMsg}</p>
                            </div>
                            <div className="chat-item-meta">
                                <span className="chat-item-time">{chat.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <h3>No chats yet</h3>
                    <p>Explore our mental companions to start a conversation.</p>
                    <button className="start-btn" onClick={() => navigate('/chat/discover')}>
                        Explore AIs
                    </button>
                </div>
            )}
        </div>
    );
};

export default ChatList;
