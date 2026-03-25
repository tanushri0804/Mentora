import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaComment, FaPlus, FaTimes, FaLock, FaGlobe, FaRobot, FaTrash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { chatbotService } from '../services/chatbotService';
import './Discover.css';

// Premium avatars from DiceBear API (only faces)
const CATEGORIES = ['lorelei', 'adventurer', 'avataaars', 'bottts', 'notionists'];
const PREMIUM_AVATARS = CATEGORIES.flatMap(cat =>
    Array.from({ length: 12 }, (_, i) => ({
        id: `${cat}-${i + 1}`,
        name: `${cat.charAt(0).toUpperCase() + cat.slice(1)} ${i + 1}`,
        image: `https://api.dicebear.com/7.x/${cat}/svg?seed=${cat}${i + 1}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
        category: cat
    }))
);

const Discover = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [search, setSearch] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Create mentor form states
    const [mentorName, setMentorName] = useState('');
    const [mentorDesc, setMentorDesc] = useState('');
    const [mentorPersonality, setMentorPersonality] = useState('');
    const [mentorIntro, setMentorIntro] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
    const [mentorAvatar, setMentorAvatar] = useState(PREMIUM_AVATARS[0].image);
    const [mentorVisibility, setMentorVisibility] = useState('private'); // 'private' or 'public'

    // Chatbot data from API
    const [myChatbots, setMyChatbots] = useState([]);
    const [officialChatbots, setOfficialChatbots] = useState([]);
    const [publicChatbots, setPublicChatbots] = useState([]);

    // Load chatbots from API
    useEffect(() => {
        if (user) {
            loadChatbots();
        }
    }, [user]);

    const loadChatbots = async () => {
        try {
            setLoading(true);
            const [allBots, myBots] = await Promise.all([
                chatbotService.getChatbots(),
                chatbotService.getUserChatbots()
            ]);

            setMyChatbots(myBots.data || []);

            // Separate official and public chatbots
            const official = allBots.data?.filter(bot => bot.isOfficial) || [];
            const publicBots = allBots.data?.filter(bot => bot.isPublic && !bot.isOfficial) || [];

            setOfficialChatbots(official);
            setPublicChatbots(publicBots);
        } catch (error) {
            console.error('Failed to load chatbots:', error);
            setError('Failed to load chatbots. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Create new chatbot
    const handleCreateChatbot = async () => {
        if (!mentorName.trim() || !mentorDesc.trim()) {
            setError('Name and description are required');
            return;
        }

        try {
            setLoading(true);
            const systemPrompt = `You are ${mentorName}, ${mentorPersonality}. Always respond with empathy and helpful guidance.`;

            const chatbotData = {
                name: mentorName,
                description: mentorDesc,
                avatar: mentorAvatar,
                category: selectedCategory,
                isPublic: mentorVisibility === 'public',
                systemPrompt: systemPrompt,
                intro: mentorIntro || `Hello! I'm ${mentorName}. How can I help you today?`
            };

            await chatbotService.createChatbot(chatbotData);
            
            // Reset form and reload
            resetCreateForm();
            setIsCreating(false);
            loadChatbots();
            setError('');
        } catch (error) {
            console.error('Failed to create chatbot:', error);
            setError(error.message || 'Failed to create chatbot. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Delete chatbot
    const handleDeleteChatbot = async (chatbotId) => {
        if (!window.confirm('Are you sure you want to delete this chatbot?')) {
            return;
        }

        try {
            setLoading(true);
            await chatbotService.deleteChatbot(chatbotId);
            loadChatbots();
            setError('');
        } catch (error) {
            console.error('Failed to delete chatbot:', error);
            setError(error.message || 'Failed to delete chatbot. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetCreateForm = () => {
        setMentorName('');
        setMentorDesc('');
        setMentorPersonality('');
        setMentorIntro('');
        setSelectedCategory(CATEGORIES[0]);
        setMentorAvatar(PREMIUM_AVATARS[0].image);
        setMentorVisibility('private');
    };

    const handleChatWithBot = (chatbotId) => {
        navigate(`/chat/chatbot/${chatbotId}`);
    };

    // Filter chatbots based on search
    const allBots = [...officialChatbots, ...publicChatbots, ...myChatbots];
    const filtered = search.trim()
        ? allBots.filter(bot =>
            bot.name.toLowerCase().includes(search.toLowerCase()) ||
            bot.description.toLowerCase().includes(search.toLowerCase())
        )
        : null;

    // AICard component
    const AICard = ({ bot, showDelete = false }) => (
        <div 
            className="ai-card" 
            onClick={() => handleChatWithBot(bot.id)}
            style={{ cursor: 'pointer' }}
        >
            <img 
                src={bot.avatar || '/assets/default-avatar.png'} 
                alt={bot.name}
                className="ai-card-avatar"
                onError={(e) => { e.target.src = '/assets/default-avatar.png'; }}
            />
            <div className="ai-card-body">
                <div className="ai-card-top-row">
                    <h4 className="ai-card-name">{bot.name}</h4>
                    {bot.isOfficial && (
                        <span className="visibility-badge official">
                            <FaRobot size={9} /> Official
                        </span>
                    )}
                    {!bot.isPublic && !bot.isOfficial && (
                        <span className="visibility-badge private">
                            <FaLock size={9} /> Private
                        </span>
                    )}
                </div>
                <span className="ai-card-author">
                    By {bot.isOfficial ? '@mentora_official' : 'Custom Creator'}
                </span>
                <p className="ai-card-desc">{bot.description}</p>
                <div className="ai-card-footer">
                    <div className="ai-card-stats">
                        <FaComment className="stats-icon" />
                        <span>{bot.interactions || 0}</span>
                    </div>
                    {showDelete && !bot.isOfficial && (
                        <div className="card-action-btns">
                            <button
                                className="card-delete-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteChatbot(bot.id);
                                }}
                            >
                                <FaTrash size={12} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // ---- Creator View ----
    if (isCreating) {
        return (
            <div className="discover-container">
                <div className="creator-page">
                    <button className="creator-back-btn" onClick={() => { setIsCreating(false); resetCreateForm(); }}>
                        <FaTimes /> Cancel
                    </button>

                    <div className="creator-header">
                        <FaRobot className="creator-icon" />
                        <h2>Create Your AI Mentor</h2>
                        <p>Build a personalized mentor that understands you. Choose to keep it private or share with the community.</p>
                    </div>

                    <div className="creator-form">
                        <div className="creator-field">
                            <label>Mentor Name</label>
                            <input
                                type="text"
                                placeholder="e.g. My Calm Coach"
                                value={mentorName}
                                onChange={e => setMentorName(e.target.value)}
                                className="creator-input"
                            />
                        </div>

                        <div className="creator-field">
                            <label>Description</label>
                            <textarea
                                placeholder="A brief summary of what this mentor does..."
                                value={mentorDesc}
                                onChange={e => setMentorDesc(e.target.value)}
                                className="creator-input creator-textarea-sm"
                            />
                        </div>

                        <div className="creator-field">
                            <label>Behavior Details (System Prompt)</label>
                            <textarea
                                placeholder="How exactly should this ai behave? e.g. You are a professional therapist who uses humor..."
                                value={mentorPersonality}
                                onChange={e => setMentorPersonality(e.target.value)}
                                className="creator-input creator-textarea"
                            />
                        </div>

                        <div className="creator-field">
                            <label>Intro Message</label>
                            <textarea
                                placeholder="What should the mentor say first? e.g. Hello! I'm Shinee. How are you feeling today?"
                                value={mentorIntro}
                                onChange={e => setMentorIntro(e.target.value)}
                                className="creator-input creator-textarea-sm"
                            />
                        </div>

                        <div className="creator-field">
                            <label>Choose Avatar</label>
                            <div className="creator-avatar-section">
                                <div className="avatar-category-tabs">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                                            onClick={() => setSelectedCategory(cat)}
                                        >
                                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                        </button>
                                    ))}
                                </div>
                                <div className="creator-avatar-grid">
                                    {PREMIUM_AVATARS.filter(a => a.category === selectedCategory).map(avatar => (
                                        <div
                                            key={avatar.id}
                                            className={`creator-avatar-option ${mentorAvatar === avatar.image ? 'selected' : ''}`}
                                            onClick={() => setMentorAvatar(avatar.image)}
                                        >
                                            <img src={avatar.image} alt={avatar.name} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="creator-field">
                            <label>Visibility</label>
                            <div className="visibility-toggle">
                                <button
                                    className={`vis-btn ${mentorVisibility === 'private' ? 'active' : ''}`}
                                    onClick={() => setMentorVisibility('private')}
                                >
                                    <FaLock size={12} />
                                    <div>
                                        <strong>Private</strong>
                                        <span>Only you can talk to this mentor</span>
                                    </div>
                                </button>
                                <button
                                    className={`vis-btn ${mentorVisibility === 'public' ? 'active' : ''}`}
                                    onClick={() => setMentorVisibility('public')}
                                >
                                    <FaGlobe size={12} />
                                    <div>
                                        <strong>Public</strong>
                                        <span>Anyone in the community can discover & chat</span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <button className="creator-submit" onClick={handleCreateChatbot}>
                            <FaPlus size={14} /> Create Chatbot
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ---- Main Discover View ----
    return (
        <div className="discover-container">
            {/* Error Display */}
            {error && (
                <div className="error-message" style={{
                    backgroundColor: '#ff4757',
                    color: 'white',
                    padding: '10px',
                    margin: '10px',
                    borderRadius: '5px',
                    textAlign: 'center'
                }}>
                    {error}
                    <button 
                        onClick={() => setError('')}
                        style={{ marginLeft: '10px', background: 'none', border: 'none', color: 'white' }}
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Loading Display */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    Loading chatbots...
                </div>
            )}

            {/* Header */}
            <header className="discover-header">
                <div className="welcome-text">
                    <p className="welcome-greeting">Welcome back,</p>
                    <h1 className="welcome-name">{user?.name || 'Explorer'}</h1>
                </div>
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    <div className="search-bar-container">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search companions..."
                            className="search-input"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="create-mentor-btn" onClick={() => setIsCreating(true)}>
                        <FaPlus size={12} /> Create
                    </button>
                </div>
            </header>

            {filtered ? (
                <section>
                    <h3 className="section-title">Search Results</h3>
                    {filtered.length === 0 ? (
                        <div className="no-results">No companions match your search.</div>
                    ) : (
                        <div className="ai-card-scroll">
                            {filtered.map(bot => <AICard key={bot.id} bot={bot} />)}
                        </div>
                    )}
                </section>
            ) : (
                <>
                    {/* My Chatbots */}
                    {myChatbots.length > 0 && (
                        <section>
                            <h3 className="section-title">My Chatbots</h3>
                            <div className="ai-card-scroll">
                                {myChatbots.map(bot => <AICard key={bot.id} bot={bot} showDelete />)}
                            </div>
                        </section>
                    )}

                    {/* Official Mentors */}
                    {officialChatbots.length > 0 && (
                        <section>
                            <h3 className="section-title">Official Mentors</h3>
                            <div className="ai-card-scroll">
                                {officialChatbots.map(bot => <AICard key={bot.id} bot={bot} />)}
                            </div>
                        </section>
                    )}

                    {/* Public Chatbots */}
                    {publicChatbots.length > 0 && (
                        <section>
                            <h3 className="section-title">Community Chatbots</h3>
                            <div className="ai-card-scroll">
                                {publicChatbots.map(bot => <AICard key={bot.id} bot={bot} />)}
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    );
};

export default Discover;
