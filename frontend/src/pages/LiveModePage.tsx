import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Song } from '@/components/Song';
import { useEffect, useState } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Navigate } from 'react-router-dom';
import { Loading } from '@/components/Loading';
import { Header } from '@/components/Header';
import { fetchPrograms } from '@/store/reducers/programSlice';

const styles = [
  'text-primary bg-primary/25',
  'text-red-400 bg-red-400/25',
  'text-green-400 bg-green-400/25',
  'text-gray-400 bg-gray-400/25',
  'text-orange-400 bg-orange-400/25',
];

const LiveModePage = () => {
  const { items, loading } = useAppSelector((state) => state.program);
  const churchId = useAppSelector(
    (state) => state.user.current?.activeChurchId,
  );
  const dispatch = useAppDispatch();
  const programs = items.filter((item) => !item.isArchived);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(programs.length === 1 ? false : true);
  const [currentProgramId, setCurrentProgramId] = useState<number | null>(null);
  const currentProgram =
    programs.find((program) => program.id === currentProgramId) ?? programs[0];
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    setLoaded(false);
    const request = dispatch(fetchPrograms());
    request.then(() => {
      if (active) setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [dispatch, churchId]);

  if (loading || !loaded) return <Loading />;

  if (programs.length === 0 || !currentProgram) {
    return <Navigate to={'/'} />;
  }

  const totalSlides = currentProgram.songs.length;
  const activeSong =
    currentProgram.songs[activeIndex] ?? currentProgram.songs[0];

  const handleSlideChange = (swiper: SwiperType) => {
    setActiveIndex(swiper.activeIndex);
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <div className="-mx-3 relative pb-0">
        {activeSong ? (
          <>
            <Header
              songId={activeSong.songId}
              structure={activeSong.song.structure}
            >
              <h2 className="text-[22px] font-semibold truncate">
                {activeSong.song.name}
              </h2>
              <div className="flex gap-1 z-10">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    className={`size-3 rounded-full transition-all ${
                      index === activeIndex
                        ? 'bg-primary'
                        : 'bg-background dark:bg-secondary border border-gray-400'
                    }`}
                  />
                ))}
              </div>
            </Header>

            <Swiper
              key={currentProgram.id}
              spaceBetween={50}
              slidesPerView={1}
              autoHeight
              onSlideChange={handleSlideChange}
            >
              {currentProgram.songs.map((song) => (
                <SwiperSlide key={song.id} className="pb-[74px] pt-3">
                  <Song song={song.song} programSong={song} />
                </SwiperSlide>
              ))}
            </Swiper>
          </>
        ) : (
          <p className="text-muted-foreground text-center mt-5">Нет хвал</p>
        )}
      </div>
      <Drawer open={isOpen} onClose={() => setIsOpen(false)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-lg mb-0">
              Выберите программу для Live режима
            </DrawerTitle>
          </DrawerHeader>
          <div
            className={`${programs.length > 0 ? 'grid grid-cols-2' : ''} items-center gap-3 px-2 pb-5`}
          >
            {programs.map((program, i) => (
              <Button
                onClick={() => {
                  setCurrentProgramId(program.id);
                  setActiveIndex(0);
                  setIsOpen(false);
                }}
                className={`w-full ${styles[i] ?? 'bg-primary/25 text-primary'} py-7 text-lg font-medium`}
                key={program.id}
              >
                <span className="truncate w-full">{program.name}</span>
              </Button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default LiveModePage;
