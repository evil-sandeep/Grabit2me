'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Loader2, Sparkles } from 'lucide-react';
import InstallPWA from '@/components/InstallPWA';

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
    } else if (urlLower.includes('threads.net') || urlLower.includes('threads.com')) {
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
    <div className="min-h-screen pt-16 sm:pt-32 relative z-10">
      <InstallPWA />
      <section className="container max-w-4xl mx-auto px-4 pt-20 pb-16 lg:pt-32 lg:pb-24">
        <div className="max-w-4xl pb-10 mx-auto text-center space-y-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 border-[3px] border-foreground px-4 py-2 bg-card shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-bold tracking-wider uppercase">FREE • FAST • NO LOGIN</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight font-mono leading-tight">
              DOWNLOAD INSTAGRAM, X & THREADS VIDEOS IN SECONDS
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto font-mono uppercase tracking-wide">
              Paste → Process → Download. No Login. No Watermarks.
            </p>
          </div>
        </div>
        {/* Input Section */}
        <section id="input-section" className="input-section mb-6">
          <Input
            type="url"
            placeholder="PASTE VIDEO LINK HERE..."
            value={url}
            onChange={handleUrlChange}
            onKeyDown={(e) => e.key === 'Enter' && handleFetchMedia()}
            className="h-16 text-base px-6 bg-card"
            disabled={loading}
          />
        </section>

        {/* Download Button Section - Only show when not loading and no media */}
        {!loading && !media && url.trim() && (
          <section id="download-button-section" className="download-button-section mb-4">
            <Button
              onClick={handleFetchMedia}
              disabled={loading}
              className="w-full h-14 text-base font-bold cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'FETCH VIDEO'
              )}
            </Button>
          </section>
        )}

        {/* Loading State */}
        {loading && (
          <section className="loading-section mb-4">
            <div className="border-[3px] border-foreground bg-card shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] p-8">
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <Loader2 className="h-12 w-12 animate-spin text-foreground" />
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="text-xs font-bold tracking-widest uppercase terminal-blink">█</span>
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-lg font-bold uppercase tracking-wider">⟩ PROCESSING LINK...</p>
                  <p className="text-sm text-muted-foreground font-mono uppercase tracking-wide">PLEASE WAIT</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Error Message Section */}
        <section id="error-section" className="error-section">
          {error && (
            <div className="mt-4 p-4 bg-card border-[3px] border-destructive shadow-[4px_4px_0px_0px_rgba(200,75,49,1)]">
              <p className="text-sm text-destructive font-bold text-center uppercase tracking-wide">⚠ {error}</p>
            </div>
          )}
        </section>

        {/* Media Preview Section */}
        <section id="media-preview-section" className="media-preview-section">
          {media ? (
            <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="overflow-hidden border-[3px] border-foreground shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
                <div className="p-0 bg-black">
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
                </div>
              </div>

              {media.title && (
                <div className="px-2 border-l-4 border-[#E07A3E] pl-4">
                  <p className="text-sm font-bold uppercase tracking-wide">{media.title}</p>
                  {media.description && (
                    <p className="text-xs text-muted-foreground mt-1 font-mono">@{media.description}</p>
                  )}
                </div>
              )}

              <Button
                onClick={handleDownload}
                disabled={downloading}
                variant="secondary"
                className="w-full h-14 text-base font-bold cursor-pointer"
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
          ) : (
            <div className="mt-6 space-y-4 opacity-40">
              <div className="overflow-hidden border-[3px] border-foreground bg-muted">
                <div className="w-full aspect-9/16 bg-muted flex items-center justify-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">PREVIEW</p>
                </div>
              </div>
              <div className="px-2 space-y-2">
                <div className="h-4 w-3/4 bg-muted border-2 border-muted-foreground/20"></div>
                <div className="h-3 w-1/2 bg-muted border-2 border-muted-foreground/20"></div>
              </div>
              <div className="w-full h-14 bg-muted border-[3px] border-muted-foreground/20 flex items-center justify-center">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">DOWNLOAD</span>
              </div>
            </div>
          )}
        </section>

        {/* Supported Platforms Section */}
        <section id="platforms-section" className="platforms-section mt-12 text-center">
          <p className="text-sm font-bold uppercase tracking-wider mb-4 text-foreground">
            ⟩ SUPPORTED PLATFORMS
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap max-w-md mx-auto">
            <div className="flex flex-col items-center gap-2 group cursor-default">
              <div className="w-16 h-16 border-[3px] border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] flex items-center justify-center transition-transform group-hover:translate-y-0.5 group-hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]" title="Instagram">
                <svg className="w-8 h-8 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772c-.5.508-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm6.5-.25a1.25 1.25 0 10-2.5 0 1.25 1.25 0 002.5 0zM12 9a3 3 0 110 6 3 3 0 010-6z" />
                </svg>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">INSTA</span>
            </div>
            <div className="flex flex-col items-center gap-2 group cursor-default">
              <div className="w-16 h-16 border-[3px] border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] flex items-center justify-center transition-transform group-hover:translate-y-0.5 group-hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]" title="Twitter / X">
                <svg className="w-8 h-8 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">X / TWITTER</span>
            </div>
            <div className="flex flex-col items-center gap-2 group cursor-default">
              <div className="w-16 h-16 border-[3px] border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] flex items-center justify-center transition-transform group-hover:translate-y-0.5 group-hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]" title="Threads">
                <svg className="w-8 h-8 text-foreground" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161" />
                </svg>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">THREADS</span>
            </div>
          </div>
        </section>

      </section>
    </div>
  );
}
