/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product, User, Transaction } from '../types';
import { ArrowLeft, MessageSquare, ShoppingCart, ChevronLeft, ChevronRight, CheckCircle, Smartphone, Shield, Zap, RefreshCw, Trophy, Info } from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  seller: User;
  currentUser: User;
  transactions: Transaction[];
  onBack: () => void;
  onInitiateChat: (productId: number) => void;
  onOpenBuyModal: (product: Product) => void;
  onViewUserStorefront?: (userId: string) => void;
  allProducts?: Product[];
  onSelectProduct?: (productId: number) => void;
  onDeleteProduct?: (productId: number) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  seller,
  currentUser,
  transactions = [],
  onBack,
  onInitiateChat,
  onOpenBuyModal,
  onViewUserStorefront,
  allProducts = [],
  onSelectProduct,
  onDeleteProduct,
}) => {
  // Carousel index
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const soldQty = transactions
    .filter((tx) => tx.productId === product.id && tx.status === 'completed')
    .reduce((sum, tx) => sum + (tx.qty || 1), 0);

  const formatSoldQty = (qty: number): string => {
    if (qty >= 1000) {
      const kValue = qty / 1000;
      const formatted = kValue.toFixed(1).replace('.', ',');
      return formatted.endsWith(',0') ? `${Math.floor(kValue)}rb` : `${formatted}rb`;
    }
    return `${qty}`;
  };

  // Recommendation / Related Products
  const recommendations = (allProducts || [])
    .filter((p) => p.id !== product.id && p.stock > 0) // exclude current product & only active stock
    .filter((p) => p.category === product.category)    // same category
    .slice(0, 4);                                      // maximum 4 products

  const finalRecs = [...recommendations];
  if (finalRecs.length < 4) {
    const filler = (allProducts || [])
      .filter((p) => p.id !== product.id && p.stock > 0 && !finalRecs.some((x) => x.id === p.id))
      .slice(0, 4 - finalRecs.length);
    finalRecs.push(...filler);
  }

  return (
    <div className="space-y-6 animate-fade-in text-zinc-100">
      
      {/* Return button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 bg-zinc-900/90 border border-zinc-850 hover:border-[#0084ff] hover:text-[#0084ff] px-4 py-2.5 rounded-xl text-xs font-black text-zinc-300 transition-all duration-200 cursor-pointer active:scale-95 shadow-md"
        >
          <ArrowLeft size={14} />
          Kembali ke Beranda
        </button>
      </div>

      {/* Main detail layout without cards/outlines */}
      <div className="grid md:grid-cols-2 gap-8 md:gap-10">
        
        {/* LEFT COLUMN: INTERACTIVE SLIDES IMAGE CAROUSEL */}
        <div className="space-y-4">
          <div className="relative w-full aspect-[16/9] overflow-hidden flex items-center justify-center bg-black/40 keep-bg-dark">
            
            {/* Soldout Badge overlay */}
            {isSoldOut && (
              <div className="absolute inset-0 bg-black/85 z-20 flex items-center justify-center">
                <span className="px-6 py-2.5 bg-red-600 text-white font-black rounded-xl text-md tracking-widest scale-103 border border-white/20 shadow-2xl">
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
                  className="w-full h-full object-contain transition-all duration-300 pointer-events-none"
                  alt={product.title}
                  referrerPolicy="no-referrer"
                />
              )
            ) : (
              <div className="p-8 text-center text-zinc-650 font-bold">Tidak ada foto barang</div>
            )}

            {/* Slide Index Badge on image bottom-left overlay (matching picture style) */}
            {product.images && product.images.length > 0 && (
              <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-black text-white/90 z-10 select-none">
                {currentSlideIndex + 1}/{product.images.length}
              </span>
            )}

            {/* Navigation buttons - only show if there are multiple images */}
            {product.images && product.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/75 hover:bg-[#0084ff] hover:text-white text-zinc-300 rounded-full transition-all z-10 active:scale-90"
                  title="Sebelumnya"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/75 hover:bg-[#0084ff] hover:text-white text-zinc-300 rounded-full transition-all z-10 active:scale-90"
                  title="Selanjutnya"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}

            {/* Bottom Counter dot badges */}
            {product.images && product.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/60 px-3 py-1 rounded-full border border-zinc-800">
                {product.images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      currentSlideIndex === idx ? 'bg-[#0084ff] w-4' : 'bg-zinc-600 hover:bg-zinc-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Mini Thumbnail selector strip */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-none">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    currentSlideIndex === idx ? 'border-[#0084ff] opacity-100 scale-95 shadow-md shadow-[#0084ff]/20' : 'border-zinc-800 opacity-50 hover:opacity-100'
                  }`}
                >
                  {isVideoUrl(img) ? (
                    <video src={img} className="w-full h-full object-cover pointer-events-none bg-black" muted playsInline />
                  ) : (
                    <img src={img} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: INFO & BUY ACTION ACTIONS */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            {/* Category tag */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] bg-gradient-to-r from-[#0084ff]/10 to-[#00f0ff]/10 border border-[#0084ff]/30 text-[#0084ff] font-black px-3 py-1 rounded-lg uppercase tracking-widest">
                {product.category}
              </span>
              <span className={`text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${isSoldOut ? 'text-red-500' : product.stock < 20 ? 'text-amber-500' : 'text-emerald-500'}`}>
                <span className={`w-2 h-2 rounded-full ${isSoldOut ? 'bg-red-500 animate-pulse' : product.stock < 20 ? 'bg-amber-500 animate-pulse' : 'bg-green-500 animate-ping'}`} />
                {isSoldOut ? 'STOK : 0' : product.stock < 20 ? `tersisa: ${product.stock}` : `STOK : ${product.stock}`}
              </span>
            </div>

             {/* Title */}
            <h1 className="text-lg sm:text-xl font-black text-zinc-100 leading-tight">
              {product.title}
            </h1>

            {/* Price block & Terjual count - placed side by side below the title */}
            <div className="flex items-center justify-between py-0.5 mt-0.5 select-none">
              <span className="text-xl sm:text-2xl font-black text-[#0084ff] leading-none tracking-tight">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price)}
              </span>
              <span className="text-xs sm:text-sm font-bold text-zinc-400">
                Terjual: <span className="font-extrabold text-zinc-200">{formatSoldQty(soldQty)}</span>
              </span>
            </div>

            {/* Description panel - placed above the logo as requested */}
            <div className="space-y-1.5 mt-2">
              <h3 className="text-xs text-zinc-500 font-black uppercase tracking-wider">Keterangan Produk</h3>
              <div 
                onClick={() => setShowFullDesc(true)}
                className="cursor-pointer group/desc p-3 bg-zinc-950/40 hover:bg-zinc-950/60 border border-zinc-850 hover:border-zinc-750 rounded-xl transition-all"
                title="Klik untuk melihat deskripsi lengkap"
              >
                <p className="text-[11px] text-zinc-405 leading-relaxed font-semibold line-clamp-2">
                  {product.desc}
                </p>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-[#0084ff] font-black uppercase tracking-widest">
                  <span>LIHAT LENGKAP DETAILNYA</span>
                  <span className="group-hover/desc:translate-x-0.5 transition-transform duration-200">&darr;</span>
                </div>
              </div>
            </div>

            {/* Merchant / Seller profile box - borderless and backgroundless */}
            <div 
              onClick={() => onViewUserStorefront?.(seller.id)}
              className="flex items-center gap-3 py-2 cursor-pointer transition-all duration-250 group/seller select-none border-t border-zinc-850/30 mt-1"
              title={`Klik lihat seluruh jualan ${seller.username}`}
            >
              <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-black text-zinc-100 overflow-hidden shrink-0 group-hover/seller:border-[#0084ff] transition-all duration-200">
                {seller.profilePic ? (
                  <img src={seller.profilePic} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                ) : (
                  seller.username.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-extrabold text-zinc-200 truncate text-sm sm:text-base leading-none group-hover/seller:text-[#0084ff] transition-colors duration-205">
                    {seller.username}
                  </span>
                  {seller.verified && (
                    <span className="inline-flex items-center justify-center bg-blue-500 text-white rounded-full w-3 h-3 text-[7.5px] font-black shrink-0 shadow-sm" title="Terverifikasi">
                      ✓
                    </span>
                  )}
                  {seller.customRole && (
                    <span className="text-[8px] bg-amber-500/20 text-yellow-500 font-extrabold px-1 py-0.2 rounded shrink-0">
                      {seller.customRole}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Sheet Modal for Full Description View */}
            {showFullDesc && (
              <div 
                className="fixed inset-0 bg-black/80 flex items-end justify-center z-[110] p-0 sm:p-4 backdrop-blur-xs animate-fade-in cursor-default" 
                onClick={() => setShowFullDesc(false)}
              >
                <div 
                  className="bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-2xl sm:rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[75vh] shadow-2xl relative animate-slide-up"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Drawer drag handle representation */}
                  <div className="w-12 h-1 bg-zinc-750 rounded-full mx-auto my-3 shrink-0" />
                  
                  {/* Header info */}
                  <div className="px-5 pb-3 border-b border-zinc-850 flex items-center justify-between shrink-0">
                    <div>
                      <h4 className="font-extrabold text-xs text-[#0084ff] uppercase tracking-widest">Keterangan Lengkap</h4>
                      <p className="text-xs font-black text-zinc-200 mt-0.5 truncate max-w-sm">{product.title}</p>
                    </div>
                    <button 
                      onClick={() => setShowFullDesc(false)}
                      className="text-xs font-black text-zinc-450 hover:text-white px-2.5 py-1.5 bg-zinc-800 rounded-lg hover:bg-zinc-750 transition-colors"
                    >
                      Tutup
                    </button>
                  </div>

                  {/* Body description text area - scrollable */}
                  <div className="p-5 overflow-y-auto text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap font-medium flex-1">
                    {product.desc}
                  </div>
                  
                  {/* Bottom padding footer safeguard */}
                  <div className="p-4 border-t border-zinc-850 bg-zinc-950/40 flex justify-end shrink-0 select-none">
                    <button
                      onClick={() => setShowFullDesc(false)}
                      className="px-4 py-2 bg-primary hover:bg-[#0066ff] rounded-xl text-xs font-black text-white transition-all shadow-md active:scale-95"
                    >
                      Mengerti, Tutup
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* direct WA and Discord contact buttons */}
            <div className="space-y-2.5 pt-2">
              <h3 className="text-xs text-zinc-500 font-black uppercase tracking-wider">Kontak Cepat Direct</h3>
              <div className="grid grid-cols-2 gap-3">
                {product.discord ? (
                  <a
                    href={product.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-gradient-to-r from-[#5865F2] to-[#454fbf] hover:from-[#4954cc] hover:to-[#38409c] text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 text-center cursor-pointer"
                  >
                    <span>DIRECT DISCORD</span>
                  </a>
                ) : (
                  <button
                    disabled
                    className="p-3 bg-zinc-950 border border-zinc-900 text-zinc-650 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <span>Discord Kosong</span>
                  </button>
                )}

                {product.wa ? (
                  <a
                    href={`https://wa.me/${product.wa.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-gradient-to-r from-[#25D366] to-[#1d9e4c] hover:from-[#1ebd53] hover:to-[#17803e] text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 text-center cursor-pointer"
                  >
                    <span>DIRECT WHATSAPP</span>
                  </a>
                ) : (
                  <button
                    disabled
                    className="p-3 bg-zinc-950 border border-zinc-900 text-zinc-650 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <span>WhatsApp Kosong</span>
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* ACTION HANDLERS */}
          <div className="pt-5 border-t border-zinc-850 space-y-2">
            {!isMine && !isSoldOut && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* CHAT TO SELLER BUTTON (Internal Chat System) */}
                <button
                  type="button"
                  onClick={() => onInitiateChat(product.id)}
                  className="w-full bg-zinc-950 border border-zinc-850 hover:bg-[#0084ff]/5 hover:border-[#0084ff] text-zinc-200 hover:text-white p-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md"
                >
                  <MessageSquare size={16} className="text-[#0084ff]" />
                  Chat Sistem App
                </button>

                {/* BUY BUTTON */}
                <button
                  type="button"
                  onClick={() => onOpenBuyModal(product)}
                  className="w-full bg-[#0084ff] hover:bg-[#0066ff] text-white p-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-xl shadow-[#0084ff]/10 transition-all active:scale-95 cursor-pointer"
                >
                  <ShoppingCart size={16} />
                  Beli Sekarang
                </button>
              </div>
            )}

            {isMine && (
              <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-xl text-center">
                <p className="text-xs font-bold text-zinc-500">
                  Ini adalah produk jualan pribadi Anda. Kelola etalase Anda dari menu profil toko.
                </p>
              </div>
            )}

            {isSoldOut && !isMine && (
              <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl text-center">
                <p className="text-xs font-bold text-red-400">
                  Maaf, produk ini telah ludes terjual. Hubungi penjual jika ada pertanyaan.
                </p>
              </div>
            )}

            {/* DEVELOPER SPECIAL ACTION: DELETE POSTING */}
            {currentUser?.role === 'developer' && onDeleteProduct && (
              <div className="p-4 bg-red-950/10 border border-red-900/30 rounded-xl mt-3 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-red-500 text-xs font-black uppercase tracking-wider">
                  <span className="w-1.5 h-3 bg-red-500 rounded-full animate-pulse" />
                  Developer Action
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Sebagai Developer / Owner, Anda memiliki akses penuh untuk menghapus postingan jualan ini secara langsung.
                </p>
                
                {!isDeleting ? (
                  <button
                    type="button"
                    onClick={() => setIsDeleting(true)}
                    className="w-full bg-red-650 hover:bg-red-700 text-white p-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-lg shadow-red-950/20 transition-all active:scale-95 cursor-pointer"
                  >
                    Hapus Postingan Ini
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsDeleting(false)}
                      className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-350 p-2.5 rounded-xl text-xs font-black transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteProduct(product.id);
                        onBack();
                      }}
                      className="flex-1 bg-red-650 hover:bg-red-700 text-white p-2.5 rounded-xl text-xs font-black transition-all cursor-pointer animate-pulse"
                    >
                      Ya, Hapus!
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Rekomendasi Produk Lainnya (Indonesian local layout) */}
          {finalRecs.length > 0 && (
            <div className="space-y-3 pt-6 border-t border-zinc-800">
              <div className="flex items-center gap-1.5 justify-between">
                <h3 className="text-xs text-zinc-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-primary rounded-full" />
                  Rekomendasi Produk Lainnya
                </h3>
                <span className="text-[9px] text-[#0084ff] font-black uppercase">Saran Populer</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {finalRecs.map((p) => {
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        onSelectProduct?.(p.id);
                        // Reset slider on selection change
                        setCurrentSlideIndex(0);
                      }}
                      className="bg-zinc-950/30 border border-zinc-900 hover:border-primary/40 rounded-xl p-2 cursor-pointer transition-all active:scale-98 flex flex-col justify-between group"
                    >
                      <div className="relative aspect-square rounded-lg overflow-hidden mb-1.5 border border-zinc-900 keep-bg-dark">
                        {isVideoUrl(p.images[0]) ? (
                          <video src={p.images[0]} className="w-full h-full object-cover" muted />
                        ) : (
                          <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="" />
                        )}
                        <span className="absolute top-1 left-1 text-[7px] font-black bg-black/60 text-white px-1.5 py-0.5 rounded-md uppercase">
                          {p.category}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-[10px] font-bold text-zinc-300 line-clamp-1 group-hover:text-primary transition-colors leading-tight">
                          {p.title}
                        </h4>
                        <p className="text-[10px] font-black text-primary">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p.price)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
