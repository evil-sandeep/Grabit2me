'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Loader2, Sparkles } from 'lucide-react';
import Image from 'next/image';
import InstallPWA from '@/components/InstallPWA';
import { Badge } from '@/components/ui/badge';

interface MediaResponse {
  type: 'video' | 'image';
  mediaUrl: string;
  title?: string;
  description?: string;
}

type Platform = 'instagram' | 'twitter' | 'threads' | 'unsupported';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [media, setMedia] = useState<MediaResponse | null>(null);
  const [error, setError] = useState('');
  const previousUrlRef = useRef('');

  const detectPlatform = (url: string): Platform => {
    const urlLower = url.toLowerCase().trim();

    if (urlLower.includes('instagram.com') || urlLower.includes('instagr.am')) {
      return 'instagram';
    } else if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
      return 'twitter';
    } else if (urlLower.includes('threads.net')) {
      return 'threads';
    }

    return 'unsupported';
  };

  // Auto-fetch when URL is pasted or changed
  useEffect(() => {
    const trimmedUrl = url.trim();
    
    // Only proceed if URL has changed and is not empty
    if (trimmedUrl && trimmedUrl !== previousUrlRef.current && !loading && !media) {
      const platform = detectPlatform(trimmedUrl);
      
      // Only auto-fetch if it's a supported platform
      if (platform !== 'unsupported') {
        previousUrlRef.current = trimmedUrl;
        handleFetchMedia();
      }
    }
  }, [url]);

  const handleFetchMedia = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    const platform = detectPlatform(url);

    if (platform === 'unsupported') {
      setError('Platform not supported. Currently supported: Instagram, Twitter/X, and Threads');
      return;
    }

    setLoading(true);
    setError('');
    setMedia(null);

    try {
      const apiEndpoint = platform === 'instagram'
        ? '/api/instagram'
        : platform === 'twitter'
          ? '/api/twitter'
          : '/api/threads';

      const response = await fetch(apiEndpoint, {
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

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    setError('');
    // Reset media when URL changes significantly
    if (media && newUrl.trim() !== previousUrlRef.current) {
      setMedia(null);
    }
  };

  const handleDownload = async () => {
    if (!media) return;

    setDownloading(true);
    try {
      const downloadUrl = `/api/download?url=${encodeURIComponent(media.mediaUrl)}&type=${media.type}`;

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `grabit-${media.type}-${Date.now()}.${media.type === 'video' ? 'mp4' : 'jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Keep loader visible for a moment to ensure download starts
      setTimeout(() => {
        setDownloading(false);
      }, 1500);
    } catch (error) {
      console.error('Download failed:', error);
      setDownloading(false);
      alert('Download failed. Please try again.');
    }
  };
  return (
    <div className="min-h-screen pt-16 sm:pt-32">
      <InstallPWA />
      <section className="container max-w-4xl mx-auto px-4 pt-20 pb-16 lg:pt-32 lg:pb-24">
        <div className="max-w-4xl pb-10 mx-auto text-center space-y-8">
          <div className="space-y-4">
            <Badge variant="outline" className="mb-4 ">
              <Sparkles className="h-3 w-3 mr-1" />
              Free • Fast • No Login Required
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight ">
              Download Instagram, X & Threads videos in seconds
            </h1>

            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
              Paste a link, choose quality, and download instantly. No login. No watermarks. Just pure simplicity.
            </p>
          </div>
        </div>
        {/* Input Section */}
          <section id="input-section" className="input-section mb-6 relative">
            <div className="absolute -inset-1 bg-black rounded-full opacity-10 blur-lg animate-pulse"></div>
            <Input
              type="url"
              placeholder="🔗 Paste your video link here - it will auto-process..."
              value={url}
              onChange={handleUrlChange}
              onKeyDown={(e) => e.key === 'Enter' && handleFetchMedia()}
              className="relative h-16 text-base rounded-full px-6 bg-white border-2 border-black shadow-lg focus:border-gray-800 focus:ring-4 focus:ring-gray-200 transition-all"
              disabled={loading}
            />
          </section>

          {/* Download Button Section - Only show when not loading and no media */}
          {!loading && !media && url.trim() && (
          <section id="download-button-section" className="download-button-section mb-4">
            <Button
            onClick={handleFetchMedia}
            disabled={loading}
            className="w-full h-14 text-lg font-semibold rounded-full cursor-pointer  shadow-lg hover:shadow-xl transition-all duration-300"
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
          </section>
          )}

          {/* Loading State */}
          {loading && (
            <section className="loading-section mb-4">
              <Card className="">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                    <div className="text-center">
                      <p className="text-lg font-semibold text-blue-900">Processing your link...</p>
                      <p className="text-sm text-blue-600 mt-1">This will only take a moment</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Error Message Section */}
          <section id="error-section" className="error-section">
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <p className="text-sm text-red-700 text-center">{error}</p>
            </div>
          )}
          </section>

          {/* Media Preview Section */}
          <section id="media-preview-section" className="media-preview-section">
          {media && (
            <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="overflow-hidden border-0 shadow-xl">
                <CardContent className="p-0">
                  {media.type === 'video' ? (
                    <video
                      controls
                      className="w-full aspect-auto object-contain bg-black"
                      src={media.mediaUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img
                      src={media.mediaUrl}
                      alt={media.title || 'Media'}
                      className="w-full aspect-auto object-contain"
                    />
                  )}
                </CardContent>
              </Card>

              {media.title && (
                <div className="px-2">
                  <p className="text-sm text-gray-700 font-medium">{media.title}</p>
                  {media.description && (
                    <p className="text-xs text-gray-500 mt-1">@{media.description}</p>
                  )}
                </div>
              )}

              <Button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full h-14 text-lg font-semibold rounded-full cursor-pointer shadow-lg"
              >
                {downloading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Starting Download...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Download {media.type === 'video' ? 'Video' : 'Image'}
                  </>
                )}
              </Button>
            </div>
          )}
          </section>

          {/* Supported Platforms Section */}
          <section id="platforms-section" className="platforms-section mt-8 text-center">
            <p className="text-sm text-gray-600 mb-3 font-medium">
              Supported Platforms
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap max-w-md mx-auto">
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-purple-600 via-pink-600 to-orange-600 shadow-lg flex items-center justify-center" title="Instagram">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772c-.5.508-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm6.5-.25a1.25 1.25 0 10-2.5 0 1.25 1.25 0 002.5 0zM12 9a3 3 0 110 6 3 3 0 010-6z"/>
                </svg>
              </div>
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-400 to-blue-600 shadow-lg flex items-center justify-center" title="Twitter / X">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-gray-800 to-black shadow-lg flex items-center justify-center" title="Threads">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142l-.126.742a12.993 12.993 0 0 0-2.83-.13c-1.218.07-2.175.437-2.849 1.092-.66.642-.972 1.445-.928 2.387.042.868.44 1.561 1.155 2.007.629.393 1.478.546 2.39.432 1.076-.053 1.934-.486 2.547-1.286.407-.53.684-1.228.804-2.042l.024-.193.135-.019c1.85-.27 3.153-.643 3.88-1.108 1.06-.676 1.663-1.59 1.788-2.715.03-.267.042-.54.042-.82 0-1.544-.363-2.89-1.08-4.004-.734-1.14-1.814-2.02-3.21-2.614-1.37-.583-2.98-.877-4.787-.876h-.017c-1.808 0-3.419.293-4.788.876-1.396.594-2.476 1.474-3.21 2.614-.717 1.114-1.08 2.46-1.08 4.004 0 .28.012.553.042.82.125 1.125.728 2.04 1.788 2.715.727.465 2.03.837 3.88 1.108l.135.019.024.193c.12.814.397 1.512.804 2.042.613.8 1.471 1.233 2.547 1.286.912.114 1.761-.039 2.39-.432.715-.446 1.113-1.139 1.155-2.007.044-.942-.268-1.745-.928-2.387-.674-.655-1.631-1.022-2.849-1.092a12.993 12.993 0 0 0-2.83.13l-.126-.742a13.853 13.853 0 0 1 3.02-.142c1.464.084 2.703.531 3.583 1.291.922.797 1.395 1.892 1.33 3.082-.067 1.224-.689 2.275-1.752 2.964-.898.583-2.057.866-3.259.801-1.59-.086-2.844-.688-3.73-1.79-.662-.826-1.092-1.92-1.284-3.272-.761.45-1.324 1.04-1.634 1.75-.528 1.205-.557 3.185 1.09 4.798 1.442 1.414 3.177 2.025 5.8 2.045z"/>
                </svg>
              </div>
            </div>
          </section>

      </section>
    </div>
  );
}
