'use client';

import { useStore, Game } from '@/lib/store';
import GameCard from '@/components/GameCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const categories = ['Tous', 'Action', 'RPG', 'Sport', 'Aventure', 'Stratégie'];

export default function CatalogPage() {
  const { setPage } = useStore();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchGames();
  }, [selectedCategory]);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'Tous') params.set('category', selectedCategory);
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`/api/games?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setGames(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGames();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Catalogue de <span className="text-[#00ff87]">jeux</span>
          </h1>
          <p className="text-gray-400">Découvrez notre sélection de jeux PC</p>
        </motion.div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un jeu..."
              className="pl-10 bg-[#1a1a2e]/50 border-white/10 text-white placeholder:text-gray-600 focus:border-[#00ff87] h-12"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <SlidersHorizontal className="h-4 w-4 text-gray-500 flex-shrink-0" />
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#00ff87] text-[#0f0f0f] hover:bg-[#00cc6a] font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Games Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-72 rounded-xl bg-[#1a1a2e]/50 animate-pulse" />
            ))}
          </div>
        ) : games.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-gray-400 text-lg mb-4">Aucun jeu trouvé</p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Tous');
              }}
              variant="outline"
              className="border-[#00ff87]/30 text-[#00ff87] hover:bg-[#00ff87]/10 cursor-pointer"
            >
              Réinitialiser les filtres
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {games.map((game) => (
                <motion.div
                  key={game.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <GameCard game={game} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Results count */}
        {!loading && games.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              {games.length} jeu{games.length > 1 ? 'x' : ''} trouvé{games.length > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
