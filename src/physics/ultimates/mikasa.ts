import type { UltimateHandler } from './types';

export interface MikasaUltimateData {
  zipsDone: number;
  zipCd: number;
  trails: Array<{ x1: number; y1: number; x2: number; y2: number; alpha: number }>;
  spearFired: boolean;
  flash: number;
}

export const mikasaUltimateHandler: UltimateHandler = {
  characterId: 'mikasa',
  title: 'ACKERMAN AWAKENING: THUNDER SPEAR BLITZ!',
  subtitle:
    'Activates Ackerman reflexes (+18% DMG & Auto-Dodge), zips 4 times on ODM wires slicing every foe, and finishes with a Dual Thunder Spear detonation!',
  bannerColor: '#ef4444',
  castDuration: 0.2,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 18;
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 3.0);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.8);

    const data: MikasaUltimateData = {
      zipsDone: 0,
      zipCd: 0.26,
      trails: [],
      spearFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ef4444', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'ACKERMAN AWAKENING!',
      '#ef4444',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'dodge', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as MikasaUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);
    for (const tr of data.trails) {
      tr.alpha = Math.max(0, tr.alpha - dt * 0.85);
    }

    if (!data.spearFired && data.zipsDone < 4) {
      data.zipCd -= dt;
      if (data.zipCd <= 0) {
        data.zipCd = 0.34;
        data.zipsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const oldX = owner.x;
          const oldY = owner.y;
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          const pad = owner.radius + 8;
          owner.x = Math.max(
            ctx.bounds.left + pad,
            Math.min(ctx.bounds.right - pad, target.x + Math.cos(ang + 0.65) * 66),
          );
          owner.y = Math.max(
            ctx.bounds.top + pad,
            Math.min(ctx.bounds.bottom - pad, target.y + Math.sin(ang + 0.65) * 66),
          );
          data.trails.push({ x1: oldX, y1: oldY, x2: owner.x, y2: owner.y, alpha: 1 });
          target.armorShredTimer = Math.max(target.armorShredTimer, 3.0);
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 9.2),
            Math.cos(ang) * 260,
            Math.sin(ang) * 260,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.25 });
        }
      }
    }

    if (!data.spearFired && state.elapsed >= 2.0) {
      data.spearFired = true;
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
        305,
        '#ef4444',
        10,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'DUAL THUNDER SPEAR!!',
        '#facc15',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
