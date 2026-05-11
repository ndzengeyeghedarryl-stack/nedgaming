import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const game = await db.game.findUnique({
      where: { id },
    });

    if (!game) {
      return NextResponse.json(
        { error: 'Jeu non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(game);
  } catch (error) {
    console.error('Get game error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement du jeu' },
      { status: 500 }
    );
  }
}
