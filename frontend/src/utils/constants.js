export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'ContentAI Studio';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  CHAT: '/chat/:videoId',
  BLOG_NEW: '/blog/new',
  BLOGS: '/blogs',
  BLOG_VIEW: '/blog/:blogId',
};

export const TOKEN_KEY = 'youtube_rag_token';
export const USER_KEY = 'youtube_rag_user';
