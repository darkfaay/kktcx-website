import React, { useState, useEffect } from 'react';
import { useAuth, useLanguage } from '../../context/AppContext';
import { Settings, Save, MessageSquare, CreditCard, Globe } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { toast } from 'sonner';

const AdminSettings = () => {
  const { api } = useAuth();
  const { t } = useLanguage();
  
  const [settings, setSettings] = useState({
    netgsm: { enabled: false, usercode: '', password: '', msgheader: '' },
    stripe: { api_key: '', test_mode: true },
    site: { name: 'KKTCX', default_language: 'tr', languages: ['tr', 'en', 'ru', 'de'] }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin/settings');
      setSettings(prev => ({
        ...prev,
        ...response.data
      }));
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (key, value) => {
    setSaving(true);
    try {
      await api.put(`/admin/settings/${key}`, value);
      toast.success('Ayarlar kaydedildi');
    } catch (error) {
      toast.error('Kaydetme başarısız');
    } finally {
      setSaving(false);
    }
  };

  const handleNetgsmChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      netgsm: { ...prev.netgsm, [field]: value }
    }));
  };

  const handleStripeChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      stripe: { ...prev.stripe, [field]: value }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white font-serif">Sistem Ayarları</h1>
        <p className="text-white/60 mt-1">Platform yapılandırması</p>
      </div>

      <div className="space-y-6">
        {/* Netgsm SMS Settings */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Netgsm SMS Ayarları</h3>
              <p className="text-white/50 text-sm">SMS bildirim entegrasyonu</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">SMS Bildirimleri</p>
                <p className="text-white/50 text-sm">Mesaj bildirimlerini aktifleştir</p>
              </div>
              <Switch
                checked={settings.netgsm?.enabled || false}
                onCheckedChange={(v) => handleNetgsmChange('enabled', v)}
                data-testid="netgsm-enabled"
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Kullanıcı Kodu</label>
              <Input
                value={settings.netgsm?.usercode || ''}
                onChange={(e) => handleNetgsmChange('usercode', e.target.value)}
                placeholder="Netgsm kullanıcı kodu"
                className="input-glass"
                data-testid="netgsm-usercode"
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Şifre</label>
              <Input
                type="password"
                value={settings.netgsm?.password || ''}
                onChange={(e) => handleNetgsmChange('password', e.target.value)}
                placeholder="Netgsm şifresi"
                className="input-glass"
                data-testid="netgsm-password"
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Mesaj Başlığı (Header)</label>
              <Input
                value={settings.netgsm?.msgheader || ''}
                onChange={(e) => handleNetgsmChange('msgheader', e.target.value)}
                placeholder="SMS gönderici adı"
                className="input-glass"
                data-testid="netgsm-header"
              />
            </div>

            <Button
              onClick={() => saveSettings('netgsm', settings.netgsm)}
              className="btn-primary w-full"
              disabled={saving}
              data-testid="save-netgsm"
            >
              <Save className="w-4 h-4 mr-2" />
              Netgsm Ayarlarını Kaydet
            </Button>
          </div>
        </div>

        {/* Stripe Settings */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Stripe Ödeme Ayarları</h3>
              <p className="text-white/50 text-sm">Ödeme sistemi yapılandırması</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Test Modu</p>
                <p className="text-white/50 text-sm">Test anahtarlarını kullan</p>
              </div>
              <Switch
                checked={settings.stripe?.test_mode !== false}
                onCheckedChange={(v) => handleStripeChange('test_mode', v)}
                data-testid="stripe-test-mode"
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">API Anahtarı</label>
              <Input
                type="password"
                value={settings.stripe?.api_key || ''}
                onChange={(e) => handleStripeChange('api_key', e.target.value)}
                placeholder={settings.stripe?.test_mode ? "Test için boş bırakabilirsiniz" : "sk_live_..."}
                className="input-glass"
                data-testid="stripe-api-key"
              />
              <p className="text-white/40 text-xs mt-1">
                {settings.stripe?.test_mode 
                  ? "Test modunda varsayılan test anahtarı kullanılır"
                  : "Canlı mod için Stripe Dashboard'dan alın"}
              </p>
            </div>

            <Button
              onClick={() => saveSettings('stripe', settings.stripe)}
              className="btn-primary w-full"
              disabled={saving}
              data-testid="save-stripe"
            >
              <Save className="w-4 h-4 mr-2" />
              Stripe Ayarlarını Kaydet
            </Button>
          </div>
        </div>

        {/* Site Settings */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Site Ayarları</h3>
              <p className="text-white/50 text-sm">Genel platform ayarları</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-white/70 text-sm mb-2 block">Site Adı</label>
              <Input
                value={settings.site?.name || 'KKTCX'}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  site: { ...prev.site, name: e.target.value }
                }))}
                className="input-glass"
                data-testid="site-name"
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Varsayılan Dil</label>
              <div className="flex gap-2">
                {['tr', 'en', 'ru', 'de'].map((l) => (
                  <button
                    key={l}
                    onClick={() => setSettings(prev => ({
                      ...prev,
                      site: { ...prev.site, default_language: l }
                    }))}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      settings.site?.default_language === l
                        ? 'bg-[#D4AF37] text-black'
                        : 'bg-white/10 text-white/70'
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => saveSettings('site', settings.site)}
              className="btn-primary w-full"
              disabled={saving}
              data-testid="save-site"
            >
              <Save className="w-4 h-4 mr-2" />
              Site Ayarlarını Kaydet
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
