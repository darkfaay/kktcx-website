import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage, useAuth } from '../context/AppContext';
import axios from 'axios';
import { 
  MapPin, Heart, Shield, Star, Sparkles, Clock, MessageCircle, 
  ChevronLeft, ChevronRight, Share2, Flag, Globe, Calendar,
  User, Briefcase, Utensils, Plane, X, Crown, Eye, 
  Phone, Send, Instagram, Ruler, Palette, CircleDot, Zap,
  CheckCircle2, Users, Flame
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const serviceTypeLabels = {
  'dinner-companion': { label: 'Yemek Eşliği', icon: Utensils },
  'event-companion': { label: 'Davet Eşliği', icon: Users },
  'sleep-companion': { label: 'Uyku Arkadaşlığı', icon: Star },
  'gf-bf-experience': { label: 'Sevgili Deneyimi', icon: Heart },
  'spouse-roleplay': { label: 'Eş Rolleri', icon: Users },
  'travel-companion': { label: 'Gezi Eşliği', icon: Plane },
  'social-event': { label: 'Sosyal Etkinlik', icon: Sparkles },
  'business-event': { label: 'İş Daveti', icon: Briefcase },
  'culture-arts': { label: 'Kültür & Sanat', icon: Palette },
  'sports-fitness': { label: 'Spor & Fitness', icon: Zap }
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

const bodyTypeLabels = {
  slim: 'İnce',
  athletic: 'Atletik',
  average: 'Normal',
  curvy: 'Dolgun',
  muscular: 'Kaslı',
  'plus-size': 'Büyük Beden'
};

const ethnicityLabels = {
  caucasian: 'Beyaz / Kafkas',
  african: 'Afrikalı',
  asian: 'Asyalı',
  latin: 'Latin',
  'middle-eastern': 'Orta Doğulu',
  mixed: 'Karışık',
  other: 'Diğer'
};

const skinToneLabels = {
  fair: 'Açık Ten',
  light: 'Beyaz',
  medium: 'Buğday',
  olive: 'Esmer',
  tan: 'Bronz',
  brown: 'Kahverengi',
  dark: 'Koyu'
};

const PartnerDetailPage = () => {
  const { slug } = useParams();
  const { lang, t } = useLanguage();
  const { user, api } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    fetchProfile();
  }, [slug, lang]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/partners/${slug}?lang=${lang}`, {
        headers: user ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}
      });
      setProfile(response.data);
      setIsFavorited(response.data.is_favorited);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Profil bulunamadı');
      navigate(`/${lang}/partnerler`);
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      navigate(`/${lang}/giris`);
      return;
    }
    try {
      if (isFavorited) {
        await api.delete(`/favorites/${profile.id}`);
        toast.success('Favorilerden çıkarıldı');
      } else {
        await api.post(`/favorites/${profile.id}`);
        toast.success('Favorilere eklendi');
      }
      setIsFavorited(!isFavorited);
    } catch (error) {
      toast.error('Bir hata oluştu');
    }
  };

  const handleMessage = async () => {
    if (!user) {
      navigate(`/${lang}/giris`);
      return;
    }
    navigate(`/${lang}/kullanici/mesajlar?new=${profile.user_id}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profile.nickname} - KKTCX`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link kopyalandı');
    }
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  const nextImage = () => {
    setLightboxIndex(i => (i + 1) % images.length);
  };

  const prevImage = () => {
    setLightboxIndex(i => (i - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#E91E63] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const coverImage = profile.cover_image?.path 
    ? `${API_URL}/api/files/${profile.cover_image.path}`
    : profile.images?.[0]?.path 
      ? `${API_URL}/api/files/${profile.images[0].path}`
      : 'https://images.unsplash.com/photo-1590659163722-88a80a7ff913?w=1200&h=600&fit=crop';

  const images = profile.images?.length > 0 
    ? profile.images.map(img => ({
        url: `${API_URL}/api/files/${img.path}`,
        isBlurred: img.is_blurred
      }))
    : [{ url: 'https://images.unsplash.com/photo-1590659163722-88a80a7ff913?w=800&h=1200&fit=crop', isBlurred: false }];

  return (
    <div className="min-h-screen pb-24 md:pb-0" data-testid="partner-detail-page">
      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={closeLightbox}>
          <button 
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
          
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}
          
          <img 
            src={images[lightboxIndex].url}
            alt={profile.nickname}
            className={`max-w-[90vw] max-h-[90vh] object-contain ${images[lightboxIndex].isBlurred ? 'blur-xl' : ''}`}
            onClick={(e) => e.stopPropagation()}
          />
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}

      {/* Cover Photo Section */}
      <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
        <img 
          src={coverImage}
          alt={profile.nickname}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/50 to-transparent" />
        
        {/* Back Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute top-4 left-4 glass rounded-full w-10 h-10 p-0 z-10"
          onClick={() => navigate(-1)}
          data-testid="back-btn"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </Button>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <Button
            variant="ghost"
            size="sm"
            className="glass rounded-full w-10 h-10 p-0"
            onClick={handleShare}
            data-testid="share-btn"
          >
            <Share2 className="w-5 h-5 text-white" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`glass rounded-full w-10 h-10 p-0 ${isFavorited ? 'bg-[#E91E63]/50' : ''}`}
            onClick={handleFavorite}
            data-testid="favorite-cover-btn"
          >
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-[#E91E63] text-[#E91E63]' : 'text-white'}`} />
          </Button>
        </div>

        {/* Profile Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="container mx-auto">
            <div className="flex items-end gap-4">
              {/* Profile Avatar */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-[#0A0A0F] overflow-hidden shadow-2xl cursor-pointer"
                   onClick={() => openLightbox(0)}>
                <img 
                  src={images[0].url}
                  alt={profile.nickname}
                  className={`w-full h-full object-cover ${images[0].isBlurred ? 'blur-lg' : ''}`}
                />
              </div>
              
              {/* Name & Status */}
              <div className="flex-1 mb-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-4xl font-bold text-white font-serif">
                    {profile.nickname}
                  </h1>
                  <span className="text-white/60 text-lg md:text-xl">{profile.age}</span>
                  
                  {/* Badges */}
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
                      Doğrulanmış
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mt-2 text-white/70">
                  <MapPin className="w-4 h-4 text-[#E91E63]" />
                  <span>{profile.city_name}</span>
                  
                  {/* Online Status */}
                  {profile.is_online && (
                    <span className="ml-4 flex items-center gap-1 text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Çevrimiçi
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {profile.gender && (
                <div className="glass rounded-xl p-4 text-center">
                  <User className="w-5 h-5 text-[#E91E63] mx-auto mb-2" />
                  <p className="text-white/50 text-xs">Cinsiyet</p>
                  <p className="text-white font-medium">{genderLabels[profile.gender] || profile.gender}</p>
                </div>
              )}
              {profile.orientation && (
                <div className="glass rounded-xl p-4 text-center">
                  <Heart className="w-5 h-5 text-[#E91E63] mx-auto mb-2" />
                  <p className="text-white/50 text-xs">Yönelim</p>
                  <p className="text-white font-medium">{orientationLabels[profile.orientation] || profile.orientation}</p>
                </div>
              )}
              {profile.ethnicity && (
                <div className="glass rounded-xl p-4 text-center">
                  <Globe className="w-5 h-5 text-[#E91E63] mx-auto mb-2" />
                  <p className="text-white/50 text-xs">Etnik Köken</p>
                  <p className="text-white font-medium">{ethnicityLabels[profile.ethnicity] || profile.ethnicity}</p>
                </div>
              )}
              {profile.skin_tone && (
                <div className="glass rounded-xl p-4 text-center">
                  <Palette className="w-5 h-5 text-[#E91E63] mx-auto mb-2" />
                  <p className="text-white/50 text-xs">Ten Rengi</p>
                  <p className="text-white font-medium">{skinToneLabels[profile.skin_tone] || profile.skin_tone}</p>
                </div>
              )}
              {profile.height && (
                <div className="glass rounded-xl p-4 text-center">
                  <Ruler className="w-5 h-5 text-[#E91E63] mx-auto mb-2" />
                  <p className="text-white/50 text-xs">Boy</p>
                  <p className="text-white font-medium">{profile.height} cm</p>
                </div>
              )}
              {profile.body_type && (
                <div className="glass rounded-xl p-4 text-center">
                  <Flame className="w-5 h-5 text-[#E91E63] mx-auto mb-2" />
                  <p className="text-white/50 text-xs">Vücut</p>
                  <p className="text-white font-medium">{bodyTypeLabels[profile.body_type] || profile.body_type}</p>
                </div>
              )}
            </div>

            {/* Availability Status */}
            <div className="flex flex-wrap gap-3">
              {profile.is_available_today && (
                <span className="px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Bugün Müsait
                </span>
              )}
              {profile.is_available_tonight && (
                <span className="px-4 py-2 rounded-full bg-purple-500/20 text-purple-400 flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4" />
                  Bu Akşam Müsait
                </span>
              )}
              {profile.incall && (
                <span className="px-4 py-2 rounded-full bg-blue-500/20 text-blue-400 flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  Ev (Incall)
                </span>
              )}
              {profile.outcall && (
                <span className="px-4 py-2 rounded-full bg-orange-500/20 text-orange-400 flex items-center gap-2 text-sm">
                  <Plane className="w-4 h-4" />
                  Dışarı (Outcall)
                </span>
              )}
            </div>

            {/* Service Types */}
            {profile.service_types?.length > 0 && (
              <div className="glass rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#E91E63]" />
                  Sunulan Hizmetler
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.service_types.map((type) => {
                    const service = serviceTypeLabels[type];
                    const IconComponent = service?.icon || Star;
                    return (
                      <span 
                        key={type} 
                        className="px-4 py-2 rounded-full bg-[#E91E63]/10 text-[#FF6090] flex items-center gap-2 text-sm"
                      >
                        <IconComponent className="w-4 h-4" />
                        {service?.label || type}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* About Section */}
            {(profile.short_description || profile.detailed_description) && (
              <div className="glass rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#E91E63]" />
                  Hakkımda
                </h3>
                {profile.short_description && (
                  <p className="text-white/80 text-lg leading-relaxed mb-4 italic">
                    "{profile.short_description}"
                  </p>
                )}
                {profile.detailed_description && (
                  <div className="text-white/60 leading-relaxed whitespace-pre-line">
                    {profile.detailed_description}
                  </div>
                )}
              </div>
            )}

            {/* Photo Gallery */}
            {images.length > 1 && (
              <div className="glass rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#E91E63]" />
                  Fotoğraf Galerisi
                  <span className="text-white/40 text-sm ml-2">({images.length} fotoğraf)</span>
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => openLightbox(idx)}
                      className="aspect-square rounded-xl overflow-hidden relative group"
                      data-testid={`gallery-image-${idx}`}
                    >
                      <img 
                        src={img.url} 
                        alt={`${profile.nickname} ${idx + 1}`} 
                        className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${img.isBlurred ? 'blur-lg' : ''}`}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {profile.languages?.length > 0 && (
              <div className="glass rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#E91E63]" />
                  Konuşulan Diller
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((lng) => (
                    <span key={lng} className="px-4 py-2 rounded-full bg-white/10 text-white/70">
                      {lng}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            {profile.hourly_rate && (
              <div className="glass rounded-xl p-6 text-center border border-[#E91E63]/20">
                <p className="text-white/50 text-sm mb-1">Saatlik Ücret</p>
                <p className="text-4xl font-bold text-[#E91E63]">${profile.hourly_rate}</p>
                <p className="text-white/40 text-xs mt-1">/ saat</p>
              </div>
            )}

            {/* Contact Card */}
            <div className="glass rounded-xl p-6 space-y-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#E91E63]" />
                İletişim
              </h3>
              
              <Button 
                className="btn-primary w-full py-6 text-lg"
                onClick={handleMessage}
                data-testid="message-btn"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Mesaj Gönder
              </Button>

              {profile.whatsapp && (
                <a 
                  href={`https://wa.me/${profile.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
                  data-testid="whatsapp-btn"
                >
                  <Phone className="w-5 h-5" />
                  WhatsApp
                </a>
              )}

              {profile.telegram && (
                <a 
                  href={`https://t.me/${profile.telegram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
                  data-testid="telegram-btn"
                >
                  <Send className="w-5 h-5" />
                  Telegram
                </a>
              )}

              <Button
                variant="outline"
                className="btn-outline w-full py-4"
                onClick={handleFavorite}
                data-testid="favorite-sidebar-btn"
              >
                <Heart className={`w-5 h-5 mr-2 ${isFavorited ? 'fill-[#E91E63] text-[#E91E63]' : ''}`} />
                {isFavorited ? 'Favorilerde' : 'Favorilere Ekle'}
              </Button>
            </div>

            {/* Stats Card */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#E91E63]" />
                İstatistikler
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/50">Görüntülenme</span>
                  <span className="text-white font-semibold">{profile.view_count || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/50">Favorilerde</span>
                  <span className="text-white font-semibold">{profile.favorite_count || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/50">Üyelik</span>
                  <span className="text-white font-semibold">
                    {new Date(profile.created_at).toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Report Link */}
            <button className="w-full text-center text-white/30 hover:text-white/50 text-sm flex items-center justify-center gap-2 py-2">
              <Flag className="w-4 h-4" />
              Bu profili şikayet et
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 glass-dark z-40 border-t border-white/5">
        <div className="flex gap-3">
          <Button 
            className="btn-primary flex-1 py-4"
            onClick={handleMessage}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Mesaj Gönder
          </Button>
          {profile.whatsapp && (
            <a 
              href={`https://wa.me/${profile.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-600 text-white"
            >
              <Phone className="w-5 h-5" />
            </a>
          )}
          <Button
            variant="outline"
            className={`btn-outline w-14 h-14 p-0 ${isFavorited ? 'border-[#E91E63] text-[#E91E63]' : ''}`}
            onClick={handleFavorite}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PartnerDetailPage;
