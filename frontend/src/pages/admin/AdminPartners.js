import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth, useLanguage } from '../../context/AppContext';
import { 
  User, Ban, CheckCircle, Search, ChevronLeft, ChevronRight,
  Mail, Phone, Calendar, Shield, Crown, Eye, Star, MapPin,
  MoreVertical, Image, Clock, TrendingUp, Sparkles, XCircle,
  Filter, ExternalLink
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
} from '../../components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AdminPartners = () => {
  const { api } = useAuth();
  const { lang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    vitrin: 0,
    verified: 0
  });

  // Initialize status filter from URL params
  useEffect(() => {
    const urlStatus = searchParams.get('status');
    if (urlStatus && urlStatus !== statusFilter) {
      setStatusFilter(urlStatus);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProfiles();
    fetchStats();
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
      toast.error('Profiller yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats({
        total: response.data.total_profiles || 0,
        approved: response.data.approved_profiles || 0,
        pending: response.data.pending_profiles || 0,
        vitrin: 0,
        verified: 0
      });
      
      // Get vitrin and verified counts
      const allProfiles = await api.get('/admin/profiles?limit=1000');
      const profiles = allProfiles.data.profiles || [];
      setStats(prev => ({
        ...prev,
        vitrin: profiles.filter(p => p.is_homepage_vitrin || p.is_city_vitrin).length,
        verified: profiles.filter(p => p.is_verified).length
      }));
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const updateProfileStatus = async (profileId, status) => {
    try {
      await api.put(`/admin/profiles/${profileId}/status?status=${status}`);
      toast.success(status === 'approved' ? 'Profil onaylandı' : status === 'rejected' ? 'Profil reddedildi' : 'Durum güncellendi');
      fetchProfiles();
      fetchStats();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const toggleVerified = async (profileId, currentStatus) => {
    try {
      await api.put(`/admin/profiles/${profileId}/verified?is_verified=${!currentStatus}`);
      toast.success(!currentStatus ? 'Profil doğrulandı' : 'Doğrulama kaldırıldı');
      fetchProfiles();
      fetchStats();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const updateVitrin = async (profileId, type, value) => {
    try {
      const params = new URLSearchParams();
      if (type === 'homepage') {
        params.append('is_homepage_vitrin', value);
      } else if (type === 'city') {
        params.append('is_city_vitrin', value);
      } else {
        params.append('is_vitrin', value);
      }
      
      await api.put(`/admin/profiles/${profileId}/vitrin?${params.toString()}`);
      toast.success(value ? 'Vitrine eklendi' : 'Vitrinden çıkarıldı');
      fetchProfiles();
      fetchStats();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
      draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      inactive: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    };
    const labels = {
      approved: 'Onaylı',
      pending: 'Bekliyor',
      rejected: 'Reddedildi',
      draft: 'Taslak',
      inactive: 'Pasif',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.draft}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getProfileImage = (profile) => {
    if (profile.cover_image?.path) {
      return `${API_URL}/api/files/${profile.cover_image.path}`;
    }
    if (profile.cover_image?.url) {
      return profile.cover_image.url;
    }
    if (profile.images?.length > 0) {
      const firstImage = profile.images[0];
      if (firstImage.path) {
        return `${API_URL}/api/files/${firstImage.path}`;
      }
      if (firstImage.url) {
        return firstImage.url;
      }
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.nickname || 'P')}&background=D4AF37&color=000&size=80`;
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6" data-testid="admin-partners">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Partner & İlan Yönetimi</h1>
          <p className="text-white/60 mt-1">Profilleri onaylayın, doğrulayın ve vitrine ekleyin</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
              <Crown className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-white/50 text-xs">Toplam</p>
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
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.vitrin}</p>
              <p className="text-white/50 text-xs">Vitrin</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.verified}</p>
              <p className="text-white/50 text-xs">Doğrulanmış</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <Input
              placeholder="İsim veya açıklama ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchProfiles()}
              className="pl-10 bg-white/5 border-white/10"
            />
          </div>
          <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
            <SelectTrigger className="w-48 bg-white/5 border-white/10">
              <SelectValue placeholder="Durum Filtrele" />
            </SelectTrigger>
            <SelectContent className="bg-[#15151F] border-[#D4AF37]/20">
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="pending">Onay Bekleyen</SelectItem>
              <SelectItem value="approved">Onaylı</SelectItem>
              <SelectItem value="rejected">Reddedilen</SelectItem>
              <SelectItem value="draft">Taslak</SelectItem>
              <SelectItem value="inactive">Pasif</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchProfiles} className="bg-[#D4AF37] hover:bg-[#D4AF37]/80 text-black">
            <Search className="w-4 h-4 mr-2" />
            Ara
          </Button>
        </div>
      </div>

      {/* Profiles Table */}
      {loading ? (
        <div className="glass rounded-xl p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : profiles.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <Crown className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">Profil bulunamadı</p>
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-white/60 text-sm font-medium">Profil</th>
                  <th className="text-left p-4 text-white/60 text-sm font-medium">Şehir</th>
                  <th className="text-left p-4 text-white/60 text-sm font-medium">Durum</th>
                  <th className="text-left p-4 text-white/60 text-sm font-medium">Rozetler</th>
                  <th className="text-left p-4 text-white/60 text-sm font-medium">Görüntülenme</th>
                  <th className="text-right p-4 text-white/60 text-sm font-medium">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => (
                  <tr 
                    key={profile.id} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    data-testid={`profile-row-${profile.id}`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={getProfileImage(profile)}
                          alt={profile.nickname}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div>
                          <p className="text-white font-medium flex items-center gap-2">
                            {profile.nickname}
                            {profile.is_verified && (
                              <Shield className="w-4 h-4 text-blue-400" title="Doğrulanmış" />
                            )}
                          </p>
                          <p className="text-white/50 text-sm">{profile.age} yaş • {profile.gender === 'female' ? 'Kadın' : profile.gender === 'male' ? 'Erkek' : profile.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-white">{profile.city_name || profile.city_id || '-'}</p>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(profile.status)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        {profile.is_homepage_vitrin && (
                          <span className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center" title="Ana Sayfa Vitrini">
                            <Star className="w-3 h-3 text-pink-400" />
                          </span>
                        )}
                        {profile.is_city_vitrin && (
                          <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center" title="Şehir Vitrini">
                            <MapPin className="w-3 h-3 text-purple-400" />
                          </span>
                        )}
                        {profile.is_featured && (
                          <span className="w-6 h-6 rounded-full bg-[#D4AF37]/20 flex items-center justify-center" title="Öne Çıkan">
                            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                          </span>
                        )}
                        {!profile.is_homepage_vitrin && !profile.is_city_vitrin && !profile.is_featured && (
                          <span className="text-white/30 text-xs">-</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-white/40" />
                        <span className="text-white">{(profile.view_count || 0).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#15151F] border-[#D4AF37]/20 w-56">
                          <DropdownMenuItem 
                            onClick={() => setSelectedProfile(profile)}
                            className="text-white hover:bg-white/10"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Detay Görüntüle
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => window.open(`/${lang}/partner/${profile.slug}`, '_blank')}
                            className="text-white hover:bg-white/10"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Profili Görüntüle
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator className="bg-white/10" />
                          
                          {/* Status Actions */}
                          {profile.status === 'pending' && (
                            <>
                              <DropdownMenuItem 
                                onClick={() => updateProfileStatus(profile.id, 'approved')}
                                className="text-emerald-400 hover:bg-emerald-500/20"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Onayla
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => updateProfileStatus(profile.id, 'rejected')}
                                className="text-red-400 hover:bg-red-500/20"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reddet
                              </DropdownMenuItem>
                            </>
                          )}
                          
                          {profile.status === 'approved' && (
                            <DropdownMenuItem 
                              onClick={() => updateProfileStatus(profile.id, 'inactive')}
                              className="text-orange-400 hover:bg-orange-500/20"
                            >
                              <Ban className="w-4 h-4 mr-2" />
                              Pasife Al
                            </DropdownMenuItem>
                          )}
                          
                          {(profile.status === 'inactive' || profile.status === 'rejected') && (
                            <DropdownMenuItem 
                              onClick={() => updateProfileStatus(profile.id, 'approved')}
                              className="text-emerald-400 hover:bg-emerald-500/20"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Aktifleştir
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator className="bg-white/10" />
                          
                          {/* Verified */}
                          <DropdownMenuItem 
                            onClick={() => toggleVerified(profile.id, profile.is_verified)}
                            className={profile.is_verified ? "text-gray-400 hover:bg-gray-500/20" : "text-blue-400 hover:bg-blue-500/20"}
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            {profile.is_verified ? 'Doğrulamayı Kaldır' : 'Doğrula'}
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator className="bg-white/10" />
                          
                          {/* Vitrin */}
                          <DropdownMenuItem 
                            onClick={() => updateVitrin(profile.id, 'homepage', !profile.is_homepage_vitrin)}
                            className={profile.is_homepage_vitrin ? "text-gray-400 hover:bg-gray-500/20" : "text-pink-400 hover:bg-pink-500/20"}
                          >
                            <Star className="w-4 h-4 mr-2" />
                            {profile.is_homepage_vitrin ? 'Ana Sayfadan Çıkar' : 'Ana Sayfa Vitrini'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => updateVitrin(profile.id, 'city', !profile.is_city_vitrin)}
                            className={profile.is_city_vitrin ? "text-gray-400 hover:bg-gray-500/20" : "text-purple-400 hover:bg-purple-500/20"}
                          >
                            <MapPin className="w-4 h-4 mr-2" />
                            {profile.is_city_vitrin ? 'Şehir Vitrininden Çıkar' : 'Şehir Vitrini'}
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

      {/* Profile Detail Dialog */}
      <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
        <DialogContent className="bg-[#15151F] border-[#D4AF37]/20 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profil Detayı</DialogTitle>
          </DialogHeader>
          {selectedProfile && (
            <div className="space-y-4">
              {/* Profile Header */}
              <div className="flex items-start gap-4">
                <img 
                  src={getProfileImage(selectedProfile)}
                  alt={selectedProfile.nickname}
                  className="w-24 h-24 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {selectedProfile.nickname}
                    {selectedProfile.is_verified && <Shield className="w-5 h-5 text-blue-400" />}
                  </h3>
                  <p className="text-white/60">{selectedProfile.age} yaş • {selectedProfile.city_name || selectedProfile.city_id}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusBadge(selectedProfile.status)}
                    {selectedProfile.is_homepage_vitrin && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-pink-500/20 text-pink-400">Ana Sayfa Vitrini</span>
                    )}
                    {selectedProfile.is_city_vitrin && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-400">Şehir Vitrini</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="glass rounded-lg p-3 text-center">
                  <Eye className="w-5 h-5 text-[#D4AF37] mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">{(selectedProfile.view_count || 0).toLocaleString()}</p>
                  <p className="text-white/50 text-xs">Görüntülenme</p>
                </div>
                <div className="glass rounded-lg p-3 text-center">
                  <Image className="w-5 h-5 text-[#D4AF37] mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">{selectedProfile.images?.length || 0}</p>
                  <p className="text-white/50 text-xs">Fotoğraf</p>
                </div>
                <div className="glass rounded-lg p-3 text-center">
                  <Calendar className="w-5 h-5 text-[#D4AF37] mx-auto mb-1" />
                  <p className="text-sm font-bold text-white">
                    {new Date(selectedProfile.created_at).toLocaleDateString('tr-TR')}
                  </p>
                  <p className="text-white/50 text-xs">Kayıt Tarihi</p>
                </div>
              </div>

              {/* Description */}
              <div className="glass rounded-lg p-4">
                <h4 className="text-white/60 text-sm mb-2">Kısa Açıklama</h4>
                <p className="text-white">{selectedProfile.short_description || '-'}</p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass rounded-lg p-3">
                  <p className="text-white/50 text-xs mb-1">Cinsiyet</p>
                  <p className="text-white">{selectedProfile.gender === 'female' ? 'Kadın' : selectedProfile.gender === 'male' ? 'Erkek' : selectedProfile.gender}</p>
                </div>
                <div className="glass rounded-lg p-3">
                  <p className="text-white/50 text-xs mb-1">Saatlik Ücret</p>
                  <p className="text-white">{selectedProfile.hourly_rate ? `$${selectedProfile.hourly_rate}` : '-'}</p>
                </div>
                <div className="glass rounded-lg p-3">
                  <p className="text-white/50 text-xs mb-1">Boy</p>
                  <p className="text-white">{selectedProfile.height ? `${selectedProfile.height} cm` : '-'}</p>
                </div>
                <div className="glass rounded-lg p-3">
                  <p className="text-white/50 text-xs mb-1">Vücut Tipi</p>
                  <p className="text-white">{selectedProfile.body_type || '-'}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 pt-4 border-t border-white/10">
                {selectedProfile.status === 'pending' && (
                  <>
                    <Button
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                      onClick={() => { updateProfileStatus(selectedProfile.id, 'approved'); setSelectedProfile(null); }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Onayla
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-red-400 border-red-400/30 hover:bg-red-500/20"
                      onClick={() => { updateProfileStatus(selectedProfile.id, 'rejected'); setSelectedProfile(null); }}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reddet
                    </Button>
                  </>
                )}
                {!selectedProfile.is_verified && (
                  <Button
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => { toggleVerified(selectedProfile.id, false); setSelectedProfile(null); }}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Doğrula
                  </Button>
                )}
                {!selectedProfile.is_homepage_vitrin && (
                  <Button
                    variant="outline"
                    className="flex-1 text-pink-400 border-pink-400/30 hover:bg-pink-500/20"
                    onClick={() => { updateVitrin(selectedProfile.id, 'homepage', true); setSelectedProfile(null); }}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Vitrine Ekle
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPartners;
