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

    // Check if it's a LinkedIn URL (more flexible regex)
    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\//;
    if (!linkedinRegex.test(url)) {
      return NextResponse.json(
        { error: 'Please provide a valid LinkedIn post URL' },
        { status: 400 }
      );
    }

    // Fetch LinkedIn data using the external API
    const apiUrl = "https://saywhat.ai/api/fetch-linkedin-page/";
    
    const response = await axios.post(
      apiUrl,
      { url },
      {
        headers: {
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9",
          "content-type": "application/json",
          priority: "u=1, i",
          "sec-ch-ua": '"Not)A;Brand";v="8", "Chromium";v="138", "Brave";v="138"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "sec-gpc": "1",
          Referer: "https://saywhat.ai/tools/linkedin-video-downloader/",
        },
        timeout: 15000,
      }
    );

    console.log('LinkedIn API response:', response.data);

    // Extract video URL from the response
    const data = response.data;
    
    // Check if we have video data (API returns videos array)
    if (!data || !data.videos || !Array.isArray(data.videos) || data.videos.length === 0) {
      return NextResponse.json(
        { error: 'No video found in this LinkedIn post' },
        { status: 404 }
      );
    }

    // Get the video URL
    const videoUrl = data.videos[0];

    // Return data in the format expected by frontend
    // Use our proxy endpoint to avoid CORS issues
    const proxyUrl = `/api/download?url=${encodeURIComponent(videoUrl)}&type=video&preview=true`;
    
    return NextResponse.json({
      type: 'video',
      mediaUrl: proxyUrl, // Use proxy URL instead of direct LinkedIn URL
      title: data.title || 'LinkedIn Video',
      description: data.author || '',
      originalUrl: videoUrl, // Keep original URL for reference
    });

  } catch (error: any) {
    console.error('LinkedIn API error:', error);
    
    // Handle axios errors
    if (error.response) {
      console.error('Error response:', error.response.data);
      return NextResponse.json(
        { 
          error: 'Failed to fetch LinkedIn data',
          details: error.response.data || error.message 
        },
        { status: error.response.status || 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to process LinkedIn URL',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
