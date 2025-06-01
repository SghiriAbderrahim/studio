
"use server";

import type { Episode } from '@/types';
import { generateEpisodeSearchQuery } from '@/ai/flows/generate-episode-search-query';
import { filterYouTubeResults } from '@/ai/flows/filter-youtube-results';
import { searchYouTube, getVideoDetails } from '@/lib/youtube';
import { parseISO8601Duration, EXCLUDED_KEYWORDS, MINIMUM_DURATION_SECONDS } from '@/lib/utils';

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

    if (searchResults.items.length === 0) {
      return {
        episodeNumber,
        title: `الحلقة ${episodeNumber} - لم يتم العثور على نتائج`,
        link: '#',
        duration: 0,
        thumbnail: `https://placehold.co/480x360.png?text=Not+Found`,
        status: 'Not Found',
      };
    }
    
    const videoIds = searchResults.items.map(item => item.id.videoId);
    const videoDetailsResponse = await getVideoDetails(videoIds);

    const candidateVideos = videoDetailsResponse.items.map(item => ({
        videoId: item.id,
        title: item.snippet.title,
        duration: parseISO8601Duration(item.contentDetails.duration),
      }));

    const filteredResults = await filterYouTubeResults({
      results: candidateVideos,
      excludedKeywords: EXCLUDED_KEYWORDS,
      minimumDuration: MINIMUM_DURATION_SECONDS,
    });

    if (filteredResults.length > 0) {
      const chosenVideo = filteredResults[0];
      const bestThumbnailItem = videoDetailsResponse.items.find(v => v.id === chosenVideo.videoId);
      const bestThumbnail = bestThumbnailItem?.snippet.thumbnails.high?.url || 
                            bestThumbnailItem?.snippet.thumbnails.medium?.url ||
                            bestThumbnailItem?.snippet.thumbnails.default?.url ||
                            `https://i.ytimg.com/vi/${chosenVideo.videoId}/hqdefault.jpg`;
      
      return {
        episodeNumber,
        title: chosenVideo.title,
        link: `https://www.youtube.com/watch?v=${chosenVideo.videoId}`,
        duration: chosenVideo.duration,
        thumbnail: bestThumbnail,
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
    const errorMessage = error.message || 'Unknown error';
    const isQuotaError = errorMessage.toLowerCase().includes('quotaexceeded') || 
                         errorMessage.toLowerCase().includes('dailyLimitExceeded') ||
                         errorMessage.toLowerCase().includes('usageLimits.dailyLimitExceeded');

    return {
      episodeNumber,
      title: `الحلقة ${episodeNumber} - ${isQuotaError ? 'تجاوز حصة API' : 'خطأ في البحث'}`,
      link: '#',
      duration: 0,
      thumbnail: `https://placehold.co/480x360.png?text=Error`,
      status: 'Error',
    };
  }
}
