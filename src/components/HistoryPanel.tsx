/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Transaction, User, Product } from '../types';
import { Clock, CheckSquare, XCircle, ShoppingBag, DollarSign, ExternalLink, RefreshCw } from 'lucide-react';

interface HistoryPanelProps {
  currentUser: User;
  users: User[];
  products: Product[];
  transactions: Transaction[];
  onConfirmTransaction: (txId: string) => void;
  onCancelTransaction: (txId: string) => void;
  onGoToChat: (buyerId: string, sellerId: string, productId: number) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  currentUser,
  users,
  products,
  transactions,
  onConfirmTransaction,
  onCancelTransaction,
  onGoToChat,
}) => {
  // Filter transactions where user is Buyer OR Seller
  const myLogs = transactions.filter(
    (tx) => tx.buyerId === currentUser.id || tx.sellerId === currentUser.id
  );

  const getPartnerName = (tx: Transaction) => {
    const isBuyer = tx.buyerId === currentUser.id;
    const partnerId = isBuyer ? tx.sellerId : tx.buyerId;
    return users.find((u) => u.id === partnerId)?.username || 'User Pasar';
  };

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'waiting_confirmation':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-yellow-500 rounded-full font-extrabold text-xs tracking-wider uppercase animate-pulse">
            <Clock size={12} />
            Menunggu Konfirmasi
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-extrabold text-xs tracking-wider uppercase">
            <CheckSquare size={12} />
            Transaksi Berhasil
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full font-extrabold text-xs tracking-wider uppercase">
            <XCircle size={12} />
            Dibatalkan
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
      
      <div className="border-b border-zinc-800 pb-4 font-semibold">
        <h2 className="text-xl font-extrabold text-zinc-100 flex items-center gap-2">
          <ShoppingBag size={20} className="text-primary" />
          Riwayat Kasir SANS VICTIM
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Pantau status pembelian handshake serta lakukan approval/konfirmasi penjualan barang.
        </p>
      </div>

      {myLogs.length === 0 ? (
        <div className="p-12 text-center text-zinc-550 font-bold border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/20">
          Belum ada aktivitas transaksi atau pembelian masuk di akun Anda.
        </div>
      ) : (
        <div className="space-y-4">
          {[...myLogs]
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((tx) => {
              const isBuyer = tx.buyerId === currentUser.id;
              const partnerName = getPartnerName(tx);
              const dateObj = new Date(tx.timestamp);
              const formattedDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()} ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;

              return (
                <div
                  key={tx.id}
                  className="bg-zinc-950/60 border border-zinc-850 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-zinc-700 transition-all duration-200"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md ${
                        isBuyer 
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                          : 'bg-primary/10 text-primary border border-primary/20'
                      }`}>
                        {isBuyer ? 'Pengeluaran (Beli)' : 'Pendapatan (Jual)'}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono select-all">ID: {tx.id}</span>
                      <span className="text-xs text-zinc-500 font-medium">({formattedDate})</span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-base text-zinc-100 line-clamp-1">{tx.productName}</h3>
                      <p className="text-xs text-zinc-400 font-semibold mt-1">
                        {isBuyer ? 'Penjual' : 'Pembeli Anda'}: <span className="text-zinc-200">{partnerName}</span>
                      </p>
                      <p className="text-xs text-zinc-400 font-medium">
                        Jumlah Beli: <span className="text-primary font-bold">{tx.qty}x</span>
                      </p>
                    </div>
                  </div>

                  {/* Pricing and Action handler */}
                  <div className="flex flex-col items-end gap-3 w-full md:w-auto shrink-0 border-t border-zinc-900 pt-3 md:pt-0 md:border-0">
                    <div className="text-right">
                      <span className="text-xs text-zinc-500 block leading-tight font-medium">Total Tagihan</span>
                      <strong className="text-xl font-black text-primary">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(tx.price * tx.qty)}
                      </strong>
                    </div>

                    <div className="flex flex-wrap gap-2 w-full justify-end">
                      
                      {/* Direct Live Chat with partner */}
                      <button
                        onClick={() => onGoToChat(tx.buyerId, tx.sellerId, tx.productId)}
                        className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs font-bold transition-all border border-zinc-800"
                        title="Tanyakan / kirim bukti transfer secara internal"
                      >
                        Hubungi Obrolan
                      </button>

                      {/* SELLERS RESPONSE AREA FOR PENDING TRANSACTIONS (AS STRICTLY REQUESTED) */}
                      {!isBuyer && tx.status === 'waiting_confirmation' && (
                        <>
                          <button
                            onClick={() => onCancelTransaction(tx.id)}
                            className="px-3.5 py-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 rounded-lg text-xs font-bold transition-all border border-red-500/20 active:scale-95"
                            title="Tolak pesanan masuk"
                          >
                            Batalkan
                          </button>
                          <button
                            onClick={() => onConfirmTransaction(tx.id)}
                            className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-black transition-all shadow-md active:scale-95 flex items-center gap-1"
                            title="Konfirmasi & Kirim robux/item"
                          >
                            Konfirmasi Pembelian
                          </button>
                        </>
                      )}

                      {/* Display current progress badge */}
                      {getStatusBadge(tx.status)}

                    </div>
                  </div>

                </div>
              );
            })}
        </div>
      )}

    </div>
  );
};
