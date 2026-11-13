import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { KeyType, Song, SongStructureItem } from '@/models/Song';
import type { ProgramSong } from '@/models/Program';
import { useEffect, useState, type SetStateAction } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import { Tonality } from '@/components/Tonality';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Structure } from '@/components/Structure';
import { useAppDispatch } from '@/store/hooks';
import {
  createSongThunk,
  deleteSongThunk,
  fetchSong,
  updateSongThunk,
} from '@/store/reducers/songSlice';
import {
  fetchProgramSong,
  updateProgramSongThunk,
} from '@/store/reducers/programSlice';
import { transposeSongText } from '@/utils/transposeSong';
import { useGoBack } from '@/hooks/useGoBack';
import { Loading } from '@/components/Loading';
import { toast } from 'sonner';

interface FormState {
  name: string;
  bpm: number;
  text: string;
  audio: string;
  danceVideo: string;
}

interface EditingSong {
  song: Song;
  programSong?: ProgramSong;
}

const EMPTY_FORM_VALUES: FormState = {
  name: '',
  bpm: 0,
  text: '',
  audio: '',
  danceVideo: '',
};

export default function MutationSongPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const programId = params.has('programId')
    ? Number(params.get('programId'))
    : undefined;
  const goBack = useGoBack();
  const isEdit = Boolean(id);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [editingSong, setEditingSong] = useState<EditingSong | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [droppedItems, setDroppedItems] = useState<SongStructureItem[]>([]);
  const [songKey, setSongKey] = useState<KeyType>('C');
  const {
    register,
    reset,
    handleSubmit,
    getValues,
    setValue,
    formState: { isSubmitting },
  } = useForm<FormState>({
    defaultValues: EMPTY_FORM_VALUES,
  });

  useEffect(() => {
    let active = true;
    setEditingSong(null);
    setLoadFailed(false);

    if (!id) {
      reset(EMPTY_FORM_VALUES);
      setSongKey('C');
      setDroppedItems([]);
      return;
    }

    const load = async () => {
      try {
        const programSong =
          programId !== undefined
            ? await dispatch(
                fetchProgramSong({ programId, songId: Number(id) }),
              ).unwrap()
            : undefined;
        const song = programSong
          ? programSong.song
          : await dispatch(fetchSong(Number(id))).unwrap();

        if (!active) return;

        const key = programSong?.key ?? song.key;
        reset({
          name: song.name,
          bpm: song.bpm,
          text: transposeSongText(song.text, song.key, key),
          audio: song.audio ?? '',
          danceVideo: song.danceVideo ?? '',
        });

        setSongKey(key);
        setDroppedItems(song.structure ?? []);
        setEditingSong({ song, programSong });
      } catch (error) {
        if (!active) return;
        console.log(error);
        setLoadFailed(true);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [id, programId, dispatch, reset]);

  if (isEdit && loadFailed)
    return (
      <p className="text-center text-muted-foreground text-lg py-2">
        Не удалось загрузить хвалу
      </p>
    );

  if (
    isEdit &&
    (!editingSong ||
      editingSong.song.id !== Number(id) ||
      editingSong.programSong?.programId !== programId)
  )
    return <Loading />;

  const handleKeyChange = (value: SetStateAction<KeyType>) => {
    const key = typeof value === 'function' ? value(songKey) : value;

    if (editingSong?.programSong) {
      setValue('text', transposeSongText(getValues('text'), songKey, key), {
        shouldDirty: true,
      });
    }

    setSongKey(key);
  };

  const onSubmit: SubmitHandler<FormState> = async (data) => {
    const songData = {
      ...data,
      key: songKey,
      bpm: Number(data.bpm),
      structure: droppedItems,
      danceVideo:
        data.danceVideo.trim().length > 0 ? data.danceVideo : undefined,
      audio: data.audio.trim().length > 0 ? data.audio : undefined,
    };

    try {
      if (!isEdit) {
        await dispatch(createSongThunk(songData)).unwrap();
        navigate('/songs');
        return;
      }

      if (!editingSong) return;

      const { song, programSong } = editingSong;
      let text = data.text;

      if (programSong) {
        const transposedText = transposeSongText(song.text, song.key, songKey);
        text =
          data.text === transposedText
            ? song.text
            : transposeSongText(data.text, songKey, song.key);
      }

      await dispatch(
        updateSongThunk({
          id: song.id,
          data: {
            ...songData,
            key: programSong ? song.key : songKey,
            text,
          },
        }),
      ).unwrap();

      if (programSong && songKey !== (programSong.key ?? song.key)) {
        await dispatch(
          updateProgramSongThunk({
            programId: programSong.programId,
            songId: song.id,
            data: { key: songKey },
          }),
        ).unwrap();
      }

      goBack();
    } catch (error) {
      console.log(error);
      toast.error(
        isEdit
          ? 'Не удалось обновить хвалу. Попробуйте позже'
          : 'Не удалось создать хвалу. Попробуйте позже',
      );
    }
  };

  const handleDelete = () => {
    if (window.confirm('Вы действительно хотите удалить хвалу?')) {
      if (id) {
        dispatch(deleteSongThunk(Number(id)));
      }
      navigate('/songs');
    }
  };

  return (
    <div className="space-y-4 pb-22 pt-2 overflow-hidden">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <Label className="text-lg font-medium" htmlFor="name">
            Название
          </Label>
          <Input
            {...register('name', { required: true })}
            id="name"
            className="bg-muted px-4 py-6"
            placeholder="Введите название"
          />
        </div>
        <div className="space-y-3">
          <div className="flex gap-2 justify-between items-center">
            <Label className="text-lg font-medium leading-none">
              Структура
            </Label>
            {droppedItems.length > 1 && (
              <Button
                onClick={() => setDroppedItems([])}
                type="button"
                size={'sm'}
                variant={'outline'}
              >
                Очистить
              </Button>
            )}
          </div>
          <Structure
            droppedItems={droppedItems}
            setDroppedItems={setDroppedItems}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-primary text-lg font-semibold leading-none">
              KEY
            </Label>
            <div className="flex gap-2">
              <Tonality currentKey={songKey} setCurrentKey={handleKeyChange} />
              <Button
                onClick={() => {
                  if (songKey.includes('m')) {
                    handleKeyChange(songKey.replace('m', '') as KeyType);
                  } else {
                    handleKeyChange(`${songKey}m` as KeyType);
                  }
                }}
                className={`${
                  songKey.includes('m')
                    ? 'bg-primary dark:bg-primary text-white border-primary'
                    : ''
                }`}
                type="button"
                variant={'outline'}
              >
                minor
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-third text-lg font-semibold leading-none">
              BPM
            </Label>
            <Input {...register('bpm')} type="number" className="w-15" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-lg font-medium" htmlFor="text">
            Текст
          </Label>
          <Textarea
            id="text"
            {...register('text', { required: true })}
            placeholder="Введите текст песни с аккордами"
            className="text-textarea resize-none px-2 py-3.5 text-[14px] font-medium focus-visible:ring-0 text-pretty border border-border shadow-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center gap-2">
            <Label className="font-medium text-base" htmlFor="youtube">
              Юльтон
            </Label>
            <Input
              {...register('danceVideo')}
              id="youtube"
              className="max-w-75 h-auto bg-muted px-4 py-2"
              placeholder="Введите ссылку"
            />
          </div>
          <div className="flex justify-between items-center gap-2">
            <Label
              className="font-medium text-base leading-none mr-4"
              htmlFor="audio"
            >
              Аудио
            </Label>
            <div className="max-w-75 w-full flex items-center gap-2">
              <Input
                id="audio"
                className="flex-1 w-full h-auto bg-muted px-4 py-2"
                {...register('audio')}
                placeholder="Введите ссылку"
              />
              {/* <Button
                className="shadow-none"
                type="button"
                variant={'outline'}
                size={'icon-lg'}
              >
                <Paperclip />
              </Button> */}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 justify-end">
          {isEdit && (
            <Button
              type="button"
              disabled={isSubmitting}
              variant="destructive"
              onClick={handleDelete}
              className="capitalize text-base py-5"
            >
              удалить
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary/15 text-primary capitalize text-base py-5"
          >
            сохранить
          </Button>
        </div>
      </form>
    </div>
  );
}
