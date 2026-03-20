import React, { useState, useEffect } from 'react';
import { useAuth, useLanguage } from '../../context/AppContext';
import { 
  Users, UserCheck, Eye, MessageCircle, Package, AlertCircle,
  CheckCircle, Clock, TrendingUp
} from 'lucide-react';

const AdminDashboard = () => {
  const { api } = useAuth();
  const { t } = useLanguage();
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Toplam Kullanıcı', value: stats?.total_users || 0, icon: Users, color: 'text-blue-400' },
    { label: 'Toplam Partner', value: stats?.total_partners || 0, icon: UserCheck, color: 'text-purple-400' },
    { label: 'Onay Bekleyen', value: stats?.pending_profiles || 0, icon: Clock, color: 'text-yellow-400' },
    { label: 'Aktif İlanlar', value: stats?.approved_profiles || 0, icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'Vitrin İlanlar', value: stats?.vitrin_profiles || 0, icon: TrendingUp, color: 'text-[#D4AF37]' },
    { label: 'Toplam Mesaj', value: stats?.total_messages || 0, icon: MessageCircle, color: 'text-pink-400' },
    { label: 'Gönderilen SMS', value: stats?.total_sms || 0, icon: Package, color: 'text-cyan-400' },
    { label: 'Başarısız SMS', value: stats?.failed_sms || 0, icon: AlertCircle, color: 'text-red-400' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white font-serif">Admin Dashboard</h1>
        <p className="text-white/60 mt-1">Platform genel görünümü</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
            <div key={idx} className="glass rounded-xl p-6" data-testid={`stat-${idx}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/50 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <IconComponent className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      {stats?.pending_profiles > 0 && (
        <div className="glass rounded-xl p-6 border border-yellow-500/30 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">{stats.pending_profiles} Onay Bekleyen İlan</h3>
              <p className="text-white/50 text-sm">Profil onay sayfasına giderek inceleyin</p>
            </div>
          </div>
        </div>
      )}

      {/* Platform Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Hızlı İstatistikler</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Onay Oranı</span>
              <span className="text-emerald-400">
                {stats?.approved_profiles && (stats.approved_profiles + stats.pending_profiles) > 0
                  ? ((stats.approved_profiles / (stats.approved_profiles + stats.pending_profiles)) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Vitrin Oranı</span>
              <span className="text-[#D4AF37]">
                {stats?.vitrin_profiles && stats.approved_profiles > 0
                  ? ((stats.vitrin_profiles / stats.approved_profiles) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">SMS Başarı Oranı</span>
              <span className={stats?.failed_sms > 0 ? 'text-yellow-400' : 'text-emerald-400'}>
                {stats?.total_sms > 0
                  ? (((stats.total_sms - stats.failed_sms) / stats.total_sms) * 100).toFixed(1)
                  : 100}%
              </span>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Sistem Durumu</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Veritabanı</span>
              <span className="flex items-center gap-2 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Çalışıyor
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Storage</span>
              <span className="flex items-center gap-2 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Çalışıyor
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">SMS Servisi</span>
              <span className="flex items-center gap-2 text-yellow-400">
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                Test Modu
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
