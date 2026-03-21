import React, { useState, useEffect } from 'react';
import { useAuth, useLanguage } from '../../context/AppContext';
import { 
  Calendar, Clock, CheckCircle, XCircle, AlertCircle, 
  ChevronLeft, ChevronRight, User, MessageCircle, Filter
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
import { toast } from 'sonner';

const PartnerAppointments = () => {
  const { api } = useAuth();
  const { t, lang } = useLanguage();
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, [page, statusFilter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 20);
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/appointments?${params.toString()}`);
      setAppointments(response.data.appointments || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appointmentId, status) => {
    try {
      await api.put(`/appointments/${appointmentId}/status?status=${status}`);
      toast.success(status === 'confirmed' ? 'Randevu onaylandı' : 'Randevu reddedildi');
      fetchAppointments();
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

  const stats = {
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    total: total,
  };

  return (
    <div className="space-y-6" data-testid="partner-appointments">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-serif">Randevularım</h1>
          <p className="text-white/60 mt-1">Randevu taleplerini yönetin</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
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
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-white/50 text-xs">Toplam</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4">
        <div className="flex gap-4">
          <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
            <SelectTrigger className="w-48 input-glass">
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

      {/* Appointments List */}
      {loading ? (
        <div className="glass rounded-xl p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <Calendar className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">Henüz randevu yok</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div 
              key={appointment.id} 
              className="glass rounded-xl p-4 hover:border-[#D4AF37]/30 transition-all cursor-pointer"
              onClick={() => setSelectedAppointment(appointment)}
              data-testid={`appointment-${appointment.id}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Date Box */}
                  <div className="w-16 h-16 rounded-xl bg-[#D4AF37]/10 flex flex-col items-center justify-center">
                    <span className="text-[#D4AF37] text-2xl font-bold">
                      {new Date(appointment.date).getDate()}
                    </span>
                    <span className="text-white/50 text-xs">
                      {new Date(appointment.date).toLocaleDateString('tr-TR', { month: 'short' })}
                    </span>
                  </div>
                  
                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-white/40" />
                      <span className="text-white font-medium">{appointment.time_slot}</span>
                      <span className="text-white/40">•</span>
                      <span className="text-white/60">{appointment.duration_label}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="w-4 h-4 text-white/40" />
                      <span className="text-white/60">{appointment.user_name || 'Kullanıcı'}</span>
                    </div>
                    {appointment.price && (
                      <p className="text-[#D4AF37] font-medium mt-1">${appointment.price}</p>
                    )}
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-4">
                  {getStatusBadge(appointment.status)}
                  
                  {appointment.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateStatus(appointment.id, 'confirmed');
                        }}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-400 border-red-400/30 hover:bg-red-500/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateStatus(appointment.id, 'rejected');
                        }}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
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

      {/* Appointment Detail Dialog */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="bg-[#15151F] border-[#D4AF37]/20 text-white">
          <DialogHeader>
            <DialogTitle>Randevu Detayı</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
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
              {selectedAppointment.price && (
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Ücret:</span>
                  <span className="text-[#D4AF37] font-bold">${selectedAppointment.price}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-white/60">Durum:</span>
                {getStatusBadge(selectedAppointment.status)}
              </div>
              {selectedAppointment.notes && (
                <div>
                  <span className="text-white/60 block mb-2">Notlar:</span>
                  <p className="text-white/80 bg-white/5 rounded-lg p-3">{selectedAppointment.notes}</p>
                </div>
              )}
              
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

export default PartnerAppointments;
