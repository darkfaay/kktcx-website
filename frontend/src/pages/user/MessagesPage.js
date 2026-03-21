import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, useLanguage } from '../../context/AppContext';
import { MessageCircle, Search, User } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { tr, enUS, ru, de } from 'date-fns/locale';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const locales = { tr, en: enUS, ru, de };

const MessagesPage = () => {
  const { user, api } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const newMessageUserId = searchParams.get('new');

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    // If new message to user, start conversation after conversations are loaded
    if (newMessageUserId && !loading) {
      startNewConversation(newMessageUserId);
    }
  }, [newMessageUserId, loading, conversations]);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const startNewConversation = async (userId) => {
    // Find existing conversation or create a placeholder
    const existing = conversations.find(c => 
      c.participants?.includes(userId) || c.other_user?.id === userId
    );
    
    if (existing) {
      navigate(`/${lang}/kullanici/mesajlar/${existing.id}`, { replace: true });
    } else {
      // Navigate with the user ID to start new conversation
      navigate(`/${lang}/kullanici/mesajlar/new?user=${userId}`, { replace: true });
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.other_user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const basePath = user?.role === 'partner' ? `/${lang}/partner/mesajlar` : `/${lang}/kullanici/mesajlar`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white font-serif">{t('messages')}</h1>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Sohbet ara..."
          className="input-glass pl-12"
          data-testid="search-messages"
        />
      </div>

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        <div className="text-center py-20">
          <MessageCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60 text-lg">Henüz mesajınız yok</p>
          <p className="text-white/40 mt-2">Partner profillerinden mesaj göndererek sohbet başlatabilirsiniz</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredConversations.map((conversation) => {
            const avatar = conversation.other_user?.avatar 
              ? `${API_URL}/api/files/${conversation.other_user.avatar}`
              : null;
            
            return (
              <Link
                key={conversation.id}
                to={`${basePath}/${conversation.id}`}
                className="flex items-center gap-4 p-4 glass rounded-xl hover:border-[#D4AF37]/30 transition-all"
                data-testid={`conversation-${conversation.id}`}
              >
                {/* Avatar */}
                <div className="w-14 h-14 rounded-full overflow-hidden bg-[#D4AF37]/20 flex-shrink-0">
                  {avatar ? (
                    <img src={avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold truncate">
                      {conversation.other_user?.name || 'Kullanıcı'}
                    </h3>
                    {conversation.last_message?.created_at && (
                      <span className="text-white/40 text-xs">
                        {formatDistanceToNow(new Date(conversation.last_message.created_at), { 
                          addSuffix: true,
                          locale: locales[lang] || locales.tr
                        })}
                      </span>
                    )}
                  </div>
                  <p className="text-white/50 text-sm truncate mt-1">
                    {conversation.last_message?.content || 'Henüz mesaj yok'}
                  </p>
                </div>

                {/* Unread Badge */}
                {conversation.unread_count > 0 && (
                  <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-black text-xs font-bold flex items-center justify-center">
                    {conversation.unread_count}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
