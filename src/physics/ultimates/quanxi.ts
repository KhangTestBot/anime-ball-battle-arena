import type { UltimateHandler } from './types';

export interface QuanxiUltimateData {
  dashesDone: number;
  dashCd: number;
  trails: Array<{ x1: number; y1: number; x2: number; y2: number; alpha: number }>;
  barrageFired: boolean;
  flash: number;
}

export const quanxiUltimateHandler: UltimateHandler = {
  characterId: 'quanxi',
  title: 'FIRST DEVIL HUNTER: CROSSBOW HYBRID BLITZ!',
  subtitle:
    'Hybrid Crossbow form (+20% DMG & Auto-Dodge), chains 5 blinding Decapitation Dashes, and unleashes an inescapable Crossbow Barrage!',
  bannerColor: '#ec4899',
  castDuration: 0.2,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 20;
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 3.2);

    const data: QuanxiUltimateData = {
      dashesDone: 0,
      dashCd: 0.24,
      trails: [],
      barrageFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ec4899', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'CROSSBOW HYBRID!!',
      '#ec4899',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'dodge', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as QuanxiUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);
    for (const tr of data.trails) {
      tr.alpha = Math.max(0, tr.alpha - dt * 0.85);
    }

    if (!data.barrageFired && data.dashesDone < 5) {
      data.dashCd -= dt;
      if (data.dashCd <= 0) {
        data.dashCd = 0.28;
        data.dashesDone += 1;
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
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 8.2),
            Math.cos(ang) * 240,
            Math.sin(ang) * 240,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.25 });
        }
      }
    }

    if (!data.barrageFired && state.elapsed >= 2.0) {
      data.barrageFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.armorShredTimer = Math.max(e.armorShredTimer, 4.0);
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
        325,
        '#ec4899',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'LIGHTSPEED DECAPITATION!!',
        '#f8fafc',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'slash', intensity: 1.45 });
    }
  },
};
