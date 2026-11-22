import type {
  FighterSlot,
  MatchResult,
  TournamentMatch,
  TournamentSize,
  TournamentState,
} from '../types/game';

export function createTournament(slots: FighterSlot[], size: TournamentSize): TournamentState {
  const participants = slots.slice(0, size);
  const totalRounds = size === 16 ? 4 : size === 8 ? 3 : 2;
  const rounds: TournamentMatch[][] = [];

  for (let r = 0; r < totalRounds; r++) {
    const matchCount = size / Math.pow(2, r + 1);
    const roundMatches: TournamentMatch[] = [];
    for (let m = 0; m < matchCount; m++) {
      roundMatches.push({
        matchId: `r${r}_m${m}`,
        roundIndex: r,
        matchIndex: m,
        fighterA: r === 0 ? (participants[m * 2] ?? null) : null,
        fighterB: r === 0 ? (participants[m * 2 + 1] ?? null) : null,
        winner: null,
        result: null,
      });
    }
    rounds.push(roundMatches);
  }

  return {
    size,
    rounds,
    currentRound: 0,
    currentMatchIndex: 0,
    champion: null,
    completed: false,
  };
}

export function getCurrentTournamentMatch(state: TournamentState): TournamentMatch | null {
  if (state.completed) return null;
  const round = state.rounds[state.currentRound];
  if (!round) return null;
  return round[state.currentMatchIndex] ?? null;
}

export function recordTournamentMatchResult(
  state: TournamentState,
  result: MatchResult,
): TournamentState {
  const match = getCurrentTournamentMatch(state);
  if (!match || !match.fighterA || !match.fighterB) return state;

  // Determine whether fighterA (slotIndex 0) or fighterB (slotIndex 1) won
  const winnerSummary =
    result.fighters.find((f) => f.uid === result.winnerUid) ?? result.fighters[0];
  const winnerIsA = winnerSummary ? winnerSummary.slotIndex === 0 : true;

  const winningSlot = winnerIsA ? match.fighterA : match.fighterB;
  match.winner = winningSlot;
  match.result = result;

  const nextRoundIdx = state.currentRound + 1;
  if (nextRoundIdx < state.rounds.length) {
    const nextMatchIdx = Math.floor(state.currentMatchIndex / 2);
    const nextMatch = state.rounds[nextRoundIdx][nextMatchIdx];
    if (nextMatch) {
      if (state.currentMatchIndex % 2 === 0) {
        nextMatch.fighterA = winningSlot;
      } else {
        nextMatch.fighterB = winningSlot;
      }
    }
  } else {
    state.champion = winningSlot;
    state.completed = true;
    return state;
  }

  // Advance cursor to next match or next round
  const currentRoundMatches = state.rounds[state.currentRound];
  if (state.currentMatchIndex + 1 < currentRoundMatches.length) {
    state.currentMatchIndex += 1;
  } else {
    state.currentRound += 1;
    state.currentMatchIndex = 0;
  }

  return state;
}

export function getTournamentRoundLabel(totalRounds: number, roundIndex: number): string {
  const remaining = totalRounds - roundIndex;
  if (remaining === 1) return 'Grand Finals';
  if (remaining === 2) return 'Semifinals';
  if (remaining === 3) return 'Quarterfinals';
  return 'Round of 16';
}
