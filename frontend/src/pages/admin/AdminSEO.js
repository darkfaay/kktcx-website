import React, { useState, useEffect } from 'react';
import { useAuth, useLanguage } from '../../context/AppContext';
import { 
  Globe, Save, Search, Eye, FileText, Link as LinkIcon, 
  Image, Hash, Code, CheckCircle, AlertCircle, Plus, Trash2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
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

const AdminSEO = () => {
  const { api } = useAuth();
  const { lang } = useLanguage();
  
  const [seoSettings, setSeoSettings] = useState({
    global: {
      site_title: 'KKTCX - Kıbrıs\'ın Premium Eşlik Platformu',
      site_description: 'Kuzey Kıbrıs\'ın en güvenilir sosyal eşlik platformu. Yemek eşliği, davet arkadaşlığı ve özel etkinlikler için profesyonel partnerler.',
      keywords: ['kktcx', 'kıbrıs', 'eşlik', 'partner', 'sosyal', 'premium'],
      og_image: '',
      twitter_handle: '@kktcx',
      google_analytics: '',
      google_search_console: '',
      facebook_pixel: '',
    },
    pages: [
      { 
        slug: 'homepage', 
        name: 'Ana Sayfa', 
        title: 'KKTCX - Tutkunun Adresi | Kıbrıs\'ın Premium Eşlik Platformu',
        description: 'Özel anlarınız için seçkin partnerler. Yemek eşliği, davet arkadaşlığı ve unutulmaz deneyimler.',
        keywords: ['ana sayfa', 'premium', 'eşlik'],
        og_title: '',
        og_description: '',
      },
      { 
        slug: 'partners', 
        name: 'Partnerler', 
        title: 'Tüm Partnerler | KKTCX',
        description: 'Kıbrıs\'taki tüm partnerleri keşfedin. Şehir, hizmet ve tercihlere göre filtreleyin.',
        keywords: ['partnerler', 'liste', 'filtre'],
        og_title: '',
        og_description: '',
      },
      { 
        slug: 'about', 
        name: 'Hakkımızda', 
        title: 'Hakkımızda | KKTCX',
        description: 'KKTCX hakkında bilgi edinin. Misyonumuz, vizyonumuz ve değerlerimiz.',
        keywords: ['hakkımızda', 'misyon', 'vizyon'],
        og_title: '',
        og_description: '',
      },
      { 
        slug: 'contact', 
        name: 'İletişim', 
        title: 'İletişim | KKTCX',
        description: 'Bizimle iletişime geçin. Sorularınız, önerileriniz veya şikayetleriniz için.',
        keywords: ['iletişim', 'destek', 'yardım'],
        og_title: '',
        og_description: '',
      },
    ],
    robots: {
      allow_indexing: true,
      allow_following: true,
      sitemap_url: '/sitemap.xml',
      custom_rules: '',
    },
    structured_data: {
      organization_name: 'KKTCX',
      organization_type: 'LocalBusiness',
      organization_logo: '',
      organization_url: 'https://kktcx.com',
      contact_type: 'customer service',
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('global');
  const [selectedPage, setSelectedPage] = useState('homepage');

  useEffect(() => {
    fetchSeoSettings();
  }, []);

  const fetchSeoSettings = async () => {
    try {
      const response = await api.get('/admin/seo');
      if (response.data) {
        setSeoSettings(prev => ({
          ...prev,
          ...response.data
        }));
      }
    } catch (error) {
      console.error('Failed to fetch SEO settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSeoSettings = async (section) => {
    setSaving(true);
    try {
      await api.put(`/admin/seo/${section}`, seoSettings[section]);
      toast.success('SEO ayarları kaydedildi');
    } catch (error) {
      toast.error('Kaydetme başarısız');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const updateGlobal = (field, value) => {
    setSeoSettings(prev => ({
      ...prev,
      global: { ...prev.global, [field]: value }
    }));
  };

  const updatePage = (slug, field, value) => {
    setSeoSettings(prev => ({
      ...prev,
      pages: prev.pages.map(p => p.slug === slug ? { ...p, [field]: value } : p)
    }));
  };

  const updateRobots = (field, value) => {
    setSeoSettings(prev => ({
      ...prev,
      robots: { ...prev.robots, [field]: value }
    }));
  };

  const updateStructuredData = (field, value) => {
    setSeoSettings(prev => ({
      ...prev,
      structured_data: { ...prev.structured_data, [field]: value }
    }));
  };

  const addKeyword = (section, slug = null) => {
    const keyword = prompt('Yeni anahtar kelime:');
    if (!keyword) return;

    if (section === 'global') {
      setSeoSettings(prev => ({
        ...prev,
        global: { ...prev.global, keywords: [...(prev.global.keywords || []), keyword] }
      }));
    } else if (slug) {
      setSeoSettings(prev => ({
        ...prev,
        pages: prev.pages.map(p => 
          p.slug === slug ? { ...p, keywords: [...(p.keywords || []), keyword] } : p
        )
      }));
    }
  };

  const removeKeyword = (section, index, slug = null) => {
    if (section === 'global') {
      setSeoSettings(prev => ({
        ...prev,
        global: { ...prev.global, keywords: (prev.global.keywords || []).filter((_, i) => i !== index) }
      }));
    } else if (slug) {
      setSeoSettings(prev => ({
        ...prev,
        pages: prev.pages.map(p => 
          p.slug === slug ? { ...p, keywords: (p.keywords || []).filter((_, i) => i !== index) } : p
        )
      }));
    }
  };

  const selectedPageData = (seoSettings.pages || []).find(p => p.slug === selectedPage) || {};

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-[#E91E63] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div data-testid="admin-seo">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white font-serif">SEO Yönetimi</h1>
        <p className="text-white/60 mt-1">Arama motoru optimizasyonu ve meta tag yapılandırması</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/5 p-1 rounded-xl w-full flex flex-wrap gap-1">
          <TabsTrigger value="global" className="flex-1 min-w-[100px] data-[state=active]:bg-[#E91E63] data-[state=active]:text-white rounded-lg">
            <Globe className="w-4 h-4 mr-2" />
            Genel SEO
          </TabsTrigger>
          <TabsTrigger value="pages" className="flex-1 min-w-[100px] data-[state=active]:bg-[#E91E63] data-[state=active]:text-white rounded-lg">
            <FileText className="w-4 h-4 mr-2" />
            Sayfa SEO
          </TabsTrigger>
          <TabsTrigger value="robots" className="flex-1 min-w-[100px] data-[state=active]:bg-[#E91E63] data-[state=active]:text-white rounded-lg">
            <Code className="w-4 h-4 mr-2" />
            Robots & Sitemap
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex-1 min-w-[100px] data-[state=active]:bg-[#E91E63] data-[state=active]:text-white rounded-lg">
            <Search className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Global SEO */}
        <TabsContent value="global" className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#E91E63]" />
              Genel Meta Bilgileri
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-white/70 text-sm mb-2 flex items-center gap-2">
                  Site Başlığı (Title)
                  <span className="text-white/40 text-xs">({(seoSettings.global?.site_title || '').length}/60)</span>
                </label>
                <Input
                  value={seoSettings.global?.site_title || ''}
                  onChange={(e) => updateGlobal('site_title', e.target.value)}
                  className="input-glass"
                  maxLength={60}
                />
                <p className="text-white/40 text-xs mt-1">Arama sonuçlarında görünecek ana başlık</p>
              </div>
              
              <div>
                <label className="text-white/70 text-sm mb-2 flex items-center gap-2">
                  Site Açıklaması (Description)
                  <span className="text-white/40 text-xs">({(seoSettings.global?.site_description || '').length}/160)</span>
                </label>
                <Textarea
                  value={seoSettings.global?.site_description || ''}
                  onChange={(e) => updateGlobal('site_description', e.target.value)}
                  className="input-glass"
                  maxLength={160}
                  rows={3}
                />
                <p className="text-white/40 text-xs mt-1">Arama sonuçlarında başlığın altında görünecek açıklama</p>
              </div>

              <div>
                <label className="text-white/70 text-sm mb-2 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Anahtar Kelimeler
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(seoSettings.global?.keywords || []).map((keyword, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 rounded-full bg-[#E91E63]/10 text-[#E91E63] text-sm flex items-center gap-2"
                    >
                      {keyword}
                      <button onClick={() => removeKeyword('global', idx)} className="hover:text-red-400">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={() => addKeyword('global')}
                    className="px-3 py-1 rounded-full bg-white/5 text-white/60 text-sm flex items-center gap-1 hover:bg-white/10"
                  >
                    <Plus className="w-3 h-3" />
                    Ekle
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
              <Image className="w-5 h-5 text-[#E91E63]" />
              Open Graph (Sosyal Medya)
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">OG Image URL</label>
                <Input
                  value={seoSettings.global?.og_image || ''}
                  onChange={(e) => updateGlobal('og_image', e.target.value)}
                  className="input-glass"
                  placeholder="https://kktcx.com/og-image.jpg"
                />
                <p className="text-white/40 text-xs mt-1">Sosyal medyada paylaşıldığında görünecek resim (1200x630px önerilir)</p>
              </div>
              <div>
                <label className="text-white/70 text-sm mb-2 block">Twitter Handle</label>
                <Input
                  value={seoSettings.global?.twitter_handle || ''}
                  onChange={(e) => updateGlobal('twitter_handle', e.target.value)}
                  className="input-glass"
                  placeholder="@kktcx"
                />
              </div>
            </div>
          </div>

          {/* SEO Preview */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#E91E63]" />
              Google Önizlemesi
            </h3>
            <div className="bg-white rounded-xl p-4">
              <div className="text-blue-600 text-xl hover:underline cursor-pointer font-medium">
                {seoSettings.global?.site_title || 'Site Başlığı'}
              </div>
              <div className="text-green-700 text-sm">
                https://kktcx.com
              </div>
              <div className="text-gray-600 text-sm mt-1">
                {seoSettings.global?.site_description || 'Site açıklaması buraya gelecek...'}
              </div>
            </div>
          </div>

          <Button 
            onClick={() => saveSeoSettings('global')} 
            className="btn-primary w-full md:w-auto"
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            Genel SEO Ayarlarını Kaydet
          </Button>
        </TabsContent>

        {/* Page SEO */}
        <TabsContent value="pages" className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#E91E63]" />
                Sayfa Seçin
              </h3>
              <Select value={selectedPage} onValueChange={setSelectedPage}>
                <SelectTrigger className="input-glass w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#15151F] border-white/10">
                  {(seoSettings.pages || []).map((page) => (
                    <SelectItem key={page.slug} value={page.slug}>{page.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-white/70 text-sm mb-2 flex items-center gap-2">
                  Sayfa Başlığı
                  <span className="text-white/40 text-xs">({selectedPageData.title?.length || 0}/60)</span>
                </label>
                <Input
                  value={selectedPageData.title || ''}
                  onChange={(e) => updatePage(selectedPage, 'title', e.target.value)}
                  className="input-glass"
                  maxLength={60}
                />
              </div>
              
              <div>
                <label className="text-white/70 text-sm mb-2 flex items-center gap-2">
                  Sayfa Açıklaması
                  <span className="text-white/40 text-xs">({selectedPageData.description?.length || 0}/160)</span>
                </label>
                <Textarea
                  value={selectedPageData.description || ''}
                  onChange={(e) => updatePage(selectedPage, 'description', e.target.value)}
                  className="input-glass"
                  maxLength={160}
                  rows={3}
                />
              </div>

              <div>
                <label className="text-white/70 text-sm mb-2 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Sayfa Anahtar Kelimeleri
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(selectedPageData.keywords || []).map((keyword, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 rounded-full bg-[#E91E63]/10 text-[#E91E63] text-sm flex items-center gap-2"
                    >
                      {keyword}
                      <button onClick={() => removeKeyword('page', idx, selectedPage)} className="hover:text-red-400">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={() => addKeyword('page', selectedPage)}
                    className="px-3 py-1 rounded-full bg-white/5 text-white/60 text-sm flex items-center gap-1 hover:bg-white/10"
                  >
                    <Plus className="w-3 h-3" />
                    Ekle
                  </button>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 mt-4">
                <h4 className="text-white/70 text-sm mb-4">Open Graph Özelleştirme (Opsiyonel)</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">OG Başlık</label>
                    <Input
                      value={selectedPageData.og_title || ''}
                      onChange={(e) => updatePage(selectedPage, 'og_title', e.target.value)}
                      className="input-glass"
                      placeholder="Boş bırakılırsa sayfa başlığı kullanılır"
                    />
                  </div>
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">OG Açıklama</label>
                    <Input
                      value={selectedPageData.og_description || ''}
                      onChange={(e) => updatePage(selectedPage, 'og_description', e.target.value)}
                      className="input-glass"
                      placeholder="Boş bırakılırsa sayfa açıklaması kullanılır"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button 
            onClick={() => saveSeoSettings('pages')} 
            className="btn-primary w-full md:w-auto"
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            Sayfa SEO Ayarlarını Kaydet
          </Button>
        </TabsContent>

        {/* Robots & Sitemap */}
        <TabsContent value="robots" className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
              <Code className="w-5 h-5 text-[#E91E63]" />
              Robots.txt Ayarları
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div>
                  <p className="text-white font-medium">Arama Motoru İndeksleme</p>
                  <p className="text-white/50 text-sm">Arama motorlarının siteyi indekslemesine izin ver</p>
                </div>
                <Switch
                  checked={seoSettings.robots?.allow_indexing ?? true}
                  onCheckedChange={(v) => updateRobots('allow_indexing', v)}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div>
                  <p className="text-white font-medium">Bağlantı Takibi</p>
                  <p className="text-white/50 text-sm">Arama motorlarının bağlantıları takip etmesine izin ver</p>
                </div>
                <Switch
                  checked={seoSettings.robots?.allow_following ?? true}
                  onCheckedChange={(v) => updateRobots('allow_following', v)}
                />
              </div>
              
              <div>
                <label className="text-white/70 text-sm mb-2 block">Sitemap URL</label>
                <Input
                  value={seoSettings.robots?.sitemap_url || '/sitemap.xml'}
                  onChange={(e) => updateRobots('sitemap_url', e.target.value)}
                  className="input-glass"
                  placeholder="/sitemap.xml"
                />
              </div>

              <div>
                <label className="text-white/70 text-sm mb-2 block">Özel Robots Kuralları</label>
                <Textarea
                  value={seoSettings.robots?.custom_rules || ''}
                  onChange={(e) => updateRobots('custom_rules', e.target.value)}
                  className="input-glass font-mono text-sm"
                  placeholder="Disallow: /admin/&#10;Disallow: /private/"
                  rows={5}
                />
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#E91E63]" />
              Robots.txt Önizlemesi
            </h3>
            <div className="bg-[#1a1a24] rounded-xl p-4 font-mono text-sm text-white/70">
              <pre>{`User-agent: *
${seoSettings.robots?.allow_indexing !== false ? '' : 'Disallow: /\n'}${seoSettings.robots?.allow_following !== false ? '' : 'Nofollow\n'}${seoSettings.robots?.custom_rules ? seoSettings.robots.custom_rules + '\n' : ''}
Sitemap: https://kktcx.com${seoSettings.robots?.sitemap_url || '/sitemap.xml'}`}</pre>
            </div>
          </div>

          <Button 
            onClick={() => saveSeoSettings('robots')} 
            className="btn-primary w-full md:w-auto"
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            Robots Ayarlarını Kaydet
          </Button>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
              <Search className="w-5 h-5 text-[#E91E63]" />
              Analytics & Takip Kodları
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Google Analytics ID</label>
                <Input
                  value={seoSettings.global?.google_analytics || ''}
                  onChange={(e) => updateGlobal('google_analytics', e.target.value)}
                  className="input-glass"
                  placeholder="G-XXXXXXXXXX veya UA-XXXXXXXX-X"
                />
                <p className="text-white/40 text-xs mt-1">Google Analytics takip kodu</p>
              </div>
              
              <div>
                <label className="text-white/70 text-sm mb-2 block">Google Search Console</label>
                <Input
                  value={seoSettings.global?.google_search_console || ''}
                  onChange={(e) => updateGlobal('google_search_console', e.target.value)}
                  className="input-glass"
                  placeholder="Doğrulama meta etiketi"
                />
              </div>

              <div>
                <label className="text-white/70 text-sm mb-2 block">Facebook Pixel ID</label>
                <Input
                  value={seoSettings.global?.facebook_pixel || ''}
                  onChange={(e) => updateGlobal('facebook_pixel', e.target.value)}
                  className="input-glass"
                  placeholder="XXXXXXXXXXXXXXXXX"
                />
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
              <Code className="w-5 h-5 text-[#E91E63]" />
              Yapılandırılmış Veri (Schema.org)
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Organizasyon Adı</label>
                <Input
                  value={seoSettings.structured_data?.organization_name || ''}
                  onChange={(e) => updateStructuredData('organization_name', e.target.value)}
                  className="input-glass"
                />
              </div>
              <div>
                <label className="text-white/70 text-sm mb-2 block">Organizasyon Tipi</label>
                <Select 
                  value={seoSettings.structured_data?.organization_type || 'LocalBusiness'}
                  onValueChange={(v) => updateStructuredData('organization_type', v)}
                >
                  <SelectTrigger className="input-glass">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#15151F] border-white/10">
                    <SelectItem value="LocalBusiness">Yerel İşletme</SelectItem>
                    <SelectItem value="Organization">Organizasyon</SelectItem>
                    <SelectItem value="Corporation">Şirket</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-white/70 text-sm mb-2 block">Logo URL</label>
                <Input
                  value={seoSettings.structured_data?.organization_logo || ''}
                  onChange={(e) => updateStructuredData('organization_logo', e.target.value)}
                  className="input-glass"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-white/70 text-sm mb-2 block">Website URL</label>
                <Input
                  value={seoSettings.structured_data?.organization_url || ''}
                  onChange={(e) => updateStructuredData('organization_url', e.target.value)}
                  className="input-glass"
                  placeholder="https://kktcx.com"
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={() => saveSeoSettings('global')} 
            className="btn-primary w-full md:w-auto"
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            Analytics Ayarlarını Kaydet
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSEO;
