/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User } from '../types';
import { SVGLogo } from './SVGLogo';
import { Plus, Receipt, Shield, UserX, Menu, Search, LogOut, ExternalLink, Settings, Home, Heart, Sun, Moon, Headphones, MessageSquare, History, Users } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  notificationCount: number;
  onSearchChange: (q: string) => void;
  onGoToTab: (tab: 'home' | 'history' | 'profile' | 'developer' | 'upload' | 'chats' | 'stores') => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  notificationCount,
  onSearchChange,
  onGoToTab,
  onLogout,
  isDarkMode,
  onToggleTheme,
}) => {
  if (!currentUser) return null;

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 relative z-40 py-3 px-4 sm:px-6">
      
      {/* 
        RESPONSIVE SOLUTION (AS REQUESTED): 
        On narrow breakpoints (<500px), we stack items vertically into bottom bars / responsive layout
        so that the username, store logo, verified check, and role remain 100% visible, neat, and readable!
      */}
      <div className="max-w-7xl mx-auto flex flex-col gap-3 min-[580px]:flex-row min-[580px]:items-center min-[580px]:justify-between">
        
        {/* Nav Left: Brand & Logo always prominent */}
        <div className="flex items-center justify-between min-[580px]:justify-start gap-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onGoToTab('home')}>
            <SVGLogo size={38} />
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-500 to-white leading-none">
                SANS VICTIM
              </span>
              <span className="text-[9px] text-zinc-500 font-extrabold tracking-widest uppercase">
                Premium Store
              </span>
            </div>
          </div>

          {/* Quick Stats count overlay */}
          <div className="flex items-center gap-2 min-[580px]:hidden">
            {(currentUser.role === 'developer' || currentUser.role === 'admin') && (
              <button
                onClick={() => onGoToTab('developer')}
                className="p-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-yellow-500 border border-amber-500/20 rounded-xl"
                title="Admin Dashboard"
              >
                <Shield size={16} className="fill-orange-500 stroke-orange-500" />
              </button>
            )}
            
            <button
              onClick={onLogout}
              className="p-2.5 bg-red-950/20 hover:bg-red-950/45 text-red-400 border border-red-900/30 rounded-xl"
              title="Keluar"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>



        {/* Right side: Action menus */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3.5 pt-1.5 min-[580px]:pt-0 border-t border-zinc-800/60 min-[580px]:border-0">
          
          {/* Icons navigation segment */}
          <div className="flex items-center gap-2">
            
            {/* Beranda tab menu button */}
            <button
              onClick={() => onGoToTab('home')}
              className="p-2 sm:p-2.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-primary rounded-xl border border-zinc-850 transition-all flex items-center gap-1.5 text-xs font-bold"
              title="Beranda"
            >
              <Home size={15} />
              <span className="hidden md:inline">Beranda</span>
            </button>


            {/* Create new Post button */}
            <button
              onClick={() => onGoToTab('upload')}
              className="p-2 sm:p-2.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-primary rounded-xl border border-zinc-850 transition-all flex items-center gap-1.5 text-xs font-bold"
              title="Jual Item"
            >
              <Plus size={15} />
              <span className="hidden md:inline">Jual</span>
            </button>

            {/* In-app Messages Inbox */}
            <button
              onClick={() => onGoToTab('chats')}
              className="p-2 sm:p-2.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-primary rounded-xl border border-zinc-850 transition-all flex items-center gap-1.5 text-xs font-bold relative"
              title="Obrolan Sistem"
            >
              <MessageSquare size={15} className="text-zinc-400" />
              <span className="hidden md:inline">Chat</span>
              {notificationCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 bg-red-500 text-[10px] text-white font-extrabold rounded-full border border-zinc-900 animate-pulse">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Order/Sale history button */}
            <button
              onClick={() => onGoToTab('history')}
              className="p-2 sm:p-2.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-primary rounded-xl border border-zinc-850 transition-all flex items-center gap-1.5 text-xs font-bold"
              title="Riwayat Pesanan"
            >
              <History size={15} />
              <span className="hidden md:inline">Riwayat</span>
            </button>

             {/* Premium Yellow-Orange Gradient Support Saweria Button (as requested) */}
            <a
              href="https://saweria.co/Waast"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl transition-all flex items-center gap-1 sm:gap-1.5 text-xs font-extrabold shadow-md hover:shadow-orange-500/20 active:scale-95"
              title="Dukung Developer untuk mengembangkan lebih lanjut"
            >
              <Heart size={14} className="fill-white stroke-white animate-pulse" />
              <span>Support</span>
            </a>

            {/* Customer Service Discord Link - Labeled 'CS' with Blue Background on the Right of Support */}
            <a
              href="https://discord.gg/kQPXrnSbuH"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl transition-all flex items-center gap-1 sm:gap-1.5 text-xs font-extrabold shadow-md hover:shadow-[#5865F2]/20 active:scale-95"
              title="Customer Service via Discord"
            >
              <Headphones size={15} />
              <span>CS</span>
            </a>

            {/* Desktop Theme Toggle button */}
            <button
              onClick={onToggleTheme}
              className="p-2.5 bg-zinc-950 hover:bg-zinc-850 text-yellow-500 rounded-xl border border-zinc-850 transition-all flex items-center justify-center active:scale-95"
              title="Ubah Tema"
            >
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Developer Button */}
            {(currentUser.role === 'developer' || currentUser.role === 'admin') && (
              <button
                onClick={() => onGoToTab('developer')}
                className="hidden min-[580px]:block p-2.5 bg-amber-500/10 hover:bg-amber-500/25 text-yellow-500 border border-amber-500/30 rounded-xl transition-all"
                title="Akses Administrator Hub"
              >
                <Shield size={16} className="fill-orange-500 stroke-orange-500" />
              </button>
            )}

          </div>

          {/* User profile capsule (AS REQUESTED, STAYS VISIBLE ON MOBILE AT ALL COSTS IN NATIVE LAYOUT) */}
          <div
            onClick={() => onGoToTab('profile')}
            className="flex items-center gap-2 bg-zinc-950 py-1.5 pl-1.5 pr-3.5 rounded-full border border-orange-500/50 hover:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer transition-all select-none shadow-sm hover:shadow-orange-500/10"
          >
            <div className="w-8 h-8 rounded-full bg-zinc-850 border border-zinc-700 flex items-center justify-center font-black overflow-hidden relative text-xs">
              {currentUser.profilePic ? (
                <img src={currentUser.profilePic} className="w-full h-full object-cover" alt="" />
              ) : (
                currentUser.username.slice(0, 2).toUpperCase()
              )}
            </div>
            
            {/* Direct details wrapping elegantly */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-xs font-black text-zinc-100 max-w-20 truncate">
                  {currentUser.username}
                </span>
                
                {currentUser.verified && (
                  <span className="w-2.5 h-2.5 bg-[#1DA1F2] text-[6px] text-white font-black rounded-full flex items-center justify-center shrink-0" title="Terverifikasi">
                    ✓
                  </span>
                )}
                {currentUser.customRole && (
                  <span className="text-[8px] bg-amber-500/20 text-yellow-400 font-extrabold px-1 py-0.2 rounded shrink-0">
                    {currentUser.customRole}
                  </span>
                )}
              </div>
              <span className="text-[8px] text-zinc-500 font-extrabold tracking-widest uppercase">
                {currentUser.role}
              </span>
            </div>
          </div>

          {/* Quick exit cap */}
          <button
            onClick={onLogout}
            className="hidden min-[580px]:block p-2 text-zinc-500 hover:text-red-400 bg-zinc-950 hover:bg-red-950/20 rounded-xl border border-zinc-900 transition-all font-bold"
            title="Keluar / Ganti Akun"
          >
            <LogOut size={15} />
          </button>

        </div>

      </div>

    </nav>
  );
};
