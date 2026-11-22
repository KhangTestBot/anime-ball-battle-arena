import type { UltimateHandler } from './types';

export interface ThreshUltimateData {
  hookedCount: number;
  flaysDone: number;
  flayCd: number;
  boxShattered: boolean;
  flash: number;
}

export const threshUltimateHandler: UltimateHandler = {
  characterId: 'thresh',
  title: 'THE BOX (R): DEATH SENTENCE!',
  subtitle:
    'Hooks enemies with Death Sentence (Chained Stun + Pull), raises Dark Passage Lantern Shield, and shatters The Box spectral walls!',
  bannerColor: '#10b981',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.6);
    owner.shieldColor = '#10b981';
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.2);
    let hooked = 0;
    for (const e of ctx.getEnemies(owner)) {
      const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
      const pad = e.radius + 8;
      e.x = Math.max(
        ctx.bounds.left + pad,
        Math.min(ctx.bounds.right - pad, owner.x + Math.cos(ang) * (owner.radius + e.radius + 22)),
      );
      e.y = Math.max(
        ctx.bounds.top + pad,
        Math.min(ctx.bounds.bottom - pad, owner.y + Math.sin(ang) * (owner.radius + e.radius + 22)),
      );
      e.stunTimer = Math.max(e.stunTimer, 0.9);
      e.stunKind = 'chained';
      hooked += 1;
    }

    const data: ThreshUltimateData = {
      hookedCount: hooked,
      flaysDone: 0,
      flayCd: 0.34,
      boxShattered: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#10b981', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'DEATH SENTENCE!!',
      '#10b981',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'slash', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ThreshUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.boxShattered && data.flaysDone < 3) {
      data.flayCd -= dt;
      if (data.flayCd <= 0) {
        data.flayCd = 0.44;
        data.flaysDone += 1;
        for (const e of ctx.getEnemies(owner)) {
          e.frostTimer = Math.max(e.frostTimer, 2.5);
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 7.6), 0, 0, {
            sourceKind: 'ability',
          });
        }
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          195,
          '#10b981',
          7,
          owner.character.id,
          owner.character.series,
        );
        ctx.emitSfx({ type: 'slash', intensity: 1.1 });
      }
    }

    if (!data.boxShattered && state.elapsed >= 2.0) {
      data.boxShattered = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        e.frostTimer = Math.max(e.frostTimer, 4.0);
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 23.5),
          Math.cos(ang) * 560,
          Math.sin(ang) * 560,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        305,
        '#10b981',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'THE BOX SHATTERED!!',
        '#10b981',
        'crit',
      );
      ctx.addScreenShake(17);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.3 });
    }
  },
};
