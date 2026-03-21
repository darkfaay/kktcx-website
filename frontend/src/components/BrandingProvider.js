import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

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
        
        // Favicon güncelle
        if (brand.favicon_url && brand.favicon_url !== 'https://example.com/favicon.ico') {
          const existingFavicon = document.querySelector("link[rel*='icon']");
          if (existingFavicon) {
            existingFavicon.href = brand.favicon_url;
          } else {
            const link = document.createElement('link');
            link.rel = 'icon';
            link.href = brand.favicon_url;
            document.head.appendChild(link);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch branding:', error);
    }
  };

  return <>{children}</>;
};

export default BrandingProvider;
