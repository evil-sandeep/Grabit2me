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

    // Check if it's a Twitter/X URL
    const twitterRegex = /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[A-Za-z0-9_]+\/status\/\d+/;
    if (!twitterRegex.test(url)) {
      return NextResponse.json(
        { error: 'Please provide a valid Twitter/X post URL' },
        { status: 400 }
      );
    }

    // Convert x.com to twitter.com for API compatibility
    const twitterUrl = url.replace('x.com', 'twitter.com');

    // Try multiple methods to extract media

    // Method 1: Using Twitter's syndication API (Guest token approach)
    try {
      const tweetId = twitterUrl.match(/status\/(\d+)/)?.[1];
      if (!tweetId) {
        throw new Error('Could not extract tweet ID');
      }

      // First, get a guest token
      let guestToken;
      try {
        const tokenResponse = await axios.post(
          'https://api.twitter.com/1.1/guest/activate.json',
          {},
          {
            headers: {
              'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
            },
          }
        );
        guestToken = tokenResponse.data.guest_token;
      } catch (err) {
        // If guest token fails, try without it
        console.log('Guest token failed, trying alternative methods');
      }

      // Try syndication endpoint first (works for public tweets)
      const syndicationUrl = `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&lang=en`;
      const syndicationResponse = await axios.get(syndicationUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        timeout: 10000,
      });

      const tweetData = syndicationResponse.data;

      // Extract media from syndication response
      if (tweetData && tweetData.mediaDetails && tweetData.mediaDetails.length > 0) {
        const media = tweetData.mediaDetails[0];
        
        if (media.type === 'video' || media.type === 'animated_gif') {
          // Get the highest quality video variant
          const variants = media.video_info?.variants || [];
          const mp4Variants = variants.filter((v: any) => v.content_type === 'video/mp4');
          
          if (mp4Variants.length > 0) {
            // Sort by bitrate to get highest quality
            mp4Variants.sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));
            const videoUrl = mp4Variants[0].url;
            
            return NextResponse.json({
              type: 'video',
              mediaUrl: videoUrl,
              title: tweetData.text || 'Twitter Video',
              description: tweetData.user?.name || 'Twitter User',
            });
          }
        } else if (media.type === 'photo') {
          const imageUrl = media.media_url_https || media.media_url;
          
          return NextResponse.json({
            type: 'image',
            mediaUrl: imageUrl,
            title: tweetData.text || 'Twitter Image',
            description: tweetData.user?.name || 'Twitter User',
          });
        }
      }
    } catch (syndicationError) {
      console.error('Syndication method failed:', syndicationError);
    }

    // Method 2: Scrape the page directly
    try {
      const response = await axios.get(twitterUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 15000,
      });

      const $ = cheerio.load(response.data);
      
      // Try to extract video from meta tags
      const videoMetaTags = [
        'meta[property="og:video"]',
        'meta[property="og:video:url"]',
        'meta[property="twitter:player:stream"]',
        'meta[name="twitter:player:stream"]',
      ];

      for (const selector of videoMetaTags) {
        const videoUrl = $(selector).attr('content');
        if (videoUrl && videoUrl.includes('.mp4')) {
          return NextResponse.json({
            type: 'video',
            mediaUrl: videoUrl,
            title: $('meta[property="og:title"]').attr('content') || 'Twitter Video',
            description: $('meta[property="og:description"]').attr('content') || '',
          });
        }
      }

      // Try to extract image
      const imageMetaTags = [
        'meta[property="og:image"]',
        'meta[name="twitter:image"]',
        'meta[property="twitter:image"]',
      ];

      for (const selector of imageMetaTags) {
        const imageUrl = $(selector).attr('content');
        if (imageUrl && !imageUrl.includes('profile_images')) {
          return NextResponse.json({
            type: 'image',
            mediaUrl: imageUrl,
            title: $('meta[property="og:title"]').attr('content') || 'Twitter Image',
            description: $('meta[property="og:description"]').attr('content') || '',
          });
        }
      }
    } catch (scrapingError) {
      console.error('Scraping method failed:', scrapingError);
    }

    // Method 3: Try using vxtwitter as a fallback
    try {
      const vxUrl = twitterUrl.replace('twitter.com', 'api.vxtwitter.com');
      const vxResponse = await axios.get(vxUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 10000,
      });

      const vxData = vxResponse.data;
      if (vxData && vxData.media_extended) {
        const media = vxData.media_extended[0];
        
        if (media.type === 'video' || media.type === 'gif') {
          return NextResponse.json({
            type: 'video',
            mediaUrl: media.url,
            title: vxData.text || 'Twitter Video',
            description: vxData.user_name || 'Twitter User',
          });
        } else if (media.type === 'image') {
          return NextResponse.json({
            type: 'image',
            mediaUrl: media.url,
            title: vxData.text || 'Twitter Image',
            description: vxData.user_name || 'Twitter User',
          });
        }
      }
    } catch (vxError) {
      console.error('VxTwitter method failed:', vxError);
    }

    return NextResponse.json(
      { 
        error: 'Could not extract media from this tweet. The tweet might be private, deleted, or contain no media.',
        details: 'Please make sure the tweet is public and contains a video or image.'
      },
      { status: 404 }
    );

  } catch (error: any) {
    console.error('Twitter download error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to process the Twitter URL',
        details: 'An unexpected error occurred while processing your request.'
      },
      { status: 500 }
    );
  }
}
