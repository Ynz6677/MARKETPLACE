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
    profilePic: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
  }
];

export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_TRANSACTIONS: Transaction[] = [];
export const INITIAL_CHATS: ChatMessage[] = [];
