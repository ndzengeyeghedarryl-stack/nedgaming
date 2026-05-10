import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }

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
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des commandes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, phone, items, provider } = body;

    if (!userId || !phone || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Données de commande incomplètes' },
        { status: 400 }
      );
    }

    // Calculate total
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const game = await db.game.findUnique({
        where: { id: item.gameId },
      });

      if (!game) {
        return NextResponse.json(
          { error: `Jeu avec ID ${item.gameId} non trouvé` },
          { status: 400 }
        );
      }

      total += game.price;
      orderItems.push({
        gameId: game.id,
        price: game.price,
      });
    }

    // Simulate Mobile Money payment (in real app, integrate with MTN/Moov/Airtel API)
    // For demo purposes, we always succeed
    const paymentSuccess = true;

    if (!paymentSuccess) {
      return NextResponse.json(
        { error: 'Paiement Mobile Money échoué. Veuillez réessayer.' },
        { status: 400 }
      );
    }

    const order = await db.order.create({
      data: {
        userId,
        phone: `+241${phone}`,
        total,
        status: 'confirmed',
        items: {
          create: orderItems,
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

    return NextResponse.json(order);
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la commande' },
      { status: 500 }
    );
  }
}
