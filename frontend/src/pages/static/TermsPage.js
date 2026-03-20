import React from 'react';
import { useLanguage } from '../../context/AppContext';

const TermsPage = () => {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white font-serif mb-8 text-center">
          Kullanım Şartları
        </h1>

        <div className="glass rounded-2xl p-6 md:p-8 prose prose-invert max-w-none">
          <p className="text-white/60 mb-6">Son güncelleme: Ocak 2025</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">1. Kabul</h2>
            <p className="text-white/70 mb-4">
              KKTCX platformunu kullanarak bu Kullanım Şartlarını kabul etmiş sayılırsınız. Bu şartları kabul etmiyorsanız, platformu kullanmayın.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">2. Hizmet Tanımı</h2>
            <p className="text-white/70 mb-4">
              KKTCX, Kuzey Kıbrıs'ta sosyal eşlik hizmetleri için bir bağlantı platformudur. Platform, kullanıcıları partnerlerle buluşturur ancak doğrudan hizmet sunmaz.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">3. Yaş Sınırı</h2>
            <p className="text-white/70 mb-4">
              Platformumuzu kullanmak için en az 18 yaşında olmanız gerekmektedir. Kayıt olarak 18 yaşından büyük olduğunuzu onaylarsınız.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">4. Hesap Sorumlulukları</h2>
            <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
              <li>Doğru ve güncel bilgiler sağlamakla yükümlüsünüz</li>
              <li>Hesap güvenliğinizden siz sorumlusunuz</li>
              <li>Hesabınızı başkalarıyla paylaşamazsınız</li>
              <li>Yasadışı faaliyetler için kullanamazsınız</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">5. Partner Kuralları</h2>
            <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
              <li>Gerçek ve güncel fotoğraflar kullanmalısınız</li>
              <li>Yanıltıcı bilgi vermemelisiniz</li>
              <li>Yasal hizmetler sunmalısınız</li>
              <li>Diğer kullanıcılara saygılı olmalısınız</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">6. Yasaklı İçerik</h2>
            <p className="text-white/70 mb-4">Aşağıdaki içerikler kesinlikle yasaktır:</p>
            <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
              <li>Yasadışı hizmet teklifleri</li>
              <li>Cinsel içerikli materyal</li>
              <li>Nefret söylemi ve ayrımcılık</li>
              <li>Spam ve dolandırıcılık</li>
              <li>Telif hakkı ihlalleri</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">7. Ödeme ve İadeler</h2>
            <p className="text-white/70 mb-4">
              Premium paket ödemeleri Stripe üzerinden işlenir. İade talepleri duruma göre değerlendirilir. Detaylar için destek ekibimizle iletişime geçin.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">8. Sorumluluk Reddi</h2>
            <p className="text-white/70 mb-4">
              KKTCX, kullanıcılar ve partnerler arasındaki etkileşimlerden sorumlu değildir. Platform yalnızca bir bağlantı hizmeti sunar.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">9. Hesap Sonlandırma</h2>
            <p className="text-white/70 mb-4">
              Bu şartların ihlali durumunda hesabınızı önceden bildirimde bulunmaksızın askıya alma veya sonlandırma hakkımız saklıdır.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">10. Değişiklikler</h2>
            <p className="text-white/70 mb-4">
              Bu şartları zaman zaman güncelleyebiliriz. Değişiklikler yayınlandıktan sonra platformu kullanmaya devam etmeniz, güncellenmiş şartları kabul ettiğiniz anlamına gelir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">11. İletişim</h2>
            <p className="text-white/70">
              Sorularınız için:{' '}
              <a href="mailto:legal@kktcx.com" className="text-[#D4AF37] hover:underline">
                legal@kktcx.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
