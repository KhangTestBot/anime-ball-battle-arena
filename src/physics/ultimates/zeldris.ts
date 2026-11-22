import type { UltimateHandler } from './types';

export interface ZeldrisUltimateData {
  nebulaTicks: number;
  nebulaCd: number;
  cleaveFired: boolean;
  flash: number;
}

export const zeldrisUltimateHandler: UltimateHandler = {
  characterId: 'zeldris',
  title: 'OMINOUS NEBULA: DEMON KING EXECUTIONER!',
  subtitle:
    'Activates Ominous Nebula dark vortex pulling all enemies inward while shredding armor (+20% DMG & Unstoppable), and finishes with Darkness Cleave!',
  bannerColor: '#dc2626',
  castDuration: 0.22,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 20;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.6);
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.0);
    owner.shieldColor = '#a855f7';

    const data: ZeldrisUltimateData = {
      nebulaTicks: 0,
      nebulaCd: 0.32,
      cleaveFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#a855f7', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'OMINOUS NEBULA!!',
      '#dc2626',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'slash', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ZeldrisUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.cleaveFired && data.nebulaTicks < 4) {
      data.nebulaCd -= dt;
      if (data.nebulaCd <= 0) {
        data.nebulaCd = 0.36;
        data.nebulaTicks += 1;
        for (const e of ctx.getEnemies(owner)) {
          const dx = owner.x - e.x;
          const dy = owner.y - e.y;
          const dist = Math.max(1, Math.hypot(dx, dy));
          e.vx += (dx / dist) * 350;
          e.vy += (dy / dist) * 350;
          e.armorShredTimer = Math.max(e.armorShredTimer, 3.5);
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 7.6), 0, 0, {
            isCrit: true,
            sourceKind: 'ability',
          });
        }
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          210,
          '#a855f7',
          7,
          owner.character.id,
          owner.character.series,
        );
        ctx.emitSfx({ type: 'slash', intensity: 1.2 });
      }
    }

    if (!data.cleaveFired && state.elapsed >= 2.05) {
      data.cleaveFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 26.0),
          Math.cos(ang) * 610,
          Math.sin(ang) * 610,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        335,
        '#dc2626',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'GOD: DARKNESS CLEAVE!!',
        '#dc2626',
        'crit',
      );
      ctx.addScreenShake(19);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};
