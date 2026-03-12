import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { blogService } from '../services/blog';
import Loading from '../components/common/Loading';
import {
  DocumentTextIcon,
  TrashIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const statusConfig = {
  completed: {
    icon: CheckCircleIcon,
    color: 'text-green-600 bg-green-50',
    label: 'Completed',
  },
  processing: {
    icon: ArrowPathIcon,
    color: 'text-yellow-600 bg-yellow-50',
    label: 'Processing',
  },
  failed: {
    icon: ExclamationCircleIcon,
    color: 'text-red-600 bg-red-50',
    label: 'Failed',
  },
};

const BlogListPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const data = await blogService.listBlogs();
      setBlogs(data.blogs || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blogId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this blog and all associated data?')) return;
    try {
      await blogService.deleteBlog(blogId);
      toast.success('Blog deleted');
      fetchBlogs();
    } catch (err) {
      toast.error('Failed to delete blog');
    }
  };

  if (loading) return <Loading message="Loading your blogs..." />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <DocumentTextIcon className="h-7 w-7 text-purple-600" />
            <span>My Blogs</span>
          </h1>
          <p className="text-gray-500 mt-1">
            {total} blog{total !== 1 ? 's' : ''} generated
          </p>
        </div>
        <Link
          to="/blog/new"
          className="mt-4 sm:mt-0 inline-flex items-center space-x-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Blog</span>
        </Link>
      </div>

      {/* Empty state */}
      {blogs.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No Blogs Yet
          </h3>
          <p className="text-gray-500 mb-6">
            Generate your first AI-powered blog post!
          </p>
          <Link
            to="/blog/new"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Generate Blog</span>
          </Link>
        </div>
      )}

      {/* Blog list */}
      <div className="space-y-3">
        {blogs.map((blog) => {
          const st = statusConfig[blog.status] || statusConfig.processing;
          const StatusIcon = st.icon;

          return (
            <div
              key={blog.id}
              onClick={() => {
                if (blog.status === 'completed') {
                  navigate(`/blog/${blog.id}`);
                }
              }}
              className={`bg-white rounded-xl border border-gray-200 p-5 hover:border-purple-300 hover:shadow-md transition-all ${
                blog.status === 'completed' ? 'cursor-pointer' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate text-lg">
                    {blog.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 truncate">
                    {blog.topic}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium ${st.color}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      <span>{st.label}</span>
                    </span>

                    {blog.mode && (
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                        {blog.mode.replace('_', ' ')}
                      </span>
                    )}
                    {blog.blog_kind && (
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs rounded-full capitalize">
                        {blog.blog_kind}
                      </span>
                    )}
                    {blog.word_count > 0 && (
                      <span className="text-xs text-gray-400">
                        {blog.word_count.toLocaleString()} words
                      </span>
                    )}
                    {blog.image_count > 0 && (
                      <span className="text-xs text-gray-400">
                        🖼️ {blog.image_count}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {blog.created_at && (
                    <span className="hidden sm:inline-flex items-center text-xs text-gray-400">
                      <ClockIcon className="h-3.5 w-3.5 mr-1" />
                      {format(new Date(blog.created_at), 'MMM d, yyyy')}
                    </span>
                  )}
                  <button
                    onClick={(e) => handleDelete(blog.id, e)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete blog"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BlogListPage;
