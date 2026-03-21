import React, { useEffect, useState, createContext, useContext } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Context for branding
const BrandingContext = createContext({ branding: null });

export const useBranding = () => useContext(BrandingContext);

const BrandingProvider = ({ children }) => {
  const [branding, setBranding] = useState(null);

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/settings/public`);
      if (response.data?.branding) {
        const brand = response.data.branding;
        setBranding(brand);
        
        // CSS değişkenlerini güncelle
        const root = document.documentElement;
        if (brand.primary_color) {
          root.style.setProperty('--color-primary', brand.primary_color);
        }
        if (brand.secondary_color) {
          root.style.setProperty('--color-secondary', brand.secondary_color);
        }
        if (brand.accent_color) {
          root.style.setProperty('--color-accent', brand.accent_color);
        }
        
        // Favicon güncelle - geçerli URL kontrolü
        if (brand.favicon_url && 
            brand.favicon_url !== 'https://example.com/favicon.ico' &&
            brand.favicon_url.startsWith('http')) {
          updateFavicon(brand.favicon_url);
        }
      }
    } catch (error) {
      console.error('Failed to fetch branding:', error);
    }
  };

  const updateFavicon = (url) => {
    // Mevcut favicon'ları kaldır
    const existingFavicons = document.querySelectorAll("link[rel*='icon']");
    existingFavicons.forEach(el => el.remove());
    
    // Yeni favicon ekle
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/x-icon';
    link.href = url;
    document.head.appendChild(link);
    
    // Apple touch icon da ekle
    const appleLink = document.createElement('link');
    appleLink.rel = 'apple-touch-icon';
    appleLink.href = url;
    document.head.appendChild(appleLink);
  };

  return (
    <BrandingContext.Provider value={{ branding }}>
      {children}
    </BrandingContext.Provider>
  );
};

export default BrandingProvider;
