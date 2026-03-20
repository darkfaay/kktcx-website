import React, { useState } from 'react';
import { useAuth, useLanguage } from '../../context/AppContext';
import { User, Mail, Phone, Globe, Save } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { toast } from 'sonner';

const UserSettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const { lang, t, changeLang, languages } = useLanguage();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    language: user?.language || lang
  });
  const [loading, setLoading] = useState(false);

  const languageNames = {
    tr: 'Türkçe',
    en: 'English',
    ru: 'Русский',
    de: 'Deutsch'
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      if (formData.language !== lang) {
        changeLang(formData.language);
      }
      toast.success('Ayarlar kaydedildi');
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl md:text-3xl font-bold text-white font-serif mb-8">{t('settings')}</h1>

      <div className="glass rounded-2xl p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email (Read-only) */}
          <div>
            <label className="text-white/70 text-sm mb-2 block">{t('email')}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                value={user?.email || ''}
                disabled
                className="input-glass pl-12 opacity-50"
              />
            </div>
            <p className="text-white/40 text-xs mt-1">E-posta değiştirilemez</p>
          </div>

          {/* Name */}
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
                data-testid="settings-name"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="text-white/70 text-sm mb-2 block">{t('phone')}</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+90 5XX XXX XX XX"
                className="input-glass pl-12"
                data-testid="settings-phone"
              />
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="text-white/70 text-sm mb-2 block">{t('language')}</label>
            <Select 
              value={formData.language} 
              onValueChange={(v) => setFormData(prev => ({ ...prev, language: v }))}
            >
              <SelectTrigger className="input-glass" data-testid="settings-language">
                <Globe className="w-5 h-5 text-white/40 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0F0F10] border-white/10">
                {languages.map((l) => (
                  <SelectItem key={l} value={l}>{languageNames[l]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            className="btn-primary w-full py-6"
            disabled={loading}
            data-testid="save-settings"
          >
            <Save className="w-5 h-5 mr-2" />
            {loading ? 'Kaydediliyor...' : t('save')}
          </Button>
        </form>
      </div>

      {/* Account Info */}
      <div className="glass rounded-xl p-6 mt-6">
        <h3 className="text-white font-semibold mb-4">Hesap Bilgileri</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-white/60">
            <span>Hesap Türü:</span>
            <span className="capitalize">{user?.role}</span>
          </div>
          <div className="flex justify-between text-white/60">
            <span>Kayıt Tarihi:</span>
            <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR') : '-'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsPage;
