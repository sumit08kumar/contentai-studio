import {
  CheckCircleIcon,
  BeakerIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

const BlogPlan = ({ tasks = [], plan = {} }) => {
  if (!tasks.length && !plan) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Blog Plan</h2>

      {/* Plan overview */}
      {plan && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {plan.audience && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                Audience
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {plan.audience}
              </p>
            </div>
          )}
          {plan.tone && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                Tone
              </p>
              <p className="text-sm font-semibold text-gray-900">{plan.tone}</p>
            </div>
          )}
          {plan.blog_kind && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                Type
              </p>
              <p className="text-sm font-semibold text-gray-900 capitalize">
                {plan.blog_kind}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tasks / Sections */}
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Sections ({tasks.length})
      </h3>
      <div className="space-y-3">
        {tasks.map((task, idx) => (
          <div
            key={task.id || idx}
            className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                    {task.task_order || idx + 1}
                  </span>
                  <h4 className="font-semibold text-gray-900">{task.title}</h4>
                </div>
                {task.goal && (
                  <p className="text-sm text-gray-600 ml-8">{task.goal}</p>
                )}
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                ~{task.target_words} words
              </span>
            </div>

            {/* Tags and flags */}
            <div className="flex flex-wrap items-center gap-2 mt-3 ml-8">
              {task.requires_research && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                  <BeakerIcon className="h-3 w-3" />
                  <span>Research</span>
                </span>
              )}
              {task.requires_citations && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">
                  <DocumentTextIcon className="h-3 w-3" />
                  <span>Citations</span>
                </span>
              )}
              {task.requires_code && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-orange-50 text-orange-700 text-xs rounded-full">
                  <CodeBracketIcon className="h-3 w-3" />
                  <span>Code</span>
                </span>
              )}
              {task.tags?.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center space-x-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  <TagIcon className="h-3 w-3" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogPlan;
