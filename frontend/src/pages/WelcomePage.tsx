import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { useState } from 'react';

export default function WelcomePage() {
  const [isCreating, setIsCreating] = useState(false);

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
            onClick={() => setIsCreating(false)}
          >
            <ArrowLeftIcon aria-hidden="true" />
            Назад
          </Button>
          <form
            aria-label="Создать церковь"
            className="space-y-6"
            onSubmit={(event) => event.preventDefault()}
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
                placeholder="Введите название церкви"
                className="h-12 rounded-xl border border-solid border-white/20 bg-white/10 px-4 text-base text-white shadow-none placeholder:text-white/40 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 md:text-base dark:bg-white/10"
              />
            </div>
            <Button
              type="submit"
              className="h-12 w-full rounded-xl bg-white text-base font-semibold text-slate-950"
            >
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
    </main>
  );
}
