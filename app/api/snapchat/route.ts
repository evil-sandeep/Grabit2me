import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate Snapchat URL
    if (!url.includes('snapchat.com') && !url.includes('snap.com')) {
      return NextResponse.json(
        { error: 'Invalid Snapchat URL' },
        { status: 400 }
      );
    }

    // Fetch the Snapchat page
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);

    let mediaUrl = '';
    let mediaType: 'video' | 'image' = 'video';
    let title = '';

    // Method 1: Check meta tags for video
    const ogVideo = $('meta[property="og:video"]').attr('content') || 
                    $('meta[property="og:video:url"]').attr('content') ||
                    $('meta[property="og:video:secure_url"]').attr('content');
    
    if (ogVideo) {
      mediaUrl = ogVideo;
      mediaType = 'video';
    }

    // Method 2: Check meta tags for image
    if (!mediaUrl) {
      const ogImage = $('meta[property="og:image"]').attr('content') ||
                      $('meta[property="og:image:url"]').attr('content');
      
      if (ogImage) {
        mediaUrl = ogImage;
        mediaType = 'image';
      }
    }

    // Method 3: Check Twitter meta tags
    if (!mediaUrl) {
      const twitterPlayer = $('meta[name="twitter:player:stream"]').attr('content') ||
                           $('meta[name="twitter:player"]').attr('content');
      
      if (twitterPlayer) {
        mediaUrl = twitterPlayer;
        mediaType = 'video';
      }
    }

    // Method 4: Look for JSON-LD data
    if (!mediaUrl) {
      $('script[type="application/ld+json"]').each((_, element) => {
        try {
          const jsonData = JSON.parse($(element).html() || '');
          if (jsonData.video && jsonData.video.contentUrl) {
            mediaUrl = jsonData.video.contentUrl;
            mediaType = 'video';
          } else if (jsonData.image && jsonData.image.url) {
            mediaUrl = jsonData.image.url;
            mediaType = 'image';
          }
        } catch (e) {
          // Skip invalid JSON
        }
      });
    }

    // Method 5: Check for video elements in the page
    if (!mediaUrl) {
      const videoSrc = $('video source').attr('src') || $('video').attr('src');
      if (videoSrc) {
        mediaUrl = videoSrc;
        mediaType = 'video';
      }
    }

    // Method 6: Check for image elements
    if (!mediaUrl) {
      const imgSrc = $('img[class*="snap"]').first().attr('src') || 
                     $('img[alt*="Snap"]').first().attr('src');
      if (imgSrc) {
        mediaUrl = imgSrc;
        mediaType = 'image';
      }
    }

    // Get title
    title = $('meta[property="og:title"]').attr('content') ||
            $('meta[name="twitter:title"]').attr('content') ||
            $('title').text() ||
            'Snapchat Media';

    if (!mediaUrl) {
      return NextResponse.json(
        { error: 'Could not extract media from Snapchat URL. The content may be private or unavailable.' },
        { status: 404 }
      );
    }

    // Ensure URL is absolute
    if (mediaUrl.startsWith('//')) {
      mediaUrl = 'https:' + mediaUrl;
    } else if (mediaUrl.startsWith('/')) {
      const urlObj = new URL(url);
      mediaUrl = urlObj.origin + mediaUrl;
    }

    return NextResponse.json({
      type: mediaType,
      mediaUrl,
      title,
    });

  } catch (error: any) {
    console.error('Snapchat download error:', error.message);
    
    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'Snapchat content not found or is private' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch Snapchat media. Please check the URL and try again.' },
      { status: 500 }
    );
  }
}
