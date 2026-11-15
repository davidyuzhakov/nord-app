import { useEffect } from 'react';
import type { SongCatalog } from '@/models/Song';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSongs, selectSongList } from '@/store/reducers/songSlice';

export function useSongList(
  catalog: SongCatalog,
  searchText: string,
  { enabled = true, visitId }: { enabled?: boolean; visitId?: string } = {},
) {
  const dispatch = useAppDispatch();
  const churchId = useAppSelector(
    (state) => state.user.current?.activeChurchId,
  );
  const search = searchText.trim() || undefined;
  const list = useAppSelector((state) =>
    selectSongList(state.song, { catalog, search }),
  );
  const missing = !list;

  useEffect(() => {
    if (enabled && churchId) dispatch(fetchSongs({ catalog, search, visitId }));
  }, [catalog, search, churchId, enabled, visitId, missing, dispatch]);

  return {
    songs: list?.items ?? [],
    loading: missing || Boolean(list.requestId && !list.fetchedAt),
  };
}
