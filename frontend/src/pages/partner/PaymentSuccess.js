import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth, useLanguage } from '../../context/AppContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const { api } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('loading'); // loading, success, failed
  const [paymentInfo, setPaymentInfo] = useState(null);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      pollPaymentStatus();
    } else {
      setStatus('failed');
    }
  }, [sessionId]);

  const pollPaymentStatus = async (attempts = 0) => {
    const maxAttempts = 5;
    const pollInterval = 2000;

    if (attempts >= maxAttempts) {
      setStatus('failed');
      return;
    }

    try {
      const response = await api.get(`/payments/status/${sessionId}`);
      setPaymentInfo(response.data);

      if (response.data.payment_status === 'paid') {
        setStatus('success');
        return;
      } else if (response.data.status === 'expired') {
        setStatus('failed');
        return;
      }

      // Continue polling
      setTimeout(() => pollPaymentStatus(attempts + 1), pollInterval);
    } catch (error) {
      console.error('Error checking payment:', error);
      setStatus('failed');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mx-auto mb-4" />
          <p className="text-white/60">Ödeme durumu kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white font-serif mb-4">Ödeme Başarılı!</h1>
          <p className="text-white/60 mb-2">Paketiniz başarıyla aktifleştirildi.</p>
          {paymentInfo && (
            <p className="text-[#D4AF37] font-semibold">
              ${(paymentInfo.amount).toFixed(2)} {paymentInfo.currency?.toUpperCase()}
            </p>
          )}
          <div className="flex gap-4 justify-center mt-8">
            <Link to={`/${lang}/partner`}>
              <Button className="btn-primary">
                Panele Dön
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white font-serif mb-4">Ödeme Başarısız</h1>
        <p className="text-white/60 mb-8">
          Ödeme işlemi tamamlanamadı. Lütfen tekrar deneyin.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to={`/${lang}/partner/paketler`}>
            <Button className="btn-primary">
              Tekrar Dene
            </Button>
          </Link>
          <Link to={`/${lang}/partner`}>
            <Button variant="outline" className="btn-outline">
              Panele Dön
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
