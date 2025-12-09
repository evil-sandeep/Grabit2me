'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone, Share2 } from 'lucide-react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

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
      const dismissedTime = localStorage.getItem('ios-pwa-prompt-dismissed-time');
      
      // Show again after 7 days
      if (!hasSeenPrompt || (dismissedTime && Date.now() - parseInt(dismissedTime) > 7 * 24 * 60 * 60 * 1000)) {
        setTimeout(() => setShowIOSPrompt(true), 3000);
      }
      return;
    }

    // Handle Android/Desktop install prompt
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      const hasSeenPrompt = localStorage.getItem('pwa-prompt-dismissed');
      const dismissedTime = localStorage.getItem('pwa-prompt-dismissed-time');
      
      // Show again after 7 days
      if (!hasSeenPrompt || (dismissedTime && Date.now() - parseInt(dismissedTime) > 7 * 24 * 60 * 60 * 1000)) {
        setTimeout(() => setShowInstall(true), 3000);
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
      localStorage.removeItem('pwa-prompt-dismissed');
      localStorage.removeItem('pwa-prompt-dismissed-time');
    }
    
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  const handleDismiss = () => {
    setShowInstall(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
    localStorage.setItem('pwa-prompt-dismissed-time', Date.now().toString());
  };

  const handleIOSDismiss = () => {
    setShowIOSPrompt(false);
    localStorage.setItem('ios-pwa-prompt-dismissed', 'true');
    localStorage.setItem('ios-pwa-prompt-dismissed-time', Date.now().toString());
  };

  // iOS Install Instructions using Drawer
  if (isIOS) {
    return (
      <Drawer open={showIOSPrompt} onOpenChange={setShowIOSPrompt}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-600" />
              Install ClipFetch App
            </DrawerTitle>
            <DrawerDescription>
              Get the best experience with our app on your iPhone!
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="px-4 pb-4">
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-sm text-blue-900 mb-3">Installation Steps:</h4>
                <ol className="space-y-3 text-sm text-blue-800">
                  <li className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                    <span>Tap the <Share2 className="inline w-4 h-4 mx-1" /> Share button at the bottom of your screen</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                    <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                    <span>Tap <strong>"Add"</strong> in the top right corner</span>
                  </li>
                </ol>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                <Download className="w-4 h-4" />
                <span>Access ClipFetch instantly from your home screen!</span>
              </div>
            </div>
          </div>

          <DrawerFooter>
            <Button onClick={handleIOSDismiss} className="w-full">
              Got it!
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  // Android/Desktop Install Prompt using Drawer
  return (
    <Drawer open={showInstall} onOpenChange={setShowInstall}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            Install ClipFetch App
          </DrawerTitle>
          <DrawerDescription>
            Install ClipFetch for quick access and a better experience!
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="px-4 pb-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <div className="shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Works Offline</h4>
                <p className="text-gray-600 text-xs">Access your downloads even without internet</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 text-sm">
              <div className="shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Download className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Lightning Fast</h4>
                <p className="text-gray-600 text-xs">Native app performance and speed</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 text-sm">
              <div className="shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Share2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Easy Access</h4>
                <p className="text-gray-600 text-xs">Launch directly from your home screen</p>
              </div>
            </div>
          </div>
        </div>

        <DrawerFooter>
          <Button onClick={handleInstallClick} className="w-full bg-blue-600 hover:bg-blue-700">
            Install Now
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" onClick={handleDismiss} className="w-full">
              Maybe Later
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
