import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { SongCatalog } from '@/models/Song';
import { PlusIcon, SearchIcon, XIcon } from 'lucide-react';

const catalogTabs = [
  { catalog: 'church', label: 'Церковная' },
  { catalog: 'general', label: 'Общая' },
] as const;

interface SongLibraryToolbarProps {
  catalog: SongCatalog;
  search: string;
  disabled: boolean;
  canCreate: boolean;
  onSearchChange: (search: string) => void;
  onCatalogChange: (catalog: SongCatalog) => void;
  onCreate: () => void;
}

export function SongLibraryToolbar({
  catalog,
  search,
  disabled,
  canCreate,
  onSearchChange,
  onCatalogChange,
  onCreate,
}: SongLibraryToolbarProps) {
  return (
    <div className="fixed top-4 right-3 left-3 max-w-[500px] mx-auto z-40 space-y-2">
      <div className="flex items-center gap-1">
        <div className="relative w-full">
          <SearchIcon className="absolute top-1/2 -translate-y-1/2 z-10 left-3 stroke-muted-foreground size-5" />
          <Input
            disabled={disabled}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="py-5 px-10 border-background/50 border-2 rounded-full bg-secondary/80 shadow-xs backdrop-blur-sm focus-visible:border-background/50 dark:border-muted/50"
            placeholder="Введите название хвалы..."
          />
          {search.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={disabled}
              onClick={() => onSearchChange('')}
              className="absolute top-1/2 right-1 -translate-y-1/2 rounded-full text-muted-foreground"
            >
              <XIcon />
            </Button>
          )}
        </div>
        {canCreate && (
          <Button
            onClick={onCreate}
            className="shrink-0 rounded-full size-10 bg-primary/20 text-primary shadow-xs backdrop-blur-xs hover:bg-primary/30"
            type="button"
            size="icon"
            disabled={disabled}
          >
            <PlusIcon className="size-6" />
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-1 border-background/50 border-2 rounded-full bg-secondary/80 shadow-xs backdrop-blur-sm dark:border-muted/50 p-0.5">
        {catalogTabs.map(({ catalog: tab, label }) => (
          <Button
            key={tab}
            type="button"
            variant="ghost"
            disabled={disabled}
            onClick={() => onCatalogChange(tab)}
            className={cn(
              'h-9 rounded-full text-sm text-muted-foreground sm:text-sm hover:bg-transparent',
              catalog === tab &&
                'bg-primary/20 text-primary shadow-xs hover:bg-primary/10! hover:text-primary!',
            )}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
