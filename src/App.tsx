/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { User, Product, Transaction, ChatMessage } from './types';
import { SVGLogo } from './components/SVGLogo';
import { AuthScreen } from './components/AuthScreen';
import { Navbar } from './components/Navbar';
import { ProductDetail } from './components/ProductDetail';
import { ChatSystem } from './components/ChatSystem';
import { DeveloperPanel } from './components/DeveloperPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { ProfilePanel } from './components/ProfilePanel';
import { UserStorefrontModal } from './components/UserStorefrontModal';
import {
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_TRANSACTIONS,
  INITIAL_CHATS,
} from './data/mockData';
import { Sparkles, ShoppingBag, ShieldAlert, BadgeCheck, MessageSquare, Plus, CheckCircle, XCircle, AlertCircle, Search, Users } from 'lucide-react';

export default function App() {
  // Splash Screen Screen Loader
  const [isSplashLoading, setIsSplashLoading] = useState(true);
  const [splashProgress, setSplashProgress] = useState(0);

  // Core Collections persistent in localStorage
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);

  // Auth User Session State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const isVideoVal = (src?: string | null) => {
    return src?.startsWith('data:video/') || src?.match(/\.(mp4|webm|ogg|mov|mkv|3gp)(\?.*)?$/i);
  };

  // Active View Navigation Tab
  // 'home' | 'detail' | 'history' | 'profile' | 'developer' | 'upload' | 'chats' | 'stores'
  const [activeTab, setActiveTab] = useState<'home' | 'detail' | 'history' | 'profile' | 'developer' | 'upload' | 'chats' | 'stores'>('home');
  const [activeProductId, setActiveProductId] = useState<number | null>(null);
  const [overrideDevChatId, setOverrideDevChatId] = useState<string | null>(null);

  // Search & Price & Sorting filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
        // Scrolling down
        setIsSearchVisible(false);
      } else {
        // Scrolling up
        setIsSearchVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<'Semua' | 'Robux' | 'Item' | 'GIG' | 'Akun' | 'Lainnya'>('Semua');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'cheapest' | 'expensive'>('latest');

  // Custom Modal Confirmation State for Logout
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Custom Modal State for viewing storefront
  const [selectedStorefrontUserId, setSelectedStorefrontUserId] = useState<string | null>(null);

  // System Preference Adaptive Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme-preference');
    if (saved === 'light') return false;
    if (saved === 'dark') return true;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Setup OS system theme listener
  useEffect(() => {
    const saved = localStorage.getItem('theme-preference');
    let activeDark = isDarkMode;
    if (saved) {
      activeDark = (saved === 'dark');
      setIsDarkMode(activeDark);
    } else {
      const query = window.matchMedia('(prefers-color-scheme: dark)');
      activeDark = query.matches;
      setIsDarkMode(activeDark);
    }

    if (activeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const manualSaved = localStorage.getItem('theme-preference');
      if (!manualSaved) {
        setIsDarkMode(e.matches);
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    query.addEventListener('change', handler);
    return () => query.removeEventListener('change', handler);
  }, [isDarkMode]);

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => {
      const nextVal = !prev;
      localStorage.setItem('theme-preference', nextVal ? 'dark' : 'light');
      if (nextVal) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return nextVal;
    });
  };

  // Interactive Product Upload & Editing Forms states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formCategory, setFormCategory] = useState<Product['category']>('Robux');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('1');
  const [formDiscord, setFormDiscord] = useState('');
  const [formWa, setFormWa] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);

  // Buying Modal configuration states
  const [activeBuyingProduct, setActiveBuyingProduct] = useState<Product | null>(null);
  const [buyQty, setBuyQty] = useState('1');

  // Built-in Notifications
  const [activeNotification, setActiveNotification] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const triggerToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setActiveNotification({ text, type });
    setTimeout(() => setActiveNotification(null), 4000);
  };

  // Load state from localStorage on Mount
  useEffect(() => {
    const localUsers = localStorage.getItem('sv_users');
    const localProducts = localStorage.getItem('sv_products');
    const localTxs = localStorage.getItem('sv_txs');
    const localChats = localStorage.getItem('sv_chats');
    const localUser = localStorage.getItem('sv_current_user');

    if (localUsers) setUsers(JSON.parse(localUsers));
    else {
      setUsers(INITIAL_USERS);
      localStorage.setItem('sv_users', JSON.stringify(INITIAL_USERS));
    }

    if (localProducts) setProducts(JSON.parse(localProducts));
    else {
      setProducts(INITIAL_PRODUCTS);
      localStorage.setItem('sv_products', JSON.stringify(INITIAL_PRODUCTS));
    }

    if (localTxs) setTransactions(JSON.parse(localTxs));
    else {
      setTransactions(INITIAL_TRANSACTIONS);
      localStorage.setItem('sv_txs', JSON.stringify(INITIAL_TRANSACTIONS));
    }

    if (localChats) setChats(JSON.parse(localChats));
    else {
      setChats(INITIAL_CHATS);
      localStorage.setItem('sv_chats', JSON.stringify(INITIAL_CHATS));
    }

    if (localUser) {
      setCurrentUser(JSON.parse(localUser));
    }

    // Dismiss splash screen loader progressively
    let progressVal = 0;
    const progressInterval = setInterval(() => {
      progressVal += 2;
      setSplashProgress(Math.min(progressVal, 100));
      if (progressVal >= 100) {
        clearInterval(progressInterval);
        setIsSplashLoading(false);
      }
    }, 30); // 30ms * 50 steps = 1500ms smooth loading animation

    return () => clearInterval(progressInterval);
  }, []);

  // Save values to localStorage when states change
  const saveUsersToLocal = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem('sv_users', JSON.stringify(newUsers));
  };

  const saveProductsToLocal = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem('sv_products', JSON.stringify(newProducts));
  };

  const saveTxsToLocal = (newTxs: Transaction[]) => {
    setTransactions(newTxs);
    localStorage.setItem('sv_txs', JSON.stringify(newTxs));
  };

  const saveChatsToLocal = (newChats: ChatMessage[]) => {
    setChats(newChats);
    localStorage.setItem('sv_chats', JSON.stringify(newChats));
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('sv_current_user', JSON.stringify(user));
    triggerToast(`Selamat datang kembali di SANS VICTIM, ${user.username}!`, 'success');
  };

  const handleRegister = (newUser: User) => {
    const updated = [...users, newUser];
    saveUsersToLocal(updated);
    setCurrentUser(newUser);
    localStorage.setItem('sv_current_user', JSON.stringify(newUser));
    triggerToast(`Selamat datang di pasar SANS VICTIM, ${newUser.username}!`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sv_current_user');
    setActiveTab('home');
    triggerToast('Anda telah keluar dari stasiun kasir.', 'info');
  };

  // Profile modification
  const handleUpdateProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    localStorage.setItem('sv_current_user', JSON.stringify(updatedUser));

    const updatedUsersList = users.map((u) => (u.id === currentUser.id ? updatedUser : u));
    saveUsersToLocal(updatedUsersList);
  };

  // Product submission (Saves creation and also updates existing listings!)
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!formTitle.trim() || !formDesc.trim() || !formPrice.trim() || !formStock.trim()) {
      triggerToast('Seluruh kolom wajib diisi kecuali kontak opsional!', 'error');
      return;
    }

    const priceNum = parseInt(formPrice);
    const stockNum = parseInt(formStock);

    if (isNaN(priceNum) || priceNum <= 0) {
      triggerToast('Harga jual produk wajib berupa nominal angka positif!', 'error');
      return;
    }

    if (isNaN(stockNum) || stockNum < 0) {
      triggerToast('Nilai stok jualan tidak boleh negatif!', 'error');
      return;
    }

    if (formImages.length === 0) {
      triggerToast('Mohon lampirkan minimal 1 foto barang/produk!', 'error');
      return;
    }

    if (editingProduct) {
      // EDIT MODE (Fixed: "dan tidak bisa edit jualan kitaa")
      const updated = products.map((p) => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            category: formCategory,
            title: formTitle.trim(),
            desc: formDesc.trim(),
            price: priceNum,
            stock: stockNum,
            discord: formDiscord.trim(),
            wa: formWa.trim(),
            images: formImages,
          };
        }
        return p;
      });

      saveProductsToLocal(updated);
      triggerToast('Berhasil menyimpan perubahan data barang!', 'success');
    } else {
      // CREATION MODE
      const newProduct: Product = {
        id: Date.now(),
        sellerId: currentUser.id,
        category: formCategory,
        title: formTitle.trim(),
        desc: formDesc.trim(),
        price: priceNum,
        stock: stockNum,
        discord: formDiscord.trim(),
        wa: formWa.trim(),
        images: formImages,
      };

      const updated = [newProduct, ...products];
      saveProductsToLocal(updated);
      triggerToast('Barang berhasil terlisting di pasar SANS VICTIM!', 'success');
    }

    // Reset forms and return to home shop
    setEditingProduct(null);
    setFormTitle('');
    setFormDesc('');
    setFormPrice('');
    setFormStock('1');
    setFormDiscord('');
    setFormWa('');
    setFormImages([]);
    setActiveTab('profile'); // Send them to look at their inventory
  };

  // Remove/Delete listing
  const handleDeleteProduct = (prodId: number) => {
    const updated = products.filter((p) => p.id !== prodId);
    saveProductsToLocal(updated);
    triggerToast('Jualan telah ditarik dari etalase market.', 'info');
  };

  // Click on "Edit item" inside profile setting screen
  const handleInitiateEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setFormCategory(prod.category);
    setFormTitle(prod.title);
    setFormDesc(prod.desc);
    setFormPrice(prod.price.toString());
    setFormStock(prod.stock.toString());
    setFormDiscord(prod.discord);
    setFormWa(prod.wa);
    setFormImages(prod.images || []);
    setActiveTab('upload');
  };

  // Convert files to base64 images uploads
  const handleProductUploadPics = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const base64List: string[] = [...formImages];
      let filesProcessed = 0;

      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            base64List.push(event.target.result as string);
          }
          filesProcessed++;
          if (filesProcessed === files.length) {
            setFormImages(base64List);
          }
        };
        reader.readAsDataURL(files[i]);
      }
    }
  };

  // Chat launch handler (buyer clicks Chat with seller)
  const handleChatLaunch = (productId: number) => {
    const p = products.find((x) => x.id === productId);
    if (!p || !currentUser) return;

    // Open systematic chat with specific format "buyerId-sellerId-productId"
    const parsedChatId = `${currentUser.id}-${p.sellerId}-${p.id}`;
    
    // Check if there's greeting message, if not auto add to avoid empty
    const greetFound = chats.some((m) => m.chatId === parsedChatId);
    if (!greetFound) {
      const newMsg: ChatMessage = {
        id: 'msg_' + Date.now(),
        chatId: parsedChatId,
        productId: p.id,
        senderId: currentUser.id,
        receiverId: p.sellerId,
        text: `Halo kak, saya ingin bertanya tentang: "${p.title}"`,
        timestamp: Date.now(),
        isRead: false,
      };
      saveChatsToLocal([...chats, newMsg]);
    }

    setOverrideDevChatId(null);
    setActiveProductId(productId);
    setActiveTab('chats');
  };

  // Buyer clicks order, opens qty handshaker modal
  const handleOpenBuyBox = (product: Product) => {
    setActiveBuyingProduct(product);
    setBuyQty('1');
  };

  // Execute buy: "dan jumlah ketika melebihi batas stock otomatis membeli stock yg tersedia"
  const handleExecuteOrder = () => {
    if (!currentUser || !activeBuyingProduct) return;

    let requestQty = parseInt(buyQty);
    if (isNaN(requestQty) || requestQty <= 0) {
      triggerToast('Kuantitas pembelian tidak valid!', 'error');
      return;
    }

    // Auto-capping to stock if requested qty exceeds stock
    let finalQty = requestQty;
    if (requestQty > activeBuyingProduct.stock) {
      finalQty = activeBuyingProduct.stock;
      triggerToast(
        `Stok tersisa hanya ${activeBuyingProduct.stock} pcs. Jumlah beli disesuaikan otomatis!`,
        'info'
      );
    }

    // Reduce stock from product listing
    const updatedProducts = products.map((p) => {
      if (p.id === activeBuyingProduct.id) {
        return { ...p, stock: p.stock - finalQty };
      }
      return p;
    });
    saveProductsToLocal(updatedProducts);

    // Save transaction under 'waiting_confirmation' queue state (as strictly requested)
    const newTx: Transaction = {
      id: 'TX_' + Math.floor(Math.random() * 90000 + 10000) + Date.now().toString().slice(-4),
      productId: activeBuyingProduct.id,
      productName: activeBuyingProduct.title,
      price: activeBuyingProduct.price,
      qty: finalQty,
      buyerId: currentUser.id,
      sellerId: activeBuyingProduct.sellerId,
      status: 'waiting_confirmation',
      timestamp: Date.now(),
    };

    const updatedTxs = [newTx, ...transactions];
    saveTxsToLocal(updatedTxs);

    // Create system notification message
    const msgId = 'msg_' + Date.now();
    const parsedChatId = `${currentUser.id}-${activeBuyingProduct.sellerId}-${activeBuyingProduct.id}`;
    const notificationMsg: ChatMessage = {
      id: msgId,
      chatId: parsedChatId,
      productId: activeBuyingProduct.id,
      senderId: currentUser.id,
      receiverId: activeBuyingProduct.sellerId,
      text: `🔔 [PESANAN MASUK] Saya telah melakukan pembelian sebanyak ${finalQty}x. Mohon konfirmasi atau batalkan transaksi dari bilah kasir Anda. ID: ${newTx.id}`,
      timestamp: Date.now(),
      isRead: false,
    };
    saveChatsToLocal([...chats, notificationMsg]);

    setActiveBuyingProduct(null);
    triggerToast(
      'Pembelian Anda siaga! Menunggu konfirmasi dari penjual sekarang.',
      'success'
    );
    setActiveTab('history'); // Redirection
  };

  // SELLERS CONFIRMATION workflow: approve
  const handleApproveTransactionBySeller = (txId: string) => {
    const logs = transactions.map((tx) => {
      if (tx.id === txId) {
        // Send chat notify approve
        const notifyChat: ChatMessage = {
          id: 'msg_app_' + Date.now(),
          chatId: `${tx.buyerId}-${tx.sellerId}-${tx.productId}`,
          productId: tx.productId,
          senderId: tx.sellerId,
          receiverId: tx.buyerId,
          text: `✅ [DIKONFIRMASI] Pesanan Anda (ID: ${tx.id}) telah dikonfirmasi dan selesai diproses! Terima kasih sudah belanja di toko kami.`,
          timestamp: Date.now(),
          isRead: false,
        };
        saveChatsToLocal([...chats, notifyChat]);
        return { ...tx, status: 'completed' as const };
      }
      return tx;
    });

    saveTxsToLocal(logs);
    triggerToast('Anda telah mengonfirmasi pembayaran & pengiriman barang!', 'success');
  };

  // SELLERS CONFIRMATION workflow: decline/cancel
  const handleDeclineTransactionBySeller = (txId: string) => {
    const logs = transactions.map((tx) => {
      if (tx.id === txId) {
        // Refund/return stock back
        const restockProducts = products.map((p) => {
          if (p.id === tx.productId) {
            return { ...p, stock: p.stock + tx.qty };
          }
          return p;
        });
        saveProductsToLocal(restockProducts);

        // Send chat notify cancel
        const notifyChat: ChatMessage = {
          id: 'msg_can_' + Date.now(),
          chatId: `${tx.buyerId}-${tx.sellerId}-${tx.productId}`,
          productId: tx.productId,
          senderId: tx.sellerId,
          receiverId: tx.buyerId,
          text: `❌ [DIBATALKAN] Penjual membatalkan pesanan (ID: ${tx.id}). Stok produk telah dikembalikan otomatis. Silakan kontak penjual untuk detail.`,
          timestamp: Date.now(),
          isRead: false,
        };
        saveChatsToLocal([...chats, notifyChat]);
        return { ...tx, status: 'cancelled' as const };
      }
      return tx;
    });

    saveTxsToLocal(logs);
    triggerToast('Anda telah membatalkan dan menolak pesanan pembeli.', 'error');
  };

  // Developer Admin settings callback updates
  const handleToggleUserVerif = (userId: string) => {
    const list = users.map((u) => {
      if (u.id === userId) {
        return { ...u, verified: !u.verified };
      }
      return u;
    });

    // Update session wrapper too if it is the current logged-in user
    if (currentUser?.id === userId) {
      const updatedSess = { ...currentUser, verified: !currentUser.verified };
      setCurrentUser(updatedSess);
      localStorage.setItem('sv_current_user', JSON.stringify(updatedSess));
    }

    saveUsersToLocal(list);
    triggerToast('Status verifikasi tanda biru pengguna diperbarui!', 'success');
  };

  const handleUpdateUserRole = (userId: string, newRole: 'user' | 'seller' | 'admin' | 'developer') => {
    const list = users.map((u) => {
      if (u.id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    });

    if (currentUser?.id === userId) {
      const updatedSess = { ...currentUser, role: newRole };
      setCurrentUser(updatedSess);
      localStorage.setItem('sv_current_user', JSON.stringify(updatedSess));
    }

    saveUsersToLocal(list);
    triggerToast(`Status role pengguna berhasil diperbarui menjadi ${newRole.toUpperCase()}!`, 'success');
  };

  const handleToggleUserBan = (userId: string) => {
    if (currentUser?.role !== 'developer') {
      triggerToast('Hanya Developer yang memiliki hak tertinggi untuk mem-banned pengguna!', 'error');
      return;
    }
    if (userId === currentUser.id) {
      triggerToast('Anda tidak diizinkan mem-banned diri sendiri!', 'error');
      return;
    }

    const list = users.map((u) => {
      if (u.id === userId) {
        return { ...u, isBanned: !u.isBanned };
      }
      return u;
    });

    saveUsersToLocal(list);

    const updatedUser = list.find((u) => u.id === userId);
    if (updatedUser?.isBanned) {
      triggerToast(`Akun @${updatedUser.username} berhasil dibanned dari platform!`, 'success');
    } else {
      triggerToast(`Hukuman ban akun @${updatedUser?.username || 'pengguna'} telah dicabut!`, 'success');
    }
  };

  const handleUpdateCustomBadge = (userId: string, badgeText: string) => {
    const list = users.map((u) => {
      if (u.id === userId) {
        return { ...u, customRole: badgeText };
      }
      return u;
    });

    if (currentUser?.id === userId) {
      const updatedSess = { ...currentUser, customRole: badgeText };
      setCurrentUser(updatedSess);
      localStorage.setItem('sv_current_user', JSON.stringify(updatedSess));
    }

    saveUsersToLocal(list);
    triggerToast('Label badge kustom pengguna disimpan!', 'success');
  };

  const handleMonitorChat = (chatId: string) => {
    setOverrideDevChatId(chatId);
    setActiveTab('chats');
  };

  const handleSendChatMessage = (receiverId: string, productId: number, text: string, image?: string | null, video?: string | null) => {
    if (!currentUser) return;
    const p = products.find((x) => x.id === productId);
    const sellerId = p ? p.sellerId : receiverId;
    const buyerId = currentUser.id === sellerId ? receiverId : currentUser.id;
    const generatedChatId = `${buyerId}-${sellerId}-${productId}`;

    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      chatId: overrideDevChatId || generatedChatId,
      productId,
      senderId: currentUser.id,
      receiverId,
      text,
      image: image || null,
      video: video || null,
      timestamp: Date.now(),
      isRead: false,
    };

    saveChatsToLocal([...chats, newMsg]);
    triggerToast('Pesan internal dikirim!', 'success');
  };

  // Compute unread chat counts for navbar indicator
  const unreadMessagesCount = currentUser
    ? chats.filter((m) => m.receiverId === currentUser.id && !m.isRead).length
    : 0;

  // Handle marking messages as read in App
  const handleReadChat = (chatId: string) => {
    if (!currentUser) return;
    const hasUnread = chats.some((m) => m.chatId === chatId && m.receiverId === currentUser.id && !m.isRead);
    if (!hasUnread) return;

    const updated = chats.map((m) => {
      if (m.chatId === chatId && m.receiverId === currentUser.id && !m.isRead) {
        return { ...m, isRead: true };
      }
      return m;
    });
    saveChatsToLocal(updated);
  };

  // Desktop real browser notification helper
  const lastNotifiedMsgIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!currentUser || chats.length === 0) return;
    const lastMsg = chats[chats.length - 1];
    
    // Check if the last msg is incoming for us, is unread, and not notified yet
    if (lastMsg.receiverId === currentUser.id && !lastMsg.isRead && lastMsg.id !== lastNotifiedMsgIdRef.current) {
      lastNotifiedMsgIdRef.current = lastMsg.id;
      
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('SANS VICTIM Marketplace 🔔', {
            body: `${lastMsg.senderId === 'u1' ? 'Developer' : 'Pengguna'}: "${lastMsg.text}"`,
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
              new Notification('SANS VICTIM Marketplace 🔔', {
                body: `${lastMsg.senderId === 'u1' ? 'Developer' : 'Pengguna'}: "${lastMsg.text}"`,
              });
            }
          });
        }
      }
    }
  }, [chats, currentUser]);

  useEffect(() => {
    // Request notification permission early on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Filter and sort products for display in marketplace
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.desc.toLowerCase().includes(searchQuery.toLowerCase());
    
    const minVal = minPrice.trim() !== '' ? parseInt(minPrice) : NaN;
    const maxVal = maxPrice.trim() !== '' ? parseInt(maxPrice) : NaN;
    const matchesMinPrice = isNaN(minVal) || p.price >= minVal;
    const matchesMaxPrice = isNaN(maxVal) || p.price <= maxVal;

    return matchesCategory && matchesSearch && matchesMinPrice && matchesMaxPrice;
  }).sort((a, b) => {
    if (sortBy === 'cheapest') {
      return a.price - b.price;
    }
    if (sortBy === 'expensive') {
      return b.price - a.price;
    }
    return b.id - a.id; // default latest
  });

  const getProductSeller = (sellerId: string) => {
    return users.find((u) => u.id === sellerId) || { id: sellerId, username: 'Seller SANS VICTIM', verified: true, customRole: 'Legendary' } as User;
  };

  // Render Splash Screen proper logo intro
  if (isSplashLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0c0c0e] flex flex-col items-center justify-center text-center">
        <div className="relative animate-pulse max-w-sm flex flex-col items-center">
          <SVGLogo size={120} className="mb-4" />
          <h1 className="text-4xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">
            SANS VICTIM
          </h1>
          <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase mt-1">
            Premium Games & Items Store
          </p>
          <div className="w-48 h-1.5 bg-zinc-850 rounded-full mt-6 overflow-hidden relative border border-zinc-800/50">
            <div
              style={{ width: `${splashProgress}%` }}
              className="absolute top-0 left-0 bottom-0 bg-primary rounded-full transition-all duration-150 ease-out"
            />
          </div>
          <span className="text-[10px] text-zinc-500 font-mono font-black tracking-widest mt-2">{splashProgress}%</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d10] text-[#f4f4f6] flex flex-col">
      
      {/* GLOBAL TOAST POPUP NOTIFICATION */}
      {activeNotification && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border-2 border-[#10b981] text-xs sm:text-sm font-bold transition-all duration-300 animate-slide-in ${
          activeNotification.type === 'success'
            ? 'bg-emerald-950/95 text-emerald-300'
            : activeNotification.type === 'error'
            ? 'bg-red-950/95 text-red-350'
            : 'bg-zinc-950/95 text-zinc-200'
        }`}>
          <span>{activeNotification.text}</span>
        </div>
      )}

      {/* HEADER NAVBAR WITH INTEGRATED SLIDING SEARCH BAR */}
      {currentUser && (
        <div className="sticky top-0 z-40 w-full shadow-xl">
          <Navbar
            currentUser={currentUser}
            notificationCount={unreadMessagesCount}
            onSearchChange={(q) => {
              setSearchQuery(q);
              setActiveTab('home');
            }}
            onGoToTab={(tab) => {
              setActiveTab(tab);
              setOverrideDevChatId(null);
              if (tab === 'home') {
                setActiveProductId(null);
                setEditingProduct(null);
              }
            }}
            onLogout={() => setShowLogoutConfirm(true)}
            isDarkMode={isDarkMode}
            onToggleTheme={handleToggleTheme}
          />

          {/* SLIDING SEARCH BAR (POPS OUT FROM BEHIND THE NAVBAR) */}
          {activeTab === 'home' && !activeProductId && (
            <div 
              className={`absolute left-1/2 -translate-x-1/2 z-30 w-[calc(100%-3rem)] max-w-[240px] transition-all duration-300 ease-out transform ${
                isSearchVisible 
                  ? 'translate-y-1.5 opacity-100 scale-100 pointer-events-auto' 
                  : '-translate-y-full opacity-0 scale-95 pointer-events-none'
              }`}
              style={{ top: '100%' }}
            >
              <div className="bg-gradient-to-b from-amber-500 to-orange-600 border border-amber-400/40 rounded-b-2xl py-1.5 px-3.5 shadow-2xl flex items-center justify-between gap-2.5 ring-1 ring-amber-300/25">
                <div className="flex items-center gap-2 flex-1">
                  <Search className="text-white shrink-0" size={13} />
                  <input
                    type="text"
                    placeholder="Cari disini..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none text-[10px] sm:text-xs text-white placeholder-amber-100/70 outline-none focus:outline-none focus:ring-0 min-w-0 py-0.5 font-bold"
                  />
                </div>
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="p-0.5 text-white hover:text-amber-100 text-[10px] bg-amber-700/60 hover:bg-amber-850/80 rounded-full shrink-0 flex items-center justify-center w-4 h-4 font-bold"
                    title="Bersihkan"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* BODY WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* LOGIN AND REGISTRATION ROUTER */}
        {!currentUser ? (
          <div className="py-12">
            <AuthScreen
              users={users}
              onLoginSuccess={handleLogin}
              onRegisterSuccess={handleRegister}
            />
          </div>
        ) : (
          
          /* ACTIVE VIEWS CONSOLE */
          <>
            {/* VIEW TAB 1: HOME CATALOG SPLASH */}
            {activeTab === 'home' && (
              <div className="space-y-6">
                
                {/* 
                  PASAR TERBARU TITLE CUSTOM GRADIENT GRAY BACKDROP (AS REQUESTED: 
                  "buat tulisan di menu PASAR TERBARU ubah menjadi sprti di foto latar nya gradasi abu")
                */}
                <div className="relative rounded-3xl p-5 sm:p-6 overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-850 to-zinc-900 border border-zinc-805 shadow-xl flex flex-col gap-4">
                  <div className="absolute inset-0 bg-radial-gradient-accent opacity-20 pointer-events-none" />
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 sm:p-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-primary shadow-inner">
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-400 uppercase tracking-tight">
                          PASAR TERBARU
                        </h2>
                        <p className="text-[9px] sm:text-[11px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5 leading-none">
                          PRODUK DAN JASA PREMIUM TERPERCAYA SANS VICTIM
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal visual Category filter bar */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {(['Semua', 'Robux', 'Item', 'GIG', 'Akun', 'Lainnya'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-[10px] sm:text-xs px-3 py-1.5 rounded-full font-extrabold transition-all duration-200 shrink-0 ${
                          selectedCategory === cat
                            ? 'bg-zinc-100 text-zinc-900 shadow-lg'
                            : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-900'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PRICE FILTERS AND SORTING ROW */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">Rentang Harga (Rp):</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Harga Terendah"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-32 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none focus:border-primary font-mono placeholder-zinc-650"
                      />
                      <span className="text-zinc-500 text-xs font-bold">-</span>
                      <input
                        type="number"
                        placeholder="Harga Tertinggi"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-32 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none focus:border-primary font-mono placeholder-zinc-650"
                      />
                      {(minPrice !== '' || maxPrice !== '') && (
                        <button
                          onClick={() => {
                            setMinPrice('');
                            setMaxPrice('');
                          }}
                          className="text-[10px] bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/10 px-2.5 py-1.5 rounded-lg font-bold uppercase"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">Sorting Urutan:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 font-extrabold outline-none focus:border-primary"
                    >
                      <option value="latest">Terbaru Terdaftar</option>
                      <option value="cheapest">Harga Termurah (IDR ↑)</option>
                      <option value="expensive">Harga Termahal (IDR ↓)</option>
                    </select>
                  </div>
                </div>

                {/* Grid collection display */}
                <div className="grid grid-cols-2 min-[420px]:grid-cols-3 min-[580px]:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2 sm:gap-3">
                  {filteredProducts.map((p) => {
                    const sel = getProductSeller(p.sellerId);
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setActiveProductId(p.id);
                          setActiveTab('detail');
                        }}
                        className="group bg-zinc-900/90 border border-zinc-850 rounded-xl overflow-hidden cursor-pointer hover:border-primary transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5 flex flex-col justify-between"
                      >
                        <div className="relative aspect-[4/3] w-full bg-zinc-950 overflow-hidden flex items-center justify-center bg-black">
                          {p.images && p.images.length > 0 && (
                            isVideoVal(p.images[0]) ? (
                              <video
                                src={p.images[0]}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none"
                                muted
                                playsInline
                              />
                            ) : (
                              <img
                                src={p.images[0]}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                alt={p.title}
                              />
                            )
                          )}
                          <span className="absolute top-1 right-1 bg-black/75 backdrop-blur-md px-1 py-0.2 rounded text-[7px] font-black text-white uppercase tracking-wider">
                            {p.category}
                          </span>
                          
                          {p.stock === 0 && (
                            <div className="absolute inset-0 bg-black/85 flex items-center justify-center">
                              <span className="px-2 py-0.5 bg-red-650 text-white font-extrabold text-[8px] rounded uppercase tracking-wider">
                                HABIS
                              </span>
                            </div>
                          )}

                          {p.stock > 0 && p.stock <= 3 && (
                            <span className="absolute bottom-1 left-1 bg-red-600 px-1 py-0.2 rounded text-[6px] font-black text-white uppercase">
                              STOK SEKARAT
                            </span>
                          )}
                        </div>

                        {/* Summary details */}
                        <div className="p-2 flex-1 flex flex-col justify-between space-y-1.5 bg-zinc-900">
                          <div>
                            <h3 className="font-extrabold text-[11px] text-zinc-100 group-hover:text-primary transition-all line-clamp-2 leading-tight">
                              {p.title}
                            </h3>
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedStorefrontUserId(sel.id);
                              }}
                              className="flex items-center gap-1 mt-1 flex-wrap p-0.5 -m-0.5 rounded hover:bg-zinc-800/80 cursor-pointer text-zinc-400 hover:text-primary transition-all duration-200"
                              title={`Klik untuk melihat jualan ${sel.username}`}
                            >
                              <span className="text-[9.5px] font-bold truncate">
                                Toko: {sel.username}
                              </span>
                              {sel.verified && (
                                <span className="w-2.5 h-2.5 bg-[#1DA1F2] text-[6px] text-white font-black rounded-full flex items-center justify-center shrink-0" title="Verified">
                                  ✓
                                </span>
                              )}
                              {sel.customRole && (
                                <span className="text-[7.5px] bg-amber-500/20 text-yellow-400 font-extrabold px-1 py-0.2 rounded shrink-0">
                                  {sel.customRole}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="border-t border-zinc-850/60 pt-1 flex items-center justify-between">
                            <span className="text-[11px] font-extrabold text-primary truncate max-w-[75%]">
                              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p.price)}
                            </span>
                            <span className="text-[9px] text-zinc-500 font-bold">Stok: {p.stock}</span>
                          </div>
                        </div>

                      </div>
                    );
                  })}

                  {filteredProducts.length === 0 && (
                    <div className="col-span-full py-16 text-center border-2 border-dashed border-zinc-850 rounded-2xl bg-zinc-950/20 text-zinc-500 font-bold text-sm">
                      Tidak ada barang jualan yang sesuai dengan pencarian Anda.
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* VIEW TAB 2: DETAILED PRODUCT VIEWS */}
            {activeTab === 'detail' && activeProductId && (() => {
              const p = products.find((x) => x.id === activeProductId);
              if (!p) return <p className="text-center font-bold p-8">Produk tidak terdaftar.</p>;
              const sel = getProductSeller(p.sellerId);

              return (
                <ProductDetail
                  product={p}
                  seller={sel}
                  currentUser={currentUser}
                  onBack={() => {
                    setActiveProductId(null);
                    setActiveTab('home');
                  }}
                  onInitiateChat={handleChatLaunch}
                  onOpenBuyModal={handleOpenBuyBox}
                  onViewUserStorefront={(userId) => setSelectedStorefrontUserId(userId)}
                />
              );
            })()}

            {/* VIEW TAB 3: SYSTEM TRANSACTION HISTORIES & SELLER APPROVALS */}
            {activeTab === 'history' && (
              <HistoryPanel
                currentUser={currentUser}
                users={users}
                products={products}
                transactions={transactions}
                onConfirmTransaction={handleApproveTransactionBySeller}
                onCancelTransaction={handleDeclineTransactionBySeller}
                onGoToChat={(buyerId, sellerId, productId) => {
                  const resolvedChatId = `${buyerId}-${sellerId}-${productId}`;
                  setOverrideDevChatId(resolvedChatId);
                  setActiveProductId(productId);
                  setActiveTab('chats');
                }}
              />
            )}

            {/* VIEW TAB 4: PRIVATE PROFILES & INVENTORY EDIT HANDLERS */}
            {activeTab === 'profile' && (
              <ProfilePanel
                currentUser={currentUser}
                products={products}
                onUpdateProfile={handleUpdateProfile}
                onEditProduct={handleInitiateEditProduct}
                onDeleteProduct={handleDeleteProduct}
              />
            )}

            {/* VIEW TAB 5: CREATIVE LISTING SALES FORMS */}
            {activeTab === 'upload' && (
              <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-amber-500" />
                
                <h2 className="text-xl md:text-2xl font-black text-zinc-100 flex items-center gap-2 mb-2">
                  <Plus size={22} className="text-primary" />
                  {editingProduct ? 'Ubah Informasi Jualan Anda' : 'Buat Jualan Baru'}
                </h2>
                <p className="text-xs text-zinc-500 mb-6 font-semibold">
                  Isi informasi produk dengan jujur & tawarkan bantuan terbaik kepada pembeli SANS VICTIM.
                </p>

                <form onSubmit={handleProductSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    
                    {/* Category selectors */}
                    <div className="space-y-1">
                      <label className="text-xs text-zinc-400 font-bold">Kategori Barang</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as Product['category'])}
                        className="w-full bg-zinc-950 border border-zinc-800 text-xs sm:text-sm p-3 rounded-xl text-zinc-200 outline-none focus:border-primary font-bold"
                      >
                        <option value="Robux">Robux</option>
                        <option value="Item">Item In-Game</option>
                        <option value="GIG">Gift In Game (GIG)</option>
                        <option value="Akun">Akun Game / Roblox</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>

                    {/* Stock listing */}
                    <div className="space-y-1">
                      <label className="text-xs text-zinc-400 font-bold">Stok Produk</label>
                      <input
                        type="number"
                        min="0"
                        value={formStock}
                        onChange={(e) => setFormStock(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 text-xs sm:text-sm p-3 rounded-xl text-zinc-200 outline-none focus:border-primary font-bold font-mono"
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-bold">Judul Postingan Baru</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 500 Robux Murah Instan"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-805 text-xs sm:text-sm p-3 rounded-xl text-zinc-200 outline-none focus:border-primary font-bold"
                    />
                  </div>

                  {/* Pricing field */}
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-bold">Harga Jual Jasa/Item (Rupiah Rp)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="Contoh: 85000"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-805 text-xs sm:text-sm p-3 rounded-xl text-zinc-200 outline-none focus:border-primary font-bold font-mono"
                    />
                  </div>

                  {/* Detailed descriptions */}
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-bold">Deskripsi Penjelasan Detil</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Jelaskan tatacara pengiriman, gamepass link, atau waktu online toko Anda agar pembeli paham."
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 text-xs sm:text-sm p-3 rounded-xl text-zinc-200 outline-none focus:border-primary font-semibold leading-relaxed"
                    />
                  </div>

                  {/* Discord and WA physical targets */}
                  <div className="border-t border-zinc-800 pt-4 space-y-4">
                    <h3 className="text-xs text-zinc-500 font-extrabold uppercase tracking-wide">Hubungi Di Luar Sistem (Sosial Media)</h3>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-zinc-400 font-bold">Link Undangan Discord (Opsional)</label>
                        <input
                          type="text"
                          placeholder="https://discord.gg/sansvictim"
                          value={formDiscord}
                          onChange={(e) => setFormDiscord(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 text-xs sm:text-sm p-3 rounded-xl text-zinc-200 outline-none focus:border-primary font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-zinc-400 font-bold">No WhatsApp Toko (Opsional)</label>
                        <input
                          type="text"
                          placeholder="Contoh: 0812345678"
                          value={formWa}
                          onChange={(e) => setFormWa(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-zinc-950 border border-zinc-800 text-xs sm:text-sm p-3 rounded-xl text-zinc-200 outline-none focus:border-primary font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pictures uploading list */}
                  <div className="border-t border-zinc-800 pt-4 space-y-2">
                    <label className="text-xs text-zinc-400 font-bold flex justify-between items-center">
                      <span>Unggah Gambar / Video Barang (Minimal 1)</span>
                      <span className="text-[10px] text-zinc-500">Mendukung multi-upload (Gambar & Video)</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleProductUploadPics}
                      className="w-full bg-zinc-950 border border-zinc-800 text-xs py-2 px-3 rounded-xl text-zinc-400 file:bg-zinc-800 file:border-0 file:rounded-md file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-zinc-100 hover:file:bg-primary transition-all cursor-pointer"
                    />

                    {/* Previews wrap container */}
                    {formImages.length > 0 && (
                      <div className="flex gap-2-flex-wrap pt-2 overflow-x-auto">
                        {formImages.map((img, index) => (
                          <div key={index} className="relative w-16 h-16 rounded-xl overflow-hidden border border-zinc-850 shrink-0 select-none bg-black flex items-center justify-center">
                            {isVideoVal(img) ? (
                              <video src={img} className="w-full h-full object-cover pointer-events-none" muted playsInline />
                            ) : (
                              <img src={img} className="w-full h-full object-cover" alt="" />
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setFormImages(formImages.filter((_, idx) => idx !== index));
                              }}
                              className="absolute top-1 right-1 w-4 h-4 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-[10px]"
                              title="Hapus media ini"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit controls */}
                  <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(null);
                        setFormTitle('');
                        setFormDesc('');
                        setFormPrice('');
                        setFormStock('1');
                        setFormDiscord('');
                        setFormWa('');
                        setFormImages([]);
                        setActiveTab('home');
                      }}
                      className="px-5 py-2.5 bg-zinc-950 border border-zinc-850 hover:bg-zinc-800 rounded-xl text-xs font-bold text-zinc-300 transition-all font-semibold"
                    >
                      Batalkan
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs sm:text-sm font-black transition-all shadow-lg active:scale-95"
                    >
                      {editingProduct ? 'Simpan Perubahan postingan' : 'Posting ke Marketplace'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* VIEW TAB 6: IN-APP CHAT DIRECT CONVERSE MODULES */}
            {activeTab === 'chats' && (
              <ChatSystem
                currentUser={currentUser}
                users={users}
                products={products}
                chats={chats}
                onSendMessage={handleSendChatMessage}
                overrideTargetChatId={overrideDevChatId}
                activeProductId={activeProductId}
                onClose={() => {
                  setOverrideDevChatId(null);
                  setActiveProductId(null);
                  setActiveTab('home');
                }}
                onReadChat={handleReadChat}
                onViewUserStorefront={(userId) => setSelectedStorefrontUserId(userId)}
              />
            )}

            {/* VIEW TAB 8: DIRECTORY DAFTAR TOKO / SELLER STORES INDEX */}
            {activeTab === 'stores' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-zinc-100 flex items-center gap-2">
                      <Users className="text-amber-500 animate-pulse" size={24} />
                      Daftar Toko & Penjual
                    </h2>
                    <p className="text-xs text-zinc-500 font-semibold mt-1">
                      Temukan dan jelajahi etalase jualan para pencari nafkah premium SANS VICTIM.
                    </p>
                  </div>
                  
                  <div className="bg-zinc-950/60 border border-zinc-850 px-4 py-2.5 rounded-xl self-start sm:self-center">
                    <span className="text-[11px] text-zinc-500 font-bold block uppercase tracking-wider">Total Penjual Terdaftar</span>
                    <span className="text-lg font-black text-primary">{users.length} Toko</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((u) => {
                    const sellerProducts = products.filter(p => p.sellerId === u.id);
                    const isSelf = u.id === currentUser.id;
                    const specialities = Array.from(new Set(sellerProducts.map(p => p.category)));
                    
                    return (
                      <div
                        key={u.id}
                        className={`bg-zinc-900 border ${isSelf ? 'border-primary/40 shadow-primary/5 bg-primary/2' : 'border-zinc-805'} hover:border-zinc-700 rounded-2xl p-4 flex flex-col justify-between transition-all duration-305 hover:shadow-xl group relative overflow-hidden`}
                      >
                        {isSelf && (
                          <span className="absolute top-0 right-0 text-[8.5px] bg-primary text-white font-extrabold px-2.5 py-0.8 rounded-bl-xl uppercase tracking-wider">
                            Toko Anda
                          </span>
                        )}

                        <div>
                          {/* Seller Identity Row */}
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-zinc-800 border-2 border-zinc-750 flex items-center justify-center font-bold text-zinc-100 overflow-hidden group-hover:border-primary transition-all duration-300 shrink-0">
                              {u.profilePic ? (
                                <img src={u.profilePic} className="w-full h-full object-cover" alt="" />
                              ) : (
                                u.username.slice(0, 2).toUpperCase()
                              )}
                            </div>
                            
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className="font-extrabold text-sm text-zinc-150 leading-tight group-hover:text-primary transition-colors">
                                  {u.username}
                                </h3>
                                {u.verified && (
                                  <span className="inline-flex items-center justify-center bg-[#1DA1F2] text-white rounded-full w-3.5 h-3.5 text-[8.5px] font-black shrink-0" title="Terverifikasi">
                                    ✓
                                  </span>
                                )}
                                {u.customRole && (
                                  <span className="text-[8.5px] bg-amber-500/20 text-yellow-400 font-extrabold px-1.5 rounded">
                                    {u.customRole}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-zinc-500 font-bold mt-1 uppercase tracking-wider">
                                {u.role === 'developer' || u.role === 'admin' ? 'System Staff' : 'Premium Member'}
                              </div>
                            </div>
                          </div>

                          {/* Stats Info */}
                          <div className="grid grid-cols-2 gap-2 mt-4 py-2 border-t border-b border-zinc-800/60 text-xs">
                            <div>
                              <span className="text-zinc-550 font-semibold block text-[10.5px]">Jumlah Produk</span>
                              <span className="text-zinc-250 font-black text-sm">{sellerProducts.length} Item</span>
                            </div>
                            <div>
                              <span className="text-zinc-550 font-semibold block text-[10.5px]">Status Seller</span>
                              <span className="text-green-500 font-black text-xs uppercase flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                Online
                              </span>
                            </div>
                          </div>

                          {/* Category Tags */}
                          <div className="mt-3">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Spesialisasi Jualan</span>
                            {specialities.length === 0 ? (
                              <span className="text-[10px] text-zinc-650 font-medium italic">Belum ada barang jualan</span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {specialities.slice(0, 3).map((cat, idx) => (
                                  <span key={idx} className="text-[8px] bg-zinc-950 border border-zinc-800/80 text-zinc-400 px-1.5 py-0.5 rounded uppercase font-bold">
                                    {cat}
                                  </span>
                                ))}
                                {specialities.length > 3 && (
                                  <span className="text-[8.5px] text-zinc-500 font-bold px-1">+{specialities.length - 3}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-804">
                          <button
                            onClick={() => setSelectedStorefrontUserId(u.id)}
                            className="flex-1 py-1.8 bg-zinc-950 hover:bg-zinc-800 border border-zinc-850 text-zinc-350 hover:text-white rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
                          >
                            <ShoppingBag size={12} />
                            Lihat Toko ({sellerProducts.length})
                          </button>
                          
                          {!isSelf && (
                            <button
                              onClick={() => {
                                const firstProdId = sellerProducts.length > 0 ? sellerProducts[0].id : 0;
                                handleChatLaunch(firstProdId);
                              }}
                              className="px-3 py-1.8 bg-primary/10 hover:bg-primary/20 text-primary hover:text-white rounded-xl text-xs font-black transition-all flex items-center justify-center"
                              title="Tanya Penjual"
                            >
                              <MessageSquare size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW TAB 7: ADMINISTRATIVE DEVELOPER CONTROLS */}
            {activeTab === 'developer' && (currentUser.role === 'developer' || currentUser.role === 'admin') && (
              <DeveloperPanel
                currentUser={currentUser}
                users={users}
                products={products}
                transactions={transactions}
                chats={chats}
                onToggleUserVerif={handleToggleUserVerif}
                onUpdateUserRole={handleUpdateUserRole}
                onUpdateCustomBadge={handleUpdateCustomBadge}
                onDeleteProduct={handleDeleteProduct}
                onMonitorChatSession={handleMonitorChat}
                onToggleUserBan={handleToggleUserBan}
              />
            )}

          </>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-8 px-4 text-center mt-12">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2">
            <SVGLogo size={32} />
            <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-500 to-white text-base">
              SANS VICTIM MARKETPLACE
            </span>
          </div>
          <p className="text-xs text-zinc-600 max-w-md mx-auto leading-relaxed">
            SANS VICTIM adalah platform marketplace premium terpercaya untuk item in-game, Robux aman, dan Gift In Game. Semua transaksi ditata dengan kepatuhan tinggi serta jaminan kasir handshake.
          </p>
          <div className="text-[10px] text-zinc-700">
            &copy; {new Date().getFullYear()} SANS VICTIM. Hak Cipta Dilindungi Undang-Undang.
          </div>
        </div>
      </footer>

      {/* BUY QUANTITY MODAL (AS REQUESTED) */}
      {activeBuyingProduct && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-all">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 space-y-4 animate-scale-up shadow-2xl relative">
            
            <div className="absolute top-0 right-0 p-4">
              <button
                onClick={() => setActiveBuyingProduct(null)}
                className="text-zinc-500 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div>
              <span className="text-[10px] text-primary font-black uppercase tracking-widest">{activeBuyingProduct.category}</span>
              <h3 className="font-extrabold text-lg text-zinc-150 line-clamp-1">{activeBuyingProduct.title}</h3>
              <p className="text-sm text-zinc-400 mt-1 font-semibold">
                Sisa Stok: <span className="text-zinc-200 font-bold">{activeBuyingProduct.stock} pcs</span>
              </p>
            </div>

            <div className="space-y-1 bg-zinc-950 p-3.5 rounded-xl border border-zinc-900 text-center">
              <span className="text-xs text-zinc-500 font-bold uppercase leading-none block">Harga Satuan</span>
              <span className="text-2xl font-black text-primary">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(activeBuyingProduct.price)}
              </span>
            </div>

            {/* Qty Adjustment field */}
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-extrabold flex justify-between">
                <span>Atur Jumlah Beli</span>
                <span className="text-zinc-550 opacity-85">({activeBuyingProduct.stock} tersedia)</span>
              </label>
              <input
                type="number"
                min="1"
                value={buyQty}
                onChange={(e) => setBuyQty(e.target.value)}
                placeholder="Masukkan kuantitas..."
                className="w-full bg-zinc-950 border border-zinc-800 text-sm p-3 rounded-xl text-zinc-100 placeholder-zinc-700 font-mono font-extrabold text-center outline-none focus:border-primary transition-all"
              />
            </div>

            {/* Qty feedback label */}
            {parseInt(buyQty) > activeBuyingProduct.stock && (
              <p className="text-[11px] text-amber-500 italic font-semibold text-center mt-1">
                ⚠️ Melebihi batas stok! Pembelian disesuaikan otomatis menjadi membeli {activeBuyingProduct.stock} pcs.
              </p>
            )}

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setActiveBuyingProduct(null)}
                className="flex-1 py-3 bg-zinc-950 hover:bg-zinc-800 rounded-xl text-xs font-extrabold text-zinc-400 transition-all font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteOrder}
                className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-black transition-all shadow-lg active:scale-95"
              >
                Konfirmasi Beli ({new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(activeBuyingProduct.price * Math.min(activeBuyingProduct.stock, parseInt(buyQty) || 1))})
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CUSTOM CONFIRMATION DIALOG MODAL ON LOGOUT (AS REQUESTED) */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-all animate-fade-in">
          <div className="bg-zinc-900 border-2 border-[#10b981] rounded-3xl w-full max-w-sm p-6 space-y-5 animate-scale-up shadow-2xl relative text-center">
            
            <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 animate-pulse">
              <AlertCircle size={24} />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-[#f4f4f6] text-base uppercase tracking-tight">Konfirmasi Keluar Akun</h3>
              <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
                Apakah Anda benar-benar yakin ingin keluar dari akun SANS VICTIM Anda saat ini?
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 bg-zinc-950 hover:bg-zinc-800 rounded-xl text-xs font-bold text-zinc-400 transition-all border border-zinc-850"
              >
                Kembali / Batal
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                }}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-red-950/25 active:scale-95"
              >
                Ya, Keluar Akun
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SELLER STOREFRONT MODAL */}
      {selectedStorefrontUserId && (
        <UserStorefrontModal
          userId={selectedStorefrontUserId}
          users={users}
          products={products}
          onClose={() => setSelectedStorefrontUserId(null)}
          onSelectProduct={(productId) => {
            setActiveProductId(productId);
            setActiveTab('detail');
            setSelectedStorefrontUserId(null);
          }}
          onStartChat={(sellerId, productId) => {
            if (productId > 0) {
              handleChatLaunch(productId);
            } else {
              setActiveTab('chats');
            }
            setSelectedStorefrontUserId(null);
          }}
        />
      )}



    </div>
  );
}
