import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// In-memory users store (synced from register route)
interface MemoryUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
}

// Shared memory users array
const memoryUsers: MemoryUser[] = [];

export function getMemoryUsers(): MemoryUser[] {
  return memoryUsers;
}

export function addMemoryUser(user: MemoryUser): void {
  // Avoid duplicates
  if (!memoryUsers.find(u => u.id === user.id)) {
    memoryUsers.push(user);
  }
}

// GET all users (admin only)
export async function GET(request: NextRequest) {
  let dbAvailable = false;
  try {
    await db.user.count();
    dbAvailable = true;
  } catch {
    dbAvailable = false;
  }

  if (dbAvailable) {
    try {
      const users = await db.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Also merge with memory users that might not be in DB
      const dbUserIds = new Set(users.map((u: { id: string }) => u.id));
      const memOnlyUsers = memoryUsers.filter(u => !dbUserIds.has(u.id));

      if (memOnlyUsers.length > 0) {
        return NextResponse.json([...memOnlyUsers, ...users]);
      }

      return NextResponse.json(users);
    } catch (error) {
      console.error('Get admin users DB error, using memory:', error);
    }
  }

  // Memory fallback
  return NextResponse.json(memoryUsers);
}
