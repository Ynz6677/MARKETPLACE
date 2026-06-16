/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Product } from '../types';
import { X, MessageSquare, ShoppingBag } from 'lucide-react';

interface UserStorefrontModalProps {
  userId: string;
  users: User[];
  products: Product[];
  onClose: () => void;
  onSelectProduct: (productId: number) => void;
  onStartChat: (userId: string, productId: number) => void;
}

export const UserStorefrontModal: React.FC<UserStorefrontModalProps> = ({
  userId,
  users,
  products,
  onClose,
  onSelectProduct,
  onStartChat,
}) => {
  const seller = users.find(u => u.id === userId);
  const sellerProducts = products.filter(p => p.sellerId === userId);

  if (!seller) {
    return (
      <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-5 space-y-4 text-center">
          <p className="text-sm font-bold text-zinc-300">Pengguna tidak ditemukan.</p>
          <button onClick={onClose} className="px-4 py-2 bg-primary text-white font-bold rounded-xl text-xs">
            Tutup
          </button>
        </div>
      </div>
    );
  }

  const isVideoUrl = (url?: string | null) => {
    return url?.startsWith('data:video/') || url?.match(/\.(mp4|webm|ogg|mov|mkv|3gp)(\?.*)?$/i);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-3 sm:p-4 backdrop-blur-sm animate-fade-in">
      {/* Container is compact and elegant so "pop up nya jangan terlalu tinggi" */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[82vh] shadow-2xl relative animate-scale-up">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-950/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag size={16} className="text-primary" />
            <span className="text-xs font-black text-zinc-400 uppercase tracking-wider">Etalase Toko SANS Victim</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 px-1.5 bg-zinc-850 hover:bg-zinc-800 hover:text-white rounded text-zinc-400 transition-colors"
            title="Tutup Etalase"
          >
            <X size={16} />
          </button>
        </div>

        {/* Seller Info Segment */}
        <div className="p-4 bg-zinc-900 border-b border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-100 overflow-hidden shrink-0">
              {seller.profilePic ? (
                <img src={seller.profilePic} className="w-full h-full object-cover" alt="" />
              ) : (
                seller.username.slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-extrabold text-sm sm:text-base text-zinc-100 leading-tight">
                  {seller.username}
                </h4>
                {seller.verified && (
                  <span className="inline-flex items-center justify-center bg-[#1DA1F2] text-white rounded-full w-3.5 h-3.5 text-[8.5px] font-black shrink-0" title="Terverifikasi">
                    ✓
                  </span>
                )}
                {seller.customRole && (
                  <span className="text-[8.5px] bg-amber-500/20 text-yellow-400 font-extrabold px-1.5 py-0.2 rounded">
                    {seller.customRole}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-zinc-500 font-bold uppercase shrink-0">
                  {seller.role === 'developer' || seller.role === 'admin' ? 'SYSTEM CORE STAFF' : 'PENJUAL PREMIUM'}
                </span>
                <span className="text-zinc-700 text-xs">•</span>
                <span className="text-[11px] text-primary font-bold">
                  {sellerProducts.length} Produk Aktif
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const firstProdId = sellerProducts.length > 0 ? sellerProducts[0].id : 0;
                onStartChat(seller.id, firstProdId);
              }}
              className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 hover:text-white text-primary rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all text-center"
              title={`Mulai chat dengan ${seller.username}`}
            >
              <MessageSquare size={13} />
              Hubungi Penjual
            </button>
          </div>
        </div>

        {/* Products List Segment - Scrollable, constrained inside an elegant compact box */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-950/20 min-h-[220px]">
          <h5 className="text-[10px] text-zinc-500 font-black uppercase tracking-widest leading-none">Daftar Barang Jualan ({sellerProducts.length})</h5>

          {sellerProducts.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/50 text-zinc-500 text-xs">
              <ShoppingBag size={24} className="mx-auto mb-2 opacity-30" />
              User ini belum memposting barang jualan apa pun.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {sellerProducts.map((p) => {
                const isOut = p.stock <= 0;
                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectProduct(p.id)}
                    className="group flex bg-zinc-900 border border-zinc-850 hover:border-primary/80 rounded-xl overflow-hidden cursor-pointer p-2 gap-2.5 transition-all duration-200"
                    title={`Klik untuk lihat detail ${p.title}`}
                  >
                    <div className="w-14 h-14 bg-zinc-950 rounded overflow-hidden shrink-0 flex items-center justify-center relative">
                      {p.images && p.images.length > 0 && (
                        isVideoUrl(p.images[0]) ? (
                          <video src={p.images[0]} className="w-full h-full object-cover pointer-events-none animate-fade-in bg-black" muted playsInline />
                        ) : (
                          <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 bg-zinc-950" alt="" />
                        )
                      )}
                      
                      {isOut && (
                        <div className="absolute inset-0 bg-black/85 flex items-center justify-center">
                          <span className="px-1 py-0.2 bg-red-650 text-white font-extrabold text-[7px] rounded">HABIS</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <span className="text-[7.5px] bg-zinc-800 text-zinc-400 px-1 py-0.2 rounded font-bold uppercase tracking-wider">
                          {p.category}
                        </span>
                        <h6 className="font-extrabold text-[11px] text-zinc-200 truncate group-hover:text-primary transition-colors mt-1">
                          {p.title}
                        </h6>
                      </div>
                      
                      <div className="flex items-center justify-between text-[11px] font-black mt-1">
                        <span className="text-primary truncate">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p.price)}
                        </span>
                        <span className="text-[9px] text-zinc-500 font-bold shrink-0">Stok: {p.stock}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-zinc-850 bg-zinc-900/90 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all text-center"
          >
            Tutup Etalase
          </button>
        </div>

      </div>
    </div>
  );
};
