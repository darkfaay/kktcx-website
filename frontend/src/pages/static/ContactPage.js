import React, { useState } from 'react';
import { useLanguage } from '../../context/AppContext';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';

const ContactPage = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

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

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white font-serif mb-4">
            {t('contact')}
          </h1>
          <p className="text-white/60">Bize ulaşın, size yardımcı olalım</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="glass rounded-xl p-6">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h3 className="text-white font-semibold mb-2">E-posta</h3>
              <a href="mailto:info@kktcx.com" className="text-white/60 hover:text-[#D4AF37]">
                info@kktcx.com
              </a>
              <br />
              <a href="mailto:destek@kktcx.com" className="text-white/60 hover:text-[#D4AF37]">
                destek@kktcx.com
              </a>
            </div>

            <div className="glass rounded-xl p-6">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h3 className="text-white font-semibold mb-2">Telefon</h3>
              <p className="text-white/60">+90 392 XXX XX XX</p>
            </div>

            <div className="glass rounded-xl p-6">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h3 className="text-white font-semibold mb-2">Adres</h3>
              <p className="text-white/60">
                Girne, Kuzey Kıbrıs
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <div className="glass rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-semibold text-white mb-6">Bize Yazın</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">İsim *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Adınız Soyadınız"
                      className="input-glass"
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
                      className="input-glass"
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
                    className="input-glass"
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
                  className="btn-primary w-full py-6"
                  disabled={sending}
                  data-testid="contact-submit"
                >
                  <Send className="w-5 h-5 mr-2" />
                  {sending ? 'Gönderiliyor...' : 'Gönder'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
