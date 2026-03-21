import React, { useState, useEffect } from 'react';
import { useAuth, useLanguage } from '../../context/AppContext';
import { 
  User, Ban, CheckCircle, Search, ChevronLeft, ChevronRight,
  Mail, Phone, Calendar, Shield, Crown, Eye, MessageCircle,
  Filter, MoreVertical, Trash2, Edit, UserCheck
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

const AdminUsers = () => {
  const { api } = useAuth();
  const { t, lang } = useLanguage();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 20);
      params.append('role', 'user'); // Only fetch normal users
      if (searchQuery) params.append('search', searchQuery);

      const response = await api.get(`/admin/users?${params.toString()}`);
      setUsers(response.data.users || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/admin/users/${userId}`, null, {
        params: { is_active: !currentStatus }
      });
      toast.success(currentStatus ? 'Kullanıcı pasifleştirildi' : 'Kullanıcı aktifleştirildi');
      fetchUsers();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const changeUserRole = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}`, null, {
        params: { role: newRole }
      });
      toast.success('Rol güncellendi');
      fetchUsers();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: { color: 'bg-red-500/20 text-red-400', icon: Shield, label: 'Admin' },
      partner: { color: 'bg-purple-500/20 text-purple-400', icon: Crown, label: 'Partner' },
      user: { color: 'bg-blue-500/20 text-blue-400', icon: User, label: 'Kullanıcı' },
    };
    const badge = badges[role] || badges.user;
    const Icon = badge.icon;
    return (
      <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const stats = {
    total: total,
    partners: users.filter(u => u.role === 'partner').length,
    admins: users.filter(u => u.role === 'admin').length,
    active: users.filter(u => u.is_active !== false).length,
  };

  return (
    <div data-testid="admin-users">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-serif">Tüm Kullanıcılar</h1>
          <p className="text-white/60 mt-1">Kullanıcı ve partner yönetimi</p>
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
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Crown className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.partners}</p>
              <p className="text-white/50 text-xs">Partner</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.admins}</p>
              <p className="text-white/50 text-xs">Admin</p>
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
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder="E-posta veya isim ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
              className="input-glass pl-10"
              data-testid="user-search"
            />
          </div>
          <Button onClick={fetchUsers} className="btn-primary">
            <Search className="w-4 h-4 mr-2" />
            Ara
          </Button>
        </div>
      </div>

      {/* Users List */}
      <div className="glass rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#E91E63] border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <User className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">Kullanıcı bulunamadı</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Kullanıcı</th>
                    <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">İletişim</th>
                    <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Rol</th>
                    <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Durum</th>
                    <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Kayıt</th>
                    <th className="text-right px-6 py-4 text-white/60 text-sm font-medium">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors" data-testid={`user-row-${user.id}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E91E63] to-purple-500 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {(user.name?.[0] || user.email?.[0] || '?').toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <span className="text-white font-medium">{user.name || 'İsimsiz'}</span>
                            <p className="text-white/40 text-xs">ID: {user.id?.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-white/70 text-sm flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {user.email}
                          </p>
                          {user.phone && (
                            <p className="text-white/50 text-xs flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {user.phone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Select 
                          value={user.role} 
                          onValueChange={(v) => changeUserRole(user.id, v)}
                        >
                          <SelectTrigger className="w-[130px] h-8 text-xs bg-white/5 border-white/10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#15151F] border-white/10">
                            <SelectItem value="user">Kullanıcı</SelectItem>
                            <SelectItem value="partner">Partner</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.is_active !== false
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {user.is_active !== false ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white/50 text-sm">
                          <p className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(user.created_at).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-white/60">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-[#15151F] border-white/10">
                            <DropdownMenuItem 
                              className="text-white/70 hover:text-white focus:text-white"
                              onClick={() => window.open(`/${lang}/admin/profiller?user=${user.id}`, '_blank')}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Profili Gör
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-white/70 hover:text-white focus:text-white">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Mesaj Gönder
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className={user.is_active !== false ? 'text-red-400' : 'text-emerald-400'}
                              onClick={() => toggleUserStatus(user.id, user.is_active !== false)}
                            >
                              {user.is_active !== false ? (
                                <><Ban className="w-4 h-4 mr-2" /> Pasifleştir</>
                              ) : (
                                <><CheckCircle className="w-4 h-4 mr-2" /> Aktifleştir</>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-white/5">
              {users.map((user) => (
                <div key={user.id} className="p-4 hover:bg-white/5" data-testid={`user-card-${user.id}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E91E63] to-purple-500 flex items-center justify-center">
                        <span className="text-white font-bold">
                          {(user.name?.[0] || user.email?.[0] || '?').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.name || 'İsimsiz'}</p>
                        <p className="text-white/50 text-sm">{user.email}</p>
                      </div>
                    </div>
                    {getRoleBadge(user.role)}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      user.is_active !== false
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {user.is_active !== false ? 'Aktif' : 'Pasif'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleUserStatus(user.id, user.is_active !== false)}
                      className={user.is_active !== false ? 'text-red-400' : 'text-emerald-400'}
                    >
                      {user.is_active !== false ? 'Pasifleştir' : 'Aktifleştir'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-center gap-4 p-4 border-t border-white/5">
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
      </div>
    </div>
  );
};

export default AdminUsers;
