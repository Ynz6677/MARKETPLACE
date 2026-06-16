/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User } from '../types';
import { SVGLogo } from './SVGLogo';
import { Eye, EyeOff, Lock, User as UserIcon, Shield, Camera, Key } from 'lucide-react';

interface AuthScreenProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
  onRegisterSuccess: (newUser: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  users,
  onLoginSuccess,
  onRegisterSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration States
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPin, setRegPin] = useState('');
  const [profilePic, setProfilePic] = useState<string | null>(null);

  // Visibility Toggles
  const [showPassLogin, setShowPassLogin] = useState(false);
  const [showPassRegister, setShowPassRegister] = useState(false);
  const [showPinRegister, setShowPinRegister] = useState(false);

  // Forgot password flow
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [fpUsername, setFpUsername] = useState('');
  const [fpPin, setFpPin] = useState('');
  const [fpNewPass, setFpNewPass] = useState('');

  const [notification, setNotification] = useState<{ text: string; isError: boolean } | null>(null);

  const triggerToast = (text: string, isError = false) => {
    setNotification({ text, isError });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const u = username.trim();
    if (!u || !password) {
      triggerToast('Silakan isi seluruh formulir login!', true);
      return;
    }

    const found = users.find(
      (x) => x.username.toLowerCase() === u.toLowerCase() && x.password === password
    );

    if (found) {
      if (found.isBanned) {
        triggerToast('Akun Anda telah dibanned dari platform SANS VICTIM oleh Developer!', true);
        return;
      }
      onLoginSuccess(found);
    } else {
      triggerToast('Username atau password yang dimasukkan salah!', true);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const u = regUsername.trim();
    if (!u || !regPassword || !regPin) {
      triggerToast('Username, Password, dan PIN Pemulihan wajib diisi!', true);
      return;
    }

    if (regPin.length !== 4 || isNaN(Number(regPin))) {
      triggerToast('PIN Pemulihan wajib berupa 4 digit angka!', true);
      return;
    }

    const exists = users.find((x) => x.username.toLowerCase() === u.toLowerCase());
    if (exists) {
      triggerToast('Username sudah dipakai oleh penjual lain!', true);
      return;
    }

    const newUser: User = {
      id: 'u_' + Date.now(),
      username: u,
      password: regPassword,
      pin: regPin,
      role: 'user',
      customRole: 'New Seller',
      verified: false,
      profilePic: profilePic,
    };

    onRegisterSuccess(newUser);
    triggerToast('Pendaftaran berhasil! Akun Anda aktif sekarang.', false);
  };

  const handleFpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const u = fpUsername.trim();
    if (!u || !fpPin || !fpNewPass) {
      triggerToast('Seluruh kolom wajib diisi untuk pemulihan!', true);
      return;
    }

    const matched = users.find((x) => x.username.toLowerCase() === u.toLowerCase());
    if (!matched) {
      triggerToast('Username pengguna tidak terdaftar!', true);
      return;
    }

    if (matched.pin !== fpPin) {
      triggerToast('PIN Pemulihan tidak cocok dengan akun ini!', true);
      return;
    }

    // Set new password
    matched.password = fpNewPass;
    triggerToast('Sandi berhasil dirubah! Silakan login.', false);
    setIsForgotOpen(false);
    setMode('login');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  return (
    <div className="w-full max-w-md mx-auto relative px-4">
      
      {/* Visual Toast Notification inside page to prevent blocking alert popups */}
      {notification && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border text-sm font-bold transition-all duration-300 animate-bounce ${
          notification.isError 
            ? 'bg-red-950/90 text-red-400 border-red-500/30' 
            : 'bg-emerald-950/90 text-emerald-400 border-emerald-500/30'
        }`}>
          <span>{notification.text}</span>
        </div>
      )}

      {/* Main card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Amber glow ring for aesthetic */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-amber-500 to-primary/80" />

        {/* Head branding */}
        <div className="flex flex-col items-center text-center mt-3 mb-8">
          <SVGLogo size={74} className="mb-4" />
          <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
            SANS VICTIM
          </h1>
          <p className="text-xs text-zinc-400 font-bold tracking-widest uppercase mt-1">
            Premium Games & Items Marketplace
          </p>
        </div>

        {/* Tabs */}
        {!isForgotOpen && (
          <div className="flex bg-zinc-950 p-1 rounded-xl mb-6 border border-zinc-900">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'login' 
                  ? 'bg-primary text-white shadow-md font-extrabold' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Masuk Akun
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'register' 
                  ? 'bg-primary text-white shadow-md font-extrabold' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Daftar Penjual/Pembeli
            </button>
          </div>
        )}

        {/* FORGOT PASSWORD SCREEN */}
        {isForgotOpen ? (
          <form onSubmit={handleFpSubmit} className="space-y-4">
            <div className="border-b border-zinc-800 pb-3 mb-3 text-center">
              <h2 className="font-bold text-zinc-100">Pemulihan Akun</h2>
              <p className="text-xs text-zinc-400 mt-1">Gunakan PIN 4 angka rahasia Anda</p>
            </div>

            {/* Username */}
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-bold">Username Akun</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input
                  type="text"
                  required
                  placeholder="Masukkan username Anda"
                  value={fpUsername}
                  onChange={(e) => setFpUsername(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm text-zinc-100 placeholder-zinc-650 outline-none focus:border-primary transition-all font-medium"
                />
              </div>
            </div>

            {/* PIN */}
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-bold">PIN Pemulihan (4 Angka)</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input
                  type="password"
                  required
                  maxLength={4}
                  placeholder="0000"
                  value={fpPin}
                  onChange={(e) => setFpPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm text-zinc-100 placeholder-zinc-650 outline-none focus:border-primary transition-all font-mono"
                />
              </div>
            </div>

            {/* New password */}
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-bold">Sandi Password Baru</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input
                  type="password"
                  required
                  placeholder="Buat sandi baru"
                  value={fpNewPass}
                  onChange={(e) => setFpNewPass(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm text-zinc-100 placeholder-zinc-650 outline-none focus:border-primary transition-all font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-bold transition-all text-sm shadow-lg mt-4 active:scale-95"
            >
              Reset Sandi Sekarang
            </button>

            <button
              type="button"
              onClick={() => setIsForgotOpen(false)}
              className="w-full text-center text-xs text-zinc-400 hover:text-white font-bold transition-all mt-2"
            >
              Kembali ke Login
            </button>
          </form>
        ) : mode === 'login' ? (
          
          /* MODE 1: LOGIN */
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username Input */}
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-bold">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input
                  type="text"
                  required
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm text-zinc-100 placeholder-zinc-650 outline-none focus:border-primary transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Input with fixed precision eye togglers */}
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-bold">Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 text-zinc-500 pointer-events-none" size={16} />
                <input
                  type={showPassLogin ? 'text' : 'password'}
                  required
                  placeholder="Masukkan kata sandi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-11 pr-12 text-sm text-zinc-100 placeholder-zinc-650 outline-none focus:border-primary transition-all font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassLogin(!showPassLogin)}
                  className="absolute right-3.5 text-zinc-500 hover:text-primary transition-all p-1 rounded-md"
                  title="Tampilkan Sandi"
                >
                  {showPassLogin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-white py-3.5 rounded-xl font-black text-sm transition-all shadow-lg shadow-primary/10 active:scale-95"
            >
              Masuk ke Marketplace
            </button>

            <div className="flex justify-between text-xs font-bold pt-1">
              <button
                type="button"
                onClick={() => setIsForgotOpen(true)}
                className="text-primary hover:text-amber-400 transition-all"
              >
                Lupa Password?
              </button>
            </div>
          </form>
        ) : (
          
          /* MODE 2: REGISTER WITH DETAILED CREATION FIELDS */
          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* PROFILE PICTURE FILE INPUT */}
            <div className="flex flex-col items-center">
              <label className="text-xs text-zinc-400 font-bold mb-1.5 text-center">Foto Profil (Opsional)</label>
              <div className="relative group w-20 h-20 rounded-full bg-zinc-950 border-2 border-dashed border-zinc-800 hover:border-primary flex items-center justify-center cursor-pointer overflow-hidden transition-all">
                {profilePic ? (
                  <img src={profilePic} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <Camera className="text-zinc-500 group-hover:text-primary transition-all" size={20} />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  title="Upload Foto Profil"
                />
              </div>
            </div>

            {/* Username register */}
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-bold">Buat Username Unik</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input
                  type="text"
                  required
                  placeholder="Contoh: SansSeller"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm text-zinc-100 placeholder-zinc-650 outline-none focus:border-primary transition-all font-medium"
                />
              </div>
            </div>

            {/* Password register with show/hide eye toggle */}
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-bold">Kata Sandi Kuat</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 text-zinc-500 pointer-events-none" size={16} />
                <input
                  type={showPassRegister ? 'text' : 'password'}
                  required
                  placeholder="Masukkan Password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-11 pr-12 text-sm text-zinc-100 placeholder-zinc-650 outline-none focus:border-primary transition-all font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassRegister(!showPassRegister)}
                  className="absolute right-3.5 text-zinc-500 hover:text-primary transition-all p-1 rounded-md"
                  title="Toggle Sandi"
                >
                  {showPassRegister ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* PIN register + show/hide eye toggle (AS REQUESTED: "pin nya ilang juga menu hide and see nya") */}
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-bold flex justify-between">
                <span>PIN Pemulihan (4 Angka Rahasia)</span>
                <span className="text-amber-500 opacity-80">(Penting untuk Lupa Sandi)</span>
              </label>
              <div className="relative flex items-center">
                <Shield className="absolute left-3.5 text-zinc-500 pointer-events-none" size={16} />
                <input
                  type={showPinRegister ? 'text' : 'password'}
                  required
                  maxLength={4}
                  placeholder="Contoh: 8899"
                  value={regPin}
                  onChange={(e) => setRegPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-11 pr-12 text-sm text-zinc-105 placeholder-zinc-650 font-mono tracking-widest outline-none focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPinRegister(!showPinRegister)}
                  className="absolute right-3.5 text-zinc-500 hover:text-primary transition-all p-1 rounded-md"
                  title="Toggle PIN"
                >
                  {showPinRegister ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 mt-4"
            >
              Buat Akun & Masuk Pasar
            </button>
          </form>
        )}
      </div>

      <div className="text-center mt-6 text-[11px] text-zinc-650">
        &copy; 100% Secure Transaction System - Powered by <span className="font-extrabold text-primary">SANS VICTIM</span>
      </div>
    </div>
  );
};
