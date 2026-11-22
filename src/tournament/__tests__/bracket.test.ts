import { describe, expect, it } from 'vitest';
import type { FighterSlot, MatchResult } from '../../types/game';
import {
  createTournament,
  getCurrentTournamentMatch,
  getTournamentRoundLabel,
  recordTournamentMatchResult,
} from '../bracket';

function fakeResult(winnerSlotIndex: 0 | 1, charA: string, charB: string): MatchResult {
  const winnerChar = winnerSlotIndex === 0 ? charA : charB;
  const loserChar = winnerSlotIndex === 0 ? charB : charA;
  return {
    mode: 'tournament',
    winnerUid: 'w',
    winnerTeamId: null,
    winnerName: winnerChar,
    durationSec: 20,
    fighters: [
      {
        uid: 'w',
        slotIndex: winnerSlotIndex,
        characterId: winnerChar,
        displayName: winnerChar,
        series: 'Test',
        primaryColor: '#fff',
        teamId: null,
        alive: true,
        hpRemaining: 50,
        maxHp: 200,
        damageDealt: 200,
        kills: 1,
        highestFormName: 'Max',
        finalFormIndex: 1,
        placement: 1,
      },
      {
        uid: 'l',
        slotIndex: winnerSlotIndex === 0 ? 1 : 0,
        characterId: loserChar,
        displayName: loserChar,
        series: 'Test',
        primaryColor: '#fff',
        teamId: null,
        alive: false,
        hpRemaining: 0,
        maxHp: 200,
        damageDealt: 150,
        kills: 0,
        highestFormName: 'Base',
        finalFormIndex: 0,
        placement: 2,
      },
    ],
  };
}

describe('Tournament Bracket', () => {
  it('runs a 4-fighter bracket to completion and crowns the right champion even with duplicate characters', () => {
    const slots: FighterSlot[] = [
      { slotId: 's1', characterId: 'luffy', teamId: null },
      { slotId: 's2', characterId: 'luffy', teamId: null },
      { slotId: 's3', characterId: 'gojo', teamId: null },
      { slotId: 's4', characterId: 'sukuna', teamId: null },
    ];

    const state = createTournament(slots, 4);
    expect(state.rounds.length).toBe(2);
    expect(getTournamentRoundLabel(2, 0)).toBe('Semifinals');
    expect(getTournamentRoundLabel(2, 1)).toBe('Grand Finals');

    const m1 = getCurrentTournamentMatch(state)!;
    expect(m1.fighterA?.slotId).toBe('s1');
    expect(m1.fighterB?.slotId).toBe('s2');
    recordTournamentMatchResult(state, fakeResult(1, 'luffy', 'luffy'));

    const m2 = getCurrentTournamentMatch(state)!;
    expect(m2.fighterA?.slotId).toBe('s3');
    recordTournamentMatchResult(state, fakeResult(0, 'gojo', 'sukuna'));

    const finalMatch = getCurrentTournamentMatch(state)!;
    expect(finalMatch.fighterA?.slotId).toBe('s2');
    expect(finalMatch.fighterB?.slotId).toBe('s3');
    recordTournamentMatchResult(state, fakeResult(1, 'luffy', 'gojo'));

    expect(state.completed).toBe(true);
    expect(state.champion?.slotId).toBe('s3');
  });

  it('builds 3 rounds for an 8-fighter tournament (Quarterfinals -> Semifinals -> Grand Finals)', () => {
    const slots: FighterSlot[] = Array.from({ length: 8 }, (_, i) => ({
      slotId: `p${i}`,
      characterId: 'goku',
      teamId: null,
    }));
    const state = createTournament(slots, 8);
    expect(state.rounds.length).toBe(3);
    expect(state.rounds[0].length).toBe(4);
    expect(state.rounds[1].length).toBe(2);
    expect(state.rounds[2].length).toBe(1);
    expect(getTournamentRoundLabel(3, 0)).toBe('Quarterfinals');
  });

  it('builds 4 rounds for a 16-fighter tournament (Round of 16 -> Quarterfinals -> Semifinals -> Grand Finals)', () => {
    const slots: FighterSlot[] = Array.from({ length: 16 }, (_, i) => ({
      slotId: `p${i}`,
      characterId: i % 2 === 0 ? 'steve' : 'yasuo',
      teamId: null,
    }));
    const state = createTournament(slots, 16);
    expect(state.rounds.length).toBe(4);
    expect(state.rounds[0].length).toBe(8);
    expect(state.rounds[1].length).toBe(4);
    expect(state.rounds[2].length).toBe(2);
    expect(state.rounds[3].length).toBe(1);
    expect(getTournamentRoundLabel(4, 0)).toBe('Round of 16');
    expect(getTournamentRoundLabel(4, 1)).toBe('Quarterfinals');
  });
});
