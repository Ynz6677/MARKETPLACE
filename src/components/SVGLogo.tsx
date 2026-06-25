/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface SVGLogoProps {
  className?: string;
  size?: number; // Representing width, height will be calculated automatically for 16:9
  variant?: 'bear' | 'star' | 'wordmark';
  width?: number;
  height?: number;
}

export const SVGLogo: React.FC<SVGLogoProps> = ({ className = '', size = 160, variant = 'bear', width, height }) => {
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

  if (variant === 'star') {
    const starWidth = width || size;
    const starHeight = height || size;
    return (
      <svg
        viewBox="0 0 100 100"
        className={className}
        style={{ width: starWidth, height: starHeight }}
        fill="currentColor"
      >
        <path d="M 50 0 C 50 40, 60 50, 100 50 C 60 50, 50 60, 50 100 C 50 60, 40 50, 0 50 C 40 50, 50 40, 50 0 Z" />
      </svg>
    );
  }

  const isVideo = (url: string) => {
    if (!url) return false;
    return url.startsWith('data:video/') || !!url.match(/\.(mp4|webm|ogg|mov|mkv)(\?.*)?$/i);
  };

  const logoUrl = customLogoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=350&q=80';
  const widthVal = width === 'auto' ? undefined : (width || size);
  const heightVal = height === 'auto' ? undefined : (height || 'auto');

  return (
    <div 
      className={`relative select-none shrink-0 flex items-center justify-center ${className}`}
      style={{ width: widthVal, height: heightVal === '100%' ? '100%' : heightVal }}
    >
      {isVideo(logoUrl) ? (
        <video 
          src={logoUrl} 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="max-w-full max-h-full object-contain"
        />
      ) : (
        <img 
          src={logoUrl} 
          alt="Branded Logo" 
          className="max-w-full max-h-full object-contain"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=350&q=80';
          }}
        />
      )}
    </div>
  );
};

export const WastWordmark: React.FC<{ className?: string, size?: any }> = () => {
  return null; // WAST text completely removed as requested
};
