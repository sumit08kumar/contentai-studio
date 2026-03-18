import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { UserIcon, CpuChipIcon } from '@heroicons/react/24/solid';

const MessageList = ({ messages, loading }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-8">
        <div>
          <CpuChipIcon className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
          <p className="text-gray-500 text-sm max-w-sm">
            Ask any question about the video and I'll find the answer from the transcript.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`message-enter flex ${
            msg.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[80%] flex space-x-3 ${
              msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === 'user'
                  ? 'bg-primary-100 text-primary-600'
                  : 'bg-secondary-100 text-secondary-600'
              }`}
            >
              {msg.role === 'user' ? (
                <UserIcon className="h-4 w-4" />
              ) : (
                <CpuChipIcon className="h-4 w-4" />
              )}
            </div>

            {/* Message bubble */}
            <div
              className={`rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {msg.role === 'user' ? (
                <p className="text-sm">{msg.content}</p>
              ) : (
                <div className="text-sm prose prose-sm max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              )}
              {msg.timestamp && (
                <p
                  className={`text-xs mt-2 ${
                    msg.role === 'user' ? 'text-primary-200' : 'text-gray-400'
                  }`}
                >
                  {format(new Date(msg.timestamp), 'HH:mm')}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-start">
          <div className="flex space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary-100 text-secondary-600 flex items-center justify-center">
              <CpuChipIcon className="h-4 w-4" />
            </div>
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full loading-dot" />
                <div className="w-2 h-2 bg-gray-400 rounded-full loading-dot" />
                <div className="w-2 h-2 bg-gray-400 rounded-full loading-dot" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
