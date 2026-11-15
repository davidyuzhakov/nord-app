import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Program } from '@/models/Program';
import type { ChurchSong, LibrarySong, SongCatalog } from '@/models/Song';
import { useAppDispatch } from '@/store/hooks';
import {
  fetchPrograms,
  insertAddedSong,
  updateProgramThunk,
} from '@/store/reducers/programSlice';
import {
  addCatalogSongThunk,
  deleteSongThunk,
} from '@/store/reducers/songSlice';
import {
  CheckIcon,
  GaugeIcon,
  ListPlusIcon,
  Music2Icon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChurchSongActionsProps {
  song: ChurchSong;
  programs: Program[];
  disabled: boolean;
}

function ProgramMenuItems({
  song,
  programs,
  disabled,
}: ChurchSongActionsProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const addSongToProgram = (program: Program) => {
    const songIds = program.songs.map((item) => item.songId);
    if (disabled || songIds.includes(song.id)) return;
    dispatch(
      updateProgramThunk({
        id: program.id,
        data: { songsId: [...songIds, song.id] },
      }),
    );
  };

  return (
    <>
      {disabled && programs.length === 0 && (
        <DropdownMenuItem disabled>Загрузка программ…</DropdownMenuItem>
      )}
      {programs.map((program) => {
        const containsSong = program.songs.some(
          (item) => item.songId === song.id,
        );
        return (
          <DropdownMenuItem
            key={program.id}
            disabled={disabled || containsSong}
            onSelect={() => addSongToProgram(program)}
            className="py-2.5"
          >
            <span className="max-w-60 truncate">{program.name}</span>
            {containsSong && <CheckIcon className="ml-auto" />}
          </DropdownMenuItem>
        );
      })}
      <DropdownMenuItem
        disabled={disabled}
        onSelect={() => {
          dispatch(insertAddedSong(song));
          navigate('/program/create');
        }}
        className="text-primary focus:text-primary py-2.5"
      >
        <PlusIcon />
        Новая программа
      </DropdownMenuItem>
    </>
  );
}

function ChurchSongActions({
  song,
  programs,
  disabled,
}: ChurchSongActionsProps) {
  const dispatch = useAppDispatch();

  const deleteFromChurch = () => {
    if (
      window.confirm(
        `Удалить «${song.name}» из церковной базы и всех программ этой церкви?`,
      )
    ) {
      dispatch(deleteSongThunk({ catalog: 'church', id: song.id }));
    }
  };

  return (
    <>
      {song.sourceSongId !== null && (
        <Button
          type="button"
          variant="secondary"
          size="icon"
          disabled={disabled}
          className="rounded-full text-destructive"
          aria-label="Удалить из церковной базы"
          onClick={deleteFromChurch}
        >
          <Trash2Icon />
        </Button>
      )}
      <DropdownMenu
        onOpenChange={(open) => {
          if (open) dispatch(fetchPrograms({ preferCached: true }));
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            disabled={disabled}
            className="rounded-full shadow-xs"
            aria-label="Добавить в программу"
          >
            <ListPlusIcon className="text-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="bottom"
          align="end"
          className="max-h-72 overflow-y-auto"
        >
          <ProgramMenuItems
            song={song}
            programs={programs}
            disabled={disabled}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

interface SongLibraryRowProps {
  song: LibrarySong;
  catalog: SongCatalog;
  programs: Program[];
  programsLoading: boolean;
  mutating: boolean;
}

export function SongLibraryRow({
  song,
  catalog,
  programs,
  programsLoading,
  mutating,
}: SongLibraryRowProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isAdded = 'churchSongId' in song && song.churchSongId !== null;

  return (
    <div className="py-3 border-b border-border/60 px-1 flex items-center justify-between gap-2">
      <button
        type="button"
        onClick={() => navigate(`/song/${song.id}?catalog=${catalog}`)}
        className="min-w-0 flex-1 space-y-1 text-left select-none"
      >
        <h4 className="font-semibold truncate">{song.name}</h4>
        <div className="flex gap-3">
          <span className="text-sm font-semibold px-2 py-0.5 rounded-md text-primary bg-primary/10 flex gap-1 items-center">
            <Music2Icon size={15} />
            {song.key}
          </span>
          <span className="text-sm font-semibold px-2 py-0.5 rounded-md text-third bg-third/15 flex gap-1 items-center">
            <GaugeIcon size={15} />
            {song.bpm}
          </span>
        </div>
      </button>
      <div className="flex shrink-0 gap-1">
        {catalog === 'general' && (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="rounded-full shadow-xs disabled:opacity-100 text-foreground"
            disabled={mutating || isAdded}
            onClick={() => dispatch(addCatalogSongThunk(song.id))}
          >
            {isAdded ? <CheckIcon /> : <PlusIcon />}
          </Button>
        )}
        {catalog === 'church' && 'sourceSongId' in song && (
          <ChurchSongActions
            song={song}
            programs={programs}
            disabled={mutating || programsLoading}
          />
        )}
      </div>
    </div>
  );
}
