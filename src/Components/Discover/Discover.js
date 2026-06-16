import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaComment, FaPlus, FaTimes, FaLock, FaGlobe, FaRobot, FaTrash, FaEdit } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import LoginRequiredModal from '../LoginRequiredModal/LoginRequiredModal';
import { chatbotService } from '../../services/chatbotService';
import './Discover.css';

// Premium avatars from DiceBear API
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
    const { user, isGuest } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [search, setSearch] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [editingBot, setEditingBot] = useState(null); // bot object being edited
    const [loading, setLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState('');
    const introTextareaRef = useRef(null);

    // Form states (shared for create + edit)
    const [mentorName, setMentorName] = useState('');
    const [mentorDesc, setMentorDesc] = useState('');
    const [mentorPersonality, setMentorPersonality] = useState('');
    const [mentorIntro, setMentorIntro] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
    const [mentorAvatar, setMentorAvatar] = useState(PREMIUM_AVATARS[0].image);
    const [mentorVisibility, setMentorVisibility] = useState('private');

    // Chatbot data
    const [myChatbots, setMyChatbots] = useState([]);
    const [officialChatbots, setOfficialChatbots] = useState([]);
    const [publicChatbots, setPublicChatbots] = useState([]);

    useEffect(() => {
        loadChatbots();
    }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadChatbots = async () => {
        try {
            setLoading(true);
            const allBots = await chatbotService.getChatbots();

            let myBots = { data: [] };
            if (user) {
                try {
                    myBots = await chatbotService.getUserChatbots();
                } catch (err) {
                    console.warn('Could not load user chatbots:', err.message || err);
                }
            }

            const myBotIds = new Set((myBots.data || []).map(b => b.id));
            setMyChatbots(myBots.data || []);

            const official = allBots.data?.filter(bot => bot.isOfficial) || [];
            // Exclude my own bots from public section to avoid duplicates
            const publicBots = allBots.data?.filter(bot => bot.isPublic && !bot.isOfficial && !myBotIds.has(bot.id)) || [];

            setOfficialChatbots(official);
            setPublicChatbots(publicBots);
        } catch (err) {
            console.error('Failed to load chatbots:', err);
            setError('Failed to load chatbots. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setMentorName('');
        setMentorDesc('');
        setMentorPersonality('');
        setMentorIntro('');
        setSelectedCategory(CATEGORIES[0]);
        setMentorAvatar(PREMIUM_AVATARS[0].image);
        setMentorVisibility('private');
    };

    const openCreate = () => {
        if (isGuest) { setShowAuthModal(true); return; }
        resetForm();
        setEditingBot(null);
        setIsCreating(true);
        setError('');
    };

    const openEdit = (bot, e) => {
        e.stopPropagation();
        resetForm();
        setEditingBot(bot);
        setMentorName(bot.name || '');
        setMentorDesc(bot.description || '');
        setMentorPersonality(bot.systemPrompt || '');
        setMentorIntro(bot.intro || '');
        setMentorAvatar(bot.avatar || PREMIUM_AVATARS[0].image);
        setMentorVisibility(bot.isPublic ? 'public' : 'private');
        // detect category from avatar URL
        const matchedCat = CATEGORIES.find(cat => bot.avatar?.includes(`/${cat}/`));
        setSelectedCategory(matchedCat || CATEGORIES[0]);
        setIsCreating(true);
        setError('');
    };

    const closeForm = () => {
        setIsCreating(false);
        setEditingBot(null);
        resetForm();
        setError('');
    };

    // Create OR Update
    const handleSubmitForm = async () => {
        if (isGuest) { setShowAuthModal(true); return; }
        if (!mentorName.trim() || !mentorDesc.trim()) {
            setError('Name and description are required');
            return;
        }

        try {
            setFormLoading(true);
            setError('');
            const systemPrompt = mentorPersonality.trim()
                ? `You are ${mentorName}, ${mentorPersonality}. Always respond with empathy and helpful guidance.`
                : `You are ${mentorName}. Always respond with empathy and helpful guidance.`;

            const chatbotData = {
                name: mentorName,
                description: mentorDesc,
                avatar: mentorAvatar,
                category: selectedCategory,
                isPublic: mentorVisibility === 'public',
                systemPrompt,
                intro: mentorIntro || `Hello! I'm ${mentorName}. How can I help you today?`
            };

            if (editingBot) {
                await chatbotService.updateChatbot(editingBot.id, chatbotData);
            } else {
                await chatbotService.createChatbot(chatbotData);
            }

            closeForm();
            loadChatbots();
        } catch (err) {
            console.error('Failed to save chatbot:', err);
            setError(err.message || 'Failed to save chatbot. Please try again.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteChatbot = async (chatbotId, e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this chatbot?')) return;
        try {
            setLoading(true);
            await chatbotService.deleteChatbot(chatbotId);
            loadChatbots();
            setError('');
        } catch (err) {
            console.error('Failed to delete chatbot:', err);
            setError(err.message || 'Failed to delete chatbot.');
        } finally {
            setLoading(false);
        }
    };

    const insertToken = (token) => {
        const el = introTextareaRef.current;
        if (!el) return;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const newVal = mentorIntro.slice(0, start) + token + mentorIntro.slice(end);
        setMentorIntro(newVal);
        setTimeout(() => {
            el.focus();
            el.selectionStart = start + token.length;
            el.selectionEnd = start + token.length;
        }, 0);
    };

    const handleChatWithBot = (chatbotId) => navigate(`/chat/chatbot/${chatbotId}`);

    // Deduplicate search results
    const allBots = [...officialChatbots, ...myChatbots, ...publicChatbots];
    const filtered = search.trim()
        ? allBots.filter(bot =>
            bot.name.toLowerCase().includes(search.toLowerCase()) ||
            bot.description.toLowerCase().includes(search.toLowerCase())
        )
        : null;

    // ── AI Card ─────────────────────────────────────────────────────────
    const AICard = ({ bot, isOwned = false }) => (
        <div className="ai-card" onClick={() => handleChatWithBot(bot.id)}>
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
                        <span className="visibility-badge official"><FaRobot size={9} /> Official</span>
                    )}
                    {!bot.isOfficial && bot.isPublic && (
                        <span className="visibility-badge public"><FaGlobe size={9} /> Public</span>
                    )}
                    {!bot.isOfficial && !bot.isPublic && (
                        <span className="visibility-badge private"><FaLock size={9} /> Private</span>
                    )}
                </div>
                <span className="ai-card-author">
                    By {bot.isOfficial ? '@mentora_official' : (
                        bot.user?.username
                            ? <span className="creator-link" onClick={(e) => { e.stopPropagation(); navigate(`/profile/${bot.user.username}`); }}>{bot.user.name || bot.user.username}</span>
                            : (bot.user?.name || 'Custom Creator')
                    )}
                </span>
                <p className="ai-card-desc">{bot.description}</p>
                <div className="ai-card-footer">
                    <div className="ai-card-stats">
                        <FaComment className="stats-icon" />
                        <span>{bot.interactions || 0}</span>
                    </div>
                    {isOwned && !bot.isOfficial && (
                        <div className="card-action-btns">
                            <button className="card-edit-btn" title="Edit" onClick={(e) => openEdit(bot, e)}>
                                <FaEdit size={12} />
                            </button>
                            <button className="card-delete-btn" title="Delete" onClick={(e) => handleDeleteChatbot(bot.id, e)}>
                                <FaTrash size={12} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // ── Create / Edit Form ───────────────────────────────────────────────
    if (isCreating) {
        return (
            <div className="discover-container">
                <div className="creator-page">
                    <button className="creator-back-btn" onClick={closeForm}>
                        <FaTimes /> Cancel
                    </button>

                    <div className="creator-header">
                        <FaRobot className="creator-icon" />
                        <h2>{editingBot ? 'Edit Your AI Mentor' : 'Create Your AI Mentor'}</h2>
                        <p>{editingBot ? 'Update your mentor\'s details below.' : 'Build a personalized mentor that understands you.'}</p>
                    </div>

                    {error && (
                        <div className="form-error-banner">
                            {error}
                            <button onClick={() => setError('')}>×</button>
                        </div>
                    )}

                    <div className="creator-form">
                        {/* Name */}
                        <div className="creator-field">
                            <label>Mentor Name</label>
                            <input type="text" placeholder="e.g. My Calm Coach" value={mentorName}
                                onChange={e => setMentorName(e.target.value)} className="creator-input" />
                        </div>

                        {/* Description */}
                        <div className="creator-field">
                            <label>Description</label>
                            <textarea placeholder="A brief summary of what this mentor does..." value={mentorDesc}
                                onChange={e => setMentorDesc(e.target.value)} className="creator-input creator-textarea-sm" />
                        </div>

                        {/* System Prompt */}
                        <div className="creator-field">
                            <label>Behavior Details (System Prompt)</label>
                            <textarea placeholder="How exactly should this AI behave? e.g. You are a professional therapist who uses humor..."
                                value={mentorPersonality} onChange={e => setMentorPersonality(e.target.value)}
                                className="creator-input creator-textarea" />
                        </div>

                        {/* Intro with {{user}} token */}
                        <div className="creator-field">
                            <label>Intro Message</label>
                            <div className="intro-field-wrapper">
                                <textarea
                                    ref={introTextareaRef}
                                    id="mentor-intro-textarea"
                                    placeholder={`What should the mentor say first? e.g. Hello {{user}}! I'm ${mentorName || 'Shinee'}. How are you feeling today?`}
                                    value={mentorIntro}
                                    onChange={e => setMentorIntro(e.target.value)}
                                    className="creator-input creator-textarea-sm"
                                />
                                <div className="intro-token-bar">
                                    <span className="intro-token-hint">Insert variable:</span>
                                    <button type="button" className="intro-token-chip"
                                        title="Replaced with the user's name at chat time"
                                        onClick={() => insertToken('{{user}}')}>
                                        👤 &#123;&#123;user&#125;&#125;
                                    </button>
                                    <span className="intro-token-example">→ replaced with the user's name at chat time</span>
                                </div>
                            </div>
                        </div>

                        {/* Avatar */}
                        <div className="creator-field">
                            <label>Choose Avatar</label>
                            <div className="creator-avatar-section">
                                <div className="avatar-category-tabs">
                                    {CATEGORIES.map(cat => (
                                        <button key={cat}
                                            className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                                            onClick={() => setSelectedCategory(cat)}>
                                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                        </button>
                                    ))}
                                </div>
                                <div className="creator-avatar-grid">
                                    {PREMIUM_AVATARS.filter(a => a.category === selectedCategory).map(avatar => (
                                        <div key={avatar.id}
                                            className={`creator-avatar-option ${mentorAvatar === avatar.image ? 'selected' : ''}`}
                                            onClick={() => setMentorAvatar(avatar.image)}>
                                            <img src={avatar.image} alt={avatar.name} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Visibility */}
                        <div className="creator-field">
                            <label>Visibility</label>
                            <div className="visibility-toggle">
                                <button className={`vis-btn ${mentorVisibility === 'private' ? 'active' : ''}`}
                                    onClick={() => setMentorVisibility('private')}>
                                    <FaLock size={12} />
                                    <div><strong>Private</strong><span>Only you can talk to this mentor</span></div>
                                </button>
                                <button className={`vis-btn ${mentorVisibility === 'public' ? 'active' : ''}`}
                                    onClick={() => setMentorVisibility('public')}>
                                    <FaGlobe size={12} />
                                    <div><strong>Public</strong><span>Anyone in the community can discover & chat</span></div>
                                </button>
                            </div>
                        </div>

                        <button className="creator-submit" onClick={handleSubmitForm} disabled={formLoading}>
                            {formLoading
                                ? <span className="creator-spinner"></span>
                                : <>{editingBot ? <><FaEdit size={14} /> Save Changes</> : <><FaPlus size={14} /> Create Chatbot</>}</>
                            }
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Main Discover View ───────────────────────────────────────────────
    return (
        <div className="discover-container">
            {error && (
                <div className="error-message" style={{ backgroundColor: '#ff4757', color: 'white', padding: '10px', margin: '10px', borderRadius: '5px', textAlign: 'center' }}>
                    {error}
                    <button onClick={() => setError('')} style={{ marginLeft: '10px', background: 'none', border: 'none', color: 'white' }}>×</button>
                </div>
            )}

            {loading && <div style={{ textAlign: 'center', padding: '20px' }}>Loading chatbots...</div>}

            <header className="discover-header">
                <div className="welcome-text">
                    <p className="welcome-greeting">Welcome back,</p>
                    <h1 className="welcome-name">{user?.name || 'Explorer'}</h1>
                </div>
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    <div className="search-bar-container">
                        <FaSearch className="search-icon" />
                        <input type="text" placeholder="Search companions..." className="search-input"
                            value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <button className="create-mentor-btn" onClick={openCreate}>
                        <FaPlus size={12} /> Create
                    </button>
                </div>
            </header>

            <LoginRequiredModal
                isOpen={showAuthModal}
                onConfirm={() => { setShowAuthModal(false); window.location.href = '/login'; }}
                onCancel={() => setShowAuthModal(false)}
            />

            {filtered ? (
                <section>
                    <h3 className="section-title">Search Results</h3>
                    {filtered.length === 0
                        ? <div className="no-results">No companions match your search.</div>
                        : <div className="ai-card-scroll">{filtered.map(bot => <AICard key={bot.id} bot={bot} isOwned={myChatbots.some(m => m.id === bot.id)} />)}</div>
                    }
                </section>
            ) : (
                <>
                    {/* My Chatbots */}
                    {myChatbots.length > 0 && (
                        <section>
                            <div className="section-title-row">
                                <h3 className="section-title">My Chatbots</h3>
                                <span className="section-hint">Hover a card to edit or delete</span>
                            </div>
                            <div className="ai-card-scroll">
                                {myChatbots.map(bot => <AICard key={bot.id} bot={bot} isOwned />)}
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

                    {/* Community */}
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
