import { applyFighterStun, getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface AatroxUltimateData {
  qSlamsDone: number;
  qCd: number;
  slamX: number;
  slamY: number;
  slamFlash: number;
}

export const aatroxUltimateHandler: UltimateHandler = {
  characterId: 'aatrox',
  title: 'WORLD ENDER (R) · THE DARKIN BLADE',
  subtitle:
    'Grows into the giant World Ender and chains 3 escalating Darkin Blade sweetspot slams (Q1 → Q2 → Q3) knocking enemies airborne & healing massively!',
  bannerColor: '#dc2626',
  castDuration: 0.25,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.giantTimer = Math.max(owner.giantTimer, 3.6);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.2);
    const data: AatroxUltimateData = {
      qSlamsDone: 0,
      qCd: 0.45,
      slamX: owner.x,
      slamY: owner.y,
      slamFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#dc2626', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      210,
      '#dc2626',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'I AM THE WORLD ENDER!',
      '#ef4444',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as AatroxUltimateData;
    if (data.slamFlash > 0) data.slamFlash = Math.max(0, data.slamFlash - dt);

    if (data.qSlamsDone < 3) {
      data.qCd -= dt;
      if (data.qCd <= 0) {
        data.qCd = 0.85;
        data.qSlamsDone += 1;
        data.slamFlash = 0.65;
        const target = ctx.getNearestEnemy(owner);
        const sx = target ? target.x : owner.x;
        const sy = target ? target.y : owner.y;
        data.slamX = sx;
        data.slamY = sy;

        let totalHit = 0;
        const rawMult = data.qSlamsDone === 3 ? 17.5 : data.qSlamsDone === 2 ? 12.0 : 9.5;
        for (const e of ctx.getEnemies(owner)) {
          if (Math.hypot(e.x - sx, e.y - sy) <= 155 + e.radius) {
            totalHit += 1;
            if (data.qSlamsDone === 3) e.shieldTimer = 0;
            e.airborneTimer = Math.max(e.airborneTimer, 0.55);
            applyFighterStun(ctx, owner, e, 0.45, 'airborne', `DARKIN Q${data.qSlamsDone}!`);
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, rawMult), 0, 0, {
              isCrit: data.qSlamsDone === 3,
              bypassInvuln: data.qSlamsDone === 3,
              sourceKind: 'ability',
            });
          }
        }
        if (totalHit > 0) {
          const heal = Math.round(owner.maxHp * 0.08 * getHealMultiplier(owner));
          if (heal > 0) {
            owner.hp = Math.min(owner.maxHp, owner.hp + heal);
            ctx.spawnFloatingText(
              owner.x,
              owner.y - owner.radius - 16,
              `+${heal} DARKIN DRAIN`,
              '#4ade80',
              'heal',
            );
          }
        }
        ctx.spawnShockwave(sx, sy, 165, '#dc2626', 6, owner.character.id, owner.character.series);
        ctx.addScreenShake(data.qSlamsDone === 3 ? 15 : 10);
        ctx.emitSfx({ type: 'crit', intensity: 1.2 });
      }
    }
  },
};
