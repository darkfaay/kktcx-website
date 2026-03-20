import React from 'react';
import { useLanguage } from '../../context/AppContext';
import { Shield, Users, Heart, Star } from 'lucide-react';

const AboutPage = () => {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white font-serif mb-6">
            {t('about')}
          </h1>
          <p className="text-xl text-white/60">
            Kuzey Kıbrıs'ın premium sosyal eşlik platformu
          </p>
        </div>

        {/* Story */}
        <div className="glass rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-white font-serif mb-4">Hikayemiz</h2>
          <div className="text-white/70 space-y-4">
            <p>
              KKTCX, Kuzey Kıbrıs'ta sosyal eşlik hizmetlerini bir araya getiren premium bir platformdur. 
              Amacımız, özel etkinlikler, iş yemekleri, sosyal organizasyonlar ve kültürel aktiviteler için 
              güvenilir ve profesyonel eşlik hizmeti sunmaktır.
            </p>
            <p>
              Platform, escort mantığından farklı olarak sosyal companionship marketplace konseptinde 
              kurgulanmıştır. Kullanıcılarımız, ihtiyaçlarına uygun partnerleri kolayca bulabilir ve 
              güvenli bir şekilde iletişim kurabilirler.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="glass rounded-xl p-6">
            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Güvenlik</h3>
            <p className="text-white/60">
              Tüm profiller admin onayından geçer. Kullanıcı bilgileri güvenle saklanır ve 
              gizlilik ön planda tutulur.
            </p>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Profesyonellik</h3>
            <p className="text-white/60">
              Platformumuzdaki partnerler deneyimli ve profesyonel kişilerden oluşur. 
              Her etkinlik için ideal eşlik.
            </p>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Saygı</h3>
            <p className="text-white/60">
              Tüm kullanıcılarımıza ve partnerlerimize karşılıklı saygı ilkesiyle yaklaşıyoruz. 
              Her birey değerlidir.
            </p>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Kalite</h3>
            <p className="text-white/60">
              Premium deneyim sunmayı hedefliyoruz. Kaliteli profiller, hızlı iletişim ve 
              mükemmel kullanıcı deneyimi.
            </p>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center glass rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white font-serif mb-4">
            Sorularınız mı var?
          </h2>
          <p className="text-white/60 mb-6">
            Bize ulaşmaktan çekinmeyin. Size yardımcı olmaktan mutluluk duyarız.
          </p>
          <a 
            href="mailto:info@kktcx.com" 
            className="text-[#D4AF37] hover:underline text-lg"
          >
            info@kktcx.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
