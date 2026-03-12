const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="flex space-x-2 mb-4">
        <div className="w-3 h-3 bg-primary-500 rounded-full loading-dot"></div>
        <div className="w-3 h-3 bg-primary-500 rounded-full loading-dot"></div>
        <div className="w-3 h-3 bg-primary-500 rounded-full loading-dot"></div>
      </div>
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );
};

export default Loading;
