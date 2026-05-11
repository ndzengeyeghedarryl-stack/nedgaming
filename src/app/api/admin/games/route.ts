import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all games with full details for admin
export async function GET() {
  try {
    const games = await db.game.findMany({
      orderBy: { title: 'asc' },
    });
    return NextResponse.json(games);
  } catch (error) {
    console.error('Admin games fetch error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des jeux' },
      { status: 500 }
    );
  }
}

// PUT - Update a game's download link
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameId, downloadLink, fileSize, version, price, title, description, category, developer, rating, featured } = body;

    if (!gameId) {
      return NextResponse.json(
        { error: 'ID du jeu requis' },
        { status: 400 }
      );
    }

    const game = await db.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return NextResponse.json(
        { error: 'Jeu non trouvé' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (downloadLink !== undefined) updateData.downloadLink = downloadLink;
    if (fileSize !== undefined) updateData.fileSize = fileSize;
    if (version !== undefined) updateData.version = version;
    if (price !== undefined) updateData.price = price;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (developer !== undefined) updateData.developer = developer;
    if (rating !== undefined) updateData.rating = rating;
    if (featured !== undefined) updateData.featured = featured;

    const updatedGame = await db.game.update({
      where: { id: gameId },
      data: updateData,
    });

    return NextResponse.json({
      message: 'Jeu mis à jour avec succès',
      game: updatedGame,
    });
  } catch (error) {
    console.error('Admin game update error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du jeu' },
      { status: 500 }
    );
  }
}
