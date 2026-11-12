import { AuthField } from '@/components/AuthField';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateMode } from '@/store/reducers/settingsSlice';
import { loginUser, registerUser } from '@/store/reducers/userSlice';
import {
  EyeIcon,
  EyeOffIcon,
  LockKeyholeIcon,
  MailIcon,
  MoonStarIcon,
  SunIcon,
  UserRoundIcon,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Navigate, NavLink } from 'react-router-dom';

export default function AuthPage({
  variant,
}: {
  variant: 'login' | 'register';
}) {
  const mode = useAppSelector((state) => state.settings.mode);
  const { current, loading, initialized } = useAppSelector(
    (state) => state.user,
  );
  const dispatch = useAppDispatch();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isRegister = variant === 'register';
  const isBusy = loading || !initialized;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isBusy) return;

    const formData = new FormData(event.currentTarget);
    const credentials = {
      email: String(formData.get('email') ?? '')
        .trim()
        .toLowerCase(),
      password: String(formData.get('password') ?? ''),
    };

    if (isRegister) {
      dispatch(
        registerUser({
          ...credentials,
          fullName: String(formData.get('fullName') ?? '').trim(),
        }),
      );
    } else {
      dispatch(loginUser(credentials));
    }
  };

  if (current) return <Navigate to="/" replace />;

  return (
    <main className="relative isolate min-h-dvh">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-slate-950"
      >
        <img
          src="/bg-auth.jpg"
          alt=""
          draggable={false}
          className="size-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-linear-to-b from-slate-950/45 via-slate-950/55 to-slate-950/85" />
      </div>

      <div className="mx-auto flex min-h-dvh w-full max-w-[500px] flex-col gap-6 px-3 py-5 sm:py-6">
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-full border-white/20 bg-slate-950/30 text-xs text-white backdrop-blur-md hover:bg-white/15 hover:text-white dark:border-white/20 dark:bg-slate-950/30 dark:hover:bg-white/15"
            onClick={() =>
              dispatch(updateMode(mode === 'day' ? 'night' : 'day'))
            }
            aria-label={mode === 'day' ? 'Светлая тема' : 'Темная тема'}
          >
            {mode === 'day' ? (
              <MoonStarIcon aria-hidden="true" />
            ) : (
              <SunIcon aria-hidden="true" />
            )}
          </Button>
        </div>

        <section className="mx-auto my-auto w-full max-w-[440px] rounded-3xl border border-border/70 bg-background/80 p-6 backdrop-blur-sm sm:p-8">
          <Logo className="justify-center mb-7" size="lg" />

          <nav
            aria-label="Вход или регистрация"
            className="mb-7 grid grid-cols-2 gap-1 border bg-muted/50 p-1 rounded-full"
          >
            {[
              { to: '/login', label: 'Вход', active: !isRegister },
              {
                to: '/register',
                label: 'Регистрация',
                active: isRegister,
              },
            ].map(({ to, label, active }) => (
              <Button
                key={to}
                asChild
                variant="ghost"
                className={cn(
                  'h-10 rounded-full text-xs text-muted-foreground sm:text-sm hover:bg-transparent',
                  active &&
                    'bg-muted text-foreground shadow-xs dark:bg-accent dark:border',
                )}
              >
                <NavLink
                  to={to}
                  aria-disabled={isBusy}
                  tabIndex={isBusy ? -1 : undefined}
                  onClick={(event) => {
                    if (isBusy) event.preventDefault();
                  }}
                >
                  {label}
                </NavLink>
              </Button>
            ))}
          </nav>

          <form
            aria-label={isRegister ? 'Регистрация' : 'Вход'}
            aria-busy={isBusy}
            className="space-y-6"
            onSubmit={handleSubmit}
          >
            {isRegister && (
              <AuthField
                id="auth-name"
                name="fullName"
                label="Фамилия и имя"
                icon={UserRoundIcon}
                type="text"
                autoComplete="name"
                placeholder="Иванов Иван"
                minLength={5}
                maxLength={100}
                disabled={isBusy}
                required
              />
            )}

            <AuthField
              id="auth-email"
              name="email"
              label="Email"
              icon={MailIcon}
              type="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="name@example.com"
              disabled={isBusy}
              required
            />

            <AuthField
              id="auth-password"
              name="password"
              label="Пароль"
              icon={LockKeyholeIcon}
              type={isPasswordVisible ? 'text' : 'password'}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              placeholder={isRegister ? 'Придумайте пароль' : 'Введите пароль'}
              minLength={8}
              maxLength={128}
              description={isRegister ? 'Не менее 8 символов' : undefined}
              className="pr-13"
              disabled={isBusy}
              required
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-1 size-11 -translate-y-1/2 rounded-lg text-muted-foreground"
                aria-label={
                  isPasswordVisible ? 'Скрыть пароль' : 'Показать пароль'
                }
                aria-controls="auth-password"
                disabled={isBusy}
                onClick={() => setIsPasswordVisible((visible) => !visible)}
              >
                {isPasswordVisible ? (
                  <EyeOffIcon aria-hidden="true" className="size-5" />
                ) : (
                  <EyeIcon aria-hidden="true" className="size-5" />
                )}
              </Button>
            </AuthField>

            <Button
              type="submit"
              disabled={isBusy}
              className="h-13 w-full rounded-xl font-semibold text-white shadow-lg shadow-primary/15 hover:bg-primary/90 active:scale-[0.98]"
            >
              {isBusy ? (
                <Spinner aria-label="Загрузка" />
              ) : isRegister ? (
                'Создать аккаунт'
              ) : (
                'Войти'
              )}
            </Button>
          </form>
        </section>

        <footer className="shrink-0 text-center text-xs text-white/60">
          © Nord App 2026
        </footer>
      </div>
    </main>
  );
}
