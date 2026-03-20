import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, useLanguage } from '../../context/AppContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
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
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="glass rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white font-serif">{t('login')}</h1>
            <p className="text-white/60 mt-2">Hesabınıza giriş yapın</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-white/70 text-sm mb-2 block">{t('email')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  className="input-glass pl-12"
                  data-testid="login-email"
                />
              </div>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">{t('password')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-glass pl-12 pr-12"
                  data-testid="login-password"
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

            <Button 
              type="submit" 
              className="btn-primary w-full py-6 text-lg"
              disabled={loading}
              data-testid="login-submit"
            >
              {loading ? 'Giriş yapılıyor...' : t('login')}
            </Button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-4">
            <Link 
              to={`/${lang}/sifremi-unuttum`}
              className="text-[#D4AF37] hover:underline text-sm"
            >
              Şifremi Unuttum
            </Link>
            <p className="text-white/60">
              Hesabınız yok mu?{' '}
              <Link to={`/${lang}/kayit`} className="text-[#D4AF37] hover:underline">
                {t('register')}
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Accounts */}
        <div className="mt-6 glass rounded-xl p-4">
          <p className="text-white/50 text-sm text-center mb-3">Demo Hesaplar</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-white/60">
              <span>Admin:</span>
              <span>admin@kktcx.com / admin123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
