import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage, useAuth } from '../context/AppContext';
import axios from 'axios';
import { 
  MapPin, Heart, Shield, Star, Sparkles, Clock, MessageCircle, 
  ChevronLeft, ChevronRight, Share2, Flag, Globe, Calendar,
  User, Briefcase, Utensils, Plane
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const categoryIcons = {
  'dinner-date': Utensils,
  'social-event': User,
  'business-event': Briefcase,
  'travel-companion': Plane,
  'culture-arts': Star,
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
    // Navigate to messages with this user
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const images = profile.images?.length > 0 
    ? profile.images.map(img => `${API_URL}/api/files/${img.path}`)
    : ['https://images.unsplash.com/photo-1590659163722-88a80a7ff913?w=800&h=1200&fit=crop'];

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      {/* Back Button - Mobile */}
      <div className="md:hidden fixed top-16 left-4 z-30">
        <Button 
          variant="ghost" 
          size="sm" 
          className="glass rounded-full w-10 h-10 p-0"
          onClick={() => navigate(-1)}
          data-testid="back-btn"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </Button>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="relative">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden relative">
              <img 
                src={images[currentImage]}
                alt={profile.nickname}
                className="w-full h-full object-cover"
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
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
                {profile.is_featured && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#D4AF37]/20 text-[#D4AF37]">
                    <Star className="w-3 h-3 inline mr-1" />
                    Öne Çıkan
                  </span>
                )}
              </div>

              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImage(i => i > 0 ? i - 1 : images.length - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    data-testid="prev-image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImage(i => i < images.length - 1 ? i + 1 : 0)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    data-testid="next-image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  
                  {/* Dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImage(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === currentImage ? 'bg-[#D4AF37] w-6' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Grid */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {images.slice(0, 4).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentImage ? 'border-[#D4AF37]' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white font-serif">
                    {profile.nickname}
                  </h1>
                  <p className="text-white/60 text-lg mt-1">{profile.age} yaşında</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/60 hover:text-white"
                    onClick={handleShare}
                    data-testid="share-btn"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 mt-4 text-white/70">
                <MapPin className="w-5 h-5 text-[#D4AF37]" />
                <span>{profile.city_name}</span>
                {profile.district_name && <span>/ {profile.district_name}</span>}
              </div>
            </div>

            {/* Availability */}
            <div className="flex flex-wrap gap-3">
              {profile.is_available_today && (
                <span className="px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Bugün Müsait
                </span>
              )}
              {profile.is_available_tonight && (
                <span className="px-4 py-2 rounded-full bg-purple-500/20 text-purple-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Bu Akşam Müsait
                </span>
              )}
            </div>

            {/* Languages */}
            {profile.languages?.length > 0 && (
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-[#D4AF37]" />
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((lng) => (
                    <span key={lng} className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-sm">
                      {lng}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {profile.categories?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.categories.map((cat) => {
                  const IconComponent = categoryIcons[cat.slug] || Star;
                  return (
                    <span 
                      key={cat.id} 
                      className="px-4 py-2 rounded-full glass text-white/80 flex items-center gap-2"
                    >
                      <IconComponent className="w-4 h-4 text-[#D4AF37]" />
                      {cat.name}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Short Description */}
            {profile.short_description && (
              <div className="glass rounded-xl p-6">
                <p className="text-white/80 leading-relaxed">{profile.short_description}</p>
              </div>
            )}

            {/* Detailed Description */}
            {profile.detailed_description && (
              <div>
                <h3 className="text-white font-semibold mb-3">Hakkında</h3>
                <div className="text-white/60 leading-relaxed whitespace-pre-line">
                  {profile.detailed_description}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button 
                className="btn-primary flex-1 py-6 text-lg"
                onClick={handleMessage}
                data-testid="message-btn"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                {t('sendMessage')}
              </Button>
              <Button
                variant="outline"
                className={`btn-outline py-6 ${isFavorited ? 'border-red-500 text-red-500' : ''}`}
                onClick={handleFavorite}
                data-testid="favorite-detail-btn"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* Stats */}
            <div className="glass rounded-xl p-4 flex justify-around text-center">
              <div>
                <p className="text-2xl font-bold text-[#D4AF37]">{profile.view_count || 0}</p>
                <p className="text-white/50 text-sm">Görüntülenme</p>
              </div>
              <div className="border-l border-white/10"></div>
              <div>
                <p className="text-2xl font-bold text-[#D4AF37]">
                  {new Date(profile.created_at).toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' })}
                </p>
                <p className="text-white/50 text-sm">Üyelik</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 glass-dark z-40">
        <div className="flex gap-3">
          <Button 
            className="btn-primary flex-1 py-4"
            onClick={handleMessage}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            {t('sendMessage')}
          </Button>
          <Button
            variant="outline"
            className={`btn-outline py-4 ${isFavorited ? 'border-red-500 text-red-500' : ''}`}
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
