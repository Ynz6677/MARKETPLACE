import { createClient } from '@supabase/supabase-js';
import { User, Product, Transaction, ChatMessage, BannerConfig } from './types';
import { INITIAL_USERS, INITIAL_PRODUCTS, INITIAL_TRANSACTIONS, INITIAL_CHATS } from './data/mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Safely initialize Supabase client
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Core Local Handling for zero-crash offline and loading fallbacks
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

// Seeding helper to load initial mockup data into Supabase if empty
let hasSeededSupabase = false;
let isSeedingSupabase = false;

export async function ensureSeededSupabase() {
  if (!supabase || hasSeededSupabase || isSeedingSupabase) return;
  isSeedingSupabase = true;
  try {
    const { count, error } = await supabase.from('users').select('*', { count: 'exact', head: true });
    if (!error && count === 0) {
      console.log('Seeding initial data to Supabase...');
      
      // Seed users
      await supabase.from('users').insert(INITIAL_USERS);
      
      // Seed products
      await supabase.from('products').insert(INITIAL_PRODUCTS);
      
      // Seed transactions
      await supabase.from('transactions').insert(INITIAL_TRANSACTIONS);
      
      // Seed chats
      await supabase.from('chats').insert(INITIAL_CHATS);

      console.log('Successfully seeded Supabase with initial tables!');
    }
    hasSeededSupabase = true;
  } catch (err) {
    console.warn('Silent Supabase seeding warning:', err);
  } finally {
    isSeedingSupabase = false;
  }
}

// --- SYNC / REAL-TIME SUBSCRIPTION METHODS ---

export const syncUsers = (callback: (users: User[]) => void) => {
  if (!supabase) {
    callback(getCachedList('_fs_cache_users', INITIAL_USERS));
    return () => {};
  }

  ensureSeededSupabase().catch(() => {});

  // Send cache instantly for speedy loading
  callback(getCachedList('_fs_cache_users', INITIAL_USERS));

  // Fetch from database
  supabase.from('users').select('*').then(({ data, error }) => {
    if (!error && data) {
      const uList = data as User[];
      saveCachedList('_fs_cache_users', uList);
      callback(uList);
    }
  });

  // Listen for changes
  const channel = supabase
    .channel('realtime:users')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, async () => {
      const { data } = await supabase!.from('users').select('*');
      if (data) {
        const uList = data as User[];
        saveCachedList('_fs_cache_users', uList);
        callback(uList);
      }
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const syncProducts = (callback: (products: Product[]) => void) => {
  if (!supabase) {
    callback(getCachedList('_fs_cache_products', INITIAL_PRODUCTS));
    return () => {};
  }

  ensureSeededSupabase().catch(() => {});

  callback(getCachedList('_fs_cache_products', INITIAL_PRODUCTS));

  supabase.from('products').select('*').then(({ data, error }) => {
    if (!error && data) {
      const pList = data as Product[];
      saveCachedList('_fs_cache_products', pList);
      callback(pList);
    }
  });

  const channel = supabase
    .channel('realtime:products')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, async () => {
      const { data } = await supabase!.from('products').select('*');
      if (data) {
        const pList = data as Product[];
        saveCachedList('_fs_cache_products', pList);
        callback(pList);
      }
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const syncTransactions = (callback: (txs: Transaction[]) => void) => {
  if (!supabase) {
    callback(getCachedList('_fs_cache_transactions', INITIAL_TRANSACTIONS));
    return () => {};
  }

  ensureSeededSupabase().catch(() => {});

  callback(getCachedList('_fs_cache_transactions', INITIAL_TRANSACTIONS));

  supabase.from('transactions').select('*').then(({ data, error }) => {
    if (!error && data) {
      const tList = data as Transaction[];
      saveCachedList('_fs_cache_transactions', tList);
      callback(tList);
    }
  });

  const channel = supabase
    .channel('realtime:transactions')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, async () => {
      const { data } = await supabase!.from('transactions').select('*');
      if (data) {
        const tList = data as Transaction[];
        saveCachedList('_fs_cache_transactions', tList);
        callback(tList);
      }
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const syncChats = (callback: (chats: ChatMessage[]) => void) => {
  if (!supabase) {
    callback(getCachedList('_fs_cache_chats', INITIAL_CHATS));
    return () => {};
  }

  ensureSeededSupabase().catch(() => {});

  callback(getCachedList('_fs_cache_chats', INITIAL_CHATS));

  supabase.from('chats').select('*').then(({ data, error }) => {
    if (!error && data) {
      const cList = data as ChatMessage[];
      saveCachedList('_fs_cache_chats', cList);
      callback(cList);
    }
  });

  const channel = supabase
    .channel('realtime:chats')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, async () => {
      const { data } = await supabase!.from('chats').select('*');
      if (data) {
        const cList = data as ChatMessage[];
        saveCachedList('_fs_cache_chats', cList);
        callback(cList);
      }
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

const defaultBanners: BannerConfig[] = [
  {
    id: 'b1',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    title: 'DISKON BESAR EVENT WAST',
    subtitle: 'Mulai dari Top Up game hingga voucher belanja digital premium',
    buttonText: 'Mulai Belanja',
    buttonLink: 'home',
    bgColor: 'from-blue-600 to-indigo-800',
    accentColor: 'blue',
    titleColor: '#ffffff',
    subtitleColor: '#e0e7ff'
  }
];

export const syncBanner = (callback: (banners: BannerConfig[]) => void) => {
  if (!supabase) {
    callback(getCachedList('_fs_cache_banner', defaultBanners));
    return () => {};
  }

  callback(getCachedList('_fs_cache_banner', defaultBanners));

  supabase.from('banner').select('*').then(({ data, error }) => {
    if (!error && data && data.length > 0) {
      const bList = data as BannerConfig[];
      saveCachedList('_fs_cache_banner', bList);
      callback(bList);
    } else {
      callback(defaultBanners);
    }
  });

  const channel = supabase
    .channel('realtime:banner')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'banner' }, async () => {
      const { data } = await supabase!.from('banner').select('*');
      if (data && data.length > 0) {
        const bList = data as BannerConfig[];
        saveCachedList('_fs_cache_banner', bList);
        callback(bList);
      } else {
        callback(defaultBanners);
      }
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const syncLogo = (callback: (logoUrl: string | null) => void) => {
  if (!supabase) {
    callback(localStorage.getItem('wast_custom_logo'));
    return () => {};
  }

  // Get initial value
  supabase.from('branding').select('*').eq('key', 'branding').single().then(({ data, error }) => {
    if (!error && data) {
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

  const channel = supabase
    .channel('realtime:branding')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'branding', filter: 'key=eq.branding' }, async (payload) => {
      const data = payload.new as any;
      if (data) {
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
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// --- WRITE OPERATIONS ---

export const saveUser = async (user: User) => {
  const current = getCachedList<User>('_fs_cache_users', INITIAL_USERS);
  const updated = current.filter(u => u.id !== user.id);
  updated.push(user);
  saveCachedList('_fs_cache_users', updated);

  if (!supabase) return;
  await supabase.from('users').upsert(user);
};

export const saveMultipleUsers = async (usersList: User[]) => {
  saveCachedList('_fs_cache_users', usersList);

  if (!supabase) return;
  await supabase.from('users').upsert(usersList);
};

export const saveProduct = async (product: Product) => {
  const current = getCachedList<Product>('_fs_cache_products', INITIAL_PRODUCTS);
  const updated = current.filter(p => p.id !== product.id);
  updated.push(product);
  saveCachedList('_fs_cache_products', updated);

  if (!supabase) return;
  await supabase.from('products').upsert(product);
};

export const saveMultipleProducts = async (productsList: Product[]) => {
  saveCachedList('_fs_cache_products', productsList);

  if (!supabase) return;
  await supabase.from('products').upsert(productsList);
};

export const deleteProductDoc = async (productId: number) => {
  const current = getCachedList<Product>('_fs_cache_products', INITIAL_PRODUCTS);
  const updated = current.filter(p => p.id !== productId);
  saveCachedList('_fs_cache_products', updated);

  if (!supabase) return;
  await supabase.from('products').delete().eq('id', productId);
};

export const saveTransaction = async (tx: Transaction) => {
  const current = getCachedList<Transaction>('_fs_cache_transactions', INITIAL_TRANSACTIONS);
  const updated = current.filter(t => t.id !== tx.id);
  updated.push(tx);
  saveCachedList('_fs_cache_transactions', updated);

  if (!supabase) return;
  await supabase.from('transactions').upsert(tx);
};

export const saveMultipleTransactions = async (txsList: Transaction[]) => {
  saveCachedList('_fs_cache_transactions', txsList);

  if (!supabase) return;
  await supabase.from('transactions').upsert(txsList);
};

export const saveChat = async (chat: ChatMessage) => {
  const current = getCachedList<ChatMessage>('_fs_cache_chats', INITIAL_CHATS);
  const updated = current.filter(c => c.id !== chat.id);
  updated.push(chat);
  saveCachedList('_fs_cache_chats', updated);

  if (!supabase) return;
  await supabase.from('chats').upsert(chat);
};

export const saveMultipleChats = async (chatsList: ChatMessage[]) => {
  saveCachedList('_fs_cache_chats', chatsList);

  if (!supabase) return;
  await supabase.from('chats').upsert(chatsList);
};

export const saveBrandingInDatabase = async (updates: { logoUrl?: string | null; title?: string; titleColor?: string; textColor?: string; themeColor?: string }) => {
  if (updates.logoUrl !== undefined) {
    localStorage.setItem('wast_custom_logo', updates.logoUrl || '');
    window.dispatchEvent(new Event('wast_logo_changed'));
  }
  if (updates.title !== undefined) {
    localStorage.setItem('wast_custom_title', updates.title);
    window.dispatchEvent(new Event('wast_title_changed'));
  }
  if (updates.titleColor !== undefined) {
    localStorage.setItem('wast_custom_title_color', updates.titleColor);
  }
  if (updates.textColor !== undefined) {
    localStorage.setItem('wast_custom_text_color', updates.textColor);
  }
  if (updates.themeColor !== undefined) {
    localStorage.setItem('wast_custom_theme_color', updates.themeColor);
  }
  window.dispatchEvent(new Event('wast_branding_colors_changed'));

  if (!supabase) return;
  await supabase.from('branding').upsert({ key: 'branding', ...updates });
};

export const saveLogoInDatabase = async (logoUrl: string | null) => {
  await saveBrandingInDatabase({ logoUrl });
};

export const saveBanner = async (banner: BannerConfig | BannerConfig[]) => {
  const current = getCachedList<BannerConfig>('_fs_cache_banner', defaultBanners);
  let updated = Array.isArray(banner) ? banner : [...current.filter(x => x.id !== banner.id), banner];
  saveCachedList('_fs_cache_banner', updated);

  if (!supabase) return;
  if (Array.isArray(banner)) {
    await supabase.from('banner').delete().neq('id', 'placeholder_for_non_empty');
    if (banner.length > 0) {
      await supabase.from('banner').insert(banner);
    }
  } else {
    await supabase.from('banner').upsert(banner);
  }
};

export const uploadFileToStorage = async (file: File, folder: string = 'media'): Promise<string> => {
  if (!supabase) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
  const filePath = `${folder}/${timestamp}_${sanitizedName}`;
  
  try {
    const { data, error } = await supabase.storage
      .from('media')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });
      
    if (error) {
      console.warn("Supabase storage bucket 'media' upload failed, using Base64:", error);
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
    
    const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(filePath);
    return publicUrlData.publicUrl;
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
  saveCachedList('_fs_cache_products', []);
  saveCachedList('_fs_cache_transactions', []);
  saveCachedList('_fs_cache_chats', []);
  saveCachedList('_fs_cache_banner', []);
  // Keep only developers in cache if possible, or just don't touch cache and rely on supabase

  if (!supabase) return;
  await Promise.all([
    supabase.from('products').delete().neq('id', -1),
    supabase.from('transactions').delete().neq('id', 'non_existing'),
    supabase.from('chats').delete().neq('id', 'non_existing'),
    supabase.from('banner').delete().neq('id', 'non_existing'),
    supabase.from('users').delete().neq('role', 'developer')
  ]);
};
