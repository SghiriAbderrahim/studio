import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseISO8601Duration(duration: string): number {
  if (!duration) return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/);
  
  if (!match) {
    return 0;
  }

  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseFloat(match[3] || "0");

  return hours * 3600 + minutes * 60 + seconds;
}

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

export const YOUTUBE_API_KEY = "AIzaSyCK6KivEFoC2Mpp0TI2ieobAdwQ9xuk0Y8"; // As provided in the request
export const EXCLUDED_KEYWORDS = ["AMV", "تحليل", "reaction", "recap", "trailer", "teaser", "promo", "opening", "ending", "ost", "soundtrack", "review", "ملخص", "مراجعه", "اعلان", "مقدمة", "نهاية"];
export const MINIMUM_DURATION_SECONDS = 15 * 60; // 15 minutes
