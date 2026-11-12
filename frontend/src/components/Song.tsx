import type { KeyType, Song as SongModel } from '@/models/Song';
import type { ProgramSong } from '@/models/Program';
import { parseSongSections, type SongSection } from '@/utils/parseSongSections';
import { tokenizeSection } from '@/utils/tokenize';
import { transposeSections } from '@/utils/transposeSong';
import { useEffect, useMemo, useState } from 'react';
import { distance } from 'tonal';
import { normalizeKeyForTonal } from '@/utils/normalizeKeyForTonal';
import { stringifySongSections } from '@/utils/stringifySongSections';
import { Tonality } from './Tonality';
import { Button } from './ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateSongThunk } from '@/store/reducers/songSlice';
import { updateProgramSongThunk } from '@/store/reducers/programSlice';
import { CopyCheck, GaugeIcon, Music2Icon, TypeIcon } from 'lucide-react';
import { updateHideChords } from '@/store/reducers/settingsSlice';
import { getTextBg } from '@/utils/getStructureBg';

export function Song({
  song,
  isEdit,
  programSong,
}: {
  song: SongModel;
  isEdit?: boolean;
  programSong?: ProgramSong;
}) {
  const savedKey = programSong?.key ?? song.key;
  const [currentKey, setCurrentKey] = useState<KeyType>(savedKey);
  const [isCopied, setIsCopied] = useState(false);
  const dispatch = useAppDispatch();
  const { hideChords, songFontSize } = useAppSelector(
    (state) => state.settings,
  );

  const sections = useMemo(() => {
    const parsed = tokenizeSection(parseSongSections(song.text ?? ''));

    const fromKey = normalizeKeyForTonal(song.key);
    const toKey = normalizeKeyForTonal(currentKey);

    if (currentKey === song.key) return parsed;

    const interval = distance(fromKey, toKey);
    if (!interval || interval === '') {
      return parsed;
    }
    return transposeSections(parsed, interval);
  }, [song.text, song.key, currentKey]);

  const changeKey = () => {
    if (programSong) {
      dispatch(
        updateProgramSongThunk({
          programId: programSong.programId,
          songId: song.id,
          data: { key: currentKey },
        }),
      );
      return;
    }

    const newText = stringifySongSections(sections);
    dispatch(
      updateSongThunk({
        id: song.id,
        data: {
          key: currentKey,
          text: newText,
        },
      }),
    );
  };

  const getIdSection = (section: SongSection) => {
    const numSection = section.title.match(/\d+/g);
    if (!numSection) return `${song.id}-${section.type}`;

    return `${song.id}-${numSection[0]}${section.type}`;
  };

  async function copyTextForProPresenter() {
    const filteredSections = sections.reduce<SongSection[]>((acc, section) => {
      if (section.type === 'unknown' || section.type === 'проигрыш') return acc;

      const lines = section.lines.filter(
        (line) => !line.tokens.some((t) => t.type === 'chord'),
      );

      if (lines.length === 0) return acc;

      acc.push({ ...section, lines });

      return acc;
    }, []);

    const sectionMap = new Map(
      filteredSections.map((section) => {
        const text = `[${section.title.slice(0, -1)}]\n${section.lines.map((line) => line.raw).join('\n')}`;
        return [getIdSection(section), text];
      }),
    );
    let finalText = '';
    if (!song.structure || song.structure.length === 0) {
      finalText = Array.from(sectionMap.values()).join('\n\n');
    } else {
      const textArr: string[] = [];

      for (const structure of song.structure) {
        const hasNumber = /^\d/.test(structure.text);

        const id = `${song.id}-${hasNumber ? structure.text[0] + structure.title : structure.title}`;
        const text = sectionMap.get(id);
        if (text) textArr.push(text);
      }
      finalText = textArr.join('\n\n');
    }

    await navigator.clipboard.writeText(`${song.name}\n\n${finalText}`);
    setIsCopied(true);
  }

  useEffect(() => {
    setCurrentKey(savedKey);
  }, [song.id, savedKey]);

  useEffect(() => {
    if (!isCopied) return;

    const timeoutId = setTimeout(() => setIsCopied(false), 1500);

    return () => clearTimeout(timeoutId);
  }, [isCopied]);

  return (
    <div className="px-3 space-y-6">
      <div className="flex gap-2 flex-wrap">
        <span className="font-semibold flex items-center gap-2 justify-center px-2 py-0.5 rounded-md text-third text-nowrap bg-third/10">
          <GaugeIcon size={20} /> {song.bpm}
        </span>
        {!isEdit ? (
          <span className="flex items-center gap-1 justify-center font-semibold px-2 pr-3 py-0.5 rounded-md text-primary bg-primary/10">
            <Music2Icon size={20} /> {savedKey}
          </span>
        ) : (
          <>
            <div className="flex-1 flex gap-2 max-w-max">
              <Tonality currentKey={currentKey} setCurrentKey={setCurrentKey} />
            </div>
            {currentKey !== savedKey && (
              <Button className="order-1" onClick={changeKey} type="button">
                Сохранить
              </Button>
            )}
          </>
        )}
        {isEdit && (
          <button
            onClick={copyTextForProPresenter}
            className="cursor-pointer border rounded-md max-w-36 w-full px-2 hidden md:block"
          >
            {isCopied ? (
              <div className="flex gap-2 items-center">
                <CopyCheck size={20} />
                <p className="text-[15px] font-medium">Скопировано</p>
              </div>
            ) : (
              <svg
                className="text-foreground w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
                width="628"
                height="90"
                viewBox="0 0 628 90"
                fill="currentColor"
              >
                <path
                  d="M24.679 69.7311L7.38388 74.5311C5.01477 75.1868 2.67041 73.4053 2.67041 70.9435V18.601C2.67041 16.1392 5.01477 14.3577 7.38388 15.0134L24.679 19.8134C25.947 20.166 26.8254 21.3165 26.8254 22.634V66.9105C26.8254 68.228 25.947 69.3785 24.679 69.7311Z"
                  fill="url(#paint0_linear_1_140)"
                />
                <path
                  d="M35.9554 16.9866C33.1595 17.6052 33.4193 21.6691 36.2647 21.9289L58.1928 27.4897C60.6856 28.2691 62.3805 30.5763 62.3805 33.1866V56.0424C62.3805 58.7084 60.6052 61.0589 58.0382 61.7826L35.8255 67.2135C32.9863 67.4733 32.7203 71.5187 35.4977 72.1496L81.0859 83.8961C83.6468 84.4837 86.0901 82.5352 86.0901 79.9064V9.68761C86.0901 7.07111 83.6715 5.12265 81.1106 5.68553L35.9492 16.9866H35.9554Z"
                  fill="url(#paint1_linear_1_140)"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M138.736 16.1341C135.489 16.1341 132.857 18.7663 132.857 22.0132V73.5717H142.441V57.2739L154.256 57.2739C165.643 57.2739 174.369 47.0614 174.369 36.2463C174.369 25.4313 165.364 16.1341 154.256 16.1341H138.736ZM152.518 48.8251L142.441 48.8252V25.3563H153.6C159.949 25.3563 165.097 29.8969 165.097 36.2463C165.097 43.1934 159.465 48.8251 152.518 48.8251Z"
                  fill="currentColor"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M207.597 51.8609C207.597 64.9693 217.101 74.391 230.537 74.391C243.891 74.391 253.476 64.9693 253.476 51.8609C253.476 38.7525 243.891 29.3308 230.537 29.3308C217.101 29.3308 207.597 38.7525 207.597 51.8609ZM244.219 51.8609C244.219 60.0536 238.484 65.8705 230.537 65.8705C222.59 65.8705 216.855 60.0536 216.855 51.8609C216.855 43.6681 222.59 37.8513 230.537 37.8513C238.484 37.8513 244.219 43.6681 244.219 51.8609Z"
                  fill="currentColor"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M378.43 54.8922H342.71C343.857 61.6103 348.936 66.0344 355.9 66.0344C361.062 66.0344 365.404 63.8223 367.452 60.2994H377.283C374.252 68.9838 366.059 74.391 355.9 74.391C342.874 74.391 333.37 64.9693 333.37 51.8609C333.37 38.7525 342.874 29.3308 355.9 29.3308C369.992 29.3308 379.659 39.5718 378.43 54.8922ZM355.9 37.6874C349.264 37.6874 344.43 41.7019 342.956 47.8464H369.172C367.616 41.8657 362.7 37.6874 355.9 37.6874Z"
                  fill="currentColor"
                />
                <path
                  d="M382.612 59.9717C383.021 68.9018 389.985 74.309 401.045 74.309C411.532 74.309 419.643 69.803 419.643 60.7091C419.643 52.4344 412.925 49.2392 402.848 47.9284C394.901 46.8633 392.361 45.4705 392.361 42.2754C392.361 39.1621 395.474 37.2778 400.8 37.2778C405.879 37.2778 408.992 39.326 409.402 42.7669H418.414C417.922 34.4922 411.286 29.3308 401.045 29.3308C390.968 29.3308 383.185 33.9188 383.185 42.4392C383.185 50.1404 388.101 53.991 400.226 55.7934C408.255 56.9404 410.467 58.0874 410.467 61.1187C410.467 64.5597 406.698 66.2801 401.209 66.2801C395.72 66.2801 392.115 64.0681 391.787 59.9717H382.612Z"
                  fill="currentColor"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M469.275 54.8922H433.555C434.701 61.6103 439.781 66.0344 446.745 66.0344C451.906 66.0344 456.248 63.8223 458.297 60.2994H468.128C465.097 68.9838 456.904 74.391 446.745 74.391C433.718 74.391 424.215 64.9693 424.215 51.8609C424.215 38.7525 433.718 29.3308 446.745 29.3308C460.836 29.3308 470.504 39.5718 469.275 54.8922ZM446.745 37.6874C440.109 37.6874 435.275 41.7019 433.8 47.8464H460.017C458.46 41.8657 453.545 37.6874 446.745 37.6874Z"
                  fill="currentColor"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M558.755 54.8922H594.476C595.704 39.5718 586.037 29.3308 571.945 29.3308C558.919 29.3308 549.415 38.7525 549.415 51.8609C549.415 64.9693 558.919 74.391 571.945 74.391C582.104 74.391 590.297 68.9838 593.329 60.2994H583.497C581.449 63.8223 577.107 66.0344 571.945 66.0344C564.982 66.0344 559.902 61.6103 558.755 54.8922ZM559.001 47.8464C560.476 41.7019 565.309 37.6874 571.945 37.6874C578.745 37.6874 583.661 41.8657 585.218 47.8464H559.001Z"
                  fill="currentColor"
                />
                <path
                  d="M515.816 49.0752C515.816 36.5403 509.507 29.4126 498.201 29.4126C491.975 29.4126 487.141 31.6247 483.536 35.4753L483.454 30.15H474.524V73.5716H483.618V49.7307C483.618 42.4391 488.534 37.6873 496.153 37.6873C503.117 37.6873 506.722 41.7837 506.722 49.7307V73.5716H515.816V49.0752Z"
                  fill="currentColor"
                />
                <path
                  d="M621.925 30.1506L627.168 30.1506V38.5072H622.58C614.961 38.5072 609.554 43.5822 609.554 51.2834V73.5702H600.46V30.1486H609.308L609.472 36.3726C612.503 32.3582 616.763 30.1506 621.925 30.1506Z"
                  fill="currentColor"
                />
                <path
                  d="M206.221 30.1506L200.978 30.1506C195.816 30.1506 191.556 32.3582 188.525 36.3726L188.361 30.1486H179.513V73.5702H188.607V51.2834C188.607 43.5822 194.014 38.5072 201.633 38.5072H206.221V30.1506Z"
                  fill="currentColor"
                />
                <path
                  d="M326.742 30.1506L331.985 30.1506V38.5072H327.397C319.778 38.5072 314.371 43.5822 314.371 51.2834V73.5702H305.277V30.1486H314.125L314.289 36.3726C317.32 32.3582 321.58 30.1506 326.742 30.1506Z"
                  fill="currentColor"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M258.621 22.0132C258.621 18.7663 261.253 16.1341 264.5 16.1341H280.02C291.128 16.1341 300.133 25.4313 300.133 36.2463C300.133 47.0614 291.407 57.2739 280.02 57.2739L268.205 57.2739V73.5717H258.621V22.0132ZM268.205 48.8252L278.282 48.8251C285.229 48.8251 290.861 43.1934 290.861 36.2463C290.861 29.8969 285.713 25.3563 279.364 25.3563H268.205V48.8252Z"
                  fill="currentColor"
                />
                <path
                  d="M526.743 59.6437V37.8396H518.304V30.1498H526.743V20.2365L535.837 19.2534V30.1498H547.143V37.8396H535.847V62.0752C535.847 63.6216 537.1 64.8752 538.647 64.8752H547.228V73.973H538.647C532.076 73.973 526.749 68.6462 526.749 62.0752L526.743 59.6437Z"
                  fill="currentColor"
                />
                <defs>
                  <linearGradient
                    id="brandGradient"
                    x1="86.09"
                    y1="5.59"
                    x2="7.83"
                    y2="88.85"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0.159341" stopColor="#FF6C1B" />
                    <stop offset="0.851648" stopColor="#FFA235" />
                  </linearGradient>
                </defs>

                <path
                  d="M24.679 69.7311L7.38388 74.5311C5.01477 75.1868 2.67041 73.4053 2.67041 70.9435V18.601C2.67041 16.1392 5.01477 14.3577 7.38388 15.0134L24.679 19.8134C25.947 20.166 26.8254 21.3165 26.8254 22.634V66.9105C26.8254 68.228 25.947 69.3785 24.679 69.7311Z"
                  fill="url(#brandGradient)"
                />

                <path
                  d="M35.9554 16.9866C33.1595 17.6052 33.4193 21.6691 36.2647 21.9289L58.1928 27.4897C60.6856 28.2691 62.3805 30.5763 62.3805 33.1866V56.0424C62.3805 58.7084 60.6052 61.0589 58.0382 61.7826L35.8255 67.2135C32.9863 67.4733 32.7203 71.5187 35.4977 72.1496L81.0859 83.8961C83.6468 84.4837 86.0901 82.5352 86.0901 79.9064V9.68761C86.0901 7.07111 83.6715 5.12265 81.1106 5.68553L35.9492 16.9866H35.9554Z"
                  fill="url(#brandGradient)"
                />
              </svg>
            )}
          </button>
        )}
        <button
          onClick={() =>
            hideChords === 'on'
              ? dispatch(updateHideChords('off'))
              : dispatch(updateHideChords('on'))
          }
          className={`ml-auto py-1 px-2.5 rounded border duration-200 ${hideChords === 'on' ? 'bg-primary' : 'bg-transparent'}`}
          type="button"
        >
          <TypeIcon
            size={17}
            className={`duration-200 ${hideChords === 'on' ? 'stroke-background' : ''}`}
          />
        </button>
      </div>
      {sections.map((section, i) => (
        <div
          key={i}
          id={getIdSection(section)}
          className="relative border dark:bg-card rounded-md py-3.5 px-2 space-y-7 scroll-mt-[135px]"
        >
          {section.title && (
            <h5
              className={`absolute top-0 left-4 bg-background -translate-y-1/2 px-1 rounded-md font-bold mb-2 uppercase dark:font-semibold ${getTextBg(section.type)}`}
            >
              {section.type === 'unknown'
                ? 'Некорректный раздел'
                : section.title}
            </h5>
          )}
          <div>
            {section.lines
              .filter((line) =>
                hideChords === 'on'
                  ? !line.tokens.some((t) => t.type === 'chord')
                  : true,
              )
              .map((line, lineIdx) => (
                <pre
                  key={lineIdx}
                  style={{
                    fontFamily: 'Open Sans Variable',
                    fontSize: songFontSize,
                    lineHeight: 1.7,
                  }}
                  className="font-medium whitespace-pre-wrap text-pretty"
                >
                  {line.tokens.map((t, i) =>
                    t.type === 'chord' ? (
                      <span key={i} className="font-semibold text-primary">
                        {t.value}
                      </span>
                    ) : (
                      <span key={i}>
                        {hideChords === 'on' ? t.value.trim() : t.value}
                      </span>
                    ),
                  )}
                </pre>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
