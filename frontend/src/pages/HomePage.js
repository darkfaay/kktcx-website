import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useLanguage } from '../context/AppContext';
import axios from 'axios';
import { 
  Search, MapPin, Heart, Shield, Users, ChevronRight, 
  MessageCircle, Clock, Sparkles, Flame, Star, Filter, Crown, Eye, EyeOff
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

// New legal service types
const serviceTypeLabels = {
  'dinner-companion': 'Yemek Eşliği',
  'event-companion': 'Davet Eşliği',
  'sleep-companion': 'Uyku Arkadaşlığı',
  'gf-bf-experience': 'Sevgili Deneyimi',
  'spouse-roleplay': 'Eş Rolleri',
  'travel-companion': 'Gezi Eşliği',
  'social-event': 'Sosyal Etkinlik',
  'business-event': 'İş Daveti',
  'culture-arts': 'Kültür & Sanat',
  'sports-fitness': 'Spor & Fitness'
};

const orientationLabels = {
  heterosexual: 'Heteroseksüel',
  lesbian: 'Lezbiyen',
  gay: 'Gay',
  bisexual: 'Biseksüel',
  trans: 'Trans'
};

const genderLabels = {
  female: 'Kadın',
  male: 'Erkek',
  trans: 'Trans'
};

const PartnerCard = ({ profile, lang, premium = false }) => {
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
    : 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop';

  const isBlurred = profile.cover_image?.is_blurred;

  return (
    <div 
      className={`profile-card cursor-pointer group ${premium ? 'ring-2 ring-[#FFD700]/50' : ''}`}
      onClick={() => navigate(`/${lang}/partner/${profile.slug}`)}
      data-testid={`partner-card-${profile.id}`}
    >
      <div className={`${premium ? 'aspect-[3/4.5]' : 'aspect-[3/4]'} relative overflow-hidden rounded-2xl`}>
        <img 
          src={coverImage}
          alt={profile.nickname}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isBlurred ? 'blur-xl' : ''}`}
          loading="lazy"
        />
        <div className="img-overlay absolute inset-0" />
        
        {/* Blur indicator */}
        {isBlurred && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/60 rounded-full p-4">
              <EyeOff className="w-8 h-8 text-white/80" />
            </div>
          </div>
        )}
        
        {/* Badges */}
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
          {profile.gender && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium badge-${profile.gender}`}>
              {genderLabels[profile.gender]}
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            isFavorited 
              ? 'bg-[#E91E63] text-white' 
              : 'bg-black/50 text-white/70 hover:bg-[#E91E63]/80 hover:text-white'
          }`}
          data-testid={`favorite-btn-${profile.id}`}
        >
          <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Online indicator */}
        {profile.is_available_today && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2">
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Online
            </span>
          </div>
        )}

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-white font-semibold text-lg">{profile.nickname}, {profile.age}</h3>
              <p className="text-white/70 text-sm flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" />
                {profile.city_name}
              </p>
            </div>
            {profile.hourly_rate && (
              <span className="price-tag">
                ${profile.hourly_rate}/saat
              </span>
            )}
          </div>
          
          {/* Service types */}
          {profile.service_types?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {profile.service_types.slice(0, 2).map((type) => (
                <span key={type} className="text-xs px-2 py-0.5 rounded-full bg-[#E91E63]/20 text-[#FF6090]">
                  {serviceTypeLabels[type] || type}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Premium Showcase Card (Larger, more prominent)
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

  const coverImage = profile.cover_image?.path 
    ? `${API_URL}/api/files/${profile.cover_image.path}`
    : 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop';

  const isBlurred = profile.cover_image?.is_blurred;

  return (
    <div 
      className="relative cursor-pointer group rounded-2xl overflow-hidden ring-2 ring-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.3)]"
      onClick={() => navigate(`/${lang}/partner/${profile.slug}`)}
      data-testid={`premium-card-${profile.id}`}
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
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/10 via-transparent to-[#E91E63]/10 opacity-50" />
        
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
            <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-bold badge-vip animate-pulse-glow">
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
          <div className="absolute top-4 left-1/2 -translate-x-1/2 mt-16">
            <span className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-green-500/30 text-green-400 text-sm font-medium">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Şu an müsait
            </span>
          </div>
        )}

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="mb-3">
            <h3 className="text-white font-bold text-2xl font-serif">{profile.nickname}, {profile.age}</h3>
            <p className="text-white/70 text-base flex items-center gap-1 mt-1">
              <MapPin className="w-5 h-5" />
              {profile.city_name}
            </p>
          </div>
          
          {/* Service types */}
          {profile.service_types?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {profile.service_types.map((type) => (
                <span key={type} className="text-sm px-3 py-1 rounded-full bg-[#E91E63]/30 text-[#FF6090] font-medium">
                  {serviceTypeLabels[type] || type}
                </span>
              ))}
            </div>
          )}
          
          {/* Price */}
          {profile.hourly_rate && (
            <div className="price-tag text-lg">
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
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [searchGender, setSearchGender] = useState('');
  const [searchServiceType, setSearchServiceType] = useState('');
  const [searchOrientation, setSearchOrientation] = useState('');

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
    if (searchGender) params.append('gender', searchGender);
    if (searchServiceType) params.append('service', searchServiceType);
    if (searchOrientation) params.append('orientation', searchOrientation);
    if (params.toString()) url += `?${params.toString()}`;
    navigate(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#E91E63] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1920&h=1080&fit=crop"
            alt="Background"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/80 via-[#0A0A0F]/60 to-[#0A0A0F]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#E91E63]/10 via-transparent to-[#9C27B0]/10" />
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#E91E63]/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#9C27B0]/20 rounded-full blur-[120px]"></div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E91E63]/10 border border-[#E91E63]/30 text-[#FF6090] text-sm mb-6">
              <Flame className="w-4 h-4" />
              Kuzey Kıbrıs'ın #1 Yetişkin Platformu
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 font-serif animate-slide-up">
            <span className="gradient-text">Premium</span> Eşlik
            <br />
            <span className="text-4xl md:text-5xl lg:text-6xl text-white/90">Deneyimi</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Yemek eşliği, davet arkadaşlığı ve özel anlarınız için.
            Güvenli, gizli ve premium kalitede.
          </p>

          {/* Quick Filter Tabs - Gender Selection */}
          <div className="flex flex-wrap justify-center gap-3 mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {['Tümü', 'Kadın', 'Erkek', 'Trans'].map((tab, idx) => (
              <button
                key={tab}
                onClick={() => setSearchGender(idx === 0 ? '' : ['', 'female', 'male', 'trans'][idx])}
                className={`filter-tab ${searchGender === ['', 'female', 'male', 'trans'][idx] ? 'active' : ''}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Box - Simplified */}
          <div className="glass max-w-4xl mx-auto rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={searchCity || "all"} onValueChange={(v) => setSearchCity(v === "all" ? "" : v)}>
                <SelectTrigger className="input-glass" data-testid="search-city">
                  <SelectValue placeholder="Şehir Seçin" />
                </SelectTrigger>
                <SelectContent className="bg-[#15151F] border-[#E91E63]/20">
                  <SelectItem value="all">Tüm Şehirler</SelectItem>
                  {homeData?.cities?.filter(c => c.region === 'north').map((city) => (
                    <SelectItem key={city.id} value={city.id}>🔴 {city.name}</SelectItem>
                  ))}
                  {homeData?.cities?.filter(c => c.region === 'south').map((city) => (
                    <SelectItem key={city.id} value={city.id}>🔵 {city.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={searchServiceType || "all"} onValueChange={(v) => setSearchServiceType(v === "all" ? "" : v)}>
                <SelectTrigger className="input-glass" data-testid="search-service">
                  <SelectValue placeholder="Hizmet Türü" />
                </SelectTrigger>
                <SelectContent className="bg-[#15151F] border-[#E91E63]/20">
                  <SelectItem value="all">Tüm Hizmetler</SelectItem>
                  <SelectItem value="dinner-companion">Yemek Eşliği</SelectItem>
                  <SelectItem value="event-companion">Davet Eşliği</SelectItem>
                  <SelectItem value="gf-bf-experience">Sevgili Deneyimi</SelectItem>
                  <SelectItem value="sleep-companion">Uyku Arkadaşlığı</SelectItem>
                  <SelectItem value="spouse-roleplay">Eş Rolleri</SelectItem>
                  <SelectItem value="travel-companion">Gezi Eşliği</SelectItem>
                </SelectContent>
              </Select>

              <Select value={searchOrientation || "all"} onValueChange={(v) => setSearchOrientation(v === "all" ? "" : v)}>
                <SelectTrigger className="input-glass" data-testid="search-orientation">
                  <SelectValue placeholder="Yönelim" />
                </SelectTrigger>
                <SelectContent className="bg-[#15151F] border-[#E91E63]/20">
                  <SelectItem value="all">Tüm Yönelimler</SelectItem>
                  <SelectItem value="heterosexual">Heteroseksüel</SelectItem>
                  <SelectItem value="lesbian">Lezbiyen</SelectItem>
                  <SelectItem value="gay">Gay</SelectItem>
                  <SelectItem value="bisexual">Biseksüel</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                className="btn-primary h-12 text-base"
                onClick={handleSearch}
                data-testid="search-btn"
              >
                <Search className="w-5 h-5 mr-2" />
                Ara
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-10 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="text-center">
              <p className="text-3xl font-bold gradient-text">{homeData?.stats?.total_profiles || '500'}+</p>
              <p className="text-white/50 text-sm">Aktif İlan</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold gradient-text">{homeData?.stats?.total_cities || '5'}</p>
              <p className="text-white/50 text-sm">Şehir</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold gradient-text">24/7</p>
              <p className="text-white/50 text-sm">Online</p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-[#E91E63] rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Premium Homepage Showcase Section */}
      {homeData?.homepage_vitrin?.length > 0 && (
        <section className="py-16 md:py-24 relative overflow-hidden">
          {/* Premium Background Effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#FFD700]/5 via-transparent to-transparent"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#FFD700]/10 rounded-full blur-[150px]"></div>
          
          <div className="container mx-auto px-4 relative">
            <div className="flex items-center justify-center mb-12">
              <div className="text-center">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] flex items-center justify-center animate-pulse-glow">
                    <Crown className="w-8 h-8 text-black" />
                  </div>
                </div>
                <span className="block text-[#FFD700] text-sm uppercase tracking-[0.3em] mb-2">Premium Vitrin</span>
                <h2 className="text-4xl md:text-5xl font-bold font-serif">
                  <span className="gradient-text-gold">Seçkin</span>
                  <span className="text-white"> Modeller</span>
                </h2>
                <p className="text-white/50 mt-3 max-w-md mx-auto">En özel ve ayrıcalıklı partnerlerimiz</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {homeData.homepage_vitrin.map((profile) => (
                <PremiumShowcaseCard key={profile.id} profile={profile} lang={lang} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* VIP Section */}
      {homeData?.vitrin_profiles?.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] flex items-center justify-center">
                  <Star className="w-6 h-6 text-black" />
                </div>
                <div>
                  <span className="text-[#FFD700] text-sm uppercase tracking-wider">Premium</span>
                  <h2 className="text-3xl md:text-4xl font-bold text-white font-serif">
                    VIP İlanlar
                  </h2>
                </div>
              </div>
              <Link to={`/${lang}/partnerler?featured=true`} className="text-[#E91E63] hover:text-[#FF6090] flex items-center gap-1 transition-colors">
                Tümünü Gör <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="flex md:grid md:grid-cols-4 gap-6 overflow-x-auto pb-4 no-scrollbar scroll-snap-x">
              {homeData.vitrin_profiles.map((profile) => (
                <div key={profile.id} className="min-w-[280px] md:min-w-0">
                  <PartnerCard profile={profile} lang={lang} premium />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Partners */}
      {homeData?.featured_profiles?.length > 0 && (
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#E91E63]/5 to-transparent"></div>
          <div className="container mx-auto px-4 relative">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#E91E63]/20 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-[#E91E63]" />
                </div>
                <div>
                  <span className="text-[#E91E63] text-sm uppercase tracking-wider">Popüler</span>
                  <h2 className="text-3xl md:text-4xl font-bold text-white font-serif">
                    Öne Çıkanlar
                  </h2>
                </div>
              </div>
              <Link to={`/${lang}/partnerler`} className="text-[#E91E63] hover:text-[#FF6090] flex items-center gap-1 transition-colors">
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

      {/* New Profiles */}
      {homeData?.new_profiles?.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#9C27B0]/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#CE93D8]" />
                </div>
                <div>
                  <span className="text-[#CE93D8] text-sm uppercase tracking-wider">Yeni</span>
                  <h2 className="text-3xl md:text-4xl font-bold text-white font-serif">
                    Yeni Katılanlar
                  </h2>
                </div>
              </div>
              <Link to={`/${lang}/partnerler?sort=newest`} className="text-[#E91E63] hover:text-[#FF6090] flex items-center gap-1 transition-colors">
                Tümünü Gör <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="flex md:grid md:grid-cols-4 gap-6 overflow-x-auto pb-4 no-scrollbar scroll-snap-x">
              {homeData.new_profiles.map((profile) => (
                <div key={profile.id} className="min-w-[280px] md:min-w-0">
                  <PartnerCard profile={profile} lang={lang} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Service Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-[#E91E63] text-sm uppercase tracking-wider">Kategoriler</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 font-serif">
              Eşlik Hizmetleri
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
                className="glass rounded-2xl p-4 text-center hover:border-[#E91E63]/50 transition-all group"
                data-testid={`service-${service.slug}`}
              >
                <div className={`w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                  {service.icon}
                </div>
                <h3 className="text-white font-medium text-sm">{service.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Orientations */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#9C27B0]/10 via-transparent to-[#E91E63]/10"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <span className="text-[#CE93D8] text-sm uppercase tracking-wider">Çeşitlilik</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 font-serif">
              Cinsel Yönelim
            </h2>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: 'Lezbiyen', slug: 'lesbian', color: 'from-pink-500 to-red-500' },
              { name: 'Gay', slug: 'gay', color: 'from-blue-500 to-cyan-500' },
              { name: 'Biseksüel', slug: 'bisexual', color: 'from-purple-500 to-pink-500' },
              { name: 'Trans', slug: 'trans', color: 'from-pink-400 to-blue-400' },
              { name: 'Heteroseksüel', slug: 'heterosexual', color: 'from-rose-500 to-orange-500' },
            ].map((orientation) => (
              <Link
                key={orientation.slug}
                to={`/${lang}/partnerler?orientation=${orientation.slug}`}
                className={`px-6 py-3 rounded-full bg-gradient-to-r ${orientation.color} text-white font-medium hover:scale-105 transition-transform shadow-lg`}
              >
                {orientation.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Cities Section */}
      {homeData?.cities?.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-[#E91E63] text-sm uppercase tracking-wider">Lokasyonlar</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 font-serif">
                Tüm Kıbrıs
              </h2>
              <p className="text-white/50 mt-2">Kuzey ve Güney Kıbrıs'ın tüm şehirlerinde hizmet</p>
            </div>
            
            {/* North Cyprus */}
            <div className="mb-8">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                Kuzey Kıbrıs (KKTC)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {homeData.cities.filter(c => c.region === 'north').map((city) => (
                  <Link
                    key={city.id}
                    to={`/${lang}/${city.slug}/partnerler`}
                    className="glass rounded-xl p-4 text-center hover:border-[#E91E63]/50 transition-all group"
                    data-testid={`city-${city.slug}`}
                  >
                    <MapPin className="w-6 h-6 text-[#E91E63] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="text-white font-medium text-sm">{city.name}</h3>
                    <p className="text-white/50 text-xs mt-1">{city.partner_count || 0} İlan</p>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* South Cyprus */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                Güney Kıbrıs (Rum Kesimi)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {homeData.cities.filter(c => c.region === 'south').map((city) => (
                  <Link
                    key={city.id}
                    to={`/${lang}/${city.slug}/partnerler`}
                    className="glass rounded-xl p-4 text-center hover:border-[#E91E63]/50 transition-all group"
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
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-[#E91E63] text-sm uppercase tracking-wider">Neden Biz?</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 font-serif">
              Güvenli & Gizli
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass rounded-2xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#E91E63]/10 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-[#E91E63]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">%100 Gizlilik</h3>
              <p className="text-white/60">
                Tüm verileriniz şifreli. Kimliğiniz asla paylaşılmaz.
              </p>
            </div>
            
            <div className="glass rounded-2xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#E91E63]/10 flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-[#E91E63]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Doğrulanmış Profiller</h3>
              <p className="text-white/60">
                Her ilan admin onayından geçer. Gerçek fotoğraflar, gerçek kişiler.
              </p>
            </div>
            
            <div className="glass rounded-2xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#E91E63]/10 flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-[#E91E63]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Güvenli İletişim</h3>
              <p className="text-white/60">
                Platform içi mesajlaşma. Kişisel bilgi paylaşmadan iletişim.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#E91E63]/20 via-[#9C27B0]/20 to-[#E91E63]/20"></div>
          <div className="container mx-auto px-4 text-center relative">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-serif">
              İlan Vermek İster Misiniz?
            </h2>
            <p className="text-white/70 mb-8 max-w-2xl mx-auto">
              KKTCX platformuna katılın, profilinizi oluşturun ve binlerce potansiyel müşteriye ulaşın.
            </p>
            <Link to={`/${lang}/kayit?role=partner`}>
              <Button className="btn-primary px-8 py-6 text-lg animate-pulse-glow" data-testid="cta-become-partner">
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
