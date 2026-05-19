'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HomePage from '@/components/HomePage';
import RegisterPage from '@/components/RegisterPage';
import LoginPage from '@/components/LoginPage';
import CatalogPage from '@/components/CatalogPage';
import GameDetailPage from '@/components/GameDetailPage';
import CartPage from '@/components/CartPage';
import CheckoutPage from '@/components/CheckoutPage';
import OrdersPage from '@/components/OrdersPage';
import AdminPage from '@/components/AdminPage';
import { AnimatePresence, motion } from 'framer-motion';

export default function Home() {
  const { page, initFromStorage } = useStore();
  // NedGaming - PC Game Store

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  // Seed database on first visit
  useEffect(() => {
    fetch('/api/seed').then(res => res.json()).then(data => {
      console.log('Seed result:', data.message);
    }).catch(() => {
      // ignore
    });
  }, []);

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage />;
      case 'register':
        return <RegisterPage />;
      case 'login':
        return <LoginPage />;
      case 'catalog':
        return <CatalogPage />;
      case 'game-detail':
        return <GameDetailPage />;
      case 'cart':
        return <CartPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'orders':
        return <OrdersPage />;
      case 'admin':
        return <AdminPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f0f]">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
