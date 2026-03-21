import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useLanguage } from '../../context/AppContext';
import { 
  Users, UserCheck, Eye, MessageCircle, Package, AlertCircle,
  CheckCircle, Clock, TrendingUp, ArrowUpRight, ArrowDownRight,
  DollarSign, Globe, Activity, BarChart3, PieChart
} from 'lucide-react';
import { Button } from '../../components/ui/button';

const AdminDashboard = () => {
  const { api } = useAuth();
  const { lang } = useLanguage();
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentProfiles, setRecentProfiles] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecentProfiles();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentProfiles = async () => {
    try {
      const response = await api.get('/admin/profiles?status=pending&limit=5');
      setRecentProfiles(response.data.profiles || []);
    } catch (error) {
      console.error('Failed to fetch profiles:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-[#E91E63] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const mainStats = [
    { 
      label: 'Toplam Kullanıcı', 
      value: stats?.total_users || 0, 
      icon: Users, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      change: '+12%',
      changeUp: true
    },
    { 
      label: 'Aktif Partner', 
      value: stats?.total_partners || 0, 
      icon: UserCheck, 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      change: '+8%',
      changeUp: true
    },
    { 
      label: 'Onay Bekleyen', 
      value: stats?.pending_profiles || 0, 
      icon: Clock, 
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-500/10',
      change: stats?.pending_profiles > 0 ? 'Bekliyor' : 'Yok',
      changeUp: null
    },
    { 
      label: 'Toplam Gelir', 
      value: `$${stats?.total_revenue || 0}`, 
      icon: DollarSign, 
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-500/10',
      change: '+23%',
      changeUp: true
    },
  ];

  const secondaryStats = [
    { label: 'Aktif İlanlar', value: stats?.approved_profiles || 0, icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'Vitrin İlanlar', value: stats?.vitrin_profiles || 0, icon: TrendingUp, color: 'text-[#E91E63]' },
    { label: 'Toplam Mesaj', value: stats?.total_messages || 0, icon: MessageCircle, color: 'text-pink-400' },
    { label: 'Sayfa Görüntüleme', value: stats?.total_views || '12.5K', icon: Eye, color: 'text-cyan-400' },
  ];

  return (
    <div data-testid="admin-dashboard">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white font-serif">Dashboard</h1>
        <p className="text-white/60 mt-1">Platform genel görünümü ve istatistikler</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {mainStats.map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
            <div 
              key={idx} 
              className="relative overflow-hidden rounded-2xl bg-[#12121A] border border-white/5 p-6 group hover:border-white/10 transition-all"
              data-testid={`main-stat-${idx}`}
            >
              {/* Background Gradient */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`}></div>
              
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                    <IconComponent className={`w-6 h-6 bg-gradient-to-r ${stat.color} text-white`} style={{ color: 'white' }} />
                  </div>
                  {stat.changeUp !== null && (
                    <span className={`flex items-center gap-1 text-xs font-medium ${stat.changeUp ? 'text-emerald-400' : 'text-red-400'}`}>
                      {stat.changeUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {stat.change}
                    </span>
                  )}
                  {stat.changeUp === null && stat.change && (
                    <span className="text-xs font-medium text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full">
                      {stat.change}
                    </span>
                  )}
                </div>
                <p className="text-white/50 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {secondaryStats.map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
            <div key={idx} className="glass rounded-xl p-4 flex items-center gap-4">
              <IconComponent className={`w-5 h-5 ${stat.color}`} />
              <div>
                <p className="text-white/50 text-xs">{stat.label}</p>
                <p className="text-xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Profiles */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              Onay Bekleyen Profiller
            </h3>
            <Link to={`/${lang}/admin/profiller?status=pending`}>
              <Button variant="ghost" size="sm" className="text-[#E91E63] hover:bg-[#E91E63]/10">
                Tümünü Gör
              </Button>
            </Link>
          </div>

          {recentProfiles.length > 0 ? (
            <div className="space-y-3">
              {recentProfiles.slice(0, 5).map((profile, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E91E63]/20 to-purple-500/20 flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-[#E91E63]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{profile.nickname}</p>
                    <p className="text-white/50 text-sm">{profile.city_name || 'Şehir belirtilmemiş'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 text-xs font-medium bg-yellow-400/10 px-2 py-1 rounded-full">Bekliyor</p>
                    <p className="text-white/40 text-xs mt-1">
                      {new Date(profile.created_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-white/60">Onay bekleyen profil yok</p>
            </div>
          )}
        </div>

        {/* Quick Actions & System Status */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">Hızlı İşlemler</h3>
            <div className="space-y-2">
              <Link to={`/${lang}/admin/profiller?status=pending`} className="block">
                <Button variant="outline" className="w-full justify-start btn-outline">
                  <Clock className="w-4 h-4 mr-2 text-yellow-400" />
                  Profil Onayları ({stats?.pending_profiles || 0})
                </Button>
              </Link>
              <Link to={`/${lang}/admin/site-ayarlari`} className="block">
                <Button variant="outline" className="w-full justify-start btn-outline">
                  <Activity className="w-4 h-4 mr-2 text-[#E91E63]" />
                  Site Ayarları
                </Button>
              </Link>
              <Link to={`/${lang}/admin/seo`} className="block">
                <Button variant="outline" className="w-full justify-start btn-outline">
                  <Globe className="w-4 h-4 mr-2 text-cyan-400" />
                  SEO Yönetimi
                </Button>
              </Link>
              <Link to={`/${lang}/admin/icerik`} className="block">
                <Button variant="outline" className="w-full justify-start btn-outline">
                  <BarChart3 className="w-4 h-4 mr-2 text-purple-400" />
                  İçerik Düzenleme
                </Button>
              </Link>
            </div>
          </div>

          {/* System Status */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">Sistem Durumu</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Veritabanı</span>
                <span className="flex items-center gap-2 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Aktif
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Dosya Depolama</span>
                <span className="flex items-center gap-2 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Aktif
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">SMS Servisi</span>
                <span className="flex items-center gap-2 text-yellow-400">
                  <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                  Test Modu
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Ödeme Sistemi</span>
                <span className="flex items-center gap-2 text-yellow-400">
                  <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                  Test Modu
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
