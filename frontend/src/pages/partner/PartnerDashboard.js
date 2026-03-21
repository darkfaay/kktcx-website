import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useLanguage } from '../../context/AppContext';
import { 
  Eye, Heart, MessageCircle, Clock, CheckCircle, XCircle, 
  AlertCircle, Package, ChevronRight, Image, TrendingUp, 
  Calendar, Sparkles, ArrowUpRight, Star, Users, Crown,
  Camera, Zap, Shield, Award, Rocket, Gift
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

  useEffect(() => {
    fetchProfile();
    fetchStats();
    fetchAppointments();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/partner/profile');
      setProfile(response.data);
    } catch (error) {
      console.log('No profile yet');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/partner/stats');
      if (response.data) {
        setStats(prev => ({ 
          ...prev, 
          views: response.data.views || 0,
          favorites: response.data.favorites || 0,
          messages: response.data.unread_messages || 0
        }));
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
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
          <div className="animate-spin w-16 h-16 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-[#D4AF37]" />
          </div>
        </div>
      </div>
    );
  }

  // No profile yet - Show beautiful onboarding screen
  if (!profile) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center" data-testid="partner-dashboard-empty">
        <div className="w-full max-w-5xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 mb-6">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[#D4AF37] text-sm font-medium">Partner Programı</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-serif mb-6">
              Profilinizi Oluşturun,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB]">
                Başarıya Adım Atın
              </span>
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
              Kıbrıs'ın en prestijli eşlik platformunda yerinizi alın. 
              Profesyonel profilinizi oluşturun ve binlerce potansiyel müşteriye ulaşın.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Shield, title: 'Güvenli Platform', desc: 'Kimlik doğrulama ve güvenli ödeme sistemi', color: 'from-emerald-500/20' },
              { icon: Eye, title: 'Yüksek Görünürlük', desc: 'Binlerce aktif kullanıcıya ulaşın', color: 'from-blue-500/20' },
              { icon: Award, title: 'Premium Özellikler', desc: 'Vitrin, öne çıkarma ve daha fazlası', color: 'from-purple-500/20' },
            ].map((feature, idx) => (
              <div 
                key={idx}
                className="glass rounded-2xl p-6 relative overflow-hidden group hover:border-[#D4AF37]/30 transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 group-hover:bg-[#D4AF37]/20 flex items-center justify-center mb-4 transition-colors">
                    <feature.icon className="w-7 h-7 text-white/60 group-hover:text-[#D4AF37] transition-colors" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-white/50 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Card */}
          <div className="glass-gold rounded-3xl p-8 md:p-12 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#D4AF37]/20 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#D4AF37]/10 to-transparent rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl"></div>
            
            <div className="relative flex flex-col lg:flex-row items-center gap-8">
              {/* Icon Side */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#D4AF37] to-[#997B19] flex items-center justify-center shadow-2xl shadow-[#D4AF37]/30 relative">
                  <Camera className="w-16 h-16 text-black" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Content Side */}
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-white font-serif mb-4">
                  Hemen Başlayın
                </h2>
                <p className="text-white/60 mb-6 max-w-lg">
                  Profil oluşturma sadece birkaç dakikanızı alır. 
                  Bilgilerinizi girin, fotoğraflarınızı yükleyin ve onaya gönderin.
                </p>
                
                {/* Steps */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8">
                  {[
                    { num: 1, text: 'Bilgileri Girin' },
                    { num: 2, text: 'Fotoğraf Ekleyin' },
                    { num: 3, text: 'Onaya Gönderin' },
                  ].map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] text-sm font-bold">
                        {step.num}
                      </div>
                      <span className="text-white/70 text-sm">{step.text}</span>
                      {idx < 2 && <ChevronRight className="w-4 h-4 text-white/30 hidden md:block" />}
                    </div>
                  ))}
                </div>

                <Link to={`/${lang}/partner/profil`}>
                  <Button className="bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-black font-bold px-10 py-6 text-lg rounded-full shadow-xl shadow-[#D4AF37]/30 hover:shadow-[#D4AF37]/50 hover:scale-105 transition-all duration-300">
                    <Rocket className="w-5 h-5 mr-3" />
                    Profil Oluştur
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-6">
            {[
              { icon: Shield, text: '100% Güvenli' },
              { icon: Users, text: '10,000+ Kullanıcı' },
              { icon: Star, text: '4.9 Puan' },
              { icon: Gift, text: 'Ücretsiz Başlangıç' },
            ].map((badge, idx) => (
              <div key={idx} className="flex items-center gap-2 text-white/40">
                <badge.icon className="w-4 h-4" />
                <span className="text-sm">{badge.text}</span>
              </div>
            ))}
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#997B19] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
              <Crown className="w-7 h-7 text-black" />
            </div>
            <div>
              <p className="text-[#D4AF37] text-sm font-medium tracking-wider uppercase">Partner Panel</p>
              <h1 className="text-3xl md:text-4xl font-bold text-white font-serif">
                Hoş Geldin, {profile.nickname}
              </h1>
            </div>
          </div>
        </div>
        
        {profile.status === 'approved' && (
          <Link to={`/${lang}/partner/${profile.slug}`}>
            <Button variant="outline" className="border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 h-12 px-6">
              <Eye className="w-4 h-4 mr-2" />
              Profili Görüntüle
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        )}
      </div>

      {/* Status Banner */}
      <div className={`glass rounded-2xl p-6 border ${statusInfo.border} relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#D4AF37]/5 to-transparent rounded-full blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl ${statusInfo.bg} flex items-center justify-center`}>
              <StatusIcon className={`w-8 h-8 ${statusInfo.color}`} />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-white font-semibold text-xl">Profil Durumu</p>
                <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-white/50 mt-1">{statusInfo.desc}</p>
            </div>
          </div>
          
          {profile.status === 'draft' && (
            <Link to={`/${lang}/partner/profil`}>
              <Button className="bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-semibold h-12 px-6">
                Profili Tamamla
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
          
          {profile.status === 'rejected' && (
            <div className="text-right">
              <p className="text-red-400/80 text-sm mb-3 max-w-sm">{profile.rejection_reason || 'Profiliniz reddedildi'}</p>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { icon: Eye, label: 'Görüntülenme', value: stats.views, color: 'from-blue-500/20 to-blue-600/5', iconColor: 'text-blue-400', iconBg: 'bg-blue-500/20' },
          { icon: Heart, label: 'Favori', value: stats.favorites, color: 'from-pink-500/20 to-pink-600/5', iconColor: 'text-pink-400', iconBg: 'bg-pink-500/20' },
          { icon: MessageCircle, label: 'Yeni Mesaj', value: stats.messages, color: 'from-emerald-500/20 to-emerald-600/5', iconColor: 'text-emerald-400', iconBg: 'bg-emerald-500/20', badge: stats.messages > 0 },
          { icon: Calendar, label: 'Bekleyen Randevu', value: stats.appointments, color: 'from-[#D4AF37]/20 to-[#D4AF37]/5', iconColor: 'text-[#D4AF37]', iconBg: 'bg-[#D4AF37]/20', badge: stats.appointments > 0 },
        ].map((stat, idx) => (
          <div key={idx} className="glass rounded-2xl p-6 relative overflow-hidden group hover:border-white/20 transition-all duration-300">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-50`}></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                {stat.badge && (
                  <span className="w-3 h-3 rounded-full bg-[#D4AF37] animate-pulse shadow-lg shadow-[#D4AF37]/50"></span>
                )}
              </div>
              <p className="text-4xl font-bold text-white font-serif">{stat.value}</p>
              <p className="text-white/50 text-sm mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
          </div>
          Hızlı Erişim
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { to: `/${lang}/partner/profil`, icon: Users, title: 'Profili Düzenle', desc: 'Bilgilerinizi güncelleyin', gradient: 'from-purple-500/10' },
            { to: `/${lang}/partner/fotograflar`, icon: Image, title: 'Fotoğraflar', desc: 'Galeriyi yönetin', gradient: 'from-pink-500/10' },
            { to: `/${lang}/partner/randevular`, icon: Calendar, title: 'Randevular', desc: 'Randevuları yönetin', gradient: 'from-blue-500/10' },
            { to: `/${lang}/partner/paketler`, icon: Package, title: 'Premium', desc: 'Görünürlüğü artırın', gradient: 'from-[#D4AF37]/10' },
          ].map((action, idx) => (
            <Link 
              key={idx}
              to={action.to}
              className="glass rounded-2xl p-6 hover:border-[#D4AF37]/30 transition-all duration-300 group relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-white/5 group-hover:bg-[#D4AF37]/20 flex items-center justify-center mb-4 transition-all duration-300">
                  <action.icon className="w-7 h-7 text-white/60 group-hover:text-[#D4AF37] transition-colors" />
                </div>
                <h3 className="text-white font-semibold text-lg group-hover:text-[#D4AF37] transition-colors">{action.title}</h3>
                <p className="text-white/40 text-sm mt-1">{action.desc}</p>
                <ChevronRight className="absolute bottom-6 right-6 w-5 h-5 text-white/20 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Package Upgrade CTA */}
      {profile.package_type !== 'premium' && profile.status === 'approved' && (
        <div className="glass-gold rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-[#D4AF37]/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-[#D4AF37]/10 to-transparent rounded-full blur-2xl"></div>
          
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#997B19] flex items-center justify-center shrink-0 shadow-lg shadow-[#D4AF37]/30">
                <Star className="w-8 h-8 text-black" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white font-serif mb-2">Daha Fazla Görünürlük</h3>
                <p className="text-white/60 max-w-lg">
                  Premium paketlerle ana sayfada ve vitrin alanlarında öne çıkın, 
                  daha fazla müşteriye ulaşın ve kazancınızı artırın.
                </p>
              </div>
            </div>
            <Link to={`/${lang}/partner/paketler`}>
              <Button className="bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-black font-bold px-8 py-4 rounded-full shadow-xl shadow-[#D4AF37]/30 hover:shadow-[#D4AF37]/50 hover:scale-105 transition-all duration-300 whitespace-nowrap">
                <TrendingUp className="w-5 h-5 mr-2" />
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
