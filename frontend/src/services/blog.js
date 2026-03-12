import api from './api';

export const blogService = {
  /**
   * Start generating a new blog post (async background task).
   * Returns { blog_id, status, message }.
   */
  generateBlog: async (topic, asOf = null) => {
    const payload = { topic };
    if (asOf) payload.as_of = asOf;
    const response = await api.post('/api/blogs/generate', payload);
    return response.data;
  },

  /**
   * Poll for generation status.
   * Returns { blog_id, status, message, progress }.
   */
  getBlogStatus: async (blogId) => {
    const response = await api.get(`/api/blogs/${blogId}/status`);
    return response.data;
  },

  /**
   * Get all blogs for the logged-in user.
   * Returns { blogs: [...], total }.
   */
  listBlogs: async (skip = 0, limit = 50) => {
    const response = await api.get('/api/blogs', { params: { skip, limit } });
    return response.data;
  },

  /**
   * Get a single blog with full content, tasks, evidence, images.
   */
  getBlog: async (blogId) => {
    const response = await api.get(`/api/blogs/${blogId}`);
    return response.data;
  },

  /**
   * Update a blog (edit content, title, or status).
   */
  updateBlog: async (blogId, data) => {
    const response = await api.put(`/api/blogs/${blogId}`, data);
    return response.data;
  },

  /**
   * Delete a blog and all associated data.
   */
  deleteBlog: async (blogId) => {
    const response = await api.delete(`/api/blogs/${blogId}`);
    return response.data;
  },

  /**
   * Get download URL for markdown file.
   */
  getMarkdownDownloadUrl: (blogId) => {
    const baseUrl = api.defaults.baseURL || '';
    return `${baseUrl}/api/blogs/${blogId}/download/markdown`;
  },

  /**
   * Get download URL for ZIP bundle (markdown + images).
   */
  getBundleDownloadUrl: (blogId) => {
    const baseUrl = api.defaults.baseURL || '';
    return `${baseUrl}/api/blogs/${blogId}/download/bundle`;
  },
};
