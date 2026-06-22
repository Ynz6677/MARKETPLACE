import React from 'react';

interface SVGLogoProps {
  className?: string;
  size?: number;
  variant?: 'bear' | 'star' | 'wordmark';
}

/**
 * WAST Bear and Sparkle Icon renderer.
 * Modeled precisely after the user-supplied photos.
 */
export const SVGLogo: React.FC<SVGLogoProps> = ({ className = '', size = 32, variant = 'bear' }) => {
  const [customLogoUrl, setCustomLogoUrl] = React.useState<string | null>(() => {
    return localStorage.getItem('wast_custom_logo');
  });

  React.useEffect(() => {
    const handleLogoChange = () => {
      setCustomLogoUrl(localStorage.getItem('wast_custom_logo'));
    };
    window.addEventListener('wast_logo_changed', handleLogoChange);
    const interval = setInterval(handleLogoChange, 1000);
    return () => {
      window.removeEventListener('wast_logo_changed', handleLogoChange);
      clearInterval(interval);
    };
  }, []);

  if (variant === 'bear' && customLogoUrl) {
    return (
      <div 
        className={`relative flex items-center justify-center shrink-0 overflow-hidden rounded-xl border border-[#0084ff]/30 shadow-[0_0_15px_rgba(0,132,255,0.25)] bg-[#0d0d10] ${className}`} 
        style={{ width: size, height: size }}
      >
        <img 
          src={customLogoUrl} 
          alt="WAST Custom Logo" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  if (variant === 'star') {
    // Elegant 4-point diamond star sparkle shown in Photo 2
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`text-primary ${className}`}
        style={{ width: size, height: size }}
      >
        <path
          d="M 50 0 C 50 35, 65 50, 100 50 C 65 50, 50 65, 50 100 C 50 65, 35 50, 0 50 C 35 50, 50 35, 50 0 Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full filter drop-shadow-[0_4px_10px_rgba(0,132,255,0.45)] transition-all duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id="wastBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="50%" stopColor="#0084FF" />
            <stop offset="100%" stopColor="#0044CC" />
          </linearGradient>
          <linearGradient id="earInnerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0044CC" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1b1c22" />
            <stop offset="100%" stopColor="#07080a" />
          </linearGradient>
        </defs>

        {/* Shield background with premium stroke */}
        <polygon
          points="50,5 92,25 92,75 50,95 8,75 8,25"
          className="logo-shield-bg"
          fill="url(#shieldGrad)"
          stroke="#0084ff"
          strokeWidth="3.5"
          strokeLinejoin="round"
          opacity="0.95"
        />
        {/* Neon cyan inner glowing line */}
        <polygon
          points="50,10 87,28 87,72 50,90 13,72 13,28"
          className="logo-shield-inner"
          stroke="#00E5FF"
          strokeWidth="1.2"
          strokeLinejoin="round"
          opacity="0.75"
        />

        <g>
          {/* Bear Ears on background */}
          <circle cx="34" cy="30" r="10" fill="url(#wastBlueGrad)" />
          <circle cx="34" cy="30" r="6" fill="url(#earInnerGrad)" />
          
          <circle cx="66" cy="30" r="10" fill="url(#wastBlueGrad)" />
          <circle cx="66" cy="30" r="6" fill="url(#earInnerGrad)" />

          {/* Left Wing 'W' with dual-segment modern design */}
          <path
            d="M 16 32 L 28 32 L 39 74 L 27 74 Z"
            fill="url(#wastBlueGrad)"
          />
          <path
            d="M 28 32 L 32 32 L 41 74 L 39 74 Z"
            fill="#00E5FF"
            opacity="0.8"
          />

          {/* Right Wing 'W' */}
          <path
            d="M 84 32 L 72 32 L 61 74 L 73 74 Z"
            fill="url(#wastBlueGrad)"
          />
          <path
            d="M 72 32 L 68 32 L 59 74 L 61 74 Z"
            fill="#00E5FF"
            opacity="0.8"
          />

          {/* Bear main head base */}
          <path
            d="M 28 45 C 28 34, 72 34, 72 45 C 72 54, 62 64, 50 64 C 38 64, 28 54, 28 45 Z"
            fill="url(#wastBlueGrad)"
          />

          {/* Chevron connection - center peak of W shaping the lower jaw */}
          <path
            d="M 33 48 L 50 66 L 67 48 L 58 74 L 42 74 Z"
            fill="url(#wastBlueGrad)"
          />

          {/* Glowing blue diamond-cut sporty bear eyes */}
          <polygon points="37,42 43,40 45,44 39,45" fill="#FFFFFF" />
          <polygon points="37,42 43,40 45,44 39,45" fill="#00E5FF" opacity="0.9" />
          
          <polygon points="63,42 57,40 55,44 61,45" fill="#FFFFFF" />
          <polygon points="63,42 57,40 55,44 61,45" fill="#00E5FF" opacity="0.9" />

          {/* Premium White Snout/Muzzle inside head */}
          <ellipse cx="50" cy="51" rx="8" ry="7" fill="#FFFFFF" />

          {/* Black Nose and mouth line */}
          <path d="M 47 48 L 53 48 L 50 51 Z" fill="#0d0d10" />
          <path
            d="M 50 51 L 50 55 M 47 55 C 48.5 56.5, 50 56, 50 55 C 50 56, 51.5 56.5, 53 55"
            stroke="#0d0d10"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
};

interface WastWordmarkProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Text wordmark component "wast" representing Photo 2 precisely.
 * Styled with geometric bold lowercase letters, neon blue tone, and star sparkle.
 */
export const WastWordmark: React.FC<WastWordmarkProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    xs: 'text-xs gap-0.5',
    sm: 'text-sm gap-1',
    md: 'text-base sm:text-lg gap-1',
    lg: 'text-xl sm:text-2xl gap-1.5',
    xl: 'text-3xl sm:text-4xl gap-2',
  };

  const starSizes = {
    xs: 6,
    sm: 8,
    md: 10,
    lg: 12,
    xl: 18,
  };

  return (
    <div className={`flex items-baseline font-black tracking-tight select-none ${sizeClasses[size]} ${className}`}>
      {/* Lowercase "wast" styled text with energetic blue gradient */}
      <span className="keep-gradient bg-gradient-to-r from-[#00c8ff] via-[#0084ff] to-[#0055ff] bg-clip-text text-transparent lowercase font-black select-none">
        wast
      </span>
      {/* Dynamic star sparkle */}
      <SVGLogo variant="star" size={starSizes[size]} className="animate-pulse shrink-0 self-center opacity-90 text-[#00c8ff]" />
    </div>
  );
};

