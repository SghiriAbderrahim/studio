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

// Simplified YouTube API types based on what's needed
export interface YouTubeSearchItem {
  kind: string;
  etag: string;
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
    };
    channelTitle: string;
    liveBroadcastContent: string;
    publishTime: string;
  };
}

export interface YouTubeSearchResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  regionCode: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: YouTubeSearchItem[];
}

export interface YouTubeVideoItem {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
      standard?: { url: string; width: number; height: number };
      maxres?: { url: string; width: number; height: number };
    };
    channelTitle: string;
    tags?: string[];
    categoryId: string;
    liveBroadcastContent: string;
    localized: {
      title: string;
      description: string;
    };
    defaultAudioLanguage?: string;
  };
  contentDetails: {
    duration: string; // ISO 8601 duration
    dimension: string;
    definition: string;
    caption: string;
    licensedContent: boolean;
    projection: string;
  };
}

export interface YouTubeVideoListResponse {
  kind: string;
  etag: string;
  items: YouTubeVideoItem[];
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

// AI Flow related types re-exported for convenience if needed elsewhere, though typically imported directly.
// import type { FilterYouTubeResultsInput, FilterYouTubeResultsOutput } from '@/ai/flows/filter-youtube-results';
// import type { GenerateEpisodeSearchQueryInput, GenerateEpisodeSearchQueryOutput } from '@/ai/flows/generate-episode-search-query';
// export type { FilterYouTubeResultsInput, FilterYouTubeResultsOutput, GenerateEpisodeSearchQueryInput, GenerateEpisodeSearchQueryOutput };
