import { ChevronLeft } from 'lucide-react';
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { BottomBar } from '@/components/BottomBar';
import { Loading } from '@/components/Loading';
import { useGoBack } from '@/hooks/useGoBack';

export function SectionLayout({ title }: { title: string }) {
  const goBack = useGoBack();

  return (
    <div className="px-3 max-w-[500px] mx-auto">
      <div className="flex items-center gap-3 pt-3">
        <button
          onClick={() => goBack()}
          className="shrink-0 p-0 flex items-center justify-center rounded-full size-[45px] bg-secondary/20 backdrop-blur-xs border drop-shadow-xs"
          type="button"
        >
          <ChevronLeft />
        </button>
        <h5 className="flex-1 text-[22px] font-semibold">{title}</h5>
      </div>
      <Suspense fallback={<Loading />}>
        <Outlet />
      </Suspense>
      <BottomBar />
    </div>
  );
}
