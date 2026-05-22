import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { gamesData } from '../games/route';

export async function GET() {
  try {
    const existingGames = await db.game.count();

    if (existingGames > 0) {
      return NextResponse.json({
        message: `${existingGames} jeux existent déjà`,
        count: existingGames,
      });
    }

    // Seed games
    const games = [];
    for (const gameData of gamesData) {
      const game = await db.game.create({
        data: gameData,
      });
      games.push(game);
    }

    return NextResponse.json({
      message: `${games.length} jeux ont été ajoutés avec succès`,
      count: games.length,
      games,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du seed de la base de données' },
      { status: 500 }
    );
  }
}
