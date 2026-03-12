import { GlobeAltIcon, LinkIcon } from '@heroicons/react/24/outline';

const EvidenceViewer = ({ evidence = [] }) => {
  if (!evidence.length) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
        <GlobeAltIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-600 mb-1">
          No Research Evidence
        </h3>
        <p className="text-sm text-gray-500">
          This blog was generated in closed-book mode (no web research needed).
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <div className="flex items-center space-x-2 mb-6">
        <GlobeAltIcon className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">
          Research Evidence
        </h2>
        <span className="text-sm text-gray-500">
          ({evidence.length} sources)
        </span>
      </div>

      <div className="space-y-4">
        {evidence.map((item, idx) => (
          <div
            key={item.id || idx}
            className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 text-xs font-bold rounded-full flex-shrink-0">
                    {idx + 1}
                  </span>
                  <h4 className="font-semibold text-gray-900 truncate">
                    {item.title || 'Untitled Source'}
                  </h4>
                </div>

                {item.snippet && (
                  <p className="text-sm text-gray-600 ml-8 mt-1 line-clamp-3">
                    {item.snippet}
                  </p>
                )}

                <div className="flex items-center space-x-4 ml-8 mt-2">
                  {item.source && (
                    <span className="text-xs text-gray-400">{item.source}</span>
                  )}
                  {item.published_at && (
                    <span className="text-xs text-gray-400">
                      {item.published_at}
                    </span>
                  )}
                </div>
              </div>

              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 ml-3 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Open source"
                >
                  <LinkIcon className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EvidenceViewer;
