import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { memoryOrders, updateMemoryOrderStatus } from '@/lib/memoryStore';

// GET all orders (admin only)
export async function GET(request: NextRequest) {
  let dbAvailable = false;
  try {
    await db.order.count();
    dbAvailable = true;
  } catch {
    dbAvailable = false;
  }

  if (dbAvailable) {
    try {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');

      const where = status ? { status } : {};

      const orders = await db.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          items: {
            include: {
              game: {
                select: {
                  id: true,
                  title: true,
                  imageUrl: true,
                  category: true,
                  price: true,
                  downloadLink: true,
                  fileSize: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Also merge with memory orders that might not be in DB
      const dbOrderIds = new Set(orders.map((o: { id: string }) => o.id));
      const memOnlyOrders = memoryOrders.filter(o => !dbOrderIds.has(o.id));

      if (memOnlyOrders.length > 0) {
        return NextResponse.json([...memOnlyOrders, ...orders]);
      }

      return NextResponse.json(orders);
    } catch (error) {
      console.error('Get admin orders DB error, using memory:', error);
    }
  }

  // Memory fallback
  return NextResponse.json(memoryOrders);
}

// PUT - Update order status (confirm or reject)
export async function PUT(request: NextRequest) {
  let body: { orderId?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Données invalides' },
      { status: 400 }
    );
  }

  const { orderId, status } = body;

  if (!orderId || !status) {
    return NextResponse.json(
      { error: 'ID commande et statut requis' },
      { status: 400 }
    );
  }

  if (!['confirmed', 'rejected', 'pending'].includes(status)) {
    return NextResponse.json(
      { error: 'Statut invalide. Utilisez: confirmed, rejected, ou pending' },
      { status: 400 }
    );
  }

  let dbAvailable = false;
  try {
    await db.order.count();
    dbAvailable = true;
  } catch {
    dbAvailable = false;
  }

  if (dbAvailable) {
    try {
      const order = await db.order.update({
        where: { id: orderId },
        data: { status },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              game: true,
            },
          },
        },
      });

      // Also update in memory
      const memOrder = memoryOrders.find(o => o.id === orderId);
      if (memOrder) {
        memOrder.status = status;
      }

      return NextResponse.json({ order });
    } catch (error) {
      console.error('Update order DB error, using memory:', error);
    }
  }

  // Memory fallback
  const memOrder = memoryOrders.find(o => o.id === orderId);
  if (memOrder) {
    memOrder.status = status;
    return NextResponse.json({ order: memOrder });
  }

  return NextResponse.json(
    { error: 'Commande non trouvée' },
    { status: 404 }
  );
}
