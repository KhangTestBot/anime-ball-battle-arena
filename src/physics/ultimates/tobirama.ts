import type { UltimateHandler } from './types';

export interface TobiramaUltimateData {
  blinksDone: number;
  blinkCd: number;
  tagsFired: boolean;
  flash: number;
}

export const tobiramaUltimateHandler: UltimateHandler = {
  characterId: 'tobirama',
  title: 'FLYING RAIJIN SLASH & TANDEM PAPER BOMBS!',
  subtitle:
    'Second Hokage space-time blitz (+18% DMG & Auto-Dodge), chains 4 Flying Raijin blinks, and detonates Mutually Multiplying Explosive Tags!',
  bannerColor: '#38bdf8',
  castDuration: 0.2,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 18;
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 3.0);

    const data: TobiramaUltimateData = {
      blinksDone: 0,
      blinkCd: 0.26,
      tagsFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'FLYING RAIJIN SLASH!!',
      '#38bdf8',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'dodge', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as TobiramaUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.tagsFired && data.blinksDone < 4) {
      data.blinkCd -= dt;
      if (data.blinkCd <= 0) {
        data.blinkCd = 0.34;
        data.blinksDone += 1;
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
          target.armorShredTimer = Math.max(target.armorShredTimer, 3.2);
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 9.0),
            Math.cos(ang) * 280,
            Math.sin(ang) * 280,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.2 });
        }
      }
    }

    if (!data.tagsFired && state.elapsed >= 2.0) {
      data.tagsFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 25.0),
          Math.cos(ang) * 600,
          Math.sin(ang) * 600,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        320,
        '#38bdf8',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'TANDEM PAPER BOMBS!!',
        '#f8fafc',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
