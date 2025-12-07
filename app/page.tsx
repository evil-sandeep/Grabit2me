'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Moon, Sun } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setDarkMode(!darkMode);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <Image 
            src="/newLogo.svg" 
            alt="VidDown" 
            width={120} 
            height={32}
            className="h-8 w-auto"
          />
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Hero Card */}
          <Card className="overflow-hidden border-0 shadow-2xl mb-8 bg-linear-to-br from-purple-600 via-pink-600 to-red-600">
            <CardContent className="p-8 text-center text-white">
              <div className="mb-4">
                <div className="inline-block">
                  <svg className="w-16 h-16 mx-auto mb-3" viewBox="0 0 100 100" fill="none">
                    <path d="M50 10L65 35H35L50 10Z M50 90L65 65H35L50 90Z M10 50L35 35V65L10 50Z M90 50L65 35V65L90 50Z" fill="white" opacity="0.9"/>
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2">Your Ultimate</h1>
              <h2 className="text-4xl font-extrabold mb-4">Social Media Downloader</h2>
              <p className="text-white/90 text-sm leading-relaxed">
                <span className="font-semibold">VidDown</span> lets you download videos & images
                <br />from Instagram & Twitter with speed and ease.
                <br />No hassle—just seamless, uninterrupted
                <br />entertainment at your fingertips!
              </p>
            </CardContent>
          </Card>

          {/* Platform Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Instagram Card */}
            <Link href="/instagram">
              <Card className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-purple-600 via-pink-600 to-orange-600 shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772c-.5.508-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm6.5-.25a1.25 1.25 0 10-2.5 0 1.25 1.25 0 002.5 0zM12 9a3 3 0 110 6 3 3 0 010-6z"/>
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Instagram</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Download Instagram reels, posts, and videos
                    </p>
                    <div className="mt-4 px-4 py-2 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-semibold group-hover:from-purple-700 group-hover:to-pink-700 transition-colors">
                      Start Downloading
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Twitter Card */}
            <Link href="/twitter">
              <Card className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-blue-400 to-blue-600 shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Twitter / X</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Download Twitter videos, GIFs, and images
                    </p>
                    <div className="mt-4 px-4 py-2 bg-linear-to-r from-blue-400 to-blue-600 text-white rounded-full text-sm font-semibold group-hover:from-blue-500 group-hover:to-blue-700 transition-colors">
                      Start Downloading
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Features */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Free</span>
              <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">No Limits</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fast</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
