import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

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

    // Extract tweet ID
    const tweetId = url.match(/status\/(\d+)/)?.[1];
    if (!tweetId) {
      return NextResponse.json(
        { error: 'Could not extract tweet ID from URL' },
        { status: 400 }
      );
    }

    // Method 1: Try fxtwitter (most reliable)
    try {
      // fxtwitter provides direct access to Twitter media
      const fxUrl = `https://api.fxtwitter.com/status/${tweetId}`;
      const fxResponse = await axios.get(fxUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        timeout: 15000,
      });

      const tweetData = fxResponse.data?.tweet;
      
      if (tweetData) {
        // Check for video
        if (tweetData.media?.videos && tweetData.media.videos.length > 0) {
          const videos = tweetData.media.videos;
          // Get the highest quality video
          const highestQuality = videos.reduce((prev: any, current: any) => 
            (current.width > prev.width) ? current : prev
          );
          
          return NextResponse.json({
            type: 'video',
            mediaUrl: highestQuality.url,
            title: tweetData.text || 'Twitter Video',
            description: tweetData.author?.name || 'Twitter User',
            thumbnail: tweetData.media?.videos[0]?.thumbnail_url || null,
          });
        }
        
        // Check for photos
        if (tweetData.media?.photos && tweetData.media.photos.length > 0) {
          return NextResponse.json({
            type: 'image',
            mediaUrl: tweetData.media.photos[0].url,
            title: tweetData.text || 'Twitter Image',
            description: tweetData.author?.name || 'Twitter User',
          });
        }

        // Check for GIF
        if (tweetData.media?.all && tweetData.media.all.length > 0) {
          const gifMedia = tweetData.media.all.find((m: any) => m.type === 'gif' || m.type === 'video');
          if (gifMedia) {
            return NextResponse.json({
              type: 'video',
              mediaUrl: gifMedia.url,
              title: tweetData.text || 'Twitter Media',
              description: tweetData.author?.name || 'Twitter User',
            });
          }
        }
      }
    } catch (fxError) {
      console.error('FxTwitter method failed:', fxError);
    }

    // Method 2: Try fixupx as fallback
    try {
      const fixupxUrl = url.replace(/https?:\/\/(www\.)?(twitter\.com|x\.com)/, 'https://api.fixupx.com');
      const fixupxResponse = await axios.get(fixupxUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 15000,
      });

      const fixupxData = fixupxResponse.data;
      
      if (fixupxData?.tweet) {
        const tweet = fixupxData.tweet;
        
        // Check for video
        if (tweet.media?.videos && tweet.media.videos.length > 0) {
          const video = tweet.media.videos[0];
          return NextResponse.json({
            type: 'video',
            mediaUrl: video.url,
            title: tweet.text || 'Twitter Video',
            description: tweet.author?.name || 'Twitter User',
          });
        }
        
        // Check for image
        if (tweet.media?.photos && tweet.media.photos.length > 0) {
          return NextResponse.json({
            type: 'image',
            mediaUrl: tweet.media.photos[0].url,
            title: tweet.text || 'Twitter Image',
            description: tweet.author?.name || 'Twitter User',
          });
        }
      }
    } catch (fixupxError) {
      console.error('Fixupx method failed:', fixupxError);
    }

    // Method 3: Try VxTwitter API as another fallback
    try {
      const vxUrl = url.replace(/https?:\/\/(www\.)?(twitter\.com|x\.com)/, 'https://api.vxtwitter.com');
      const vxResponse = await axios.get(vxUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 15000,
      });

      const vxData = vxResponse.data;
      
      if (vxData) {
        // Check for video in media_extended
        if (vxData.media_extended && vxData.media_extended.length > 0) {
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
