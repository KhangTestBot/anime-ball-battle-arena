import type { UltimateHandler } from './types';

export interface LucyUltimateData {
  starAngle: number;
  starWaves: number;
  waveCd: number;
  uranoFired: boolean;
  flash: number;
}

export const lucyFtUltimateHandler: UltimateHandler = {
  characterId: 'lucy_ft',
  title: 'STAR DRESS MIX: URANO METRIA',
  subtitle:
    'Opens all 12 Celestial Zodiac gates orbiting the arena, then drops the legendary 88-Star Urano Metria bombardment locking dodge!',
  bannerColor: '#facc15',
  castDuration: 0.26,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.shieldTimer = Math.max(owner.shieldTimer, 2.8);
    owner.shieldColor = '#facc15';
    const data: LucyUltimateData = {
      starAngle: 0,
      starWaves: 0,
      waveCd: 0.42,
      uranoFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, 0, '#facc15', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'SURVEY THE HEAVENS!',
      '#fde047',
      'powerup',
    );
    ctx.addScreenShake(9);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as LucyUltimateData;
    data.starAngle += dt * 3.8;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.uranoFired && data.starWaves < 3) {
      data.waveCd -= dt;
      if (data.waveCd <= 0) {
        data.waveCd = 0.5;
        data.starWaves += 1;
        for (const e of ctx.getEnemies(owner)) {
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 6.2), 0, 0, {
            sourceKind: 'ability',
          });
          ctx.spawnParticles(e.x, e.y, 12, '#fde047', 50, 180, 2.5, 5.5, 'star');
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.05 });
      }
    }

    if (!data.uranoFired && state.elapsed >= 2.05) {
      data.uranoFired = true;
      data.flash = 1.3;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        e.dodgeLockedTimer = Math.max(e.dodgeLockedTimer, 2.4);
        ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 21.0), 0, 0, {
          isCrit: true,
          bypassInvuln: true,
          sourceKind: 'ability',
        });
        ctx.spawnShockwave(e.x, e.y, 195, '#facc15', 7, owner.character.id, owner.character.series);
      }
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'URANO METRIA!!',
        '#fef08a',
        'crit',
      );
      ctx.addScreenShake(16);
      ctx.addHitstop(0.065);
      ctx.emitSfx({ type: 'ko', intensity: 1.3 });
    }
  },
};
