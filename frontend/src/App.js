import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, LanguageProvider, useAuth } from './context/AppContext';
import { Toaster } from './components/ui/sonner';
import AgeVerification from './components/AgeVerification';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import HomePage from './pages/HomePage';
import PartnersPage from './pages/PartnersPage';
import PartnerDetailPage from './pages/PartnerDetailPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AboutPage from './pages/static/AboutPage';
import FaqPage from './pages/static/FaqPage';
import ContactPage from './pages/static/ContactPage';
import PrivacyPage from './pages/static/PrivacyPage';
import TermsPage from './pages/static/TermsPage';

// User Dashboard Pages
import FavoritesPage from './pages/user/FavoritesPage';
import MessagesPage from './pages/user/MessagesPage';
import ConversationPage from './pages/user/ConversationPage';
import UserSettingsPage from './pages/user/UserSettingsPage';

// Partner Dashboard Pages
import PartnerDashboard from './pages/partner/PartnerDashboard';
import PartnerProfileEdit from './pages/partner/PartnerProfileEdit';
import PartnerPhotos from './pages/partner/PartnerPhotos';
import PartnerPackages from './pages/partner/PartnerPackages';
import PartnerAppointments from './pages/partner/PartnerAppointments';
import PaymentSuccess from './pages/partner/PaymentSuccess';
import BookAppointmentPage from './pages/BookAppointmentPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProfiles from './pages/admin/AdminProfiles';
import AdminSettings from './pages/admin/AdminSettings';
import AdminCities from './pages/admin/AdminCities';
import AdminCategories from './pages/admin/AdminCategories';
import AdminPackages from './pages/admin/AdminPackages';
import AdminSiteSettings from './pages/admin/AdminSiteSettings';
import AdminSEO from './pages/admin/AdminSEO';
import AdminContent from './pages/admin/AdminContent';
import AdminMedia from './pages/admin/AdminMedia';
import AdminSMS from './pages/admin/AdminSMS';
import AdminPartners from './pages/admin/AdminPartners';

// Protected Route Component
const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="animate-spin w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/tr/giris" replace />;
  }
  
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/tr" replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Redirect root to Turkish */}
      <Route path="/" element={<Navigate to="/tr" replace />} />
      
      {/* Language-prefixed routes */}
      {['tr', 'en', 'ru', 'de', 'el'].map((lang) => (
        <Route key={lang} path={`/${lang}`}>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="partnerler" element={<PartnersPage />} />
            <Route path="partners" element={<PartnersPage />} />
            <Route path="partner/:slug" element={<PartnerDetailPage />} />
            <Route path=":citySlug/partnerler" element={<PartnersPage />} />
            <Route path="giris" element={<LoginPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="kayit" element={<RegisterPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="hakkimizda" element={<AboutPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="sss" element={<FaqPage />} />
            <Route path="faq" element={<FaqPage />} />
            <Route path="iletisim" element={<ContactPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="gizlilik" element={<PrivacyPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="kullanim-sartlari" element={<TermsPage />} />
            <Route path="terms" element={<TermsPage />} />
          </Route>
          
          {/* User Dashboard Routes */}
          <Route path="kullanici" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="favoriler" element={<FavoritesPage />} />
            <Route path="mesajlar" element={<MessagesPage />} />
            <Route path="mesajlar/:conversationId" element={<ConversationPage />} />
            <Route path="ayarlar" element={<UserSettingsPage />} />
          </Route>
          
          {/* Partner Dashboard Routes */}
          <Route path="partner" element={
            <ProtectedRoute roles={['partner', 'admin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<PartnerDashboard />} />
            <Route path="profil" element={<PartnerProfileEdit />} />
            <Route path="fotograflar" element={<PartnerPhotos />} />
            <Route path="paketler" element={<PartnerPackages />} />
            <Route path="randevular" element={<PartnerAppointments />} />
            <Route path="mesajlar" element={<MessagesPage />} />
            <Route path="mesajlar/:conversationId" element={<ConversationPage />} />
            <Route path="payment/success" element={<PaymentSuccess />} />
          </Route>
          
          {/* Appointment Booking Route */}
          <Route path="partner/:slug/randevu" element={
            <ProtectedRoute>
              <PublicLayout><BookAppointmentPage /></PublicLayout>
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="admin" element={
            <ProtectedRoute roles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="site-ayarlari" element={<AdminSiteSettings />} />
            <Route path="seo" element={<AdminSEO />} />
            <Route path="icerik" element={<AdminContent />} />
            <Route path="kullanicilar" element={<AdminUsers />} />
            <Route path="partnerler" element={<AdminPartners />} />
            <Route path="profiller" element={<AdminProfiles />} />
            <Route path="sehirler" element={<AdminCities />} />
            <Route path="kategoriler" element={<AdminCategories />} />
            <Route path="paketler" element={<AdminPackages />} />
            <Route path="entegrasyonlar" element={<AdminSettings />} />
            <Route path="ceviri" element={<AdminContent />} />
            <Route path="raporlar" element={<AdminDashboard />} />
            <Route path="medya" element={<AdminMedia />} />
            <Route path="sms" element={<AdminSMS />} />
            <Route path="ayarlar" element={<AdminSettings />} />
          </Route>
        </Route>
      ))}
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/tr" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AgeVerification />
          <AppRoutes />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
