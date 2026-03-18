import { PhotoIcon } from '@heroicons/react/24/outline';

const ImageGallery = ({ images = [] }) => {
  if (!images.length) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
        <PhotoIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-600 mb-1">
          No Images Generated
        </h3>
        <p className="text-sm text-gray-500">
          No images were generated for this blog post.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <div className="flex items-center space-x-2 mb-6">
        <PhotoIcon className="h-6 w-6 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-900">
          Generated Images
        </h2>
        <span className="text-sm text-gray-500">
          ({images.length} images)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {images.map((img, idx) => (
          <div
            key={img.id || idx}
            className="border border-gray-200 rounded-xl overflow-hidden hover:border-green-300 transition-colors"
          >
            {/* Image */}
            {img.file_path ? (
              <img
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/${img.file_path}`}
                alt={img.alt_text || img.caption || `Image ${idx + 1}`}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <PhotoIcon className="h-10 w-10 mx-auto mb-1" />
                  <p className="text-xs">Image not generated</p>
                </div>
              </div>
            )}

            {/* Info */}
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs font-mono text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                  {img.placeholder || `IMAGE_${idx + 1}`}
                </span>
                <span className="text-xs text-gray-400">{img.size}</span>
              </div>

              {img.alt_text && (
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {img.alt_text}
                </p>
              )}
              {img.caption && (
                <p className="text-sm text-gray-600 italic">{img.caption}</p>
              )}

              {img.prompt && (
                <details className="mt-3">
                  <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                    View generation prompt
                  </summary>
                  <p className="text-xs text-gray-500 mt-1 bg-gray-50 rounded p-2">
                    {img.prompt}
                  </p>
                </details>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
