import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, useLanguage } from '../../context/AppContext';
import { ChevronLeft, Send, User, Wifi, WifiOff } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import { format } from 'date-fns';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const WS_URL = API_URL.replace('https://', 'wss://').replace('http://', 'ws://');

const ConversationPage = () => {
  const { conversationId } = useParams();
  const [searchParams] = useSearchParams();
  const { user, api, token } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const isNewConversation = conversationId === 'new';
  const newUserId = searchParams.get('user');

  // WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (!token || wsRef.current?.readyState === WebSocket.OPEN) return;
    
    const ws = new WebSocket(`${WS_URL}/ws/chat/${token}`);
    
    ws.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'new_message') {
          // Add new message to list if it's for this conversation
          if (data.message.conversation_id === conversationId) {
            setMessages(prev => [...prev, data.message]);
            // Mark message as read
            ws.send(JSON.stringify({
              type: 'read',
              message_ids: [data.message.id],
              sender_id: data.message.sender_id
            }));
          } else {
            // Show notification for messages in other conversations
            toast.info(`${data.sender?.name || 'Yeni mesaj'}: ${data.message.content.substring(0, 50)}...`);
          }
        } else if (data.type === 'message_sent') {
          // Update message status to sent
          setMessages(prev => prev.map(m => 
            m.id === data.message.id ? { ...m, status: 'sent' } : m
          ));
        } else if (data.type === 'messages_read') {
          // Update messages to read status
          setMessages(prev => prev.map(m => 
            data.message_ids.includes(m.id) ? { ...m, status: 'read' } : m
          ));
        } else if (data.type === 'typing') {
          if (data.conversation_id === conversationId) {
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 3000);
          }
        }
      } catch (e) {
        console.error('WebSocket message parse error:', e);
      }
    };
    
    ws.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
      // Attempt to reconnect after 3 seconds
      setTimeout(connectWebSocket, 3000);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    wsRef.current = ws;
  }, [token, conversationId]);

  // Setup WebSocket
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  // Fetch messages (initial load and fallback)
  useEffect(() => {
    if (!isNewConversation) {
      fetchMessages();
    } else {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const [messagesRes, conversationsRes] = await Promise.all([
        api.get(`/conversations/${conversationId}/messages`),
        api.get('/conversations')
      ]);
      setMessages(messagesRes.data);
      
      // Find other user info
      const conversation = conversationsRes.data.find(c => c.id === conversationId);
      if (conversation) {
        setOtherUser(conversation.other_user);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const receiverId = isNewConversation ? newUserId : otherUser?.id;
    if (!receiverId) {
      toast.error('Alıcı bulunamadı');
      return;
    }

    const messageContent = newMessage.trim();
    setNewMessage('');
    
    // Try to send via WebSocket first (faster)
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // Add optimistic message
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: user?.id,
        receiver_id: receiverId,
        content: messageContent,
        status: 'sending',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, optimisticMessage]);
      
      wsRef.current.send(JSON.stringify({
        type: 'message',
        receiver_id: receiverId,
        content: messageContent
      }));
    } else {
      // Fallback to REST API
      setSending(true);
      try {
        const response = await api.post('/messages', {
          receiver_id: receiverId,
          content: messageContent
        });
        
        setMessages(prev => [...prev, response.data.message]);
        
        // If new conversation, navigate to the actual conversation
        if (isNewConversation && response.data.message.conversation_id) {
          const basePath = user?.role === 'partner' ? `/${lang}/partner/mesajlar` : `/${lang}/kullanici/mesajlar`;
          navigate(`${basePath}/${response.data.message.conversation_id}`, { replace: true });
        }
      } catch (error) {
        toast.error('Mesaj gönderilemedi');
        setNewMessage(messageContent); // Restore message
      } finally {
        setSending(false);
      }
    }
  };
  
  // Send typing indicator
  const handleTyping = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN && otherUser?.id) {
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Send typing indicator
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        receiver_id: otherUser.id,
        conversation_id: conversationId
      }));
      
      // Set timeout to prevent spamming
      typingTimeoutRef.current = setTimeout(() => {
        typingTimeoutRef.current = null;
      }, 2000);
    }
  };

  const goBack = () => {
    const basePath = user?.role === 'partner' ? `/${lang}/partner/mesajlar` : `/${lang}/kullanici/mesajlar`;
    navigate(basePath);
  };

  const avatarUrl = otherUser?.avatar 
    ? (otherUser.avatar.startsWith('http') ? otherUser.avatar : `${API_URL}/api/files/${otherUser.avatar}`)
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-white/10">
        <Button
          variant="ghost"
          size="sm"
          onClick={goBack}
          className="text-white/70 p-2"
          data-testid="back-to-messages"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <div className="w-10 h-10 rounded-full overflow-hidden bg-[#D4AF37]/20 flex-shrink-0 relative">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-5 h-5 text-[#D4AF37]" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h2 className="text-white font-semibold">
            {otherUser?.name || 'Yeni Mesaj'}
          </h2>
          {isTyping && (
            <p className="text-[#D4AF37] text-xs animate-pulse">yazıyor...</p>
          )}
        </div>
        
        {/* Connection Status */}
        <div className="flex items-center gap-1" title={isConnected ? 'Bağlı' : 'Bağlantı kesildi'}>
          {isConnected ? (
            <Wifi className="w-4 h-4 text-emerald-400" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-400" />
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-white/40">Henüz mesaj yok. Sohbeti başlatın!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isMine = message.sender_id === user?.id;
            return (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                {/* Avatar for other user's messages */}
                {!isMine && (
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-[#D4AF37]/20 flex-shrink-0 mb-1">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-4 h-4 text-[#D4AF37]" />
                      </div>
                    )}
                  </div>
                )}
                
                <div
                  className={isMine ? 'chat-bubble-sent' : 'chat-bubble-received'}
                  data-testid={`message-${message.id}`}
                >
                  <p>{message.content}</p>
                  <p className={`text-xs mt-1 ${isMine ? 'text-black/50' : 'text-white/40'}`}>
                    {format(new Date(message.created_at), 'HH:mm')}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="pt-4 border-t border-white/10">
        <div className="flex gap-3">
          <Input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Mesajınızı yazın..."
            className="input-glass flex-1"
            disabled={sending}
            data-testid="message-input"
          />
          <Button 
            type="submit" 
            className="btn-primary px-6"
            disabled={sending || !newMessage.trim()}
            data-testid="send-message"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ConversationPage;
