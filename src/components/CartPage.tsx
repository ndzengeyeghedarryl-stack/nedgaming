'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, ShoppingCart, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

export default function CartPage() {
  const { cart, removeFromCart, setPage, user } = useStore();
  const { toast } = useToast();

  const total = cart.reduce((sum, item) => sum + item.game.price * item.quantity, 0);

  const handleRemove = (gameId: string, title: string) => {
    removeFromCart(gameId);
    toast({
      title: 'Retiré du panier',
      description: `${title} a été retiré de votre panier`,
    });
  };

  const handleCheckout = () => {
    if (!user) {
      toast({
        title: 'Connexion requise',
        description: 'Veuillez vous connecter pour passer commande',
        variant: 'destructive',
      });
      setPage('login');
      return;
    }
    setPage('checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="p-6 rounded-full bg-[#1a1a2e]/50 border border-white/5 inline-block">
            <ShoppingCart className="h-16 w-16 text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Votre panier est vide</h2>
          <p className="text-gray-400 max-w-md">
            Parcourez notre catalogue et ajoutez des jeux à votre panier pour commencer vos achats.
          </p>
          <Button
            onClick={() => setPage('catalog')}
            className="bg-[#00ff87] text-[#0f0f0f] hover:bg-[#00cc6a] font-semibold cursor-pointer"
          >
            Parcourir le catalogue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => setPage('catalog')}
            className="text-gray-400 hover:text-white mb-4 cursor-pointer"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continuer les achats
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Mon <span className="text-[#00ff87]">panier</span>
          </h1>
          <p className="text-gray-400 mt-1">{cart.length} article{cart.length > 1 ? 's' : ''} dans votre panier</p>
        </motion.div>

        {/* Cart Items */}
        <div className="space-y-4 mb-8">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.game.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-[#1a1a2e]/80 border-white/5 overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-4">
                      {/* Game Image Placeholder */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-gradient-to-br from-[#7c3aed]/30 to-[#1a1a2e] flex-shrink-0 overflow-hidden">
                        <img
                          src={item.game.imageUrl}
                          alt={item.game.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>

                      {/* Game Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate">{item.game.title}</h3>
                        <p className="text-gray-500 text-sm">{item.game.developer}</p>
                        <p className="text-gray-500 text-xs mt-1">{item.game.category}</p>
                      </div>

                      {/* Price */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-[#00ff87] font-bold text-lg">
                          {item.game.price.toLocaleString('fr-FR')}
                        </p>
                        <p className="text-gray-500 text-xs">FCFA</p>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(item.game.id, item.game.title)}
                        className="text-gray-500 hover:text-red-400 hover:bg-red-400/10 flex-shrink-0 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-[#1a1a2e]/80 border-[#00ff87]/20 neon-glow">
            <CardContent className="p-6">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-400">
                  <span>Sous-total ({cart.length} article{cart.length > 1 ? 's' : ''})</span>
                  <span>{total.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Livraison</span>
                  <span className="text-[#00ff87]">Gratuite</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between">
                  <span className="text-white font-semibold text-lg">Total</span>
                  <span className="text-[#00ff87] font-bold text-2xl">
                    {total.toLocaleString('fr-FR')} <span className="text-sm font-normal text-gray-400">FCFA</span>
                  </span>
                </div>
              </div>

              <Button
                size="lg"
                onClick={handleCheckout}
                className="w-full bg-[#00ff87] text-[#0f0f0f] hover:bg-[#00cc6a] font-bold py-6 text-lg cursor-pointer"
              >
                Passer à la caisse
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <p className="text-gray-500 text-xs text-center mt-3">
                Paiement sécurisé via Mobile Money (MTN, Moov, Airtel)
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
