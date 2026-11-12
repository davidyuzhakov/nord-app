import { HomeIcon, Music4Icon, RadioIcon, User2Icon } from 'lucide-react';
import type React from 'react';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface INavLink {
  title: string;
  to: string;
  icon: React.JSX.Element;
}

const navLink: INavLink[] = [
  {
    title: 'Главная',
    to: '/',
    icon: <HomeIcon size={23} className="stroke-inherit" />,
  },
  {
    title: 'Live Mode',
    to: '/live-mode',
    icon: <RadioIcon size={23} className="stroke-inherit" />,
  },
  {
    title: 'Хвалы',
    to: '/songs',
    icon: <Music4Icon size={23} className="stroke-inherit" />,
  },
  {
    title: 'Профиль',
    to: '/profile',
    icon: <User2Icon size={23} className="stroke-inherit" />,
  },
];

export function BottomBar() {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const activePath = pathname.startsWith('/song/')
    ? new URLSearchParams(search).has('programId')
      ? '/'
      : '/songs'
    : pathname;

  const handleNavigate = useCallback(
    (to: string) => {
      if (pathname !== to) navigate(to);
    },
    [navigate, pathname],
  );

  return (
    <ul
      className="
        max-w-md
        mx-auto
        test
        fixed bottom-3 left-2.5 right-2.5 z-1
        flex gap-2 justify-around items-center
        rounded-4xl p-0.5
        bg-secondary/60 backdrop-blur-xs
        border-2 border-background/40
        dark:border-muted/50
        drop-shadow-xs
        shadow-[0_0_1px_rgba(0,0,0,0.07),0_0_2px_rgba(0,0,0,0.07),0_0_7px_rgba(0,0,0,0.04)]
        dark:shadow-[0_0_1px_rgba(0,0,0,0.27),0_0_2px_rgba(0,0,0,0.27),0_0_7px_rgba(0,0,0,0.24)]
      "
    >
      {navLink.map((nav) => {
        const isActive =
          activePath === nav.to ||
          (activePath.startsWith(`${nav.to}/`) && nav.to !== '/');
        return (
          <li
            onClick={() => handleNavigate(nav.to)}
            className={`relative text-[11px] flex-1 flex flex-col items-center transition-all duration-200 p-1 rounded-full ${isActive ? 'bg-primary/15' : 'bg-transparent'}`}
            key={nav.title}
          >
            <div
              className={`drop-shadow-sm transition-all duration-200 ${
                isActive
                  ? 'stroke-primary scale-120 drop-shadow-primary/30'
                  : 'stroke-secondary-foreground drop-shadow-transparent'
              }`}
            >
              {nav.icon}
            </div>
            <span
              className={`${
                isActive ? 'text-primary' : 'text-secondary-foreground'
              } font-semibold select-none transition-colors duration-200`}
            >
              {nav.title}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
