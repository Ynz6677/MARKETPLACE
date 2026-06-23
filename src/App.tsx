/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { User, Product, Transaction, ChatMessage, BannerConfig } from './types';
import { SVGLogo, WastWordmark } from './components/SVGLogo';
import { AuthScreen } from './components/AuthScreen';
import { Navbar } from './components/Navbar';
import { ProductDetail } from './components/ProductDetail';
import { ChatSystem } from './components/ChatSystem';
import { DeveloperPanel } from './components/DeveloperPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { ProfilePanel } from './components/ProfilePanel';
import { UserStorefrontModal } from './components/UserStorefrontModal';
import { PromoSlider } from './components/PromoSlider';
import {
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_TRANSACTIONS,
  INITIAL_CHATS,
} from './data/mockData';
import {
  syncUsers,
  syncProducts,
  syncTransactions,
  syncChats,
  saveUser,
  saveMultipleUsers,
  saveProduct,
  saveMultipleProducts,
  deleteProductDoc,
  saveTransaction,
  saveMultipleTransactions,
  saveChat,
  saveMultipleChats,
  syncBanner,
  saveBanner,
  clearAllExceptUsers
} from './firebase';
import { Sparkles, ShoppingBag, ShieldAlert, BadgeCheck, MessageSquare, Plus, CheckCircle, XCircle, AlertCircle, Search, Users, SlidersHorizontal, Heart, Mail, Headphones, Home, History, PlusCircle, LogOut, LogIn, Shield, User as UserIcon } from 'lucide-react';

export default function App() {
  // Splash Screen Screen Loader
  const [isSplashLoading, setIsSplashLoading] = useState(true);
  const [splashProgress, setSplashProgress] = useState(0);

  const playIntroSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const playTone = (freq: number, startTime: number, duration: number, type: OscillatorType = 'sine', gainVal = 0.1) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      // Synthesize a beautiful premium store startup sound
      playTone(261.63, now, 0.45, 'sine', 0.08); // C4
      playTone(329.63, now + 0.12, 0.45, 'sine', 0.08); // E4
      playTone(392.00, now + 0.24, 0.45, 'sine', 0.08); // G4
      playTone(523.25, now + 0.36, 0.55, 'sine', 0.1); // C5
      playTone(659.25, now + 0.48, 0.95, 'sine', 0.12); // E5
      playTone(987.77, now + 0.60, 1.45, 'sine', 0.06); // B5 digital sparkles
    } catch (e) {
      console.warn("Audio context restricted by browser:", e);
    }
  };

  // Core Collections persistent in localStorage
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);

  // Auth User Session State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [forceAuthScreen, setForceAuthScreen] = useState(false);
  const [banner, setBanner] = useState<BannerConfig[]>([]);

  const liveUser = currentUser ? users.find((u) => u.id === currentUser.id) : null;
  const isCurrentUserBanned = liveUser?.isBanned || currentUser?.isBanned || false;

  const isVideoVal = (src?: string | null) => {
    return src?.startsWith('data:video/') || src?.match(/\.(mp4|webm|ogg|mov|mkv|3gp)(\?.*)?$/i);
  };

  // Notification References for push system
  const appStartTime = useRef(Date.now());
  const isFirstTxLoad = useRef(true);
  const notifiedTxIds = useRef<Set<string>>(new Set());
  const notifiedCompletedTxIds = useRef<Set<string>>(new Set());
  const notifiedMsgIds = useRef<Set<string>>(new Set());
  const latestUsersRef = useRef<User[]>([]);
  const latestCurrentUserRef = useRef<User | null>(null);

  // Sync state variables to refs on every render to ensure always fresh state in onSnapshot callbacks!
  latestUsersRef.current = users;
  latestCurrentUserRef.current = currentUser;

  const playNotificationSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const playTone = (freq: number, startTime: number, duration: number, gainVal = 0.15) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      // Beautiful notification chime melody (ascending C5 - E5 chime)
      playTone(523.25, now, 0.15); // C5
      playTone(659.25, now + 0.08, 0.25); // E5
    } catch (error) {
      console.warn('Audio Context failed inside playNotificationSound:', error);
    }
  };

  const playCashSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;

      // Ka-ching! Double metallic coin clinks
      // Coin clink 1 (crisp high sound)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.frequency.setValueAtTime(1800, now);
      osc1.frequency.exponentialRampToValueAtTime(3200, now + 0.12);
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);

      // Coin clink 2 (delayed slightly for standard clink effect)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.frequency.setValueAtTime(1500, now + 0.08);
      osc2.frequency.exponentialRampToValueAtTime(2800, now + 0.2);
      gain2.gain.setValueAtTime(0.15, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.35);

      // Warm registers
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.frequency.setValueAtTime(987.77, now + 0.15); // B5
      gain3.gain.setValueAtTime(0.12, now + 0.15);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.15);
      osc3.stop(now + 0.5);
    } catch (error) {
      console.warn('Audio Context failed inside playCashSound:', error);
    }
  };

  const sendPushNotification = (title: string, body: string, onClick?: () => void) => {
    playNotificationSound();
    
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
          tag: 'wast-notification'
        });
        if (onClick) {
          notif.onclick = () => {
            window.focus();
            if (typeof onClick === 'function') onClick();
          };
        }
      } catch (e) {
        console.warn('HTML5 Notification failed:', e);
      }
    }
    
    triggerToast(`${title}: ${body}`, 'info');
  };

  const sendCashNotification = (title: string, body: string, onClick?: () => void) => {
    playCashSound();
    
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
          tag: 'wast-cash'
        });
        if (onClick) {
          notif.onclick = () => {
            window.focus();
            if (typeof onClick === 'function') onClick();
          };
        }
      } catch (e) {
        console.warn('HTML5 Notification failed:', e);
      }
    }
    
    triggerToast(`${title} ${body}`, 'success');
  };

  // Active View Navigation Tab
  // 'home' | 'detail' | 'history' | 'profile' | 'developer' | 'upload' | 'chats' | 'stores'
  const [activeTab, setActiveTab] = useState<'home' | 'detail' | 'history' | 'profile' | 'developer' | 'upload' | 'chats' | 'stores'>('home');
  const [activeProductId, setActiveProductId] = useState<number | null>(null);
  const [overrideDevChatId, setOverrideDevChatId] = useState<string | null>(null);
  const [isDraggingGoodsMedia, setIsDraggingGoodsMedia] = useState(false);
  const productFileInputRef = useRef<HTMLInputElement>(null);

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
  const [isPriceFilterOpen, setIsPriceFilterOpen] = useState(false);
  const [likedProducts, setLikedProducts] = useState<number[]>([1, 4, 7]);

  // Home Pagination
  const [homePage, setHomePage] = useState(1);

  // Reset page to 1 when search parameters or filters change
  useEffect(() => {
    setHomePage(1);
  }, [selectedCategory, searchQuery, minPrice, maxPrice, sortBy]);

  // Custom Modal Confirmation State for Logout
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Custom Modal State for viewing storefront
  const [selectedStorefrontUserId, setSelectedStorefrontUserId] = useState<string | null>(null);

  // Popup Search Modal state
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // System Preference Adaptive Theme state (Disabled - always dark mode)
  const isDarkMode = true;

  // Sync document class with isDarkMode state (always dark)
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleToggleTheme = () => {
    // No-op (Always dark mode)
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
  const [sellerRegEmail, setSellerRegEmail] = useState('');

  // Buying Modal configuration states
  const [activeBuyingProduct, setActiveBuyingProduct] = useState<Product | null>(null);
  const [buyQty, setBuyQty] = useState('1');

  // Built-in Notifications
  const [activeNotification, setActiveNotification] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const triggerToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setActiveNotification({ text, type });
    setTimeout(() => setActiveNotification(null), 4000);
  };

  // Load state from local storage and real-time streams on Mount
  useEffect(() => {
    // 1. Session current user in local storage persists
    const localUser = localStorage.getItem('sv_current_user');
    if (localUser) {
      try {
        const parsed = JSON.parse(localUser);
        setCurrentUser(parsed);
        if (parsed.id === 'u_guest') {
          setForceAuthScreen(true);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      // PROFIL DEFAULT NYA GUNAKAN PROFIL GUEST DAN PAKSA TAMPILAN LOGIN PERTAMA KALI
      const guestProfile: User = {
        id: 'u_guest',
        username: 'Guest',
        password: '',
        pin: '0000',
        role: 'user',
        customRole: 'Guest',
        verified: false,
        profilePic: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      };
      setCurrentUser(guestProfile);
      localStorage.setItem('sv_current_user', JSON.stringify(guestProfile));
      setForceAuthScreen(true);
    }

    // 2. Real-time synchronizations with Firestore
    const unsubUsers = syncUsers((fetchedUsers) => {
      if (fetchedUsers.length === 0) {
        // Seed database if empty
        saveMultipleUsers(INITIAL_USERS).catch(console.error);
      } else {
        setUsers(fetchedUsers);
        // Refresh session user if logged in to fetch latest badges/ban status
        const activeLocal = localStorage.getItem('sv_current_user');
        if (activeLocal) {
          try {
            const parsed = JSON.parse(activeLocal) as User;
            if (parsed.id === 'u_guest') {
              // Ensure guest profile stays as guest
              setCurrentUser(parsed);
            } else {
              const fresh = fetchedUsers.find((u) => u.id === parsed.id);
              if (fresh) {
                setCurrentUser(fresh);
                localStorage.setItem('sv_current_user', JSON.stringify(fresh));
              }
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    });

    const unsubProducts = syncProducts((fetchedProducts) => {
      // Automatic removal of "Pedang Langka" product as requested by user
      const annoyingProducts = fetchedProducts.filter(
        (p) => p.id === 102 || p.title.toLowerCase().includes('pedang langka') || p.title.toLowerCase().includes('rare sword')
      );
      if (annoyingProducts.length > 0) {
        annoyingProducts.forEach((p) => {
          deleteProductDoc(p.id).catch(console.error);
        });
      }

      const filtered = fetchedProducts.filter(
        (p) => !(p.id === 102 || p.title.toLowerCase().includes('pedang langka') || p.title.toLowerCase().includes('rare sword'))
      );

      if (filtered.length === 0) {
        saveMultipleProducts(INITIAL_PRODUCTS).catch(console.error);
      } else {
        setProducts(filtered);
      }
    });

    const unsubTransactions = syncTransactions((fetchedTxs) => {
      if (fetchedTxs.length === 0) {
        saveMultipleTransactions(INITIAL_TRANSACTIONS).catch(console.error);
      } else {
        // Sort transactions by timestamp descending
        const sorted = [...fetchedTxs].sort((a, b) => b.timestamp - a.timestamp);
        setTransactions(sorted);

        // Seed initial loaded transactions so we don't notify or play sound for existing records
        if (isFirstTxLoad.current) {
          fetchedTxs.forEach((tx) => {
            notifiedTxIds.current.add(tx.id);
            if (tx.status === 'completed') {
              notifiedCompletedTxIds.current.add(tx.id);
            }
          });
          isFirstTxLoad.current = false;
        }

        // Check for new transactions involving the logged-in user
        const cUser = latestCurrentUserRef.current;
        if (cUser) {
          fetchedTxs.forEach((tx) => {
            const isParticipant = tx.sellerId === cUser.id || tx.buyerId === cUser.id;

            // 1. Handle Transaction Completing Transitions (Selesai Transaksi)
            if (tx.status === 'completed' && isParticipant && !notifiedCompletedTxIds.current.has(tx.id)) {
              notifiedCompletedTxIds.current.add(tx.id);
              notifiedTxIds.current.add(tx.id); // Guard double notifications

              let completedTitle = 'Transaksi Sukses! 💰';
              let completedBody = `Pesanan ${tx.productName} sebanyak ${tx.qty} pcs telah berhasil diselesaikan!`;
              if (tx.sellerId === cUser.id) {
                const buyerObj = latestUsersRef.current.find((u) => u.id === tx.buyerId);
                const buyerName = buyerObj ? buyerObj.username : 'Pelanggan';
                completedBody = `Pesanan oleh ${buyerName} (${tx.productName}) sudah berhasil selesai & dana diteruskan!`;
              }
              sendCashNotification(completedTitle, completedBody, () => {
                setActiveTab('history');
              });
              return;
            }
          });
        }
      }
    });

    const unsubChats = syncChats((fetchedChats) => {
      if (fetchedChats.length === 0) {
        saveMultipleChats(INITIAL_CHATS).catch(console.error);
      } else {
        setChats(fetchedChats);

        // Check for incoming push chat messages for current user
        const cUser = latestCurrentUserRef.current;
        if (cUser) {
          fetchedChats.forEach((msg) => {
            if (msg.timestamp >= appStartTime.current && !notifiedMsgIds.current.has(msg.id)) {
              notifiedMsgIds.current.add(msg.id);

              // Notify if we are the recipient of the message
              if (msg.receiverId === cUser.id) {
                const senderObj = latestUsersRef.current.find((u) => u.id === msg.senderId);
                const senderName = senderObj ? senderObj.username : 'Seseorang';
                sendPushNotification(
                  `Pesan baru dari ${senderName} 💬`,
                  msg.text.length > 60 ? `${msg.text.slice(0, 60)}...` : msg.text,
                  () => {
                    setActiveTab('chats');
                  }
                );
              }
            }
          });
        }
      }
    });

    const unsubBanner = syncBanner((fetchedBanner) => {
      setBanner(fetchedBanner);
    });

    // Dismiss splash screen loader progressively
    let progressVal = 0;
    const progressInterval = setInterval(() => {
      progressVal += 2;
      setSplashProgress(Math.min(progressVal, 100));
      if (progressVal >= 100) {
        clearInterval(progressInterval);
        setIsSplashLoading(false);
      }
    }, 15); // Faster load for responsive feeling

    return () => {
      unsubUsers();
      unsubProducts();
      unsubTransactions();
      unsubChats();
      unsubBanner();
      clearInterval(progressInterval);
    };
  }, []);

  // Save values to Firestore on state change (maintaining exactly backward-compatible void signature)
  const saveUsersToLocal = (newUsers: User[]) => {
    setUsers(newUsers);
    newUsers.forEach((u) => {
      saveUser(u).catch(console.error);
    });
  };

  const saveProductsToLocal = (newProducts: Product[]) => {
    setProducts(newProducts);
    const deleted = products.filter((p) => !newProducts.some((np) => np.id === p.id));
    deleted.forEach((dp) => {
      deleteProductDoc(dp.id).catch(console.error);
    });
    newProducts.forEach((p) => {
      const match = products.find((x) => x.id === p.id);
      if (!match || JSON.stringify(match) !== JSON.stringify(p)) {
        saveProduct(p).catch(console.error);
      }
    });
  };

  const saveTxsToLocal = (newTxs: Transaction[]) => {
    setTransactions(newTxs);
    newTxs.forEach((tx) => {
      const match = transactions.find((x) => x.id === tx.id);
      if (!match || JSON.stringify(match) !== JSON.stringify(tx)) {
        saveTransaction(tx).catch(console.error);
      }
    });
  };

  const saveChatsToLocal = (newChats: ChatMessage[]) => {
    setChats(newChats);
    newChats.forEach((chat) => {
      const match = chats.find((x) => x.id === chat.id);
      if (!match || JSON.stringify(match) !== JSON.stringify(chat)) {
        saveChat(chat).catch(console.error);
      }
    });
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setForceAuthScreen(false);
    localStorage.setItem('sv_current_user', JSON.stringify(user));
    triggerToast(`Selamat datang kembali di WAST, ${user.username}!`, 'success');
    playIntroSound();
  };

  const handleRegister = async (newUser: User) => {
    try {
      await saveUser(newUser);
    } catch (err) {
      console.error(err);
    }
    const updated = [...users, newUser];
    setUsers(updated);
    setCurrentUser(newUser);
    setForceAuthScreen(false);
    localStorage.setItem('sv_current_user', JSON.stringify(newUser));
    triggerToast(`Selamat datang di pasar WAST, ${newUser.username}!`, 'success');
    playIntroSound();
  };

  const handleLogout = () => {
    const guestProfile: User = {
      id: 'u_guest',
      username: 'Guest',
      password: '',
      pin: '0000',
      role: 'user',
      customRole: 'Guest',
      verified: false,
      profilePic: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    };
    setCurrentUser(guestProfile);
    localStorage.setItem('sv_current_user', JSON.stringify(guestProfile));
    setActiveTab('home');
    triggerToast('Anda telah keluar ke profil Guest.', 'info');
  };

  // Profile modification
  const handleUpdateProfile = async (updates: Partial<User>) => {
    if (!currentUser) return;
    const sanitizedUpdates = { ...updates };
    if (sanitizedUpdates.profilePic === null) {
      sanitizedUpdates.profilePic = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80';
    }
    const updatedUser = { ...currentUser, ...sanitizedUpdates };
    setCurrentUser(updatedUser);
    localStorage.setItem('sv_current_user', JSON.stringify(updatedUser));

    if (currentUser.id !== 'u_guest') {
      try {
        await saveUser(updatedUser);
      } catch (err) {
        console.error(err);
      }

      const updatedUsersList = users.map((u) => (u.id === currentUser.id ? updatedUser : u));
      setUsers(updatedUsersList);
    }
  };

  const handleRegisterAsSellerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!sellerRegEmail.trim()) {
      triggerToast('Alamat email wajib diisi untuk mendaftar sebagai penjual!', 'error');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sellerRegEmail.trim())) {
      triggerToast('Format email tidak valid! Harap periksa kembali.', 'error');
      return;
    }

    const updatedUser: User = {
      ...currentUser,
      role: 'seller',
      email: sellerRegEmail.trim()
    };

    setCurrentUser(updatedUser);
    localStorage.setItem('sv_current_user', JSON.stringify(updatedUser));

    const updatedUsersList = users.map((u) => (u.id === currentUser.id ? updatedUser : u));
    saveUsersToLocal(updatedUsersList);

    triggerToast('Selamat! Akun Anda sukses terdaftar sebagai Penjual di WAST!', 'success');
  };

  // Product submission (Saves creation and also updates existing listings!)
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (isCurrentUserBanned) {
      triggerToast('Gagal memproses jualan: Akun Anda telah di-banned! Anda tidak dapat menjual barang.', 'error');
      return;
    }

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
      triggerToast('Barang berhasil terlisting di pasar WAST!', 'success');
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
      const maxSize = 100 * 1024 * 1024; // 100MB max limit

      const qualifiedFiles = files ? (Array.from(files) as File[]).filter(f => {
        if (f.size > maxSize) {
          triggerToast(`Berkas "${f.name}" melebihi batas maksimal 100MB!`, 'error');
          return false;
        }
        return true;
      }) : [];

      if (qualifiedFiles.length === 0) return;

      for (let i = 0; i < qualifiedFiles.length; i++) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            base64List.push(event.target.result as string);
          }
          filesProcessed++;
          if (filesProcessed === qualifiedFiles.length) {
            setFormImages(base64List);
          }
        };
        reader.readAsDataURL(qualifiedFiles[i]);
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

    if (isCurrentUserBanned) {
      triggerToast('Transaksi Gagal: Akun Anda telah di-banned! Anda tidak dapat membeli barang.', 'error');
      return;
    }

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
  const handleToggleUserVerif = async (userId: string) => {
    let updatedUser: User | null = null;
    const list = users.map((u) => {
      if (u.id === userId) {
        const up = { ...u, verified: !u.verified };
        updatedUser = up;
        return up;
      }
      return u;
    });

    if (updatedUser) {
      await saveUser(updatedUser);
    }

    if (currentUser?.id === userId && updatedUser) {
      setCurrentUser(updatedUser);
      localStorage.setItem('sv_current_user', JSON.stringify(updatedUser));
    }

    setUsers(list);
    triggerToast('Status verifikasi tanda biru pengguna diperbarui!', 'success');
  };

  const handleUpdateUserRole = async (userId: string, newRole: 'user' | 'seller' | 'admin' | 'developer') => {
    let updatedUser: User | null = null;
    const list = users.map((u) => {
      if (u.id === userId) {
        const up = { ...u, role: newRole };
        updatedUser = up;
        return up;
      }
      return u;
    });

    if (updatedUser) {
      await saveUser(updatedUser);
    }

    if (currentUser?.id === userId && updatedUser) {
      setCurrentUser(updatedUser);
      localStorage.setItem('sv_current_user', JSON.stringify(updatedUser));
    }

    setUsers(list);
    triggerToast(`Status role pengguna berhasil diperbarui menjadi ${newRole.toUpperCase()}!`, 'success');
  };

  const handleToggleUserBan = async (userId: string) => {
    if (currentUser?.role !== 'developer') {
      triggerToast('Hanya Developer yang memiliki hak tertinggi untuk mem-banned pengguna!', 'error');
      return;
    }
    if (userId === currentUser.id) {
      triggerToast('Anda tidak diizinkan mem-banned diri sendiri!', 'error');
      return;
    }

    let updatedUser: User | null = null;
    const list = users.map((u) => {
      if (u.id === userId) {
        const up = { ...u, isBanned: !u.isBanned };
        updatedUser = up;
        return up;
      }
      return u;
    });

    if (updatedUser) {
      await saveUser(updatedUser);
    }

    setUsers(list);

    if (updatedUser && (updatedUser as User).isBanned) {
      triggerToast(`Akun @${(updatedUser as User).username} berhasil dibanned dari platform!`, 'success');
    } else {
      triggerToast(`Hukuman ban akun @${updatedUser ? (updatedUser as User).username : 'pengguna'} telah dicabut!`, 'success');
    }
  };

  const handleUpdateCustomBadge = async (userId: string, badgeText: string) => {
    let updatedUser: User | null = null;
    const list = users.map((u) => {
      if (u.id === userId) {
        const up = { ...u, customRole: badgeText };
        updatedUser = up;
        return up;
      }
      return u;
    });

    if (updatedUser) {
      await saveUser(updatedUser);
    }

    if (currentUser?.id === userId && updatedUser) {
      setCurrentUser(updatedUser);
      localStorage.setItem('sv_current_user', JSON.stringify(updatedUser));
    }

    setUsers(list);
    triggerToast('Label badge kustom pengguna disimpan!', 'success');
  };

  const handleUpdateUserBalance = async (userId: string, newBalance: number) => {
    let updatedUser: User | null = null;
    const list = users.map((u) => {
      if (u.id === userId) {
        const up = { ...u, balance: newBalance };
        updatedUser = up;
        return up;
      }
      return u;
    });

    if (updatedUser) {
      await saveUser(updatedUser);
    }

    if (currentUser?.id === userId && updatedUser) {
      setCurrentUser(updatedUser);
      localStorage.setItem('sv_current_user', JSON.stringify(updatedUser));
    }

    setUsers(list);
    triggerToast('Saldo dompet pengguna berhasil diubah!', 'success');
  };

  const handleResetDatabase = async () => {
    try {
      await clearAllExceptUsers();
      setProducts([]);
      setTransactions([]);
      setChats([]);
      setBanner([]);
      triggerToast('Database berhasil di-reset sepenuhnya ke 0 (kecuali pengguna)!', 'success');
    } catch (err) {
      console.error(err);
      triggerToast('Gagal me-reset database: ' + (err as any).message, 'error');
    }
  };

  const handleUpdateBanner = async (newBanner: BannerConfig | BannerConfig[]) => {
    try {
      await saveBanner(newBanner);
      triggerToast('Banner promosi iklan berhasil diperbarui secara realtime!', 'success');
    } catch (e) {
      console.error(e);
      triggerToast('Gagal memperbarui banner promosi iklan.', 'error');
    }
  };

  const handleMonitorChat = (chatId: string) => {
    setOverrideDevChatId(chatId);
    setActiveTab('chats');
  };

  const handleSendChatMessage = (receiverId: string, productId: number, text: string, image?: string | null, video?: string | null) => {
    if (!currentUser) return;

    if (isCurrentUserBanned) {
      triggerToast('Gagal mengirim pesan: Akun Anda telah di-banned!', 'error');
      return;
    }

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
        try {
          if (Notification.permission === 'granted') {
            try {
              new Notification('WAST Marketplace 🔔', {
                body: `${lastMsg.senderId === 'u1' ? 'Developer' : 'Pengguna'}: "${lastMsg.text}"`,
              });
            } catch (err) {
              console.warn('Standard Notification constructor failed. Relying on service worker or local toast instead.', err);
            }
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then((permission) => {
              if (permission === 'granted') {
                try {
                  new Notification('WAST Marketplace 🔔', {
                    body: `${lastMsg.senderId === 'u1' ? 'Developer' : 'Pengguna'}: "${lastMsg.text}"`,
                  });
                } catch (err) {
                  console.warn('Standard Notification constructor failed after permission granted.', err);
                }
              }
            }).catch((e) => {
              console.warn('Notification permission promise rejected:', e);
            });
          }
        } catch (error) {
          console.warn('HTML5 Notification check or execution failed gracefully:', error);
        }
      }
    }
  }, [chats, currentUser]);

  useEffect(() => {
    // Request notification permission early on mount
    try {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    } catch (error) {
      console.warn('Failed to check/request initial Notification permission:', error);
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
    return users.find((u) => u.id === sellerId) || { id: sellerId, username: 'Seller Resmi', verified: true, customRole: 'Legendary' } as User;
  };

  // Render Splash Screen proper logo intro
  if (isSplashLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0c0c0e] flex flex-col items-center justify-center text-center animate-fade-in">
        <div className="relative max-w-sm flex flex-col items-center p-6">
          <div className="mb-6 flex items-center justify-center">
            <SVGLogo size={80} variant="bear" />
          </div>
          <WastWordmark size="xl" className="mb-0.5" />
          <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mt-2">
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

      {/* HEADER NAVBAR REPLICATING BAZARA BOT TOP BAR */}
      {currentUser && !forceAuthScreen && (
        <div className="sticky top-0 z-40 w-full shadow-xl bg-gradient-to-r from-[#00142d] via-[#0051ba] to-[#00142d]">
          <Navbar
            currentUser={currentUser}
            notificationCount={unreadMessagesCount}
            activeTab={activeTab}
            activeProductId={activeProductId}
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
            onBackClick={() => {
              if (activeProductId) {
                setActiveProductId(null);
              } else {
                setActiveTab('home');
              }
            }}
            onLogout={() => setShowLogoutConfirm(true)}
            isDarkMode={isDarkMode}
            onToggleTheme={handleToggleTheme}
            onLoginClick={() => setForceAuthScreen(true)}
          />
        </div>
      )}

      {currentUser && isCurrentUserBanned && (
        <div className="bg-red-650 text-white text-center py-2 px-4 font-black text-xs sm:text-xs flex items-center justify-center gap-2 select-none shrink-0 border-b border-red-800 tracking-tight z-30">
          <ShieldAlert size={14} className="shrink-0" />
          <span>⚠️ AKUN ANDA TELAH DIBANNED! Anda tidak dapat melangsungkan transaksi beli, membuat jualan baru, atau berpartisipasi dalam chat.</span>
        </div>
      )}

      {/* BODY WORKSPACE */}
      {(!currentUser || forceAuthScreen) ? (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-44">
          <div className="py-12">
            <AuthScreen
              users={users}
              onLoginSuccess={handleLogin}
              onRegisterSuccess={handleRegister}
            />
            {currentUser?.id === 'u_guest' && (
              <div className="max-w-md mx-auto mt-6 text-center px-4 animate-fade-in flex flex-col gap-1">
                <button
                  onClick={() => setForceAuthScreen(false)}
                  className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-bold tracking-tight transition-all cursor-pointer shadow-lg outline-none flex items-center justify-center gap-1.5 mx-auto"
                >
                  ← Tetap Menggunakan Akun Guest
                </button>
              </div>
            )}
          </div>
        </main>
      ) : (
        
        /* UNIFIED FLUSH SIDEBAR AND CONTENT LAYOUT WITH NO GAP BELOW NAVBAR */
        <div className="flex-1 flex flex-col md:flex-row w-full relative">
          
          {/* DESKTOP SIDEBAR: COMPACT, SLIGHTLY THINNER (w-48), FLUSH TO THE TOP NAV BAR */}
          <aside 
            className="hidden md:flex flex-col w-48 shrink-0 sticky top-[55px] h-[calc(100vh-55px)] border-r border-[#0084ff]/20 p-3 text-white z-30 select-none overflow-y-auto"
            style={{
              background: 'linear-gradient(to bottom, #001026 0%, #001f42 50%, #0d0d10 100%)'
            }}
          >
            {/* COMPACT STYLIZED PROFILE HEADER */}
            <div 
              onClick={() => {
                setActiveTab('profile');
                setOverrideDevChatId(null);
              }}
              className="flex flex-col items-center gap-2 pb-3.5 border-b border-[#0084ff]/15 w-full cursor-pointer hover:bg-white/5 rounded-xl p-1.5 transition-all group active:scale-[0.98]"
            >
              <div className="relative group-hover:scale-105 transition-transform duration-200">
                {/* Profile Picture / Avatar - Square, no border as requested */}
                <div className="w-12 h-12 rounded-none overflow-hidden shrink-0 bg-zinc-950 flex items-center justify-center">
                  {currentUser.profilePic ? (
                    <img 
                      src={currentUser.profilePic} 
                      className="w-full h-full object-cover" 
                      alt={currentUser.username} 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <UserIcon size={18} className="text-zinc-500" />
                  )}
                </div>
                {/* Verif Badge */}
                {currentUser.verified && (
                  <div className="absolute -bottom-0.5 -right-0.5 bg-[#001026] p-0.5" title="Verified Seller">
                    <BadgeCheck size={14} className="text-[#3bb0ff] fill-[#0084ff]/10" />
                  </div>
                )}
              </div>
              <div className="text-center w-full min-w-0 px-1 flex flex-col items-center">
                <h3 className="text-[12px] font-black tracking-tight truncate text-white leading-normal transition-colors">
                  {currentUser.username}
                </h3>
                {/* Yellow role/title with elegant side bars/border as requested */}
                <div className="mt-1 flex items-center bg-yellow-400/10 px-2 py-0.5 border-l-2 border-r-2 border-yellow-400 select-none">
                  <span className="text-[7.5px] text-yellow-400 font-extrabold uppercase tracking-widest leading-none">
                    {currentUser.customRole || (currentUser.role === 'user' ? 'Member' : currentUser.role)}
                  </span>
                </div>
              </div>
            </div>

            {/* Sidebar main navigation links */}
            <div className="flex flex-col gap-1 pt-1.5">
              {/* 1. HOME tag element */}
              <button
                onClick={() => {
                  setActiveTab('home');
                  setOverrideDevChatId(null);
                  setActiveProductId(null);
                  setEditingProduct(null);
                }}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl w-full text-left font-black transition-all text-[11px] tracking-tight select-none cursor-pointer ${
                  activeTab === 'home' && !activeProductId
                    ? 'bg-gradient-to-r from-[#0084ff] to-[#0051ba] text-white shadow-md shadow-[#0084ff]/15 scale-[1.01]'
                    : 'text-zinc-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Home size={14} />
                <span>Beranda</span>
              </button>

              {/* 2. CHATS tag element */}
              <button
                onClick={() => {
                  setActiveTab('chats');
                  setOverrideDevChatId(null);
                }}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl w-full text-left font-black transition-all text-[11px] tracking-tight select-none cursor-pointer relative ${
                  activeTab === 'chats'
                    ? 'bg-gradient-to-r from-[#0084ff] to-[#0051ba] text-white shadow-md shadow-[#0084ff]/15 scale-[1.01]'
                    : 'text-zinc-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <MessageSquare size={14} />
                <span>Obrolan</span>
                {unreadMessagesCount > 0 && (
                  <span className="absolute right-2.5 top-2 bg-red-600 text-[8px] text-white font-black px-1.5 py-0.5 rounded-full border border-zinc-950 min-w-4 text-center leading-none">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>

              {/* 3. UPLOAD/SELL tag element */}
              <button
                onClick={() => {
                  setActiveTab('upload');
                  setOverrideDevChatId(null);
                }}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl w-full text-left font-black transition-all text-[11px] tracking-tight select-none cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-gradient-to-r from-[#0084ff] to-[#0051ba] text-white shadow-md shadow-[#0084ff]/15 scale-[1.01]'
                    : 'text-zinc-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <PlusCircle size={14} />
                <span>Jual Item</span>
              </button>

              {/* 4. HISTORY transaction tag element */}
              <button
                onClick={() => {
                  setActiveTab('history');
                  setOverrideDevChatId(null);
                }}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl w-full text-left font-black transition-all text-[11px] tracking-tight select-none cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-gradient-to-r from-[#0084ff] to-[#0051ba] text-white shadow-md shadow-[#0084ff]/15 scale-[1.01]'
                    : 'text-zinc-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <History size={14} />
                <span>Riwayat</span>
              </button>

              {/* 5. PROFILE tag element */}
              <button
                onClick={() => {
                  setActiveTab('profile');
                  setOverrideDevChatId(null);
                }}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl w-full text-left font-black transition-all text-[11px] tracking-tight select-none cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-gradient-to-r from-[#0084ff] to-[#0051ba] text-white shadow-md shadow-[#0084ff]/15 scale-[1.01]'
                    : 'text-zinc-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="w-3.5 h-3.5 rounded-full overflow-hidden border border-zinc-500 shrink-0">
                  {currentUser.profilePic ? (
                    <img src={currentUser.profilePic} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                  ) : (
                    <UserIcon size={8} className="text-zinc-450 mx-auto" />
                  )}
                </div>
                <span>Profil Saya</span>
              </button>

              {/* 6. DEV PANEL tag element (Show only if developer/admin) */}
              {(currentUser.role === 'developer' || currentUser.role === 'admin') && (
                <button
                  onClick={() => {
                    setActiveTab('developer');
                    setOverrideDevChatId(null);
                  }}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl w-full text-left font-black transition-all text-[11px] tracking-widest select-none cursor-pointer uppercase ${
                    activeTab === 'developer'
                      ? 'bg-gradient-to-r from-[#0084ff] to-[#0051ba] text-white shadow-md shadow-[#0084ff]/15 scale-[1.01]'
                      : 'text-[#0084ff] hover:bg-[#0084ff]/20 hover:text-white'
                  }`}
                >
                  <Shield size={14} />
                  <span>Dev Panel</span>
                </button>
              )}
            </div>

            {/* COMMUNITY & SUPPORT LINKS PORTION */}
            <div className="flex flex-col gap-0.5 pt-3 mt-auto border-t border-[#0084ff]/20">
              <p className="text-[8px] text-zinc-450 font-black uppercase tracking-widest px-2.5 mb-1 leading-none">Bantuan & Layanan</p>

              {/* 1. Support (Saweria) */}
              <a
                href="https://saweria.co/Waast"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-white/5 text-zinc-300 hover:text-white rounded-xl text-[10.5px] font-semibold transition-all"
              >
                <Heart size={13} className="text-red-500 fill-red-500" />
                <span>Support</span>
              </a>

              {/* 2. Discord Server CS */}
              <a
                href="https://discord.gg/kQPXrnSbuH"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-white/5 text-zinc-300 hover:text-white rounded-xl text-[10.5px] font-semibold transition-all"
              >
                <Headphones size={13} className="text-indigo-400" />
                <span>Discord Server (CS)</span>
              </a>

              {/* SPECIAL EXPLICIT DIVIDER: "tambahan di beri garis pembatas di bawah nya support dan CS" */}
              <div className="border-t border-[#0084ff]/15 my-1.5" />

              {/* 3. Account options (Login/Logout) */}
              {currentUser?.id === 'u_guest' ? (
                <button
                  onClick={() => setForceAuthScreen(true)}
                  className="flex items-center gap-2 px-2.5 py-1.5 bg-[#0084ff]/10 hover:bg-[#0084ff]/20 text-left w-full text-[#0084ff] hover:text-[#39a0ff] rounded-xl text-[10.5px] font-black transition-all"
                >
                  <LogIn size={13} />
                  <span>Masuk / Daftar</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-red-500/10 text-left w-full text-red-400 hover:text-red-350 rounded-xl text-[10.5px] font-black transition-all"
                >
                  <LogOut size={13} />
                  <span>Keluar Akun</span>
                </button>
              )}
            </div>
          </aside>

          {/* MAIN PAGE WORKSPACE CLIENT VIEWPORT */}
          <main className="flex-grow p-4 sm:p-6 lg:p-8 space-y-6 min-w-0 pb-44 overflow-y-auto">
            
            {/* STYLIZED 2-BANNER PROMO SLIDER WITH ADAPTIVE DEVICE LAYOUT - ONLY IN BERANDA (HOME) */}
            {activeTab === 'home' && !activeProductId && banner && banner.length > 0 && (
              <div className="max-w-full w-full mx-auto mt-1 mb-4 sm:mb-6 animate-fade-in">
                <PromoSlider banners={banner} />
              </div>
            )}

            {/* MAIN PORTAL SPACE CONTENT */}
            <div className="w-full space-y-6">
            {/* VIEW TAB 1: HOME CATALOG SPLASH */}
            {activeTab === 'home' && (
              <div className="space-y-6">
                
                {/* TOP SEARCH BAR ROW WITH CONSOLIDATED FILTERS TOGGLE BUTTON (WITH 'GARIS 3' ICON ON THE RIGHT) */}
                <div className="flex items-center gap-2">
                  
                  {/* SEARCH BAR POPUP TRIGGER (As requested: "search bar nya menu pop up") */}
                  <div 
                    onClick={() => setIsSearchModalOpen(true)}
                    className="flex-1 relative cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-855 hover:border-zinc-800 rounded-2xl px-4 py-3 shadow-lg transition-all font-semibold select-none">
                      <Search size={15} className="text-zinc-500 shrink-0 group-hover:text-[#0084ff] transition-colors" />
                      <div className="flex-1 text-[11px] sm:text-xs text-zinc-500">
                        {searchQuery ? (
                          <span className="text-zinc-200">Hasil pencarian: <strong className="text-[#0084ff] font-bold">"{searchQuery}"</strong></span>
                        ) : (
                          <span>Cari game, produk, atau jasa disini...</span>
                        )}
                      </div>
                      {searchQuery && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSearchQuery('');
                          }}
                          className="p-1 text-zinc-450 hover:text-white bg-zinc-805 hover:bg-zinc-750 rounded-full w-5 h-5 flex items-center justify-center text-[10px]"
                          title="Hapus Pencarian"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* PRICE & SORT COMPACT DROPDOWN TOGGLER - "pindahkan ke samping kanan search bar dengan logo nya garis 3" */}
                  <div className="relative">
                    <button
                      onClick={() => setIsPriceFilterOpen(!isPriceFilterOpen)}
                      className={`p-3 border rounded-2xl transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-95 ${
                        isPriceFilterOpen || minPrice || maxPrice || sortBy !== 'latest'
                          ? 'bg-[#0084ff] border-[#39a0ff] text-white shadow-[0_0_12px_rgba(0,132,255,0.35)]'
                          : 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-white hover:bg-zinc-800'
                      }`}
                      title="Saring Berdasarkan Rentang Harga & Urutan (Garis 3)"
                    >
                      <SlidersHorizontal size={16} />
                    </button>

                    {/* Compact Filter Options Dropdown Portal */}
                    {isPriceFilterOpen && (
                      <>
                        <div className="fixed inset-0 z-40 bg-transparent cursor-default" onClick={() => setIsPriceFilterOpen(false)} />
                        <div className="absolute right-0 top-14 w-80 bg-zinc-950 border border-zinc-850 rounded-2xl shadow-2xl p-4 z-50 flex flex-col gap-4 anim-slide-in">
                          <div className="flex items-center justify-between pb-1 border-b border-zinc-900">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">PROPERTIS SARINGAN</span>
                            {(minPrice !== '' || maxPrice !== '' || sortBy !== 'latest') && (
                              <button
                                onClick={() => {
                                  setMinPrice('');
                                  setMaxPrice('');
                                  setSortBy('latest');
                                }}
                                className="text-[9px] text-red-400 font-extrabold uppercase hover:underline"
                              >
                                Bersihkan Filter
                              </button>
                            )}
                          </div>

                          {/* Range Inputs */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">Rentang Harga (Rp)</label>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="number"
                                placeholder="Harga Terendah"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none focus:border-[#0084ff] font-mono placeholder-zinc-650"
                              />
                               <input
                                 type="number"
                                 placeholder="Harga Tertinggi"
                                 value={maxPrice}
                                 onChange={(e) => setMaxPrice(e.target.value)}
                                 className="w-full bg-zinc-900 border border-[#0084ff]/30 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none focus:border-[#0084ff] font-mono placeholder-zinc-650"
                               />
                             </div>
                           </div>

                           {/* Sort Mode dropdown */}
                           <div className="space-y-1.5">
                             <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">Urutkan Koleksi</label>
                             <select
                               value={sortBy}
                               onChange={(e) => setSortBy(e.target.value as any)}
                               className="w-full bg-zinc-900 border border-zinc-900 rounded-xl px-3 py-2 text-xs text-zinc-200 font-black outline-none focus:border-[#0084ff] select-none"
                             >
                               <option value="latest">Terbaru Terdaftar</option>
                               <option value="cheapest">Harga Termurah (Rp ↑)</option>
                               <option value="expensive">Harga Termahal (Rp ↓)</option>
                             </select>
                           </div>
                        </div>
                       </>
                     )}
                   </div>

                 </div>





                 {/* 
                   HORIZONTAL SCROLLING CATEGORIES WRAPPER (OUTLINE ORANGE AS REQUESTED)
                   - Placed right below search bar & banner as replacement feed
                 */}
                 <div className="space-y-2 pt-0.5 pb-2">
                   <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
                     {(['Semua', 'Robux', 'Item', 'GIG', 'Akun', 'Lainnya'] as const).map((cat) => (
                       <button
                         key={cat}
                         onClick={() => setSelectedCategory(cat)}
                         className={`text-[10px] sm:text-xs px-4 py-2 rounded-xl transition-all duration-200 shrink-0 ${
                           selectedCategory === cat
                             ? 'bg-[#0084ff] text-white shadow-md font-extrabold'
                            : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-850 font-extrabold'
                         }`}
                       >
                         {cat}
                       </button>
                     ))}
                   </div>
                 </div>

                {/* Grid collection display */}
                <div className="grid grid-cols-2 min-[420px]:grid-cols-3 min-[580px]:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2 sm:gap-3">
                  {(() => {
                    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
                    const itemsPerPage = isMobile ? 30 : 50;
                    const startIndex = (homePage - 1) * itemsPerPage;
                    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
                  })().map((p) => {
                    const sel = getProductSeller(p.sellerId);
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setActiveProductId(p.id);
                          setActiveTab('detail');
                        }}
                        className="group bg-[#131315] rounded-[18px] border-[2.5px] border-zinc-900 overflow-hidden cursor-pointer transition-all duration-300 hover:border-zinc-800 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between"
                      >
                        {/* WIDESCREEN ASPECT IMAGE (Matches photo 1 style ratio) */}
                        <div className="relative aspect-[16/9] w-full overflow-hidden flex items-center justify-center keep-bg-dark">
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
                                 referrerPolicy="no-referrer"
                               />
                            )
                          )}
                          
                          {p.stock === 0 && (
                            <div className="absolute inset-0 keep-sold-out-overlay flex items-center justify-center z-10">
                              <span className="px-2.5 py-1.5 keep-sold-out-badge rounded-lg text-[9px] uppercase tracking-widest leading-none shadow-md">
                                SOLD OUT
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Text Information block matching layout 1 */}
                        <div className="p-3.5 flex-1 flex flex-col justify-between gap-2 bg-[#131315]">
                          <div>
                            {/* Title (matches bold label) */}
                            <h3 className="font-extrabold text-xs sm:text-[13px] text-zinc-100 group-hover:text-[#0084ff] transition-colors line-clamp-1 leading-snug">
                              {p.title}
                            </h3>

                            {/* Subtitle / category (matches "Robux 5 Hari") */}
                            <div className="text-[10px] text-zinc-400 font-bold mt-1">
                              {p.category}
                            </div>

                            {/* Price block - bold blue font custom size */}
                            <div className="text-sm sm:text-[15px] font-black text-[#0084ff] leading-none mt-2.5 tracking-tight">
                              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p.price)}
                            </div>


                          </div>

                          {/* Footer line with Total Terjual */}
                          <div className="flex items-center justify-between text-[10px] sm:text-[11px] select-none pt-2 border-t border-zinc-900 mt-2">
                            <span className="text-zinc-550 font-extrabold">
                              {(() => {
                                const soldQty = transactions
                                  .filter((tx) => tx.productId === p.id && tx.status === 'completed')
                                  .reduce((sum, tx) => sum + (tx.qty || 1), 0);
                                if (soldQty >= 1000) {
                                  const kValue = soldQty / 1000;
                                  const formatted = kValue.toFixed(1).replace('.', ',');
                                  const finalStr = formatted.endsWith(',0') ? `${Math.floor(kValue)}rb` : `${formatted}rb`;
                                  return `${finalStr} Terjual`;
                                }
                                return `${soldQty} Terjual`;
                              })()}
                            </span>
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

                {/* PAGINATION NUMERICAL PAGES (PC: 50 limit, Mobile: 30 limit) */}
                {(() => {
                  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
                  const itemsPerPage = isMobile ? 30 : 50;
                  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
                  if (totalPages <= 1) return null;

                  return (
                    <div className="flex items-center justify-center gap-1.5 mt-8 border-t border-zinc-900 pt-6 select-none shrink-0 flex-wrap">
                      <button
                        onClick={() => {
                          setHomePage(prev => Math.max(prev - 1, 1));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        disabled={homePage === 1}
                        className="px-3 py-1.5 rounded-xl bg-zinc-900 text-[11px] font-extrabold border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-35 disabled:pointer-events-none transition-all cursor-pointer"
                      >
                        Sebelumnya
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                        <button
                          key={pNum}
                          onClick={() => {
                            setHomePage(pNum);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-8.5 h-8.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            homePage === pNum 
                              ? 'bg-[#0084ff] text-white font-black shadow-md shadow-[#0084ff]/25 scale-105' 
                              : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:bg-zinc-850'
                          }`}
                        >
                          {pNum}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setHomePage(prev => Math.min(prev + 1, totalPages));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        disabled={homePage === totalPages}
                        className="px-3 py-1.5 rounded-xl bg-zinc-900 text-[11px] font-extrabold border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-35 disabled:pointer-events-none transition-all cursor-pointer"
                      >
                        Berikutnya
                      </button>
                    </div>
                  );
                })()}

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
                  transactions={transactions}
                  onBack={() => {
                    setActiveProductId(null);
                    setActiveTab('home');
                  }}
                  onInitiateChat={handleChatLaunch}
                  onOpenBuyModal={handleOpenBuyBox}
                  onViewUserStorefront={(userId) => setSelectedStorefrontUserId(userId)}
                  allProducts={products}
                  onSelectProduct={(productId) => setActiveProductId(productId)}
                  onDeleteProduct={handleDeleteProduct}
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
                onLogout={() => setShowLogoutConfirm(true)}
                onGoToTab={(tab) => {
                  setActiveTab(tab);
                  setOverrideDevChatId(null);
                }}
                onSwitchAccount={() => setForceAuthScreen(true)}
              />
            )}

            {/* VIEW TAB 5: CREATIVE LISTING SALES FORMS */}
            {activeTab === 'upload' && (
              currentUser.id === 'u_guest' ? (
                /* GUEST NOT ALLOWED TO UPLOAD GATED VIEW */
                <div className="max-w-md mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl relative text-center space-y-6">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-amber-500" />
                  
                  <div className="flex flex-col items-center text-center space-y-4 mb-3 pt-4">
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-full text-primary shrink-0 animate-bounce">
                      <ShoppingBag size={32} />
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-zinc-100 uppercase tracking-tight font-sans">
                      Unggah / Jual Produk
                    </h2>
                    <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
                      Anda saat ini masuk menggunakan <span className="text-primary font-black">Profil Guest</span>. Untuk mulai menjual item game, Robux, akun, atau jasa di pasar WAST, Anda diwajibkan masuk ke akun penjual resmi terlebih dahulu.
                    </p>
                  </div>

                  <button
                    onClick={() => setForceAuthScreen(true)}
                    className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-black text-xs sm:text-sm tracking-tight transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-md mt-2 cursor-pointer"
                  >
                    Masuk atau Daftar Akun Sekarang
                  </button>
                </div>
              ) : currentUser.role !== 'seller' && currentUser.role !== 'admin' && currentUser.role !== 'developer' ? (
                /* SELLER REGISTRATION GATED VIEW */
                <div className="max-w-md mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0084ff] to-[#0055ff]" />
                  
                  <div className="flex flex-col items-center text-center space-y-4 mb-6">
                    <div className="p-4 bg-[#0084ff]/10 border border-[#0084ff]/20 rounded-full text-[#0084ff] shrink-0 animate-bounce">
                      <Mail size={32} />
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-zinc-100 uppercase tracking-tight font-sans">
                      Daftar Sebagai Penjual
                    </h2>
                    <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
                      Untuk mulai menjual barang atau jasa di <span className="text-[#0084ff] font-extrabold">WAST Marketplace</span>, Anda diwajibkan mendaftar sebagai penjual resmi dengan mencantumkan alamat email aktif Anda.
                    </p>
                  </div>

                  <form onSubmit={handleRegisterAsSellerSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-400 font-bold">Username Anda</label>
                      <input
                        type="text"
                        disabled
                        value={currentUser.username}
                        className="w-full bg-zinc-950/60 border border-zinc-850/60 rounded-xl py-2.5 px-4 text-xs font-semibold text-zinc-500 outline-none cursor-not-allowed select-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-[#0084ff] font-extrabold flex items-center gap-1">
                        <Mail size={12} />
                        Alamat Email Aktif <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="Contoh: namaanda@gmail.com"
                        value={sellerRegEmail}
                        onChange={(e) => setSellerRegEmail(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 text-xs sm:text-sm p-3 rounded-xl text-zinc-200 outline-none focus:border-[#0084ff] font-bold"
                      />
                      <p className="text-[10px] text-zinc-500 leading-normal font-semibold">
                        Kami akan menggunakan email ini untuk mengirimkan update transaksi, bantuan teknis, serta komunikasi resmi.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#0084ff] hover:bg-blue-600 text-white py-3 rounded-xl font-black text-xs sm:text-sm tracking-tight transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-md mt-2 cursor-pointer"
                    >
                      Daftar Sebagai Penjual
                    </button>
                  </form>

                  <div className="mt-8 border-t border-zinc-800/60 pt-5 flex flex-col items-center text-center space-y-2">
                    <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">Butuh bantuan?</p>
                    <a
                      href="https://discord.gg/kQPXrnSbuH"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full px-5 py-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 hover:text-indigo-300 font-extrabold text-xs rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Headphones size={13} />
                      Hubungi CS (Discord)
                    </a>
                  </div>
                </div>
              ) : (
                /* STANDARD CREATE/EDIT PRODUCT VIEW - SCROLL LIMIT */
                <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-6 shadow-2xl relative flex flex-col max-h-[80vh] overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-amber-500" />
                  
                  <h2 className="text-xl md:text-2xl font-black text-zinc-100 flex items-center gap-2 mb-1.5 shrink-0">
                    <Plus size={22} className="text-primary" />
                    {editingProduct ? 'Ubah Informasi Jualan Anda' : 'Buat Jualan Baru'}
                  </h2>
                  <p className="text-xs text-zinc-500 mb-4 font-semibold shrink-0">
                    Isi informasi produk dengan jujur & tawarkan bantuan terbaik kepada pembeli WAST.
                  </p>

                  <div className="flex-grow overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
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
                    <div className="border-t border-zinc-800 pt-5 space-y-3">
                      <label className="text-xs text-zinc-400 font-bold flex justify-between items-center px-1">
                        <span>Unggah Gambar / Video Barang (Minimal 1)</span>
                        <span className="text-[10px] text-zinc-500 font-semibold">Tipe: JPG, PNG, MP4, WEBM</span>
                      </label>
                      
                      {/* Custom Drag and Drop Area */}
                      <div
                        onClick={() => productFileInputRef.current?.click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingGoodsMedia(true);
                        }}
                        onDragLeave={() => setIsDraggingGoodsMedia(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingGoodsMedia(false);
                          const files = e.dataTransfer.files;
                          if (files && files.length > 0) {
                            const base64List = [...formImages];
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
                        }}
                        className={`group relative flex flex-col items-center justify-center p-8 bg-zinc-950/40 border-2 border-dashed ${
                          isDraggingGoodsMedia 
                            ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5' 
                            : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-950/80'
                        } rounded-2xl cursor-pointer select-none transition-all duration-300 text-center space-y-3`}
                      >
                        <input
                          ref={productFileInputRef}
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          onChange={handleProductUploadPics}
                          className="hidden"
                        />
                        
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 group-hover:border-zinc-700 flex items-center justify-center text-zinc-400 group-hover:text-primary transition-colors shadow-inner animate-pulse">
                          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-xs text-zinc-200 font-bold">
                          Drop & drag your photos/videos here <span className="text-primary hover:underline">Klik untuk unggah</span>
                          </p>
                          <p className="text-[10px] text-zinc-500 font-semibold">
                            Mendukung unggahan media sekaligus (Gambar & Video)
                          </p>
                        </div>
                      </div>

                      {/* Prominent high-fidelity custom thumbnails list */}
                      {formImages.length > 0 && (
                        <div className="space-y-2 pt-1.5 animate-fade-in">
                          <p className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider px-1">
                            Media Terunggah ({formImages.length})
                          </p>
                          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                            {formImages.map((img, index) => (
                              <div 
                                key={index} 
                                className="relative group/thumb aspect-square rounded-2xl overflow-hidden border border-zinc-800 bg-black flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                              >
                                {isVideoVal(img) ? (
                                  <video src={img} className="w-full h-full object-cover pointer-events-none" muted playsInline />
                                ) : (
                                  <img src={img} className="w-full h-full object-cover" alt="" />
                                )}
                                
                                {/* Overlay to delete on hover */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity duration-200">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setFormImages(formImages.filter((_, idx) => idx !== index));
                                    }}
                                    className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg transition-all transform scale-75 group-hover/thumb:scale-100 duration-200 text-xs font-black cursor-pointer"
                                    title="Hapus media ini"
                                  >
                                    Hapus
                                  </button>
                                </div>

                                <div className="absolute bottom-1 left-1.5 bg-black/75 px-1.5 py-0.5 rounded text-[8px] font-bold text-zinc-400">
                                  {index + 1}
                                </div>
                              </div>
                            ))}
                          </div>
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
                        className="px-5 py-2.5 bg-zinc-955 border border-zinc-850 hover:bg-zinc-800 rounded-xl text-xs font-bold text-zinc-300 transition-all font-semibold"
                      >
                        Batalkan
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#0084ff] hover:bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-black transition-all shadow-lg active:scale-95"
                      >
                        {editingProduct ? 'Simpan Perubahan postingan' : 'Posting ke Marketplace'}
                      </button>
                    </div>
                  </form>
                  </div>

                  {/* Assistive footer */}
                  <div className="mt-6 border-t border-zinc-850 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                    <div>
                      <p className="text-xs text-zinc-400 font-bold flex items-center justify-center sm:justify-start gap-1">
                        <span>Butuh bantuan?</span>
                      </p>
                      <p className="text-[10px] text-zinc-550 mt-0.5">Kami siap mendampingi Anda jika terdapat kendala dalam menjual barang.</p>
                    </div>
                    <a
                      href="https://discord.gg/kQPXrnSbuH"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-zinc-955 hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-700 text-xs font-semibold text-zinc-350 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Headphones size={13} className="text-[#0084ff]" />
                      Hubungi CS (Discord)
                    </a>
                  </div>
                </div>
              )
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
                onSelectProduct={(productId) => {
                  setActiveProductId(productId);
                  setActiveTab('detail');
                }}
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
                      Temukan dan jelajahi etalase jualan para pencari nafkah premium WAST.
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
                banner={banner}
                onUpdateBanner={handleUpdateBanner}
                onUpdateUserBalance={handleUpdateUserBalance}
                onResetDatabase={handleResetDatabase}
              />
            )}

            </div>
          </main>
        </div>
      )}

      {/* FOOTER - Hidden in chat tab and auth gate, Logo stands above text */}
      {activeTab !== 'chats' && !forceAuthScreen && (
        <footer className="border-t border-zinc-900 bg-zinc-950 py-8 px-4 text-center mt-12">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex flex-col items-center justify-center gap-2">
              <SVGLogo size={70} variant="bear" />
            </div>
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed mt-2">
              WAST adalah platform marketplace premium terpercaya untuk item in-game, Robux aman, dan Gift In Game. Semua transaksi ditata dengan kepatuhan tinggi serta jaminan kasir handshake.
            </p>
            <div className="text-[10px] text-zinc-700">
              &copy; {new Date().getFullYear()} WAST. Hak Cipta Dilindungi Undang-Undang.
            </div>
          </div>
        </footer>
      )}

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
                Apakah Anda benar-benar yakin ingin keluar dari akun WAST Anda saat ini?
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

      {/* POPUP SEARCH MODAL (As requested: "search bar nya menu pop up") */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-black/85 flex items-start justify-center z-50 p-4 pt-16 sm:pt-24 backdrop-blur-md transition-all animate-fade-in overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xl p-5 space-y-4 animate-scale-up shadow-2xl relative">
            
            {/* Header / Input controls */}
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2.5 bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-3 focus-within:border-primary transition-all">
                <Search size={16} className="text-zinc-500" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Ketik nama game, kategori, atau deskripsi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:outline-none focus:ring-0"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-zinc-405 hover:text-white bg-zinc-850 rounded-full w-4.5 h-4.5 flex items-center justify-center text-[10px]"
                  >
                    ✕
                  </button>
                )}
              </div>
              
              <button
                onClick={() => setIsSearchModalOpen(false)}
                className="px-3.5 py-3.5 bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded-2xl text-xs font-black border border-zinc-850 cursor-pointer active:scale-95 transition-all"
              >
                Tutup
              </button>
            </div>

            {/* Quick suggestions */}
            <div className="space-y-1.5">
              <p className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest block animate-pulse">Pencarian Populer</p>
              <div className="flex flex-wrap gap-1.5">
                {['Robux', 'Item', 'GIG', 'Pedang', 'Akun', 'Premium'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-primary border border-zinc-850/60 rounded-xl text-[10px] font-bold transition-all"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Listed dynamic matched suggestions */}
            <div className="pt-2 border-t border-zinc-850">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest">
                  Hasil Pencarian ({filteredProducts.length})
                </span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-[9px] text-primary hover:underline font-extrabold uppercase"
                  >
                    Reset Filter
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500 space-y-2">
                    <p className="text-xs font-semibold">Tidak menemukan produk yang cocok.</p>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-655">Coba kata kunci lain atau periksa ejaan Anda</p>
                  </div>
                ) : (
                  filteredProducts.map((p) => {
                    const sel = getProductSeller(p.sellerId);
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setActiveProductId(p.id);
                          setActiveTab('detail');
                          setIsSearchModalOpen(false);
                        }}
                        className="flex gap-3 bg-zinc-950/40 hover:bg-zinc-850 border border-zinc-850/40 hover:border-zinc-800 p-2.5 rounded-2xl cursor-pointer transition-all duration-200 group active:scale-[0.98]"
                      >
                        {/* Image view */}
                        <div className="w-12 h-12 rounded-xl border border-zinc-800 overflow-hidden shrink-0 keep-bg-dark">
                          {p.images && p.images[0] ? (
                            <img src={p.images[0]} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-all" alt={p.title} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-650">
                              <ShoppingBag size={14} />
                            </div>
                          )}
                        </div>

                        {/* Text view info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[8.5px] font-black px-1.5 py-0.2 uppercase tracking-wide rounded-md bg-zinc-950 border border-zinc-850 text-zinc-400">
                                {p.category}
                              </span>
                              {sel?.verified && (
                                <span className="flex items-center gap-0.5 text-[8.5px] font-bold text-[#10b981] bg-[#10b981]/10 px-1 py-0.2 rounded-md">
                                  <BadgeCheck size={9} />
                                  <span>VERIFIED</span>
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs font-black text-zinc-200 group-hover:text-primary transition-colors truncate">
                              {p.title}
                            </h4>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-[#10b981]">
                              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p.price)}
                            </span>
                            <span className="text-[9px] text-zinc-500 font-black">
                              STOK: {p.stock}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>
      )}



    </div>
  );
}
