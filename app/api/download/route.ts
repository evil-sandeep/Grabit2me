import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url');
    const type = request.nextUrl.searchParams.get('type');

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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 30000,
    });

    // Determine file extension
    const ext = type === 'video' ? 'mp4' : 'jpg';
    const contentType = type === 'video' ? 'video/mp4' : 'image/jpeg';

    // Return the file with download headers
    return new NextResponse(response.data, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="instagram-${type}-${Date.now()}.${ext}"`,
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error: any) {
    console.error('Download Error:', error);
    return NextResponse.json(
      { error: 'Failed to download media' },
      { status: 500 }
    );
  }
}
