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

export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_TRANSACTIONS: Transaction[] = [];
export const INITIAL_CHATS: ChatMessage[] = [];
