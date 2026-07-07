import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AudioPlayerProvider } from "@/components/player/AudioPlayerProvider";
import { AuthProvider } from "@/context/AuthProvider";

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
          <AuthProvider>
            <AudioPlayerProvider>
              {children}
              <Toaster position="bottom-right" />
            </AudioPlayerProvider>
          </AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
