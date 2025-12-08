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

    // Check if it's a TikTok URL
    const tiktokRegex = /^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)/;
    if (!tiktokRegex.test(url)) {
      return NextResponse.json(
        { error: 'Please provide a valid TikTok URL' },
        { status: 400 }
      );
    }

    // Normalize short URLs (vm.tiktok.com, vt.tiktok.com)
    let normalizedUrl = url;
    if (url.includes('vm.tiktok.com') || url.includes('vt.tiktok.com')) {
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

    // Fetch the TikTok page
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
      console.error('TikTok fetch error:', err.message);
      return NextResponse.json(
        { error: 'Failed to fetch TikTok content. The video may be private or unavailable.' },
        { status: 500 }
      );
    }

    // Parse HTML with cheerio
    const $ = cheerio.load(response.data);

    let mediaUrl: string | null = null;
    let type: 'video' | 'image' = 'video'; // TikTok is primarily video
    let title: string | undefined;
    let description: string | undefined;

    // Extract title and description from meta tags
    title = $('meta[property="og:title"]').attr('content') || 
            $('meta[name="description"]').attr('content') ||
            $('title').text() ||
            'TikTok Video';

    description = $('meta[property="og:description"]').attr('content') || 
                  $('meta[name="author"]').attr('content') ||
                  'TikTok';

    // Method 1: Extract from meta tags
    const videoMetaUrl = $('meta[property="og:video"]').attr('content') ||
                        $('meta[property="og:video:url"]').attr('content') ||
                        $('meta[property="og:video:secure_url"]').attr('content');
    
    if (videoMetaUrl) {
      mediaUrl = videoMetaUrl;
      type = 'video';
    }

    // Method 2: Extract from JSON-LD script tags
    if (!mediaUrl) {
      const scriptTags = $('script[type="application/ld+json"]').toArray();
      for (const script of scriptTags) {
        try {
          const jsonData = JSON.parse($(script).html() || '{}');
          if (jsonData.contentUrl) {
            mediaUrl = jsonData.contentUrl;
            type = 'video';
            break;
          }
          if (jsonData.video && jsonData.video.contentUrl) {
            mediaUrl = jsonData.video.contentUrl;
            type = 'video';
            break;
          }
        } catch (e) {
          // Continue to next method
        }
      }
    }

    // Method 3: Extract from inline JavaScript (TikTok's __UNIVERSAL_DATA_FOR_REHYDRATION__)
    if (!mediaUrl) {
      const allScripts = $('script').toArray();
      for (const script of allScripts) {
        const scriptContent = $(script).html() || '';
        
        // Look for __UNIVERSAL_DATA_FOR_REHYDRATION__ or similar
        if (scriptContent.includes('__UNIVERSAL_DATA_FOR_REHYDRATION__') || 
            scriptContent.includes('SIGI_STATE')) {
          
          // Try to find playAddr or downloadAddr
          const playAddrMatch = scriptContent.match(/"playAddr":"([^"]+)"/);
          if (playAddrMatch && playAddrMatch[1]) {
            mediaUrl = playAddrMatch[1].replace(/\\u002F/g, '/').replace(/\\/g, '');
            type = 'video';
            break;
          }

          const downloadAddrMatch = scriptContent.match(/"downloadAddr":"([^"]+)"/);
          if (downloadAddrMatch && downloadAddrMatch[1]) {
            mediaUrl = downloadAddrMatch[1].replace(/\\u002F/g, '/').replace(/\\/g, '');
            type = 'video';
            break;
          }

          // Look for video URL in different formats
          const videoUrlMatch = scriptContent.match(/"video"[^}]*"url":"([^"]+)"/);
          if (videoUrlMatch && videoUrlMatch[1]) {
            mediaUrl = videoUrlMatch[1].replace(/\\u002F/g, '/').replace(/\\/g, '');
            type = 'video';
            break;
          }
        }
      }
    }

    // Method 4: Look for script with direct video data
    if (!mediaUrl) {
      const allScripts = $('script').toArray();
      for (const script of allScripts) {
        const scriptContent = $(script).html() || '';
        
        // Look for direct video URLs
        const videoUrlPatterns = [
          /"video_url":"([^"]+)"/,
          /"videoUrl":"([^"]+)"/,
          /"url":"(https:\/\/[^"]*\.mp4[^"]*)"/,
        ];

        for (const pattern of videoUrlPatterns) {
          const match = scriptContent.match(pattern);
          if (match && match[1]) {
            mediaUrl = match[1].replace(/\\u002F/g, '/').replace(/\\/g, '');
            type = 'video';
            break;
          }
        }
        
        if (mediaUrl) break;
      }
    }

    // Method 5: Try to find video elements directly in HTML
    if (!mediaUrl) {
      const videoElement = $('video').first();
      if (videoElement.length > 0) {
        mediaUrl = videoElement.attr('src') || videoElement.find('source').first().attr('src') || null;
        if (mediaUrl) {
          type = 'video';
        }
      }
    }

    // If still no media found, return error
    if (!mediaUrl) {
      return NextResponse.json(
        { error: 'Could not extract video from this TikTok. The video may be private, age-restricted, or unavailable in your region.' },
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
    console.error('TikTok download error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred while processing the TikTok URL' },
      { status: 500 }
    );
  }
}
