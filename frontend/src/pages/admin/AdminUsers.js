import React, { useState, useEffect } from 'react';
import { useAuth, useLanguage } from '../../context/AppContext';
import { User, Ban, CheckCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { toast } from 'sonner';

const AdminUsers = () => {
  const { api } = useAuth();
  const { t } = useLanguage();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 20);
      if (roleFilter) params.append('role', roleFilter);

      const response = await api.get(`/admin/users?${params.toString()}`);
      setUsers(response.data.users);
      setTotal(response.data.total);
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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-serif">Kullanıcılar</h1>
          <p className="text-white/60 mt-1">{total} kullanıcı</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select value={roleFilter || "all"} onValueChange={(v) => setRoleFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="input-glass w-[180px]" data-testid="role-filter">
            <SelectValue placeholder="Tüm Roller" />
          </SelectTrigger>
          <SelectContent className="bg-[#0F0F10] border-white/10">
            <SelectItem value="all">Tüm Roller</SelectItem>
            <SelectItem value="user">Kullanıcı</SelectItem>
            <SelectItem value="partner">Partner</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Kullanıcı</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">E-posta</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Rol</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Durum</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Kayıt</th>
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/60">
                    Kullanıcı bulunamadı
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5" data-testid={`user-row-${user.id}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                          <User className="w-5 h-5 text-[#D4AF37]" />
                        </div>
                        <span className="text-white">{user.name || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/70">{user.email}</td>
                    <td className="px-6 py-4">
                      <Select 
                        value={user.role} 
                        onValueChange={(v) => changeUserRole(user.id, v)}
                      >
                        <SelectTrigger className="w-[120px] h-8 text-xs bg-white/5 border-white/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0F0F10] border-white/10">
                          <SelectItem value="user">Kullanıcı</SelectItem>
                          <SelectItem value="partner">Partner</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.is_active !== false
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {user.is_active !== false ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/50 text-sm">
                      {new Date(user.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleUserStatus(user.id, user.is_active !== false)}
                        className={user.is_active !== false ? 'text-red-400' : 'text-emerald-400'}
                        data-testid={`toggle-user-${user.id}`}
                      >
                        {user.is_active !== false ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </Button>
                    </td>
                  </tr>
                ))
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
    </div>
  );
};

export default AdminUsers;
