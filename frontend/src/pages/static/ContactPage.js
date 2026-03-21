import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/AppContext';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, Headphones, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';
import PageBanner from '../../components/PageBanner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ContactPage = () => {
  const { t } = useLanguage();
  const [siteSettings, setSiteSettings] = useState({ general: {} });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/settings/public`);
      if (response.data) {
        setSiteSettings({
          general: response.data.general || {},
        });
      }
    } catch (error) {
      console.error('Failed to fetch site settings:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Lütfen zorunlu alanları doldurun');
      return;
    }

    setSending(true);
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Mesajınız gönderildi. En kısa sürede dönüş yapılacaktır.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setSending(false);
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'E-posta',
      description: 'Detaylı sorularınız için',
      value: siteSettings.general?.contact_email || 'info@kktcx.com',
      secondaryValue: 'destek@kktcx.com',
      action: `mailto:${siteSettings.general?.contact_email || 'info@kktcx.com'}`,
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: Phone,
      title: 'Telefon',
      description: 'Hızlı iletişim için',
      value: siteSettings.general?.contact_phone || '+90 533 XXX XX XX',
      action: `tel:${siteSettings.general?.contact_phone || ''}`,
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: MapPin,
      title: 'Adres',
      description: 'Ofisimiz',
      value: siteSettings.general?.contact_address || 'Girne, Kuzey Kıbrıs',
      color: 'from-blue-500 to-cyan-500'
    }
  ];

  const faqs = [
    {
      q: 'Profil nasıl oluşturabilirim?',
      a: 'Kayıt olun, profil bilgilerinizi doldurun ve onay için gönderin. Admin onayından sonra profiliniz yayınlanır.'
    },
    {
      q: 'Ödeme nasıl yapılır?',
      a: 'Premium paketler için güvenli ödeme altyapımızı kullanabilirsiniz. Kredi kartı ve havale kabul edilir.'
    },
    {
      q: 'Gizlilik nasıl sağlanıyor?',
      a: 'Tüm verileriniz şifreli olarak saklanır. Kimlik bilgileriniz asla üçüncü taraflarla paylaşılmaz.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Page Banner */}
      <PageBanner showText={false} height="h-[160px] md:h-[200px]" />
      
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#E91E63]/10 via-transparent to-transparent"></div>
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-[#E91E63]/10 rounded-full blur-[150px]"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E91E63]/10 border border-[#E91E63]/30 text-[#FF6090] text-sm mb-6">
              <MessageCircle className="w-4 h-4" />
              7/24 Destek
            </span>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 font-serif">
              {t('contact')}
            </h1>
            
            <p className="text-xl md:text-2xl text-white/60 mb-8">
              Sorularınız mı var? Size yardımcı olmaktan mutluluk duyarız.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {contactMethods.map((method, idx) => (
              <a
                key={idx}
                href={method.action || '#'}
                className="glass rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300 group cursor-pointer"
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${method.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <method.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-1">{method.title}</h3>
                <p className="text-white/50 text-sm mb-3">{method.description}</p>
                <p className="text-[#E91E63] font-medium">{method.value}</p>
                {method.secondaryValue && (
                  <p className="text-white/60 text-sm">{method.secondaryValue}</p>
                )}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div className="order-2 lg:order-1">
              <div className="glass rounded-3xl p-6 md:p-10">
                <div className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-white font-serif mb-2">Bize Mesaj Gönderin</h2>
                  <p className="text-white/60">En geç 24 saat içinde yanıtlıyoruz</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-white/70 text-sm mb-2 block">İsim *</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Adınız Soyadınız"
                        className="input-glass h-12"
                        data-testid="contact-name"
                      />
                    </div>
                    <div>
                      <label className="text-white/70 text-sm mb-2 block">E-posta *</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@ornek.com"
                        className="input-glass h-12"
                        data-testid="contact-email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-white/70 text-sm mb-2 block">Konu</label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Mesajınızın konusu"
                      className="input-glass h-12"
                      data-testid="contact-subject"
                    />
                  </div>

                  <div>
                    <label className="text-white/70 text-sm mb-2 block">Mesaj *</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Mesajınızı buraya yazın..."
                      rows={6}
                      className="input-glass resize-none"
                      data-testid="contact-message"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="btn-primary w-full py-6 text-lg"
                    disabled={sending}
                    data-testid="contact-submit"
                  >
                    {sending ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Gönder
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>

            {/* Info & FAQ */}
            <div className="order-1 lg:order-2 space-y-8">
              {/* Location Card */}
              <div className="glass rounded-3xl p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E91E63] to-[#9C27B0] flex items-center justify-center shrink-0">
                    <MapPin className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Merkez Ofis</h3>
                    <p className="text-white/60">
                      Girne, Kuzey Kıbrıs<br />
                      Türk Cumhuriyeti
                    </p>
                    <div className="flex items-center gap-2 mt-4 text-[#E91E63]">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Pzt-Cum: 09:00-18:00</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ */}
              <div>
                <h3 className="text-2xl font-bold text-white font-serif mb-6">Sık Sorulan Sorular</h3>
                <div className="space-y-4">
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="glass rounded-xl p-5">
                      <h4 className="text-white font-semibold mb-2">{faq.q}</h4>
                      <p className="text-white/60 text-sm">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4">Hızlı Bağlantılar</h3>
                <div className="space-y-3">
                  <a href="#" className="flex items-center justify-between text-white/70 hover:text-[#E91E63] transition-colors">
                    <span>Partner Olmak İstiyorum</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <a href="#" className="flex items-center justify-between text-white/70 hover:text-[#E91E63] transition-colors">
                    <span>Gizlilik Politikası</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <a href="#" className="flex items-center justify-between text-white/70 hover:text-[#E91E63] transition-colors">
                    <span>Kullanım Koşulları</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
