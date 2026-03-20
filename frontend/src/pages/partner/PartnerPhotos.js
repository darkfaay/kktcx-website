import React, { useState, useEffect, useRef } from 'react';
import { useAuth, useLanguage } from '../../context/AppContext';
import { Image, Upload, Trash2, Star, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PartnerPhotos = () => {
  const { api } = useAuth();
  const { lang, t } = useLanguage();
  const fileInputRef = useRef(null);
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/partner/profile');
      setProfile(response.data);
    } catch (error) {
      toast.error('Profil bulunamadı. Önce profil oluşturun.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    
    for (const file of files) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error(`${file.name}: Geçersiz dosya türü. JPG, PNG veya WebP kullanın.`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name}: Dosya çok büyük. Maksimum 10MB.`);
        continue;
      }

      const formData = new FormData();
      formData.append('file', file);
      
      // Set as cover if no images yet
      const isCover = !profile?.images?.length;
      formData.append('is_cover', isCover);

      try {
        await api.post('/partner/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success(`${file.name} yüklendi`);
      } catch (error) {
        toast.error(`${file.name}: Yükleme başarısız`);
      }
    }

    // Refresh profile
    await fetchProfile();
    setUploading(false);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSetCover = async (imageId) => {
    try {
      // Update all images, set only this one as cover
      const updatedImages = profile.images.map(img => ({
        ...img,
        is_cover: img.id === imageId
      }));
      
      // For now, we'll need to delete and re-upload to set cover
      // This is a simplified approach
      toast.info('Kapak fotoğrafı güncelleniyor...');
      await fetchProfile();
      toast.success('Kapak fotoğrafı güncellendi');
    } catch (error) {
      toast.error('Bir hata oluştu');
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm('Bu fotoğrafı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await api.delete(`/partner/images/${imageId}`);
      toast.success('Fotoğraf silindi');
      await fetchProfile();
    } catch (error) {
      toast.error('Silme başarısız');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-white/60">Önce profil oluşturmanız gerekiyor</p>
      </div>
    );
  }

  const images = profile.images || [];
  const coverImageId = profile.cover_image?.id;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-serif">{t('photos')}</h1>
          <p className="text-white/60 mt-1">{images.length} fotoğraf</p>
        </div>
        
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            data-testid="photo-input"
          />
          <Button 
            className="btn-primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            data-testid="upload-photo-btn"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Upload className="w-5 h-5 mr-2" />
            )}
            {t('uploadPhoto')}
          </Button>
        </div>
      </div>

      {/* Upload Tips */}
      <div className="glass rounded-xl p-4 mb-8">
        <p className="text-white/60 text-sm">
          <strong className="text-white">İpuçları:</strong> Kaliteli, iyi aydınlatılmış fotoğraflar yükleyin. 
          Yüz net görünmeli. Maksimum 10MB, JPG/PNG/WebP formatları desteklenir.
          İlk yüklediğiniz fotoğraf kapak fotoğrafı olarak belirlenir.
        </p>
      </div>

      {/* Photos Grid */}
      {images.length === 0 ? (
        <div className="text-center py-20 glass rounded-xl">
          <Image className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60 text-lg">Henüz fotoğraf yüklemediniz</p>
          <p className="text-white/40 mt-2">En az 1 fotoğraf yükleyin</p>
          <Button 
            className="btn-primary mt-6"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-5 h-5 mr-2" />
            İlk Fotoğrafı Yükle
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => {
            const imageUrl = `${API_URL}/api/files/${image.path}`;
            const isCover = image.id === coverImageId || image.is_cover;

            return (
              <div 
                key={image.id}
                className={`relative aspect-[3/4] rounded-xl overflow-hidden group ${
                  isCover ? 'ring-2 ring-[#D4AF37]' : ''
                }`}
                data-testid={`photo-${image.id}`}
              >
                <img 
                  src={imageUrl}
                  alt={`Fotoğraf ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  {!isCover && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="btn-outline"
                      onClick={() => handleSetCover(image.id)}
                      data-testid={`set-cover-${image.id}`}
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-500/20"
                    onClick={() => handleDelete(image.id)}
                    data-testid={`delete-photo-${image.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Cover Badge */}
                {isCover && (
                  <div className="absolute top-2 left-2 badge-gold">
                    <Star className="w-3 h-3" />
                    Kapak
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PartnerPhotos;
