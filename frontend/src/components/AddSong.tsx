import { PlusIcon, SearchIcon, XIcon } from 'lucide-react';
import { Modal } from './Modal';
import { Input } from './ui/input';
import { useEffect, useState } from 'react';
import { Checkbox } from './ui/checkbox';
import { fetchSongs } from '@/store/reducers/songSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useDebounce } from '@/hooks/useDebounce';
import type { Song } from '@/models/Song';
import { useNavigate } from 'react-router-dom';

interface AddSongProps {
  selectedIds: number[];
  onToggleSong: (isChecked: boolean, checkedSong: Song) => void;
}

export function AddSong({ onToggleSong, selectedIds }: AddSongProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();
  const debouncedSearch = useDebounce(search, 500);
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.song);

  useEffect(() => {
    dispatch(
      fetchSongs({
        search: debouncedSearch.trim().length > 0 ? debouncedSearch : undefined,
      }),
    );
  }, [debouncedSearch, dispatch]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title="Выберите хвалы"
      trigger={
        <button type="button">
          <span className="flex items-center gap-1 justify-center text-primary font-semibold">
            <PlusIcon size={17} className="stroke-3" /> Новая хвала
          </span>
        </button>
      }
    >
      <div className="relative">
        <SearchIcon
          size={20}
          className="absolute top-1/2 -translate-y-1/2 left-3 stroke-muted-foreground"
        />
        <Input
          id="song"
          aria-label="Поиск хвалы"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-8 py-4 focus-visible:ring-0 border-none rounded-full focus:border-primary focus:border h-10 bg-secondary dark:bg-input/30"
          placeholder="Введите название хвалы"
        />
        {search.length > 0 && (
          <XIcon
            onClick={() => setSearch('')}
            size={20}
            className="absolute top-1/2 right-0 -translate-1/2"
          />
        )}
      </div>
      <ul className="relative max-h-80 rounded-md overflow-y-auto px-2 pb-2 mask-[linear-gradient(to_bottom,black_90%,transparent_100%)]">
        {items.map((song) => (
          <li
            className="flex items-center gap-1.5 border-b border-accent py-2"
            key={song.id}
          >
            <span className="truncate font-medium">{song.name}</span>
            <span className="text-[14px] flex items-center justify-center font-semibold px-2 py-0.5 bg-primary/10 rounded-md text-primary">
              {song.key}
            </span>
            <span className="text-[14px] font-semibold px-2 py-0.5 rounded-md bg-third/10 text-third">
              {song.bpm}
            </span>
            <Checkbox
              className="ml-auto size-6"
              checked={selectedIds.includes(song.id)}
              onCheckedChange={(value) => onToggleSong(Boolean(value), song)}
            />
          </li>
        ))}
        <button
          className="flex items-center w-full gap-1 justify-center text-primary font-semibold py-2"
          type="button"
          onClick={() => navigate('/song/create')}
        >
          <PlusIcon size={17} className="stroke-3" /> Создать хвалу
        </button>
      </ul>
    </Modal>
  );
}
