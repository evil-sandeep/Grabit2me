import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PWARegister from "@/components/PWARegister";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: "TotalGrab - Instagram, Twitter & Threads Downloader",
  description: "Download videos and images from Instagram, Twitter/X, and Threads instantly. One-click download for public posts, reels, and videos. Fast, free, and easy to use.",
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
    "instagram reels downloader",
    "twitter downloader",
    "twitter video downloader",
    "threads downloader",
    "social media downloader",
    "download videos",
    "download reels",
    "save videos",
    "totalgrab",
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
    title: "TotalGrab - Social Media Downloader",
    description: "Download videos and images from Instagram, Twitter/X, and Threads instantly",
    siteName: "TotalGrab",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "TotalGrab Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TotalGrab - Social Media Downloader",
    description: "Download videos and images from Instagram, Twitter/X, and Threads instantly",
    images: ["/icon-512.png"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/icon.svg"],
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
        <meta name="theme-color" content="#ec4899" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="shortcut icon" href="/favicon.png" />
      </head>
      <body
        className={`${inter.variable} font-mono antialiased`}
      >
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
