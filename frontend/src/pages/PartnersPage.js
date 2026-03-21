import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { useLanguage, useAuth } from '../context/AppContext';
import axios from 'axios';
import { 
  Search, Filter, MapPin, Heart, Shield, Star, Sparkles, 
  Clock, ChevronDown, X, SlidersHorizontal, Eye, EyeOff, Crown
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/ui/sheet';
import { Checkbox } from '../components/ui/checkbox';
import { Slider } from '../components/ui/slider';

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

const PartnerCard = ({ profile, lang, onFavorite }) => {
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

  const isBlurred = profile.cover_image?.is_blurred;

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
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isBlurred ? 'blur-xl' : ''}`}
          loading="lazy"
        />
        <div className="img-overlay absolute inset-0" />
        
        {/* Blur indicator */}
        {isBlurred && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/50 rounded-full p-3">
              <EyeOff className="w-6 h-6 text-white/70" />
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
              Vitrin
            </span>
          )}
          {profile.is_verified && (
            <span className="badge-verified">
              <Shield className="w-3 h-3" />
            </span>
          )}
          {profile.is_featured && !profile.is_vitrin && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#FFD700]/20 text-[#FFD700]">
              <Star className="w-3 h-3 inline" />
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

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-semibold text-lg">{profile.nickname}, {profile.age}</h3>
          <p className="text-white/70 text-sm flex items-center gap-1 mt-1">
            <MapPin className="w-4 h-4" />
            {profile.city_name}
          </p>
          
          {/* Service Types */}
          {profile.service_types?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {profile.service_types.slice(0, 2).map((type) => (
                <span key={type} className="text-xs px-2 py-0.5 rounded-full bg-[#E91E63]/20 text-[#FF6090]">
                  {serviceTypeLabels[type] || type}
                </span>
              ))}
            </div>
          )}
          
          {/* Price */}
          {profile.hourly_rate && (
            <div className="mt-2">
              <span className="price-tag text-sm">${profile.hourly_rate}/saat</span>
            </div>
          )}
          
          {/* Availability */}
          <div className="flex gap-2 mt-2">
            {profile.is_available_today && (
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
                <Clock className="w-3 h-3 inline mr-1" />
                Bugün
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PartnersPage = () => {
  const { lang, t } = useLanguage();
  const { citySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState([]);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    city_id: searchParams.get('city') || '',
    category_id: searchParams.get('category') || '',
    gender: searchParams.get('gender') || '',
    service_type: searchParams.get('service') || '',
    orientation: searchParams.get('orientation') || '',
    min_age: parseInt(searchParams.get('min_age')) || 18,
    max_age: parseInt(searchParams.get('max_age')) || 60,
    available_today: searchParams.get('available_today') === 'true',
    available_tonight: searchParams.get('available_tonight') === 'true',
    featured_only: searchParams.get('featured') === 'true',
    verified_only: searchParams.get('verified') === 'true',
    incall: searchParams.get('incall') === 'true',
    outcall: searchParams.get('outcall') === 'true',
    sort_by: searchParams.get('sort') || 'recommended',
  });

  useEffect(() => {
    fetchFiltersData();
  }, [lang]);

  useEffect(() => {
    fetchProfiles();
  }, [filters, page, lang, citySlug]);

  const fetchFiltersData = async () => {
    try {
      const [citiesRes, categoriesRes] = await Promise.all([
        axios.get(`${API_URL}/api/cities?lang=${lang}`),
        axios.get(`${API_URL}/api/categories?lang=${lang}`)
      ]);
      setCities(citiesRes.data);
      setCategories(categoriesRes.data);

      // If citySlug is provided, find the city and set filter
      if (citySlug) {
        const city = citiesRes.data.find(c => c.slug === citySlug);
        if (city) {
          setFilters(prev => ({ ...prev, city_id: city.id }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch filters data:', error);
    }
  };

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('lang', lang);
      params.append('page', page);
      params.append('limit', 20);
      params.append('sort_by', filters.sort_by);

      if (filters.city_id) params.append('city_id', filters.city_id);
      if (filters.category_id) params.append('category_id', filters.category_id);
      if (filters.gender) params.append('gender', filters.gender);
      if (filters.service_type) params.append('service_type', filters.service_type);
      if (filters.orientation) params.append('orientation', filters.orientation);
      if (filters.min_age > 18) params.append('min_age', filters.min_age);
      if (filters.max_age < 60) params.append('max_age', filters.max_age);
      if (filters.available_today) params.append('available_today', 'true');
      if (filters.available_tonight) params.append('available_tonight', 'true');
      if (filters.featured_only) params.append('featured_only', 'true');
      if (filters.verified_only) params.append('verified_only', 'true');
      if (filters.incall) params.append('incall', 'true');
      if (filters.outcall) params.append('outcall', 'true');

      const response = await axios.get(`${API_URL}/api/partners?${params.toString()}`);
      setProfiles(response.data.profiles);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Failed to fetch profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      city_id: '',
      category_id: '',
      gender: '',
      service_type: '',
      orientation: '',
      min_age: 18,
      max_age: 60,
      available_today: false,
      available_tonight: false,
      featured_only: false,
      verified_only: false,
      incall: false,
      outcall: false,
      sort_by: 'recommended',
    });
    setPage(1);
  };

  const activeFiltersCount = [
    filters.city_id,
    filters.category_id,
    filters.gender,
    filters.service_type,
    filters.orientation,
    filters.min_age > 18,
    filters.max_age < 60,
    filters.available_today,
    filters.available_tonight,
    filters.featured_only,
    filters.verified_only,
    filters.incall,
    filters.outcall,
  ].filter(Boolean).length;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Gender */}
      <div>
        <label className="text-white/70 text-sm mb-2 block">Cinsiyet</label>
        <Select value={filters.gender || "all"} onValueChange={(v) => updateFilter('gender', v === "all" ? "" : v)}>
          <SelectTrigger className="input-glass">
            <SelectValue placeholder="Tümü" />
          </SelectTrigger>
          <SelectContent className="bg-[#15151F] border-[#E91E63]/20">
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="female">Kadın</SelectItem>
            <SelectItem value="male">Erkek</SelectItem>
            <SelectItem value="trans">Trans</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Service Type */}
      <div>
        <label className="text-white/70 text-sm mb-2 block">Hizmet Türü</label>
        <Select value={filters.service_type || "all"} onValueChange={(v) => updateFilter('service_type', v === "all" ? "" : v)}>
          <SelectTrigger className="input-glass">
            <SelectValue placeholder="Tümü" />
          </SelectTrigger>
          <SelectContent className="bg-[#15151F] border-[#E91E63]/20">
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="dinner-companion">Yemek Eşliği</SelectItem>
            <SelectItem value="event-companion">Davet Eşliği</SelectItem>
            <SelectItem value="gf-bf-experience">Sevgili Deneyimi</SelectItem>
            <SelectItem value="sleep-companion">Uyku Arkadaşlığı</SelectItem>
            <SelectItem value="spouse-roleplay">Eş Rolleri</SelectItem>
            <SelectItem value="travel-companion">Gezi Eşliği</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orientation */}
      <div>
        <label className="text-white/70 text-sm mb-2 block">Cinsel Yönelim</label>
        <Select value={filters.orientation || "all"} onValueChange={(v) => updateFilter('orientation', v === "all" ? "" : v)}>
          <SelectTrigger className="input-glass">
            <SelectValue placeholder="Tümü" />
          </SelectTrigger>
          <SelectContent className="bg-[#15151F] border-[#E91E63]/20">
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="heterosexual">Heteroseksüel</SelectItem>
            <SelectItem value="lesbian">Lezbiyen</SelectItem>
            <SelectItem value="gay">Gay</SelectItem>
            <SelectItem value="bisexual">Biseksüel</SelectItem>
            <SelectItem value="trans">Trans</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* City */}
      <div>
        <label className="text-white/70 text-sm mb-2 block">{t('city')}</label>
        <Select value={filters.city_id || "all"} onValueChange={(v) => updateFilter('city_id', v === "all" ? "" : v)}>
          <SelectTrigger className="input-glass">
            <SelectValue placeholder="Tüm Şehirler" />
          </SelectTrigger>
          <SelectContent className="bg-[#15151F] border-[#E91E63]/20">
            <SelectItem value="all">Tüm Şehirler</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category */}
      <div>
        <label className="text-white/70 text-sm mb-2 block">{t('category')}</label>
        <Select value={filters.category_id || "all"} onValueChange={(v) => updateFilter('category_id', v === "all" ? "" : v)}>
          <SelectTrigger className="input-glass">
            <SelectValue placeholder="Tüm Kategoriler" />
          </SelectTrigger>
          <SelectContent className="bg-[#15151F] border-[#E91E63]/20">
            <SelectItem value="all">Tüm Kategoriler</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Age Range */}
      <div>
        <label className="text-white/70 text-sm mb-4 block">
          {t('age')}: {filters.min_age} - {filters.max_age}
        </label>
        <Slider
          value={[filters.min_age, filters.max_age]}
          onValueChange={([min, max]) => {
            setFilters(prev => ({ ...prev, min_age: min, max_age: max }));
          }}
          min={18}
          max={60}
          step={1}
          className="w-full"
        />
      </div>

      {/* Checkboxes */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox 
            checked={filters.available_today}
            onCheckedChange={(v) => updateFilter('available_today', v)}
          />
          <span className="text-white/70">{t('availableToday')}</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox 
            checked={filters.available_tonight}
            onCheckedChange={(v) => updateFilter('available_tonight', v)}
          />
          <span className="text-white/70">{t('availableTonight')}</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox 
            checked={filters.featured_only}
            onCheckedChange={(v) => updateFilter('featured_only', v)}
          />
          <span className="text-white/70">{t('featured')}</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox 
            checked={filters.verified_only}
            onCheckedChange={(v) => updateFilter('verified_only', v)}
          />
          <span className="text-white/70">{t('verified')}</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox 
            checked={filters.incall}
            onCheckedChange={(v) => updateFilter('incall', v)}
          />
          <span className="text-white/70">Ev (Incall)</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox 
            checked={filters.outcall}
            onCheckedChange={(v) => updateFilter('outcall', v)}
          />
          <span className="text-white/70">Dışarı (Outcall)</span>
        </label>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button 
          variant="outline" 
          className="w-full btn-outline"
          onClick={clearFilters}
        >
          <X className="w-4 h-4 mr-2" />
          Filtreleri Temizle ({activeFiltersCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white font-serif">
          {citySlug ? cities.find(c => c.slug === citySlug)?.name : t('allPartners')}
        </h1>
        <p className="text-white/60 mt-2">{total} partner bulundu</p>
      </div>

      {/* Top Bar - Mobile Filter + Sort */}
      <div className="flex items-center justify-between gap-4 mb-6">
        {/* Mobile Filter Button */}
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="btn-outline md:hidden" data-testid="mobile-filter-btn">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              {t('filter')}
              {activeFiltersCount > 0 && (
                <span className="ml-2 w-5 h-5 rounded-full bg-[#E91E63] text-white text-xs flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-[#0A0A0F] border-[#E91E63]/20">
            <SheetHeader>
              <SheetTitle className="text-white">{t('filter')}</SheetTitle>
            </SheetHeader>
            <div className="mt-6 overflow-y-auto max-h-[80vh]">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>

        {/* Sort - Visible on all screens */}
        <div className="flex items-center gap-3 ml-auto">
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" className="text-white/60 hidden md:flex" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              Temizle ({activeFiltersCount})
            </Button>
          )}
          <Select value={filters.sort_by} onValueChange={(v) => updateFilter('sort_by', v)}>
            <SelectTrigger className="input-glass w-[140px] md:w-[160px]" data-testid="sort-select">
              <SelectValue placeholder="Sıralama" />
            </SelectTrigger>
            <SelectContent className="bg-[#15151F] border-[#E91E63]/20">
              <SelectItem value="recommended">Önerilen</SelectItem>
              <SelectItem value="newest">En Yeni</SelectItem>
              <SelectItem value="popular">En Popüler</SelectItem>
              <SelectItem value="featured">Öne Çıkanlar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-8">
        {/* Desktop Sidebar Filters - Only place filters exist on desktop */}
        <aside className="hidden md:block w-72 shrink-0">
          <div className="glass rounded-xl p-6 sticky top-24">
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#E91E63]" />
              {t('filter')}
            </h3>
            <FilterContent />
          </div>
        </aside>

        {/* Profiles Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-[#E91E63] border-t-transparent rounded-full"></div>
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/60 text-lg">{t('noResults')}</p>
              <Button variant="outline" className="btn-outline mt-4" onClick={clearFilters}>
                Filtreleri Temizle
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 stagger-children">
                {profiles.map((profile) => (
                  <PartnerCard key={profile.id} profile={profile} lang={lang} />
                ))}
              </div>

              {/* Pagination */}
              {total > 20 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    className="btn-outline"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    {t('back')}
                  </Button>
                  <span className="flex items-center px-4 text-white/60">
                    {page} / {Math.ceil(total / 20)}
                  </span>
                  <Button
                    variant="outline"
                    className="btn-outline"
                    disabled={page >= Math.ceil(total / 20)}
                    onClick={() => setPage(p => p + 1)}
                  >
                    {t('next')}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnersPage;
