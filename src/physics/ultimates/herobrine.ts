import type { FighterState } from '../../types/game';
import type { UltimateHandler } from './types';

export interface HerobrineDecoy {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alive: boolean;
  hitFlash: number;
}

export interface RedstoneStrikeMark {
  id: string;
  x: number;
  y: number;
  timer: number;
  maxTimer: number;
  struck: boolean;
  activeTimer: number;
}

export interface HerobrineUltimateData {
  decoys: HerobrineDecoy[];
  strikes: RedstoneStrikeMark[];
  swapTimer: number;
  strikeCd: number;
  shrineX: number;
  shrineY: number;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export const herobrineUltimateHandler: UltimateHandler = {
  characterId: 'herobrine',
  title: 'FOG OF THE OVERWORLD · /BANISH',
  subtitle:
    'Dense fog shrouds the arena · 2 Phantom Clones swap positions & counter with lightning · Redstone Cross calls down white lightning!',
  bannerColor: '#e2e8f0',
  castDuration: 0.35,
  duration: 4.8,

  onCast(ctx, owner, state) {
    const cx = (ctx.bounds.left + ctx.bounds.right) / 2;
    const cy = (ctx.bounds.top + ctx.bounds.bottom) / 2;

    // Spawn 2 Phantom Decoys with autonomous AI!
    const decoys: HerobrineDecoy[] = [];
    for (let i = 0; i < 2; i++) {
      const a = owner.facingAngle + (i === 0 ? 2.1 : -2.1);
      const dx = clamp(owner.x + Math.cos(a) * 110, ctx.bounds.left + 38, ctx.bounds.right - 38);
      const dy = clamp(owner.y + Math.sin(a) * 110, ctx.bounds.top + 38, ctx.bounds.bottom - 38);
      decoys.push({
        id: ctx.nextId('hdecoy'),
        x: dx,
        y: dy,
        vx: Math.cos(a + 0.8) * 310,
        vy: Math.sin(a + 0.8) * 310,
        radius: owner.radius,
        alive: true,
        hitFlash: 0,
      });
    }

    const data: HerobrineUltimateData = {
      decoys,
      strikes: [],
      swapTimer: 1.15,
      strikeCd: 0.55,
      shrineX: cx,
      shrineY: cy,
    };
    state.data = data as unknown as Record<string, unknown>;

    owner.invulnTimer = Math.max(owner.invulnTimer, 0.5);
    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ffffff', 'ULT', true);
    ctx.spawnParticles(owner.x, owner.y, 26, '#e2e8f0', 70, 260, 3, 6, 'pixel');
    ctx.addScreenShake(10);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'beam-charge' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as HerobrineUltimateData;
    const { left, right, top, bottom } = ctx.bounds;
    const enemies = ctx.getEnemies(owner);

    // 1. Update Phantom Decoys (AI movement + bounce + 1-hit counter lightning!)
    for (const d of data.decoys) {
      if (!d.alive) continue;
      if (d.hitFlash > 0) d.hitFlash = Math.max(0, d.hitFlash - dt);

      // Steer lightly toward nearest enemy so decoys look identical to a real Herobrine hunting!
      const nearest = enemies[0];
      if (nearest) {
        const dx = nearest.x - d.x;
        const dy = nearest.y - d.y;
        const dist = Math.max(1, Math.hypot(dx, dy));
        d.vx += (dx / dist) * 140 * dt;
        d.vy += (dy / dist) * 140 * dt;
      }
      const spd = Math.hypot(d.vx, d.vy);
      if (spd > 360) {
        d.vx = (d.vx / spd) * 360;
        d.vy = (d.vy / spd) * 360;
      }
      d.x += d.vx * dt;
      d.y += d.vy * dt;

      if (d.x - d.radius < left) {
        d.x = left + d.radius;
        d.vx = Math.abs(d.vx);
      } else if (d.x + d.radius > right) {
        d.x = right - d.radius;
        d.vx = -Math.abs(d.vx);
      }
      if (d.y - d.radius < top) {
        d.y = top + d.radius;
        d.vy = Math.abs(d.vy);
      } else if (d.y + d.radius > bottom) {
        d.y = bottom - d.radius;
        d.vy = -Math.abs(d.vy);
      }

      // Trigger counter white voxel lightning if enemy collides with decoy OR enemy projectile hits decoy!
      let triggeredBy: FighterState | null = null;
      for (const e of enemies) {
        if (Math.hypot(e.x - d.x, e.y - d.y) <= e.radius + d.radius + 4) {
          triggeredBy = e;
          break;
        }
      }
      if (!triggeredBy) {
        for (const p of ctx.projectiles) {
          if (p.ownerUid === owner.uid) continue;
          if (owner.teamId !== null && p.teamId === owner.teamId) continue;
          if (Math.hypot(p.x - d.x, p.y - d.y) <= p.radius + d.radius) {
            p.life = 0;
            triggeredBy = enemies.find((e) => e.uid === p.ownerUid) ?? enemies[0] ?? null;
            break;
          }
        }
      }

      if (triggeredBy) {
        d.alive = false;
        ctx.spawnParticles(d.x, d.y, 20, '#f8fafc', 70, 260, 3, 6, 'pixel');
        ctx.spawnFloatingText(d.x, d.y - d.radius - 14, 'PHANTOM COUNTER!', '#ffffff', 'callout');
        ctx.lightningBolts.push({
          id: ctx.nextId('hcnt'),
          ownerCharId: owner.character.id,
          ownerSeries: owner.character.series,
          points: [
            { x: d.x, y: d.y },
            { x: (d.x + triggeredBy.x) / 2, y: d.y },
            { x: triggeredBy.x, y: triggeredBy.y },
          ],
          color: '#ffffff',
          coreColor: '#38bdf8',
          width: 7,
          life: 0.35,
          maxLife: 0.35,
        });
        const ang = Math.atan2(triggeredBy.y - d.y, triggeredBy.x - d.x);
        ctx.applyDamage(
          owner,
          triggeredBy,
          ctx.getEffectiveDamage(owner, 11.5),
          Math.cos(ang) * 440,
          Math.sin(ang) * 440,
          { isCrit: true, sourceKind: 'ability' },
        );
        ctx.addScreenShake(8);
        ctx.emitSfx({ type: 'crit', intensity: 1.1 });
      }
    }

    // 2. Periodically swap positions between REAL Herobrine and a living Decoy every 1.2s!
    data.swapTimer -= dt;
    if (data.swapTimer <= 0) {
      data.swapTimer = 1.2;
      const aliveDecoys = data.decoys.filter((d) => d.alive);
      if (aliveDecoys.length > 0 && owner.stunTimer <= 0) {
        const pick = aliveDecoys[Math.floor(Math.random() * aliveDecoys.length)];
        const ox = owner.x;
        const oy = owner.y;
        owner.afterimages.push({
          x: ox,
          y: oy,
          alpha: 0.85,
          color: '#ffffff',
          formIndex: owner.formIndex,
        });
        owner.x = clamp(pick.x, left + owner.radius + 4, right - owner.radius - 4);
        owner.y = clamp(pick.y, top + owner.radius + 4, bottom - owner.radius - 4);
        pick.x = ox;
        pick.y = oy;
        ctx.spawnParticles(owner.x, owner.y, 10, '#e2e8f0', 40, 150, 2.5, 5, 'pixel');
        ctx.emitSfx({ type: 'dodge' });
      }
    }

    // 3. Place Redstone Torch Crosses under enemies -> 0.6s telegraph -> Stepped Voxel White Lightning!
    data.strikeCd -= dt;
    if (data.strikeCd <= 0 && enemies.length > 0) {
      data.strikeCd = 1.05;
      const target = enemies[Math.floor(Math.random() * enemies.length)];
      data.strikes.push({
        id: ctx.nextId('hmark'),
        x: clamp(target.x, left + 28, right - 28),
        y: clamp(target.y, top + 40, bottom - 28),
        timer: 0.6,
        maxTimer: 0.6,
        struck: false,
        activeTimer: 0.32,
      });
      ctx.emitSfx({ type: 'beam-charge' });
    }

    for (let i = data.strikes.length - 1; i >= 0; i--) {
      const st = data.strikes[i];
      if (!st.struck) {
        st.timer -= dt;
        if (st.timer <= 0) {
          st.struck = true;
          ctx.addScreenShake(9);
          ctx.spawnShockwave(
            st.x,
            st.y,
            92,
            '#ffffff',
            5,
            owner.character.id,
            owner.character.series,
          );
          ctx.spawnParticles(st.x, st.y, 16, '#ffffff', 90, 300, 3, 6, 'pixel');
          ctx.emitSfx({ type: 'beam-fire', intensity: 1.1 });

          for (const e of enemies) {
            if (Math.hypot(e.x - st.x, e.y - st.y) <= 56 + e.radius) {
              // Breaks enemy shield immediately!
              e.shieldTimer = 0;
              const ang = Math.atan2(e.y - st.y, e.x - st.x);
              ctx.applyDamage(
                owner,
                e,
                ctx.getEffectiveDamage(owner, 12.8),
                Math.cos(ang) * 410,
                Math.sin(ang) * 410,
                { isCrit: true, bypassInvuln: false, sourceKind: 'ability' },
              );
            }
          }
        }
      } else {
        st.activeTimer -= dt;
        if (st.activeTimer <= 0) {
          data.strikes.splice(i, 1);
        }
      }
    }
  },
};
