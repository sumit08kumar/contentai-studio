import { format } from 'date-fns';
import {
  ChatBubbleLeftIcon,
  TrashIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';

const VideoList = ({ videos, onDelete, onChat }) => {
  if (videos.length === 0) {
    return (
      <div className="card text-center py-12">
        <VideoCameraIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No videos yet</h3>
        <p className="text-gray-500 text-sm">
          Process your first YouTube video to start chatting!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map((video) => (
        <div key={video.id} className="card hover:shadow-md transition-shadow">
          {/* Thumbnail */}
          <div className="relative mb-4 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
              alt={video.title}
              className="w-full h-40 object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/320x180?text=Video';
              }}
            />
          </div>

          {/* Info */}
          <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
            {video.title || `Video ${video.video_id}`}
          </h3>

          <div className="text-xs text-gray-500 space-y-1 mb-4">
            <p>📝 {video.transcript_length?.toLocaleString() || 0} characters</p>
            <p>📦 {video.num_chunks || 0} chunks</p>
            <p>📅 {format(new Date(video.created_at), 'MMM d, yyyy')}</p>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={() => onChat(video.id)}
              className="flex-1 btn-primary text-sm py-2 flex items-center justify-center space-x-1"
            >
              <ChatBubbleLeftIcon className="h-4 w-4" />
              <span>Chat</span>
            </button>
            <button
              onClick={() => onDelete(video.id)}
              className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete video"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoList;
