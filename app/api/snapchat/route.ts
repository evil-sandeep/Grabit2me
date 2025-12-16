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

    // Check if it's a Snapchat URL
    const snapchatRegex = /^https?:\/\/(www\.)?(snapchat\.com|story\.snapchat\.com|t\.snapchat\.com)/;
    if (!snapchatRegex.test(url)) {
      return NextResponse.json(
        { error: 'Please provide a valid Snapchat URL' },
        { status: 400 }
      );
    }

    // Fetch Snapchat data using the external API
    const apiUrl = "https://urlmp4.com/wp-json/aio-dl/video-data/";
    
    const formData = `url=${encodeURIComponent(url)}&token=8b6e170975d92939bb67d8db567f82e43fa2da91e00a84f258af77c1186c5e8a&hash=aHR0cHM6Ly9zb3VuZGNsb3VkLmNvbS9zb21icnNvbmdzL3VuZHJlc3NlZA%3D%3D1043YWlvLWRs`;

    const response = await axios.post(
      apiUrl,
      formData,
      {
        headers: {
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9",
          "content-type": "application/x-www-form-urlencoded",
          priority: "u=1, i",
          "sec-ch-ua": '"Not)A;Brand";v="8", "Chromium";v="140", "Brave";v="140"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "sec-gpc": "1",
          cookie: "pll_language=en",
          Referer: "https://urlmp4.com/en/snapchat-downloader/",
        },
        timeout: 15000,
      }
    );

    console.log('Snapchat API response:', response.data);

    // Extract video URL from the response
    const data = response.data;
    
    // Check if we have video data
    if (!data || !data.medias || !Array.isArray(data.medias) || data.medias.length === 0) {
      return NextResponse.json(
        { error: 'No video found in this Snapchat URL' },
        { status: 404 }
      );
    }

    // Get the first video with best quality
    const video = data.medias.find((m: any) => m.url && m.quality) || data.medias[0];
    
    if (!video || !video.url) {
      return NextResponse.json(
        { error: 'No valid video URL found' },
        { status: 404 }
      );
    }

    // Use proxy URL to avoid CORS issues
    const proxyUrl = `/api/download?url=${encodeURIComponent(video.url)}&type=video&preview=true`;
    
    // Return data in the format expected by frontend
    return NextResponse.json({
      type: 'video',
      mediaUrl: proxyUrl,
      title: data.title || 'Snapchat Video',
      description: data.source || '',
      originalUrl: video.url,
    });

  } catch (error: any) {
    console.error('Snapchat API error:', error);
    
    // Handle axios errors
    if (error.response) {
      console.error('Error response:', error.response.data);
      return NextResponse.json(
        { 
          error: 'Failed to fetch Snapchat data',
          details: error.response.data || error.message 
        },
        { status: error.response.status || 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to process Snapchat URL',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
