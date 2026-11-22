import type { UltimateHandler } from './types';

export interface CurvedRainbowBolt {
  id: string;
  color: string;
  startX: number;
  startY: number;
  ctrlX: number;
  ctrlY: number;
  endX: number;
  endY: number;
  targetUid: string;
  progress: number; // 0 -> 1 flying along Bezier arc
  struck: boolean;
  fadeTimer: number;
}

export interface PikachuUltimateData {
  webX: number;
  webY: number;
  webRadius: number;
  bolts: CurvedRainbowBolt[];
  boltsFired: number;
  nextBoltTimer: number;
  hitsByUid: Record<string, number>;
}

const RAINBOW_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#facc15', // Yellow
  '#22c55e', // Green
  '#38bdf8', // Cyan
  '#6366f1', // Indigo
  '#d946ef', // Violet
];

export const pikachuUltimateHandler: UltimateHandler = {
  characterId: 'pikachu',
  title: 'Z-MOVE: 10,000,000 VOLT THUNDERBOLT',
  subtitle:
    'Electroweb slows targets · 7 curving Rainbow Thunderbolts home in · Inflicts periodic Paralysis (PAR)!',
  bannerColor: '#facc15',
  castDuration: 0.45,
  duration: 4.5,

  onCast(ctx, owner, state) {
    const cx = (ctx.bounds.left + ctx.bounds.right) / 2;
    const cy = (ctx.bounds.top + ctx.bounds.bottom) / 2;

    const data: PikachuUltimateData = {
      webX: cx,
      webY: cy,
      webRadius: 138,
      bolts: [],
      boltsFired: 0,
      nextBoltTimer: 0.45, // Brief Z-Move dance cast!
      hitsByUid: {},
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#facc15', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'Z-MOVE! 10M VOLTS!',
      '#facc15',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 22, '#facc15', 80, 260, 3, 6, 'star');
    ctx.addScreenShake(9);
    ctx.addHitstop(0.045);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as PikachuUltimateData;
    const enemies = ctx.getEnemies(owner);

    // 1. Center Electroweb Snare slows enemies inside by 45%
    for (const e of enemies) {
      if (Math.hypot(e.x - data.webX, e.y - data.webY) <= data.webRadius + e.radius) {
        const damp = Math.pow(0.45, dt * 3.5);
        e.vx *= damp;
        e.vy *= damp;
      }
    }

    // 2. Fire 7 Curved Homing Rainbow Thunderbolts sequentially!
    if (data.boltsFired < 7 && enemies.length > 0) {
      data.nextBoltTimer -= dt;
      if (data.nextBoltTimer <= 0) {
        const idx = data.boltsFired;
        const target = enemies[idx % enemies.length];
        const midX = (owner.x + target.x) / 2;
        const midY = (owner.y + target.y) / 2;
        const dx = target.x - owner.x;
        const dy = target.y - owner.y;
        const len = Math.max(1, Math.hypot(dx, dy));
        const nx = -dy / len;
        const ny = dx / len;
        // Alternate curved arc sides & widths so all 7 rainbow bolts form a sweeping chromatic fan!
        const side = idx % 2 === 0 ? 1 : -1;
        const bend = (90 + (idx % 3) * 45) * side;

        data.bolts.push({
          id: ctx.nextId('zbolt'),
          color: RAINBOW_COLORS[idx % RAINBOW_COLORS.length],
          startX: owner.x,
          startY: owner.y,
          ctrlX: midX + nx * bend,
          ctrlY: midY + ny * bend,
          endX: target.x,
          endY: target.y,
          targetUid: target.uid,
          progress: 0,
          struck: false,
          fadeTimer: 0.34,
        });

        data.boltsFired += 1;
        data.nextBoltTimer = 0.3;
        ctx.emitSfx({ type: 'crit', intensity: 0.9 });
      }
    }

    // 3. Advance curved rainbow bolts -> home slightly onto target & inflict Pokémon PAR on >=2 hits!
    for (let i = data.bolts.length - 1; i >= 0; i--) {
      const b = data.bolts[i];
      if (!b.struck) {
        const liveTarget = enemies.find((e) => e.uid === b.targetUid);
        if (liveTarget) {
          b.endX += (liveTarget.x - b.endX) * Math.min(1, dt * 9);
          b.endY += (liveTarget.y - b.endY) * Math.min(1, dt * 9);
        }
        b.progress += dt / 0.24;
        if (b.progress >= 1.0) {
          b.progress = 1.0;
          b.struck = true;
          ctx.spawnParticles(b.endX, b.endY, 12, b.color, 70, 240, 2.5, 5.5, 'star');
          ctx.addScreenShake(4);

          for (const e of enemies) {
            if (Math.hypot(e.x - b.endX, e.y - b.endY) <= e.radius + 36) {
              const ang = Math.atan2(e.y - b.ctrlY, e.x - b.ctrlX);
              ctx.applyDamage(
                owner,
                e,
                ctx.getEffectiveDamage(owner, 6.4),
                Math.cos(ang) * 210,
                Math.sin(ang) * 210,
                { sourceKind: 'ability' },
              );
              data.hitsByUid[e.uid] = (data.hitsByUid[e.uid] ?? 0) + 1;
              if (data.hitsByUid[e.uid] === 2) {
                // Inflict authentic Pokémon Paralysis (PAR 3.5s -> periodic micro-stuns every 0.9s!)
                e.paralyzeTimer = Math.max(e.paralyzeTimer, 3.5);
                e.paralyzeTick = 0.45;
                ctx.spawnFloatingText(
                  e.x,
                  e.y - e.radius - 16,
                  'SUPER EFFECTIVE! [PAR]',
                  '#facc15',
                  'powerup',
                );
              }
            }
          }
        }
      } else {
        b.fadeTimer -= dt;
        if (b.fadeTimer <= 0) {
          data.bolts.splice(i, 1);
        }
      }
    }
  },
};
