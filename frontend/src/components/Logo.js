import React from 'react';
import { useBranding } from './BrandingProvider';

const Logo = ({ size = 'default', showBadge = true, forceText = false }) => {
  const { branding } = useBranding();
  
  const sizes = {
    small: {
      text: 'text-xl',
      badge: 'text-[8px] px-1.5 py-0.5',
      image: 'h-6',
    },
    default: {
      text: 'text-2xl',
      badge: 'text-[10px] px-2 py-0.5',
      image: 'h-8',
    },
    large: {
      text: 'text-4xl',
      badge: 'text-xs px-2 py-1',
      image: 'h-12',
    },
  };

  const currentSize = sizes[size] || sizes.default;
  
  // Logo URL kontrolü - geçerli bir URL varsa görsel göster
  const hasValidLogoUrl = branding?.logo_url && 
    branding.logo_url !== 'https://example.com/logo.png' &&
    branding.logo_url.startsWith('http');

  return (
    <div className="flex items-center gap-2 group">
      {/* Logo - Görsel veya Text */}
      {hasValidLogoUrl && !forceText ? (
        <img 
          src={branding.logo_url} 
          alt="KKTCX Logo" 
          className={`${currentSize.image} object-contain`}
          onError={(e) => {
            // Görsel yüklenemezse gizle, text logo gösterilecek
            e.target.style.display = 'none';
          }}
        />
      ) : (
        <div className="relative">
          {/* Glow Effect - uses CSS variable */}
          <div className="absolute -inset-2 rounded-lg blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-500" 
               style={{ background: `linear-gradient(to right, var(--color-primary), var(--color-secondary), var(--color-primary))` }} />
          
          <span className={`${currentSize.text} font-bold font-serif relative`}>
            <span className="bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]"
                  style={{ backgroundImage: `linear-gradient(to right, var(--color-primary), #FF4081, var(--color-primary))` }}>
              KKT
            </span>
            <span className="bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]" 
                  style={{ backgroundImage: `linear-gradient(to right, var(--color-accent), #FFA500, var(--color-accent))`, animationDelay: '0.5s' }}>
              CX
            </span>
          </span>
        </div>
      )}
      
      {/* 18+ Badge - uses CSS variable */}
      {showBadge && (
        <span className={`${currentSize.badge} rounded-full font-bold text-white shadow-lg`}
              style={{ 
                background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))`,
                boxShadow: `0 10px 15px -3px color-mix(in srgb, var(--color-primary) 30%, transparent)`
              }}>
          18+
        </span>
      )}
    </div>
  );
};

// Simple text version for places where we just need styled text
export const LogoText = ({ className = '' }) => (
  <span className={`font-bold font-serif ${className}`}>
    <span className="bg-clip-text text-transparent"
          style={{ backgroundImage: `linear-gradient(to right, var(--color-primary), #FF4081, var(--color-primary))` }}>
      KKT
    </span>
    <span className="bg-clip-text text-transparent"
          style={{ backgroundImage: `linear-gradient(to right, var(--color-accent), #FFA500, var(--color-accent))` }}>
      CX
    </span>
  </span>
);

export default Logo;
