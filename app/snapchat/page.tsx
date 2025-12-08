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

export default function SnapchatDownloader() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState<MediaResponse | null>(null);
  const [error, setError] = useState('');

  const handleFetchMedia = async () => {
    if (!url.trim()) {
      setError('Please enter a Snapchat URL');
      return;
    }

    setLoading(true);
    setError('');
    setMedia(null);

    try {
      const response = await fetch('/api/snapchat', {
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
      link.download = `snapchat-${media.type}-${Date.now()}.${media.type === 'video' ? 'mp4' : 'jpg'}`;
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
            src="/newLogo.svg" 
            alt="VidDown" 
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
          <Card className="overflow-hidden border-0 shadow-2xl mb-6 bg-linear-to-br from-yellow-400 to-yellow-600">
            <CardContent className="p-8 text-center text-white">
              <div className="mb-4">
                <div className="inline-block">
                  <svg className="w-16 h-16 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3 0 .727-.09 1.052-.18.498-.135 1.043-.27 1.677-.27.579 0 1.076.12 1.521.368.45.255.81.615 1.053 1.044.45.795.27 1.65.12 2.235-.06.24-.119.464-.119.674 0 .12.045.224.09.329.075.18.164.389.21.629.075.42-.015.854-.255 1.244-.24.389-.645.734-1.154.959-.12.054-.195.12-.195.209 0 .045.015.104.045.179.075.18.24.45.584.674.57.345 1.02.674 1.367 1.068.615.719.629 1.604.629 2.084 0 .27-.015.494-.045.584-.015.045-.045.074-.09.074h-.015c-.3 0-1.154-.09-2.324-.09-.585 0-1.244.045-1.933.135-.27.045-.539.09-.793.104-.585.045-1.097.09-1.521.09-1.729 0-2.174-.855-2.564-1.604-.195-.375-.345-.674-.674-.674-.12 0-.255.029-.405.074-.3.105-.614.24-1.036.359-.555.165-1.185.33-1.965.42-.195.015-.375.015-.555.015-1.275 0-2.564-.375-3.794-.988C3.83 18.73 2.46 17.456 1.275 15.614c-.87-1.35-1.545-2.894-2.024-4.554C-.704 10.02-.57 8.977.27 8.083c.42-.45.914-.734 1.485-.854.27-.06.555-.09.854-.09 1.185 0 2.204.54 2.849 1.065.255.195.494.389.674.524.135.12.254.194.359.194.104 0 .164-.045.254-.134.045-.045.12-.135.195-.254.165-.27.42-.689.629-1.154.54-1.155.99-2.609 1.275-4.044C9.27 1.44 10.56.793 12.206.793zm-1.214 11.504c-.27 0-.494.09-.734.195-.479.225-.958.495-1.498.675-.285.09-.645.165-1.065.165-.195 0-.405-.015-.614-.045-.3-.045-.585-.09-.87-.12-.195-.015-.375-.03-.554-.03-.57 0-1.036.135-1.335.375-.255.21-.42.525-.42.869 0 .51.255 1.095.764 1.725.57.72 1.514 1.455 2.894 2.265 1.154.675 2.204 1.02 3.134 1.02.21 0 .405-.015.599-.045.585-.075 1.02-.195 1.426-.345.525-.195.915-.435 1.245-.675.75-.57 1.214-1.29 1.214-2.085 0-.405-.12-.78-.359-1.065-.3-.345-.734-.585-1.244-.734-.21-.06-.42-.09-.645-.09-.42 0-.854.105-1.289.225-.195.045-.405.09-.614.09z"/>
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2">Snapchat</h1>
              <h2 className="text-4xl font-extrabold mb-4">Downloader</h2>
              <p className="text-white/90 text-sm leading-relaxed">
                <span className="font-semibold">VidDown</span> lets you download public Spotlight videos
                <br />and Stories from Snapchat.
                <br />Fast, simple, and completely free!
              </p>
            </CardContent>
          </Card>

          {/* Input Section */}
          <div className="mb-6">
            <Input
              type="url"
              placeholder="🔗 Paste Snapchat link here..."
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
            className="w-full h-14 text-lg font-semibold rounded-full cursor-pointer bg-linear-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 shadow-lg hover:shadow-xl transition-all duration-300"
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
                      alt={media.title || 'Snapchat media'}
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
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-yellow-400 to-yellow-600 shadow-lg flex items-center justify-center" title="Snapchat">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3 0 .727-.09 1.052-.18.498-.135 1.043-.27 1.677-.27.579 0 1.076.12 1.521.368.45.255.81.615 1.053 1.044.45.795.27 1.65.12 2.235-.06.24-.119.464-.119.674 0 .12.045.224.09.329.075.18.164.389.21.629.075.42-.015.854-.255 1.244-.24.389-.645.734-1.154.959-.12.054-.195.12-.195.209 0 .045.015.104.045.179.075.18.24.45.584.674.57.345 1.02.674 1.367 1.068.615.719.629 1.604.629 2.084 0 .27-.015.494-.045.584-.015.045-.045.074-.09.074h-.015c-.3 0-1.154-.09-2.324-.09-.585 0-1.244.045-1.933.135-.27.045-.539.09-.793.104-.585.045-1.097.09-1.521.09-1.729 0-2.174-.855-2.564-1.604-.195-.375-.345-.674-.674-.674-.12 0-.255.029-.405.074-.3.105-.614.24-1.036.359-.555.165-1.185.33-1.965.42-.195.015-.375.015-.555.015-1.275 0-2.564-.375-3.794-.988C3.83 18.73 2.46 17.456 1.275 15.614c-.87-1.35-1.545-2.894-2.024-4.554C-.704 10.02-.57 8.977.27 8.083c.42-.45.914-.734 1.485-.854.27-.06.555-.09.854-.09 1.185 0 2.204.54 2.849 1.065.255.195.494.389.674.524.135.12.254.194.359.194.104 0 .164-.045.254-.134.045-.045.12-.135.195-.254.165-.27.42-.689.629-1.154.54-1.155.99-2.609 1.275-4.044C9.27 1.44 10.56.793 12.206.793zm-1.214 11.504c-.27 0-.494.09-.734.195-.479.225-.958.495-1.498.675-.285.09-.645.165-1.065.165-.195 0-.405-.015-.614-.045-.3-.045-.585-.09-.87-.12-.195-.015-.375-.03-.554-.03-.57 0-1.036.135-1.335.375-.255.21-.42.525-.42.869 0 .51.255 1.095.764 1.725.57.72 1.514 1.455 2.894 2.265 1.154.675 2.204 1.02 3.134 1.02.21 0 .405-.015.599-.045.585-.075 1.02-.195 1.426-.345.525-.195.915-.435 1.245-.675.75-.57 1.214-1.29 1.214-2.085 0-.405-.12-.78-.359-1.065-.3-.345-.734-.585-1.244-.734-.21-.06-.42-.09-.645-.09-.42 0-.854.105-1.289.225-.195.045-.405.09-.614.09z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Badge */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-gray-200">
              <span className="text-sm font-medium text-gray-700">Free</span>
              <span className="px-2 py-0.5 text-xs font-bold text-white bg-yellow-500 rounded-full">Public Only</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mt-2">
              Spotlight Downloader
            </h3>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
            <h4 className="text-sm font-semibold text-yellow-900 mb-2">How to use:</h4>
            <ol className="text-xs text-yellow-800 space-y-1 list-decimal list-inside">
              <li>Find a public Snapchat Spotlight video or Story</li>
              <li>Copy the link to the content</li>
              <li>Paste the link in the input field above</li>
              <li>Click Download and save your media!</li>
            </ol>
            <p className="text-xs text-yellow-700 mt-3 italic">
              Note: Only public Snapchat content can be downloaded. Private Snaps or Stories are not accessible.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
