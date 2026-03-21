import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from '../context/AppContext';

const ageVerificationTexts = {
  tr: {
    title: 'Yaş Doğrulaması',
    legalWarning: 'Yasal Uyarı',
    warningText: 'Bu web sitesi yetişkinlere yönelik içerik barındırmaktadır. Siteye erişmek için 18 yaşından büyük olmanız gerekmektedir.',
    confirmText: 'Devam ederek, 18 yaşından büyük olduğunuzu ve yetişkinlere yönelik içerikleri görüntülemenin yasal olduğu bir bölgede bulunduğunuzu onaylarsınız.',
    acceptBtn: '18 Yaşındayım, Devam Et',
    declineBtn: 'Çıkış',
    footer: 'Bu siteyi kullanarak',
    termsLink: 'Kullanım Şartları',
    privacyLink: 'Gizlilik Politikası',
    footerEnd: "'nı kabul etmiş olursunuz.",
    and: 've',
  },
  en: {
    title: 'Age Verification',
    legalWarning: 'Legal Warning',
    warningText: 'This website contains adult-oriented content. You must be 18 years or older to access this site.',
    confirmText: 'By continuing, you confirm that you are 18 years or older and that viewing adult content is legal in your jurisdiction.',
    acceptBtn: "I'm 18+, Continue",
    declineBtn: 'Exit',
    footer: 'By using this site, you agree to our',
    termsLink: 'Terms of Service',
    privacyLink: 'Privacy Policy',
    footerEnd: '.',
    and: 'and',
  },
  ru: {
    title: 'Подтверждение возраста',
    legalWarning: 'Юридическое предупреждение',
    warningText: 'Этот веб-сайт содержит контент для взрослых. Для доступа к сайту вам должно быть 18 лет или больше.',
    confirmText: 'Продолжая, вы подтверждаете, что вам 18 лет или больше, и просмотр контента для взрослых является законным в вашей юрисдикции.',
    acceptBtn: 'Мне 18+, Продолжить',
    declineBtn: 'Выход',
    footer: 'Используя этот сайт, вы соглашаетесь с',
    termsLink: 'Условиями использования',
    privacyLink: 'Политикой конфиденциальности',
    footerEnd: '.',
    and: 'и',
  },
  de: {
    title: 'Altersverifikation',
    legalWarning: 'Rechtlicher Hinweis',
    warningText: 'Diese Website enthält Inhalte für Erwachsene. Sie müssen 18 Jahre oder älter sein, um auf diese Website zuzugreifen.',
    confirmText: 'Mit dem Fortfahren bestätigen Sie, dass Sie 18 Jahre oder älter sind und dass das Ansehen von Inhalten für Erwachsene in Ihrem Land legal ist.',
    acceptBtn: 'Ich bin 18+, Fortfahren',
    declineBtn: 'Beenden',
    footer: 'Durch die Nutzung dieser Website stimmen Sie unseren',
    termsLink: 'Nutzungsbedingungen',
    privacyLink: 'Datenschutzrichtlinie',
    footerEnd: ' zu.',
    and: 'und',
  },
  el: {
    title: 'Επαλήθευση Ηλικίας',
    legalWarning: 'Νομική Προειδοποίηση',
    warningText: 'Αυτός ο ιστότοπος περιέχει περιεχόμενο για ενήλικες. Πρέπει να είστε 18 ετών ή άνω για να έχετε πρόσβαση σε αυτόν τον ιστότοπο.',
    confirmText: 'Συνεχίζοντας, επιβεβαιώνετε ότι είστε 18 ετών ή άνω και ότι η προβολή περιεχομένου για ενήλικες είναι νόμιμη στη δικαιοδοσία σας.',
    acceptBtn: 'Είμαι 18+, Συνέχεια',
    declineBtn: 'Έξοδος',
    footer: 'Χρησιμοποιώντας αυτόν τον ιστότοπο, συμφωνείτε με τους',
    termsLink: 'Όρους Χρήσης',
    privacyLink: 'Πολιτική Απορρήτου',
    footerEnd: '.',
    and: 'και',
  },
};

const AgeVerification = () => {
  const [show, setShow] = useState(false);
  const { lang } = useLanguage();
  const texts = ageVerificationTexts[lang] || ageVerificationTexts.en;

  useEffect(() => {
    const verified = localStorage.getItem('age_verified');
    if (!verified) {
      setShow(true);
      document.body.style.overflow = 'hidden';
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('age_verified', 'true');
    setShow(false);
    document.body.style.overflow = 'auto';
  };

  const handleDecline = () => {
    window.location.href = 'https://www.google.com';
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl"></div>
      
      {/* Modal */}
      <div className="relative w-full max-w-lg animate-scale-in">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#E91E63] via-[#9C27B0] to-[#E91E63] rounded-3xl blur-xl opacity-50 animate-pulse"></div>
        
        <div className="relative bg-[#0A0A0F] border border-[#E91E63]/30 rounded-3xl p-8 md:p-10">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E91E63] to-[#9C27B0] flex items-center justify-center animate-pulse-glow">
              <span className="text-4xl font-bold text-white">18+</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-4 font-serif">
            {texts.title}
          </h2>

          {/* Warning */}
          <div className="bg-[#E91E63]/10 border border-[#E91E63]/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-[#E91E63] shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium mb-1">{texts.legalWarning}</p>
                <p className="text-white/70 text-sm leading-relaxed">
                  {texts.warningText}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-white/60 text-center mb-8 text-sm leading-relaxed">
            {texts.confirmText}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleAccept}
              className="flex-1 btn-primary py-6 text-lg font-semibold"
              data-testid="age-accept"
            >
              <Shield className="w-5 h-5 mr-2" />
              {texts.acceptBtn}
            </Button>
            <Button
              onClick={handleDecline}
              variant="outline"
              className="flex-1 btn-outline py-6 text-lg"
              data-testid="age-decline"
            >
              {texts.declineBtn}
            </Button>
          </div>

          {/* Footer */}
          <p className="text-white/40 text-xs text-center mt-6">
            {texts.footer}{' '}
            <a href={`/${lang}/kullanim-sartlari`} className="text-[#E91E63] hover:underline">{texts.termsLink}</a>
            {' '}{texts.and}{' '}
            <a href={`/${lang}/gizlilik`} className="text-[#E91E63] hover:underline">{texts.privacyLink}</a>
            {texts.footerEnd}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgeVerification;
