import type { UltimateHandler } from './types';

export interface AkaliUltimateData {
  dashesDone: number;
  dashCd: number;
  trails: Array<{ x1: number; y1: number; x2: number; y2: number; alpha: number }>;
  execFired: boolean;
  flash: number;
}

export const akaliUltimateHandler: UltimateHandler = {
  characterId: 'akali',
  title: 'PERFECT EXECUTION (R): TWILIGHT SHROUD!',
  subtitle:
    'Vanishes into Twilight Shroud (Auto-Dodge), chains 4 Shuriken Flip dashes, and executes low-HP foes with Perfect Execution R2!',
  bannerColor: '#10b981',
  castDuration: 0.2,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 3.2);
    owner.dmgBonusPct += 18;

    const data: AkaliUltimateData = {
      dashesDone: 0,
      dashCd: 0.26,
      trails: [],
      execFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#10b981', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'TWILIGHT SHROUD!',
      '#10b981',
      'powerup',
    );
    ctx.addScreenShake(9);
    ctx.emitSfx({ type: 'dodge', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as AkaliUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);
    for (const tr of data.trails) {
      tr.alpha = Math.max(0, tr.alpha - dt * 0.85);
    }

    if (!data.execFired && data.dashesDone < 4) {
      data.dashCd -= dt;
      if (data.dashCd <= 0) {
        data.dashCd = 0.34;
        data.dashesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const oldX = owner.x;
          const oldY = owner.y;
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          const pad = owner.radius + 8;
          owner.x = Math.max(
            ctx.bounds.left + pad,
            Math.min(ctx.bounds.right - pad, target.x + Math.cos(ang + 0.6) * 66),
          );
          owner.y = Math.max(
            ctx.bounds.top + pad,
            Math.min(ctx.bounds.bottom - pad, target.y + Math.sin(ang + 0.6) * 66),
          );
          data.trails.push({ x1: oldX, y1: oldY, x2: owner.x, y2: owner.y, alpha: 1 });
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 8.8),
            Math.cos(ang) * 240,
            Math.sin(ang) * 240,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.2 });
        }
      }
    }

    if (!data.execFired && state.elapsed >= 2.0) {
      data.execFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        const missingMult = 1 + (1 - e.hp / Math.max(1, e.maxHp)) * 0.5;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 22.0 * missingMult),
          Math.cos(ang) * 560,
          Math.sin(ang) * 560,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        300,
        '#ef4444',
        10,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'PERFECT EXECUTION!!',
        '#10b981',
        'crit',
      );
      ctx.addScreenShake(17);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
