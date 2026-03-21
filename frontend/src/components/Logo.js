import React from 'react';

const Logo = ({ size = 'default', showBadge = true }) => {
  const sizes = {
    small: {
      text: 'text-xl',
      badge: 'text-[8px] px-1.5 py-0.5',
    },
    default: {
      text: 'text-2xl',
      badge: 'text-[10px] px-2 py-0.5',
    },
    large: {
      text: 'text-4xl',
      badge: 'text-xs px-2 py-1',
    },
  };

  const currentSize = sizes[size] || sizes.default;

  return (
    <div className="flex items-center gap-2 group">
      {/* Main Logo Text */}
      <div className="relative">
        {/* Glow Effect */}
        <div className="absolute -inset-2 bg-gradient-to-r from-[#E91E63] via-[#9C27B0] to-[#E91E63] rounded-lg blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
        
        <span className={`${currentSize.text} font-bold font-serif relative`}>
          <span className="bg-gradient-to-r from-[#E91E63] via-[#FF4081] to-[#E91E63] bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
            KKT
          </span>
          <span className="bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]" style={{ animationDelay: '0.5s' }}>
            CX
          </span>
        </span>
      </div>
      
      {/* 18+ Badge */}
      {showBadge && (
        <span className={`${currentSize.badge} rounded-full font-bold bg-gradient-to-r from-[#E91E63] to-[#9C27B0] text-white shadow-lg shadow-[#E91E63]/30`}>
          18+
        </span>
      )}
    </div>
  );
};

// Simple text version for places where we just need styled text
export const LogoText = ({ className = '' }) => (
  <span className={`font-bold font-serif ${className}`}>
    <span className="bg-gradient-to-r from-[#E91E63] via-[#FF4081] to-[#E91E63] bg-clip-text text-transparent">
      KKT
    </span>
    <span className="bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] bg-clip-text text-transparent">
      CX
    </span>
  </span>
);

export default Logo;
