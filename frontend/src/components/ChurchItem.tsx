import { useId, useState } from 'react';
import {
  ArrowRightLeftIcon,
  CheckIcon,
  ChurchIcon,
  CopyIcon,
  LinkIcon,
  PencilIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface ChurchItemProps {
  name: string;
  isCurrent?: boolean;
  isCreator?: boolean;
  inviteUrl?: string;
  onEdit?: () => void;
}

export function ChurchItem({
  name,
  isCurrent = false,
  isCreator = false,
  inviteUrl,
  onEdit,
}: ChurchItemProps) {
  const inviteId = useId();
  const [isCopied, setIsCopied] = useState(false);

  const copyInvite = async () => {
    if (!inviteUrl) return;

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setIsCopied(true);
      toast.success('Ссылка приглашения скопирована', {
        id: inviteId,
        duration: 3000,
        onDismiss: () => setIsCopied(false),
        onAutoClose: () => setIsCopied(false),
      });
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
            aria-hidden="true"
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
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground -mr-2"
            aria-label={`Редактировать церковь ${name}`}
            title="Редактировать церковь"
            onClick={onEdit}
          >
            <PencilIcon aria-hidden="true" />
          </Button>
        )}

        {!isCurrent && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground"
            aria-label={`Переключиться в церковь ${name}`}
          >
            <ArrowRightLeftIcon aria-hidden="true" />
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
            <LinkIcon
              aria-hidden="true"
              size={15}
              className="shrink-0 text-muted-foreground"
            />
            <Input
              id={inviteId}
              aria-label={`Ссылка приглашения в церковь ${name}`}
              value={inviteUrl}
              title="Демонстрационная ссылка"
              readOnly
              disabled
              className="h-10 flex-1 truncate bg-transparent px-0 text-xs text-muted-foreground! shadow-none md:text-xs dark:bg-transparent border-0 opacity-100!"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              aria-label={
                isCopied
                  ? 'Ссылка приглашения скопирована'
                  : `Копировать приглашение в церковь ${name}`
              }
              onClick={copyInvite}
            >
              {isCopied ? (
                <CheckIcon
                  aria-hidden="true"
                  className="text-green-600 dark:text-green-400"
                />
              ) : (
                <CopyIcon aria-hidden="true" />
              )}
            </Button>
          </div>
        </>
      )}
    </li>
  );
}
