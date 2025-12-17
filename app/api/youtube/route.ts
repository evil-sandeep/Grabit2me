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

    // Check if it's a YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)/;
    if (!youtubeRegex.test(url)) {
      return NextResponse.json(
        { error: 'Please provide a valid YouTube URL' },
        { status: 400 }
      );
    }

    // Extract video ID
    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: 'Could not extract video ID from URL' },
        { status: 400 }
      );
    }

    // Try primary API first
    try {
      const response = await axios.get(
        "https://api.vidfly.ai/api/media/youtube/download",
        {
          params: { url },
          headers: {
            accept: "*/*",
            "content-type": "application/json",
            "x-app-name": "vidfly-web",
            "x-app-version": "1.0.0",
            Referer: "https://vidfly.ai/",
          },
          timeout: 20000,
        }
      );

      console.log('YouTube API response:', JSON.stringify(response.data, null, 2));
      
      // Log individual items to understand audio fields
      const data = response.data?.data;
      if (data?.items) {
        console.log('Sample item structure:', JSON.stringify(data.items[0], null, 2));
        data.items.forEach((item: any, i: number) => {
          console.log(`Item ${i}: type=${item.type}, label=${item.label}, audio=${item.audio}, hasAudio=${item.hasAudio}, audioQuality=${item.audioQuality}`);
        });
      }
      
      if (data && data.items && data.title) {
        return processYouTubeResponse(data);
      }
    } catch (primaryError) {
      console.log('Primary API failed, trying fallback...');
    }

    // Fallback: Try alternative API
    try {
      const fallbackResponse = await axios.get(
        `https://yt-api.p.rapidapi.com/dl?id=${videoId}`,
        {
          headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY || 'demo-key',
            'x-rapidapi-host': 'yt-api.p.rapidapi.com'
          },
          timeout: 20000,
        }
      );

      if (fallbackResponse.data && fallbackResponse.data.formats) {
        return processFallbackResponse(fallbackResponse.data, videoId);
      }
    } catch (fallbackError) {
      console.log('Fallback API also failed');
    }

    // If both fail, return a helpful error with manual download option
    return NextResponse.json({
      type: 'video',
      mediaUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      title: 'YouTube Video',
      description: 'Click the button below to download',
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      isYouTube: true,
      availableFormats: {
        video: [{
          quality: 'Best Available',
          extension: 'mp4',
          url: `https://www.y2mate.com/youtube/${videoId}`,
          qualityNum: 1080,
          hasAudio: true,
          isExternal: true,
        }],
        audio: [],
      },
      previewQuality: 'External download',
      externalDownload: true,
    });

  } catch (error: any) {
    console.error('YouTube API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process YouTube URL. Please try again.',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Extract video ID from various YouTube URL formats
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Process response from primary API
function processYouTubeResponse(data: any) {
  const formats = data.items.map((item: any) => {
    // Check if type indicates audio - "video_with_audio" means it has audio!
    const hasAudio = item.type === 'video_with_audio' || 
                     item.type === 'audio' ||
                     item.audio === true || 
                     item.hasAudio === true;
    
    // Normalize type for filtering
    const isVideo = item.type === 'video' || item.type === 'video_with_audio';
    const isAudio = item.type === 'audio';
    
    return {
      type: isVideo ? 'video' : (isAudio ? 'audio' : item.type),
      originalType: item.type,
      quality: item.label || 'unknown',
      extension: item.ext || item.extension || 'mp4',
      url: item.url,
      qualityNum: extractQualityNumber(item.label),
      hasAudio: hasAudio,
    };
  });

  // Get video formats - ONLY MP4, no webm
  const videoFormats = formats.filter((f: any) => 
    f.type === 'video' && f.extension === 'mp4'
  );
  
  // Sort: first by hasAudio (true first), then by quality (high to low)
  const sortedVideoFormats = videoFormats.sort((a: any, b: any) => {
    // Prioritize formats with audio
    if (a.hasAudio && !b.hasAudio) return -1;
    if (!a.hasAudio && b.hasAudio) return 1;
    // Then sort by quality
    return b.qualityNum - a.qualityNum;
  });
  
  // Get audio formats - only m4a (filter out opus/webm)
  const audioFormats = formats.filter((f: any) => 
    f.type === 'audio' && (f.extension === 'm4a' || f.extension === 'mp3')
  );

  if (sortedVideoFormats.length === 0) {
    throw new Error('No video format found');
  }

  // Find best format with audio for preview
  const videoWithAudio = sortedVideoFormats.filter((f: any) => f.hasAudio);
  const previewVideo = videoWithAudio.length > 0 
    ? videoWithAudio[0] // Best quality with audio
    : sortedVideoFormats[0];
  
  const previewUrl = data.cover || data.thumbnail || '';
  
  return NextResponse.json({
    type: 'video',
    mediaUrl: previewUrl,
    title: data.title || 'YouTube Video',
    description: `Duration: ${formatDuration(data.duration)}`,
    thumbnail: data.cover,
    duration: data.duration,
    isYouTube: true,
    availableFormats: {
      // Show ALL MP4 formats (with and without audio)
      video: sortedVideoFormats.map((f: any) => ({
        quality: f.quality,
        extension: f.extension,
        url: f.url,
        qualityNum: f.qualityNum,
        hasAudio: f.hasAudio,
      })),
      audio: audioFormats.map((f: any) => ({
        quality: f.quality,
        extension: f.extension,
        url: f.url,
      })),
    },
    previewQuality: `${previewVideo.quality}${previewVideo.hasAudio ? '' : ' (no audio)'}`,
  });
}

// Process response from fallback API
function processFallbackResponse(data: any, videoId: string) {
  const formats = data.formats || [];
  
  const videoFormats = formats
    .filter((f: any) => f.mimeType?.includes('video') && f.url)
    .map((f: any) => ({
      quality: f.qualityLabel || `${f.height}p` || 'unknown',
      extension: 'mp4',
      url: f.url,
      qualityNum: f.height || extractQualityNumber(f.qualityLabel),
      hasAudio: f.mimeType?.includes('audio') || false,
    }))
    .sort((a: any, b: any) => b.qualityNum - a.qualityNum);

  const audioFormats = formats
    .filter((f: any) => f.mimeType?.includes('audio') && !f.mimeType?.includes('video') && f.url)
    .map((f: any) => ({
      quality: f.audioQuality || 'Audio',
      extension: 'mp3',
      url: f.url,
    }));

  return NextResponse.json({
    type: 'video',
    mediaUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    title: data.title || 'YouTube Video',
    description: data.description?.substring(0, 100) || '',
    thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    isYouTube: true,
    availableFormats: {
      video: videoFormats.slice(0, 6), // Limit to top 6 qualities
      audio: audioFormats.slice(0, 2),
    },
    previewQuality: videoFormats[0]?.quality || 'Best',
  });
}

// Helper function to extract quality number from labels like "1080p", "720p", etc.
function extractQualityNumber(label: string): number {
  if (!label) return 0;
  const match = label.match(/(\d+)p?/);
  return match ? parseInt(match[1]) : 0;
}

// Helper function to format duration in seconds to readable format
function formatDuration(seconds: number): string {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
