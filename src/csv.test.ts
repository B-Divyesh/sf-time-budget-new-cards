import { describe, expect, it } from 'vitest';
import { exportSessions, importSessions } from './csv';

describe('session CSV', () => {
  it('imports the documented session format', () => {
    const sessions = importSessions('date,total_minutes,reviewed_cards,new_cards,difficulty\n2026-08-27,20.5,42,7,hard');
    expect(sessions).toHaveLength(1);
    expect(sessions[0]).toMatchObject({ totalMinutes: 20.5, reviewedCards: 42, newCards: 7, difficulty: 'hard' });
  });

  it('aggregates Anki-style review rows', () => {
    const sessions = importSessions('id,time,type\n1756252800000,9000,1\n1756252800001,34000,0');
    expect(sessions).toHaveLength(1);
    expect(sessions[0]).toMatchObject({ reviewedCards: 1, newCards: 1, totalMinutes: 0.7 });
  });

  it('reports an actionable error for unknown columns', () => {
    expect(() => importSessions('foo,bar\na,b')).toThrow(/Columns not recognized/);
  });

  it('exports a round-trippable CSV', () => {
    const original = importSessions('date,total_minutes,reviewed_cards,new_cards,difficulty\n2026-08-27,20,40,8,mixed');
    const roundTrip = importSessions(exportSessions(original));
    expect(roundTrip[0]).toMatchObject({ date: '2026-08-27', totalMinutes: 20, reviewedCards: 40, newCards: 8 });
  });
});
