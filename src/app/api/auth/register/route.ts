import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { memoryUsers, addMemoryUser } from '@/lib/memoryStore';

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'nedgaming_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: NextRequest) {
  let body: { name?: string; email?: string; password?: string; phone?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Données invalides' },
      { status: 400 }
    );
  }

  const { name, email, password, phone } = body;

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: 'Nom, email et mot de passe sont requis' },
      { status: 400 }
    );
  }

  const hashedPassword = await hashPassword(password);

  // Try DB first
  let dbAvailable = false;
  try {
    await db.user.count();
    dbAvailable = true;
  } catch {
    dbAvailable = false;
  }

  if (dbAvailable) {
    try {
      // Check if email already exists
      const existingUser = await db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Un compte avec cet email existe déjà' },
          { status: 400 }
        );
      }

      const user = await db.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone: phone || null,
        },
      });

      // Also store in shared memory as backup
      addMemoryUser({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json({
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
      });
    } catch (error) {
      console.error('Register DB error, using memory:', error);
    }
  }

  // Memory fallback - use shared memory store
  // Check if email already exists
  const existingMemUser = memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingMemUser) {
    return NextResponse.json(
      { error: 'Un compte avec cet email existe déjà' },
      { status: 400 }
    );
  }

  const userId = `user-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const newUser = {
    id: userId,
    name,
    email,
    phone: phone || null,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  };

  addMemoryUser(newUser);

  return NextResponse.json({
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    phone: newUser.phone,
  });
}
