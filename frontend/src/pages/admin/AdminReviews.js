import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AppContext';
import { 
  Star, CheckCircle, XCircle, Clock, Search, 
  ChevronLeft, ChevronRight, MoreVertical, Trash2,
  User, MessageSquare, TrendingUp
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { toast } from 'sonner';

const AdminReviews = () => {
  const { api } = useAuth();
  
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    average_rating: 0
  });
  const [deleteDialog, setDeleteDialog] = useState(null);

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [page, statusFilter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 20);
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/admin/reviews?${params.toString()}`);
      setReviews(response.data.reviews || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      toast.error('Değerlendirmeler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/reviews/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const updateStatus = async (reviewId, status) => {
    try {
      await api.put(`/admin/reviews/${reviewId}/status?status=${status}`);
      toast.success(status === 'approved' ? 'Değerlendirme onaylandı' : 'Değerlendirme reddedildi');
      fetchReviews();
      fetchStats();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      await api.delete(`/admin/reviews/${reviewId}`);
      toast.success('Değerlendirme silindi');
      setDeleteDialog(null);
      fetchReviews();
      fetchStats();
    } catch (error) {
      toast.error('Silme işlemi başarısız');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    const labels = {
      approved: 'Onaylı',
      pending: 'Bekliyor',
      rejected: 'Reddedildi',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`}
          />
        ))}
      </div>
    );
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6" data-testid="admin-reviews">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Değerlendirme Yönetimi</h1>
          <p className="text-white/60 mt-1">Kullanıcı değerlendirmelerini onaylayın ve yönetin</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-white/50 text-xs">Toplam</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
              <p className="text-white/50 text-xs">Bekleyen</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.approved}</p>
              <p className="text-white/50 text-xs">Onaylı</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.rejected}</p>
              <p className="text-white/50 text-xs">Reddedilen</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.average_rating}</p>
              <p className="text-white/50 text-xs">Ort. Puan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
            <SelectTrigger className="w-48 bg-white/5 border-white/10">
              <SelectValue placeholder="Durum Filtrele" />
            </SelectTrigger>
            <SelectContent className="bg-[#15151F] border-[#D4AF37]/20">
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="pending">Onay Bekleyen</SelectItem>
              <SelectItem value="approved">Onaylı</SelectItem>
              <SelectItem value="rejected">Reddedilen</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reviews Table */}
      {loading ? (
        <div className="glass rounded-xl p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <Star className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">Değerlendirme bulunamadı</p>
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-white/60 text-sm font-medium">Partner</th>
                  <th className="text-left p-4 text-white/60 text-sm font-medium">Kullanıcı</th>
                  <th className="text-left p-4 text-white/60 text-sm font-medium">Puan</th>
                  <th className="text-left p-4 text-white/60 text-sm font-medium">Yorum</th>
                  <th className="text-left p-4 text-white/60 text-sm font-medium">Durum</th>
                  <th className="text-left p-4 text-white/60 text-sm font-medium">Tarih</th>
                  <th className="text-right p-4 text-white/60 text-sm font-medium">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr 
                    key={review.id} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <p className="text-white font-medium">{review.partner_name || 'Partner'}</p>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-white">{review.user_name || 'Kullanıcı'}</p>
                        <p className="text-white/50 text-xs">{review.user_email}</p>
                        {review.is_anonymous && (
                          <span className="text-xs text-white/40">(Anonim)</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {renderStars(review.rating)}
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className="text-white/80 text-sm truncate">
                        {review.comment || <span className="text-white/40 italic">Yorum yok</span>}
                      </p>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(review.status)}
                    </td>
                    <td className="p-4">
                      <p className="text-white/60 text-sm">
                        {new Date(review.created_at).toLocaleDateString('tr-TR')}
                      </p>
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#15151F] border-[#D4AF37]/20">
                          {review.status === 'pending' && (
                            <>
                              <DropdownMenuItem 
                                onClick={() => updateStatus(review.id, 'approved')}
                                className="text-emerald-400 hover:bg-emerald-500/20"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Onayla
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => updateStatus(review.id, 'rejected')}
                                className="text-red-400 hover:bg-red-500/20"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reddet
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-white/10" />
                            </>
                          )}
                          {review.status === 'rejected' && (
                            <DropdownMenuItem 
                              onClick={() => updateStatus(review.id, 'approved')}
                              className="text-emerald-400 hover:bg-emerald-500/20"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Onayla
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => setDeleteDialog(review)}
                            className="text-red-400 hover:bg-red-500/20"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Sil
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent className="bg-[#15151F] border-[#D4AF37]/20 text-white">
          <DialogHeader>
            <DialogTitle>Değerlendirmeyi Sil</DialogTitle>
          </DialogHeader>
          <p className="text-white/70">
            Bu değerlendirmeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialog(null)} className="border-white/10">
              İptal
            </Button>
            <Button 
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => deleteReview(deleteDialog?.id)}
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReviews;
