'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Loader2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useEffect } from 'react';
import Link from 'next/link';

interface MediaResponse {
  type: 'video' | 'image';
  mediaUrl: string;
  title?: string;
  description?: string;
}

export default function TwitterDownloader() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState<MediaResponse | null>(null);
  const [error, setError] = useState('');

  const handleFetchMedia = async () => {
    if (!url.trim()) {
      setError('Please enter a Twitter/X URL');
      return;
    }

    setLoading(true);
    setError('');
    setMedia(null);

    try {
      const response = await fetch('/api/twitter', {
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
      link.download = `twitter-${media.type}-${Date.now()}.${media.type === 'video' ? 'mp4' : 'jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-300">
      {/* Header Section */}
      <header id="header-section" className="header-section fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <Image 
            src="/grab.svg" 
            alt="TotalGrab" 
            width={120} 
            height={32}
            className="h-8 w-auto"
            priority
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-md mx-auto">
          {/* Hero Card */}
          <section id="hero-section" className="hero-section mb-6">
            <Card className="overflow-hidden border-0 shadow-2xl bg-linear-to-br from-blue-400 via-blue-500 to-blue-600">
            <CardContent className="p-8 text-center text-white">
              <div className="mb-4">
                <div className="inline-block">
                  <svg className="w-16 h-16 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2">Twitter / X</h1>
              <h2 className="text-4xl font-extrabold mb-4">Downloader</h2>
              <p className="text-white/90 text-sm leading-relaxed">
                <span className="font-semibold">TotalGrab</span> lets you download videos,
                <br />GIFs, and images from Twitter/X with ease.
                <br />Fast, simple, and completely free!
              </p>
            </CardContent>
          </Card>
          </section>

          {/* Input Section */}
          <section id="input-section" className="input-section mb-6">
            <Input
              type="url"
              placeholder="🔗 Paste Twitter/X post link here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFetchMedia()}
              className="h-14 text-base rounded-full px-6 bg-white border-gray-300 shadow-sm"
              disabled={loading}
            />
          </section>

          {/* Download Button */}
          <section id="download-button-section" className="download-button-section mb-4">
            <Button
            onClick={handleFetchMedia}
            disabled={loading}
            className="w-full h-14 text-lg font-semibold rounded-full cursor-pointer bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
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

          {/* Error Message */}
          <section id="error-section" className="error-section">
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <p className="text-sm text-red-700 text-center">{error}</p>
            </div>
          )}
          </section>

          {/* Media Preview */}
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
                      alt={media.title || 'Twitter media'}
                      className="w-full aspect-auto object-contain"
                    />
                  )}
                </CardContent>
              </Card>

              {media.title && (
                <div className="px-2">
                  <p className="text-sm text-gray-700 font-medium">{media.title}</p>
                  {media.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">@{media.description}</p>
                  )}
                </div>
              )}

              <Button
                onClick={handleDownload}
                className="w-full h-14 text-lg font-semibold rounded-full cursor-pointer bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
              >
                <Download className="mr-2 h-5 w-5" />
                Download {media.type === 'video' ? 'Video' : 'Image'}
              </Button>
            </div>
          )}
          </section>

          {/* Supported Platforms Section */}
          <section id="platforms-section" className="platforms-section mt-8 text-center">
            <p className="text-sm text-gray-600 mb-3 font-medium">
              Supported Platform
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-400 to-blue-600 shadow-lg flex items-center justify-center" title="Twitter / X">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
            </div>
          </section>

          {/* Badge Section */}
          <section id="badge-section" className="badge-section mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-gray-200">
              <span className="text-sm font-medium text-gray-700">Free</span>
              <span className="px-2 py-0.5 text-xs font-bold text-white bg-blue-500 rounded-full">Social Media</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mt-2">
              Video Downloader
            </h3>
          </section>

          {/* Instructions */}
          <section id="instructions-section" className="instructions-section mt-8">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">How to use:</h4>
            <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
              <li>Copy the link to a Twitter/X post with video or image</li>
              <li>Paste the link in the input field above</li>
              <li>Click the Download button</li>
              <li>Preview and download your media!</li>
            </ol>
          </div>
          </section>
        </div>
      </main>
    </div>
  );
}
