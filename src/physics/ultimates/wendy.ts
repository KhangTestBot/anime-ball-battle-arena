import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface WendyUltimateData {
  swirlAngle: number;
  drillFired: boolean;
  flash: number;
}

export const wendyUltimateHandler: UltimateHandler = {
  characterId: 'wendy',
  title: 'DRAGON FORCE: SHATTERING LIGHT · SKY DRILL',
  subtitle:
    'Casts Deus Eques & Troia cleansing status effects, healing +22% HP & boosting +15% DMG, then erupts a sweeping Sky Drill cyclone!',
  bannerColor: '#34d399',
  castDuration: 0.24,
  duration: 3.6,

  onCast(ctx, owner, state) {
    owner.burnTimer = 0;
    owner.karmaTimer = 0;
    owner.frostTimer = 0;
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.0);
    owner.shieldColor = '#34d399';
    owner.dmgBonusPct += 15;

    const heal = Math.round(owner.maxHp * 0.22 * getHealMultiplier(owner));
    if (heal > 0) {
      owner.hp = Math.min(owner.maxHp, owner.hp + heal);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 16,
        `+${heal} SKY HEAL`,
        '#4ade80',
        'heal',
      );
    }

    const data: WendyUltimateData = {
      swirlAngle: 0,
      drillFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#34d399', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'DRAGON FORCE ENCHANT!',
      '#6ee7b7',
      'powerup',
    );
    ctx.addScreenShake(9);
    ctx.emitSfx({ type: 'heal' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as WendyUltimateData;
    data.swirlAngle += dt * 13;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.drillFired && state.elapsed >= 1.45) {
      data.drillFired = true;
      data.flash = 1.2;
      for (const e of ctx.getEnemies(owner)) {
        if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 275 + e.radius) {
          e.shieldTimer = 0;
          const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 19.5),
            Math.cos(ang) * 520,
            Math.sin(ang) * 520,
            {
              isCrit: true,
              bypassInvuln: true,
              sourceKind: 'ability',
            },
          );
        }
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        275,
        '#34d399',
        8,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(owner.x, owner.y - owner.radius - 26, 'SKY DRILL!!', '#a7f3d0', 'crit');
      ctx.addScreenShake(15);
      ctx.addHitstop(0.06);
      ctx.emitSfx({ type: 'crit', intensity: 1.25 });
    }
  },
};
