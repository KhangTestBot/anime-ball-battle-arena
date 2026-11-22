import type { UltimateHandler } from './types';

export interface NeuralWireTrace {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  life: number;
  hitUids: Record<string, boolean>;
}

export interface WhirlwindArc {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  life: number;
}

export interface KilluaUltimateData {
  radarRadius: number;
  reflexesLeft: number;
  reflexCd: number;
  wireTraces: NeuralWireTrace[];
  reflexArcs: WhirlwindArc[];
  wireSlowTimers: Record<string, number>;
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

export const killuaUltimateHandler: UltimateHandler = {
  characterId: 'killua',
  title: 'GODSPEED: WHIRLWIND & SPEED OF LIGHTNING',
  subtitle:
    '125px Neural Radar ring · Auto-flashes to dodge & stun 0.35s (4 charges) · Leaves High-Voltage Trails slowing enemies by 50%!',
  bannerColor: '#38bdf8',
  castDuration: 0.22,
  duration: 4.2,

  onCast(ctx, owner, state) {
    const data: KilluaUltimateData = {
      radarRadius: 125,
      reflexesLeft: 4,
      reflexCd: 0.08,
      wireTraces: [],
      reflexArcs: [],
      wireSlowTimers: {},
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'KANMURU! GODSPEED!',
      '#7dd3fc',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 20, '#38bdf8', 90, 290, 2.5, 5.5, 'star');
    ctx.addScreenShake(8);
    ctx.addHitstop(0.045);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as KilluaUltimateData;
    const { left, right, top, bottom } = ctx.bounds;
    const enemies = ctx.getEnemies(owner);

    for (let i = data.reflexArcs.length - 1; i >= 0; i--) {
      data.reflexArcs[i].life -= dt;
      if (data.reflexArcs[i].life <= 0) data.reflexArcs.splice(i, 1);
    }

    // Apply 50% electric slow to anyone tagged by Killua's neural floor wires!
    for (const e of enemies) {
      if (data.wireSlowTimers[e.uid] && data.wireSlowTimers[e.uid] > 0) {
        data.wireSlowTimers[e.uid] -= dt;
        e.vx *= Math.pow(0.45, dt * 3.0);
        e.vy *= Math.pow(0.45, dt * 3.0);
      }
    }

    // 1. Whirlwind Auto-Reflex (max 4 triggers inside 125px radar!)
    if (data.reflexCd > 0) data.reflexCd = Math.max(0, data.reflexCd - dt);
    if (data.reflexesLeft > 0 && data.reflexCd <= 0) {
      let triggered = false;

      // Priority A: Enemy enters 125px radar -> Neural Blink Counter-Strike + 0.35s micro-stun!
      for (const e of enemies) {
        if (Math.hypot(e.x - owner.x, e.y - owner.y) <= data.radarRadius + e.radius) {
          triggered = true;
          const oldX = owner.x;
          const oldY = owner.y;
          const flankAng = Math.atan2(owner.y - e.y, owner.x - e.x) + Math.PI * 0.55;
          const nextX = Math.max(
            left + owner.radius + 8,
            Math.min(
              right - owner.radius - 8,
              e.x + Math.cos(flankAng) * (e.radius + owner.radius + 14),
            ),
          );
          const nextY = Math.max(
            top + owner.radius + 8,
            Math.min(
              bottom - owner.radius - 8,
              e.y + Math.sin(flankAng) * (e.radius + owner.radius + 14),
            ),
          );

          owner.afterimages.push({
            x: oldX,
            y: oldY,
            alpha: 0.75,
            color: '#38bdf8',
            formIndex: owner.formIndex,
          });
          owner.x = nextX;
          owner.y = nextY;

          data.wireTraces.push({
            x1: oldX,
            y1: oldY,
            x2: nextX,
            y2: nextY,
            life: 1.5,
            hitUids: {},
          });
          data.reflexArcs.push({ x1: nextX, y1: nextY, x2: e.x, y2: e.y, life: 0.42 });

          e.savedVx = e.vx;
          e.savedVy = e.vy;
          e.stunTimer = Math.max(e.stunTimer, 0.35);
          e.stunKind = 'time-stop';
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 7.6), 0, 0, {
            isCrit: true,
            sourceKind: 'ability',
          });
          ctx.spawnFloatingText(e.x, e.y - e.radius - 16, 'WHIRLWIND!', '#7dd3fc', 'crit');
          ctx.spawnParticles(e.x, e.y, 12, '#38bdf8', 80, 260, 2, 4.5, 'star');
          ctx.emitSfx({ type: 'crit', intensity: 1.0 });
          break;
        }
      }

      // Priority B: Incoming projectile enters 125px radar -> instant auto-evade sidestep!
      if (!triggered) {
        for (const p of ctx.projectiles) {
          if (p.ownerUid === owner.uid) continue;
          if (owner.teamId !== null && p.teamId === owner.teamId) continue;
          if (Math.hypot(p.x - owner.x, p.y - owner.y) <= data.radarRadius) {
            triggered = true;
            const oldX = owner.x;
            const oldY = owner.y;
            const evadeAng = Math.atan2(p.vy, p.vx) + Math.PI / 2;
            const nextX = Math.max(
              left + owner.radius + 8,
              Math.min(right - owner.radius - 8, owner.x + Math.cos(evadeAng) * 56),
            );
            const nextY = Math.max(
              top + owner.radius + 8,
              Math.min(bottom - owner.radius - 8, owner.y + Math.sin(evadeAng) * 56),
            );
            owner.x = nextX;
            owner.y = nextY;
            data.wireTraces.push({
              x1: oldX,
              y1: oldY,
              x2: nextX,
              y2: nextY,
              life: 1.5,
              hitUids: {},
            });
            ctx.spawnFloatingText(
              owner.x,
              owner.y - owner.radius - 14,
              'WHIRLWIND EVADE!',
              '#38bdf8',
              'callout',
            );
            ctx.emitSfx({ type: 'dodge' });
            break;
          }
        }
      }

      if (triggered) {
        data.reflexesLeft -= 1;
        data.reflexCd = 0.42;
      }
    }

    // 2. Update High-Voltage Neural Floor Wire Traces (1.5s duration -> shocks & slows enemies 50%!)
    for (let i = data.wireTraces.length - 1; i >= 0; i--) {
      const tr = data.wireTraces[i];
      tr.life -= dt;
      for (const e of enemies) {
        if (tr.hitUids[e.uid]) continue;
        if (pointToSegmentDist(e.x, e.y, tr.x1, tr.y1, tr.x2, tr.y2) <= e.radius + 10) {
          tr.hitUids[e.uid] = true;
          data.wireSlowTimers[e.uid] = Math.max(data.wireSlowTimers[e.uid] ?? 0, 1.3);
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 4.2), 0, 0, {
            sourceKind: 'ability',
          });
          ctx.spawnParticles(e.x, e.y, 7, '#7dd3fc', 60, 190, 2, 4, 'star');
        }
      }
      if (tr.life <= 0) data.wireTraces.splice(i, 1);
    }
  },
};
