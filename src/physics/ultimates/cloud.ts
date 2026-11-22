import type { UltimateHandler } from './types';

export interface CloudUltimateData {
  slashesDone: number;
  slashCd: number;
  trails: Array<{ x1: number; y1: number; x2: number; y2: number; alpha: number }>;
  finisherFired: boolean;
  flash: number;
}

export const cloudUltimateHandler: UltimateHandler = {
  characterId: 'cloud',
  title: 'LIMIT BREAK: OMNISLASH VER. 5!',
  subtitle:
    'Breaks the Limit (+22% DMG & Unstoppable), chains 5 blinding Buster Sword Omnislash blinks, and plunges down with the final Omnislash Finisher!',
  bannerColor: '#38bdf8',
  castDuration: 0.22,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 22;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.6);

    const data: CloudUltimateData = {
      slashesDone: 0,
      slashCd: 0.24,
      trails: [],
      finisherFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'LIMIT BREAK: OMNISLASH!!',
      '#38bdf8',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'slash', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as CloudUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);
    for (const tr of data.trails) {
      tr.alpha = Math.max(0, tr.alpha - dt * 0.85);
    }

    if (!data.finisherFired && data.slashesDone < 5) {
      data.slashCd -= dt;
      if (data.slashCd <= 0) {
        data.slashCd = 0.28;
        data.slashesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const oldX = owner.x;
          const oldY = owner.y;
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          const pad = owner.radius + 8;
          owner.x = Math.max(
            ctx.bounds.left + pad,
            Math.min(ctx.bounds.right - pad, target.x + Math.cos(ang + 0.7) * 68),
          );
          owner.y = Math.max(
            ctx.bounds.top + pad,
            Math.min(ctx.bounds.bottom - pad, target.y + Math.sin(ang + 0.7) * 68),
          );
          data.trails.push({ x1: oldX, y1: oldY, x2: owner.x, y2: owner.y, alpha: 1 });
          target.armorShredTimer = Math.max(target.armorShredTimer, 3.5);
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

    if (!data.finisherFired && state.elapsed >= 2.05) {
      data.finisherFired = true;
      data.flash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 26.5),
          Math.cos(ang) * 620,
          Math.sin(ang) * 620,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        340,
        '#38bdf8',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'OMNISLASH FINISHER!!',
        '#facc15',
        'crit',
      );
      ctx.addScreenShake(20);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.45 });
    }
  },
};
