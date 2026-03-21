import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useLanguage } from '../../context/AppContext';
import { 
  User, CheckCircle, XCircle, Clock, Eye, Star, Sparkles,
  ChevronLeft, ChevronRight, MapPin, Heart, Filter, Search,
  MoreVertical, Trash2, Edit, Crown, Shield, Calendar, Grid, List
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

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
      if (searchQuery) params.append('search', searchQuery);

      const response = await api.get(`/admin/profiles?${params.toString()}`);
      setProfiles(response.data.profiles || []);
      setTotal(response.data.total || 0);
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
      draft: { color: 'bg-gray-500/20 text-gray-400', label: 'Taslak' },
      pending: { color: 'bg-yellow-500/20 text-yellow-400', label: 'Bekliyor' },
      approved: { color: 'bg-emerald-500/20 text-emerald-400', label: 'Onaylı' },
      rejected: { color: 'bg-red-500/20 text-red-400', label: 'Reddedildi' },
    };
    const badge = badges[status] || badges.draft;
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getProfileImage = (profile) => {
    if (profile.cover_image?.path) {
      return `${API_URL}/api/files/${profile.cover_image.path}`;
    }
    if (profile.images?.[0]?.path) {
      return `${API_URL}/api/files/${profile.images[0].path}`;
    }
    return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop';
  };

  const stats = {
    total: total,
    pending: profiles.filter(p => p.status === 'pending').length,
    approved: profiles.filter(p => p.status === 'approved').length,
    vitrin: profiles.filter(p => p.is_vitrin).length,
  };

  return (
    <div data-testid="admin-profiles">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-serif">Profiller / İlanlar</h1>
          <p className="text-white/60 mt-1">Partner profillerini yönetin</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-[#E91E63]' : 'text-white/60'}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className={viewMode === 'table' ? 'bg-[#E91E63]' : 'text-white/60'}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-400" />
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
            <div className="w-10 h-10 rounded-xl bg-[#E91E63]/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#E91E63]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.vitrin}</p>
              <p className="text-white/50 text-xs">Vitrinde</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder="İsim veya şehir ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchProfiles()}
              className="input-glass pl-10"
            />
          </div>
          <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
            <SelectTrigger className="input-glass w-[180px]" data-testid="status-filter">
              <Filter className="w-4 h-4 mr-2 text-white/40" />
              <SelectValue placeholder="Tüm Durumlar" />
            </SelectTrigger>
            <SelectContent className="bg-[#15151F] border-white/10">
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="pending">Onay Bekleyen</SelectItem>
              <SelectItem value="approved">Onaylı</SelectItem>
              <SelectItem value="rejected">Reddedildi</SelectItem>
              <SelectItem value="draft">Taslak</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchProfiles} className="btn-primary">
            <Search className="w-4 h-4 mr-2" />
            Ara
          </Button>
        </div>
      </div>

      {/* Profiles List */}
      {loading ? (
        <div className="glass rounded-xl p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#E91E63] border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : profiles.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <User className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">Profil bulunamadı</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View - Profile Cards */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {profiles.map((profile) => (
            <div 
              key={profile.id} 
              className="glass rounded-2xl overflow-hidden group hover:border-[#E91E63]/30 transition-all"
              data-testid={`profile-card-${profile.id}`}
            >
              {/* Image */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <img 
                  src={getProfileImage(profile)}
                  alt={profile.nickname}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  {getStatusBadge(profile.status)}
                </div>
                
                {/* Feature Badges */}
                <div className="absolute top-3 right-3 flex gap-2">
                  {profile.is_vitrin && (
                    <span className="w-8 h-8 rounded-full bg-[#E91E63] flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </span>
                  )}
                  {profile.is_featured && (
                    <span className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                      <Star className="w-4 h-4 text-white" />
                    </span>
                  )}
                </div>

                {/* Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-lg">{profile.nickname}</h3>
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <span>{profile.age} yaş</span>
                    {profile.city_name && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {profile.city_name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 space-y-3">
                {/* Stats Row */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50 flex items-center gap-1">
                    <Eye className="w-4 h-4" /> {profile.view_count || 0}
                  </span>
                  <span className="text-white/50 flex items-center gap-1">
                    <Heart className="w-4 h-4" /> {profile.favorite_count || 0}
                  </span>
                  <span className="text-white/50 flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> {new Date(profile.created_at).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {profile.status === 'pending' ? (
                    <>
                      <Button
                        size="sm"
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                        onClick={() => approveProfile(profile.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Onayla
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                        onClick={() => {
                          setSelectedProfile(profile);
                          setShowRejectDialog(true);
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reddet
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant={profile.is_vitrin ? 'default' : 'outline'}
                        className={`flex-1 ${profile.is_vitrin ? 'bg-[#E91E63]' : 'btn-outline'}`}
                        onClick={() => toggleVitrin(profile.id, profile.is_vitrin)}
                      >
                        <Sparkles className="w-4 h-4 mr-1" />
                        Vitrin
                      </Button>
                      <Button
                        size="sm"
                        variant={profile.is_featured ? 'default' : 'outline'}
                        className={`flex-1 ${profile.is_featured ? 'bg-yellow-500' : 'btn-outline'}`}
                        onClick={() => toggleFeatured(profile.id, profile.is_featured)}
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Öne Çıkar
                      </Button>
                    </>
                  )}
                </div>

                {/* Preview Link */}
                <Link 
                  to={`/${lang}/partner/${profile.slug}`}
                  target="_blank"
                  className="block text-center text-[#E91E63] text-sm hover:underline"
                >
                  Profili Görüntüle →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Profil</th>
                  <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Şehir</th>
                  <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Durum</th>
                  <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">İstatistik</th>
                  <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Özellikler</th>
                  <th className="text-right px-6 py-4 text-white/60 text-sm font-medium">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-white/5" data-testid={`profile-row-${profile.id}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-20 rounded-lg overflow-hidden bg-white/5">
                          <img 
                            src={getProfileImage(profile)}
                            alt="" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <span className="text-white font-medium">{profile.nickname}</span>
                          <p className="text-white/50 text-sm">{profile.age} yaş • {profile.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/70">
                      {profile.city_name || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(profile.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-4 text-sm text-white/50">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" /> {profile.view_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" /> {profile.favorite_count || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleFeatured(profile.id, profile.is_featured)}
                          className={`p-2 rounded-lg transition-colors ${
                            profile.is_featured 
                              ? 'bg-yellow-500/20 text-yellow-400' 
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
                              ? 'bg-[#E91E63]/20 text-[#E91E63]' 
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
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-400 hover:bg-red-500/10"
                              onClick={() => {
                                setSelectedProfile(profile);
                                setShowRejectDialog(true);
                              }}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Link to={`/${lang}/partner/${profile.slug}`} target="_blank">
                          <Button size="sm" variant="ghost" className="text-white/60">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button
            variant="ghost"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="text-white/60"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Önceki
          </Button>
          <span className="text-white/60 text-sm">
            Sayfa {page} / {Math.ceil(total / 20)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= Math.ceil(total / 20)}
            onClick={() => setPage(p => p + 1)}
            className="text-white/60"
          >
            Sonraki
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="bg-[#15151F] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Profili Reddet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-white/60 text-sm">
              <strong>{selectedProfile?.nickname}</strong> adlı profili reddetmek üzeresiniz.
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
                className="text-white/60"
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
