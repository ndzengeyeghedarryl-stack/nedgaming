import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { gamesData } from '../games/route';
import { memoryOrders, addMemoryOrder, type MemoryOrder, type MemoryOrderItem } from '@/lib/memoryStore';

// Helper to find game data from static fallback
function findGameById(gameId: string) {
  // Check if it's a static ID
  if (gameId.startsWith('static-')) {
    const index = parseInt(gameId.replace('static-', ''));
    if (index >= 0 && index < gamesData.length) {
      return { ...gamesData[index], id: gameId };
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: 'ID utilisateur requis' },
      { status: 400 }
    );
  }

  let dbOrders: MemoryOrder[] = [];
  let dbAvailable = false;

  try {
    await db.order.count();
    dbAvailable = true;
  } catch {
    dbAvailable = false;
  }

  if (dbAvailable) {
    try {
      const orders = await db.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              game: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(orders);
    } catch (error) {
      console.error('Get orders DB error, using memory:', error);
    }
  }

  // Memory fallback: return orders for this user
  const userOrders = memoryOrders.filter(o => o.userId === userId);
  return NextResponse.json(userOrders);
}

export async function POST(request: NextRequest) {
  let body: { userId?: string; phone?: string; items?: { gameId: string }[]; provider?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Données invalides' },
      { status: 400 }
    );
  }

  const { userId, phone, items, provider } = body;

  if (!userId || !phone || !items || items.length === 0) {
    return NextResponse.json(
      { error: 'Données de commande incomplètes' },
      { status: 400 }
    );
  }

  // Calculate total and prepare items
  let total = 0;
  const orderItems: MemoryOrderItem[] = [];

  for (const item of items) {
    let game: { id: string; title: string; price: number; imageUrl: string; category: string; downloadLink: string; fileSize: string } | null = null;

    // Try to find game in DB first
    try {
      game = await db.game.findUnique({ where: { id: item.gameId } });
    } catch {
      // DB not available
    }

    // Fallback to static data
    if (!game) {
      game = findGameById(item.gameId);
    }

    if (!game) {
      return NextResponse.json(
        { error: `Jeu avec ID ${item.gameId} non trouvé` },
        { status: 400 }
      );
    }

    total += game.price;
    orderItems.push({
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      gameId: game.id,
      price: game.price,
      game: {
        id: game.id,
        title: game.title,
        imageUrl: game.imageUrl,
        category: game.category,
        price: game.price,
        downloadLink: game.downloadLink || '',
        fileSize: game.fileSize || '0 GB',
      },
    });
  }

  // Try DB first
  let dbAvailable = false;
  try {
    await db.order.count();
    dbAvailable = true;
  } catch {
    dbAvailable = false;
  }

  if (dbAvailable) {
    try {
      const order = await db.order.create({
        data: {
          userId,
          phone: `+241${phone}`,
          total,
          status: 'pending',
          provider: provider || '',
          items: {
            create: orderItems.map(item => ({
              gameId: item.gameId,
              price: item.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              game: true,
            },
          },
        },
      });

      // Also store in memory as backup
      const memOrder: MemoryOrder = {
        id: order.id,
        userId,
        total,
        status: 'pending',
        phone: `+241${phone}`,
        provider: provider || '',
        createdAt: new Date().toISOString(),
        user: { id: userId, name: '', email: '', phone: null },
        items: orderItems,
      };

      // Try to get user info
      try {
        const dbUser = await db.user.findUnique({ where: { id: userId } });
        if (dbUser) {
          memOrder.user = { id: dbUser.id, name: dbUser.name, email: dbUser.email, phone: dbUser.phone };
        }
      } catch { /* ignore */ }

      addMemoryOrder(memOrder);

      return NextResponse.json(order);
    } catch (error) {
      console.error('Create order DB error, using memory:', error);
    }
  }

  // Memory fallback
  // Get user info from memory users
  let userName = 'Client';
  let userEmail = '';
  let userPhone: string | null = null;

  try {
    const { getMemoryUsers } = await import('../auth/register/route');
    const memUsers = getMemoryUsers();
    const memUser = memUsers.find(u => u.id === userId);
    if (memUser) {
      userName = memUser.name;
      userEmail = memUser.email;
      userPhone = memUser.phone;
    }
  } catch { /* ignore */ }

  const orderId = `order-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const memOrder: MemoryOrder = {
    id: orderId,
    userId,
    total,
    status: 'pending',
    phone: `+241${phone}`,
    provider: provider || '',
    createdAt: new Date().toISOString(),
    user: { id: userId, name: userName, email: userEmail, phone: userPhone },
    items: orderItems,
  };

  memoryOrders.push(memOrder);

  return NextResponse.json(memOrder);
}

// Export for admin route to use
export { memoryOrders, findGameById, type MemoryOrder, type MemoryOrderItem };
