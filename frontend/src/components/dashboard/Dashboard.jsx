import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { videoService } from '../../services/chat';
import VideoList from './VideoList';
import Statistics from './Statistics';
import Loading from '../common/Loading';
import { validateYouTubeUrl } from '../../utils/validation';
import { PlusIcon, LinkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const data = await videoService.getVideos();
      setVideos(data.videos);
    } catch (err) {
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessVideo = async (e) => {
    e.preventDefault();
    if (!validateYouTubeUrl(videoUrl)) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }

    setProcessing(true);
    try {
      const result = await videoService.processVideo(videoUrl);
      toast.success('Video processed successfully!');
      setVideoUrl('');
      setShowUrlInput(false);
      fetchVideos();
      // Navigate to chat
      navigate(`/chat/${result.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to process video');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Delete this video and all its chat history?')) return;
    try {
      await videoService.deleteVideo(videoId);
      toast.success('Video deleted');
      fetchVideos();
    } catch (err) {
      toast.error('Failed to delete video');
    }
  };

  if (loading) return <Loading message="Loading your dashboard..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.username}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Manage your videos and conversations</p>
        </div>
        <button
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="btn-primary mt-4 sm:mt-0 flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Process New Video</span>
        </button>
      </div>

      {/* URL Input */}
      {showUrlInput && (
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Process a YouTube Video</h3>
          <form onSubmit={handleProcessVideo} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="input-field pl-10"
                placeholder="https://www.youtube.com/watch?v=..."
                disabled={processing}
              />
            </div>
            <button type="submit" disabled={processing} className="btn-primary whitespace-nowrap">
              {processing ? 'Processing...' : 'Process Video'}
            </button>
          </form>
          {processing && (
            <p className="text-sm text-gray-500 mt-3">
              ⏳ Extracting transcript and creating embeddings... This may take a moment.
            </p>
          )}
        </div>
      )}

      {/* Statistics */}
      <Statistics videos={videos} />

      {/* Blog Generator Card */}
      <div className="mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <span>✍️</span>
              <span>AI Blog Generator</span>
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Create professional blog posts with AI-powered research and image generation.
            </p>
          </div>
          <div className="flex space-x-3 mt-3 sm:mt-0">
            <button
              onClick={() => navigate('/blog/new')}
              className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              Generate Blog
            </button>
            <button
              onClick={() => navigate('/blogs')}
              className="px-4 py-2 bg-white text-purple-600 text-sm font-medium rounded-lg border border-purple-300 hover:bg-purple-50 transition-colors"
            >
              View All Blogs
            </button>
          </div>
        </div>
      </div>

      {/* Video List */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Videos</h2>
        <VideoList
          videos={videos}
          onDelete={handleDeleteVideo}
          onChat={(videoId) => navigate(`/chat/${videoId}`)}
        />
      </div>
    </div>
  );
};

export default Dashboard;
