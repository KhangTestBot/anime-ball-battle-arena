import type { UltimateHandler } from './types';

export interface DabiUltimateData {
  waveCount: number;
  waveCd: number;
  supernovaFired: boolean;
  flash: number;
}

export const dabiUltimateHandler: UltimateHandler = {
  characterId: 'dabi',
  title: 'CREMATION: BLUEFLAME SUPERNOVA',
  subtitle:
    'Engulfs the arena in hotter-than-sun Blueflame inflicting Burn + Anti-Heal, climaxing in a catastrophic Blueflame Supernova!',
  bannerColor: '#38bdf8',
  castDuration: 0.25,
  duration: 3.8,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.6);
    for (const e of ctx.getEnemies(owner)) {
      e.burnTimer = Math.max(e.burnTimer, 4.2);
      e.burnDps = Math.max(e.burnDps, ctx.getEffectiveDamage(owner, 4.8));
      e.burnOwnerUid = owner.uid;
      e.antiHealTimer = Math.max(e.antiHealTimer, 4.0);
    }

    const data: DabiUltimateData = {
      waveCount: 0,
      waveCd: 0.5,
      supernovaFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'DANCE WITH ME IN HELL!',
      '#38bdf8',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as DabiUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.supernovaFired && data.waveCount < 3) {
      data.waveCd -= dt;
      if (data.waveCd <= 0) {
        data.waveCd = 0.52;
        data.waveCount += 1;
        for (const e of ctx.getEnemies(owner)) {
          if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 235 + e.radius) {
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 7.5), 0, 0, {
              sourceKind: 'ability',
            });
          }
        }
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          220,
          '#38bdf8',
          5,
          owner.character.id,
          owner.character.series,
        );
        ctx.emitSfx({ type: 'slash', intensity: 1.05 });
      }
    }

    if (!data.supernovaFired && state.elapsed >= 2.05) {
      data.supernovaFired = true;
      data.flash = 1.25;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        e.antiHealTimer = Math.max(e.antiHealTimer, 4.2);
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 19.5),
          Math.cos(ang) * 480,
          Math.sin(ang) * 480,
          {
            isCrit: true,
            bypassInvuln: true,
            sourceKind: 'ability',
          },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        320,
        '#0ea5e9',
        9,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnParticles(owner.x, owner.y, 38, '#38bdf8', 110, 360, 3.5, 7.5, 'circle');
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'BLUEFLAME SUPERNOVA!',
        '#7dd3fc',
        'crit',
      );
      ctx.addScreenShake(17);
      ctx.addHitstop(0.065);
      ctx.emitSfx({ type: 'ko', intensity: 1.3 });
    }
  },
};
