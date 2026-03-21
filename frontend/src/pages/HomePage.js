import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useLanguage } from '../context/AppContext';
import axios from 'axios';
import { 
  Search, MapPin, Heart, Shield, Users, ChevronRight, 
  MessageCircle, Clock, Sparkles, Flame, Star, Crown, EyeOff, Play
} from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import PageBanner from '../components/PageBanner';
import { SEO, generateStructuredData } from '../components/SEO';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// New legal service types
const serviceTypeLabels = {
  'dinner_companion': 'Yemek Eşliği',
  'dinner-companion': 'Yemek Eşliği',
  'event_companion': 'Etkinlik Eşliği',
  'event-companion': 'Davet Eşliği',
  'sleep_companion': 'Uyku Arkadaşlığı',
  'sleep-companion': 'Uyku Arkadaşlığı',
  'gf_bf_experience': 'Sevgili Deneyimi',
  'gf-bf-experience': 'Sevgili Deneyimi',
  'spouse_roleplay': 'Eş Rolleri',
  'spouse-roleplay': 'Eş Rolleri',
  'travel_companion': 'Seyahat Eşliği',
  'travel-companion': 'Gezi Eşliği',
  'social_event': 'Sosyal Etkinlik',
  'social-event': 'Sosyal Etkinlik',
  'business_event': 'İş Daveti',
  'business-event': 'İş Daveti',
  'culture_arts': 'Kültür & Sanat',
  'culture-arts': 'Kültür & Sanat',
  'sports_fitness': 'Spor & Fitness',
  'sports-fitness': 'Spor & Fitness',
  'escort': 'Escort',
  'companion': 'Eşlik'
};

const genderLabels = {
  female: 'Kadın',
  male: 'Erkek',
  trans: 'Trans'
};

// Sexy Partner Card
const PartnerCard = ({ profile, lang, premium = false }) => {
  const navigate = useNavigate();
  const { user, api } = useAuth();
  const [isFavorited, setIsFavorited] = useState(profile.is_favorited);
  const [isHovered, setIsHovered] = useState(false);

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

  const coverImage = profile.photo_url 
    || (profile.cover_image?.path 
      ? `${API_URL}/api/files/${profile.cover_image.path}`
      : 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop');

  const isBlurred = profile.cover_image?.is_blurred;

  return (
    <div 
      className={`sexy-card cursor-pointer group rounded-2xl overflow-hidden ${premium ? 'ring-2 ring-[#FFD700]/50' : ''}`}
      onClick={() => navigate(`/${lang}/partner/${profile.slug}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`partner-card-${profile.id}`}
    >
      <div className={`${premium ? 'aspect-[3/4.5]' : 'aspect-[3/4]'} relative overflow-hidden`}>
        <img 
          src={coverImage}
          alt={profile.nickname}
          className={`w-full h-full object-cover transition-all duration-700 ${isHovered ? 'scale-110' : 'scale-100'} ${isBlurred ? 'blur-xl' : ''}`}
          loading="lazy"
        />
        
        {/* Sexy Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-70" />
        <div className={`absolute inset-0 bg-gradient-to-br from-[#E91E63]/20 to-[#9C27B0]/20 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
        
        {/* Blur indicator */}
        {isBlurred && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/60 rounded-full p-4 animate-pulse">
              <EyeOff className="w-8 h-8 text-white/80" />
            </div>
          </div>
        )}
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {profile.is_homepage_vitrin && (
            <span className="badge-vip animate-pulse-glow">
              <Crown className="w-3 h-3" />
              VIP+
            </span>
          )}
          {profile.is_vitrin && !profile.is_homepage_vitrin && (
            <span className="badge-vip">
              <Sparkles className="w-3 h-3" />
              VIP
            </span>
          )}
          {profile.is_verified && (
            <span className="badge-verified">
              <Shield className="w-3 h-3" />
            </span>
          )}
        </div>

        {/* Gender Badge */}
        {profile.gender && (
          <div className="absolute top-3 right-14">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium badge-${profile.gender}`}>
              {genderLabels[profile.gender]}
            </span>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
            isFavorited 
              ? 'bg-[#E91E63] text-white scale-110' 
              : 'bg-black/50 text-white/70 hover:bg-[#E91E63]/80 hover:text-white hover:scale-110'
          }`}
          data-testid={`favorite-btn-${profile.id}`}
        >
          <Heart className={`w-5 h-5 transition-transform ${isFavorited ? 'fill-current scale-110' : ''}`} />
        </button>

        {/* Online indicator */}
        {profile.is_available_today && (
          <div className="absolute top-14 left-3">
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 backdrop-blur-sm text-green-400 text-xs">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Online
            </span>
          </div>
        )}

        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-white font-semibold text-xl font-serif">{profile.nickname}, {profile.age}</h3>
              <p className="text-white/70 text-sm flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" />
                {profile.city_name}
              </p>
            </div>
            {profile.hourly_rate && (
              <span className="price-tag animate-border-glow">
                ${profile.hourly_rate}/saat
              </span>
            )}
          </div>
          
          {/* Service types */}
          {profile.service_types?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {profile.service_types.slice(0, 2).map((type) => (
                <span key={type} className="text-xs px-2 py-0.5 rounded-full bg-[#E91E63]/20 text-[#FF6090] backdrop-blur-sm">
                  {serviceTypeLabels[type] || type}
                </span>
              ))}
            </div>
          )}

          {/* Hover reveal message button */}
          <div className={`mt-3 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Button size="sm" className="btn-primary w-full text-sm">
              <MessageCircle className="w-4 h-4 mr-2" />
              Mesaj Gönder
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Premium Showcase Card (Larger, sexier)
const PremiumShowcaseCard = ({ profile, lang }) => {
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

  const coverImage = profile.photo_url 
    || (profile.cover_image?.path 
      ? `${API_URL}/api/files/${profile.cover_image.path}`
      : 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop');

  const isBlurred = profile.cover_image?.is_blurred;

  return (
    <div 
      className="relative cursor-pointer group rounded-2xl overflow-hidden animate-border-glow"
      onClick={() => navigate(`/${lang}/partner/${profile.slug}`)}
      data-testid={`premium-card-${profile.id}`}
      style={{
        boxShadow: '0 0 40px rgba(255, 215, 0, 0.3)'
      }}
    >
      <div className="aspect-[2/3] relative overflow-hidden">
        <img 
          src={coverImage}
          alt={profile.nickname}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isBlurred ? 'blur-xl' : ''}`}
          loading="lazy"
        />
        
        {/* Premium Gold Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/20 via-transparent to-[#E91E63]/20 opacity-60 group-hover:opacity-80 transition-opacity" />
        
        {/* Animated border */}
        <div className="absolute inset-0 border-2 border-[#FFD700] rounded-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
        
        {/* Blur indicator */}
        {isBlurred && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/60 rounded-full p-6">
              <EyeOff className="w-12 h-12 text-white/80" />
            </div>
          </div>
        )}
        
        {/* Premium Badge */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-bold badge-vip animate-glow-pulse">
              <Crown className="w-4 h-4" />
              PREMIUM VIP
            </span>
            {profile.is_verified && (
              <span className="badge-verified w-fit">
                <Shield className="w-3 h-3" />
                Doğrulanmış
              </span>
            )}
          </div>
          
          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isFavorited 
                ? 'bg-[#E91E63] text-white' 
                : 'bg-black/50 text-white/70 hover:bg-[#E91E63]/80 hover:text-white'
            }`}
          >
            <Heart className={`w-6 h-6 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Online indicator */}
        {profile.is_available_today && (
          <div className="absolute top-20 left-4">
            <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/30 backdrop-blur-sm text-green-400 text-sm font-medium">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Şu an müsait
            </span>
          </div>
        )}

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="mb-3">
            <h3 className="text-white font-bold text-2xl font-serif hero-text-shadow">{profile.nickname}, {profile.age}</h3>
            <p className="text-white/70 text-base flex items-center gap-1 mt-1">
              <MapPin className="w-5 h-5" />
              {profile.city_name}
            </p>
          </div>
          
          {/* Service types */}
          {profile.service_types?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {profile.service_types.map((type) => (
                <span key={type} className="text-sm px-3 py-1 rounded-full bg-[#E91E63]/30 text-[#FF6090] font-medium backdrop-blur-sm">
                  {serviceTypeLabels[type] || type}
                </span>
              ))}
            </div>
          )}
          
          {/* Price */}
          {profile.hourly_rate && (
            <div className="price-tag text-lg inline-block">
              ${profile.hourly_rate}/saat
            </div>
          )}
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
  const [siteSettings, setSiteSettings] = useState({ general: {}, homepage: {} });
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [searchGender, setSearchGender] = useState('');
  const [searchServiceType, setSearchServiceType] = useState('');
  const [searchOrientation, setSearchOrientation] = useState('');

  useEffect(() => {
    fetchHomeData();
    fetchSiteSettings();
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

  const fetchSiteSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/settings/public`);
      if (response.data) {
        setSiteSettings({
          general: response.data.general || {},
          homepage: response.data.homepage || {},
        });
      }
    } catch (error) {
      console.error('Failed to fetch site settings:', error);
    }
  };

  const handleSearch = () => {
    let url = `/${lang}/partnerler`;
    const params = new URLSearchParams();
    if (searchCity) params.append('city', searchCity);
    if (searchGender) params.append('gender', searchGender);
    if (searchServiceType) params.append('service', searchServiceType);
    if (searchOrientation) params.append('orientation', searchOrientation);
    if (params.toString()) url += `?${params.toString()}`;
    navigate(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#E91E63]/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#E91E63] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEO 
        page="home" 
        structuredData={generateStructuredData.website(lang)}
      />
      
      {/* Hero Section - Sexy & Modern */}
      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Video-like gradient animation */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0F] via-[#1A0A15] to-[#0A0A0F]"></div>
          
          {/* Floating orbs */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#E91E63]/20 rounded-full blur-[150px] animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#9C27B0]/20 rounded-full blur-[180px] animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#FF6090]/10 rounded-full blur-[120px] animate-pulse"></div>
          
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23E91E63' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          {/* Badge */}
          <div className="animate-fade-in mb-8">
            <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#E91E63]/20 to-[#9C27B0]/20 border border-[#E91E63]/30 text-[#FF6090] backdrop-blur-xl">
              <Flame className="w-5 h-5 animate-pulse" />
              <span className="font-medium">{siteSettings?.general?.site_tagline || "Kıbrıs'ın Premium Eşlik Platformu"}</span>
              <Flame className="w-5 h-5 animate-pulse" />
            </span>
          </div>
          
          {/* Main Title with sexy gradient */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 font-serif animate-slide-up">
            <span className="gradient-text hero-text-shadow">{siteSettings?.homepage?.hero_title || "Tutkunun Adresi"}</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl mx-auto animate-fade-in leading-relaxed" style={{ animationDelay: '0.3s' }}>
            {siteSettings?.homepage?.hero_subtitle || "Özel anlarınız için"} <span className="text-[#E91E63]">seçkin partnerler</span>. 
            <br className="hidden md:block" />
            {siteSettings?.homepage?.hero_description || "Yemek eşliği, davet arkadaşlığı ve unutulmaz deneyimler."}
          </p>

          {/* Gender Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-10 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {[
              { label: 'Tümü', value: '', icon: '✨' },
              { label: 'Kadın', value: 'female', icon: '👩' },
              { label: 'Erkek', value: 'male', icon: '👨' },
              { label: 'Trans', value: 'trans', icon: '🌈' }
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSearchGender(tab.value)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  searchGender === tab.value
                    ? 'bg-gradient-to-r from-[#E91E63] to-[#9C27B0] text-white shadow-lg shadow-[#E91E63]/30 scale-105'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box - Sexy Glass Design */}
          <div className="max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <div className="relative">
              {/* Glow effect behind */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#E91E63] via-[#9C27B0] to-[#E91E63] rounded-3xl blur-lg opacity-30"></div>
              
              <div className="relative glass rounded-3xl p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* City */}
                  <Select value={searchCity || "all"} onValueChange={(v) => setSearchCity(v === "all" ? "" : v)}>
                    <SelectTrigger className="input-glass h-14 text-base" data-testid="search-city">
                      <SelectValue placeholder="📍 Şehir" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#15151F] border-[#E91E63]/20">
                      <SelectItem value="all">Tüm Şehirler</SelectItem>
                      <SelectItem value="divider-north" disabled className="text-[#E91E63] font-semibold">— Kuzey Kıbrıs —</SelectItem>
                      {homeData?.cities?.filter(c => c.region === 'north').map((city) => (
                        <SelectItem key={city.id} value={city.id}>🔴 {city.name}</SelectItem>
                      ))}
                      <SelectItem value="divider-south" disabled className="text-blue-400 font-semibold">— Güney Kıbrıs —</SelectItem>
                      {homeData?.cities?.filter(c => c.region === 'south').map((city) => (
                        <SelectItem key={city.id} value={city.id}>🔵 {city.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Service Type */}
                  <Select value={searchServiceType || "all"} onValueChange={(v) => setSearchServiceType(v === "all" ? "" : v)}>
                    <SelectTrigger className="input-glass h-14 text-base" data-testid="search-service">
                      <SelectValue placeholder="💕 Hizmet" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#15151F] border-[#E91E63]/20">
                      <SelectItem value="all">Tüm Hizmetler</SelectItem>
                      <SelectItem value="dinner-companion">🍷 Yemek Eşliği</SelectItem>
                      <SelectItem value="event-companion">🎭 Davet Eşliği</SelectItem>
                      <SelectItem value="gf-bf-experience">💕 Sevgili Deneyimi</SelectItem>
                      <SelectItem value="sleep-companion">🌙 Uyku Arkadaşlığı</SelectItem>
                      <SelectItem value="spouse-roleplay">💍 Eş Rolleri</SelectItem>
                      <SelectItem value="travel-companion">✈️ Gezi Eşliği</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Orientation */}
                  <Select value={searchOrientation || "all"} onValueChange={(v) => setSearchOrientation(v === "all" ? "" : v)}>
                    <SelectTrigger className="input-glass h-14 text-base" data-testid="search-orientation">
                      <SelectValue placeholder="🌈 Yönelim" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#15151F] border-[#E91E63]/20">
                      <SelectItem value="all">Tüm Yönelimler</SelectItem>
                      <SelectItem value="heterosexual">Heteroseksüel</SelectItem>
                      <SelectItem value="lesbian">Lezbiyen</SelectItem>
                      <SelectItem value="gay">Gay</SelectItem>
                      <SelectItem value="bisexual">Biseksüel</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Search Button */}
                  <Button 
                    className="btn-primary h-14 text-lg font-semibold group"
                    onClick={handleSearch}
                    data-testid="search-btn"
                  >
                    <Search className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Keşfet
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-12 animate-fade-in" style={{ animationDelay: '0.7s' }}>
            {[
              { value: homeData?.stats?.total_profiles || '500', suffix: '+', label: 'Aktif Partner' },
              { value: homeData?.stats?.total_cities || '18', suffix: '', label: 'Şehir' },
              { value: '24', suffix: '/7', label: 'Online' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-4xl md:text-5xl font-bold">
                  <span className="gradient-text">{stat.value}</span>
                  <span className="text-[#E91E63]">{stat.suffix}</span>
                </p>
                <p className="text-white/50 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 rounded-full border-2 border-[#E91E63]/50 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-gradient-to-b from-[#E91E63] to-transparent rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Premium Homepage Showcase Section */}
      {siteSettings.homepage?.show_vitrin !== false && homeData?.homepage_vitrin?.length > 0 && (
        <section className="py-20 md:py-32 relative overflow-hidden">
          {/* Premium Background Effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#FFD700]/5 via-transparent to-transparent"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#FFD700]/10 rounded-full blur-[200px]"></div>
          
          <div className="container mx-auto px-4 relative">
            <div className="flex items-center justify-center mb-16">
              <div className="text-center">
                <div className="inline-flex items-center gap-3 mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] flex items-center justify-center animate-glow-pulse">
                    <Crown className="w-10 h-10 text-black" />
                  </div>
                </div>
                <span className="block text-[#FFD700] text-sm uppercase tracking-[0.3em] mb-3">Premium Vitrin</span>
                <h2 className="text-4xl md:text-6xl font-bold font-serif">
                  <span className="gradient-text-gold">Seçkin</span>
                  <span className="text-white"> Modeller</span>
                </h2>
                <p className="text-white/50 mt-4 max-w-md mx-auto text-lg">En özel ve ayrıcalıklı partnerlerimiz</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {homeData.homepage_vitrin.slice(0, siteSettings.homepage?.partners_per_section || 8).map((profile) => (
                <PremiumShowcaseCard key={profile.id} profile={profile} lang={lang} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* VIP Section */}
      {siteSettings.homepage?.show_vitrin !== false && homeData?.vitrin_profiles?.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#FFD700] to-[#FFA500] flex items-center justify-center">
                  <Star className="w-7 h-7 text-black" />
                </div>
                <div>
                  <span className="text-[#FFD700] text-sm uppercase tracking-wider">Premium</span>
                  <h2 className="text-3xl md:text-4xl font-bold text-white font-serif">
                    VIP İlanlar
                  </h2>
                </div>
              </div>
              <Link to={`/${lang}/partnerler?featured=true`} className="text-[#D4AF37] hover:text-[#F3E5AB] flex items-center gap-2 transition-colors group">
                Tümünü Gör 
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {homeData.vitrin_profiles.slice(0, siteSettings.homepage?.partners_per_section || 8).map((profile) => (
                <PartnerCard key={profile.id} profile={profile} lang={lang} premium />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Partners */}
      {siteSettings.homepage?.show_featured !== false && homeData?.featured_profiles?.length > 0 && (
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#E91E63]/5 to-transparent"></div>
          <div className="container mx-auto px-4 relative">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#E91E63]/20 flex items-center justify-center">
                  <Flame className="w-7 h-7 text-[#E91E63]" />
                </div>
                <div>
                  <span className="text-[#E91E63] text-sm uppercase tracking-wider">Popüler</span>
                  <h2 className="text-3xl md:text-4xl font-bold text-white font-serif">
                    Öne Çıkanlar
                  </h2>
                </div>
              </div>
              <Link to={`/${lang}/partnerler`} className="text-[#D4AF37] hover:text-[#F3E5AB] flex items-center gap-2 transition-colors group">
                Tümünü Gör 
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {homeData.featured_profiles.slice(0, siteSettings.homepage?.partners_per_section || 8).map((profile) => (
                <PartnerCard key={profile.id} profile={profile} lang={lang} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Profiles */}
      {homeData?.new_profiles?.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#9C27B0]/20 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-[#CE93D8]" />
                </div>
                <div>
                  <span className="text-[#CE93D8] text-sm uppercase tracking-wider">Yeni</span>
                  <h2 className="text-3xl md:text-4xl font-bold text-white font-serif">
                    Yeni Katılanlar
                  </h2>
                </div>
              </div>
              <Link to={`/${lang}/partnerler?sort=newest`} className="text-[#D4AF37] hover:text-[#F3E5AB] flex items-center gap-2 transition-colors group">
                Tümünü Gör 
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {homeData.new_profiles.slice(0, siteSettings.homepage?.partners_per_section || 8).map((profile) => (
                <PartnerCard key={profile.id} profile={profile} lang={lang} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Service Categories - Sexy Grid */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E91E63]/5 via-transparent to-[#9C27B0]/5"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-14">
            <span className="text-[#E91E63] text-sm uppercase tracking-wider">Keşfet</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 font-serif">
              Eşlik <span className="gradient-text">Hizmetleri</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'Yemek Eşliği', slug: 'dinner-companion', icon: '🍷', color: 'from-rose-500 to-pink-600' },
              { name: 'Davet Eşliği', slug: 'event-companion', icon: '🎭', color: 'from-purple-500 to-violet-600' },
              { name: 'Sevgili Deneyimi', slug: 'gf-bf-experience', icon: '💕', color: 'from-pink-500 to-red-500' },
              { name: 'Uyku Arkadaşlığı', slug: 'sleep-companion', icon: '🌙', color: 'from-indigo-500 to-blue-600' },
              { name: 'Eş Rolleri', slug: 'spouse-roleplay', icon: '💍', color: 'from-amber-500 to-orange-600' },
              { name: 'Gezi Eşliği', slug: 'travel-companion', icon: '✈️', color: 'from-cyan-500 to-teal-600' },
              { name: 'Sosyal Etkinlik', slug: 'social-event', icon: '🎉', color: 'from-fuchsia-500 to-pink-600' },
              { name: 'İş Daveti', slug: 'business-event', icon: '💼', color: 'from-slate-500 to-gray-600' },
              { name: 'Kültür & Sanat', slug: 'culture-arts', icon: '🎨', color: 'from-emerald-500 to-green-600' },
              { name: 'Spor & Fitness', slug: 'sports-fitness', icon: '💪', color: 'from-orange-500 to-red-600' },
            ].map((service) => (
              <Link
                key={service.slug}
                to={`/${lang}/partnerler?service=${service.slug}`}
                className="sexy-card glass rounded-2xl p-5 text-center group"
                data-testid={`service-${service.slug}`}
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  {service.icon}
                </div>
                <h3 className="text-white font-medium">{service.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Orientations - Colorful Pills */}
      <section className="py-16 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-[#CE93D8] text-sm uppercase tracking-wider">Çeşitlilik</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 font-serif">
              Cinsel Yönelim
            </h2>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: 'Heteroseksüel', slug: 'heterosexual', color: 'from-rose-500 to-orange-500' },
              { name: 'Lezbiyen', slug: 'lesbian', color: 'from-pink-500 to-red-500' },
              { name: 'Gay', slug: 'gay', color: 'from-blue-500 to-cyan-500' },
              { name: 'Biseksüel', slug: 'bisexual', color: 'from-purple-500 to-pink-500' },
              { name: 'Trans', slug: 'trans', color: 'from-pink-400 to-blue-400' },
            ].map((orientation) => (
              <Link
                key={orientation.slug}
                to={`/${lang}/partnerler?orientation=${orientation.slug}`}
                className={`px-8 py-4 rounded-full bg-gradient-to-r ${orientation.color} text-white font-semibold hover:scale-105 hover:shadow-lg hover:shadow-[#E91E63]/30 transition-all duration-300`}
              >
                {orientation.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Cities Section */}
      {siteSettings.homepage?.show_cities !== false && homeData?.cities?.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <span className="text-[#E91E63] text-sm uppercase tracking-wider">Lokasyonlar</span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 font-serif">
                Tüm <span className="gradient-text">Kıbrıs</span>
              </h2>
              <p className="text-white/50 mt-4 text-lg">Kuzey ve Güney Kıbrıs'ın tüm şehirlerinde hizmet</p>
            </div>
            
            {/* North Cyprus */}
            <div className="mb-10">
              <h3 className="text-white font-semibold text-lg mb-5 flex items-center gap-3">
                <span className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></span>
                Kuzey Kıbrıs (KKTC)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {homeData.cities.filter(c => c.region === 'north').map((city) => (
                  <Link
                    key={city.id}
                    to={`/${lang}/partnerler?city=${city.slug}`}
                    className="sexy-card glass rounded-xl p-4 text-center group"
                    data-testid={`city-${city.slug}`}
                  >
                    <MapPin className="w-6 h-6 text-[#D4AF37] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="text-white font-medium text-sm">{city.name}</h3>
                    <p className="text-white/50 text-xs mt-1">{city.partner_count || 0} İlan</p>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* South Cyprus */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-5 flex items-center gap-3">
                <span className="w-4 h-4 rounded-full bg-blue-500 animate-pulse"></span>
                Güney Kıbrıs (Rum Kesimi)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {homeData.cities.filter(c => c.region === 'south').map((city) => (
                  <Link
                    key={city.id}
                    to={`/${lang}/partnerler?city=${city.slug}`}
                    className="sexy-card glass rounded-xl p-4 text-center group"
                    data-testid={`city-${city.slug}`}
                  >
                    <MapPin className="w-6 h-6 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="text-white font-medium text-sm">{city.name}</h3>
                    <p className="text-white/50 text-xs mt-1">{city.partner_count || 0} İlan</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Why Us Section */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#E91E63]/5 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-14">
            <span className="text-[#E91E63] text-sm uppercase tracking-wider">Neden Biz?</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 font-serif">
              Güvenli & <span className="gradient-text">Gizli</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Shield,
                title: '%100 Gizlilik',
                description: 'Tüm verileriniz şifreli. Kimliğiniz asla paylaşılmaz.',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Users,
                title: 'Doğrulanmış Profiller',
                description: 'Her ilan admin onayından geçer. Gerçek fotoğraflar, gerçek kişiler.',
                color: 'from-[#E91E63] to-[#9C27B0]'
              },
              {
                icon: MessageCircle,
                title: 'Güvenli İletişim',
                description: 'Platform içi mesajlaşma. Kişisel bilgi paylaşmadan iletişim.',
                color: 'from-purple-500 to-violet-500'
              }
            ].map((feature, idx) => (
              <div key={idx} className="sexy-card glass rounded-3xl p-8 text-center">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-6`}>
                  <feature.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-white/60">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#E91E63]/30 via-[#9C27B0]/30 to-[#E91E63]/30"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-5"></div>
          
          <div className="container mx-auto px-4 text-center relative">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-serif">
              <span className="gradient-text">Partner</span> Olmak İster Misiniz?
            </h2>
            <p className="text-white/70 mb-10 max-w-2xl mx-auto text-lg">
              KKTCX platformuna katılın, profilinizi oluşturun ve binlerce potansiyel müşteriye ulaşın.
            </p>
            <Link to={`/${lang}/kayit?role=partner`}>
              <Button className="btn-primary px-10 py-7 text-xl font-semibold animate-pulse-glow" data-testid="cta-become-partner">
                <Sparkles className="w-6 h-6 mr-2" />
                Hemen Başla
                <ChevronRight className="w-6 h-6 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
