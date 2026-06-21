import React, { useState, useEffect, useCallback } from 'react';
import { BannerConfig } from '../types';
import { Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PromoSliderProps {
  banners: BannerConfig[];
}

export const PromoSlider: React.FC<PromoSliderProps> = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  // Handle slide transitions securely
  const nextSlide = useCallback(() => {
    if (banners.length <= 1) return;
    setDirection('right');
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    if (banners.length <= 1) return;
    setDirection('left');
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  // Set up auto sliding every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [nextSlide, banners.length]);

  if (!banners || banners.length === 0) return null;

  const activeBanner = banners[currentIndex];

  const slideVariants = {
    initial: (dir: 'left' | 'right') => ({
      opacity: 0,
      x: dir === 'right' ? 100 : -100,
    }),
    active: {
      opacity: 1,
      x: 0,
    },
    exit: (dir: 'left' | 'right') => ({
      opacity: 0,
      x: dir === 'right' ? -100 : 100,
    }),
  };

  // Build a beautiful solid layout with aspect-[16/9] as specified!
  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-zinc-900 shadow-2xl h-auto aspect-[16/9] md:aspect-[21/9]">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="initial"
          animate="active"
          exit="exit"
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          onDragEnd={(event, info) => {
            const swipeThreshold = 50;
            if (info.offset.x < -swipeThreshold) {
              setDirection('right');
              nextSlide();
            } else if (info.offset.x > swipeThreshold) {
              setDirection('left');
              prevSlide();
            }
          }}
          className="absolute inset-0 w-full h-full p-6 sm:p-8 flex flex-col justify-between bg-cover bg-center overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y"
          style={{
            backgroundColor: activeBanner.bgColor || '#002266',
            backgroundImage: activeBanner.imageUrl ? `url(${activeBanner.imageUrl})` : 'none',
          }}
        >
          {/* Radial light glow reflection backdrop representing a beautiful physical gloss gradient */}
          {!activeBanner.imageUrl && (
            <div
              className="absolute inset-0 opacity-80 bg-gradient-to-tr"
              style={{
                backgroundImage: `radial-gradient(ellipse at 80% 20%, ${activeBanner.accentColor || '#00f0ff'}22, transparent), linear-gradient(135deg, ${activeBanner.bgColor || '#0084ff'} 0%, ${activeBanner.accentColor || '#003399'} 100%)`
              }}
            />
          )}

          {activeBanner.imageUrl && (
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          )}

          {/* TOP TAGS - REMOVED PROMO TERBATAS BADGE */}
          <div className="z-10 self-start" />

          {/* HEADINGS AND BUTTON STACKED ELEGANTLY AT THE BOTTOM LEFT AS INDICATED */}
          <div className="z-10 max-w-lg mt-auto space-y-1.5 select-none">
            <h2 className="keep-text-white text-sm sm:text-base md:text-lg font-black text-white leading-tight uppercase tracking-tight font-sans drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)]">
              {activeBanner.title || 'DISKON GEDE SAMPAI 70%!'}
            </h2>
            <p className="keep-text-zinc text-[8px] sm:text-[9.5px] text-zinc-350 uppercase font-black tracking-wider leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
              {activeBanner.subtitle || 'Ribuan produk pilihan • Gratis ongkir'}
            </p>

            <div className="pt-1.5">
              <a
                href={activeBanner.buttonLink || '#'}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0084ff] hover:bg-[#0066ff] text-white rounded-full text-[9px] font-extrabold uppercase tracking-wide transition-all duration-200 hover:scale-103 active:scale-95 shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                <span>{activeBanner.buttonText || 'Belanja Sekarang'}</span>
                <span>&rarr;</span>
              </a>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Passive Pagination Indicators Dots (No manual click buttons, just display indicator) */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 right-4 z-25 flex gap-1 items-center bg-black/35 backdrop-blur-md px-2 py-1 rounded-full border border-white/5 select-none pointer-events-none">
          {banners.map((_, idx) => (
            <div
              key={idx}
              className={`w-1 h-1 rounded-full transition-all duration-300 ${
                currentIndex === idx ? 'w-3.5 bg-[#0084ff]' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
