import api from './api';

export const chatService = {
  askQuestion: async (videoId, question, verbose = false) => {
    const response = await api.post('/api/chat/ask', {
      video_id: videoId,
      question,
      verbose,
    });
    return response.data;
  },

  askWithMemory: async (videoId, question, sessionId = null) => {
    const response = await api.post('/api/chat/ask-with-memory', {
      video_id: videoId,
      question,
      session_id: sessionId,
    });
    return response.data;
  },

  getChatHistory: async (videoId) => {
    const response = await api.get(`/api/chat/history/${videoId}`);
    return response.data;
  },

  exportChat: async (videoId) => {
    const response = await api.post(`/api/chat/export/${videoId}`);
    return response.data;
  },

  clearHistory: async (videoId) => {
    const response = await api.delete(`/api/chat/history/${videoId}`);
    return response.data;
  },
};

export const videoService = {
  processVideo: async (videoUrl, chunkSize = 1000, chunkOverlap = 200) => {
    const response = await api.post('/api/videos/process', {
      video_url: videoUrl,
      chunk_size: chunkSize,
      chunk_overlap: chunkOverlap,
    });
    return response.data;
  },

  getVideos: async () => {
    const response = await api.get('/api/videos/');
    return response.data;
  },

  getVideo: async (videoId) => {
    const response = await api.get(`/api/videos/${videoId}`);
    return response.data;
  },

  deleteVideo: async (videoId) => {
    const response = await api.delete(`/api/videos/${videoId}`);
    return response.data;
  },

  getVideoSummary: async (videoId) => {
    const response = await api.get(`/api/videos/${videoId}/summary`);
    return response.data;
  },
};
