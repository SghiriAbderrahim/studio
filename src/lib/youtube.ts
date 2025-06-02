
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

    console.info(`Attempting ${functionName} with API Key index ${keyIndexForThisAttempt} (Key ending: ...${apiKey.slice(-4)})`);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        let errorBody;
        let apiErrorMessage = `API request failed with status ${response.status}: ${response.statusText}`; // Default if parsing fails
        let errorReason = 'unknownError'; // Default reason

        try {
          errorBody = await response.json();
          if (errorBody.error) {
            apiErrorMessage = errorBody.error.message || apiErrorMessage;
            if (errorBody.error.errors && errorBody.error.errors[0] && errorBody.error.errors[0].reason) {
              errorReason = errorBody.error.errors[0].reason;
            }
          }
        } catch (jsonError) {
          console.warn(`Failed to parse JSON error response for ${functionName} from key index ${keyIndexForThisAttempt}:`, jsonError);
          // apiErrorMessage remains the HTTP status error, errorReason remains 'unknownError'
        }

        const isQuotaError = errorReason === 'quotaExceeded' ||
                             errorReason === 'dailyLimitExceeded' ||
                             errorReason === 'userRateLimitExceeded' ||
                             apiErrorMessage.toLowerCase().includes('quota') || 
                             apiErrorMessage.toLowerCase().includes('limit');
        
        lastError = new Error(`${errorReason}: ${apiErrorMessage}`);
        (lastError as any).reason = errorReason;
        (lastError as any).status = response.status;

        if (isQuotaError) {
          console.warn(`Quota error for ${functionName} with API Key index ${keyIndexForThisAttempt} (Reason: ${errorReason}, Message: ${apiErrorMessage}). Trying next key.`);
        } else {
          console.warn(`Non-quota API error for ${functionName} with API Key index ${keyIndexForThisAttempt} (Status: ${response.status}, Reason: ${errorReason}, Message: ${apiErrorMessage}). Trying next key.`);
        }
        continue; // Try next key for ANY API error (quota or other related to this key)
      }

      // Successful fetch with this key
      currentApiKeyIndex = keyIndexForThisAttempt; // Set current global index to this successful key
      console.info(`Successfully fetched ${functionName} with API Key index ${keyIndexForThisAttempt}`);
      return await response.json();

    } catch (networkOrFetchError: any) { // Catches errors from fetch() itself, e.g., network issues, DNS failure
      console.warn(`Network or critical fetch error during ${functionName} with API Key index ${keyIndexForThisAttempt}: ${networkOrFetchError.message}. Trying next key.`);
      lastError = networkOrFetchError; // Store this error
      // The loop will continue to the next iteration, trying the next key
    }
  }

  // If loop finishes, all keys failed.
  // Update currentApiKeyIndex to point to the next one after the initial one tried in this sequence, for future external calls.
  currentApiKeyIndex = (initialKeyIndexToTry + 1) % API_KEYS.length;
  const errorMessage = `All API keys failed for ${functionName}. Last error (from key index ${(initialKeyIndexToTry + API_KEYS.length -1) % API_KEYS.length}): ${lastError?.message || 'Unknown error'}`;
  console.error(errorMessage, lastError);
  
  if (lastError) {
    // Re-throw the last error encountered, which might have more specific details like 'reason' or 'status'
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
