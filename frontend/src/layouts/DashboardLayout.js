import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useLanguage } from '../context/AppContext';
import Logo from '../components/Logo';
import { 
  Home, User, Image, Package, MessageCircle, Settings, LogOut, 
  Menu, X, Heart, Bell, Crown, Eye, Calendar, ChevronRight,
  Sparkles, TrendingUp
} from 'lucide-react';
import { Button } from '../components/ui/button';

const DashboardLayout = () => {
  const { user, api, logout } = useAuth();
  const { lang } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ views: 0, favorites: 0, messages: 0 });

  const isPartner = user?.role === 'partner' || user?.role === 'admin';
  const basePath = isPartner ? `/${lang}/partner` : `/${lang}/kullanici`;

  useEffect(() => {
    if (isPartner) {
      fetchStats();
    }
  }, [isPartner]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/partner/stats');
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.log('Stats not available');
    }
  };

  const partnerMenuItems = [
    { path: '', icon: Home, label: 'Dashboard', desc: 'Genel bakış' },
    { path: '/profil', icon: User, label: 'Profilim', desc: 'Profil düzenle' },
    { path: '/fotograflar', icon: Image, label: 'Fotoğraflar', desc: 'Galeri yönet' },
    { path: '/randevular', icon: Calendar, label: 'Randevular', desc: 'Randevu yönetimi', badge: true },
    { path: '/paketler', icon: Package, label: 'Premium', desc: 'Paketler & öne çıkar' },
    { path: '/mesajlar', icon: MessageCircle, label: 'Mesajlar', desc: 'Gelen kutusu', badge: true },
  ];

  const userMenuItems = [
    { path: '/favoriler', icon: Heart, label: 'Favorilerim', desc: 'Kayıtlı partnerler' },
    { path: '/mesajlar', icon: MessageCircle, label: 'Mesajlar', desc: 'Gelen kutusu', badge: true },
    { path: '/ayarlar', icon: Settings, label: 'Ayarlar', desc: 'Hesap ayarları' },
  ];

  const menuItems = isPartner ? partnerMenuItems : userMenuItems;

  const handleLogout = () => {
    logout();
    navigate(`/${lang}`);
  };

  const isActive = (path) => {
    const fullPath = basePath + path;
    if (path === '') {
      return location.pathname === basePath || location.pathname === basePath + '/';
    }
    return location.pathname.startsWith(fullPath);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex" data-testid="dashboard-layout">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 flex-col fixed left-0 top-0 bottom-0 bg-[#0F0F10] border-r border-white/5">
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <Link to={`/${lang}`} className="flex items-center gap-3" data-testid="dashboard-logo">
            <Logo size="small" showBadge={false} />
            {isPartner && (
              <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-black font-semibold">
                Partner
              </span>
            )}
          </Link>
        </div>

        {/* User Card - Midnight Velvet Style */}
        <div className="p-4 mx-4 mt-4 rounded-2xl bg-gradient-to-br from-[#D4AF37]/10 via-[#0F0F10] to-[#D4AF37]/5 border border-[#D4AF37]/20 relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-3xl"></div>
          
          <div className="flex items-center gap-3 relative">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#997B19] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
              <span className="text-black font-bold text-xl font-serif">
                {user?.name?.[0] || user?.email?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{user?.name || user?.email?.split('@')[0]}</p>
              <p className="text-[#D4AF37] text-xs flex items-center gap-1 font-medium">
                {isPartner ? (
                  <>
                    <Crown className="w-3 h-3" />
                    Partner Hesabı
                  </>
                ) : (
                  <>
                    <User className="w-3 h-3" />
                    Üye
                  </>
                )}
              </p>
            </div>
          </div>
          
          {isPartner && (
            <div className="mt-4 grid grid-cols-3 gap-2 text-center relative">
              <div className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group cursor-pointer">
                <div className="flex items-center justify-center gap-1">
                  <Eye className="w-3 h-3 text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-xl font-bold text-white font-serif">{stats.views || 0}</p>
                </div>
                <p className="text-xs text-white/50 mt-0.5">Görüntüleme</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group cursor-pointer">
                <div className="flex items-center justify-center gap-1">
                  <Heart className="w-3 h-3 text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-xl font-bold text-white font-serif">{stats.favorites || 0}</p>
                </div>
                <p className="text-xs text-white/50 mt-0.5">Favori</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group cursor-pointer">
                <div className="flex items-center justify-center gap-1">
                  <MessageCircle className="w-3 h-3 text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-xl font-bold text-white font-serif">{stats.messages || 0}</p>
                </div>
                <p className="text-xs text-white/50 mt-0.5">Mesaj</p>
              </div>
            </div>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1.5 mt-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={basePath + item.path}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-[#D4AF37]/20 to-transparent border-l-2 border-[#D4AF37]'
                  : 'hover:bg-white/5'
              }`}
              data-testid={`menu-${item.path || 'dashboard'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                isActive(item.path) 
                  ? 'bg-[#D4AF37] shadow-lg shadow-[#D4AF37]/30' 
                  : 'bg-white/5 group-hover:bg-white/10'
              }`}>
                <item.icon className={`w-5 h-5 transition-colors ${
                  isActive(item.path) ? 'text-black' : 'text-white/60 group-hover:text-white'
                }`} />
              </div>
              <div className="flex-1">
                <p className={`font-medium transition-colors ${
                  isActive(item.path) ? 'text-[#D4AF37]' : 'text-white group-hover:text-white'
                }`}>
                  {item.label}
                </p>
                <p className="text-white/40 text-xs">{item.desc}</p>
              </div>
              {item.badge && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse shadow-lg shadow-[#D4AF37]/50"></span>
              )}
              <ChevronRight className={`w-4 h-4 transition-all ${
                isActive(item.path) ? 'text-[#D4AF37] opacity-100' : 'text-white/20 opacity-0 group-hover:opacity-100'
              }`} />
            </Link>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <Link to={`/${lang}`}>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white/60 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
            >
              <Eye className="w-5 h-5 mr-3" />
              Siteyi Görüntüle
            </Button>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-400/10 w-full transition-all"
            data-testid="dashboard-logout"
          >
            <LogOut className="w-5 h-5" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0F0F10]/95 backdrop-blur-xl border-b border-white/5">
        <div className="px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white/70 hover:text-[#D4AF37] p-2"
            data-testid="mobile-sidebar-toggle"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <Logo size="small" showBadge={false} />
          <Button variant="ghost" size="sm" className="text-white/70 hover:text-[#D4AF37] p-2 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#D4AF37]"></span>
          </Button>
        </div>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setSidebarOpen(false)}
            />
            
            {/* Sidebar Panel */}
            <div className="fixed top-0 left-0 bottom-0 w-80 bg-[#0F0F10] border-r border-white/5 z-50 animate-slide-in-left overflow-y-auto">
              {/* Mobile Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <Logo size="small" showBadge={false} />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="text-white/70 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* User Card Mobile */}
              <div className="p-4 mx-4 mt-4 rounded-2xl bg-gradient-to-br from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#997B19] flex items-center justify-center">
                    <span className="text-black font-bold text-lg font-serif">{user?.name?.[0] || 'U'}</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">{user?.name || user?.email?.split('@')[0]}</p>
                    <p className="text-[#D4AF37] text-xs flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      {isPartner ? 'Partner' : 'Üye'}
                    </p>
                  </div>
                </div>
                
                {isPartner && (
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-white/5">
                      <p className="text-lg font-bold text-white">{stats.views || 0}</p>
                      <p className="text-xs text-white/50">Görüntüleme</p>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5">
                      <p className="text-lg font-bold text-white">{stats.favorites || 0}</p>
                      <p className="text-xs text-white/50">Favori</p>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5">
                      <p className="text-lg font-bold text-white">{stats.messages || 0}</p>
                      <p className="text-xs text-white/50">Mesaj</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu */}
              <nav className="p-4 space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={basePath + item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-[#D4AF37]/20 to-transparent border-l-2 border-[#D4AF37] text-[#D4AF37]'
                        : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isActive(item.path) ? 'bg-[#D4AF37]' : 'bg-white/5'
                    }`}>
                      <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-black' : 'text-white/60'}`} />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium">{item.label}</span>
                      <p className="text-white/40 text-xs">{item.desc}</p>
                    </div>
                    {item.badge && (
                      <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
                    )}
                  </Link>
                ))}
              </nav>
              
              {/* Mobile Bottom */}
              <div className="p-4 border-t border-white/10 mt-auto">
                <Link to={`/${lang}`} onClick={() => setSidebarOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-white/60 hover:text-[#D4AF37]">
                    <Eye className="w-5 h-5 mr-3" />
                    Siteyi Görüntüle
                  </Button>
                </Link>
                <button
                  onClick={() => { handleLogout(); setSidebarOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 w-full mt-2 hover:bg-red-400/10"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Çıkış Yap</span>
                </button>
              </div>
            </div>
          </>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 pt-16 md:pt-0 pb-24 md:pb-0 min-h-screen bg-[#050505]">
        <div className="p-4 md:p-8 max-w-7xl">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav - Midnight Velvet Style */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0F0F10]/95 backdrop-blur-xl border-t border-white/5 px-2 py-3 z-40">
        <div className="flex justify-around">
          {menuItems.slice(0, 4).map((item) => (
            <Link
              key={item.path}
              to={basePath + item.path}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all relative ${
                isActive(item.path) 
                  ? 'text-[#D4AF37]' 
                  : 'text-white/50'
              }`}
            >
              {isActive(item.path) && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB]"></span>
              )}
              <div className={`p-2 rounded-xl transition-all ${
                isActive(item.path) ? 'bg-[#D4AF37]/20' : ''
              }`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">{item.label.split(' ')[0]}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Animations */}
      <style jsx>{`
        @keyframes slide-in-left {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
