import { useState, useEffect } from 'react';

export const useWebSocketChat = (requestId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // WebSocket implementation placeholder
  useEffect(() => {
    // Connect to WebSocket server
  }, [requestId]);

  return { messages, loading };
};
