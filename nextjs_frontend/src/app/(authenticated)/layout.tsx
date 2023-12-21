import type { Metadata } from "next";

import "../globals.css";
import NoirPro from "@/config/fonts";
import { Inter } from "next/font/google";

import Header from "@/components/Header/header";
import SideBar from "@/components/SideBar/sidebar";
import Footer from "@/components/Footer/footer";

import { NotificationProvider } from "@/contexts/NotificationContext";
import { SideBarProvider } from "@/contexts/SideBarContext";

import { NextAuthProvider } from "./providers";

const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "Reco",
  description: "Uma plataforma de resolução de acordos"
};

interface RootLayoutProps {
  children: React.ReactNode
}
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-br">
      <body className={`${NoirPro.className} ${inter.className}`}>
        <NextAuthProvider>
          <NotificationProvider>
            <SideBarProvider>
              <Header />
              <div className="w-full flex">
                <SideBar />
                <main className="w-full min-h-screen flex flex-col
                                 pt-20 items-center justify-between">
                  {children}
                </main>
              </div>
              <Footer />
            </SideBarProvider>
          </NotificationProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
