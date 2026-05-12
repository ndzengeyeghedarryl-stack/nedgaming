import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all orders (admin only)
export async function GET(request: NextRequest) {
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

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Get admin orders error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des commandes' },
      { status: 500 }
    );
  }
}

// PUT - Update order status (confirm or reject)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
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

    return NextResponse.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la commande' },
      { status: 500 }
    );
  }
}
