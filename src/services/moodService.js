const API_BASE = 'http://localhost:5000/api';

// Get auth token
const getAuthToken = () => {
  return localStorage.getItem('mentora_token');
};

// Generic API call helper
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Mood API methods
export const moodService = {
  // Create new mood entry
  createMoodEntry: async (moodData) => {
    return apiCall('/mood', {
      method: 'POST',
      body: JSON.stringify(moodData)
    });
  },

  // Get all mood entries for the user
  getMoodEntries: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const endpoint = params ? `/mood?${params}` : '/mood';
    return apiCall(endpoint);
  },

  // Get a specific mood entry
  getMoodEntry: async (id) => {
    return apiCall(`/mood/${id}`);
  },

  // Update a mood entry
  updateMoodEntry: async (id, updateData) => {
    return apiCall(`/mood/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  },

  // Delete a mood entry
  deleteMoodEntry: async (id) => {
    return apiCall(`/mood/${id}`, {
      method: 'DELETE'
    });
  },

  // Get mood statistics
  getMoodStats: async (period = '30') => {
    return apiCall(`/mood/stats?period=${period}`);
  }
};

export default moodService;
