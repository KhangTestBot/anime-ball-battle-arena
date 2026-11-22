import type { ActiveUltimateState, FighterState } from '../../types/game';
import type { AbilityContext } from '../abilities';

export interface UltimateHandler {
  readonly characterId: string;
  readonly title: string;
  readonly subtitle: string;
  readonly bannerColor: string;
  readonly castDuration: number;
  readonly duration: number;
  /** Runs once when the Ultimate begins (after Cut-In finishes). Returns initial state data. */
  onCast(ctx: AbilityContext, owner: FighterState, state: ActiveUltimateState): void;
  /** Runs every fixed physics step while active. */
  onTick(ctx: AbilityContext, owner: FighterState, state: ActiveUltimateState, dt: number): void;
  /** Runs cleanly when the Ultimate finishes or owner is eliminated. */
  onExpire?(ctx: AbilityContext, owner: FighterState | null, state: ActiveUltimateState): void;
}
