import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { Song } from '@/components/Song';
import { Button } from '@/components/ui/button';
import { useGoBack } from '@/hooks/useGoBack';
import { useSongDetail } from '@/hooks/useSongDetail';
import { useAppSelector } from '@/store/hooks';
import {
  ChevronLeft,
  Headphones,
  PencilIcon,
  PersonStanding,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { canManageCatalog, getSongCatalog } from '@/utils/songCatalog';

export default function SongDetailPage() {
  const { id } = useParams();
  const songId = Number(id);
  const [params] = useSearchParams();
  const catalog = getSongCatalog(params);
  const user = useAppSelector((state) => state.user.current);
  const canEdit = catalog === 'church' || canManageCatalog(user);
  const programId = params.has('programId')
    ? Number(params.get('programId'))
    : undefined;
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [isCopied, setIsCopied] = useState(false);
  // const [isSharing, setIsSharing] = useState(false);
  // const sharingRef = useRef(false);
  const detail = useSongDetail(songId, catalog, programId);

  useEffect(() => {
    if (!isCopied) return;

    const timeoutId = setTimeout(() => setIsCopied(false), 1500);

    return () => clearTimeout(timeoutId);
  }, [isCopied]);

  if (detail.status === 'loading') return <Loading />;
  if (detail.status === 'unavailable') {
    return (
      <div className="mx-auto pt-10 text-center">
        <h5 className="font-medium text-xl -mb-6">Хвала не найдена</h5>
        <img
          src="/song-not-found.png"
          alt="песня не найдена"
          className="max-w-[300px] mx-auto"
        />
      </div>
    );
  }

  const { song: current, programSong, isArchived } = detail;

  // const shareSong = async () => {
  //   if (sharingRef.current) return;

  //   sharingRef.current = true;
  //   setIsSharing(true);
  //   const url = window.location.href;

  //   try {
  //     if (navigator.share) {
  //       await navigator.share({ title: current.name, url });
  //     } else {
  //       await navigator.clipboard.writeText(`${current.name}\n${url}`);
  //       setIsCopied(true);
  //     }
  //   } catch (error) {
  //     if (error instanceof DOMException && error.name === 'AbortError') return;
  //     toast.error('Не удалось поделиться песней. Попробуйте ещё раз');
  //   } finally {
  //     sharingRef.current = false;
  //     setIsSharing(false);
  //   }
  // };

  return (
    <div className="-mx-3 space-y-3 pb-16">
      <Header structure={current.structure} songId={current.id}>
        <div className="flex items-center gap-1 truncate">
          <button
            onClick={goBack}
            className="shrink-0 p-0 flex items-center justify-center rounded-full size-10 bg-secondary/20 backdrop-blur-xs drop-shadow-xs border"
            type="button"
          >
            <ChevronLeft />
          </button>
          <h2 className="text-[22px] font-semibold truncate">{current.name}</h2>
        </div>
        {canEdit && (
          <button
            onClick={() =>
              navigate(
                `/song/${current.id}/edit?catalog=${catalog}${programId !== undefined ? `&programId=${programId}` : ''}`,
              )
            }
            type="button"
            className="p-2 rounded-md bg-secondary/20 backdrop-blur-xs drop-shadow-xs border"
          >
            <PencilIcon size={20} className="" />
          </button>
        )}
      </Header>
      <Song
        key={`${catalog}-${current.id}-${programId ?? 'catalog'}`}
        isEdit={canEdit && !isArchived}
        catalog={catalog}
        song={current}
        programSong={programSong}
      />
      <div className="px-3 pb-2 grid grid-cols-2 gap-2">
        {current.audio && (
          <Button
            type="button"
            onClick={() =>
              window.open(current.audio!, '_blank', 'noopener,noreferrer')
            }
            className="w-full bg-primary/15 text-primary border-none cursor-pointer"
          >
            Слушать аудио <Headphones />
          </Button>
        )}
        {current.danceVideo && (
          <Button
            onClick={() =>
              window.open(current.danceVideo!, '_blank', 'noopener,noreferrer')
            }
            type="button"
            className="w-full text-base bg-third/15 text-third"
          >
            Юльтон <PersonStanding />
          </Button>
        )}
        {/* <Button
          type="button"
          variant="secondary"
          onClick={shareSong}
          disabled={isSharing}
          className="text-foreground bg-foreground/5"
        >
          {isCopied ? 'Скопировано' : 'Поделиться'} <Share2 />
        </Button> */}
      </div>
    </div>
  );
}
