import React from 'react';
import { useLanguage } from '../../context/AppContext';
import { ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion';

const FaqPage = () => {
  const { t, lang } = useLanguage();

  const faqs = [
    {
      question: 'KKTCX nedir?',
      answer: 'KKTCX, Kuzey Kıbrıs\'ta sosyal eşlik hizmetleri sunan premium bir platformdur. Özel etkinlikler, iş yemekleri, sosyal organizasyonlar ve kültürel aktiviteler için güvenilir partner bulmanızı sağlar.'
    },
    {
      question: 'Nasıl üye olabilirim?',
      answer: 'Sağ üstteki "Kayıt Ol" butonuna tıklayarak hızlıca üye olabilirsiniz. E-posta, telefon ve şifre bilgilerinizi girerek hesabınızı oluşturabilirsiniz.'
    },
    {
      question: 'Partner olmak için ne yapmalıyım?',
      answer: 'Kayıt olurken "Partner" seçeneğini işaretleyin. Ardından profilinizi oluşturun, fotoğraflarınızı yükleyin ve admin onayına gönderin. Onay aldıktan sonra ilanınız yayına alınır.'
    },
    {
      question: 'Profil onay süreci ne kadar sürer?',
      answer: 'Genellikle 24-48 saat içinde profiliniz incelenir. Tüm bilgilerin eksiksiz ve kurallara uygun olması durumunda onay hızlı bir şekilde verilir.'
    },
    {
      question: 'Öne çıkan ve vitrin paketleri ne işe yarar?',
      answer: 'Premium paketler, profilinizin daha fazla kişi tarafından görülmesini sağlar. Öne çıkan profiller listeleme sayfalarında üst sıralarda yer alırken, vitrin profilleri ana sayfa ve şehir sayfalarında özel alanlarda gösterilir.'
    },
    {
      question: 'Ödeme güvenli mi?',
      answer: 'Evet, tüm ödemeler Stripe altyapısı üzerinden güvenli bir şekilde işlenir. Kredi kartı bilgileriniz sunucularımızda saklanmaz.'
    },
    {
      question: 'Mesajlaşma nasıl çalışıyor?',
      answer: 'Platform içi mesajlaşma sistemiyle partnerlerle güvenli bir şekilde iletişim kurabilirsiniz. Mesajlarınız şifrelenerek saklanır ve yeni mesaj geldiğinde SMS bildirimi alırsınız.'
    },
    {
      question: 'Profilimi nasıl silebilirim?',
      answer: 'Hesap ayarları sayfasından hesabınızı silme talebinde bulunabilirsiniz. Talebiniz 48 saat içinde işleme alınır.'
    },
    {
      question: 'Şüpheli bir profil gördüm, ne yapmalıyım?',
      answer: 'Uygunsuz veya şüpheli profilleri "Şikayet Et" butonu ile bildirebilirsiniz. Ekibimiz en kısa sürede inceleyecektir.'
    },
    {
      question: 'Platform hangi dilleri destekliyor?',
      answer: 'KKTCX, Türkçe, İngilizce, Rusça ve Almanca dillerini desteklemektedir. Dil tercihini sayfanın üst kısmından değiştirebilirsiniz.'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white font-serif mb-4">
            {t('faq')}
          </h1>
          <p className="text-white/60">Sıkça sorulan sorular ve cevapları</p>
        </div>

        <div className="glass rounded-2xl p-6 md:p-8">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-b border-white/10 last:border-0"
              >
                <AccordionTrigger className="text-left text-white hover:text-[#D4AF37] py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-white/60 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-12 text-center">
          <p className="text-white/60 mb-4">Sorunuzun cevabını bulamadınız mı?</p>
          <a 
            href="mailto:destek@kktcx.com"
            className="text-[#D4AF37] hover:underline"
          >
            destek@kktcx.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
