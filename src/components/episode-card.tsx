"use client";

import type { Episode } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { formatDuration } from '@/lib/utils';
import { Clapperboard, AlertCircle, CheckCircle, Hourglass, Link as LinkIcon } from 'lucide-react';

interface EpisodeCardProps {
  episode: Episode;
}

export function EpisodeCard({ episode }: EpisodeCardProps) {
  const getStatusIcon = () => {
    switch (episode.status) {
      case 'Searching...':
        return <Hourglass className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'Found':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Not Found':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'Error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clapperboard className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
     switch (episode.status) {
      case 'Pending': return 'في الانتظار';
      case 'Searching...': return 'جاري البحث...';
      case 'Found': return 'تم العثور';
      case 'Not Found': return 'لم يعثر على تطابق';
      case 'Error': return 'خطأ';
      default: return episode.status;
    }
  }

  return (
    <Card className="overflow-hidden shadow-lg transition-all hover:shadow-xl flex flex-col h-full">
      <CardHeader className="p-0 relative">
        <Image
          src={episode.thumbnail}
          alt={`Thumbnail for ${episode.title}`}
          width={480}
          height={360}
          className="w-full h-48 object-cover"
          data-ai-hint="video placeholder"
          unoptimized={episode.thumbnail.startsWith('https://placehold.co')}
        />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-headline mb-1 leading-tight h-12 overflow-hidden">
          <span className="font-bold">حلقة {episode.episodeNumber}:</span> {episode.title.substring(0,100)}${episode.title.length > 100 ? '...' : ''}
        </CardTitle>
        <div className="text-sm text-muted-foreground flex items-center space-x-2 space-x-reverse mt-2">
          {getStatusIcon()}
          <span>{getStatusText()}</span>
        </div>
        {episode.status === 'Found' && (
          <p className="text-sm text-foreground mt-1">المدة: {formatDuration(episode.duration)}</p>
        )}
      </CardContent>
      {episode.status === 'Found' && episode.link !== '#' && (
        <CardFooter className="p-4 border-t">
          <Button asChild variant="outline" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            <a href={episode.link} target="_blank" rel="noopener noreferrer">
              <LinkIcon className="ml-2 h-4 w-4" />
              مشاهدة الحلقة
            </a>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
