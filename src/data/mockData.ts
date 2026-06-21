import { User, Product, Transaction, ChatMessage } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    username: 'Developer',
    password: '123',
    pin: '0506',
    role: 'developer',
    customRole: 'Owner',
    verified: true,
    profilePic: null,
  },
  {
    id: 'u2',
    username: 'SansOfficial',
    password: '123',
    pin: '1111',
    role: 'user',
    customRole: 'Trusted',
    verified: true,
    profilePic: null,
  },
  {
    id: 'u3',
    username: 'UserBiasa',
    password: '123',
    pin: '0000',
    role: 'user',
    customRole: '',
    verified: false,
    profilePic: null,
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 101,
    sellerId: 'u2',
    category: 'Robux',
    title: '1000 Robux via Gamepass (Cepat & Aman)',
    desc: 'Proses via gamepass, pajak ditanggung pembeli. Proses instan jika sedang online. Harap kirimkan link gamepass di chat setelah membeli!',
    price: 80000,
    stock: 12,
    discord: 'https://discord.gg/sansvictim',
    wa: '081234567890',
    images: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 102,
    sellerId: 'u3',
    category: 'Item',
    title: 'Pedang Langka (Rare Sword) Level Max',
    desc: 'Blox Fruits Mythical Sword dengan stats sempurna. Dijual cepat karena butuh dana upgrade. Silakan tanyakan di chat terlebih dahulu atau langsung WA.',
    price: 350000,
    stock: 1,
    discord: '',
    wa: '08987654321',
    images: [
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 103,
    sellerId: 'u2',
    category: 'GIG',
    title: 'Gift In Game (GIG) - Dark Blade Blox Fruits',
    desc: 'Kami mengirim langsung sebagai gift ke akun Roblox Anda. Pastikan username Roblox benar. Keamanan terjaga 100%, garansi seumur hidup.',
    price: 520000,
    stock: 5,
    discord: 'https://discord.gg/sansvictim',
    wa: '081234567890',
    images: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    ],
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TX1718001234',
    productId: 101,
    productName: '1000 Robux via Gamepass',
    price: 80000,
    qty: 1,
    buyerId: 'u3',
    sellerId: 'u2',
    status: 'completed',
    timestamp: Date.now() - 36000000,
  }
];

export const INITIAL_CHATS: ChatMessage[] = [
  {
    id: 'm1',
    chatId: 'u3-u2-101',
    productId: 101,
    senderId: 'u3',
    receiverId: 'u2',
    text: 'Halo kak, apakah Robux nya ready stok?',
    timestamp: Date.now() - 40000000,
    isRead: true,
  },
  {
    id: 'm2',
    chatId: 'u3-u2-101',
    productId: 101,
    senderId: 'u2',
    receiverId: 'u3',
    text: 'Ready selalu kak, langsung order aja ya nanti proses gamepass ksh tau username di chat.',
    timestamp: Date.now() - 39000000,
    isRead: true,
  },
];
