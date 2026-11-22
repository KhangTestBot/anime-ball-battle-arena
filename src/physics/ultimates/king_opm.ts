import type { UltimateHandler } from './types';

export interface KingOpmUltimateData {
  thumpsDone: number;
  thumpCd: number;
  wavemotionFired: boolean;
  flash: number;
}

export const kingOpmUltimateHandler: UltimateHandler = {
  characterId: 'king_opm',
  title: 'KING ENGINE: ULTIMATE HELLFIRE WAVEMOTION!',
  subtitle:
    'The deafening King Engine terrifies all foes (Stun + Confusion + Silence + Armor Shred), grants King invulnerable intimidation aura, and unleashes a phantom Hellfire Wavemotion!',
  bannerColor: '#facc15',
  castDuration: 0.25,
  duration: 4.1,

  onCast(ctx, owner, state) {
    owner.invulnTimer = Math.max(owner.invulnTimer, 2.8);
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.8);
    owner.shieldColor = '#facc15';

    const data: KingOpmUltimateData = {
      thumpsDone: 0,
      thumpCd: 0.35,
      wavemotionFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#facc15', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'THUMP! THUMP! THUMP!!',
      '#facc15',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'powerup', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as KingOpmUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.wavemotionFired && data.thumpsDone < 3) {
      data.thumpCd -= dt;
      if (data.thumpCd <= 0) {
        data.thumpCd = 0.45;
        data.thumpsDone += 1;
        for (const e of ctx.getEnemies(owner)) {
          e.confusedTimer = Math.max(e.confusedTimer, 2.0);
          e.silenceTimer = Math.max(e.silenceTimer, 1.6);
          e.armorShredTimer = Math.max(e.armorShredTimer, 3.2);
          const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
          e.vx += Math.cos(ang) * 260;
          e.vy += Math.sin(ang) * 260;
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 6.5), 0, 0, {
            sourceKind: 'ability',
          });
        }
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          240,
          '#ef4444',
          7,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(owner.x, owner.y - owner.radius - 18, 'THUMP!!', '#ef4444', 'crit');
        ctx.addScreenShake(9);
        ctx.emitSfx({ type: 'powerup', intensity: 1.15 });
      }
    }

    if (!data.wavemotionFired && state.elapsed >= 2.05) {
      data.wavemotionFired = true;
      data.flash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.3);
        e.stunKind = 'fear';
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 24.0),
          Math.cos(ang) * 600,
          Math.sin(ang) * 600,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        350,
        '#facc15',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'HELLFIRE WAVEMOTION CANNON!!',
        '#facc15',
        'crit',
      );
      ctx.addScreenShake(19);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};
