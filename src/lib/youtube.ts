import type { YouTubeSearchResponse, YouTubeVideoListResponse } from '@/types';
import { YOUTUBE_API_KEY } from './utils';

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

async function handleYouTubeApiResponse(response: Response, functionName: string): Promise<any> {
  if (!response.ok) {
    let errorMessage = response.statusText;
    let errorReason = '';
    try {
      const errorData = await response.json();
      if (errorData.error && errorData.error.message) {
        errorMessage = errorData.error.message;
        if (errorData.error.errors && errorData.error.errors[0] && errorData.error.errors[0].reason) {
          errorReason = errorData.error.errors[0].reason;
        }
      }
    } catch (jsonError) {
      // If parsing fails, stick with statusText
    }
    const fullErrorMessage = `YouTube API Error in ${functionName}${errorReason ? ` (Reason: ${errorReason})` : ''}: ${errorMessage}`;
    console.error(fullErrorMessage, { status: response.status });
    // Throw an error that includes the reason if available, for easier checking later
    throw new Error(errorReason ? `${errorReason}: ${errorMessage}` : `Failed to ${functionName === 'searchYouTube' ? 'search YouTube' : 'get video details'}: ${errorMessage}`);
  }
  return response.json();
}

export async function searchYouTube(query: string): Promise<YouTubeSearchResponse> {
  const url = `${YOUTUBE_API_BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=10&key=${YOUTUBE_API_KEY}`;
  const response = await fetch(url);
  return handleYouTubeApiResponse(response, 'searchYouTube');
}

export async function getVideoDetails(videoIds: string[]): Promise<YouTubeVideoListResponse> {
  if (videoIds.length === 0) {
    return { kind: '', etag: '', items: [], pageInfo: { totalResults: 0, resultsPerPage: 0 } };
  }
  const url = `${YOUTUBE_API_BASE_URL}/videos?part=snippet,contentDetails&id=${videoIds.join(',')}&key=${YOUTUBE_API_KEY}`;
  const response = await fetch(url);
  return handleYouTubeApiResponse(response, 'getVideoDetails');
}
