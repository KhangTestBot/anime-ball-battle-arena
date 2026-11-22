import type { UltimateHandler } from './types';

export interface MuichiroUltimateData {
  blinksDone: number;
  blinkCd: number;
  trails: Array<{ x1: number; y1: number; x2: number; y2: number; alpha: number }>;
  mistFinisherFired: boolean;
  flash: number;
}

export const muichiroUltimateHandler: UltimateHandler = {
  characterId: 'muichiro',
  title: 'MIST BREATHING 7TH FORM: OBSCURING CLOUDS!',
  subtitle:
    'Shrouds the arena in blinding mist (Auto-Dodge + Enemy Confusion), chains 5 Obscuring Clouds blinks, and executes with Lunar Dispersing Mist!',
  bannerColor: '#2dd4bf',
  castDuration: 0.2,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 3.2);
    for (const e of ctx.getEnemies(owner)) {
      e.confusedTimer = Math.max(e.confusedTimer, 2.5);
    }

    const data: MuichiroUltimateData = {
      blinksDone: 0,
      blinkCd: 0.24,
      trails: [],
      mistFinisherFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#2dd4bf', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'SEVENTH FORM: OBSCURING CLOUDS!',
      '#2dd4bf',
      'powerup',
    );
    ctx.addScreenShake(9);
    ctx.emitSfx({ type: 'dodge', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as MuichiroUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);
    for (const tr of data.trails) {
      tr.alpha = Math.max(0, tr.alpha - dt * 0.85);
    }

    if (!data.mistFinisherFired && data.blinksDone < 5) {
      data.blinkCd -= dt;
      if (data.blinkCd <= 0) {
        data.blinkCd = 0.28;
        data.blinksDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const oldX = owner.x;
          const oldY = owner.y;
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          const pad = owner.radius + 8;
          owner.x = Math.max(
            ctx.bounds.left + pad,
            Math.min(ctx.bounds.right - pad, target.x + Math.cos(ang + 0.75) * 65),
          );
          owner.y = Math.max(
            ctx.bounds.top + pad,
            Math.min(ctx.bounds.bottom - pad, target.y + Math.sin(ang + 0.75) * 65),
          );
          data.trails.push({ x1: oldX, y1: oldY, x2: owner.x, y2: owner.y, alpha: 1 });
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 7.8),
            Math.cos(ang) * 230,
            Math.sin(ang) * 230,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.2 });
        }
      }
    }

    if (!data.mistFinisherFired && state.elapsed >= 2.0) {
      data.mistFinisherFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        e.armorShredTimer = Math.max(e.armorShredTimer, 3.8);
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 24.5),
          Math.cos(ang) * 560,
          Math.sin(ang) * 560,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        305,
        '#2dd4bf',
        10,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'LUNAR DISPERSING MIST!!',
        '#2dd4bf',
        'crit',
      );
      ctx.addScreenShake(17);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'slash', intensity: 1.4 });
    }
  },
};
