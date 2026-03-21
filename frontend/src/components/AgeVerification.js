import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Shield } from 'lucide-react';
import { Button } from './ui/button';

const AgeVerification = () => {
  const [show, setShow] = useState(false);

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
            Yaş Doğrulaması
          </h2>

          {/* Warning */}
          <div className="bg-[#E91E63]/10 border border-[#E91E63]/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-[#E91E63] shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium mb-1">Yasal Uyarı</p>
                <p className="text-white/70 text-sm leading-relaxed">
                  Bu web sitesi yetişkinlere yönelik içerik barındırmaktadır. 
                  Siteye erişmek için 18 yaşından büyük olmanız gerekmektedir.
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-white/60 text-center mb-8 text-sm leading-relaxed">
            Devam ederek, 18 yaşından büyük olduğunuzu ve yetişkinlere yönelik içerikleri 
            görüntülemenin yasal olduğu bir bölgede bulunduğunuzu onaylarsınız.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleAccept}
              className="flex-1 btn-primary py-6 text-lg font-semibold"
              data-testid="age-accept"
            >
              <Shield className="w-5 h-5 mr-2" />
              18 Yaşındayım, Devam Et
            </Button>
            <Button
              onClick={handleDecline}
              variant="outline"
              className="flex-1 btn-outline py-6 text-lg"
              data-testid="age-decline"
            >
              Çıkış
            </Button>
          </div>

          {/* Footer */}
          <p className="text-white/40 text-xs text-center mt-6">
            Bu siteyi kullanarak{' '}
            <a href="/tr/kullanim-sartlari" className="text-[#E91E63] hover:underline">Kullanım Şartları</a>
            {' '}ve{' '}
            <a href="/tr/gizlilik" className="text-[#E91E63] hover:underline">Gizlilik Politikası</a>
            'nı kabul etmiş olursunuz.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgeVerification;
