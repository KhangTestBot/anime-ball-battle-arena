import type { UltimateHandler } from './types';

export interface YamatoCutLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  shattered: boolean;
}

export interface VergilUltimateData {
  stage: 'drawing' | 'sheathe-shatter';
  cuts: YamatoCutLine[];
  nextCutTimer: number;
  totalCutsTarget: number;
  shatterTimer: number;
  shattered: boolean;
  styleRank: 'A' | 'S' | 'SS' | 'SSS';
}

function pointToSegmentDist(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-4) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

export const vergilUltimateHandler: UltimateHandler = {
  characterId: 'vergil',
  title: 'JUDGMENT CUT END',
  subtitle:
    'Vanishes from space · Etches 18 Yamato dimension slashes → Sheathes blade *CLICK* shattering reality simultaneously (SSS)!',
  bannerColor: '#38bdf8',
  castDuration: 0.25,
  duration: 2.9,

  onCast(ctx, owner, state) {
    // Vergil vanishes from physical collisions for 1.6s while carving space!
    owner.untargetableTimer = Math.max(owner.untargetableTimer, 1.6);
    owner.invulnTimer = Math.max(owner.invulnTimer, 1.6);

    const data: VergilUltimateData = {
      stage: 'drawing',
      cuts: [],
      nextCutTimer: 0.04,
      totalCutsTarget: 18,
      shatterTimer: 1.45,
      shattered: false,
      styleRank: 'S',
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'JUDGMENT CUT END!',
      '#7dd3fc',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 20, '#38bdf8', 70, 260, 2, 5, 'shard');
    ctx.addScreenShake(8);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'slash', intensity: 1.1 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as VergilUltimateData;
    const { left, right, top, bottom } = ctx.bounds;
    const cx = (left + right) / 2;
    const cy = (top + bottom) / 2;
    const enemies = ctx.getEnemies(owner);

    // 1. Drawing Phase (1.45s): carve 18 visible silver-blue lines across the arena (ZERO damage yet!)
    if (data.stage === 'drawing') {
      data.shatterTimer -= dt;
      data.nextCutTimer -= dt;

      if (data.cuts.length < data.totalCutsTarget && data.nextCutTimer <= 0) {
        data.nextCutTimer = 0.068;
        const focus =
          enemies.length > 0 && data.cuts.length % 2 === 0
            ? enemies[data.cuts.length % enemies.length]
            : { x: cx + (Math.random() - 0.5) * 260, y: cy + (Math.random() - 0.5) * 260 };
        const ang = (data.cuts.length * 0.67 + Math.random() * 0.45) % Math.PI;
        const len = (right - left) * 0.85;
        data.cuts.push({
          x1: focus.x - Math.cos(ang) * len,
          y1: focus.y - Math.sin(ang) * len,
          x2: focus.x + Math.cos(ang) * len,
          y2: focus.y + Math.sin(ang) * len,
          shattered: false,
        });
        data.styleRank = data.cuts.length >= 14 ? 'SSS' : data.cuts.length >= 8 ? 'SS' : 'S';
        ctx.emitSfx({ type: 'slash', intensity: 0.55 });
      }

      // Moment of truth: Yamato *CLICK* sheathe -> ALL 18 cuts shatter simultaneously!
      if (data.shatterTimer <= 0) {
        data.stage = 'sheathe-shatter';
        data.shattered = true;
        data.styleRank = 'SSS';
        owner.untargetableTimer = 0;

        for (const cut of data.cuts) cut.shattered = true;

        ctx.addHitstop(0.08);
        ctx.addScreenShake(16);
        ctx.spawnShockwave(
          cx,
          cy,
          (right - left) * 0.55,
          '#38bdf8',
          7,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(cx, cy - 22, '*CLICK* · SSS SHATTER!', '#7dd3fc', 'powerup');
        ctx.emitSfx({ type: 'ko', intensity: 1.25 });

        for (const e of enemies) {
          let overlappingCuts = 0;
          for (const cut of data.cuts) {
            if (pointToSegmentDist(e.x, e.y, cut.x1, cut.y1, cut.x2, cut.y2) <= e.radius + 16) {
              overlappingCuts += 1;
            }
          }
          // Cap overlapping multiplier cleanly while rewarding enemies who dodged dense intersections!
          const effectiveHits = Math.max(1, Math.min(5, overlappingCuts));
          const raw = 6.2 + effectiveHits * 3.8;
          const pullDx = cx - e.x;
          const pullDy = cy - e.y;
          const pullD = Math.max(1, Math.hypot(pullDx, pullDy));
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, raw),
            (pullDx / pullD) * 260,
            (pullDy / pullD) * 260,
            { isCrit: effectiveHits >= 3, sourceKind: 'ability' },
          );
          ctx.spawnParticles(e.x, e.y, 18, '#7dd3fc', 90, 320, 2.5, 6, 'shard');
        }
      }
    }
  },

  onExpire(_ctx, owner) {
    if (owner) owner.untargetableTimer = 0;
  },
};
