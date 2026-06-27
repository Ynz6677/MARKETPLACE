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
    <div className="space-y-6 animate-fade-in text-zinc-100 mt-2">
      
      {/* Main detail layout matching desktop & tablet specifications */}
      <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-start">
        
        {/* LEFT COLUMN: INTERACTIVE IMAGES SLIDES & DESCRIPTION INFOS UNDER IT */}
        <div className="space-y-5">
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] overflow-hidden flex items-center justify-center bg-black/40 keep-bg-dark rounded-2xl border border-zinc-850">
            
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

            {/* Slide Index Badge on image bottom-left overlay */}
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
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/75 hover:bg-[#0084ff] hover:text-white text-zinc-300 rounded-full transition-all z-10 active:scale-90"
                  title="Sebelumnya"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/75 hover:bg-[#0084ff] hover:text-white text-zinc-300 rounded-full transition-all z-10 active:scale-90"
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

          {/* Variants selector strip (visual info only) */}
          {product.variants && product.variants.some(v => v.imageUrl) && (
            <div className="mt-2 space-y-2">
              <h3 className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest">Varian Produk</h3>
              <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-none">
                {product.variants.filter(v => v.imageUrl).map((v) => (
                  <div key={v.id} className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-zinc-800 shrink-0 group">
                    <img src={v.imageUrl!} className="w-full h-full object-cover" alt={v.name} referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1 text-center">
                      <span className="text-[8px] font-bold text-white leading-tight">{v.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DESKRIPSI PRODUK */}
          <div className="space-y-3 mt-8">
            <h3 className="text-xs text-zinc-400 font-extrabold uppercase tracking-widest">Deskripsi Produk</h3>
            <p className="text-sm text-zinc-300 leading-relaxed font-medium whitespace-pre-wrap">
              {product.desc}
            </p>
          </div>

          {/* INFORMASI PENJUAL */}
          <div className="space-y-3 mt-8">
            <h3 className="text-xs text-zinc-400 font-extrabold uppercase tracking-widest">Informasi Penjual</h3>
            <div 
              onClick={() => onViewUserStorefront?.(seller.id)}
              className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-2xl cursor-pointer hover:bg-zinc-800 border border-zinc-800 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 flex items-center justify-center font-black text-xl text-zinc-500">
                {seller.profilePic ? (
                  <img src={seller.profilePic} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                ) : (
                  seller.username.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-zinc-100">{seller.username}</span>
                  </div>
                  {seller.verified && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md">
                      <CheckCircle size={10} />
                      Terverifikasi
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-1 font-bold">Verified Seller · 48 Produk</p>
              </div>
            </div>
          </div>

          {/* PRODUK SERUPA DARI TOKO INI */}
          {finalRecs.length > 0 && (
            <div className="space-y-3 mt-8">
              <h3 className="text-xs text-zinc-400 font-extrabold uppercase tracking-widest">Produk Serupa Dari Toko Ini</h3>
              <div className="flex gap-3 overflow-x-auto pb-3.5 snap-x scrollbar-none">
                 {finalRecs.map(p => (
                   <div key={p.id} onClick={() => onSelectProduct?.(p.id)} className="bg-[#111928] rounded-[20px] overflow-hidden cursor-pointer border border-zinc-800/80 hover:border-zinc-700 min-w-[150px] sm:min-w-[160px] snap-start shadow-md hover:-translate-y-1 transition-all">
                      <div className="relative aspect-[4/3] bg-zinc-900">
                        {p.images?.[0] && <img src={p.images[0]} className="w-full h-full object-cover" alt={p.title} />}
                      </div>
                      <div className="p-3">
                        <h4 className="text-xs font-bold text-zinc-200 truncate">{p.title}</h4>
                        <p className="text-[#0084ff] font-black text-sm mt-1">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p.price)}
                        </p>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: FLOATING CARD */}
        <div className="relative w-full">
          <div className="sticky top-24 bg-[#111827] rounded-3xl p-6 border border-zinc-800/50 shadow-xl space-y-5">
            <div className="flex items-center gap-2 mb-2">
               <span className="bg-[#0084ff]/20 text-[#0084ff] text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">{product.category}</span>
               {seller.verified && (
                 <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1"><CheckCircle size={10} /> Verified</span>
               )}
            </div>
            
            <h1 className="text-2xl font-black text-white leading-tight">
              {product.title}
            </h1>
            
            <div className="text-3xl font-black text-[#0084ff] leading-none">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price)}
            </div>
            
            <div className="text-xs text-zinc-400 font-medium">
              Stok: <span className="text-zinc-300">{product.stock} tersedia</span> · {formatSoldQty(soldQty)} Terjual
            </div>

            <div className="flex items-center justify-between py-2 border-y border-zinc-800/60">
              <span className="text-sm font-bold text-zinc-300">Jumlah:</span>
              <div className="flex items-center bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
                <button className="px-3 py-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">-</button>
                <span className="px-4 py-1.5 font-bold text-white text-sm bg-zinc-950">1</span>
                <button className="px-3 py-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">+</button>
              </div>
            </div>

            <div className="bg-[#0b1221] rounded-xl p-4 flex items-center justify-between border border-[#0084ff]/20">
              <span className="text-zinc-400 text-sm font-bold">Total:</span>
              <span className="text-lg font-black text-[#0084ff]">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price)}
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => onOpenBuyModal(product)}
                disabled={isSoldOut || isMine}
                className="w-full bg-[#0084ff] hover:bg-blue-500 text-white py-4 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-400"
              >
                <ShoppingCart size={16} />
                Beli Sekarang
              </button>
              
              <button
                onClick={() => onInitiateChat(product.id)}
                disabled={isMine}
                className="w-full bg-transparent border-2 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-200 py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageSquare size={16} />
                Chat Penjual
              </button>
            </div>

            <div className="space-y-2 pt-2">
              {product.discord && (
                <a href={product.discord} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-[#5865F2]/50 transition-colors group">
                  <div className="w-6 h-6 flex items-center justify-center bg-[#5865F2] rounded-md text-white"><MessageSquare size={14} /></div>
                  <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200 truncate">{product.discord.replace('https://','').replace('http://','')}</span>
                </a>
              )}
              {product.wa && (
                <a href={`https://wa.me/${product.wa.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-[#25D366]/50 transition-colors group">
                  <div className="w-6 h-6 flex items-center justify-center bg-[#25D366] rounded-md text-white"><Smartphone size={14} /></div>
                  <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200">{product.wa}</span>
                </a>
              )}
            </div>

            {/* DEVELOPER SPECIAL ACTION: DELETE POSTING */}
            {currentUser?.role === 'developer' && onDeleteProduct && (
              <div className="p-4 bg-red-950/10 border border-red-900/30 rounded-xl mt-4 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-red-500 text-xs font-black uppercase tracking-wider">
                  <span className="w-1.5 h-3 bg-red-500 rounded-full animate-pulse" />
                  Developer Action
                </div>
                {!isDeleting ? (
                  <button onClick={() => setIsDeleting(true)} className="w-full bg-red-650 hover:bg-red-700 text-white p-3 rounded-xl text-xs font-black transition-all active:scale-95">
                    Hapus Postingan
                  </button>
                ) : (
                  <div className="flex gap-2 mt-1">
                    <button onClick={() => setIsDeleting(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-350 p-2.5 rounded-xl text-xs font-black transition-all">Batal</button>
                    <button onClick={() => { onDeleteProduct(product.id); onBack(); }} className="flex-1 bg-red-650 hover:bg-red-700 text-white p-2.5 rounded-xl text-xs font-black transition-all animate-pulse">Ya, Hapus!</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Sheet Drawer for Full Description detail view */}
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
                className="px-4 py-2 bg-[#0084ff] hover:bg-[#0066ff] rounded-xl text-xs font-black text-white transition-all shadow-md active:scale-95"
              >
                Mengerti, Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
