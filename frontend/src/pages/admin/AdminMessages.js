import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AppContext';
import { 
  MessageSquare, Search, ChevronLeft, ChevronRight, 
  MoreVertical, Trash2, Flag, Eye, Users, Clock,
  AlertTriangle, CheckCircle, X, Send
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import { toast } from 'sonner';

const AdminMessages = () => {
  const { api } = useAuth();
  
  const [activeTab, setActiveTab] = useState('conversations');
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [stats, setStats] = useState({
    total_messages: 0,
    today_messages: 0,
    flagged_messages: 0,
    total_conversations: 0
  });
  
  // Dialog states
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'conversations') {
      fetchConversations();
    } else {
      fetchMessages();
    }
  }, [activeTab, page, flaggedOnly]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/messages/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/conversations?page=${page}&limit=20`);
      setConversations(response.data.conversations || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      toast.error('Konuşmalar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 50);
      if (searchQuery) params.append('search', searchQuery);
      if (flaggedOnly) params.append('flagged_only', 'true');
      
      const response = await api.get(`/admin/messages?${params.toString()}`);
      setMessages(response.data.messages || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Mesajlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const viewConversation = async (conv) => {
    try {
      const response = await api.get(`/admin/conversations/${conv.id}/messages?limit=100`);
      setConversationMessages(response.data.messages || []);
      setSelectedConversation({
        ...conv,
        participants: response.data.participants
      });
    } catch (error) {
      toast.error('Konuşma yüklenemedi');
    }
  };

  const flagMessage = async (messageId, flag) => {
    try {
      await api.put(`/admin/messages/${messageId}/flag?is_flagged=${flag}`);
      toast.success(flag ? 'Mesaj işaretlendi' : 'İşaret kaldırıldı');
      if (activeTab === 'messages') {
        fetchMessages();
      }
      fetchStats();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await api.delete(`/admin/messages/${messageId}`);
      toast.success('Mesaj silindi');
      setDeleteDialog(null);
      if (selectedConversation) {
        viewConversation(selectedConversation);
      } else {
        fetchMessages();
      }
      fetchStats();
    } catch (error) {
      toast.error('Silme işlemi başarısız');
    }
  };

  const deleteConversation = async (convId) => {
    try {
      await api.delete(`/admin/conversations/${convId}`);
      toast.success('Konuşma ve tüm mesajlar silindi');
      setDeleteDialog(null);
      setSelectedConversation(null);
      fetchConversations();
      fetchStats();
    } catch (error) {
      toast.error('Silme işlemi başarısız');
    }
  };

  const totalPages = Math.ceil(total / (activeTab === 'conversations' ? 20 : 50));

  return (
    <div className="space-y-6" data-testid="admin-messages">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Mesaj Yönetimi</h1>
          <p className="text-white/60 mt-1">Kullanıcı mesajlarını izleyin ve yönetin</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total_messages}</p>
              <p className="text-white/50 text-xs">Toplam Mesaj</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.today_messages}</p>
              <p className="text-white/50 text-xs">Bugün</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.flagged_messages}</p>
              <p className="text-white/50 text-xs">İşaretli</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total_conversations}</p>
              <p className="text-white/50 text-xs">Konuşma</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="glass p-1">
          <TabsTrigger value="conversations" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
            Konuşmalar
          </TabsTrigger>
          <TabsTrigger value="messages" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
            Tüm Mesajlar
          </TabsTrigger>
        </TabsList>

        {/* Conversations Tab */}
        <TabsContent value="conversations" className="mt-4">
          {loading ? (
            <div className="glass rounded-xl p-12 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center">
              <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">Henüz konuşma yok</p>
            </div>
          ) : (
            <div className="glass rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-white/60 text-sm font-medium">Katılımcılar</th>
                      <th className="text-left p-4 text-white/60 text-sm font-medium">Son Mesaj</th>
                      <th className="text-left p-4 text-white/60 text-sm font-medium">Mesaj Sayısı</th>
                      <th className="text-left p-4 text-white/60 text-sm font-medium">Son Aktivite</th>
                      <th className="text-right p-4 text-white/60 text-sm font-medium">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conversations.map((conv) => (
                      <tr 
                        key={conv.id} 
                        className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => viewConversation(conv)}
                      >
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            {conv.participants_info?.map((p, idx) => (
                              <div key={p.id} className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${p.is_partner ? 'bg-pink-500' : 'bg-blue-500'}`}></span>
                                <span className="text-white text-sm">{p.name}</span>
                                {p.is_partner && <span className="text-xs text-pink-400">(Partner)</span>}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-white/70 text-sm truncate max-w-xs">
                            {conv.last_message?.content || '-'}
                          </p>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded-full bg-white/10 text-white text-sm">
                            {conv.message_count}
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="text-white/60 text-sm">
                            {conv.updated_at || conv.last_message_at 
                              ? new Date(conv.updated_at || conv.last_message_at).toLocaleString('tr-TR')
                              : '-'}
                          </p>
                        </td>
                        <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#15151F] border-[#D4AF37]/20">
                              <DropdownMenuItem 
                                onClick={() => viewConversation(conv)}
                                className="text-white hover:bg-white/10"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Görüntüle
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-white/10" />
                              <DropdownMenuItem 
                                onClick={() => setDeleteDialog({ type: 'conversation', id: conv.id })}
                                className="text-red-400 hover:bg-red-500/20"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Konuşmayı Sil
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* All Messages Tab */}
        <TabsContent value="messages" className="mt-4 space-y-4">
          {/* Search & Filter */}
          <div className="glass rounded-xl p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <Input
                  placeholder="Mesaj içeriğinde ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchMessages()}
                  className="pl-10 bg-white/5 border-white/10"
                />
              </div>
              <Button
                variant={flaggedOnly ? "default" : "outline"}
                className={flaggedOnly ? "bg-red-500 hover:bg-red-600" : "border-white/10"}
                onClick={() => setFlaggedOnly(!flaggedOnly)}
              >
                <Flag className="w-4 h-4 mr-2" />
                Sadece İşaretli
              </Button>
              <Button onClick={fetchMessages} className="bg-[#D4AF37] hover:bg-[#D4AF37]/80 text-black">
                <Search className="w-4 h-4 mr-2" />
                Ara
              </Button>
            </div>
          </div>

          {/* Messages List */}
          {loading ? (
            <div className="glass rounded-xl p-12 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center">
              <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">Mesaj bulunamadı</p>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`glass rounded-xl p-4 ${msg.is_flagged ? 'border border-red-500/30' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-2 h-2 rounded-full ${msg.sender_is_partner ? 'bg-pink-500' : 'bg-blue-500'}`}></span>
                        <span className="text-white font-medium">{msg.sender_name}</span>
                        <span className="text-white/30">→</span>
                        <span className={`w-2 h-2 rounded-full ${msg.receiver_is_partner ? 'bg-pink-500' : 'bg-blue-500'}`}></span>
                        <span className="text-white/70">{msg.receiver_name}</span>
                        {msg.is_flagged && (
                          <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs">
                            İşaretli
                          </span>
                        )}
                      </div>
                      <p className="text-white/80">{msg.content}</p>
                      <p className="text-white/40 text-xs mt-2">
                        {new Date(msg.created_at).toLocaleString('tr-TR')}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#15151F] border-[#D4AF37]/20">
                        <DropdownMenuItem 
                          onClick={() => flagMessage(msg.id, !msg.is_flagged)}
                          className={msg.is_flagged ? "text-emerald-400 hover:bg-emerald-500/20" : "text-yellow-400 hover:bg-yellow-500/20"}
                        >
                          {msg.is_flagged ? <CheckCircle className="w-4 h-4 mr-2" /> : <Flag className="w-4 h-4 mr-2" />}
                          {msg.is_flagged ? 'İşareti Kaldır' : 'İşaretle'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem 
                          onClick={() => setDeleteDialog({ type: 'message', id: msg.id })}
                          className="text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="border-white/10 text-white hover:bg-white/10"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-white/60 px-4">
            Sayfa {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="border-white/10 text-white hover:bg-white/10"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Conversation Detail Dialog */}
      <Dialog open={!!selectedConversation} onOpenChange={() => setSelectedConversation(null)}>
        <DialogContent className="bg-[#15151F] border-[#D4AF37]/20 text-white max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#D4AF37]" />
              Konuşma Detayı
            </DialogTitle>
          </DialogHeader>
          
          {selectedConversation && (
            <div className="space-y-4">
              {/* Participants */}
              <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                {selectedConversation.participants?.map((p, idx) => (
                  <React.Fragment key={p.id}>
                    {idx > 0 && <span className="text-white/30">↔</span>}
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${p.is_partner ? 'bg-pink-500' : 'bg-blue-500'}`}></span>
                      <div>
                        <p className="text-white font-medium">{p.name}</p>
                        <p className="text-white/50 text-xs">{p.email}</p>
                      </div>
                      {p.is_partner && <span className="text-xs text-pink-400">(Partner)</span>}
                    </div>
                  </React.Fragment>
                ))}
              </div>
              
              {/* Messages */}
              <div className="max-h-96 overflow-y-auto space-y-3 p-2">
                {conversationMessages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`p-3 rounded-lg ${msg.is_flagged ? 'bg-red-500/10 border border-red-500/30' : 'bg-white/5'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium text-sm">{msg.sender_name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white/40 text-xs">
                          {new Date(msg.created_at).toLocaleString('tr-TR')}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white/40 hover:text-white">
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#15151F] border-[#D4AF37]/20">
                            <DropdownMenuItem 
                              onClick={() => flagMessage(msg.id, !msg.is_flagged)}
                              className={msg.is_flagged ? "text-emerald-400" : "text-yellow-400"}
                            >
                              <Flag className="w-4 h-4 mr-2" />
                              {msg.is_flagged ? 'İşareti Kaldır' : 'İşaretle'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeleteDialog({ type: 'message', id: msg.id })}
                              className="text-red-400"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <p className="text-white/80 text-sm">{msg.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent className="bg-[#15151F] border-[#D4AF37]/20 text-white">
          <DialogHeader>
            <DialogTitle>
              {deleteDialog?.type === 'conversation' ? 'Konuşmayı Sil' : 'Mesajı Sil'}
            </DialogTitle>
          </DialogHeader>
          <p className="text-white/70">
            {deleteDialog?.type === 'conversation' 
              ? 'Bu konuşmayı ve içindeki tüm mesajları silmek istediğinizden emin misiniz?' 
              : 'Bu mesajı silmek istediğinizden emin misiniz?'}
            <br />
            <span className="text-red-400">Bu işlem geri alınamaz.</span>
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialog(null)} className="border-white/10">
              İptal
            </Button>
            <Button 
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => {
                if (deleteDialog?.type === 'conversation') {
                  deleteConversation(deleteDialog.id);
                } else {
                  deleteMessage(deleteDialog.id);
                }
              }}
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMessages;
