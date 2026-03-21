import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth, useLanguage } from '../context/AppContext';
import axios from 'axios';
import { 
  Home, Users, Heart, MessageCircle, User, Menu, X, Globe, 
  LogOut, ChevronDown, Search, AlertTriangle, Mail, Phone, MapPin
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Button } from '../components/ui/button';
import Logo, { LogoText } from '../components/Logo';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PublicLayout = () => {
  const { user, logout } = useAuth();
  const { lang, t, changeLang, languages } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState({ general: {}, social: {} });

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/settings/public`);
      if (response.data) {
        setSiteSettings({
          general: response.data.general || {},
          social: response.data.social || {},
        });
      }
    } catch (error) {
      console.error('Failed to fetch site settings:', error);
    }
  };

  // Bakım modu kontrolü
  if (siteSettings.general?.maintenance_mode && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#E91E63]/20 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-[#E91E63]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4 font-serif">Bakım Modu</h1>
          <p className="text-white/60 mb-8">
            Sitemiz şu anda bakım çalışması nedeniyle geçici olarak kapalıdır. 
            Kısa süre içinde tekrar hizmetinizde olacağız.
          </p>
          <p className="text-white/40 text-sm">
            İletişim: {siteSettings.general?.contact_email || 'info@kktcx.com'}
          </p>
        </div>
      </div>
    );
  }

  const languageNames = {
    tr: 'Türkçe',
    en: 'English',
    ru: 'Русский',
    de: 'Deutsch',
    el: 'Ελληνικά'
  };

  const handleLogout = () => {
    logout();
    navigate(`/${lang}`);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col">
      {/* Desktop Header */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-50 glass-dark">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to={`/${lang}`} className="flex items-center gap-2" data-testid="logo-link">
              <Logo size="default" showBadge={true} />
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-6">
              <Link 
                to={`/${lang}`} 
                className="text-white/70 hover:text-[#D4AF37] transition-colors"
                data-testid="nav-home"
              >
                {t('home')}
              </Link>
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
              <Logo size="small" showBadge={false} />
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
      <footer className="hidden md:block bg-[#050508] border-t border-white/5">
        {/* Main Footer */}
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Brand */}
            <div className="col-span-2">
              <Link to={`/${lang}`} className="inline-block">
                <LogoText className="text-3xl" />
              </Link>
              <p className="mt-4 text-white/50 text-sm leading-relaxed max-w-sm">
                {siteSettings.general?.site_description || "Kuzey Kıbrıs'ın en güvenilir sosyal eşlik platformu. Yemek eşliği, davet arkadaşlığı ve özel anlardaki deneyimler için profesyonel hizmet."}
              </p>
              
              {/* Contact Info */}
              <div className="mt-4 space-y-2">
                {siteSettings.general?.contact_email && (
                  <a href={`mailto:${siteSettings.general.contact_email}`} className="flex items-center gap-2 text-white/50 hover:text-[#D4AF37] text-sm transition-colors">
                    <Mail className="w-4 h-4" />
                    {siteSettings.general.contact_email}
                  </a>
                )}
                {siteSettings.general?.contact_phone && (
                  <a href={`tel:${siteSettings.general.contact_phone}`} className="flex items-center gap-2 text-white/50 hover:text-[#D4AF37] text-sm transition-colors">
                    <Phone className="w-4 h-4" />
                    {siteSettings.general.contact_phone}
                  </a>
                )}
                {siteSettings.general?.contact_address && (
                  <p className="flex items-center gap-2 text-white/50 text-sm">
                    <MapPin className="w-4 h-4" />
                    {siteSettings.general.contact_address}
                  </p>
                )}
              </div>
              
              {/* Social Media */}
              <div className="flex gap-4 mt-6">
                {siteSettings.social?.facebook && (
                  <a href={siteSettings.social.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#D4AF37]/20 flex items-center justify-center text-white/50 hover:text-[#D4AF37] transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                )}
                {siteSettings.social?.instagram && (
                  <a href={siteSettings.social.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#D4AF37]/20 flex items-center justify-center text-white/50 hover:text-[#D4AF37] transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                )}
                {siteSettings.social?.twitter && (
                  <a href={siteSettings.social.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#D4AF37]/20 flex items-center justify-center text-white/50 hover:text-[#D4AF37] transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                  </a>
                )}
                {siteSettings.social?.telegram && (
                  <a href={siteSettings.social.telegram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#D4AF37]/20 flex items-center justify-center text-white/50 hover:text-[#D4AF37] transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  </a>
                )}
                {siteSettings.social?.whatsapp && (
                  <a href={`https://wa.me/${(siteSettings.social.whatsapp || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#D4AF37]/20 flex items-center justify-center text-white/50 hover:text-[#D4AF37] transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </a>
                )}
              </div>
            </div>

            {/* Kuzey Kıbrıs Şehirleri */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Kuzey Kıbrıs</h4>
              <div className="space-y-2">
                <Link to={`/${lang}/partnerler?city=girne`} className="block text-white/50 hover:text-[#D4AF37] text-sm transition-colors">Girne</Link>
                <Link to={`/${lang}/partnerler?city=lefkosa`} className="block text-white/50 hover:text-[#D4AF37] text-sm transition-colors">Lefkoşa</Link>
                <Link to={`/${lang}/partnerler?city=magusa`} className="block text-white/50 hover:text-[#D4AF37] text-sm transition-colors">Gazimağusa</Link>
                <Link to={`/${lang}/partnerler?city=guzelyurt`} className="block text-white/50 hover:text-[#D4AF37] text-sm transition-colors">Güzelyurt</Link>
                <Link to={`/${lang}/partnerler?city=iskele`} className="block text-white/50 hover:text-[#D4AF37] text-sm transition-colors">İskele</Link>
              </div>
            </div>

            {/* Güney Kıbrıs Şehirleri */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Güney Kıbrıs</h4>
              <div className="space-y-2">
                <Link to={`/${lang}/partnerler?city=limasol`} className="block text-white/50 hover:text-[#D4AF37] text-sm transition-colors">Limasol</Link>
                <Link to={`/${lang}/partnerler?city=larnaka`} className="block text-white/50 hover:text-[#D4AF37] text-sm transition-colors">Larnaka</Link>
                <Link to={`/${lang}/partnerler?city=baf`} className="block text-white/50 hover:text-[#D4AF37] text-sm transition-colors">Baf (Paphos)</Link>
                <Link to={`/${lang}/partnerler?city=ayia-napa`} className="block text-white/50 hover:text-[#D4AF37] text-sm transition-colors">Ayia Napa</Link>
                <Link to={`/${lang}/partnerler?city=protaras`} className="block text-white/50 hover:text-[#D4AF37] text-sm transition-colors">Protaras</Link>
              </div>
            </div>

            {/* Platform & Yasal */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Platform</h4>
              <div className="space-y-2">
                <Link to={`/${lang}/hakkimizda`} className="block text-white/50 hover:text-[#D4AF37] text-sm transition-colors">{t('about')}</Link>
                <Link to={`/${lang}/sss`} className="block text-white/50 hover:text-[#D4AF37] text-sm transition-colors">{t('faq')}</Link>
                <Link to={`/${lang}/iletisim`} className="block text-white/50 hover:text-[#D4AF37] text-sm transition-colors">{t('contact')}</Link>
                <Link to={`/${lang}/kayit`} className="block text-white/50 hover:text-[#D4AF37] text-sm transition-colors">Partner Ol</Link>
              </div>
              
              <h4 className="text-white font-semibold mb-4 mt-6 text-sm uppercase tracking-wider">Yasal</h4>
              <div className="space-y-2">
                <Link to={`/${lang}/gizlilik`} className="block text-white/50 hover:text-[#D4AF37] text-sm transition-colors">{t('privacy')}</Link>
                <Link to={`/${lang}/kullanim-sartlari`} className="block text-white/50 hover:text-[#D4AF37] text-sm transition-colors">{t('terms')}</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5">
          <div className="container mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-white/30 text-sm">
                © 2025 KKTCX. Tüm hakları saklıdır.
              </p>
              <div className="flex items-center gap-6 text-white/30 text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
                  18+ Yetişkin İçerik
                </span>
                <span>Kıbrıs'ın #1 Eşlik Platformu</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
