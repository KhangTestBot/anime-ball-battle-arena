import type { UltimateHandler } from './types';

export interface BardockUltimateData {
  rushesDone: number;
  rushCd: number;
  javelinFired: boolean;
  flash: number;
}

export const bardockUltimateHandler: UltimateHandler = {
  characterId: 'bardock',
  title: 'REBELLION TRIGGER: RIOT JAVELIN!',
  subtitle:
    'Saiyan warrior resolve (+20% DMG & Unstoppable), chains 3 Tyrant Lancer rushes, and hurls the blazing emerald Riot Javelin!',
  bannerColor: '#22c55e',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 20;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.4);

    const data: BardockUltimateData = {
      rushesDone: 0,
      rushCd: 0.3,
      javelinFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#22c55e', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'EVERYTHING!!',
      '#22c55e',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as BardockUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.javelinFired && data.rushesDone < 3) {
      data.rushCd -= dt;
      if (data.rushCd <= 0) {
        data.rushCd = 0.44;
        data.rushesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          owner.vx = Math.cos(ang) * 680;
          owner.vy = Math.sin(ang) * 680;
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 9.2),
            Math.cos(ang) * 340,
            Math.sin(ang) * 340,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.2 });
        }
      }
    }

    if (!data.javelinFired && state.elapsed >= 2.0) {
      data.javelinFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 25.0),
          Math.cos(ang) * 610,
          Math.sin(ang) * 610,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        320,
        '#22c55e',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'RIOT JAVELIN!!',
        '#22c55e',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.45 });
    }
  },
};
