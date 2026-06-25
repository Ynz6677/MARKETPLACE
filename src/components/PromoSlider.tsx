import React, { useState, useEffect, useCallback } from 'react';
import { BannerConfig } from '../types';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PromoSliderProps {
  banners: BannerConfig[];
}

export const PromoSlider: React.FC<PromoSliderProps> = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const isScrollable = banners.length > 1;

  const nextSlide = useCallback(() => {
    if (!isScrollable) return;
    setCurrentIndex((prev) => (prev >= banners.length - 1 ? 0 : prev + 1));
  }, [banners.length, isScrollable]);

  const prevSlide = useCallback(() => {
    if (!isScrollable) return;
    setCurrentIndex((prev) => (prev <= 0 ? banners.length - 1 : prev - 1));
  }, [banners.length, isScrollable]);

  // Autoplay banner transitions smoothly every 6 seconds
  useEffect(() => {
    if (!isScrollable) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => clearInterval(interval);
  }, [nextSlide, isScrollable]);

  if (!banners || banners.length === 0) return null;

  // Swipe gesture via framer-motion drag end
  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 50; // swipe 50px to trigger slide transition
    if (info.offset.x < -swipeThreshold) {
      nextSlide();
    } else if (info.offset.x > swipeThreshold) {
      prevSlide();
    }
  };

  return (
    <div className="relative w-full max-w-full md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto select-none group/slider">
      {/* Slider viewport container */}
      <div className="w-full overflow-hidden rounded-2xl aspect-[21/9] sm:aspect-[2.5/1] relative bg-zinc-950 border border-zinc-850">
        <motion.div
          className="flex w-full h-full cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.25}
          onDragEnd={handleDragEnd}
          animate={{ x: `-${currentIndex * 100}%` }}
          style={{ touchAction: 'pan-y' }}
          transition={{
            type: 'spring',
            stiffness: 280,
            damping: 26,
            mass: 0.8,
          }}
        >
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="relative w-full h-full shrink-0 overflow-hidden flex flex-col justify-end p-4 sm:p-6 transition-all duration-300"
              style={{
                backgroundColor: banner.bgColor || '#001b3a',
              }}
            >
              {banner.imageUrl ? (
                <img
                  src={banner.imageUrl}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                  alt=""
                  referrerPolicy="no-referrer"
                />
              ) : null}

              {/* Styled ambient background highlighting if no banner image is provided */}
              {!banner.imageUrl && (
                <div
                  className="absolute inset-0 opacity-80"
                  style={{
                    backgroundImage: `radial-gradient(ellipse at 85% 15%, ${banner.accentColor || '#00f0ff'}1a, transparent), linear-gradient(135deg, ${banner.bgColor || '#001026'} 0%, ${banner.accentColor || '#002255'} 100%)`
                  }}
                />
              )}

              {/* Ambient dark gradient overlay to ensure high-contrast text readability */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              {/* Headings and CTA Button details */}
              <div className="z-10 max-w-md space-y-1 sm:space-y-2 select-none text-left">
                <h2
                  className="keep-text-white text-xs sm:text-base md:text-lg font-black leading-tight uppercase tracking-tight font-sans drop-shadow-[0_2px_3px_rgba(0,0,0,0.95)] truncate"
                  style={{ color: banner.titleColor || '#ffffff' }}
                >
                  {banner.title || 'DISKON SAMPAI 70%'}
                </h2>
                <p
                  className="keep-text-zinc text-[9px] sm:text-xs uppercase font-black tracking-wider leading-none drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.95)] truncate"
                  style={{ color: banner.subtitleColor || '#d4d4d8' }}
                >
                  {banner.subtitle || 'Promo Spesial Minggu Ini'}
                </p>

                <div className="pt-1.5 select-none pointer-events-auto">
                  <a
                    href={banner.buttonLink || '#'}
                    className="inline-flex items-center gap-1 px-3 py-1 text-white rounded-full text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-black/30 cursor-pointer"
                    style={{ backgroundColor: banner.accentColor || '#0084ff' }}
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
      {isScrollable && (
        <div className="flex justify-center gap-1.5 items-center mt-3 w-full">
          {banners.map((_, idx) => (
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
