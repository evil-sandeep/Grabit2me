import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import PWARegister from "@/components/PWARegister";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: "TotalGrab - Social Media Video Downloader",
  description: "Download videos and images from Instagram, Twitter, Facebook, Pinterest, Threads, TikTok, LinkedIn, Snapchat & Reddit instantly. One-click download for public posts, reels, and videos. Fast, free, and easy to use.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TotalGrab",
  },
  applicationName: "TotalGrab",
  keywords: [
    "video downloader",
    "instagram downloader",
    "twitter downloader",
    "facebook downloader",
    "tiktok downloader",
    "linkedin downloader",
    "snapchat downloader",
    "reddit downloader",
    "social media downloader",
    "download videos",
    "download reels",
    "save videos",
  ],
  authors: [{ name: "TotalGrab" }],
  creator: "TotalGrab",
  publisher: "TotalGrab",
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://totalgrab.in",
    title: "TotalGrab - Social Media Video Downloader",
    description: "Download videos and images from Instagram, Twitter, Facebook, Pinterest, Threads, TikTok, LinkedIn, Snapchat & Reddit instantly",
    siteName: "TotalGrab",
  },
  twitter: {
    card: "summary_large_image",
    title: "TotalGrab - Social Media Video Downloader",
    description: "Download videos and images from 9 social media platforms instantly",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
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
        <meta name="application-name" content="TotalGrab" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TotalGrab" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#9333ea" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className={`${jetbrainsMono.variable} font-mono antialiased`}
      >
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
