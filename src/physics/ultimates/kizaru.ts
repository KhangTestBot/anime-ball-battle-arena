import type { UltimateHandler } from './types';

export interface MirrorBeamTrail {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  life: number;
}

export interface KizaruUltimateData {
  bouncesLeft: number;
  bounceCd: number;
  trails: MirrorBeamTrail[];
  jewelsFired: boolean;
  kickFlash: number;
}

export const kizaruUltimateHandler: UltimateHandler = {
  characterId: 'kizaru',
  title: 'YASAKANI NO MAGATAMA & YATA NO KAGAMI LIGHT BLITZ',
  subtitle:
    'Reflects along Yata Mirror (60% Dodge + Light Speed) blinking across 3 points → Rains 12 piercing Yasakani light beams & lands a shield-breaking lightspeed kick!',
  bannerColor: '#facc15',
  castDuration: 0.22,
  duration: 3.7,

  onCast(ctx, owner, state) {
    owner.evadeTimer = Math.max(owner.evadeTimer, 2.3);
    owner.getExcitedTimer = Math.max(owner.getExcitedTimer, 3.2);

    const data: KizaruUltimateData = {
      bouncesLeft: 3,
      bounceCd: 0.14,
      trails: [],
      jewelsFired: false,
      kickFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#facc15', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      185,
      '#fef08a',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'YATA NO KAGAMI!!',
      '#fef08a',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 20, '#facc15', 90, 300, 2.5, 5.5, 'star');
    ctx.addScreenShake(8);
    ctx.addHitstop(0.045);
    ctx.emitSfx({ type: 'dodge' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as KizaruUltimateData;
    const enemies = ctx.getEnemies(owner);
    const { left, right, top, bottom } = ctx.bounds;

    if (data.kickFlash > 0) data.kickFlash = Math.max(0, data.kickFlash - dt);

    for (let i = data.trails.length - 1; i >= 0; i--) {
      data.trails[i].life -= dt;
      if (data.trails[i].life <= 0) data.trails.splice(i, 1);
    }

    // 1. Speed-of-light Mirror zig-zag strikes
    if (data.bouncesLeft > 0) {
      data.bounceCd -= dt;
      if (data.bounceCd <= 0) {
        data.bounceCd = 0.44;
        data.bouncesLeft--;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const oldX = owner.x;
          const oldY = owner.y;
          const ang = data.bouncesLeft * 1.9;
          owner.x = Math.max(
            left + owner.radius + 8,
            Math.min(right - owner.radius - 8, target.x + Math.cos(ang) * 78),
          );
          owner.y = Math.max(
            top + owner.radius + 8,
            Math.min(bottom - owner.radius - 8, target.y + Math.sin(ang) * 78),
          );
          data.trails.push({ x1: oldX, y1: oldY, x2: owner.x, y2: owner.y, life: 0.75 });
          ctx.applyDamage(owner, target, ctx.getEffectiveDamage(owner, 4.8), 0, 0, {
            isCrit: true,
            sourceKind: 'ability',
          });
          ctx.spawnFloatingText(
            target.x,
            target.y - target.radius - 14,
            'SPEED OF LIGHT!',
            '#fef08a',
            'crit',
          );
          ctx.emitSfx({ type: 'beam-fire', intensity: 1.0 });
        }
      }
      return;
    }

    // 2. Rain 12 Golden Yasakani Sacred Jewel Lasers + Light Kick Finish (1.85s)
    if (!data.jewelsFired && state.elapsed >= 1.85) {
      data.jewelsFired = true;
      data.kickFlash = 1.1;

      const target = ctx.getNearestEnemy(owner);
      const baseAng = target
        ? Math.atan2(target.y - owner.y, target.x - owner.x)
        : owner.facingAngle;

      for (let i = 0; i < 12; i++) {
        const ang = baseAng + (i - 5.5) * 0.14;
        ctx.projectiles.push({
          id: ctx.nextId('yasakani'),
          ownerUid: owner.uid,
          ownerCharId: owner.character.id,
          ownerSeries: owner.character.series,
          teamId: owner.teamId,
          kind: 'ki-blast',
          x: owner.x + Math.cos(ang) * (owner.radius + 10),
          y: owner.y + Math.sin(ang) * (owner.radius + 10),
          vx: Math.cos(ang) * 820,
          vy: Math.sin(ang) * 820,
          radius: 9,
          damage: ctx.getEffectiveDamage(owner, 4.0),
          knockback: 180,
          color: '#facc15',
          secondaryColor: '#ffffff',
          angle: ang,
          life: 1.1,
          maxLife: 1.1,
          piercing: true,
          hitCooldowns: {},
          powerLevel: 6,
        });
      }

      for (const e of enemies) {
        if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 230 + e.radius) {
          e.shieldTimer = 0;
          e.dodgeLockedTimer = Math.max(e.dodgeLockedTimer, 2.0);
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 11.5), 0, 0, {
            isCrit: true,
            sourceKind: 'ability',
          });
        }
      }

      ctx.spawnShockwave(
        owner.x,
        owner.y,
        235,
        '#facc15',
        8,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 22,
        'YASAKANI NO MAGATAMA!!',
        '#fef08a',
        'powerup',
      );
      ctx.addHitstop(0.075);
      ctx.addScreenShake(18);
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.4 });
    }
  },
};
