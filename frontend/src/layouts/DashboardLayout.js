import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useLanguage } from '../context/AppContext';
import { 
  Home, User, Image, Package, MessageCircle, Settings, LogOut, 
  ChevronLeft, Menu, X
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
    { path: '', icon: Home, label: t('dashboard') },
    { path: '/profil', icon: User, label: t('myProfile') },
    { path: '/fotograflar', icon: Image, label: t('photos') },
    { path: '/paketler', icon: Package, label: t('packages') },
    { path: '/mesajlar', icon: MessageCircle, label: t('messages') },
  ];

  const userMenuItems = [
    { path: '/favoriler', icon: Home, label: t('favorites') },
    { path: '/mesajlar', icon: MessageCircle, label: t('messages') },
    { path: '/ayarlar', icon: Settings, label: t('settings') },
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
    <div className="min-h-screen bg-[#050505] flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col fixed left-0 top-0 bottom-0 bg-[#0A0A0A] border-r border-white/5">
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <Link to={`/${lang}`} className="flex items-center gap-2" data-testid="dashboard-logo">
            <span className="text-xl font-bold gold-text font-serif">KKTCX</span>
          </Link>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={basePath + item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive(item.path)
                  ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
              data-testid={`menu-${item.path || 'dashboard'}`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
              <User className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">{user?.name || user?.email.split('@')[0]}</p>
              <p className="text-white/40 text-xs capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-400/10 w-full transition-all"
            data-testid="dashboard-logout"
          >
            <LogOut className="w-5 h-5" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 glass-dark">
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
          <Link to={`/${lang}`} className="text-xl font-bold gold-text font-serif">
            KKTCX
          </Link>
          <Link to={`/${lang}`}>
            <Button variant="ghost" size="sm" className="text-white/70 p-2">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#0A0A0A] border-b border-white/5 p-4 space-y-2 animate-fade-in">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={basePath + item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive(item.path)
                    ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                    : 'text-white/60'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
            <button
              onClick={() => { handleLogout(); setSidebarOpen(false); }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>{t('logout')}</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0 min-h-screen">
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav md:hidden">
        {menuItems.slice(0, 4).map((item) => (
          <Link
            key={item.path}
            to={basePath + item.path}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive(item.path) ? 'text-[#D4AF37]' : 'text-white/60'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs">{item.label.split(' ')[0]}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default DashboardLayout;
