'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, ShoppingCart, ArrowLeft, Shield, Clock, HardDrive, Magnet, Download, CheckCircle, ShieldCheck, Copy, Info, ExternalLink, Monitor, Cpu, MemoryStick, Gpu, HardDriveUpload, Layers, AlertOctagon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

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
  'fifa-19.png': 'from-green-900 via-emerald-900 to-gray-900',
  'cod-mw3.png': 'from-orange-900 via-red-900 to-gray-900',
  'bf5.png': 'from-green-900 via-gray-800 to-gray-900',
  'bf2042.png': 'from-blue-900 via-gray-800 to-gray-900',
  'moh-ab.png': 'from-amber-900 via-gray-800 to-gray-900',
  'nfs-heat.png': 'from-red-900 via-orange-900 to-gray-900',
  'forza-horizon-5.png': 'from-blue-900 via-orange-800 to-gray-900',
  'acc.png': 'from-blue-800 via-gray-800 to-gray-900',
};

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

export default function GameDetailPage() {
  const { selectedGame, setPage, addToCart, cart, user } = useStore();
  const { toast } = useToast();
  const [purchased, setPurchased] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!user || !selectedGame) return;
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch(`/api/purchases?userId=${user.id}&gameId=${selectedGame.id}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setPurchased(data.purchased);
        }
      } catch {
        // ignore
      }
    };
    check();
    return () => { cancelled = true; };
  }, [user, selectedGame]);

  const handleTorrentDownload = () => {
    if (!selectedGame || !selectedGame.downloadLink) return;

    setDownloading(true);

    if (selectedGame.downloadLink.startsWith('magnet:')) {
      window.open(selectedGame.downloadLink, '_self');
    } else {
      window.open(selectedGame.downloadLink, '_blank', 'noopener,noreferrer');
    }

    toast({
      title: 'Lien torrent ouvert !',
      description: `${selectedGame.title} - Le lien torrent va s'ouvrir dans votre client torrent`,
    });

    setTimeout(() => setDownloading(false), 2000);
  };

  const handleCopyLink = () => {
    if (!selectedGame || !selectedGame.downloadLink) return;
    navigator.clipboard.writeText(selectedGame.downloadLink).then(() => {
      toast({
        title: 'Lien copié !',
        description: `Le lien torrent a été copié dans le presse-papiers`,
      });
    }).catch(() => {
      toast({
        title: 'Erreur',
        description: 'Impossible de copier le lien',
        variant: 'destructive',
      });
    });
  };

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
  const dlType = getDownloadType(game.downloadLink || '');
  const TypeIcon = dlType.icon;
  const hasLink = !!game.downloadLink;

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
              {purchased && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-[#00ff87] text-[#0f0f0f] px-3 py-1 text-sm font-semibold">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Acheté
                  </Badge>
                </div>
              )}
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
                    Vedette
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

            {/* Download Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center p-3 rounded-lg bg-[#1a1a2e]/30 border border-white/5">
                <TypeIcon className="h-5 w-5 text-[#00ff87] mx-auto mb-1" />
                <span className="text-xs text-gray-400 block">Source</span>
                <span className="text-xs text-white font-medium">{dlType.name}</span>
              </div>
              <div className="text-center p-3 rounded-lg bg-[#1a1a2e]/30 border border-white/5">
                <Shield className="h-5 w-5 text-[#00ff87] mx-auto mb-1" />
                <span className="text-xs text-gray-400 block">Sécurisé</span>
                <span className="text-xs text-white font-medium">100%</span>
              </div>
              <div className="text-center p-3 rounded-lg bg-[#1a1a2e]/30 border border-white/5">
                <HardDrive className="h-5 w-5 text-[#00ff87] mx-auto mb-1" />
                <span className="text-xs text-gray-400 block">Taille</span>
                <span className="text-xs text-white font-medium">{game.fileSize || 'N/A'}</span>
              </div>
              <div className="text-center p-3 rounded-lg bg-[#1a1a2e]/30 border border-white/5">
                <Clock className="h-5 w-5 text-[#00ff87] mx-auto mb-1" />
                <span className="text-xs text-gray-400 block">Version</span>
                <span className="text-xs text-white font-medium">v{game.version || '1.0'}</span>
              </div>
            </div>

            {/* System Requirements */}
            {(game.minOS || game.minCPU || game.minRAM || game.minGPU) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-[#1a1a2e]/50 border-white/5">
                  <CardContent className="p-6">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Monitor className="h-5 w-5 text-[#7c3aed]" />
                      Configuration requise
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Minimum Requirements */}
                      <div className="p-4 rounded-xl bg-[#0f0f0f]/60 border border-red-500/10">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20">
                            <span className="text-red-400 text-xs font-semibold">MINIMUM</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {game.minOS && (
                            <div className="flex items-start gap-3">
                              <Monitor className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-gray-500 text-[10px] uppercase tracking-wider">Système d'exploitation</p>
                                <p className="text-gray-300 text-sm">{game.minOS}</p>
                              </div>
                            </div>
                          )}
                          {game.minCPU && (
                            <div className="flex items-start gap-3">
                              <Cpu className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-gray-500 text-[10px] uppercase tracking-wider">Processeur</p>
                                <p className="text-gray-300 text-sm">{game.minCPU}</p>
                              </div>
                            </div>
                          )}
                          {game.minRAM && (
                            <div className="flex items-start gap-3">
                              <MemoryStick className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-gray-500 text-[10px] uppercase tracking-wider">Mémoire vive (RAM)</p>
                                <p className="text-gray-300 text-sm">{game.minRAM}</p>
                              </div>
                            </div>
                          )}
                          {game.minGPU && (
                            <div className="flex items-start gap-3">
                              <Gpu className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-gray-500 text-[10px] uppercase tracking-wider">Carte graphique</p>
                                <p className="text-gray-300 text-sm">{game.minGPU}</p>
                              </div>
                            </div>
                          )}
                          {game.minStorage && (
                            <div className="flex items-start gap-3">
                              <HardDriveUpload className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-gray-500 text-[10px] uppercase tracking-wider">Espace disque</p>
                                <p className="text-gray-300 text-sm">{game.minStorage}</p>
                              </div>
                            </div>
                          )}
                          {game.minDirectX && (
                            <div className="flex items-start gap-3">
                              <Layers className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-gray-500 text-[10px] uppercase tracking-wider">DirectX</p>
                                <p className="text-gray-300 text-sm">{game.minDirectX}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Recommended Requirements */}
                      <div className="p-4 rounded-xl bg-[#0f0f0f]/60 border border-green-500/10">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="px-2.5 py-1 rounded-md bg-green-500/10 border border-green-500/20">
                            <span className="text-green-400 text-xs font-semibold">RECOMMANDÉE</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {game.recOS && (
                            <div className="flex items-start gap-3">
                              <Monitor className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-gray-500 text-[10px] uppercase tracking-wider">Système d'exploitation</p>
                                <p className="text-gray-300 text-sm">{game.recOS}</p>
                              </div>
                            </div>
                          )}
                          {game.recCPU && (
                            <div className="flex items-start gap-3">
                              <Cpu className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-gray-500 text-[10px] uppercase tracking-wider">Processeur</p>
                                <p className="text-gray-300 text-sm">{game.recCPU}</p>
                              </div>
                            </div>
                          )}
                          {game.recRAM && (
                            <div className="flex items-start gap-3">
                              <MemoryStick className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-gray-500 text-[10px] uppercase tracking-wider">Mémoire vive (RAM)</p>
                                <p className="text-gray-300 text-sm">{game.recRAM}</p>
                              </div>
                            </div>
                          )}
                          {game.recGPU && (
                            <div className="flex items-start gap-3">
                              <Gpu className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-gray-500 text-[10px] uppercase tracking-wider">Carte graphique</p>
                                <p className="text-gray-300 text-sm">{game.recGPU}</p>
                              </div>
                            </div>
                          )}
                          {game.recStorage && (
                            <div className="flex items-start gap-3">
                              <HardDriveUpload className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-gray-500 text-[10px] uppercase tracking-wider">Espace disque</p>
                                <p className="text-gray-300 text-sm">{game.recStorage}</p>
                              </div>
                            </div>
                          )}
                          {game.recDirectX && (
                            <div className="flex items-start gap-3">
                              <Layers className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-gray-500 text-[10px] uppercase tracking-wider">DirectX</p>
                                <p className="text-gray-300 text-sm">{game.recDirectX}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Price and Buy / Download */}
            <Card className="bg-[#1a1a2e]/80 border-[#00ff87]/20 neon-glow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400">Prix</span>
                  <span className="text-[#00ff87] text-3xl font-bold">
                    {game.price.toLocaleString('fr-FR')} <span className="text-lg font-normal text-gray-400">FCFA</span>
                  </span>
                </div>

                {purchased ? (
                  <div className="space-y-3">
                    {hasLink ? (
                      <>
                        {/* Torrent Type Badge */}
                        <div className={`p-3 rounded-lg border ${dlType.bgColor} flex items-center gap-3`}>
                          <TypeIcon className={`h-5 w-5 ${dlType.color}`} />
                          <div className="flex-1">
                            <p className="text-white text-sm font-medium">Telecharger via {dlType.name}</p>
                            <p className="text-gray-500 text-xs">Lien sécurisé - Achat vérifié</p>
                          </div>
                          {game.downloadLink.startsWith('magnet:') && (
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-purple-500/10 text-purple-400 border-purple-500/20">
                              magnet:
                            </Badge>
                          )}
                        </div>

                        <Button
                          size="lg"
                          disabled={downloading}
                          onClick={handleTorrentDownload}
                          className="w-full bg-[#00ff87] text-[#0f0f0f] hover:bg-[#00cc6a] font-bold py-6 text-lg cursor-pointer"
                        >
                          {downloading ? (
                            <>
                              <Magnet className="mr-2 h-5 w-5 animate-pulse" />
                              Ouverture du torrent...
                            </>
                          ) : (
                            <>
                              <Magnet className="mr-2 h-5 w-5" />
                              Telecharger via torrent
                            </>
                          )}
                        </Button>

                        <Button
                          size="lg"
                          variant="outline"
                          onClick={handleCopyLink}
                          className="w-full border-white/10 text-gray-300 hover:text-white hover:border-white/20 cursor-pointer"
                        >
                          <Copy className="mr-2 h-5 w-5" />
                          Copier le lien torrent
                        </Button>

                        <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                          <CheckCircle className="h-4 w-4 text-[#00ff87]" />
                          <span>Vous avez acheté ce jeu - Téléchargement illimité</span>
                        </div>
                        <div className="text-center text-gray-600 text-xs">
                          Le lien va ouvrir votre client torrent (qBittorrent, uTorrent, etc.) pour télécharger le jeu complet
                        </div>
                      </>
                    ) : (
                      <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20 text-center">
                        <Info className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                        <p className="text-yellow-400 text-sm font-medium">Lien torrent non configuré</p>
                        <p className="text-gray-500 text-xs mt-1">Le lien de téléchargement sera bientôt disponible. Contactez l&apos;administrateur.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
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
                        className="w-full border-[#00ff87]/30 text-[#00ff87] hover:bg-[#00ff87]/10 cursor-pointer"
                      >
                        Voir le panier
                      </Button>
                    )}
                    {/* Show what download type will be used */}
                    <div className={`p-2.5 rounded-lg border ${dlType.bgColor} flex items-center gap-2`}>
                      <TypeIcon className={`h-4 w-4 ${dlType.color}`} />
                      <span className="text-xs text-gray-400">Après achat, téléchargement via</span>
                      <span className={`text-xs font-medium ${dlType.color}`}>{dlType.name}</span>
                    </div>

                    {/* uTorrent Notice */}
                    <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                      <div className="flex items-start gap-2">
                        <AlertOctagon className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-cyan-400 text-xs font-semibold mb-0.5">uTorrent requis</p>
                          <p className="text-gray-400 text-[11px]">
                            Le téléchargement se fait via uTorrent. Installez-le pour que le jeu se télécharge automatiquement après achat.
                          </p>
                          <a
                            href="https://www.utorrent.com/downloads/win"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-1 text-cyan-400 hover:text-cyan-300 text-[11px] font-medium transition-colors"
                          >
                            <Download className="h-3 w-3" />
                            Télécharger uTorrent
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
