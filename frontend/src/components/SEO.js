import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../context/AppContext';
import { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const SITE_URL = 'https://kktcx.com';
const SITE_NAME = 'KKTCX';

// SEO Context for dynamic settings
const SEOContext = createContext({ seoSettings: null });

export const useSEOSettings = () => useContext(SEOContext);

// SEO Settings Provider
export const SEOSettingsProvider = ({ children }) => {
  const [seoSettings, setSeoSettings] = useState(null);

  useEffect(() => {
    const fetchSEO = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/settings/public`);
        if (response.data?.seo) {
          setSeoSettings(response.data.seo);
        }
      } catch (error) {
        console.error('Failed to fetch SEO settings:', error);
      }
    };
    fetchSEO();
  }, []);

  return (
    <SEOContext.Provider value={{ seoSettings }}>
      {children}
    </SEOContext.Provider>
  );
};

// SEO translations for all supported languages (fallback values)
const seoTranslations = {
  tr: {
    siteName: 'KKTCX | Kıbrıs Eskort, Jigolo, Masaj, Partner',
    defaultTitle: 'KKTCX | Kıbrıs Eskort, Jigolo, Masaj, Partner | Girne, Lefkoşa, Gazimağusa',
    defaultDescription: 'Kıbrıs eskort, jigolo, masaj ve partner ilanları. Girne, Lefkoşa, Gazimağusa, İskele bölgelerinde VIP escort, bayan partner, erkek eskort hizmetleri. Doğrulanmış profiller, 7/24 aktif.',
    defaultKeywords: 'kıbrıs eskort, kıbrıs escort, kıbrıs jigolo, kıbrıs masaj, kıbrıs partner, girne eskort, lefkoşa eskort, gazimağusa eskort, kktc eskort, girne jigolo, lefkoşa jigolo, kıbrıs masaj salonu, vip escort kıbrıs, bayan escort, erkek escort, casino escort, otel escort, iskele escort, cyprus escort',
    pages: {
      home: {
        title: 'KKTCX | Kıbrıs Eskort, Jigolo, Masaj, Partner | 7/24 Aktif',
        description: 'Kıbrıs eskort, jigolo, masaj ve partner platformu. Girne, Lefkoşa, Gazimağusa\'da doğrulanmış profiller. VIP escort, bayan partner, erkek eskort, masaj hizmetleri.',
      },
      partners: {
        title: 'Kıbrıs Eskort, Jigolo, Masaj İlanları | KKTCX',
        description: 'Kıbrıs eskort, jigolo, masaj ve partner ilanları. Bayan escort, erkek partner, VIP refakatçi, masaj hizmetleri. Girne, Lefkoşa, Gazimağusa, İskele.',
      },
      partnerDetail: {
        titleSuffix: '| Kıbrıs Eskort - KKTCX',
        descriptionPrefix: 'profili. Kıbrıs\'ta güvenilir, doğrulanmış escort ve partner.',
      },
      contact: {
        title: 'İletişim | KKTCX Kıbrıs Eskort Platform Destek',
        description: 'KKTCX ile 7/24 iletişime geçin. Kıbrıs eskort platformu müşteri hizmetleri. WhatsApp, Telegram, E-posta.',
      },
      about: {
        title: 'Hakkımızda | KKTCX Kıbrıs Eskort Platformu',
        description: 'KKTCX, Kıbrıs\'ın güvenilir eskort, jigolo ve masaj platformu. Güvenlik, gizlilik, kaliteli hizmet.',
      },
    },
    cities: {
      girne: 'Girne Eskort, Jigolo, Masaj | KKTCX Kyrenia',
      lefkosa: 'Lefkoşa Eskort, Jigolo, Masaj | KKTCX Nicosia',
      gazimagusa: 'Gazimağusa Eskort, Jigolo, Masaj | KKTCX Famagusta',
      guzelyurt: 'Güzelyurt Eskort, Partner | KKTCX Morphou',
      iskele: 'İskele Eskort, Partner | KKTCX Long Beach',
      lefke: 'Lefke Eskort, Partner | KKTCX',
    },
  },
  en: {
    siteName: 'KKTCX | Cyprus Escort, Gigolo, Massage, Companion',
    defaultTitle: 'KKTCX | Cyprus Escort, Gigolo, Massage, Companion | Kyrenia, Nicosia, Famagusta',
    defaultDescription: 'Cyprus escort, gigolo, massage and companion listings. VIP escorts, female companions, male escorts in Kyrenia, Nicosia, Famagusta. Verified profiles, 24/7 active.',
    defaultKeywords: 'cyprus escort, north cyprus escort, kyrenia escort, nicosia escort, famagusta escort, cyprus gigolo, cyprus massage, cyprus companion, male escort cyprus, female escort cyprus, vip escort',
    pages: {
      home: {
        title: 'KKTCX | Cyprus Escort, Gigolo, Massage, Companion | 24/7 Active',
        description: 'Cyprus escort, gigolo, massage and companion platform. Verified profiles in Kyrenia, Nicosia, Famagusta.',
      },
      partners: {
        title: 'Cyprus Escort, Gigolo, Massage Listings | KKTCX',
        description: 'Cyprus escort, gigolo, massage and companion listings. Female escorts, male companions, massage services.',
      },
      partnerDetail: {
        titleSuffix: '| Cyprus Escort - KKTCX',
        descriptionPrefix: 'profile. Verified escort and companion in Cyprus.',
      },
      contact: {
        title: 'Contact | KKTCX Cyprus Escort',
        description: 'Contact KKTCX 24/7. Cyprus escort platform support.',
      },
      about: {
        title: 'About | KKTCX Cyprus Escort',
        description: 'KKTCX, Cyprus trusted escort, gigolo and massage platform.',
      },
    },
    cities: {
      girne: 'Kyrenia Escort, Gigolo, Massage | KKTCX',
      lefkosa: 'Nicosia Escort, Gigolo, Massage | KKTCX',
      gazimagusa: 'Famagusta Escort, Gigolo, Massage | KKTCX',
      guzelyurt: 'Morphou Escort, Companion | KKTCX',
      iskele: 'Iskele Escort, Companion | KKTCX',
      lefke: 'Lefke Escort, Companion | KKTCX',
    },
  },
  ru: {
    siteName: 'KKTCX | Кипр Эскорт, Жиголо, Массаж, Компаньоны',
    defaultTitle: 'KKTCX | Кипр Эскорт, Жиголо, Массаж | Кирения, Никосия, Фамагуста',
    defaultDescription: 'Кипр эскорт, жиголо, массаж и компаньон объявления. VIP эскорт, женские компаньоны, мужской эскорт. Проверенные профили, 24/7.',
    defaultKeywords: 'кипр эскорт, северный кипр эскорт, кирения эскорт, никосия эскорт, фамагуста эскорт, кипр жиголо, кипр массаж, мужской эскорт кипр, vip эскорт',
    pages: {
      home: {
        title: 'KKTCX | Кипр Эскорт, Жиголо, Массаж | 24/7',
        description: 'Кипр эскорт, жиголо, массаж платформа. Проверенные профили в Кирении, Никосии, Фамагусте.',
      },
      partners: {
        title: 'Кипр Эскорт, Жиголо, Массаж | KKTCX',
        description: 'Кипр эскорт, жиголо, массаж и компаньон объявления.',
      },
      partnerDetail: {
        titleSuffix: '| Кипр Эскорт - KKTCX',
        descriptionPrefix: 'профиль. Проверенный эскорт на Кипре.',
      },
      contact: {
        title: 'Контакты | KKTCX Кипр Эскорт',
        description: 'Свяжитесь с KKTCX 24/7.',
      },
      about: {
        title: 'О Нас | KKTCX Кипр Эскорт',
        description: 'KKTCX - эскорт, жиголо и массаж платформа Кипра.',
      },
    },
    cities: {
      girne: 'Кирения Эскорт, Жиголо, Массаж | KKTCX',
      lefkosa: 'Никосия Эскорт, Жиголо, Массаж | KKTCX',
      gazimagusa: 'Фамагуста Эскорт, Жиголо, Массаж | KKTCX',
      guzelyurt: 'Морфу Эскорт | KKTCX',
      iskele: 'Искеле Эскорт | KKTCX',
      lefke: 'Лефка Эскорт | KKTCX',
    },
  },
  de: {
    siteName: 'KKTCX - Escort, Gigolo & Begleitung Nordzypern',
    defaultTitle: 'KKTCX - Beste Escort & Gigolo Plattform in Nordzypern',
    defaultDescription: 'Zuverlässige Escort, Gigolo und Begleitservice in Nordzypern (TRNC). VIP Escort und männliche Begleitung in Kyrenia, Nikosia, Famagusta. 24/7 Service.',
    defaultKeywords: 'nordzypern escort, zypern escort, kyrenia escort, nikosia escort, famagusta escort, begleitung zypern, gigolo nordzypern, gigolo zypern, männlicher escort nordzypern, kyrenia gigolo, nikosia gigolo, vip escort zypern, gigolo service zypern',
    pages: {
      home: {
        title: 'KKTCX - Escort, Gigolo & Begleitung Plattform Nordzypern',
        description: 'Die zuverlässigste Escort, Gigolo und Begleitung Plattform in Nordzypern. Verifizierte Anzeigen in Kyrenia, Nikosia, Famagusta.',
      },
      partners: {
        title: 'Escort & Gigolo Anzeigen - KKTCX | Nordzypern',
        description: 'Verifizierte Escort, Gigolo und Begleitung Anzeigen in Nordzypern. Kyrenia, Nikosia, Famagusta.',
      },
      partnerDetail: {
        titleSuffix: '- Escort Profil | KKTCX',
        descriptionPrefix: 'Profil. Zuverlässiger Escort Service in Nordzypern.',
      },
      contact: {
        title: 'Kontakt - KKTCX | Escort Plattform Nordzypern',
        description: 'Kontaktieren Sie KKTCX. Escort Plattform Nordzypern Support.',
      },
      about: {
        title: 'Über Uns - KKTCX | Zuverlässige Plattform Nordzypern',
        description: 'KKTCX ist die zuverlässigste Escort Plattform in Nordzypern.',
      },
    },
    cities: {
      girne: 'Escort in Kyrenia - KKTCX',
      lefkosa: 'Escort in Nikosia - KKTCX',
      gazimagusa: 'Escort in Famagusta - KKTCX',
      guzelyurt: 'Escort in Morphou - KKTCX',
      iskele: 'Escort in Iskele - KKTCX',
      lefke: 'Escort in Lefke - KKTCX',
    },
  },
  el: {
    siteName: 'KKTCX - Συνοδοί Βόρεια Κύπρος',
    defaultTitle: 'KKTCX - Καλύτερη Πλατφόρμα Συνοδών Βόρεια Κύπρος',
    defaultDescription: 'Αξιόπιστες υπηρεσίες συνοδών στη Βόρεια Κύπρο. VIP συνοδοί σε Κερύνεια, Λευκωσία, Αμμόχωστο. 24/7 υπηρεσία.',
    defaultKeywords: 'συνοδοί βόρεια κύπρος, κύπρος escort, κερύνεια συνοδοί, λευκωσία συνοδοί, αμμόχωστος συνοδοί, vip escort κύπρος',
    pages: {
      home: {
        title: 'KKTCX - Πλατφόρμα Συνοδών Βόρεια Κύπρος',
        description: 'Η πιο αξιόπιστη πλατφόρμα συνοδών στη Βόρεια Κύπρο. Επαληθευμένες αγγελίες σε Κερύνεια, Λευκωσία, Αμμόχωστο.',
      },
      partners: {
        title: 'Αγγελίες Συνοδών - KKTCX | Βόρεια Κύπρος',
        description: 'Επαληθευμένες αγγελίες συνοδών στη Βόρεια Κύπρο. Κερύνεια, Λευκωσία, Αμμόχωστος.',
      },
      partnerDetail: {
        titleSuffix: '- Προφίλ Συνοδού | KKTCX',
        descriptionPrefix: 'προφίλ. Αξιόπιστη υπηρεσία συνοδών στη Βόρεια Κύπρο.',
      },
      contact: {
        title: 'Επικοινωνία - KKTCX | Πλατφόρμα Συνοδών Βόρεια Κύπρος',
        description: 'Επικοινωνήστε με το KKTCX. Υποστήριξη πλατφόρμας συνοδών Βόρεια Κύπρος.',
      },
      about: {
        title: 'Σχετικά με εμάς - KKTCX | Αξιόπιστη Πλατφόρμα Βόρεια Κύπρος',
        description: 'Το KKTCX είναι η πιο αξιόπιστη πλατφόρμα συνοδών στη Βόρεια Κύπρο.',
      },
    },
    cities: {
      girne: 'Συνοδοί Κερύνεια - KKTCX',
      lefkosa: 'Συνοδοί Λευκωσία - KKTCX',
      gazimagusa: 'Συνοδοί Αμμόχωστος - KKTCX',
      guzelyurt: 'Συνοδοί Μόρφου - KKTCX',
      iskele: 'Συνοδοί Ισκελέ - KKTCX',
      lefke: 'Συνοδοί Λέφκα - KKTCX',
    },
  },
};

const langCodes = {
  tr: 'tr_TR',
  en: 'en_US',
  ru: 'ru_RU',
  de: 'de_DE',
  el: 'el_GR',
};

export const SEO = ({ 
  title, 
  description, 
  keywords,
  image,
  url,
  type = 'website',
  noindex = false,
  structuredData,
  partner,
  city,
  page
}) => {
  const { lang } = useLanguage();
  const { seoSettings } = useSEOSettings();
  const t = seoTranslations[lang] || seoTranslations.tr;
  
  // Get dynamic SEO settings from database (global settings)
  const globalSeo = seoSettings?.global || {};
  
  // Determine final title and description
  let finalTitle = title;
  let finalDescription = description;
  let finalKeywords = keywords || globalSeo.keywords?.join(', ') || t.defaultKeywords;
  
  if (page && t.pages[page]) {
    finalTitle = finalTitle || t.pages[page].title;
    finalDescription = finalDescription || t.pages[page].description;
  }
  
  if (city && t.cities[city]) {
    finalTitle = t.cities[city];
  }
  
  if (partner) {
    finalTitle = `${partner.nickname} ${t.pages.partnerDetail?.titleSuffix || ''}`;
    finalDescription = `${partner.nickname} ${t.pages.partnerDetail?.descriptionPrefix || ''} ${partner.short_description || ''}`;
  }
  
  // Use database title/description as ultimate fallback for homepage
  if (page === 'home' && globalSeo.title) {
    finalTitle = finalTitle || globalSeo.title;
    finalDescription = finalDescription || globalSeo.description;
  }
  
  finalTitle = finalTitle || globalSeo.title || t.defaultTitle;
  finalDescription = finalDescription || globalSeo.description || t.defaultDescription;
  
  const finalUrl = url || (typeof window !== 'undefined' ? window.location.href : SITE_URL);
  const finalImage = image || globalSeo.og_image || `${SITE_URL}/og-image.jpg`;
  const twitterHandle = globalSeo.twitter_handle || '@kktcx';
  
  // Generate alternate language links
  const alternateLinks = Object.keys(seoTranslations).map(langCode => ({
    hrefLang: langCode,
    href: finalUrl.replace(`/${lang}/`, `/${langCode}/`),
  }));

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang={lang} />
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      
      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      
      {/* Canonical URL */}
      <link rel="canonical" href={finalUrl} />
      
      {/* Alternate Languages */}
      {alternateLinks.map(link => (
        <link key={link.hrefLang} rel="alternate" hrefLang={link.hrefLang} href={link.href} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={finalUrl.replace(`/${lang}/`, '/tr/')} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={t.siteName} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content={langCodes[lang] || 'tr_TR'} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      
      {/* Geo Tags for Local SEO */}
      <meta name="geo.region" content="CY-01" />
      <meta name="geo.placename" content="North Cyprus" />
      <meta name="geo.position" content="35.1856;33.3823" />
      <meta name="ICBM" content="35.1856, 33.3823" />
      
      {/* Additional SEO */}
      <meta name="author" content="KKTCX" />
      <meta name="publisher" content="KKTCX" />
      <meta name="copyright" content="KKTCX" />
      <meta name="rating" content="adult" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

// Generate structured data for different page types
export const generateStructuredData = {
  website: (lang) => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": seoTranslations[lang]?.siteName || "KKTCX",
    "url": SITE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SITE_URL}/${lang}/partnerler?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  }),
  
  organization: () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "KKTCX",
    "url": SITE_URL,
    "logo": `${SITE_URL}/logo.png`,
    "sameAs": [],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["Turkish", "English", "Russian", "German", "Greek"]
    },
    "areaServed": {
      "@type": "Country",
      "name": "Cyprus"
    }
  }),
  
  localBusiness: (lang) => ({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "KKTCX",
    "description": seoTranslations[lang]?.defaultDescription,
    "url": SITE_URL,
    "telephone": "",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "CY",
      "addressRegion": "North Cyprus"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 35.1856,
      "longitude": 33.3823
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "00:00",
      "closes": "23:59"
    }
  }),
  
  profile: (partner, lang) => ({
    "@context": "https://schema.org",
    "@type": "Person",
    "name": partner.nickname,
    "description": partner.short_description,
    "url": `${SITE_URL}/${lang}/partner/${partner.slug}`,
    "image": partner.cover_image?.url || partner.images?.[0]?.url,
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "CY",
      "addressLocality": partner.city_name || "North Cyprus"
    }
  }),
  
  breadcrumb: (items) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  })
};

export default SEO;
