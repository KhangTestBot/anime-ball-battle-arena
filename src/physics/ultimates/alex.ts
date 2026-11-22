import type { UltimateHandler } from './types';

export interface AlexUltimateData {
  volleysFired: number;
  volleyCd: number;
  cannonFired: boolean;
  flash: number;
}

export const alexUltimateHandler: UltimateHandler = {
  characterId: 'alex',
  title: 'MULTISHOT FIREWORK CROSSBOW & TNT CANNON',
  subtitle:
    'Fires 3 Multishot Firework Crossbow spreads, then ignites a mega Redstone TNT Cannon shattering enemy shields & obstacles!',
  bannerColor: '#22c55e',
  castDuration: 0.24,
  duration: 3.7,

  onCast(ctx, owner, state) {
    owner.shieldTimer = Math.max(owner.shieldTimer, 2.4);
    owner.shieldColor = '#22c55e';
    const data: AlexUltimateData = {
      volleysFired: 0,
      volleyCd: 0.3,
      cannonFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#22c55e', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'MULTISHOT CROSSBOW!',
      '#4ade80',
      'powerup',
    );
    ctx.emitSfx({ type: 'slash', intensity: 1.15 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as AlexUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.cannonFired && data.volleysFired < 3) {
      data.volleyCd -= dt;
      if (data.volleyCd <= 0) {
        data.volleyCd = 0.44;
        data.volleysFired += 1;
        const target = ctx.getNearestEnemy(owner);
        const baseAng = target
          ? Math.atan2(target.y - owner.y, target.x - owner.x)
          : owner.facingAngle;
        for (let k = -1; k <= 1; k++) {
          const a = baseAng + k * 0.22;
          ctx.projectiles.push({
            id: ctx.nextId('alex_fw'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'rocket',
            x: owner.x,
            y: owner.y,
            vx: Math.cos(a) * 580,
            vy: Math.sin(a) * 580,
            radius: 10,
            damage: ctx.getEffectiveDamage(owner, 7.6),
            knockback: 220,
            color: '#22c55e',
            secondaryColor: '#facc15',
            angle: a,
            life: 1.6,
            maxLife: 1.6,
            piercing: false,
            explosiveRadius: 65,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.1 });
      }
    }

    if (!data.cannonFired && state.elapsed >= 1.95) {
      data.cannonFired = true;
      data.flash = 1.2;
      const target = ctx.getNearestEnemy(owner);
      const tx = target ? target.x : (ctx.bounds.left + ctx.bounds.right) * 0.5;
      const ty = target ? target.y : (ctx.bounds.top + ctx.bounds.bottom) * 0.5;

      for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
        if (Math.hypot(ctx.obstacles[i].x - tx, ctx.obstacles[i].y - ty) <= 210) {
          ctx.obstacles.splice(i, 1);
        }
      }

      for (const e of ctx.getEnemies(owner)) {
        if (Math.hypot(e.x - tx, e.y - ty) <= 220 + e.radius) {
          e.shieldTimer = 0;
          const ang = Math.atan2(e.y - ty, e.x - tx);
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 21.0),
            Math.cos(ang) * 520,
            Math.sin(ang) * 520,
            {
              isCrit: true,
              bypassInvuln: true,
              sourceKind: 'ability',
            },
          );
        }
      }
      ctx.spawnShockwave(tx, ty, 235, '#ef4444', 8, owner.character.id, owner.character.series);
      ctx.spawnParticles(tx, ty, 32, '#ef4444', 90, 320, 3, 6.5, 'pixel');
      ctx.spawnFloatingText(tx, ty - 26, 'TNT CANNON BLAST!', '#facc15', 'crit');
      ctx.addScreenShake(15);
      ctx.addHitstop(0.06);
      ctx.emitSfx({ type: 'ko', intensity: 1.25 });
    }
  },
};
