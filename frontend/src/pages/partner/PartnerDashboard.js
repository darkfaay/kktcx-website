import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useLanguage } from '../../context/AppContext';
import { 
  Eye, Heart, MessageCircle, Clock, CheckCircle, XCircle, 
  AlertCircle, Package, ChevronRight, Image
} from 'lucide-react';
import { Button } from '../../components/ui/button';

const PartnerDashboard = () => {
  const { user, api } = useAuth();
  const { lang, t } = useLanguage();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    views: 0,
    messages: 0
  });

  useEffect(() => {
    fetchProfile();
    fetchConversations();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/partner/profile');
      setProfile(response.data);
      setStats(prev => ({ ...prev, views: response.data.view_count || 0 }));
    } catch (error) {
      // Profile might not exist yet
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

  const getStatusInfo = (status) => {
    switch (status) {
      case 'draft':
        return { icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Taslak' };
      case 'pending':
        return { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'İnceleniyor' };
      case 'approved':
        return { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'Onaylandı' };
      case 'rejected':
        return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Reddedildi' };
      default:
        return { icon: AlertCircle, color: 'text-white/40', bg: 'bg-white/10', label: status };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // No profile yet
  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="glass rounded-2xl p-8">
          <div className="w-20 h-20 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mx-auto mb-6">
            <Image className="w-10 h-10 text-[#D4AF37]" />
          </div>
          <h1 className="text-2xl font-bold text-white font-serif mb-4">Partner Profilinizi Oluşturun</h1>
          <p className="text-white/60 mb-8">
            İlan yayınlamak için önce profilinizi oluşturmanız gerekiyor. 
            Bilgilerinizi girin, fotoğraflarınızı yükleyin ve onaya gönderin.
          </p>
          <Link to={`/${lang}/partner/profil`}>
            <Button className="btn-primary px-8 py-6 text-lg">
              Profil Oluştur
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(profile.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-serif">
            Hoş Geldin, {profile.nickname}
          </h1>
          <p className="text-white/60 mt-1">Partner Panelinize hoş geldiniz</p>
        </div>
      </div>

      {/* Profile Status Card */}
      <div className={`glass rounded-xl p-6 mb-8 border ${
        profile.status === 'approved' ? 'border-emerald-500/30' : 
        profile.status === 'pending' ? 'border-blue-500/30' : 
        profile.status === 'rejected' ? 'border-red-500/30' : 'border-white/10'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full ${statusInfo.bg} flex items-center justify-center`}>
              <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
            </div>
            <div>
              <p className="text-white font-semibold">Profil Durumu</p>
              <p className={statusInfo.color}>{statusInfo.label}</p>
            </div>
          </div>
          
          {profile.status === 'draft' && (
            <Link to={`/${lang}/partner/profil`}>
              <Button className="btn-primary">
                Profili Tamamla
              </Button>
            </Link>
          )}
          
          {profile.status === 'rejected' && (
            <div className="text-right">
              <p className="text-red-400 text-sm mb-2">{profile.rejection_reason || 'Profiliniz reddedildi'}</p>
              <Link to={`/${lang}/partner/profil`}>
                <Button className="btn-outline text-red-400 border-red-400/50">
                  Düzenle ve Tekrar Gönder
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass rounded-xl p-6 text-center">
          <Eye className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{stats.views}</p>
          <p className="text-white/50 text-sm">Görüntülenme</p>
        </div>
        
        <div className="glass rounded-xl p-6 text-center">
          <MessageCircle className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{stats.messages}</p>
          <p className="text-white/50 text-sm">Yeni Mesaj</p>
        </div>
        
        <div className="glass rounded-xl p-6 text-center">
          <Image className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{profile.images?.length || 0}</p>
          <p className="text-white/50 text-sm">Fotoğraf</p>
        </div>
        
        <div className="glass rounded-xl p-6 text-center">
          <Package className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
          <p className="text-lg font-bold text-white capitalize">{profile.package_type || 'Standart'}</p>
          <p className="text-white/50 text-sm">Paket</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link 
          to={`/${lang}/partner/profil`}
          className="glass rounded-xl p-6 hover:border-[#D4AF37]/30 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">Profili Düzenle</h3>
              <p className="text-white/50 text-sm mt-1">Bilgilerinizi güncelleyin</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-[#D4AF37] transition-colors" />
          </div>
        </Link>
        
        <Link 
          to={`/${lang}/partner/fotograflar`}
          className="glass rounded-xl p-6 hover:border-[#D4AF37]/30 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">Fotoğraflar</h3>
              <p className="text-white/50 text-sm mt-1">Galeriyi yönetin</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-[#D4AF37] transition-colors" />
          </div>
        </Link>
        
        <Link 
          to={`/${lang}/partner/paketler`}
          className="glass rounded-xl p-6 hover:border-[#D4AF37]/30 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">Paketler</h3>
              <p className="text-white/50 text-sm mt-1">Görünürlüğü artırın</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-[#D4AF37] transition-colors" />
          </div>
        </Link>
      </div>

      {/* Package Info */}
      {profile.package_type !== 'premium' && profile.status === 'approved' && (
        <div className="mt-8 glass rounded-xl p-6 border border-[#D4AF37]/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">Daha Fazla Görünürlük İster Misiniz?</h3>
              <p className="text-white/50 text-sm mt-1">
                Premium paketlerle ana sayfada ve vitrin alanlarında öne çıkın
              </p>
            </div>
            <Link to={`/${lang}/partner/paketler`}>
              <Button className="btn-primary">
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
