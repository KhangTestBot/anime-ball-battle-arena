import type { UltimateHandler } from './types';

export interface GoGunheeUltimateData {
  pulsesDone: number;
  pulseCd: number;
  fistFired: boolean;
  flash: number;
}

export const goGunheeUltimateHandler: UltimateHandler = {
  characterId: 'go_gunhee',
  title: 'BRIGHTEST FRAGMENT OF BRILLIANT LIGHT!',
  subtitle:
    'Unleashes the Ruler Vessel (+22% DMG, Shield & Unstoppable), blasts 3 golden Ruler Authority pulses, and strikes with Radiant Fist!',
  bannerColor: '#facc15',
  castDuration: 0.24,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 22;
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.6);
    owner.shieldColor = '#facc15';
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.4);

    const data: GoGunheeUltimateData = {
      pulsesDone: 0,
      pulseCd: 0.34,
      fistFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#facc15', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'FRAGMENT OF BRILLIANT LIGHT!',
      '#facc15',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as GoGunheeUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.fistFired && data.pulsesDone < 3) {
      data.pulseCd -= dt;
      if (data.pulseCd <= 0) {
        data.pulseCd = 0.44;
        data.pulsesDone += 1;
        for (const e of ctx.getEnemies(owner)) {
          const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 8.6),
            Math.cos(ang) * 340,
            Math.sin(ang) * 340,
            { isCrit: true, sourceKind: 'ability' },
          );
        }
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          220,
          '#38bdf8',
          7,
          owner.character.id,
          owner.character.series,
        );
        ctx.emitSfx({ type: 'powerup', intensity: 1.15 });
      }
    }

    if (!data.fistFired && state.elapsed >= 2.05) {
      data.fistFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 25.5),
          Math.cos(ang) * 600,
          Math.sin(ang) * 600,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        320,
        '#facc15',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'RADIANT RULER FIST!!',
        '#38bdf8',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
