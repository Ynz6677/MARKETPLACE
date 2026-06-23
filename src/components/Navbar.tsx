/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User } from '../types';
import { SVGLogo, WastWordmark } from './SVGLogo';
import { 
  ChevronLeft, 
  PlusCircle, 
  Home, 
  Heart, 
  Sun, 
  Moon, 
  Headphones, 
  MessageSquare, 
  History, 
  MoreHorizontal, 
  Bell, 
  User as UserIcon,
  Info,
  LogOut,
  Shield,
  Menu,
  Flame,
  Sparkles,
  LogIn
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  notificationCount: number;
  activeTab: string;
  activeProductId: number | null;
  onSearchChange: (q: string) => void;
  onGoToTab: (tab: 'home' | 'history' | 'profile' | 'developer' | 'upload' | 'chats' | 'stores') => void;
  onBackClick: () => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onLoginClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  notificationCount,
  activeTab,
  activeProductId,
  onSearchChange,
  onGoToTab,
  onBackClick,
  onLogout,
  isDarkMode,
  onToggleTheme,
  onLoginClick,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!currentUser) return null;

  // Derive the active heading title based on current view/tab
  const getTabTitle = () => {
    if (activeProductId) return 'DETAIL PRODUK';
    switch (activeTab) {
      case 'home': return 'WAST';
      case 'history': return 'RIWAYAT SAYA';
      case 'profile': return 'PROFIL AKUN';
      case 'developer': return 'DEVELOPER PANEL';
      case 'upload': return 'UNGGAH ITEM';
      case 'chats': return 'SISTEM CHAT';
      case 'stores': return 'DAFTAR TOKO';
      default: return 'WAST';
    }
  };

  return (
    <>
      {/* 1. TOP HEADER AND UTILITY BAND (PRECISE REPRESENTATION MATCHING WAST SCREENSHOTS) */}
      <header className="bg-transparent border-b border-[#0084ff]/30 sticky top-0 z-45 w-full select-none backdrop-blur-md shadow-[0_4px_20px_rgba(0,132,255,0.08)]">
        
        {/* BRANDING LOGO & UTILITY PILLS CARD BAR */}
        <div className="w-full flex items-center justify-between px-4 py-2.5 sm:px-6 relative">
          
          {/* Logo on Left - WAST Logo */}
          <div className="flex items-center cursor-pointer select-none" onClick={() => onGoToTab('home')}>
            <SVGLogo width={96} height={34} variant="bear" />
          </div>

          {/* Clean Action Capsule Buttons on Right */}
          <div className="flex items-center gap-2">
            
            {/* If Guest, show Masuk (Login) button cleanly */}
            {currentUser.id === 'u_guest' && onLoginClick && (
              <button
                onClick={onLoginClick}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0084ff] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-extrabold text-[11px] tracking-tight transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#0084ff]/20 shrink-0"
              >
                <UserIcon size={11} className="shrink-0 text-white" />
                <span>Masuk</span>
              </button>
            )}

            {/* Developer Button shortcut - Uses logo/icon only on mobile as requested! */}
            {(currentUser.role === 'developer' || currentUser.role === 'admin') && (
              <button
                onClick={() => onGoToTab('developer')}
                className={`p-2 sm:px-3 sm:py-1.5 rounded-xl transition-all flex items-center gap-1 text-[10px] font-black active:scale-95 shrink-0 border uppercase cursor-pointer ${
                  activeTab === 'developer'
                    ? 'bg-[#0084ff] border-[#39a0ff] text-white font-black shadow-blue-500/20'
                    : 'bg-transparent border-[#0084ff]/30 hover:bg-[#0084ff]/10 text-[#0084ff]'
                }`}
                title="Buka Panel Developer"
              >
                <Shield size={12} className="fill-current shrink-0" />
                <span className="hidden sm:inline">Dev Panel</span>
              </button>
            )}

            {/* Quick Login button for guest users */}
            {currentUser?.id === 'u_guest' && (
              <button
                onClick={onLoginClick}
                className="px-3 py-1.5 bg-gradient-to-r from-[#0084ff] to-[#00aaff] hover:from-[#0074e0] hover:to-[#0099ff] text-white rounded-xl text-[10px] sm:text-[11px] font-black tracking-tight active:scale-95 transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-[#0084ff]/20 shrink-0 select-none"
              >
                <LogIn size={11} className="shrink-0" />
                <span>Masuk / Daftar</span>
              </button>
            )}

            {/* Notification Bell Icon - Sleek blue glowing box */}
            <button
               onClick={() => onGoToTab('chats')}
               className="p-2 bg-transparent border border-[#0084ff]/25 text-[#0084ff] hover:bg-[#0084ff]/10 rounded-xl relative transition-all cursor-pointer flex items-center justify-center shrink-0"
               title="Notifikasi Chats"
            >
              <Bell size={14} />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#0084ff] text-[7.5px] text-white font-black rounded-full border border-zinc-950 flex items-center justify-center animate-pulse">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Hamburger 3-Line Menu Button (Custom Dropdown replacement) */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`p-2 border rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-90 ${
                isDropdownOpen
                  ? 'bg-[#0084ff] border-[#39a0ff] text-white'
                  : 'bg-transparent border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900/40'
              }`}
              title="Pilihan Akun & Layanan"
            >
              <Menu size={14} />
            </button>

          </div>

          {/* Absolute Dropdown Overlay panel (Garis 3 Menu Options) */}
          {isDropdownOpen && (
            <>
              {/* Overlay Backdrop to dismiss */}
              <div 
                className="fixed inset-0 z-40 cursor-default bg-transparent" 
                onClick={() => setIsDropdownOpen(false)} 
              />
              <div className="absolute right-4 top-13 w-56 bg-zinc-950 border border-zinc-850 rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1 anim-fade-in divide-y divide-zinc-900">
                <div className="p-2 cursor-default select-none pb-1.5">
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none">Pengguna Aktif</p>
                  <p className="text-xs font-bold text-zinc-300 truncate mt-1">
                    {currentUser.id === 'u_guest' ? 'Guest (Belum Masuk)' : currentUser.username}
                  </p>
                </div>
                
                <div className="space-y-0.5 pt-1.5">
                  {/* Guest Prominent Login Button */}
                  {currentUser.id === 'u_guest' && (
                    <button
                      onClick={() => {
                        onLoginClick?.();
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 bg-[#0084ff]/10 hover:bg-[#0084ff]/20 text-left w-full text-[#0084ff] hover:text-[#39a0ff] rounded-xl text-xs font-black transition-colors mb-1"
                    >
                      <LogIn size={13} className="text-primary animate-pulse" />
                      <span>Masuk / Daftar Baru</span>
                    </button>
                  )}

                  {/* 1. Link Saweria (support) */}
                  <a
                    href="https://saweria.co/Waast"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-900/50 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Heart size={13} className="text-red-500" />
                    <span>Support</span>
                  </a>

                  {/* 2. Link Discord (Customer & service) */}
                  <a
                    href="https://discord.gg/kQPXrnSbuH"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-900/50 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Headphones size={13} className="text-indigo-400" />
                    <span>Discord Server (CS)</span>
                  </a>

                  {/* Separator below Support and CS */}
                  <div className="border-t border-[#0084ff]/25 my-1.5" />

                  {/* 4. Log Out / Swapper */}
                  {currentUser.id !== 'u_guest' && (
                    <button
                      onClick={() => {
                        onLogout();
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 hover:bg-red-500/10 text-left w-full text-red-400 hover:text-red-300 rounded-xl text-xs font-black transition-colors"
                    >
                      <LogOut size={13} />
                      <span>Keluar Akun</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

        </div>

      </header>

      {/* 2. PERSISTENT FLOATING BOTTOM NAV BAR (Perfect 5-Tab System as represented in Russian reference picture) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-t border-black px-4 py-2 pb-5 md:hidden">
        <div className="max-w-md mx-auto flex items-center justify-between gap-1">
          
          {/* TAP 1: HOME */}
          <button
            onClick={() => onGoToTab('home')}
            className={`flex flex-col items-center justify-center py-1 flex-1 transition-all cursor-pointer ${
              activeTab === 'home' && !activeProductId
                ? 'text-primary scale-103 font-extrabold'
                : 'text-zinc-500 hover:text-zinc-355 font-bold'
            }`}
          >
            <Home size={18} className={activeTab === 'home' && !activeProductId ? 'text-primary' : 'text-zinc-500'} />
            <span className="text-[8px] uppercase tracking-wide mt-1">Beranda</span>
          </button>

          {/* TAP 2: CHATS */}
          <button
            onClick={() => onGoToTab('chats')}
            className={`flex flex-col items-center justify-center py-1 flex-1 relative transition-all cursor-pointer ${
              activeTab === 'chats'
                ? 'text-primary scale-103 font-extrabold'
                : 'text-zinc-500 hover:text-zinc-355 font-bold'
            }`}
          >
            <div className="relative">
              <MessageSquare size={18} className={activeTab === 'chats' ? 'text-primary' : 'text-zinc-500'} />
              {notificationCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-650 text-[7px] text-white font-black rounded-full flex items-center justify-center border border-zinc-950">
                  {notificationCount}
                </span>
              )}
            </div>
            <span className="text-[8px] uppercase tracking-wide mt-1">Obrolan</span>
          </button>

          {/* TAP 3: SELL ITEM (`+` Icon nested inside circular button) */}
          <button
            onClick={() => onGoToTab('upload')}
            className="flex flex-col items-center justify-center flex-1 py-1 group transition-all"
          >
            <div className={`p-1 rounded-full transition-all cursor-pointer flex items-center justify-center ${
              activeTab === 'upload'
                ? 'bg-transparent border-[2.5px] border-primary text-primary scale-105 shadow-md'
                : 'bg-transparent border-[2.5px] border-zinc-800 text-zinc-400 hover:text-white group-hover:border-zinc-700'
            }`}>
              <PlusCircle size={18} />
            </div>
            <span className={`text-[8px] uppercase tracking-wide mt-1 ${activeTab === 'upload' ? 'text-primary font-black' : 'text-zinc-500 font-bold'}`}>Jual</span>
          </button>

          {/* TAP 4: HISTORY */}
          <button
            onClick={() => onGoToTab('history')}
            className={`flex flex-col items-center justify-center py-1 flex-1 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'text-primary scale-103 font-extrabold'
                : 'text-zinc-500 hover:text-zinc-355 font-bold'
            }`}
          >
            <History size={18} className={activeTab === 'history' ? 'text-primary' : 'text-zinc-500'} />
            <span className="text-[8px] uppercase tracking-wide mt-1">Riwayat</span>
          </button>

          {/* TAP 5: PROFILE */}
          <button
            onClick={() => onGoToTab('profile')}
            className={`flex flex-col items-center justify-center py-1 flex-1 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'text-primary scale-103 font-extrabold'
                : 'text-zinc-500 hover:text-zinc-355 font-bold'
            }`}
          >
            <div className="relative">
              <div className={`always-keep-profile-dark w-5 h-5 rounded-full overflow-hidden border flex items-center justify-center shrink-0 ${
                activeTab === 'profile' ? 'border-primary' : 'border-zinc-700'
              }`}>
                {currentUser.profilePic ? (
                  <img src={currentUser.profilePic} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                ) : (
                  <UserIcon size={11} className="text-zinc-500" />
                )}
              </div>
            </div>
            <span className="text-[8px] uppercase tracking-wide mt-1">Profil</span>
          </button>

        </div>
      </div>
    </>
  );
};
