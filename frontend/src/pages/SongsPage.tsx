import { SongLibraryRow } from '@/components/SongLibraryRow';
import { SongLibraryToolbar } from '@/components/SongLibraryToolbar';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { useAppSelector } from '@/store/hooks';
import { useSongList } from '@/hooks/useSongList';
import { canManageCatalog, getSongCatalog } from '@/utils/songCatalog';
import { nanoid } from '@reduxjs/toolkit';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function SongListSkeleton() {
  return (
    <div>
      {Array.from({ length: 8 }, (_, index) => (
        <div
          className="p-3 flex justify-between items-center gap-2"
          key={index}
        >
          <div className="w-full space-y-2">
            <Skeleton className="w-4/5 h-5" />
            <div className="flex gap-3">
              <Skeleton className="w-15 h-5" />
              <Skeleton className="w-15 h-5" />
            </div>
          </div>
          <Skeleton className="size-8 rounded-full" />
        </div>
      ))}
    </div>
  );
}

const SongsPage = () => {
  const mutating = useAppSelector((state) => state.song.mutating);
  const { items: programs, loading: programsLoading } = useAppSelector(
    (state) => state.program,
  );
  const user = useAppSelector((state) => state.user.current);
  const [params, setParams] = useSearchParams();
  const catalog = getSongCatalog(params);
  const [search, setSearch] = useState('');
  const [visitId] = useState(() => nanoid());
  const debouncedSearch = useDebounce(search, 500);
  const waitingForSearch = search.trim() !== debouncedSearch.trim();
  const { songs, loading } = useSongList(catalog, debouncedSearch, {
    enabled: !waitingForSearch,
    visitId,
  });
  const navigate = useNavigate();
  const activePrograms = useMemo(
    () => programs.filter((program) => !program.isArchived),
    [programs],
  );
  const isLoading = loading || waitingForSearch;
  const hasSearch = Boolean(debouncedSearch.trim());
  const canCreate = catalog === 'church' || canManageCatalog(user);

  return (
    <div className="pt-28 pb-[130px] space-y-4">
      <SongLibraryToolbar
        catalog={catalog}
        search={search}
        disabled={mutating}
        canCreate={canCreate}
        onSearchChange={setSearch}
        onCatalogChange={(tab) =>
          setParams({ catalog: tab }, { replace: true })
        }
        onCreate={() => navigate(`/song/create?catalog=${catalog}`)}
      />
      {isLoading ? (
        <SongListSkeleton />
      ) : songs.length === 0 ? (
        <div className="mx-auto pt-10 text-center">
          <h5 className="font-medium text-xl -mb-6">
            {hasSearch ? 'Хвала не найдена' : 'Список пуст'}
          </h5>
          {catalog === 'church' && !hasSearch ? (
            <>
              <img
                src="/add-song.png"
                alt="не найдено"
                className="max-w-[300px] mx-auto mt-5"
              />
              <p className="text-sm text-muted-foreground">
                Откройте вкладку «Общая» и нажмите «+» рядом с нужной хвалой,
                чтобы добавить её в церковную библиотеку.
              </p>
            </>
          ) : (
            <img
              src="/song-not-found.png"
              alt="не найдено"
              className="max-w-[300px] mx-auto"
            />
          )}
        </div>
      ) : (
        <div>
          {songs.map((song) => (
            <SongLibraryRow
              key={`${catalog}-${song.id}`}
              song={song}
              catalog={catalog}
              programs={activePrograms}
              programsLoading={programsLoading}
              mutating={mutating}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SongsPage;
