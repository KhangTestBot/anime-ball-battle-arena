import type { ActiveUltimateState, ArenaBounds, FighterState } from '../../types/game';

export interface UltimateRenderer {
  readonly characterId: string;
  /** Floor & atmospheric backdrop drawn below fighters */
  drawBackdrop?(
    ctx: CanvasRenderingContext2D,
    state: ActiveUltimateState,
    bounds: ArenaBounds,
    fighters: FighterState[],
    t: number,
  ): void;
  /** Entities, decoys, anvils, scythes, fog/darkness overlays drawn above fighters */
  drawForeground?(
    ctx: CanvasRenderingContext2D,
    state: ActiveUltimateState,
    bounds: ArenaBounds,
    fighters: FighterState[],
    t: number,
  ): void;
}
