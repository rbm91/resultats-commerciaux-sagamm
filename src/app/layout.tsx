import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sagamm - Résultats commerciaux",
  description: "Pilotage - Résultats mensuels par région",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} antialiased`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
