import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchChurchInvite,
  joinChurchThunk,
} from '@/store/reducers/churchSlice';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ConnectPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { inviteToken } = useParams<{ inviteToken: string }>();
  const {
    invite,
    inviteToken: loadedToken,
    inviteLoading,
    loading,
  } = useAppSelector((state) => state.church);
  const isCurrentInvite = loadedToken === inviteToken;
  const isLoadingInvite =
    Boolean(inviteToken) && (!isCurrentInvite || inviteLoading);

  useEffect(() => {
    if (!inviteToken) return;

    const request = dispatch(fetchChurchInvite(inviteToken));
    return () => request.abort();
  }, [dispatch, inviteToken]);

  const handleJoin = async () => {
    if (!inviteToken || !isCurrentInvite || !invite || inviteLoading || loading)
      return;

    const result = await dispatch(joinChurchThunk(inviteToken));
    if (joinChurchThunk.fulfilled.match(result)) {
      navigate('/', { replace: true });
    }
  };

  return (
    <main className="flex flex-1 flex-col gap-8 pt-10 pb-3">
      <section
        aria-label="Подключение к церкви"
        className="flex w-full flex-1 flex-col items-center justify-center text-center"
      >
        <Button
          type="button"
          variant="ghost"
          className="mb-6 w-fit self-start px-0 text-white/70 hover:bg-transparent hover:text-white has-[>svg]:px-0"
          disabled={loading}
          onClick={() => navigate('/welcome')}
        >
          <ArrowLeftIcon aria-hidden="true" />
          Назад
        </Button>
        {isLoadingInvite ? (
          <p
            id="connect-church-title"
            role="status"
            className="flex items-center gap-2 text-white/70"
          >
            <Spinner aria-hidden="true" />
            Загрузка приглашения
          </p>
        ) : isCurrentInvite && invite ? (
          <>
            <p className="text-white/70">Вас пригласили в церковь</p>
            <h1
              id="connect-church-title"
              className="mt-2 max-w-full text-3xl font-semibold text-white wrap-break-word sm:text-3xl line-clamp-2"
            >
              «{invite.name}»
            </h1>
            <Button
              type="button"
              disabled={loading}
              aria-busy={loading}
              onClick={handleJoin}
              className="mt-7 h-12 w-full rounded-xl bg-white text-base font-semibold text-slate-950 sm:mt-10"
            >
              Подключиться
              {loading ? (
                <Spinner aria-label="Подключение к церкви" />
              ) : (
                <ArrowRightIcon aria-hidden="true" className="size-5" />
              )}
            </Button>
          </>
        ) : (
          <>
            <h1 id="connect-church-title" className="text-2xl font-semibold">
              Не удалось загрузить приглашение
            </h1>
            {inviteToken && (
              <Button
                type="button"
                className="mt-7 h-12 w-full rounded-xl bg-white text-base font-semibold text-slate-950"
                onClick={() => dispatch(fetchChurchInvite(inviteToken))}
              >
                Повторить
              </Button>
            )}
          </>
        )}
      </section>
    </main>
  );
}
