import React, { useState, useEffect } from 'react';
import { useAuth, useLanguage } from '../../context/AppContext';
import { 
  Calendar, Clock, CheckCircle, XCircle, AlertCircle, 
  ChevronLeft, ChevronRight, User, Search, Filter,
  Eye, MoreVertical, TrendingUp
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
import { toast } from 'sonner';

const AdminAppointments = () => {
  const { api } = useAuth();
  const { lang } = useLanguage();
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  });

  useEffect(() => {
    fetchAppointments();
    fetchStats();
  }, [page, statusFilter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 20);
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/admin/appointments?${params.toString()}`);
      setAppointments(response.data.appointments || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      toast.error('Randevular yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/appointments/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const updateStatus = async (appointmentId, status) => {
    try {
      await api.put(`/admin/appointments/${appointmentId}/status?status=${status}`);
      toast.success(`Randevu ${status === 'confirmed' ? 'onaylandı' : status === 'rejected' ? 'reddedildi' : 'güncellendi'}`);
      fetchAppointments();
      fetchStats();
      setSelectedAppointment(null);
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      confirmed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
      cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };
    const labels = {
      pending: 'Bekliyor',
      confirmed: 'Onaylandı',
      rejected: 'Reddedildi',
      cancelled: 'İptal Edildi',
      completed: 'Tamamlandı',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  const totalPages = Math.ceil(total / 20);

  const filteredAppointments = appointments.filter(apt => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      apt.partner_name?.toLowerCase().includes(query) ||
      apt.user_name?.toLowerCase().includes(query) ||
      apt.user_email?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6" data-testid="admin-appointments">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Randevu Yönetimi</h1>
          <p className="text-white/60 mt-1">Tüm randevuları görüntüleyin ve yönetin</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#D4AF37]" />
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
              <AlertCircle className="w-5 h-5 text-yellow-400" />
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
              <p className="text-2xl font-bold text-white">{stats.confirmed}</p>
              <p className="text-white/50 text-xs">Onaylı</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.completed}</p>
              <p className="text-white/50 text-xs">Tamamlanan</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.cancelled}</p>
              <p className="text-white/50 text-xs">İptal</p>
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
              placeholder="Partner veya kullanıcı ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10"
            />
          </div>
          <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
            <SelectTrigger className="w-48 bg-white/5 border-white/10">
              <SelectValue placeholder="Durum Filtrele" />
            </SelectTrigger>
            <SelectContent className="bg-[#15151F] border-[#D4AF37]/20">
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="pending">Bekleyen</SelectItem>
              <SelectItem value="confirmed">Onaylı</SelectItem>
              <SelectItem value="rejected">Reddedilen</SelectItem>
              <SelectItem value="cancelled">İptal</SelectItem>
              <SelectItem value="completed">Tamamlanan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Appointments Table */}
      {loading ? (
        <div className="glass rounded-xl p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <Calendar className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">Randevu bulunamadı</p>
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-white/60 text-sm font-medium">Tarih/Saat</th>
                  <th className="text-left p-4 text-white/60 text-sm font-medium">Partner</th>
                  <th className="text-left p-4 text-white/60 text-sm font-medium">Kullanıcı</th>
                  <th className="text-left p-4 text-white/60 text-sm font-medium">Süre</th>
                  <th className="text-left p-4 text-white/60 text-sm font-medium">Ücret</th>
                  <th className="text-left p-4 text-white/60 text-sm font-medium">Durum</th>
                  <th className="text-right p-4 text-white/60 text-sm font-medium">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => (
                  <tr 
                    key={appointment.id} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    data-testid={`appointment-row-${appointment.id}`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/10 flex flex-col items-center justify-center">
                          <span className="text-[#D4AF37] text-lg font-bold">
                            {new Date(appointment.date).getDate()}
                          </span>
                          <span className="text-white/50 text-xs">
                            {new Date(appointment.date).toLocaleDateString('tr-TR', { month: 'short' })}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{appointment.time_slot}</p>
                          <p className="text-white/50 text-xs">
                            {new Date(appointment.date).toLocaleDateString('tr-TR', { weekday: 'long' })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {appointment.partner_photo ? (
                          <img 
                            src={appointment.partner_photo} 
                            alt={appointment.partner_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#E91E63]/20 flex items-center justify-center">
                            <User className="w-5 h-5 text-[#E91E63]" />
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">{appointment.partner_name || 'Partner'}</p>
                          <p className="text-white/50 text-xs">{appointment.partner_city || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-white">{appointment.user_name || 'Kullanıcı'}</p>
                      <p className="text-white/50 text-xs">{appointment.user_email || ''}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-white">{appointment.duration_label || `${appointment.duration_minutes} dk`}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-[#D4AF37] font-bold">${appointment.price || 0}</p>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(appointment.status)}
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#15151F] border-[#D4AF37]/20">
                          <DropdownMenuItem 
                            onClick={() => setSelectedAppointment(appointment)}
                            className="text-white hover:bg-white/10"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Detay
                          </DropdownMenuItem>
                          {appointment.status === 'pending' && (
                            <>
                              <DropdownMenuItem 
                                onClick={() => updateStatus(appointment.id, 'confirmed')}
                                className="text-emerald-400 hover:bg-emerald-500/20"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Onayla
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => updateStatus(appointment.id, 'rejected')}
                                className="text-red-400 hover:bg-red-500/20"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reddet
                              </DropdownMenuItem>
                            </>
                          )}
                          {appointment.status === 'confirmed' && (
                            <DropdownMenuItem 
                              onClick={() => updateStatus(appointment.id, 'completed')}
                              className="text-blue-400 hover:bg-blue-500/20"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Tamamlandı
                            </DropdownMenuItem>
                          )}
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

      {/* Appointment Detail Dialog */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="bg-[#15151F] border-[#D4AF37]/20 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Randevu Detayı</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="glass rounded-lg p-3">
                  <p className="text-white/50 text-xs mb-1">Partner</p>
                  <p className="text-white font-medium">{selectedAppointment.partner_name}</p>
                </div>
                <div className="glass rounded-lg p-3">
                  <p className="text-white/50 text-xs mb-1">Kullanıcı</p>
                  <p className="text-white font-medium">{selectedAppointment.user_name}</p>
                </div>
              </div>
              
              <div className="glass rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Tarih:</span>
                  <span className="text-white font-medium">
                    {new Date(selectedAppointment.date).toLocaleDateString('tr-TR', { 
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Saat:</span>
                  <span className="text-white font-medium">{selectedAppointment.time_slot}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Süre:</span>
                  <span className="text-white font-medium">{selectedAppointment.duration_label}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Ücret:</span>
                  <span className="text-[#D4AF37] font-bold">${selectedAppointment.price}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Durum:</span>
                  {getStatusBadge(selectedAppointment.status)}
                </div>
              </div>
              
              {selectedAppointment.notes && (
                <div className="glass rounded-lg p-4">
                  <p className="text-white/50 text-xs mb-2">Notlar:</p>
                  <p className="text-white/80">{selectedAppointment.notes}</p>
                </div>
              )}
              
              <div className="glass rounded-lg p-4">
                <p className="text-white/50 text-xs mb-2">Oluşturulma:</p>
                <p className="text-white/80">
                  {new Date(selectedAppointment.created_at).toLocaleString('tr-TR')}
                </p>
              </div>
              
              {selectedAppointment.status === 'pending' && (
                <div className="flex gap-4 pt-4">
                  <Button
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                    onClick={() => updateStatus(selectedAppointment.id, 'confirmed')}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Onayla
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-400 border-red-400/30 hover:bg-red-500/20"
                    onClick={() => updateStatus(selectedAppointment.id, 'rejected')}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reddet
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAppointments;
