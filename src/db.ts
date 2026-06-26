import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  deleteDoc, 
  writeBatch,
  getDocs,
  query
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { User, Product, Transaction, ChatMessage, BannerConfig } from './types';
import { INITIAL_USERS, INITIAL_PRODUCTS, INITIAL_TRANSACTIONS, INITIAL_CHATS } from './data/mockData';

// Core Local Handling for zero-crash offline and loading fallbacks
export function getCachedList<T>(key: string, fallback: T[]): T[] {
  try {
    const cached = localStorage.getItem(key);
    if (cached) return JSON.parse(cached);
  } catch (err) {
    console.warn(`Failed to parse cache for ${key}`, err);
  }
  return fallback;
}

export function saveCachedList<T>(key: string, data: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Failed to save cache for ${key}`, err);
  }
}

let hasSeededFirebase = false;
let isSeedingFirebase = false;

export async function ensureSeededFirebase() {
  if (hasSeededFirebase || isSeedingFirebase) return;
  isSeedingFirebase = true;
  try {
    const usersSnap = await getDocs(query(collection(db, 'users')));
    if (usersSnap.empty) {
      console.log('Seeding initial data to Firebase...');
      const batch = writeBatch(db);
      
      INITIAL_USERS.forEach(u => batch.set(doc(db, 'users', String(u.id)), u));
      INITIAL_PRODUCTS.forEach(p => batch.set(doc(db, 'products', String(p.id)), p));
      INITIAL_TRANSACTIONS.forEach(t => batch.set(doc(db, 'transactions', String(t.id)), t));
      INITIAL_CHATS.forEach(c => batch.set(doc(db, 'chats', String(c.id)), c));
      
      await batch.commit();
      console.log('Successfully seeded Firebase with initial tables!');
    }
    hasSeededFirebase = true;
  } catch (err) {
    console.warn('Silent Firebase seeding warning:', err);
  } finally {
    isSeedingFirebase = false;
  }
}

export const syncUsers = (callback: (users: User[]) => void) => {
  ensureSeededFirebase().catch(() => {});
  callback(getCachedList('_fs_cache_users', INITIAL_USERS));

  const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
    const uList = snapshot.docs.map(doc => doc.data() as User);
    saveCachedList('_fs_cache_users', uList);
    callback(uList);
  });

  return unsubscribe;
};

export const syncProducts = (callback: (products: Product[]) => void) => {
  ensureSeededFirebase().catch(() => {});
  callback(getCachedList('_fs_cache_products', INITIAL_PRODUCTS));

  const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
    const pList = snapshot.docs.map(doc => doc.data() as Product);
    saveCachedList('_fs_cache_products', pList);
    callback(pList);
  });

  return unsubscribe;
};

export const syncTransactions = (callback: (txs: Transaction[]) => void) => {
  ensureSeededFirebase().catch(() => {});
  callback(getCachedList('_fs_cache_transactions', INITIAL_TRANSACTIONS));

  const unsubscribe = onSnapshot(collection(db, 'transactions'), (snapshot) => {
    const tList = snapshot.docs.map(doc => doc.data() as Transaction);
    saveCachedList('_fs_cache_transactions', tList);
    callback(tList);
  });

  return unsubscribe;
};

export const syncChats = (callback: (chats: ChatMessage[]) => void) => {
  ensureSeededFirebase().catch(() => {});
  callback(getCachedList('_fs_cache_chats', INITIAL_CHATS));

  const unsubscribe = onSnapshot(collection(db, 'chats'), (snapshot) => {
    const cList = snapshot.docs.map(doc => doc.data() as ChatMessage);
    saveCachedList('_fs_cache_chats', cList);
    callback(cList);
  });

  return unsubscribe;
};

const defaultBanners: BannerConfig[] = [
  {
    id: 'b1',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    title: 'PROMO WAST SPESIAL',
    subtitle: 'Dapatkan penawaran terbaik untuk berbagai produk di sini',
    buttonText: 'Beli Sekarang',
    buttonLink: '#',
    bgColor: '#002966',
    accentColor: '#3b82f6',
    titleColor: '#ffffff',
    subtitleColor: '#93c5fd'
  }
];

export const syncBanner = (callback: (banners: BannerConfig[]) => void) => {
  callback(getCachedList('_fs_cache_banner', defaultBanners));

  const unsubscribe = onSnapshot(collection(db, 'banner'), (snapshot) => {
    if (!snapshot.empty) {
      const bList = snapshot.docs.map(doc => doc.data() as BannerConfig);
      saveCachedList('_fs_cache_banner', bList);
      callback(bList);
    } else {
      callback(defaultBanners);
    }
  });

  return unsubscribe;
};

export const syncLogo = (callback: (logoUrl: string | null) => void) => {
  // Get initial value
  callback(localStorage.getItem('wast_custom_logo'));

  const unsubscribe = onSnapshot(doc(db, 'branding', 'branding'), (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data.logoUrl !== undefined) {
        localStorage.setItem('wast_custom_logo', data.logoUrl || '');
        window.dispatchEvent(new Event('wast_logo_changed'));
      }
      if (data.title !== undefined) {
        localStorage.setItem('wast_custom_title', data.title || '');
        window.dispatchEvent(new Event('wast_title_changed'));
      }
      if (data.titleColor !== undefined) {
        localStorage.setItem('wast_custom_title_color', data.titleColor || '');
      }
      if (data.textColor !== undefined) {
        localStorage.setItem('wast_custom_text_color', data.textColor || '');
      }
      if (data.themeColor !== undefined) {
        localStorage.setItem('wast_custom_theme_color', data.themeColor || '');
      }
      window.dispatchEvent(new Event('wast_branding_colors_changed'));
      callback(data.logoUrl || null);
    }
  });

  return unsubscribe;
};

// --- WRITE OPERATIONS ---

export const saveUser = async (user: User) => {
  const current = getCachedList<User>('_fs_cache_users', INITIAL_USERS);
  const updated = current.filter(u => u.id !== user.id);
  updated.push(user);
  saveCachedList('_fs_cache_users', updated);

  await setDoc(doc(db, 'users', String(user.id)), user);
};

export const saveMultipleUsers = async (usersList: User[]) => {
  const batch = writeBatch(db);
  usersList.forEach(user => batch.set(doc(db, 'users', String(user.id)), user));
  await batch.commit();
};

export const saveProduct = async (product: Product) => {
  const current = getCachedList<Product>('_fs_cache_products', INITIAL_PRODUCTS);
  const updated = current.filter(p => p.id !== product.id);
  updated.push(product);
  saveCachedList('_fs_cache_products', updated);

  await setDoc(doc(db, 'products', String(product.id)), product);
};

export const saveMultipleProducts = async (productsList: Product[]) => {
  const batch = writeBatch(db);
  productsList.forEach(product => batch.set(doc(db, 'products', String(product.id)), product));
  await batch.commit();
};

export const deleteProductDoc = async (productId: number) => {
  const current = getCachedList<Product>('_fs_cache_products', INITIAL_PRODUCTS);
  const updated = current.filter(p => p.id !== productId);
  saveCachedList('_fs_cache_products', updated);

  await deleteDoc(doc(db, 'products', String(productId)));
};

export const saveTransaction = async (tx: Transaction) => {
  const current = getCachedList<Transaction>('_fs_cache_transactions', INITIAL_TRANSACTIONS);
  const updated = current.filter(t => t.id !== tx.id);
  updated.push(tx);
  saveCachedList('_fs_cache_transactions', updated);

  await setDoc(doc(db, 'transactions', String(tx.id)), tx);
};

export const saveMultipleTransactions = async (txsList: Transaction[]) => {
  const batch = writeBatch(db);
  txsList.forEach(tx => batch.set(doc(db, 'transactions', String(tx.id)), tx));
  await batch.commit();
};

export const saveChat = async (chat: ChatMessage) => {
  const current = getCachedList<ChatMessage>('_fs_cache_chats', INITIAL_CHATS);
  const updated = current.filter(c => c.id !== chat.id);
  updated.push(chat);
  saveCachedList('_fs_cache_chats', updated);

  await setDoc(doc(db, 'chats', String(chat.id)), chat);
};

export const saveMultipleChats = async (chatsList: ChatMessage[]) => {
  const batch = writeBatch(db);
  chatsList.forEach(chat => batch.set(doc(db, 'chats', String(chat.id)), chat));
  await batch.commit();
};

export const saveBrandingInDatabase = async (updates: { logoUrl?: string | null; title?: string; titleColor?: string; textColor?: string; themeColor?: string }) => {
  // Update local storage immediately for fast local reaction
  if (updates.logoUrl !== undefined) {
    localStorage.setItem('wast_custom_logo', updates.logoUrl || '');
  }
  if (updates.title !== undefined) {
    localStorage.setItem('wast_custom_title', updates.title || '');
  }
  if (updates.titleColor !== undefined) {
    localStorage.setItem('wast_custom_title_color', updates.titleColor || '');
  }
  if (updates.textColor !== undefined) {
    localStorage.setItem('wast_custom_text_color', updates.textColor || '');
  }
  if (updates.themeColor !== undefined) {
    localStorage.setItem('wast_custom_theme_color', updates.themeColor || '');
  }
  
  // Dispatch event so UI can re-render immediately
  window.dispatchEvent(new Event('wast_branding_colors_changed'));

  await setDoc(doc(db, 'branding', 'branding'), updates, { merge: true });
};

export const saveLogoInDatabase = async (logoUrl: string | null) => {
  await saveBrandingInDatabase({ logoUrl });
};

export const saveBanner = async (banner: BannerConfig | BannerConfig[]) => {
  const current = getCachedList<BannerConfig>('_fs_cache_banner', defaultBanners);
  let updated = Array.isArray(banner) ? banner : [...current.filter(x => x.id !== banner.id), banner];
  saveCachedList('_fs_cache_banner', updated);

  if (Array.isArray(banner)) {
    const snapshot = await getDocs(collection(db, 'banner'));
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
      if (doc.id !== 'placeholder_for_non_empty') {
        batch.delete(doc.ref);
      }
    });
    banner.forEach(b => batch.set(doc(db, 'banner', String(b.id)), b));
    await batch.commit();
  } else {
    await setDoc(doc(db, 'banner', String(banner.id)), banner);
  }
};

export const uploadMedia = async (file: File, folder: string = 'uploads'): Promise<string> => {
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
  const filePath = `${folder}/${timestamp}_${sanitizedName}`;

  try {
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (err) {
    console.warn("Storage upload exception, using Base64:", err);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};

export const resetAllDataExceptOwner = async () => {
  // Clear local caches first
  saveCachedList('_fs_cache_users', []);
  saveCachedList('_fs_cache_products', []);
  saveCachedList('_fs_cache_transactions', []);
  saveCachedList('_fs_cache_chats', []);
  saveCachedList('_fs_cache_banner', []);
  
  const batch = writeBatch(db);
  
  const [products, transactions, chats, banners, users] = await Promise.all([
    getDocs(collection(db, 'products')),
    getDocs(collection(db, 'transactions')),
    getDocs(collection(db, 'chats')),
    getDocs(collection(db, 'banner')),
    getDocs(collection(db, 'users'))
  ]);

  products.docs.forEach(d => { if (d.id !== '-1') batch.delete(d.ref); });
  transactions.docs.forEach(d => { if (d.id !== 'non_existing') batch.delete(d.ref); });
  chats.docs.forEach(d => { if (d.id !== 'non_existing') batch.delete(d.ref); });
  banners.docs.forEach(d => { if (d.id !== 'non_existing') batch.delete(d.ref); });
  users.docs.forEach(d => { if (d.data().role !== 'developer') batch.delete(d.ref); });

  await batch.commit();
};
