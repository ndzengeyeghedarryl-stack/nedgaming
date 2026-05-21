import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { memoryUsers } from '@/lib/memoryStore';

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
        return NextResponse.json([
          ...memOnlyUsers.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            createdAt: u.createdAt,
          })),
          ...users,
        ]);
      }

      return NextResponse.json(users);
    } catch (error) {
      console.error('Get admin users DB error, using memory:', error);
    }
  }

  // Memory fallback - use shared memory store
  return NextResponse.json(
    memoryUsers.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      createdAt: u.createdAt,
    }))
  );
}
