import type { UltimateHandler } from './types';

export interface KingBradleyUltimateData {
  blinksDone: number;
  blinkCd: number;
  trails: Array<{ x1: number; y1: number; x2: number; y2: number; alpha: number }>;
  finalCutFired: boolean;
  flash: number;
}

export const kingBradleyUltimateHandler: UltimateHandler = {
  characterId: 'kingbradley',
  title: 'ULTIMATE EYE: WRATH SABER BLITZ!',
  subtitle:
    'Unveils the Ultimate Eye (+22% DMG & Auto-Dodge), chains 5 blinding Dual Saber blinks shredding armor, and ends with Wrath Final Cut!',
  bannerColor: '#ef4444',
  castDuration: 0.2,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 22;
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 3.4);

    const data: KingBradleyUltimateData = {
      blinksDone: 0,
      blinkCd: 0.24,
      trails: [],
      finalCutFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ef4444', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'THE ULTIMATE EYE!!',
      '#ef4444',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'slash', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as KingBradleyUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);
    for (const tr of data.trails) {
      tr.alpha = Math.max(0, tr.alpha - dt * 0.85);
    }

    if (!data.finalCutFired && data.blinksDone < 5) {
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
            Math.min(ctx.bounds.right - pad, target.x + Math.cos(ang + 0.7) * 65),
          );
          owner.y = Math.max(
            ctx.bounds.top + pad,
            Math.min(ctx.bounds.bottom - pad, target.y + Math.sin(ang + 0.7) * 65),
          );
          data.trails.push({ x1: oldX, y1: oldY, x2: owner.x, y2: owner.y, alpha: 1 });
          target.armorShredTimer = Math.max(target.armorShredTimer, 4.0);
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 8.6),
            Math.cos(ang) * 260,
            Math.sin(ang) * 260,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.25 });
        }
      }
    }

    if (!data.finalCutFired && state.elapsed >= 2.0) {
      data.finalCutFired = true;
      data.flash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 26.5),
          Math.cos(ang) * 610,
          Math.sin(ang) * 610,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        335,
        '#ef4444',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        "WRATH'S FINAL CUT!!",
        '#ef4444',
        'crit',
      );
      ctx.addScreenShake(19);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'slash', intensity: 1.5 });
    }
  },
};
