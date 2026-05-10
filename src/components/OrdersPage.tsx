'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Clock, CheckCircle, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface OrderItem {
  id: string;
  gameId: string;
  price: number;
  game: {
    id: string;
    title: string;
    imageUrl: string;
    category: string;
  };
}

interface Order {
  id: string;
  userId: string;
  total: number;
  status: string;
  phone: string;
  createdAt: string;
  items: OrderItem[];
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'En attente', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock },
  confirmed: { label: 'Confirmé', color: 'bg-[#00ff87]/20 text-[#00ff87] border-[#00ff87]/30', icon: CheckCircle },
  delivered: { label: 'Livré', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: CheckCircle },
};

export default function OrdersPage() {
  const { user, setPage } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/orders?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="p-6 rounded-full bg-[#1a1a2e]/50 border border-white/5 inline-block">
            <Package className="h-16 w-16 text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Connectez-vous</h2>
          <p className="text-gray-400 max-w-md">
            Vous devez être connecté pour voir vos commandes.
          </p>
          <Button
            onClick={() => setPage('login')}
            className="bg-[#00ff87] text-[#0f0f0f] hover:bg-[#00cc6a] font-semibold cursor-pointer"
          >
            Se connecter
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
            onClick={() => setPage('home')}
            className="text-gray-400 hover:text-white mb-4 cursor-pointer"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Accueil
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Mes <span className="text-[#00ff87]">commandes</span>
          </h1>
          <p className="text-gray-400 mt-1">Suivez l&apos;état de vos commandes</p>
        </motion.div>

        {/* Orders */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 rounded-xl bg-[#1a1a2e]/50 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 space-y-6"
          >
            <div className="p-6 rounded-full bg-[#1a1a2e]/50 border border-white/5 inline-block">
              <ShoppingBag className="h-16 w-16 text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">Aucune commande</h2>
            <p className="text-gray-400 max-w-md">
              Vous n&apos;avez pas encore passé de commande. Parcourez notre catalogue pour trouver votre prochain jeu !
            </p>
            <Button
              onClick={() => setPage('catalog')}
              className="bg-[#00ff87] text-[#0f0f0f] hover:bg-[#00cc6a] font-semibold cursor-pointer"
            >
              Parcourir le catalogue
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, i) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-[#1a1a2e]/80 border-white/5 overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <CardTitle className="text-white text-lg">
                            Commande #{order.id.slice(-6).toUpperCase()}
                          </CardTitle>
                          <p className="text-gray-500 text-sm">
                            {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={`${status.color}`} variant="outline">
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                          <span className="text-[#00ff87] font-bold text-lg">
                            {order.total.toLocaleString('fr-FR')} FCFA
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-2 rounded-lg bg-[#0f0f0f]/30"
                          >
                            <div className="w-10 h-10 rounded overflow-hidden bg-gradient-to-br from-[#7c3aed]/30 to-[#1a1a2e] flex-shrink-0">
                              <img
                                src={item.game.imageUrl}
                                alt={item.game.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm truncate">{item.game.title}</p>
                            </div>
                            <span className="text-gray-400 text-sm flex-shrink-0">
                              {item.price.toLocaleString('fr-FR')} FCFA
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 text-gray-500 text-xs">
                        <span>Téléphone: {order.phone}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
