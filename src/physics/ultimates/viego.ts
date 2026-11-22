import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface ViegoUltimateData {
  heartbreakerLanded: boolean;
  slamX: number;
  slamY: number;
  slamFlash: number;
}

export const viegoUltimateHandler: UltimateHandler = {
  characterId: 'viego',
  title: 'HARROWED PATH · HEARTBREAKER (R)',
  subtitle:
    'Shrouds the arena in Black Mist for evasion, blinks onto the weakest foe with Heartbreaker shattering shields, and steals HP + permanent +15% DMG!',
  bannerColor: '#10b981',
  castDuration: 0.24,
  duration: 3.5,

  onCast(ctx, owner, state) {
    owner.evadeTimer = Math.max(owner.evadeTimer, 2.2);
    owner.untargetableTimer = Math.max(owner.untargetableTimer, 0.55);
    const data: ViegoUltimateData = {
      heartbreakerLanded: false,
      slamX: owner.x,
      slamY: owner.y,
      slamFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#10b981', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'RUINATION!!',
      '#34d399',
      'powerup',
    );
    ctx.addScreenShake(9);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ViegoUltimateData;
    if (data.slamFlash > 0) data.slamFlash = Math.max(0, data.slamFlash - dt);

    if (!data.heartbreakerLanded && state.elapsed >= 1.15) {
      data.heartbreakerLanded = true;
      data.slamFlash = 1.25;
      const enemies = ctx.getEnemies(owner);
      const weakest = enemies.sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0] ?? null;
      if (weakest) {
        owner.x = Math.max(
          ctx.bounds.left + owner.radius,
          Math.min(ctx.bounds.right - owner.radius, weakest.x),
        );
        owner.y = Math.max(
          ctx.bounds.top + owner.radius,
          Math.min(ctx.bounds.bottom - owner.radius, weakest.y),
        );
        data.slamX = weakest.x;
        data.slamY = weakest.y;

        weakest.shieldTimer = 0;
        const missingRatio = Math.max(0, 1 - weakest.hp / Math.max(1, weakest.maxHp));
        ctx.applyDamage(
          owner,
          weakest,
          ctx.getEffectiveDamage(owner, 19.5 + missingRatio * 12),
          0,
          0,
          {
            isCrit: true,
            bypassInvuln: true,
            sourceKind: 'ability',
          },
        );

        // Sovereign's Domination possession buff!
        owner.dmgBonusPct += 15;
        const heal = Math.round(owner.maxHp * 0.14 * getHealMultiplier(owner));
        if (heal > 0) {
          owner.hp = Math.min(owner.maxHp, owner.hp + heal);
          ctx.spawnFloatingText(
            owner.x,
            owner.y - owner.radius - 16,
            `+${heal} POSSESSION`,
            '#34d399',
            'heal',
          );
        }
        ctx.spawnShockwave(
          weakest.x,
          weakest.y,
          215,
          '#10b981',
          8,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(
          weakest.x,
          weakest.y - weakest.radius - 28,
          'HEARTBREAKER!',
          '#6ee7b7',
          'crit',
        );
        ctx.addScreenShake(15);
        ctx.addHitstop(0.065);
        ctx.emitSfx({ type: 'ko', intensity: 1.25 });
      }
    }
  },
};
