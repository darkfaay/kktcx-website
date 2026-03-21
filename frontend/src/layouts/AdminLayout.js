import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useLanguage } from '../context/AppContext';
import Logo from '../components/Logo';
import { 
  LayoutDashboard, Users, UserCheck, MapPin, Tag, Package, 
  Settings, LogOut, Menu, X, ChevronLeft, ChevronRight,
  Bell, Search, Globe, FileText, Image, Megaphone, BarChart3,
  Shield, Palette, Languages, MousePointer, MessageSquare,
  Calendar, TrendingUp, CreditCard
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { lang, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const basePath = `/${lang}/admin`;

  const menuSections = [
    {
      title: 'Genel',
      items: [
        { path: '', icon: LayoutDashboard, label: 'Dashboard', badge: null },
        { path: '/raporlar', icon: TrendingUp, label: 'Raporlar', badge: null },
      ]
    },
    {
      title: 'Kullanıcılar',
      items: [
        { path: '/kullanicilar', icon: Users, label: 'Tüm Kullanıcılar', badge: null },
        { path: '/partnerler', icon: Shield, label: 'Partnerler', badge: null },
      ]
    },
    {
      title: 'İlanlar',
      items: [
        { path: '/profiller', icon: UserCheck, label: 'Profiller / İlanlar', badge: 'pending' },
        { path: '/randevular', icon: Calendar, label: 'Randevular', badge: null },
      ]
    },
    {
      title: 'İçerik',
      items: [
        { path: '/icerik', icon: FileText, label: 'Sayfa İçerikleri', badge: null },
        { path: '/medya', icon: Image, label: 'Medya Yönetimi', badge: null },
        { path: '/ceviri', icon: Languages, label: 'Çeviriler', badge: null },
      ]
    },
    {
      title: 'Katalog',
      items: [
        { path: '/sehirler', icon: MapPin, label: 'Şehirler', badge: null },
        { path: '/kategoriler', icon: Tag, label: 'Kategoriler', badge: null },
        { path: '/paketler', icon: CreditCard, label: 'Paketler', badge: null },
      ]
    },
    {
      title: 'Ayarlar',
      items: [
        { path: '/site-ayarlari', icon: Settings, label: 'Site Ayarları', badge: null },
        { path: '/seo', icon: Globe, label: 'SEO Yönetimi', badge: null },
        { path: '/sms', icon: MessageSquare, label: 'SMS Ayarları', badge: null },
        { path: '/entegrasyonlar', icon: MousePointer, label: 'Entegrasyonlar', badge: null },
      ]
    },
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

  const getBreadcrumbs = () => {
    const pathParts = location.pathname.replace(basePath, '').split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Admin', path: basePath }];
    
    let currentPath = basePath;
    pathParts.forEach(part => {
      currentPath += '/' + part;
      const menuItem = menuSections.flatMap(s => s.items).find(item => basePath + item.path === currentPath);
      if (menuItem) {
        breadcrumbs.push({ label: menuItem.label, path: currentPath });
      }
    });
    
    return breadcrumbs;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex">
      {/* Sidebar - Desktop */}
      <aside className={`hidden md:flex flex-col fixed left-0 top-0 bottom-0 bg-[#0D0D12] border-r border-white/5 transition-all duration-300 z-40 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        {/* Logo */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          {sidebarOpen ? (
            <Link to={`/${lang}`} className="flex items-center gap-2" data-testid="admin-logo">
              <Logo size="small" showBadge={false} />
              <span className="text-xs px-2 py-0.5 rounded bg-[#E91E63]/20 text-[#E91E63] font-medium">Admin</span>
            </Link>
          ) : (
            <Link to={`/${lang}`} className="mx-auto">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E91E63] to-[#9C27B0] flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
            </Link>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#E91E63] flex items-center justify-center text-white shadow-lg hover:bg-[#D81B60] transition-colors"
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Menu */}
        <nav className="flex-1 p-3 overflow-y-auto custom-scrollbar">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="mb-6">
              {sidebarOpen && (
                <p className="px-3 mb-2 text-xs font-semibold text-white/30 uppercase tracking-wider">{section.title}</p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={basePath + item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative ${
                      isActive(item.path)
                        ? 'bg-[#E91E63]/10 text-[#E91E63]'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                    data-testid={`admin-menu-${item.path || 'dashboard'}`}
                    title={!sidebarOpen ? item.label : ''}
                  >
                    <item.icon className={`w-5 h-5 shrink-0 ${isActive(item.path) ? 'text-[#E91E63]' : ''}`} />
                    {sidebarOpen && (
                      <>
                        <span className="text-sm font-medium">{item.label}</span>
                        {item.badge === 'pending' && (
                          <span className="ml-auto w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                        )}
                      </>
                    )}
                    {!sidebarOpen && item.badge === 'pending' && (
                      <span className="absolute right-1 top-1 w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-3 border-t border-white/5">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E91E63] to-[#9C27B0] flex items-center justify-center">
                  <span className="text-white font-bold">{user?.name?.[0] || 'A'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{user?.name || 'Admin'}</p>
                  <p className="text-[#E91E63] text-xs">Administrator</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-400/10 w-full transition-all"
                data-testid="admin-logout"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Çıkış Yap</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full p-2.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-all"
              title="Çıkış Yap"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0D0D12] border-b border-white/5">
        <div className="px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white/70 p-2"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <Logo size="small" showBadge={false} />
            <span className="text-xs px-2 py-0.5 rounded bg-[#E91E63]/20 text-[#E91E63]">Admin</span>
          </div>
          <Link to={`/${lang}`}>
            <Button variant="ghost" size="sm" className="text-white/70 p-2">
              <Globe className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#0D0D12] border-b border-white/5 max-h-[80vh] overflow-y-auto animate-fade-in">
            {menuSections.map((section, sIdx) => (
              <div key={sIdx} className="p-4 border-b border-white/5">
                <p className="text-xs font-semibold text-white/30 uppercase mb-2">{section.title}</p>
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={basePath + item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                      isActive(item.path)
                        ? 'bg-[#E91E63]/10 text-[#E91E63]'
                        : 'text-white/60'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                    {item.badge === 'pending' && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-yellow-400"></span>
                    )}
                  </Link>
                ))}
              </div>
            ))}
            <div className="p-4">
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-red-400 w-full"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Çıkış Yap</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'} pt-16 md:pt-0 min-h-screen`}>
        {/* Top Bar */}
        <div className="hidden md:flex items-center justify-between px-8 py-4 border-b border-white/5 bg-[#0A0A0F]/80 backdrop-blur-sm sticky top-0 z-30">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm">
            {getBreadcrumbs().map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-4 h-4 text-white/30" />}
                <Link 
                  to={crumb.path}
                  className={idx === getBreadcrumbs().length - 1 ? 'text-white' : 'text-white/50 hover:text-white'}
                >
                  {crumb.label}
                </Link>
              </React.Fragment>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <Input 
                placeholder="Ara..." 
                className="pl-10 w-64 bg-white/5 border-white/10 text-sm"
              />
            </div>
            <Button variant="ghost" size="sm" className="relative text-white/60 hover:text-white">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#E91E63]"></span>
            </Button>
            <Link to={`/${lang}`}>
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                <Globe className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
