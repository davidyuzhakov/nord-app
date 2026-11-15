import { useEffect } from 'react';
import type { ProgramSong } from '@/models/Program';
import type { Song, SongCatalog } from '@/models/Song';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProgram } from '@/store/reducers/programSlice';
import { fetchSong } from '@/store/reducers/songSlice';

type SongDetail =
  | { status: 'loading' }
  | { status: 'unavailable' }
  | {
      status: 'ready';
      song: Song;
      programSong?: ProgramSong;
      isArchived?: boolean;
    };

export function useSongDetail(
  songId: number,
  catalog: SongCatalog,
  programId?: number,
): SongDetail {
  const dispatch = useAppDispatch();
  const churchId = useAppSelector(
    (state) => state.user.current?.activeChurchId,
  );
  const {
    current: song,
    failedSong,
    currentCatalog,
  } = useAppSelector((state) => state.song);
  const { current: program, failedProgramId } = useAppSelector(
    (state) => state.program,
  );
  const fromProgram = programId !== undefined;
  const requestId = programId ?? songId;

  useEffect(() => {
    const request = fromProgram
      ? dispatch(fetchProgram(requestId))
      : dispatch(fetchSong({ id: requestId, catalog }));
    return () => request.abort();
  }, [catalog, churchId, dispatch, fromProgram, requestId]);

  if (fromProgram) {
    if (Object.is(failedProgramId, programId)) return { status: 'unavailable' };
    if (program?.id !== programId) return { status: 'loading' };
    const programSong = program.songs.find((item) => item.songId === songId);
    if (!programSong) return { status: 'unavailable' };
    return {
      status: 'ready',
      song: programSong.song,
      programSong,
      isArchived: program.isArchived,
    };
  }

  if (failedSong?.catalog === catalog && Object.is(failedSong.id, songId))
    return { status: 'unavailable' };
  if (currentCatalog !== catalog || song?.id !== songId)
    return { status: 'loading' };
  return { status: 'ready', song };
}
