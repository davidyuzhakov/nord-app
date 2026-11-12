import { ChurchItem } from '@/components/ChurchItem';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  SONG_FONT_SIZE,
  updateHideChords,
  updateMode,
  updateSongFontSize,
} from '@/store/reducers/settingsSlice';
import { logoutUser } from '@/store/reducers/userSlice';
import {
  LogOutIcon,
  MinusIcon,
  PencilIcon,
  PlusIcon,
  UserRoundIcon,
} from 'lucide-react';

const churches = [
  {
    id: 'blagodat',
    name: 'Благодать север',
    isCurrent: false,
    isCreator: true,
    inviteUrl: 'https://nord-app.ru/invite/demo-blagodat-n7k2',
  },
  {
    id: 'new-life',
    name: 'Новая жизнь',
    isCurrent: true,
    isCreator: false,
  },
];

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { current: user, loading } = useAppSelector((state) => state.user);
  const { mode, hideChords, songFontSize } = useAppSelector(
    (state) => state.settings,
  );

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

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full text-muted-foreground border"
          aria-label="Редактировать имя"
          title="Редактировать имя"
        >
          <PencilIcon aria-hidden="true" />
        </Button>
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
        <h2
          id="profile-churches-title"
          className="text-xs font-medium text-muted-foreground"
        >
          Мои церкви
        </h2>

        <ul className="divide-y divide-border/60 rounded-xl">
          {churches.map((church) => (
            <ChurchItem key={church.id} {...church} />
          ))}
        </ul>
      </section>

      <Button
        type="button"
        variant="destructive"
        className="mr-0 w-full"
        disabled={loading}
        aria-busy={loading}
        onClick={logoutHandler}
      >
        {loading ? (
          <Spinner aria-label="Выход из аккаунта" />
        ) : (
          <LogOutIcon aria-hidden="true" />
        )}
        Выйти из аккаунта
      </Button>
    </main>
  );
}
