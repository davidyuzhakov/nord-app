import { Loading } from '@/components/Loading';
import { Logo } from '@/components/Logo';
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

export function OnboardingLayout() {
  return (
    <div className="relative isolate mx-auto flex min-h-dvh w-full max-w-[500px] flex-col p-3 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
      >
        <img
          src="/bg-welcome.webp"
          alt=""
          draggable={false}
          className="size-full object-cover sm:object-[50%_70%] object-[65%_0%]"
        />
      </div>
      <Logo size="lg" className="shrink-0" />
      <Suspense fallback={<Loading />}>
        <Outlet />
      </Suspense>
      <footer className="shrink-0 py-3 text-center text-xs text-white/60">
        © Nord App 2026
      </footer>
    </div>
  );
}
