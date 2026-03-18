import { extractVideoId } from '../../utils/validation';

const VideoPlayer = ({ videoUrl, videoId: ytVideoId }) => {
  const videoId = ytVideoId || extractVideoId(videoUrl || '');

  if (!videoId) {
    return (
      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-400 text-sm">No video available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
      <iframe
        className="absolute inset-0 w-full h-full rounded-lg"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

export default VideoPlayer;
