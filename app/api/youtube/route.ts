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

    // Fetch YouTube data using the external API
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
        timeout: 15000,
      }
    );

    console.log('YouTube API response:', response.data);

    const data = response.data?.data;
    
    if (!data || !data.items || !data.title) {
      return NextResponse.json(
        { error: 'Invalid or empty response from YouTube API' },
        { status: 404 }
      );
    }

    // Extract all video and audio formats
    const formats = data.items.map((item: any) => ({
      type: item.type,
      quality: item.label || 'unknown',
      extension: item.ext || item.extension || 'unknown',
      url: item.url,
      qualityNum: extractQualityNumber(item.label),
      hasAudio: item.audio !== false && item.audioQuality !== 'none', // Check if format has audio
    }));

    // Separate video and audio formats
    const videoFormats = formats.filter((f: any) => f.type === 'video')
      .sort((a: any, b: any) => b.qualityNum - a.qualityNum);
    
    const audioFormats = formats.filter((f: any) => f.type === 'audio');

    if (videoFormats.length === 0) {
      return NextResponse.json(
        { error: 'No video format found' },
        { status: 404 }
      );
    }

    // For preview, prioritize formats with audio (usually lower quality combined formats)
    // Find the lowest quality video that has audio, or fallback to any lowest quality
    const videoWithAudio = videoFormats.filter((f: any) => f.hasAudio);
    const previewVideo = videoWithAudio.length > 0 
      ? videoWithAudio[videoWithAudio.length - 1] // Lowest quality with audio
      : videoFormats[videoFormats.length - 1]; // Fallback to lowest quality video
    
    // Use thumbnail for preview since YouTube URLs expire quickly
    const previewUrl = data.cover || data.thumbnail || '';
    
    // Return all formats for download selection
    return NextResponse.json({
      type: 'video',
      mediaUrl: previewUrl, // Use thumbnail instead of video URL
      title: data.title || 'YouTube Video',
      description: `Duration: ${formatDuration(data.duration)}`,
      thumbnail: data.cover,
      duration: data.duration,
      isYouTube: true, // Flag to handle differently in UI
      // Include all available formats for download
      availableFormats: {
        video: videoFormats.map((f: any) => ({
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
      previewQuality: `${previewVideo.quality}${previewVideo.hasAudio ? ' (with audio)' : ' (no audio)'}`,
    });

  } catch (error: any) {
    console.error('YouTube API error:', error);
    
    // Handle axios errors
    if (error.response) {
      console.error('Error response:', error.response.data);
      return NextResponse.json(
        { 
          error: 'Failed to fetch YouTube data',
          details: error.response.data || error.message 
        },
        { status: error.response.status || 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to process YouTube URL',
        details: error.message 
      },
      { status: 500 }
    );
  }
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
