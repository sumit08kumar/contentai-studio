import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

const ChatInput = ({ onSend, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;
    onSend(message.trim());
    setMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end space-x-3 p-4 border-t border-gray-100 bg-white">
      <div className="flex-1">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about the video..."
          className="input-field resize-none min-h-[44px] max-h-32"
          rows={1}
          disabled={disabled}
        />
      </div>
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className="btn-primary p-3 rounded-lg"
        title="Send message"
      >
        <PaperAirplaneIcon className="h-5 w-5" />
      </button>
    </form>
  );
};

export default ChatInput;
