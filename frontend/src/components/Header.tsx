import type { SongStructureItem } from '@/models/Song';
import { getStructureBg } from '@/utils/getStructureBg';
import { useRef } from 'react';

interface HeaderProps {
  children: React.ReactNode;
  structure: SongStructureItem[] | null | undefined;
  songId: number;
}

export function Header({ children, structure, songId }: HeaderProps) {
  const headerRef = useRef<HTMLDivElement | null>(null);

  const scrollToSection = (el: SongStructureItem, songId: number) => {
    const hasNumber = /^\d/.test(el.text);
    const id = `${songId}-${hasNumber ? el.text[0] + el.title : el.title}`;

    const target = document.getElementById(id);
    if (!target) return;

    const headerHeight = headerRef.current?.offsetHeight || 0;
    const y =
      target.getBoundingClientRect().top +
      window.pageYOffset -
      headerHeight -
      13;

    window.scrollTo({
      top: y,
      behavior: 'smooth',
    });
  };

  return (
    <div
      ref={headerRef}
      className="p-2 space-y-2 shrink-0 rounded-b-xl shadow-xs sticky top-0 z-10 bg-background/70 backdrop-blur-xs dark:bg-secondary/50"
    >
      <div className="flex justify-between items-center gap-1">{children}</div>
      {structure && structure.length > 0 && (
        <div
          className={`grid ${structure.length > 5 ? 'grid-cols-[repeat(auto-fit,minmax(50px,1fr))]' : 'grid-cols-[repeat(auto-fit,minmax(50px,60px))]'} gap-0.5`}
        >
          {structure.map((el, i) => (
            <div
              key={i}
              onClick={() => scrollToSection(el, songId)}
              className={`relative py-1.5 px-1 flex items-center justify-center text-white dark:text-background/70 rounded-md ${getStructureBg(
                el.text.replace(/\d/g, '').toLowerCase(),
              )}`}
            >
              <span className="uppercase text-center text-lg font-semibold">
                {el.text}
              </span>
              {el.amount > 1 && (
                <span className="absolute font-semibold top-0.5 right-1 text-xs translate-x-1/2 -translate-y-1/2 text-foreground z-10 text-[12px] bg-background dark:bg-muted px-1 border rounded-full">
                  {el.amount}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
