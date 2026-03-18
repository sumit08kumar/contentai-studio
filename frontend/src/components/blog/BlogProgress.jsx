const stages = [
  { key: 'initializing', label: 'Initializing', icon: '⚙️' },
  { key: 'Analyzing topic', label: 'Analyzing Topic', icon: '🔍' },
  { key: 'Creating blog plan', label: 'Creating Plan', icon: '📋' },
  { key: 'Researching web sources', label: 'Researching', icon: '🌐' },
  { key: 'Preparing sections', label: 'Preparing', icon: '📝' },
  { key: 'Writing sections', label: 'Writing', icon: '✍️' },
  { key: 'Merging content', label: 'Merging', icon: '🔗' },
  { key: 'Planning images', label: 'Image Planning', icon: '🖼️' },
  { key: 'Finalizing blog', label: 'Finalizing', icon: '✅' },
];

const BlogProgress = ({ progress = {} }) => {
  const currentStage = progress.current_stage || 'initializing';

  // Find the index of the current stage
  const currentIdx = stages.findIndex(
    (s) =>
      s.key === currentStage ||
      s.label.toLowerCase() === currentStage.toLowerCase()
  );
  const activeIdx = currentIdx >= 0 ? currentIdx : 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      {/* Spinner */}
      <div className="flex items-center justify-center mb-6">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-purple-200 border-t-purple-600"></div>
      </div>

      <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
        Generating Your Blog...
      </h3>
      <p className="text-center text-gray-500 mb-8 text-sm">
        This usually takes 30–90 seconds depending on the topic.
      </p>

      {/* Stage progress */}
      <div className="space-y-2 mb-8">
        {stages.map((stage, idx) => {
          let stateClass = 'text-gray-400 bg-gray-50';
          if (idx < activeIdx)
            stateClass = 'text-green-700 bg-green-50 border-green-200';
          else if (idx === activeIdx)
            stateClass =
              'text-purple-700 bg-purple-50 border-purple-300 font-semibold animate-pulse';

          return (
            <div
              key={stage.key}
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg border transition-all ${stateClass}`}
            >
              <span className="text-lg">{stage.icon}</span>
              <span className="text-sm">{stage.label}</span>
              {idx < activeIdx && (
                <span className="ml-auto text-green-500 text-xs">✓</span>
              )}
              {idx === activeIdx && (
                <span className="ml-auto">
                  <span className="inline-block h-2 w-2 rounded-full bg-purple-500 animate-ping"></span>
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Extra stats */}
      <div className="grid grid-cols-2 gap-4">
        {progress.mode && (
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500 uppercase">Mode</p>
            <p className="text-sm font-semibold text-gray-900 capitalize">
              {progress.mode.replace('_', ' ')}
            </p>
          </div>
        )}
        {progress.evidence_count > 0 && (
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500 uppercase">Sources Found</p>
            <p className="text-sm font-semibold text-gray-900">
              {progress.evidence_count}
            </p>
          </div>
        )}
        {progress.total_sections > 0 && (
          <div className="bg-gray-50 rounded-xl p-3 text-center col-span-2">
            <p className="text-xs text-gray-500 uppercase">Sections Written</p>
            <p className="text-sm font-semibold text-gray-900">
              {progress.completed_sections || 0} / {progress.total_sections}
            </p>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    ((progress.completed_sections || 0) /
                      progress.total_sections) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogProgress;
