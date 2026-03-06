import React from 'react';
import { useNavigate } from 'react-router-dom';
import moodAvtar from '../assets/moodAvtar.png';
import dreamAvtar from '../assets/dreamAvtar.png';
import stressAvtar from '../assets/stressAvtar.png';
import './ChatList.css';

const recentChatsMock = [
    {
        id: "mood-mentor",
        name: "Mood Mentor",
        avatar: moodAvtar,
        lastMsg: "Let's work on mindfulness today...",
        time: "2m ago"
    },
    {
        id: "stress-buster",
        name: "Stress Buster",
        avatar: stressAvtar,
        lastMsg: "Deep breathing can really help right now.",
        time: "1h ago"
    },
    {
        id: "dream-weaver",
        name: "Dream Weaver",
        avatar: dreamAvtar,
        lastMsg: "Tell me about your latest dream.",
        time: "Yesterday"
    }
];

const ChatList = () => {
    const navigate = useNavigate();

    const handleOpenChat = (id) => {
        navigate(`/chat/chatbot/${id}`);
    };

    return (
        <div className="chat-list-container">
            <header className="chat-list-header">
                <h1>Recent Chats</h1>
                <p>Your mental wellness conversations</p>
            </header>

            {recentChatsMock.length > 0 ? (
                <div className="list-wrapper">
                    {recentChatsMock.map(chat => (
                        <div
                            key={chat.id}
                            className="chat-item-card"
                            onClick={() => handleOpenChat(chat.id)}
                        >
                            <img src={chat.avatar} alt={chat.name} className="chat-item-avatar" />
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
