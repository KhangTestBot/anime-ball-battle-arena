import { applyFighterStun } from '../domains';
import type { UltimateHandler } from './types';

export interface GyomeiUltimateData {
  swingsDone: number;
  swingCd: number;
  flailAngle: number;
  swingFlash: number;
}

export const gyomeiUltimateHandler: UltimateHandler = {
  characterId: 'gyomei',
  title: 'STONE BREATHING: VOLCANIC ROCK · RAPID CONQUEST',
  subtitle:
    'Enters Transparent World with unstoppable mass, swinging his chained Flail & Axe in 3 colossal shockwaves smashing obstacles, shields & armor!',
  bannerColor: '#a8a29e',
  castDuration: 0.26,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.4);
    owner.enchantArmorTimer = Math.max(owner.enchantArmorTimer, 3.4);
    const data: GyomeiUltimateData = {
      swingsDone: 0,
      swingCd: 0.45,
      flailAngle: owner.facingAngle,
      swingFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#a8a29e', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'NAMU AMIDA BUTSU!',
      '#e7e5e4',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as GyomeiUltimateData;
    data.flailAngle += dt * 11;
    if (data.swingFlash > 0) data.swingFlash = Math.max(0, data.swingFlash - dt);

    if (data.swingsDone < 3) {
      data.swingCd -= dt;
      if (data.swingCd <= 0) {
        data.swingCd = 0.85;
        data.swingsDone += 1;
        data.swingFlash = 0.55;

        // Shatter all nearby obstacles with the giant spiked flail!
        for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
          if (Math.hypot(ctx.obstacles[i].x - owner.x, ctx.obstacles[i].y - owner.y) <= 255) {
            ctx.obstacles.splice(i, 1);
          }
        }

        for (const e of ctx.getEnemies(owner)) {
          if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 245 + e.radius) {
            e.shieldTimer = 0;
            e.armorShredTimer = Math.max(e.armorShredTimer, 3.2);
            const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, data.swingsDone === 3 ? 16.5 : 10.5),
              Math.cos(ang) * 440,
              Math.sin(ang) * 440,
              {
                isCrit: data.swingsDone === 3,
                bypassInvuln: data.swingsDone === 3,
                sourceKind: 'ability',
              },
            );
            if (data.swingsDone === 3) {
              applyFighterStun(ctx, owner, e, 0.7, 'chained', 'CRUSHED!');
            }
          }
        }
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          240,
          '#a8a29e',
          7,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnParticles(owner.x, owner.y, 20, '#d6d3d1', 80, 260, 3, 6.5, 'shard');
        ctx.addScreenShake(13);
        ctx.emitSfx({ type: 'crit', intensity: 1.25 });
      }
    }
  },
};
