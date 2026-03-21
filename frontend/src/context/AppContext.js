import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  useEffect(() => {
    if (token) {
      api.defaults.headers.Authorization = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { access_token, user: userData } = response.data;
    localStorage.setItem('token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    const response = await api.post('/auth/register', data);
    const { access_token, user: userData } = response.data;
    localStorage.setItem('token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data) => {
    await api.put('/auth/profile', null, { params: data });
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, api }}>
      {children}
    </AuthContext.Provider>
  );
};

// Language Context
const LanguageContext = createContext(null);

const translations = {
  tr: {
    home: 'Ana Sayfa',
    partners: 'Partnerler',
    favorites: 'Favoriler',
    messages: 'Mesajlar',
    profile: 'Profil',
    login: 'Giriş Yap',
    register: 'Kayıt Ol',
    logout: 'Çıkış Yap',
    search: 'Ara',
    filter: 'Filtrele',
    city: 'Şehir',
    category: 'Kategori',
    age: 'Yaş',
    language: 'Dil',
    availableToday: 'Bugün Müsait',
    availableTonight: 'Bu Akşam Müsait',
    featured: 'Öne Çıkan',
    verified: 'Doğrulanmış',
    vitrin: 'Vitrin',
    sendMessage: 'Mesaj Gönder',
    addFavorite: 'Favorilere Ekle',
    removeFavorite: 'Favorilerden Çıkar',
    becomePartner: 'Partner Ol',
    browsePartners: 'Partnerleri Keşfet',
    heroTitle: 'Kuzey Kıbrıs\'ın Premium Sosyal Platformu',
    heroSubtitle: 'Özel etkinlikler, iş yemekleri ve sosyal organizasyonlar için güvenilir eşlik hizmeti',
    whyUs: 'Neden KKTCX?',
    whyUsDesc: 'Güvenli, profesyonel ve şık sosyal eşlik deneyimi',
    todayAvailable: 'Bugün Müsait',
    featuredPartners: 'Öne Çıkan Partnerler',
    vitrinPartners: 'Vitrin',
    byCity: 'Şehirlere Göre',
    allPartners: 'Tüm Partnerler',
    noResults: 'Sonuç bulunamadı',
    loading: 'Yükleniyor...',
    error: 'Bir hata oluştu',
    about: 'Hakkımızda',
    faq: 'SSS',
    contact: 'İletişim',
    privacy: 'Gizlilik',
    terms: 'Kullanım Şartları',
    cookies: 'Çerezler',
    packages: 'Paketler',
    dashboard: 'Panel',
    settings: 'Ayarlar',
    myProfile: 'Profilim',
    myListings: 'İlanlarım',
    approval: 'Onay',
    pending: 'Beklemede',
    approved: 'Onaylandı',
    rejected: 'Reddedildi',
    draft: 'Taslak',
    submit: 'Gönder',
    save: 'Kaydet',
    cancel: 'İptal',
    delete: 'Sil',
    edit: 'Düzenle',
    view: 'Görüntüle',
    next: 'İleri',
    back: 'Geri',
    finish: 'Bitir',
    step: 'Adım',
    of: '/',
    email: 'E-posta',
    password: 'Şifre',
    confirmPassword: 'Şifre Tekrar',
    phone: 'Telefon',
    name: 'İsim',
    nickname: 'Takma Ad',
    description: 'Açıklama',
    shortDescription: 'Kısa Açıklama',
    detailedDescription: 'Detaylı Açıklama',
    photos: 'Fotoğraflar',
    uploadPhoto: 'Fotoğraf Yükle',
    setCover: 'Kapak Yap',
    availability: 'Müsaitlik',
    languages: 'Diller',
    categories: 'Kategoriler',
    turkish: 'Türkçe',
    english: 'İngilizce',
    russian: 'Rusça',
    german: 'Almanca',
  },
  en: {
    home: 'Home',
    partners: 'Partners',
    favorites: 'Favorites',
    messages: 'Messages',
    profile: 'Profile',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    search: 'Search',
    filter: 'Filter',
    city: 'City',
    category: 'Category',
    age: 'Age',
    language: 'Language',
    availableToday: 'Available Today',
    availableTonight: 'Available Tonight',
    featured: 'Featured',
    verified: 'Verified',
    vitrin: 'Showcase',
    sendMessage: 'Send Message',
    addFavorite: 'Add to Favorites',
    removeFavorite: 'Remove from Favorites',
    becomePartner: 'Become a Partner',
    browsePartners: 'Browse Partners',
    heroTitle: 'Premium Social Platform of Northern Cyprus',
    heroSubtitle: 'Trusted companionship for special events, business dinners and social occasions',
    whyUs: 'Why KKTCX?',
    whyUsDesc: 'Safe, professional and elegant social companionship experience',
    todayAvailable: 'Available Today',
    featuredPartners: 'Featured Partners',
    vitrinPartners: 'Showcase',
    byCity: 'By City',
    allPartners: 'All Partners',
    noResults: 'No results found',
    loading: 'Loading...',
    error: 'An error occurred',
    about: 'About',
    faq: 'FAQ',
    contact: 'Contact',
    privacy: 'Privacy',
    terms: 'Terms',
    cookies: 'Cookies',
    packages: 'Packages',
    dashboard: 'Dashboard',
    settings: 'Settings',
    myProfile: 'My Profile',
    myListings: 'My Listings',
    approval: 'Approval',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    draft: 'Draft',
    submit: 'Submit',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    next: 'Next',
    back: 'Back',
    finish: 'Finish',
    step: 'Step',
    of: 'of',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    phone: 'Phone',
    name: 'Name',
    nickname: 'Nickname',
    description: 'Description',
    shortDescription: 'Short Description',
    detailedDescription: 'Detailed Description',
    photos: 'Photos',
    uploadPhoto: 'Upload Photo',
    setCover: 'Set as Cover',
    availability: 'Availability',
    languages: 'Languages',
    categories: 'Categories',
    turkish: 'Turkish',
    english: 'English',
    russian: 'Russian',
    german: 'German',
  },
  ru: {
    home: 'Главная',
    partners: 'Партнеры',
    favorites: 'Избранное',
    messages: 'Сообщения',
    profile: 'Профиль',
    login: 'Войти',
    register: 'Регистрация',
    logout: 'Выйти',
    search: 'Поиск',
    filter: 'Фильтр',
    city: 'Город',
    category: 'Категория',
    age: 'Возраст',
    language: 'Язык',
    availableToday: 'Свободен сегодня',
    availableTonight: 'Свободен вечером',
    featured: 'Рекомендуемые',
    verified: 'Проверенный',
    vitrin: 'Витрина',
    sendMessage: 'Отправить сообщение',
    addFavorite: 'Добавить в избранное',
    removeFavorite: 'Удалить из избранного',
    becomePartner: 'Стать партнером',
    browsePartners: 'Просмотр партнеров',
    heroTitle: 'Премиум социальная платформа Северного Кипра',
    heroSubtitle: 'Надежное сопровождение для особых мероприятий, деловых ужинов и социальных событий',
    whyUs: 'Почему KKTCX?',
    whyUsDesc: 'Безопасный, профессиональный и элегантный опыт социального сопровождения',
    loading: 'Загрузка...',
    error: 'Произошла ошибка',
  },
  de: {
    home: 'Startseite',
    partners: 'Partner',
    favorites: 'Favoriten',
    messages: 'Nachrichten',
    profile: 'Profil',
    login: 'Anmelden',
    register: 'Registrieren',
    logout: 'Abmelden',
    search: 'Suchen',
    filter: 'Filter',
    city: 'Stadt',
    category: 'Kategorie',
    age: 'Alter',
    language: 'Sprache',
    availableToday: 'Heute verfügbar',
    availableTonight: 'Heute Abend verfügbar',
    featured: 'Empfohlen',
    verified: 'Verifiziert',
    vitrin: 'Schaufenster',
    sendMessage: 'Nachricht senden',
    addFavorite: 'Zu Favoriten hinzufügen',
    removeFavorite: 'Aus Favoriten entfernen',
    becomePartner: 'Partner werden',
    browsePartners: 'Partner durchsuchen',
    heroTitle: 'Premium Social Plattform von Nordzypern',
    heroSubtitle: 'Vertrauenswürdige Begleitung für besondere Events, Geschäftsessen und gesellschaftliche Anlässe',
    whyUs: 'Warum KKTCX?',
    whyUsDesc: 'Sichere, professionelle und elegante soziale Begleitung',
    loading: 'Laden...',
    error: 'Ein Fehler ist aufgetreten',
  },
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/(tr|en|ru|de|el)/);
    return match ? match[1] : localStorage.getItem('lang') || 'tr';
  });

  const t = useCallback((key) => {
    return translations[lang]?.[key] || translations.en?.[key] || key;
  }, [lang]);

  const changeLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
    // Update URL
    const path = window.location.pathname;
    const newPath = path.replace(/^\/(tr|en|ru|de|el)/, `/${newLang}`);
    if (newPath !== path) {
      window.history.replaceState(null, '', newPath);
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, t, changeLang, languages: ['tr', 'en', 'ru', 'de', 'el'] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default { AuthProvider, LanguageProvider, useAuth, useLanguage };
