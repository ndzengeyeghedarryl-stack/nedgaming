'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Settings, ExternalLink, Save, Link2, HardDrive, Tag, RefreshCw, CheckCircle, AlertCircle, Shield, Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface AdminGame {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  downloadUrl: string;
  downloadLink: string;
  fileSize: string;
  version: string;
  category: string;
  developer: string;
  rating: number;
  featured: boolean;
}

function getDownloadProvider(link: string): { name: string; color: string; icon: string } {
  if (link.includes('mediafire.com')) {
    return { name: 'MediaFire', color: 'text-blue-400', icon: 'M' };
  }
  if (link.includes('mega.nz')) {
    return { name: 'Mega', color: 'text-red-400', icon: 'M' };
  }
  if (link.includes('drive.google.com')) {
    return { name: 'Google Drive', color: 'text-green-400', icon: 'G' };
  }
  if (link.includes('1fichier.com')) {
    return { name: '1Fichier', color: 'text-yellow-400', icon: '1' };
  }
  return { name: 'Autre', color: 'text-gray-400', icon: '?' };
}

export default function AdminPage() {
  const { user, setPage } = useStore();
  const [games, setGames] = useState<AdminGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, string>>({});
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  const ADMIN_PASSWORD = 'nedgaming2024';

  useEffect(() => {
    if (isAuthenticated) {
      fetchGames();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/games');
      if (res.ok) {
        const data = await res.json();
        setGames(data);
      }
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les jeux',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast({
        title: 'Accès administrateur accordé',
        description: 'Bienvenue dans le panneau d\'administration',
      });
    } else {
      toast({
        title: 'Mot de passe incorrect',
        description: 'Le mot de passe administrateur est invalide',
        variant: 'destructive',
      });
    }
  };

  const startEditing = (game: AdminGame) => {
    setEditingId(game.id);
    setEditData({
      downloadLink: game.downloadLink,
      fileSize: game.fileSize,
      version: game.version,
      price: game.price.toString(),
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveGame = async (gameId: string) => {
    setSavingId(gameId);
    try {
      const res = await fetch('/api/admin/games', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          downloadLink: editData.downloadLink,
          fileSize: editData.fileSize,
          version: editData.version,
          price: parseFloat(editData.price) || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGames(prev => prev.map(g => g.id === gameId ? data.game : g));
        setEditingId(null);
        setEditData({});
        toast({
          title: 'Jeu mis à jour !',
          description: `Les informations ont été sauvegardées avec succès`,
        });
      } else {
        const data = await res.json();
        toast({
          title: 'Erreur',
          description: data.error || 'Impossible de mettre à jour',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Erreur',
        description: 'Erreur de connexion au serveur',
        variant: 'destructive',
      });
    } finally {
      setSavingId(null);
    }
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Card className="bg-[#1a1a2e]/80 border-[#7c3aed]/20">
            <CardHeader className="text-center">
              <div className="mx-auto p-4 rounded-full bg-[#7c3aed]/10 border border-[#7c3aed]/20 w-fit mb-4">
                <Shield className="h-10 w-10 text-[#7c3aed]" />
              </div>
              <CardTitle className="text-2xl text-white">Administration</CardTitle>
              <p className="text-gray-400 text-sm mt-2">
                Entrez le mot de passe administrateur pour gérer les liens de téléchargement
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Mot de passe admin</label>
                <Input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                  placeholder="Entrez le mot de passe..."
                  className="bg-[#0f0f0f] border-white/10 text-white placeholder-gray-600"
                />
              </div>
              <Button
                onClick={handleAdminLogin}
                className="w-full bg-[#7c3aed] text-white hover:bg-[#6d28d9] font-semibold cursor-pointer"
              >
                <Shield className="mr-2 h-4 w-4" />
                Accéder à l&apos;administration
              </Button>
              <Button
                variant="ghost"
                onClick={() => setPage('home')}
                className="w-full text-gray-400 hover:text-white cursor-pointer"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à l&apos;accueil
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#7c3aed]/10 border border-[#7c3aed]/20">
                <Settings className="h-6 w-6 text-[#7c3aed]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Panneau <span className="text-[#7c3aed]">Admin</span>
                </h1>
                <p className="text-gray-400 text-sm">Gérez les liens de téléchargement MediaFire/Mega pour chaque jeu</p>
              </div>
            </div>
            <Button
              onClick={fetchGames}
              variant="outline"
              className="border-[#7c3aed]/30 text-[#7c3aed] hover:bg-[#7c3aed]/10 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
        >
          <Card className="bg-[#1a1a2e]/80 border-white/5">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-white">{games.length}</p>
              <p className="text-gray-500 text-xs">Total jeux</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1a1a2e]/80 border-white/5">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-400">
                {games.filter(g => g.downloadLink.includes('mediafire.com')).length}
              </p>
              <p className="text-gray-500 text-xs">MediaFire</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1a1a2e]/80 border-white/5">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-400">
                {games.filter(g => g.downloadLink.includes('mega.nz')).length}
              </p>
              <p className="text-gray-500 text-xs">Mega</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1a1a2e]/80 border-white/5">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-400">
                {games.filter(g => g.downloadLink && !g.downloadLink.includes('mediafire.com') && !g.downloadLink.includes('mega.nz')).length}
              </p>
              <p className="text-gray-500 text-xs">Autres</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8 p-4 rounded-xl bg-[#7c3aed]/5 border border-[#7c3aed]/20"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-[#7c3aed] flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-[#7c3aed] font-medium mb-1">Comment configurer les liens de telechargement</p>
              <p className="text-gray-400">
                1. Uploadez vos fichiers de jeux sur <span className="text-blue-400">MediaFire</span> ou <span className="text-red-400">Mega</span><br />
                2. Copiez le lien de partage du fichier<br />
                3. Collez-le dans le champ &quot;Lien de telechargement&quot; ci-dessous<br />
                4. Cliquez sur &quot;Sauvegarder&quot; pour mettre a jour
              </p>
            </div>
          </div>
        </motion.div>

        {/* Games List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-40 rounded-xl bg-[#1a1a2e]/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {games.map((game, i) => {
              const provider = getDownloadProvider(game.downloadLink);
              const isEditing = editingId === game.id;
              const isSaving = savingId === game.id;

              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className={`bg-[#1a1a2e]/80 border-white/5 overflow-hidden transition-colors ${isEditing ? 'border-[#7c3aed]/40 ring-1 ring-[#7c3aed]/20' : ''}`}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Game Image */}
                        <div className="w-20 h-28 rounded-lg overflow-hidden bg-gradient-to-br from-[#7c3aed]/30 to-[#1a1a2e] flex-shrink-0">
                          <img
                            src={game.imageUrl}
                            alt={game.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>

                        {/* Game Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-semibold text-lg">{game.title}</h3>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-white/5 text-gray-400 border-white/10">
                              {game.category}
                            </Badge>
                            {game.featured && (
                              <Badge className="bg-[#00ff87]/10 text-[#00ff87] border-[#00ff87]/20 text-[10px] px-1.5 py-0" variant="outline">
                                Vedette
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-500 text-sm mb-3">{game.developer} - {game.price.toLocaleString('fr-FR')} FCFA</p>

                          {isEditing ? (
                            <div className="space-y-3">
                              {/* Edit Form */}
                              <div>
                                <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1.5">
                                  <Link2 className="h-3 w-3" />
                                  Lien de telechargement (MediaFire / Mega / Google Drive / etc.)
                                </label>
                                <Input
                                  value={editData.downloadLink || ''}
                                  onChange={(e) => setEditData(prev => ({ ...prev, downloadLink: e.target.value }))}
                                  placeholder="https://www.mediafire.com/file/xxxxx/nom_du_jeu/file"
                                  className="bg-[#0f0f0f] border-white/10 text-white placeholder-gray-600 text-sm"
                                />
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <div>
                                  <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1.5">
                                    <HardDrive className="h-3 w-3" />
                                    Taille du fichier
                                  </label>
                                  <Input
                                    value={editData.fileSize || ''}
                                    onChange={(e) => setEditData(prev => ({ ...prev, fileSize: e.target.value }))}
                                    placeholder="94.5 GB"
                                    className="bg-[#0f0f0f] border-white/10 text-white placeholder-gray-600 text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-400 mb-1 block">Version</label>
                                  <Input
                                    value={editData.version || ''}
                                    onChange={(e) => setEditData(prev => ({ ...prev, version: e.target.value }))}
                                    placeholder="1.0.8"
                                    className="bg-[#0f0f0f] border-white/10 text-white placeholder-gray-600 text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1.5">
                                    <Tag className="h-3 w-3" />
                                    Prix (FCFA)
                                  </label>
                                  <Input
                                    type="number"
                                    value={editData.price || ''}
                                    onChange={(e) => setEditData(prev => ({ ...prev, price: e.target.value }))}
                                    placeholder="15000"
                                    className="bg-[#0f0f0f] border-white/10 text-white placeholder-gray-600 text-sm"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => saveGame(game.id)}
                                  disabled={isSaving}
                                  className="bg-[#00ff87] text-[#0f0f0f] hover:bg-[#00cc6a] font-semibold cursor-pointer"
                                  size="sm"
                                >
                                  {isSaving ? (
                                    <>
                                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                      Sauvegarde...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="mr-2 h-4 w-4" />
                                      Sauvegarder
                                    </>
                                  )}
                                </Button>
                                <Button
                                  onClick={cancelEditing}
                                  variant="ghost"
                                  className="text-gray-400 hover:text-white cursor-pointer"
                                  size="sm"
                                >
                                  Annuler
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              {/* Display Mode */}
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                                  game.downloadLink.includes('mediafire.com')
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    : game.downloadLink.includes('mega.nz')
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                }`}>
                                  {provider.name}
                                </div>
                                <span className="text-gray-500 text-xs">
                                  {game.fileSize} - v{game.version}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#0f0f0f]/50 border border-white/5">
                                <Link2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                <p className="text-gray-400 text-xs truncate flex-1">
                                  {game.downloadLink || 'Aucun lien configuré'}
                                </p>
                                {game.downloadLink && (
                                  <a
                                    href={game.downloadLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#7c3aed] hover:text-[#00ff87] transition-colors flex-shrink-0"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </a>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-3">
                                <Button
                                  onClick={() => startEditing(game)}
                                  variant="outline"
                                  className="border-[#7c3aed]/30 text-[#7c3aed] hover:bg-[#7c3aed]/10 cursor-pointer"
                                  size="sm"
                                >
                                  <Settings className="mr-2 h-4 w-4" />
                                  Modifier le lien
                                </Button>
                                {game.downloadLink && (
                                  <div className="flex items-center gap-1 text-green-400 text-xs">
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    Lien configuré
                                  </div>
                                )}
                                {!game.downloadLink && (
                                  <div className="flex items-center gap-1 text-yellow-400 text-xs">
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    Aucun lien
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
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
