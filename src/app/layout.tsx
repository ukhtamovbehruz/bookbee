import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AudioPlayerProvider } from "@/components/player/AudioPlayerProvider";
import { StickyPlayer } from "@/components/player/StickyPlayer";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BookBee — Listen to Your Next Favorite Book",
  description:
    "BookBee is a premium audiobook platform to discover, listen to, and track audiobooks across business, psychology, technology, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TooltipProvider delayDuration={200}>
          <AudioPlayerProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <StickyPlayer />
            <Toaster position="bottom-right" />
          </AudioPlayerProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
