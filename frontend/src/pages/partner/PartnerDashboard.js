import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useLanguage } from '../../context/AppContext';
import { 
  Eye, Heart, MessageCircle, Clock, CheckCircle, XCircle, 
  AlertCircle, Package, ChevronRight, Image, TrendingUp, 
  Calendar, Sparkles, ArrowUpRight, Star, Users
} from 'lucide-react';
import { Button } from '../../components/ui/button';

const PartnerDashboard = () => {
  const { user, api } = useAuth();
  const { lang } = useLanguage();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    views: 0,
    favorites: 0,
    messages: 0,
    appointments: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchConversations();
    fetchAppointments();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/partner/profile');
      setProfile(response.data);
      setStats(prev => ({ 
        ...prev, 
        views: response.data.view_count || 0,
        favorites: response.data.favorite_count || 0
      }));
    } catch (error) {
      console.log('No profile yet');
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get('/conversations');
      const unreadCount = response.data.reduce((sum, c) => sum + (c.unread_count || 0), 0);
      setStats(prev => ({ ...prev, messages: unreadCount }));
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/partner/appointments?status=pending');
      if (Array.isArray(response.data)) {
        setStats(prev => ({ ...prev, appointments: response.data.length }));
      }
    } catch (error) {
      console.log('No appointments');
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'draft':
        return { icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-500/30', label: 'Taslak', desc: 'Profilinizi tamamlayın' };
      case 'pending':
        return { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-500/30', label: 'İnceleniyor', desc: 'Ekibimiz profilinizi inceliyor' };
      case 'approved':
        return { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-500/30', label: 'Aktif', desc: 'Profiliniz yayında' };
      case 'rejected':
        return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-500/30', label: 'Reddedildi', desc: 'Düzenleme gerekiyor' };
      default:
        return { icon: AlertCircle, color: 'text-white/40', bg: 'bg-white/10', border: 'border-white/10', label: status, desc: '' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="animate-spin w-12 h-12 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
          </div>
        </div>
      </div>
    );
  }

  // No profile yet
  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="glass-gold rounded-2xl p-10 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#D4AF37]/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#D4AF37]/10 to-transparent rounded-full blur-2xl"></div>
          
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#997B19] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#D4AF37]/30">
              <Image className="w-12 h-12 text-black" />
            </div>
            <h1 className="text-3xl font-bold text-white font-serif mb-4">Partner Profilinizi Oluşturun</h1>
            <p className="text-white/60 mb-8 max-w-md mx-auto leading-relaxed">
              İlan yayınlamak için önce profilinizi oluşturmanız gerekiyor. 
              Bilgilerinizi girin, fotoğraflarınızı yükleyin ve onaya gönderin.
            </p>
            <Link to={`/${lang}/partner/profil`}>
              <Button className="bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-black font-semibold px-8 py-6 text-lg rounded-full shadow-lg shadow-[#D4AF37]/30 hover:shadow-[#D4AF37]/50 transition-all">
                Profil Oluştur
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(profile.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-8" data-testid="partner-dashboard">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-[#D4AF37] text-sm font-medium tracking-wider uppercase mb-1">Partner Panel</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white font-serif">
            Hoş Geldin, {profile.nickname}
          </h1>
        </div>
        {profile.status === 'approved' && (
          <Link to={`/${lang}/partner/${profile.slug}`}>
            <Button variant="outline" className="border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10">
              <Eye className="w-4 h-4 mr-2" />
              Profili Görüntüle
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        )}
      </div>

      {/* Status Banner */}
      <div className={`glass rounded-2xl p-6 border ${statusInfo.border} relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/5 to-transparent rounded-full blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl ${statusInfo.bg} flex items-center justify-center`}>
              <StatusIcon className={`w-7 h-7 ${statusInfo.color}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-white font-semibold text-lg">Profil Durumu</p>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-white/50 text-sm mt-0.5">{statusInfo.desc}</p>
            </div>
          </div>
          
          {profile.status === 'draft' && (
            <Link to={`/${lang}/partner/profil`}>
              <Button className="bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-semibold">
                Profili Tamamla
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          )}
          
          {profile.status === 'rejected' && (
            <div className="text-right">
              <p className="text-red-400/80 text-sm mb-2 max-w-xs">{profile.rejection_reason || 'Profiliniz reddedildi'}</p>
              <Link to={`/${lang}/partner/profil`}>
                <Button variant="outline" className="text-red-400 border-red-400/50 hover:bg-red-400/10">
                  Düzenle ve Tekrar Gönder
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Eye, label: 'Görüntülenme', value: stats.views, color: 'from-blue-500/20 to-blue-600/5', iconColor: 'text-blue-400' },
          { icon: Heart, label: 'Favori', value: stats.favorites, color: 'from-pink-500/20 to-pink-600/5', iconColor: 'text-pink-400' },
          { icon: MessageCircle, label: 'Yeni Mesaj', value: stats.messages, color: 'from-emerald-500/20 to-emerald-600/5', iconColor: 'text-emerald-400', badge: stats.messages > 0 },
          { icon: Calendar, label: 'Bekleyen Randevu', value: stats.appointments, color: 'from-[#D4AF37]/20 to-[#D4AF37]/5', iconColor: 'text-[#D4AF37]', badge: stats.appointments > 0 },
        ].map((stat, idx) => (
          <div key={idx} className="glass rounded-xl p-5 relative overflow-hidden group hover:border-white/20 transition-all">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-50`}></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                {stat.badge && (
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
                )}
              </div>
              <p className="text-3xl font-bold text-white font-serif">{stat.value}</p>
              <p className="text-white/50 text-sm mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#D4AF37]" />
          Hızlı Erişim
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { to: `/${lang}/partner/profil`, icon: Users, title: 'Profili Düzenle', desc: 'Bilgilerinizi güncelleyin', color: 'from-purple-500/10' },
            { to: `/${lang}/partner/fotograflar`, icon: Image, title: 'Fotoğraflar', desc: 'Galeriyi yönetin', color: 'from-pink-500/10' },
            { to: `/${lang}/partner/randevular`, icon: Calendar, title: 'Randevular', desc: 'Randevuları yönetin', color: 'from-blue-500/10' },
            { to: `/${lang}/partner/paketler`, icon: Package, title: 'Premium', desc: 'Görünürlüğü artırın', color: 'from-[#D4AF37]/10' },
          ].map((action, idx) => (
            <Link 
              key={idx}
              to={action.to}
              className="glass rounded-xl p-5 hover:border-[#D4AF37]/30 transition-all group relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              <div className="relative flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 group-hover:bg-[#D4AF37]/20 flex items-center justify-center transition-colors">
                  <action.icon className="w-6 h-6 text-white/60 group-hover:text-[#D4AF37] transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium group-hover:text-[#D4AF37] transition-colors">{action.title}</h3>
                  <p className="text-white/40 text-sm">{action.desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Package Upgrade CTA */}
      {profile.package_type !== 'premium' && profile.status === 'approved' && (
        <div className="glass-gold rounded-2xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#D4AF37]/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#D4AF37]/10 to-transparent rounded-full blur-2xl"></div>
          
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#997B19] flex items-center justify-center shrink-0">
                <Star className="w-7 h-7 text-black" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white font-serif">Daha Fazla Görünürlük</h3>
                <p className="text-white/60 mt-1 max-w-md">
                  Premium paketlerle ana sayfada ve vitrin alanlarında öne çıkın, 
                  daha fazla müşteriye ulaşın
                </p>
              </div>
            </div>
            <Link to={`/${lang}/partner/paketler`}>
              <Button className="bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-black font-semibold px-6 py-3 rounded-full shadow-lg shadow-[#D4AF37]/30 hover:shadow-[#D4AF37]/50 transition-all whitespace-nowrap">
                <TrendingUp className="w-4 h-4 mr-2" />
                Paketleri İncele
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerDashboard;
