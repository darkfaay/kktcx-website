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
    siteName: 'KKTCX - Kuzey Kıbrıs Eskort, Jigolo ve Partner Rehberi',
    defaultTitle: 'KKTCX - Kuzey Kıbrıs\'ın En İyi Eskort, Jigolo ve Partner Platformu',
    defaultDescription: 'Kuzey Kıbrıs\'ta (KKTC) en güvenilir eskort, jigolo, partner ve refakatçi hizmetleri. Girne, Lefkoşa, Gazimağusa, Güzelyurt bölgelerinde VIP escort, erkek partner ve jigolo ilanları. 7/24 hizmet.',
    defaultKeywords: 'kktc eskort, kuzey kıbrıs escort, girne eskort, lefkoşa escort, gazimağusa eskort, kıbrıs partner, kktc jigolo, jigolo kıbrıs, erkek partner kktc, kuzey kıbrıs jigolo, girne jigolo, lefkoşa jigolo, kuzey kıbrıs refakatçi, vip escort kıbrıs, companion kktc, escort cyprus north, kıbrıs bayan partner, kktc erkek partner, gay escort kıbrıs, erkek eskort kıbrıs, male escort cyprus, jigolo hizmeti kktc',
    pages: {
      home: {
        title: 'KKTCX - Kuzey Kıbrıs Eskort, Jigolo, Partner ve Refakatçi Platformu',
        description: 'Kuzey Kıbrıs\'ın en güvenilir escort, jigolo ve partner platformu. Girne, Lefkoşa, Gazimağusa\'da doğrulanmış eskort ve jigolo ilanları, VIP refakatçi hizmetleri ve companion randevuları.',
      },
      partners: {
        title: 'Eskort, Jigolo ve Partner İlanları - KKTCX | Kuzey Kıbrıs',
        description: 'Kuzey Kıbrıs\'ta doğrulanmış eskort, jigolo ve partner ilanları. Bayan escort, erkek partner, jigolo ve refakatçi hizmetleri. Girne, Lefkoşa, Gazimağusa, Güzelyurt.',
      },
      partnerDetail: {
        titleSuffix: '- Eskort Profili | KKTCX',
        descriptionPrefix: 'profili. Kuzey Kıbrıs\'ta güvenilir escort ve partner hizmeti.',
      },
      contact: {
        title: 'İletişim - KKTCX | Kuzey Kıbrıs Escort Platformu',
        description: 'KKTCX ile iletişime geçin. Kuzey Kıbrıs escort ve partner platformu destek hattı.',
      },
      about: {
        title: 'Hakkımızda - KKTCX | Kuzey Kıbrıs\'ın Güvenilir Platformu',
        description: 'KKTCX, Kuzey Kıbrıs\'ın en güvenilir escort ve partner platformudur. Güvenlik, gizlilik ve kaliteli hizmet önceliğimizdir.',
      },
    },
    cities: {
      girne: 'Girne Eskort ve Partner İlanları - KKTCX',
      lefkosa: 'Lefkoşa Eskort ve Partner İlanları - KKTCX',
      gazimagusa: 'Gazimağusa Eskort ve Partner İlanları - KKTCX',
      guzelyurt: 'Güzelyurt Eskort ve Partner İlanları - KKTCX',
      iskele: 'İskele Eskort ve Partner İlanları - KKTCX',
      lefke: 'Lefke Eskort ve Partner İlanları - KKTCX',
    },
  },
  en: {
    siteName: 'KKTCX - North Cyprus Escort, Gigolo & Companion Guide',
    defaultTitle: 'KKTCX - Best Escort, Gigolo & Companion Platform in North Cyprus',
    defaultDescription: 'The most trusted escort, gigolo, companion, and partner services in North Cyprus (TRNC). VIP escort and male escort listings in Kyrenia, Nicosia, Famagusta, Morphou. 24/7 service.',
    defaultKeywords: 'north cyprus escort, trnc escort, kyrenia escort, nicosia escort, famagusta escort, cyprus companion, north cyprus gigolo, gigolo cyprus, male escort north cyprus, kyrenia gigolo, nicosia gigolo, vip escort cyprus, companion trnc, escort service north cyprus, female escort cyprus, male escort trnc, gay escort cyprus, gigolo service trnc, male companion cyprus',
    pages: {
      home: {
        title: 'KKTCX - North Cyprus Escort, Gigolo, Companion & Partner Platform',
        description: 'The most trusted escort, gigolo and companion platform in North Cyprus. Verified escort and male escort listings in Kyrenia, Nicosia, Famagusta. VIP companion services and appointments.',
      },
      partners: {
        title: 'Escort, Gigolo & Companion Listings - KKTCX | North Cyprus',
        description: 'Verified escort, gigolo and companion listings in North Cyprus. Female escorts, male escorts, gigolo services. Kyrenia, Nicosia, Famagusta, Morphou.',
      },
      partnerDetail: {
        titleSuffix: '- Escort Profile | KKTCX',
        descriptionPrefix: 'profile. Trusted escort and companion service in North Cyprus.',
      },
      contact: {
        title: 'Contact - KKTCX | North Cyprus Escort Platform',
        description: 'Contact KKTCX. North Cyprus escort and companion platform support.',
      },
      about: {
        title: 'About Us - KKTCX | North Cyprus Trusted Platform',
        description: 'KKTCX is the most trusted escort and companion platform in North Cyprus. Security, privacy, and quality service are our priorities.',
      },
    },
    cities: {
      girne: 'Kyrenia Escort & Companion Listings - KKTCX',
      lefkosa: 'Nicosia Escort & Companion Listings - KKTCX',
      gazimagusa: 'Famagusta Escort & Companion Listings - KKTCX',
      guzelyurt: 'Morphou Escort & Companion Listings - KKTCX',
      iskele: 'Iskele Escort & Companion Listings - KKTCX',
      lefke: 'Lefke Escort & Companion Listings - KKTCX',
    },
  },
  ru: {
    siteName: 'KKTCX - Эскорт, Жиголо и Компаньоны Северного Кипра',
    defaultTitle: 'KKTCX - Лучшая Эскорт и Жиголо Платформа Северного Кипра',
    defaultDescription: 'Надежные эскорт, жиголо и компаньон услуги на Северном Кипре (ТРСК). VIP эскорт и мужской эскорт в Кирении, Никосии, Фамагусте. Круглосуточный сервис.',
    defaultKeywords: 'эскорт северный кипр, кипр эскорт, кирения эскорт, никосия эскорт, фамагуста эскорт, компаньон кипр, жиголо северный кипр, жиголо кипр, мужской эскорт кипр, кирения жиголо, никосия жиголо, vip эскорт кипр, услуги жиголо кипр',
    pages: {
      home: {
        title: 'KKTCX - Эскорт, Жиголо и Компаньон Платформа Северного Кипра',
        description: 'Самая надежная эскорт, жиголо и компаньон платформа на Северном Кипре. Проверенные объявления в Кирении, Никосии, Фамагусте.',
      },
      partners: {
        title: 'Эскорт и Жиголо Объявления - KKTCX | Северный Кипр',
        description: 'Проверенные эскорт, жиголо и компаньон объявления на Северном Кипре. Кирения, Никосия, Фамагуста.',
      },
      partnerDetail: {
        titleSuffix: '- Профиль Эскорта | KKTCX',
        descriptionPrefix: 'профиль. Надежный эскорт сервис на Северном Кипре.',
      },
      contact: {
        title: 'Контакты - KKTCX | Эскорт Платформа Северного Кипра',
        description: 'Свяжитесь с KKTCX. Поддержка эскорт платформы Северного Кипра.',
      },
      about: {
        title: 'О Нас - KKTCX | Надежная Платформа Северного Кипра',
        description: 'KKTCX - самая надежная эскорт платформа на Северном Кипре.',
      },
    },
    cities: {
      girne: 'Эскорт в Кирении - KKTCX',
      lefkosa: 'Эскорт в Никосии - KKTCX',
      gazimagusa: 'Эскорт в Фамагусте - KKTCX',
      guzelyurt: 'Эскорт в Морфу - KKTCX',
      iskele: 'Эскорт в Искеле - KKTCX',
      lefke: 'Эскорт в Лефке - KKTCX',
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
