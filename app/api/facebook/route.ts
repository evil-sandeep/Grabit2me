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

    // Check if it's a Facebook URL
    const facebookRegex = /^https?:\/\/(www\.)?(facebook\.com|fb\.watch|fb\.com)/;
    if (!facebookRegex.test(url)) {
      return NextResponse.json(
        { error: 'Please provide a valid Facebook post or video URL' },
        { status: 400 }
      );
    }

    // Normalize the URL
    let normalizedUrl = url;
    
    // Convert fb.watch to facebook.com
    if (url.includes('fb.watch')) {
      const watchId = url.split('fb.watch/')[1]?.split(/[?#]/)[0];
      if (watchId) {
        normalizedUrl = `https://www.facebook.com/watch?v=${watchId}`;
      }
    }

    // Ensure mobile URL for better parsing
    if (!normalizedUrl.includes('m.facebook.com')) {
      normalizedUrl = normalizedUrl.replace('www.facebook.com', 'm.facebook.com');
      normalizedUrl = normalizedUrl.replace('facebook.com', 'm.facebook.com');
    }

    // Fetch the Facebook page HTML
    let response;
    try {
      response = await axios.get(normalizedUrl, {
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
      console.error('Facebook fetch error:', err.message);
      return NextResponse.json(
        { error: 'Failed to fetch Facebook content. The post may be private or unavailable.' },
        { status: 500 }
      );
    }

    // Parse HTML with cheerio
    const $ = cheerio.load(response.data);

    let mediaUrl: string | null = null;
    let type: 'video' | 'image' | null = null;
    let title: string | undefined;

    // Extract title from meta tags or page content
    title = $('meta[property="og:title"]').attr('content') || 
            $('meta[name="description"]').attr('content') ||
            $('title').text() ||
            'Facebook Video';

    // Method 1: Try to extract from JSON-LD script tags
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

    // Method 2: Extract from meta tags
    if (!mediaUrl) {
      // Try video meta tags first
      const videoMetaUrl = $('meta[property="og:video"]').attr('content') ||
                          $('meta[property="og:video:url"]').attr('content') ||
                          $('meta[property="og:video:secure_url"]').attr('content');
      
      if (videoMetaUrl) {
        mediaUrl = videoMetaUrl;
        type = 'video';
      } else {
        // Try image meta tags
        const imageMetaUrl = $('meta[property="og:image"]').attr('content');
        if (imageMetaUrl) {
          mediaUrl = imageMetaUrl;
          type = 'image';
        }
      }
    }

    // Method 3: Try to extract from inline JavaScript
    if (!mediaUrl) {
      const allScripts = $('script').toArray();
      for (const script of allScripts) {
        const scriptContent = $(script).html() || '';
        
        // Look for HD video URL pattern
        const hdVideoMatch = scriptContent.match(/"playable_url":"([^"]+)"/);
        if (hdVideoMatch && hdVideoMatch[1]) {
          mediaUrl = hdVideoMatch[1].replace(/\\u0025/g, '%').replace(/\\\//g, '/').replace(/\\/g, '');
          type = 'video';
          break;
        }

        // Look for SD video URL pattern
        const sdVideoMatch = scriptContent.match(/"playable_url_quality_hd":"([^"]+)"/);
        if (sdVideoMatch && sdVideoMatch[1]) {
          mediaUrl = sdVideoMatch[1].replace(/\\u0025/g, '%').replace(/\\\//g, '/').replace(/\\/g, '');
          type = 'video';
          break;
        }

        // Look for video_url pattern
        const videoUrlMatch = scriptContent.match(/"video_url":"([^"]+)"/);
        if (videoUrlMatch && videoUrlMatch[1]) {
          mediaUrl = videoUrlMatch[1].replace(/\\u0025/g, '%').replace(/\\\//g, '/').replace(/\\/g, '');
          type = 'video';
          break;
        }

        // Look for src pattern in video tags
        const videoSrcMatch = scriptContent.match(/"src":"([^"]+\.mp4[^"]*)"/);
        if (videoSrcMatch && videoSrcMatch[1]) {
          mediaUrl = videoSrcMatch[1].replace(/\\u0025/g, '%').replace(/\\\//g, '/').replace(/\\/g, '');
          type = 'video';
          break;
        }
      }
    }

    // Method 4: Try to find video/image elements directly in HTML
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
        const imgElement = $('img[data-src]').first();
        if (imgElement.length > 0) {
          mediaUrl = imgElement.attr('data-src') || imgElement.attr('src') || null;
          if (mediaUrl) {
            type = 'image';
          }
        }
      }
    }

    // If still no media found, return error
    if (!mediaUrl || !type) {
      return NextResponse.json(
        { error: 'Could not extract media from this Facebook post. The post may be private, contain no media, or use a format we don\'t support yet.' },
        { status: 404 }
      );
    }

    // Decode URL-encoded characters
    mediaUrl = decodeURIComponent(mediaUrl);

    return NextResponse.json({
      type,
      mediaUrl,
      title: title.substring(0, 100), // Limit title length
      description: 'Facebook',
    });

  } catch (error: any) {
    console.error('Facebook download error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred while processing the Facebook URL' },
      { status: 500 }
    );
  }
}
