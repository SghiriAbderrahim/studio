import type { YouTubeSearchResponse, YouTubeVideoListResponse } from '@/types';

const API_KEYS = [
  "AIzaSyAgI7D0zMf-6PEkPUqOoRjwL-TXTNkPGNw", // key-1
  "AIzaSyBfQzWjL6MMXTyca7WPmDyR0cVDPGD7ZRQ", // key-2
  "AIzaSyD9Hg9P8E4c6z0sCT19fZwJLgWs4a0xWOw"  // key-3
];
let currentApiKeyIndex = 0; // Start with the first key

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

async function _fetchYouTubeAPI(
  buildUrl: (apiKey: string) => string,
  functionName: string
): Promise<any> {
  let lastError: any = null;
  const initialKeyIndexToTry = currentApiKeyIndex; // Start trying from the current global index

  for (let i = 0; i < API_KEYS.length; i++) {
    const keyIndexForThisAttempt = (initialKeyIndexToTry + i) % API_KEYS.length;
    const apiKey = API_KEYS[keyIndexForThisAttempt];
    const url = buildUrl(apiKey);

    console.info(`Attempting ${functionName} with API Key index ${keyIndexForThisAttempt} (Key: ...${apiKey.slice(-4)})`);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        let errorData;
        let errorMessage = response.statusText;
        let errorReason = '';
        try {
          errorData = await response.json();
          if (errorData.error && errorData.error.message) {
            errorMessage = errorData.error.message;
            if (errorData.error.errors && errorData.error.errors[0] && errorData.error.errors[0].reason) {
              errorReason = errorData.error.errors[0].reason;
            }
          }
        } catch (jsonError) {
          // If parsing errorData fails, stick with statusText
        }

        const isQuotaError = errorReason === 'quotaExceeded' ||
                             errorReason === 'dailyLimitExceeded' ||
                             errorReason === 'userRateLimitExceeded' ||
                             errorMessage.toLowerCase().includes('quota') ||
                             errorMessage.toLowerCase().includes('limit');
        
        lastError = new Error(errorReason ? `${errorReason}: ${errorMessage}` : `Failed to ${functionName}: ${errorMessage}`);
        (lastError as any).reason = errorReason || (isQuotaError ? 'quotaExceeded' : 'unknown');


        if (isQuotaError) {
          console.warn(`Quota error for ${functionName} with API Key index ${keyIndexForThisAttempt} (Reason: ${errorReason || 'N/A'}, Message: ${errorMessage}). Trying next key.`);
          // The loop will try the next key. currentApiKeyIndex will be updated if a subsequent key works or after all fail.
          continue; 
        } else {
          // For non-quota errors, throw immediately
          console.error(`YouTube API Error in ${functionName} (Key Index: ${keyIndexForThisAttempt})${errorReason ? ` (Reason: ${errorReason})` : ''}: ${errorMessage}`, { status: response.status });
          throw lastError;
        }
      }
      // If successful
      currentApiKeyIndex = keyIndexForThisAttempt; // Set current global index to this successful key for next operations
      console.info(`Successfully fetched ${functionName} with API Key index ${keyIndexForThisAttempt}`);
      return await response.json();
    } catch (fetchOrNetworkError: any) {
      // This catches errors from fetch() itself (e.g. network error) or if response.ok but response.json() fails
      // or if a non-quota error was thrown from above.
      if ((fetchOrNetworkError as any).reason && (fetchOrNetworkError as any).reason !== 'quotaExceeded' && !fetchOrNetworkError.message.toLowerCase().includes('quota')) {
          // If it's a re-thrown non-quota error, propagate it
          throw fetchOrNetworkError;
      }
      console.warn(`Fetch/Network or non-quota processing error during ${functionName} with API Key index ${keyIndexForThisAttempt}: ${fetchOrNetworkError.message}. Trying next key if applicable.`);
      lastError = fetchOrNetworkError;
      // Loop continues to try next key
    }
  }

  // If loop finishes, all keys failed. Update currentApiKeyIndex to point to the next one after the initial one, for future external calls.
  currentApiKeyIndex = (initialKeyIndexToTry + 1) % API_KEYS.length;
  console.error(`All API keys failed for ${functionName}. Last error:`, lastError?.message);
  if (lastError) {
    throw lastError; 
  } else {
    // This case should ideally not be reached if API_KEYS is not empty
    throw new Error(`All API keys failed for ${functionName}, and no specific error was captured. Ensure API_KEYS is not empty.`);
  }
}

export async function searchYouTube(query: string): Promise<YouTubeSearchResponse> {
  const urlBuilder = (apiKey: string) =>
    `${YOUTUBE_API_BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoDuration=long&maxResults=10&key=${apiKey}`;
  return _fetchYouTubeAPI(urlBuilder, 'searchYouTube');
}

export async function getVideoDetails(videoIds: string[]): Promise<YouTubeVideoListResponse> {
  if (videoIds.length === 0) {
    return { kind: '', etag: '', items: [], pageInfo: { totalResults: 0, resultsPerPage: 0 } };
  }
  const urlBuilder = (apiKey: string) =>
    `${YOUTUBE_API_BASE_URL}/videos?part=snippet,contentDetails&id=${videoIds.join(',')}&key=${apiKey}`;
  return _fetchYouTubeAPI(urlBuilder, 'getVideoDetails');
}
