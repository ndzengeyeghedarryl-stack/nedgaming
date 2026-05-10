import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const gamesData = [
  {
    title: 'Grand Theft Auto V',
    description: 'Explorez le monde ouvert de Los Santos dans cette aventure criminelle épique. Jouez avec trois protagonistes uniques et vivez une histoire immersive remplie d\'action, de conduite et de liberté totale dans un monde ouvert exceptionnel.',
    price: 15000,
    imageUrl: '/games/gta-v.png',
    category: 'Action',
    developer: 'Rockstar Games',
    rating: 4.8,
    featured: true,
  },
  {
    title: 'Call of Duty: Modern Warfare III',
    description: 'Engagez-vous dans le conflit mondial le plus intense. Campagne solo captivante, mode multijoueur compétitif et le fameux mode Zombies vous attendent dans ce FPS incontournable.',
    price: 25000,
    imageUrl: '/games/cod-mw3.png',
    category: 'Action',
    developer: 'Activision',
    rating: 4.3,
    featured: true,
  },
  {
    title: 'Halo Infinite',
    description: 'Le légendaire Master Chief revient dans sa plus grande aventure. Explorez un monde ouvert de science-fiction, combattez les ennemis Banished et découvrez le mystère du Halo.',
    price: 20000,
    imageUrl: '/games/halo-infinite.png',
    category: 'Action',
    developer: '343 Industries',
    rating: 4.1,
    featured: false,
  },
  {
    title: 'Elden Ring',
    description: 'Un RPG en monde ouvert créé par Hidetaka Miyazaki et George R.R. Martin. Explorez les Terres Intermédiaires, affrontez des ennemis redoutables et découvrez les secrets de l\'Anneau Elden.',
    price: 22000,
    imageUrl: '/games/elden-ring.png',
    category: 'RPG',
    developer: 'FromSoftware',
    rating: 4.9,
    featured: true,
  },
  {
    title: 'Cyberpunk 2077',
    description: 'Vivez dans la mégalopole de Night City, une ville obsédée par le pouvoir, le style et les modifications corporelles. Incarnez V, un mercenaire hors-la-loi à la recherche d\'un implant unique.',
    price: 18000,
    imageUrl: '/games/cyberpunk-2077.png',
    category: 'RPG',
    developer: 'CD Projekt Red',
    rating: 4.5,
    featured: true,
  },
  {
    title: 'The Witcher 3: Wild Hunt',
    description: 'Incarnant le sorceleur Geralt de Riv, partez à la recherche de Ciri, poursuivie par la Chasse Sauvage. Un RPG à monde ouvert avec des quêtes mémorables et des choix moraux.',
    price: 12000,
    imageUrl: '/games/witcher-3.png',
    category: 'RPG',
    developer: 'CD Projekt Red',
    rating: 4.9,
    featured: false,
  },
  {
    title: 'EA Sports FC 24',
    description: 'Le football comme vous ne l\'avez jamais vu. Avec la technologie HyperMotion V et des licences exclusives, vivez le beau jeu dans le simulateur de football le plus réaliste.',
    price: 20000,
    imageUrl: '/games/fc-24.png',
    category: 'Sport',
    developer: 'EA Sports',
    rating: 3.9,
    featured: true,
  },
  {
    title: 'NBA 2K24',
    description: 'Prenez le terrain avec les plus grandes stars du basket. Modes de jeu variés, graphismes époustouflants et gameplay ultra-réaliste pour l\'expérience basket ultime.',
    price: 18000,
    imageUrl: '/games/nba-2k24.png',
    category: 'Sport',
    developer: 'Visual Concepts',
    rating: 4.0,
    featured: false,
  },
  {
    title: 'Assassin\'s Creed Mirage',
    description: 'Retour aux sources de la franchise. Incarnez Basim dans le Bagdad du 9ème siècle. Infiltration, parkour et assassinats dans un monde ouvert magnifique et authentique.',
    price: 20000,
    imageUrl: '/games/ac-mirage.png',
    category: 'Aventure',
    developer: 'Ubisoft',
    rating: 4.2,
    featured: true,
  },
  {
    title: 'God of War Ragnarök',
    description: 'Kratos et Atreus affrontent le Ragnarök dans cette suite épique. Combattez des dieux nordiques, explorez les neuf royaumes et vivez une histoire émouvante père-fils.',
    price: 22000,
    imageUrl: '/games/god-of-war-ragnarok.png',
    category: 'Aventure',
    developer: 'Santa Monica Studio',
    rating: 4.8,
    featured: true,
  },
  {
    title: 'Age of Empires IV',
    description: 'Bâtissez votre empire à travers les âges. Gérez vos ressources, construisez vos armées et dominez vos ennemis dans ce jeu de stratégie en temps réel référence.',
    price: 15000,
    imageUrl: '/games/aoe-iv.png',
    category: 'Stratégie',
    developer: 'Relic Entertainment',
    rating: 4.3,
    featured: false,
  },
  {
    title: 'Civilization VI',
    description: 'Conduisez votre civilisation de l\'Âge de Pierre à l\'Ère de l\'Information. Explorez, étendez vos territoires, développez votre culture et dominez le monde.',
    price: 12000,
    imageUrl: '/games/civ-vi.png',
    category: 'Stratégie',
    developer: 'Firaxis Games',
    rating: 4.6,
    featured: false,
  },
  {
    title: 'Red Dead Redemption 2',
    description: 'Vivez l\'histoire de Arthur Morgan et de la bande de Van der Linde dans l\'Amérique sauvage de 1899. Un chef-d\'œuvre de narration dans un monde ouvert époustouflant.',
    price: 16000,
    imageUrl: '/games/rdr2.png',
    category: 'Aventure',
    developer: 'Rockstar Games',
    rating: 4.9,
    featured: true,
  },
  {
    title: 'FIFA 24 Legacy Edition',
    description: 'Profitez du football avec les modes de jeu classiques. Gérez votre club, jouez en ligne et revivez les plus grands moments du football mondial.',
    price: 14000,
    imageUrl: '/games/fifa-24.png',
    category: 'Sport',
    developer: 'EA Sports',
    rating: 3.5,
    featured: false,
  },
];

export async function GET() {
  try {
    // Check if games already exist
    const existingGames = await db.game.count();

    if (existingGames > 0) {
      return NextResponse.json({
        message: `${existingGames} jeux existent déjà dans la base de données`,
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
