'use server';

/**
 * @fileOverview A flow to filter YouTube search results based on keywords and duration.
 *
 * - filterYouTubeResults - A function that filters YouTube search results.
 * - FilterYouTubeResultsInput - The input type for the filterYouTubeResults function.
 * - FilterYouTubeResultsOutput - The return type for the filterYouTubeResults function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FilterYouTubeResultsInputSchema = z.object({
  results: z.array(z.object({
    videoId: z.string(),
    title: z.string(),
    duration: z.number().describe('The duration of the video in seconds.'),
  })).describe('An array of YouTube search results.'),
  excludedKeywords: z.array(z.string()).describe('Keywords to exclude from the search results.'),
  minimumDuration: z.number().describe('The minimum duration of the video in seconds.'),
});
export type FilterYouTubeResultsInput = z.infer<typeof FilterYouTubeResultsInputSchema>;

const FilterYouTubeResultsOutputSchema = z.array(z.object({
  videoId: z.string(),
  title: z.string(),
  duration: z.number().describe('The duration of the video in seconds.'),
})).describe('An array of filtered YouTube search results.');
export type FilterYouTubeResultsOutput = z.infer<typeof FilterYouTubeResultsOutputSchema>;

export async function filterYouTubeResults(input: FilterYouTubeResultsInput): Promise<FilterYouTubeResultsOutput> {
  return filterYouTubeResultsFlow(input);
}

const filterYouTubeResultsPrompt = ai.definePrompt({
  name: 'filterYouTubeResultsPrompt',
  input: {
    schema: FilterYouTubeResultsInputSchema,
  },
  output: {
    schema: FilterYouTubeResultsOutputSchema,
  },
  prompt: `Given the following YouTube search results, filter out any videos that contain the following excluded keywords in their title, and only return videos that have a duration greater than or equal to the minimum duration.

Excluded Keywords: {{excludedKeywords}}
Minimum Duration: {{minimumDuration}} seconds

YouTube Search Results:
{{#each results}}
  - Video ID: {{videoId}}, Title: {{title}}, Duration: {{duration}} seconds
{{/each}}

Return only the videos that meet the criteria.

Filtered YouTube Search Results:
`,
});

const filterYouTubeResultsFlow = ai.defineFlow(
  {
    name: 'filterYouTubeResultsFlow',
    inputSchema: FilterYouTubeResultsInputSchema,
    outputSchema: FilterYouTubeResultsOutputSchema,
  },
  async input => {
    const {output} = await filterYouTubeResultsPrompt(input);
    return output!;
  }
);
