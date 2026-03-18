import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BlogForm from '../components/blog/BlogForm';
import BlogPreview from '../components/blog/BlogPreview';
import BlogPlan from '../components/blog/BlogPlan';
import EvidenceViewer from '../components/blog/EvidenceViewer';
import ImageGallery from '../components/blog/ImageGallery';
import BlogProgress from '../components/blog/BlogProgress';
import { blogService } from '../services/blog';
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const TABS = ['Preview', 'Plan', 'Evidence', 'Images'];

const BlogPage = () => {
  const [currentBlogId, setCurrentBlogId] = useState(null);
  const [blogData, setBlogData] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | generating | completed | error
  const [progress, setProgress] = useState({});
  const [activeTab, setActiveTab] = useState('Preview');
  const pollingRef = useRef(null);
  const navigate = useNavigate();

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handleGenerateBlog = async (topic, asOf) => {
    try {
      setStatus('generating');
      setProgress({});
      setBlogData(null);

      const response = await blogService.generateBlog(topic, asOf);
      setCurrentBlogId(response.blog_id);

      // Start polling
      pollBlogStatus(response.blog_id);
    } catch (err) {
      console.error('Blog generation failed:', err);
      toast.error(
        err.response?.data?.detail || 'Failed to start blog generation'
      );
      setStatus('error');
    }
  };

  const pollBlogStatus = (blogId) => {
    pollingRef.current = setInterval(async () => {
      try {
        const statusData = await blogService.getBlogStatus(blogId);
        setProgress(statusData.progress || {});

        if (statusData.status === 'completed') {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          setStatus('completed');

          // Fetch full blog
          const fullBlog = await blogService.getBlog(blogId);
          setBlogData(fullBlog);
          toast.success('Blog generated successfully!');
        } else if (statusData.status === 'failed') {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          setStatus('error');
          toast.error('Blog generation failed. Please try again.');
        }
      } catch (err) {
        console.error('Status poll failed:', err);
        clearInterval(pollingRef.current);
        pollingRef.current = null;
        setStatus('error');
      }
    }, 2500);
  };

  const handleDownloadMarkdown = () => {
    if (!currentBlogId) return;
    const token = localStorage.getItem('youtube_rag_token');
    const url = blogService.getMarkdownDownloadUrl(currentBlogId);
    // Use fetch with auth header for download
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${blogData?.title || 'blog'}.md`;
        a.click();
      })
      .catch(() => toast.error('Download failed'));
  };

  const handleDownloadBundle = () => {
    if (!currentBlogId) return;
    const token = localStorage.getItem('youtube_rag_token');
    const url = blogService.getBundleDownloadUrl(currentBlogId);
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `blog_${currentBlogId}_bundle.zip`;
        a.click();
      })
      .catch(() => toast.error('Download failed'));
  };

  const handleReset = () => {
    setStatus('idle');
    setBlogData(null);
    setCurrentBlogId(null);
    setProgress({});
    setActiveTab('Preview');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <DocumentTextIcon className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            AI Blog Generator
          </h1>
        </div>
        <p className="text-gray-500 ml-11">
          Create high-quality technical blogs with AI-powered research and image
          generation.
        </p>
      </div>

      {/* Idle → Show form */}
      {status === 'idle' && <BlogForm onSubmit={handleGenerateBlog} />}

      {/* Generating → Show progress */}
      {status === 'generating' && <BlogProgress progress={progress} />}

      {/* Completed → Show results with tabs */}
      {status === 'completed' && blogData && (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 flex space-x-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'Preview' && <BlogPreview blog={blogData} />}
          {activeTab === 'Plan' && (
            <BlogPlan
              tasks={blogData.tasks || []}
              plan={{
                audience: blogData.audience,
                tone: blogData.tone,
                blog_kind: blogData.blog_kind,
              }}
            />
          )}
          {activeTab === 'Evidence' && (
            <EvidenceViewer evidence={blogData.evidence || []} />
          )}
          {activeTab === 'Images' && (
            <ImageGallery images={blogData.images || []} />
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownloadMarkdown}
              className="inline-flex items-center space-x-2 px-5 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              <span>Download Markdown</span>
            </button>
            <button
              onClick={handleDownloadBundle}
              className="inline-flex items-center space-x-2 px-5 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              <span>Download Bundle (MD + Images)</span>
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center space-x-2 px-5 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
            >
              <ArrowPathIcon className="h-5 w-5" />
              <span>Generate Another</span>
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-red-800 mb-2">
            Generation Failed
          </h3>
          <p className="text-red-600 mb-6">
            Something went wrong while generating your blog. Please try again.
          </p>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogPage;
