
"use client";

import type { Episode } from '@/types';
import { EpisodeCard } from './episode-card';

interface EpisodeListProps {
  episodes: Episode[];
  onReloadEpisode?: (episodeNumber: number) => void;
}

export function EpisodeList({ episodes, onReloadEpisode }: EpisodeListProps) {
  if (episodes.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {episodes.map((episode) => (
        <EpisodeCard key={episode.episodeNumber} episode={episode} onReload={onReloadEpisode} />
      ))}
    </div>
  );
}
