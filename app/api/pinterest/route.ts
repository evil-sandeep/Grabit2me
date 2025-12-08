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

    // Check if it's a Pinterest URL
    const pinterestRegex = /^https?:\/\/(www\.)?(pinterest\.(com|ca|co\.uk|de|fr|it|es|com\.au|nz|jp|kr|com\.mx|cl|ph|pt|se|at|dk|fi|no|be|ch|ie|ru|in|my|sg|th|vn|za|ae|hk|tw|br|com\.co|nl)|pin\.it)/;
    if (!pinterestRegex.test(url)) {
      return NextResponse.json(
        { error: 'Please provide a valid Pinterest URL' },
        { status: 400 }
      );
    }

    // Normalize pin.it short URLs
    let normalizedUrl = url;
    if (url.includes('pin.it')) {
      try {
        const response = await axios.get(url, {
          maxRedirects: 5,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });
        normalizedUrl = response.request.res.responseUrl || url;
      } catch (err) {
        // Continue with original URL if redirect fails
      }
    }

    // Fetch the Pinterest page
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
      console.error('Pinterest fetch error:', err.message);
      return NextResponse.json(
        { error: 'Failed to fetch Pinterest content. The pin may be private or unavailable.' },
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
            'Pinterest Media';

    description = $('meta[property="og:description"]').attr('content') || 'Pinterest';

    // Method 1: Extract from JSON-LD script tags
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
      // Check for video first
      const videoMetaUrl = $('meta[property="og:video"]').attr('content') ||
                          $('meta[property="og:video:url"]').attr('content') ||
                          $('meta[property="og:video:secure_url"]').attr('content');
      
      if (videoMetaUrl) {
        mediaUrl = videoMetaUrl;
        type = 'video';
      } else {
        // Try image meta tags
        const imageMetaUrl = $('meta[property="og:image"]').attr('content') ||
                            $('meta[property="og:image:url"]').attr('content') ||
                            $('meta[property="og:image:secure_url"]').attr('content');
        if (imageMetaUrl) {
          mediaUrl = imageMetaUrl;
          type = 'image';
        }
      }
    }

    // Method 3: Extract from inline JavaScript (Pinterest's data)
    if (!mediaUrl) {
      const allScripts = $('script').toArray();
      for (const script of allScripts) {
        const scriptContent = $(script).html() || '';
        
        // Look for Pinterest's __PWS_DATA__ or similar data structures
        if (scriptContent.includes('__PWS_DATA__') || scriptContent.includes('resourceDataCache')) {
          // Try to find video URL
          const videoUrlMatch = scriptContent.match(/"url":"([^"]+\.mp4[^"]*)"/);
          if (videoUrlMatch && videoUrlMatch[1]) {
            mediaUrl = videoUrlMatch[1].replace(/\\u002F/g, '/').replace(/\\/g, '');
            type = 'video';
            break;
          }

          // Look for high-resolution image (orig)
          const origImageMatch = scriptContent.match(/"url":"([^"]+\/originals\/[^"]+)"/);
          if (origImageMatch && origImageMatch[1]) {
            mediaUrl = origImageMatch[1].replace(/\\u002F/g, '/').replace(/\\/g, '');
            type = 'image';
            break;
          }

          // Look for any image URL
          const imageUrlMatch = scriptContent.match(/"url":"([^"]+\.(jpg|jpeg|png|webp)[^"]*)"/i);
          if (imageUrlMatch && imageUrlMatch[1]) {
            mediaUrl = imageUrlMatch[1].replace(/\\u002F/g, '/').replace(/\\/g, '');
            type = 'image';
            break;
          }
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
      
      // If no video, look for high-quality images
      if (!mediaUrl) {
        const imgElement = $('img[src*="pinimg.com"]').first();
        if (imgElement.length > 0) {
          let imgSrc = imgElement.attr('src') || null;
          if (imgSrc) {
            // Try to get original quality by replacing URL pattern
            imgSrc = imgSrc.replace(/\/\d+x\//g, '/originals/');
            mediaUrl = imgSrc;
            type = 'image';
          }
        }
      }
    }

    // If still no media found, return error
    if (!mediaUrl || !type) {
      return NextResponse.json(
        { error: 'Could not extract media from this Pinterest pin. The pin may be private or contain no downloadable media.' },
        { status: 404 }
      );
    }

    // Ensure full URL
    if (mediaUrl.startsWith('//')) {
      mediaUrl = 'https:' + mediaUrl;
    } else if (mediaUrl.startsWith('/')) {
      mediaUrl = 'https://www.pinterest.com' + mediaUrl;
    }

    return NextResponse.json({
      type,
      mediaUrl,
      title: title.substring(0, 100),
      description: description.substring(0, 100),
    });

  } catch (error: any) {
    console.error('Pinterest download error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred while processing the Pinterest URL' },
      { status: 500 }
    );
  }
}
