import { applyFighterStun } from '../domains';
import type { UltimateHandler } from './types';

export interface IronGolemUltimateData {
  slamsDone: number;
  slamCd: number;
  flash: number;
}

export const ironGolemUltimateHandler: UltimateHandler = {
  characterId: 'irongolem',
  title: 'VILLAGE GUARDIAN: IRON UPPERCUT & SLAM',
  subtitle:
    'Activates unstoppable Iron Armor, smashes arena obstacles apart, and launches all nearby enemies sky-high with 2 colossal uppercuts!',
  bannerColor: '#cbd5e1',
  castDuration: 0.25,
  duration: 3.6,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.2);
    owner.enchantArmorTimer = Math.max(owner.enchantArmorTimer, 3.2);
    owner.giantTimer = Math.max(owner.giantTimer, 3.0);

    const data: IronGolemUltimateData = {
      slamsDone: 0,
      slamCd: 0.5,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, 0, '#cbd5e1', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'IRON GUARDIAN!',
      '#f8fafc',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as IronGolemUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (data.slamsDone < 2) {
      data.slamCd -= dt;
      if (data.slamCd <= 0) {
        data.slamCd = 1.05;
        data.slamsDone += 1;
        data.flash = 0.7;

        for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
          if (Math.hypot(ctx.obstacles[i].x - owner.x, ctx.obstacles[i].y - owner.y) <= 240) {
            ctx.obstacles.splice(i, 1);
          }
        }

        for (const e of ctx.getEnemies(owner)) {
          if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 235 + e.radius) {
            e.shieldTimer = 0;
            e.airborneTimer = Math.max(e.airborneTimer, 0.9);
            applyFighterStun(ctx, owner, e, 0.75, 'airborne', 'LAUNCHED!');
            const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, data.slamsDone === 2 ? 19.5 : 13.0),
              Math.cos(ang) * 540,
              Math.sin(ang) * 540,
              {
                isCrit: data.slamsDone === 2,
                bypassInvuln: data.slamsDone === 2,
                sourceKind: 'ability',
              },
            );
          }
        }
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          240,
          '#e2e8f0',
          8,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnParticles(owner.x, owner.y, 24, '#cbd5e1', 90, 300, 3, 6.5, 'pixel');
        ctx.addScreenShake(15);
        ctx.emitSfx({ type: 'crit', intensity: 1.25 });
      }
    }
  },
};
