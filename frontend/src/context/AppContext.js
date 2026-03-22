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
    // Filter labels
    gender: 'Cinsiyet',
    serviceType: 'Hizmet Türü',
    allCities: 'Tüm Şehirler',
    allCategories: 'Tüm Kategoriler',
    all: 'Tümü',
    clearFilters: 'Filtreleri Temizle',
    incall: 'Ev (Incall)',
    outcall: 'Dışarı (Outcall)',
    report: 'Şikayet Et',
    shareProfile: 'Profili Paylaş',
    // Gender options
    female: 'Kadın',
    male: 'Erkek',
    trans: 'Trans',
    // Orientation options
    heterosexual: 'Heteroseksüel',
    lesbian: 'Lezbiyen',
    gay: 'Gay',
    bisexual: 'Biseksüel',
    // Service types
    dinnerCompanion: 'Yemek Eşliği',
    eventCompanion: 'Davet Eşliği',
    sleepCompanion: 'Uyku Arkadaşlığı',
    gfBfExperience: 'Sevgili Deneyimi',
    spouseRoleplay: 'Eş Rolleri',
    travelCompanion: 'Gezi Eşliği',
    socialEvent: 'Sosyal Etkinlik',
    businessEvent: 'İş Daveti',
    cultureArts: 'Kültür & Sanat',
    sportsFitness: 'Spor & Fitness',
    // Partner count
    partnersFound: 'partner bulundu',
    // Dashboard translations
    overview: 'Genel bakış',
    editProfile: 'Profil düzenle',
    manageGallery: 'Galeri yönet',
    appointmentManagement: 'Randevu yönetimi',
    appointments: 'Randevular',
    premium: 'Premium',
    packagesAndFeature: 'Paketler & öne çıkar',
    inbox: 'Gelen kutusu',
    myFavorites: 'Favorilerim',
    savedPartners: 'Kayıtlı partnerler',
    accountSettings: 'Hesap ayarları',
    partnerAccount: 'Partner Hesabı',
    member: 'Üye',
    views: 'Görüntüleme',
    viewSite: 'Siteyi Görüntüle',
    accountInfo: 'Hesap Bilgileri',
    accountType: 'Hesap Türü',
    registrationDate: 'Kayıt Tarihi',
    emailCannotChange: 'E-posta değiştirilemez',
    yourName: 'Adınız Soyadınız',
    settingsSaved: 'Ayarlar kaydedildi',
    saving: 'Kaydediliyor...',
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
    // Filter labels
    gender: 'Gender',
    serviceType: 'Service Type',
    allCities: 'All Cities',
    allCategories: 'All Categories',
    all: 'All',
    clearFilters: 'Clear Filters',
    incall: 'Incall',
    outcall: 'Outcall',
    report: 'Report',
    shareProfile: 'Share Profile',
    // Gender options
    female: 'Female',
    male: 'Male',
    trans: 'Trans',
    // Orientation options
    heterosexual: 'Heterosexual',
    lesbian: 'Lesbian',
    gay: 'Gay',
    bisexual: 'Bisexual',
    // Service types
    dinnerCompanion: 'Dinner Companion',
    eventCompanion: 'Event Companion',
    sleepCompanion: 'Sleep Companion',
    gfBfExperience: 'GF/BF Experience',
    spouseRoleplay: 'Spouse Roleplay',
    travelCompanion: 'Travel Companion',
    socialEvent: 'Social Event',
    businessEvent: 'Business Event',
    cultureArts: 'Culture & Arts',
    sportsFitness: 'Sports & Fitness',
    // Partner count
    partnersFound: 'partners found',
    // Dashboard translations
    overview: 'Overview',
    editProfile: 'Edit profile',
    manageGallery: 'Manage gallery',
    appointmentManagement: 'Manage appointments',
    appointments: 'Appointments',
    premium: 'Premium',
    packagesAndFeature: 'Packages & feature',
    inbox: 'Inbox',
    myFavorites: 'My Favorites',
    savedPartners: 'Saved partners',
    accountSettings: 'Account settings',
    partnerAccount: 'Partner Account',
    member: 'Member',
    views: 'Views',
    viewSite: 'View Site',
    accountInfo: 'Account Info',
    accountType: 'Account Type',
    registrationDate: 'Registration Date',
    emailCannotChange: 'Email cannot be changed',
    yourName: 'Your Name',
    settingsSaved: 'Settings saved',
    saving: 'Saving...',
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
    // Filter labels
    gender: 'Пол',
    serviceType: 'Тип услуги',
    allCities: 'Все города',
    allCategories: 'Все категории',
    all: 'Все',
    clearFilters: 'Очистить фильтры',
    incall: 'Выезд',
    outcall: 'На дому',
    report: 'Пожаловаться',
    shareProfile: 'Поделиться профилем',
    female: 'Женщина',
    male: 'Мужчина',
    trans: 'Транс',
    heterosexual: 'Гетеросексуал',
    lesbian: 'Лесбиянка',
    gay: 'Гей',
    bisexual: 'Бисексуал',
    dinnerCompanion: 'Ужин',
    eventCompanion: 'Мероприятие',
    sleepCompanion: 'Ночь',
    gfBfExperience: 'Опыт отношений',
    spouseRoleplay: 'Ролевая игра',
    travelCompanion: 'Путешествие',
    socialEvent: 'Социальное событие',
    businessEvent: 'Бизнес событие',
    cultureArts: 'Культура и искусство',
    sportsFitness: 'Спорт и фитнес',
    partnersFound: 'партнеров найдено',
    // Dashboard translations
    overview: 'Обзор',
    editProfile: 'Редактировать профиль',
    manageGallery: 'Управление галереей',
    appointmentManagement: 'Управление встречами',
    appointments: 'Встречи',
    premium: 'Премиум',
    packagesAndFeature: 'Пакеты и продвижение',
    inbox: 'Входящие',
    myFavorites: 'Мои избранные',
    savedPartners: 'Сохраненные партнеры',
    accountSettings: 'Настройки аккаунта',
    partnerAccount: 'Аккаунт партнера',
    member: 'Участник',
    views: 'Просмотры',
    viewSite: 'Смотреть сайт',
    accountInfo: 'Информация об аккаунте',
    accountType: 'Тип аккаунта',
    registrationDate: 'Дата регистрации',
    emailCannotChange: 'Email нельзя изменить',
    yourName: 'Ваше имя',
    settingsSaved: 'Настройки сохранены',
    saving: 'Сохранение...',
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
    // Filter labels
    gender: 'Geschlecht',
    serviceType: 'Serviceart',
    allCities: 'Alle Städte',
    allCategories: 'Alle Kategorien',
    all: 'Alle',
    clearFilters: 'Filter löschen',
    incall: 'Incall',
    outcall: 'Outcall',
    report: 'Melden',
    shareProfile: 'Profil teilen',
    female: 'Frau',
    male: 'Mann',
    trans: 'Trans',
    heterosexual: 'Heterosexuell',
    lesbian: 'Lesbisch',
    gay: 'Schwul',
    bisexual: 'Bisexuell',
    dinnerCompanion: 'Dinner-Begleitung',
    eventCompanion: 'Event-Begleitung',
    sleepCompanion: 'Übernachtung',
    gfBfExperience: 'GF/BF Erfahrung',
    spouseRoleplay: 'Partner-Rollenspiel',
    travelCompanion: 'Reisebegleitung',
    socialEvent: 'Soziales Event',
    businessEvent: 'Business Event',
    cultureArts: 'Kultur & Kunst',
    sportsFitness: 'Sport & Fitness',
    partnersFound: 'Partner gefunden',
    // Dashboard translations
    overview: 'Übersicht',
    editProfile: 'Profil bearbeiten',
    manageGallery: 'Galerie verwalten',
    appointmentManagement: 'Termine verwalten',
    appointments: 'Termine',
    premium: 'Premium',
    packagesAndFeature: 'Pakete & Hervorhebung',
    inbox: 'Posteingang',
    myFavorites: 'Meine Favoriten',
    savedPartners: 'Gespeicherte Partner',
    accountSettings: 'Kontoeinstellungen',
    partnerAccount: 'Partner-Konto',
    member: 'Mitglied',
    views: 'Aufrufe',
    viewSite: 'Seite anzeigen',
    accountInfo: 'Kontoinformation',
    accountType: 'Kontotyp',
    registrationDate: 'Registrierungsdatum',
    emailCannotChange: 'E-Mail kann nicht geändert werden',
    yourName: 'Ihr Name',
    settingsSaved: 'Einstellungen gespeichert',
    saving: 'Speichern...',
  },
  el: {
    home: 'Αρχική',
    partners: 'Συνοδοί',
    favorites: 'Αγαπημένα',
    messages: 'Μηνύματα',
    profile: 'Προφίλ',
    login: 'Σύνδεση',
    register: 'Εγγραφή',
    logout: 'Αποσύνδεση',
    search: 'Αναζήτηση',
    filter: 'Φίλτρο',
    city: 'Πόλη',
    category: 'Κατηγορία',
    age: 'Ηλικία',
    language: 'Γλώσσα',
    availableToday: 'Διαθέσιμο Σήμερα',
    availableTonight: 'Διαθέσιμο Απόψε',
    featured: 'Προτεινόμενα',
    verified: 'Επαληθευμένο',
    vitrin: 'Βιτρίνα',
    sendMessage: 'Αποστολή Μηνύματος',
    addFavorite: 'Προσθήκη στα Αγαπημένα',
    removeFavorite: 'Αφαίρεση από τα Αγαπημένα',
    becomePartner: 'Γίνε Συνοδός',
    browsePartners: 'Περιήγηση Συνοδών',
    heroTitle: 'Η Premium Κοινωνική Πλατφόρμα της Βόρειας Κύπρου',
    heroSubtitle: 'Αξιόπιστη συντροφιά για ειδικές εκδηλώσεις, επαγγελματικά δείπνα και κοινωνικές περιστάσεις',
    whyUs: 'Γιατί KKTCX;',
    whyUsDesc: 'Ασφαλής, επαγγελματική και κομψή κοινωνική συντροφιά',
    todayAvailable: 'Διαθέσιμο Σήμερα',
    featuredPartners: 'Προτεινόμενοι Συνοδοί',
    vitrinPartners: 'Βιτρίνα',
    byCity: 'Ανά Πόλη',
    allPartners: 'Όλοι οι Συνοδοί',
    noResults: 'Δεν βρέθηκαν αποτελέσματα',
    loading: 'Φόρτωση...',
    error: 'Παρουσιάστηκε σφάλμα',
    about: 'Σχετικά',
    faq: 'Συχνές Ερωτήσεις',
    contact: 'Επικοινωνία',
    privacy: 'Απόρρητο',
    terms: 'Όροι Χρήσης',
    cookies: 'Cookies',
    packages: 'Πακέτα',
    dashboard: 'Πίνακας',
    settings: 'Ρυθμίσεις',
    myProfile: 'Το Προφίλ μου',
    myListings: 'Οι Καταχωρήσεις μου',
    approval: 'Έγκριση',
    pending: 'Σε αναμονή',
    approved: 'Εγκρίθηκε',
    rejected: 'Απορρίφθηκε',
    draft: 'Πρόχειρο',
    submit: 'Υποβολή',
    save: 'Αποθήκευση',
    cancel: 'Ακύρωση',
    delete: 'Διαγραφή',
    edit: 'Επεξεργασία',
    view: 'Προβολή',
    next: 'Επόμενο',
    back: 'Πίσω',
    finish: 'Τέλος',
    step: 'Βήμα',
    of: 'από',
    email: 'Email',
    password: 'Κωδικός',
    confirmPassword: 'Επιβεβαίωση Κωδικού',
    phone: 'Τηλέφωνο',
    name: 'Όνομα',
    nickname: 'Ψευδώνυμο',
    description: 'Περιγραφή',
    shortDescription: 'Σύντομη Περιγραφή',
    detailedDescription: 'Λεπτομερής Περιγραφή',
    photos: 'Φωτογραφίες',
    uploadPhoto: 'Μεταφόρτωση Φωτογραφίας',
    setCover: 'Ορισμός ως Εξώφυλλο',
    availability: 'Διαθεσιμότητα',
    languages: 'Γλώσσες',
    categories: 'Κατηγορίες',
    turkish: 'Τουρκικά',
    english: 'Αγγλικά',
    russian: 'Ρωσικά',
    german: 'Γερμανικά',
    greek: 'Ελληνικά',
    // Filter labels
    gender: 'Φύλο',
    serviceType: 'Τύπος υπηρεσίας',
    allCities: 'Όλες οι πόλεις',
    allCategories: 'Όλες οι κατηγορίες',
    all: 'Όλα',
    clearFilters: 'Καθαρισμός φίλτρων',
    incall: 'Incall',
    outcall: 'Outcall',
    report: 'Αναφορά',
    shareProfile: 'Κοινοποίηση προφίλ',
    female: 'Γυναίκα',
    male: 'Άντρας',
    trans: 'Τρανς',
    heterosexual: 'Ετεροφυλόφιλος',
    lesbian: 'Λεσβία',
    gay: 'Γκέι',
    bisexual: 'Αμφιφυλόφιλος',
    dinnerCompanion: 'Συνοδεία δείπνου',
    eventCompanion: 'Συνοδεία εκδήλωσης',
    sleepCompanion: 'Διανυκτέρευση',
    gfBfExperience: 'Εμπειρία σχέσης',
    spouseRoleplay: 'Παιχνίδι ρόλων',
    travelCompanion: 'Συνοδεία ταξιδιού',
    socialEvent: 'Κοινωνική εκδήλωση',
    businessEvent: 'Επαγγελματική εκδήλωση',
    cultureArts: 'Πολιτισμός & Τέχνες',
    sportsFitness: 'Αθλητισμός & Fitness',
    partnersFound: 'συνοδοί βρέθηκαν',
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

// Site Settings Context
const SiteSettingsContext = createContext(null);

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  return context || { features: {}, loading: true };
};

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    features: {
      messaging_enabled: true,
      favorites_enabled: true,
      reviews_enabled: false,
      booking_enabled: false,
      payment_enabled: true,
      sms_notifications: false,
      email_notifications: true,
    },
    homepage: {},
    general: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/settings/public`);
      if (response.data) {
        setSettings(prev => ({
          ...prev,
          features: response.data.features || prev.features,
          homepage: response.data.homepage || prev.homepage,
          general: response.data.general || prev.general,
        }));
      }
    } catch (error) {
      console.log('Using default settings');
    } finally {
      setLoading(false);
    }
  };

  const isFeatureEnabled = (feature) => {
    return settings.features?.[feature] ?? true;
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, features: settings.features, loading, isFeatureEnabled }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export default { AuthProvider, LanguageProvider, SiteSettingsProvider, useAuth, useLanguage, useSiteSettings };
