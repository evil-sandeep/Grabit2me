'use client';

import { useEffect, useState } from 'react';
import { Download, X, Smartphone, Share2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [showReminderBanner, setShowReminderBanner] = useState(false);

  useEffect(() => {
    // Check if running on iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Check if it's a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      return; // Already installed
    }

    // Only show reminders on mobile devices
    if (isMobile) {
      // Check reminder banner dismissal
      const reminderDismissed = localStorage.getItem('pwa-reminder-dismissed');
      const reminderDismissedTime = localStorage.getItem('pwa-reminder-dismissed-time');
      
      // Show reminder banner after 5 seconds if not dismissed or after 1 day
      if (!reminderDismissed || (reminderDismissedTime && Date.now() - parseInt(reminderDismissedTime) > 1 * 24 * 60 * 60 * 1000)) {
        setTimeout(() => setShowReminderBanner(true), 5000);
      }
    }

    // iOS specific prompt
    if (ios) {
      const hasSeenPrompt = localStorage.getItem('ios-pwa-prompt-dismissed');
      const dismissedTime = localStorage.getItem('ios-pwa-prompt-dismissed-time');
      
      // Show again after 1 day
      if (!hasSeenPrompt || (dismissedTime && Date.now() - parseInt(dismissedTime) > 1 * 24 * 60 * 60 * 1000)) {
        setTimeout(() => setShowIOSPrompt(true), 1000);
      }
      return;
    }

    // Handle Android install prompt (mobile only)
    if (isMobile) {
      const handler = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
        
        const hasSeenPrompt = localStorage.getItem('pwa-prompt-dismissed');
        const dismissedTime = localStorage.getItem('pwa-prompt-dismissed-time');
        
        // Show again after 1 day
        if (!hasSeenPrompt || (dismissedTime && Date.now() - parseInt(dismissedTime) > 1 * 24 * 60 * 60 * 1000)) {
          setTimeout(() => setShowInstall(true), 1000);
        }
      };

      window.addEventListener('beforeinstallprompt', handler);

      return () => {
        window.removeEventListener('beforeinstallprompt', handler);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      localStorage.removeItem('pwa-prompt-dismissed');
      localStorage.removeItem('pwa-prompt-dismissed-time');
      setShowReminderBanner(false);
      localStorage.setItem('pwa-reminder-dismissed', 'true');
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

  const handleReminderDismiss = () => {
    setShowReminderBanner(false);
    localStorage.setItem('pwa-reminder-dismissed', 'true');
    localStorage.setItem('pwa-reminder-dismissed-time', Date.now().toString());
  };

  const handleReminderInstall = () => {
    setShowReminderBanner(false);
    if (isIOS) {
      setShowIOSPrompt(true);
    } else {
      setShowInstall(true);
    }
  };

  // iOS Install Instructions using Sheet
  if (isIOS) {
    return (
      <>
        {/* Reminder Banner for iOS */}
        {showReminderBanner && (
          <div className="fixed bottom-4 left-4 right-4 z-40 animate-in slide-in-from-bottom-5 duration-500">
            <div className="bg-[#ffd93d] border-3 border-[#1a1a1a] p-4" style={{ boxShadow: '4px 4px 0px 0px #1a1a1a' }}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#ff6b9d] border-2 border-[#1a1a1a] flex items-center justify-center" style={{ boxShadow: '2px 2px 0px 0px #1a1a1a' }}>
                    <Smartphone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-sm text-[#1a1a1a]">Install grabit2me App</p>
                    <p className="text-xs font-medium text-[#1a1a1a]">Get instant access from your home screen!</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleReminderInstall}
                    className="h-10 px-4 bg-[#1a1a1a] text-white border-2 border-[#1a1a1a] font-bold text-sm transition-all"
                    style={{ boxShadow: '2px 2px 0px 0px #ff6b9d' }}
                  >
                    Install
                  </button>
                  <button
                    onClick={handleReminderDismiss}
                    className="h-10 w-10 bg-white border-2 border-[#1a1a1a] font-bold flex items-center justify-center transition-all"
                    style={{ boxShadow: '2px 2px 0px 0px #1a1a1a' }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Sheet open={showIOSPrompt} onOpenChange={setShowIOSPrompt}>
          <SheetContent side="bottom" className="h-auto bg-[#fef3c7] border-t-3 border-[#1a1a1a] rounded-none p-0">
            <div className="p-5 sm:p-6">
              <SheetHeader className="text-left mb-5">
                <SheetTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#ff6b9d] border-2 border-[#1a1a1a] flex items-center justify-center" style={{ boxShadow: '2px 2px 0px 0px #1a1a1a' }}>
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-black text-xl">Install grabit2me App</span>
                </SheetTitle>
                <SheetDescription className="text-[#525252] font-medium mt-2">
                  Get the best experience with our app on your iPhone!
                </SheetDescription>
              </SheetHeader>
              
              <div className="pb-5">
                <div className="space-y-4">
                  <div className="bg-white border-3 border-[#1a1a1a] p-4" style={{ boxShadow: '3px 3px 0px 0px #1a1a1a' }}>
                    <h4 className="font-black text-base text-[#1a1a1a] mb-4">Installation Steps:</h4>
                    <ol className="space-y-4 text-sm text-[#525252]">
                      <li className="flex items-start gap-3">
                        <span className="shrink-0 w-8 h-8 bg-[#6bcfff] border-2 border-[#1a1a1a] flex items-center justify-center text-sm font-black" style={{ boxShadow: '2px 2px 0px 0px #1a1a1a' }}>1</span>
                        <span className="pt-1.5 font-medium">Tap the <Share2 className="inline w-4 h-4 mx-1" /> Share button at the bottom of your screen</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="shrink-0 w-8 h-8 bg-[#98ee99] border-2 border-[#1a1a1a] flex items-center justify-center text-sm font-black" style={{ boxShadow: '2px 2px 0px 0px #1a1a1a' }}>2</span>
                        <span className="pt-1.5 font-medium">Scroll down and tap <strong>"Add to Home Screen"</strong></span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="shrink-0 w-8 h-8 bg-[#ff6b9d] border-2 border-[#1a1a1a] flex items-center justify-center text-sm font-black text-white" style={{ boxShadow: '2px 2px 0px 0px #1a1a1a' }}>3</span>
                        <span className="pt-1.5 font-medium">Tap <strong>"Add"</strong> in the top right corner</span>
                      </li>
                    </ol>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm bg-[#6bcfff] border-2 border-[#1a1a1a] p-3" style={{ boxShadow: '2px 2px 0px 0px #1a1a1a' }}>
                    <Download className="w-5 h-5" />
                    <span className="font-bold">Access grabit2me instantly from your home screen!</span>
                  </div>
                </div>
              </div>

              <SheetFooter>
                <button 
                  onClick={handleIOSDismiss} 
                  className="w-full h-14 bg-[#1a1a1a] text-white border-3 border-[#1a1a1a] font-black text-lg transition-all"
                  style={{ boxShadow: '4px 4px 0px 0px #ff6b9d' }}
                >
                  Got it!
                </button>
              </SheetFooter>
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Android/Desktop Install Prompt using Sheet
  return (
    <>
      {/* Reminder Banner for Android/Desktop */}
      {showReminderBanner && (
        <div className="fixed bottom-4 left-4 right-4 z-40 animate-in slide-in-from-bottom-5 duration-500">
          <div className="bg-[#98ee99] border-3 border-[#1a1a1a] p-4" style={{ boxShadow: '4px 4px 0px 0px #1a1a1a' }}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#ff6b9d] border-2 border-[#1a1a1a] flex items-center justify-center" style={{ boxShadow: '2px 2px 0px 0px #1a1a1a' }}>
                  <Download className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-black text-sm text-[#1a1a1a]">Install grabit2me App</p>
                  <p className="text-xs font-medium text-[#1a1a1a]">Quick access, works offline, and faster!</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleReminderInstall}
                  className="h-10 px-4 bg-[#1a1a1a] text-white border-2 border-[#1a1a1a] font-bold text-sm transition-all"
                  style={{ boxShadow: '2px 2px 0px 0px #ff6b9d' }}
                >
                  Install
                </button>
                <button
                  onClick={handleReminderDismiss}
                  className="h-10 w-10 bg-white border-2 border-[#1a1a1a] font-bold flex items-center justify-center transition-all"
                  style={{ boxShadow: '2px 2px 0px 0px #1a1a1a' }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Sheet open={showInstall} onOpenChange={setShowInstall}>
        <SheetContent side="bottom" className="h-auto bg-[#fef3c7] border-t-3 border-[#1a1a1a] rounded-none p-0">
          <div className="p-5 sm:p-6">
            <SheetHeader className="text-left mb-5">
              <SheetTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#98ee99] border-2 border-[#1a1a1a] flex items-center justify-center" style={{ boxShadow: '2px 2px 0px 0px #1a1a1a' }}>
                  <Download className="w-5 h-5 text-[#1a1a1a]" />
                </div>
                <span className="font-black text-xl">Install grabit2me App</span>
              </SheetTitle>
              <SheetDescription className="text-[#525252] font-medium mt-2">
                Install grabit2me for quick access and a better experience!
              </SheetDescription>
            </SheetHeader>
            
            <div className="pb-5">
              <div className="space-y-4">
                <div className="flex items-start gap-4 bg-white border-2 border-[#1a1a1a] p-4" style={{ boxShadow: '2px 2px 0px 0px #1a1a1a' }}>
                  <div className="shrink-0 w-12 h-12 bg-[#6bcfff] border-2 border-[#1a1a1a] flex items-center justify-center" style={{ boxShadow: '2px 2px 0px 0px #1a1a1a' }}>
                    <Smartphone className="w-6 h-6 text-[#1a1a1a]" />
                  </div>
                  <div>
                    <h4 className="font-black text-[#1a1a1a]">Works Offline</h4>
                    <p className="text-[#525252] text-sm font-medium">Access your downloads even without internet</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 bg-white border-2 border-[#1a1a1a] p-4" style={{ boxShadow: '2px 2px 0px 0px #1a1a1a' }}>
                  <div className="shrink-0 w-12 h-12 bg-[#ffd93d] border-2 border-[#1a1a1a] flex items-center justify-center" style={{ boxShadow: '2px 2px 0px 0px #1a1a1a' }}>
                    <Download className="w-6 h-6 text-[#1a1a1a]" />
                  </div>
                  <div>
                    <h4 className="font-black text-[#1a1a1a]">Lightning Fast</h4>
                    <p className="text-[#525252] text-sm font-medium">Native app performance and speed</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 bg-white border-2 border-[#1a1a1a] p-4" style={{ boxShadow: '2px 2px 0px 0px #1a1a1a' }}>
                  <div className="shrink-0 w-12 h-12 bg-[#ff6b9d] border-2 border-[#1a1a1a] flex items-center justify-center" style={{ boxShadow: '2px 2px 0px 0px #1a1a1a' }}>
                    <Share2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-[#1a1a1a]">Easy Access</h4>
                    <p className="text-[#525252] text-sm font-medium">Launch directly from your home screen</p>
                  </div>
                </div>
              </div>
            </div>

            <SheetFooter className="flex-col sm:flex-col gap-3">
              <button 
                onClick={handleInstallClick} 
                className="w-full h-14 bg-[#1a1a1a] text-white border-3 border-[#1a1a1a] font-black text-lg transition-all"
                style={{ boxShadow: '4px 4px 0px 0px #98ee99' }}
              >
                Install Now
              </button>
              <button 
                onClick={handleDismiss} 
                className="w-full h-12 bg-white text-[#1a1a1a] border-3 border-[#1a1a1a] font-bold text-base transition-all"
                style={{ boxShadow: '3px 3px 0px 0px #1a1a1a' }}
              >
                Maybe Later
              </button>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
