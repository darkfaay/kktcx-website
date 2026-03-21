import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AppContext';
import { Flame, Heart, Sparkles } from 'lucide-react';

// Banner images based on orientation
const bannerImages = {
  // Default/heterosexual - romantic couple silhouettes
  default: [
    'https://images.unsplash.com/photo-1586867737814-a2db8b13de38?w=1920&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1555515597-29cfcf93b321?w=1920&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1615396112202-7d632d9f2297?w=1920&h=400&fit=crop&crop=center',
  ],
  heterosexual: [
    'https://images.unsplash.com/photo-1586867737814-a2db8b13de38?w=1920&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1555515597-29cfcf93b321?w=1920&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1615396112202-7d632d9f2297?w=1920&h=400&fit=crop&crop=center',
  ],
  // Lesbian - two women silhouettes
  lesbian: [
    'https://images.unsplash.com/photo-1659743164149-a7af51f65c67?w=1920&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1542460533-50ac46fb13d7?w=1920&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1693462467004-9e4835c88d17?w=1920&h=400&fit=crop&crop=center',
  ],
  // Gay - two men silhouettes
  gay: [
    'https://images.unsplash.com/photo-1749566787207-bd56427f4454?w=1920&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1583062199351-9d25ae32ae58?w=1920&h=400&fit=crop&crop=center',
    'https://images.pexels.com/photos/6315101/pexels-photo-6315101.jpeg?auto=compress&cs=tinysrgb&w=1920&h=400&fit=crop',
  ],
  // Bisexual - mixed romantic images
  bisexual: [
    'https://images.unsplash.com/photo-1659743164149-a7af51f65c67?w=1920&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1586867737814-a2db8b13de38?w=1920&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1749566787207-bd56427f4454?w=1920&h=400&fit=crop&crop=center',
  ],
  // Trans - colorful inclusive images
  trans: [
    'https://images.unsplash.com/photo-1659743164149-a7af51f65c67?w=1920&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1555515597-29cfcf93b321?w=1920&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1542460533-50ac46fb13d7?w=1920&h=400&fit=crop&crop=center',
  ],
};

// Headlines based on orientation
const headlines = {
  default: [
    'Tutkunun Adresi',
    'Unutulmaz Anlar',
    'Özel Buluşmalar',
  ],
  heterosexual: [
    'Tutkunun Adresi',
    'Romantik Anlar',
    'Hayalinizdeki Eşlik',
  ],
  lesbian: [
    'Özgür Aşk',
    'Kadın Kadına',
    'Tutkulu Buluşmalar',
  ],
  gay: [
    'Özgür Aşk',
    'Erkek Erkeğe',
    'Tutkulu Anlar',
  ],
  bisexual: [
    'Sınırsız Tutku',
    'Özgür Seçimler',
    'Her Yönden Aşk',
  ],
  trans: [
    'Gerçek Kendin Ol',
    'Özgür & Cesur',
    'Kabulün Gücü',
  ],
};

const PageBanner = ({ variant = 'default', showText = true, height = 'h-[200px] md:h-[280px]' }) => {
  const { user } = useAuth();
  const [currentImage, setCurrentImage] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Determine which orientation to use
  const getUserOrientation = () => {
    if (!user?.orientations?.length) return 'default';
    // Use the first orientation in the list
    const orientation = user.orientations[0];
    return bannerImages[orientation] ? orientation : 'default';
  };

  const orientation = getUserOrientation();
  const images = bannerImages[orientation] || bannerImages.default;
  const headlineOptions = headlines[orientation] || headlines.default;

  // Rotate images every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [images.length]);

  // Random headline on mount
  const [headline] = useState(() => 
    headlineOptions[Math.floor(Math.random() * headlineOptions.length)]
  );

  return (
    <div 
      className={`relative w-full ${height} overflow-hidden`}
      data-testid="page-banner"
    >
      {/* Background Images with Crossfade */}
      {images.map((img, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === currentImage ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={img}
            alt="Banner"
            className="w-full h-full object-cover"
            onLoad={() => setIsLoaded(true)}
          />
        </div>
      ))}

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#E91E63]/20 via-transparent to-[#9C27B0]/20" />
      
      {/* Animated Orbs */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#E91E63]/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-[#9C27B0]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Content */}
      {showText && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#E91E63]/30 to-[#9C27B0]/30 backdrop-blur-xl flex items-center justify-center animate-pulse">
                {orientation === 'default' || orientation === 'heterosexual' ? (
                  <Flame className="w-8 h-8 text-[#E91E63]" />
                ) : orientation === 'lesbian' || orientation === 'bisexual' ? (
                  <Heart className="w-8 h-8 text-[#FF6090]" />
                ) : (
                  <Sparkles className="w-8 h-8 text-[#CE93D8]" />
                )}
              </div>
            </div>
            
            {/* Headline */}
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold font-serif text-white hero-text-shadow">
              <span className="gradient-text">{headline}</span>
            </h2>
            
            {/* Subtext */}
            <p className="mt-3 text-white/60 text-sm md:text-base max-w-md mx-auto">
              Kıbrıs'ın en seçkin eşlik platformu
            </p>
          </div>
        </div>
      )}

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0A0A0F] to-transparent" />

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImage(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentImage 
                  ? 'w-6 bg-[#E91E63]' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PageBanner;
