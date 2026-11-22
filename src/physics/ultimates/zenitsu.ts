import { applyFighterStun } from '../domains';
import type { UltimateHandler } from './types';

export interface ThunderBoltStreak {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  life: number;
}

export interface ZenitsuUltimateData {
  stage: 'six-fold' | 'thunder-god' | 'done';
  dashesLeft: number;
  dashCd: number;
  bolts: ThunderBoltStreak[];
  dragonFlash: number;
  dragonX1: number;
  dragonY1: number;
  dragonX2: number;
  dragonY2: number;
}

export const zenitsuUltimateHandler: UltimateHandler = {
  characterId: 'zenitsu',
  title: 'THUNDERCLAP AND FLASH SIXFOLD & FLAMING THUNDER GOD',
  subtitle:
    'Sleeping stance triggers Thunderclap and Flash Sixfold zigzagging 6 times through targets → Finishes with 7th Form: FLAMING THUNDER GOD (lightning dragon stun & paralysis)!',
  bannerColor: '#facc15',
  castDuration: 0.22,
  duration: 3.7,

  onCast(ctx, owner, state) {
    owner.evadeTimer = Math.max(owner.evadeTimer, 1.5);
    const data: ZenitsuUltimateData = {
      stage: 'six-fold',
      dashesLeft: 6,
      dashCd: 0.14,
      bolts: [],
      dragonFlash: 0,
      dragonX1: owner.x,
      dragonY1: owner.y,
      dragonX2: owner.x,
      dragonY2: owner.y,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#facc15', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'THUNDERCLAP AND FLASH: SIX FOLD!',
      '#fde047',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 20, '#facc15', 90, 300, 2.5, 5.5, 'star');
    ctx.addScreenShake(9);
    ctx.addHitstop(0.045);
    ctx.emitSfx({ type: 'dodge' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ZenitsuUltimateData;
    const enemies = ctx.getEnemies(owner);
    const { left, right, top, bottom } = ctx.bounds;

    if (data.dragonFlash > 0) {
      data.dragonFlash = Math.max(0, data.dragonFlash - dt);
    }

    for (let i = data.bolts.length - 1; i >= 0; i--) {
      data.bolts[i].life -= dt;
      if (data.bolts[i].life <= 0) data.bolts.splice(i, 1);
    }

    if (data.stage === 'six-fold') {
      if (data.dashesLeft > 0) {
        data.dashCd -= dt;
        if (data.dashCd <= 0) {
          data.dashCd = 0.22;
          data.dashesLeft--;
          const target = ctx.getNearestEnemy(owner);
          const oldX = owner.x;
          const oldY = owner.y;
          const ang = target
            ? Math.atan2(target.y - oldY, target.x - oldX) +
              (data.dashesLeft % 2 === 0 ? 0.25 : -0.25)
            : owner.facingAngle + Math.PI * 0.7;
          const stepDist = target ? Math.hypot(target.x - oldX, target.y - oldY) + 55 : 190;
          const nx = Math.max(
            left + owner.radius + 10,
            Math.min(right - owner.radius - 10, oldX + Math.cos(ang) * stepDist),
          );
          const ny = Math.max(
            top + owner.radius + 10,
            Math.min(bottom - owner.radius - 10, oldY + Math.sin(ang) * stepDist),
          );

          owner.afterimages.push({
            x: oldX,
            y: oldY,
            alpha: 0.85,
            color: '#facc15',
            formIndex: owner.formIndex,
          });
          owner.x = nx;
          owner.y = ny;
          owner.facingAngle = ang;
          data.bolts.push({ x1: oldX, y1: oldY, x2: nx, y2: ny, life: 0.8 });

          const ux = (nx - oldX) / Math.max(1, Math.hypot(nx - oldX, ny - oldY));
          const uy = (ny - oldY) / Math.max(1, Math.hypot(nx - oldX, ny - oldY));
          const len = Math.hypot(nx - oldX, ny - oldY);
          for (const e of enemies) {
            const rx = e.x - oldX;
            const ry = e.y - oldY;
            const along = rx * ux + ry * uy;
            const perp = Math.abs(-rx * uy + ry * ux);
            if (along >= -e.radius && along <= len + e.radius && perp <= e.radius + 32) {
              ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 4.2), 0, 0, {
                sourceKind: 'ability',
              });
            }
          }
          ctx.emitSfx({ type: 'slash', intensity: 1.0 });
        }
      }

      // Climax (1.9s): SEVENTH FORM: FLAMING THUNDER GOD!!
      if (state.elapsed >= 1.9) {
        data.stage = 'thunder-god';
        data.dragonFlash = 1.05;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        data.dragonX1 = owner.x;
        data.dragonY1 = owner.y;
        const endX = target
          ? Math.max(
              left + owner.radius + 10,
              Math.min(right - owner.radius - 10, target.x + Math.cos(ang) * 48),
            )
          : Math.max(
              left + owner.radius + 10,
              Math.min(right - owner.radius - 10, owner.x + Math.cos(ang) * 240),
            );
        const endY = target
          ? Math.max(
              top + owner.radius + 10,
              Math.min(bottom - owner.radius - 10, target.y + Math.sin(ang) * 48),
            )
          : Math.max(
              top + owner.radius + 10,
              Math.min(bottom - owner.radius - 10, owner.y + Math.sin(ang) * 240),
            );
        owner.x = endX;
        owner.y = endY;
        data.dragonX2 = endX;
        data.dragonY2 = endY;

        ctx.addHitstop(0.08);
        ctx.addScreenShake(20);
        ctx.spawnShockwave(
          endX,
          endY,
          210,
          '#facc15',
          7.5,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 22,
          'FLAMING THUNDER GOD!!',
          '#fde047',
          'powerup',
        );
        ctx.emitSfx({ type: 'crit', intensity: 1.4 });

        const segDx = data.dragonX2 - data.dragonX1;
        const segDy = data.dragonY2 - data.dragonY1;
        const segLen = Math.max(1, Math.hypot(segDx, segDy));
        const ux = segDx / segLen;
        const uy = segDy / segLen;
        for (const e of enemies) {
          const rx = e.x - data.dragonX1;
          const ry = e.y - data.dragonY1;
          const along = rx * ux + ry * uy;
          const perp = Math.abs(-rx * uy + ry * ux);
          if (along >= -e.radius && along <= segLen + e.radius + 20 && perp <= e.radius + 48) {
            e.paralyzeTimer = Math.max(e.paralyzeTimer, 1.8);
            applyFighterStun(ctx, owner, e, 0.65, 'void-overload', 'GODSPEED STUN!');
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 16.5), ux * 520, uy * 520, {
              isCrit: true,
              sourceKind: 'ability',
            });
          }
        }
      }
      return;
    }

    if (data.stage === 'thunder-god' && data.dragonFlash <= 0) {
      data.stage = 'done';
    }
  },
};
