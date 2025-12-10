# Testing PWA Install Prompts on Mobile

## ✅ What Was Fixed

### Install Prompt Now Shows:
- **Faster**: Appears after 1 second (was 3 seconds)
- **More Often**: Reappears after 1 day if dismissed (was 7 days)
- **Reminder Banner**: Shows after 5 seconds (was 10 seconds)

## 📱 How to Test Install Prompt

### Method 1: Clear Local Storage (Fastest)

**On Mobile Chrome/Safari:**
1. Open Developer Console (if available)
2. Paste this code:
   ```javascript
   localStorage.removeItem('pwa-prompt-dismissed');
   localStorage.removeItem('pwa-prompt-dismissed-time');
   localStorage.removeItem('ios-pwa-prompt-dismissed');
   localStorage.removeItem('ios-pwa-prompt-dismissed-time');
   localStorage.removeItem('pwa-reminder-dismissed');
   localStorage.removeItem('pwa-reminder-dismissed-time');
   location.reload();
   ```

**Or use the Reset Script:**
- Visit: `https://your-domain.com/reset-pwa-prompts.js`
- Copy and paste in console
- Reload page

### Method 2: Clear Browser Data

**Android (Chrome):**
1. Chrome Menu (⋮) → Settings
2. Privacy and Security → Clear browsing data
3. Select "Cached images and files" + "Cookies and site data"
4. Clear data
5. Revisit your site

**iOS (Safari):**
1. Settings → Safari
2. Clear History and Website Data
3. Confirm
4. Revisit your site in Safari

### Method 3: Incognito/Private Mode

**Quick Test:**
1. Open site in Incognito/Private browsing
2. Wait 1-5 seconds
3. Install prompt should appear

## 🔍 What Should Happen

### Android Chrome:
- ✅ Native install prompt after ~1 second
- ✅ Reminder banner after ~5 seconds (if prompt dismissed)
- ✅ Prompt shows again after 1 day if dismissed

### iOS Safari:
- ✅ Custom iOS install sheet after ~1 second
- ✅ Shows Share button instructions
- ✅ Reminder banner after ~5 seconds
- ✅ Reappears after 1 day if dismissed

## 🐛 Troubleshooting

### Prompt Not Showing?

**Check if already installed:**
- Android: Look for app in app drawer
- iOS: Check home screen
- Running in standalone mode = already installed

**Requirements:**
- ✅ Must use HTTPS (or localhost)
- ✅ Must have valid manifest.json
- ✅ Must have registered service worker
- ✅ Must meet PWA criteria

**Force Reset:**
1. Uninstall PWA if installed
2. Clear all browser data
3. Close and reopen browser
4. Visit site fresh

### Android Specific:
- Chrome may delay prompt based on engagement
- Must visit site at least twice in 5 minutes
- Try visiting, leaving, and returning

### iOS Specific:
- Must use Safari (not Chrome)
- Install prompt is custom (not native)
- Shows instructions to add to home screen

## 📊 Testing Checklist

- [ ] Clear localStorage
- [ ] Reload page
- [ ] Wait 1-5 seconds
- [ ] See install prompt or banner
- [ ] Test "Install" button works
- [ ] Test "Dismiss" button works
- [ ] Test prompt reappears after 1 day
- [ ] Verify app icon is correct
- [ ] Verify splash screen shows icon
- [ ] Verify status bar is white with dark icons

## 🚀 Production Notes

- Install prompts are aggressive now for testing
- Consider adjusting delays for production:
  - Initial prompt: 1-3 seconds
  - Reminder: 5-10 seconds
  - Reappear: 1-7 days
- Monitor user behavior and adjust accordingly
