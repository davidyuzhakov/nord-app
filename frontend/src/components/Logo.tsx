interface LogoProps {
  size?: 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

const SIZE_CONFIG = {
  md: {
    container: 'gap-2',
    image: 'size-10',
    pixels: 40,
    text: 'text-xl',
  },
  lg: {
    container: 'gap-3',
    image: 'size-12',
    pixels: 48,
    text: 'text-2xl',
  },
} as const;

export function Logo({
  size = 'md',
  className = '',
  showText = true,
}: LogoProps) {
  const currentSize = SIZE_CONFIG[size];

  return (
    <div
      className={`flex items-center ${currentSize.container} ${className}`.trim()}
    >
      <img
        className={`${currentSize.image} rounded-full object-cover`}
        src="/logo.png?v=1"
        alt="Логотип Nord App"
        width={currentSize.pixels}
        height={currentSize.pixels}
        draggable={false}
        decoding="async"
      />
      {showText && (
        <span
          className={`${currentSize.text} tracking-tighter select-none font-bold flex gap-0.5 items-end`}
        >
          Nord App
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-primary -translate-y-1"
          />
        </span>
      )}
    </div>
  );
}
