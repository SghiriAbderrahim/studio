"use client";

import { useState, type FormEvent, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Search } from 'lucide-react';

interface CartoonFormProps {
  onFetchEpisodes: (title: string, count: number) => void;
  isFetching: boolean;
}

export function CartoonForm({ onFetchEpisodes, isFetching }: CartoonFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [title, setTitle] = useState('');
  const [episodes, setEpisodes] = useState('');

  useEffect(() => {
    const titleFromQuery = searchParams.get('title');
    const episodesFromQuery = searchParams.get('episodes');
    if (titleFromQuery) {
      setTitle(titleFromQuery);
    }
    if (episodesFromQuery) {
      setEpisodes(episodesFromQuery);
    }
  }, [searchParams]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const episodeCount = parseInt(episodes);
    if (title && episodeCount > 0) {
      onFetchEpisodes(title, episodeCount);
      // Update URL without navigation for shareability
      const newParams = new URLSearchParams();
      newParams.set('title', title);
      newParams.set('episodes', episodeCount.toString());
      router.replace(`?${newParams.toString()}`, { scroll: false });

    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-center">جلب روابط حلقات الكرتون</CardTitle>
        <CardDescription className="text-center">
          أدخل اسم الكرتون وعدد الحلقات لجلب الروابط من يوتيوب.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="cartoon-title" className="text-base">اسم الكرتون</Label>
            <Input
              id="cartoon-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: ون بيس"
              required
              className="text-base py-2 px-3"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="episode-count" className="text-base">عدد الحلقات</Label>
            <Input
              id="episode-count"
              type="number"
              value={episodes}
              onChange={(e) => setEpisodes(e.target.value)}
              placeholder="مثال: 100"
              required
              min="1"
              className="text-base py-2 px-3"
            />
          </div>
          <Button type="submit" disabled={isFetching} className="w-full text-lg py-3 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Search className="ml-2 h-5 w-5" />
            {isFetching ? 'جاري البحث...' : 'جلب الحلقات'}
          </Button>
        </form>
      </CardContent>
       <CardFooter className="text-sm text-muted-foreground text-center block">
        <p>سيتم البحث عن فيديوهات لا تقل مدتها عن 15 دقيقة.</p>
      </CardFooter>
    </Card>
  );
}
