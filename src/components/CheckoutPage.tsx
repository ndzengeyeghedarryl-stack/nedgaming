'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Phone, CreditCard, CheckCircle, Loader2, ShieldCheck, AlertCircle, Copy, Download, ExternalLink, AlertOctagon, Send, ClipboardCheck } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const total = cart.reduce((sum, item) => sum + item.game.price * item.quantity, 0);
  const selectedProviderData = providers.find(p => p.id === selectedProvider);

  const validateStep1 = () => {
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
        description: `Le numéro ${name} a été copié dans le presse-papiers`,
      });
    });
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(total.toLocaleString('fr-FR')).then(() => {
      toast({
        title: 'Montant copié !',
        description: 'Le montant a été copié dans le presse-papiers',
      });
    });
  };

  const handleSubmit = async () => {
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
        description: 'Votre commande est en attente de validation par l\'administrateur',
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

  // Success screen
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
            Votre commande a été enregistrée avec succès. L&apos;administrateur va vérifier votre paiement Mobile Money. 
            Dès que le paiement sera confirmé, vous recevrez l&apos;accès au téléchargement de vos jeux.
          </p>
          <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20 text-left">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-400 text-sm font-semibold mb-0.5">En attente de validation</p>
                <p className="text-gray-400 text-xs">
                  L&apos;administrateur vérifiera la réception de votre paiement sur son compte Mobile Money. 
                  Cela peut prendre quelques minutes. Vous serez notifié dès que l&apos;accès sera débloqué.
                </p>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20 text-left">
            <div className="flex items-start gap-2">
              <AlertOctagon className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-cyan-400 text-sm font-semibold mb-0.5">uTorrent requis pour le téléchargement</p>
                <p className="text-gray-400 text-xs">
                  Assurez-vous d&apos;avoir <span className="text-white font-medium">uTorrent</span> installé sur votre PC. 
                  Le lien torrent s&apos;ouvrira automatiquement dans uTorrent et le jeu se téléchargera tout seul après confirmation.
                </p>
                <a
                  href="https://www.utorrent.com/downloads/win"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-1.5 text-cyan-400 hover:text-cyan-300 text-xs font-medium transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Télécharger uTorrent gratuitement
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <Button
              onClick={() => setPage('orders')}
              className="w-full bg-[#00ff87] text-[#0f0f0f] hover:bg-[#00cc6a] font-semibold cursor-pointer"
            >
              Voir mes commandes
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

  // Empty cart
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
          className="text-3xl md:text-4xl font-bold text-white mb-4"
        >
          Finaliser la <span className="text-[#00ff87]">commande</span>
        </motion.h1>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center gap-0">
            {[
              { num: 1, label: 'Vos informations', icon: Phone },
              { num: 2, label: 'Effectuez le paiement', icon: Send },
              { num: 3, label: 'Confirmez', icon: ClipboardCheck },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    step >= s.num
                      ? 'bg-[#00ff87] border-[#00ff87] text-[#0f0f0f]'
                      : 'bg-transparent border-white/20 text-gray-500'
                  }`}>
                    {step > s.num ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <s.icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className={`text-[10px] mt-1 font-medium ${
                    step >= s.num ? 'text-[#00ff87]' : 'text-gray-500'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div className={`w-16 sm:w-24 h-0.5 mx-2 mt-[-16px] transition-all ${
                    step > s.num ? 'bg-[#00ff87]' : 'bg-white/10'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Steps */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {/* STEP 1: User Info */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card className="bg-[#1a1a2e]/80 border-white/5">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Phone className="h-5 w-5 text-[#00ff87]" />
                        Étape 1 : Vos informations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-400 text-sm">
                        Entrez votre numéro de téléphone Mobile Money. C&apos;est le numéro depuis lequel vous allez effectuer le paiement.
                      </p>
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

                      <div className="space-y-2">
                        <Label className="text-gray-300">Votre opérateur Mobile Money</Label>
                        <div className="grid grid-cols-3 gap-3">
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
                            </button>
                          ))}
                        </div>
                        {errors.provider && <p className="text-red-400 text-xs mt-2">{errors.provider}</p>}
                      </div>

                      <Button
                        size="lg"
                        onClick={() => {
                          if (validateStep1()) setStep(2);
                        }}
                        className="w-full bg-[#00ff87] text-[#0f0f0f] hover:bg-[#00cc6a] font-bold py-6 text-lg cursor-pointer"
                      >
                        Continuer
                        <Send className="ml-2 h-5 w-5" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* STEP 2: Payment Instructions */}
              {step === 2 && selectedProviderData && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card className="bg-[#1a1a2e]/80 border-white/5">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Send className="h-5 w-5 text-[#00ff87]" />
                        Étape 2 : Effectuez le paiement
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <p className="text-gray-400 text-sm">
                        Prenez votre téléphone et envoyez l&apos;argent via <span className="text-white font-medium">{selectedProviderData.name}</span> au numéro ci-dessous :
                      </p>

                      {/* Amount to send */}
                      <div className="p-4 rounded-xl bg-[#00ff87]/5 border border-[#00ff87]/20">
                        <p className="text-gray-400 text-xs font-medium mb-1">MONTANT À ENVOYER</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[#00ff87] text-3xl font-bold">
                            {total.toLocaleString('fr-FR')} <span className="text-lg font-normal text-gray-400">FCFA</span>
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCopyAmount}
                            className="text-[#00ff87]/60 hover:text-[#00ff87] cursor-pointer"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Number to send to */}
                      <div className={`p-4 rounded-xl bg-gradient-to-br ${selectedProviderData.color} border`}>
                        <p className="text-white/70 text-xs font-medium mb-1">NUMÉRO DESTINATAIRE</p>
                        <div className="flex items-center justify-between">
                          <span className="text-white text-2xl font-bold font-mono">
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
                          Nom du compte : <span className="text-white/80 font-semibold">NED</span>
                        </p>
                      </div>

                      {/* Step by step instructions */}
                      <div className="p-4 rounded-xl bg-[#7c3aed]/5 border border-[#7c3aed]/20">
                        <p className="text-[#7c3aed] text-xs font-semibold mb-3 uppercase tracking-wider">Comment payer</p>
                        <div className="space-y-3 text-sm">
                          <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-[#7c3aed]/20 border border-[#7c3aed]/30 flex items-center justify-center flex-shrink-0">
                              <span className="text-[#7c3aed] text-xs font-bold">1</span>
                            </div>
                            <p className="text-gray-400">Ouvrez l&apos;application <span className="text-white font-medium">{selectedProviderData.name}</span> sur votre téléphone</p>
                          </div>
                          <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-[#7c3aed]/20 border border-[#7c3aed]/30 flex items-center justify-center flex-shrink-0">
                              <span className="text-[#7c3aed] text-xs font-bold">2</span>
                            </div>
                            <p className="text-gray-400">Sélectionnez <span className="text-white font-medium">Envoyer de l&apos;argent</span> ou <span className="text-white font-medium">Transfert</span></p>
                          </div>
                          <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-[#7c3aed]/20 border border-[#7c3aed]/30 flex items-center justify-center flex-shrink-0">
                              <span className="text-[#7c3aed] text-xs font-bold">3</span>
                            </div>
                            <p className="text-gray-400">Envoyez <span className="text-[#00ff87] font-semibold">{total.toLocaleString('fr-FR')} FCFA</span> au <span className="text-white font-medium font-mono">{selectedProviderData.number}</span></p>
                          </div>
                          <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-[#7c3aed]/20 border border-[#7c3aed]/30 flex items-center justify-center flex-shrink-0">
                              <span className="text-[#7c3aed] text-xs font-bold">4</span>
                            </div>
                            <p className="text-gray-400">Confirmez le paiement et attendez le SMS de confirmation</p>
                          </div>
                          <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-[#7c3aed]/20 border border-[#7c3aed]/30 flex items-center justify-center flex-shrink-0">
                              <span className="text-[#7c3aed] text-xs font-bold">5</span>
                            </div>
                            <p className="text-gray-400">Revenez ici et cliquez sur <span className="text-white font-medium">&quot;J&apos;ai effectué le paiement&quot;</span></p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setStep(1)}
                          className="border-white/10 text-gray-400 hover:text-white cursor-pointer flex-1"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Retour
                        </Button>
                        <Button
                          size="lg"
                          onClick={() => setStep(3)}
                          className="bg-[#00ff87] text-[#0f0f0f] hover:bg-[#00cc6a] font-bold flex-1 cursor-pointer"
                        >
                          J&apos;ai effectué le paiement
                          <CheckCircle className="ml-2 h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* STEP 3: Confirm Order */}
              {step === 3 && selectedProviderData && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card className="bg-[#1a1a2e]/80 border-[#00ff87]/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <ClipboardCheck className="h-5 w-5 text-[#00ff87]" />
                        Étape 3 : Confirmez votre commande
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-yellow-400 text-sm font-semibold mb-1">Important</p>
                            <p className="text-gray-400 text-xs">
                              Assurez-vous d&apos;avoir bien envoyé <span className="text-white font-semibold">{total.toLocaleString('fr-FR')} FCFA</span> au numéro 
                              <span className="text-white font-medium font-mono"> {selectedProviderData.number}</span> (NED) 
                              avant de confirmer. L&apos;administrateur vérifiera la réception du paiement.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Recap */}
                      <div className="p-3 rounded-lg bg-[#0f0f0f]/30 border border-white/5 space-y-2">
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Récapitulatif du paiement</p>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Montant envoyé</span>
                          <span className="text-[#00ff87] font-semibold">{total.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Numéro destinataire</span>
                          <span className="text-white font-mono">{selectedProviderData.number}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Nom du compte</span>
                          <span className="text-white font-semibold">NED</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Opérateur</span>
                          <span className="text-white">{selectedProviderData.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Votre numéro</span>
                          <span className="text-white font-mono">+241 {phone}</span>
                        </div>
                      </div>

                      {/* uTorrent Notice */}
                      <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                        <div className="flex items-start gap-2">
                          <AlertOctagon className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-cyan-400 text-xs font-semibold mb-0.5">uTorrent requis</p>
                            <p className="text-gray-400 text-[11px]">
                              Le téléchargement se fait via <span className="text-white font-medium">uTorrent</span>. Assurez-vous de l&apos;avoir installé.
                              <a
                                href="https://www.utorrent.com/downloads/win"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-400 hover:text-cyan-300 ml-1 underline"
                              >
                                Télécharger uTorrent
                              </a>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Checkbox */}
                      <label className="flex items-start gap-3 p-4 rounded-xl bg-[#0f0f0f]/30 border border-white/5 cursor-pointer hover:border-[#00ff87]/30 transition-colors">
                        <input
                          type="checkbox"
                          checked={paymentConfirmed}
                          onChange={(e) => setPaymentConfirmed(e.target.checked)}
                          className="mt-0.5 w-5 h-5 rounded border-white/20 bg-[#0f0f0f] text-[#00ff87] focus:ring-[#00ff87] focus:ring-offset-0 cursor-pointer accent-[#00ff87]"
                        />
                        <span className="text-gray-300 text-sm">
                          J&apos;atteste avoir envoyé <span className="text-[#00ff87] font-semibold">{total.toLocaleString('fr-FR')} FCFA</span> au 
                          numéro <span className="text-white font-medium font-mono">{selectedProviderData.number}</span> (NED) 
                          via <span className="text-white font-medium">{selectedProviderData.name}</span> depuis mon téléphone.
                        </span>
                      </label>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setStep(2)}
                          className="border-white/10 text-gray-400 hover:text-white cursor-pointer flex-1"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Retour
                        </Button>
                        <Button
                          size="lg"
                          disabled={!paymentConfirmed || loading}
                          onClick={handleSubmit}
                          className="bg-[#00ff87] text-[#0f0f0f] hover:bg-[#00cc6a] font-bold flex-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <>
                              Confirmer ma commande
                              <CheckCircle className="ml-2 h-5 w-5" />
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 text-gray-500 text-xs p-2 rounded-lg bg-[#1a1a2e]/30">
                        <ShieldCheck className="h-3.5 w-3.5 text-[#00ff87] flex-shrink-0" />
                        <span>Votre commande sera vérifiée par l&apos;administrateur avant de débloquer l&apos;accès au téléchargement.</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Side - Order Summary (always visible) */}
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

                {/* Quick payment info when on step 2 or 3 */}
                {step >= 2 && selectedProviderData && (
                  <div className="p-3 rounded-lg bg-[#0f0f0f]/30 border border-white/5 space-y-2">
                    <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">Infos paiement</p>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Envoyer à</span>
                      <span className="text-white font-mono">{selectedProviderData.number}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Compte</span>
                      <span className="text-white">NED</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Votre tél.</span>
                      <span className="text-white font-mono">+241 {phone}</span>
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
