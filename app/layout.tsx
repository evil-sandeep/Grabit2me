import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PWARegister from "@/components/PWARegister";
import { HeroHeader } from "@/components/section/Header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://fckdl.vercel.app/'),
  title: "GrabIt - Instagram, X & Threads Video Downloader",
  description: "Download videos and images from Instagram, X (Twitter), and Threads instantly. One-click download for public posts, reels, and videos. Fast, free, and easy to use.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GrabIt",
  },
  applicationName: "GrabIt",
  keywords: [
    "video downloader",
    "instagram downloader",
    "instagram reels downloader",
    "x downloader",
    "twitter downloader",
    "twitter video downloader",
    "threads downloader",
    "social media downloader",
    "download videos",
    "download reels",
    "save videos",
    "grabit",
  ],
  authors: [{ name: "GrabIt" }],
  creator: "GrabIt",
  publisher: "GrabIt",
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://grabit.com",
    title: "GrabIt - Social Media Video Downloader",
    description: "Download videos and images from Instagram, X (Twitter), and Threads instantly",
    siteName: "GrabIt",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "GrabIt - Download videos from Instagram, X & Threads",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GrabIt - Social Media Video Downloader",
    description: "Download videos and images from Instagram, X (Twitter), and Threads instantly",
    images: ["/og.png"],
  },
  icons: {
    icon: [
      { url: "/adaptive-icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/adaptive-icon.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: ["/adaptive-icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="application-name" content="GrabIt" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="GrabIt" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/adaptive-icon.png" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/adaptive-icon.png" />
        
        {/* iOS Splash Screens */}
        <link rel="apple-touch-startup-image" media="(prefers-color-scheme: light)" href="/ios-light.png" />
        <link rel="apple-touch-startup-image" media="(prefers-color-scheme: dark)" href="/ios-dark.png" />
        <link rel="apple-touch-startup-image" href="/ios-tinted.png" />
        
        {/* Theme color for iOS */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`${inter.variable} font-mono antialiased`}
      >
        <HeroHeader />
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
