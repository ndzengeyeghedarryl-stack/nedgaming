'use client';

import { Gamepad2, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-6 w-6 text-[#00ff87]" />
              <span className="text-lg font-bold text-white">
                Ned<span className="text-[#00ff87]">Gaming</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Votre boutique en ligne de jeux PC au Gabon. Paiement facile via Mobile Money.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Paiement Mobile Money</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <span className="text-yellow-400 text-base">📱</span>
                <span>MTN Mobile Money</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-400 text-base">📲</span>
                <span>Moov Money : +241 66 86 98 05</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400 text-base">💰</span>
                <span>Airtel Money : +241 76 52 00 18</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#00ff87]" />
                ndzengeyeghedarryl@gmail.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#00ff87]" />
                Airtel : +241 76 52 00 18
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#00ff87]" />
                Moov : +241 66 86 98 05
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#00ff87]" />
                Libreville, Gabon
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-gray-500 text-sm">
            © 2024 NedGaming. Tous droits réservés. Paiement Mobile Money accepté (MTN, Moov, Airtel).
          </p>
        </div>
      </div>
    </footer>
  );
}
