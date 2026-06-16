/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { User, ChatMessage, Product } from '../types';
import { Send, Image, MessageSquare, Shield, X, AlertCircle, Video, Paperclip } from 'lucide-react';

interface ChatSystemProps {
  currentUser: User;
  users: User[];
  products: Product[];
  chats: ChatMessage[];
  onSendMessage: (receiverId: string, productId: number, text: string, image?: string | null, video?: string | null) => void;
  overrideTargetChatId?: string | null; // For dev mode view
  activeProductId?: number | null;
  onClose?: () => void;
  onReadChat?: (chatId: string) => void;
  onViewUserStorefront?: (userId: string) => void;
}

export const ChatSystem: React.FC<ChatSystemProps> = ({
  currentUser,
  users,
  products,
  chats,
  onSendMessage,
  overrideTargetChatId = null,
  activeProductId = null,
  onClose,
  onReadChat,
  onViewUserStorefront,
}) => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isVideoUrl = (url?: string | null) => {
    return url?.startsWith('data:video/') || url?.match(/\.(mp4|webm|ogg|mov|mkv|3gp)(\?.*)?$/i);
  };

  // Parse all chat sessions
  const getChatSessions = () => {
    const sessionsMap = new Map<string, {
      chatId: string;
      productId: number;
      partnerId: string;
      lastText: string;
      timestamp: number;
      isUnread: boolean;
    }>();

    chats.forEach((msg) => {
      // Check if message belongs to current user (unless override overrideTargetChatId is active)
      const isMyChat = overrideTargetChatId 
        ? msg.chatId === overrideTargetChatId
        : (msg.senderId === currentUser.id || msg.receiverId === currentUser.id);

      if (!isMyChat) return;

      const partnerId = msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;
      const key = msg.chatId;

      const existing = sessionsMap.get(key);
      if (!existing || existing.timestamp < msg.timestamp) {
        sessionsMap.set(key, {
          chatId: msg.chatId,
          productId: msg.productId,
          partnerId,
          lastText: msg.text || (msg.image ? '📷 [Gambar Bukti]' : msg.video ? '🎥 [Video Bukti]' : ''),
          timestamp: msg.timestamp,
          isUnread: !msg.isRead && msg.receiverId === currentUser.id,
        });
      }
    });

    return Array.from(sessionsMap.values()).sort((a, b) => b.timestamp - a.timestamp);
  };

  const sessions = getChatSessions();

  // If a specific override chat is passed or single product chat was initiated
  useEffect(() => {
    if (overrideTargetChatId) {
      setSelectedChatId(overrideTargetChatId);
    } else if (activeProductId && sessions.length > 0) {
      // Find session corresponding to active product and current user
      const matching = sessions.find(s => s.productId === activeProductId);
      if (matching) {
        setSelectedChatId(matching.chatId);
      }
    } else if (sessions.length > 0 && !selectedChatId) {
      setSelectedChatId(sessions[0].chatId);
    }
  }, [overrideTargetChatId, activeProductId, chats]);

  // Mark active chat as read when opening or receiving replies
  useEffect(() => {
    if (selectedChatId && onReadChat) {
      onReadChat(selectedChatId);
    }
  }, [selectedChatId, chats.length, onReadChat]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, selectedChatId]);

  const handleSend = () => {
    if (!inputText.trim() && !selectedImage && !selectedVideo) return;

    let targetProductId = activeProductId || 0;
    let partnerId = '';

    if (selectedChatId) {
      const parts = selectedChatId.split('-'); // buyerId-sellerId-productId
      if (parts.length === 3) {
        const buyerId = parts[0];
        const sellerId = parts[1];
        targetProductId = parseInt(parts[2]);
        partnerId = currentUser.id === buyerId ? sellerId : buyerId;
      }
    } else if (activeProductId) {
      const product = products.find(p => p.id === activeProductId);
      if (product) {
        partnerId = product.sellerId;
        targetProductId = product.id;
      }
    }

    if (!partnerId) {
      return;
    }

    onSendMessage(partnerId, targetProductId, inputText, selectedImage, selectedVideo);
    setInputText('');
    setSelectedImage(null);
    setSelectedVideo(null);
  };

  const handleImageUploaded = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVid = file.type.startsWith('video/');
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          if (isVid) {
            setSelectedVideo(event.target.result as string);
            setSelectedImage(null);
          } else {
            setSelectedImage(event.target.result as string);
            setSelectedVideo(null);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const activeMessages = chats
    .filter(m => m.chatId === selectedChatId)
    .sort((a, b) => a.timestamp - b.timestamp);
  const activeSessionDetails = sessions.find(s => s.chatId === selectedChatId);
  const partnerUser = activeSessionDetails 
    ? users.find(u => u.id === activeSessionDetails.partnerId)
    : null;
  const activeProduct = activeSessionDetails
    ? products.find(p => p.id === activeSessionDetails.productId)
    : products.find(p => p.id === activeProductId);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col md:flex-row h-[450px] shadow-2xl relative">
      
      {/* Dev watch reminder */}
      {overrideTargetChatId && (
        <div className="absolute top-0 left-0 right-0 bg-primary/20 backdrop-blur text-xs px-4 py-1 flex items-center justify-between text-primary font-bold z-10 border-b border-primary/30">
          <span className="flex items-center gap-1.5">
            <Shield size={12} />
            MODE MONITORING CHAT DEVELOPER (BISA MELIHAT CHAT INI)
          </span>
          <button onClick={onClose} className="hover:text-amber-300">
            <X size={13} />
          </button>
        </div>
      )}

      {/* CHAT SESSION LIST - Hidden on mobile if a chat is active */}
      <div className={`w-full md:w-80 border-r border-zinc-800 flex flex-col min-h-0 bg-zinc-950/40 ${selectedChatId && 'hidden md:flex'}`}>
        <div className="p-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
          <h3 className="font-bold flex items-center gap-2 text-xs sm:text-sm text-zinc-200">
            <MessageSquare size={16} className="text-primary" />
            Kotak Masuk Chat
          </h3>
          {onClose && (
            <button onClick={onClose} className="text-zinc-400 hover:text-white md:hidden">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-zinc-900">
          {sessions.length === 0 ? (
            <div className="p-6 text-center text-zinc-500 text-xs">
              Tidak ada obrolan aktif.
            </div>
          ) : (
            sessions.map((sess) => {
              const partner = users.find(u => u.id === sess.partnerId);
              const prod = products.find(p => p.id === sess.productId);
              const isSelected = selectedChatId === sess.chatId;

              return (
                <div
                  key={sess.chatId}
                  className={`w-full text-left p-2.5 flex items-start gap-2.5 transition-all cursor-pointer relative group ${
                    isSelected ? 'bg-zinc-800/80 border-l-4 border-primary' : 'hover:bg-zinc-900/60'
                  }`}
                  onClick={() => setSelectedChatId(sess.chatId)}
                >
                  <div 
                    className="relative shrink-0 cursor-pointer hover:scale-105 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (sess.partnerId) onViewUserStorefront?.(sess.partnerId);
                    }}
                    title="Klik lihat jualan user"
                  >
                    <div className="w-8.5 h-8.5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-100 overflow-hidden">
                      {partner?.profilePic ? (
                        <img src={partner.profilePic} className="w-full h-full object-cover" alt="" />
                      ) : (
                        partner?.username?.slice(0, 2).toUpperCase() || 'SV'
                      )}
                    </div>
                    {sess.isUnread && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-zinc-900 animate-pulse" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span 
                        className="font-bold text-xs text-zinc-200 truncate flex items-center gap-1 flex-wrap hover:text-primary transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (sess.partnerId) onViewUserStorefront?.(sess.partnerId);
                        }}
                        title="Klik lihat jualan user"
                      >
                        {partner?.username || 'User'}
                        {partner?.verified && (
                          <span className="inline-flex items-center justify-center bg-[#1DA1F2] text-white rounded-full w-3 h-3 text-[7.5px] font-black shrink-0" title="Terverifikasi">
                            ✓
                          </span>
                        )}
                        {partner?.customRole && (
                          <span className="text-[7px] bg-amber-500/20 text-yellow-400 font-black px-1 rounded shrink-0">
                            {partner.customRole}
                          </span>
                        )}
                      </span>
                      <span className="text-[9px] text-zinc-500 shrink-0">
                        {new Date(sess.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 truncate mt-0.5 leading-none">
                      Item: <span className="font-semibold text-zinc-300">{prod?.title || 'Produk'}</span>
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate mt-1">
                      {sess.lastText}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CHAT MESSAGES PANEL */}
      <div className={`flex-1 flex flex-col min-h-0 ${!selectedChatId && 'hidden md:flex'} ${overrideTargetChatId ? 'pt-8' : ''}`}>
        {selectedChatId ? (
          <>
            {/* Chat header */}
            <div className="p-3 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setSelectedChatId(null)}
                  className="md:hidden text-zinc-400 hover:text-white mr-1 text-xs font-bold flex items-center gap-1"
                >
                  &larr; Inbox
                </button>
                
                <div 
                  className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => partnerUser && onViewUserStorefront?.(partnerUser.id)}
                  title="Klik untuk melihat apa yang dijual user ini"
                >
                  <div className="w-8.5 h-8.5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-200 overflow-hidden transition-transform active:scale-95 hover:border-primary">
                    {partnerUser?.profilePic ? (
                      <img src={partnerUser.profilePic} className="w-full h-full object-cover" alt="" />
                    ) : (
                      partnerUser?.username?.slice(0, 2).toUpperCase() || 'SV'
                    )}
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-zinc-100 flex items-center gap-1.5 hover:text-primary transition-colors">
                      {partnerUser?.username || 'User'}
                      {partnerUser?.verified && (
                        <span className="inline-flex items-center justify-center bg-[#1DA1F2] text-white rounded-full w-3.5 h-3.5 text-[8.5px] font-black shrink-0" title="Terverifikasi">
                          ✓
                        </span>
                      )}
                      {partnerUser?.customRole && (
                        <span className="text-[7.5px] bg-amber-500/20 text-yellow-400 font-extrabold px-1 py-0.2 rounded">
                          {partnerUser.customRole}
                        </span>
                      )}
                    </div>
                    {activeProduct && (
                      <span className="text-[10px] text-zinc-450 line-clamp-1 leading-none mt-0.5">
                        Item: <span className="text-primary font-semibold">{activeProduct.title}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {partnerUser && (
                  <button
                    onClick={() => onViewUserStorefront?.(partnerUser.id)}
                    className="text-[10px] bg-zinc-800 hover:bg-zinc-700 hover:text-zinc-100 text-zinc-300 font-bold px-2 py-1 rounded-lg transition-all"
                  >
                    Profil & Jualan
                  </button>
                )}
                {onClose && (
                  <button onClick={onClose} className="p-1 px-1.5 text-zinc-400 hover:text-white transition-all bg-zinc-800 rounded-lg">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 bg-zinc-950/20">
              {activeProduct && (
                <div className="p-2 bg-zinc-900/60 rounded-xl border border-zinc-800/80 flex items-center gap-2.5">
                  {isVideoUrl(activeProduct.images[0]) ? (
                    <video src={activeProduct.images[0]} className="w-9 h-9 object-cover rounded pointer-events-none shrink-0 bg-black" muted playsInline />
                  ) : (
                    <img src={activeProduct.images[0]} className="w-9 h-9 object-cover rounded shrink-0 bg-zinc-950" alt="" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-zinc-300 font-bold truncate leading-none">{activeProduct.title}</p>
                    <p className="text-[11px] text-primary font-black mt-1 leading-none">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(activeProduct.price)}
                    </p>
                  </div>
                </div>
              )}

              {activeMessages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-3 shadow-md ${
                      isMe 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-zinc-800 text-white rounded-tl-none border border-zinc-700/50'
                    }`}>
                      {msg.text && <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>}
                      
                      {msg.image && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-black/20 max-w-xs">
                          <img src={msg.image} className="w-full object-contain max-h-56" alt="Bukti Kirim" />
                        </div>
                      )}

                      {msg.video && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-black/20 max-w-xs bg-black">
                          <video src={msg.video} className="w-full object-contain max-h-56 shadow-md" controls playsInline />
                        </div>
                      )}
                      
                      <div className="text-[9px] mt-1 text-right opacity-70">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Image Preview attachment panel */}
            {selectedImage && (
              <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image size={18} className="text-primary" />
                  <span className="text-xs text-zinc-400 font-semibold">Gambar bukti siap dikirim:</span>
                  <div className="w-12 h-12 rounded border border-zinc-700 overflow-hidden ml-2">
                    <img src={selectedImage} className="w-full h-full object-cover" alt="" />
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Video Preview attachment panel */}
            {selectedVideo && (
              <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video size={18} className="text-primary animate-pulse" />
                  <span className="text-xs text-zinc-400 font-semibold">Video bukti siap dikirim:</span>
                  <div className="w-16 h-12 rounded border border-zinc-700 overflow-hidden ml-2 bg-black">
                    <video src={selectedVideo} className="w-full h-full object-cover pointer-events-none" muted playsInline />
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedVideo(null)}
                  className="p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Chat Input form - Upgraded with premium styles and standard HTML form for flawless mobile typing */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 border-t border-zinc-800 bg-[#16161a] flex items-center gap-2.5"
            >
              <input
                type="file"
                accept="image/*,video/*"
                ref={fileInputRef}
                onChange={handleImageUploaded}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 text-zinc-400 hover:text-primary hover:bg-zinc-800/80 rounded-xl transition-all duration-200 shrink-0 flex items-center justify-center relative group"
                title="Kirim Bukti Pembayaran / Video / Gambar"
              >
                <Paperclip size={19} className="text-zinc-450 group-hover:text-primary transition-colors duration-200" />
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tulis pesan atau kirim file bukti transaksi..."
                className="flex-1 bg-[#101014] border border-zinc-850 text-zinc-100 rounded-xl px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder-zinc-500 font-medium"
              />

              <button
                type="submit"
                className="p-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl transition-all duration-250 shadow-md shadow-primary/10 hover:shadow-primary/20 active:scale-95 shrink-0 flex items-center justify-center"
                title="Kirim Pesan"
              >
                <Send size={17} className="transform hover:translate-x-0.5 transition-transform" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center p-8 text-zinc-500">
            <MessageSquare size={48} className="text-zinc-600 mb-3 animate-bounce" />
            <p className="font-semibold text-zinc-300">Hubungi Penjual & Pembeli</p>
            <p className="text-xs text-zinc-500 text-center max-w-xs mt-1">
              Gunakan fitur chat internal ini untuk bernegosiasi aman dan bertukar gambar bukti tanpa meninggalkan platform SANS VICTIM!
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
