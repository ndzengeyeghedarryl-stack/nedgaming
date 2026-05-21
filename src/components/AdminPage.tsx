'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Settings, ExternalLink, Save, Link2, HardDrive, Tag, RefreshCw, CheckCircle, AlertCircle, Shield, Magnet, Download, Copy, Info, Users, LogOut, UserCircle, Monitor, Cpu, MemoryStick, Gpu, HardDriveUpload, Layers, ChevronDown, ChevronUp, Package, XCircle, Clock, Phone, CreditCard, DollarSign, Mail, Calendar, Trash2, UserPlus } from 'lucide-react';
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
  minOS: string;
  minCPU: string;
  minRAM: string;
  minGPU: string;
  minStorage: string;
  minDirectX: string;
  recOS: string;
  recCPU: string;
  recRAM: string;
  recGPU: string;
  recStorage: string;
  recDirectX: string;
}

interface AdminAccount {
  name: string;
  password: string;
  role: string;
}

const ADMIN_ACCOUNTS: AdminAccount[] = [
  { name: 'NED', password: 'hope2016', role: 'Administrateur principal' },
];

function getDownloadType(link: string): { name: string; color: string; bgColor: string; icon: typeof Magnet } {
  if (link.startsWith('magnet:')) {
    return { name: 'Magnet', color: 'text-purple-400', bgColor: 'bg-purple-500/10 border-purple-500/20', icon: Magnet };
  }
  if (link.endsWith('.torrent') || link.includes('.torrent?')) {
    return { name: 'Fichier .torrent', color: 'text-green-400', bgColor: 'bg-green-500/10 border-green-500/20', icon: Download };
  }
  if (link.includes('1337x') || link.includes('thepiratebay') || link.includes('rutracker') || link.includes('torrent')) {
    return { name: 'Site Torrent', color: 'text-orange-400', bgColor: 'bg-orange-500/10 border-orange-500/20', icon: Magnet };
  }
  if (link) {
    return { name: 'Lien', color: 'text-blue-400', bgColor: 'bg-blue-500/10 border-blue-500/20', icon: ExternalLink };
  }
  return { name: 'Non configuré', color: 'text-gray-500', bgColor: 'bg-gray-500/10 border-gray-500/20', icon: Info };
}

interface AdminOrder {
  id: string;
  userId: string;
  total: number;
  status: string;
  phone: string;
  provider: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  items: {
    id: string;
    gameId: string;
    price: number;
    game: {
      id: string;
      title: string;
      imageUrl: string;
      category: string;
      price: number;
    };
  }[];
}

export default function AdminPage() {
  const { user, setPage } = useStore();
  const [games, setGames] = useState<AdminGame[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, string>>({});
  const [adminName, setAdminName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<AdminAccount | null>(null);
  const [showSysReqs, setShowSysReqs] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'games' | 'orders' | 'users'>('orders');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [usersList, setUsersList] = useState<{ id: string; name: string; email: string; phone: string | null; createdAt: string }[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      fetchGames();
      fetchOrders();
      fetchUsers();
    } else {
      setLoading(false);
      setOrdersLoading(false);
      setUsersLoading(false);
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

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les commandes',
        variant: 'destructive',
      });
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les utilisateurs',
        variant: 'destructive',
      });
    } finally {
      setUsersLoading(false);
    }
  };

  const handleConfirmOrder = async (orderId: string, status: 'confirmed' | 'rejected') => {
    setConfirmingId(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        toast({
          title: status === 'confirmed' ? 'Commande confirmée !' : 'Commande refusée',
          description: status === 'confirmed'
            ? 'L\'utilisateur peut maintenant télécharger ses jeux'
            : 'L\'utilisateur a été notifié du refus',
        });
      } else {
        toast({
          title: 'Erreur',
          description: 'Impossible de mettre à jour la commande',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Erreur',
        description: 'Erreur de connexion',
        variant: 'destructive',
      });
    } finally {
      setConfirmingId(null);
    }
  };

  const handleAdminLogin = () => {
    if (!adminName.trim()) {
      toast({
        title: 'Nom requis',
        description: 'Veuillez entrer votre nom d\'administrateur',
        variant: 'destructive',
      });
      return;
    }

    const found = ADMIN_ACCOUNTS.find(
      a => a.name.toLowerCase() === adminName.trim().toLowerCase() && a.password === adminPassword
    );

    if (found) {
      setIsAuthenticated(true);
      setCurrentAdmin(found);
      toast({
        title: `Bienvenue ${found.name} !`,
        description: `Accès ${found.role} accordé`,
      });
    } else {
      toast({
        title: 'Identifiants incorrects',
        description: 'Le nom ou le mot de passe est invalide',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentAdmin(null);
    setAdminName('');
    setAdminPassword('');
    toast({
      title: 'Déconnecté',
      description: 'Vous avez été déconnecté du panneau admin',
    });
  };

  const startEditing = (game: AdminGame) => {
    setEditingId(game.id);
    setEditData({
      downloadLink: game.downloadLink,
      fileSize: game.fileSize,
      version: game.version,
      price: game.price.toString(),
      minOS: game.minOS || '',
      minCPU: game.minCPU || '',
      minRAM: game.minRAM || '',
      minGPU: game.minGPU || '',
      minStorage: game.minStorage || '',
      minDirectX: game.minDirectX || '',
      recOS: game.recOS || '',
      recCPU: game.recCPU || '',
      recRAM: game.recRAM || '',
      recGPU: game.recGPU || '',
      recStorage: game.recStorage || '',
      recDirectX: game.recDirectX || '',
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
          minOS: editData.minOS,
          minCPU: editData.minCPU,
          minRAM: editData.minRAM,
          minGPU: editData.minGPU,
          minStorage: editData.minStorage,
          minDirectX: editData.minDirectX,
          recOS: editData.recOS,
          recCPU: editData.recCPU,
          recRAM: editData.recRAM,
          recGPU: editData.recGPU,
          recStorage: editData.recStorage,
          recDirectX: editData.recDirectX,
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

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link).then(() => {
      toast({
        title: 'Lien copié !',
        description: 'Le lien a été copié dans le presse-papiers',
      });
    });
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
                Connectez-vous avec vos identifiants administrateur
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Nom d'administrateur</label>
                <Input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                  placeholder="Entrez votre nom..."
                  className="bg-[#0f0f0f] border-white/10 text-white placeholder-gray-600"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Mot de passe</label>
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
                Se connecter
              </Button>

              {/* Admin accounts list */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-500 text-xs font-medium">Comptes administrateurs enregistrés</span>
                </div>
                <div className="space-y-2">
                  {ADMIN_ACCOUNTS.map((admin, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0f0f0f]/50 border border-white/5">
                      <div className="w-8 h-8 rounded-full bg-[#7c3aed]/20 border border-[#7c3aed]/30 flex items-center justify-center">
                        <UserCircle className="h-5 w-5 text-[#7c3aed]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{admin.name}</p>
                        <p className="text-gray-500 text-[10px]">{admin.role}</p>
                      </div>
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-[#7c3aed]/10 text-[#7c3aed] border-[#7c3aed]/20">
                        Admin
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#7c3aed]/10 border border-[#7c3aed]/20">
                <Settings className="h-6 w-6 text-[#7c3aed]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Panneau <span className="text-[#7c3aed]">Admin</span>
                </h1>
                <p className="text-gray-400 text-sm">Gérez les commandes et les liens torrent</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Current Admin */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/20">
                <UserCircle className="h-4 w-4 text-[#7c3aed]" />
                <span className="text-sm font-medium text-[#7c3aed]">{currentAdmin?.name}</span>
                <span className="text-[10px] text-[#7c3aed]/60">({currentAdmin?.role})</span>
              </div>
              <Button
                onClick={() => { fetchGames(); fetchOrders(); fetchUsers(); }}
                variant="outline"
                className="border-[#7c3aed]/30 text-[#7c3aed] hover:bg-[#7c3aed]/10 cursor-pointer"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="text-gray-400 hover:text-red-400 hover:bg-red-400/10 cursor-pointer"
                title="Déconnexion"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'orders'
                  ? 'bg-[#7c3aed] text-white'
                  : 'bg-[#1a1a2e]/50 text-gray-400 hover:text-white hover:bg-[#1a1a2e]'
              }`}
            >
              <Package className="h-4 w-4" />
              Commandes
              {orders.filter(o => o.status === 'pending').length > 0 && (
                <span className="bg-yellow-400 text-[#0f0f0f] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {orders.filter(o => o.status === 'pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('games')}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'games'
                  ? 'bg-[#7c3aed] text-white'
                  : 'bg-[#1a1a2e]/50 text-gray-400 hover:text-white hover:bg-[#1a1a2e]'
              }`}
            >
              <Settings className="h-4 w-4" />
              Gestion des jeux
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'bg-[#7c3aed] text-white'
                  : 'bg-[#1a1a2e]/50 text-gray-400 hover:text-white hover:bg-[#1a1a2e]'
              }`}
            >
              <Users className="h-4 w-4" />
              Utilisateurs
              {usersList.length > 0 && (
                <span className="bg-[#7c3aed]/30 text-[#7c3aed] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {usersList.length}
                </span>
              )}
            </button>
          </div>
        </motion.div>

        {/* Stats - Orders */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
          >
            <Card className="bg-[#1a1a2e]/80 border-yellow-500/20">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-yellow-400">{orders.filter(o => o.status === 'pending').length}</p>
                <p className="text-gray-500 text-xs">En attente</p>
              </CardContent>
            </Card>
            <Card className="bg-[#1a1a2e]/80 border-[#00ff87]/20">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-[#00ff87]">{orders.filter(o => o.status === 'confirmed').length}</p>
                <p className="text-gray-500 text-xs">Confirmées</p>
              </CardContent>
            </Card>
            <Card className="bg-[#1a1a2e]/80 border-red-500/20">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-red-400">{orders.filter(o => o.status === 'rejected').length}</p>
                <p className="text-gray-500 text-xs">Refusées</p>
              </CardContent>
            </Card>
            <Card className="bg-[#1a1a2e]/80 border-white/5">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-white">{orders.reduce((sum, o) => sum + o.total, 0).toLocaleString('fr-FR')}</p>
                <p className="text-gray-500 text-xs">FCFA total</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats - Games */}
        {activeTab === 'games' && (
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
              <p className="text-2xl font-bold text-purple-400">
                {games.filter(g => g.downloadLink && g.downloadLink.startsWith('magnet:')).length}
              </p>
              <p className="text-gray-500 text-xs">Liens Magnet</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1a1a2e]/80 border-white/5">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-400">
                {games.filter(g => g.downloadLink && (g.downloadLink.endsWith('.torrent') || g.downloadLink.includes('.torrent?'))).length}
              </p>
              <p className="text-gray-500 text-xs">Fichiers .torrent</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1a1a2e]/80 border-white/5">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400">
                {games.filter(g => !g.downloadLink).length}
              </p>
              <p className="text-gray-500 text-xs">Non configurés</p>
            </CardContent>
          </Card>
          </motion.div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {ordersLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-40 rounded-xl bg-[#1a1a2e]/50 animate-pulse" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <div className="p-6 rounded-full bg-[#1a1a2e]/50 border border-white/5 inline-block">
                  <Package className="h-16 w-16 text-gray-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Aucune commande</h2>
                <p className="text-gray-400">Les nouvelles commandes apparaitront ici</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Pending orders first */}
                {[...orders.filter(o => o.status === 'pending'), ...orders.filter(o => o.status !== 'pending')].map((order, i) => {
                  const isPending = order.status === 'pending';
                  const isConfirmed = order.status === 'confirmed';
                  const isRejected = order.status === 'rejected';
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className={`bg-[#1a1a2e]/80 overflow-hidden ${
                        isPending ? 'border-yellow-500/30 ring-1 ring-yellow-500/10' :
                        isRejected ? 'border-red-500/20' :
                        isConfirmed ? 'border-[#00ff87]/20' : 'border-white/5'
                      }`}>
                        <CardHeader className="pb-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <CardTitle className="text-white text-lg flex items-center gap-2">
                                Commande #{order.id.slice(-6).toUpperCase()}
                                {isPending && (
                                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30" variant="outline">
                                    <Clock className="h-3 w-3 mr-1" />
                                    En attente
                                  </Badge>
                                )}
                                {isConfirmed && (
                                  <Badge className="bg-[#00ff87]/20 text-[#00ff87] border-[#00ff87]/30" variant="outline">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Confirmé
                                  </Badge>
                                )}
                                {isRejected && (
                                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30" variant="outline">
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Refusé
                                  </Badge>
                                )}
                              </CardTitle>
                              <p className="text-gray-500 text-sm">
                                {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                                })}
                              </p>
                            </div>
                            <span className="text-[#00ff87] font-bold text-xl">
                              {order.total.toLocaleString('fr-FR')} <span className="text-sm font-normal text-gray-400">FCFA</span>
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {/* Customer info */}
                          <div className="p-3 rounded-lg bg-[#0f0f0f]/30 border border-white/5 mb-4">
                            <p className="text-[#7c3aed] text-xs font-semibold mb-2 uppercase tracking-wider">Informations client</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <UserCircle className="h-4 w-4 text-gray-500" />
                                <span className="text-white font-medium">{order.user.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-300">{order.phone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-300 capitalize">{order.provider || 'Non spécifié'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Games list */}
                          <div className="space-y-2 mb-4">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0f0f0f]/20">
                                <div className="w-10 h-12 rounded overflow-hidden bg-gradient-to-br from-[#7c3aed]/30 to-[#1a1a2e] flex-shrink-0">
                                  <img
                                    src={item.game.imageUrl}
                                    alt={item.game.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm font-medium truncate">{item.game.title}</p>
                                  <p className="text-gray-500 text-xs">{item.game.category}</p>
                                </div>
                                <span className="text-[#00ff87] text-sm font-semibold">{item.price.toLocaleString('fr-FR')} FCFA</span>
                              </div>
                            ))}
                          </div>

                          {/* Action buttons - only for pending orders */}
                          {isPending && (
                            <div className="flex gap-3 pt-3 border-t border-white/5">
                              <Button
                                onClick={() => handleConfirmOrder(order.id, 'confirmed')}
                                disabled={confirmingId === order.id}
                                className="bg-[#00ff87] text-[#0f0f0f] hover:bg-[#00cc6a] font-bold cursor-pointer flex-1"
                                size="lg"
                              >
                                {confirmingId === order.id ? (
                                  <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Validation...</>
                                ) : (
                                  <><CheckCircle className="mr-2 h-4 w-4" />Confirmer le paiement - Debloquer les jeux</>
                                )}
                              </Button>
                              <Button
                                onClick={() => handleConfirmOrder(order.id, 'rejected')}
                                disabled={confirmingId === order.id}
                                variant="outline"
                                className="border-red-500/30 text-red-400 hover:bg-red-500/10 font-semibold cursor-pointer"
                                size="lg"
                              >
                                <XCircle className="mr-2 h-4 w-4" />Refuser
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Info Banner - Games tab */}
        {activeTab === 'games' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8 p-4 rounded-xl bg-[#7c3aed]/5 border border-[#7c3aed]/20"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-[#7c3aed] flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-[#7c3aed] font-medium mb-1">Comment configurer les liens torrent</p>
                <p className="text-gray-400">
                  <span className="text-purple-400 font-medium">Lien Magnet :</span> Commence par <code className="bg-[#0f0f0f] px-1.5 py-0.5 rounded text-purple-300 text-xs">magnet:?xt=urn:btih:...</code> - Ouvre directement le client torrent<br />
                  <span className="text-green-400 font-medium">Fichier .torrent :</span> Lien vers un fichier <code className="bg-[#0f0f0f] px-1.5 py-0.5 rounded text-green-300 text-xs">.torrent</code> hébergé (ex: sur votre serveur ou un hébergeur)<br />
                  <span className="text-orange-400 font-medium">Site Torrent :</span> Lien vers une page de téléchargement (1337x, ThePirateBay, etc.)
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Games List - Games tab */}
        {activeTab === 'games' && (
        <>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-40 rounded-xl bg-[#1a1a2e]/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {games.map((game, i) => {
              const dlType = getDownloadType(game.downloadLink);
              const TypeIcon = dlType.icon;
              const isEditing = editingId === game.id;
              const isSaving = savingId === game.id;
              const hasLink = !!game.downloadLink;

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
                              {/* Edit Form - Torrent Link */}
                              <div>
                                <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1.5">
                                  <Magnet className="h-3 w-3" />
                                  Lien torrent (Magnet / Fichier .torrent / URL)
                                </label>
                                <Input
                                  value={editData.downloadLink || ''}
                                  onChange={(e) => setEditData(prev => ({ ...prev, downloadLink: e.target.value }))}
                                  placeholder="magnet:?xt=urn:btih:XXXXXXXXXX... ou https://exemple.com/jeu.torrent"
                                  className="bg-[#0f0f0f] border-white/10 text-white placeholder-gray-600 text-sm font-mono"
                                />
                                <p className="text-gray-600 text-[10px] mt-1">
                                  Collez ici le lien magnet (magnet:?) ou l&apos;URL vers le fichier .torrent
                                </p>
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

                              {/* System Requirements - Minimum */}
                              <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">
                                    <span className="text-red-400 text-[10px] font-semibold">CONFIG MINIMUM</span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-[10px] text-gray-500 mb-0.5 block flex items-center gap-1"><Monitor className="h-2.5 w-2.5" /> OS</label>
                                    <Input value={editData.minOS || ''} onChange={(e) => setEditData(prev => ({ ...prev, minOS: e.target.value }))} placeholder="Windows 10 64-bit" className="bg-[#0f0f0f] border-white/10 text-white placeholder-gray-600 text-xs h-8" />
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-gray-500 mb-0.5 block flex items-center gap-1"><Cpu className="h-2.5 w-2.5" /> Processeur</label>
                                    <Input value={editData.minCPU || ''} onChange={(e) => setEditData(prev => ({ ...prev, minCPU: e.target.value }))} placeholder="Intel Core i5-6600" className="bg-[#0f0f0f] border-white/10 text-white placeholder-gray-600 text-xs h-8" />
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-gray-500 mb-0.5 block flex items-center gap-1"><MemoryStick className="h-2.5 w-2.5" /> RAM</label>
                                    <Input value={editData.minRAM || ''} onChange={(e) => setEditData(prev => ({ ...prev, minRAM: e.target.value }))} placeholder="8 Go" className="bg-[#0f0f0f] border-white/10 text-white placeholder-gray-600 text-xs h-8" />
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-gray-500 mb-0.5 block flex items-center gap-1"><Gpu className="h-2.5 w-2.5" /> Carte graphique</label>
                                    <Input value={editData.minGPU || ''} onChange={(e) => setEditData(prev => ({ ...prev, minGPU: e.target.value }))} placeholder="NVIDIA GTX 1060" className="bg-[#0f0f0f] border-white/10 text-white placeholder-gray-600 text-xs h-8" />
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-gray-500 mb-0.5 block flex items-center gap-1"><HardDriveUpload className="h-2.5 w-2.5" /> Espace disque</label>
                                    <Input value={editData.minStorage || ''} onChange={(e) => setEditData(prev => ({ ...prev, minStorage: e.target.value }))} placeholder="70 Go" className="bg-[#0f0f0f] border-white/10 text-white placeholder-gray-600 text-xs h-8" />
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-gray-500 mb-0.5 block flex items-center gap-1"><Layers className="h-2.5 w-2.5" /> DirectX</label>
                                    <Input value={editData.minDirectX || ''} onChange={(e) => setEditData(prev => ({ ...prev, minDirectX: e.target.value }))} placeholder="Version 12" className="bg-[#0f0f0f] border-white/10 text-white placeholder-gray-600 text-xs h-8" />
                                  </div>
                                </div>
                              </div>

                              {/* System Requirements - Recommended */}
                              <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20">
                                    <span className="text-green-400 text-[10px] font-semibold">CONFIG RECOMMANDÉE</span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-[10px] text-gray-500 mb-0.5 block flex items-center gap-1"><Monitor className="h-2.5 w-2.5" /> OS</label>
                                    <Input value={editData.recOS || ''} onChange={(e) => setEditData(prev => ({ ...prev, recOS: e.target.value }))} placeholder="Windows 11 64-bit" className="bg-[#0f0f0f] border-white/10 text-white placeholder-gray-600 text-xs h-8" />
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-gray-500 mb-0.5 block flex items-center gap-1"><Cpu className="h-2.5 w-2.5" /> Processeur</label>
                                    <Input value={editData.recCPU || ''} onChange={(e) => setEditData(prev => ({ ...prev, recCPU: e.target.value }))} placeholder="Intel Core i7-9700K" className="bg-[#0f0f0f] border-white/10 text-white placeholder-gray-600 text-xs h-8" />
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-gray-500 mb-0.5 block flex items-center gap-1"><MemoryStick className="h-2.5 w-2.5" /> RAM</label>
                                    <Input value={editData.recRAM || ''} onChange={(e) => setEditData(prev => ({ ...prev, recRAM: e.target.value }))} placeholder="16 Go" className="bg-[#0f0f0f] border-white/10 text-white placeholder-gray-600 text-xs h-8" />
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-gray-500 mb-0.5 block flex items-center gap-1"><Gpu className="h-2.5 w-2.5" /> Carte graphique</label>
                                    <Input value={editData.recGPU || ''} onChange={(e) => setEditData(prev => ({ ...prev, recGPU: e.target.value }))} placeholder="NVIDIA RTX 2060" className="bg-[#0f0f0f] border-white/10 text-white placeholder-gray-600 text-xs h-8" />
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-gray-500 mb-0.5 block flex items-center gap-1"><HardDriveUpload className="h-2.5 w-2.5" /> Espace disque</label>
                                    <Input value={editData.recStorage || ''} onChange={(e) => setEditData(prev => ({ ...prev, recStorage: e.target.value }))} placeholder="70 Go SSD" className="bg-[#0f0f0f] border-white/10 text-white placeholder-gray-600 text-xs h-8" />
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-gray-500 mb-0.5 block flex items-center gap-1"><Layers className="h-2.5 w-2.5" /> DirectX</label>
                                    <Input value={editData.recDirectX || ''} onChange={(e) => setEditData(prev => ({ ...prev, recDirectX: e.target.value }))} placeholder="Version 12" className="bg-[#0f0f0f] border-white/10 text-white placeholder-gray-600 text-xs h-8" />
                                  </div>
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
                                <div className={`px-2.5 py-1 rounded-md text-xs font-medium ${dlType.bgColor} flex items-center gap-1.5`}>
                                  <TypeIcon className={`h-3 w-3 ${dlType.color}`} />
                                  <span className={dlType.color}>{dlType.name}</span>
                                </div>
                                <span className="text-gray-500 text-xs">
                                  {game.fileSize} - v{game.version}
                                </span>
                              </div>
                              {hasLink ? (
                                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#0f0f0f]/50 border border-white/5">
                                  <Magnet className="h-4 w-4 text-purple-400 flex-shrink-0" />
                                  <p className="text-gray-400 text-xs truncate flex-1 font-mono">
                                    {game.downloadLink.length > 80
                                      ? game.downloadLink.substring(0, 80) + '...'
                                      : game.downloadLink}
                                  </p>
                                  <button
                                    onClick={() => handleCopyLink(game.downloadLink)}
                                    className="text-gray-500 hover:text-white transition-colors flex-shrink-0 p-1"
                                    title="Copier le lien"
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </button>
                                  {!game.downloadLink.startsWith('magnet:') && (
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
                              ) : (
                                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                                  <AlertCircle className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                                  <p className="text-yellow-400/70 text-xs">Aucun lien torrent configuré - Cliquez sur Modifier pour ajouter un lien</p>
                                </div>
                              )}
                              <div className="flex items-center gap-2 mt-3">
                                <Button
                                  onClick={() => startEditing(game)}
                                  variant="outline"
                                  className="border-[#7c3aed]/30 text-[#7c3aed] hover:bg-[#7c3aed]/10 cursor-pointer"
                                  size="sm"
                                >
                                  <Settings className="mr-2 h-4 w-4" />
                                  Modifier
                                </Button>
                                {hasLink && (
                                  <div className="flex items-center gap-1 text-green-400 text-xs">
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    Lien configuré
                                  </div>
                                )}
                                {(game.minOS || game.minCPU) && (
                                  <button
                                    onClick={() => setShowSysReqs(showSysReqs === game.id ? null : game.id)}
                                    className="ml-auto flex items-center gap-1 text-gray-500 hover:text-[#7c3aed] text-xs transition-colors cursor-pointer"
                                  >
                                    <Monitor className="h-3.5 w-3.5" />
                                    Config requise
                                    {showSysReqs === game.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                  </button>
                                )}
                              </div>

                              {/* System Requirements Preview */}
                              {showSysReqs === game.id && (game.minOS || game.minCPU) && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2"
                                >
                                  <div className="p-2.5 rounded-lg bg-red-500/5 border border-red-500/10">
                                    <span className="text-red-400 text-[9px] font-semibold uppercase tracking-wider">Minimum</span>
                                    <div className="mt-1.5 space-y-1">
                                      {game.minOS && <p className="text-gray-400 text-[11px]"><span className="text-gray-600">OS:</span> {game.minOS}</p>}
                                      {game.minCPU && <p className="text-gray-400 text-[11px]"><span className="text-gray-600">CPU:</span> {game.minCPU}</p>}
                                      {game.minRAM && <p className="text-gray-400 text-[11px]"><span className="text-gray-600">RAM:</span> {game.minRAM}</p>}
                                      {game.minGPU && <p className="text-gray-400 text-[11px]"><span className="text-gray-600">GPU:</span> {game.minGPU}</p>}
                                      {game.minStorage && <p className="text-gray-400 text-[11px]"><span className="text-gray-600">Disque:</span> {game.minStorage}</p>}
                                      {game.minDirectX && <p className="text-gray-400 text-[11px]"><span className="text-gray-600">DX:</span> {game.minDirectX}</p>}
                                    </div>
                                  </div>
                                  <div className="p-2.5 rounded-lg bg-green-500/5 border border-green-500/10">
                                    <span className="text-green-400 text-[9px] font-semibold uppercase tracking-wider">Recommandée</span>
                                    <div className="mt-1.5 space-y-1">
                                      {game.recOS && <p className="text-gray-400 text-[11px]"><span className="text-gray-600">OS:</span> {game.recOS}</p>}
                                      {game.recCPU && <p className="text-gray-400 text-[11px]"><span className="text-gray-600">CPU:</span> {game.recCPU}</p>}
                                      {game.recRAM && <p className="text-gray-400 text-[11px]"><span className="text-gray-600">RAM:</span> {game.recRAM}</p>}
                                      {game.recGPU && <p className="text-gray-400 text-[11px]"><span className="text-gray-600">GPU:</span> {game.recGPU}</p>}
                                      {game.recStorage && <p className="text-gray-400 text-[11px]"><span className="text-gray-600">Disque:</span> {game.recStorage}</p>}
                                      {game.recDirectX && <p className="text-gray-400 text-[11px]"><span className="text-gray-600">DX:</span> {game.recDirectX}</p>}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
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
        </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Stats - Users */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <Card className="bg-[#1a1a2e]/80 border-[#7c3aed]/20">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-[#7c3aed]">{usersList.length}</p>
                  <p className="text-gray-500 text-xs">Total utilisateurs</p>
                </CardContent>
              </Card>
              <Card className="bg-[#1a1a2e]/80 border-[#00ff87]/20">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-[#00ff87]">{usersList.filter(u => u.phone).length}</p>
                  <p className="text-gray-500 text-xs">Avec téléphone</p>
                </CardContent>
              </Card>
              <Card className="bg-[#1a1a2e]/80 border-white/5">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-white">{usersList.length > 0 ? new Date(usersList[usersList.length - 1].createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '-'}</p>
                  <p className="text-gray-500 text-xs">Dernière inscription</p>
                </CardContent>
              </Card>
              <Card className="bg-[#1a1a2e]/80 border-white/5">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-cyan-400">{usersList.filter(u => { const d = new Date(u.createdAt); const now = new Date(); const diff = now.getTime() - d.getTime(); return diff < 7 * 24 * 60 * 60 * 1000; }).length}</p>
                  <p className="text-gray-500 text-xs">Cette semaine</p>
                </CardContent>
              </Card>
            </div>

            {usersLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 rounded-xl bg-[#1a1a2e]/50 animate-pulse" />
                ))}
              </div>
            ) : usersList.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <div className="p-6 rounded-full bg-[#1a1a2e]/50 border border-white/5 inline-block">
                  <Users className="h-16 w-16 text-gray-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Aucun utilisateur inscrit</h2>
                <p className="text-gray-400">Les nouveaux utilisateurs apparaitront ici</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Table header */}
                <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-2 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                  <div className="col-span-1">#</div>
                  <div className="col-span-3">Nom</div>
                  <div className="col-span-3">Email</div>
                  <div className="col-span-2">Téléphone</div>
                  <div className="col-span-3">Date d'inscription</div>
                </div>
                {usersList.map((u, i) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Card className="bg-[#1a1a2e]/80 border-white/5 hover:border-white/10 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-3 items-center">
                          <div className="col-span-1 hidden sm:flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-[#7c3aed]/10 border border-[#7c3aed]/20 flex items-center justify-center">
                              <span className="text-[#7c3aed] text-xs font-bold">{i + 1}</span>
                            </div>
                          </div>
                          <div className="col-span-3 flex items-center gap-2">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00ff87]/20 to-[#7c3aed]/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                              <UserCircle className="h-5 w-5 text-[#00ff87]" />
                            </div>
                            <span className="text-white font-medium text-sm">{u.name}</span>
                          </div>
                          <div className="col-span-3 flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-gray-500" />
                            <span className="text-gray-300 text-sm truncate">{u.email}</span>
                          </div>
                          <div className="col-span-2 flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-gray-500" />
                            <span className="text-gray-300 text-sm">{u.phone || <span className="text-gray-600 italic">Non renseigné</span>}</span>
                          </div>
                          <div className="col-span-3 flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-gray-500" />
                            <span className="text-gray-400 text-sm">{new Date(u.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
