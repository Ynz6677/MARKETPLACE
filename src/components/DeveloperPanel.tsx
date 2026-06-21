/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Product, Transaction, ChatMessage, BannerConfig } from '../types';
import { Shield, Eye, Trash2, CheckCircle2, UserCheck, Tag, ShoppingCart, RefreshCw, MessageSquare, AlertCircle, Image as ImageIcon, Coins } from 'lucide-react';

interface DeveloperPanelProps {
  currentUser: User;
  users: User[];
  products: Product[];
  transactions: Transaction[];
  chats: ChatMessage[];
  onToggleUserVerif: (userId: string) => void;
  onUpdateUserRole: (userId: string, role: 'user' | 'seller' | 'admin' | 'developer') => void;
  onUpdateCustomBadge: (userId: string, badgeText: string) => void;
  onDeleteProduct: (productId: number) => void;
  onMonitorChatSession: (chatId: string) => void;
  onToggleUserBan: (userId: string) => void;
  banner: BannerConfig[];
  onUpdateBanner: (banner: BannerConfig | BannerConfig[]) => void;
  onUpdateUserBalance: (userId: string, balance: number) => void;
}

type DevTab = 'users' | 'products' | 'transactions' | 'chats' | 'banner' | 'branding';

export const DeveloperPanel: React.FC<DeveloperPanelProps> = ({
  currentUser,
  users,
  products,
  transactions,
  chats,
  onToggleUserVerif,
  onUpdateUserRole,
  onUpdateCustomBadge,
  onDeleteProduct,
  onMonitorChatSession,
  onToggleUserBan,
  banner,
  onUpdateBanner,
  onUpdateUserBalance,
}) => {
  const [activeTab, setActiveTab] = useState<DevTab>('users');
  const [userBadgeInputs, setUserBadgeInputs] = useState<{ [userId: string]: string }>({});
  const [userBalanceInputs, setUserBalanceInputs] = useState<{ [userId: string]: string }>({});
  const [searchUserQuery, setSearchUserQuery] = useState('');

  // Local state for editing multiple banners
  const [localBanners, setLocalBanners] = useState<BannerConfig[]>(banner || []);
  const [selectedBannerId, setSelectedBannerId] = useState<string>('');

  // Keep local banners in sync with prop updates when they change from DB
  React.useEffect(() => {
    if (banner && banner.length > 0) {
      setLocalBanners(banner);
      if (!selectedBannerId || !banner.some(b => b.id === selectedBannerId)) {
        setSelectedBannerId(banner[0].id);
      }
    }
  }, [banner]);

  const activeSelectedBanner = localBanners.find(b => b.id === selectedBannerId) || localBanners[0];

  const updateActiveBannerField = (field: keyof BannerConfig, value: string) => {
    if (!activeSelectedBanner) return;
    setLocalBanners(prev => prev.map(b => {
      if (b.id === activeSelectedBanner.id) {
        return { ...b, [field]: value };
      }
      return b;
    }));
  };

  const handleBannerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateActiveBannerField('imageUrl', event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const isVideoUrl = (src?: string | null) => {
    return src?.startsWith('data:video/') || src?.match(/\.(mp4|webm|ogg|mov|mkv|3gp)(\?.*)?$/i);
  };
  const [searchTxQuery, setSearchTxQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Extract unique chat conversations for dev monitoring
  const getUniqueConversations = () => {
    const sessionsMap = new Map<string, {
      chatId: string;
      productId: number;
      buyerId: string;
      sellerId: string;
      messageCount: number;
      lastMsgText: string;
      timestamp: number;
    }>();

    chats.forEach((m) => {
      const existing = sessionsMap.get(m.chatId);
      if (!existing) {
        sessionsMap.set(m.chatId, {
          chatId: m.chatId,
          productId: m.productId,
          buyerId: m.chatId.split('-')[0] || m.senderId,
          sellerId: m.chatId.split('-')[1] || m.receiverId,
          messageCount: 1,
          lastMsgText: m.text || '[Gambar]',
          timestamp: m.timestamp,
        });
      } else {
        existing.messageCount += 1;
        if (m.timestamp > existing.timestamp) {
          existing.lastMsgText = m.text || '[Gambar]';
          existing.timestamp = m.timestamp;
        }
      }
    });

    return Array.from(sessionsMap.values()).sort((a, b) => b.timestamp - a.timestamp);
  };

  const conversations = getUniqueConversations();
  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchUserQuery.toLowerCase())
  );

  return (
    <div className="bg-zinc-900 border border-zinc-805 rounded-2xl p-3 sm:p-5 shadow-xl space-y-4">
      
      {/* Dev Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-primary/10 text-primary rounded-xl shrink-0">
            <Shield size={18} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-zinc-100 flex items-center gap-1.5 leading-tight">
              Developer Panel
            </h2>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              Kelola lencana, verifikasi akun, jualan, serta pantau obrolan transaksi.
            </p>
          </div>
        </div>

        {/* Mini stats */}
        <div className="flex gap-2">
          <div className="bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-900 flex flex-col items-center min-w-14">
            <span className="text-[8px] text-zinc-500 font-bold uppercase">User</span>
            <span className="text-xs font-bold text-primary">{users.length}</span>
          </div>
          <div className="bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-900 flex flex-col items-center min-w-14">
            <span className="text-[8px] text-zinc-500 font-bold uppercase">Item</span>
            <span className="text-xs font-bold text-primary">{products.length}</span>
          </div>
          <div className="bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-900 flex flex-col items-center min-w-14">
            <span className="text-[8px] text-zinc-500 font-bold uppercase">Sale</span>
            <span className="text-xs font-bold text-primary">{transactions.length}</span>
          </div>
        </div>
      </div>

      {/* Selector Tabs (Highly compact with scroll-x) */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 border-b border-zinc-800/40 scrollbar-none">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all shrink-0 ${
            activeTab === 'users' ? 'bg-primary text-white font-bold' : 'bg-zinc-850 text-zinc-450 hover:text-white'
          }`}
        >
          Data Pengguna
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all shrink-0 ${
            activeTab === 'products' ? 'bg-primary text-white font-bold' : 'bg-zinc-850 text-zinc-450 hover:text-white'
          }`}
        >
          Manajemen Barang
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all shrink-0 ${
            activeTab === 'transactions' ? 'bg-primary text-white font-bold' : 'bg-zinc-850 text-zinc-450 hover:text-white'
          }`}
        >
          Log Transaksi
        </button>
        <button
          onClick={() => setActiveTab('chats')}
          className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all shrink-0 ${
            activeTab === 'chats' ? 'bg-primary text-white font-bold' : 'bg-zinc-850 text-zinc-450 hover:text-white'
          }`}
        >
          Monitor Chat ({conversations.length})
        </button>
        <button
          onClick={() => setActiveTab('banner')}
          className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all shrink-0 ${
            activeTab === 'banner' ? 'bg-primary text-white font-bold' : 'bg-zinc-850 text-zinc-450 hover:text-white'
          }`}
        >
          Atur Banner Iklan
        </button>
        <button
          onClick={() => setActiveTab('branding')}
          className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all shrink-0 ${
            activeTab === 'branding' ? 'bg-primary text-white font-bold' : 'bg-zinc-850 text-zinc-450 hover:text-white'
          }`}
        >
          Branding & Custom Logo
        </button>

      </div>

      {/* TAB CONTENT 1: USERS */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          
          {/* User profile Search component */}
          <div>
            <input
              type="text"
              placeholder="Cari profil seseorang lewat username..."
              value={searchUserQuery}
              onChange={(e) => setSearchUserQuery(e.target.value)}
              className="w-full bg-zinc-955 border border-zinc-850 text-xs py-2 px-3.5 rounded-xl text-zinc-200 outline-none focus:border-primary transition-all font-semibold placeholder:text-zinc-600"
            />
          </div>

          {/* MOBILE COMPACT CARDS DIRECT DISPLAY (MINIMIZES SCROLL-X) */}
          <div className="block lg:hidden space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-zinc-600 border border-dashed border-zinc-800 rounded-xl bg-zinc-955/10 text-xs font-bold">
                Tidak ada profil ditemukan.
              </div>
            ) : (
              filteredUsers.map((u) => (
                <div key={u.id} className={`p-2.5 rounded-xl bg-zinc-950 border border-zinc-850 space-y-2 text-xs ${u.isBanned ? 'border-red-950 bg-red-950/5' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-750 flex items-center justify-center overflow-hidden font-black text-[10px] uppercase shrink-0 text-zinc-350">
                        {u.profilePic ? <img src={u.profilePic} className="w-full h-full object-cover" alt="" /> : u.username[0]}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1">
                          <span className={`${u.isBanned ? 'line-through text-red-500' : 'text-zinc-200'} font-bold truncate text-[11px]`}>
                            {u.username}
                          </span>
                          {u.verified && (
                            <span className="inline-flex items-center justify-center bg-[#1DA1F2] text-white rounded-full w-3.5 h-3.5 shrink-0 text-[8px] font-black" title="Terverifikasi">
                              ✓
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 mt-0.5">
                          <span className="text-[8px] text-zinc-500 font-bold uppercase leading-none block">Role: {u.role}</span>
                          {u.email ? (
                            <span className="text-[9.5px] text-[#39a0ff] font-extrabold lowercase flex items-center gap-1">
                              <span>✉</span> <span className="underline select-all">{u.email}</span>
                            </span>
                          ) : (
                            <span className="text-[9px] text-zinc-600 font-bold italic block">✉ Belum ada email</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Role labels */}
                    <div>
                      {u.role === 'developer' && <span className="text-[7.5px] font-black px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase">Dev</span>}
                      {u.role === 'admin' && <span className="text-[7.5px] font-black px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase">Admin</span>}
                      {u.role === 'seller' && <span className="text-[7.5px] font-black px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">Sell</span>}
                      {u.role === 'user' && <span className="text-[7.5px] font-black px-1.5 py-0.2 rounded bg-zinc-850 text-zinc-500 border border-zinc-800 uppercase">User</span>}
                    </div>
                  </div>

                  {/* Add labels input directly inside the card */}
                  <div className="flex items-center gap-1.5 bg-zinc-900/60 p-1.5 rounded-lg border border-zinc-850">
                    <input
                      type="text"
                      placeholder="Ubah lencana custom..."
                      value={userBadgeInputs[u.id] !== undefined ? userBadgeInputs[u.id] : u.customRole}
                      onChange={(e) => {
                        setUserBadgeInputs({ ...userBadgeInputs, [u.id]: e.target.value });
                      }}
                      className="bg-zinc-950 border border-zinc-850 px-2 py-1 rounded text-[10px] text-zinc-300 outline-none focus:border-primary flex-1 min-w-0 font-semibold"
                    />
                    <button
                      onClick={() => {
                        const val = userBadgeInputs[u.id] !== undefined ? userBadgeInputs[u.id] : u.customRole;
                        onUpdateCustomBadge(u.id, val);
                      }}
                      className="px-2 py-1 bg-zinc-800 hover:bg-zinc-750 text-zinc-250 text-[10px] rounded font-bold shrink-0"
                    >
                      Set
                    </button>
                  </div>

                  {/* Quick actions line */}
                  <div className="flex items-center justify-between gap-2.5 pt-1 border-t border-zinc-900/60 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onToggleUserVerif(u.id)}
                        className="px-1.5 py-0.5 bg-sky-500/10 border border-sky-500/25 text-[#1DA1F2] rounded text-[9px] font-black uppercase"
                      >
                        {u.verified ? 'Batal' : 'Verif'}
                      </button>
                      <select
                        value={u.role}
                        onChange={(e) => onUpdateUserRole(u.id, e.target.value as any)}
                        className="bg-zinc-900 border border-zinc-850 text-zinc-400 px-1 py-0.5 rounded text-[9px] font-bold outline-none"
                      >
                        <option value="user">User</option>
                        <option value="seller">Seller</option>
                        <option value="admin">Admin</option>
                        <option value="developer">Developer</option>
                      </select>
                    </div>

                    <div>
                      {currentUser.role === 'developer' ? (
                        <button
                          onClick={() => onToggleUserBan(u.id)}
                          disabled={u.id === currentUser.id}
                          className={`px-2 py-0.5 text-[9px] font-black uppercase rounded border ${
                            u.id === currentUser.id
                              ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed border-zinc-850'
                              : u.isBanned
                              ? 'bg-emerald-950/20 border-emerald-900 text-emerald-450'
                              : 'bg-red-950/15 border-red-900 text-red-500'
                          }`}
                        >
                          {u.isBanned ? 'Unban' : 'Ban'}
                        </button>
                      ) : (
                        <span className="text-[8px] text-zinc-600 font-bold uppercase">Ban (Dev)</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* DESKTOP TABLE VIEW AS A SECONDARY VIEWPORT */}
          <div className="hidden lg:block overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950 max-h-[380px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
                  <th className="p-3 font-semibold">User / ID</th>
                  <th className="p-3 font-semibold">Email / Kontak</th>
                  <th className="p-3 font-semibold">Role Utama</th>
                  <th className="p-3 font-semibold">Badge Tambahan (Custom Role)</th>
                  <th className="p-3 font-semibold text-center">Verified</th>
                  <th className="p-3 font-semibold text-center">Atur / Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                 {filteredUsers.map((u) => (
                  <tr key={u.id} className={`hover:bg-zinc-900/40 transition-all ${u.isBanned ? 'bg-red-950/10' : ''}`}>
                    <td className="p-3 font-bold text-zinc-200">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-750 flex items-center justify-center overflow-hidden font-bold text-xs uppercase shrink-0">
                          {u.profilePic ? <img src={u.profilePic} className="w-full h-full object-cover" alt="" /> : u.username[0]}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className={`truncate ${u.isBanned ? 'line-through text-red-500' : ''}`}>{u.username}</span>
                          <span className="text-[9px] text-zinc-600 font-mono select-all">ID: {u.id}</span>
                          {u.isBanned && (
                            <span className="text-[8px] text-red-500 font-extrabold uppercase bg-red-950/40 px-1 py-0.2 rounded border border-red-900/30 w-fit mt-0.5 animate-pulse">
                              Banned
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      {u.email ? (
                        <div className="flex flex-col">
                          <span className="text-[#39a0ff] hover:underline cursor-pointer select-all font-semibold lowercase font-mono text-[11px]">
                            {u.email}
                          </span>
                        </div>
                      ) : (
                        <span className="text-zinc-600 font-medium italic text-[10px]">
                          Belum dicantumkan
                        </span>
                      )}
                    </td>
                    <td className="p-3 uppercase text-[9px] font-bold">
                      {u.role === 'developer' && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          {u.role}
                        </span>
                      )}
                      {u.role === 'admin' && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">
                          {u.role}
                        </span>
                      )}
                      {u.role === 'seller' && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-440 border border-emerald-500/20">
                          {u.role}
                        </span>
                      )}
                      {u.role === 'user' && (
                        <span className="px-1.5 py-0.2 rounded bg-zinc-850 text-zinc-400 border border-zinc-800">
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="Owner, Trusted, etc."
                          value={userBadgeInputs[u.id] !== undefined ? userBadgeInputs[u.id] : u.customRole}
                          onChange={(e) => {
                            setUserBadgeInputs({ ...userBadgeInputs, [u.id]: e.target.value });
                          }}
                          className="bg-zinc-900 border border-zinc-850 px-2 py-1 rounded text-xs text-zinc-300 w-28 outline-none focus:border-primary font-semibold"
                        />
                        <button
                          onClick={() => {
                            const val = userBadgeInputs[u.id] !== undefined ? userBadgeInputs[u.id] : u.customRole;
                            onUpdateCustomBadge(u.id, val);
                          }}
                          className="p-1 px-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-[10px] text-zinc-200 transition-all font-bold"
                          title="Simpan Custom Role"
                        >
                          Set
                        </button>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      {u.verified ? (
                        <span className="inline-flex items-center justify-center bg-[#1DA1F2] text-white rounded-full w-3.5 h-3.5 text-[8.5px] font-black" title="Verified">
                          ✓
                        </span>
                      ) : (
                        <span className="text-zinc-650 text-xs font-bold">Tidak</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex flex-col gap-1 justify-center">
                        <div className="flex gap-1.5 justify-center">
                          <button
                            onClick={() => onToggleUserVerif(u.id)}
                            className="px-2 py-1 bg-sky-500/10 hover:bg-sky-500/25 border border-sky-500/30 text-[#1DA1F2] rounded text-[10px] font-black transition-all"
                          >
                            {u.verified ? 'Batal' : 'Verif'}
                          </button>
                          
                          <select
                            value={u.role}
                            onChange={(e) => onUpdateUserRole(u.id, e.target.value as any)}
                            className="bg-zinc-900 border border-zinc-805 text-zinc-350 px-1 py-1 rounded text-[10px] font-bold outline-none focus:border-primary"
                          >
                            <option value="user">User</option>
                            <option value="seller">Seller</option>
                            <option value="admin">Admin</option>
                            <option value="developer">Developer</option>
                          </select>
                        </div>

                        {/* Developer-Only Ban Option */}
                        <div>
                          {currentUser.role === 'developer' ? (
                            <button
                              onClick={() => onToggleUserBan(u.id)}
                              disabled={u.id === currentUser.id}
                              className={`px-3 py-1 text-[10px] font-bold uppercase rounded transition-all border ${
                                u.id === currentUser.id
                                  ? 'bg-zinc-900 text-zinc-750 cursor-not-allowed border-zinc-850'
                                  : u.isBanned
                                  ? 'bg-emerald-950/20 border-emerald-950 text-emerald-450 hover:bg-emerald-950/45'
                                  : 'bg-red-950/20 border-red-900 text-red-500 hover:bg-red-950/45'
                              }`}
                            >
                              {u.id === currentUser.id ? 'Self Lock' : u.isBanned ? 'Unban User' : 'Ban User'}
                            </button>
                          ) : (
                            <button
                              disabled
                              className="px-3 py-1 bg-zinc-900 text-zinc-650 border border-zinc-800 text-[9px] font-bold rounded cursor-not-allowed"
                              title="Hanya Developer yang dapat melakukan banned pengguna"
                            >
                              Ban (Dev Only)
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
                <th className="p-3 font-semibold">Produk</th>
                <th className="p-3 font-semibold">Penjual</th>
                <th className="p-3 font-semibold">Harga</th>
                <th className="p-3 font-semibold">Sisa Stok</th>
                <th className="p-3 font-semibold">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {products.map((p) => {
                const sel = users.find(u => u.id === p.sellerId) || { username: 'Unknown' };
                return (
                  <tr key={p.id} className="hover:bg-zinc-900/40">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        {isVideoUrl(p.images[0]) ? (
                          <video src={p.images[0]} className="w-8 h-8 object-cover rounded pointer-events-none bg-black shrink-0" muted playsInline />
                        ) : (
                          <img src={p.images[0]} className="w-8 h-8 object-cover rounded shrink-0" alt="" />
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-200 line-clamp-1">{p.title}</p>
                          <span className="text-[8.5px] bg-zinc-800 text-zinc-400 px-1 py-0.1 rounded-full font-bold uppercase">{p.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-zinc-350 font-bold truncate max-w-[100px]">{sel.username}</td>
                    <td className="p-3 text-primary font-black shrink-0">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p.price)}
                    </td>
                    <td className="p-3 font-bold text-zinc-300">{p.stock}</td>
                    <td className="p-3">
                      {deleteConfirmId === p.id ? (
                        <div className="flex items-center gap-1">
                          <span className="text-[8px] text-red-450 font-extrabold uppercase">Hapus?</span>
                          <button
                            onClick={() => {
                              onDeleteProduct(p.id);
                              setDeleteConfirmId(null);
                            }}
                            className="px-1.5 py-0.5 bg-red-650 hover:bg-red-700 text-white text-[9px] font-black rounded transition-all"
                          >
                            Ya
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-705 text-zinc-400 text-[9px] font-black rounded transition-all"
                          >
                            Gak
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(p.id)}
                          className="px-2 py-1 bg-red-500/10 hover:bg-red-500/25 border border-red-500/35 text-red-400 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
                        >
                          <Trash2 size={11} />
                          Hapus
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT 3: TRANSACTIONS */}
      {activeTab === 'transactions' && (
        <div className="space-y-3">
          <div className="max-w-md">
            <input
              type="text"
              placeholder="Cari ID Transaksi (TX...)"
              value={searchTxQuery}
              onChange={(e) => setSearchTxQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 text-xs py-2 px-3 rounded-xl text-zinc-200 outline-none focus:border-primary transition-all font-semibold placeholder:text-zinc-650"
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
                  <th className="p-3 font-semibold">ID</th>
                  <th className="p-3 font-semibold">Item</th>
                  <th className="p-3 font-semibold">Alur Transaksi</th>
                  <th className="p-3 font-semibold">Harga x Qty</th>
                  <th className="p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {transactions
                  .filter(tx => tx.id.toLowerCase().includes(searchTxQuery.toLowerCase()))
                  .map((tx) => {
                    const buyerNom = users.find(u => u.id === tx.buyerId)?.username || 'Pembeli';
                    const sellerNom = users.find(u => u.id === tx.sellerId)?.username || 'Penjual';

                    return (
                      <tr key={tx.id} className="hover:bg-zinc-900/40">
                        <td className="p-3 font-mono text-zinc-400 text-[10px] font-bold select-all">{tx.id}</td>
                        <td className="p-3 text-zinc-200 font-bold truncate max-w-[120px]">{tx.productName}</td>
                        <td className="p-3 text-[10px] text-zinc-400 font-semibold truncate max-w-[120px]">
                          <span className="text-zinc-200 font-bold">{buyerNom}</span> &rarr; <span className="text-zinc-200 font-bold">{sellerNom}</span>
                        </td>
                        <td className="p-3">
                          <p className="font-extrabold text-primary">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(tx.price * tx.qty)}</p>
                          <span className="text-[9px] text-zinc-600 font-semibold">({new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(tx.price)} x{tx.qty})</span>
                        </td>
                        <td className="p-3">
                          <span className={`px-1.5 py-0.2 rounded-full text-[8.5px] font-black uppercase ${
                            tx.status === 'completed' 
                              ? 'bg-emerald-500/20 text-emerald-450' 
                              : tx.status === 'cancelled'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-yellow-500/20 text-yellow-450 animate-pulse'
                          }`}>
                            {tx.status === 'completed' ? 'Berhasil' : tx.status === 'cancelled' ? 'Batal' : 'Proses'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: CHATS MONITORING */}
      {activeTab === 'chats' && (
        <div className="space-y-3">
          <p className="text-[10px] text-amber-500 font-extrabold flex items-center gap-1 uppercase tracking-wider leading-relaxed">
            <AlertCircle size={12} className="shrink-0" /> Pemantauan obrolan transaksi untuk perlindungan dari penipuan.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-zinc-600 text-xs border border-dashed border-zinc-800 rounded-xl bg-zinc-950/40">
                Belum ada percakapan internal yang aktif.
              </div>
            ) : (
              conversations.map((c) => {
                const buyU = users.find(u => u.id === c.buyerId);
                const sellU = users.find(u => u.id === c.sellerId);
                const prod = products.find(p => p.id === c.productId);

                return (
                  <div key={c.chatId} className="bg-zinc-955/70 border border-zinc-810 rounded-xl p-3 flex flex-col justify-between hover:border-zinc-700 transition-all text-xs">
                    <div>
                      <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5 mb-1.5">
                        <span className="text-[10px] text-zinc-550 font-bold uppercase">Lobi Diskusi</span>
                        <span className="text-xs text-primary font-black uppercase text-[9px]">{prod?.category || 'Umum'}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-bold mb-1.5 gap-2 min-w-0">
                        <span className="text-zinc-200 truncate">S: {buyU?.username || 'Unknown'}</span>
                        <span className="text-zinc-600">&rarr;</span>
                        <span className="text-zinc-200 truncate">P: {sellU?.username || 'Unknown'}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 line-clamp-1">
                        Item: <strong className="text-zinc-300 font-bold">{prod?.title || 'Produk dihapus'}</strong>
                      </p>
                      <p className="text-[10px] text-zinc-500 italic mt-1 line-clamp-1 font-medium">
                        Last msg: "{c.lastMsgText}"
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-zinc-900/60">
                      <span className="text-[9px] text-zinc-655 font-semibold">{c.messageCount} pesan</span>
                      <button
                        onClick={() => onMonitorChatSession(c.chatId)}
                        className="px-2.5 py-1 bg-primary text-white hover:bg-primary-hover rounded text-[10px] font-bold flex items-center gap-1 transition-all"
                      >
                        <MessageSquare size={11} />
                        Pantau
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: BANNER AD ADVERTISING */}
      {activeTab === 'banner' && (
        <div className="space-y-4 bg-zinc-950/80 p-4 rounded-xl border border-zinc-900">
          <div className="flex items-center gap-2">
            <ImageIcon className="text-primary" size={18} />
            <h3 className="font-bold text-sm text-zinc-100 uppercase tracking-tight">Atur Tampilan Multi-Banner Promosi Bergeser (SINKRON REALTIME)</h3>
          </div>
          <p className="text-[10.5px] text-zinc-400 font-medium leading-relaxed">
            Sebagai Developer, anda bisa mengelola lebih dari satu banner. Banner-banner ini akan otomatis berslide / bergeser di halaman beranda utama pembeli secara realtime dengan animasi menarik.
          </p>

          {/* Banner List Selector Panel */}
          <div className="bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-900 space-y-3">
            <span className="block text-[10.5px] uppercase font-black text-amber-500 tracking-wider">📁 Daftar Banner Aktif</span>
            <div className="flex flex-wrap gap-2">
              {localBanners.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedBannerId(p.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl border transition-all cursor-pointer ${
                    p.id === activeSelectedBanner?.id
                      ? 'bg-primary/10 border-primary text-white font-extrabold'
                      : 'bg-zinc-950 border-zinc-850 text-zinc-450 hover:text-zinc-200'
                  }`}
                >
                  <span className="text-[10.5px] font-bold">
                    {idx + 1}. {p.title || '(Tanpa Judul)'}
                  </span>
                  {localBanners.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = localBanners.filter(b => b.id !== p.id);
                        setLocalBanners(updated);
                        if (activeSelectedBanner?.id === p.id) {
                          setSelectedBannerId(updated[0]?.id || '');
                        }
                      }}
                      className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-all active:scale-95 cursor-pointer"
                      title="Hapus Banner"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  const newId = `banner_${Date.now()}`;
                  const newB: BannerConfig = {
                    id: newId,
                    title: 'PROMO EXCLUSIVE BARU',
                    subtitle: 'Nikmati bonus top up saldo dompet game kesayangan Anda up to 10% instant tanpa antri.',
                    imageUrl: '',
                    bgColor: '#1e3a8a',
                    accentColor: '#3b82f6',
                    buttonText: 'Beli Sekarang',
                    buttonLink: '#'
                  };
                  const updated = [...localBanners, newB];
                  setLocalBanners(updated);
                  setSelectedBannerId(newId);
                }}
                className="px-3.5 py-2 rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-green-500/20 text-green-400 hover:text-green-300 transition-all font-black text-[10px] cursor-pointer"
              >
                + Tambah Banner Baru
              </button>
            </div>
          </div>

          {activeSelectedBanner && (
            <>
              {/* Quick Example Presets (Solves: "dan beri 1 contoh banner") */}
              <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-900 space-y-2">
                <span className="block text-[9.5px] uppercase font-black text-amber-500 tracking-wider">⚡ Terapkan Preset Template pada Banner Terpilih</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    {
                      title: 'FLASH SALE ROBUX 100K POCKET',
                      subtitle: 'Robux Legal & Aman via Gamepass, rate tertinggi! Pengiriman instan & otomatis sekarang juga.',
                      imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1200',
                      bgColor: '#7c2d12',
                      accentColor: '#f97316',
                      buttonText: 'Beli Robux Sekarang',
                      buttonLink: '#',
                      label: 'Robux Sale'
                    },
                    {
                      title: 'PREMIUM GODLY MM2 ITEMS',
                      subtitle: 'Weapon Godly & Ancient termurah se-Indonesia! Menangkan matches dengan pedang kosmetik elite.',
                      imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200',
                      bgColor: '#064e3b',
                      accentColor: '#10b981',
                      buttonText: 'Mulai Cari Pedang',
                      buttonLink: '#',
                      label: 'Cosmetics MM2'
                    },
                    {
                      title: 'DIAMOND MLBB FAST HANDSHAKE',
                      subtitle: 'Top up Instant Diamond Mobile Legends rate VIP Reseller, jaminan cashback saldo dompet!',
                      imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200',
                      bgColor: '#1e3a8a',
                      accentColor: '#3b82f6',
                      buttonText: 'Top Up MLBB',
                      buttonLink: '#',
                      label: 'MLBB diamonds'
                    }
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setLocalBanners(prev => prev.map(b => {
                          if (b.id === activeSelectedBanner.id) {
                            return {
                              ...b,
                              title: p.title,
                              subtitle: p.subtitle,
                              imageUrl: p.imageUrl,
                              bgColor: p.bgColor,
                              accentColor: p.accentColor,
                              buttonText: p.buttonText,
                              buttonLink: p.buttonLink
                            };
                          }
                          return b;
                        }));
                      }}
                      className="p-2 rounded-lg bg-zinc-950 hover:bg-zinc-850 text-left border border-zinc-850 hover:border-primary/40 transition-all text-[10px] space-y-1 cursor-pointer active:scale-95 text-zinc-300 hover:text-white"
                    >
                      <span className="font-extrabold uppercase text-[8px] text-amber-500 bg-amber-500/10 px-1 py-0.2 rounded inline-block mb-1">{p.label}</span>
                      <p className="font-black truncate block">{p.title}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Form Fields container */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Judul Banner Promosi</label>
                    <input
                      type="text"
                      value={activeSelectedBanner.title}
                      onChange={(e) => updateActiveBannerField('title', e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none focus:border-primary font-extrabold"
                      placeholder="POPOLNI CRYPTO"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Keterangan / Deskripsi Iklan</label>
                    <textarea
                      value={activeSelectedBanner.subtitle}
                      onChange={(e) => updateActiveBannerField('subtitle', e.target.value)}
                      rows={2}
                      className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none focus:border-primary font-semibold"
                      placeholder="Beli Saldo Crypto & Diamond Instan, Bonus up to 5%! WAST"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Unggah Foto Banner Promosi (ATAU PASTE URL)</label>
                    
                    <div className="space-y-2">
                      <div className="relative group rounded-2xl bg-zinc-900 border-2 border-dashed border-zinc-850 hover:border-primary/50 flex flex-col items-center justify-center p-4 cursor-pointer overflow-hidden transition-all text-center min-h-[90px]">
                        {activeSelectedBanner.imageUrl ? (
                          <div className="flex items-center gap-3 w-full">
                            <img src={activeSelectedBanner.imageUrl} className="w-16 h-10 object-cover rounded-lg border border-zinc-850 shrink-0" alt="" />
                            <div className="flex-1 text-left min-w-0">
                              <p className="text-[10px] font-bold text-zinc-300 truncate font-sans">Foto Terpilih</p>
                              <p className="text-[8px] text-zinc-500 font-mono truncate">{activeSelectedBanner.imageUrl.startsWith('data:') ? 'Base64 Gambar Upload' : activeSelectedBanner.imageUrl}</p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateActiveBannerField('imageUrl', '');
                              }}
                              className="px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-450 border border-red-900/40 text-[9px] font-black rounded-xl transition-all"
                            >
                              Hapus
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <span className="text-zinc-400 text-xs font-extrabold mb-1">Pilih atau Seret Foto (.jpg, .png)</span>
                            <span className="text-[9px] text-zinc-600 font-bold">Ketuk di sini untuk upload foto dari galeri</span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBannerImageUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          title="Upload Foto Banner"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="h-[1px] bg-zinc-900 flex-1" />
                        <span className="text-[8.5px] text-zinc-600 font-bold uppercase shrink-0">Atau Gunakan Link URL</span>
                        <div className="h-[1px] bg-zinc-900 flex-1" />
                      </div>

                      <input
                        type="text"
                        value={activeSelectedBanner.imageUrl.startsWith('data:') ? '' : activeSelectedBanner.imageUrl}
                        onChange={(e) => updateActiveBannerField('imageUrl', e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none focus:border-primary font-mono text-[11px]"
                        placeholder="https://images.unsplash.com..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Teks Tombol Aksi</label>
                      <input
                        type="text"
                        value={activeSelectedBanner.buttonText}
                        onChange={(e) => updateActiveBannerField('buttonText', e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none focus:border-primary font-bold"
                        placeholder="Popolnit balance"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Link Tombol (URL/#)</label>
                      <input
                        type="text"
                        value={activeSelectedBanner.buttonLink}
                        onChange={(e) => updateActiveBannerField('buttonLink', e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none focus:border-primary font-mono text-[11px]"
                        placeholder="#"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Set Warna Background (Wheel)</label>
                      <div className="flex gap-2 items-center bg-zinc-900 border border-zinc-850 rounded-2xl px-2.5 py-1.5 focus-within:border-primary transition-all">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-zinc-700 cursor-pointer shadow-md flex items-center justify-center shrink-0 bg-gradient-to-tr from-red-500 via-yellow-400 via-green-500 via-blue-500 to-purple-500">
                          <input
                            type="color"
                            value={activeSelectedBanner.bgColor || '#EA580C'}
                            onChange={(e) => updateActiveBannerField('bgColor', e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            title="Atur Warna dengan Color Wheel"
                          />
                          <div className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: activeSelectedBanner.bgColor || '#EA580C' }} />
                        </div>
                        <input
                          type="text"
                          value={activeSelectedBanner.bgColor || '#EA580C'}
                          onChange={(e) => updateActiveBannerField('bgColor', e.target.value)}
                          className="w-full bg-transparent text-xs text-zinc-200 outline-none font-mono uppercase"
                          placeholder="#EA580C"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Warna Tombol Aksi (Wheel)</label>
                      <div className="flex gap-2 items-center bg-zinc-900 border border-zinc-850 rounded-2xl px-2.5 py-1.5 focus-within:border-primary transition-all">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-zinc-700 cursor-pointer shadow-md flex items-center justify-center shrink-0 bg-gradient-to-tr from-red-500 via-yellow-400 via-green-500 via-blue-500 to-purple-500">
                          <input
                            type="color"
                            value={activeSelectedBanner.accentColor || '#F59E0B'}
                            onChange={(e) => updateActiveBannerField('accentColor', e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            title="Atur Warna dengan Color Wheel"
                          />
                          <div className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: activeSelectedBanner.accentColor || '#F59E0B' }} />
                        </div>
                        <input
                          type="text"
                          value={activeSelectedBanner.accentColor || '#F59E0B'}
                          onChange={(e) => updateActiveBannerField('accentColor', e.target.value)}
                          className="w-full bg-transparent text-xs text-zinc-200 outline-none font-mono uppercase"
                          placeholder="#F59E0B"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onUpdateBanner(localBanners);
                    }}
                    className="w-full mt-2 py-2.5 bg-primary click-animation text-white text-xs font-black uppercase rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-hover transition-all shadow-lg shadow-primary/10 cursor-pointer"
                  >
                    <RefreshCw size={13} className="animate-spin" style={{ animationDuration: '4s' }} />
                    Simpan & Sinkronkan Semua Banner Realtime ({localBanners.length} Banner)
                  </button>
                </div>

                {/* PREVIEW CONTAINER */}
                <div className="space-y-3">
                  <span className="block text-[10px] uppercase font-bold text-zinc-500">Live Preview Hasil Banner Promosi Aktif:</span>
                  <div
                    className="relative rounded-3xl p-5 overflow-hidden flex flex-col justify-between h-[180px] border border-zinc-800 shadow-2xl bg-cover bg-center"
                    style={{
                      backgroundColor: activeSelectedBanner.bgColor || '#EA580C',
                      backgroundImage: activeSelectedBanner.imageUrl ? `url(${activeSelectedBanner.imageUrl})` : 'none',
                    }}
                  >
                    {!activeSelectedBanner.imageUrl && (
                      <div
                        className="absolute inset-0 bg-gradient-to-tr opacity-25"
                        style={{ backgroundImage: `linear-gradient(to top right, ${activeSelectedBanner.bgColor}, ${activeSelectedBanner.accentColor})` }}
                      />
                    )}
                    
                    {activeSelectedBanner.imageUrl && (
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    )}
                    
                    <div className="z-10 mt-auto">
                      <h1 className="text-xs sm:text-sm font-black text-white leading-tight uppercase tracking-tight select-none">
                        {activeSelectedBanner.title || 'POPOLNI CRYPTO'}
                      </h1>
                      <p className="text-[8px] sm:text-[9px] text-zinc-200 mt-1 uppercase font-semibold tracking-wide select-none leading-tight">
                        {activeSelectedBanner.subtitle || 'Beli Saldo Crypto & Diamond Instan, Bonus up to 10%!'}
                      </p>
                    </div>

                    <div className="z-10 self-start mt-1.5 animate-pulse">
                      <button
                        className="px-3 py-1 rounded-full text-[9px] font-extrabold text-white transition-all duration-300 hover:scale-103 cursor-pointer shadow-md select-none uppercase tracking-wider"
                        style={{ backgroundColor: activeSelectedBanner.accentColor || '#F59E0B' }}
                      >
                        {activeSelectedBanner.buttonText || 'Popolnit balance'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'branding' && (
        <div className="space-y-5 bg-zinc-950/80 p-4 rounded-xl border border-zinc-900">
          <div className="flex items-center gap-2">
            <ImageIcon className="text-primary" size={18} />
            <h3 className="font-bold text-sm text-zinc-100 uppercase tracking-tight">Kustomisasi Branding & Logo Platform</h3>
          </div>
          <p className="text-[10.5px] text-zinc-400 font-medium leading-relaxed">
            Anda bertanya: <strong className="text-primary font-bold">"Logo nya emang gabisa dari foto saya?"</strong> Tentu saja <strong className="text-[#00e5ff] font-bold">SANGAT BISA!</strong> Di halaman ini, Anda dapat mengunggah foto logo Anda (.PNG, .JPG) atau menyetel tautan gambar. Sistem akan otomatis mengganti logo beruang WAST di seluruh website secara instan!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {/* Left Column: Configuration Form */}
            <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-900 space-y-4">
              <div>
                <label className="block text-[10.5px] font-black uppercase text-zinc-450 tracking-wider mb-2">
                  Metode 1: Unggah Foto Dari Komputer / HP
                </label>
                <div className="relative group cursor-pointer border border-dashed border-zinc-800 hover:border-[#0084ff]/50 bg-zinc-950/70 p-5 rounded-xl text-center transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            const val = event.target.result as string;
                            localStorage.setItem('wast_custom_logo', val);
                            window.dispatchEvent(new Event('wast_logo_changed'));
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                    <div className="p-2 bg-[#0084ff]/10 text-primary rounded-lg">
                      <ImageIcon size={20} />
                    </div>
                    <span className="text-[11px] text-zinc-300 font-black">Klik atau Seret Foto Disini</span>
                    <span className="text-[9px] text-zinc-500 font-bold">PNG, JPG, JPEG atau GIF (Rekomendasi Kotak/Square)</span>
                  </div>
                </div>
              </div>

              <div className="relative flex py-1.5 items-center">
                <div className="flex-grow border-t border-zinc-905"></div>
                <span className="flex-shrink mx-3 text-[9px] font-bold text-zinc-650 uppercase tracking-widest">ATAU</span>
                <div className="flex-grow border-t border-zinc-905"></div>
              </div>

              <div>
                <label className="block text-[10.5px] font-black uppercase text-zinc-450 tracking-wider mb-1.5">
                  Metode 2: Tempel Tautan Gambar (Image URL)
                </label>
                <input
                  type="text"
                  placeholder="https://contoh.com/gambar-logo-anda.png"
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none focus:border-primary font-semibold"
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    if (val) {
                      localStorage.setItem('wast_custom_logo', val);
                      window.dispatchEvent(new Event('wast_logo_changed'));
                    }
                  }}
                  defaultValue={localStorage.getItem('wast_custom_logo') || ''}
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('wast_custom_logo');
                    window.dispatchEvent(new Event('wast_logo_changed'));
                  }}
                  className="w-full py-2 bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-white text-[10.5px] font-black uppercase rounded-xl border border-zinc-850 cursor-pointer transition-all active:scale-95 text-center flex items-center justify-center gap-1.5"
                >
                  Reset Logo ke Bawaan
                </button>
              </div>
            </div>

            {/* Right Column: Preview Panel */}
            <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-900 flex flex-col items-center justify-center text-center space-y-4">
              <span className="text-[10px] uppercase font-black text-amber-500 tracking-wider">👀 Preview Tampilan Logo Anda</span>
              
              <div className="p-6 bg-[#0c0c0e] border border-zinc-850 rounded-3xl shadow-2xl flex flex-col items-center justify-center w-full max-w-xs aspect-square">
                {/* Dynamically loads based on updated localStorage */}
                <div className="relative p-2.5 bg-zinc-900 border border-zinc-800 rounded-2xl mb-4 flex items-center justify-center">
                  <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                    {localStorage.getItem('wast_custom_logo') ? (
                      <img
                        src={localStorage.getItem('wast_custom_logo') || ''}
                        alt="Preview Logo"
                        className="w-full h-full object-contain rounded-xl p-0.5"
                        onError={(e) => {
                          (e.target as any).src = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=200";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center rounded-xl bg-zinc-950 border border-[#0084ff]/20">
                        <span className="text-[10px] text-zinc-500 font-bold">Vector Bear</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
                  {localStorage.getItem('wast_custom_logo') ? 'Logo Unggulan Anda' : 'Logo Beruang WAST (Default)'}
                </div>
                <p className="text-[9px] text-zinc-500 font-semibold mt-1">
                  Logo ini akan menggantikan semua ikon di login screen, navbar, splash loading, dan footer.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
