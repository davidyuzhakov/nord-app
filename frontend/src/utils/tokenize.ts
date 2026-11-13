import { changeChordHtoB } from './normalizeKeyForTonal';
import type { LineToken, SongSection } from './parseSongSections';

const CHORD_REGEX =
  /(^|\s|[([])([A-GH](?:#|b)?(?:maj|min|m|dim|aug|sus|add)?\d*(?:\/[A-GH](?:#|b)?)?)(?=$|\s|[)\]])/g;

export function tokenizeLine(line: string): LineToken[] {
  const tokens: LineToken[] = [];
  let lastIndex = 0;

  for (const match of line.matchAll(CHORD_REGEX)) {
    const index = (match.index ?? 0) + match[1].length;
    const chord = match[2];

    if (index > lastIndex) {
      tokens.push({
        type: 'text',
        value: line.slice(lastIndex, index),
      });
    }

    tokens.push({
      type: 'chord',
      value: changeChordHtoB(chord),
    });

    lastIndex = index + chord.length;
  }

  if (lastIndex < line.length) {
    tokens.push({
      type: 'text',
      value: line.slice(lastIndex),
    });
  }

  return tokens;
}

export function tokenizeSection(sections: SongSection[]): SongSection[] {
  return sections.map((section) => ({
    ...section,
    lines: section.lines.map((line) => ({
      ...line,
      tokens: tokenizeLine(line.raw),
    })),
  }));
}
