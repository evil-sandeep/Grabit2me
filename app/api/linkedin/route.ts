import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    // Validate URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a valid URL' },
        { status: 400 }
      );
    }

    // Check if it's a LinkedIn URL
    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/(posts|feed\/update)/;
    if (!linkedinRegex.test(url)) {
      return NextResponse.json(
        { error: 'Please provide a valid LinkedIn post URL' },
        { status: 400 }
      );
    }

    // Fetch the LinkedIn page
    let response;
    try {
      response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Cache-Control': 'max-age=0',
        },
        timeout: 15000,
      });
    } catch (err: any) {
      console.error('LinkedIn fetch error:', err.message);
      return NextResponse.json(
        { error: 'Failed to fetch LinkedIn content. The post may be private or require authentication.' },
        { status: 500 }
      );
    }

    // Parse HTML with cheerio
    const $ = cheerio.load(response.data);

    let mediaUrl: string | null = null;
    let type: 'video' | 'image' | null = null;
    let title: string | undefined;
    let description: string | undefined;

    // Extract title and description from meta tags
    title = $('meta[property="og:title"]').attr('content') || 
            $('meta[name="description"]').attr('content') ||
            $('title').text() ||
            'LinkedIn Post';

    description = $('meta[property="og:description"]').attr('content') || 'LinkedIn';

    // Method 1: Extract from meta tags (primary for LinkedIn)
    const videoMetaUrl = $('meta[property="og:video"]').attr('content') ||
                        $('meta[property="og:video:url"]').attr('content') ||
                        $('meta[property="og:video:secure_url"]').attr('content');
    
    if (videoMetaUrl) {
      mediaUrl = videoMetaUrl;
      type = 'video';
    } else {
      // Try image meta tags
      const imageMetaUrl = $('meta[property="og:image"]').attr('content') ||
                          $('meta[property="og:image:url"]').attr('content');
      if (imageMetaUrl) {
        mediaUrl = imageMetaUrl;
        type = 'image';
      }
    }

    // Method 2: Extract from JSON-LD script tags
    if (!mediaUrl) {
      const scriptTags = $('script[type="application/ld+json"]').toArray();
      for (const script of scriptTags) {
        try {
          const jsonData = JSON.parse($(script).html() || '{}');
          if (jsonData.video && jsonData.video.contentUrl) {
            mediaUrl = jsonData.video.contentUrl;
            type = 'video';
            break;
          }
          if (jsonData.image && typeof jsonData.image === 'string') {
            mediaUrl = jsonData.image;
            type = 'image';
            break;
          }
        } catch (e) {
          // Continue to next method
        }
      }
    }

    // Method 3: Extract from inline JavaScript
    if (!mediaUrl) {
      const allScripts = $('script').toArray();
      for (const script of allScripts) {
        const scriptContent = $(script).html() || '';
        
        // Look for video data in LinkedIn's data structures
        const videoUrlMatch = scriptContent.match(/"progressiveUrl":"([^"]+)"/);
        if (videoUrlMatch && videoUrlMatch[1]) {
          mediaUrl = videoUrlMatch[1].replace(/\\u002F/g, '/').replace(/\\/g, '');
          type = 'video';
          break;
        }

        // Look for media patterns
        const mediaUrlMatch = scriptContent.match(/"media":"([^"]+)"/);
        if (mediaUrlMatch && mediaUrlMatch[1]) {
          const url = mediaUrlMatch[1].replace(/\\u002F/g, '/').replace(/\\/g, '');
          if (url.includes('.mp4')) {
            mediaUrl = url;
            type = 'video';
            break;
          } else if (url.match(/\.(jpg|jpeg|png|webp)/i)) {
            mediaUrl = url;
            type = 'image';
            break;
          }
        }

        // Look for downloadUrl
        const downloadUrlMatch = scriptContent.match(/"downloadUrl":"([^"]+)"/);
        if (downloadUrlMatch && downloadUrlMatch[1]) {
          mediaUrl = downloadUrlMatch[1].replace(/\\u002F/g, '/').replace(/\\/g, '');
          type = 'video';
          break;
        }

        // Look for image URLs
        const imageUrlMatch = scriptContent.match(/"url":"(https:\/\/media\.licdn\.com\/dms\/image[^"]+)"/);
        if (imageUrlMatch && imageUrlMatch[1]) {
          mediaUrl = imageUrlMatch[1].replace(/\\u002F/g, '/').replace(/\\/g, '');
          type = 'image';
          break;
        }
      }
    }

    // Method 4: Try to find video or image elements directly in HTML
    if (!mediaUrl) {
      // Look for video elements
      const videoElement = $('video').first();
      if (videoElement.length > 0) {
        mediaUrl = videoElement.attr('src') || videoElement.find('source').first().attr('src') || null;
        if (mediaUrl) {
          type = 'video';
        }
      }
      
      // If no video, look for images
      if (!mediaUrl) {
        const imgElement = $('img[src*="media.licdn.com"]').first();
        if (imgElement.length > 0) {
          mediaUrl = imgElement.attr('src') || null;
          if (mediaUrl) {
            type = 'image';
          }
        }
      }
    }

    // If still no media found, return error
    if (!mediaUrl || !type) {
      return NextResponse.json(
        { error: 'Could not extract media from this LinkedIn post. The post may be private, require authentication, or contain no downloadable media.' },
        { status: 404 }
      );
    }

    // Ensure full URL
    if (mediaUrl.startsWith('//')) {
      mediaUrl = 'https:' + mediaUrl;
    }

    return NextResponse.json({
      type,
      mediaUrl,
      title: title.substring(0, 100),
      description: description.substring(0, 100),
    });

  } catch (error: any) {
    console.error('LinkedIn download error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred while processing the LinkedIn URL' },
      { status: 500 }
    );
  }
}
