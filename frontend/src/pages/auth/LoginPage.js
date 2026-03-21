import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, useLanguage } from '../../context/AppContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';

const LoginPage = () => {
  const { login } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }
    
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success('Giriş başarılı!');
      
      // Redirect based on role
      const redirect = searchParams.get('redirect');
      if (redirect) {
        navigate(redirect);
      } else if (user.role === 'admin') {
        navigate(`/${lang}/admin`);
      } else if (user.role === 'partner') {
        navigate(`/${lang}/partner`);
      } else {
        navigate(`/${lang}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to={`/${lang}`} className="inline-flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E91E63] to-[#9C27B0] flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-white font-serif">KKTCX</span>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white font-serif">{t('login')}</h1>
            <p className="text-white/60 mt-2">Tekrar hoş geldiniz</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-white/70 text-sm mb-2 block font-medium">{t('email')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  className="input-glass pl-12 h-14 text-base"
                  data-testid="login-email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-white/70 text-sm font-medium">{t('password')}</label>
                <Link 
                  to={`/${lang}/sifremi-unuttum`}
                  className="text-[#E91E63] hover:text-[#FF6090] text-sm transition-colors"
                >
                  Şifremi Unuttum
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-glass pl-12 pr-12 h-14 text-base"
                  data-testid="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="btn-primary w-full h-14 text-lg mt-6"
              disabled={loading}
              data-testid="login-submit"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Giriş yapılıyor...
                </>
              ) : (
                <>
                  {t('login')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-white/40 text-sm">veya</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-white/60 mb-4">
              Hesabınız yok mu?
            </p>
            <Link to={`/${lang}/kayit`}>
              <Button variant="outline" className="btn-outline w-full h-14 text-base">
                Hesap Oluştur
              </Button>
            </Link>
          </div>

          {/* Demo Info - Mobile Only */}
          <div className="mt-8 glass rounded-xl p-4 lg:hidden">
            <p className="text-white/50 text-xs text-center mb-2">Demo Hesaplar</p>
            <div className="text-xs text-center text-white/60">
              admin@kktcx.com / admin123
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Visual (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#E91E63] via-[#9C27B0] to-[#673AB7]"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200')] bg-cover bg-center opacity-20"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-center">
          <div className="max-w-md">
            <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white font-serif mb-4">
              Premium Eşlik Platformu
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Kuzey ve Güney Kıbrıs'ın en güvenilir sosyal eşlik platformuna hoş geldiniz.
            </p>
            
            {/* Features */}
            <div className="space-y-4">
              {[
                'Doğrulanmış profiller',
                'Güvenli mesajlaşma',
                '%100 gizlilik',
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 text-white/90">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Demo Accounts */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl rounded-xl p-4 text-left">
            <p className="text-white/70 text-sm mb-2">Demo Hesaplar:</p>
            <p className="text-white text-sm font-mono">admin@kktcx.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
