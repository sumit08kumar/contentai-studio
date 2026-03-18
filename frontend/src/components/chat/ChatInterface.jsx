import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatService, videoService } from '../../services/chat';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import VideoPlayer from './VideoPlayer';
import Loading from '../common/Loading';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

const ChatInterface = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    loadVideoAndHistory();
  }, [videoId]);

  const loadVideoAndHistory = async () => {
    try {
      const [videoData, historyData] = await Promise.all([
        videoService.getVideo(videoId),
        chatService.getChatHistory(videoId),
      ]);
      setVideo(videoData);

      // Convert history to messages
      const loadedMessages = [];
      historyData.history.forEach((item) => {
        loadedMessages.push({
          role: 'user',
          content: item.question,
          timestamp: item.created_at,
        });
        loadedMessages.push({
          role: 'assistant',
          content: item.answer,
          timestamp: item.created_at,
        });
      });
      setMessages(loadedMessages);
    } catch (err) {
      toast.error('Failed to load video data');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (question) => {
    // Add user message
    const userMsg = {
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    try {
      let response;
      if (sessionId) {
        response = await chatService.askWithMemory(videoId, question, sessionId);
        setSessionId(response.session_id);
      } else {
        response = await chatService.askWithMemory(videoId, question);
        setSessionId(response.session_id);
      }

      const assistantMsg = {
        role: 'assistant',
        content: response.answer,
        timestamp: response.created_at,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to get answer');
      // Remove the user message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  };

  const handleExport = async () => {
    try {
      const result = await chatService.exportChat(videoId);
      // Create download
      const blob = new Blob([result.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Chat exported!');
    } catch (err) {
      toast.error('Failed to export chat');
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear all chat history for this video?')) return;
    try {
      await chatService.clearHistory(videoId);
      setMessages([]);
      setSessionId(null);
      toast.success('Chat history cleared');
    } catch (err) {
      toast.error('Failed to clear history');
    }
  };

  if (loading) return <Loading message="Loading chat..." />;

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Sidebar */}
      {showSidebar && video && (
        <div className="w-80 border-r border-gray-100 bg-white flex flex-col overflow-y-auto hidden lg:flex">
          <div className="p-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Dashboard
            </button>

            {/* Video Preview */}
            <VideoPlayer videoUrl={video.video_url} videoId={video.video_id} />

            {/* Video Info */}
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                {video.title}
              </h3>
              <div className="mt-3 space-y-2 text-xs text-gray-500">
                <p>📝 Transcript: {video.transcript_length?.toLocaleString()} chars</p>
                <p>📦 Chunks: {video.num_chunks}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-2">
              <button
                onClick={handleExport}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                <span>Export Chat</span>
              </button>
              <button
                onClick={handleClearHistory}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <TrashIcon className="h-4 w-4" />
                <span>Clear History</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h2 className="font-semibold text-gray-900 text-sm line-clamp-1">
                {video?.title || 'Chat'}
              </h2>
              <p className="text-xs text-gray-400">
                {messages.length / 2} messages
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="hidden lg:block text-gray-400 hover:text-gray-600"
          >
            <InformationCircleIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <MessageList messages={messages} loading={sending} />

        {/* Input */}
        <ChatInput onSend={handleSendMessage} disabled={sending} />
      </div>
    </div>
  );
};

export default ChatInterface;
