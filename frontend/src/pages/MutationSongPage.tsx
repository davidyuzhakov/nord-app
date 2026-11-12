import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { KeyType, SongStructureItem } from '@/models/Song';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import { Tonality } from '@/components/Tonality';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Structure } from '@/components/Structure';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  createSongThunk,
  deleteSongThunk,
  fetchSong,
  updateSongThunk,
} from '@/store/reducers/songSlice';
import { useGoBack } from '@/hooks/useGoBack';
import { Loading } from '@/components/Loading';

interface FormState {
  name: string;
  bpm: number;
  text: string;
  audio: string;
  danceVideo: string;
}

export default function MutationSongPage() {
  const { id } = useParams();
  const goBack = useGoBack();
  const isEdit = Boolean(id);
  const dispatch = useAppDispatch();
  const { current, loading } = useAppSelector((state) => state.song);
  const navigate = useNavigate();

  const [droppedItems, setDroppedItems] = useState<SongStructureItem[]>(
    current?.structure || [],
  );
  const [songKey, setSongKey] = useState(current?.key || 'C');
  const { register, reset, handleSubmit } = useForm<FormState>({
    defaultValues: {
      name: current?.name ?? '',
      bpm: current?.bpm ?? 0,
      text: current?.text ?? '',
    },
  });

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      const song = await dispatch(fetchSong(Number(id))).unwrap();

      reset({
        name: song.name,
        bpm: song.bpm,
        text: song.text,
        audio: song.audio ?? '',
        danceVideo: song.danceVideo ?? '',
      });

      setSongKey(song.key);
      setDroppedItems(song.structure ?? []);
    };

    load();
  }, [id, dispatch, reset]);

  if (isEdit && !current && loading) return <Loading />;

  if (isEdit && !loading && !current)
    return (
      <p className="text-center text-muted-foreground text-lg py-2">
        Песня не найдена
      </p>
    );

  const onSubmit: SubmitHandler<FormState> = async (data) => {
    if (!isEdit) {
      try {
        await dispatch(
          createSongThunk({
            ...data,
            key: songKey,
            bpm: Number(data.bpm),
            structure: droppedItems,
            danceVideo:
              data.danceVideo.trim().length > 0 ? data.danceVideo : undefined,
            audio: data.audio.trim().length > 0 ? data.audio : undefined,
          }),
        ).unwrap();
        navigate('/songs');
      } catch (error) {
        console.log(error);
        alert('Не удалось создать хвалу. Попробуйте позже');
      }
    } else {
      try {
        await dispatch(
          updateSongThunk({
            id: Number(id),
            data: {
              ...data,
              key: songKey,
              bpm: Number(data.bpm),
              structure: droppedItems,
              danceVideo:
                data.danceVideo.trim().length > 0 ? data.danceVideo : undefined,
              audio: data.audio.trim().length > 0 ? data.audio : undefined,
            },
          }),
        ).unwrap();
        goBack();
      } catch (error) {
        console.log(error);
        alert('Не удалось обновить хвалу. Попробуйте позже');
      }
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
              <Tonality currentKey={songKey} setCurrentKey={setSongKey} />
              <Button
                onClick={() => {
                  if (songKey.includes('m')) {
                    setSongKey(songKey.replace('m', '') as KeyType);
                  } else {
                    setSongKey(`${songKey}m` as KeyType);
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
              disabled={loading}
              variant="destructive"
              onClick={handleDelete}
              className="capitalize text-base py-5"
            >
              удалить
            </Button>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="bg-primary/15 text-primary capitalize text-base py-5"
          >
            сохранить
          </Button>
        </div>
      </form>
    </div>
  );
}
