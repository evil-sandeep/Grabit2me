'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Loader2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface MediaResponse {
  type: 'video' | 'image';
  mediaUrl: string;
  title?: string;
  description?: string;
}

export default function PinterestDownloader() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState<MediaResponse | null>(null);
  const [error, setError] = useState('');

  const handleFetchMedia = async () => {
    if (!url.trim()) {
      setError('Please enter a Pinterest URL');
      return;
    }

    setLoading(true);
    setError('');
    setMedia(null);

    try {
      const response = await fetch('/api/pinterest', {
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
      const downloadUrl = `/api/download?url=${encodeURIComponent(media.mediaUrl)}&type=${media.type}`;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `pinterest-${media.type}-${Date.now()}.${media.type === 'video' ? 'mp4' : 'jpg'}`;
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
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <Image 
            src="/icon.svg" 
            alt="TotalGrab" 
            width={120} 
            height={32}
            className="h-8 w-auto"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-md mx-auto">
          {/* Hero Card */}
          <Card className="overflow-hidden border-0 shadow-2xl mb-6 bg-linear-to-br from-red-600 via-red-700 to-red-800">
            <CardContent className="p-8 text-center text-white">
              <div className="mb-4">
                <div className="inline-block">
                  <svg className="w-16 h-16 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.92-.19-2.33 0-3.33l1.45-6.15s-.37-.74-.37-1.84c0-1.72 1-3 2.24-3 1.05 0 1.56.79 1.56 1.73 0 1.06-.67 2.64-1.02 4.1-.29 1.21.61 2.2 1.8 2.2 2.16 0 3.82-2.28 3.82-5.57 0-2.91-2.09-4.95-5.07-4.95-3.46 0-5.49 2.59-5.49 5.27 0 1.04.4 2.16.9 2.77.1.12.11.23.08.35l-.33 1.36c-.05.22-.18.27-.42.16-1.52-.71-2.47-2.93-2.47-4.72 0-3.83 2.78-7.35 8.02-7.35 4.21 0 7.48 3 7.48 7.01 0 4.18-2.64 7.55-6.3 7.55-1.23 0-2.39-.64-2.79-1.4l-.76 2.9c-.27 1.06-1.02 2.39-1.52 3.2A12 12 0 1 0 12 0z"/>
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2">Pinterest</h1>
              <h2 className="text-4xl font-extrabold mb-4">Downloader</h2>
              <p className="text-white/90 text-sm leading-relaxed">
                <span className="font-semibold">TotalGrab</span> lets you download images
                <br />and videos from Pinterest with ease.
                <br />Fast, simple, and completely free!
              </p>
            </CardContent>
          </Card>

          {/* Input Section */}
          <div className="mb-6">
            <Input
              type="url"
              placeholder="🔗 Paste Pinterest pin link here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFetchMedia()}
              className="h-14 text-base rounded-full px-6 bg-white border-gray-300 shadow-sm"
              disabled={loading}
            />
          </div>

          {/* Download Button */}
          <Button
            onClick={handleFetchMedia}
            disabled={loading}
            className="w-full h-14 text-lg font-semibold rounded-full cursor-pointer bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all duration-300"
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
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <p className="text-sm text-red-700 text-center">{error}</p>
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
                      className="w-full aspect-auto object-contain bg-black"
                      src={media.mediaUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img
                      src={media.mediaUrl}
                      alt={media.title || 'Pinterest media'}
                      className="w-full aspect-auto object-contain"
                    />
                  )}
                </CardContent>
              </Card>

              {media.title && (
                <div className="px-2">
                  <p className="text-sm text-gray-700 font-medium">{media.title}</p>
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

          {/* Supported Platforms */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-3 font-medium">
              Supported Platform
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-red-600 to-red-700 shadow-lg flex items-center justify-center" title="Pinterest">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.92-.19-2.33 0-3.33l1.45-6.15s-.37-.74-.37-1.84c0-1.72 1-3 2.24-3 1.05 0 1.56.79 1.56 1.73 0 1.06-.67 2.64-1.02 4.1-.29 1.21.61 2.2 1.8 2.2 2.16 0 3.82-2.28 3.82-5.57 0-2.91-2.09-4.95-5.07-4.95-3.46 0-5.49 2.59-5.49 5.27 0 1.04.4 2.16.9 2.77.1.12.11.23.08.35l-.33 1.36c-.05.22-.18.27-.42.16-1.52-.71-2.47-2.93-2.47-4.72 0-3.83 2.78-7.35 8.02-7.35 4.21 0 7.48 3 7.48 7.01 0 4.18-2.64 7.55-6.3 7.55-1.23 0-2.39-.64-2.79-1.4l-.76 2.9c-.27 1.06-1.02 2.39-1.52 3.2A12 12 0 1 0 12 0z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Badge */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-gray-200">
              <span className="text-sm font-medium text-gray-700">Free</span>
              <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">Social Media</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mt-2">
              Image & Video Downloader
            </h3>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <h4 className="text-sm font-semibold text-red-900 mb-2">How to use:</h4>
            <ol className="text-xs text-red-800 space-y-1 list-decimal list-inside">
              <li>Copy the link to a Pinterest pin</li>
              <li>Paste the link in the input field above</li>
              <li>Click the Download button</li>
              <li>Preview and download your media!</li>
            </ol>
            <p className="text-xs text-red-700 mt-3 italic">
              Note: Supports both pin.it short links and full Pinterest URLs.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
