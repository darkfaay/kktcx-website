import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, useLanguage } from '../../context/AppContext';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, Sparkles, Check, Users } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';

const RegisterPage = () => {
  const { register } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const isPartnerRegistration = searchParams.get('role') === 'partner';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: isPartnerRegistration ? 'partner' : 'user',
    language: lang
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Şifreler eşleşmiyor');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalı');
      return;
    }
    
    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      const user = await register(registerData);
      toast.success('Kayıt başarılı!');
      
      if (user.role === 'partner') {
        navigate(`/${lang}/partner/profil`);
      } else {
        navigate(`/${lang}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  const partnerBenefits = [
    'Binlerce potansiyel müşteriye ulaşın',
    'Premium vitrin alanlarında görünün',
    'Güvenli ödeme sistemi',
    'Doğrulanmış profil rozeti'
  ];

  const userBenefits = [
    'Doğrulanmış profillere erişim',
    'Güvenli mesajlaşma',
    'Favori listesi oluşturma',
    '%100 gizlilik garantisi'
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Visual (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#9C27B0] via-[#E91E63] to-[#FF5722]"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200')] bg-cover bg-center opacity-20"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-center">
          <div className="max-w-md">
            <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center">
              {formData.role === 'partner' ? (
                <Sparkles className="w-10 h-10 text-white" />
              ) : (
                <Users className="w-10 h-10 text-white" />
              )}
            </div>
            <h2 className="text-3xl font-bold text-white font-serif mb-4">
              {formData.role === 'partner' ? 'Partner Olmanın Avantajları' : 'Üye Olmanın Avantajları'}
            </h2>
            <p className="text-white/80 text-lg mb-8">
              {formData.role === 'partner' 
                ? 'Premium platform üzerinde profilinizi oluşturun ve müşterilere ulaşın.'
                : 'Güvenli ve gizli bir ortamda premium partnerlere erişin.'}
            </p>
            
            {/* Benefits */}
            <div className="space-y-4 text-left">
              {(formData.role === 'partner' ? partnerBenefits : userBenefits).map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3 text-white/90">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-6">
            <Link to={`/${lang}`} className="inline-flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E91E63] to-[#9C27B0] flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-white font-serif">KKTCX</span>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white font-serif">
              {formData.role === 'partner' ? 'Partner Kaydı' : t('register')}
            </h1>
            <p className="text-white/60 mt-2">
              {formData.role === 'partner' 
                ? 'Profilinizi oluşturun, ilan verin'
                : 'Ücretsiz hesap oluşturun'}
            </p>
          </div>

          {/* Role Toggle */}
          <div className="flex gap-2 mb-6 p-1 glass rounded-xl">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, role: 'user' }))}
              className={`flex-1 py-3 rounded-lg transition-all text-sm font-medium flex items-center justify-center gap-2 ${
                formData.role === 'user' 
                  ? 'bg-gradient-to-r from-[#E91E63] to-[#9C27B0] text-white' 
                  : 'bg-transparent text-white/60 hover:text-white'
              }`}
              data-testid="role-user"
            >
              <Users className="w-4 h-4" />
              Kullanıcı
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, role: 'partner' }))}
              className={`flex-1 py-3 rounded-lg transition-all text-sm font-medium flex items-center justify-center gap-2 ${
                formData.role === 'partner' 
                  ? 'bg-gradient-to-r from-[#E91E63] to-[#9C27B0] text-white' 
                  : 'bg-transparent text-white/60 hover:text-white'
              }`}
              data-testid="role-partner"
            >
              <Sparkles className="w-4 h-4" />
              Partner
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-white/70 text-sm mb-2 block font-medium">{t('name')}</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Adınız Soyadınız"
                  className="input-glass pl-12 h-12"
                  data-testid="register-name"
                />
              </div>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block font-medium">{t('email')} *</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ornek@email.com"
                  className="input-glass pl-12 h-12"
                  required
                  data-testid="register-email"
                />
              </div>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block font-medium">{t('phone')}</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+90 5XX XXX XX XX"
                  className="input-glass pl-12 h-12"
                  data-testid="register-phone"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block font-medium">{t('password')} *</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="input-glass pl-12 pr-10 h-12"
                    required
                    data-testid="register-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-white/70 text-sm mb-2 block font-medium">Tekrar *</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="input-glass pl-12 h-12"
                    required
                    data-testid="register-confirm-password"
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="btn-primary w-full h-14 text-lg mt-2"
              disabled={loading}
              data-testid="register-submit"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Kayıt yapılıyor...
                </>
              ) : (
                <>
                  {t('register')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Terms */}
          <p className="text-white/40 text-xs text-center mt-4 leading-relaxed">
            Kayıt olarak{' '}
            <Link to={`/${lang}/kullanim-sartlari`} className="text-[#E91E63] hover:underline">
              Kullanım Şartları
            </Link>
            {' '}ve{' '}
            <Link to={`/${lang}/gizlilik`} className="text-[#E91E63] hover:underline">
              Gizlilik Politikası
            </Link>
            'nı kabul etmiş olursunuz.
          </p>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-white/40 text-sm">veya</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-white/60 mb-3">
              Zaten hesabınız var mı?
            </p>
            <Link to={`/${lang}/giris`}>
              <Button variant="outline" className="btn-outline w-full h-12">
                Giriş Yap
              </Button>
            </Link>
          </div>

          {/* Mobile Benefits */}
          <div className="mt-8 glass rounded-xl p-4 lg:hidden">
            <p className="text-white/70 text-sm font-medium mb-3">
              {formData.role === 'partner' ? 'Partner Avantajları' : 'Üye Avantajları'}
            </p>
            <div className="space-y-2">
              {(formData.role === 'partner' ? partnerBenefits : userBenefits).slice(0, 2).map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-2 text-white/60 text-sm">
                  <Check className="w-4 h-4 text-[#E91E63] shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
