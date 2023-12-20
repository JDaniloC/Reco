import type { Metadata } from "next";

import "../globals.css";
import NoirPro from "@/config/fonts";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "Barden",
  description: "Uma plataforma de resolução de acordos"
};

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-br">
      <body className={`${NoirPro.className} ${inter.className}`}>
        <main className="w-full min-h-screen flex flex-col
                         items-center justify-between">
          {children}
        </main>
      </body>
    </html>
  );
}
