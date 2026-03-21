import React, { useState, useEffect } from 'react';
import { useAuth, useLanguage } from '../../context/AppContext';
import { 
  Settings, Save, Globe, Palette, Type, Image, Bell, Shield,
  Mail, Phone, MapPin, Facebook, Instagram, Twitter, Send,
  Eye, Upload, Trash2, Check
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { Textarea } from '../../components/ui/textarea';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { toast } from 'sonner';

const AdminSiteSettings = () => {
  const { api } = useAuth();
  const { lang } = useLanguage();
  
  const [settings, setSettings] = useState({
    general: {
      site_name: 'KKTCX',
      site_tagline: "Kıbrıs'ın Premium Eşlik Platformu",
      site_description: 'Kuzey Kıbrıs\'ın en güvenilir sosyal eşlik platformu.',
      contact_email: 'info@kktcx.com',
      contact_phone: '+90 533 000 0000',
      contact_address: 'Girne, Kuzey Kıbrıs',
      default_language: 'tr',
      supported_languages: ['tr', 'en', 'ru', 'de', 'el'],
      timezone: 'Europe/Istanbul',
      currency: 'USD',
      age_verification: true,
      maintenance_mode: false,
    },
    branding: {
      logo_url: '',
      favicon_url: '',
      primary_color: '#E91E63',
      secondary_color: '#9C27B0',
      accent_color: '#FFD700',
    },
    social: {
      facebook: '',
      instagram: '',
      twitter: '',
      telegram: '',
      whatsapp: '',
    },
    features: {
      messaging_enabled: true,
      favorites_enabled: true,
      reviews_enabled: false,
      booking_enabled: false,
      payment_enabled: true,
      sms_notifications: false,
      email_notifications: true,
    },
    homepage: {
      hero_title: 'Tutkunun Adresi',
      hero_subtitle: 'Özel anlarınız için seçkin partnerler.',
      hero_description: 'Yemek eşliği, davet arkadaşlığı ve unutulmaz deneyimler.',
      show_vitrin: true,
      show_featured: true,
      show_cities: true,
      show_stats: true,
      partners_per_section: 8,
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin/settings');
      if (response.data) {
        // Backend returns {key: value} format, map to our state structure
        setSettings(prev => ({
          general: response.data.general || prev.general,
          branding: response.data.branding || prev.branding,
          social: response.data.social || prev.social,
          features: response.data.features || prev.features,
          homepage: response.data.homepage || prev.homepage,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (section) => {
    setSaving(true);
    try {
      await api.put(`/admin/settings/${section}`, settings[section]);
      toast.success('Ayarlar başarıyla kaydedildi');
    } catch (error) {
      toast.error('Kaydetme başarısız oldu');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-[#E91E63] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div data-testid="admin-site-settings">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white font-serif">Site Ayarları</h1>
        <p className="text-white/60 mt-1">Platform genel ayarları, marka ve görünüm yapılandırması</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/5 p-1 rounded-xl w-full flex flex-wrap gap-1">
          <TabsTrigger value="general" className="flex-1 min-w-[100px] data-[state=active]:bg-[#E91E63] data-[state=active]:text-white rounded-lg">
            <Settings className="w-4 h-4 mr-2" />
            Genel
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex-1 min-w-[100px] data-[state=active]:bg-[#E91E63] data-[state=active]:text-white rounded-lg">
            <Palette className="w-4 h-4 mr-2" />
            Marka
          </TabsTrigger>
          <TabsTrigger value="social" className="flex-1 min-w-[100px] data-[state=active]:bg-[#E91E63] data-[state=active]:text-white rounded-lg">
            <Globe className="w-4 h-4 mr-2" />
            Sosyal
          </TabsTrigger>
          <TabsTrigger value="features" className="flex-1 min-w-[100px] data-[state=active]:bg-[#E91E63] data-[state=active]:text-white rounded-lg">
            <Shield className="w-4 h-4 mr-2" />
            Özellikler
          </TabsTrigger>
          <TabsTrigger value="homepage" className="flex-1 min-w-[100px] data-[state=active]:bg-[#E91E63] data-[state=active]:text-white rounded-lg">
            <Type className="w-4 h-4 mr-2" />
            Anasayfa
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#E91E63]" />
              Genel Bilgiler
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Site Adı</label>
                <Input
                  value={settings.general.site_name}
                  onChange={(e) => updateSetting('general', 'site_name', e.target.value)}
                  className="input-glass"
                  placeholder="KKTCX"
                />
              </div>
              <div>
                <label className="text-white/70 text-sm mb-2 block">Slogan</label>
                <Input
                  value={settings.general.site_tagline}
                  onChange={(e) => updateSetting('general', 'site_tagline', e.target.value)}
                  className="input-glass"
                  placeholder="Kıbrıs'ın Premium Eşlik Platformu"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-white/70 text-sm mb-2 block">Site Açıklaması</label>
                <Textarea
                  value={settings.general.site_description}
                  onChange={(e) => updateSetting('general', 'site_description', e.target.value)}
                  className="input-glass min-h-[100px]"
                  placeholder="Site açıklaması..."
                />
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#E91E63]" />
              İletişim Bilgileri
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-white/70 text-sm mb-2 block">E-posta</label>
                <Input
                  type="email"
                  value={settings.general.contact_email}
                  onChange={(e) => updateSetting('general', 'contact_email', e.target.value)}
                  className="input-glass"
                  placeholder="info@kktcx.com"
                />
              </div>
              <div>
                <label className="text-white/70 text-sm mb-2 block">Telefon</label>
                <Input
                  value={settings.general.contact_phone}
                  onChange={(e) => updateSetting('general', 'contact_phone', e.target.value)}
                  className="input-glass"
                  placeholder="+90 533 000 0000"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-white/70 text-sm mb-2 block">Adres</label>
                <Input
                  value={settings.general.contact_address}
                  onChange={(e) => updateSetting('general', 'contact_address', e.target.value)}
                  className="input-glass"
                  placeholder="Girne, Kuzey Kıbrıs"
                />
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#E91E63]" />
              Bölgesel Ayarlar
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Varsayılan Dil</label>
                <Select 
                  value={settings.general.default_language} 
                  onValueChange={(v) => updateSetting('general', 'default_language', v)}
                >
                  <SelectTrigger className="input-glass">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#15151F] border-white/10">
                    <SelectItem value="tr">Türkçe</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ru">Русский</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="el">Ελληνικά</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-white/70 text-sm mb-2 block">Saat Dilimi</label>
                <Select 
                  value={settings.general.timezone} 
                  onValueChange={(v) => updateSetting('general', 'timezone', v)}
                >
                  <SelectTrigger className="input-glass">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#15151F] border-white/10">
                    <SelectItem value="Europe/Istanbul">İstanbul (UTC+3)</SelectItem>
                    <SelectItem value="Europe/Nicosia">Kıbrıs (UTC+2)</SelectItem>
                    <SelectItem value="Europe/London">Londra (UTC+0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-white/70 text-sm mb-2 block">Para Birimi</label>
                <Select 
                  value={settings.general.currency} 
                  onValueChange={(v) => updateSetting('general', 'currency', v)}
                >
                  <SelectTrigger className="input-glass">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#15151F] border-white/10">
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="TRY">TRY (₺)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#E91E63]" />
              Site Durumu
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div>
                  <p className="text-white font-medium">18+ Yaş Doğrulama</p>
                  <p className="text-white/50 text-sm">Site girişinde yaş doğrulama modalı göster</p>
                </div>
                <Switch
                  checked={settings.general.age_verification}
                  onCheckedChange={(v) => updateSetting('general', 'age_verification', v)}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div>
                  <p className="text-white font-medium">Bakım Modu</p>
                  <p className="text-white/50 text-sm">Siteyi geçici olarak kapatır (sadece adminler erişebilir)</p>
                </div>
                <Switch
                  checked={settings.general.maintenance_mode}
                  onCheckedChange={(v) => updateSetting('general', 'maintenance_mode', v)}
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={() => saveSettings('general')} 
            className="btn-primary w-full md:w-auto"
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            Genel Ayarları Kaydet
          </Button>
        </TabsContent>

        {/* Branding Settings */}
        <TabsContent value="branding" className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
              <Image className="w-5 h-5 text-[#E91E63]" />
              Logo & Favicon
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Logo URL</label>
                <div className="flex gap-2">
                  <Input
                    value={settings.branding.logo_url}
                    onChange={(e) => updateSetting('branding', 'logo_url', e.target.value)}
                    className="input-glass flex-1"
                    placeholder="https://..."
                  />
                  <Button variant="outline" className="btn-outline">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
                {settings.branding.logo_url && (
                  <div className="mt-3 p-4 rounded-xl bg-white/5">
                    <img src={settings.branding.logo_url} alt="Logo" className="h-12 object-contain" />
                  </div>
                )}
              </div>
              <div>
                <label className="text-white/70 text-sm mb-2 block">Favicon URL</label>
                <div className="flex gap-2">
                  <Input
                    value={settings.branding.favicon_url}
                    onChange={(e) => updateSetting('branding', 'favicon_url', e.target.value)}
                    className="input-glass flex-1"
                    placeholder="https://..."
                  />
                  <Button variant="outline" className="btn-outline">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
              <Palette className="w-5 h-5 text-[#E91E63]" />
              Renk Paleti
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Ana Renk</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.branding.primary_color}
                    onChange={(e) => updateSetting('branding', 'primary_color', e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer border-0"
                  />
                  <Input
                    value={settings.branding.primary_color}
                    onChange={(e) => updateSetting('branding', 'primary_color', e.target.value)}
                    className="input-glass flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-white/70 text-sm mb-2 block">İkincil Renk</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.branding.secondary_color}
                    onChange={(e) => updateSetting('branding', 'secondary_color', e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer border-0"
                  />
                  <Input
                    value={settings.branding.secondary_color}
                    onChange={(e) => updateSetting('branding', 'secondary_color', e.target.value)}
                    className="input-glass flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-white/70 text-sm mb-2 block">Vurgu Rengi</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.branding.accent_color}
                    onChange={(e) => updateSetting('branding', 'accent_color', e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer border-0"
                  />
                  <Input
                    value={settings.branding.accent_color}
                    onChange={(e) => updateSetting('branding', 'accent_color', e.target.value)}
                    className="input-glass flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Color Preview */}
            <div className="mt-6 p-4 rounded-xl bg-white/5">
              <p className="text-white/50 text-sm mb-3">Önizleme</p>
              <div className="flex gap-3">
                <button 
                  className="px-6 py-3 rounded-full font-semibold text-white"
                  style={{ background: `linear-gradient(135deg, ${settings.branding.primary_color}, ${settings.branding.secondary_color})` }}
                >
                  Ana Buton
                </button>
                <button 
                  className="px-6 py-3 rounded-full font-semibold border-2"
                  style={{ borderColor: settings.branding.primary_color, color: settings.branding.primary_color }}
                >
                  İkincil Buton
                </button>
                <span 
                  className="px-4 py-2 rounded-full text-sm font-medium"
                  style={{ background: `${settings.branding.accent_color}20`, color: settings.branding.accent_color }}
                >
                  Badge
                </span>
              </div>
            </div>
          </div>

          <Button 
            onClick={() => saveSettings('branding')} 
            className="btn-primary w-full md:w-auto"
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            Marka Ayarlarını Kaydet
          </Button>
        </TabsContent>

        {/* Social Settings */}
        <TabsContent value="social" className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#E91E63]" />
              Sosyal Medya Hesapları
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center shrink-0">
                  <Facebook className="w-6 h-6 text-blue-500" />
                </div>
                <Input
                  value={settings.social.facebook}
                  onChange={(e) => updateSetting('social', 'facebook', e.target.value)}
                  className="input-glass flex-1"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-pink-600/20 flex items-center justify-center shrink-0">
                  <Instagram className="w-6 h-6 text-pink-500" />
                </div>
                <Input
                  value={settings.social.instagram}
                  onChange={(e) => updateSetting('social', 'instagram', e.target.value)}
                  className="input-glass flex-1"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center shrink-0">
                  <Twitter className="w-6 h-6 text-sky-500" />
                </div>
                <Input
                  value={settings.social.twitter}
                  onChange={(e) => updateSetting('social', 'twitter', e.target.value)}
                  className="input-glass flex-1"
                  placeholder="https://twitter.com/..."
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                  <Send className="w-6 h-6 text-blue-400" />
                </div>
                <Input
                  value={settings.social.telegram}
                  onChange={(e) => updateSetting('social', 'telegram', e.target.value)}
                  className="input-glass flex-1"
                  placeholder="https://t.me/..."
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={() => saveSettings('social')} 
            className="btn-primary w-full md:w-auto"
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            Sosyal Medya Ayarlarını Kaydet
          </Button>
        </TabsContent>

        {/* Features Settings */}
        <TabsContent value="features" className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#E91E63]" />
              Platform Özellikleri
            </h3>
            
            <div className="space-y-4">
              {[
                { key: 'messaging_enabled', label: 'Mesajlaşma', desc: 'Kullanıcılar arası mesajlaşma özelliği' },
                { key: 'favorites_enabled', label: 'Favoriler', desc: 'Profilleri favorilere ekleme' },
                { key: 'reviews_enabled', label: 'Değerlendirmeler', desc: 'Partner değerlendirme ve yorumlar' },
                { key: 'booking_enabled', label: 'Rezervasyon', desc: 'Online randevu sistemi' },
                { key: 'payment_enabled', label: 'Ödeme Sistemi', desc: 'Stripe ile paket satışı' },
                { key: 'sms_notifications', label: 'SMS Bildirimleri', desc: 'Netgsm ile SMS gönderimi' },
                { key: 'email_notifications', label: 'E-posta Bildirimleri', desc: 'E-posta ile bilgilendirme' },
              ].map((feature) => (
                <div key={feature.key} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-white font-medium">{feature.label}</p>
                    <p className="text-white/50 text-sm">{feature.desc}</p>
                  </div>
                  <Switch
                    checked={settings.features[feature.key]}
                    onCheckedChange={(v) => updateSetting('features', feature.key, v)}
                  />
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={() => saveSettings('features')} 
            className="btn-primary w-full md:w-auto"
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            Özellik Ayarlarını Kaydet
          </Button>
        </TabsContent>

        {/* Homepage Settings */}
        <TabsContent value="homepage" className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
              <Type className="w-5 h-5 text-[#E91E63]" />
              Hero Bölümü Metinleri
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Ana Başlık</label>
                <Input
                  value={settings.homepage.hero_title}
                  onChange={(e) => updateSetting('homepage', 'hero_title', e.target.value)}
                  className="input-glass text-lg"
                  placeholder="Tutkunun Adresi"
                />
              </div>
              <div>
                <label className="text-white/70 text-sm mb-2 block">Alt Başlık</label>
                <Input
                  value={settings.homepage.hero_subtitle}
                  onChange={(e) => updateSetting('homepage', 'hero_subtitle', e.target.value)}
                  className="input-glass"
                  placeholder="Özel anlarınız için seçkin partnerler."
                />
              </div>
              <div>
                <label className="text-white/70 text-sm mb-2 block">Açıklama</label>
                <Textarea
                  value={settings.homepage.hero_description}
                  onChange={(e) => updateSetting('homepage', 'hero_description', e.target.value)}
                  className="input-glass"
                  placeholder="Yemek eşliği, davet arkadaşlığı ve unutulmaz deneyimler."
                />
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#E91E63]" />
              Anasayfa Bölümleri
            </h3>
            
            <div className="space-y-4">
              {[
                { key: 'show_vitrin', label: 'Vitrin Bölümü', desc: 'Premium vitrin ilanlarını göster' },
                { key: 'show_featured', label: 'Öne Çıkanlar', desc: 'Öne çıkan partnerleri göster' },
                { key: 'show_cities', label: 'Şehirler', desc: 'Şehirlere göre kategorileri göster' },
                { key: 'show_stats', label: 'İstatistikler', desc: 'Platform istatistiklerini göster' },
              ].map((section) => (
                <div key={section.key} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-white font-medium">{section.label}</p>
                    <p className="text-white/50 text-sm">{section.desc}</p>
                  </div>
                  <Switch
                    checked={settings.homepage[section.key]}
                    onCheckedChange={(v) => updateSetting('homepage', section.key, v)}
                  />
                </div>
              ))}
            </div>

            <div className="mt-6">
              <label className="text-white/70 text-sm mb-2 block">Her Bölümde Gösterilecek Partner Sayısı</label>
              <Select 
                value={String(settings.homepage.partners_per_section)} 
                onValueChange={(v) => updateSetting('homepage', 'partners_per_section', parseInt(v))}
              >
                <SelectTrigger className="input-glass w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#15151F] border-white/10">
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={() => saveSettings('homepage')} 
            className="btn-primary w-full md:w-auto"
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            Anasayfa Ayarlarını Kaydet
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSiteSettings;
