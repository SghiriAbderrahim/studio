
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
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

// API_CALL_DELAY_MS is no longer strictly necessary for youtube-sr as it's less sensitive to rapid calls than the official API.
// However, keeping a small delay can still be good practice for any external calls.
// For youtube-sr, this might not be needed, or a much smaller value could be used if desired.
// Let's remove it for now to fully leverage youtube-sr's capabilities.
// const API_CALL_DELAY_MS = 100; // Optional: small delay

export function MainPageContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [currentCartoonTitle, setCurrentCartoonTitle] = useState<string>('');
  const [currentStartEpisode, setCurrentStartEpisode] = useState<number>(0);
  const [currentEndEpisode, setCurrentEndEpisode] = useState<number>(0);
  const [isFetching, setIsFetching] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  // apiQuotaErrorOccurred is no longer relevant with youtube-sr
  // const [apiQuotaErrorOccurred, setApiQuotaErrorOccurred] = useState<boolean>(false);


  const initializeEpisodes = (start: number, end: number) => {
    const count = end - start + 1;
    return Array.from({ length: count }, (_, i) => ({
      episodeNumber: start + i,
      title: `الحلقة ${start + i}`,
      link: '#',
      duration: 0,
      thumbnail: `https://placehold.co/480x360.png?text=Pending+${start + i}`,
      dataAihint: "video placeholder",
      status: 'Pending' as const,
    }));
  };

  const handleFetchEpisodes = useCallback(async (title: string, startEp: number, endEp: number) => {
    setIsFetching(true);
    setError(null);
    // setApiQuotaErrorOccurred(false); // No longer needed
    setOverallProgress(0);
    setCurrentCartoonTitle(title);
    setCurrentStartEpisode(startEp);
    setCurrentEndEpisode(endEp);

    const totalEpisodesToFetch = endEp - startEp + 1;
    if (totalEpisodesToFetch <= 0) {
        toast({ title: "نطاق غير صالح", description: "يجب أن يكون عدد الحلقات أكبر من صفر.", variant: "destructive" });
        setIsFetching(false);
        return;
    }

    const initialEpisodes = initializeEpisodes(startEp, endEp);
    setEpisodes(initialEpisodes);

    const updatedEpisodes = [...initialEpisodes];
    // let localQuotaError = false; // No longer needed

    for (let i = 0; i < totalEpisodesToFetch; i++) {
      const currentEpisodeNumber = startEp + i;
      
      const currentIsFetching = await new Promise<boolean>(resolve => setTimeout(() => resolve(isFetchingRef.current), 0));
      if (!currentIsFetching && i > 0) { 
          toast({ title: "تم إيقاف البحث", description: "تم إيقاف عملية البحث عن الحلقات.", variant: "default" });
          break; 
      }
      
      // Optional: await new Promise(resolve => setTimeout(resolve, API_CALL_DELAY_MS));
      // Removed delay as youtube-sr is less sensitive.

      const episodeIndex = updatedEpisodes.findIndex(ep => ep.episodeNumber === currentEpisodeNumber);
      if (episodeIndex === -1) continue; 

      updatedEpisodes[episodeIndex] = { ...updatedEpisodes[episodeIndex], status: 'Searching...', dataAihint: "video placeholder" };
      setEpisodes([...updatedEpisodes]);

      try {
        const fetchedEpisode = await fetchSingleEpisodeDetails(title, currentEpisodeNumber);
        updatedEpisodes[episodeIndex] = fetchedEpisode;
        if (fetchedEpisode.status === 'Error') {
          // With youtube-sr, errors are less likely to be quota-related.
          // Treat them as general search errors.
          toast({
            title: "خطأ في جلب حلقة",
            description: `الحلقة ${currentEpisodeNumber}: ${fetchedEpisode.title}`, // Title now contains a generic error message
            variant: "destructive",
          });
        }
      } catch (e: any) {
        console.error(`Error processing episode ${currentEpisodeNumber} in MainPageContent:`, e);
        updatedEpisodes[episodeIndex] = {
          ...updatedEpisodes[episodeIndex],
          title: `الحلقة ${currentEpisodeNumber} - خطأ فادح في النظام`,
          status: 'Error',
          thumbnail: `https://placehold.co/480x360.png?text=Error+${currentEpisodeNumber}`,
          dataAihint: "error placeholder",
        };
        toast({
          title: "خطأ غير متوقع",
          description: `حدث خطأ فادح أثناء محاولة جلب الحلقة ${currentEpisodeNumber}.`,
          variant: "destructive",
        });
      }
      setEpisodes([...updatedEpisodes]);
      setOverallProgress(((i + 1) / totalEpisodesToFetch) * 100);
    }

    setIsFetching(false);
    // Removed API Quota specific error message
    // if (localQuotaError) {
    //   setError("حدث خطأ بسبب تجاوز حصة YouTube API أو الوصول للحد الأقصى للطلبات. قد لا يتم جلب جميع الحلقات. يرجى المحاولة مرة أخرى لاحقًا أو التحقق من إعدادات مفاتيح API.");
    // }

    const foundCount = updatedEpisodes.filter(ep => ep.status === 'Found').length;
    toast({
        title: "اكتمل البحث!",
        description: `تم العثور على ${foundCount} من أصل ${totalEpisodesToFetch} حلقة.`,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]); 

  const isFetchingRef = useRef(isFetching);
  useEffect(() => {
    isFetchingRef.current = isFetching;
  }, [isFetching]);

  useEffect(() => {
    const titleFromQuery = searchParams.get('title');
    const startFromQuery = searchParams.get('startEpisode');
    const endFromQuery = searchParams.get('endEpisode');

    if (titleFromQuery && startFromQuery && endFromQuery && !isFetchingRef.current && episodes.length === 0) {
      const startEp = parseInt(startFromQuery);
      const endEp = parseInt(endFromQuery);
      if (startEp > 0 && endEp > 0 && endEp >= startEp) {
        handleFetchEpisodes(titleFromQuery, startEp, endEp);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, handleFetchEpisodes]); 


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
    
    // Optional: await new Promise(resolve => setTimeout(resolve, API_CALL_DELAY_MS / 2)); // Shorter delay for single reload

    try {
      const fetchedEpisode = await fetchSingleEpisodeDetails(currentCartoonTitle, episodeNumber);
      updatedEpisodes[episodeIndex] = fetchedEpisode;
      setEpisodes([...updatedEpisodes]); 

      if (fetchedEpisode.status === 'Error') {
         // No specific API quota error handling for youtube-sr
        toast({
          title: "خطأ في إعادة تحميل الحلقة",
          description: `الحلقة ${episodeNumber}: ${fetchedEpisode.title}`,
          variant: "destructive",
        });
      } else if (fetchedEpisode.status === 'Found') {
         toast({
            title: "اكتملت إعادة المحاولة",
            description: `تم العثور على الحلقة ${episodeNumber}.`,
        });
      } else { 
         toast({
            title: "لم يتم العثور",
            description: `لم يتم العثور على فيديو مناسب للحلقة ${episodeNumber} بعد إعادة المحاولة.`,
            variant: "default",
        });
      }
    } catch (e: any) {
      console.error(`Error reloading episode ${episodeNumber} in MainPageContent:`, e);
      updatedEpisodes[episodeIndex] = {
        ...originalEpisode, 
        status: 'Error',
        title: `الحلقة ${episodeNumber} - خطأ فادح في النظام`,
        thumbnail: `https://placehold.co/480x360.png?text=Error+${episodeNumber}`,
        dataAihint: "error placeholder",
      };
      setEpisodes([...updatedEpisodes]);
      toast({
        title: "خطأ غير متوقع",
        description: `حدث خطأ فادح أثناء محاولة إعادة تحميل الحلقة ${episodeNumber}.`,
        variant: "destructive",
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodes, currentCartoonTitle, toast, setError]);


  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-headline font-bold text-primary flex items-center justify-center">
          <TvMinimalPlay className="mr-3 h-12 w-12 text-accent" />
          Youtube Episodes Finder
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

      {error && !isFetching && ( 
        <Alert variant="destructive" className="mt-8 w-full max-w-2xl">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>خطأ عام</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {episodes.length > 0 && (
        <section className="mt-12 w-full">
          <h2 className="text-3xl font-headline font-semibold mb-6 text-center">نتائج البحث عن "{currentCartoonTitle}" (الحلقات {currentStartEpisode} - {currentEndEpisode})</h2>
          <EpisodeList episodes={episodes} onReloadEpisode={handleReloadEpisode} />
          <ActionButtons 
            episodes={episodes} 
            cartoonTitle={currentCartoonTitle}
            startEpisode={currentStartEpisode}
            endEpisode={currentEndEpisode}
            isFetching={isFetching}
          />
        </section>
      )}
      
      {!isFetching && episodes.length === 0 && !error && (
        <div className="mt-12 text-center text-muted-foreground">
          <TvMinimalPlay className="mx-auto h-16 w-16 mb-4 text-gray-400" />
          <p className="text-lg">أدخل اسم الكرتون ونطاق الحلقات لبدء البحث.</p>
          <p className="text-sm">يمكنك أيضًا استخدام رابط مشارَك للبدء مباشرة.</p>
        </div>
      )}
      <footer className="mt-16 pt-8 border-t w-full max-w-5xl text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Youtube Episodes Finder. جميع الحقوق محفوظة.</p>
        <p className="mt-1">تم التطوير بحب لمشاهدة الكرتون بدون انقطاع.</p>
      </footer>
    </div>
  );
}
