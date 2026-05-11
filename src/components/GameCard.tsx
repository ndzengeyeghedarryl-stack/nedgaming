'use client';

import { Game } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart } from 'lucide-react';
import { useStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface GameCardProps {
  game: Game;
}

const categoryColors: Record<string, string> = {
  Action: 'bg-red-500/20 text-red-400 border-red-500/30',
  RPG: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Sport: 'bg-green-500/20 text-green-400 border-green-500/30',
  Aventure: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Stratégie: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Combat: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Guerre: 'bg-red-600/20 text-red-500 border-red-600/30',
  Course: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

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

export default function GameCard({ game }: GameCardProps) {
  const { addToCart, setPage, setSelectedGame, cart } = useStore();
  const { toast } = useToast();

  const isInCart = cart.some((item) => item.game.id === game.id);

  const gradientClass = gameGradients[game.imageUrl.split('/').pop() || ''] || 'from-purple-900 via-blue-900 to-gray-900';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(game);
    toast({
      title: 'Ajouté au panier',
      description: `${game.title} a été ajouté à votre panier`,
    });
  };

  const handleClick = () => {
    setSelectedGame(game);
    setPage('game-detail');
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
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
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        onClick={handleClick}
        className="game-card-hover bg-[#1a1a2e]/80 border-white/5 overflow-hidden cursor-pointer group"
      >
        {/* Image */}
        <div className={`relative h-48 sm:h-56 bg-gradient-to-br ${gradientClass} overflow-hidden`}>
          <img
            src={game.imageUrl}
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-transparent to-transparent" />
          <Badge
            className={`absolute top-3 left-3 text-xs ${categoryColors[game.category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}
            variant="outline"
          >
            {game.category}
          </Badge>
          {game.featured && (
            <Badge className="absolute top-3 right-3 text-xs bg-[#00ff87]/20 text-[#00ff87] border-[#00ff87]/30" variant="outline">
              ⭐ Vedette
            </Badge>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          <h3 className="text-white font-semibold text-base truncate group-hover:text-[#00ff87] transition-colors">
            {game.title}
          </h3>

          <p className="text-gray-500 text-xs">{game.developer}</p>

          <div className="flex items-center gap-1">
            {renderStars(game.rating)}
            <span className="text-gray-500 text-xs ml-1">{game.rating}</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[#00ff87] font-bold text-lg">
              {game.price.toLocaleString('fr-FR')} <span className="text-xs font-normal text-gray-400">FCFA</span>
            </span>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={isInCart}
              className={`${
                isInCart
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-[#00ff87] text-[#0f0f0f] hover:bg-[#00cc6a] cursor-pointer'
              } font-semibold`}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              {isInCart ? 'Ajouté' : 'Acheter'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
