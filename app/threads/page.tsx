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

export default function ThreadsDownloader() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState<MediaResponse | null>(null);
  const [error, setError] = useState('');

  const handleFetchMedia = async () => {
    if (!url.trim()) {
      setError('Please enter a Threads URL');
      return;
    }

    setLoading(true);
    setError('');
    setMedia(null);

    try {
      const response = await fetch('/api/threads', {
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
      link.download = `threads-${media.type}-${Date.now()}.${media.type === 'video' ? 'mp4' : 'jpg'}`;
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
          <Card className="overflow-hidden border-0 shadow-2xl mb-6 bg-linear-to-br from-gray-800 via-gray-900 to-black">
            <CardContent className="p-8 text-center text-white">
              <div className="mb-4">
                <div className="inline-block">
                  <svg className="w-16 h-16 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142l-.126.742a12.993 12.993 0 0 0-2.83-.13c-1.218.07-2.175.437-2.849 1.092-.66.642-.972 1.445-.928 2.387.042.868.44 1.561 1.155 2.007.629.393 1.478.546 2.39.432 1.076-.053 1.934-.486 2.547-1.286.407-.53.684-1.228.804-2.042l.024-.193.135-.019c1.85-.27 3.153-.643 3.88-1.108 1.06-.676 1.663-1.59 1.788-2.715.03-.267.042-.54.042-.82 0-1.544-.363-2.89-1.08-4.004-.734-1.14-1.814-2.02-3.21-2.614-1.37-.583-2.98-.877-4.787-.876h-.017c-1.808 0-3.419.293-4.788.876-1.396.594-2.476 1.474-3.21 2.614-.717 1.114-1.08 2.46-1.08 4.004 0 .28.012.553.042.82.125 1.125.728 2.04 1.788 2.715.727.465 2.03.837 3.88 1.108l.135.019.024.193c.12.814.397 1.512.804 2.042.613.8 1.471 1.233 2.547 1.286.912.114 1.761-.039 2.39-.432.715-.446 1.113-1.139 1.155-2.007.044-.942-.268-1.745-.928-2.387-.674-.655-1.631-1.022-2.849-1.092a12.993 12.993 0 0 0-2.83.13l-.126-.742a13.853 13.853 0 0 1 3.02-.142c1.464.084 2.703.531 3.583 1.291.922.797 1.395 1.892 1.33 3.082-.067 1.224-.689 2.275-1.752 2.964-.898.583-2.057.866-3.259.801-1.59-.086-2.844-.688-3.73-1.79-.662-.826-1.092-1.92-1.284-3.272-.761.45-1.324 1.04-1.634 1.75-.528 1.205-.557 3.185 1.09 4.798 1.442 1.414 3.177 2.025 5.8 2.045z"/>
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2">Threads</h1>
              <h2 className="text-4xl font-extrabold mb-4">Downloader</h2>
              <p className="text-white/90 text-sm leading-relaxed">
                <span className="font-semibold">TotalGrab</span> lets you download videos
                <br />and images from Threads with ease.
                <br />Fast, simple, and completely free!
              </p>
            </CardContent>
          </Card>

          {/* Input Section */}
          <div className="mb-6">
            <Input
              type="url"
              placeholder="🔗 Paste Threads post link here..."
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
            className="w-full h-14 text-lg font-semibold rounded-full cursor-pointer bg-linear-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-950 shadow-lg hover:shadow-xl transition-all duration-300"
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
                      alt={media.title || 'Threads media'}
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
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-gray-800 to-black shadow-lg flex items-center justify-center" title="Threads">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142l-.126.742a12.993 12.993 0 0 0-2.83-.13c-1.218.07-2.175.437-2.849 1.092-.66.642-.972 1.445-.928 2.387.042.868.44 1.561 1.155 2.007.629.393 1.478.546 2.39.432 1.076-.053 1.934-.486 2.547-1.286.407-.53.684-1.228.804-2.042l.024-.193.135-.019c1.85-.27 3.153-.643 3.88-1.108 1.06-.676 1.663-1.59 1.788-2.715.03-.267.042-.54.042-.82 0-1.544-.363-2.89-1.08-4.004-.734-1.14-1.814-2.02-3.21-2.614-1.37-.583-2.98-.877-4.787-.876h-.017c-1.808 0-3.419.293-4.788.876-1.396.594-2.476 1.474-3.21 2.614-.717 1.114-1.08 2.46-1.08 4.004 0 .28.012.553.042.82.125 1.125.728 2.04 1.788 2.715.727.465 2.03.837 3.88 1.108l.135.019.024.193c.12.814.397 1.512.804 2.042.613.8 1.471 1.233 2.547 1.286.912.114 1.761-.039 2.39-.432.715-.446 1.113-1.139 1.155-2.007.044-.942-.268-1.745-.928-2.387-.674-.655-1.631-1.022-2.849-1.092a12.993 12.993 0 0 0-2.83.13l-.126-.742a13.853 13.853 0 0 1 3.02-.142c1.464.084 2.703.531 3.583 1.291.922.797 1.395 1.892 1.33 3.082-.067 1.224-.689 2.275-1.752 2.964-.898.583-2.057.866-3.259.801-1.59-.086-2.844-.688-3.73-1.79-.662-.826-1.092-1.92-1.284-3.272-.761.45-1.324 1.04-1.634 1.75-.528 1.205-.557 3.185 1.09 4.798 1.442 1.414 3.177 2.025 5.8 2.045z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Badge */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-gray-200">
              <span className="text-sm font-medium text-gray-700">Free</span>
              <span className="px-2 py-0.5 text-xs font-bold text-white bg-gray-800 rounded-full">Social Media</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mt-2">
              Video Downloader
            </h3>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-2xl">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">How to use:</h4>
            <ol className="text-xs text-gray-800 space-y-1 list-decimal list-inside">
              <li>Copy the link to a Threads post with video or image</li>
              <li>Paste the link in the input field above</li>
              <li>Click the Download button</li>
              <li>Preview and download your media!</li>
            </ol>
            <p className="text-xs text-gray-700 mt-3 italic">
              Note: Only public Threads posts can be downloaded.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
