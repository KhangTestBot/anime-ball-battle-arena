import type { UltimateHandler } from './types';

export interface GarouUltimateData {
  blinksDone: number;
  blinkCd: number;
  grbFired: boolean;
  grbAngle: number;
  grbFlash: number;
}

export const garouUltimateHandler: UltimateHandler = {
  characterId: 'garou',
  title: 'COSMIC FEAR: GAMMA RAY BURST!',
  subtitle:
    'Enters Cosmic Fear (+18% DMG & Unstoppable), chains 3 Mode-Saitama counter-blinks, and detonates a twin-jet Gamma Ray Burst!',
  bannerColor: '#a855f7',
  castDuration: 0.24,
  duration: 4.1,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 18;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.5);
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 2.2);

    const data: GarouUltimateData = {
      blinksDone: 0,
      blinkCd: 0.32,
      grbFired: false,
      grbAngle: owner.facingAngle,
      grbFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#a855f7', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'COSMIC FEAR MODE!',
      '#c084fc',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as GarouUltimateData;
    if (data.grbFlash > 0) data.grbFlash = Math.max(0, data.grbFlash - dt);

    if (!data.grbFired && data.blinksDone < 3) {
      data.blinkCd -= dt;
      if (data.blinkCd <= 0) {
        data.blinkCd = 0.44;
        data.blinksDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          data.grbAngle = ang;
          const pad = owner.radius + 8;
          owner.x = Math.max(
            ctx.bounds.left + pad,
            Math.min(
              ctx.bounds.right - pad,
              target.x - Math.cos(ang) * (owner.radius + target.radius + 10),
            ),
          );
          owner.y = Math.max(
            ctx.bounds.top + pad,
            Math.min(
              ctx.bounds.bottom - pad,
              target.y - Math.sin(ang) * (owner.radius + target.radius + 10),
            ),
          );
          target.armorShredTimer = Math.max(target.armorShredTimer, 3.0);
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 10.5),
            Math.cos(ang) * 320,
            Math.sin(ang) * 320,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.spawnShockwave(
            target.x,
            target.y,
            135,
            '#a855f7',
            6,
            owner.character.id,
            owner.character.series,
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.2 });
        }
      }
    }

    if (!data.grbFired && state.elapsed >= 2.05) {
      data.grbFired = true;
      data.grbFlash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 26.5),
          Math.cos(ang) * 620,
          Math.sin(ang) * 620,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        340,
        '#c084fc',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'GAMMA RAY BURST!!',
        '#f43f5e',
        'crit',
      );
      ctx.addScreenShake(20);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};
