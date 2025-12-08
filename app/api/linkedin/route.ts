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
          'Sec-Fetch-User': '?1',
          'Cache-Control': 'max-age=0',
          'Referer': 'https://www.linkedin.com/',
        },
        timeout: 20000,
        maxRedirects: 5,
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

    // Method 1: Extract from inline JavaScript FIRST (most reliable for videos)
    const allScripts = $('script').toArray();
    console.log(`Found ${allScripts.length} script tags to analyze`);
    
    for (const script of allScripts) {
      const scriptContent = $(script).html() || '';
      
      // Look for progressiveStreams (high priority for video)
      const progressiveStreamsMatch = scriptContent.match(/"progressiveStreams":\[([^\]]+)\]/);
      if (progressiveStreamsMatch) {
        const streams = progressiveStreamsMatch[1];
        const streamUrlMatch = streams.match(/"streamingLocations":\[{"url":"([^"]+)"/);
        if (streamUrlMatch && streamUrlMatch[1]) {
          mediaUrl = streamUrlMatch[1].replace(/\\u002F/g, '/').replace(/\\/g, '');
          type = 'video';
          console.log('Found video via progressiveStreams');
          break;
        }
      }

      // Look for video data in LinkedIn's data structures
      const progressiveUrlMatch = scriptContent.match(/"progressiveUrl":"([^"]+)"/);
      if (progressiveUrlMatch && progressiveUrlMatch[1]) {
        mediaUrl = progressiveUrlMatch[1].replace(/\\u002F/g, '/').replace(/\\/g, '');
        type = 'video';
        console.log('Found video via progressiveUrl');
        break;
      }

      // Look for downloadUrl
      const downloadUrlMatch = scriptContent.match(/"downloadUrl":"([^"]+)"/);
      if (downloadUrlMatch && downloadUrlMatch[1]) {
        mediaUrl = downloadUrlMatch[1].replace(/\\u002F/g, '/').replace(/\\/g, '');
        type = 'video';
        console.log('Found video via downloadUrl');
        break;
      }

      // Look for adaptiveStreams with highest quality
      const adaptiveStreamsMatch = scriptContent.match(/"adaptiveStreams":\[([^\]]+)\]/);
      if (adaptiveStreamsMatch) {
        const streams = adaptiveStreamsMatch[1];
        const urlMatch = streams.match(/"url":"([^"]+)"/);
        if (urlMatch && urlMatch[1]) {
          mediaUrl = urlMatch[1].replace(/\\u002F/g, '/').replace(/\\/g, '');
          type = 'video';
          console.log('Found video via adaptiveStreams');
          break;
        }
      }

      // Look for transcoded videos array
      const transcodedMatch = scriptContent.match(/"transcodedVideos":\[([^\]]+)\]/);
      if (transcodedMatch) {
        const videos = transcodedMatch[1];
        const urlMatch = videos.match(/"url":"([^"]+)"/);
        if (urlMatch && urlMatch[1]) {
          mediaUrl = urlMatch[1].replace(/\\u002F/g, '/').replace(/\\/g, '');
          type = 'video';
          console.log('Found video via transcodedVideos');
          break;
        }
      }

      // Look for media patterns with .mp4
      const mp4Match = scriptContent.match(/"(https?:[^"]*\.mp4[^"]*)"/);
      if (mp4Match && mp4Match[1]) {
        mediaUrl = mp4Match[1].replace(/\\u002F/g, '/').replace(/\\/g, '');
        type = 'video';
        console.log('Found video via mp4 pattern');
        break;
      }

      // Look for video URL in various formats
      const videoUrlPatterns = [
        /"videoUrl":"([^"]+)"/,
        /"video_url":"([^"]+)"/,
        /"src":"(https?:[^"]*dms-exp[^"]*video[^"]*)"/,
        /"url":"(https?:[^"]*\.cloudfront\.net[^"]*\.mp4[^"]*)"/,
        /"playableUrl":"([^"]+)"/,
        /"hlsVideoUrl":"([^"]+)"/
      ];

      for (const pattern of videoUrlPatterns) {
        const match = scriptContent.match(pattern);
        if (match && match[1]) {
          mediaUrl = match[1].replace(/\\u002F/g, '/').replace(/\\/g, '');
          type = 'video';
          console.log('Found video via URL pattern:', pattern.source);
          break;
        }
      }

      if (mediaUrl && type === 'video') break;
    }

    console.log('After script scan - mediaUrl:', mediaUrl ? 'found' : 'not found', 'type:', type);

    // Method 2: Extract from meta tags (fallback)
    if (!mediaUrl) {
      const videoMetaUrl = $('meta[property="og:video"]').attr('content') ||
                          $('meta[property="og:video:url"]').attr('content') ||
                          $('meta[property="og:video:secure_url"]').attr('content') ||
                          $('meta[name="twitter:player:stream"]').attr('content');
      
      if (videoMetaUrl) {
        mediaUrl = videoMetaUrl;
        type = 'video';
      }
    }

    // Method 3: Try to find video elements directly in HTML
    if (!mediaUrl) {
      const videoElement = $('video').first();
      if (videoElement.length > 0) {
        mediaUrl = videoElement.attr('src') || videoElement.find('source').first().attr('src') || null;
        if (mediaUrl) {
          type = 'video';
        }
      }
    }

    // Method 4: Extract from JSON-LD script tags
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
        } catch (e) {
          // Continue to next method
        }
      }
    }

    // Method 5: Only look for images if no video found (LAST RESORT)
    if (!mediaUrl) {
      // Try image meta tags
      const imageMetaUrl = $('meta[property="og:image"]').attr('content') ||
                          $('meta[property="og:image:url"]').attr('content');
      if (imageMetaUrl) {
        mediaUrl = imageMetaUrl;
        type = 'image';
      }
    }

    // Method 6: Look for image URLs in scripts (only if no video)
    if (!mediaUrl) {
      for (const script of allScripts) {
        const scriptContent = $(script).html() || '';
        
        // Look for image URLs
        const imageUrlMatch = scriptContent.match(/"url":"(https:\/\/media\.licdn\.com\/dms\/image[^"]+)"/);
        if (imageUrlMatch && imageUrlMatch[1]) {
          mediaUrl = imageUrlMatch[1].replace(/\\u002F/g, '/').replace(/\\/g, '');
          type = 'image';
          break;
        }
      }
    }

    // Method 7: Find images in HTML (absolute last resort)
    if (!mediaUrl) {
      const imgElement = $('img[src*="media.licdn.com"]').first();
      if (imgElement.length > 0) {
        mediaUrl = imgElement.attr('src') || null;
        if (mediaUrl) {
          type = 'image';
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
