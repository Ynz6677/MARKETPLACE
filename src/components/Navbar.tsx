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
  LogIn,
  Search
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
      <header className="bg-[#111928] border-b border-zinc-800/80 sticky top-0 z-45 w-full select-none">
        
        {/* Detail Produk View - Top Bar */}
        {activeProductId ? (
          <div className="w-full flex items-center px-4 py-4 sm:px-6 relative">
            <button
              onClick={onBackClick}
              className="absolute left-4 sm:left-6 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <span className="text-xl leading-none">&larr;</span>
            </button>
            <div className="w-full text-center">
              <h1 className="text-xs sm:text-sm font-black text-white tracking-widest uppercase">DETAIL PRODUK</h1>
            </div>
          </div>
        ) : (
          <div className="w-full flex items-center justify-between px-4 py-3 sm:px-6 relative">
            {/* BRANDING LOGO & UTILITY PILLS CARD BAR */}
          
          {/* Left section: Logo */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center cursor-pointer select-none h-8 sm:h-9" onClick={() => onGoToTab('home')}>
              <SVGLogo className="h-full w-auto" width="auto" height="100%" variant="bear" />
            </div>
          </div>

          {/* Middle section: Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input
                type="text"
                placeholder="Cari game, produk, atau jasa..."
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => {
                  if (activeTab !== 'home') onGoToTab('home');
                }}
                className="w-full bg-[#080d19]/80 border border-zinc-800/80 focus:border-[#0084ff] text-zinc-100 text-[13px] rounded-full pl-10 pr-4 py-2.5 outline-none transition-all placeholder-zinc-500 font-medium"
              />
            </div>
          </div>

          {/* Right section: Actions */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            
            {/* If Guest, show Masuk (Login) button */}
            {currentUser.id === 'u_guest' && onLoginClick ? (
              <button
                onClick={onLoginClick}
                className="px-4 py-2 rounded-full bg-[#0084ff] hover:bg-blue-600 text-white font-extrabold text-[12px] tracking-tight transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <UserIcon size={12} className="shrink-0" />
                <span>Masuk</span>
              </button>
            ) : (
              <>
                {/* Notification Bell */}
                <button
                   onClick={() => onGoToTab('history')} // using history or something for notifs
                   className="p-2 bg-[#080d19] hover:bg-zinc-800 border border-zinc-800 text-yellow-500 rounded-full relative transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
                   title="Notifikasi"
                >
                  <Bell size={16} className="fill-current" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-[9px] text-white font-black rounded-full border-2 border-[#001b3a] flex items-center justify-center">
                      3
                    </span>
                  )}
                </button>

                {/* Chat Icon */}
                <button
                   onClick={() => onGoToTab('chats')}
                   className="p-2 bg-[#080d19] hover:bg-zinc-800 border border-zinc-800 text-white rounded-full relative transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
                   title="Notifikasi Chats"
                >
                  <MessageSquare size={16} className="fill-current" />
                </button>

                {/* + Jual Item Button */}
                <button
                  onClick={() => onGoToTab('upload')}
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0084ff] hover:bg-[#0073e6] text-white font-bold text-[12px] transition-all active:scale-95 shadow-md cursor-pointer"
                >
                  <PlusCircle size={14} />
                  <span>Jual Item</span>
                </button>

                {/* User Avatar / Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-[#080d19] border border-zinc-800 overflow-hidden flex items-center justify-center cursor-pointer transition-all hover:border-zinc-700 active:scale-95 text-[#0084ff]"
                  >
                    <Menu size={18} className="text-zinc-400" />
                  </button>
                  
                  {/* Absolute Dropdown Overlay panel */}
                  {isDropdownOpen && (
                    <>
                      {/* Overlay Backdrop to dismiss */}
                      <div 
                        className="fixed inset-0 z-40 cursor-default bg-transparent" 
                        onClick={() => setIsDropdownOpen(false)} 
                      />
                      <div className="absolute right-0 top-12 w-56 bg-zinc-950 border border-zinc-850 rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1 anim-fade-in divide-y divide-zinc-900">
                        <div className="p-2 cursor-default select-none pb-1.5">
                          <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none">Pengguna Aktif</p>
                          <p className="text-xs font-bold text-zinc-300 truncate mt-1">
                            {currentUser.id === 'u_guest' ? 'Guest (Belum Masuk)' : currentUser.username}
                          </p>
                        </div>
                        
                        <div className="space-y-0.5 pt-1.5">
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
              </>
            )}
          </div>
        </div>
        )}
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
