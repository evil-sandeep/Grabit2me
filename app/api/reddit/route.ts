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

    // Validate Reddit URL
    if (!url.includes('reddit.com') && !url.includes('redd.it')) {
      return NextResponse.json(
        { error: 'Invalid Reddit URL' },
        { status: 400 }
      );
    }

    let actualUrl = url;

    // Handle short URLs (redd.it)
    if (url.includes('redd.it')) {
      try {
        const redirectResponse = await axios.get(url, {
          maxRedirects: 0,
          validateStatus: (status) => status === 301 || status === 302,
        });
        actualUrl = redirectResponse.headers.location || url;
      } catch (error: any) {
        if (error.response?.headers?.location) {
          actualUrl = error.response.headers.location;
        }
      }
    }

    // Ensure URL ends with .json for API access
    const jsonUrl = actualUrl.split('?')[0].replace(/\/$/, '') + '.json';

    // Fetch Reddit post data via JSON API
    const response = await axios.get(jsonUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
    });

    const data = response.data;
    
    // Reddit JSON API returns an array where first element contains post data
    const postData = data[0]?.data?.children?.[0]?.data;

    if (!postData) {
      return NextResponse.json(
        { error: 'Could not find Reddit post data' },
        { status: 404 }
      );
    }

    let mediaUrl = '';
    let mediaType: 'video' | 'image' = 'image';
    let title = postData.title || 'Reddit Media';

    // Method 1: Check for Reddit video
    if (postData.is_video && postData.media?.reddit_video) {
      mediaUrl = postData.media.reddit_video.fallback_url || 
                 postData.media.reddit_video.hls_url ||
                 postData.media.reddit_video.dash_url;
      mediaType = 'video';
    }

    // Method 2: Check for direct image/gif
    if (!mediaUrl && postData.url) {
      const urlLower = postData.url.toLowerCase();
      if (urlLower.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        mediaUrl = postData.url;
        mediaType = 'image';
      } else if (urlLower.includes('i.redd.it') || urlLower.includes('i.imgur.com')) {
        mediaUrl = postData.url;
        mediaType = 'image';
      }
    }

    // Method 3: Check for v.redd.it video
    if (!mediaUrl && postData.url && postData.url.includes('v.redd.it')) {
      // Fallback to scraping the page for video URL
      const pageResponse = await axios.get(actualUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      
      const $ = cheerio.load(pageResponse.data);
      const videoSrc = $('video source').attr('src') || $('video').attr('src');
      
      if (videoSrc) {
        mediaUrl = videoSrc;
        mediaType = 'video';
      }
    }

    // Method 4: Check preview images
    if (!mediaUrl && postData.preview?.images?.[0]) {
      const previewImage = postData.preview.images[0];
      mediaUrl = previewImage.source?.url || previewImage.url;
      
      // Decode HTML entities in URL
      if (mediaUrl) {
        mediaUrl = mediaUrl.replace(/&amp;/g, '&');
      }
      mediaType = 'image';
    }

    // Method 5: Check for gallery (take first image)
    if (!mediaUrl && postData.gallery_data?.items?.[0]) {
      const mediaId = postData.gallery_data.items[0].media_id;
      const mediaMetadata = postData.media_metadata?.[mediaId];
      
      if (mediaMetadata?.s?.u) {
        mediaUrl = mediaMetadata.s.u.replace(/&amp;/g, '&');
        mediaType = 'image';
      }
    }

    // Method 6: Check for external hosted video (e.g., imgur, gfycat)
    if (!mediaUrl && postData.secure_media?.oembed?.thumbnail_url) {
      mediaUrl = postData.secure_media.oembed.thumbnail_url;
      mediaType = 'image';
    }

    if (!mediaUrl) {
      return NextResponse.json(
        { error: 'Could not extract media from Reddit post. The post may not contain downloadable media or may be private.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      type: mediaType,
      mediaUrl,
      title,
      description: postData.selftext || undefined,
    });

  } catch (error: any) {
    console.error('Reddit download error:', error.message);
    
    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'Reddit post not found or is private' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch Reddit media. Please check the URL and try again.' },
      { status: 500 }
    );
  }
}
