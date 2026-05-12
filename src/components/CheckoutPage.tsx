'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Phone, CreditCard, CheckCircle, Loader2, ShieldCheck, AlertCircle, Copy } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const providers = [
  { id: 'mtn', name: 'MTN Mobile Money', color: 'from-yellow-500/20 to-yellow-900/20 border-yellow-500/30', icon: '📱', number: '+241 77 00 00 00' },
  { id: 'moov', name: 'Moov Money', color: 'from-blue-500/20 to-blue-900/20 border-blue-500/30', icon: '📲', number: '+241 66 86 98 05' },
  { id: 'airtel', name: 'Airtel Money', color: 'from-red-500/20 to-red-900/20 border-red-500/30', icon: '💰', number: '+241 76 52 00 18' },
];

export default function CheckoutPage() {
  const { cart, user, clearCart, setPage } = useStore();
  const { toast } = useToast();
  const [phone, setPhone] = useState(user?.phone || '');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const total = cart.reduce((sum, item) => sum + item.game.price * item.quantity, 0);
  const selectedProviderData = providers.find(p => p.id === selectedProvider);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!phone.trim()) newErrors.phone = 'Le numéro de téléphone est requis';
    else if (phone.replace(/\s/g, '').length < 8) newErrors.phone = 'Numéro invalide';
    if (!selectedProvider) newErrors.provider = 'Veuillez sélectionner un opérateur';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCopyNumber = (number: string, name: string) => {
    navigator.clipboard.writeText(number.replace(/\s/g, '')).then(() => {
      toast({
        title: 'Numéro copié !',
        description: `Le numéro ${name} a été copié`,
      });
    });
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!user) {
      toast({
        title: 'Connexion requise',
        description: 'Veuillez vous connecter pour passer commande',
        variant: 'destructive',
      });
      setPage('login');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          phone: phone.replace(/\s/g, ''),
          provider: selectedProvider,
          items: cart.map((item) => ({
            gameId: item.game.id,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'Erreur',
          description: data.error || 'Erreur lors de la commande',
          variant: 'destructive',
        });
        return;
      }

      setSuccess(true);
      clearCart();
      toast({
        title: 'Commande enregistrée !',
        description: 'Votre paiement est en attente de validation par l\'administrateur',
      });
    } catch {
      toast({
        title: 'Erreur',
        description: 'Erreur de connexion au serveur',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6 max-w-md"
        >
          <div className="p-6 rounded-full bg-[#00ff87]/10 border border-[#00ff87]/20 inline-block">
            <CheckCircle className="h-20 w-20 text-[#00ff87]" />
          </div>
          <h2 className="text-3xl font-bold text-white">Commande enregistrée !</h2>
          <p className="text-gray-400">
            Votre commande a été enregistrée. L'administrateur doit vérifier votre paiement Mobile Money avant de débloquer l'accès au téléchargement. Vous recevrez l'accès dès que le paiement sera confirmé.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => setPage('orders')}
              className="w-full bg-[#00ff87] text-[#0f0f0f] hover:bg-[#00cc6a] font-semibold cursor-pointer"
            >
              Voir mes commandes et telecharger
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage('catalog')}
              className="w-full border-white/10 text-gray-400 hover:text-white cursor-pointer"
            >
              Continuer les achats
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Votre panier est vide</h2>
          <Button
            onClick={() => setPage('catalog')}
            className="bg-[#00ff87] text-[#0f0f0f] hover:bg-[#00cc6a] cursor-pointer"
          >
            Parcourir le catalogue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => setPage('cart')}
            className="text-gray-400 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au panier
          </Button>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold text-white mb-8"
        >
          Paiement <span className="text-[#00ff87]">Mobile Money</span>
        </motion.h1>

        {/* Payment Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6 p-4 rounded-xl bg-[#7c3aed]/5 border border-[#7c3aed]/20"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-[#7c3aed] flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-[#7c3aed] font-medium mb-2">Instructions de paiement</p>
              <p className="text-gray-400">
                1. Envoyez <span className="text-white font-semibold">{total.toLocaleString('fr-FR')} FCFA</span> au numéro correspondant à votre opérateur ci-dessous<br />
                2. Entrez votre numéro de téléphone Mobile Money<br />
                3. Sélectionnez votre opérateur<br />
                4. Validez le paiement
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <Card className="bg-[#1a1a2e]/80 border-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Phone className="h-5 w-5 text-[#00ff87]" />
                  Numéro Mobile Money
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Votre numéro de téléphone</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-white/10 bg-[#0f0f0f] text-gray-400 text-sm">
                      +241
                    </span>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="77 00 00 00"
                      className="bg-[#0f0f0f]/50 border-white/10 text-white placeholder:text-gray-600 focus:border-[#00ff87] rounded-l-none"
                    />
                  </div>
                  {errors.phone && <p className="text-red-400 text-xs">{errors.phone}</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a2e]/80 border-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[#00ff87]" />
                  Opérateur Mobile Money
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {providers.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => setSelectedProvider(provider.id)}
                      className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedProvider === provider.id
                          ? `bg-gradient-to-br ${provider.color} border-current scale-105`
                          : 'bg-[#0f0f0f]/30 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="text-2xl mb-2">{provider.icon}</div>
                      <div className={`text-sm font-medium ${
                        selectedProvider === provider.id ? 'text-white' : 'text-gray-400'
                      }`}>
                        {provider.name}
                      </div>
                      {/* Show the payment number */}
                      <div className={`text-xs mt-2 font-mono ${
                        selectedProvider === provider.id ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        {provider.number}
                      </div>
                    </button>
                  ))}
                </div>
                {errors.provider && <p className="text-red-400 text-xs mt-2">{errors.provider}</p>}
              </CardContent>
            </Card>

            {/* Payment Number Detail */}
            {selectedProviderData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={`bg-gradient-to-br ${selectedProviderData.color} border`}>
                  <CardContent className="p-4">
                    <p className="text-white text-sm font-medium mb-2">
                      Envoyez {total.toLocaleString('fr-FR')} FCFA a ce numero :
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-white text-xl font-bold font-mono">
                        {selectedProviderData.number}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyNumber(selectedProviderData.number, selectedProviderData.name)}
                        className="text-white/60 hover:text-white cursor-pointer"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-white/50 text-xs mt-2">
                      Nom du compte : <span className="text-white/70 font-medium">NED</span>
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <div className="flex items-center gap-2 text-gray-500 text-sm p-3 rounded-lg bg-[#1a1a2e]/30">
              <ShieldCheck className="h-4 w-4 text-[#00ff87] flex-shrink-0" />
              <span>Votre paiement est sécurisé. Vous recevrez une confirmation par SMS.</span>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-[#1a1a2e]/80 border-[#00ff87]/20 neon-glow sticky top-24">
              <CardHeader>
                <CardTitle className="text-white">Résumé de la commande</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
                  {cart.map((item) => (
                    <div key={item.game.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#0f0f0f]/30">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-[#7c3aed]/30 to-[#1a1a2e] flex-shrink-0">
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
                        <p className="text-gray-500 text-xs">{item.game.category}</p>
                      </div>
                      <span className="text-[#00ff87] font-semibold text-sm flex-shrink-0">
                        {item.game.price.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-400 text-sm">
                    <span>Sous-total</span>
                    <span>{total.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-sm">
                    <span>Frais de livraison</span>
                    <span className="text-[#00ff87]">Gratuit</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between">
                    <span className="text-white font-bold text-lg">Total</span>
                    <span className="text-[#00ff87] font-bold text-2xl">
                      {total.toLocaleString('fr-FR')} <span className="text-sm font-normal text-gray-400">FCFA</span>
                    </span>
                  </div>
                </div>

                <Button
                  size="lg"
                  disabled={loading}
                  onClick={handleSubmit}
                  className="w-full bg-[#00ff87] text-[#0f0f0f] hover:bg-[#00cc6a] font-bold py-6 text-lg cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Payer avec Mobile Money
                      <CreditCard className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
