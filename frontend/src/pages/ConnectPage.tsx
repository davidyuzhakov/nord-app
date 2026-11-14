import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ConnectPage() {
  const navigate = useNavigate();

  return (
    <main className="flex flex-1 flex-col gap-8 pt-10 pb-3">
      <section
        aria-labelledby="connect-church-title"
        className="flex w-full flex-1 flex-col items-center justify-center text-center"
      >
        <Button
          type="button"
          variant="ghost"
          className="mb-6 w-fit self-start px-0 text-white/70 hover:bg-transparent hover:text-white has-[>svg]:px-0"
          onClick={() => navigate('/welcome')}
        >
          <ArrowLeftIcon aria-hidden="true" />
          Назад
        </Button>
        <p className="text-white/70">Вас пригласили в церковь</p>
        <p className="mt-2 max-w-full text-3xl font-semibold text-white wrap-break-word sm:text-3xl line-clamp-2">
          «Благодать север»
        </p>
        <Button
          type="button"
          className="mt-7 h-12 w-full rounded-xl bg-white text-base font-semibold text-slate-950 sm:mt-10"
        >
          Подключиться
          <ArrowRightIcon aria-hidden="true" className="size-5" />
        </Button>
      </section>
    </main>
  );
}
