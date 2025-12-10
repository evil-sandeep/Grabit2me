// Force Show PWA Install Prompt - Debug Script
// Run this in browser console to reset install prompt flags

(function() {
  console.log('🔧 Clearing PWA install prompt flags...');
  
  // Clear all PWA-related localStorage items
  localStorage.removeItem('pwa-prompt-dismissed');
  localStorage.removeItem('pwa-prompt-dismissed-time');
  localStorage.removeItem('ios-pwa-prompt-dismissed');
  localStorage.removeItem('ios-pwa-prompt-dismissed-time');
  localStorage.removeItem('pwa-reminder-dismissed');
  localStorage.removeItem('pwa-reminder-dismissed-time');
  
  console.log('✅ All PWA prompt flags cleared!');
  console.log('📱 Reload the page to see install prompts again');
  console.log('⚠️  Note: You may need to wait 1-5 seconds after reload');
  
  // Optional: Auto reload
  if (confirm('Clear successful! Reload page now to see install prompts?')) {
    window.location.reload();
  }
})();
