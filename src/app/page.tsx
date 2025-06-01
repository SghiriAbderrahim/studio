
import { Suspense } from 'react';
import { MainPageContent } from '@/components/main-page-content';

export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen w-full text-xl text-primary"><p>Loading page content...</p></div>}>
      <MainPageContent />
    </Suspense>
  );
}
