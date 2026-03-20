import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useLanguage } from '../../context/AppContext';
import { Heart, MapPin, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const FavoritesPage = () => {
  const { api } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await api.get(`/favorites?lang=${lang}`);
      setFavorites(response.data);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (profileId) => {
    try {
      await api.delete(`/favorites/${profileId}`);
      setFavorites(prev => prev.filter(f => f.id !== profileId));
      toast.success('Favorilerden çıkarıldı');
    } catch (error) {
      toast.error('Bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-serif">{t('favorites')}</h1>
          <p className="text-white/60 mt-1">{favorites.length} favori</p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60 text-lg">Henüz favori eklemediniz</p>
          <Button 
            className="btn-primary mt-6"
            onClick={() => navigate(`/${lang}/partnerler`)}
          >
            Partnerleri Keşfet
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {favorites.map((profile) => {
            const coverImage = profile.cover_image?.path 
              ? `${API_URL}/api/files/${profile.cover_image.path}`
              : 'https://images.unsplash.com/photo-1590659163722-88a80a7ff913?w=400&h=600&fit=crop';

            return (
              <div 
                key={profile.id}
                className="profile-card cursor-pointer group"
                data-testid={`favorite-card-${profile.id}`}
              >
                <div 
                  className="aspect-[3/4] relative overflow-hidden"
                  onClick={() => navigate(`/${lang}/partner/${profile.slug}`)}
                >
                  <img 
                    src={coverImage}
                    alt={profile.nickname}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="img-overlay absolute inset-0" />

                  {/* Remove Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFavorite(profile.id); }}
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    data-testid={`remove-favorite-${profile.id}`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold">{profile.nickname}, {profile.age}</h3>
                    <p className="text-white/70 text-sm flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      {profile.city_name}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
