import React, { useState, useEffect } from 'react';
import './MoodHistory.css';
import { moodService } from '../services/moodService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MoodHistory = () => {
  const { isGuest } = useAuth();
  const navigate = useNavigate();
  const [moodEntries, setMoodEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState(null);
  const [expandedEntries, setExpandedEntries] = useState(new Set());

  // Mood level configurations (matching MoodTracker)
  const MOOD_META = {
    thriving: { label: "Thriving ", color: "#2a9d8f", bg: "rgba(42,157,143,0.12)" },
    good: { label: "Good ", color: "#4caf7d", bg: "rgba(76,175,125,0.12)" },
    okay: { label: "Okay ", color: "#f4a261", bg: "rgba(244,162,97,0.12)" },
    low: { label: "Low ", color: "#e07a5f", bg: "rgba(224,122,95,0.12)" },
    struggling: { label: "Struggling ", color: "#457b9d", bg: "rgba(69,123,157,0.12)" },
  };

  useEffect(() => {
    if (isGuest) {
      setLoading(false);
      return;
    }
    fetchMoodEntries();
    fetchMoodStats();
  }, [page, isGuest]);

  const fetchMoodEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await moodService.getMoodEntries({ page, limit: 10 });
      setMoodEntries(response.moodEntries);
      setTotalPages(response.pagination.pages);
    } catch (err) {
      console.error('Error fetching mood entries:', err);
      setError(err.message || 'Failed to fetch mood entries');
    } finally {
      setLoading(false);
    }
  };

  const fetchMoodStats = async () => {
    try {
      const statsData = await moodService.getMoodStats('30'); // Last 30 days
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching mood stats:', err);
    }
  };

  const handleDelete = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this mood entry?')) {
      return;
    }

    try {
      setDeleting(entryId);
      setDeleteError(null);
      await moodService.deleteMoodEntry(entryId);
      
      // Remove from local state
      setMoodEntries(prev => prev.filter(entry => entry.id !== entryId));
      
      // Refresh stats
      fetchMoodStats();
    } catch (err) {
      console.error('Error deleting mood entry:', err);
      setDeleteError(err.message || 'Failed to delete mood entry');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIntensityColor = (intensity) => {
    if (intensity >= 8) return '#4caf7d'; // High - green
    if (intensity >= 6) return '#f4a261'; // Medium-high - orange
    if (intensity >= 4) return '#e07a5f'; // Medium - red-orange
    return '#457b9d'; // Low - blue
  };

  const toggleExpandedEntry = (entryId) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  const parseExerciseDetails = (detailsString) => {
    try {
      return JSON.parse(detailsString);
    } catch (error) {
      return null;
    }
  };

  if (isGuest) {
    return (
      <div className="mood-history-page">
        <div className="mood-history-header">
          <h1>Your Mood Journey</h1>
          <p>Track your emotional patterns and progress over time</p>
        </div>
        
        <div className="empty-state">
          <div className="empty-icon"> </div>
          <h3>Login Required</h3>
          <p>Please login or sign up to view and save your mood history.</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1.5rem" }}>
            <button 
              onClick={() => navigate('/chat/profile')}
              className="start-tracking-btn"
            >
              Login or Sign Up
            </button>
            <button 
              onClick={() => navigate('/chat/mood-tracker')}
              className="activity-btn-outline"
              style={{ border: "1px solid #4299e1", color: "#4299e1" }}
            >
              Try Mood Tracker
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && moodEntries.length === 0) {
    return (
      <div className="mood-history-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your mood history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mood-history-page">
      <button className="mh-back-btn" onClick={() => navigate('/chat/mood-tracker')}>
        ← Back
      </button>
      <div className="mood-history-header">
        <h1>Your Mood Journey</h1>
        <p>Track your emotional patterns and progress over time</p>
      </div>

      {/* Statistics Section */}
      {stats && (
        <div className="stats-section">
          <h2>Last 30 Days Overview</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.totalEntries}</div>
              <div className="stat-label">Total Check-ins</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.avgIntensity.toFixed(1)}</div>
              <div className="stat-label">Average Intensity</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{Object.keys(stats.moodCounts).length}</div>
              <div className="stat-label">Different Moods</div>
            </div>
          </div>
          
          {/* Mood Distribution */}
          <div className="mood-distribution">
            <h3>Mood Distribution</h3>
            <div className="mood-bars">
              {Object.entries(stats.moodCounts).map(([mood, count]) => {
                const meta = MOOD_META[mood];
                const percentage = (count / stats.totalEntries) * 100;
                return (
                  <div key={mood} className="mood-bar-item">
                    <div className="mood-bar-label">
                      <span style={{ color: meta.color }}>{meta.label}</span>
                      <span className="mood-count">{count}</span>
                    </div>
                    <div className="mood-bar-container">
                      <div 
                        className="mood-bar" 
                        style={{ 
                          width: `${percentage}%`, 
                          backgroundColor: meta.color 
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchMoodEntries} className="retry-btn">Retry</button>
        </div>
      )}

      {deleteError && (
        <div className="error-message">
          <p>{deleteError}</p>
          <button onClick={() => setDeleteError(null)} className="close-btn">×</button>
        </div>
      )}

      {/* Mood Entries List */}
      <div className="mood-entries-section">
        <h2>Mood History</h2>
        {moodEntries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"> </div>
            <h3>No mood entries yet</h3>
            <p>Start tracking your mood by completing a mood exercise!</p>
            <button 
              onClick={() => window.location.href = '/chat/mood-tracker'}
              className="start-tracking-btn"
            >
              Start Mood Tracking
            </button>
          </div>
        ) : (
          <>
            <div className="entries-list">
              {moodEntries.map((entry) => {
                const meta = MOOD_META[entry.mood] || MOOD_META.okay;
                return (
                  <div key={entry.id} className="mood-entry-card">
                    <div className="entry-header">
                      <div className="mood-info">
                        <span 
                          className="mood-badge" 
                          style={{ 
                            backgroundColor: meta.bg, 
                            color: meta.color,
                            border: `1px solid ${meta.color}`
                          }}
                        >
                          {meta.label}
                        </span>
                        <div className="intensity-indicator">
                          <span 
                            className="intensity-dot" 
                            style={{ backgroundColor: getIntensityColor(entry.intensity) }}
                          />
                          <span className="intensity-text">Intensity {entry.intensity}/10</span>
                        </div>
                      </div>
                      <div className="entry-date">
                        {formatDate(entry.createdAt)}
                      </div>
                    </div>
                    
                    {entry.notes && (
                      <div className="entry-notes">
                        <p>{entry.notes}</p>
                      </div>
                    )}
                    
                    {/* Exercise Details Section */}
                    {entry.exerciseDetails && (
                      <div className="exercise-details-section">
                        <button 
                          onClick={() => toggleExpandedEntry(entry.id)}
                          className="view-details-btn"
                        >
                          {expandedEntries.has(entry.id) ? 'Hide Details' : 'View Exercise Details'}
                          <span className={`expand-icon ${expandedEntries.has(entry.id) ? 'expanded' : ''}`}>
                            {expandedEntries.has(entry.id) ? '×' : '+'}
                          </span>
                        </button>
                        
                        {expandedEntries.has(entry.id) && (
                          <div className="exercise-details">
                            {(() => {
                              const details = parseExerciseDetails(entry.exerciseDetails);
                              if (!details) return <p>Details not available</p>;
                              
                              return (
                                <div className="details-content">
                                  {/* Score Breakdown */}
                                  <div className="score-breakdown">
                                    <h4>Exercise Score</h4>
                                    <div className="score-info">
                                      <span className="score-value">{details.scoreBreakdown.totalScore}/{details.scoreBreakdown.maxScore}</span>
                                      <span className="score-label">points earned</span>
                                    </div>
                                  </div>
                                  
                                  {/* Quiz Answers */}
                                  <div className="quiz-answers">
                                    <h4>Your Quiz Answers</h4>
                                    <div className="answers-list">
                                      {details.quizAnswers.map((answer, index) => (
                                        <div key={index} className="answer-item">
                                          <div className="question-text">{answer.question}</div>
                                          <div className="answer-text">{answer.answer}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  {/* Activities Plan */}
                                  <div className="activities-plan">
                                    <h4>Your Activities Plan</h4>
                                    <div className="activities-list">
                                      {details.activitiesPlan.map((activity, index) => (
                                        <div key={index} className="activity-item">
                                          <div className="activity-title">{activity.title}</div>
                                          <div className="activity-description">{activity.description}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="entry-actions">
                      <button 
                        onClick={() => handleDelete(entry.id)}
                        disabled={deleting === entry.id}
                        className="delete-btn"
                      >
                        {deleting === entry.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {page} of {totalPages}
                </span>
                <button 
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MoodHistory;
