import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createChurchThunk } from '@/store/reducers/churchSlice';
import { ArrowLeftIcon, ArrowRightIcon, HouseIcon } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export default function WelcomePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((state) => state.church);
  const hasChurch = useAppSelector((state) =>
    Boolean(state.user.current?.activeChurchId),
  );
  const [isCreating, setIsCreating] = useState(false);
  const [churchName, setChurchName] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = churchName.trim();
    if (loading || !name) return;

    const result = await dispatch(createChurchThunk({ name }));
    if (createChurchThunk.fulfilled.match(result)) {
      navigate('/', { replace: true });
    }
  };

  return (
    <main className="flex flex-1 flex-col gap-8 pt-10 pb-3">
      {isCreating ? (
        <section
          aria-label="Создание церкви"
          className="flex w-full flex-1 flex-col justify-center"
        >
          <Button
            type="button"
            variant="ghost"
            className="mb-6 w-fit self-start px-0 text-white/70 hover:bg-transparent hover:text-white has-[>svg]:px-0"
            disabled={loading}
            onClick={() => setIsCreating(false)}
          >
            <ArrowLeftIcon aria-hidden="true" />
            Назад
          </Button>
          <form
            aria-label="Создать церковь"
            aria-busy={loading}
            className="space-y-6"
            onSubmit={handleSubmit}
          >
            <div className="space-y-3">
              <Label
                htmlFor="church-name"
                className="text-2xl leading-snug font-semibold"
              >
                Название церкви
              </Label>
              <Input
                id="church-name"
                name="churchName"
                type="text"
                autoComplete="organization"
                autoFocus
                value={churchName}
                onChange={(event) => setChurchName(event.target.value)}
                minLength={1}
                maxLength={30}
                required
                disabled={loading}
                placeholder="Введите название церкви"
                className="h-12 rounded-xl border border-solid border-white/20 bg-white/10 px-4 text-base text-white shadow-none placeholder:text-white/40 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 md:text-base dark:bg-white/10"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !churchName.trim()}
              className="h-12 w-full rounded-xl bg-white text-base font-semibold text-slate-950"
            >
              {loading && <Spinner aria-label="Создание церкви" />}
              Подтвердить
            </Button>
          </form>
        </section>
      ) : (
        <section className="flex w-full flex-1 flex-col justify-center text-center">
          <h1 className="text-5xl leading-none font-bold tracking-tighter sm:text-6xl text-center">
            Добро
            <br />
            пожаловать
          </h1>
          <Button
            type="button"
            className="mt-7 py-6 w-full justify-center rounded-xl bg-white text-base font-semibold text-slate-950 sm:mt-10"
            onClick={() => setIsCreating(true)}
          >
            Создать церковь
            <ArrowRightIcon aria-hidden="true" className="size-5" />
          </Button>
          <p className="mt-5 text-sm leading-relaxed text-white/70">
            Присоединиться к церкви можно по пригласительной ссылке
          </p>
        </section>
      )}
      {hasChurch && (
        <Button
          type="button"
          variant="ghost"
          className="h-10 self-center rounded-xl px-4 text-sm text-white bg-accent/50"
          disabled={loading}
          onClick={() => navigate('/')}
        >
          <HouseIcon aria-hidden="true" />
          На главную
        </Button>
      )}
    </main>
  );
}
