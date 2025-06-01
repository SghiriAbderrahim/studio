import type { YouTubeSearchResponse, YouTubeVideoListResponse } from '@/types';
import { YOUTUBE_API_KEY } from './utils';

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export async function searchYouTube(query: string): Promise<YouTubeSearchResponse> {
  const url = `${YOUTUBE_API_BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=10&key=${YOUTUBE_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    console.error('YouTube Search API Error:', errorData);
    throw new Error(`Failed to search YouTube: ${errorData.message || response.statusText}`);
  }
  return response.json();
}

export async function getVideoDetails(videoIds: string[]): Promise<YouTubeVideoListResponse> {
  if (videoIds.length === 0) {
    return { kind: '', etag: '', items: [], pageInfo: { totalResults: 0, resultsPerPage: 0 } };
  }
  const url = `${YOUTUBE_API_BASE_URL}/videos?part=snippet,contentDetails&id=${videoIds.join(',')}&key=${YOUTUBE_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    console.error('YouTube Video Details API Error:', errorData);
    throw new Error(`Failed to get video details: ${errorData.message || response.statusText}`);
  }
  return response.json();
}
