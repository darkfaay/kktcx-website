import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, useLanguage } from '../../context/AppContext';
import { ChevronLeft, Send, User } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import { format } from 'date-fns';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ConversationPage = () => {
  const { conversationId } = useParams();
  const [searchParams] = useSearchParams();
  const { user, api } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const messagesEndRef = useRef(null);
  
  const isNewConversation = conversationId === 'new';
  const newUserId = searchParams.get('user');

  useEffect(() => {
    if (!isNewConversation) {
      fetchMessages();
      // Poll for new messages
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
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
    
    setSending(true);
    try {
      const receiverId = isNewConversation ? newUserId : otherUser?.id;
      if (!receiverId) {
        toast.error('Alıcı bulunamadı');
        return;
      }

      const response = await api.post('/messages', {
        receiver_id: receiverId,
        content: newMessage.trim()
      });
      
      setMessages(prev => [...prev, response.data.message]);
      setNewMessage('');
      
      // If new conversation, navigate to the actual conversation
      if (isNewConversation && response.data.message.conversation_id) {
        const basePath = user?.role === 'partner' ? `/${lang}/partner/mesajlar` : `/${lang}/kullanici/mesajlar`;
        navigate(`${basePath}/${response.data.message.conversation_id}`, { replace: true });
      }
    } catch (error) {
      toast.error('Mesaj gönderilemedi');
    } finally {
      setSending(false);
    }
  };

  const goBack = () => {
    const basePath = user?.role === 'partner' ? `/${lang}/partner/mesajlar` : `/${lang}/kullanici/mesajlar`;
    navigate(basePath);
  };

  const avatar = otherUser?.avatar 
    ? `${API_URL}/api/files/${otherUser.avatar}`
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
        
        <div className="w-10 h-10 rounded-full overflow-hidden bg-[#D4AF37]/20 flex-shrink-0">
          {avatar ? (
            <img src={avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-5 h-5 text-[#D4AF37]" />
            </div>
          )}
        </div>
        
        <div>
          <h2 className="text-white font-semibold">
            {otherUser?.name || 'Yeni Mesaj'}
          </h2>
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
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
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
            onChange={(e) => setNewMessage(e.target.value)}
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
