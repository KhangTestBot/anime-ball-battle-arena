import type { UltimateHandler } from './types';

export interface StingUltimateData {
  silkFired: boolean;
  beamAngles: number[];
  flash: number;
}

export const stingUltimateHandler: UltimateHandler = {
  characterId: 'sting',
  title: "WHITE SHADOW DRAGON'S ROUGH SILK",
  subtitle:
    'Brands enemies with Holy Nova stigma locking dodge, then unleashes a blinding web of White Shadow Dragon Rough Silk lasers!',
  bannerColor: '#fef08a',
  castDuration: 0.24,
  duration: 3.6,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.4);
    for (const e of ctx.getEnemies(owner)) {
      e.dodgeLockedTimer = Math.max(e.dodgeLockedTimer, 2.8);
    }

    const data: StingUltimateData = {
      silkFired: false,
      beamAngles: [0, 0.55, -0.55, 1.1, -1.1],
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#fef08a', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'HOLY NOVA STIGMA!',
      '#fef08a',
      'powerup',
    );
    ctx.emitSfx({ type: 'beam-charge' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as StingUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.silkFired && state.elapsed >= 1.3) {
      data.silkFired = true;
      data.flash = 1.3;
      const target = ctx.getNearestEnemy(owner);
      const baseAng = target
        ? Math.atan2(target.y - owner.y, target.x - owner.x)
        : owner.facingAngle;
      data.beamAngles = [-0.5, -0.25, 0, 0.25, 0.5].map((off) => baseAng + off);

      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 21.0),
          Math.cos(baseAng) * 440,
          Math.sin(baseAng) * 440,
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
        240,
        '#fef08a',
        7,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'ROUGH SILK!!',
        '#ffffff',
        'crit',
      );
      ctx.addScreenShake(15);
      ctx.addHitstop(0.06);
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.35 });
    }
  },
};
