import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url');
    const type = request.nextUrl.searchParams.get('type');
    const preview = request.nextUrl.searchParams.get('preview');

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Fetch the media from Instagram
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.linkedin.com/',
        'Origin': 'https://www.linkedin.com',
        'Sec-Fetch-Dest': 'video',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
      },
      timeout: 60000,
      maxRedirects: 5,
    });

    // Determine file extension
    const ext = type === 'video' ? 'mp4' : 'jpg';
    const contentType = type === 'video' ? 'video/mp4' : 'image/jpeg';
    
    // Determine platform from URL for better naming
    let platform = 'media';
    if (url.includes('instagram.com') || url.includes('cdninstagram.com')) {
      platform = 'instagram';
    } else if (url.includes('linkedin.com') || url.includes('licdn.com')) {
      platform = 'linkedin';
    } else if (url.includes('twitter.com') || url.includes('twimg.com')) {
      platform = 'twitter';
    } else if (url.includes('facebook.com') || url.includes('fbcdn.net')) {
      platform = 'facebook';
    }

    // Return the file with appropriate headers
    // If preview=true, use inline disposition for browser preview
    const disposition = preview === 'true' 
      ? 'inline' 
      : `attachment; filename="${platform}-${type}-${Date.now()}.${ext}"`;
    
    return new NextResponse(response.data, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': disposition,
        'Cache-Control': 'public, max-age=3600',
        'Content-Length': response.data.byteLength.toString(),
        'Accept-Ranges': 'bytes',
      },
    });

  } catch (error: any) {
    console.error('Download Error:', error.message);
    
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return NextResponse.json(
        { error: 'Download timeout. The file may be too large or the server is slow.' },
        { status: 408 }
      );
    }
    
    if (error.response?.status === 403) {
      return NextResponse.json(
        { error: 'Access denied. The media URL may have expired or requires authentication.' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: `Failed to download media: ${error.message}` },
      { status: 500 }
    );
  }
}
