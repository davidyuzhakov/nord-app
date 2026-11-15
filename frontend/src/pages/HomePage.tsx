import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useEffect } from 'react';
import { ChurchIcon } from 'lucide-react';
import { Program } from '@/components/Program';
import { fetchChurches } from '@/store/reducers/churchSlice';
import { fetchPrograms } from '@/store/reducers/programSlice';

export type TypeProgram = 'ready' | 'favorite' | 'archived';

const HomePage = () => {
  const churchId = useAppSelector(
    (state) => state.user.current?.activeChurchId,
  );
  const churchName = useAppSelector(
    (state) =>
      state.church.items.find((church) => church.id === churchId)?.name,
  );

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchPrograms());
  }, [dispatch, churchId]);

  useEffect(() => {
    if (churchId && churchName === undefined) {
      dispatch(fetchChurches());
    }
  }, [dispatch, churchId, churchName]);

  return (
    <div className="pb-[130px]">
      <div className="flex items-center gap-2 py-3 mb-2.5">
        <img
          className="size-10 shrink-0 rounded-full"
          src="/logo.png?v=1"
          alt="Логотип"
          width={40}
          height={40}
          decoding="async"
        />
        <span className="shrink-0 text-xl tracking-tighter select-none font-bold flex gap-0.5 items-end">
          Nord App
          <span className="size-1.5 rounded-full bg-primary -translate-y-1" />
        </span>
        {churchName && (
          <div
            className="ml-auto flex min-w-0 items-center gap-1.5 rounded-full text-sm font-medium"
            title={churchName}
          >
            <ChurchIcon
              aria-hidden="true"
              className="size-4 shrink-0 text-primary"
            />
            <span className="truncate">{churchName}</span>
          </div>
        )}
      </div>
      <div className="space-y-8">
        {['ready', 'favorite', 'archived'].map((type) => (
          <Program key={type} type={type as TypeProgram} />
        ))}
      </div>

      <Button
        onClick={() => navigate('/program/create')}
        className="flex items-center max-w-sm mx-auto fixed bottom-18 left-7 right-7 text-xl font-semibold py-6 px-2 rounded-full shadow-md dark:shadow-[0_0_20px_rgba(28,143,214,0.3)]"
      >
        Новая программа
      </Button>
    </div>
  );
};

export default HomePage;
