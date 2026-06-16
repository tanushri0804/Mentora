import React, { useState, useEffect } from 'react';
import { FaPen, FaTimes, FaGlobe, FaChevronLeft, FaChevronRight, FaPlus, FaBookOpen, FaCommentDots, FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Storyteller.css';
import { useAuth } from '../../context/AuthContext';
import LoginRequiredModal from '../LoginRequiredModal/LoginRequiredModal';

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

// Default images for creating stories
const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80&w=800'
];

const EMOTIONS = [
  { id: 'joy', label: 'Joyful & Happy', color: '#ffd166' },
  { id: 'sad', label: 'Sad & Reflective', color: '#457b9d' },
  { id: 'anxious', label: 'Anxious', color: '#e07a5f' },
  { id: 'hopeful', label: 'Hopeful & Inspired', color: '#2a9d8f' },
  { id: 'neutral', label: 'Just Venting', color: '#8d99ae' },
];

const DEFAULT_STORIES = [
  {
    id: 1,
    title: 'Maybe You’re Not Behind',
    author: '@mentora_official',
    emotion: 'neutral',
    cover: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&q=80&w=800',
    description: 'A reflection on letting go of societal timelines and finding peace in your own unique journey.',
    pages: [
      "Maybe your life isn’t falling apart.\nMaybe it’s just unfolding differently than you imagined.",
      "We spend so much time comparing timelines that we forget every person is fighting a battle we cannot see. Someone may look successful but feel empty inside. Someone may look lost but secretly be healing.",
      "Growth is strange because it rarely feels like progress while it’s happening.\n\nSometimes growth looks like:\n* choosing rest instead of burnout\n* crying instead of pretending\n* starting again after failing\n* surviving days you thought would break you",
      "You do not need to become perfect overnight.\n\nYou do not need to have all the answers right now.\n\nLife is not a race between you and everyone else online.",
      "Maybe this season of your life is not about proving anything.\nMaybe it’s about learning how to breathe again.\nHow to trust yourself again.\nHow to live without constantly punishing yourself.",
      "And maybe being “better” does not mean becoming someone new.\nMaybe it means finally being kinder to the person you already are."
    ],
    comments: [],
    date: 'May 20, 2026'
  },
  {
    id: 2,
    title: 'Healing Is Not Always Beautiful',
    author: '@mentora_official',
    emotion: 'sad',
    cover: 'https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?auto=format&fit=crop&q=80&w=800',
    description: 'An honest look at the messy, non-linear reality of emotional healing.',
    pages: [
      "Healing is not always soft music, morning routines, and peaceful sunsets.\n\nSometimes healing looks messy.",
      "It looks like losing motivation.\nLike isolating yourself because you’re overwhelmed.\nLike trying to explain feelings you don’t even understand yourself.",
      "Some days you will feel like you’re making progress.\nOther days you will feel like you’re back at the beginning.\n\nThat does not mean you failed.",
      "Human emotions are not linear.\nYou are allowed to have hard days without believing your entire life is hopeless.",
      "Please remember this:\n\nA bad chapter is not the whole story.\nA difficult season is not your forever.\nAnd needing help does not make you weak.",
      "You are still growing, even on the days when growth feels invisible."
    ],
    comments: [],
    date: 'May 21, 2026'
  },
  {
    id: 3,
    title: 'You Don’t Need to Have It All Figured Out',
    author: '@mentora_official',
    emotion: 'hopeful',
    cover: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80&w=800',
    description: 'A gentle reminder that it’s okay to figure things out as you go without rushing to a finish line.',
    pages: [
      "There is so much pressure to become successful quickly.\n\nTo know your purpose.\nTo build a perfect future.\nTo always stay productive.",
      "But life is not meant to be solved like a math problem.\n\nYou are allowed to change directions.\nYou are allowed to outgrow people, dreams, and old versions of yourself.",
      "The truth is:\nMost people are figuring life out as they go.\n\nNo one wakes up magically confident.\nNo one completely escapes fear.",
      "The difference is that some people keep moving despite uncertainty.\n\nSo take small steps.\nLearn slowly.\nRest when needed.\nBegin again when necessary.",
      "You do not need to become extraordinary overnight.\n\nYou just need to keep going long enough to discover who you can become."
    ],
    comments: [],
    date: 'May 22, 2026'
  },
  {
    id: 4,
    title: 'The Power of Small Wins',
    author: '@mentora_official',
    emotion: 'joy',
    cover: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=800',
    description: 'Celebrating the small victories that often go unnoticed but keep us moving forward.',
    pages: [
      "We often wait for massive achievements to feel proud of ourselves. The big promotion, the major milestone, the grand finish line.",
      "But life is mostly built on small, seemingly invisible victories.\n\nGetting out of bed on a day you felt paralyzed.\nDrinking a glass of water.\nAnswering an email you’ve been avoiding.",
      "These aren’t just 'basic tasks'. When your mind is heavy, doing the bare minimum is an act of defiance. It is a victory.",
      "Stop waiting for a major breakthrough to celebrate yourself. Honor the tiny steps you took today. They are what eventually build a beautiful life."
    ],
    comments: [],
    date: 'May 22, 2026'
  },
  {
    id: 5,
    title: 'Embracing the Unknown',
    author: '@mentora_official',
    emotion: 'anxious',
    cover: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=800',
    description: 'Navigating the anxiety of uncertainty and finding peace in not knowing what comes next.',
    pages: [
      "Anxiety loves to convince us that if we can just plan everything, predict every outcome, we will be safe.",
      "But the truth is, the unknown is where life actually happens.\nWe spend so much time trying to map out a future that hasn't arrived yet, exhausting ourselves with 'what ifs'.",
      "What if, instead of preparing for the worst, we left a little room for things to go surprisingly well?",
      "You don't need a guaranteed outcome to take the next step. You just need enough courage for today. Let tomorrow worry about itself."
    ],
    comments: [],
    date: 'May 22, 2026'
  },
  {
    id: 6,
    title: 'You Are More Than Your Productivity',
    author: '@mentora_official',
    emotion: 'neutral',
    cover: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=800',
    description: 'Breaking free from the toxic mindset that your worth is determined by how much you get done.',
    pages: [
      "In a world obsessed with hustle, it is easy to start measuring your self-worth by how much you accomplished by 5 PM.",
      "If you had a 'lazy' day, guilt creeps in. If you rested, you feel like you're falling behind.",
      "But you are a human being, not a machine. Rest is not a reward for burning yourself out; it is a fundamental requirement for living.",
      "Your value does not decrease on the days you do nothing. Simply existing, breathing, and experiencing the world is enough."
    ],
    comments: [],
    date: 'May 22, 2026'
  }
];

const MAX_PAGES = 20;

// Helper function to get avatar image from ID
const getAvatarImage = (avatarId) => {
  if (!avatarId) return null;
  const selectedAvatar = PREMIUM_AVATARS.find(a => a.id === avatarId);
  return selectedAvatar?.image || null;
};

const Storyteller = () => {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentTab, setCurrentTab] = useState('community'); // 'community', 'my-stories', 'my-comments'

  // Modals state
  const [readingStory, setReadingStory] = useState(null);
  const [readerPageIndex, setReaderPageIndex] = useState(0);
  const [newComment, setNewComment] = useState('');

  const [isWriting, setIsWriting] = useState(false);
  const [editStoryId, setEditStoryId] = useState(null);

  // New Story Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [pages, setPages] = useState(['']);
  const [writerPageIndex, setWriterPageIndex] = useState(0);
  const [newEmotion, setNewEmotion] = useState('neutral');
  const [newCover, setNewCover] = useState(COVER_IMAGES[0]);

  // API functions
  const fetchStories = async (emotion = null) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('mentora_token');
      let url = 'http://localhost:5000/api/stories/public';

      if (emotion && emotion !== 'all') {
        url += `?emotion=${emotion}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      let fetchedStories = [];
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          fetchedStories = data.data.map(story => ({
            id: story.id,
            title: story.title,
            author: story.user.username || '@user',
            emotion: story.emotion,
            cover: story.cover,
            description: story.description,
            pages: story.pages,
            comments: (story.comments || []).map(comment => ({
              id: comment.id,
              author: comment.user.username || '@user',
              authorName: comment.user.name || comment.user.username,
              authorAvatar: comment.user.avatar || null,
              text: comment.content,
              date: new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            })),
            date: new Date(story.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          }));
        }
      } else {
        throw new Error('Failed to fetch stories');
      }

      // Merge official default stories with fetched ones, ensuring no duplicate IDs
      const combined = [...DEFAULT_STORIES, ...fetchedStories].filter((story, idx, self) =>
        idx === self.findIndex(s => s.id === story.id)
      );
      setStories(combined);
    } catch (error) {
      console.error('Fetch stories error:', error);
      setError('Failed to load stories');
      // Fallback to default stories only
      setStories(DEFAULT_STORIES);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('mentora_token');
      
      const response = await fetch('http://localhost:5000/api/stories/my-stories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const formattedStories = data.data.map(story => ({
            id: story.id,
            title: story.title,
            author: '@you',
            emotion: story.emotion,
            cover: story.cover,
            description: story.description,
            pages: story.pages,
            comments: (story.comments || []).map(comment => ({
              id: comment.id,
              author: comment.user.username || '@user',
              authorName: comment.user.name || comment.user.username,
              authorAvatar: comment.user.avatar || null,
              text: comment.content,
              date: new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            })),
            date: new Date(story.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          }));
          return formattedStories;
        }
      }
    } catch (error) {
      console.error('Fetch user stories error:', error);
    }
    return [];
  };

  const saveStory = async (storyData) => {
    try {
      const token = localStorage.getItem('mentora_token');
      const url = editStoryId 
        ? `http://localhost:5000/api/stories/${editStoryId}`
        : 'http://localhost:5000/api/stories';
      
      const method = editStoryId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(storyData)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return data.data;
        }
      }
      throw new Error('Failed to save story');
    } catch (error) {
      console.error('Save story error:', error);
      throw error;
    }
  };

  const deleteStory = async (storyId) => {
    try {
      const token = localStorage.getItem('mentora_token');
      
      const response = await fetch(`http://localhost:5000/api/stories/${storyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.success;
      }
      throw new Error('Failed to delete story');
    } catch (error) {
      console.error('Delete story error:', error);
      throw error;
    }
  };

  const addComment = async (storyId, content) => {
    try {
      const token = localStorage.getItem('mentora_token');
      
      const response = await fetch(`http://localhost:5000/api/stories/${storyId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return data.data;
        }
      }
      throw new Error('Failed to add comment');
    } catch (error) {
      console.error('Add comment error:', error);
      throw error;
    }
  };

  const fetchUserComments = async () => {
    try {
      const token = localStorage.getItem('mentora_token');
      
      const response = await fetch('http://localhost:5000/api/stories/my-comments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Transform backend data to match frontend format
          const formattedComments = data.data.map(comment => ({
            id: comment.id,
            text: comment.content,
            storyId: comment.storyId,
            storyTitle: comment.story.title,
            storyAuthor: comment.story.user.username || '@user',
            date: new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          }));
          return formattedComments;
        }
      }
      throw new Error('Failed to fetch user comments');
    } catch (error) {
      console.error('Fetch user comments error:', error);
      throw error;
    }
  };

  const deleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem('mentora_token');
      
      const response = await fetch(`http://localhost:5000/api/stories/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.success;
      }
      throw new Error('Failed to delete comment');
    } catch (error) {
      console.error('Delete comment error:', error);
      throw error;
    }
  };

  // Load stories on component mount and when filter changes
  useEffect(() => {
    if (currentTab === 'community') {
      fetchStories(activeFilter);
    }
  }, [currentTab, activeFilter]);

  // Load user stories when switching to my-stories tab
  useEffect(() => {
    if (currentTab === 'my-stories') {
      fetchUserStories().then(userStories => {
        setStories(userStories);
        setLoading(false);
      });
    }
  }, [currentTab]);

  // Load user comments when switching to my-comments tab
  useEffect(() => {
    if (currentTab === 'my-comments') {
      fetchUserComments().then(comments => {
        setUserComments(comments);
        setLoading(false);
      }).catch(error => {
        console.error('Failed to load user comments:', error);
        setUserComments([]);
        setLoading(false);
      });
    }
  }, [currentTab]);

  const filteredStories = activeFilter === 'all'
    ? stories
    : stories.filter(s => s.emotion === activeFilter);

  const getEmotionDetails = (id) => EMOTIONS.find(e => e.id === id) || EMOTIONS[4];

  // Writing handlers
  const { isGuest } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const startWriting = () => {
    // Check guest
    if (isGuest) {
      setShowAuthModal(true);
      return;
    }

    setEditStoryId(null);
    setNewTitle('');
    setNewDescription('');
    setPages(['']);
    setWriterPageIndex(0);
    setNewEmotion('neutral');
    setNewCover(COVER_IMAGES[0]);
    setIsWriting(true);
  };

  const startEditing = () => {
    setEditStoryId(readingStory.id);
    setNewTitle(readingStory.title);
    setNewDescription(readingStory.description);
    setNewEmotion(readingStory.emotion);
    setNewCover(readingStory.cover);
    setPages([...readingStory.pages]);
    setWriterPageIndex(0);
    setIsWriting(true);
    setReadingStory(null);
  };

  const handleDeleteStory = async (id) => {
    if (window.confirm("Are you sure you want to delete this story completely?")) {
      try {
        await deleteStory(id);
        setStories(stories.filter(s => s.id !== id));
        if (readingStory && readingStory.id === id) setReadingStory(null);
        if (editStoryId === id) setIsWriting(false);
      } catch (error) {
        alert('Failed to delete story. Please try again.');
        console.error('Delete error:', error);
      }
    }
  };

  const deleteCurrentPage = () => {
    if (pages.length <= 1) {
      alert("You need at least one page in your story.");
      return;
    }
    const updatedPages = pages.filter((_, i) => i !== writerPageIndex);
    setPages(updatedPages);
    setWriterPageIndex(Math.max(0, writerPageIndex - 1));
  };

  const handlePageChange = (text) => {
    const updatedPages = [...pages];
    updatedPages[writerPageIndex] = text;
    setPages(updatedPages);
  };

  const addPage = () => {
    if (pages.length < MAX_PAGES) {
      setPages([...pages, '']);
      setWriterPageIndex(pages.length);
    }
  };

  const handlePublish = async () => {
    if (isGuest) {
      setShowAuthModal(true);
      return;
    }
    // Filter out completely empty pages
    const cleanPages = pages.map(p => p.trim()).filter(p => p.length > 0);

    if (!newTitle.trim() || !newDescription.trim() || cleanPages.length === 0) {
      alert("Please provide a title, a short description, and your story content.");
      return;
    }

    try {
      const storyData = {
        title: newTitle.trim(),
        description: newDescription.trim(),
        emotion: newEmotion,
        cover: newCover,
        pages: cleanPages,
        isPublic: true
      };

      const savedStory = await saveStory(storyData);
      
      // Transform backend response to frontend format
      const formattedStory = {
        id: savedStory.id,
        title: savedStory.title,
        author: editStoryId ? '@you' : (savedStory.user?.username || '@you'),
        emotion: savedStory.emotion,
        cover: savedStory.cover,
        description: savedStory.description,
        pages: savedStory.pages,
        comments: [],
        date: new Date(savedStory.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };

      if (editStoryId) {
        // Update existing story in local state
        setStories(stories.map(s => s.id === editStoryId ? formattedStory : s));
      } else {
        // Add new story to local state
        setStories([formattedStory, ...stories]);
      }

      setIsWriting(false);
      setEditStoryId(null);

      // Reset form
      setNewTitle('');
      setNewDescription('');
      setPages(['']);
      setWriterPageIndex(0);
      setNewEmotion('neutral');
      setNewCover(COVER_IMAGES[0]);

    } catch (error) {
      alert('Failed to save story. Please try again.');
      console.error('Publish error:', error);
    }
  };

  const closeReader = () => {
    setReadingStory(null);
    setReaderPageIndex(0);
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const savedComment = await addComment(readingStory.id, newComment.trim());
      
      // Transform backend response to frontend format
      const formattedComment = {
        id: savedComment.id,
        author: savedComment.user.username || '@you',
        authorName: savedComment.user.name || savedComment.user.username,
        authorAvatar: savedComment.user.avatar || null,
        text: savedComment.content,
        date: new Date(savedComment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };

      // Update the stories array with the new comment
      const updatedStories = stories.map(s => {
        if (s.id === readingStory.id) {
          const updatedStory = { ...s, comments: [...(s.comments || []), formattedComment] };
          setReadingStory(updatedStory); // Update currently reading story too
          return updatedStory;
        }
        return s;
      });

      setStories(updatedStories);
      setNewComment('');
      
      // Refresh the currently reading story to get updated comments from backend
      if (readingStory && readingStory.id === updatedStories.find(s => s.id === readingStory.id)?.id) {
        setTimeout(() => {
          const refreshStory = updatedStories.find(s => s.id === readingStory.id);
          if (refreshStory) {
            setReadingStory(refreshStory);
          }
        }, 500);
      }
      
    } catch (error) {
      alert('Failed to add comment. Please try again.');
      console.error('Add comment error:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await deleteComment(commentId);
        
        // Remove comment from user comments list
        setUserComments(userComments.filter(c => c.id !== commentId));
        
        // Also remove from current story if it's being displayed
        if (readingStory && readingStory.comments) {
          const updatedStory = {
            ...readingStory,
            comments: readingStory.comments.filter(c => c.id !== commentId)
          };
          setReadingStory(updatedStory);
          
          // Update stories array too
          const updatedStories = stories.map(s => 
            s.id === readingStory.id ? updatedStory : s
          );
          setStories(updatedStories);
        }
        
      } catch (error) {
        alert('Failed to delete comment. Please try again.');
        console.error('Delete comment error:', error);
      }
    }
  };

  if (readingStory) {
    const isFirstPage = readerPageIndex === 0;
    const isLastPage = readerPageIndex === readingStory.pages.length - 1;

    return (
      <div className="story-reader-fullscreen">
        <div className="reader-hero-section">
          <div className="reader-hero-bg" style={{ backgroundImage: `url(${readingStory.cover})` }}></div>
          <div className="reader-hero-overlay"></div>
          
          <div className="reader-top-bar">
            <button className="reader-back-btn" onClick={closeReader}>
              <FaChevronLeft style={{ position: 'relative', top: '1px' }} />
              Back to Stories
            </button>
            
            {readingStory.author === '@you' && (
              <div className="reader-actions">
                <button className="action-btn" onClick={startEditing}>Edit</button>
                <button className="action-btn delete-btn" onClick={() => handleDeleteStory(readingStory.id)}>Delete</button>
              </div>
            )}
          </div>

          <div className="reader-hero-content">
            <span
              className="reader-emotion"
              style={{
                background: `${getEmotionDetails(readingStory.emotion).color}33`,
                color: getEmotionDetails(readingStory.emotion).color,
                marginBottom: '1rem',
                display: 'inline-block'
              }}
            >
              {getEmotionDetails(readingStory.emotion).label}
            </span>
            <h2 className="reader-title">{readingStory.title}</h2>
            <div className="reader-meta">
              <span>Written by <strong>{readingStory.author}</strong></span>
              <span>•</span>
              <span>{readingStory.date}</span>
            </div>
          </div>
        </div>

        <div className="reader-content-wrapper">
          <button
            className="side-nav-btn"
            onClick={() => setReaderPageIndex(prev => prev - 1)}
            disabled={isFirstPage}
          >
            <FaChevronLeft size={24} />
          </button>

          <div className="reader-content-container">
            <div className="premium-reader-body page-anim" key={readerPageIndex}>
              {readingStory.pages[readerPageIndex]}
            </div>

            <div className="page-indicator-container">
              <span className="reader-page-indicator">
                {readerPageIndex + 1} / {readingStory.pages.length}
              </span>
            </div>
          </div>

          <button
            className="side-nav-btn"
            onClick={() => setReaderPageIndex(prev => prev + 1)}
            disabled={isLastPage}
          >
            <FaChevronRight size={24} />
          </button>
        </div>

        {/* Comments Section */}
        <div className="reader-comments-wrap">
          <div className="comments-section">
            <h3>Community Support & Thoughts</h3>
            <div className="comments-list">
              {readingStory.comments && readingStory.comments.length > 0 ? (
                readingStory.comments.map(comment => {
                  const avatarImage = getAvatarImage(comment.authorAvatar);
                  return (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-header">
                        <div className="comment-author-info">
                          <div className="comment-avatar">
                            {avatarImage ? (
                              <img src={avatarImage} alt={comment.author} className="comment-avatar-img" />
                            ) : (
                              <FaUserCircle className="comment-avatar-placeholder" />
                            )}
                          </div>
                          <div className="comment-author-details">
                            <strong 
                              className="comment-author-name"
                              onClick={() => comment.author !== '@you' && navigate(`/profile/${comment.author}`)}
                              style={{ cursor: comment.author !== '@you' ? 'pointer' : 'default' }}
                            >
                              {comment.authorName || comment.author}
                            </strong>
                            <span className="comment-date">{comment.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="comment-text">{comment.text}</p>
                    </div>
                  );
                })
              ) : (
                <p className="no-comments">No comments yet. Be the first to share your thoughts!</p>
              )}
            </div>

            <div className="add-comment-box">
              <textarea
                placeholder="Share a supportive message or your thoughts..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="story-input comment-input"
              />
              <button
                className="publish-btn comment-submit"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                Post Comment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isWriting) {
    const isFirstPage = writerPageIndex === 0;
    const isLastPage = writerPageIndex === pages.length - 1;

    return (
      <div className="storyteller-container">
        <div className="story-page-container">
          <div className="writer-header-bar">
            <button className="back-btn" style={{ marginBottom: 0 }} onClick={() => setIsWriting(false)}>
              <FaTimes style={{ position: 'relative', top: '1px' }} />
              Cancel Writing
            </button>
            {editStoryId && (
              <button className="action-btn delete-btn" onClick={() => handleDeleteStory(editStoryId)}>
                Delete Entire Story
              </button>
            )}
          </div>

          <div className="writer-content">
            <h2>{editStoryId ? 'Edit Your Story' : 'Share Your Story'}</h2>

            <div className="form-group">
              <label>Story Title</label>
              <input
                type="text"
                className="story-input"
                placeholder="Give your story a meaningful title..."
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Short Description</span>
                <span style={{ color: newDescription.length >= 150 ? '#e63946' : 'var(--text-muted)' }}>
                  {newDescription.length} / 150
                </span>
              </label>
              <textarea
                className="story-input"
                placeholder="Write a brief summary or hook for your story..."
                value={newDescription}
                onChange={e => {
                  if (e.target.value.length <= 150) {
                    setNewDescription(e.target.value);
                  }
                }}
                style={{ minHeight: '80px', resize: 'none' }}
              ></textarea>
            </div>

            <div className="form-group">
              <label>Emotion Type</label>
              <div className="emotion-selector">
                {EMOTIONS.map(emotion => (
                  <button
                    key={emotion.id}
                    className={`emotion-btn ${newEmotion === emotion.id ? 'active' : ''}`}
                    onClick={() => setNewEmotion(emotion.id)}
                    style={{
                      borderColor: newEmotion === emotion.id ? emotion.color : 'var(--glass-border)',
                      color: newEmotion === emotion.id ? emotion.color : 'white'
                    }}
                  >
                    {emotion.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Select Cover Image</label>
              <div className="cover-grid">
                {COVER_IMAGES.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    className={`cover-option ${newCover === img ? 'active' : ''}`}
                    onClick={() => setNewCover(img)}
                    alt="Cover Choice"
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Your Story - Page {writerPageIndex + 1}</span>
                <span style={{ color: pages[writerPageIndex].length > 1500 ? '#e63946' : 'var(--text-muted)' }}>
                  Word Count Limit: {pages[writerPageIndex].split(/\s+/).filter(w => w.length > 0).length} / 250
                </span>
              </label>
              <textarea
                className="story-input story-textarea"
                placeholder="Express your feelings freely here. Type your story..."
                value={pages[writerPageIndex]}
                onChange={e => handlePageChange(e.target.value)}
              ></textarea>
            </div>

            <div className="page-navigation writing-nav">
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button
                  className="page-nav-btn"
                  onClick={() => setWriterPageIndex(prev => prev - 1)}
                  disabled={isFirstPage}
                >
                  <FaChevronLeft /> Previous
                </button>
                <button
                  className="page-nav-btn"
                  onClick={() => setWriterPageIndex(prev => prev + 1)}
                  disabled={isLastPage}
                >
                  Next <FaChevronRight />
                </button>
                {pages.length > 1 && (
                  <button className="action-btn delete-btn" style={{ marginLeft: '1rem' }} onClick={deleteCurrentPage}>
                    Delete Current Page
                  </button>
                )}
              </div>

              {pages.length < MAX_PAGES && (
                <button className="add-page-btn" onClick={addPage}>
                  <FaPlus /> Add New Page
                </button>
              )}
            </div>

            <div className="publish-actions">
              <button className="publish-btn" onClick={handlePublish}>
                <FaGlobe style={{ marginRight: '8px', position: 'relative', top: '2px' }} />
                {editStoryId ? 'Save Edits' : 'Publish to Community'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="storyteller-container">
      <div className="storyteller-sticky-header">
        {/* Header */}
        <div className="page-header fade-in-up">
          <div>
            <h1>
              {currentTab === 'community' ? 'Community Stories' : 
               currentTab === 'my-stories' ? 'My Diary' : 'My Comments'}
            </h1>
            <p>
              {currentTab === 'community' ? 'Read, share, and connect feeling to feeling.' : 
               currentTab === 'my-stories' ? 'Your personal space to manage stories & reflections.' : 
               'See all your comments across stories and manage them.'}
            </p>
          </div>
          <div className="header-buttons-group">
            {currentTab === 'community' && (
              <button
                className="create-story-btn"
                style={{ background: 'transparent', border: '1px solid var(--glass-border)' }}
                onClick={() => setCurrentTab('my-stories')}
              >
                My Diary
              </button>
            )}
            {currentTab === 'my-stories' && (
              <>
                <button
                  className="create-story-btn"
                  style={{ background: 'transparent', border: '1px solid var(--glass-border)' }}
                  onClick={() => setCurrentTab('my-comments')}
                >
                  My Comments
                </button>
                <button
                  className="create-story-btn"
                  style={{ background: 'transparent', border: '1px solid var(--glass-border)' }}
                  onClick={() => setCurrentTab('community')}
                >
                  Back to Community
                </button>
              </>
            )}
            {currentTab === 'my-comments' && (
              <>
                <button
                  className="create-story-btn"
                  style={{ background: 'transparent', border: '1px solid var(--glass-border)' }}
                  onClick={() => setCurrentTab('my-stories')}
                >
                  Back to My Diary
                </button>
                <button
                  className="create-story-btn"
                  style={{ background: 'transparent', border: '1px solid var(--glass-border)' }}
                  onClick={() => setCurrentTab('community')}
                >
                  Browse Community
                </button>
              </>
            )}
            {(currentTab === 'community' || currentTab === 'my-stories') && (
              <button className="create-story-btn" onClick={startWriting}>
                <FaPen size={14} /> Write Story
              </button>
            )}
          </div>
        </div>

        {/* Filters and Tabs */}
        {currentTab === 'community' ? (
          <div className="story-filters fade-in-up" style={{ animationDelay: '0.1s' }}>
            <button
              className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All Stories
            </button>
            {EMOTIONS.map(emotion => (
              <button
                key={emotion.id}
                className={`filter-pill ${activeFilter === emotion.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(emotion.id)}
                style={{ borderLeftColor: activeFilter === emotion.id ? emotion.color : 'transparent', borderLeftWidth: '4px' }}
              >
                {emotion.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="story-filters fade-in-up" style={{ animationDelay: '0.1s' }}>
            <button
              className={`filter-pill ${currentTab === 'my-stories' ? 'active' : ''}`}
              onClick={() => setCurrentTab('my-stories')}
            >
              My Stories
            </button>
            <button
              className={`filter-pill ${currentTab === 'my-comments' ? 'active' : ''}`}
              onClick={() => setCurrentTab('my-comments')}
            >
              My Comments
            </button>
          </div>
        )}
      </div>

      <div className="storyteller-scroll-content">
        {currentTab === 'community' && (
          filteredStories.length === 0 ? (
            <div className="empty-state fade-in-up" style={{ animationDelay: '0.2s' }}>
              <FaBookOpen className="empty-state-icon" />
              <h3>Oh no! No stories here yet...</h3>
              <p>Be the first one to share a story with the community. Every voice matters!</p>
              <button className="create-story-btn" onClick={startWriting}>
                <FaPen size={14} /> Create Story
              </button>
            </div>
          ) : (
            <div className="story-feed fade-in-up" style={{ animationDelay: '0.2s' }}>
              {filteredStories.map((story) => {
                const emotionMeta = getEmotionDetails(story.emotion);
                return (
                  <div key={story.id} className="story-card" onClick={() => setReadingStory(story)}>
                    <img src={story.cover} alt="Cover" className="story-cover" />
                    <div className="story-content">
                      <div className="story-meta">
                        <span className="story-emotion" style={{ background: `${emotionMeta.color}33`, color: emotionMeta.color }}>
                          {emotionMeta.label}
                        </span>
                        <span className="story-author">{story.author}</span>
                      </div>
                      <h3>{story.title}</h3>
                      <p className="story-preview">{story.description}</p>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 'auto', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{story.date}</span>
                        <span>{story.pages.length} Pages</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {currentTab === 'my-stories' && (
          stories.filter(s => s.author === '@you').length === 0 ? (
            <div className="empty-state fade-in-up" style={{ animationDelay: '0.2s' }}>
              <FaBookOpen className="empty-state-icon" />
              <h3>No stories yet</h3>
              <p>Your diary is empty. Every great author starts with a blank page — write your first story and share your feelings with the community!</p>
              <button className="create-story-btn" onClick={startWriting}>
                <FaPen size={14} /> Write Your First Story
              </button>
            </div>
          ) : (
            <div className="story-feed fade-in-up" style={{ animationDelay: '0.2s' }}>
              {stories.filter(s => s.author === '@you').map((story) => {
                const emotionMeta = getEmotionDetails(story.emotion);
                return (
                  <div key={story.id} className="story-card" onClick={() => setReadingStory(story)}>
                    <img src={story.cover} alt="Cover" className="story-cover" />
                    <div className="story-content">
                      <div className="story-meta">
                        <span className="story-emotion" style={{ background: `${emotionMeta.color}33`, color: emotionMeta.color }}>
                          {emotionMeta.label}
                        </span>
                      </div>
                      <h3>{story.title}</h3>
                      <p className="story-preview">{story.description}</p>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 'auto', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{story.date}</span>
                        <span>{story.pages.length} Pages</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {currentTab === 'my-comments' && (
          <div className="my-comments-list fade-in-up" style={{ animationDelay: '0.2s' }}>
            {userComments.length === 0 ? (
              <div className="empty-state">
                <FaCommentDots className="empty-state-icon" />
                <h3>No comments yet</h3>
                <p>You haven't shared your thoughts on any story yet. Read a story from the community and leave a kind or supportive message!</p>
                <button className="create-story-btn" onClick={() => setCurrentTab('community')}>
                  Browse Community Stories
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {userComments.map((comment, idx) => (
                  <div key={comment.id} className="comment-item" style={{ cursor: 'pointer' }}>
                    <div className="comment-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div onClick={() => setReadingStory({ id: comment.storyId, title: comment.storyTitle, author: comment.storyAuthor })}>
                        <strong>Commented on: {comment.storyTitle}</strong>
                        <span className="comment-date" style={{ marginLeft: '1rem' }}>{comment.date}</span>
                      </div>
                      <button 
                        className="action-btn delete-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteComment(comment.id);
                        }}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                    <p>{comment.text}</p>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', opacity: 0.7 }}>
                      Story by {comment.storyAuthor}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    <LoginRequiredModal
      isOpen={showAuthModal}
      title="Login required to write"
      message="Creating and publishing stories requires an account so your entries are saved and linked to you. Log in to continue or cancel to keep browsing as a guest."
      onConfirm={() => { setShowAuthModal(false); navigate('/login'); }}
      onContinueAsGuest={() => { setShowAuthModal(false); }}
      onCancel={() => setShowAuthModal(false)}
    />
    </>
  );
};

export default Storyteller;
