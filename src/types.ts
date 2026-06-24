export interface User {
  id: string;
  username: string;
  password?: string;
  pin: string;
  role: 'user' | 'seller' | 'admin' | 'developer';
  customRole: string;
  verified: boolean;
  profilePic: string | null;
  isBanned?: boolean;
  balance?: number;
  email?: string;
}

export interface Product {
  id: number;
  sellerId: string;
  category: 'Robux' | 'Item' | 'GIG' | 'Akun' | 'Lainnya';
  title: string;
  desc: string;
  price: number;
  stock: number;
  discord: string;
  wa: string;
  images: string[];
}

export interface Transaction {
  id: string;
  productId: number;
  productName: string;
  price: number;
  qty: number;
  buyerId: string;
  sellerId: string;
  status: 'waiting_confirmation' | 'completed' | 'cancelled';
  timestamp: number;
  proofImage?: string | null;
}

export interface ChatMessage {
  id: string;
  chatId: string; // "buyerId-sellerId-productId" format
  productId: number;
  senderId: string;
  receiverId: string;
  text: string;
  image?: string | null;
  video?: string | null;
  timestamp: number;
  isRead: boolean;
}

export interface ChatSession {
  chatId: string;
  productId: number;
  productTitle: string;
  buyerId: string;
  sellerId: string;
  lastMessage: string;
  timestamp: number;
}

export interface BannerConfig {
  id: string; // "banner"
  imageUrl: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  bgColor: string;
  accentColor: string;
  titleColor?: string;
  subtitleColor?: string;
}
