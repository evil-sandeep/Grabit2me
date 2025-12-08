'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    // Check if running on iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      return; // Already installed
    }

    // iOS specific prompt
    if (ios) {
      const hasSeenPrompt = localStorage.getItem('ios-pwa-prompt-dismissed');
      if (!hasSeenPrompt) {
        setTimeout(() => setShowIOSPrompt(true), 3000); // Show after 3 seconds
      }
      return;
    }

    // Handle Android/Desktop install prompt
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      const hasSeenPrompt = localStorage.getItem('pwa-prompt-dismissed');
      if (!hasSeenPrompt) {
        setTimeout(() => setShowInstall(true), 3000); // Show after 3 seconds
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  const handleDismiss = () => {
    setShowInstall(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const handleIOSDismiss = () => {
    setShowIOSPrompt(false);
    localStorage.setItem('ios-pwa-prompt-dismissed', 'true');
  };

  // iOS Install Instructions
  if (isIOS && showIOSPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 animate-in slide-in-from-bottom-4">
        <button
          onClick={handleIOSDismiss}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
        
        <div className="pr-8">
          <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Download className="w-5 h-5 text-purple-600" />
            Install TotalGrab App
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Install this app on your iPhone for a better experience!
          </p>
          <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside">
            <li>Tap the Share button <span className="inline-block">⬆️</span></li>
            <li>Scroll down and tap "Add to Home Screen"</li>
            <li>Tap "Add" in the top right</li>
          </ol>
        </div>
      </div>
    );
  }

  // Android/Desktop Install Prompt
  if (!showInstall || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 bg-linear-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl p-4 text-white animate-in slide-in-from-bottom-4">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/20 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="pr-8">
        <h3 className="font-bold mb-2 flex items-center gap-2">
          <Download className="w-5 h-5" />
          Install TotalGrab App
        </h3>
        <p className="text-sm text-white/90 mb-4">
          Install TotalGrab for quick access and offline support!
        </p>
        <div className="flex gap-2">
          <Button
            onClick={handleInstallClick}
            className="flex-1 bg-white text-purple-600 hover:bg-gray-100 font-semibold"
          >
            Install
          </Button>
          <Button
            onClick={handleDismiss}
            variant="outline"
            className="bg-transparent border-white text-white hover:bg-white/20"
          >
            Later
          </Button>
        </div>
      </div>
    </div>
  );
}
