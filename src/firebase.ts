import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs, 
  writeBatch 
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { User, Product, Transaction, ChatMessage, BannerConfig } from './types';
import { INITIAL_USERS, INITIAL_PRODUCTS, INITIAL_TRANSACTIONS, INITIAL_CHATS } from './data/mockData';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const storage = getStorage(app);

// Core Local Handling for Zero-Crash Offline Fallback
export function getCachedList<T>(key: string, fallback: T[]): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    return fallback;
  }
}

export function saveCachedList<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    // Ignore error
  }
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.warn('Firestore Non-Fatal Warning: ', JSON.stringify(errInfo));
}

const defaultBanners: BannerConfig[] = [];

// Seeding engine
let hasSeeded = false;
let isSeeding = false;

async function ensureSeeded() {
  if (hasSeeded || isSeeding) return;
  isSeeding = true;
  try {
    const snap = await getDocs(collection(db, 'users'));
    if (snap.empty) {
      console.log('Seeding initial data to Firestore...');
      const batch = writeBatch(db);
      
      INITIAL_USERS.forEach((u) => {
        batch.set(doc(db, 'users', u.id), u);
      });
      
      INITIAL_PRODUCTS.forEach((p) => {
        batch.set(doc(db, 'products', String(p.id)), p);
      });
      
      INITIAL_TRANSACTIONS.forEach((t) => {
        batch.set(doc(db, 'transactions', t.id), t);
      });
      
      INITIAL_CHATS.forEach((c) => {
        batch.set(doc(db, 'chats', c.id), c);
      });
      
      defaultBanners.forEach((b) => {
        batch.set(doc(db, 'banner', b.id), b);
      });
      
      await batch.commit();
      console.log('Successfully seeded Firestore data!');
    }
    hasSeeded = true;
  } catch (err) {
    console.warn('Silent seeding error (skipping or already seeded):', err);
  } finally {
    isSeeding = false;
  }
}

// REALTIME SUBSCRIPTION LISTENERS GATES WITH ZERO-CRASH LOCAL STORAGE FAILSAFE

export const syncUsers = (callback: (users: User[]) => void) => {
  ensureSeeded().catch(() => {});
  
  // Set initial callback from local storage cache to keep interface fast and robust
  const fallbackList = getCachedList('_fs_cache_users', INITIAL_USERS);
  callback(fallbackList);

  try {
    return onSnapshot(collection(db, 'users'), (snapshot) => {
      const list: User[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as User);
      });
      if (list.length > 0) {
        saveCachedList('_fs_cache_users', list);
        callback(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
      // On permission or database load failure, serve robust local state
      callback(getCachedList('_fs_cache_users', INITIAL_USERS));
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'users');
    return () => {};
  }
};

export const syncProducts = (callback: (products: Product[]) => void) => {
  ensureSeeded().catch(() => {});
  
  const fallbackList = getCachedList('_fs_cache_products', INITIAL_PRODUCTS);
  callback(fallbackList);

  try {
    return onSnapshot(collection(db, 'products'), (snapshot) => {
      const list: Product[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as Product);
      });
      if (list.length > 0) {
        saveCachedList('_fs_cache_products', list);
        callback(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
      callback(getCachedList('_fs_cache_products', INITIAL_PRODUCTS));
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'products');
    return () => {};
  }
};

export const syncTransactions = (callback: (txs: Transaction[]) => void) => {
  ensureSeeded().catch(() => {});

  const fallbackList = getCachedList('_fs_cache_transactions', INITIAL_TRANSACTIONS);
  callback(fallbackList);

  try {
    return onSnapshot(collection(db, 'transactions'), (snapshot) => {
      const list: Transaction[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as Transaction);
      });
      if (list.length > 0) {
        saveCachedList('_fs_cache_transactions', list);
        callback(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'transactions');
      callback(getCachedList('_fs_cache_transactions', INITIAL_TRANSACTIONS));
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'transactions');
    return () => {};
  }
};

export const syncChats = (callback: (chats: ChatMessage[]) => void) => {
  ensureSeeded().catch(() => {});

  const fallbackList = getCachedList('_fs_cache_chats', INITIAL_CHATS);
  callback(fallbackList);

  try {
    return onSnapshot(collection(db, 'chats'), (snapshot) => {
      const list: ChatMessage[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as ChatMessage);
      });
      if (list.length > 0) {
        saveCachedList('_fs_cache_chats', list);
        callback(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'chats');
      callback(getCachedList('_fs_cache_chats', INITIAL_CHATS));
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'chats');
    return () => {};
  }
};

export const syncBanner = (callback: (banners: BannerConfig[]) => void) => {
  ensureSeeded().catch(() => {});

  const fallbackList = getCachedList('_fs_cache_banner', defaultBanners);
  callback(fallbackList);

  try {
    return onSnapshot(collection(db, 'banner'), (snapshot) => {
      const list: BannerConfig[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as BannerConfig);
      });
      if (list.length > 0) {
        saveCachedList('_fs_cache_banner', list);
        callback(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'banner');
      callback(getCachedList('_fs_cache_banner', defaultBanners));
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'banner');
    return () => {};
  }
};

// WRITE operations with instant local response + async Firestore tasking

export const saveUser = async (user: User) => {
  const current = getCachedList<User>('_fs_cache_users', INITIAL_USERS);
  const updated = current.filter(u => u.id !== user.id);
  updated.push(user);
  saveCachedList('_fs_cache_users', updated);

  try {
    await setDoc(doc(db, 'users', user.id), user);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.id}`);
  }
};

export const saveMultipleUsers = async (usersList: User[]) => {
  saveCachedList('_fs_cache_users', usersList);
  try {
    const batch = writeBatch(db);
    usersList.forEach((user) => {
      batch.set(doc(db, 'users', user.id), user);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'users');
  }
};

export const saveProduct = async (product: Product) => {
  const current = getCachedList<Product>('_fs_cache_products', INITIAL_PRODUCTS);
  const updated = current.filter(p => p.id !== product.id);
  updated.push(product);
  saveCachedList('_fs_cache_products', updated);

  try {
    await setDoc(doc(db, 'products', String(product.id)), product);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `products/${product.id}`);
  }
};

export const saveMultipleProducts = async (productsList: Product[]) => {
  saveCachedList('_fs_cache_products', productsList);
  try {
    const batch = writeBatch(db);
    productsList.forEach((p) => {
      batch.set(doc(db, 'products', String(p.id)), p);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'products');
  }
};

export const deleteProductDoc = async (productId: number) => {
  const current = getCachedList<Product>('_fs_cache_products', INITIAL_PRODUCTS);
  const updated = current.filter(p => p.id !== productId);
  saveCachedList('_fs_cache_products', updated);

  try {
    await deleteDoc(doc(db, 'products', String(productId)));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
  }
};

export const saveTransaction = async (tx: Transaction) => {
  const current = getCachedList<Transaction>('_fs_cache_transactions', INITIAL_TRANSACTIONS);
  const updated = current.filter(t => t.id !== tx.id);
  updated.push(tx);
  saveCachedList('_fs_cache_transactions', updated);

  try {
    await setDoc(doc(db, 'transactions', tx.id), tx);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `transactions/${tx.id}`);
  }
};

export const saveMultipleTransactions = async (txsList: Transaction[]) => {
  saveCachedList('_fs_cache_transactions', txsList);
  try {
    const batch = writeBatch(db);
    txsList.forEach((tx) => {
      batch.set(doc(db, 'transactions', tx.id), tx);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'transactions');
  }
};

export const saveChat = async (chat: ChatMessage) => {
  const current = getCachedList<ChatMessage>('_fs_cache_chats', INITIAL_CHATS);
  const updated = current.filter(c => c.id !== chat.id);
  updated.push(chat);
  saveCachedList('_fs_cache_chats', updated);

  try {
    await setDoc(doc(db, 'chats', chat.id), chat);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `chats/${chat.id}`);
  }
};

export const saveMultipleChats = async (chatsList: ChatMessage[]) => {
  saveCachedList('_fs_cache_chats', chatsList);
  try {
    const batch = writeBatch(db);
    chatsList.forEach((chat) => {
      batch.set(doc(db, 'chats', chat.id), chat);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'chats');
  }
};

export const saveBanner = async (banner: BannerConfig | BannerConfig[]) => {
  const current = getCachedList<BannerConfig>('_fs_cache_banner', defaultBanners);
  
  let updated = Array.isArray(banner) ? banner : [...current.filter(x => x.id !== banner.id), banner];
  saveCachedList('_fs_cache_banner', updated);

  try {
    if (Array.isArray(banner)) {
      const snap = await getDocs(collection(db, 'banner'));
      const batch = writeBatch(db);
      
      snap.docs.forEach((d) => {
        const id = d.id;
        const exists = banner.some((b) => b.id === id);
        if (!exists) {
          batch.delete(doc(db, 'banner', id));
        }
      });

      banner.forEach((b) => {
        batch.set(doc(db, 'banner', b.id), b);
      });
      await batch.commit();
    } else {
      await setDoc(doc(db, 'banner', banner.id), banner);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'banner');
  }
};

/**
 * Mengunggah file (foto atau video) ke Firebase Storage dan mengembalikan URL download-nya.
 * @param file Objek File dari browser
 * @param folder Direktori target di Storage (contoh: 'profile_pics', 'chat_media')
 * @returns Promise berisi URL publik file yang berhasil diunggah
 */
export const uploadFileToStorage = async (file: File, folder: string = 'media'): Promise<string> => {
  try {
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const storageRef = ref(storage, `${folder}/${timestamp}_${sanitizedName}`);
    
    // Unggah file secara langsung
    const snapshot = await uploadBytes(storageRef, file);
    
    // Dapatkan URL download publik
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.error('Gagal mengunggah file ke Firebase Storage:', error);
    throw error;
  }
};

export const clearAllExceptUsers = async () => {
  saveCachedList('_fs_cache_products', []);
  saveCachedList('_fs_cache_transactions', []);
  saveCachedList('_fs_cache_chats', []);
  saveCachedList('_fs_cache_banner', []);

  try {
    const batch = writeBatch(db);

    const prodSnap = await getDocs(collection(db, 'products'));
    prodSnap.docs.forEach((d) => {
      batch.delete(doc(db, 'products', d.id));
    });

    const txSnap = await getDocs(collection(db, 'transactions'));
    txSnap.docs.forEach((d) => {
      batch.delete(doc(db, 'transactions', d.id));
    });

    const chatSnap = await getDocs(collection(db, 'chats'));
    chatSnap.docs.forEach((d) => {
      batch.delete(doc(db, 'chats', d.id));
    });

    const bannerSnap = await getDocs(collection(db, 'banner'));
    bannerSnap.docs.forEach((d) => {
      batch.delete(doc(db, 'banner', d.id));
    });

    await batch.commit();
    console.log('Database cleared completely (except users)!');
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, 'all-except-users');
    throw err;
  }
};
