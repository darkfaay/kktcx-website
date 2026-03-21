import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AppContext';
import { 
  Mail, MessageSquare, Trash2, Eye, Clock, User, 
  CheckCircle, AlertCircle, Search, Filter, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

const AdminContactMessages = () => {
  const { api } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    fetchMessages();
  }, [page, statusFilter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await api.get(`/admin/contact-messages?${params}`);
      setMessages(response.data.messages || []);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Mesajlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const openMessage = async (message) => {
    setSelectedMessage(message);
    setAdminNote(message.admin_note || '');
    setShowDetailModal(true);
    
    // Mark as read if unread
    if (message.status === 'unread') {
      try {
        await api.put(`/admin/contact-messages/${message.id}`, { status: 'read' });
        fetchMessages();
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }
  };

  const updateMessageStatus = async (messageId, status) => {
    try {
      await api.put(`/admin/contact-messages/${messageId}`, { status, admin_note: adminNote });
      toast.success('Mesaj güncellendi');
      fetchMessages();
      setShowDetailModal(false);
    } catch (error) {
      toast.error('Güncelleme başarısız');
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;
    
    try {
      await api.delete(`/admin/contact-messages/${messageId}`);
      toast.success('Mesaj silindi');
      fetchMessages();
      setShowDetailModal(false);
    } catch (error) {
      toast.error('Silme başarısız');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      unread: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: AlertCircle, label: 'Okunmadı' },
      read: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Eye, label: 'Okundu' },
      replied: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle, label: 'Yanıtlandı' },
      archived: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: Mail, label: 'Arşivlendi' },
    };
    const config = statusConfig[status] || statusConfig.unread;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-[#E91E63]" />
            İletişim Mesajları
          </h1>
          <p className="text-white/60 mt-1">Ziyaretçilerden gelen mesajları yönetin</p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#E91E63]/50"
          >
            <option value="">Tüm Mesajlar</option>
            <option value="unread">Okunmamış</option>
            <option value="read">Okunmuş</option>
            <option value="replied">Yanıtlanmış</option>
            <option value="archived">Arşivlenmiş</option>
          </select>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#E91E63] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20">
            <Mail className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">Henüz mesaj yok</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {messages.map((message) => (
              <div 
                key={message.id}
                onClick={() => openMessage(message)}
                className={`p-4 md:p-6 cursor-pointer transition-colors hover:bg-white/5 ${message.status === 'unread' ? 'bg-[#E91E63]/5' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#E91E63] to-[#9C27B0] flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${message.status === 'unread' ? 'text-white' : 'text-white/80'}`}>
                          {message.name}
                        </h3>
                        <p className="text-white/50 text-sm">{message.email}</p>
                      </div>
                    </div>
                    
                    {message.subject && (
                      <p className="text-white/70 font-medium mb-1">{message.subject}</p>
                    )}
                    <p className="text-white/50 text-sm line-clamp-2">{message.message}</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {getStatusBadge(message.status)}
                    <span className="text-white/40 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(message.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-white/5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="border-white/10 text-white/70"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-white/60 text-sm px-4">
              Sayfa {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="border-white/10 text-white/70"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="bg-[#0F0F15] border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#E91E63]" />
              Mesaj Detayı
            </DialogTitle>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-6">
              {/* Sender Info */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#E91E63] to-[#9C27B0] flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{selectedMessage.name}</h3>
                  <a href={`mailto:${selectedMessage.email}`} className="text-[#E91E63] text-sm hover:underline">
                    {selectedMessage.email}
                  </a>
                </div>
                <div className="ml-auto">
                  {getStatusBadge(selectedMessage.status)}
                </div>
              </div>

              {/* Subject */}
              {selectedMessage.subject && (
                <div>
                  <label className="text-white/50 text-sm">Konu</label>
                  <p className="text-white font-medium mt-1">{selectedMessage.subject}</p>
                </div>
              )}

              {/* Message */}
              <div>
                <label className="text-white/50 text-sm">Mesaj</label>
                <div className="mt-1 p-4 rounded-xl bg-white/5 text-white/80 whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <Clock className="w-4 h-4" />
                {formatDate(selectedMessage.created_at)}
              </div>

              {/* Admin Note */}
              <div>
                <label className="text-white/50 text-sm">Admin Notu</label>
                <Textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  placeholder="Kendinize not ekleyin..."
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
                <Button
                  onClick={() => updateMessageStatus(selectedMessage.id, 'replied')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Yanıtlandı
                </Button>
                <Button
                  onClick={() => updateMessageStatus(selectedMessage.id, 'archived')}
                  variant="outline"
                  className="border-white/20 text-white/70 hover:bg-white/5"
                >
                  Arşivle
                </Button>
                <Button
                  onClick={() => deleteMessage(selectedMessage.id)}
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 ml-auto"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Sil
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminContactMessages;
