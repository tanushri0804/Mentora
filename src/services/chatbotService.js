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

// Chatbot API methods
export const chatbotService = {
  // Create new chatbot
  createChatbot: async (chatbotData) => {
    return apiCall('/chatbots', {
      method: 'POST',
      body: JSON.stringify(chatbotData)
    });
  },

  // Get all chatbots (public + user's private)
  getChatbots: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const endpoint = params ? `/chatbots?${params}` : '/chatbots';
    return apiCall(endpoint);
  },

  // Get user's chatbots only
  getUserChatbots: async () => {
    return apiCall('/chatbots/my');
  },

  // Get specific chatbot
  getChatbot: async (id) => {
    return apiCall(`/chatbots/${id}`);
  },

  // Update chatbot
  updateChatbot: async (id, updateData) => {
    return apiCall(`/chatbots/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  },

  // Delete chatbot
  deleteChatbot: async (id) => {
    return apiCall(`/chatbots/${id}`, {
      method: 'DELETE'
    });
  },

  // Clear chat history for a specific chatbot
  clearChatHistory: async (chatbotId) => {
    return apiCall(`/chat/clear/${chatbotId}`, {
      method: 'DELETE'
    });
  }
};

export default chatbotService;
