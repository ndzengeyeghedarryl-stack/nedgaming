'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, ShoppingCart, ArrowLeft, Download, Shield, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const gameGradients: Record<string, string> = {
  'gta-v.png': 'from-green-900 via-blue-900 to-gray-900',
  'cod-mw3.png': 'from-orange-900 via-red-900 to-gray-900',
  'halo-infinite.png': 'from-green-800 via-cyan-900 to-gray-900',
  'elden-ring.png': 'from-amber-900 via-yellow-900 to-gray-900',
  'cyberpunk-2077.png': 'from-yellow-800 via-pink-900 to-gray-900',
  'witcher-3.png': 'from-red-900 via-gray-800 to-gray-900',
  'fc-24.png': 'from-green-800 via-emerald-900 to-gray-900',
  'nba-2k24.png': 'from-orange-900 via-blue-900 to-gray-900',
  'ac-mirage.png': 'from-indigo-900 via-gray-800 to-gray-900',
  'god-of-war-ragnarok.png': 'from-blue-900 via-cyan-900 to-gray-900',
  'aoe-iv.png': 'from-amber-800 via-red-900 to-gray-900',
  'civ-vi.png': 'from-blue-800 via-purple-900 to-gray-900',
  'rdr2.png': 'from-orange-900 via-red-900 to-gray-900',
  'fifa-24.png': 'from-green-800 via-teal-900 to-gray-900',
};

const categoryColors: Record<string, string> = {
  Action: 'bg-red-500/20 text-red-400 border-red-500/30',
  RPG: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Sport: 'bg-green-500/20 text-green-400 border-green-500/30',
  Aventure: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Stratégie: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export default function GameDetailPage() {
  const { selectedGame, setPage, addToCart, cart } = useStore();
  const { toast } = useToast();

  if (!selectedGame) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">Jeu non trouvé</p>
          <Button
            onClick={() => setPage('catalog')}
            className="bg-[#00ff87] text-[#0f0f0f] hover:bg-[#00cc6a] cursor-pointer"
          >
            Retour au catalogue
          </Button>
        </div>
      </div>
    );
  }

  const game = selectedGame;
  const isInCart = cart.some((item) => item.game.id === game.id);
  const gradientClass = gameGradients[game.imageUrl.split('/').pop() || ''] || 'from-purple-900 via-blue-900 to-gray-900';

  const handleAddToCart = () => {
    addToCart(game);
    toast({
      title: 'Ajouté au panier',
      description: `${game.title} a été ajouté à votre panier`,
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-5 w-5 ${
            i < fullStars
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-600'
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => setPage('catalog')}
            className="text-gray-400 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au catalogue
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Game Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${gradientClass} aspect-square max-h-[500px]`}>
              <img
                src={game.imageUrl}
                alt={game.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent" />
            </div>
          </motion.div>

          {/* Game Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge
                  className={`${categoryColors[game.category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}
                  variant="outline"
                >
                  {game.category}
                </Badge>
                {game.featured && (
                  <Badge className="bg-[#00ff87]/20 text-[#00ff87] border-[#00ff87]/30" variant="outline">
                    ⭐ Vedette
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white">{game.title}</h1>

              <p className="text-gray-400">
                Développeur : <span className="text-gray-200">{game.developer}</span>
              </p>

              <div className="flex items-center gap-2">
                {renderStars(game.rating)}
                <span className="text-gray-400 ml-2">{game.rating}/5</span>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[#1a1a2e]/50 border border-white/5">
              <h3 className="text-white font-semibold mb-3">Description</h3>
              <p className="text-gray-400 leading-relaxed">{game.description}</p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-[#1a1a2e]/30 border border-white/5">
                <Download className="h-5 w-5 text-[#00ff87] mx-auto mb-1" />
                <span className="text-xs text-gray-400">Téléchargement</span>
              </div>
              <div className="text-center p-3 rounded-lg bg-[#1a1a2e]/30 border border-white/5">
                <Shield className="h-5 w-5 text-[#00ff87] mx-auto mb-1" />
                <span className="text-xs text-gray-400">Clé officielle</span>
              </div>
              <div className="text-center p-3 rounded-lg bg-[#1a1a2e]/30 border border-white/5">
                <Clock className="h-5 w-5 text-[#00ff87] mx-auto mb-1" />
                <span className="text-xs text-gray-400">Livraison instant.</span>
              </div>
            </div>

            {/* Price and Buy */}
            <Card className="bg-[#1a1a2e]/80 border-[#00ff87]/20 neon-glow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400">Prix</span>
                  <span className="text-[#00ff87] text-3xl font-bold">
                    {game.price.toLocaleString('fr-FR')} <span className="text-lg font-normal text-gray-400">FCFA</span>
                  </span>
                </div>
                <Button
                  size="lg"
                  disabled={isInCart}
                  onClick={handleAddToCart}
                  className={`w-full font-bold py-6 text-lg cursor-pointer ${
                    isInCart
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-[#00ff87] text-[#0f0f0f] hover:bg-[#00cc6a]'
                  }`}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {isInCart ? 'Déjà dans le panier' : 'Ajouter au panier'}
                </Button>
                {isInCart && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setPage('cart')}
                    className="w-full mt-3 border-[#00ff87]/30 text-[#00ff87] hover:bg-[#00ff87]/10 cursor-pointer"
                  >
                    Voir le panier
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
