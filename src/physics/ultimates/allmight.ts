import { applyFighterStun } from '../domains';
import type { UltimateHandler } from './types';

export interface AllMightUltimateData {
  stage: 'detroit-rush' | 'us-of-smash';
  smashX: number;
  smashY: number;
  smashed: boolean;
  smashFlash: number;
}

export const allmightUltimateHandler: UltimateHandler = {
  characterId: 'allmight',
  title: 'ONE FOR ALL: UNITED STATES OF SMASH!',
  subtitle:
    'The Symbol of Peace erupts with unstoppable might (Giant + Unstoppable), blowing away enemy projectiles with wind pressure → Slams down the United States of Smash tornado launching foes & smashing all obstacles!',
  bannerColor: '#eab308',
  castDuration: 0.25,
  duration: 3.8,

  onCast(ctx, owner, state) {
    owner.giantTimer = Math.max(owner.giantTimer, 3.0);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.1);

    const data: AllMightUltimateData = {
      stage: 'detroit-rush',
      smashX: owner.x,
      smashY: owner.y,
      smashed: false,
      smashFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#eab308', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      200,
      '#38bdf8',
      7,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'I AM HERE! PLUS ULTRA!!',
      '#fde047',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 24, '#facc15', 85, 280, 3, 6.5, 'star');
    ctx.addScreenShake(10);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as AllMightUltimateData;
    const enemies = ctx.getEnemies(owner);
    const { left, right, top, bottom } = ctx.bounds;

    if (data.smashFlash > 0) data.smashFlash = Math.max(0, data.smashFlash - dt);

    // Clear incoming bullets with One For All Oklahoma Air Pressure!
    for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
      const p = ctx.projectiles[i];
      if (
        p.ownerUid !== owner.uid &&
        Math.hypot(p.x - owner.x, p.y - owner.y) <= owner.radius + 65
      ) {
        ctx.spawnParticles(p.x, p.y, 6, '#bae6fd', 50, 140, 2.5, 4.5, 'spark');
        ctx.projectiles.splice(i, 1);
      }
    }

    if (data.stage === 'detroit-rush') {
      const target = ctx.getNearestEnemy(owner);
      if (target) {
        const dx = target.x - owner.x;
        const dy = target.y - owner.y;
        const d = Math.max(1, Math.hypot(dx, dy));
        owner.vx = (dx / d) * 620;
        owner.vy = (dy / d) * 620;
      }

      // Climax (1.75s): UNITED STATES OF SMASH!! Tornado Vacuum Crash!
      if (!data.smashed && state.elapsed >= 1.75) {
        data.smashed = true;
        data.stage = 'us-of-smash';
        data.smashFlash = 1.3;

        const focus = ctx.getNearestEnemy(owner);
        if (focus) {
          owner.x = Math.max(left + owner.radius + 8, Math.min(right - owner.radius - 8, focus.x));
          owner.y = Math.max(top + owner.radius + 8, Math.min(bottom - owner.radius - 8, focus.y));
        }
        data.smashX = owner.x;
        data.smashY = owner.y;

        for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
          if (
            Math.hypot(ctx.obstacles[i].x - data.smashX, ctx.obstacles[i].y - data.smashY) <= 250
          ) {
            ctx.obstacles.splice(i, 1);
          }
        }

        for (const e of enemies) {
          const dx = e.x - data.smashX;
          const dy = e.y - data.smashY;
          const dist = Math.hypot(dx, dy);
          if (dist <= 245 + e.radius) {
            const d = Math.max(1, dist);
            e.shieldTimer = 0;
            applyFighterStun(ctx, owner, e, 0.65, 'airborne', 'UNITED STATES OF SMASH!');
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, 18.0),
              (dx / d) * 680,
              (dy / d) * 680,
              { bypassInvuln: true, isCrit: true, sourceKind: 'ability' },
            );
          }
        }

        ctx.addHitstop(0.09);
        ctx.addScreenShake(26);
        ctx.spawnShockwave(
          data.smashX,
          data.smashY,
          275,
          '#facc15',
          10,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(
          data.smashX,
          data.smashY - 26,
          'UNITED STATES OF... SMASH!!',
          '#fef08a',
          'powerup',
        );
        ctx.emitSfx({ type: 'ko', intensity: 1.5 });
      }
    }
  },
};
