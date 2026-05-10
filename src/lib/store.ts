'use client';

import { create } from 'zustand';

export type PageType = 'home' | 'register' | 'login' | 'catalog' | 'game-detail' | 'cart' | 'checkout' | 'orders' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  downloadUrl: string;
  downloadLink: string;
  fileSize: string;
  version: string;
  category: string;
  developer: string;
  rating: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  game: Game;
  quantity: number;
}

interface StoreState {
  page: PageType;
  user: User | null;
  selectedGame: Game | null;
  cart: CartItem[];
  setPage: (page: PageType) => void;
  login: (user: User) => void;
  logout: () => void;
  setSelectedGame: (game: Game | null) => void;
  addToCart: (game: Game) => void;
  removeFromCart: (gameId: string) => void;
  clearCart: () => void;
  initFromStorage: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  page: 'home',
  user: null,
  selectedGame: null,
  cart: [],

  setPage: (page) => {
    set({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  login: (user) => {
    set({ user });
    if (typeof window !== 'undefined') {
      localStorage.setItem('nedgaming_user', JSON.stringify(user));
    }
  },

  logout: () => {
    set({ user: null, cart: [] });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nedgaming_user');
      localStorage.removeItem('nedgaming_cart');
    }
  },

  setSelectedGame: (game) => {
    set({ selectedGame: game });
  },

  addToCart: (game) => {
    const cart = get().cart;
    const existing = cart.find((item) => item.game.id === game.id);
    let newCart: CartItem[];
    if (existing) {
      newCart = cart;
    } else {
      newCart = [...cart, { game, quantity: 1 }];
    }
    set({ cart: newCart });
    if (typeof window !== 'undefined') {
      localStorage.setItem('nedgaming_cart', JSON.stringify(newCart));
    }
  },

  removeFromCart: (gameId) => {
    const newCart = get().cart.filter((item) => item.game.id !== gameId);
    set({ cart: newCart });
    if (typeof window !== 'undefined') {
      localStorage.setItem('nedgaming_cart', JSON.stringify(newCart));
    }
  },

  clearCart: () => {
    set({ cart: [] });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nedgaming_cart');
    }
  },

  initFromStorage: () => {
    if (typeof window !== 'undefined') {
      try {
        const userStr = localStorage.getItem('nedgaming_user');
        const cartStr = localStorage.getItem('nedgaming_cart');
        const user = userStr ? JSON.parse(userStr) : null;
        const cart = cartStr ? JSON.parse(cartStr) : [];
        set({ user, cart });
      } catch {
        // ignore parse errors
      }
    }
  },
}));
