'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface MediaResponse {
  type: 'video' | 'image';
  mediaUrl: string;
  title?: string;
  description?: string;
}

type Platform = 'instagram' | 'twitter' | 'facebook' | 'pinterest' | 'threads' | 'tiktok' | 'linkedin' | 'snapchat' | 'reddit' | 'unsupported';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState<MediaResponse | null>(null);
  const [error, setError] = useState('');

  const detectPlatform = (url: string): Platform => {
    const urlLower = url.toLowerCase().trim();
    
    if (urlLower.includes('instagram.com') || urlLower.includes('instagr.am')) {
      return 'instagram';
    } else if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
      return 'twitter';
    } else if (urlLower.includes('facebook.com') || urlLower.includes('fb.watch') || urlLower.includes('fb.com')) {
      return 'facebook';
    } else if (urlLower.includes('pinterest.com') || urlLower.includes('pin.it')) {
      return 'pinterest';
    } else if (urlLower.includes('threads.net')) {
      return 'threads';
    } else if (urlLower.includes('tiktok.com') || urlLower.includes('vm.tiktok.com') || urlLower.includes('vt.tiktok.com')) {
      return 'tiktok';
    } else if (urlLower.includes('linkedin.com')) {
      return 'linkedin';
    } else if (urlLower.includes('snapchat.com') || urlLower.includes('snap.com')) {
      return 'snapchat';
    } else if (urlLower.includes('reddit.com') || urlLower.includes('redd.it')) {
      return 'reddit';
    }
    
    return 'unsupported';
  };

  const handleFetchMedia = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    const platform = detectPlatform(url);
    
    if (platform === 'unsupported') {
      setError('Platform not supported right now. Currently supported: Instagram, Twitter/X, Facebook, Pinterest, Threads, TikTok, LinkedIn, Snapchat, Reddit');
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
        : platform === 'facebook'
        ? '/api/facebook'
        : platform === 'pinterest'
        ? '/api/pinterest'
        : platform === 'threads'
        ? '/api/threads'
        : platform === 'tiktok'
        ? '/api/tiktok'
        : platform === 'linkedin'
        ? '/api/linkedin'
        : platform === 'snapchat'
        ? '/api/snapchat'
        : '/api/reddit';
      
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

  const handleDownload = async () => {
    if (!media) return;
    
    try {
      const downloadUrl = `/api/download?url=${encodeURIComponent(media.mediaUrl)}&type=${media.type}`;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `viddown-${media.type}-${Date.now()}.${media.type === 'video' ? 'mp4' : 'jpg'}`;
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
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-center">
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
              <h2 className="text-4xl font-extrabold mb-4">Social Media Downloader</h2>
              <p className="text-white/90 text-sm leading-relaxed">
                <span className="font-semibold">VidDown</span> lets you download videos & images from
                <br />Instagram, Twitter, Facebook, Pinterest, Threads, TikTok, LinkedIn, Snapchat & Reddit.
                <br />No hassle—just seamless, uninterrupted entertainment at your fingertips!
              </p>
            </CardContent>
          </Card>

          {/* Input Section */}
          <div className="mb-6">
            <Input
              type="url"
              placeholder="🔗 Paste link from any supported platform (Instagram, Twitter, Facebook, Pinterest, Threads, TikTok, LinkedIn, Snapchat, Reddit)..."
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
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-600 to-blue-700 shadow-lg flex items-center justify-center" title="Facebook">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-red-600 to-red-700 shadow-lg flex items-center justify-center" title="Pinterest">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.92-.19-2.33 0-3.33l1.45-6.15s-.37-.74-.37-1.84c0-1.72 1-3 2.24-3 1.05 0 1.56.79 1.56 1.73 0 1.06-.67 2.64-1.02 4.1-.29 1.21.61 2.2 1.8 2.2 2.16 0 3.82-2.28 3.82-5.57 0-2.91-2.09-4.95-5.07-4.95-3.46 0-5.49 2.59-5.49 5.27 0 1.04.4 2.16.9 2.77.1.12.11.23.08.35l-.33 1.36c-.05.22-.18.27-.42.16-1.52-.71-2.47-2.93-2.47-4.72 0-3.83 2.78-7.35 8.02-7.35 4.21 0 7.48 3 7.48 7.01 0 4.18-2.64 7.55-6.3 7.55-1.23 0-2.39-.64-2.79-1.4l-.76 2.9c-.27 1.06-1.02 2.39-1.52 3.2A12 12 0 1 0 12 0z"/>
                </svg>
              </div>
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-gray-800 to-black shadow-lg flex items-center justify-center" title="Threads">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142l-.126.742a12.993 12.993 0 0 0-2.83-.13c-1.218.07-2.175.437-2.849 1.092-.66.642-.972 1.445-.928 2.387.042.868.44 1.561 1.155 2.007.629.393 1.478.546 2.39.432 1.076-.053 1.934-.486 2.547-1.286.407-.53.684-1.228.804-2.042l.024-.193.135-.019c1.85-.27 3.153-.643 3.88-1.108 1.06-.676 1.663-1.59 1.788-2.715.03-.267.042-.54.042-.82 0-1.544-.363-2.89-1.08-4.004-.734-1.14-1.814-2.02-3.21-2.614-1.37-.583-2.98-.877-4.787-.876h-.017c-1.808 0-3.419.293-4.788.876-1.396.594-2.476 1.474-3.21 2.614-.717 1.114-1.08 2.46-1.08 4.004 0 .28.012.553.042.82.125 1.125.728 2.04 1.788 2.715.727.465 2.03.837 3.88 1.108l.135.019.024.193c.12.814.397 1.512.804 2.042.613.8 1.471 1.233 2.547 1.286.912.114 1.761-.039 2.39-.432.715-.446 1.113-1.139 1.155-2.007.044-.942-.268-1.745-.928-2.387-.674-.655-1.631-1.022-2.849-1.092a12.993 12.993 0 0 0-2.83.13l-.126-.742a13.853 13.853 0 0 1 3.02-.142c1.464.084 2.703.531 3.583 1.291.922.797 1.395 1.892 1.33 3.082-.067 1.224-.689 2.275-1.752 2.964-.898.583-2.057.866-3.259.801-1.59-.086-2.844-.688-3.73-1.79-.662-.826-1.092-1.92-1.284-3.272-.761.45-1.324 1.04-1.634 1.75-.528 1.205-.557 3.185 1.09 4.798 1.442 1.414 3.177 2.025 5.8 2.045z"/>
                </svg>
              </div>
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-pink-500 via-red-500 to-yellow-500 shadow-lg flex items-center justify-center" title="TikTok">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </div>
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-600 to-blue-800 shadow-lg flex items-center justify-center" title="LinkedIn">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-yellow-400 to-yellow-600 shadow-lg flex items-center justify-center" title="Snapchat">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3 0 .727-.09 1.052-.18.498-.135 1.043-.27 1.677-.27.579 0 1.076.12 1.521.368.45.255.81.615 1.053 1.044.45.795.27 1.65.12 2.235-.06.24-.119.464-.119.674 0 .12.045.224.09.329.075.18.164.389.21.629.075.42-.015.854-.255 1.244-.24.389-.645.734-1.154.959-.12.054-.195.12-.195.209 0 .045.015.104.045.179.075.18.24.45.584.674.57.345 1.02.674 1.367 1.068.615.719.629 1.604.629 2.084 0 .27-.015.494-.045.584-.015.045-.045.074-.09.074h-.015c-.3 0-1.154-.09-2.324-.09-.585 0-1.244.045-1.933.135-.27.045-.539.09-.793.104-.585.045-1.097.09-1.521.09-1.729 0-2.174-.855-2.564-1.604-.195-.375-.345-.674-.674-.674-.12 0-.255.029-.405.074-.3.105-.614.24-1.036.359-.555.165-1.185.33-1.965.42-.195.015-.375.015-.555.015-1.275 0-2.564-.375-3.794-.988C3.83 18.73 2.46 17.456 1.275 15.614c-.87-1.35-1.545-2.894-2.024-4.554C-.704 10.02-.57 8.977.27 8.083c.42-.45.914-.734 1.485-.854.27-.06.555-.09.854-.09 1.185 0 2.204.54 2.849 1.065.255.195.494.389.674.524.135.12.254.194.359.194.104 0 .164-.045.254-.134.045-.045.12-.135.195-.254.165-.27.42-.689.629-1.154.54-1.155.99-2.609 1.275-4.044C9.27 1.44 10.56.793 12.206.793zm-1.214 11.504c-.27 0-.494.09-.734.195-.479.225-.958.495-1.498.675-.285.09-.645.165-1.065.165-.195 0-.405-.015-.614-.045-.3-.045-.585-.09-.87-.12-.195-.015-.375-.03-.554-.03-.57 0-1.036.135-1.335.375-.255.21-.42.525-.42.869 0 .51.255 1.095.764 1.725.57.72 1.514 1.455 2.894 2.265 1.154.675 2.204 1.02 3.134 1.02.21 0 .405-.015.599-.045.585-.075 1.02-.195 1.426-.345.525-.195.915-.435 1.245-.675.75-.57 1.214-1.29 1.214-2.085 0-.405-.12-.78-.359-1.065-.3-.345-.734-.585-1.244-.734-.21-.06-.42-.09-.645-.09-.42 0-.854.105-1.289.225-.195.045-.405.09-.614.09z"/>
                </svg>
              </div>
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-orange-600 to-red-600 shadow-lg flex items-center justify-center" title="Reddit">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Badge */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-gray-200">
              <span className="text-sm font-medium text-gray-700">Free</span>
              <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">No Limits</span>
              <span className="text-sm font-medium text-gray-700">Fast</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
