import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const gamesData = [
  {
    title: 'Grand Theft Auto V',
    description: 'Explorez le monde ouvert de Los Santos dans cette aventure criminelle épique. Jouez avec trois protagonistes uniques et vivez une histoire immersive remplie d\'action, de conduite et de liberté totale dans un monde ouvert exceptionnel.',
    price: 15000,
    imageUrl: '/games/gta-v.png',
    downloadUrl: '/downloads/gta-v.zip',
    fileSize: '45.2 GB',
    version: '1.0.8',
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
    downloadUrl: '/downloads/cod-mw3.zip',
    fileSize: '78.5 GB',
    version: '1.0.3',
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
    downloadUrl: '/downloads/halo-infinite.zip',
    fileSize: '52.8 GB',
    version: '1.0.5',
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
    downloadUrl: '/downloads/elden-ring.zip',
    fileSize: '48.3 GB',
    version: '1.0.2',
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
    downloadUrl: '/downloads/cyberpunk-2077.zip',
    fileSize: '65.1 GB',
    version: '2.1.0',
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
    downloadUrl: '/downloads/witcher-3.zip',
    fileSize: '42.7 GB',
    version: '4.0.4',
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
    downloadUrl: '/downloads/fc-24.zip',
    fileSize: '55.3 GB',
    version: '1.0.1',
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
    downloadUrl: '/downloads/nba-2k24.zip',
    fileSize: '62.4 GB',
    version: '1.0.0',
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
    downloadUrl: '/downloads/ac-mirage.zip',
    fileSize: '38.9 GB',
    version: '1.0.6',
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
    downloadUrl: '/downloads/god-of-war-ragnarok.zip',
    fileSize: '71.2 GB',
    version: '1.0.1',
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
    downloadUrl: '/downloads/aoe-iv.zip',
    fileSize: '35.6 GB',
    version: '1.0.9',
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
    downloadUrl: '/downloads/civ-vi.zip',
    fileSize: '28.4 GB',
    version: '1.0.12',
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
    downloadUrl: '/downloads/rdr2.zip',
    fileSize: '82.5 GB',
    version: '1.0.4',
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
    downloadUrl: '/downloads/fifa-24.zip',
    fileSize: '48.7 GB',
    version: '1.0.0',
    category: 'Sport',
    developer: 'EA Sports',
    rating: 3.5,
    featured: false,
  },
];

export async function GET() {
  try {
    const existingGames = await db.game.count();

    if (existingGames > 0) {
      // Update existing games with downloadUrl if they don't have one
      const games = await db.game.findMany();
      for (const game of games) {
        if (!game.downloadUrl) {
          const slug = game.imageUrl.split('/').pop()?.replace('.png', '') || '';
          const matchingData = gamesData.find(g => g.imageUrl.endsWith(`${slug}.png`));
          if (matchingData) {
            await db.game.update({
              where: { id: game.id },
              data: {
                downloadUrl: matchingData.downloadUrl,
                fileSize: matchingData.fileSize,
                version: matchingData.version,
              },
            });
          }
        }
      }

      return NextResponse.json({
        message: `${existingGames} jeux existent déjà dans la base de données (URLs de téléchargement mises à jour)`,
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
