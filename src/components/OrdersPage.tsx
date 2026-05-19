'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Clock, CheckCircle, ShoppingBag, HardDrive, ExternalLink, ShieldCheck, Magnet, Download, Copy, Info, XCircle, AlertTriangle, RefreshCw, AlertOctagon } from 'lucide-react';
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
  provider: string;
  createdAt: string;
  items: OrderItem[];
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock; description: string }> = {
  pending: { label: 'En attente de validation', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock, description: 'Votre paiement est en cours de verification par l\'administrateur' },
  confirmed: { label: 'Confirmé', color: 'bg-[#00ff87]/20 text-[#00ff87] border-[#00ff87]/30', icon: CheckCircle, description: 'Paiement verifié - Telechargement debloqué' },
  rejected: { label: 'Refusé', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle, description: 'Le paiement n\'a pas pu etre verifié. Contactez l\'administrateur' },
  delivered: { label: 'Livré', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: CheckCircle, description: 'Jeu telechargé avec succes' },
};

function getDownloadType(link: string): { name: string; color: string; bgColor: string; icon: typeof Magnet } {
  if (link.startsWith('magnet:')) {
    return { name: 'Magnet Torrent', color: 'text-purple-400', bgColor: 'bg-purple-500/10 border-purple-500/20', icon: Magnet };
  }
  if (link.endsWith('.torrent') || link.includes('.torrent?')) {
    return { name: 'Fichier Torrent', color: 'text-green-400', bgColor: 'bg-green-500/10 border-green-500/20', icon: Download };
  }
  if (link.includes('1337x') || link.includes('thepiratebay') || link.includes('rutracker') || link.includes('torrent')) {
    return { name: 'Torrent', color: 'text-orange-400', bgColor: 'bg-orange-500/10 border-orange-500/20', icon: Magnet };
  }
  if (link) {
    return { name: 'Lien de telechargement', color: 'text-blue-400', bgColor: 'bg-blue-500/10 border-blue-500/20', icon: ExternalLink };
  }
  return { name: 'Non configuré', color: 'text-gray-500', bgColor: 'bg-gray-500/10 border-gray-500/20', icon: Info };
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

  const handleTorrentDownload = (gameTitle: string, downloadLink: string, gameId: string) => {
    setDownloadingIds(prev => new Set(prev).add(gameId));

    if (downloadLink.startsWith('magnet:')) {
      window.open(downloadLink, '_self');
    } else {
      window.open(downloadLink, '_blank', 'noopener,noreferrer');
    }

    toast({
      title: 'Lien torrent ouvert !',
      description: `${gameTitle} - Le lien torrent va s'ouvrir dans votre client torrent`,
    });

    setTimeout(() => {
      setDownloadingIds(prev => {
        const next = new Set(prev);
        next.delete(gameId);
        return next;
      });
    }, 2000);
  };

  const handleCopyLink = (gameTitle: string, downloadLink: string) => {
    navigator.clipboard.writeText(downloadLink).then(() => {
      toast({
        title: 'Lien copié !',
        description: `Le lien torrent de ${gameTitle} a été copié dans le presse-papiers`,
      });
    }).catch(() => {
      toast({
        title: 'Erreur',
        description: 'Impossible de copier le lien',
        variant: 'destructive',
      });
    });
  };

  // Only confirmed/delivered games can be downloaded
  const allPurchasedGames = orders
    .filter(o => o.status === 'confirmed' || o.status === 'delivered')
    .flatMap(order => order.items);

  const uniquePurchasedGames = Array.from(
    new Map(allPurchasedGames.map(item => [item.game.id, item])).values()
  );

  // Count pending orders
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const rejectedOrders = orders.filter(o => o.status === 'rejected');

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
          <p className="text-gray-400 mt-1">Téléchargez vos jeux achetés une fois que l'administrateur a confirmé votre paiement</p>
        </motion.div>

        {/* Pending Alert */}
        {pendingOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-400 font-medium mb-1">
                  {pendingOrders.length} commande(s) en attente de validation
                </p>
                <p className="text-gray-400 text-sm">
                  L'administrateur doit vérifier votre paiement Mobile Money avant de débloquer l'accès au téléchargement. Vous serez notifié dès que votre commande sera confirmée.
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={fetchOrders}
                className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 ml-auto cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Rejected Alert */}
        {rejectedOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-500/5 border border-red-500/20"
          >
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-medium mb-1">
                  {rejectedOrders.length} commande(s) refusée(s)
                </p>
                <p className="text-gray-400 text-sm">
                  Le paiement n'a pas pu être vérifié. Veuillez contacter l'administrateur au +241 76 52 00 18 (Airtel) ou +241 66 86 98 05 (Moov).
                </p>
              </div>
            </div>
          </motion.div>
        )}

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
                <Magnet className="h-5 w-5 text-[#00ff87]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Mes jeux disponibles au telechargement</h2>
                <p className="text-gray-500 text-sm">{uniquePurchasedGames.length} jeu(x) debloqué(s) - Cliquez pour télécharger via torrent</p>
              </div>
            </div>

            {/* uTorrent Notice */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20"
            >
              <div className="flex items-start gap-3">
                <AlertOctagon className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-cyan-400 font-semibold mb-1">uTorrent requis pour le téléchargement</p>
                  <p className="text-gray-400 text-sm">
                    Pour télécharger vos jeux automatiquement, vous devez avoir <span className="text-white font-medium">uTorrent</span> installé sur votre PC. 
                    Quand vous cliquez sur le bouton de téléchargement, le lien torrent s'ouvrira directement dans uTorrent et le jeu se téléchargera automatiquement.
                  </p>
                  <a
                    href="https://www.utorrent.com/downloads/win"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Télécharger uTorrent gratuitement
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {uniquePurchasedGames.map((item, i) => {
                const dlType = getDownloadType(item.game.downloadLink || '');
                const TypeIcon = dlType.icon;
                const hasLink = !!item.game.downloadLink;
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

                        {/* Torrent Type Badge */}
                        <div className={`mt-3 mb-3 p-2 rounded-lg border ${dlType.bgColor} flex items-center gap-2`}>
                          <TypeIcon className={`h-4 w-4 ${dlType.color}`} />
                          <span className="text-xs text-white font-medium">{dlType.name}</span>
                          {hasLink && item.game.downloadLink.startsWith('magnet:') && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 bg-purple-500/10 text-purple-400 border-purple-500/20 ml-auto">
                              magnet:
                            </Badge>
                          )}
                        </div>

                        {/* Download Buttons */}
                        {hasLink ? (
                          <div className="space-y-2">
                            <Button
                              className="w-full bg-[#00ff87] text-[#0f0f0f] hover:bg-[#00cc6a] font-semibold cursor-pointer"
                              size="sm"
                              disabled={downloadingIds.has(item.gameId)}
                              onClick={() => handleTorrentDownload(item.game.title, item.game.downloadLink, item.gameId)}
                            >
                              {downloadingIds.has(item.gameId) ? (
                                <>
                                  <Magnet className="mr-2 h-4 w-4 animate-pulse" />
                                  Ouverture du torrent...
                                </>
                              ) : (
                                <>
                                  <Magnet className="mr-2 h-4 w-4" />
                                  Telecharger via torrent
                                </>
                              )}
                            </Button>
                            <Button
                              className="w-full bg-[#1a1a2e] text-gray-300 hover:text-white border border-white/10 hover:border-white/20 cursor-pointer"
                              size="sm"
                              onClick={() => handleCopyLink(item.game.title, item.game.downloadLink)}
                            >
                              <Copy className="mr-2 h-3.5 w-3.5" />
                              Copier le lien torrent
                            </Button>
                          </div>
                        ) : (
                          <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20 text-center">
                            <p className="text-yellow-400 text-xs">Lien torrent non configuré</p>
                            <p className="text-gray-500 text-[10px] mt-0.5">Contactez l&apos;administrateur</p>
                          </div>
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
                const isConfirmed = order.status === 'confirmed' || order.status === 'delivered';
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className={`bg-[#1a1a2e]/80 border-white/5 overflow-hidden ${
                      order.status === 'pending' ? 'border-yellow-500/20' : 
                      order.status === 'rejected' ? 'border-red-500/20' : ''
                    }`}>
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
                        {/* Status description */}
                        {order.status === 'pending' && (
                          <div className="mt-2 p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/10 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-yellow-400" />
                            <span className="text-yellow-400 text-xs">{status.description}</span>
                          </div>
                        )}
                        {order.status === 'rejected' && (
                          <div className="mt-2 p-2 rounded-lg bg-red-500/5 border border-red-500/10 flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-400" />
                            <span className="text-red-400 text-xs">{status.description}</span>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {order.items.map((item) => {
                            const dlType = getDownloadType(item.game.downloadLink || '');
                            const TypeIcon = dlType.icon;
                            const hasLink = !!item.game.downloadLink;
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
                                    <span className="text-gray-600 text-xs">·</span>
                                    <span className={`text-xs ${dlType.color} flex items-center gap-1`}>
                                      <TypeIcon className="h-3 w-3" />
                                      {dlType.name}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-gray-400 text-sm flex-shrink-0 hidden sm:block">
                                  {item.price.toLocaleString('fr-FR')} FCFA
                                </span>
                                {/* Only show download buttons for confirmed/delivered orders */}
                                {isConfirmed && hasLink && (
                                  <Button
                                    size="sm"
                                    className="bg-[#00ff87] text-[#0f0f0f] hover:bg-[#00cc6a] font-semibold text-xs flex-shrink-0 cursor-pointer"
                                    onClick={() => handleTorrentDownload(item.game.title, item.game.downloadLink, item.gameId)}
                                  >
                                    <Magnet className="h-3 w-3 mr-1" />
                                    Torrent
                                  </Button>
                                )}
                                {isConfirmed && hasLink && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-gray-400 hover:text-white text-xs flex-shrink-0 cursor-pointer"
                                    onClick={() => handleCopyLink(item.game.title, item.game.downloadLink)}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                )}
                                {/* Show locked status for pending orders */}
                                {order.status === 'pending' && (
                                  <Badge variant="outline" className="text-[10px] px-2 py-1 bg-yellow-500/5 text-yellow-500 border-yellow-500/20 flex-shrink-0">
                                    <Clock className="h-3 w-3 mr-1" />
                                    En attente
                                  </Badge>
                                )}
                                {/* Show rejected status */}
                                {order.status === 'rejected' && (
                                  <Badge variant="outline" className="text-[10px] px-2 py-1 bg-red-500/5 text-red-500 border-red-500/20 flex-shrink-0">
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Refusé
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between gap-2 text-gray-500 text-xs">
                          <span>Paiement Mobile Money: {order.phone}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={fetchOrders}
                            className="text-gray-500 hover:text-white text-xs cursor-pointer"
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Actualiser
                          </Button>
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
