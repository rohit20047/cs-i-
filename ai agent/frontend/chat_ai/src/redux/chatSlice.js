import { createSlice } from '@reduxjs/toolkit';

// Load messages from localStorage if available
const loadMessagesFromStorage = () => {
  try {
    const savedMessages = localStorage.getItem('chatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  } catch (error) {
    console.error('Error loading messages from localStorage:', error);
    return [];
  }
};

const initialState = {
  messages: loadMessagesFromStorage(),
  sessionId: localStorage.getItem('chatSessionId') || null,
  isLoading: false,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
      // Save to localStorage
      localStorage.setItem('chatMessages', JSON.stringify(state.messages));
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
      // Save to localStorage
      localStorage.setItem('chatMessages', JSON.stringify(state.messages));
    },
    setSessionId: (state, action) => {
      state.sessionId = action.payload;
      if (action.payload) {
        localStorage.setItem('chatSessionId', action.payload);
      } else {
        localStorage.removeItem('chatSessionId');
      }
    },
    clearSession: (state) => {
      state.messages = [];
      state.sessionId = null;
      localStorage.removeItem('chatMessages');
      localStorage.removeItem('chatSessionId');
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    }
  },
});

export const { addMessage, setMessages, setSessionId, clearSession, setLoading } = chatSlice.actions;

export default chatSlice.reducer;
