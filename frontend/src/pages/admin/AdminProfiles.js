import React, { useState, useEffect } from 'react';
import { useAuth, useLanguage } from '../../context/AppContext';
import { 
  User, CheckCircle, XCircle, Clock, Eye, Star, Sparkles,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AdminProfiles = () => {
  const { api } = useAuth();
  const { lang } = useLanguage();
  
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, [page, statusFilter]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 20);
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/admin/profiles?${params.toString()}`);
      setProfiles(response.data.profiles);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Failed to fetch profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveProfile = async (profileId) => {
    try {
      await api.put(`/admin/profiles/${profileId}/approve`);
      toast.success('Profil onaylandı');
      fetchProfiles();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const rejectProfile = async () => {
    if (!selectedProfile) return;
    try {
      await api.put(`/admin/profiles/${selectedProfile.id}/reject`, null, {
        params: { reason: rejectReason }
      });
      toast.success('Profil reddedildi');
      setShowRejectDialog(false);
      setSelectedProfile(null);
      setRejectReason('');
      fetchProfiles();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const toggleVitrin = async (profileId, currentValue) => {
    try {
      await api.put(`/admin/profiles/${profileId}/vitrin`, null, {
        params: { is_vitrin: !currentValue }
      });
      toast.success('Vitrin durumu güncellendi');
      fetchProfiles();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const toggleFeatured = async (profileId, currentValue) => {
    try {
      await api.put(`/admin/profiles/${profileId}/featured`, null, {
        params: { is_featured: !currentValue }
      });
      toast.success('Öne çıkan durumu güncellendi');
      fetchProfiles();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: { icon: Clock, color: 'bg-yellow-500/20 text-yellow-400', label: 'Taslak' },
      pending: { icon: Clock, color: 'bg-blue-500/20 text-blue-400', label: 'Bekliyor' },
      approved: { icon: CheckCircle, color: 'bg-emerald-500/20 text-emerald-400', label: 'Onaylı' },
      rejected: { icon: XCircle, color: 'bg-red-500/20 text-red-400', label: 'Reddedildi' },
    };
    const badge = badges[status] || badges.draft;
    const Icon = badge.icon;
    return (
      <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-serif">Profiller / İlanlar</h1>
          <p className="text-white/60 mt-1">{total} profil</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="input-glass w-[180px]" data-testid="status-filter">
            <SelectValue placeholder="Tüm Durumlar" />
          </SelectTrigger>
          <SelectContent className="bg-[#0F0F10] border-white/10">
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            <SelectItem value="pending">Onay Bekleyen</SelectItem>
            <SelectItem value="approved">Onaylı</SelectItem>
            <SelectItem value="rejected">Reddedildi</SelectItem>
            <SelectItem value="draft">Taslak</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Profiles Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Profil</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Şehir</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Durum</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Görüntülenme</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Özellikler</th>
                <th className="text-right px-6 py-4 text-white/60 text-sm font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="animate-spin w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full mx-auto"></div>
                  </td>
                </tr>
              ) : profiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/60">
                    Profil bulunamadı
                  </td>
                </tr>
              ) : (
                profiles.map((profile) => {
                  const coverImage = profile.cover_image?.path 
                    ? `${API_URL}/api/files/${profile.cover_image.path}`
                    : null;

                  return (
                    <tr key={profile.id} className="hover:bg-white/5" data-testid={`profile-row-${profile.id}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-16 rounded-lg overflow-hidden bg-[#D4AF37]/20 flex items-center justify-center">
                            {coverImage ? (
                              <img src={coverImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 text-[#D4AF37]" />
                            )}
                          </div>
                          <div>
                            <span className="text-white font-medium">{profile.nickname}</span>
                            <p className="text-white/50 text-sm">{profile.age} yaş</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/70">{profile.city_id?.slice(0, 8) || '-'}</td>
                      <td className="px-6 py-4">
                        {getStatusBadge(profile.status)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1 text-white/60">
                          <Eye className="w-4 h-4" />
                          {profile.view_count || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleFeatured(profile.id, profile.is_featured)}
                            className={`p-2 rounded-lg transition-colors ${
                              profile.is_featured 
                                ? 'bg-[#D4AF37]/20 text-[#D4AF37]' 
                                : 'bg-white/5 text-white/40 hover:text-white/70'
                            }`}
                            title="Öne Çıkan"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleVitrin(profile.id, profile.is_vitrin)}
                            className={`p-2 rounded-lg transition-colors ${
                              profile.is_vitrin 
                                ? 'bg-[#D4AF37]/20 text-[#D4AF37]' 
                                : 'bg-white/5 text-white/40 hover:text-white/70'
                            }`}
                            title="Vitrin"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {profile.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                                onClick={() => approveProfile(profile.id)}
                                data-testid={`approve-${profile.id}`}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Onayla
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                                onClick={() => {
                                  setSelectedProfile(profile);
                                  setShowRejectDialog(true);
                                }}
                                data-testid={`reject-${profile.id}`}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reddet
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-white/5">
            <Button
              variant="ghost"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-white/60 text-sm">
              {page} / {Math.ceil(total / 20)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= Math.ceil(total / 20)}
              onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="bg-[#0F0F10] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Profili Reddet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-white/60 text-sm">
              {selectedProfile?.nickname} adlı profili reddetmek üzeresiniz.
            </p>
            <div>
              <label className="text-white/70 text-sm mb-2 block">Red Nedeni</label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Red nedenini açıklayın..."
                className="input-glass"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowRejectDialog(false)}
              >
                İptal
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={rejectProfile}
              >
                Reddet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProfiles;
