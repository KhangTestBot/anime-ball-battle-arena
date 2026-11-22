import type { UltimateHandler } from './types';

export interface ScorpionUltimateData {
  yankedCount: number;
  hellfiresDone: number;
  hellfireCd: number;
  toastyFired: boolean;
  flash: number;
}

export const scorpionUltimateHandler: UltimateHandler = {
  characterId: 'scorpion',
  title: 'GET OVER HERE!: HELLFIRE FATALITY!',
  subtitle:
    'Yanks all enemies straight to Scorpion with his Kunai Spear, scorches them with 3 Hellfire bursts, and incinerates with Toasty! Demon Breath!',
  bannerColor: '#eab308',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.2);
    let yanked = 0;
    for (const e of ctx.getEnemies(owner)) {
      const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
      const pad = e.radius + 8;
      e.x = Math.max(
        ctx.bounds.left + pad,
        Math.min(ctx.bounds.right - pad, owner.x + Math.cos(ang) * (owner.radius + e.radius + 14)),
      );
      e.y = Math.max(
        ctx.bounds.top + pad,
        Math.min(ctx.bounds.bottom - pad, owner.y + Math.sin(ang) * (owner.radius + e.radius + 14)),
      );
      e.stunTimer = Math.max(e.stunTimer, 0.85);
      e.stunKind = 'chained';
      yanked += 1;
    }

    const data: ScorpionUltimateData = {
      yankedCount: yanked,
      hellfiresDone: 0,
      hellfireCd: 0.32,
      toastyFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#eab308', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'GET OVER HERE!!',
      '#eab308',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'slash', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ScorpionUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.toastyFired && data.hellfiresDone < 3) {
      data.hellfireCd -= dt;
      if (data.hellfireCd <= 0) {
        data.hellfireCd = 0.44;
        data.hellfiresDone += 1;
        for (const e of ctx.getEnemies(owner)) {
          e.burnTimer = Math.max(e.burnTimer, 4.0);
          e.burnDps = Math.max(e.burnDps, 9.0);
          e.burnOwnerUid = owner.uid;
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 8.6), 0, 0, {
            isCrit: true,
            sourceKind: 'ability',
          });
        }
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          195,
          '#ef4444',
          7,
          owner.character.id,
          owner.character.series,
        );
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.15 });
      }
    }

    if (!data.toastyFired && state.elapsed >= 2.0) {
      data.toastyFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 24.5),
          Math.cos(ang) * 580,
          Math.sin(ang) * 580,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        310,
        '#eab308',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'TOASTY!! FATALITY!',
        '#ef4444',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};
