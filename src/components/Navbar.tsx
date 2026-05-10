'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Gamepad2, ShoppingCart, User, LogOut, Package, Home, Grid3X3, Menu, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { page, setPage, user, logout, cart } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cart.length;

  const navLinks = [
    { label: 'Accueil', page: 'home' as const, icon: Home },
    { label: 'Jeux', page: 'catalog' as const, icon: Grid3X3 },
    { label: 'Mon Panier', page: 'cart' as const, icon: ShoppingCart },
    { label: 'Mes Commandes', page: 'orders' as const, icon: Package },
  ];

  return (
    <nav className="glass-nav sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => setPage('home')}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <Gamepad2 className="h-7 w-7 text-[#00ff87] group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold text-white">
              Ned<span className="text-[#00ff87] neon-text-glow">Gaming</span>
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = page === link.page;
              return (
                <button
                  key={link.page}
                  onClick={() => setPage(link.page)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'text-[#00ff87] bg-[#00ff87]/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                  {link.page === 'cart' && cartCount > 0 && (
                    <Badge className="bg-[#00ff87] text-[#0f0f0f] h-5 min-w-5 text-xs px-1.5">
                      {cartCount}
                    </Badge>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#00ff87] rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00ff87]/10 border border-[#00ff87]/20">
                  <User className="h-4 w-4 text-[#00ff87]" />
                  <span className="text-sm font-medium text-[#00ff87]">{user.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-gray-400 hover:text-red-400 hover:bg-red-400/10 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage('login')}
                  className="text-gray-400 hover:text-white cursor-pointer"
                >
                  Connexion
                </Button>
                <Button
                  size="sm"
                  onClick={() => setPage('register')}
                  className="bg-[#00ff87] text-[#0f0f0f] hover:bg-[#00cc6a] font-semibold cursor-pointer"
                >
                  Inscription
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1 bg-[#0f0f0f]/95">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = page === link.page;
                return (
                  <button
                    key={link.page}
                    onClick={() => {
                      setPage(link.page);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'text-[#00ff87] bg-[#00ff87]/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                    {link.page === 'cart' && cartCount > 0 && (
                      <Badge className="bg-[#00ff87] text-[#0f0f0f] h-5 min-w-5 text-xs px-1.5 ml-auto">
                        {cartCount}
                      </Badge>
                    )}
                  </button>
                );
              })}
              <div className="pt-2 border-t border-white/5">
                {user ? (
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-[#00ff87]" />
                      <span className="text-sm font-medium text-[#00ff87]">{user.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="text-gray-400 hover:text-red-400 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2 px-3 py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPage('login');
                        setMobileMenuOpen(false);
                      }}
                      className="flex-1 text-gray-400 hover:text-white cursor-pointer"
                    >
                      Connexion
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setPage('register');
                        setMobileMenuOpen(false);
                      }}
                      className="flex-1 bg-[#00ff87] text-[#0f0f0f] hover:bg-[#00cc6a] font-semibold cursor-pointer"
                    >
                      Inscription
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
