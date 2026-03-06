import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaComment, FaPlus, FaTimes, FaLock, FaGlobe, FaRobot } from 'react-icons/fa';
import './Discover.css';

import moodAvtar from '../assets/moodAvtar.png';
import stressAvtar from '../assets/stressAvtar.png';
import dreamAvtar from '../assets/dreamAvtar.png';
import anxityAvtar from '../assets/anxityAvtar.png';
import relationshipAvtar from '../assets/relationshipAvtar.png';

const AVATAR_OPTIONS = [moodAvtar, stressAvtar, dreamAvtar, anxityAvtar, relationshipAvtar];

const Discover = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [editingMentorId, setEditingMentorId] = useState(null);

    // Create mentor form states
    const [mentorName, setMentorName] = useState('');
    const [mentorDesc, setMentorDesc] = useState('');
    const [mentorPersonality, setMentorPersonality] = useState('');
    const [mentorAvatar, setMentorAvatar] = useState(AVATAR_OPTIONS[0]);
    const [mentorVisibility, setMentorVisibility] = useState('private'); // 'private' or 'public'

    // User-created mentors
    const [myMentors, setMyMentors] = useState([]);

    const featuredAIs = [
        {
            id: "mood-mentor",
            name: "Mood Mentor",
            author: "@mentora_official",
            desc: "Hello, I'm your Mood Mentor. I help you navigate emotions, find balance, and bring clarity to your...",
            img: moodAvtar,
            chats: "24.5k"
        },
        {
            id: "stress-buster",
            name: "Stress Buster",
            author: "@zen_master",
            desc: "Hey there! I use quick CBT techniques and talk therapy for immediate stress relief. Let's work through...",
            img: stressAvtar,
            chats: "18.2k"
        },
        {
            id: "dream-weaver",
            name: "Dream Weaver",
            author: "@sleepy_hollow",
            desc: "Welcome! I interpret your dreams, explore your subconscious, and help improve your sleep hygiene...",
            img: dreamAvtar,
            chats: "12.8k"
        }
    ];

    const popularAIs = [
        {
            id: "anxiety-ally",
            name: "Anxiety Ally",
            author: "@calm_corner",
            desc: "I'm here to help you navigate anxious thoughts with gentle, evidence-based guidance and breathing...",
            img: anxityAvtar,
            chats: "31.1k"
        },
        {
            id: "relationship-rescuer",
            name: "Relationship Guide",
            author: "@heart_talks",
            desc: "Hello! I provide insights and advice for building healthy boundaries and meaningful connections...",
            img: relationshipAvtar,
            chats: "15.6k"
        },
        {
            id: "creative-helper",
            name: "Creative Spark",
            author: "@muse_ai",
            desc: "Let's unblock your mind! I help you find inspiration, explore ideas, and tap into your creative flow...",
            img: moodAvtar,
            chats: "9.4k"
        },
        {
            id: "focus-pocus",
            name: "Focus Master",
            author: "@productivity_pro",
            desc: "Ready to get things done? I help you build focus, manage time, and beat mental fatigue with proven...",
            img: stressAvtar,
            chats: "22.3k"
        }
    ];

    // Combine public custom mentors into the all list
    const publicCustom = myMentors.filter(m => m.visibility === 'public');
    const allAIs = [...featuredAIs, ...popularAIs, ...publicCustom];

    const filtered = search.trim()
        ? allAIs.filter(ai =>
            ai.name.toLowerCase().includes(search.toLowerCase()) ||
            ai.desc.toLowerCase().includes(search.toLowerCase())
        )
        : null;

    const handleSelectAI = (id) => {
        navigate(`/chat/chatbot/${id}`);
    };

    const resetForm = () => {
        setMentorName('');
        setMentorDesc('');
        setMentorPersonality('');
        setMentorAvatar(AVATAR_OPTIONS[0]);
        setMentorVisibility('private');
        setEditingMentorId(null);
    };

    const startEditMentor = (mentor) => {
        setMentorName(mentor.name);
        setMentorDesc(mentor.desc);
        setMentorPersonality(mentor.personality || '');
        setMentorAvatar(mentor.img);
        setMentorVisibility(mentor.visibility);
        setEditingMentorId(mentor.id);
        setIsCreating(true);
    };

    const handleCreateMentor = () => {
        if (!mentorName.trim() || !mentorDesc.trim()) {
            alert("Please provide a name and description for your mentor.");
            return;
        }

        if (editingMentorId) {
            // Update existing mentor
            setMyMentors(myMentors.map(m => m.id === editingMentorId ? {
                ...m,
                name: mentorName.trim(),
                desc: mentorDesc.trim(),
                personality: mentorPersonality.trim(),
                img: mentorAvatar,
                visibility: mentorVisibility
            } : m));
        } else {
            // Create new mentor
            const newMentor = {
                id: `custom-${Date.now()}`,
                name: mentorName.trim(),
                author: "@you",
                desc: mentorDesc.trim(),
                personality: mentorPersonality.trim(),
                img: mentorAvatar,
                chats: "0",
                visibility: mentorVisibility,
                isCustom: true,
                createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            };
            setMyMentors([newMentor, ...myMentors]);
        }

        setIsCreating(false);
        resetForm();
    };

    const handleDeleteMentor = (id) => {
        if (window.confirm("Delete this mentor permanently?")) {
            setMyMentors(myMentors.filter(m => m.id !== id));
        }
    };

    const AICard = ({ ai, showDelete }) => (
        <div className="ai-card" onClick={() => handleSelectAI(ai.id)}>
            <img src={ai.img} alt={ai.name} className="ai-card-avatar" />
            <div className="ai-card-body">
                <div className="ai-card-top-row">
                    <h4 className="ai-card-name">{ai.name}</h4>
                    {ai.isCustom && (
                        <span className={`visibility-badge ${ai.visibility}`}>
                            {ai.visibility === 'private' ? <FaLock size={9} /> : <FaGlobe size={9} />}
                            {ai.visibility === 'private' ? 'Private' : 'Public'}
                        </span>
                    )}
                </div>
                <span className="ai-card-author">By {ai.author}</span>
                <p className="ai-card-desc">{ai.desc}</p>
                <div className="ai-card-footer">
                    <div className="ai-card-stats">
                        <FaComment className="stats-icon" />
                        <span>{ai.chats}</span>
                    </div>
                    {showDelete && (
                        <div className="card-action-btns">
                            <button
                                className="card-edit-btn"
                                onClick={(e) => { e.stopPropagation(); startEditMentor(ai); }}
                            >
                                Edit
                            </button>
                            <button
                                className="card-delete-btn"
                                onClick={(e) => { e.stopPropagation(); handleDeleteMentor(ai.id); }}
                            >
                                Delete
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
                    <button className="creator-back-btn" onClick={() => { setIsCreating(false); resetForm(); }}>
                        <FaTimes /> Cancel
                    </button>

                    <div className="creator-header">
                        <FaRobot className="creator-icon" />
                        <h2>{editingMentorId ? 'Edit Your Mentor' : 'Create Your AI Mentor'}</h2>
                        <p>{editingMentorId ? 'Update your mentor\'s details below.' : 'Build a personalized mentor that understands you. Choose to keep it private or share with the community.'}</p>
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
                            <label>Short Description</label>
                            <textarea
                                placeholder="What does this mentor do? e.g. A gentle guide who helps me process daily anxiety..."
                                value={mentorDesc}
                                onChange={e => setMentorDesc(e.target.value)}
                                className="creator-input creator-textarea-sm"
                            />
                        </div>

                        <div className="creator-field">
                            <label>Personality & Instructions <span style={{ color: '#6b7280', fontWeight: 400 }}>(Optional)</span></label>
                            <textarea
                                placeholder="How should this mentor talk? e.g. Be warm and empathetic, use simple language, always ask follow-up questions..."
                                value={mentorPersonality}
                                onChange={e => setMentorPersonality(e.target.value)}
                                className="creator-input creator-textarea"
                            />
                        </div>

                        <div className="creator-field">
                            <label>Choose Avatar</label>
                            <div className="avatar-picker">
                                {AVATAR_OPTIONS.map((avatar, i) => (
                                    <img
                                        key={i}
                                        src={avatar}
                                        alt={`Avatar ${i + 1}`}
                                        className={`avatar-option ${mentorAvatar === avatar ? 'active' : ''}`}
                                        onClick={() => setMentorAvatar(avatar)}
                                    />
                                ))}
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

                        <button className="creator-submit" onClick={handleCreateMentor}>
                            <FaPlus size={14} /> {editingMentorId ? 'Save Changes' : 'Create Mentor'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ---- Main Discover View ----
    return (
        <div className="discover-container">
            {/* Header */}
            <header className="discover-header">
                <div className="welcome-text">
                    <p className="welcome-greeting">Welcome back,</p>
                    <h1 className="welcome-name">Explorer</h1>
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
                            {filtered.map(ai => <AICard key={ai.id} ai={ai} />)}
                        </div>
                    )}
                </section>
            ) : (
                <>
                    {/* My Mentors */}
                    {myMentors.length > 0 && (
                        <section>
                            <h3 className="section-title">My Mentors</h3>
                            <div className="ai-card-scroll">
                                {myMentors.map(ai => <AICard key={ai.id} ai={ai} showDelete />)}
                            </div>
                        </section>
                    )}

                    {/* Featured */}
                    <section>
                        <h3 className="section-title">Featured</h3>
                        <div className="ai-card-scroll">
                            {featuredAIs.map(ai => <AICard key={ai.id} ai={ai} />)}
                        </div>
                    </section>

                    {/* Popular */}
                    <section>
                        <h3 className="section-title">Popular</h3>
                        <div className="ai-card-scroll">
                            {popularAIs.map(ai => <AICard key={ai.id} ai={ai} />)}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

export default Discover;
