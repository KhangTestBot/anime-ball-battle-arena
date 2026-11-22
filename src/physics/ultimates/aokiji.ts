import { applyFighterStun } from '../domains';
import type { UltimateHandler } from './types';

export interface AokijiUltimateData {
  iceFloorRadius: number;
  pheasantFired: boolean;
  pheasantX: number;
  pheasantY: number;
  pheasantVx: number;
  pheasantVy: number;
  freezeFlash: number;
}

export const aokijiUltimateHandler: UltimateHandler = {
  characterId: 'aokiji',
  title: 'ICE AGE & PHEASANT BEAK',
  subtitle:
    'Freezes the arena into an Ice Age (arena-wide Frost slow + 1.35s Ice Time freeze) → Fires Pheasant Beak piercing armor & shattering frozen targets’ shields!',
  bannerColor: '#38bdf8',
  castDuration: 0.24,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.3);
    const enemies = ctx.getEnemies(owner);

    // Instant ICE AGE deep-freeze across arena!
    for (const e of enemies) {
      e.frostTimer = Math.max(e.frostTimer, 3.2);
      if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 275) {
        applyFighterStun(ctx, owner, e, 1.35, 'frozen', 'ICE TIME!');
        ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 6.2), 0, 0, {
          sourceKind: 'ability',
        });
      }
    }

    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;

    const data: AokijiUltimateData = {
      iceFloorRadius: 270,
      pheasantFired: false,
      pheasantX: owner.x,
      pheasantY: owner.y,
      pheasantVx: Math.cos(ang) * 720,
      pheasantVy: Math.sin(ang) * 720,
      freezeFlash: 0.85,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, ang, '#38bdf8', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      265,
      '#bae6fd',
      7,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(owner.x, owner.y - owner.radius - 20, 'ICE AGE!!', '#e0f2fe', 'powerup');
    ctx.spawnParticles(owner.x, owner.y, 28, '#7dd3fc', 70, 240, 3, 6, 'shard');
    ctx.addScreenShake(10);
    ctx.addHitstop(0.055);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as AokijiUltimateData;
    const enemies = ctx.getEnemies(owner);

    if (data.freezeFlash > 0) data.freezeFlash = Math.max(0, data.freezeFlash - dt);

    // Slippery glacial frost field keeps enemies chilled
    for (const e of enemies) {
      if (Math.hypot(e.x - owner.x, e.y - owner.y) <= data.iceFloorRadius) {
        e.frostTimer = Math.max(e.frostTimer, 0.35);
      }
    }

    // Launch Sculpted Ice Pheasant (Pheasant Beak!) at 1.45s shattering frozen targets!
    if (!data.pheasantFired && state.elapsed >= 1.45) {
      data.pheasantFired = true;
      const target = ctx.getNearestEnemy(owner);
      const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
      data.pheasantX = owner.x + Math.cos(ang) * (owner.radius + 14);
      data.pheasantY = owner.y + Math.sin(ang) * (owner.radius + 14);
      data.pheasantVx = Math.cos(ang) * 720;
      data.pheasantVy = Math.sin(ang) * 720;

      ctx.projectiles.push({
        id: ctx.nextId('pheasant_beak'),
        ownerUid: owner.uid,
        ownerCharId: owner.character.id,
        ownerSeries: owner.character.series,
        teamId: owner.teamId,
        kind: 'ice-crystal',
        x: data.pheasantX,
        y: data.pheasantY,
        vx: data.pheasantVx,
        vy: data.pheasantVy,
        radius: 26,
        damage: ctx.getEffectiveDamage(owner, 13.5),
        knockback: 460,
        color: '#38bdf8',
        secondaryColor: '#ffffff',
        angle: ang,
        life: 1.5,
        maxLife: 1.5,
        piercing: true,
        hitCooldowns: {},
        powerLevel: 7,
      });

      for (const e of enemies) {
        if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 285 + e.radius) {
          e.shieldTimer = 0;
          e.armorShredTimer = Math.max(e.armorShredTimer, 3.0);
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 9.5), 0, 0, {
            isCrit: true,
            sourceKind: 'ability',
          });
        }
      }

      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 20,
        'PHEASANT BEAK!!',
        '#bae6fd',
        'powerup',
      );
      ctx.addHitstop(0.07);
      ctx.addScreenShake(16);
      ctx.emitSfx({ type: 'ko', intensity: 1.3 });
      return;
    }

    if (data.pheasantFired) {
      data.pheasantX += data.pheasantVx * dt;
      data.pheasantY += data.pheasantVy * dt;
    }
  },
};
