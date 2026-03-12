import { useState } from 'react';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

const BlogForm = ({ onSubmit, loading = false }) => {
  const [topic, setTopic] = useState('');
  const [asOf, setAsOf] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (topic.trim()) {
      onSubmit(topic.trim(), asOf);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <PencilSquareIcon className="h-6 w-6 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          What do you want to write about?
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Topic */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blog Topic <span className="text-red-500">*</span>
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. 'Understanding React Server Components', 'Latest developments in AI', 'How to build a REST API with FastAPI'"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-shadow"
            rows={4}
            required
            disabled={loading}
          />
          <p className="mt-1.5 text-sm text-gray-500">
            Be specific! The AI will research and generate a comprehensive blog post.
          </p>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            As-of Date
          </label>
          <input
            type="date"
            value={asOf}
            onChange={(e) => setAsOf(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
            disabled={loading}
          />
          <p className="mt-1.5 text-sm text-gray-500">
            The date context for research (affects recency of sources).
          </p>
        </div>

        {/* Info box */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
          <h3 className="font-semibold text-purple-900 mb-2">
            What happens next?
          </h3>
          <ul className="space-y-1.5 text-sm text-purple-800">
            <li>✓ AI analyzes your topic and determines research needs</li>
            <li>✓ Searches the web for latest information (if needed)</li>
            <li>✓ Creates a structured outline with multiple sections</li>
            <li>✓ Writes comprehensive content with citations</li>
            <li>✓ Generates relevant diagrams and images</li>
            <li>✓ Delivers a publication-ready blog post</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={loading || !topic.trim()}
          className="w-full px-6 py-4 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg flex items-center justify-center space-x-2"
        >
          <span>🚀</span>
          <span>Generate Blog Post</span>
        </button>
      </form>
    </div>
  );
};

export default BlogForm;
