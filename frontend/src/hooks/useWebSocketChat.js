import { useState, useEffect } from 'react';

export const useWebSocketChat = (requestId) => {
  const [messages] = useState([]);
  const [loading] = useState(false);

  // WebSocket implementation placeholder
  useEffect(() => {
    // Connect to WebSocket server
  }, [requestId]);

  return { messages, loading };
};
