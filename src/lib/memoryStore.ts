// ===== SHARED IN-MEMORY STORE (for Vercel ephemeral DB fallback) =====
// This file is imported by multiple API routes to share state

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

// Shared in-memory stores
export const memoryUsers: MemoryUser[] = [];
export const memoryOrders: MemoryOrder[] = [];

// Helper to add a user (avoids duplicates)
export function addMemoryUser(user: MemoryUser): void {
  if (!memoryUsers.find(u => u.id === user.id)) {
    memoryUsers.push(user);
  }
}

// Helper to add an order (avoids duplicates)
export function addMemoryOrder(order: MemoryOrder): void {
  if (!memoryOrders.find(o => o.id === order.id)) {
    memoryOrders.push(order);
  }
}

// Helper to update order status in memory
export function updateMemoryOrderStatus(orderId: string, status: string): void {
  const order = memoryOrders.find(o => o.id === orderId);
  if (order) {
    order.status = status;
  }
}
