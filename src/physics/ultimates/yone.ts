import { applyFighterStun } from '../domains';
import type { UltimateHandler } from './types';

export interface YoneUltimateData {
  anchorX: number;
  anchorY: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  fateSealedFired: boolean;
  soulSnapped: boolean;
  markedUids: string[];
  slashFlash: number;
}

export const yoneUltimateHandler: UltimateHandler = {
  characterId: 'yone',
  title: 'FATE SEALED (R) · SOUL UNBOUND',
  subtitle:
    'Leaves his body anchor behind, blinks through a crimson-cyan Fate Sealed corridor dragging & stunning all foes, then snaps back to detonate Soul Unbound!',
  bannerColor: '#ef4444',
  castDuration: 0.25,
  duration: 3.4,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.2);
    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
    const dist = Math.min(340, ctx.bounds.fullSize * 0.55);
    const x2 = Math.max(
      ctx.bounds.left + owner.radius,
      Math.min(ctx.bounds.right - owner.radius, owner.x + Math.cos(ang) * dist),
    );
    const y2 = Math.max(
      ctx.bounds.top + owner.radius,
      Math.min(ctx.bounds.bottom - owner.radius, owner.y + Math.sin(ang) * dist),
    );

    const data: YoneUltimateData = {
      anchorX: owner.x,
      anchorY: owner.y,
      x1: owner.x,
      y1: owner.y,
      x2,
      y2,
      fateSealedFired: false,
      soulSnapped: false,
      markedUids: [],
      slashFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, ang, '#ef4444', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'SOUL UNBOUND!',
      '#38bdf8',
      'powerup',
    );
    ctx.addScreenShake(8);
    ctx.emitSfx({ type: 'slash', intensity: 1.1 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as YoneUltimateData;
    if (data.slashFlash > 0) data.slashFlash = Math.max(0, data.slashFlash - dt);

    // 1. Fate Sealed Corridor Blink (0.65s): Drags & stuns all enemies in line!
    if (!data.fateSealedFired && state.elapsed >= 0.65) {
      data.fateSealedFired = true;
      data.slashFlash = 1.05;
      const dx = data.x2 - data.x1;
      const dy = data.y2 - data.y1;
      const len = Math.max(1, Math.hypot(dx, dy));
      const lx = dx / len;
      const ly = dy / len;

      owner.x = data.x2;
      owner.y = data.y2;

      for (const e of ctx.getEnemies(owner)) {
        const px = e.x - data.x1;
        const py = e.y - data.y1;
        const proj = px * lx + py * ly;
        const perp = Math.abs(px * ly - py * lx);
        if (proj >= -e.radius - 30 && proj <= len + e.radius + 50 && perp <= e.radius + 78) {
          e.x = Math.max(
            ctx.bounds.left + e.radius,
            Math.min(ctx.bounds.right - e.radius, data.x2 - lx * 34),
          );
          e.y = Math.max(
            ctx.bounds.top + e.radius,
            Math.min(ctx.bounds.bottom - e.radius, data.y2 - ly * 34),
          );
          e.airborneTimer = Math.max(e.airborneTimer, 0.95);
          e.slayerMarkTimer = Math.max(e.slayerMarkTimer, 1.8);
          data.markedUids.push(e.uid);
          applyFighterStun(ctx, owner, e, 0.75, 'airborne', 'FATE SEALED!');
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 13.5), 0, 0, {
            isCrit: true,
            sourceKind: 'ability',
          });
        }
      }
      ctx.spawnShockwave(
        data.x2,
        data.y2,
        170,
        '#ef4444',
        6,
        owner.character.id,
        owner.character.series,
      );
      ctx.addScreenShake(13);
      ctx.addHitstop(0.055);
      ctx.emitSfx({ type: 'crit', intensity: 1.25 });
    }

    // 2. Climax (2.05s): Snap back to Soul Unbound Anchor & Detonate Marked Foes!
    if (!data.soulSnapped && state.elapsed >= 2.05) {
      data.soulSnapped = true;
      owner.x = Math.max(
        ctx.bounds.left + owner.radius,
        Math.min(ctx.bounds.right - owner.radius, data.anchorX),
      );
      owner.y = Math.max(
        ctx.bounds.top + owner.radius,
        Math.min(ctx.bounds.bottom - owner.radius, data.anchorY),
      );

      const targets =
        data.markedUids.length > 0
          ? ctx.fighters.filter((f) => data.markedUids.includes(f.uid) && f.alive)
          : ctx.getEnemies(owner).slice(0, 1);

      for (const e of targets) {
        e.shieldTimer = 0;
        ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 16.5), 0, 0, {
          isCrit: true,
          bypassInvuln: true,
          sourceKind: 'ability',
        });
        ctx.spawnShockwave(e.x, e.y, 135, '#38bdf8', 5, owner.character.id, owner.character.series);
        ctx.spawnFloatingText(e.x, e.y - e.radius - 22, 'SOUL SNAP!', '#ef4444', 'crit');
      }
      ctx.addScreenShake(11);
      ctx.emitSfx({ type: 'ko', intensity: 1.15 });
    }
  },
};
