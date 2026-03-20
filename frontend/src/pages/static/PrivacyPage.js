import React from 'react';
import { useLanguage } from '../../context/AppContext';

const PrivacyPage = () => {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white font-serif mb-8 text-center">
          Gizlilik Politikası
        </h1>

        <div className="glass rounded-2xl p-6 md:p-8 prose prose-invert max-w-none">
          <p className="text-white/60 mb-6">Son güncelleme: Ocak 2025</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">1. Giriş</h2>
            <p className="text-white/70 mb-4">
              KKTCX ("biz", "bizim" veya "platform") olarak, gizliliğinize saygı duyuyor ve kişisel verilerinizin korunmasına büyük önem veriyoruz. Bu Gizlilik Politikası, hizmetlerimizi kullanırken topladığımız, kullandığımız ve paylaştığımız bilgileri açıklamaktadır.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">2. Topladığımız Bilgiler</h2>
            <p className="text-white/70 mb-4">Aşağıdaki bilgileri toplayabiliriz:</p>
            <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
              <li>Hesap bilgileri (e-posta, telefon, isim)</li>
              <li>Profil bilgileri (fotoğraf, açıklama, konum)</li>
              <li>İletişim verileri (mesajlar)</li>
              <li>Kullanım verileri (ziyaret istatistikleri)</li>
              <li>Ödeme bilgileri (Stripe aracılığıyla işlenir)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">3. Bilgilerin Kullanımı</h2>
            <p className="text-white/70 mb-4">Topladığımız bilgileri şu amaçlarla kullanırız:</p>
            <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
              <li>Hizmetlerimizi sunmak ve geliştirmek</li>
              <li>Hesabınızı yönetmek</li>
              <li>Sizinle iletişim kurmak</li>
              <li>Güvenliği sağlamak</li>
              <li>Yasal yükümlülükleri yerine getirmek</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">4. Bilgi Paylaşımı</h2>
            <p className="text-white/70 mb-4">
              Kişisel bilgilerinizi yalnızca aşağıdaki durumlarda üçüncü taraflarla paylaşırız:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
              <li>Onayınız olduğunda</li>
              <li>Hizmet sağlayıcılarımızla (ödeme işlemcileri, SMS hizmeti)</li>
              <li>Yasal zorunluluk durumunda</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">5. Veri Güvenliği</h2>
            <p className="text-white/70 mb-4">
              Verilerinizi korumak için endüstri standardı güvenlik önlemleri alıyoruz. Ancak, internet üzerinden hiçbir veri aktarımının %100 güvenli olmadığını unutmayın.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">6. Haklarınız</h2>
            <p className="text-white/70 mb-4">Aşağıdaki haklara sahipsiniz:</p>
            <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
              <li>Verilerinize erişim talep etme</li>
              <li>Verilerinizin düzeltilmesini isteme</li>
              <li>Verilerinizin silinmesini talep etme</li>
              <li>Veri işlemeye itiraz etme</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">7. İletişim</h2>
            <p className="text-white/70">
              Gizlilik politikamız hakkında sorularınız için:{' '}
              <a href="mailto:privacy@kktcx.com" className="text-[#D4AF37] hover:underline">
                privacy@kktcx.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
