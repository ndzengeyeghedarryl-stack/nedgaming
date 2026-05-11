'use client';

import { useStore, Game } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, Zap, Users, Trophy, ArrowRight, Star, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const gameGradients: Record<string, string> = {
  'naruto-storm-1.png': 'from-orange-900 via-red-900 to-gray-900',
  'naruto-storm-2.png': 'from-orange-800 via-yellow-900 to-gray-900',
  'naruto-storm-3.png': 'from-orange-900 via-amber-900 to-gray-900',
  'naruto-storm-4.png': 'from-yellow-800 via-orange-900 to-gray-900',
  'naruto-storm-revolution.png': 'from-orange-800 via-purple-900 to-gray-900',
  'db-xenoverse-1.png': 'from-blue-900 via-yellow-900 to-gray-900',
  'db-xenoverse-2.png': 'from-blue-800 via-orange-900 to-gray-900',
  'db-fighterz.png': 'from-orange-900 via-red-800 to-gray-900',
  'dbz-kakarot.png': 'from-yellow-800 via-blue-900 to-gray-900',
  'db-breakers.png': 'from-purple-900 via-green-900 to-gray-900',
  'fifa-19.png': 'from-green-900 via-emerald-900 to-gray-900',
  'fifa-20.png': 'from-green-800 via-teal-900 to-gray-900',
  'fifa-21.png': 'from-emerald-900 via-green-800 to-gray-900',
  'fifa-22.png': 'from-teal-900 via-green-900 to-gray-900',
  'fifa-23.png': 'from-green-900 via-cyan-900 to-gray-900',
  'cod-mw3.png': 'from-orange-900 via-red-900 to-gray-900',
  'cod-cold-war.png': 'from-gray-900 via-red-900 to-gray-900',
  'bf5.png': 'from-green-900 via-gray-800 to-gray-900',
  'bf2042.png': 'from-blue-900 via-gray-800 to-gray-900',
  'moh-ab.png': 'from-amber-900 via-gray-800 to-gray-900',
  'nfs-heat.png': 'from-red-900 via-orange-900 to-gray-900',
  'nfs-unbound.png': 'from-purple-900 via-yellow-800 to-gray-900',
  'forza-horizon-5.png': 'from-blue-900 via-orange-800 to-gray-900',
  'f1-23.png': 'from-red-900 via-blue-900 to-gray-900',
  'acc.png': 'from-blue-800 via-gray-800 to-gray-900',
};

export default function HomePage() {
  const { setPage, addToCart, setSelectedGame } = useStore();
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFeaturedGames();
  }, []);

  const fetchFeaturedGames = async () => {
    try {
      const res = await fetch('/api/games');
      if (res.ok) {
        const games = await res.json();
        setFeaturedGames(games.filter((g: Game) => g.featured).slice(0, 6));
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (e: React.MouseEvent, game: Game) => {
    e.stopPropagation();
    addToCart(game);
    toast({
      title: 'Ajouté au panier',
      description: `${game.title} a été ajouté à votre panier`,
    });
  };

  const handleGameClick = (game: Game) => {
    setSelectedGame(game);
    setPage('game-detail');
  };

  const categories = [
    { name: 'Combat', icon: '🥊', color: 'from-orange-500/20 to-orange-900/20 border-orange-500/30' },
    { name: 'Sport', icon: '⚽', color: 'from-green-500/20 to-green-900/20 border-green-500/30' },
    { name: 'Guerre', icon: '💥', color: 'from-red-600/20 to-red-900/20 border-red-600/30' },
    { name: 'Course', icon: '🏎️', color: 'from-cyan-500/20 to-cyan-900/20 border-cyan-500/30' },
  ];

  const stats = [
    { icon: Gamepad2, label: 'Jeux disponibles', value: '25+' },
    { icon: Users, label: 'Clients satisfaits', value: '500+' },
    { icon: Trophy, label: 'Prix compétitifs', value: 'FCFA' },
    { icon: Zap, label: 'Livraison instantanée', value: '100%' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a2e] to-[#0f0f0f]" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#00ff87] rounded-full blur-[128px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#7c3aed] rounded-full blur-[128px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <Badge className="bg-[#00ff87]/10 text-[#00ff87] border-[#00ff87]/30 px-4 py-1.5 text-sm">
              <Gamepad2 className="h-4 w-4 mr-1" />
              Boutique #1 au Gabon
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-tight">
              Votre univers gaming
              <br />
              <span className="text-[#00ff87] neon-text-glow">commence ici</span>
            </h1>

            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
              Découvrez les meilleurs jeux PC aux meilleurs prix. Paiement facile via Mobile Money au Gabon.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                onClick={() => setPage('catalog')}
                className="bg-[#00ff87] text-[#0f0f0f] hover:bg-[#00cc6a] font-bold text-lg px-8 py-6 cursor-pointer neon-glow"
              >
                Découvrir nos jeux
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setPage('register')}
                className="border-[#7c3aed] text-[#7c3aed] hover:bg-[#7c3aed]/10 font-semibold text-lg px-8 py-6 cursor-pointer"
              >
                Créer un compte
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-[#0a0a0a]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="text-center p-4 md:p-6 rounded-xl bg-[#1a1a2e]/50 border border-white/5"
                >
                  <Icon className="h-8 w-8 text-[#00ff87] mx-auto mb-3" />
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Games */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Jeux <span className="text-[#00ff87]">en vedette</span>
              </h2>
              <p className="text-gray-400 mt-1">Les titres les plus populaires du moment</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => setPage('catalog')}
              className="text-[#00ff87] hover:text-[#00cc6a] hover:bg-[#00ff87]/10 cursor-pointer"
            >
              Voir tout <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-72 rounded-xl bg-[#1a1a2e]/50 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredGames.map((game, i) => {
                const gradientClass = gameGradients[game.imageUrl.split('/').pop() || ''] || 'from-purple-900 via-blue-900 to-gray-900';
                return (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    whileHover={{ y: -4 }}
                    onClick={() => handleGameClick(game)}
                    className="game-card-hover rounded-xl bg-[#1a1a2e]/80 border border-white/5 overflow-hidden cursor-pointer group"
                  >
                    <div className={`relative h-48 bg-gradient-to-br ${gradientClass} overflow-hidden`}>
                      <img
                        src={game.imageUrl}
                        alt={game.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-transparent to-transparent" />
                    </div>
                    <div className="p-4 space-y-3">
                      <h3 className="text-white font-semibold group-hover:text-[#00ff87] transition-colors">
                        {game.title}
                      </h3>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, si) => (
                          <Star
                            key={si}
                            className={`h-3.5 w-3.5 ${
                              si < Math.floor(game.rating)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-600'
                            }`}
                          />
                        ))}
                        <span className="text-gray-500 text-xs ml-1">{game.rating}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#00ff87] font-bold">
                          {game.price.toLocaleString('fr-FR')} <span className="text-xs font-normal text-gray-400">FCFA</span>
                        </span>
                        <Button
                          size="sm"
                          onClick={(e) => handleAddToCart(e, game)}
                          className="bg-[#00ff87] text-[#0f0f0f] hover:bg-[#00cc6a] font-semibold cursor-pointer"
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Acheter
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-[#0a0a0a]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Explorez par <span className="text-[#7c3aed]">catégorie</span>
            </h2>
            <p className="text-gray-400 mt-2">Trouvez le jeu parfait pour vous</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.map((cat, i) => (
              <motion.button
                key={cat.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage('catalog')}
                className={`p-6 rounded-xl bg-gradient-to-br ${cat.color} border border-white/10 text-center cursor-pointer transition-all hover:border-white/20`}
              >
                <div className="text-3xl mb-3">{cat.icon}</div>
                <div className="text-white font-semibold">{cat.name}</div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-8 md:p-12 rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#0f0f0f] border border-[#00ff87]/20 neon-glow"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Prêt à jouer ? 🎮
            </h2>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">
              Inscrivez-vous maintenant et accédez à notre catalogue complet de jeux PC. Paiement sécurisé via Mobile Money.
            </p>
            <Button
              size="lg"
              onClick={() => setPage('register')}
              className="bg-[#00ff87] text-[#0f0f0f] hover:bg-[#00cc6a] font-bold px-8 py-6 cursor-pointer"
            >
              Commencer maintenant
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
