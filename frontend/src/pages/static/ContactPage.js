import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/AppContext';
import { Send, MessageCircle, Instagram, Facebook, MessageSquare } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';
import PageBanner from '../../components/PageBanner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ContactPage = () => {
  const { t } = useLanguage();
  const [siteSettings, setSiteSettings] = useState({ general: {}, social: {} });
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
          social: response.data.social || {},
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
    try {
      await axios.post(`${API_URL}/api/contact`, formData);
      toast.success('Mesajınız gönderildi. En kısa sürede dönüş yapılacaktır.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setSending(false);
    }
  };

  const socialLinks = [
    {
      name: 'Instagram',
      icon: Instagram,
      url: siteSettings.social?.instagram,
      color: 'from-pink-500 to-purple-500',
      hoverColor: 'hover:from-pink-600 hover:to-purple-600'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: siteSettings.social?.facebook,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700'
    },
    {
      name: 'Telegram',
      icon: MessageSquare,
      url: siteSettings.social?.telegram,
      color: 'from-sky-400 to-sky-500',
      hoverColor: 'hover:from-sky-500 hover:to-sky-600'
    },
    {
      name: 'Twitter',
      icon: () => (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ),
      url: siteSettings.social?.twitter,
      color: 'from-gray-700 to-gray-800',
      hoverColor: 'hover:from-gray-800 hover:to-gray-900'
    },
  ].filter(link => link.url);

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <PageBanner 
        title="İletişim"
        subtitle="Bizimle iletişime geçin"
      />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          
          {/* Social Media Section */}
          {socialLinks.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                <MessageCircle className="inline-block w-6 h-6 mr-2 text-[#E91E63]" />
                Sosyal Medyadan Ulaşın
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br ${social.color} ${social.hoverColor} transition-all duration-300 transform hover:scale-105 hover:shadow-xl`}
                  >
                    <social.icon className="w-8 h-8 text-white mb-2" />
                    <span className="text-white font-medium">{social.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Contact Form */}
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-[#E91E63] to-[#9C27B0] flex items-center justify-center">
                <Send className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Mesaj Gönderin</h2>
              <p className="text-white/60">Formu doldurun, en kısa sürede size dönüş yapalım</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-white/70 text-sm mb-2 block">Adınız *</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#E91E63]/50"
                    placeholder="Adınızı girin"
                    required
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm mb-2 block">E-posta *</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#E91E63]/50"
                    placeholder="E-posta adresiniz"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="text-white/70 text-sm mb-2 block">Konu</label>
                <Input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#E91E63]/50"
                  placeholder="Mesajınızın konusu"
                />
              </div>
              
              <div>
                <label className="text-white/70 text-sm mb-2 block">Mesajınız *</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#E91E63]/50 min-h-[150px]"
                  placeholder="Mesajınızı yazın..."
                  required
                />
              </div>
              
              <Button
                type="submit"
                disabled={sending}
                className="w-full bg-gradient-to-r from-[#E91E63] to-[#9C27B0] hover:from-[#D81B60] hover:to-[#8E24AA] text-white py-6 text-lg font-semibold rounded-xl"
              >
                {sending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Gönderiliyor...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Mesajı Gönder
                  </div>
                )}
              </Button>
            </form>
          </div>

          {/* Info Text */}
          <p className="text-center text-white/40 mt-8 text-sm">
            Mesajlarınıza genellikle 24 saat içinde yanıt veriyoruz.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
