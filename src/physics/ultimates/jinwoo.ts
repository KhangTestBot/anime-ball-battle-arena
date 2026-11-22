import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface ShadowMarshal {
  role: 'igris' | 'beru';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  attackCd: number;
  slashAnim: number;
  wingPhase: number;
}

export interface JinwooUltimateData {
  igris: ShadowMarshal;
  beru: ShadowMarshal;
  shadowExchangeUsed: boolean;
  systemPopupTimer: number;
}

export const jinwooUltimateHandler: UltimateHandler = {
  characterId: 'jinwoo',
  title: 'ARISE! — IGRIS & BERU SHADOW EXTRACTION',
  subtitle:
    'Igris (Vanguard blocks projectiles + slashes) · Beru (Ant King hunts low-HP foes + lifesteal) · Shadow Exchange escapes danger below 35% HP!',
  bannerColor: '#a855f7',
  castDuration: 0.25,
  duration: 5.2,

  onCast(ctx, owner, state) {
    const form = ctx.getForm(owner);
    const marshalHp = 110 + form.powerLevel * 28;
    const { left, right, top, bottom } = ctx.bounds;

    const data: JinwooUltimateData = {
      igris: {
        role: 'igris',
        x: Math.max(left + 32, Math.min(right - 32, owner.x + 48)),
        y: Math.max(top + 32, Math.min(bottom - 32, owner.y - 26)),
        vx: 0,
        vy: 0,
        radius: 20,
        hp: marshalHp,
        maxHp: marshalHp,
        attackCd: 0.25,
        slashAnim: 0,
        wingPhase: 0,
      },
      beru: {
        role: 'beru',
        x: Math.max(left + 32, Math.min(right - 32, owner.x - 48)),
        y: Math.max(top + 32, Math.min(bottom - 32, owner.y + 26)),
        vx: 0,
        vy: 0,
        radius: 18,
        hp: marshalHp * 0.9,
        maxHp: marshalHp * 0.9,
        attackCd: 0.3,
        slashAnim: 0,
        wingPhase: 0,
      },
      shadowExchangeUsed: false,
      systemPopupTimer: 1.65,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#a855f7', 'ULT', true);
    ctx.spawnFloatingText(owner.x, owner.y - owner.radius - 20, 'ARISE!!', '#c084fc', 'powerup');
    ctx.spawnParticles(owner.x, owner.y, 26, '#a855f7', 70, 270, 3, 6.5, 'pixel');
    ctx.addScreenShake(10);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as JinwooUltimateData;
    const { left, right, top, bottom } = ctx.bounds;
    const enemies = ctx.getEnemies(owner);
    if (data.systemPopupTimer > 0) data.systemPopupTimer = Math.max(0, data.systemPopupTimer - dt);

    // 1. SHADOW EXCHANGE emergency swap when Jinwoo drops below 35% Max HP!
    if (!data.shadowExchangeUsed && data.igris.hp > 0 && owner.hp <= owner.maxHp * 0.35) {
      data.shadowExchangeUsed = true;
      const ox = owner.x;
      const oy = owner.y;
      owner.x = data.igris.x;
      owner.y = data.igris.y;
      data.igris.x = ox;
      data.igris.y = oy;
      owner.invulnTimer = Math.max(owner.invulnTimer, 0.45);
      ctx.spawnParticles(owner.x, owner.y, 16, '#a855f7', 70, 220, 3, 6, 'pixel');
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 16,
        'SHADOW EXCHANGE!',
        '#38bdf8',
        'powerup',
      );
      ctx.emitSfx({ type: 'dodge' });
    }

    // 2. IGRIS AI (Blood-Red Knight Commander): guards near Jinwoo, intercepts enemy projectiles, wide sword slash!
    const igris = data.igris;
    if (igris.hp > 0) {
      igris.slashAnim = Math.max(0, igris.slashAnim - dt);
      igris.attackCd = Math.max(0, igris.attackCd - dt);
      const nearest = ctx.getNearestEnemy(owner);
      const guardAngle = nearest
        ? Math.atan2(nearest.y - owner.y, nearest.x - owner.x)
        : state.elapsed * 2;
      const goalX = Math.max(left + 24, Math.min(right - 24, owner.x + Math.cos(guardAngle) * 68));
      const goalY = Math.max(top + 24, Math.min(bottom - 24, owner.y + Math.sin(guardAngle) * 68));
      igris.vx += (goalX - igris.x) * 14 * dt;
      igris.vy += (goalY - igris.y) * 14 * dt;
      igris.vx *= Math.pow(0.15, dt);
      igris.vy *= Math.pow(0.15, dt);
      igris.x = Math.max(left + 20, Math.min(right - 20, igris.x + igris.vx * dt * 10));
      igris.y = Math.max(top + 20, Math.min(bottom - 20, igris.y + igris.vy * dt * 10));

      // Intercept enemy projectiles near Igris! (costs Igris HP slightly for fair counterplay)
      for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
        const p = ctx.projectiles[i];
        if (p.ownerUid === owner.uid) continue;
        if (owner.teamId !== null && p.teamId === owner.teamId) continue;
        if (Math.hypot(p.x - igris.x, p.y - igris.y) <= igris.radius + p.radius + 14) {
          igris.hp = Math.max(0, igris.hp - Math.min(18, p.damage * 0.45));
          ctx.spawnParticles(p.x, p.y, 7, '#ef4444', 50, 160, 2, 4.5, 'shard');
          ctx.projectiles.splice(i, 1);
        }
      }

      if (igris.attackCd <= 0) {
        for (const e of enemies) {
          if (Math.hypot(e.x - igris.x, e.y - igris.y) <= igris.radius + e.radius + 36) {
            igris.attackCd = 0.65;
            igris.slashAnim = 0.35;
            const dx = e.x - igris.x;
            const dy = e.y - igris.y;
            const d = Math.max(1, Math.hypot(dx, dy));
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, 7.0),
              (dx / d) * 280,
              (dy / d) * 280,
              {
                sourceKind: 'ability',
              },
            );
            ctx.spawnParticles(e.x, e.y, 10, '#ef4444', 70, 210, 2.5, 5, 'shard');
            ctx.emitSfx({ type: 'slash', intensity: 1.0 });
            break;
          }
        }
      }
    }

    // 3. BERU AI (Ant King Assassin): teleports & mauls lowest-HP enemy + heals Jinwoo!
    const beru = data.beru;
    if (beru.hp > 0 && enemies.length > 0) {
      beru.wingPhase += dt * 32;
      beru.slashAnim = Math.max(0, beru.slashAnim - dt);
      beru.attackCd = Math.max(0, beru.attackCd - dt);

      let prey = enemies[0];
      for (const e of enemies) {
        if (e.hp < prey.hp) prey = e;
      }

      const dx = prey.x - beru.x;
      const dy = prey.y - beru.y;
      const dist = Math.max(1, Math.hypot(dx, dy));

      // Blink behind prey if far away, otherwise dash swiftly!
      if (dist > 145 && beru.attackCd <= 0.1) {
        beru.x = Math.max(left + 20, Math.min(right - 20, prey.x - (dx / dist) * 32));
        beru.y = Math.max(top + 20, Math.min(bottom - 20, prey.y - (dy / dist) * 32));
        ctx.spawnParticles(beru.x, beru.y, 10, '#a855f7', 60, 180, 2, 4.5, 'pixel');
      } else {
        beru.x = Math.max(left + 20, Math.min(right - 20, beru.x + (dx / dist) * 440 * dt));
        beru.y = Math.max(top + 20, Math.min(bottom - 20, beru.y + (dy / dist) * 440 * dt));
      }

      if (
        Math.hypot(prey.x - beru.x, prey.y - beru.y) <= beru.radius + prey.radius + 22 &&
        beru.attackCd <= 0
      ) {
        beru.attackCd = 0.62;
        beru.slashAnim = 0.35;
        const dealt = ctx.applyDamage(
          owner,
          prey,
          ctx.getEffectiveDamage(owner, 6.8),
          (dx / dist) * 180,
          (dy / dist) * 180,
          { isCrit: true, sourceKind: 'ability' },
        );
        // Beru venom claw heals Jinwoo for 30% of damage dealt!
        const healMult = getHealMultiplier(owner);
        if (dealt > 0 && owner.alive && healMult > 0) {
          const heal = Math.min(
            owner.maxHp - owner.hp,
            Math.max(1, Math.round(dealt * 0.3 * healMult)),
          );
          if (heal > 0) {
            owner.hp += heal;
            ctx.spawnFloatingText(
              owner.x,
              owner.y - owner.radius - 10,
              `+${heal} ARISE`,
              '#4ade80',
              'heal',
            );
          }
        }
        ctx.spawnParticles(prey.x, prey.y, 10, '#22d3ee', 70, 220, 2, 4.5, 'shard');
        ctx.emitSfx({ type: 'crit', intensity: 0.95 });
      }
    }
  },
};
