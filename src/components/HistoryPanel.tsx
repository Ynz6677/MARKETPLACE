/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Transaction, User, Product } from '../types';
import { Clock, CheckSquare, XCircle, ShoppingBag, DollarSign, ExternalLink, RefreshCw, Download } from 'lucide-react';

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

  const handleDownloadReceipt = (tx: Transaction) => {
    const buyerUser = users.find((u) => u.id === tx.buyerId);
    const buyerName = buyerUser?.username || 'User WAST';
    
    const productItem = products.find((p) => p.id === tx.productId);
    const categoryName = productItem?.category || 'Robux';

    // Helper formats
    const centerText = (text: string, width = 40): string => {
      if (text.length >= width) return text.substring(0, width);
      const leftPadding = Math.floor((width - text.length) / 2);
      const rightPadding = width - text.length - leftPadding;
      return ' '.repeat(leftPadding) + text + ' '.repeat(rightPadding);
    };

    const formatRow = (label: string, value: string, width = 40): string => {
      const labelWithColon = `${label.padEnd(13, ' ')} : `;
      const valueSpace = width - labelWithColon.length;
      const slicedValue = value.length > valueSpace ? value.substring(0, valueSpace) : value;
      return labelWithColon + slicedValue;
    };

    let statusText = 'KONFIRMASI';
    if (tx.status === 'completed') statusText = 'SUKSES / SELESAI';
    if (tx.status === 'cancelled') statusText = 'DIBATALKAN';

    const isBuyer = tx.buyerId === currentUser.id;
    const tipeText = isBuyer ? 'BELI' : 'JUAL';

    const dateObj = new Date(tx.timestamp);
    const formattedTime = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()} ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;

    const totalTagihan = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(tx.price * tx.qty);

    const lines: string[] = [
      '========================================',
      centerText('NOTA TRANSAKSI'),
      '========================================',
      formatRow('Status', statusText),
      formatRow('Tipe', tipeText),
      formatRow('ID Transaksi', tx.id.substring(0, 18).toUpperCase()),
      formatRow('Waktu', formattedTime),
      '----------------------------------------',
      formatRow('Pelanggan', buyerName),
      formatRow('Produk', tx.productName),
      formatRow('Jumlah', `${tx.qty}x`),
      '----------------------------------------',
      formatRow('TOTAL TAGIHAN', totalTagihan),
      '----------------------------------------',
      formatRow('Kategori', categoryName),
      '========================================',
      centerText('Terima Kasih Telah Bertransaksi'),
      '========================================'
    ];

    // Build compact/slim custom layout canvas matching a real thermal roll height
    const canvas = document.createElement('canvas');
    const startX = 35; // compact left padding
    const fontSize = 18;
    const lineHeight = 28;
    const totalLinesHeight = lines.length * lineHeight;
    
    canvas.width = 500; // Much lighter width! Perfect fit for 40 monospaced characters
    canvas.height = 80 + totalLinesHeight + 110; // Dynamic height based precisely on content + barcode!

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Vintage thermal slate paper background
    ctx.fillStyle = '#fafaf5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle paper edge border look
    ctx.strokeStyle = '#e6e6dd';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Monospaced layout render
    ctx.fillStyle = '#1a1a1f';
    ctx.font = `bold ${fontSize}px "Courier New", Courier, monospace`;
    ctx.textAlign = 'left';

    const startY = 50;

    lines.forEach((line, index) => {
      ctx.fillText(line, startX, startY + (index * lineHeight));
    });

    // Barcode design matching the narrow format
    const barcodeY = startY + totalLinesHeight + 15;
    ctx.fillStyle = '#22222b';
    
    const barcodeWidth = canvas.width - (startX * 2);
    const barcodeLineWidths = [2, 4, 1, 3, 5, 2, 6, 2, 1, 4, 3, 2, 1];
    
    // Draw compact custom barcode
    let barcodeXCursor = startX;
    let iIndex = 0;
    while (barcodeXCursor < canvas.width - startX) {
      const segmentW = barcodeLineWidths[iIndex % barcodeLineWidths.length];
      ctx.fillRect(barcodeXCursor, barcodeY, segmentW, 35);
      barcodeXCursor += segmentW + 3; // add offset spacing
      iIndex++;
    }

    // Centered barcode subtitle metadata
    ctx.font = '11px "Courier New", Courier, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`*WAST-${tx.id.substring(0, 8).toUpperCase()}-${tipeText}*`, canvas.width / 2, barcodeY + 52);

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `nota_WAST_${tipeText}_${tx.id.substring(0, 8)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed downloading receipt image:', err);
    }
  };

  const getPartnerName = (tx: Transaction) => {
    const isBuyer = tx.buyerId === currentUser.id;
    const partnerId = isBuyer ? tx.sellerId : tx.buyerId;
    return users.find((u) => u.id === partnerId)?.username || 'User Pasar';
  };

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'waiting_confirmation':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-amber-500/10 border border-amber-500/20 text-yellow-500 rounded-full font-black text-[7.5px] tracking-wider uppercase animate-pulse">
            <Clock size={8} />
            Konfirmasi
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-black text-[7.5px] tracking-wider uppercase">
            <CheckSquare size={8} />
            Berhasil
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full font-black text-[7.5px] tracking-wider uppercase">
            <XCircle size={8} />
            Batal
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-805 rounded-xl p-3 md:p-4 shadow-lg space-y-3">
      
      <div className="border-b border-zinc-850 pb-2 font-semibold">
        <h2 className="text-sm font-black text-zinc-100 flex items-center gap-1">
          <ShoppingBag size={14} className="text-primary" />
          Riwayat Kasir WAST
        </h2>
        <p className="text-[9px] text-zinc-450 mt-0.5 leading-none">
          Pantau status pembelian serta lakukan approval/konfirmasi penjualan barang.
        </p>
      </div>

      {myLogs.length === 0 ? (
        <div className="p-6 text-center text-zinc-550 font-bold text-[11px] border border-dashed border-zinc-800 rounded-xl bg-zinc-950/20">
          Belum ada aktivitas transaksi atau pembelian masuk di akun Anda.
        </div>
      ) : (
        <div className="space-y-2">
          {[...myLogs]
             .sort((a, b) => b.timestamp - a.timestamp)
             .map((tx) => {
              const isBuyer = tx.buyerId === currentUser.id;
              const partnerName = getPartnerName(tx);
              const dateObj = new Date(tx.timestamp);
              const formattedDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1} ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;

              return (
                <div
                  key={tx.id}
                  className="bg-zinc-950/40 border border-zinc-850 rounded-lg p-2.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 hover:border-zinc-750 transition-all duration-200"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`text-[7px] font-black uppercase px-1.5 py-0.1 rounded-md ${
                        isBuyer 
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                          : 'bg-primary/10 text-primary border border-primary/20'
                      }`}>
                        {isBuyer ? 'Beli' : 'Jual'}
                      </span>
                      <span className="text-[8px] text-zinc-500 font-mono select-all">ID: {tx.id.slice(0, 8)}</span>
                      <span className="text-[8px] text-zinc-550 font-bold">({formattedDate})</span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-[11px] text-zinc-150 line-clamp-1 leading-snug">{tx.productName}</h3>
                      <p className="text-[9.5px] text-zinc-400 font-semibold leading-none mt-0.5">
                        {isBuyer ? 'Penjual' : 'Pembeli'}: <span className="text-[#0084ff] font-bold">{partnerName}</span>
                      </p>
                      <p className="text-[9.5px] text-zinc-450 font-medium leading-none mt-1">
                        Jumlah: <span className="text-zinc-200 font-bold">{tx.qty}x</span>
                      </p>
                    </div>
                  </div>

                  {/* Pricing and Action handler */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 w-full md:w-auto shrink-0 border-t md:border-0 border-zinc-900 pt-2 md:pt-0">
                    <div className="text-left md:text-right">
                      <span className="text-[7.5px] text-zinc-550 block leading-none font-bold">Total Tagihan</span>
                      <strong className="text-xs font-black text-primary">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(tx.price * tx.qty)}
                      </strong>
                    </div>

                    <div className="flex items-center gap-1 justify-end">
                      
                      {/* Direct Live Chat with partner */}
                      <button
                        onClick={() => onGoToChat(tx.buyerId, tx.sellerId, tx.productId)}
                        className="px-2 py-0.8 bg-zinc-900 hover:bg-zinc-800 text-zinc-350 hover:text-zinc-200 rounded-lg text-[9px] font-black transition-all border border-zinc-800 cursor-pointer"
                        title="Hubungi Obrolan"
                      >
                        Obrolan
                      </button>

                      {/* Unduh Nota Transaksi */}
                      <button
                        onClick={() => handleDownloadReceipt(tx)}
                        className="px-2 py-0.8 bg-zinc-900 hover:bg-zinc-800 text-amber-500 hover:text-amber-400 rounded-lg text-[9px] font-black transition-all border border-zinc-800 flex items-center gap-1 cursor-pointer"
                        title="Unduh Nota Transaksi"
                      >
                        <Download size={10} />
                        Nota
                      </button>

                      {/* SELLERS RESPONSE AREA FOR PENDING TRANSACTIONS (AS STRICTLY REQUESTED) */}
                      {!isBuyer && tx.status === 'waiting_confirmation' && (
                        <>
                          <button
                            onClick={() => onCancelTransaction(tx.id)}
                            className="px-2 py-0.8 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-[9px] font-black transition-all border border-red-500/20 active:scale-95 cursor-pointer"
                            title="Tolak pesanan masuk"
                          >
                            Batal
                          </button>
                          <button
                            onClick={() => onConfirmTransaction(tx.id)}
                            className="px-2 py-0.8 bg-primary hover:bg-primary-hover text-white rounded-lg text-[9px] font-black transition-all shadow-md active:scale-95 cursor-pointer"
                            title="Konfirmasi & Kirim"
                          >
                            Setujui
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
