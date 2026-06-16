/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product, User } from '../types';
import { ArrowLeft, MessageSquare, ShoppingCart, ChevronLeft, ChevronRight, CheckCircle, Smartphone } from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  seller: User;
  currentUser: User;
  onBack: () => void;
  onInitiateChat: (productId: number) => void;
  onOpenBuyModal: (product: Product) => void;
  onViewUserStorefront?: (userId: string) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  seller,
  currentUser,
  onBack,
  onInitiateChat,
  onOpenBuyModal,
  onViewUserStorefront,
}) => {
  // Carousel index
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const isVideoUrl = (url?: string | null) => {
    return url?.startsWith('data:video/') || url?.match(/\.(mp4|webm|ogg|mov|mkv|3gp)(\?.*)?$/i);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  const isSoldOut = product.stock <= 0;
  const isMine = product.sellerId === currentUser.id;

  return (
    <div className="space-y-6">
      
      {/* Return button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-primary px-4 py-2 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-all duration-200"
        >
          <ArrowLeft size={14} />
          Kembali ke Beranda
        </button>
      </div>

      {/* Main detail layout */}
      <div className="bg-zinc-900 border border-zinc-805 rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl grid md:grid-cols-2 gap-6 md:gap-8">
        
        {/* LEFT COLUMN: INTERACTIVE SLIDES IMAGE CAROUSEL (AS REQUESTED) */}
        <div className="space-y-4">
          <div className="relative w-full h-[200px] sm:h-[280px] bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 flex items-center justify-center">
            
            {/* Soldout Badge overlay */}
            {isSoldOut && (
              <div className="absolute inset-0 bg-black/75 z-20 flex items-center justify-center">
                <span className="px-6 py-2 bg-red-600 text-white font-black rounded-lg text-lg tracking-widest scale-105 border-2 border-white/20">
                  HABIS TERJUAL
                </span>
              </div>
            )}

            {/* Slider Image/Video source */}
            {product.images && product.images.length > 0 ? (
              isVideoUrl(product.images[currentSlideIndex]) ? (
                <video
                  src={product.images[currentSlideIndex]}
                  className="w-full h-full object-contain max-h-full bg-black"
                  controls
                  playsInline
                  autoPlay
                  muted
                />
              ) : (
                <img
                  src={product.images[currentSlideIndex]}
                  className="w-full h-full object-contain max-h-full"
                  alt={product.title}
                />
              )
            ) : (
              <div className="p-8 text-center text-zinc-650 font-bold">Tidak ada foto barang</div>
            )}

            {/* Navigation buttons - only show if there are multiple images */}
            {product.images && product.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-primary text-white rounded-full transition-all z-10 active:scale-90"
                  title="Sebelumnya"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-primary text-white rounded-full transition-all z-10 active:scale-90"
                  title="Selanjutnya"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}

            {/* Bottom Counter dot badges */}
            {product.images && product.images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10 bg-black/40 px-2 py-0.5 rounded-full">
                {product.images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      currentSlideIndex === idx ? 'bg-primary w-3.5' : 'bg-zinc-650'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Mini Thumbnail selector strip */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                    currentSlideIndex === idx ? 'border-primary opacity-100 scale-95' : 'border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  {isVideoUrl(img) ? (
                    <video src={img} className="w-full h-full object-cover pointer-events-none bg-black" muted playsInline />
                  ) : (
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: INFO & BUY ACTION ACTIONS */}
        <div className="flex flex-col justify-between space-y-4sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            
            {/* Category tag */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs bg-primary/10 border border-primary/20 text-primary font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                {product.category}
              </span>
              <span className={`text-[10px] sm:text-xs font-bold ${isSoldOut ? 'text-red-500' : 'text-emerald-500'}`}>
                {isSoldOut ? 'Stok Kosong' : `Stok Tersedia: ${product.stock}`}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-xl md:text-2xl font-extrabold text-zinc-100 leading-tight">
              {product.title}
            </h1>

            {/* Price section with robust dynamic shrink logic to avoid overflows */}
            <div className="p-3.5 bg-zinc-950 rounded-2xl border border-zinc-900 overflow-hidden">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase block mb-1">Harga Transaksi</span>
              {(() => {
                const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price);
                const len = formattedPrice.length;
                let sizeClass = 'text-xl sm:text-2xl md:text-3xl';
                if (len > 30) {
                  sizeClass = 'text-[11px] sm:text-xs leading-tight break-all';
                } else if (len > 24) {
                  sizeClass = 'text-xs sm:text-sm leading-tight break-all';
                } else if (len > 18) {
                  sizeClass = 'text-sm sm:text-base leading-tight break-all';
                } else if (len > 14) {
                  sizeClass = 'text-base sm:text-lg md:text-xl break-all';
                } else if (len > 11) {
                  sizeClass = 'text-lg sm:text-xl md:text-2xl break-all';
                }
                return (
                  <span className={`${sizeClass} font-black text-primary block truncate`}>
                    {formattedPrice}
                  </span>
                );
              })()}
            </div>

            {/* Seller profile box */}
            <div 
              onClick={() => onViewUserStorefront?.(seller.id)}
              className="flex items-center gap-3.5 p-3.5 bg-zinc-950/40 hover:bg-zinc-950/70 border border-zinc-850 rounded-2xl cursor-pointer transition-all duration-200 group/seller"
              title={`Klik lihat seluruh jualan ${seller.username}`}
            >
              <div className="w-12 h-12 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center font-bold text-zinc-100 overflow-hidden shrink-0 group-hover/seller:border-primary transition-all">
                {seller.profilePic ? (
                  <img src={seller.profilePic} className="w-full h-full object-cover" alt="" />
                ) : (
                  seller.username.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-zinc-200 truncate text-sm sm:text-base leading-none group-hover/seller:text-primary transition-colors">
                    {seller.username}
                  </span>
                  {seller.verified && (
                    <span className="inline-flex items-center justify-center bg-[#1DA1F2] text-white rounded-full w-3.5 h-3.5 text-[8.5px] font-black shrink-0" title="Terverifikasi">
                      ✓
                    </span>
                  )}
                  {seller.customRole && (
                    <span className="text-[10px] bg-amber-500/20 text-yellow-400 font-extrabold px-1.5 py-0.2 rounded-md shrink-0">
                      {seller.customRole}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-primary font-bold leading-none">
                    Lihat Toko & Profil Penjual
                  </p>
                  <span className="text-[10.5px] text-primary font-bold opacity-0 group-hover/seller:opacity-100 transition-opacity duration-200 shrink-0">
                    Kunjungi &rarr;
                  </span>
                </div>
              </div>
            </div>

            {/* Description panel */}
            <div className="space-y-1.5">
              <h3 className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Keterangan Produk</h3>
              <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-950/10 p-3 rounded-xl border border-zinc-800/40 whitespace-pre-wrap font-medium">
                {product.desc}
              </p>
            </div>

            {/* PRESERVING PHYSICAL DISCORD/WA CONTACT LINKS (AS STRICTLY MANDATED AT TURN INSTRUCTIONS) */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Metode Kontak Langsung</h3>
              <div className="grid grid-cols-2 gap-2.5">
                {product.discord ? (
                  <a
                    href={product.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 text-center"
                  >
                    <span>DISCORD</span>
                  </a>
                ) : (
                  <button
                    disabled
                    className="p-3 bg-zinc-800 text-zinc-500 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <span>Discord Kosong</span>
                  </button>
                )}

                {product.wa ? (
                  <a
                    href={`https://wa.me/${product.wa.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 text-center"
                  >
                    <span>Chat WhatsApp</span>
                  </a>
                ) : (
                  <button
                    disabled
                    className="p-3 bg-zinc-800 text-zinc-500 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <span>WhatsApp Kosong</span>
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* ACTION HANDLERS */}
          <div className="pt-4 border-t border-zinc-800/60 space-y-2">
            {!isMine && !isSoldOut && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* TANYAKAN TERLEBIH DAHULU (CHAT PENJUAL) AS REQUESTED */}
                <button
                  type="button"
                  onClick={() => onInitiateChat(product.id)}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white p-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <MessageSquare size={16} className="text-primary" />
                  Chat Penjual Sistem
                </button>

                {/* BUY BUTTON */}
                <button
                  type="button"
                  onClick={() => onOpenBuyModal(product)}
                  className="w-full bg-primary hover:bg-primary-hover text-white p-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-xl shadow-primary/10 transition-all active:scale-95"
                >
                  <ShoppingCart size={16} />
                  Beli Sekarang
                </button>
              </div>
            )}

            {isMine && (
              <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-center">
                <p className="text-xs font-bold text-zinc-500">
                  Ini adalah produk jualan pribadi Anda. Kelola etalase Anda dari menu profil toko.
                </p>
              </div>
            )}

            {isSoldOut && !isMine && (
              <div className="p-3.5 bg-red-950/20 border border-red-900/30 rounded-xl text-center">
                <p className="text-xs font-bold text-red-400">
                  Maaf, produk ini telah ludes terjual. Hubungi penjual jika ada pertanyaan.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
