import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

// User agents for rotation to avoid detection
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

// Get random user agent
function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// Extract post ID from Threads URL
function extractPostId(url: string): string | null {
  const postMatch = url.match(/\/(?:post|t)\/([A-Za-z0-9_-]+)/);
  return postMatch ? postMatch[1] : null;
}

// Clean and decode URL
function cleanMediaUrl(url: string): string {
  return url
    .replace(/\\u0026/g, '&')
    .replace(/\\u002F/g, '/')
    .replace(/\\\//g, '/')
    .replace(/\\/g, '')
    .replace(/&amp;/g, '&');
}

interface ExtractedMedia {
  videoUrl: string | null;
  imageUrl: string | null;
  videoVersions: string[];
}

// Extract media from embedded JSON data in HTML
function extractFromEmbeddedData(html: string): ExtractedMedia {
  let videoUrl: string | null = null;
  let imageUrl: string | null = null;
  const videoVersions: string[] = [];

  try {
    // Pattern 1: Look for video_versions array (Instagram/Threads format)
    const videoVersionsRegex = /"video_versions"\s*:\s*\[([^\]]+)\]/g;
    let match;
    while ((match = videoVersionsRegex.exec(html)) !== null) {
      try {
        const versions = JSON.parse('[' + match[1] + ']');
        for (const version of versions) {
          if (version.url) {
            const cleanUrl = cleanMediaUrl(version.url);
            videoVersions.push(cleanUrl);
            if (!videoUrl) videoUrl = cleanUrl;
          }
        }
      } catch {
        // Try regex fallback for malformed JSON
        const urlMatches = match[1].match(/"url"\s*:\s*"([^"]+)"/g);
        if (urlMatches) {
          for (const urlMatch of urlMatches) {
            const urlExtract = urlMatch.match(/"url"\s*:\s*"([^"]+)"/);
            if (urlExtract) {
              const cleanUrl = cleanMediaUrl(urlExtract[1]);
              videoVersions.push(cleanUrl);
              if (!videoUrl) videoUrl = cleanUrl;
            }
          }
        }
      }
    }

    // Pattern 2: Look for various video URL patterns
    const videoUrlPatterns = [
      /"video_url"\s*:\s*"([^"]+)"/,
      /"playable_url"\s*:\s*"([^"]+)"/,
      /"playable_url_quality_hd"\s*:\s*"([^"]+)"/,
      /"playback_url"\s*:\s*"([^"]+)"/,
      /"stream_url"\s*:\s*"([^"]+)"/,
      /"src"\s*:\s*"(https?:[^"]*\.mp4[^"]*)"/,
    ];

    for (const pattern of videoUrlPatterns) {
      const videoMatch = html.match(pattern);
      if (videoMatch && videoMatch[1]) {
        const cleanUrl = cleanMediaUrl(videoMatch[1]);
        if (!videoUrl) videoUrl = cleanUrl;
        if (!videoVersions.includes(cleanUrl)) videoVersions.push(cleanUrl);
      }
    }

    // Pattern 3: Look for image_versions2 (for images)
    if (!videoUrl) {
      const imageVersionsMatch = html.match(/"image_versions2"\s*:\s*\{[^}]*"candidates"\s*:\s*\[([^\]]+)\]/);
      if (imageVersionsMatch) {
        try {
          const candidates = JSON.parse('[' + imageVersionsMatch[1] + ']');
          if (candidates.length > 0 && candidates[0].url) {
            imageUrl = cleanMediaUrl(candidates[0].url);
          }
        } catch {
          const urlMatch = imageVersionsMatch[1].match(/"url"\s*:\s*"([^"]+)"/);
          if (urlMatch) {
            imageUrl = cleanMediaUrl(urlMatch[1]);
          }
        }
      }
    }

    // Pattern 4: Look for display_url (image fallback)
    if (!imageUrl) {
      const displayUrlMatch = html.match(/"display_url"\s*:\s*"([^"]+)"/);
      if (displayUrlMatch) {
        imageUrl = cleanMediaUrl(displayUrlMatch[1]);
      }
    }

    // Pattern 5: Look for any CDN video URLs
    if (!videoUrl) {
      const cdnVideoPattern = /https?:\/\/(?:scontent|video)[^"'\s<>]*\.mp4[^"'\s<>]*/gi;
      const cdnMatches = html.match(cdnVideoPattern);
      if (cdnMatches && cdnMatches.length > 0) {
        videoUrl = cleanMediaUrl(cdnMatches[0]);
      }
    }

  } catch (error) {
    console.error('Error extracting from embedded data:', error);
  }

  return { videoUrl, imageUrl, videoVersions };
}

// Make HTTP request with retry logic
async function fetchWithRetry(url: string, maxRetries = 2): Promise<any> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const userAgent = getRandomUserAgent();
      const response = await axios.get(url, {
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Cache-Control': 'max-age=0',
          'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
        },
        timeout: 20000,
        maxRedirects: 5,
      });
      return response;
    } catch (error: any) {
      lastError = error;
      console.error(`Attempt ${attempt + 1} failed:`, error.message);
      
      // Wait before retry
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }
  
  throw lastError;
}

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

    // Check if it's a Threads URL (supports both threads.net and threads.com, and short URLs)
    const threadsRegex = /^https?:\/\/(www\.)?(threads\.net|threads\.com)\/((@[A-Za-z0-9._]+\/post\/[A-Za-z0-9_-]+)|t\/[A-Za-z0-9_-]+)/;
    if (!threadsRegex.test(url)) {
      return NextResponse.json(
        { error: 'Please provide a valid Threads post URL' },
        { status: 400 }
      );
    }

    // Clean the URL
    let cleanUrl = url.split('?')[0];
    
    // Try threads.net first
    const urlsToTry = [
      cleanUrl.replace('threads.com', 'threads.net'),
      cleanUrl.replace('threads.net', 'threads.com'),
    ];

    let response = null;
    let lastError = null;

    // Try both domain variants
    for (const tryUrl of urlsToTry) {
      try {
        response = await fetchWithRetry(tryUrl);
        if (response) break;
      } catch (error: any) {
        lastError = error;
        console.error(`Failed to fetch ${tryUrl}:`, error.message);
      }
    }

    if (!response) {
      return NextResponse.json(
        { error: 'Failed to fetch Threads content. The post may be private or unavailable.' },
        { status: 500 }
      );
    }

    const html = response.data;
    const $ = cheerio.load(html);

    let mediaUrl: string | null = null;
    let type: 'video' | 'image' | null = null;

    // Extract title and description
    const title = $('meta[property="og:title"]').attr('content') || 
                  $('meta[name="twitter:title"]').attr('content') ||
                  $('title').text() ||
                  'Threads Post';

    const description = $('meta[property="og:description"]').attr('content') || 
                        $('meta[name="twitter:description"]').attr('content') ||
                        'Threads';

    // Method 1: Extract from embedded JSON data (most reliable for videos)
    const embeddedData = extractFromEmbeddedData(html);
    
    if (embeddedData.videoUrl) {
      mediaUrl = embeddedData.videoUrl;
      type = 'video';
    }

    // Method 2: Extract from meta tags
    if (!mediaUrl) {
      const videoMetaUrl = $('meta[property="og:video"]').attr('content') ||
                          $('meta[property="og:video:url"]').attr('content') ||
                          $('meta[property="og:video:secure_url"]').attr('content') ||
                          $('meta[name="twitter:player:stream"]').attr('content');
      
      if (videoMetaUrl) {
        mediaUrl = cleanMediaUrl(videoMetaUrl);
        type = 'video';
      }
    }

    // Check if this is a video post
    const videoType = $('meta[property="og:video:type"]').attr('content');
    const ogType = $('meta[property="og:type"]').attr('content');
    const isVideoPost = videoType?.includes('video') || ogType?.includes('video');

    // Method 3: Extract from JSON-LD
    if (!mediaUrl) {
      const scriptTags = $('script[type="application/ld+json"]').toArray();
      for (const script of scriptTags) {
        try {
          const jsonData = JSON.parse($(script).html() || '{}');
          
          if (jsonData['@type'] === 'VideoObject' && jsonData.contentUrl) {
            mediaUrl = cleanMediaUrl(jsonData.contentUrl);
            type = 'video';
            break;
          }
          
          if (jsonData.video?.contentUrl) {
            mediaUrl = cleanMediaUrl(jsonData.video.contentUrl);
            type = 'video';
            break;
          }
        } catch {
          // Continue to next script
        }
      }
    }

    // Method 4: Parse all script tags for video URLs
    if (!mediaUrl || isVideoPost) {
      const allScripts = $('script').toArray();
      for (const script of allScripts) {
        const scriptContent = $(script).html() || '';
        
        // Skip empty or small scripts
        if (scriptContent.length < 100) continue;
        
        // Look for video patterns
        const patterns = [
          /"video_versions"\s*:\s*\[([^\]]+)\]/,
          /"video_url"\s*:\s*"([^"]+)"/,
          /"playable_url"\s*:\s*"([^"]+)"/,
          /"playable_url_quality_hd"\s*:\s*"([^"]+)"/,
          /"playback_url"\s*:\s*"([^"]+)"/,
        ];

        for (const pattern of patterns) {
          const match = scriptContent.match(pattern);
          if (match) {
            if (pattern.source.includes('video_versions')) {
              // Parse video versions array
              try {
                const versions = JSON.parse('[' + match[1] + ']');
                if (versions.length > 0 && versions[0].url) {
                  mediaUrl = cleanMediaUrl(versions[0].url);
                  type = 'video';
                  break;
                }
              } catch {
                const urlMatch = match[1].match(/"url"\s*:\s*"([^"]+)"/);
                if (urlMatch) {
                  mediaUrl = cleanMediaUrl(urlMatch[1]);
                  type = 'video';
                  break;
                }
              }
            } else if (match[1]) {
              mediaUrl = cleanMediaUrl(match[1]);
              type = 'video';
              break;
            }
          }
        }
        
        if (mediaUrl && type === 'video') break;
      }
    }

    // Method 5: Get image from meta tags (fallback)
    if (!mediaUrl && !isVideoPost) {
      const imageMetaUrl = $('meta[property="og:image"]').attr('content') ||
                          $('meta[property="og:image:url"]').attr('content') ||
                          $('meta[name="twitter:image"]').attr('content');
      
      if (imageMetaUrl) {
        const imgUrl = imageMetaUrl.toLowerCase();
        if (imgUrl.includes('.mp4') || imgUrl.includes('video')) {
          mediaUrl = cleanMediaUrl(imageMetaUrl);
          type = 'video';
        } else {
          mediaUrl = embeddedData.imageUrl || cleanMediaUrl(imageMetaUrl);
          type = 'image';
        }
      }
    }

    // Method 6: Direct HTML video elements
    if (!mediaUrl) {
      const videoElement = $('video').first();
      if (videoElement.length > 0) {
        const videoSrc = videoElement.attr('src') || 
                        videoElement.find('source').first().attr('src') ||
                        videoElement.attr('data-src');
        if (videoSrc) {
          mediaUrl = cleanMediaUrl(videoSrc);
          type = 'video';
        }
      }
    }

    // Method 7: Find CDN images
    if (!mediaUrl) {
      const imgSelectors = [
        'img[src*="cdninstagram"]',
        'img[src*="scontent"]',
        'img[src*="fbcdn"]',
      ];
      
      for (const selector of imgSelectors) {
        const imgElement = $(selector).first();
        if (imgElement.length > 0) {
          const imgSrc = imgElement.attr('src');
          if (imgSrc) {
            mediaUrl = cleanMediaUrl(imgSrc);
            type = 'image';
            break;
          }
        }
      }
    }

    // Method 8: Use embedded image as last resort
    if (!mediaUrl && embeddedData.imageUrl) {
      mediaUrl = embeddedData.imageUrl;
      type = 'image';
    }

    // If no media found, return error
    if (!mediaUrl || !type) {
      console.error('Threads extraction failed for:', url);
      console.error('Debug:', {
        ogVideo: $('meta[property="og:video"]').attr('content'),
        ogImage: $('meta[property="og:image"]').attr('content'),
        embeddedVideoUrl: embeddedData.videoUrl,
        embeddedImageUrl: embeddedData.imageUrl,
        videoVersionsCount: embeddedData.videoVersions.length,
      });
      
      return NextResponse.json(
        { error: 'Could not extract media from this Threads post. The post may be private, deleted, or contain only text.' },
        { status: 404 }
      );
    }

    // Ensure full URL
    if (mediaUrl.startsWith('//')) {
      mediaUrl = 'https:' + mediaUrl;
    }

    // Use best quality video if multiple versions available
    if (type === 'video' && embeddedData.videoVersions.length > 1) {
      mediaUrl = embeddedData.videoVersions[0];
    }

    return NextResponse.json({
      type,
      mediaUrl,
      title: title?.substring(0, 100) || 'Threads Post',
      description: description?.substring(0, 100) || 'Threads',
      ...(embeddedData.videoVersions.length > 1 && {
        qualities: embeddedData.videoVersions.map((url, index) => ({
          quality: index === 0 ? 'HD' : `Option ${index + 1}`,
          url,
        })),
      }),
    });

  } catch (error: any) {
    console.error('Threads download error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred while processing the Threads URL' },
      { status: 500 }
    );
  }
}
