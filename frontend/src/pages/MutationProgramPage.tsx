import { AddSong } from '@/components/AddSong';
import { Loading } from '@/components/Loading';
import { SongItem } from '@/components/SongItem';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Song } from '@/models/Song';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  createProgramThunk,
  destroyAddedSong,
  fetchProgram,
  updateProgramThunk,
} from '@/store/reducers/programSlice';
import { getISOString } from '@/utils/date';
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarIcon, InfoIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function MutationProgramPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [songs, setSongs] = useState<Song[]>([]);
  const [date, setDate] = useState<Date | undefined>();
  const [name, setName] = useState('');
  const [loadedId, setLoadedId] = useState<number | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const churchId = useAppSelector(
    (state) => state.user.current?.activeChurchId,
  );
  const placeholder =
    date?.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
    }) ?? '';
  const { loading, addedSong } = useAppSelector((state) => state.program);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5,
    },
  });

  const sensors = useSensors(touchSensor, mouseSensor);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      setSongs((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!date) {
      toast.error('Выберите дату');
      return;
    }
    if (songs.length === 0) {
      toast.error('Добавьте хотя бы одну хвалу');
      return;
    }

    const nameProgram =
      name.trim().length > 0
        ? name.trim()
        : date.toLocaleDateString('ru-RU', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
          });

    if (isEdit) {
      try {
        await dispatch(
          updateProgramThunk({
            id: Number(id),
            data: {
              date: getISOString(date),
              songsId: songs.map((song) => song.id),
              name: nameProgram,
            },
          }),
        ).unwrap();
        navigate('/');
      } catch {
        return;
      }
    } else {
      try {
        await dispatch(
          createProgramThunk({
            date: getISOString(date),
            name: nameProgram,
            songsId: songs.map((song) => song.id),
          }),
        ).unwrap();
        navigate('/');
      } catch {
        return;
      }
    }
  };

  const onDelete = (id: number) => {
    if (window.confirm('Вы действительно хотите удалить эту хвалу?')) {
      setSongs((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const onToggleSong = (isChecked: boolean, checkedSong: Song) => {
    if (isChecked) {
      setSongs((prev) =>
        prev.some((song) => song.id === checkedSong.id)
          ? prev
          : [...prev, checkedSong],
      );
    } else {
      setSongs((prev) => prev.filter((s) => s.id !== checkedSong.id));
    }
  };

  useEffect(() => {
    if (!addedSong || isEdit) return;
    setSongs([addedSong]);
    dispatch(destroyAddedSong());
  }, [addedSong, dispatch, isEdit]);

  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    setLoadedId(null);
    setLoadFailed(false);
    const request = dispatch(fetchProgram(Number(id)));
    const load = async () => {
      const result = await request;
      if (!active) return;
      if (!fetchProgram.fulfilled.match(result)) {
        setLoadFailed(true);
        return;
      }
      const program = result.payload;
      setName(program.name);
      setSongs(
        program.songs.map((s) => ({ ...s.song, key: s.key ?? s.song.key })),
      );
      setDate(program.date ? new Date(program.date) : undefined);
      setLoadedId(program.id);
    };

    load();
    return () => {
      active = false;
      request.abort();
    };
  }, [id, dispatch, isEdit, churchId]);

  if (isEdit && loadedId !== Number(id) && !loadFailed) return <Loading />;

  if (isEdit && loadFailed) {
    return (
      <p className="text-center text-muted-foreground text-lg py-2">
        Программа не найдена
      </p>
    );
  }

  return (
    <form
      onSubmit={submitHandler}
      className="py-4 space-y-2 flex flex-col pb-20"
    >
      <div className="flex gap-2 m-0">
        <div className="flex-1 space-y-2">
          <Label className="text-base font-semibold" htmlFor="name">
            Название
          </Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-6 text-base mb-2 border-none bg-muted"
            id="name"
            placeholder={placeholder}
          />
        </div>
        <div className="shrink-0 space-y-2">
          <Label className="text-base font-semibold gap-0" htmlFor="date">
            Дата<span className="text-destructive">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                id="date-picker-range"
                className="justify-start font-normal h-12 rounded-md text-sm bg-muted dark:bg-input/30 border-none shadow-none"
              >
                <CalendarIcon />
                {date ? (
                  format(date, 'dd.MM.yyyy', { locale: ru })
                ) : (
                  <span className="text-muted-foreground">Выберите дату</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full rounded-md p-0" align="end">
              <Calendar
                className="p-2 w-full rounded-xl"
                locale={ru}
                mode="single"
                defaultMonth={date}
                selected={date}
                onSelect={setDate}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <p className="text-xs flex gap-1.5 text-muted-foreground mb-6">
        <InfoIcon size={15} /> Название формируется автоматически на основе даты
      </p>
      <Label className="text-lg font-semibold gap-0">
        Хвалы<span className="text-destructive">*</span>
      </Label>

      <div className="px-2 pb-4 space-y-3">
        <ul className="space-y-3 px-2">
          <DndContext
            modifiers={[restrictToVerticalAxis]}
            sensors={sensors}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={songs}>
              {songs.map((s) => (
                <SongItem
                  key={s.id}
                  isEdit={true}
                  item={s}
                  onDelete={onDelete}
                />
              ))}
            </SortableContext>
          </DndContext>
          <li className="text-center pt-1">
            <AddSong
              selectedIds={songs.map((s) => s.id)}
              onToggleSong={onToggleSong}
            />
          </li>
        </ul>
      </div>

      <Button
        disabled={loading}
        className="ml-auto bg-primary/15 text-primary"
        type="submit"
      >
        Сохранить
      </Button>
    </form>
  );
}
