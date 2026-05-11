import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { readFileSync, statSync } from 'fs';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Connexion requise pour télécharger' },
        { status: 401 }
      );
    }

    // Verify the user has purchased this game
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

    if (!order) {
      return NextResponse.json(
        { error: 'Vous devez acheter ce jeu avant de le télécharger' },
        { status: 403 }
      );
    }

    // Get game info
    const game = await db.game.findUnique({
      where: { id: gameId },
    });

    if (!game || !game.downloadUrl) {
      return NextResponse.json(
        { error: 'Fichier de téléchargement non disponible' },
        { status: 404 }
      );
    }

    // Read the ZIP file
    const filePath = join(process.cwd(), 'public', game.downloadUrl);

    try {
      const fileBuffer = readFileSync(filePath);
      const fileStats = statSync(filePath);

      // Create a safe filename
      const safeTitle = game.title.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${safeTitle}_Setup_v${game.version}.zip`;

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': fileStats.size.toString(),
          'Cache-Control': 'no-cache',
        },
      });
    } catch {
      return NextResponse.json(
        { error: 'Fichier non trouvé sur le serveur' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du téléchargement' },
      { status: 500 }
    );
  }
}
