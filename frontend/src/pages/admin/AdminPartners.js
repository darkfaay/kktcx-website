import React, { useState, useEffect } from 'react';
import { useAuth, useLanguage } from '../../context/AppContext';
import { 
  User, Ban, CheckCircle, Search, ChevronLeft, ChevronRight,
  Mail, Phone, Calendar, Shield, Crown, Eye, MessageCircle,
  Filter, MoreVertical, Trash2, Edit, UserCheck, Star, MapPin
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
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AdminPartners = () => {
  const { api } = useAuth();
  const { t, lang } = useLanguage();
  
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPartners();
  }, [page, statusFilter]);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 20);
      params.append('role', 'partner');
      if (statusFilter) params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await api.get(`/admin/users?${params.toString()}`);
      setPartners(response.data.users || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/admin/users/${userId}`, null, {
        params: { is_active: !currentStatus }
      });
      toast.success(currentStatus ? 'Partner pasifleştirildi' : 'Partner aktifleştirildi');
      fetchPartners();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const verifyPartner = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}`, null, {
        params: { is_verified: true }
      });
      toast.success('Partner doğrulandı');
      fetchPartners();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const getPartnerImage = (partner) => {
    if (partner.photo_url) return partner.photo_url;
    if (partner.avatar) return partner.avatar;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.name || partner.email)}&background=D4AF37&color=000&size=80`;
  };

  const totalPages = Math.ceil(total / 20);

  const stats = {
    total: total,
    active: partners.filter(p => p.is_active).length,
    verified: partners.filter(p => p.is_verified).length,
    inactive: partners.filter(p => !p.is_active).length,
  };

  return (
    <div data-testid="admin-partners">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-serif">Partner Yönetimi</h1>
          <p className="text-white/60 mt-1">Partnerleri yönetin ve doğrulayın</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
              <Crown className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-white/50 text-xs">Toplam Partner</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.active}</p>
              <p className="text-white/50 text-xs">Aktif</p>
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
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Ban className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.inactive}</p>
              <p className="text-white/50 text-xs">Pasif</p>
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchPartners()}
              placeholder="Partner ara..."
              className="input-glass pl-10"
              data-testid="partner-search"
            />
          </div>
          <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
            <SelectTrigger className="w-40 input-glass">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent className="bg-[#15151F] border-[#D4AF37]/20">
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Pasif</SelectItem>
              <SelectItem value="verified">Doğrulanmış</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchPartners} className="bg-[#D4AF37] hover:bg-[#D4AF37]/80 text-black">
            <Search className="w-4 h-4 mr-2" />
            Ara
          </Button>
        </div>
      </div>

      {/* Partners Grid */}
      {loading ? (
        <div className="glass rounded-xl p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : partners.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <Crown className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">Partner bulunamadı</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {partners.map((partner) => (
            <div 
              key={partner.id} 
              className="glass rounded-2xl overflow-hidden group hover:border-[#D4AF37]/30 transition-all"
              data-testid={`partner-card-${partner.id}`}
            >
              {/* Header with Photo */}
              <div className="relative h-32 bg-gradient-to-br from-[#D4AF37]/20 to-[#0F0F10]">
                <img 
                  src={getPartnerImage(partner)}
                  alt={partner.name}
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-20 h-20 rounded-full object-cover border-4 border-[#0F0F10]"
                />
                {/* Status Badge */}
                <div className="absolute top-3 right-3 flex gap-2">
                  {partner.is_verified && (
                    <span className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center" title="Doğrulanmış">
                      <Shield className="w-3.5 h-3.5 text-white" />
                    </span>
                  )}
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center ${partner.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    {partner.is_active ? <CheckCircle className="w-3.5 h-3.5 text-white" /> : <Ban className="w-3.5 h-3.5 text-white" />}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 pt-12 text-center">
                <h3 className="text-white font-bold text-lg">{partner.name || 'İsimsiz'}</h3>
                <p className="text-white/50 text-sm truncate">{partner.email}</p>
                {partner.phone && (
                  <p className="text-white/40 text-xs mt-1 flex items-center justify-center gap-1">
                    <Phone className="w-3 h-3" /> {partner.phone}
                  </p>
                )}

                {/* Stats Row */}
                <div className="flex items-center justify-center gap-4 mt-4 text-xs text-white/40">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> 
                    {new Date(partner.created_at).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  {!partner.is_verified && (
                    <Button
                      size="sm"
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={() => verifyPartner(partner.id)}
                    >
                      <Shield className="w-4 h-4 mr-1" />
                      Doğrula
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className={`flex-1 ${partner.is_active ? 'text-red-400 hover:bg-red-500/20' : 'text-emerald-400 hover:bg-emerald-500/20'}`}
                    onClick={() => toggleUserStatus(partner.id, partner.is_active)}
                  >
                    {partner.is_active ? <Ban className="w-4 h-4 mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                    {partner.is_active ? 'Pasif Yap' : 'Aktif Yap'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
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
            className="btn-outline"
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
            className="btn-outline"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminPartners;
