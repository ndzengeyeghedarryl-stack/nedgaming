import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NedGaming - Boutique de Jeux PC au Gabon",
  description: "Votre boutique en ligne de jeux PC au Gabon. Paiement facile via Mobile Money. Découvrez les meilleurs jeux aux meilleurs prix en FCFA.",
  keywords: ["NedGaming", "jeux PC", "Gabon", "Mobile Money", "FCFA", "gaming", "boutique en ligne"],
  authors: [{ name: "NedGaming" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "NedGaming - Boutique de Jeux PC",
    description: "Achetez vos jeux PC en FCFA avec Mobile Money au Gabon",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0f0f0f] text-gray-200`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
