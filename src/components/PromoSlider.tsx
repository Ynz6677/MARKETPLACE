import React, { useState, useEffect, useCallback } from 'react';
import { BannerConfig } from '../types';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PromoSliderProps {
  banners: BannerConfig[];
}

export const PromoSlider: React.FC<PromoSliderProps> = ({ banners }) => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Monitor tablet or desktop width
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show 1 on mobile, 2 on tablet & desktop
  const visibleCount = isDesktop ? 2 : 1;
  const isScrollable = banners.length > visibleCount;

  const nextSlide = useCallback(() => {
    if (!isScrollable) return;
    const maxIndex = banners.length - visibleCount;
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [banners.length, visibleCount, isScrollable]);

  const prevSlide = useCallback(() => {
    if (!isScrollable) return;
    const maxIndex = banners.length - visibleCount;
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [banners.length, visibleCount, isScrollable]);

  // Autoplay banner transitions smoothly every 5.5 seconds
  useEffect(() => {
    if (!isScrollable) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5500);

    return () => clearInterval(interval);
  }, [nextSlide, isScrollable]);

  if (!banners || banners.length === 0) return null;

  const maxDotsCount = banners.length - visibleCount + 1;

  return (
    <div className="relative w-full select-none group/slider">
      {/* Slider viewport container */}
      <div className="w-full overflow-hidden rounded-2xl">
        <motion.div
          className="flex gap-4 w-full"
          animate={{
            x: `calc(-${currentIndex * (isDesktop ? 50 : 100)}% - ${currentIndex * (isDesktop ? 8 : 0)}px)`
          }}
          transition={{
            type: 'spring',
            stiffness: 80,
            damping: 16,
            mass: 0.9,
          }}
        >
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="relative w-full sm:w-[calc(50%-8px)] shrink-0 overflow-hidden rounded-2xl border border-zinc-850 hover:border-[#0084ff]/35 shadow-2xl flex flex-col justify-between p-4 sm:p-5 h-[110px] sm:h-[155px] transition-all duration-300 bg-contain bg-no-repeat bg-center"
              style={{
                backgroundColor: banner.bgColor || '#001b3a',
                backgroundImage: banner.imageUrl ? `url(${banner.imageUrl})` : 'none',
              }}
            >
              {/* Styled ambient background highlighting */}
              {!banner.imageUrl && (
                <div
                  className="absolute inset-0 opacity-80"
                  style={{
                    backgroundImage: `radial-gradient(ellipse at 85% 15%, ${banner.accentColor || '#00f0ff'}1a, transparent), linear-gradient(135deg, ${banner.bgColor || '#001026'} 0%, ${banner.accentColor || '#002255'} 100%)`
                  }}
                />
              )}

              {banner.imageUrl && (
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              )}

              {/* Empty upper layout tag */}
              <div className="z-10" />

              {/* Headings and CTA Button details */}
              <div className="z-10 max-w-md mt-auto space-y-1 select-none text-left">
                {/* White text Title as requested by user */}
                <h2 className="keep-text-white text-xs sm:text-sm font-black text-white leading-tight uppercase tracking-tight font-sans drop-shadow-[0_1.5px_2.5px_rgba(0,0,0,0.9)] truncate">
                  {banner.title || 'DISKON SAMPAI 70%'}
                </h2>
                <p className="keep-text-zinc text-[8px] sm:text-[9px] text-zinc-300 uppercase font-black tracking-wider leading-none drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.9)] truncate">
                  {banner.subtitle || 'Promo Spesial Minggu Ini'}
                </p>

                <div className="pt-1.5 select-none pointer-events-auto">
                  <a
                    href={banner.buttonLink || '#'}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0084ff] hover:bg-[#0066ff] text-white rounded-full text-[8px] font-extrabold uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/30 cursor-pointer"
                  >
                    <span>{banner.buttonText || 'Buka'}</span>
                    <span>&rarr;</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Manual Slide Navigation Buttons - Left and Right */}
      {isScrollable && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-zinc-950/80 hover:bg-[#0084ff] border border-zinc-800 text-zinc-350 hover:text-white flex items-center justify-center transition-all duration-200 shadow-xl opacity-0 group-hover/slider:opacity-100 backdrop-blur-md active:scale-90 cursor-pointer z-10"
            title="Slide Sebelumnya"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-zinc-950/80 hover:bg-[#0084ff] border border-zinc-800 text-zinc-350 hover:text-white flex items-center justify-center transition-all duration-200 shadow-xl opacity-0 group-hover/slider:opacity-100 backdrop-blur-md active:scale-90 cursor-pointer z-10"
            title="Slide Selanjutnya"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}

      {/* Compact Sliding Dot Indicators */}
      {isScrollable && maxDotsCount > 1 && (
        <div className="flex justify-center gap-1.5 items-center mt-3.5 w-full">
          {Array.from({ length: maxDotsCount }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === idx ? 'w-5 bg-[#0084ff]' : 'w-1.5 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
