
"use client";

import { useState, type FormEvent, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CartoonFormProps {
  onFetchEpisodes: (title: string, startEpisode: number, endEpisode: number) => void;
  isFetching: boolean;
}

export function CartoonForm({ onFetchEpisodes, isFetching }: CartoonFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [startEpisode, setStartEpisode] = useState('');
  const [endEpisode, setEndEpisode] = useState('');

  useEffect(() => {
    const titleFromQuery = searchParams.get('title');
    const startFromQuery = searchParams.get('startEpisode');
    const endFromQuery = searchParams.get('endEpisode');
    if (titleFromQuery) {
      setTitle(titleFromQuery);
    }
    if (startFromQuery) {
      setStartEpisode(startFromQuery);
    }
    if (endFromQuery) {
      setEndEpisode(endFromQuery);
    }
  }, [searchParams]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const startNum = parseInt(startEpisode);
    const endNum = parseInt(endEpisode);

    if (!title || !startEpisode || !endEpisode) {
        toast({ title: "خطأ", description: "يرجى ملء جميع الحقول.", variant: "destructive" });
        return;
    }
    if (isNaN(startNum) || isNaN(endNum) || startNum <= 0 || endNum <= 0) {
        toast({ title: "خطأ", description: "يرجى إدخال أرقام حلقات صالحة (أكبر من صفر).", variant: "destructive" });
        return;
    }
    if (startNum > endNum) {
      toast({ title: "خطأ", description: "يجب أن تكون 'من الحلقة' أصغر من أو تساوي 'إلى الحلقة'.", variant: "destructive" });
      return;
    }

    onFetchEpisodes(title, startNum, endNum);
    const newParams = new URLSearchParams();
    newParams.set('title', title);
    newParams.set('startEpisode', startNum.toString());
    newParams.set('endEpisode', endNum.toString());
    router.replace(`?${newParams.toString()}`, { scroll: false });
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-center">جلب روابط حلقات الكرتون</CardTitle>
        <CardDescription className="text-center">
          أدخل اسم الكرتون ونطاق الحلقات لجلب الروابط من يوتيوب.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-episode" className="text-base">من الحلقة</Label>
              <Input
                id="start-episode"
                type="number"
                value={startEpisode}
                onChange={(e) => setStartEpisode(e.target.value)}
                placeholder="مثال: 1"
                required
                min="1"
                className="text-base py-2 px-3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-episode" className="text-base">إلى الحلقة</Label>
              <Input
                id="end-episode"
                type="number"
                value={endEpisode}
                onChange={(e) => setEndEpisode(e.target.value)}
                placeholder="مثال: 100"
                required
                min="1"
                className="text-base py-2 px-3"
              />
            </div>
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
