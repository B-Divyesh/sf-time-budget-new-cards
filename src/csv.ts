import type { Difficulty, StudySession } from './types';

const difficultyValues = new Set<Difficulty>(['easy', 'mixed', 'hard']);

function parseRows(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    if (char === '"') {
      if (quoted && csv[index + 1] === '"') {
        field += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(field.trim());
      field = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && csv[index + 1] === '\n') index += 1;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = '';
    } else field += char;
  }
  if (field || row.length) {
    row.push(field.trim());
    if (row.some(Boolean)) rows.push(row);
  }
  if (quoted) throw new Error('The CSV has an unclosed quote. Export it again and retry.');
  return rows;
}

function numberCell(value: string | undefined, label: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) throw new Error(`“${label}” must contain zero or a positive number.`);
  return parsed;
}

function dateCell(value: string | undefined): string {
  if (!value) throw new Error('Each row needs a date.');
  const numeric = Number(value);
  const date = Number.isFinite(numeric) && numeric > 1e11 ? new Date(numeric) : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`“${value}” is not a date we recognize.`);
  return date.toISOString().slice(0, 10);
}

export function importSessions(csv: string): StudySession[] {
  const rows = parseRows(csv);
  if (rows.length < 2) throw new Error('The file needs a header and at least one data row.');
  const headers = rows[0].map((header) => header.toLowerCase().replace(/\s+/g, '_'));
  const at = (name: string): number => headers.indexOf(name);
  const value = (row: string[], names: string[]): string | undefined => {
    const index = names.map(at).find((candidate) => candidate >= 0);
    return index === undefined ? undefined : row[index];
  };

  if (at('total_minutes') >= 0 && at('new_cards') >= 0) {
    return rows.slice(1).map((row, index) => {
      const difficultyRaw = (value(row, ['difficulty']) || 'mixed').toLowerCase() as Difficulty;
      if (!difficultyValues.has(difficultyRaw)) throw new Error(`Row ${index + 2}: difficulty must be easy, mixed, or hard.`);
      const date = dateCell(value(row, ['date']));
      return {
        id: crypto.randomUUID(),
        date,
        totalMinutes: numberCell(value(row, ['total_minutes']), 'total_minutes'),
        reviewedCards: Math.floor(numberCell(value(row, ['reviewed_cards']) || '0', 'reviewed_cards')),
        newCards: Math.floor(numberCell(value(row, ['new_cards']), 'new_cards')),
        difficulty: difficultyRaw,
        createdAt: new Date(`${date}T12:00:00Z`).getTime() + index,
      };
    });
  }

  const durationHeader = ['duration_seconds', 'duration_ms', 'time'].find((name) => at(name) >= 0);
  const dateHeader = ['date', 'reviewed_at', 'timestamp', 'id'].find((name) => at(name) >= 0);
  const newHeader = ['is_new', 'type'].find((name) => at(name) >= 0);
  if (!durationHeader || !dateHeader || !newHeader) {
    throw new Error('Columns not recognized. Use our session template, or Anki rows with date/id, duration_seconds/duration_ms/time, and is_new/type.');
  }

  const grouped = new Map<string, { seconds: number; reviews: number; newCards: number }>();
  rows.slice(1).forEach((row) => {
    const date = dateCell(value(row, [dateHeader]));
    let seconds = numberCell(value(row, [durationHeader]), durationHeader);
    if (durationHeader !== 'duration_seconds') seconds /= 1000;
    const marker = (value(row, [newHeader]) || '').toLowerCase();
    const isNew = newHeader === 'type' ? marker === '0' || marker === 'new' : ['1', 'true', 'yes', 'new'].includes(marker);
    const day = grouped.get(date) || { seconds: 0, reviews: 0, newCards: 0 };
    day.seconds += seconds;
    if (isNew) day.newCards += 1;
    else day.reviews += 1;
    grouped.set(date, day);
  });

  return [...grouped.entries()].map(([date, day], index) => ({
    id: crypto.randomUUID(),
    date,
    totalMinutes: Math.round((day.seconds / 60) * 10) / 10,
    reviewedCards: day.reviews,
    newCards: day.newCards,
    difficulty: 'mixed',
    createdAt: new Date(`${date}T12:00:00Z`).getTime() + index,
  }));
}

export function exportSessions(sessions: StudySession[]): string {
  const header = 'date,total_minutes,reviewed_cards,new_cards,difficulty';
  const rows = sessions.map((session) => [session.date, session.totalMinutes, session.reviewedCards, session.newCards, session.difficulty].join(','));
  return [header, ...rows].join('\n');
}
