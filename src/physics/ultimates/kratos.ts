import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface LeviathanAxeState {
  phase: 'outgoing' | 'embedded' | 'returning' | 'done';
  x: number;
  y: number;
  vx: number;
  vy: number;
  spin: number;
  embedTimer: number;
  hitOutUids: Record<string, boolean>;
  hitReturnUids: Record<string, boolean>;
}

export interface ChainWhipArc {
  targetX: number;
  targetY: number;
  life: number;
}

export interface KratosUltimateData {
  axe: LeviathanAxeState;
  chainsFired: boolean;
  chainDelay: number;
  whipArcs: ChainWhipArc[];
  omegaX: number;
  omegaY: number;
}

export const kratosUltimateHandler: UltimateHandler = {
  characterId: 'kratos',
  title: 'SPARTAN RAGE: BLADES OF CHAOS & LEVIATHAN AXE',
  subtitle:
    'Leviathan Axe freezes targets → Recalls slicing through → Blades of Chaos yank & trigger Thermal Shock detonation (+40% lifesteal)!',
  bannerColor: '#ef4444',
  castDuration: 0.25,
  duration: 4.2,

  onCast(ctx, owner, state) {
    const target = ctx.getNearestEnemy(owner);
    const angle = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
    owner.facingAngle = angle;

    const data: KratosUltimateData = {
      axe: {
        phase: 'outgoing',
        x: owner.x + Math.cos(angle) * (owner.radius + 10),
        y: owner.y + Math.sin(angle) * (owner.radius + 10),
        vx: Math.cos(angle) * 680,
        vy: Math.sin(angle) * 680,
        spin: 0,
        embedTimer: 0.45,
        hitOutUids: {},
        hitReturnUids: {},
      },
      chainsFired: false,
      chainDelay: 1.55,
      whipArcs: [],
      omegaX: owner.x,
      omegaY: owner.y,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, angle, '#ef4444', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'SPARTAN RAGE · Ω!',
      '#ef4444',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 18, '#7dd3fc', 70, 230, 3, 6, 'shard');
    ctx.addScreenShake(9);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'slash', intensity: 1.15 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as KratosUltimateData;
    const enemies = ctx.getEnemies(owner);
    const axe = data.axe;

    for (let i = data.whipArcs.length - 1; i >= 0; i--) {
      data.whipArcs[i].life -= dt;
      if (data.whipArcs[i].life <= 0) data.whipArcs.splice(i, 1);
    }

    // 1. Phase 1: Leviathan Axe outgoing -> embeds with Frost -> boomerangs back to Kratos!
    if (axe.phase === 'outgoing') {
      axe.spin += dt * 22;
      axe.x += axe.vx * dt;
      axe.y += axe.vy * dt;

      for (const e of enemies) {
        if (axe.hitOutUids[e.uid]) continue;
        if (Math.hypot(e.x - axe.x, e.y - axe.y) <= e.radius + 20) {
          axe.hitOutUids[e.uid] = true;
          e.frostTimer = Math.max(e.frostTimer, 3.2);
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 9.5),
            axe.vx * 0.2,
            axe.vy * 0.2,
            {
              sourceKind: 'ability',
            },
          );
          ctx.spawnFloatingText(e.x, e.y - e.radius - 14, 'FROST!', '#7dd3fc', 'callout');
          ctx.spawnParticles(e.x, e.y, 14, '#7dd3fc', 60, 200, 2.5, 5, 'shard');
          axe.phase = 'embedded';
          axe.embedTimer = 0.42;
          ctx.emitSfx({ type: 'hit', intensity: 1.1 });
          break;
        }
      }

      if (
        axe.phase === 'outgoing' &&
        (axe.x <= ctx.bounds.left + 16 ||
          axe.x >= ctx.bounds.right - 16 ||
          axe.y <= ctx.bounds.top + 16 ||
          axe.y >= ctx.bounds.bottom - 16)
      ) {
        axe.x = Math.max(ctx.bounds.left + 16, Math.min(ctx.bounds.right - 16, axe.x));
        axe.y = Math.max(ctx.bounds.top + 16, Math.min(ctx.bounds.bottom - 16, axe.y));
        axe.phase = 'embedded';
        axe.embedTimer = 0.35;
        ctx.emitSfx({ type: 'wall', intensity: 1.0 });
      }
    } else if (axe.phase === 'embedded') {
      axe.embedTimer -= dt;
      if (axe.embedTimer <= 0) {
        axe.phase = 'returning';
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 14,
          'AXE RECALL!',
          '#7dd3fc',
          'callout',
        );
      }
    } else if (axe.phase === 'returning') {
      axe.spin -= dt * 26;
      const dx = owner.x - axe.x;
      const dy = owner.y - axe.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= owner.radius + 18) {
        axe.phase = 'done';
        ctx.spawnParticles(owner.x, owner.y, 10, '#7dd3fc', 60, 170, 2, 4.5, 'shard');
      } else {
        axe.x += (dx / dist) * 780 * dt;
        axe.y += (dy / dist) * 780 * dt;
        for (const e of enemies) {
          if (axe.hitReturnUids[e.uid]) continue;
          if (Math.hypot(e.x - axe.x, e.y - axe.y) <= e.radius + 22) {
            axe.hitReturnUids[e.uid] = true;
            e.frostTimer = Math.max(e.frostTimer, 3.2);
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, 8.2),
              (dx / dist) * 260,
              (dy / dist) * 260,
              {
                sourceKind: 'ability',
              },
            );
            ctx.spawnParticles(e.x, e.y, 10, '#7dd3fc', 60, 190, 2, 5, 'shard');
            ctx.emitSfx({ type: 'slash', intensity: 1.0 });
          }
        }
      }
    }

    // 2. Phase 2: Twin Chained Blades of Chaos yank enemies & trigger Thermal Detonation (Frost + Burn = 1.6x Crit + 40% Lifesteal!)
    if (!data.chainsFired) {
      data.chainDelay -= dt;
      if (data.chainDelay <= 0 || axe.phase === 'done') {
        data.chainsFired = true;
        ctx.addScreenShake(13);
        ctx.addHitstop(0.055);
        ctx.emitSfx({ type: 'crit', intensity: 1.25 });

        for (const e of enemies) {
          const dx = owner.x - e.x;
          const dy = owner.y - e.y;
          const dist = Math.hypot(dx, dy);
          if (dist <= 310) {
            data.whipArcs.push({ targetX: e.x, targetY: e.y, life: 0.72 });
            const isFrosted = e.frostTimer > 0;
            const mult = isFrosted ? 1.6 : 1.0;
            const nx = dist > 0.1 ? dx / dist : 1;
            const ny = dist > 0.1 ? dy / dist : 0;

            const dealt = ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, 13.5 * mult),
              nx * 460,
              ny * 460,
              { isCrit: isFrosted, sourceKind: 'ability' },
            );

            // Ignite Spartan Burn
            e.burnTimer = Math.max(e.burnTimer, 3.0);
            e.burnDps = Math.max(e.burnDps, ctx.getEffectiveDamage(owner, 2.2));
            e.burnOwnerUid = owner.uid;

            if (isFrosted) {
              e.frostTimer = 0;
              ctx.spawnShockwave(
                e.x,
                e.y,
                135,
                '#f97316',
                6,
                owner.character.id,
                owner.character.series,
              );
              ctx.spawnParticles(e.x, e.y, 20, '#ffffff', 90, 310, 3, 6.5, 'circle');
              ctx.spawnFloatingText(
                e.x,
                e.y - e.radius - 20,
                'THERMAL BLAST x1.6!',
                '#f97316',
                'powerup',
              );

              // 40% Spartan Rage Lifesteal on Thermal Detonation!
              const hMult = getHealMultiplier(owner);
              if (dealt > 0 && owner.alive && hMult > 0) {
                const heal = Math.min(
                  owner.maxHp - owner.hp,
                  Math.max(2, Math.round(dealt * 0.4 * hMult)),
                );
                if (heal > 0) {
                  owner.hp += heal;
                  ctx.spawnFloatingText(
                    owner.x,
                    owner.y - owner.radius - 10,
                    `+${heal} RAGE`,
                    '#4ade80',
                    'heal',
                  );
                }
              }
            }
          }
        }
      }
    }
  },
};
