import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useLanguage } from '../context/AppContext';
import { 
  LayoutDashboard, Users, UserCheck, MapPin, Tag, Package, 
  Settings, LogOut, Menu, X, ChevronLeft
} from 'lucide-react';
import { Button } from '../components/ui/button';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { lang, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const basePath = `/${lang}/admin`;

  const menuItems = [
    { path: '', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/kullanicilar', icon: Users, label: 'Kullanıcılar' },
    { path: '/profiller', icon: UserCheck, label: 'Profiller / İlanlar' },
    { path: '/sehirler', icon: MapPin, label: 'Şehirler' },
    { path: '/kategoriler', icon: Tag, label: 'Kategoriler' },
    { path: '/paketler', icon: Package, label: 'Paketler' },
    { path: '/ayarlar', icon: Settings, label: 'Ayarlar' },
  ];

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
          <Link to={`/${lang}`} className="flex items-center gap-2" data-testid="admin-logo">
            <span className="text-xl font-bold gold-text font-serif">KKTCX</span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37]">Admin</span>
          </Link>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={basePath + item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive(item.path)
                  ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
              data-testid={`admin-menu-${item.path || 'dashboard'}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">{user?.name || 'Admin'}</p>
              <p className="text-red-400 text-xs">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-400/10 w-full transition-all"
            data-testid="admin-logout"
          >
            <LogOut className="w-5 h-5" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A] border-b border-white/5">
        <div className="px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white/70 p-2"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold gold-text font-serif">KKTCX</span>
            <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">Admin</span>
          </div>
          <Link to={`/${lang}`}>
            <Button variant="ghost" size="sm" className="text-white/70 p-2">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        {sidebarOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#0A0A0A] border-b border-white/5 p-4 space-y-1 animate-fade-in max-h-[70vh] overflow-y-auto">
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
                <span className="text-sm">{item.label}</span>
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
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen">
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
