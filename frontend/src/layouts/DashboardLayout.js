import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useLanguage } from '../context/AppContext';
import Logo from '../components/Logo';
import { 
  Home, User, Image, Package, MessageCircle, Settings, LogOut, 
  ChevronLeft, Menu, X, Heart, Bell, Crown, Eye, Calendar,
  Shield, Star
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useState } from 'react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { lang, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isPartner = user?.role === 'partner' || user?.role === 'admin';
  const basePath = isPartner ? `/${lang}/partner` : `/${lang}/kullanici`;

  const partnerMenuItems = [
    { path: '', icon: Home, label: 'Dashboard', desc: 'Genel bakış' },
    { path: '/profil', icon: User, label: 'Profilim', desc: 'Profil düzenle' },
    { path: '/fotograflar', icon: Image, label: 'Fotoğraflar', desc: 'Galeri yönet' },
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
    <div className="min-h-screen bg-[#0A0A0F] flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 flex-col fixed left-0 top-0 bottom-0 bg-[#0D0D12] border-r border-white/5">
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <Link to={`/${lang}`} className="flex items-center gap-3" data-testid="dashboard-logo">
            <Logo size="small" showBadge={false} />
            {isPartner && (
              <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-medium">Partner</span>
            )}
          </Link>
        </div>

        {/* User Card */}
        <div className="p-4 mx-4 mt-4 rounded-2xl bg-gradient-to-br from-[#E91E63]/10 to-purple-500/10 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E91E63] to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">{user?.name?.[0] || user?.email?.[0]?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{user?.name || user?.email?.split('@')[0]}</p>
              <p className="text-white/50 text-xs flex items-center gap-1">
                {isPartner ? (
                  <>
                    <Crown className="w-3 h-3 text-[#E91E63]" />
                    Partner
                  </>
                ) : (
                  <>
                    <User className="w-3 h-3" />
                    Kullanıcı
                  </>
                )}
              </p>
            </div>
          </div>
          
          {isPartner && (
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-white/5">
                <p className="text-lg font-bold text-white">0</p>
                <p className="text-xs text-white/50">Görüntüleme</p>
              </div>
              <div className="p-2 rounded-lg bg-white/5">
                <p className="text-lg font-bold text-white">0</p>
                <p className="text-xs text-white/50">Favori</p>
              </div>
              <div className="p-2 rounded-lg bg-white/5">
                <p className="text-lg font-bold text-white">0</p>
                <p className="text-xs text-white/50">Mesaj</p>
              </div>
            </div>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2 mt-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={basePath + item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                isActive(item.path)
                  ? 'bg-[#E91E63]/10 border border-[#E91E63]/30'
                  : 'hover:bg-white/5'
              }`}
              data-testid={`menu-${item.path || 'dashboard'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                isActive(item.path) 
                  ? 'bg-[#E91E63]/20' 
                  : 'bg-white/5 group-hover:bg-white/10'
              }`}>
                <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-[#E91E63]' : 'text-white/60'}`} />
              </div>
              <div className="flex-1">
                <p className={`font-medium ${isActive(item.path) ? 'text-[#E91E63]' : 'text-white'}`}>
                  {item.label}
                </p>
                <p className="text-white/40 text-xs">{item.desc}</p>
              </div>
              {item.badge && (
                <span className="w-2 h-2 rounded-full bg-[#E91E63] animate-pulse"></span>
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <Link to={`/${lang}`}>
            <Button variant="ghost" className="w-full justify-start text-white/60 hover:text-white hover:bg-white/5">
              <Eye className="w-5 h-5 mr-3" />
              Siteyi Görüntüle
            </Button>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 w-full transition-all"
            data-testid="dashboard-logout"
          >
            <LogOut className="w-5 h-5" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0D0D12] border-b border-white/5">
        <div className="px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white/70 p-2"
            data-testid="mobile-sidebar-toggle"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <Logo size="small" showBadge={false} />
          <Button variant="ghost" size="sm" className="text-white/70 p-2 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#E91E63]"></span>
          </Button>
        </div>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#0D0D12] border-b border-white/5 p-4 space-y-2 animate-fade-in max-h-[80vh] overflow-y-auto">
            {/* User Card Mobile */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#E91E63]/10 to-purple-500/10 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E91E63] to-purple-500 flex items-center justify-center">
                  <span className="text-white font-bold">{user?.name?.[0] || 'U'}</span>
                </div>
                <div>
                  <p className="text-white font-medium">{user?.name || user?.email?.split('@')[0]}</p>
                  <p className="text-white/50 text-xs">{isPartner ? 'Partner' : 'Kullanıcı'}</p>
                </div>
              </div>
            </div>

            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={basePath + item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive(item.path)
                    ? 'bg-[#E91E63]/10 text-[#E91E63]'
                    : 'text-white/60'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-[#E91E63]"></span>
                )}
              </Link>
            ))}
            
            <div className="border-t border-white/10 pt-4 mt-4">
              <Link to={`/${lang}`} onClick={() => setSidebarOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-white/60">
                  <Eye className="w-5 h-5 mr-3" />
                  Siteyi Görüntüle
                </Button>
              </Link>
              <button
                onClick={() => { handleLogout(); setSidebarOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 w-full mt-2"
              >
                <LogOut className="w-5 h-5" />
                <span>Çıkış Yap</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 pt-16 md:pt-0 pb-20 md:pb-0 min-h-screen">
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0D0D12] border-t border-white/5 px-2 py-2 z-40">
        <div className="flex justify-around">
          {menuItems.slice(0, 4).map((item) => (
            <Link
              key={item.path}
              to={basePath + item.path}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
                isActive(item.path) ? 'text-[#E91E63] bg-[#E91E63]/10' : 'text-white/60'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label.split(' ')[0]}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default DashboardLayout;
