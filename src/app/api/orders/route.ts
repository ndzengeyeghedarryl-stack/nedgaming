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

  try {
    // Calculate total and validate games exist
    let total = 0;
    const orderItemsData: { gameId: string; price: number }[] = [];

    for (const item of items) {
      const game = await db.game.findUnique({ where: { id: item.gameId } });

      if (!game) {
        return NextResponse.json(
          { error: `Jeu avec ID ${item.gameId} non trouvé` },
          { status: 400 }
        );
      }

      total += game.price;
      orderItemsData.push({
        gameId: game.id,
        price: game.price,
      });
    }

    const order = await db.order.create({
      data: {
        userId,
        phone: `+241${phone}`,
        total,
        status: 'pending',
        provider: provider || '',
        items: {
          create: orderItemsData,
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
