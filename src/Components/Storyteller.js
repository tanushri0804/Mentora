import React, { useState } from 'react';
import { FaPen, FaTimes, FaGlobe, FaChevronLeft, FaChevronRight, FaPlus, FaBookOpen, FaCommentDots } from 'react-icons/fa';
import './Storyteller.css';

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
    title: 'Finding Light in the Forest',
    author: '@mentora_official',
    emotion: 'hopeful',
    cover: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&q=80&w=800',
    description: 'A short reflection on how taking a walk in the forest can help relieve the burdens of everyday life.',
    pages: [
      "It was a serene morning in the heart of the forest. The sunlight pierced through the canopy... I had been feeling so overwhelmed the last few weeks, carrying a heavy weight in my chest.",
      "But listening to the crunch of leaves beneath my boots, I finally took a deep breath. Nature has this incredible way of making our problems feel small while wrapping us in an immense sense of belonging.",
      "If you're struggling today, please take five minutes to step outside and just watch the sky. It truly helps."
    ],
    comments: [
      { id: 1, author: '@nature_lover', text: 'This is so true! I always feel better after a hike.', date: 'March 2, 2026' }
    ],
    date: 'March 1, 2026'
  },
  {
    id: 2,
    title: 'The Weight of the Mountains',
    author: '@mountain_climber',
    emotion: 'joy',
    cover: 'https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?auto=format&fit=crop&q=80&w=800',
    description: 'Sometimes you have to physically push your body to exhaust your anxious mind. A story about climbing to find peace.',
    pages: [
      "Climbing those rocky trails, I found not just breathtaking views but also a piece of peace I thought I lost. Sometimes you have to physically push your body to exhaust your anxious mind.",
      "The view from the top wasn't what cured me, it was the realization that I had the strength to climb it all along."
    ],
    comments: [
      { id: 2, author: '@fitness_freak', text: 'Nothing beats that feeling at the summit.', date: 'March 3, 2026' }
    ],
    date: 'March 3, 2026'
  },
  {
    id: 3,
    title: 'A Rainy Tuesday Reflection',
    author: '@quiet_soul',
    emotion: 'sad',
    cover: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80&w=800',
    description: 'It is okay to have days where you just sit and watch the rain. Society tells us we have to be productive 24/7, but sitting with sadness is productive too.',
    pages: [
      "It's okay to have days where you just sit and watch the rain. Today is one of those days for me.",
      "Society tells us we have to be productive 24/7, but sitting with your sadness is productive too. It's allowing yourself to heal. Don't rush it."
    ],
    comments: [
      { id: 3, author: '@caring_friend', text: 'Sending you so much love. Take all the time you need.', date: 'March 6, 2026' }
    ],
    date: 'March 5, 2026'
  }
];

const MAX_PAGES = 20;

const Storyteller = () => {
  const [stories, setStories] = useState(DEFAULT_STORIES);
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

  const filteredStories = activeFilter === 'all'
    ? stories
    : stories.filter(s => s.emotion === activeFilter);

  const getEmotionDetails = (id) => EMOTIONS.find(e => e.id === id) || EMOTIONS[4];

  // Writing handlers
  const startWriting = () => {
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

  const handleDeleteStory = (id) => {
    if (window.confirm("Are you sure you want to delete this story completely?")) {
      setStories(stories.filter(s => s.id !== id));
      if (readingStory && readingStory.id === id) setReadingStory(null);
      if (editStoryId === id) setIsWriting(false);
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

  const handlePublish = () => {
    // Filter out completely empty pages
    const cleanPages = pages.map(p => p.trim()).filter(p => p.length > 0);

    if (!newTitle.trim() || !newDescription.trim() || cleanPages.length === 0) {
      alert("Please provide a title, a short description, and your story content.");
      return;
    }

    if (editStoryId) {
      const updatedStories = stories.map(s => {
        if (s.id === editStoryId) {
          return {
            ...s,
            title: newTitle,
            emotion: newEmotion,
            cover: newCover,
            description: newDescription.trim(),
            pages: cleanPages
          };
        }
        return s;
      });
      setStories(updatedStories);
    } else {
      const newStory = {
        id: Date.now(),
        title: newTitle,
        author: '@you',
        emotion: newEmotion,
        cover: newCover,
        description: newDescription.trim(),
        pages: cleanPages,
        comments: [],
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
      setStories([newStory, ...stories]);
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
  };

  const closeReader = () => {
    setReadingStory(null);
    setReaderPageIndex(0);
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const updatedStories = stories.map(s => {
      if (s.id === readingStory.id) {
        const comment = {
          id: Date.now(),
          author: '@you',
          text: newComment.trim(),
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
        const updatedStory = { ...s, comments: [...(s.comments || []), comment] };
        setReadingStory(updatedStory); // Update currently reading story too
        return updatedStory;
      }
      return s;
    });

    setStories(updatedStories);
    setNewComment('');
  };

  if (readingStory) {
    const isFirstPage = readerPageIndex === 0;
    const isLastPage = readerPageIndex === readingStory.pages.length - 1;

    return (
      <div className="storyteller-container">
        <div className="story-page-container">
          <button className="back-btn" onClick={closeReader}>
            <FaTimes style={{ position: 'relative', top: '1px' }} />
            Back to Stories
          </button>

          <img src={readingStory.cover} alt="Cover" className="page-cover" />

          <div className="reader-header">
            <span
              className="reader-emotion"
              style={{
                background: `${getEmotionDetails(readingStory.emotion).color}33`,
                color: getEmotionDetails(readingStory.emotion).color
              }}
            >
              {getEmotionDetails(readingStory.emotion).label}
            </span>
            <h2>{readingStory.title}</h2>
            <div className="reader-author" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Written by <strong>{readingStory.author}</strong> on {readingStory.date}</span>
              {readingStory.author === '@you' && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="action-btn" onClick={startEditing}>Edit Story</button>
                  <button className="action-btn delete-btn" onClick={() => handleDeleteStory(readingStory.id)}>Delete</button>
                </div>
              )}
            </div>
          </div>

          <div className="reader-body page-anim" key={readerPageIndex}>
            {readingStory.pages[readerPageIndex]}
          </div>

          <div className="page-navigation">
            <button
              className="page-nav-btn"
              onClick={() => setReaderPageIndex(prev => prev - 1)}
              disabled={isFirstPage}
            >
              <FaChevronLeft /> Previous Page
            </button>
            <span className="page-indicator">
              Page {readerPageIndex + 1} of {readingStory.pages.length}
            </span>
            <button
              className="page-nav-btn"
              onClick={() => setReaderPageIndex(prev => prev + 1)}
              disabled={isLastPage}
            >
              Next Page <FaChevronRight />
            </button>
          </div>

          {/* Comments Section */}
          <div className="comments-section">
            <h3>Community Support & Thoughts</h3>
            <div className="comments-list">
              {readingStory.comments && readingStory.comments.length > 0 ? (
                readingStory.comments.map(comment => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <strong>{comment.author}</strong>
                      <span className="comment-date">{comment.date}</span>
                    </div>
                    <p>{comment.text}</p>
                  </div>
                ))
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
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
              <div className="cover-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
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
    <div className="storyteller-container">
      {/* Header */}
      <div className="page-header fade-in-up">
        <div>
          <h1>{currentTab === 'community' ? 'Community Stories' : 'My Diary'}</h1>
          <p>{currentTab === 'community' ? 'Read, share, and connect feeling to feeling.' : 'Your personal space to manage stories & reflections.'}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            className="create-story-btn"
            style={{ background: 'transparent', border: '1px solid var(--glass-border)' }}
            onClick={() => setCurrentTab(currentTab === 'community' ? 'my-stories' : 'community')}
          >
            {currentTab === 'community' ? 'My Diary' : 'Back to Community'}
          </button>
          <button className="create-story-btn" onClick={startWriting}>
            <FaPen size={14} /> Write Story
          </button>
        </div>
      </div>

      {currentTab === 'community' && (
        <>
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
        </>
      )}

      {(currentTab === 'my-stories' || currentTab === 'my-comments') && (
        <>
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
              {(() => {
                const myComments = [];
                stories.forEach(story => {
                  if (story.comments) {
                    story.comments.forEach(comment => {
                      if (comment.author === '@you') {
                        myComments.push({ story, comment });
                      }
                    });
                  }
                });

                if (myComments.length === 0) {
                  return (
                    <div className="empty-state">
                      <FaCommentDots className="empty-state-icon" />
                      <h3>No comments yet</h3>
                      <p>You haven't shared your thoughts on any story yet. Read a story from the community and leave a kind or supportive message!</p>
                      <button className="create-story-btn" onClick={() => setCurrentTab('community')}>
                        Browse Community Stories
                      </button>
                    </div>
                  );
                }

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {myComments.map(({ story, comment }, idx) => (
                      <div key={idx} className="comment-item" style={{ cursor: 'pointer' }} onClick={() => setReadingStory(story)}>
                        <div className="comment-header">
                          <strong>Commented on: {story.title}</strong>
                          <span className="comment-date">{comment.date}</span>
                        </div>
                        <p>{comment.text}</p>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Storyteller;
