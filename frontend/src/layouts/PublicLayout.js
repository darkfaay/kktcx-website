import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth, useLanguage } from '../context/AppContext';
import { 
  Home, Users, Heart, MessageCircle, User, Menu, X, Globe, 
  LogOut, ChevronDown, Search
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Button } from '../components/ui/button';

const PublicLayout = () => {
  const { user, logout } = useAuth();
  const { lang, t, changeLang, languages } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const languageNames = {
    tr: 'Türkçe',
    en: 'English',
    ru: 'Русский',
    de: 'Deutsch'
  };

  const handleLogout = () => {
    logout();
    navigate(`/${lang}`);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      {/* Desktop Header */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-50 glass-dark">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to={`/${lang}`} className="flex items-center gap-2" data-testid="logo-link">
              <span className="text-2xl font-bold gold-text font-serif">KKTCX</span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-6">
              <Link 
                to={`/${lang}/partnerler`} 
                className="text-white/70 hover:text-[#D4AF37] transition-colors"
                data-testid="nav-partners"
              >
                {t('partners')}
              </Link>
              <Link 
                to={`/${lang}/hakkimizda`} 
                className="text-white/70 hover:text-[#D4AF37] transition-colors"
                data-testid="nav-about"
              >
                {t('about')}
              </Link>
              <Link 
                to={`/${lang}/iletisim`} 
                className="text-white/70 hover:text-[#D4AF37] transition-colors"
                data-testid="nav-contact"
              >
                {t('contact')}
              </Link>
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white" data-testid="language-selector">
                    <Globe className="w-4 h-4 mr-2" />
                    {languageNames[lang]}
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#0F0F10] border-white/10">
                  {languages.map((l) => (
                    <DropdownMenuItem 
                      key={l}
                      onClick={() => changeLang(l)}
                      className={`cursor-pointer ${l === lang ? 'text-[#D4AF37]' : 'text-white/70'}`}
                      data-testid={`lang-${l}`}
                    >
                      {languageNames[l]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-white/70 hover:text-white" data-testid="user-menu">
                      <User className="w-4 h-4 mr-2" />
                      {user.name || user.email.split('@')[0]}
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#0F0F10] border-white/10">
                    {user.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link to={`/${lang}/admin`} className="cursor-pointer text-white/70" data-testid="admin-link">
                          {t('dashboard')}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user.role === 'partner' && (
                      <DropdownMenuItem asChild>
                        <Link to={`/${lang}/partner`} className="cursor-pointer text-white/70" data-testid="partner-dashboard-link">
                          {t('dashboard')}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to={`/${lang}/kullanici/favoriler`} className="cursor-pointer text-white/70" data-testid="favorites-link">
                        {t('favorites')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/${lang}/kullanici/mesajlar`} className="cursor-pointer text-white/70" data-testid="messages-link">
                        {t('messages')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/${lang}/kullanici/ayarlar`} className="cursor-pointer text-white/70" data-testid="settings-link">
                        {t('settings')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-400" data-testid="logout-btn">
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to={`/${lang}/giris`}>
                    <Button variant="ghost" className="text-white/70 hover:text-white" data-testid="login-btn">
                      {t('login')}
                    </Button>
                  </Link>
                  <Link to={`/${lang}/kayit`}>
                    <Button className="btn-primary px-6" data-testid="register-btn">
                      {t('register')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 glass-dark">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link to={`/${lang}`} className="flex items-center gap-2" data-testid="mobile-logo">
            <span className="text-xl font-bold gold-text font-serif">KKTCX</span>
          </Link>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white/70 p-2" data-testid="mobile-language">
                  <Globe className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#0F0F10] border-white/10">
                {languages.map((l) => (
                  <DropdownMenuItem 
                    key={l}
                    onClick={() => changeLang(l)}
                    className={`cursor-pointer ${l === lang ? 'text-[#D4AF37]' : 'text-white/70'}`}
                  >
                    {languageNames[l]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white/70 p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="px-4 pb-4 space-y-3 animate-fade-in">
            <Link 
              to={`/${lang}/partnerler`}
              className="block py-2 text-white/70 hover:text-[#D4AF37]"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('partners')}
            </Link>
            {user ? (
              <>
                {(user.role === 'partner' || user.role === 'admin') && (
                  <Link 
                    to={`/${lang}/partner`}
                    className="block py-2 text-white/70 hover:text-[#D4AF37]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('dashboard')}
                  </Link>
                )}
                <button 
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="block py-2 text-red-400"
                >
                  {t('logout')}
                </button>
              </>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link to={`/${lang}/giris`} className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full btn-outline">{t('login')}</Button>
                </Link>
                <Link to={`/${lang}/kayit`} className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full btn-primary">{t('register')}</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16 md:pt-20 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav md:hidden">
        <Link 
          to={`/${lang}`} 
          className="flex flex-col items-center gap-1 text-white/60 hover:text-[#D4AF37] transition-colors"
          data-testid="mobile-nav-home"
        >
          <Home className="w-5 h-5" />
          <span className="text-xs">{t('home')}</span>
        </Link>
        <Link 
          to={`/${lang}/partnerler`} 
          className="flex flex-col items-center gap-1 text-white/60 hover:text-[#D4AF37] transition-colors"
          data-testid="mobile-nav-partners"
        >
          <Search className="w-5 h-5" />
          <span className="text-xs">{t('search')}</span>
        </Link>
        {user ? (
          <>
            <Link 
              to={`/${lang}/kullanici/favoriler`} 
              className="flex flex-col items-center gap-1 text-white/60 hover:text-[#D4AF37] transition-colors"
              data-testid="mobile-nav-favorites"
            >
              <Heart className="w-5 h-5" />
              <span className="text-xs">{t('favorites')}</span>
            </Link>
            <Link 
              to={`/${lang}/kullanici/mesajlar`} 
              className="flex flex-col items-center gap-1 text-white/60 hover:text-[#D4AF37] transition-colors"
              data-testid="mobile-nav-messages"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs">{t('messages')}</span>
            </Link>
            <Link 
              to={user.role === 'partner' ? `/${lang}/partner` : `/${lang}/kullanici/ayarlar`} 
              className="flex flex-col items-center gap-1 text-white/60 hover:text-[#D4AF37] transition-colors"
              data-testid="mobile-nav-profile"
            >
              <User className="w-5 h-5" />
              <span className="text-xs">{t('profile')}</span>
            </Link>
          </>
        ) : (
          <>
            <Link 
              to={`/${lang}/giris`} 
              className="flex flex-col items-center gap-1 text-white/60 hover:text-[#D4AF37] transition-colors"
              data-testid="mobile-nav-login"
            >
              <User className="w-5 h-5" />
              <span className="text-xs">{t('login')}</span>
            </Link>
          </>
        )}
      </nav>

      {/* Footer - Hidden on mobile */}
      <footer className="hidden md:block bg-[#0A0A0A] border-t border-white/5 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <span className="text-2xl font-bold gold-text font-serif">KKTCX</span>
              <p className="mt-4 text-white/50 text-sm">
                Kuzey Kıbrıs'ın premium sosyal eşlik platformu
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">{t('partners')}</h4>
              <div className="space-y-2">
                <Link to={`/${lang}/girne/partnerler`} className="block text-white/50 hover:text-[#D4AF37] text-sm">Girne</Link>
                <Link to={`/${lang}/lefkosa/partnerler`} className="block text-white/50 hover:text-[#D4AF37] text-sm">Lefkoşa</Link>
                <Link to={`/${lang}/gazimagusa/partnerler`} className="block text-white/50 hover:text-[#D4AF37] text-sm">Gazimağusa</Link>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <div className="space-y-2">
                <Link to={`/${lang}/hakkimizda`} className="block text-white/50 hover:text-[#D4AF37] text-sm">{t('about')}</Link>
                <Link to={`/${lang}/sss`} className="block text-white/50 hover:text-[#D4AF37] text-sm">{t('faq')}</Link>
                <Link to={`/${lang}/iletisim`} className="block text-white/50 hover:text-[#D4AF37] text-sm">{t('contact')}</Link>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Yasal</h4>
              <div className="space-y-2">
                <Link to={`/${lang}/gizlilik`} className="block text-white/50 hover:text-[#D4AF37] text-sm">{t('privacy')}</Link>
                <Link to={`/${lang}/kullanim-sartlari`} className="block text-white/50 hover:text-[#D4AF37] text-sm">{t('terms')}</Link>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 text-center text-white/30 text-sm">
            © 2025 KKTCX. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
