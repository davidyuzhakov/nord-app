import { useEffect, useId, useState, type FormEvent } from 'react';
import {
  ArrowRightLeftIcon,
  CheckIcon,
  ChurchIcon,
  CopyIcon,
  LinkIcon,
  PencilIcon,
  RefreshCwIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAppDispatch } from '@/store/hooks';
import {
  deleteChurchThunk,
  updateChurchThunk,
} from '@/store/reducers/churchSlice';
import { Modal } from './Modal';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Spinner } from './ui/spinner';

interface ChurchItemProps {
  id: string;
  name: string;
  isCurrent?: boolean;
  isCreator?: boolean;
  inviteUrl?: string;
  onSwitch?: () => void;
  isSwitching?: boolean;
  disabled?: boolean;
}

export function ChurchItem({
  id,
  name,
  isCurrent = false,
  isCreator = false,
  inviteUrl,
  onSwitch,
  isSwitching = false,
  disabled = false,
}: ChurchItemProps) {
  const dispatch = useAppDispatch();
  const inviteId = useId();
  const nameId = useId();
  const [isCopied, setIsCopied] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [inputName, setInputName] = useState(name);
  const [pendingAction, setPendingAction] = useState<
    'rename' | 'refresh' | 'delete' | null
  >(null);
  const isBusy = disabled || pendingAction !== null;

  useEffect(() => {
    if (!isCopied) return;
    const timeoutId = setTimeout(() => setIsCopied(false), 3000);
    return () => clearTimeout(timeoutId);
  }, [isCopied]);

  const handleNameSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newName = inputName.trim();
    if (isBusy || !newName || newName === name) return;

    setPendingAction('rename');
    const result = await dispatch(
      updateChurchThunk({ id, data: { name: newName } }),
    );
    setPendingAction(null);
    if (updateChurchThunk.fulfilled.match(result)) {
      setIsEditOpen(false);
    }
  };

  const handleRefreshInvite = async () => {
    if (
      isBusy ||
      !window.confirm(
        'Обновить ссылку приглашения? Прежняя ссылка станет недействительной.',
      )
    )
      return;

    setPendingAction('refresh');
    const result = await dispatch(
      updateChurchThunk({ id, data: { refreshInviteToken: true } }),
    );
    setPendingAction(null);
    if (updateChurchThunk.fulfilled.match(result)) {
      setIsCopied(false);
    }
  };

  const handleDelete = async () => {
    if (
      isBusy ||
      !window.confirm(
        `Вы действительно хотите удалить церковь «${name}»? Это действие нельзя отменить.`,
      )
    )
      return;

    setPendingAction('delete');
    await dispatch(deleteChurchThunk(id));
    setPendingAction(null);
  };

  const copyInvite = async () => {
    if (!inviteUrl) return;

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setIsCopied(true);
    } catch {
      setIsCopied(false);
      toast.error('Не удалось скопировать ссылку. Попробуйте ещё раз.', {
        id: inviteId,
      });
    }
  };

  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center',
            isCurrent
              ? 'rounded-lg bg-primary/10 text-primary'
              : 'rounded-xl bg-muted-foreground/5 text-muted-foreground',
          )}
        >
          <ChurchIcon
            className={isCurrent ? 'size-6' : 'size-5'}
            strokeWidth={1.5}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="max-w-full truncate text-sm font-semibold">
              {name}
            </h3>
            {isCurrent && (
              <Badge className="bg-primary/10 px-2 text-[10px] text-primary">
                Текущая
              </Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {isCreator ? 'Вы создатель' : 'Участник'}
          </p>
        </div>

        {isCreator && (
          <Modal
            isOpen={isEditOpen}
            onOpenChange={(isOpen) => {
              if (pendingAction) return;
              if (isOpen) {
                if (isBusy) return;
                setInputName(name);
              }
              setIsEditOpen(isOpen);
            }}
            title="Редактировать церковь"
            trigger={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full text-muted-foreground -mr-2"
                title="Редактировать церковь"
                disabled={isBusy}
              >
                <PencilIcon />
              </Button>
            }
          >
            <form onSubmit={handleNameSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor={nameId}>Название церкви</Label>
                <Input
                  id={nameId}
                  name="churchName"
                  autoComplete="organization"
                  value={inputName}
                  onChange={(event) => setInputName(event.target.value)}
                  minLength={1}
                  maxLength={30}
                  required
                  disabled={isBusy}
                  className="h-10 bg-secondary dark:bg-input/30"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isBusy}
                  onClick={() => setIsEditOpen(false)}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isBusy || !inputName.trim() || inputName.trim() === name
                  }
                >
                  {pendingAction === 'rename' && <Spinner />}
                  Сохранить
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {!isCurrent && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground"
            onClick={onSwitch}
            disabled={isBusy || isSwitching}
          >
            {isSwitching ? <Spinner /> : <ArrowRightLeftIcon />}
          </Button>
        )}
      </div>

      {isCreator && inviteUrl && (
        <>
          <Label
            htmlFor={inviteId}
            className="mt-4 mb-2 text-xs font-normal text-muted-foreground"
          >
            Ссылка приглашения
          </Label>
          <div className="flex items-center gap-2 rounded-lg bg-muted-foreground/5 pr-1 pl-3">
            <LinkIcon size={15} className="shrink-0 text-muted-foreground" />
            <Input
              id={inviteId}
              value={inviteUrl}
              title="Ссылка приглашения"
              readOnly
              disabled
              className="h-10 flex-1 truncate bg-transparent px-0 text-xs text-muted-foreground! shadow-none md:text-xs dark:bg-transparent border-0 opacity-100!"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              onClick={copyInvite}
              disabled={isBusy}
            >
              {isCopied ? (
                <CheckIcon className="text-green-600 dark:text-green-400" />
              ) : (
                <CopyIcon />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground -ml-2"
              title="Обновить ссылку приглашения"
              disabled={isBusy}
              onClick={handleRefreshInvite}
            >
              {pendingAction === 'refresh' ? <Spinner /> : <RefreshCwIcon />}
            </Button>
          </div>
        </>
      )}

      {isCreator && (
        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs font-normal text-muted-foreground hover:bg-destructive/5 hover:text-destructive dark:hover:bg-destructive/10"
            disabled={isBusy}
            onClick={handleDelete}
          >
            {pendingAction === 'delete' && <Spinner />}
            Удалить
          </Button>
        </div>
      )}
    </li>
  );
}
