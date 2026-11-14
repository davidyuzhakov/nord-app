import { ChurchItem } from '@/components/ChurchItem';
import { Modal } from '@/components/Modal';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchChurches, switchChurchThunk } from '@/store/reducers/churchSlice';
import {
  SONG_FONT_SIZE,
  updateHideChords,
  updateMode,
  updateSongFontSize,
} from '@/store/reducers/settingsSlice';
import { logoutUser, updateUser } from '@/store/reducers/userSlice';
import {
  LogOutIcon,
  MinusIcon,
  PencilIcon,
  PlusIcon,
  UserRoundIcon,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { current: user, loading } = useAppSelector((state) => state.user);
  const { items: churches, loading: churchesLoading } = useAppSelector(
    (state) => state.church,
  );
  const { mode, hideChords, songFontSize } = useAppSelector(
    (state) => state.settings,
  );
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [inputName, setInputName] = useState('');
  const [switchingChurchId, setSwitchingChurchId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    dispatch(fetchChurches());
  }, [dispatch]);

  const handleNameSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading || !user) return;

    await dispatch(updateUser({ fullName: inputName.trim() })).unwrap();
    setIsEditOpen(false);
  };

  const handleChurchSwitch = async (churchId: string) => {
    if (
      loading ||
      churchesLoading ||
      switchingChurchId ||
      churchId === user?.activeChurchId
    )
      return;

    setSwitchingChurchId(churchId);
    await dispatch(switchChurchThunk(churchId));
    setSwitchingChurchId(null);
  };

  const logoutHandler = () => {
    if (window.confirm('Вы действительно хотите выйти из аккаунта?')) {
      dispatch(logoutUser());
    }
  };

  return (
    <main className="min-w-0 space-y-6 px-1 pt-6 pb-24">
      <section aria-label="Личные данные" className="flex items-start gap-3">
        <Avatar className="size-12">
          <AvatarFallback>
            <UserRoundIcon
              aria-hidden="true"
              className="size-6"
              strokeWidth={1.5}
            />
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-1">
          <h1 className="text-xl leading-snug font-semibold wrap-break-word line-clamp-2">
            {user?.fullName}
          </h1>
          <p
            className="truncate text-sm text-muted-foreground"
            title={user?.email}
          >
            {user?.email}
          </p>
        </div>

        <Modal
          isOpen={isEditOpen}
          onOpenChange={(isOpen) => {
            if (loading) return;
            if (isOpen) setInputName(user?.fullName ?? '');
            setIsEditOpen(isOpen);
          }}
          title="Редактировать имя"
          trigger={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full text-muted-foreground border"
              aria-label="Редактировать имя"
              title="Редактировать имя"
              disabled={loading || churchesLoading || !user}
            >
              <PencilIcon aria-hidden="true" />
            </Button>
          }
        >
          <form
            onSubmit={handleNameSubmit}
            aria-busy={loading}
            className="space-y-4 pt-2"
          >
            <div className="space-y-2">
              <Label htmlFor="profile-full-name">Фамилия и имя</Label>
              <Input
                id="profile-full-name"
                name="fullName"
                autoComplete="name"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                minLength={5}
                maxLength={100}
                required
                disabled={loading}
                className="h-10 bg-secondary dark:bg-input/30"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => setIsEditOpen(false)}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={loading || user?.fullName === inputName}
              >
                {loading && <Spinner aria-label="Сохранение имени" />}
                Сохранить
              </Button>
            </div>
          </form>
        </Modal>
      </section>

      <section
        aria-labelledby="profile-settings-title"
        className="dark:bg-secondary/30 bg-secondary/60 p-4 rounded-lg"
      >
        <h2
          id="profile-settings-title"
          className="mb-1 text-xs font-medium text-muted-foreground"
        >
          Настройки
        </h2>

        <div className="flex min-h-14 items-center justify-between gap-4">
          <Label
            htmlFor="profile-dark-mode"
            className="flex-1 cursor-pointer py-4 font-normal"
          >
            Тёмная тема
          </Label>
          <Switch
            id="profile-dark-mode"
            checked={mode === 'night'}
            onCheckedChange={(checked) =>
              dispatch(updateMode(checked ? 'night' : 'day'))
            }
          />
        </div>

        <Separator className="bg-border/60" />

        <div className="flex min-h-14 items-center justify-between gap-4">
          <Label
            htmlFor="profile-show-chords"
            className="flex-1 cursor-pointer py-4 font-normal"
          >
            Показывать аккорды
          </Label>
          <Switch
            id="profile-show-chords"
            checked={hideChords === 'off'}
            onCheckedChange={(checked) =>
              dispatch(updateHideChords(checked ? 'off' : 'on'))
            }
          />
        </div>

        <Separator className="bg-border/60" />

        <div className="flex items-center justify-between gap-4 pt-4">
          <div className="space-y-1">
            <span id="profile-song-font-size-label" className="text-sm">
              Размер текста песни
            </span>
          </div>
          <div
            role="group"
            aria-labelledby="profile-song-font-size-label"
            className="flex shrink-0 items-center gap-1 rounded-lg bg-muted-foreground/5 p-0.5"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Уменьшить размер текста песни"
              disabled={songFontSize <= SONG_FONT_SIZE.min}
              className="disabled:opacity-30"
              onClick={() => dispatch(updateSongFontSize(songFontSize - 1))}
            >
              <MinusIcon aria-hidden="true" />
            </Button>
            <output
              aria-live="polite"
              className="min-w-10 text-center text-xs font-medium tabular-nums"
            >
              {songFontSize} px
            </output>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Увеличить размер текста песни"
              className="disabled:opacity-30"
              disabled={songFontSize >= SONG_FONT_SIZE.max}
              onClick={() => dispatch(updateSongFontSize(songFontSize + 1))}
            >
              <PlusIcon aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="profile-churches-title"
        className="space-y-5 dark:bg-secondary/30 bg-secondary/60 p-4 rounded-lg"
      >
        <div className="flex items-center justify-between gap-3">
          <h2
            id="profile-churches-title"
            className="text-xs font-medium text-muted-foreground"
          >
            Мои церкви
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="py-0 h-auto gap-1 px-2 text-xs text-muted-foreground hover:bg-transparent"
            disabled={loading || churchesLoading}
            onClick={() => navigate('/welcome')}
          >
            <PlusIcon aria-hidden="true" className="size-3.5" />
            Создать церковь
          </Button>
        </div>

        {churchesLoading && churches.length === 0 ? (
          <p
            role="status"
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Spinner aria-hidden="true" />
            Загрузка церквей
          </p>
        ) : (
          <ul className="divide-y divide-border/60 rounded-xl">
            {churches.map((church) => (
              <ChurchItem
                key={church.id}
                id={church.id}
                name={church.name}
                isCurrent={church.id === user?.activeChurchId}
                isCreator={church.createdById === user?.id}
                onSwitch={() => handleChurchSwitch(church.id)}
                isSwitching={switchingChurchId === church.id}
                disabled={loading || churchesLoading || !!switchingChurchId}
                inviteUrl={
                  church.createdById === user?.id
                    ? `${window.location.origin}/connect/${encodeURIComponent(church.inviteToken)}`
                    : undefined
                }
              />
            ))}
          </ul>
        )}
      </section>

      <Button
        type="button"
        variant="destructive"
        className="mr-0 w-full"
        disabled={loading || churchesLoading}
        aria-busy={loading && !isEditOpen}
        onClick={logoutHandler}
      >
        {loading && !isEditOpen ? (
          <Spinner aria-label="Выход из аккаунта" />
        ) : (
          <LogOutIcon aria-hidden="true" />
        )}
        Выйти из аккаунта
      </Button>
    </main>
  );
}
