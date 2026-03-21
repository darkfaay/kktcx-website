import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/AppContext';
import { Shield, Users, Heart, Star, Award, Sparkles, CheckCircle, ArrowRight, Globe, Lock, Clock } from 'lucide-react';
import { Button } from '../../components/ui/button';
import PageBanner from '../../components/PageBanner';

const AboutPage = () => {
  const { lang, t } = useLanguage();

  const stats = [
    { value: '500+', label: 'Aktif Partner' },
    { value: '18', label: 'Şehir' },
    { value: '10K+', label: 'Mutlu Kullanıcı' },
    { value: '24/7', label: 'Destek' },
  ];

  const values = [
    {
      icon: Shield,
      title: 'Güvenlik',
      description: 'Tüm profiller admin onayından geçer. Verileriniz şifreli şekilde saklanır.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Users,
      title: 'Profesyonellik',
      description: 'Deneyimli ve profesyonel partnerler. Her etkinlik için mükemmel eşlik.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Heart,
      title: 'Saygı',
      description: 'Karşılıklı saygı ilkesi. Tüm kullanıcılarımız değerlidir.',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: Star,
      title: 'Kalite',
      description: 'Premium deneyim. Kaliteli profiller ve hızlı iletişim.',
      color: 'from-amber-500 to-orange-500'
    },
  ];

  const features = [
    'Doğrulanmış profiller',
    'Güvenli mesajlaşma',
    'Gizlilik garantisi',
    'Premium vitrin alanları',
    'Çoklu dil desteği',
    '7/24 müşteri desteği'
  ];

  return (
    <div className="min-h-screen">
      {/* Page Banner */}
      <PageBanner showText={false} height="h-[160px] md:h-[200px]" />
      
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#E91E63]/10 via-transparent to-transparent"></div>
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#E91E63]/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-[#9C27B0]/10 rounded-full blur-[150px]"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E91E63]/10 border border-[#E91E63]/30 text-[#FF6090] text-sm mb-6">
              <Award className="w-4 h-4" />
              Kıbrıs'ın #1 Premium Platformu
            </span>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 font-serif">
              Hakkımızda
            </h1>
            
            <p className="text-xl md:text-2xl text-white/60 mb-8 leading-relaxed">
              KKTCX, Kuzey ve Güney Kıbrıs'ta sosyal eşlik hizmetlerini bir araya getiren 
              <span className="text-[#E91E63]"> premium </span>
              platformdur.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              {stats.map((stat, idx) => (
                <div key={idx} className="glass rounded-xl p-6 text-center">
                  <p className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</p>
                  <p className="text-white/50 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left - Text */}
              <div>
                <span className="text-[#E91E63] text-sm uppercase tracking-wider">Misyonumuz</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-6 font-serif">
                  Sosyal Eşlik Hizmetlerinde Yeni Bir Dönem
                </h2>
                <div className="text-white/70 space-y-4 text-lg">
                  <p>
                    Amacımız, özel etkinlikler, iş yemekleri, sosyal organizasyonlar ve kültürel 
                    aktiviteler için güvenilir ve profesyonel eşlik hizmeti sunmaktır.
                  </p>
                  <p>
                    Platform, sosyal companionship marketplace konseptinde kurgulanmıştır. 
                    Kullanıcılarımız, ihtiyaçlarına uygun partnerleri kolayca bulabilir.
                  </p>
                </div>
                
                {/* Features List */}
                <div className="grid grid-cols-2 gap-3 mt-8">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-[#E91E63] shrink-0" />
                      <span className="text-white/70">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Right - Visual */}
              <div className="relative">
                <div className="aspect-square rounded-3xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#E91E63] via-[#9C27B0] to-[#673AB7] opacity-20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#E91E63] to-[#9C27B0] flex items-center justify-center">
                        <Sparkles className="w-16 h-16 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white font-serif">Premium Deneyim</h3>
                      <p className="text-white/60 mt-2">Her detay düşünüldü</p>
                    </div>
                  </div>
                </div>
                
                {/* Floating Cards */}
                <div className="absolute -top-4 -right-4 glass rounded-xl p-4 animate-float">
                  <Globe className="w-8 h-8 text-[#E91E63]" />
                  <p className="text-white text-sm mt-2">5 Dil</p>
                </div>
                <div className="absolute -bottom-4 -left-4 glass rounded-xl p-4 animate-float" style={{ animationDelay: '0.5s' }}>
                  <Lock className="w-8 h-8 text-[#9C27B0]" />
                  <p className="text-white text-sm mt-2">Güvenli</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#9C27B0]/5 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <span className="text-[#E91E63] text-sm uppercase tracking-wider">Değerlerimiz</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 font-serif">
              Bizi Farklı Kılan
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value, idx) => (
              <div 
                key={idx}
                className="glass rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300 group"
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-white/60 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-[#E91E63] text-sm uppercase tracking-wider">Kapsam</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-6 font-serif">
              Tüm Kıbrıs'ta Hizmet
            </h2>
            <p className="text-white/60 text-lg mb-8">
              Kuzey ve Güney Kıbrıs'ın tüm şehirlerinde aktif partnerlerimiz bulunmaktadır.
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="glass rounded-2xl p-6">
                <div className="w-4 h-4 rounded-full bg-red-500 mx-auto mb-3"></div>
                <h3 className="text-white font-semibold mb-2">Kuzey Kıbrıs (KKTC)</h3>
                <p className="text-white/50 text-sm">
                  Girne, Lefkoşa, Gazimağusa, Güzelyurt, İskele ve diğer şehirler
                </p>
              </div>
              <div className="glass rounded-2xl p-6">
                <div className="w-4 h-4 rounded-full bg-blue-500 mx-auto mb-3"></div>
                <h3 className="text-white font-semibold mb-2">Güney Kıbrıs</h3>
                <p className="text-white/50 text-sm">
                  Lefkoşa, Limasol, Larnaka, Baf, Ayia Napa ve diğer şehirler
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#E91E63]/20 via-[#9C27B0]/20 to-[#E91E63]/20"></div>
        
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-serif">
            Aramıza Katılın
          </h2>
          <p className="text-white/70 mb-8 max-w-2xl mx-auto text-lg">
            Premium eşlik hizmetleri dünyasına adım atın. Partner olun veya partnerlerimizi keşfedin.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={`/${lang}/kayit?role=partner`}>
              <Button className="btn-primary px-8 py-6 text-lg">
                Partner Ol
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={`/${lang}/partnerler`}>
              <Button variant="outline" className="btn-outline px-8 py-6 text-lg">
                Partnerleri Gör
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
