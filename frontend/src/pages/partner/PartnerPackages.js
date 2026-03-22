import React, { useState, useEffect } from 'react';
import { useAuth, useLanguage } from '../../context/AppContext';
import { Package, Check, Star, Sparkles, Crown } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const packageIcons = {
  standard: Package,
  featured: Star,
  city_vitrin: Sparkles,
  homepage_vitrin: Sparkles,
  premium: Crown
};

const PartnerPackages = () => {
  const { api } = useAuth();
  const { lang, t } = useLanguage();
  
  const [packages, setPackages] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [lang]);

  const fetchData = async () => {
    try {
      const [packagesRes, profileRes] = await Promise.all([
        axios.get(`${API_URL}/api/packages?lang=${lang}`),
        api.get('/partner/profile').catch(() => ({ data: null }))
      ]);
      setPackages(packagesRes.data);
      setProfile(profileRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageId) => {
    if (!profile) {
      toast.error('Önce profilinizi oluşturun');
      return;
    }

    if (profile.status !== 'approved') {
      toast.error('Paket satın almak için profilinizin onaylanması gerekiyor');
      return;
    }

    setPurchasing(true);
    try {
      const response = await api.post('/payments/checkout', null, {
        params: {
          package_id: packageId,
          origin_url: window.location.origin
        }
      });

      // Redirect to Stripe checkout
      window.location.href = response.data.url;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Bir hata oluştu');
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const currentPackage = profile?.package_type || 'standard';

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white font-serif">{t('packages')}</h1>
        <p className="text-white/60 mt-1">Görünürlüğünüzü artırın ve daha fazla müşteriye ulaşın</p>
      </div>

      {/* Current Package */}
      {profile && (
        <div className="glass rounded-xl p-6 mb-8 border border-[#D4AF37]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Mevcut Paketiniz</p>
              <p className="text-white font-semibold text-lg capitalize mt-1">
                {packages.find(p => p.package_type === currentPackage)?.name || 'Standart'}
              </p>
              {profile.package_expires_at && (
                <p className="text-white/40 text-sm mt-1">
                  Bitiş: {new Date(profile.package_expires_at).toLocaleDateString('tr-TR')}
                </p>
              )}
            </div>
            {profile.is_vitrin && (
              <span className="badge-gold">
                <Sparkles className="w-3 h-3" />
                Vitrin
              </span>
            )}
          </div>
        </div>
      )}

      {/* Packages Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.filter(pkg => pkg.price > 0).map((pkg) => {
          const IconComponent = packageIcons[pkg.package_type] || Package;
          const isCurrentPackage = pkg.package_type === currentPackage;
          const isPremium = pkg.package_type === 'premium';

          return (
            <div 
              key={pkg.id}
              className={`glass rounded-2xl p-6 relative overflow-hidden ${
                isPremium ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/50' : ''
              } ${isCurrentPackage ? 'border-emerald-500' : ''}`}
              data-testid={`package-${pkg.package_type}`}
            >
              {/* Popular Badge */}
              {isPremium && (
                <div className="absolute top-0 right-0 bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                  EN POPÜLER
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-6">
                <div className={`w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  isPremium ? 'gold-gradient' : 'bg-[#D4AF37]/20'
                }`}>
                  <IconComponent className={`w-7 h-7 ${isPremium ? 'text-black' : 'text-[#D4AF37]'}`} />
                </div>
                <h3 className="text-xl font-semibold text-white">{pkg.name}</h3>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-[#D4AF37]">${pkg.price}</span>
                  <span className="text-white/50 text-sm">/{pkg.duration_days} gün</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {pkg.package_type === 'featured' && (
                  <>
                    <Feature>Öne çıkan rozeti</Feature>
                    <Feature>Listeleme üst sıralarında</Feature>
                    <Feature>Artırılmış görünürlük</Feature>
                  </>
                )}
                {pkg.package_type === 'city_vitrin' && (
                  <>
                    <Feature>Vitrin rozeti</Feature>
                    <Feature>Şehir sayfasında vitrin alanı</Feature>
                    <Feature>Öne çıkan rozeti</Feature>
                    <Feature>Yüksek öncelikli sıralama</Feature>
                  </>
                )}
                {pkg.package_type === 'homepage_vitrin' && (
                  <>
                    <Feature>Vitrin rozeti</Feature>
                    <Feature>Ana sayfa vitrin alanı</Feature>
                    <Feature>Şehir sayfasında vitrin</Feature>
                    <Feature>Maksimum görünürlük</Feature>
                  </>
                )}
                {pkg.package_type === 'premium' && (
                  <>
                    <Feature>Premium rozeti</Feature>
                    <Feature>Ana sayfa vitrin alanı</Feature>
                    <Feature>Tüm şehir sayfalarında vitrin</Feature>
                    <Feature>Doğrulanmış profil rozeti</Feature>
                    <Feature>En yüksek öncelikli sıralama</Feature>
                    <Feature>7/24 öncelikli destek</Feature>
                  </>
                )}
              </div>

              {/* Action */}
              <Button
                variant="ghost"
                className={`w-full py-6 ${isPremium ? 'btn-primary animate-pulse-gold' : 'btn-outline'}`}
                onClick={() => handlePurchase(pkg.id)}
                disabled={purchasing || isCurrentPackage}
                data-testid={`buy-${pkg.package_type}`}
              >
                {isCurrentPackage ? (t('currentPackage') || 'Mevcut Paket') : (t('buyNow') || 'Satın Al')}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="mt-8 glass rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Bilgilendirme</h3>
        <ul className="space-y-2 text-white/60 text-sm">
          <li>• Ödemeler güvenli Stripe altyapısı üzerinden işlenir</li>
          <li>• Paketler satın alındıktan sonra anında aktif olur</li>
          <li>• Paket süresi satın alma tarihinden itibaren başlar</li>
          <li>• İade politikası için destek ile iletişime geçin</li>
        </ul>
      </div>
    </div>
  );
};

const Feature = ({ children }) => (
  <div className="flex items-center gap-2 text-white/70 text-sm">
    <Check className="w-4 h-4 text-emerald-400" />
    {children}
  </div>
);

export default PartnerPackages;
