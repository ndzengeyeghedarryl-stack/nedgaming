// ===== DEPRECATED: Memory store is no longer used =====
// All data is now persisted in PostgreSQL via Supabase
// This file is kept for backward compatibility but should not be imported

export interface MemoryUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  password: string;
  createdAt: string;
}

export interface MemoryOrderItem {
  id: string;
  gameId: string;
  price: number;
  game: {
    id: string;
    title: string;
    imageUrl: string;
    category: string;
    price: number;
    downloadLink: string;
    fileSize: string;
  };
}

export interface MemoryOrder {
  id: string;
  userId: string;
  total: number;
  status: string;
  phone: string;
  provider: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  items: MemoryOrderItem[];
}
