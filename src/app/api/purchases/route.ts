import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const gameId = searchParams.get('gameId');

    if (!userId) {
      return NextResponse.json({ purchased: false });
    }

    if (gameId) {
      // Check if user purchased a specific game
      const order = await db.order.findFirst({
        where: {
          userId,
          status: { in: ['confirmed', 'delivered'] },
          items: {
            some: {
              gameId,
            },
          },
        },
      });

      return NextResponse.json({ purchased: !!order });
    }

    // Get all purchased game IDs for this user
    const orders = await db.order.findMany({
      where: {
        userId,
        status: { in: ['confirmed', 'delivered'] },
      },
      include: {
        items: {
          select: {
            gameId: true,
          },
        },
      },
    });

    const purchasedGameIds = orders.flatMap((order) =>
      order.items.map((item) => item.gameId)
    );

    return NextResponse.json({ purchasedGameIds });
  } catch (error) {
    console.error('Check purchase error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}
