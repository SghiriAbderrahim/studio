// src/ai/flows/generate-episode-search-query.ts
'use server';

/**
 * @fileOverview Generates episode search queries for a cartoon series.
 *
 * - generateEpisodeSearchQuery - A function that generates search queries for cartoon episodes.
 * - GenerateEpisodeSearchQueryInput - The input type for the generateEpisodeSearchQuery function.
 * - GenerateEpisodeSearchQueryOutput - The return type for the generateEpisodeSearchQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEpisodeSearchQueryInputSchema = z.object({
  cartoonTitle: z.string().describe('The title of the cartoon series.'),
  episodeNumber: z.number().describe('The episode number.'),
});
export type GenerateEpisodeSearchQueryInput = z.infer<
  typeof GenerateEpisodeSearchQueryInputSchema
>;

const GenerateEpisodeSearchQueryOutputSchema = z.object({
  searchQuery: z.string().describe('The generated search query for the episode.'),
});
export type GenerateEpisodeSearchQueryOutput = z.infer<
  typeof GenerateEpisodeSearchQueryOutputSchema
>;

export async function generateEpisodeSearchQuery(
  input: GenerateEpisodeSearchQueryInput
): Promise<GenerateEpisodeSearchQueryOutput> {
  return generateEpisodeSearchQueryFlow(input);
}

const generateEpisodeSearchQueryPrompt = ai.definePrompt({
  name: 'generateEpisodeSearchQueryPrompt',
  input: {schema: GenerateEpisodeSearchQueryInputSchema},
  output: {schema: GenerateEpisodeSearchQueryOutputSchema},
  prompt: `Generate a search query for the episode using the cartoon title and episode number.
Cartoon Title: {{{cartoonTitle}}}
Episode Number: {{{episodeNumber}}}
Search Query: {cartoonTitle} الحلقة {episodeNumber}`,
});

const generateEpisodeSearchQueryFlow = ai.defineFlow(
  {
    name: 'generateEpisodeSearchQueryFlow',
    inputSchema: GenerateEpisodeSearchQueryInputSchema,
    outputSchema: GenerateEpisodeSearchQueryOutputSchema,
  },
  async input => {
    const {output} = await generateEpisodeSearchQueryPrompt(input);
    return output!;
  }
);
