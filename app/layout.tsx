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
      <body className={`${geistSans.variable} ${geistMono.variable} h-screen`}>
        <img src="/HomeKeeper.svg" alt="Main icon" loading="lazy" className="w-screen md:h-12" />
        {children}
        <footer className="fixed bottom-0 w-full bg-theme_primary text-white text-center p-2 flex gap-3 justify-end">
          <p>HomeKeeper</p>
          <p>{new Date().getUTCFullYear()}</p>
        </footer>
      </body>
    </html>
  );
}
