import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, useLanguage } from '../../context/AppContext';
import { Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react';
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

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="glass rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white font-serif">
              {isPartnerRegistration ? 'Partner Kaydı' : t('register')}
            </h1>
            <p className="text-white/60 mt-2">
              {isPartnerRegistration 
                ? 'Partner olarak kayıt olun ve ilan verin'
                : 'Yeni hesap oluşturun'}
            </p>
          </div>

          {/* Role Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, role: 'user' }))}
              className={`flex-1 py-3 rounded-lg transition-all ${
                formData.role === 'user' 
                  ? 'bg-[#D4AF37] text-black' 
                  : 'bg-white/10 text-white/60'
              }`}
              data-testid="role-user"
            >
              Kullanıcı
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, role: 'partner' }))}
              className={`flex-1 py-3 rounded-lg transition-all ${
                formData.role === 'partner' 
                  ? 'bg-[#D4AF37] text-black' 
                  : 'bg-white/10 text-white/60'
              }`}
              data-testid="role-partner"
            >
              Partner
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-white/70 text-sm mb-2 block">{t('name')}</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Adınız Soyadınız"
                  className="input-glass pl-12"
                  data-testid="register-name"
                />
              </div>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">{t('email')} *</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ornek@email.com"
                  className="input-glass pl-12"
                  required
                  data-testid="register-email"
                />
              </div>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">{t('phone')}</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+90 5XX XXX XX XX"
                  className="input-glass pl-12"
                  data-testid="register-phone"
                />
              </div>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">{t('password')} *</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-glass pl-12 pr-12"
                  required
                  data-testid="register-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">{t('confirmPassword')} *</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-glass pl-12"
                  required
                  data-testid="register-confirm-password"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="btn-primary w-full py-6 text-lg"
              disabled={loading}
              data-testid="register-submit"
            >
              {loading ? 'Kayıt yapılıyor...' : t('register')}
            </Button>
          </form>

          {/* Terms */}
          <p className="text-white/40 text-xs text-center mt-4">
            Kayıt olarak{' '}
            <Link to={`/${lang}/kullanim-sartlari`} className="text-[#D4AF37]">
              Kullanım Şartları
            </Link>
            {' '}ve{' '}
            <Link to={`/${lang}/gizlilik`} className="text-[#D4AF37]">
              Gizlilik Politikası
            </Link>
            'nı kabul etmiş olursunuz.
          </p>

          {/* Login Link */}
          <p className="text-white/60 text-center mt-6">
            Zaten hesabınız var mı?{' '}
            <Link to={`/${lang}/giris`} className="text-[#D4AF37] hover:underline">
              {t('login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
