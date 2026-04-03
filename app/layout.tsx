import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./globalicon.css";
import ConfigureAmplify from "./ConfigureAmplify";
import LogoutButton from "./__components/LogoutButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HomeKeeper",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-gradient-to-b from-background to-background-to flex flex-col h-[100dvh] overflow-hidden`}
      >
        <ConfigureAmplify />
        <header className="w-full bg-theme_primary text-white text-center h-14 shrink-0 flex gap-3 justify-center items-center select-none relative">
          <Link href="/" className="h-full flex items-center py-1"><img src="/HomeKeeper.svg" alt="Main icon" loading="lazy" className="object-contain h-full" /></Link>
          <div className="absolute right-4">
            <LogoutButton />
          </div>
        </header>
        <main className="flex-1 min-h-0 overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
