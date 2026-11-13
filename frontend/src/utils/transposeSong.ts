import { Chord, Note, distance } from 'tonal';
import type { KeyType } from '@/models/Song';
import type { SongSection } from './parseSongSections';
import { changeChordHtoB, normalizeKeyForTonal } from './normalizeKeyForTonal';
import { tokenizeLine } from './tokenize';

function transposeChord(chord: string, interval: string): string {
  const transposed = Chord.transpose(changeChordHtoB(chord), interval);
  if (!transposed) return chord;

  const [main, bass] = transposed.split('/');

  const mainData = Chord.get(main);
  const root = mainData.tonic ? Note.simplify(mainData.tonic) : main;

  const suffix = mainData.tonic
    ? mainData.symbol.slice(mainData.tonic.length)
    : '';

  const simplifiedMain = root + suffix;

  if (!bass) return simplifiedMain;

  const simplifiedBass = Note.simplify(bass);

  return `${simplifiedMain}/${simplifiedBass}`;
}

export function transposeSongText(
  text: string,
  fromKey: KeyType,
  toKey: KeyType,
): string {
  const fromNote = normalizeKeyForTonal(fromKey);
  const toNote = normalizeKeyForTonal(toKey);
  if (fromNote === toNote) return text;

  const interval = distance(fromNote, toNote);
  if (!interval) return text;

  return text
    .split('\n')
    .map((line) =>
      tokenizeLine(line)
        .map((token) =>
          token.type === 'chord'
            ? transposeChord(token.value, interval)
            : token.value,
        )
        .join(''),
    )
    .join('\n');
}

export function transposeSections(
  sections: SongSection[],
  interval: string,
): SongSection[] {
  return sections.map((section) => ({
    ...section,
    lines: section.lines.map((line) => ({
      ...line,
      tokens: line.tokens.map((token) =>
        token.type === 'chord'
          ? {
              type: 'chord',
              value: transposeChord(token.value, interval),
            }
          : token,
      ),
    })),
  }));
}
