import type { UltimateHandler } from './types';

export interface RiderMedusaUltimateData {
  chargesDone: number;
  chargeCd: number;
  bellerophonFired: boolean;
  flash: number;
}

export const riderMedusaUltimateHandler: UltimateHandler = {
  characterId: 'rider_medusa',
  title: 'CYBELE & BELLEROPHON: PEGASUS!',
  subtitle:
    'Petrifies enemies with Mystic Eyes of Cybele, chains 3 Pegasus charges, and obliterates all with Bellerophon!',
  bannerColor: '#9333ea',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 2.8);
    owner.dmgBonusPct += 20;
    for (const e of ctx.getEnemies(owner)) {
      e.stunTimer = Math.max(e.stunTimer, 1.3);
      e.stunKind = 'petrified';
    }

    const data: RiderMedusaUltimateData = {
      chargesDone: 0,
      chargeCd: 0.28,
      bellerophonFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#9333ea', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'MYSTIC EYES: CYBELE PETRIFY!!',
      '#9333ea',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as RiderMedusaUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.bellerophonFired && data.chargesDone < 3) {
      data.chargeCd -= dt;
      if (data.chargeCd <= 0) {
        data.chargeCd = 0.42;
        data.chargesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          const pad = owner.radius + 8;
          owner.x = Math.max(
            ctx.bounds.left + pad,
            Math.min(
              ctx.bounds.right - pad,
              target.x - Math.cos(ang) * (owner.radius + target.radius + 8),
            ),
          );
          owner.y = Math.max(
            ctx.bounds.top + pad,
            Math.min(
              ctx.bounds.bottom - pad,
              target.y - Math.sin(ang) * (owner.radius + target.radius + 8),
            ),
          );
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 9.8),
            Math.cos(ang) * 350,
            Math.sin(ang) * 350,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'wall', intensity: 1.25 });
        }
      }
    }

    if (!data.bellerophonFired && state.elapsed >= 2.0) {
      data.bellerophonFired = true;
      data.flash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 26.5),
          Math.cos(ang) * 660,
          Math.sin(ang) * 660,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        350,
        '#e2e8f0',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'BELLEROPHON: PEGASUS CHARGE!!',
        '#c084fc',
        'crit',
      );
      ctx.addScreenShake(19);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};
