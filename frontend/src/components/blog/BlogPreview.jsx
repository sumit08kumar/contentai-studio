import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const BlogPreview = ({ blog }) => {
  if (!blog) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      {/* Header */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {blog.title}
        </h1>
        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
          <span className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full">
            📊 {blog.word_count?.toLocaleString()} words
          </span>
          <span className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full">
            🖼️ {blog.image_count} images
          </span>
          {blog.mode && (
            <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
              🔍 {blog.mode}
            </span>
          )}
          {blog.blog_kind && (
            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
              📝 {blog.blog_kind}
            </span>
          )}
        </div>
      </div>

      {/* Markdown content */}
      <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-purple-600 prose-code:text-purple-600 prose-pre:bg-gray-900 prose-pre:text-gray-100">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            img: ({ node, ...props }) => (
              <div className="my-6">
                <img
                  {...props}
                  className="rounded-xl shadow-md w-full object-cover"
                  loading="lazy"
                />
                {props.alt && (
                  <p className="text-center text-sm text-gray-500 mt-2 italic">
                    {props.alt}
                  </p>
                )}
              </div>
            ),
            code: ({ node, inline, className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <div className="relative">
                  <div className="absolute top-0 right-0 px-3 py-1 text-xs text-gray-400 bg-gray-800 rounded-bl-lg">
                    {match[1]}
                  </div>
                  <pre className={className} {...props}>
                    <code className={className}>{children}</code>
                  </pre>
                </div>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {blog.markdown_content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default BlogPreview;
