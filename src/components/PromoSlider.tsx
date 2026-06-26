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
    <div className="relative w-full mx-auto select-none group/slider">
      {/* Slider viewport container */}
      <div className="w-full overflow-hidden rounded-2xl aspect-[21/8] sm:aspect-[3.5/1] relative bg-zinc-900">
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
              className="relative w-full h-full shrink-0 overflow-hidden flex flex-col justify-center p-6 sm:p-8 lg:p-10 transition-all duration-300"
              style={{ backgroundColor: banner.bgColor || '#003d99' }}
            >
              {banner.imageUrl && (
                <>
                  <img
                    src={banner.imageUrl}
                    className="absolute right-0 top-0 h-full w-2/3 object-cover mix-blend-luminosity opacity-80"
                    alt=""
                    referrerPolicy="no-referrer"
                    style={{ maskImage: 'linear-gradient(to left, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to left, black 50%, transparent 100%)' }}
                  />
                  <img
                    src={banner.imageUrl}
                    className="absolute right-0 top-0 h-full w-2/3 object-cover opacity-60"
                    alt=""
                    referrerPolicy="no-referrer"
                    style={{ maskImage: 'linear-gradient(to left, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to left, black 50%, transparent 100%)' }}
                  />
                </>
              )}

              {/* Headings and CTA Button details */}
              <div className="relative z-10 max-w-lg space-y-2 sm:space-y-3 select-none text-left flex flex-col items-start h-full justify-center">
                <h2
                  className="keep-text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black leading-tight tracking-tight font-sans drop-shadow-md truncate w-full flex items-center gap-2"
                  style={{ color: banner.titleColor || '#ffffff' }}
                >
                  <span className="text-2xl sm:text-3xl">🎮</span> {banner.title || 'Beli Robux Termurah!'}
                </h2>
                
                {banner.subtitle ? (
                  <p 
                    className="text-xs sm:text-sm md:text-base font-medium opacity-90 keep-text-white drop-shadow-md max-w-[80%] line-clamp-2"
                    style={{ color: banner.subtitleColor || '#e0e0e0' }}
                  >
                    {banner.subtitle}
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm md:text-base font-medium text-blue-100 opacity-90 drop-shadow-md max-w-[80%] line-clamp-2">
                    Trusted seller, proses cepat, harga terbaik
                  </p>
                )}

                <button 
                  className="mt-4 px-5 py-2.5 bg-[#0084ff] hover:bg-blue-500 text-white text-xs sm:text-sm font-black rounded-lg transition-all active:scale-95 shadow-lg border border-blue-400"
                >
                  {banner.buttonText || 'Lihat Penawaran'}
                </button>
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
