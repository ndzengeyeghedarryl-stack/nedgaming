'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Clock, CheckCircle, ShoppingBag, Download, HardDrive, ExternalLink, CloudDownload, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface OrderItem {
  id: string;
  gameId: string;
  price: number;
  game: {
    id: string;
    title: string;
    imageUrl: string;
    category: string;
    downloadUrl: string;
    downloadLink: string;
    fileSize: string;
    version: string;
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

function getDownloadProvider(link: string): { name: string; color: string; icon: string } {
  if (link.includes('mediafire.com')) {
    return { name: 'MediaFire', color: 'from-blue-500/20 to-blue-900/20 border-blue-500/30', icon: '🔵' };
  }
  if (link.includes('mega.nz')) {
    return { name: 'Mega', color: 'from-red-500/20 to-red-900/20 border-red-500/30', icon: '🔴' };
  }
  return { name: 'Lien direct', color: 'from-green-500/20 to-green-900/20 border-green-500/30', icon: '🟢' };
}

export default function OrdersPage() {
  const { user, setPage } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

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

  const handleExternalDownload = (gameTitle: string, downloadLink: string, gameId: string) => {
    setDownloadingIds(prev => new Set(prev).add(gameId));

    // Open the external link in a new tab
    window.open(downloadLink, '_blank', 'noopener,noreferrer');

    toast({
      title: 'Lien de téléchargement ouvert !',
      description: `${gameTitle} - Le lien MediaFire/Mega s'est ouvert dans un nouvel onglet`,
    });

    // Remove downloading state after 2 seconds
    setTimeout(() => {
      setDownloadingIds(prev => {
        const next = new Set(prev);
        next.delete(gameId);
        return next;
      });
    }, 2000);
  };

  const handleDirectDownload = async (gameId: string, gameTitle: string) => {
    if (!user) return;

    setDownloadingIds(prev => new Set(prev).add(gameId));

    try {
      const res = await fetch(`/api/download/${gameId}?userId=${user.id}`);
      if (!res.ok) {
        const data = await res.json();
        toast({
          title: 'Erreur',
          description: data.error || 'Téléchargement impossible',
          variant: 'destructive',
        });
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const contentDisposition = res.headers.get('Content-Disposition');
      let filename = `${gameTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Setup.zip`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+?)"?$/);
        if (match) filename = match[1];
      }
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Téléchargement démarré !',
        description: `${gameTitle} est en cours de téléchargement`,
      });
    } catch {
      toast({
        title: 'Erreur',
        description: 'Erreur lors du téléchargement',
        variant: 'destructive',
      });
    } finally {
      setDownloadingIds(prev => {
        const next = new Set(prev);
        next.delete(gameId);
        return next;
      });
    }
  };

  // Collect all purchased games
  const allPurchasedGames = orders
    .filter(o => o.status === 'confirmed' || o.status === 'delivered')
    .flatMap(order => order.items);

  const uniquePurchasedGames = Array.from(
    new Map(allPurchasedGames.map(item => [item.game.id, item])).values()
  );

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
            Vous devez être connecté pour voir vos commandes et télécharger vos jeux.
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
            Mes <span className="text-[#00ff87]">jeux</span> & commandes
          </h1>
          <p className="text-gray-400 mt-1">Téléchargez vos jeux achetés via MediaFire ou Mega</p>
        </motion.div>

        {/* === MES JEUX TELECHARGEABLES === */}
        {uniquePurchasedGames.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-[#00ff87]/10 border border-[#00ff87]/20">
                <CloudDownload className="h-5 w-5 text-[#00ff87]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Mes jeux disponibles au téléchargement</h2>
                <p className="text-gray-500 text-sm">{uniquePurchasedGames.length} jeu(x) acheté(s) - Cliquez pour télécharger via MediaFire ou Mega</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {uniquePurchasedGames.map((item, i) => {
                const provider = getDownloadProvider(item.game.downloadLink || '');
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                  >
                    <Card className="bg-[#1a1a2e]/80 border-[#00ff87]/10 hover:border-[#00ff87]/30 transition-all group overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-[#7c3aed]/30 to-[#1a1a2e] flex-shrink-0">
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
                            <h3 className="text-white font-semibold text-sm truncate group-hover:text-[#00ff87] transition-colors">
                              {item.game.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-[#00ff87]/10 text-[#00ff87] border-[#00ff87]/20">
                                {item.game.category}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-2 text-gray-500 text-xs">
                              <span className="flex items-center gap-1">
                                <HardDrive className="h-3 w-3" />
                                {item.game.fileSize || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Provider Badge */}
                        <div className={`mt-3 mb-3 p-2 rounded-lg bg-gradient-to-r ${provider.color} border flex items-center gap-2`}>
                          <span className="text-base">{provider.icon}</span>
                          <span className="text-xs text-white font-medium">Télécharger via {provider.name}</span>
                          <ExternalLink className="h-3 w-3 text-white/60 ml-auto" />
                        </div>

                        {/* External Download Button */}
                        {item.game.downloadLink ? (
                          <Button
                            className="w-full bg-[#00ff87] text-[#0f0f0f] hover:bg-[#00cc6a] font-semibold cursor-pointer"
                            size="sm"
                            disabled={downloadingIds.has(item.gameId)}
                            onClick={() => handleExternalDownload(item.game.title, item.game.downloadLink, item.gameId)}
                          >
                            {downloadingIds.has(item.gameId) ? (
                              <>
                                <ExternalLink className="mr-2 h-4 w-4 animate-pulse" />
                                Ouverture du lien...
                              </>
                            ) : (
                              <>
                                <CloudDownload className="mr-2 h-4 w-4" />
                                Télécharger sur {provider.name}
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button
                            className="w-full bg-[#00ff87] text-[#0f0f0f] hover:bg-[#00cc6a] font-semibold cursor-pointer"
                            size="sm"
                            disabled={downloadingIds.has(item.gameId)}
                            onClick={() => handleDirectDownload(item.gameId, item.game.title)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Télécharger
                          </Button>
                        )}

                        {/* Security notice */}
                        <div className="flex items-center gap-1.5 mt-2 text-gray-600 text-[10px]">
                          <ShieldCheck className="h-3 w-3 text-[#00ff87]" />
                          <span>Lien sécurisé - Achat vérifié</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* === HISTORIQUE DES COMMANDES === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/20">
              <Package className="h-5 w-5 text-[#7c3aed]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Historique des commandes</h2>
              <p className="text-gray-500 text-sm">Détails de toutes vos transactions Mobile Money</p>
            </div>
          </div>

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
                          {order.items.map((item) => {
                            const provider = getDownloadProvider(item.game.downloadLink || '');
                            return (
                              <div
                                key={item.id}
                                className="flex items-center gap-3 p-3 rounded-lg bg-[#0f0f0f]/30"
                              >
                                <div className="w-12 h-14 rounded overflow-hidden bg-gradient-to-br from-[#7c3aed]/30 to-[#1a1a2e] flex-shrink-0">
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
                                  <p className="text-white text-sm font-medium truncate">{item.game.title}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-gray-500 text-xs">{item.game.fileSize}</span>
                                    <span className="text-gray-600 text-xs">•</span>
                                    <span className="text-xs text-blue-400/70">{provider.name}</span>
                                  </div>
                                </div>
                                <span className="text-gray-400 text-sm flex-shrink-0 hidden sm:block">
                                  {item.price.toLocaleString('fr-FR')} FCFA
                                </span>
                                {(order.status === 'confirmed' || order.status === 'delivered') && item.game.downloadLink && (
                                  <Button
                                    size="sm"
                                    className="bg-[#00ff87] text-[#0f0f0f] hover:bg-[#00cc6a] font-semibold text-xs flex-shrink-0 cursor-pointer"
                                    onClick={() => handleExternalDownload(item.game.title, item.game.downloadLink, item.gameId)}
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    {provider.name}
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 text-gray-500 text-xs">
                          <span>Paiement Mobile Money: {order.phone}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
