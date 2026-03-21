import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth, useLanguage } from '../../context/AppContext';
import { 
  Image, Upload, Trash2, Star, Loader2, Eye, EyeOff, 
  Camera, Sparkles, Shield, Info, CheckCircle2, ImagePlus,
  Maximize2, X, ChevronLeft, ChevronRight, User
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PartnerPhotos = () => {
  const { api } = useAuth();
  const { t } = useLanguage();
  const fileInputRef = useRef(null);
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingId, setProcessingId] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [dragActive, setDragActive] = useState(false);

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

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFiles = async (files) => {
    if (files.length === 0) return;

    const maxFiles = 10 - (profile?.images?.length || 0);
    if (files.length > maxFiles) {
      toast.error(`En fazla ${maxFiles} fotoğraf daha yükleyebilirsiniz.`);
      files = files.slice(0, maxFiles);
    }

    setUploading(true);
    setUploadProgress(0);
    
    let uploaded = 0;
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
      
      const isCover = !profile?.images?.length && uploaded === 0;
      formData.append('is_cover', isCover);
      formData.append('is_blurred', false);

      try {
        await api.post('/partner/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploaded++;
        setUploadProgress(Math.round((uploaded / files.length) * 100));
        toast.success(`${file.name} yüklendi`);
      } catch (error) {
        toast.error(`${file.name}: Yükleme başarısız`);
      }
    }

    await fetchProfile();
    setUploading(false);
    setUploadProgress(0);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSetCover = async (imageId) => {
    setProcessingId(imageId);
    try {
      await api.put(`/partner/images/${imageId}/cover`);
      toast.success('Kapak fotoğrafı güncellendi');
      await fetchProfile();
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSetProfile = async (imageId) => {
    setProcessingId(imageId);
    try {
      await api.put(`/partner/images/${imageId}/cover`);
      toast.success('Profil fotoğrafı güncellendi');
      await fetchProfile();
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleBlur = async (imageId, currentBlurState) => {
    setProcessingId(imageId);
    try {
      await api.put(`/partner/images/${imageId}/blur?is_blurred=${!currentBlurState}`);
      toast.success(currentBlurState ? 'Bulanıklık kaldırıldı' : 'Fotoğraf bulanıklaştırıldı');
      await fetchProfile();
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm('Bu fotoğrafı silmek istediğinizden emin misiniz?')) {
      return;
    }

    setProcessingId(imageId);
    try {
      await api.delete(`/partner/images/${imageId}`);
      toast.success('Fotoğraf silindi');
      await fetchProfile();
    } catch (error) {
      toast.error('Silme başarısız');
    } finally {
      setProcessingId(null);
    }
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const navigateLightbox = (direction) => {
    const images = profile?.images || [];
    if (direction === 'prev') {
      setLightboxIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    } else {
      setLightboxIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin"></div>
          <Camera className="w-6 h-6 text-[#D4AF37] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-white/60">Yükleniyor...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20 glass-gold rounded-2xl">
        <User className="w-16 h-16 text-[#D4AF37]/40 mx-auto mb-4" />
        <p className="text-white/60 text-lg">Önce profil oluşturmanız gerekiyor</p>
        <p className="text-white/40 text-sm mt-2">Profil sayfasından başlayın</p>
      </div>
    );
  }

  const images = profile.images || [];
  const coverImage = profile.cover_image;

  return (
    <div className="space-y-8" data-testid="partner-photos-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-serif flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#997B19] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
              <Camera className="w-6 h-6 text-black" />
            </div>
            Fotoğraf Galerisi
          </h1>
          <p className="text-white/50 mt-2 ml-15">
            {images.length}/10 fotoğraf yüklendi
          </p>
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
            className="btn-primary px-6 py-3"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || images.length >= 10}
            data-testid="upload-photo-btn"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Yükleniyor... {uploadProgress}%
              </>
            ) : (
              <>
                <ImagePlus className="w-5 h-5 mr-2" />
                Fotoğraf Ekle
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-gold rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-[#D4AF37] font-serif">{images.length}</div>
          <div className="text-white/50 text-sm">Toplam Fotoğraf</div>
        </div>
        <div className="glass-gold rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400 font-serif">{images.filter(i => !i.is_blurred).length}</div>
          <div className="text-white/50 text-sm">Görünür</div>
        </div>
        <div className="glass-gold rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-[#E91E63] font-serif">{images.filter(i => i.is_blurred).length}</div>
          <div className="text-white/50 text-sm">Bulanık</div>
        </div>
        <div className="glass-gold rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white font-serif">{10 - images.length}</div>
          <div className="text-white/50 text-sm">Kalan Slot</div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-5 border border-[#D4AF37]/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h4 className="text-white font-semibold">Kaliteli Fotoğraflar</h4>
              <p className="text-white/50 text-sm mt-1">
                Yüksek çözünürlüklü, iyi aydınlatılmış ve net fotoğraflar daha fazla ilgi çeker.
                Maksimum 10MB, JPG/PNG/WebP formatları.
              </p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-5 border border-[#E91E63]/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E91E63]/20 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-[#E91E63]" />
            </div>
            <div>
              <h4 className="text-white font-semibold">Gizlilik Koruması</h4>
              <p className="text-white/50 text-sm mt-1">
                Bulanıklaştırma özelliği ile bazı fotoğraflarınızı gizleyebilirsiniz.
                Sadece iletişime geçenler görebilir.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Area / Drop Zone */}
      {images.length < 10 && (
        <div
          className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
            dragActive 
              ? 'border-[#D4AF37] bg-[#D4AF37]/10' 
              : 'border-white/20 hover:border-[#D4AF37]/50 hover:bg-white/5'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          data-testid="drop-zone"
        >
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 transition-all ${
              dragActive ? 'bg-[#D4AF37] scale-110' : 'bg-white/10'
            }`}>
              <Upload className={`w-10 h-10 ${dragActive ? 'text-black' : 'text-white/40'}`} />
            </div>
            <h3 className="text-white text-lg font-semibold mb-2">
              {dragActive ? 'Bırakın!' : 'Fotoğrafları Sürükleyip Bırakın'}
            </h3>
            <p className="text-white/50 text-sm mb-4">
              veya bilgisayarınızdan seçin
            </p>
            <Button 
              variant="outline" 
              className="btn-outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Camera className="w-4 h-4 mr-2" />
              Dosya Seç
            </Button>
          </div>
        </div>
      )}

      {/* Photos Grid */}
      {images.length === 0 ? (
        <div className="text-center py-16 glass-gold rounded-2xl border border-[#D4AF37]/20">
          <Image className="w-20 h-20 text-[#D4AF37]/30 mx-auto mb-4" />
          <h3 className="text-white text-xl font-semibold mb-2">Henüz Fotoğraf Yok</h3>
          <p className="text-white/50 mb-6">Profilinizi çekici hale getirmek için fotoğraf ekleyin</p>
          <Button 
            className="btn-primary"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="w-5 h-5 mr-2" />
            İlk Fotoğrafı Yükle
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {images.map((image, index) => {
            const imageUrl = image.url || `${API_URL}/api/files/${image.path}`;
            // Determine if this is THE cover image - use cover_image.id if set, otherwise first image is default cover
            const isCover = coverImage?.id 
              ? image.id === coverImage.id 
              : index === 0;
            const isBlurred = image.is_blurred;
            const isProcessing = processingId === image.id;

            return (
              <div 
                key={image.id || `photo-${index}`}
                className={`group relative aspect-[3/4] rounded-xl overflow-hidden transition-all duration-300 ${
                  isCover 
                    ? 'ring-2 ring-[#D4AF37] shadow-lg shadow-[#D4AF37]/20' 
                    : 'hover:ring-2 hover:ring-white/30'
                } ${isBlurred ? 'ring-2 ring-[#E91E63]/50' : ''}`}
                data-testid={`photo-${image.id || index}`}
              >
                {/* Image */}
                <img 
                  src={imageUrl}
                  alt={`Fotoğraf ${index + 1}`}
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    isBlurred ? 'blur-xl scale-110' : 'group-hover:scale-105'
                  }`}
                  onClick={() => !isBlurred && openLightbox(index)}
                />
                
                {/* Blur Overlay */}
                {isBlurred && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="bg-black/60 backdrop-blur-sm rounded-full p-4">
                      <EyeOff className="w-8 h-8 text-[#E91E63]" />
                    </div>
                  </div>
                )}

                {/* Processing Overlay */}
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
                    <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
                  </div>
                )}
                
                {/* Hover Actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3">
                  {/* Top Actions */}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={() => openLightbox(index)}
                      className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                      title="Büyüt"
                    >
                      <Maximize2 className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  {/* Bottom Actions */}
                  <div className="space-y-2">
                    {/* Blur Toggle */}
                    <div className="flex items-center justify-between bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        {isBlurred ? (
                          <EyeOff className="w-4 h-4 text-[#E91E63]" />
                        ) : (
                          <Eye className="w-4 h-4 text-green-400" />
                        )}
                        <span className="text-white text-xs">{isBlurred ? 'Gizli' : 'Görünür'}</span>
                      </div>
                      <Switch
                        checked={isBlurred}
                        onCheckedChange={() => handleToggleBlur(image.id, isBlurred)}
                        disabled={isProcessing}
                        data-testid={`blur-toggle-${image.id}`}
                        className="scale-75"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {!isCover && (
                        <Button
                          size="sm"
                          className="flex-1 h-8 text-xs bg-[#D4AF37] hover:bg-[#F3E5AB] text-black"
                          onClick={() => handleSetProfile(image.id)}
                          disabled={isProcessing}
                          data-testid={`set-cover-${image.id}`}
                        >
                          <Star className="w-3 h-3 mr-1" />
                          Profil Yap
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs border-red-500/50 text-red-400 hover:bg-red-500/20 hover:border-red-500"
                        onClick={() => handleDelete(image.id)}
                        disabled={isProcessing}
                        data-testid={`delete-photo-${image.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-2">
                  {isCover && (
                    <div className="badge-vip text-[10px] py-0.5">
                      <Star className="w-3 h-3" />
                      Profil
                    </div>
                  )}
                  {isBlurred && !isCover && (
                    <div className="px-2 py-1 rounded-full bg-[#E91E63]/80 text-white text-[10px] flex items-center gap-1">
                      <EyeOff className="w-3 h-3" />
                      Gizli
                    </div>
                  )}
                </div>

                {/* Order Number */}
                <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white/60 text-xs bg-black/50 px-2 py-1 rounded">
                    #{index + 1}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Note */}
      {images.length > 0 && (
        <div className="glass rounded-xl p-4 border border-white/10">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
            <div className="text-white/60 text-sm">
              <p>
                <strong className="text-white">İpucu:</strong> Profil fotoğrafı olarak seçtiğiniz görsel, 
                listeleme sayfalarında ve arama sonuçlarında görünecektir. Yüzünüzün net göründüğü 
                bir fotoğraf seçmenizi öneririz.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close Button */}
          <button 
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button 
                className="absolute left-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
                onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }}
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button 
                className="absolute right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
                onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }}
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          {/* Image */}
          <div 
            className="max-w-4xl max-h-[85vh] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[lightboxIndex]?.url || `${API_URL}/api/files/${images[lightboxIndex]?.path}`}
              alt={`Fotoğraf ${lightboxIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            
            {/* Counter */}
            <div className="text-center mt-4 text-white/60">
              {lightboxIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerPhotos;
