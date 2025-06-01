
"use client";

import type { Episode } from '@/types';
import { Button } from '@/components/ui/button';
import { Download, Copy, Share2, ArrowDownToLine } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from 'next/navigation';

interface ActionButtonsProps {
  episodes: Episode[];
  cartoonTitle: string;
  episodeCount: number;
  isFetching: boolean;
}

export function ActionButtons({ episodes, cartoonTitle, episodeCount, isFetching }: ActionButtonsProps) {
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const handleCopyLinks = () => {
    const links = episodes
      .filter(ep => ep.status === 'Found' && ep.link !== '#')
      .map(ep => `الحلقة ${ep.episodeNumber}: ${ep.link}`)
      .join('\n');
    
    if (links) {
      navigator.clipboard.writeText(links)
        .then(() => toast({ title: "تم النسخ!", description: "تم نسخ جميع روابط الحلقات بنجاح." }))
        .catch(() => toast({ title: "خطأ", description: "لم يتم نسخ الروابط.", variant: "destructive" }));
    } else {
      toast({ title: "لا يوجد روابط", description: "لا توجد روابط صالحة لنسخها.", variant: "destructive" });
    }
  };

  const handleCopySnaptubeLinks = () => {
    const links = episodes
      .filter(ep => ep.status === 'Found' && ep.link !== '#')
      .map(ep => ep.link) // Snaptube usually just needs the direct links
      .join('\n');
    
    if (links) {
      navigator.clipboard.writeText(links)
        .then(() => toast({ title: "تم نسخ الروابط لسناب تيوب!", description: "يمكنك الآن لصق الروابط في سناب تيوب للتحميل." }))
        .catch(() => toast({ title: "خطأ", description: "لم يتم نسخ الروابط.", variant: "destructive" }));
    } else {
      toast({ title: "لا يوجد روابط", description: "لا توجد روابط صالحة لنسخها لسناب تيوب.", variant: "destructive" });
    }
  };

  const handleShare = () => {
    const title = searchParams.get('title') || cartoonTitle;
    const count = searchParams.get('episodes') || episodeCount.toString();

    if(!title || !count || parseInt(count) === 0) {
        toast({ title: "خطأ", description: "الرجاء البحث أولاً لمشاركة النتائج.", variant: "destructive"});
        return;
    }

    const shareUrl = `${window.location.origin}/?title=${encodeURIComponent(title)}&episodes=${count}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => toast({ title: "تم نسخ رابط المشاركة!", description: "يمكنك الآن مشاركة هذا الرابط." }))
      .catch(() => toast({ title: "خطأ", description: "لم يتم نسخ رابط المشاركة.", variant: "destructive" }));
  };

  const handleDownloadPdf = async () => {
    if (episodes.filter(ep => ep.status === 'Found').length === 0) {
        toast({ title: "لا توجد بيانات", description: "لا توجد حلقات مكتملة لتحميلها.", variant: "destructive" });
        return;
    }

    toast({ title: "جاري تجهيز الملف...", description: "سيتم تحميل ملف PDF قريباً."});

    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(`قائمة حلقات: ${cartoonTitle}`, 105, 15, { align: 'center' });
    
    const tableColumn = ["رابط الحلقة", "مدة الفيديو", "عنوان الفيديو", "رقم الحلقة"];
    const tableRows: (string | number)[][] = [];

    episodes.forEach(ep => {
      if (ep.status === 'Found') {
        const episodeData = [
          ep.link,
          ep.duration > 0 ? `${Math.floor(ep.duration / 60)} دقيقة` : 'N/A',
          ep.title,
          ep.episodeNumber,
        ];
        tableRows.push(episodeData);
      }
    });

    autoTable(doc, {
      head: [tableColumn.reverse()], 
      body: tableRows.map(row => row.reverse()), 
      startY: 25,
      styles: { halign: 'right' }, 
      headStyles: {fillColor: [38, 127, 204], halign: 'center'},
    });
    
    doc.save(`${cartoonTitle}_episodes.pdf`);
    toast({ title: "تم التحميل!", description: "تم تحميل ملف PDF بنجاح." });
  };


  const hasResults = episodes.some(ep => ep.status === 'Found');

  return (
    <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
      <Button onClick={handleDownloadPdf} disabled={isFetching || !hasResults} variant="outline" className="text-base">
        <Download className="ml-2 h-5 w-5" />
        تحميل النتائج PDF
      </Button>
      <Button onClick={handleCopyLinks} disabled={isFetching || !hasResults} variant="outline" className="text-base">
        <Copy className="ml-2 h-5 w-5" />
        نسخ كل الروابط
      </Button>
      <Button onClick={handleCopySnaptubeLinks} disabled={isFetching || !hasResults} variant="outline" className="text-base">
        <ArrowDownToLine className="ml-2 h-5 w-5" />
        نسخ روابط سناب تيوب
      </Button>
      <Button onClick={handleShare} disabled={isFetching && (!cartoonTitle || episodeCount === 0)} variant="outline" className="text-base">
        <Share2 className="ml-2 h-5 w-5" />
        مشاركة النتيجة
      </Button>
    </div>
  );
}
