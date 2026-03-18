import {
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';

const Statistics = ({ videos }) => {
  const totalChunks = videos.reduce((acc, v) => acc + (v.num_chunks || 0), 0);
  const totalChars = videos.reduce((acc, v) => acc + (v.transcript_length || 0), 0);

  const stats = [
    {
      icon: VideoCameraIcon,
      label: 'Total Videos',
      value: videos.length,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: CubeIcon,
      label: 'Total Chunks',
      value: totalChunks.toLocaleString(),
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: DocumentTextIcon,
      label: 'Characters Processed',
      value: totalChars.toLocaleString(),
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: ChatBubbleLeftRightIcon,
      label: 'Conversations',
      value: '-',
      color: 'bg-amber-100 text-amber-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="card flex items-center space-x-4">
          <div className={`p-3 rounded-lg ${stat.color}`}>
            <stat.icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Statistics;
