/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Product } from '../types';
import { Settings, Save, Lock, User as UserIcon, Shield, Camera, Edit2, Trash2, LogOut } from 'lucide-react';

interface ProfilePanelProps {
  currentUser: User;
  products: Product[];
  onUpdateProfile: (updatedData: Partial<User>) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => void;
  onLogout?: () => void;
  onGoToTab?: (tab: 'home' | 'history' | 'profile' | 'developer' | 'upload' | 'chats' | 'stores') => void;
}

export const ProfilePanel: React.FC<ProfilePanelProps> = ({
  currentUser,
  products,
  onUpdateProfile,
  onEditProduct,
  onDeleteProduct,
  onLogout,
  onGoToTab,
}) => {
  const [username, setUsername] = useState(currentUser.username);
  const [password, setPassword] = useState('');
  const [customRole, setCustomRole] = useState(currentUser.customRole);
  const [profilePic, setProfilePic] = useState<string | null>(currentUser.profilePic);
  
  const [toastText, setToastText] = useState<string | null>(null);

  const isVideoUrl = (src?: string | null) => {
    return src?.startsWith('data:video/') || src?.match(/\.(mp4|webm|ogg|mov|mkv|3gp)(\?.*)?$/i);
  };
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const triggerToast = (msg: string) => {
    setToastText(msg);
    setTimeout(() => setToastText(null), 3000);
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfilePic(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const currentOwnedProducts = products.filter((p) => p.sellerId === currentUser.id);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      triggerToast('Username tidak boleh kosong!');
      return;
    }

    const updates: Partial<User> = {
      username: username.trim(),
      customRole: customRole.trim(),
      profilePic,
    };

    if (password.trim() !== '') {
      updates.password = password;
    }

    onUpdateProfile(updates);
    triggerToast('Sukses menyimpan profile & kata sandi baru!');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      
      {/* Visual confirmation toast */}
      {toastText && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-primary text-white text-xs font-bold shadow-xl animate-bounce">
          {toastText}
        </div>
      )}

      {/* LEFT COLUMN: EDIT PERSONAL DETAILS */}
      <div className="w-full lg:w-96 shrink-0 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="border-b border-zinc-800 pb-3 flex items-center gap-2">
          <Settings size={18} className="text-primary" />
          <h2 className="font-extrabold text-zinc-100 text-lg">Edit Profil Toko</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          
          {/* File input profile preview */}
          <div className="flex flex-col items-center">
            <div className="relative group w-24 h-24 rounded-full bg-zinc-950 border-2 border-dashed border-zinc-800 hover:border-primary flex items-center justify-center cursor-pointer overflow-hidden transition-all">
              {profilePic ? (
                <img src={profilePic} className="w-full h-full object-cover" alt="Profile avatar" />
              ) : (
                <span className="text-zinc-500 text-lg font-bold">
                  {currentUser.username.slice(0, 2).toUpperCase()}
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-black/60 py-1 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={12} className="text-white" />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePicChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                title="Ganti Foto Profil"
              />
            </div>
            <span className="text-[10px] text-zinc-500 font-bold mt-2">Dukung JPG/PNG (Maks 1MB)</span>
          </div>

          {/* Username string */}
          <div className="space-y-1">
            <label className="text-xs text-zinc-400 font-bold">Username Akun</label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-primary transition-all font-semibold"
              />
            </div>
          </div>



          {/* Password update String */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs text-zinc-400 font-bold">Ubah Sandi Baru</label>
              <span className="text-[10px] text-zinc-500 font-bold">Kosongkan jika tetap</span>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Buat sandi baru (Aman)"
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-zinc-100 placeholder-zinc-650 outline-none focus:border-primary transition-all font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Save size={16} />
            Simpan Perubahan Profil
          </button>

        </form>

        {(currentUser.role === 'developer' || currentUser.role === 'admin') && onGoToTab && (
          <div className="pt-2 border-t border-zinc-500/10">
            <button
              type="button"
              onClick={() => onGoToTab('developer')}
              className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 py-2.5 rounded-xl font-extrabold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/5"
            >
              <Shield size={13} className="fill-current" />
              MENU DEVELOPER PANEL
            </button>
          </div>
        )}

        {onLogout && (
          <div className="pt-2 border-t border-zinc-850">
            <button
              type="button"
              onClick={onLogout}
              className="w-full bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 border border-red-900/30 py-2.5 rounded-xl font-extrabold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut size={13} />
              Keluar dari Akun Saya
            </button>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: LIST AND EDIT MY PRODUCTS (SOLVES "tidak bisa edit jualan kitaa") */}
      <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="border-b border-zinc-800 pb-3">
          <h2 className="font-extrabold text-zinc-100 text-lg leading-none">Etalase Toko Jualan Saya</h2>
          <p className="text-xs text-zinc-400 mt-1.5 font-medium">Ubah deskripsi, stok barang, atau harga jual produk Anda dengan cepat.</p>
        </div>

        {currentOwnedProducts.length === 0 ? (
          <div className="p-12 text-center text-zinc-550 border border-dashed border-zinc-8 w-full font-bold rounded-2xl bg-zinc-955/20 text-sm">
            Toko Anda belum memposting barang apa pun. Klik Jual di menu navigasi untuk memulainya!
          </div>
        ) : (
          <div className="space-y-3">
            {currentOwnedProducts.map((p) => (
              <div
                key={p.id}
                className="p-4 bg-zinc-950/70 border border-zinc-850 hover:border-zinc-700 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-250"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-zinc-900 border border-zinc-850 rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-black">
                    {isVideoUrl(p.images[0]) ? (
                      <video src={p.images[0]} className="w-full h-full object-cover pointer-events-none" muted playsInline />
                    ) : (
                      <img src={p.images[0]} className="w-full h-full object-cover" alt="" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-zinc-100 line-clamp-1">{p.title}</h4>
                    <p className="text-xs text-zinc-400 font-bold uppercase mt-1 shrink-0">{p.category}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-primary font-black">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p.price)}
                      </span>
                      <span className="text-xs text-zinc-500 font-bold">&#8226; Stok: {p.stock} pcs</span>
                    </div>
                  </div>
                </div>

                {/* EDIT/DELETE INTERACTION FOOTER BUTTONS */}
                <div className="flex items-center gap-2 border-t border-zinc-900 pt-3 sm:pt-0 sm:border-0 justify-end">
                  <button
                    onClick={() => onEditProduct(p)}
                    className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                    title="Edit judul, harga, stok, dan deskripsi jualan Anda"
                  >
                    <Edit2 size={13} className="text-primary" />
                    Edit Posting
                  </button>
                  {deleteConfirmId === p.id ? (
                    <div className="flex items-center gap-1 bg-red-950/30 px-2 py-1 rounded-xl border border-red-900/40 animate-pulse">
                      <span className="text-[10px] text-red-400 font-extrabold uppercase">Hapus?</span>
                      <button
                        onClick={() => {
                          onDeleteProduct(p.id);
                          setDeleteConfirmId(null);
                        }}
                        className="px-2 py-1 bg-red-650 hover:bg-red-700 text-white font-extrabold text-[10px] rounded"
                      >
                        Ya
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-extrabold text-[10px] rounded"
                      >
                        Gak
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(p.id)}
                      className="px-3 py-2 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                      title="Hapus jualan"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
