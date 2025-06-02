
import YouTube from 'youtube-sr';
import type { SimplifiedYouTubeSearchItem, SimplifiedYouTubeSearchResponse } from '@/types';

export async function searchYouTube(query: string): Promise<SimplifiedYouTubeSearchResponse> {
  try {
    const results = await YouTube.search(query, { limit: 10, type: 'video' });
    
    return results.map(video => ({
      videoId: video.id ?? '',
      title: video.title ?? 'عنوان غير معروف',
      duration: video.duration ? video.duration / 1000 : 0, // Convert ms to seconds
      thumbnail: video.thumbnail?.url ?? `https://placehold.co/480x360.png?text=No+Thumbnail`,
    })).filter(video => video.videoId); // Ensure videoId is present

  } catch (error: any) {
    console.error(`Error searching YouTube with youtube-sr for query "${query}":`, error.message);
    // You might want to throw a custom error or return an empty array
    // For now, let's rethrow to be handled by the caller
    throw new Error(`Failed to search YouTube using youtube-sr: ${error.message}`);
  }
}

// getVideoDetails is no longer needed as searchYouTube provides sufficient details
// including duration and thumbnail.
