# Instagram Public Video Downloader

A modern, clean Instagram media downloader built with Next.js 16, TypeScript, and shadcn/ui.

## ✨ Features

- 📥 Download public Instagram photos and videos
- 🎥 Support for Posts, Reels, and IGTV
- 🎨 Beautiful UI with shadcn/ui components
- 🌓 Dark mode support
- ⚡ Fast and responsive
- 🔒 Safe and legal (OG-tag scraping only)
- 📱 Mobile-friendly design

## 🚀 Technologies Used

- **Next.js 16** - App Router
- **TypeScript** - Type safety
- **shadcn/ui** - Beautiful UI components
- **Tailwind CSS v4** - Styling
- **axios** - HTTP requests
- **cheerio** - HTML parsing
- **lucide-react** - Icons

## 📦 Installation

```bash
# Install dependencies
bun install

# Run development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🎯 Usage

1. Open Instagram and find the post you want to download
2. Copy the post URL from your browser address bar or share menu
   - Example: `https://www.instagram.com/p/XXXXXXXXX/`
   - Example: `https://www.instagram.com/reel/XXXXXXXXX/`
3. Paste the URL into the input field
4. Click "Fetch Media" button
5. Preview the media and click "Download" to save it

## 🔧 How It Works

1. **Frontend** (`app/page.tsx`):
   - User inputs Instagram URL
   - Sends POST request to API route
   - Displays loading state, errors, or media preview
   - Provides download functionality

2. **Backend API** (`app/api/instagram/route.ts`):
   - Validates Instagram URL format
   - Fetches HTML from Instagram post page
   - Parses multiple data sources:
     - OG meta tags (`og:video`, `og:image`)
     - JSON-LD structured data
     - Inline JavaScript data from window objects
   - Returns JSON with media URL and type

## 🛠️ Extraction Methods

The API tries multiple extraction methods in order:

1. **OG Meta Tags**: `og:video`, `og:video:secure_url`, `og:image`
2. **JSON-LD Data**: Schema.org structured data
3. **Inline JavaScript**: Extracts from `window._sharedData` and similar objects

## ⚠️ Important Notes

- **Legal & Safe**: Only extracts publicly available metadata from open web pages
- **No Authentication Bypass**: Does not access private content
- **No API Hacking**: Does not reverse engineer Meta's private APIs
- **Public Posts Only**: Works only with public Instagram posts
- **Educational Purpose**: For learning and personal use only
- **Rate Limiting**: Instagram may rate-limit requests from the same IP

## 🚫 Limitations

- Only works with **public** Instagram posts
- Private accounts and posts are not accessible
- Rate limiting may apply from Instagram's side
- Some posts may not have extractable metadata
- Instagram's HTML structure may change over time

## 🛠️ Project Structure

```
insta/
├── app/
│   ├── api/
│   │   └── instagram/
│   │       └── route.ts          # API endpoint for scraping
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Main UI page
├── components/
│   └── ui/                        # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       └── input.tsx
├── lib/
│   └── utils.ts                   # Utility functions
└── package.json
```

## 🎨 UI Components

- **Card**: Container for the main interface
- **Input**: URL input field with validation
- **Button**: Fetch and download actions with loading states
- **Icons**: Instagram, Download, Loader, Alert icons (from lucide-react)

## 🐛 Troubleshooting

**Error: "Could not extract media"**
- The post might be private or from a private account
- Instagram's HTML structure may have changed
- The URL might be invalid or the post deleted
- Try with a different public post

**Error: "Request timeout"**
- Instagram servers might be slow
- Check your internet connection
- Try again after a few seconds

**Error: "Too many requests"**
- You've been rate-limited by Instagram
- Wait a few minutes before trying again

## 📝 License

This project is for educational purposes only. Please respect content creators' rights and Instagram's terms of service.

## ⚡ Build for Production

```bash
# Build the app
bun run build

# Start production server
bun start
```

## 🔒 Security & Privacy

- No user data is stored
- No tracking or analytics
- All processing happens server-side
- No Instagram login required or supported

---

Built with ❤️ using Next.js 16, TypeScript, and shadcn/ui
# insta-downloader
