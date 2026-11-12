import { ChurchItem } from '@/components/ChurchItem';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateHideChords, updateMode } from '@/store/reducers/settingsSlice';
import { logoutUser } from '@/store/reducers/userSlice';
import { LogOutIcon, PencilIcon, UserRoundIcon } from 'lucide-react';

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
  const { mode, hideChords } = useAppSelector((state) => state.settings);

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
