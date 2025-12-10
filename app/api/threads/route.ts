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

    // Check if it's a Threads URL (supports both threads.net and threads.com)
    const threadsRegex = /^https?:\/\/(www\.)?(threads\.net|threads\.com)\/@[A-Za-z0-9._]+\/post\/[A-Za-z0-9_-]+/;
    if (!threadsRegex.test(url)) {
      return NextResponse.json(
        { error: 'Please provide a valid Threads post URL' },
        { status: 400 }
      );
    }

    // Clean the URL by removing query parameters and normalize domain to threads.net
    let cleanUrl = url.split('?')[0];
    cleanUrl = cleanUrl.replace('threads.com', 'threads.net');

    // Fetch the Threads page
    let response;
    try {
      response = await axios.get(cleanUrl, {
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
      console.error('Threads fetch error:', err.message);
      return NextResponse.json(
        { error: 'Failed to fetch Threads content. The post may be private or unavailable.' },
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
            'Threads Post';

    description = $('meta[property="og:description"]').attr('content') || 'Threads';

    // Method 1: Extract from meta tags (primary method for Threads)
    const videoMetaUrl = $('meta[property="og:video"]').attr('content') ||
                        $('meta[property="og:video:url"]').attr('content') ||
                        $('meta[property="og:video:secure_url"]').attr('content');
    
    const videoType = $('meta[property="og:video:type"]').attr('content');
    const imageMetaUrl = $('meta[property="og:image"]').attr('content') ||
                        $('meta[property="og:image:url"]').attr('content');
    
    let isVideoPost = false;
    
    // Prioritize video if video meta tag exists or if type indicates video
    if (videoMetaUrl) {
      mediaUrl = videoMetaUrl;
      type = 'video';
    } else if (videoType && videoType.includes('video')) {
      // Mark as video post - we need to extract from scripts
      isVideoPost = true;
    } else if (imageMetaUrl) {
      // Check if the image URL looks like a video
      const imageUrl = imageMetaUrl.toLowerCase();
      if (imageUrl.includes('.mp4') || imageUrl.includes('video')) {
        mediaUrl = imageMetaUrl;
        type = 'video';
      } else if (!isVideoPost) {
        // Only set as image if we haven't detected it's a video post
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

    // Method 3: Extract from inline JavaScript and window.__RELAY_STORE__
    // Force extraction if we know it's a video post but haven't found URL yet
    if (!mediaUrl || type === null || isVideoPost) {
      const allScripts = $('script').toArray();
      for (const script of allScripts) {
        const scriptContent = $(script).html() || '';
        
        // Look for window.__RELAY_STORE__ or similar data stores (prioritize video)
        if (scriptContent.includes('__RELAY_STORE__') || scriptContent.includes('PolarisPostRoot')) {
          // Extract video_versions or video data
          const videoVersionsMatch = scriptContent.match(/"video_versions":\s*\[([^\]]+)\]/);
          if (videoVersionsMatch) {
            try {
              const videoData = JSON.parse('[' + videoVersionsMatch[1] + ']');
              if (videoData.length > 0 && videoData[0].url) {
                mediaUrl = videoData[0].url.replace(/\\u0026/g, '&').replace(/\\/g, '');
                type = 'video';
                break;
              }
            } catch (e) {
              // Continue parsing
            }
          }
        }
        
        // Threads uses Instagram's infrastructure, so similar patterns apply
        // Look for video_url pattern (PRIORITY for videos)
        const videoUrlMatch = scriptContent.match(/"video_url":"([^"]+)"/);
        if (videoUrlMatch && videoUrlMatch[1]) {
          mediaUrl = videoUrlMatch[1].replace(/\\u0026/g, '&').replace(/\\/g, '');
          type = 'video';
          break;
        }

        // Look for playable_url pattern
        const playableUrlMatch = scriptContent.match(/"playable_url":"([^"]+)"/);
        if (playableUrlMatch && playableUrlMatch[1]) {
          mediaUrl = playableUrlMatch[1].replace(/\\u0026/g, '&').replace(/\\/g, '');
          type = 'video';
          break;
        }

        // Look for playback_url pattern (Threads specific)
        const playbackUrlMatch = scriptContent.match(/"playback_url":"([^"]+)"/);
        if (playbackUrlMatch && playbackUrlMatch[1]) {
          mediaUrl = playbackUrlMatch[1].replace(/\\u0026/g, '&').replace(/\\/g, '');
          type = 'video';
          break;
        }
      }
      
      // Only look for images if we haven't found a video yet AND it's not a video post
      if (!mediaUrl && !isVideoPost) {
        for (const script of allScripts) {
          const scriptContent = $(script).html() || '';

          // Look for display_url for images
          const displayUrlMatch = scriptContent.match(/"display_url":"([^"]+)"/);
          if (displayUrlMatch && displayUrlMatch[1]) {
            mediaUrl = displayUrlMatch[1].replace(/\\u0026/g, '&').replace(/\\/g, '');
            type = 'image';
            break;
          }

          // Look for image_versions2
          const imageVersionMatch = scriptContent.match(/"image_versions2"[^}]*"url":"([^"]+)"/);
          if (imageVersionMatch && imageVersionMatch[1]) {
            mediaUrl = imageVersionMatch[1].replace(/\\u0026/g, '&').replace(/\\/g, '');
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
      
      // If no video, look for images
      if (!mediaUrl) {
        const imgElement = $('img[src*="cdninstagram"]').first();
        if (imgElement.length > 0) {
          mediaUrl = imgElement.attr('src') || null;
          if (mediaUrl) {
            type = 'image';
          }
        }
      }

      // Try looking for scontent CDN URLs (Threads/Instagram CDN)
      if (!mediaUrl) {
        const imgWithScontent = $('img[src*="scontent"]').first();
        if (imgWithScontent.length > 0) {
          mediaUrl = imgWithScontent.attr('src') || null;
          if (mediaUrl) {
            type = 'image';
          }
        }
      }
    }

    // Method 5: Search for any .mp4 URLs in the entire page source
    if (!mediaUrl) {
      const pageSource = response.data;
      // Look for .mp4 URLs
      const mp4Match = pageSource.match(/https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*/);
      if (mp4Match && mp4Match[0]) {
        mediaUrl = mp4Match[0].replace(/\\u0026/g, '&').replace(/\\/g, '').replace(/&amp;/g, '&');
        type = 'video';
      }
    }

    // If still no media found, return error
    if (!mediaUrl || !type) {
      console.error('Threads extraction failed. No media found in:', url);
      console.error('Available meta tags:', {
        ogVideo: $('meta[property="og:video"]').attr('content'),
        ogImage: $('meta[property="og:image"]').attr('content'),
        videoElements: $('video').length,
        imageElements: $('img[src*="scontent"]').length,
      });
      
      return NextResponse.json(
        { error: 'Could not extract media from this Threads post. The post may be private, deleted, or contain only text. Please try a different post.' },
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
    console.error('Threads download error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred while processing the Threads URL' },
      { status: 500 }
    );
  }
}
