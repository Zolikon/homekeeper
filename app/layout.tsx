import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./globalicon.css";

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
        className={`${geistSans.variable} ${geistMono.variable} bg-gradient-to-b from-background to-background-to flex flex-col`}
      >
        <header className="w-full bg-theme_primary text-white text-center h-[10%] flex gap-3 justify-center items-center select-none">
          <img src="/HomeKeeper.svg" alt="Main icon" loading="lazy" className="object-contain" />
        </header>
        <main className="h-[85%]">
          {children}
        </main>
        <footer className="w-full bg-theme_primary text-white text-center h-[5%] flex gap-3 justify-center items-center select-none">
          <p className="text-xs">{`HomeKeeper ${process.env.VERSION}`}</p>
        </footer>
      </body>
    </html>
  );
}
