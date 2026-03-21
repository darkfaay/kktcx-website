import React, { useState, useEffect } from 'react';
import { useAuth, useLanguage } from '../../context/AppContext';
import { 
  Calendar, Clock, CheckCircle, XCircle, AlertCircle, 
  ChevronLeft, ChevronRight, User, Settings, DollarSign,
  CalendarDays, List, Plus, Trash2, Save, Phone, Mail
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
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
  DialogFooter,
} from '../../components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import { toast } from 'sonner';

const PartnerAppointments = () => {
  const { api } = useAuth();
  const { t, lang } = useLanguage();
  
  const [activeTab, setActiveTab] = useState('list');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Settings state
  const [availability, setAvailability] = useState({
    working_hours_start: '09:00',
    working_hours_end: '22:00',
    slot_duration: 60,
    break_between_slots: 30,
    working_days: [1, 2, 3, 4, 5, 6, 7],
    blocked_dates: [],
    auto_confirm: false
  });
  const [durations, setDurations] = useState([]);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    fetchAppointments();
    fetchAvailability();
  }, [statusFilter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await api.get(`/partner/appointments?${params.toString()}`);
      setAppointments(response.data || []);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      toast.error('Randevular yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    try {
      const response = await api.get('/partner/availability');
      if (response.data.settings) {
        setAvailability(response.data.settings);
      }
      if (response.data.durations) {
        setDurations(response.data.durations);
      }
    } catch (error) {
      console.error('Failed to fetch availability:', error);
    }
  };

  const saveAvailability = async () => {
    setSavingSettings(true);
    try {
      await api.put('/partner/availability', availability);
      toast.success('Müsaitlik ayarları kaydedildi');
    } catch (error) {
      toast.error('Ayarlar kaydedilemedi');
    } finally {
      setSavingSettings(false);
    }
  };

  const saveDurations = async () => {
    setSavingSettings(true);
    try {
      await api.put('/partner/durations', durations);
      toast.success('Süre seçenekleri kaydedildi');
    } catch (error) {
      toast.error('Ayarlar kaydedilemedi');
    } finally {
      setSavingSettings(false);
    }
  };

  const updateStatus = async (appointmentId, status) => {
    try {
      await api.put(`/partner/appointments/${appointmentId}/status?status=${status}`);
      toast.success(status === 'confirmed' ? 'Randevu onaylandı' : status === 'rejected' ? 'Randevu reddedildi' : 'Durum güncellendi');
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

  // Calendar helpers
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay() || 7; // Monday = 1
    
    const days = [];
    // Add empty days for previous month
    for (let i = 1; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getAppointmentsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === dateStr);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const stats = {
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    total: appointments.length,
  };

  const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const workingDayLabels = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

  return (
    <div className="space-y-6" data-testid="partner-appointments">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-serif">Randevu Yönetimi</h1>
          <p className="text-white/60 mt-1">Randevularınızı ve müsaitlik ayarlarınızı yönetin</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <CheckCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.completed}</p>
              <p className="text-white/50 text-xs">Tamamlanan</p>
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="glass p-1 w-full md:w-auto">
          <TabsTrigger value="list" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black flex-1 md:flex-none">
            <List className="w-4 h-4 mr-2" />
            Liste
          </TabsTrigger>
          <TabsTrigger value="calendar" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black flex-1 md:flex-none">
            <CalendarDays className="w-4 h-4 mr-2" />
            Takvim
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black flex-1 md:flex-none">
            <Settings className="w-4 h-4 mr-2" />
            Ayarlar
          </TabsTrigger>
        </TabsList>

        {/* List View */}
        <TabsContent value="list" className="mt-6 space-y-4">
          {/* Filter */}
          <div className="glass rounded-xl p-4">
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
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Date Box */}
                      <div className="w-16 h-16 rounded-xl bg-[#D4AF37]/10 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[#D4AF37] text-2xl font-bold">
                          {new Date(appointment.date).getDate()}
                        </span>
                        <span className="text-white/50 text-xs">
                          {new Date(appointment.date).toLocaleDateString('tr-TR', { month: 'short' })}
                        </span>
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Clock className="w-4 h-4 text-white/40" />
                          <span className="text-white font-medium">{appointment.time_slot}</span>
                          <span className="text-white/40">•</span>
                          <span className="text-white/60">{appointment.duration_label}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <User className="w-4 h-4 text-white/40" />
                          <span className="text-white/60">{appointment.user_name || 'Kullanıcı'}</span>
                          {appointment.user_phone && (
                            <>
                              <span className="text-white/40">•</span>
                              <Phone className="w-3 h-3 text-white/40" />
                              <span className="text-white/50 text-sm">{appointment.user_phone}</span>
                            </>
                          )}
                        </div>
                        {appointment.price && (
                          <p className="text-[#D4AF37] font-medium mt-1">${appointment.price}</p>
                        )}
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-4 ml-20 md:ml-0">
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
                            data-testid={`confirm-${appointment.id}`}
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
                            data-testid={`reject-${appointment.id}`}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      
                      {appointment.status === 'confirmed' && (
                        <Button
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(appointment.id, 'completed');
                          }}
                        >
                          Tamamlandı
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2 glass rounded-xl p-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="text-white/60 hover:text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <h3 className="text-lg font-semibold text-white">
                  {currentMonth.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="text-white/60 hover:text-white"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Day Names */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-white/50 text-sm py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentMonth).map((day, idx) => {
                  const dayAppointments = day ? getAppointmentsForDate(day) : [];
                  const isSelected = selectedDate && day && 
                    day.toDateString() === selectedDate.toDateString();
                  const isToday = day && day.toDateString() === new Date().toDateString();
                  const hasPending = dayAppointments.some(a => a.status === 'pending');
                  const hasConfirmed = dayAppointments.some(a => a.status === 'confirmed');
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => day && setSelectedDate(day)}
                      disabled={!day}
                      className={`
                        aspect-square rounded-lg p-1 relative transition-all
                        ${!day ? 'invisible' : 'hover:bg-white/10'}
                        ${isSelected ? 'bg-[#D4AF37] text-black' : ''}
                        ${isToday && !isSelected ? 'border border-[#D4AF37]' : ''}
                      `}
                    >
                      {day && (
                        <>
                          <span className={`text-sm ${isSelected ? 'text-black font-bold' : 'text-white'}`}>
                            {day.getDate()}
                          </span>
                          {dayAppointments.length > 0 && (
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                              {hasPending && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>}
                              {hasConfirmed && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                            </div>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                  <span className="text-white/50 text-xs">Bekleyen</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                  <span className="text-white/50 text-xs">Onaylı</span>
                </div>
              </div>
            </div>

            {/* Selected Date Appointments */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#D4AF37]" />
                {selectedDate ? formatDate(selectedDate.toISOString()) : 'Tarih Seçin'}
              </h3>
              
              {selectedDate ? (
                <>
                  {getAppointmentsForDate(selectedDate).length === 0 ? (
                    <p className="text-white/50 text-center py-8">Bu tarihte randevu yok</p>
                  ) : (
                    <div className="space-y-3">
                      {getAppointmentsForDate(selectedDate).map((apt) => (
                        <div
                          key={apt.id}
                          className="p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                          onClick={() => setSelectedAppointment(apt)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white font-medium">{apt.time_slot}</span>
                            {getStatusBadge(apt.status)}
                          </div>
                          <p className="text-white/60 text-sm mt-1">{apt.user_name}</p>
                          <p className="text-[#D4AF37] text-sm">{apt.duration_label} - ${apt.price}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-white/50 text-center py-8">
                  Randevuları görmek için takvimden bir tarih seçin
                </p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Settings View */}
        <TabsContent value="settings" className="mt-6 space-y-6">
          {/* Working Hours */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#D4AF37]" />
              Çalışma Saatleri
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/60 text-sm mb-2 block">Başlangıç Saati</label>
                <Input
                  type="time"
                  value={availability.working_hours_start}
                  onChange={(e) => setAvailability({...availability, working_hours_start: e.target.value})}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div>
                <label className="text-white/60 text-sm mb-2 block">Bitiş Saati</label>
                <Input
                  type="time"
                  value={availability.working_hours_end}
                  onChange={(e) => setAvailability({...availability, working_hours_end: e.target.value})}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div>
                <label className="text-white/60 text-sm mb-2 block">Slot Süresi (dakika)</label>
                <Select 
                  value={String(availability.slot_duration)} 
                  onValueChange={(v) => setAvailability({...availability, slot_duration: parseInt(v)})}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#15151F] border-[#D4AF37]/20">
                    <SelectItem value="30">30 dakika</SelectItem>
                    <SelectItem value="60">60 dakika</SelectItem>
                    <SelectItem value="90">90 dakika</SelectItem>
                    <SelectItem value="120">120 dakika</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-white/60 text-sm mb-2 block">Aralar (dakika)</label>
                <Select 
                  value={String(availability.break_between_slots)} 
                  onValueChange={(v) => setAvailability({...availability, break_between_slots: parseInt(v)})}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#15151F] border-[#D4AF37]/20">
                    <SelectItem value="0">Ara yok</SelectItem>
                    <SelectItem value="15">15 dakika</SelectItem>
                    <SelectItem value="30">30 dakika</SelectItem>
                    <SelectItem value="60">60 dakika</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Working Days */}
            <div className="mt-6">
              <label className="text-white/60 text-sm mb-3 block">Çalışma Günleri</label>
              <div className="flex flex-wrap gap-2">
                {workingDayLabels.map((day, idx) => {
                  const dayNum = idx + 1;
                  const isActive = availability.working_days.includes(dayNum);
                  return (
                    <button
                      key={dayNum}
                      onClick={() => {
                        const newDays = isActive
                          ? availability.working_days.filter(d => d !== dayNum)
                          : [...availability.working_days, dayNum].sort();
                        setAvailability({...availability, working_days: newDays});
                      }}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        isActive 
                          ? 'bg-[#D4AF37] text-black' 
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Auto Confirm */}
            <div className="mt-6 flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <p className="text-white font-medium">Otomatik Onay</p>
                <p className="text-white/50 text-sm">Randevuları otomatik olarak onayla</p>
              </div>
              <Switch
                checked={availability.auto_confirm}
                onCheckedChange={(checked) => setAvailability({...availability, auto_confirm: checked})}
              />
            </div>

            <Button 
              onClick={saveAvailability} 
              disabled={savingSettings}
              className="mt-6 bg-[#D4AF37] hover:bg-[#D4AF37]/80 text-black"
            >
              <Save className="w-4 h-4 mr-2" />
              {savingSettings ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
            </Button>
          </div>

          {/* Duration Options */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#D4AF37]" />
              Süre ve Fiyat Seçenekleri
            </h3>

            <div className="space-y-4">
              {durations.map((duration, idx) => (
                <div key={duration.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                  <Switch
                    checked={duration.is_active}
                    onCheckedChange={(checked) => {
                      const newDurations = [...durations];
                      newDurations[idx].is_active = checked;
                      setDurations(newDurations);
                    }}
                  />
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <Input
                      value={duration.label}
                      onChange={(e) => {
                        const newDurations = [...durations];
                        newDurations[idx].label = e.target.value;
                        setDurations(newDurations);
                      }}
                      className="bg-white/5 border-white/10"
                      placeholder="Etiket"
                    />
                    <Input
                      type="number"
                      value={duration.minutes}
                      onChange={(e) => {
                        const newDurations = [...durations];
                        newDurations[idx].minutes = parseInt(e.target.value) || 0;
                        setDurations(newDurations);
                      }}
                      className="bg-white/5 border-white/10"
                      placeholder="Dakika"
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
                      <Input
                        type="number"
                        value={duration.price}
                        onChange={(e) => {
                          const newDurations = [...durations];
                          newDurations[idx].price = parseInt(e.target.value) || 0;
                          setDurations(newDurations);
                        }}
                        className="bg-white/5 border-white/10 pl-8"
                        placeholder="Fiyat"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDurations(durations.filter((_, i) => i !== idx))}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-4">
              <Button
                variant="outline"
                onClick={() => setDurations([...durations, {
                  id: `custom-${Date.now()}`,
                  label: 'Yeni Seçenek',
                  minutes: 60,
                  price: 100,
                  is_active: true
                }])}
                className="border-white/10 text-white hover:bg-white/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Seçenek Ekle
              </Button>
              <Button 
                onClick={saveDurations}
                disabled={savingSettings}
                className="bg-[#D4AF37] hover:bg-[#D4AF37]/80 text-black"
              >
                <Save className="w-4 h-4 mr-2" />
                {savingSettings ? 'Kaydediliyor...' : 'Fiyatları Kaydet'}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Appointment Detail Dialog */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="bg-[#15151F] border-[#D4AF37]/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#D4AF37]" />
              Randevu Detayı
            </DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-white/60">Tarih:</span>
                <span className="text-white font-medium">
                  {formatDate(selectedAppointment.date)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-white/60">Saat:</span>
                <span className="text-white font-medium">{selectedAppointment.time_slot}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-white/60">Süre:</span>
                <span className="text-white font-medium">{selectedAppointment.duration_label}</span>
              </div>
              {selectedAppointment.price && (
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/60">Ücret:</span>
                  <span className="text-[#D4AF37] font-bold text-lg">${selectedAppointment.price}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-white/60">Durum:</span>
                {getStatusBadge(selectedAppointment.status)}
              </div>
              
              {/* Customer Info */}
              <div className="p-4 bg-white/5 rounded-lg space-y-2">
                <p className="text-white/60 text-sm">Müşteri Bilgileri</p>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-white/40" />
                  <span className="text-white">{selectedAppointment.user_name || 'İsimsiz'}</span>
                </div>
                {selectedAppointment.user_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-white/40" />
                    <span className="text-white/70 text-sm">{selectedAppointment.user_email}</span>
                  </div>
                )}
                {selectedAppointment.user_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-white/40" />
                    <span className="text-white/70 text-sm">{selectedAppointment.user_phone}</span>
                  </div>
                )}
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
              
              {selectedAppointment.status === 'confirmed' && (
                <Button
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => updateStatus(selectedAppointment.id, 'completed')}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Tamamlandı Olarak İşaretle
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnerAppointments;
