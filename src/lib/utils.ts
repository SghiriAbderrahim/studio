
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// parseISO8601Duration is no longer needed as youtube-sr provides duration in milliseconds,
// which is converted to seconds directly in src/lib/youtube.ts or src/app/actions.ts.

export function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 0) return "غير معروف";
  if (totalSeconds === 0) return "0 ثانية";

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (minutes > 0 && seconds > 0) {
    return `${minutes} دقيقة و ${seconds} ثانية`;
  } else if (minutes > 0) {
    return `${minutes} دقيقة`;
  } else {
    return `${seconds} ثانية`;
  }
}

export const EXCLUDED_KEYWORDS = ["AMV", "تحليل", "reaction", "recap", "trailer", "teaser", "promo", "opening", "ending", "ost", "soundtrack", "review", "ملخص", "مراجعه", "اعلان", "مقدمة", "نهاية"];
export const MINIMUM_DURATION_SECONDS = 15 * 60; // 15 minutes
