
export interface Episode {
  episodeNumber: number;
  title: string;
  link: string;
  duration: number; // in seconds
  thumbnail: string;
  status: 'Pending' | 'Searching...' | 'Found' | 'Not Found' | 'Error';
  youtubeVideoId?: string;
  dataAihint?: string;
}

// Simplified type for youtube-sr search results
export interface SimplifiedYouTubeSearchItem {
  videoId: string;
  title: string;
  duration: number; // in seconds
  thumbnail: string;
}

export type SimplifiedYouTubeSearchResponse = SimplifiedYouTubeSearchItem[];


// AI Flow related types re-exported for convenience if needed elsewhere, though typically imported directly.
// import type { FilterYouTubeResultsInput, FilterYouTubeResultsOutput } from '@/ai/flows/filter-youtube-results';
// import type { GenerateEpisodeSearchQueryInput, GenerateEpisodeSearchQueryOutput } from '@/ai/flows/generate-episode-search-query';
// export type { FilterYouTubeResultsInput, FilterYouTubeResultsOutput, GenerateEpisodeSearchQueryInput, GenerateEpisodeSearchQueryOutput };
