import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    if (category && category !== 'Tous') {
      where.category = category;
    }

    if (search) {
      where.title = {
        contains: search,
      };
    }

    const games = await db.game.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(games);
  } catch (error) {
    console.error('Get games error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des jeux' },
      { status: 500 }
    );
  }
}
