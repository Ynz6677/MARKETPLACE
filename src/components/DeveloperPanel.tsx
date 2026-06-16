/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Product, Transaction, ChatMessage } from '../types';
import { Shield, Eye, Trash2, CheckCircle2, UserCheck, Tag, ShoppingCart, RefreshCw, MessageSquare, AlertCircle } from 'lucide-react';

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
}

type DevTab = 'users' | 'products' | 'transactions' | 'chats';

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
}) => {
  const [activeTab, setActiveTab] = useState<DevTab>('users');
  const [userBadgeInputs, setUserBadgeInputs] = useState<{ [userId: string]: string }>({});
  const [searchUserQuery, setSearchUserQuery] = useState('');

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
                        <span className="text-[8px] text-zinc-500 font-bold uppercase leading-none">Role: {u.role}</span>
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
                  <th className="p-3 font-semibold">User</th>
                  <th className="p-3 font-semibold">Role Utama</th>
                  <th className="p-3 font-semibold">Badge Tambahan (Custom Role)</th>
                  <th className="p-3 font-semibold text-center">Verified Centang Biru</th>
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
                          {u.isBanned && (
                            <span className="text-[8px] text-red-500 font-extrabold uppercase bg-red-950/40 px-1 py-0.2 rounded border border-red-900/30 w-fit mt-0.5 animate-pulse">
                              Banned
                            </span>
                          )}
                        </div>
                      </div>
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
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-450 border border-emerald-500/20">
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

    </div>
  );
};
