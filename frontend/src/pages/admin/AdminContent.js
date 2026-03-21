import React, { useState, useEffect } from 'react';
import { useAuth, useLanguage } from '../../context/AppContext';
import { 
  FileText, Save, Globe, Eye, Languages, Home, Users, Info,
  Phone, Shield, HelpCircle, Plus, Trash2, Edit3, Check, X
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion';
import { toast } from 'sonner';

const AdminContent = () => {
  const { api } = useAuth();
  const { lang } = useLanguage();
  
  const [content, setContent] = useState({
    homepage: {
      tr: {
        hero_title: 'Tutkunun Adresi',
        hero_subtitle: 'Özel anlarınız için seçkin partnerler.',
        hero_description: 'Yemek eşliği, davet arkadaşlığı ve unutulmaz deneyimler.',
        cta_primary: 'Partnerleri Keşfet',
        cta_secondary: 'Partner Ol',
        section_vitrin_title: 'VIP Vitrin',
        section_featured_title: 'Öne Çıkanlar',
        section_cities_title: 'Şehirlere Göre',
        section_today_title: 'Bugün Müsait',
      },
      en: {
        hero_title: 'Destination of Passion',
        hero_subtitle: 'Select partners for your special moments.',
        hero_description: 'Dinner companions, event partners and unforgettable experiences.',
        cta_primary: 'Explore Partners',
        cta_secondary: 'Become a Partner',
        section_vitrin_title: 'VIP Showcase',
        section_featured_title: 'Featured',
        section_cities_title: 'By City',
        section_today_title: 'Available Today',
      },
    },
    about: {
      tr: {
        title: 'Hakkımızda',
        subtitle: 'KKTCX - Kıbrıs\'ın Premium Eşlik Platformu',
        content: 'KKTCX, Kuzey Kıbrıs\'ın en güvenilir ve profesyonel sosyal eşlik platformudur. Yemek eşliği, davet arkadaşlığı ve özel etkinlikler için seçkin partnerlerle buluşmanızı sağlıyoruz.',
        mission_title: 'Misyonumuz',
        mission_content: 'Güvenli, profesyonel ve kaliteli bir sosyal eşlik deneyimi sunmak.',
        vision_title: 'Vizyonumuz',
        vision_content: 'Kıbrıs\'ın en güvenilir ve tercih edilen sosyal eşlik platformu olmak.',
      },
      en: {
        title: 'About Us',
        subtitle: 'KKTCX - Cyprus Premium Companion Platform',
        content: 'KKTCX is the most trusted and professional social companion platform in Northern Cyprus.',
        mission_title: 'Our Mission',
        mission_content: 'To provide a safe, professional and quality social companion experience.',
        vision_title: 'Our Vision',
        vision_content: 'To become the most trusted and preferred social companion platform in Cyprus.',
      },
    },
    contact: {
      tr: {
        title: 'İletişim',
        subtitle: 'Bizimle iletişime geçin',
        description: 'Sorularınız, önerileriniz veya geri bildirimleriniz için bize ulaşın.',
        form_name: 'Adınız',
        form_email: 'E-posta',
        form_subject: 'Konu',
        form_message: 'Mesajınız',
        form_submit: 'Gönder',
        address_title: 'Adres',
        phone_title: 'Telefon',
        email_title: 'E-posta',
      },
      en: {
        title: 'Contact',
        subtitle: 'Get in touch with us',
        description: 'Reach out to us for your questions, suggestions or feedback.',
        form_name: 'Your Name',
        form_email: 'Email',
        form_subject: 'Subject',
        form_message: 'Your Message',
        form_submit: 'Send',
        address_title: 'Address',
        phone_title: 'Phone',
        email_title: 'Email',
      },
    },
    faq: {
      tr: {
        title: 'Sıkça Sorulan Sorular',
        subtitle: 'Merak ettiklerinize yanıt bulun',
        items: [
          { question: 'KKTCX nedir?', answer: 'KKTCX, Kuzey Kıbrıs\'ın premium sosyal eşlik platformudur.' },
          { question: 'Nasıl partner olurum?', answer: 'Kayıt sayfasından partner olarak kaydolabilirsiniz.' },
          { question: 'Ödeme nasıl yapılır?', answer: 'Premium paketler için güvenli ödeme sistemi kullanıyoruz.' },
        ],
      },
      en: {
        title: 'Frequently Asked Questions',
        subtitle: 'Find answers to your questions',
        items: [
          { question: 'What is KKTCX?', answer: 'KKTCX is the premium social companion platform of Northern Cyprus.' },
          { question: 'How do I become a partner?', answer: 'You can register as a partner from the registration page.' },
          { question: 'How is payment made?', answer: 'We use a secure payment system for premium packages.' },
        ],
      },
    },
    footer: {
      tr: {
        description: 'Kuzey Kıbrıs\'ın en güvenilir sosyal eşlik platformu.',
        copyright: '© 2025 KKTCX. Tüm hakları saklıdır.',
        adult_warning: '18+ Yetişkin İçerik',
        tagline: 'Kıbrıs\'ın #1 Eşlik Platformu',
      },
      en: {
        description: 'The most trusted social companion platform in Northern Cyprus.',
        copyright: '© 2025 KKTCX. All rights reserved.',
        adult_warning: '18+ Adult Content',
        tagline: 'Cyprus #1 Companion Platform',
      },
    },
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePage, setActivePage] = useState('homepage');
  const [activeLang, setActiveLang] = useState('tr');
  const [editingFaq, setEditingFaq] = useState(null);

  const pages = [
    { id: 'homepage', name: 'Ana Sayfa', icon: Home },
    { id: 'about', name: 'Hakkımızda', icon: Info },
    { id: 'contact', name: 'İletişim', icon: Phone },
    { id: 'faq', name: 'SSS', icon: HelpCircle },
    { id: 'footer', name: 'Footer', icon: FileText },
  ];

  const languages = [
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
  ];

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await api.get('/admin/content');
      if (response.data && Object.keys(response.data).length > 0) {
        // Merge fetched content with default content
        setContent(prev => {
          const merged = { ...prev };
          for (const page of Object.keys(response.data)) {
            if (merged[page]) {
              merged[page] = { ...merged[page], ...response.data[page] };
            } else {
              merged[page] = response.data[page];
            }
          }
          return merged;
        });
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async (page) => {
    setSaving(true);
    try {
      await api.put(`/admin/content/${page}`, content[page]);
      toast.success('İçerik başarıyla kaydedildi');
    } catch (error) {
      toast.error('Kaydetme başarısız');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const updateContent = (page, lang, field, value) => {
    setContent(prev => ({
      ...prev,
      [page]: {
        ...prev[page],
        [lang]: {
          ...prev[page]?.[lang],
          [field]: value
        }
      }
    }));
  };

  const addFaqItem = () => {
    const newItem = { question: 'Yeni Soru', answer: 'Cevap...' };
    setContent(prev => ({
      ...prev,
      faq: {
        ...prev.faq,
        [activeLang]: {
          ...prev.faq[activeLang],
          items: [...(prev.faq[activeLang]?.items || []), newItem]
        }
      }
    }));
  };

  const removeFaqItem = (index) => {
    setContent(prev => ({
      ...prev,
      faq: {
        ...prev.faq,
        [activeLang]: {
          ...prev.faq[activeLang],
          items: prev.faq[activeLang].items.filter((_, i) => i !== index)
        }
      }
    }));
  };

  const updateFaqItem = (index, field, value) => {
    setContent(prev => ({
      ...prev,
      faq: {
        ...prev.faq,
        [activeLang]: {
          ...prev.faq[activeLang],
          items: prev.faq[activeLang].items.map((item, i) => 
            i === index ? { ...item, [field]: value } : item
          )
        }
      }
    }));
  };

  const currentContent = content[activePage]?.[activeLang] || {};

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-[#E91E63] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const renderContentFields = () => {
    switch (activePage) {
      case 'homepage':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-white/70 text-sm mb-2 block">Hero Başlık</label>
              <Input
                value={currentContent.hero_title || ''}
                onChange={(e) => updateContent(activePage, activeLang, 'hero_title', e.target.value)}
                className="input-glass text-lg"
              />
            </div>
            <div>
              <label className="text-white/70 text-sm mb-2 block">Hero Alt Başlık</label>
              <Input
                value={currentContent.hero_subtitle || ''}
                onChange={(e) => updateContent(activePage, activeLang, 'hero_subtitle', e.target.value)}
                className="input-glass"
              />
            </div>
            <div>
              <label className="text-white/70 text-sm mb-2 block">Hero Açıklama</label>
              <Textarea
                value={currentContent.hero_description || ''}
                onChange={(e) => updateContent(activePage, activeLang, 'hero_description', e.target.value)}
                className="input-glass"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Ana CTA Butonu</label>
                <Input
                  value={currentContent.cta_primary || ''}
                  onChange={(e) => updateContent(activePage, activeLang, 'cta_primary', e.target.value)}
                  className="input-glass"
                />
              </div>
              <div>
                <label className="text-white/70 text-sm mb-2 block">İkincil CTA Butonu</label>
                <Input
                  value={currentContent.cta_secondary || ''}
                  onChange={(e) => updateContent(activePage, activeLang, 'cta_secondary', e.target.value)}
                  className="input-glass"
                />
              </div>
            </div>
            <div className="border-t border-white/10 pt-4">
              <h4 className="text-white font-medium mb-4">Bölüm Başlıkları</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/70 text-sm mb-2 block">VIP Vitrin</label>
                  <Input
                    value={currentContent.section_vitrin_title || ''}
                    onChange={(e) => updateContent(activePage, activeLang, 'section_vitrin_title', e.target.value)}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm mb-2 block">Öne Çıkanlar</label>
                  <Input
                    value={currentContent.section_featured_title || ''}
                    onChange={(e) => updateContent(activePage, activeLang, 'section_featured_title', e.target.value)}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm mb-2 block">Şehirler</label>
                  <Input
                    value={currentContent.section_cities_title || ''}
                    onChange={(e) => updateContent(activePage, activeLang, 'section_cities_title', e.target.value)}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm mb-2 block">Bugün Müsait</label>
                  <Input
                    value={currentContent.section_today_title || ''}
                    onChange={(e) => updateContent(activePage, activeLang, 'section_today_title', e.target.value)}
                    className="input-glass"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-white/70 text-sm mb-2 block">Sayfa Başlığı</label>
              <Input
                value={currentContent.title || ''}
                onChange={(e) => updateContent(activePage, activeLang, 'title', e.target.value)}
                className="input-glass"
              />
            </div>
            <div>
              <label className="text-white/70 text-sm mb-2 block">Alt Başlık</label>
              <Input
                value={currentContent.subtitle || ''}
                onChange={(e) => updateContent(activePage, activeLang, 'subtitle', e.target.value)}
                className="input-glass"
              />
            </div>
            <div>
              <label className="text-white/70 text-sm mb-2 block">İçerik</label>
              <Textarea
                value={currentContent.content || ''}
                onChange={(e) => updateContent(activePage, activeLang, 'content', e.target.value)}
                className="input-glass min-h-[150px]"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Misyon Başlık</label>
                <Input
                  value={currentContent.mission_title || ''}
                  onChange={(e) => updateContent(activePage, activeLang, 'mission_title', e.target.value)}
                  className="input-glass"
                />
              </div>
              <div>
                <label className="text-white/70 text-sm mb-2 block">Vizyon Başlık</label>
                <Input
                  value={currentContent.vision_title || ''}
                  onChange={(e) => updateContent(activePage, activeLang, 'vision_title', e.target.value)}
                  className="input-glass"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Misyon İçerik</label>
                <Textarea
                  value={currentContent.mission_content || ''}
                  onChange={(e) => updateContent(activePage, activeLang, 'mission_content', e.target.value)}
                  className="input-glass"
                />
              </div>
              <div>
                <label className="text-white/70 text-sm mb-2 block">Vizyon İçerik</label>
                <Textarea
                  value={currentContent.vision_content || ''}
                  onChange={(e) => updateContent(activePage, activeLang, 'vision_content', e.target.value)}
                  className="input-glass"
                />
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Sayfa Başlığı</label>
                <Input
                  value={currentContent.title || ''}
                  onChange={(e) => updateContent(activePage, activeLang, 'title', e.target.value)}
                  className="input-glass"
                />
              </div>
              <div>
                <label className="text-white/70 text-sm mb-2 block">Alt Başlık</label>
                <Input
                  value={currentContent.subtitle || ''}
                  onChange={(e) => updateContent(activePage, activeLang, 'subtitle', e.target.value)}
                  className="input-glass"
                />
              </div>
            </div>
            <div>
              <label className="text-white/70 text-sm mb-2 block">Açıklama</label>
              <Textarea
                value={currentContent.description || ''}
                onChange={(e) => updateContent(activePage, activeLang, 'description', e.target.value)}
                className="input-glass"
              />
            </div>
            <div className="border-t border-white/10 pt-4">
              <h4 className="text-white font-medium mb-4">Form Etiketleri</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {['form_name', 'form_email', 'form_subject', 'form_message', 'form_submit'].map((field) => (
                  <div key={field}>
                    <label className="text-white/70 text-sm mb-2 block capitalize">{field.replace('form_', '')}</label>
                    <Input
                      value={currentContent[field] || ''}
                      onChange={(e) => updateContent(activePage, activeLang, field, e.target.value)}
                      className="input-glass"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Sayfa Başlığı</label>
                <Input
                  value={currentContent.title || ''}
                  onChange={(e) => updateContent(activePage, activeLang, 'title', e.target.value)}
                  className="input-glass"
                />
              </div>
              <div>
                <label className="text-white/70 text-sm mb-2 block">Alt Başlık</label>
                <Input
                  value={currentContent.subtitle || ''}
                  onChange={(e) => updateContent(activePage, activeLang, 'subtitle', e.target.value)}
                  className="input-glass"
                />
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-medium">SSS Maddeleri</h4>
                <Button onClick={addFaqItem} size="sm" className="btn-outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Soru Ekle
                </Button>
              </div>
              <div className="space-y-4">
                {(currentContent.items || []).map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <label className="text-white/70 text-xs mb-1 block">Soru</label>
                        <Input
                          value={item.question}
                          onChange={(e) => updateFaqItem(idx, 'question', e.target.value)}
                          className="input-glass"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFaqItem(idx)}
                        className="text-red-400 hover:bg-red-400/10 mt-5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div>
                      <label className="text-white/70 text-xs mb-1 block">Cevap</label>
                      <Textarea
                        value={item.answer}
                        onChange={(e) => updateFaqItem(idx, 'answer', e.target.value)}
                        className="input-glass"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'footer':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-white/70 text-sm mb-2 block">Site Açıklaması</label>
              <Textarea
                value={currentContent.description || ''}
                onChange={(e) => updateContent(activePage, activeLang, 'description', e.target.value)}
                className="input-glass"
              />
            </div>
            <div>
              <label className="text-white/70 text-sm mb-2 block">Copyright Metni</label>
              <Input
                value={currentContent.copyright || ''}
                onChange={(e) => updateContent(activePage, activeLang, 'copyright', e.target.value)}
                className="input-glass"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Yetişkin Uyarısı</label>
                <Input
                  value={currentContent.adult_warning || ''}
                  onChange={(e) => updateContent(activePage, activeLang, 'adult_warning', e.target.value)}
                  className="input-glass"
                />
              </div>
              <div>
                <label className="text-white/70 text-sm mb-2 block">Slogan</label>
                <Input
                  value={currentContent.tagline || ''}
                  onChange={(e) => updateContent(activePage, activeLang, 'tagline', e.target.value)}
                  className="input-glass"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div data-testid="admin-content">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white font-serif">İçerik Yönetimi</h1>
        <p className="text-white/60 mt-1">Sayfa içeriklerini ve metinlerini düzenleyin</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar - Page Selection */}
        <div className="lg:col-span-1">
          <div className="glass rounded-2xl p-4 sticky top-24">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#E91E63]" />
              Sayfalar
            </h3>
            <div className="space-y-2">
              {pages.map((page) => {
                const IconComponent = page.icon;
                return (
                  <button
                    key={page.id}
                    onClick={() => setActivePage(page.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activePage === page.id
                        ? 'bg-[#E91E63]/10 text-[#E91E63] border border-[#E91E63]/30'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="text-sm font-medium">{page.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Language Selector */}
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-white/70 text-sm flex items-center gap-2">
                <Languages className="w-4 h-4" />
                Dil Seçin:
              </span>
              <div className="flex gap-2">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => setActiveLang(language.code)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                      activeLang === language.code
                        ? 'bg-[#E91E63] text-white'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <span>{language.flag}</span>
                    <span className="text-sm">{language.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#E91E63]" />
                {pages.find(p => p.id === activePage)?.name} - {languages.find(l => l.code === activeLang)?.name}
              </h3>
              <Button 
                onClick={() => saveContent(activePage)} 
                className="btn-primary"
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-2" />
                Kaydet
              </Button>
            </div>
            
            {renderContentFields()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContent;
