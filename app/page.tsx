'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Loader2, Moon, Sun } from 'lucide-react';
import Image from 'next/image';
import { useEffect } from 'react';

interface MediaResponse {
  type: 'video' | 'image';
  mediaUrl: string;
  title?: string;
  description?: string;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState<MediaResponse | null>(null);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setDarkMode(!darkMode);
  };

  const handleFetchMedia = async () => {
    if (!url.trim()) {
      setError('Please enter an Instagram URL');
      return;
    }

    setLoading(true);
    setError('');
    setMedia(null);

    try {
      const response = await fetch('/api/instagram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch media');
      }

      setMedia(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!media) return;
    
    try {
      // Use our download API endpoint to proxy the media
      const downloadUrl = `/api/download?url=${encodeURIComponent(media.mediaUrl)}&type=${media.type}`;
      
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `instagram-${media.type}-${Date.now()}.${media.type === 'video' ? 'mp4' : 'jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
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
        <div className="max-w-md mx-auto">
          {/* Hero Card */}
          <Card className="overflow-hidden border-0 shadow-2xl mb-6 bg-linear-to-br from-purple-600 via-pink-600 to-red-600">
            <CardContent className="p-8 text-center text-white">
              <div className="mb-4">
                <div className="inline-block">
                  <svg className="w-16 h-16 mx-auto mb-3" viewBox="0 0 100 100" fill="none">
                    <path d="M50 10L65 35H35L50 10Z M50 90L65 65H35L50 90Z M10 50L35 35V65L10 50Z M90 50L65 35V65L90 50Z" fill="white" opacity="0.9"/>
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2">Your Ultimate</h1>
              <h2 className="text-4xl font-extrabold mb-4">Downloader</h2>
              <p className="text-white/90 text-sm leading-relaxed">
                <span className="font-semibold">VidDown</span> lets you download videos
                <br />from Instagram with speed and ease.
                <br />No hassle—just seamless, uninterrupted
                <br />entertainment at your fingertips!
              </p>
            </CardContent>
          </Card>

          {/* Input Section */}
          <div className="mb-6">
            <Input
              type="url"
              placeholder="🔗 Paste Instagram Reel or Post link here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFetchMedia()}
              className="h-14 text-base rounded-full px-6 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 shadow-sm"
              disabled={loading}
            />
          </div>

          {/* Download Button */}
          <Button
            onClick={handleFetchMedia}
            disabled={loading}
            className="w-full h-14 text-lg font-semibold rounded-full cursor-pointer bg-linear-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              'Download'
            )}
          </Button>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
              <p className="text-sm text-red-700 dark:text-red-400 text-center">{error}</p>
            </div>
          )}

          {/* Media Preview */}
          {media && (
            <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="overflow-hidden border-0 shadow-xl">
                <CardContent className="p-0">
                  {media.type === 'video' ? (
                    <video
                      controls
                      className="w-full aspect-9/16 object-cover"
                      src={media.mediaUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img
                      src={media.mediaUrl}
                      alt={media.title || 'Instagram media'}
                      className="w-full aspect-9/16 object-cover"
                    />
                  )}
                </CardContent>
              </Card>

              <Button
                onClick={handleDownload}
                className="w-full h-14 text-lg font-semibold rounded-full cursor-pointer bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
              >
                <Download className="mr-2 h-5 w-5" />
                Download {media.type === 'video' ? 'Video' : 'Image'}
              </Button>
            </div>
          )}

          {/* Supported Platforms */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">
              Supported Platform
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-purple-600 via-pink-600 to-orange-600 shadow-lg flex items-center justify-center" title="Instagram">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772c-.5.508-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm6.5-.25a1.25 1.25 0 10-2.5 0 1.25 1.25 0 002.5 0zM12 9a3 3 0 110 6 3 3 0 010-6z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Badge */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Free</span>
              <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">Social Media</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2">
              Video Downloader
            </h3>
          </div>
        </div>
      </main>
    </div>
  );
}
