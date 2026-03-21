import React, { useState, useEffect, useRef } from 'react';
import { useAuth, useLanguage } from '../../context/AppContext';
import { Image, Upload, Trash2, Star, Loader2, Eye, EyeOff, GripVertical } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PartnerPhotos = () => {
  const { api } = useAuth();
  const { lang, t } = useLanguage();
  const fileInputRef = useRef(null);
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [blurringId, setBlurringId] = useState(null);

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
      formData.append('is_blurred', false);

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
      await api.put(`/partner/images/${imageId}/cover`);
      toast.success('Kapak fotoğrafı güncellendi');
      await fetchProfile();
    } catch (error) {
      toast.error('Bir hata oluştu');
    }
  };

  const handleToggleBlur = async (imageId, currentBlurState) => {
    setBlurringId(imageId);
    try {
      await api.put(`/partner/images/${imageId}/blur?is_blurred=${!currentBlurState}`);
      toast.success(currentBlurState ? 'Bulanıklık kaldırıldı' : 'Fotoğraf bulanıklaştırıldı');
      await fetchProfile();
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setBlurringId(null);
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
        <div className="animate-spin w-8 h-8 border-2 border-[#E91E63] border-t-transparent rounded-full"></div>
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

      {/* Blur Feature Info */}
      <div className="glass rounded-xl p-4 mb-8 border border-[#E91E63]/30">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#E91E63]/20 flex items-center justify-center shrink-0">
            <EyeOff className="w-5 h-5 text-[#E91E63]" />
          </div>
          <div>
            <h4 className="text-white font-semibold">Fotoğraf Bulanıklaştırma</h4>
            <p className="text-white/60 text-sm mt-1">
              İstediğiniz fotoğrafları bulanıklaştırabilirsiniz. Bulanık fotoğraflar, 
              yalnızca size mesaj atan kullanıcılara veya premium üyelere tam olarak gösterilebilir.
              Gizliliğinizi koruyun!
            </p>
          </div>
        </div>
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
            const isBlurred = image.is_blurred;
            const isBlurring = blurringId === image.id;

            return (
              <div 
                key={image.id}
                className={`relative aspect-[3/4] rounded-xl overflow-hidden group ${
                  isCover ? 'ring-2 ring-[#FFD700]' : ''
                } ${isBlurred ? 'ring-2 ring-[#E91E63]/50' : ''}`}
                data-testid={`photo-${image.id}`}
              >
                <img 
                  src={imageUrl}
                  alt={`Fotoğraf ${index + 1}`}
                  className={`w-full h-full object-cover transition-all duration-300 ${isBlurred ? 'blur-lg' : ''}`}
                />
                
                {/* Blur Overlay Icon */}
                {isBlurred && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/50 rounded-full p-3">
                      <EyeOff className="w-8 h-8 text-white/70" />
                    </div>
                  </div>
                )}
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                  {/* Blur Toggle */}
                  <div className="flex items-center gap-2 bg-black/50 rounded-lg px-3 py-2">
                    <Label htmlFor={`blur-${image.id}`} className="text-white text-sm cursor-pointer">
                      {isBlurred ? 'Bulanık' : 'Net'}
                    </Label>
                    <Switch
                      id={`blur-${image.id}`}
                      checked={isBlurred}
                      onCheckedChange={() => handleToggleBlur(image.id, isBlurred)}
                      disabled={isBlurring}
                      data-testid={`blur-toggle-${image.id}`}
                    />
                    {isBlurring && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {!isCover && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="btn-outline"
                        onClick={() => handleSetCover(image.id)}
                        data-testid={`set-cover-${image.id}`}
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Kapak Yap
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
                </div>

                {/* Cover Badge */}
                {isCover && (
                  <div className="absolute top-2 left-2 badge-vip">
                    <Star className="w-3 h-3" />
                    Kapak
                  </div>
                )}

                {/* Blur Badge */}
                {isBlurred && (
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-[#E91E63]/80 text-white text-xs flex items-center gap-1">
                    <EyeOff className="w-3 h-3" />
                    Gizli
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Blur Stats */}
      {images.length > 0 && (
        <div className="mt-8 glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-400" />
                <span className="text-white/70">{images.filter(i => !i.is_blurred).length} net fotoğraf</span>
              </div>
              <div className="flex items-center gap-2">
                <EyeOff className="w-5 h-5 text-[#E91E63]" />
                <span className="text-white/70">{images.filter(i => i.is_blurred).length} bulanık fotoğraf</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerPhotos;
