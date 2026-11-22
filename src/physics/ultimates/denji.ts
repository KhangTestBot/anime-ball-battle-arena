import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface BloodDropOrb {
  id: string;
  x: number;
  y: number;
  life: number;
}

export interface DenjiUltimateData {
  tetheredUid: string | null;
  tetherTimer: number;
  hookFlying: boolean;
  hookX: number;
  hookY: number;
  hookVx: number;
  hookVy: number;
  grindCd: number;
  bloodDrops: BloodDropOrb[];
  sawSpin: number;
}

export const denjiUltimateHandler: UltimateHandler = {
  characterId: 'denji',
  title: 'POCHITA FULL DEVIL: CHAINSAW RIP & BLOOD ENGINE',
  subtitle:
    'Fires chainsaw hooks to latch & reel enemies into relentless shredding · Spatters Blood Drops healing 3% HP & extending the rampage!',
  bannerColor: '#ef4444',
  castDuration: 0.25,
  duration: 4.2,

  onCast(ctx, owner, state) {
    const target = ctx.getNearestEnemy(owner);
    const angle = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
    owner.facingAngle = angle;

    const data: DenjiUltimateData = {
      tetheredUid: null,
      tetherTimer: 0,
      hookFlying: true,
      hookX: owner.x + Math.cos(angle) * (owner.radius + 10),
      hookY: owner.y + Math.sin(angle) * (owner.radius + 10),
      hookVx: Math.cos(angle) * 760,
      hookVy: Math.sin(angle) * 760,
      grindCd: 0.14,
      bloodDrops: [],
      sawSpin: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, angle, '#ef4444', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'CHAINSAW CARNAGE!!',
      '#ef4444',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 20, '#ef4444', 80, 270, 2.5, 5.5, 'spark');
    ctx.addScreenShake(9);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'slash', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as DenjiUltimateData;
    const { left, right, top, bottom } = ctx.bounds;
    const enemies = ctx.getEnemies(owner);
    data.sawSpin += dt * 36;

    // 1. Update Chainsaw Ripcord Hook projectile until it snags an enemy!
    if (data.hookFlying) {
      data.hookX += data.hookVx * dt;
      data.hookY += data.hookVy * dt;

      for (const e of enemies) {
        if (Math.hypot(e.x - data.hookX, e.y - data.hookY) <= e.radius + 18) {
          data.hookFlying = false;
          data.tetheredUid = e.uid;
          data.tetherTimer = 2.3;
          ctx.spawnFloatingText(e.x, e.y - e.radius - 16, 'HOOKED!! VROOM!', '#ef4444', 'powerup');
          ctx.addScreenShake(8);
          ctx.emitSfx({ type: 'hit', intensity: 1.15 });
          break;
        }
      }

      if (
        data.hookFlying &&
        (data.hookX < left + 10 ||
          data.hookX > right - 10 ||
          data.hookY < top + 10 ||
          data.hookY > bottom - 10)
      ) {
        data.hookFlying = false;
      }
    }

    // 2. Active Tether Reel: pulls victim into Denji's triple saws & grinds every 0.16s!
    // Breaks cleanly if Denji is hard-stunned (counterplay)!
    if (data.tetheredUid && data.tetherTimer > 0) {
      if (owner.stunTimer > 0) {
        data.tetheredUid = null;
        data.tetherTimer = 0;
      } else {
        data.tetherTimer -= dt;
        const prey = enemies.find((e) => e.uid === data.tetheredUid);
        if (!prey) {
          data.tetheredUid = null;
        } else {
          const dx = owner.x - prey.x;
          const dy = owner.y - prey.y;
          const dist = Math.max(1, Math.hypot(dx, dy));
          const minPull = owner.radius + prey.radius + 8;
          if (dist > minPull) {
            prey.vx += (dx / dist) * 820 * dt;
            prey.vy += (dy / dist) * 820 * dt;
            owner.vx -= (dx / dist) * 320 * dt;
            owner.vy -= (dy / dist) * 320 * dt;
          }

          data.grindCd -= dt;
          if (data.grindCd <= 0 && dist <= owner.radius + prey.radius + 44) {
            data.grindCd = 0.18;
            ctx.applyDamage(owner, prey, ctx.getEffectiveDamage(owner, 3.3), 0, 0, {
              sourceKind: 'ability',
            });
            ctx.spawnParticles(
              (owner.x + prey.x) * 0.5,
              (owner.y + prey.y) * 0.5,
              7,
              '#f97316',
              90,
              260,
              2,
              4.5,
              'spark',
            );
            ctx.addScreenShake(4);
            ctx.emitSfx({ type: 'slash', intensity: 0.75 });

            // Spill a physical Crimson Blood Drop onto the arena floor!
            if (data.bloodDrops.length < 10) {
              const bAng = Math.random() * Math.PI * 2;
              const bx = Math.max(left + 22, Math.min(right - 22, prey.x + Math.cos(bAng) * 42));
              const by = Math.max(top + 22, Math.min(bottom - 22, prey.y + Math.sin(bAng) * 42));
              data.bloodDrops.push({ id: ctx.nextId('bdrop'), x: bx, y: by, life: 4.0 });
            }
          }
        }
      }
    }

    // 3. Blood Fuel Drops: rolling over Blood Drops heals +3% Max HP & extends active duration by 0.25s (capped)!
    for (let i = data.bloodDrops.length - 1; i >= 0; i--) {
      const b = data.bloodDrops[i];
      b.life -= dt;
      if (Math.hypot(owner.x - b.x, owner.y - b.y) <= owner.radius + 16) {
        data.bloodDrops.splice(i, 1);
        const healMult = getHealMultiplier(owner);
        if (healMult > 0) {
          const heal = Math.min(
            owner.maxHp - owner.hp,
            Math.max(3, Math.round(owner.maxHp * 0.03 * healMult)),
          );
          if (heal > 0) {
            owner.hp += heal;
            ctx.spawnFloatingText(
              owner.x,
              owner.y - owner.radius - 10,
              `+${heal} BLOOD`,
              '#ef4444',
              'heal',
            );
          }
        }
        state.duration = Math.min(5.6, state.duration + 0.25);
        ctx.emitSfx({ type: 'heal' });
        continue;
      }
      if (b.life <= 0) data.bloodDrops.splice(i, 1);
    }
  },
};
