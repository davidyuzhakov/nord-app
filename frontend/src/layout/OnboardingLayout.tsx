import { Loading } from '@/components/Loading';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/reducers/userSlice';
import { LogOutIcon } from 'lucide-react';
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

export function OnboardingLayout() {
  const dispatch = useAppDispatch();
  const userLoading = useAppSelector((state) => state.user.loading);
  const churchLoading = useAppSelector((state) => state.church.loading);
  const isBusy = userLoading || churchLoading;

  const handleLogout = () => {
    if (isBusy) return;
    if (window.confirm('Вы действительно хотите выйти из аккаунта?')) {
      dispatch(logoutUser());
    }
  };

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
      <header className="flex shrink-0 items-center justify-between gap-3">
        <Logo size="lg" className="shrink-0" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full text-white/70 hover:bg-white/10 hover:text-white"
          aria-label="Выйти из аккаунта"
          title="Выйти из аккаунта"
          disabled={isBusy}
          aria-busy={userLoading}
          onClick={handleLogout}
        >
          {userLoading ? (
            <Spinner aria-label="Выход из аккаунта" />
          ) : (
            <LogOutIcon aria-hidden="true" />
          )}
        </Button>
      </header>
      <Suspense fallback={<Loading />}>
        <Outlet />
      </Suspense>
      <footer className="shrink-0 py-3 text-center text-xs text-white/60">
        © Nord App 2026
      </footer>
    </div>
  );
}
