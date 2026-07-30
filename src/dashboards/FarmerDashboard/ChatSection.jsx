import { useState, useEffect } from 'react';
import * as farmerApi from '../../api/farmerApi';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardHeader } from '../../components/common/Card';

export const ChatSection = ({ requests }) => {
  const { user } = useAuth();
  const [selectedRequest, setSelectedRequest] = useState(requests[0]?.id || null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!selectedRequest) return;
    const loadMessages = async () => {
      try {
        const data = await farmerApi.getChatMessages(selectedRequest);
        setMessages(Array.isArray(data) ? data : []);
      } catch {
        setMessages([]);
      }
    };
    loadMessages();
  }, [selectedRequest]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRequest || sending) return;

    const selectedReq = requests.find((r) => r.id === selectedRequest);
    const receiverId = selectedReq?.buyer_id || 101;

    setSending(true);
    try {
      const sentMsg = await farmerApi.sendChatMessage(
        selectedRequest,
        user?.id || 1,
        newMessage,
        receiverId,
      );
      setMessages((prev) => [...prev, sentMsg]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const selectedReq = requests.find((r) => r.id === selectedRequest);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Buyer Communication" />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Requests List */}
        <div className="lg:col-span-1">
          <Card>
            <h3 className="font-semibold mb-4">Conversations</h3>
            <div className="space-y-2">
              {requests.map((req) => (
                <button
                  key={req.id}
                  onClick={() => setSelectedRequest(req.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left transition ${
                    selectedRequest === req.id
                      ? 'bg-green-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <p className="text-sm font-medium">{req.buyer_name}</p>
                  <p className="text-xs text-gray-600">{req.status}</p>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-3">
          <Card className="flex flex-col h-96">
            {!selectedReq ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                Select a conversation to start chatting
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-3 mb-4 pb-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-400 py-12">
                      No messages yet. Start a conversation!
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMine = msg.sender_id === (user?.id || 1);
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs rounded-lg px-3 py-2 ${
                              isMine
                                ? 'bg-green-700 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-xs font-semibold mb-1 opacity-75">
                              {isMine ? 'You' : msg.sender_name}
                            </p>
                            <p className="text-sm">{msg.message}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {new Date(msg.sent_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Input */}
                <form
                  onSubmit={handleSendMessage}
                  className="flex gap-2 border-t border-gray-200 pt-4"
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    disabled={sending}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="rounded-lg bg-green-700 px-4 py-2 text-white transition hover:bg-green-800 disabled:bg-gray-300"
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </form>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
