import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, useLanguage } from '../context/AppContext';
import axios from 'axios';
import { 
  Calendar, Clock, ChevronLeft, ChevronRight, Check,
  ArrowLeft, User, MapPin, Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const BookAppointmentPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, api } = useAuth();
  const { lang } = useLanguage();
  
  const [profile, setProfile] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Booking state
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [notes, setNotes] = useState('');
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    console.log('BookAppointmentPage mounted, slug:', slug, 'user:', user?.email);
    if (!user) {
      console.log('No user, redirecting to login');
      navigate(`/${lang}/giris`);
      return;
    }
    fetchPartnerAndAvailability();
  }, [slug, user]);

  const fetchPartnerAndAvailability = async () => {
    console.log('Fetching partner and availability for slug:', slug);
    try {
      // Fetch partner profile
      const profileRes = await axios.get(`${API_URL}/api/partners/${slug}?lang=${lang}`);
      console.log('Profile response:', profileRes.data);
      setProfile(profileRes.data);
      
      // Fetch availability
      const month = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
      const availRes = await axios.get(`${API_URL}/api/availability/${profileRes.data.id}?month=${month}`);
      console.log('Availability response:', availRes.data);
      setAvailability(availRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
      toast.error('Partner bulunamadı');
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    if (!availability?.settings) return [];
    
    const { working_hours_start, working_hours_end, slot_duration, break_between_slots } = availability.settings;
    const slots = [];
    
    const [startHour, startMin] = working_hours_start.split(':').map(Number);
    const [endHour, endMin] = working_hours_end.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMin = startMin;
    
    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
      
      // Check if slot is booked
      const isBooked = availability.blocked_slots?.some(
        s => s.date === selectedDate && s.time === timeStr
      );
      
      slots.push({ time: timeStr, booked: isBooked });
      
      // Add duration + break
      currentMin += slot_duration + break_between_slots;
      while (currentMin >= 60) {
        currentMin -= 60;
        currentHour++;
      }
    }
    
    return slots;
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      
      // Check if it's a working day
      const isWorkingDay = availability?.settings?.working_days?.includes(dayOfWeek === 0 ? 7 : dayOfWeek) ?? true;
      const isBlocked = availability?.settings?.blocked_dates?.includes(dateStr);
      const isPast = date < today;
      const isCurrentMonth = date.getMonth() === month;
      
      // Check if fully booked
      const dayBookings = availability?.blocked_slots?.filter(s => s.date === dateStr) || [];
      const totalSlots = generateTimeSlots().length;
      const isFullyBooked = dayBookings.length >= totalSlots;
      
      days.push({
        date,
        dateStr,
        day: date.getDate(),
        isCurrentMonth,
        isDisabled: !isWorkingDay || isBlocked || isPast || !isCurrentMonth,
        isFullyBooked,
        isSelected: selectedDate === dateStr,
        isToday: date.toDateString() === today.toDateString()
      });
    }
    
    return days;
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !selectedDuration) {
      toast.error('Lütfen tarih, saat ve süre seçin');
      return;
    }
    
    setSubmitting(true);
    try {
      await api.post('/appointments', {
        partner_id: profile.id,
        date: selectedDate,
        time_slot: selectedTime,
        duration_id: selectedDuration.id,
        notes: notes
      });
      
      toast.success('Randevu talebiniz gönderildi!');
      navigate(`/${lang}/kullanici/randevularim`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Randevu oluşturulamadı');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading">
        <div className="animate-spin w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full"></div>
        <span className="ml-3 text-white">Yükleniyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="error">
        <p className="text-red-400">Hata: {error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="not-found">
        <p className="text-white/60">Partner bulunamadı</p>
      </div>
    );
  }

  const timeSlots = generateTimeSlots();
  const calendarDays = generateCalendarDays();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6 text-white/60 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Geri
      </Button>

      {/* Header */}
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <img 
            src={profile.photo_url || profile.cover_url}
            alt={profile.nickname}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h1 className="text-2xl font-bold text-white">{profile.nickname} ile Randevu</h1>
            <div className="flex items-center gap-2 text-white/60 mt-1">
              <MapPin className="w-4 h-4" />
              <span>{profile.city_name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left - Calendar */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#D4AF37]" />
            Tarih Seçin
          </h2>
          
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-white font-medium">
              {currentMonth.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'].map(day => (
              <div key={day} className="text-center text-white/40 text-xs py-2">{day}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => (
              <button
                key={idx}
                disabled={day.isDisabled}
                onClick={() => {
                  setSelectedDate(day.dateStr);
                  setSelectedTime(null);
                }}
                className={`aspect-square rounded-lg flex items-center justify-center text-sm transition-all
                  ${day.isDisabled ? 'text-white/20 cursor-not-allowed' : 'hover:bg-white/10 cursor-pointer'}
                  ${day.isSelected ? 'bg-[#D4AF37] text-black font-bold' : ''}
                  ${day.isToday && !day.isSelected ? 'ring-1 ring-[#D4AF37]/50' : ''}
                  ${day.isFullyBooked ? 'bg-red-500/20 text-red-400' : ''}
                  ${!day.isCurrentMonth ? 'opacity-30' : 'text-white'}
                `}
              >
                {day.day}
              </button>
            ))}
          </div>
        </div>

        {/* Right - Time & Duration */}
        <div className="space-y-6">
          {/* Time Selection */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#D4AF37]" />
              Saat Seçin
            </h2>
            
            {selectedDate ? (
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map(slot => (
                  <button
                    key={slot.time}
                    disabled={slot.booked}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`py-2 px-3 rounded-lg text-sm transition-all
                      ${slot.booked ? 'bg-red-500/20 text-red-400 cursor-not-allowed line-through' : ''}
                      ${selectedTime === slot.time ? 'bg-[#D4AF37] text-black font-bold' : 'bg-white/5 text-white hover:bg-white/10'}
                    `}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-white/40 text-center py-8">Önce tarih seçin</p>
            )}
          </div>

          {/* Duration Selection */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              Süre Seçin
            </h2>
            
            <div className="space-y-2">
              {availability?.durations?.map(duration => (
                <button
                  key={duration.id}
                  onClick={() => setSelectedDuration(duration)}
                  className={`w-full p-4 rounded-xl flex items-center justify-between transition-all
                    ${selectedDuration?.id === duration.id 
                      ? 'bg-[#D4AF37]/20 border-2 border-[#D4AF37]' 
                      : 'bg-white/5 border-2 border-transparent hover:bg-white/10'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    {selectedDuration?.id === duration.id && (
                      <Check className="w-5 h-5 text-[#D4AF37]" />
                    )}
                    <span className="text-white font-medium">{duration.label}</span>
                  </div>
                  {duration.price && (
                    <span className="text-[#D4AF37] font-bold">${duration.price}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="glass rounded-2xl p-6 mt-6">
        <h2 className="text-xl font-semibold text-white mb-4">Notlar (Opsiyonel)</h2>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Randevunuz hakkında eklemek istediğiniz notlar..."
          className="input-glass min-h-[100px]"
        />
      </div>

      {/* Summary & Submit */}
      <div className="glass rounded-2xl p-6 mt-6">
        <h2 className="text-xl font-semibold text-white mb-4">Özet</h2>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="text-white/60">Tarih:</span>
            <span className="text-white font-medium">
              {selectedDate 
                ? new Date(selectedDate).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })
                : '-'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Saat:</span>
            <span className="text-white font-medium">{selectedTime || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Süre:</span>
            <span className="text-white font-medium">{selectedDuration?.label || '-'}</span>
          </div>
          {selectedDuration?.price && (
            <div className="flex justify-between pt-3 border-t border-white/10">
              <span className="text-white/60">Toplam:</span>
              <span className="text-[#D4AF37] font-bold text-xl">${selectedDuration.price}</span>
            </div>
          )}
        </div>

        <Button
          className="w-full py-6 text-lg bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-bold"
          disabled={!selectedDate || !selectedTime || !selectedDuration || submitting}
          onClick={handleSubmit}
        >
          {submitting ? 'Gönderiliyor...' : 'Randevu Talebi Gönder'}
        </Button>
        
        <p className="text-white/40 text-sm text-center mt-4">
          {availability?.settings?.auto_confirm 
            ? 'Randevunuz otomatik olarak onaylanacaktır.' 
            : 'Randevunuz partner tarafından onaylandıktan sonra kesinleşecektir.'}
        </p>
      </div>
    </div>
  );
};

export default BookAppointmentPage;
