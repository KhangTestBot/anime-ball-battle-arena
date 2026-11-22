import type { UltimateHandler } from './types';

export interface ReinerUltimateData {
  chargesDone: number;
  chargeCd: number;
  smashFired: boolean;
  flash: number;
}

export const reinerUltimateHandler: UltimateHandler = {
  characterId: 'reiner',
  title: 'ARMORED TITAN: WALL MARIA BREACH!',
  subtitle:
    'Hardens Armored Titan plates (Shield + Enchanted Armor + Unstoppable), rams through enemies 3 times, and finishes with Gate Smash!',
  bannerColor: '#eab308',
  castDuration: 0.24,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.8);
    owner.shieldColor = '#eab308';
    owner.enchantArmorTimer = Math.max(owner.enchantArmorTimer, 3.8);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.8);

    const data: ReinerUltimateData = {
      chargesDone: 0,
      chargeCd: 0.34,
      smashFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#eab308', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'ARMORED TITAN CHARGE!',
      '#eab308',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ReinerUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.smashFired && data.chargesDone < 3) {
      data.chargeCd -= dt;
      if (data.chargeCd <= 0) {
        data.chargeCd = 0.45;
        data.chargesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          owner.vx = Math.cos(ang) * 700;
          owner.vy = Math.sin(ang) * 700;
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 9.6),
            Math.cos(ang) * 440,
            Math.sin(ang) * 440,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.spawnShockwave(
            target.x,
            target.y,
            135,
            '#eab308',
            7,
            owner.character.id,
            owner.character.series,
          );
          ctx.emitSfx({ type: 'wall', intensity: 1.25 });
        }
      }
    }

    if (!data.smashFired && state.elapsed >= 2.05) {
      data.smashFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.15);
        e.stunKind = 'airborne';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 24.0),
          Math.cos(ang) * 640,
          Math.sin(ang) * 640,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        310,
        '#dc2626',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'WALL MARIA BREACH!!',
        '#eab308',
        'crit',
      );
      ctx.addScreenShake(19);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
