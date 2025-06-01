"use client";

import type { Episode } from '@/types';
import { Button } from '@/components/ui/button';
import { Download, Copy, Share2 } from 'lucide-react';
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

    // Add custom font (ensure you have the .ttf file or use a standard font)
    // For simplicity, we'll use a standard font. If Amiri is needed, it must be embedded.
    // doc.addFileToVFS('Amiri-Regular.ttf', AmiriRegularBase64);
    // doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    // doc.setFont('Amiri');
    // For now, use a built-in font that might support Arabic characters better or default.
    // Default jsPDF fonts have limited Arabic support. Consider helvetica or times.
    
    // Workaround for Arabic text: jsPDF has poor Arabic support by default.
    // One common workaround is to reverse the text and use a font that displays disjointed letters.
    // This is complex. For now, we'll attempt with standard fonts and acknowledge limitations.
    
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
      head: [tableColumn.reverse()], // Reverse for RTL appearance
      body: tableRows.map(row => row.reverse()), // Reverse each row for RTL
      startY: 25,
      styles: { halign: 'right' }, // Align text to the right for RTL
      headStyles: {fillColor: [38, 127, 204], halign: 'center'}, // Example: Soft Blue
      // didDrawCell: (data) => { // This is needed for complex font handling
      //   if (data.section === 'body' && data.column.index >=0) {
      //     // For Arabic, you might need to use doc.text with custom handling here
      //     // doc.text(reversedText(data.cell.raw.toString()), data.cell.x + data.cell.width - 5, data.cell.y + data.cell.height / 2 + 3);
      //   }
      // }
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
      <Button onClick={handleShare} disabled={isFetching && (!cartoonTitle || episodeCount === 0)} variant="outline" className="text-base">
        <Share2 className="ml-2 h-5 w-5" />
        مشاركة النتيجة
      </Button>
    </div>
  );
}

// Basic Arabic text reverser (for jsPDF if no proper RTL support)
// function reversedText(text: string) {
//  return text.split('').reverse().join('');
// }
