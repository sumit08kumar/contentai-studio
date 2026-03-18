import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { blogService } from '../services/blog';
import BlogPreview from '../components/blog/BlogPreview';
import BlogPlan from '../components/blog/BlogPlan';
import EvidenceViewer from '../components/blog/EvidenceViewer';
import ImageGallery from '../components/blog/ImageGallery';
import Loading from '../components/common/Loading';
import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const TABS = ['Preview', 'Plan', 'Evidence', 'Images'];

const BlogViewPage = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Preview');

  useEffect(() => {
    fetchBlog();
  }, [blogId]);

  const fetchBlog = async () => {
    try {
      const data = await blogService.getBlog(blogId);
      setBlog(data);
    } catch (err) {
      toast.error('Failed to load blog');
      navigate('/blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this blog and all associated data?')) return;
    try {
      await blogService.deleteBlog(blogId);
      toast.success('Blog deleted');
      navigate('/blogs');
    } catch (err) {
      toast.error('Failed to delete blog');
    }
  };

  const handleDownloadMarkdown = () => {
    const token = localStorage.getItem('youtube_rag_token');
    const url = blogService.getMarkdownDownloadUrl(blogId);
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${blog?.title || 'blog'}.md`;
        a.click();
      })
      .catch(() => toast.error('Download failed'));
  };

  const handleDownloadBundle = () => {
    const token = localStorage.getItem('youtube_rag_token');
    const url = blogService.getBundleDownloadUrl(blogId);
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `blog_${blogId}_bundle.zip`;
        a.click();
      })
      .catch(() => toast.error('Download failed'));
  };

  if (loading) return <Loading message="Loading blog..." />;
  if (!blog) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/blogs')}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span className="font-medium">Back to Blogs</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadMarkdown}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>Markdown</span>
          </button>
          <button
            onClick={handleDownloadBundle}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>Bundle</span>
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete blog"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 flex space-x-1 mb-6">
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

      {/* Content */}
      {activeTab === 'Preview' && <BlogPreview blog={blog} />}
      {activeTab === 'Plan' && (
        <BlogPlan
          tasks={blog.tasks || []}
          plan={{
            audience: blog.audience,
            tone: blog.tone,
            blog_kind: blog.blog_kind,
          }}
        />
      )}
      {activeTab === 'Evidence' && (
        <EvidenceViewer evidence={blog.evidence || []} />
      )}
      {activeTab === 'Images' && (
        <ImageGallery images={blog.images || []} />
      )}
    </div>
  );
};

export default BlogViewPage;
