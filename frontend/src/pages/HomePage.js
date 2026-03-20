import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useLanguage } from '../context/AppContext';
import axios from 'axios';
import { 
  Search, MapPin, Calendar, Star, Shield, Users, ChevronRight, 
  Heart, MessageCircle, Clock, Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PartnerCard = ({ profile, lang }) => {
  const navigate = useNavigate();
  const { user, api } = useAuth();
  const [isFavorited, setIsFavorited] = useState(profile.is_favorited);

  const handleFavorite = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate(`/${lang}/giris`);
      return;
    }
    try {
      if (isFavorited) {
        await api.delete(`/favorites/${profile.id}`);
      } else {
        await api.post(`/favorites/${profile.id}`);
      }
      setIsFavorited(!isFavorited);
    } catch (error) {
      console.error('Favorite error:', error);
    }
  };

  const coverImage = profile.cover_image?.path 
    ? `${API_URL}/api/files/${profile.cover_image.path}`
    : 'https://images.unsplash.com/photo-1590659163722-88a80a7ff913?w=400&h=600&fit=crop';

  return (
    <div 
      className="profile-card cursor-pointer group"
      onClick={() => navigate(`/${lang}/partner/${profile.slug}`)}
      data-testid={`partner-card-${profile.id}`}
    >
      <div className="aspect-[3/4] relative overflow-hidden">
        <img 
          src={coverImage}
          alt={profile.nickname}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="img-overlay absolute inset-0" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {profile.is_vitrin && (
            <span className="badge-gold">
              <Sparkles className="w-3 h-3" />
              Vitrin
            </span>
          )}
          {profile.is_verified && (
            <span className="badge-verified">
              <Shield className="w-3 h-3" />
              Doğrulanmış
            </span>
          )}
          {profile.is_featured && !profile.is_vitrin && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#D4AF37]/20 text-[#D4AF37]">
              <Star className="w-3 h-3 inline mr-1" />
              Öne Çıkan
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            isFavorited 
              ? 'bg-red-500 text-white' 
              : 'bg-black/50 text-white/70 hover:bg-black/70 hover:text-white'
          }`}
          data-testid={`favorite-btn-${profile.id}`}
        >
          <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-semibold text-lg">{profile.nickname}, {profile.age}</h3>
          <p className="text-white/70 text-sm flex items-center gap-1 mt-1">
            <MapPin className="w-4 h-4" />
            {profile.city_name}
          </p>
          {profile.short_description && (
            <p className="text-white/50 text-sm mt-2 line-clamp-2">{profile.short_description}</p>
          )}
          
          {/* Availability */}
          <div className="flex gap-2 mt-3">
            {profile.is_available_today && (
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
                <Clock className="w-3 h-3 inline mr-1" />
                Bugün Müsait
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [searchCategory, setSearchCategory] = useState('');

  useEffect(() => {
    fetchHomeData();
  }, [lang]);

  const fetchHomeData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/homepage?lang=${lang}`);
      setHomeData(response.data);
    } catch (error) {
      console.error('Failed to fetch home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    let url = `/${lang}/partnerler`;
    const params = new URLSearchParams();
    if (searchCity) params.append('city', searchCity);
    if (searchCategory) params.append('category', searchCategory);
    if (params.toString()) url += `?${params.toString()}`;
    navigate(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1599000428011-b1dc293639d5?w=1920&h=1080&fit=crop"
            alt="Kyrenia Harbor"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#050505]" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 font-serif animate-fade-in">
            {t('heroTitle')}
          </h1>
          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {t('heroSubtitle')}
          </p>

          {/* Search Box */}
          <div className="glass max-w-4xl mx-auto rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={searchCity || "all"} onValueChange={(v) => setSearchCity(v === "all" ? "" : v)}>
                <SelectTrigger className="input-glass" data-testid="search-city">
                  <SelectValue placeholder={t('city')} />
                </SelectTrigger>
                <SelectContent className="bg-[#0F0F10] border-white/10">
                  <SelectItem value="all">Tüm Şehirler</SelectItem>
                  {homeData?.cities?.map((city) => (
                    <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={searchCategory || "all"} onValueChange={(v) => setSearchCategory(v === "all" ? "" : v)}>
                <SelectTrigger className="input-glass" data-testid="search-category">
                  <SelectValue placeholder={t('category')} />
                </SelectTrigger>
                <SelectContent className="bg-[#0F0F10] border-white/10">
                  <SelectItem value="all">Tüm Kategoriler</SelectItem>
                  {homeData?.categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select defaultValue="all">
                <SelectTrigger className="input-glass" data-testid="search-availability">
                  <SelectValue placeholder="Müsaitlik" />
                </SelectTrigger>
                <SelectContent className="bg-[#0F0F10] border-white/10">
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="today">{t('availableToday')}</SelectItem>
                  <SelectItem value="tonight">{t('availableTonight')}</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                className="btn-primary h-12 text-base"
                onClick={handleSearch}
                data-testid="search-btn"
              >
                <Search className="w-5 h-5 mr-2" />
                {t('search')}
              </Button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Link to={`/${lang}/partnerler`}>
              <Button className="btn-primary px-8 py-6 text-lg" data-testid="browse-partners-btn">
                {t('browsePartners')}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            {!user && (
              <Link to={`/${lang}/kayit?role=partner`}>
                <Button variant="outline" className="btn-outline px-8 py-6 text-lg" data-testid="become-partner-btn">
                  {t('becomePartner')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Vitrin Section */}
      {homeData?.vitrin_profiles?.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[#D4AF37] text-sm uppercase tracking-wider">{t('vitrin')}</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 font-serif">
                  {t('vitrinPartners')}
                </h2>
              </div>
              <Link to={`/${lang}/partnerler?featured=true`} className="text-[#D4AF37] hover:underline flex items-center gap-1">
                Tümünü Gör <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            {/* Horizontal scroll on mobile, grid on desktop */}
            <div className="flex md:grid md:grid-cols-4 gap-6 overflow-x-auto pb-4 no-scrollbar scroll-snap-x">
              {homeData.vitrin_profiles.map((profile) => (
                <div key={profile.id} className="min-w-[280px] md:min-w-0">
                  <PartnerCard profile={profile} lang={lang} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Partners */}
      {homeData?.featured_profiles?.length > 0 && (
        <section className="py-16 bg-[#0A0A0A]">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[#D4AF37] text-sm uppercase tracking-wider">{t('featured')}</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 font-serif">
                  {t('featuredPartners')}
                </h2>
              </div>
              <Link to={`/${lang}/partnerler`} className="text-[#D4AF37] hover:underline flex items-center gap-1">
                Tümünü Gör <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="flex md:grid md:grid-cols-4 gap-6 overflow-x-auto pb-4 no-scrollbar scroll-snap-x">
              {homeData.featured_profiles.map((profile) => (
                <div key={profile.id} className="min-w-[280px] md:min-w-0">
                  <PartnerCard profile={profile} lang={lang} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Today Available */}
      {homeData?.today_available?.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-emerald-400 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {t('todayAvailable')}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 font-serif">
                  Bugün Müsait Partnerler
                </h2>
              </div>
              <Link to={`/${lang}/partnerler?available_today=true`} className="text-[#D4AF37] hover:underline flex items-center gap-1">
                Tümünü Gör <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="flex md:grid md:grid-cols-4 gap-6 overflow-x-auto pb-4 no-scrollbar scroll-snap-x">
              {homeData.today_available.map((profile) => (
                <div key={profile.id} className="min-w-[280px] md:min-w-0">
                  <PartnerCard profile={profile} lang={lang} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Cities Section */}
      {homeData?.cities?.length > 0 && (
        <section className="py-16 bg-[#0A0A0A]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-[#D4AF37] text-sm uppercase tracking-wider">{t('byCity')}</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 font-serif">
                Şehirlere Göre Keşfet
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {homeData.cities.map((city) => (
                <Link
                  key={city.id}
                  to={`/${lang}/${city.slug}/partnerler`}
                  className="glass rounded-xl p-6 text-center hover:border-[#D4AF37]/50 transition-all group"
                  data-testid={`city-${city.slug}`}
                >
                  <MapPin className="w-8 h-8 text-[#D4AF37] mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-semibold">{city.name}</h3>
                  <p className="text-white/50 text-sm mt-1">{city.partner_count} Partner</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Us Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-[#D4AF37] text-sm uppercase tracking-wider">{t('whyUs')}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 font-serif">
              {t('whyUsDesc')}
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass rounded-xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Güvenli Platform</h3>
              <p className="text-white/60">
                Tüm profiller admin onayından geçer. Doğrulanmış kullanıcılar ve güvenli iletişim.
              </p>
            </div>
            
            <div className="glass rounded-xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Kaliteli Profiller</h3>
              <p className="text-white/60">
                Profesyonel ve deneyimli partnerler. Her etkinlik için ideal eşlik.
              </p>
            </div>
            
            <div className="glass rounded-xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Anlık İletişim</h3>
              <p className="text-white/60">
                Sistem içi mesajlaşma ile güvenli ve hızlı iletişim imkanı.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-16 bg-gradient-to-r from-[#D4AF37]/20 to-[#997B19]/20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-serif">
              Partner Olmak İster Misiniz?
            </h2>
            <p className="text-white/70 mb-8 max-w-2xl mx-auto">
              KKTCX platformuna katılın, profilinizi oluşturun ve Kuzey Kıbrıs'ta sosyal eşlik hizmeti verin.
            </p>
            <Link to={`/${lang}/kayit?role=partner`}>
              <Button className="btn-primary px-8 py-6 text-lg animate-pulse-gold" data-testid="cta-become-partner">
                Hemen Başla
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
