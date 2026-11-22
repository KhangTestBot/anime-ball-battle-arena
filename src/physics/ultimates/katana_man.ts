import type { UltimateHandler } from './types';

export interface KatanaManUltimateData {
  dashesDone: number;
  dashCd: number;
  trails: Array<{ x1: number; y1: number; x2: number; y2: number; alpha: number }>;
  iaijutsuFired: boolean;
  flash: number;
}

export const katanaManUltimateHandler: UltimateHandler = {
  characterId: 'katana_man',
  title: 'KATANA HYBRID: IAIJUTSU DASH!',
  subtitle:
    'Hybrid Katana stance (+20% DMG & Unstoppable), chains 4 supersonic Iaijutsu Dash blinks shredding armor, and bisects all enemies!',
  bannerColor: '#ef4444',
  castDuration: 0.2,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 20;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.4);

    const data: KatanaManUltimateData = {
      dashesDone: 0,
      dashCd: 0.26,
      trails: [],
      iaijutsuFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ef4444', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'IAIJUTSU DASH!!',
      '#ef4444',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'slash', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as KatanaManUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);
    for (const tr of data.trails) {
      tr.alpha = Math.max(0, tr.alpha - dt * 0.85);
    }

    if (!data.iaijutsuFired && data.dashesDone < 4) {
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
            Math.min(ctx.bounds.right - pad, target.x + Math.cos(ang) * 70),
          );
          owner.y = Math.max(
            ctx.bounds.top + pad,
            Math.min(ctx.bounds.bottom - pad, target.y + Math.sin(ang) * 70),
          );
          data.trails.push({ x1: oldX, y1: oldY, x2: owner.x, y2: owner.y, alpha: 1 });
          target.armorShredTimer = Math.max(target.armorShredTimer, 3.6);
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 9.2),
            Math.cos(ang) * 280,
            Math.sin(ang) * 280,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.25 });
        }
      }
    }

    if (!data.iaijutsuFired && state.elapsed >= 2.0) {
      data.iaijutsuFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 25.5),
          Math.cos(ang) * 600,
          Math.sin(ang) * 600,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        320,
        '#ef4444',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'HYBRID CROSS BISECTION!!',
        '#ef4444',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'slash', intensity: 1.45 });
    }
  },
};
