
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Episode } from '@/types';
import { CartoonForm } from '@/components/cartoon-form';
import { EpisodeList } from '@/components/episode-list';
import { ActionButtons } from '@/components/action-buttons';
import { Progress } from "@/components/ui/progress";
import { fetchSingleEpisodeDetails } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, TvMinimalPlay } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function HomePage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [currentCartoonTitle, setCurrentCartoonTitle] = useState<string>('');
  const [totalEpisodesToFetch, setTotalEpisodesToFetch] = useState<number>(0);
  const [isFetching, setIsFetching] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const initializeEpisodes = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      episodeNumber: i + 1,
      title: `الحلقة ${i + 1}`,
      link: '#',
      duration: 0,
      thumbnail: `https://placehold.co/480x360.png?text=Pending+${i + 1}`,
      dataAihint: "video placeholder",
      status: 'Pending' as const,
    }));
  };

  const handleFetchEpisodes = useCallback(async (title: string, count: number) => {
    setIsFetching(true);
    setError(null);
    setOverallProgress(0);
    setCurrentCartoonTitle(title);
    setTotalEpisodesToFetch(count);

    const initialEpisodes = initializeEpisodes(count);
    setEpisodes(initialEpisodes);

    const updatedEpisodes = [...initialEpisodes];

    for (let i = 0; i < count; i++) {
      if (!isFetching && i > 0) break; // Stop if fetching was cancelled (though no UI for cancel yet)

      updatedEpisodes[i] = { ...updatedEpisodes[i], status: 'Searching...', dataAihint: "video placeholder" };
      setEpisodes([...updatedEpisodes]);

      try {
        const fetchedEpisode = await fetchSingleEpisodeDetails(title, i + 1);
        updatedEpisodes[i] = fetchedEpisode;
      } catch (e: any) {
        console.error(`Error processing episode ${i + 1}:`, e);
        updatedEpisodes[i] = {
          ...updatedEpisodes[i],
          title: `الحلقة ${i + 1} - خطأ في المعالجة`,
          status: 'Error',
          thumbnail: `https://placehold.co/480x360.png?text=Error+${i + 1}`,
          dataAihint: "error placeholder",
        };
        setError(`حدث خطأ أثناء جلب الحلقة ${i + 1}.`);
        toast({
          title: "خطأ في جلب حلقة",
          description: `حدث خطأ أثناء جلب الحلقة ${i + 1}. قد يكون بسبب مشكلة في الاتصال أو مفتاح API.`,
          variant: "destructive",
        });
      }
      setEpisodes([...updatedEpisodes]);
      setOverallProgress(((i + 1) / count) * 100);
    }

    setIsFetching(false);
    const foundCount = updatedEpisodes.filter(ep => ep.status === 'Found').length;
    toast({
        title: "اكتمل البحث!",
        description: `تم العثور على ${foundCount} من أصل ${count} حلقة.`,
    });
  }, [toast, isFetching]);


  useEffect(() => {
    const titleFromQuery = searchParams.get('title');
    const episodesFromQuery = searchParams.get('episodes');
    if (titleFromQuery && episodesFromQuery && !isFetching && episodes.length === 0) {
      const count = parseInt(episodesFromQuery);
      if (count > 0) {
        handleFetchEpisodes(titleFromQuery, count);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Only run on initial load or if searchParams change from external navigation

  const handleReloadEpisode = useCallback(async (episodeNumber: number) => {
    const episodeIndex = episodes.findIndex(ep => ep.episodeNumber === episodeNumber);
    if (episodeIndex === -1 || !currentCartoonTitle) {
      toast({ title: "خطأ", description: "لا يمكن إعادة تحميل الحلقة، معلومات غير كافية.", variant: "destructive" });
      return;
    }

    const updatedEpisodes = [...episodes];
    const originalEpisode = updatedEpisodes[episodeIndex];

    updatedEpisodes[episodeIndex] = {
      ...originalEpisode,
      status: 'Searching...',
      thumbnail: `https://placehold.co/480x360.png?text=Reloading+${episodeNumber}`,
      dataAihint: "video placeholder reloading",
    };
    setEpisodes([...updatedEpisodes]);

    try {
      const fetchedEpisode = await fetchSingleEpisodeDetails(currentCartoonTitle, episodeNumber);
      updatedEpisodes[episodeIndex] = fetchedEpisode;
       toast({
        title: "اكتملت إعادة المحاولة",
        description: `تمت محاولة إعادة تحميل الحلقة ${episodeNumber}. الحالة: ${fetchedEpisode.status === 'Found' ? 'تم العثور' : 'لم يتم العثور'}`,
        variant: fetchedEpisode.status === 'Found' ? "default" : "destructive",
      });
    } catch (e: any) {
      console.error(`Error reloading episode ${episodeNumber}:`, e);
      updatedEpisodes[episodeIndex] = {
        ...originalEpisode, // Revert to original on error, but mark as error
        status: 'Error',
        thumbnail: `https://placehold.co/480x360.png?text=Error+${episodeNumber}`,
        dataAihint: "error placeholder",
      };
      toast({
        title: "خطأ في إعادة تحميل الحلقة",
        description: `حدث خطأ أثناء إعادة تحميل الحلقة ${episodeNumber}.`,
        variant: "destructive",
      });
    }
    setEpisodes([...updatedEpisodes]);
  }, [episodes, currentCartoonTitle, toast]);


  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-headline font-bold text-primary flex items-center justify-center">
          <TvMinimalPlay className="mr-3 h-12 w-12 text-accent" />
          Cartoon Linker
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          أوجد حلقات كرتونك المفضلة بسهولة وسرعة!
        </p>
      </header>

      <CartoonForm onFetchEpisodes={handleFetchEpisodes} isFetching={isFetching} />

      {isFetching && (
        <div className="w-full max-w-2xl mt-8">
          <Progress value={overallProgress} className="w-full h-4 rounded-full" />
          <p className="text-center mt-2 text-sm text-muted-foreground">
            جاري معالجة الحلقات... {Math.round(overallProgress)}%
          </p>
        </div>
      )}

      {error && !isFetching && ( // Only show general error if not fetching (individual errors shown by toast)
        <Alert variant="destructive" className="mt-8 w-full max-w-2xl">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>خطأ</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {episodes.length > 0 && (
        <section className="mt-12 w-full">
          <h2 className="text-3xl font-headline font-semibold mb-6 text-center">نتائج البحث عن "{currentCartoonTitle}"</h2>
          <EpisodeList episodes={episodes} onReloadEpisode={handleReloadEpisode} />
          <ActionButtons 
            episodes={episodes} 
            cartoonTitle={currentCartoonTitle}
            episodeCount={totalEpisodesToFetch}
            isFetching={isFetching}
          />
        </section>
      )}
      
      {!isFetching && episodes.length === 0 && (
        <div className="mt-12 text-center text-muted-foreground">
          <TvMinimalPlay className="mx-auto h-16 w-16 mb-4 text-gray-400" />
          <p className="text-lg">أدخل اسم الكرتون وعدد الحلقات لبدء البحث.</p>
          <p className="text-sm">يمكنك أيضًا استخدام رابط مشارَك للبدء مباشرة.</p>
        </div>
      )}
      <footer className="mt-16 pt-8 border-t w-full max-w-5xl text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Cartoon Linker. جميع الحقوق محفوظة.</p>
        <p className="mt-1">تم التطوير بحب لمشاهدة الكرتون بدون انقطاع.</p>
      </footer>
    </div>
  );
}
