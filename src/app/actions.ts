
"use server";

import type { Episode, SimplifiedYouTubeSearchItem } from '@/types';
import { generateEpisodeSearchQuery } from '@/ai/flows/generate-episode-search-query';
import { filterYouTubeResults } from '@/ai/flows/filter-youtube-results';
import { searchYouTube } from '@/lib/youtube';
import { EXCLUDED_KEYWORDS, MINIMUM_DURATION_SECONDS } from '@/lib/utils';

export async function fetchSingleEpisodeDetails(
  cartoonTitle: string,
  episodeNumber: number
): Promise<Episode> {
  try {
    const searchQueryOutput = await generateEpisodeSearchQuery({
      cartoonTitle,
      episodeNumber,
    });
    const searchQuery = searchQueryOutput.searchQuery;

    const searchResults = await searchYouTube(searchQuery);

    if (searchResults.length === 0) {
      return {
        episodeNumber,
        title: `الحلقة ${episodeNumber} - لم يتم العثور على نتائج`,
        link: '#',
        duration: 0,
        thumbnail: `https://placehold.co/480x360.png?text=Not+Found`,
        status: 'Not Found',
      };
    }
    
    // youtube-sr results are already simplified: { videoId, title, duration (seconds), thumbnail }
    const candidateVideos = searchResults.map(item => ({
        videoId: item.videoId,
        title: item.title,
        duration: item.duration, // Already in seconds
      }));

    const filteredResults = await filterYouTubeResults({
      results: candidateVideos,
      excludedKeywords: EXCLUDED_KEYWORDS,
      minimumDuration: MINIMUM_DURATION_SECONDS,
    });

    if (filteredResults.length > 0) {
      const chosenVideo = filteredResults[0];
      // Find the original search result to get its thumbnail
      const originalVideoData = searchResults.find(sr => sr.videoId === chosenVideo.videoId);
      
      return {
        episodeNumber,
        title: chosenVideo.title,
        link: `https://www.youtube.com/watch?v=${chosenVideo.videoId}`,
        duration: chosenVideo.duration,
        thumbnail: originalVideoData?.thumbnail ?? `https://i.ytimg.com/vi/${chosenVideo.videoId}/hqdefault.jpg`,
        status: 'Found',
        youtubeVideoId: chosenVideo.videoId,
      };
    } else {
      return {
        episodeNumber,
        title: `الحلقة ${episodeNumber} - لم يتم العثور على فيديو مناسب`,
        link: '#',
        duration: 0,
        thumbnail: `https://placehold.co/480x360.png?text=No+Match`,
        status: 'Not Found',
      };
    }
  } catch (error: any) {
    console.error(`Error fetching episode ${episodeNumber} for ${cartoonTitle}:`, error.message);
    // With youtube-sr, quota errors are less likely. Errors might be network or parsing.
    // For simplicity, treating all errors from youtube-sr as general search errors.
    return {
      episodeNumber,
      title: `الحلقة ${episodeNumber} - خطأ في البحث`,
      link: '#',
      duration: 0,
      thumbnail: `https://placehold.co/480x360.png?text=Error`,
      status: 'Error',
    };
  }
}
