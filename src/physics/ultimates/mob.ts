import type { UltimateHandler } from './types';

export interface MobUltimateData {
  percentText: '98%' | '99%' | '???%';
  stage: 'hijack-lift' | 'left-slam' | 'right-slam' | 'aftermath';
  stageTimer: number;
  grabbedUid: string | null;
  hijackedCount: number;
}

export const mobUltimateHandler: UltimateHandler = {
  characterId: 'mob',
  title: '???% — PSYCHIC TELEKINESIS & EMOTIONAL EXPLOSION',
  subtitle:
    '98% → 99% → ???%: Prismatic telekinesis reverses all enemy projectiles 180° & slams foes Left → Right across the walls in 2 beats!',
  bannerColor: '#c084fc',
  castDuration: 0.25,
  duration: 3.9,

  onCast(ctx, owner, state) {
    // 1. Psychically seize ALL incoming enemy projectiles and reverse them 180° back at their casters!
    let hijacked = 0;
    for (const p of ctx.projectiles) {
      if (p.ownerUid === owner.uid) continue;
      if (owner.teamId !== null && p.teamId === owner.teamId) continue;
      p.ownerUid = owner.uid;
      p.teamId = owner.teamId;
      p.vx = -p.vx * 1.35;
      p.vy = -p.vy * 1.35;
      p.damage *= 1.3;
      p.color = '#e879f9';
      p.secondaryColor = '#38bdf8';
      p.angle = Math.atan2(p.vy, p.vx);
      hijacked += 1;
      ctx.spawnParticles(p.x, p.y, 6, '#e879f9', 50, 170, 2.5, 5, 'star');
    }

    const nearest = ctx.getNearestEnemy(owner);
    const grabbed = nearest && nearest.unstoppableTimer <= 0 ? nearest.uid : null;

    const data: MobUltimateData = {
      percentText: '98%',
      stage: 'hijack-lift',
      stageTimer: 0.55,
      grabbedUid: grabbed,
      hijackedCount: hijacked,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#c084fc', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      hijacked > 0 ? `???% HIJACK x${hijacked}!` : '???% TELEKINESIS!!',
      '#e879f9',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 24, '#c084fc', 90, 320, 3, 6.5, 'star');
    ctx.addScreenShake(10);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as MobUltimateData;
    const { left, right, top, bottom } = ctx.bounds;
    const enemies = ctx.getEnemies(owner);
    const prey = data.grabbedUid ? enemies.find((e) => e.uid === data.grabbedUid) : null;

    // Emotional Escalation readout: 98% -> 99% -> ???%
    data.percentText = state.elapsed > 0.9 ? '???%' : state.elapsed > 0.4 ? '99%' : '98%';

    // Continuously bend any new enemy projectiles near Mob 180 degrees back!
    for (const p of ctx.projectiles) {
      if (p.ownerUid === owner.uid) continue;
      if (owner.teamId !== null && p.teamId === owner.teamId) continue;
      if (Math.hypot(p.x - owner.x, p.y - owner.y) <= 135) {
        p.ownerUid = owner.uid;
        p.teamId = owner.teamId;
        p.vx = -p.vx * 1.3;
        p.vy = -p.vy * 1.3;
        p.color = '#e879f9';
        data.hijackedCount += 1;
        ctx.spawnParticles(p.x, p.y, 5, '#38bdf8', 50, 150, 2, 4, 'star');
      }
    }

    data.stageTimer -= dt;

    if (data.stage === 'hijack-lift') {
      if (prey) {
        prey.vx *= Math.pow(0.15, dt);
        prey.vy *= Math.pow(0.15, dt);
        const cy = (top + bottom) * 0.5;
        prey.y += (cy - prey.y) * Math.min(1, dt * 6);
      }
      if (data.stageTimer <= 0) {
        data.stage = 'left-slam';
        data.stageTimer = 0.72;
        if (prey) {
          prey.vx = -980;
          prey.vy = 0;
          ctx.spawnFloatingText(
            prey.x,
            prey.y - prey.radius - 16,
            'SLAM LEFT ←!',
            '#e879f9',
            'callout',
          );
        }
        ctx.addScreenShake(9);
        ctx.emitSfx({ type: 'wall', intensity: 1.2 });
      }
    } else if (data.stage === 'left-slam') {
      if (prey) {
        prey.vx -= 1400 * dt;
      }
      if ((prey && prey.x <= left + prey.radius + 16) || data.stageTimer <= 0) {
        if (prey) {
          ctx.applyDamage(owner, prey, ctx.getEffectiveDamage(owner, 9.5), 140, 0, {
            isCrit: true,
            sourceKind: 'wall',
          });
          ctx.spawnShockwave(
            prey.x,
            prey.y,
            110,
            '#e879f9',
            5,
            owner.character.id,
            owner.character.series,
          );
          prey.vx = 1040;
          prey.vy = 0;
          ctx.spawnFloatingText(
            prey.x,
            prey.y - prey.radius - 16,
            'SLAM RIGHT →!',
            '#38bdf8',
            'callout',
          );
        }
        data.stage = 'right-slam';
        data.stageTimer = 0.75;
        ctx.addScreenShake(11);
        ctx.emitSfx({ type: 'crit', intensity: 1.15 });
      }
    } else if (data.stage === 'right-slam') {
      if (prey) {
        prey.vx += 1500 * dt;
      }
      if ((prey && prey.x >= right - prey.radius - 16) || data.stageTimer <= 0) {
        data.stage = 'aftermath';
        if (prey) {
          ctx.applyDamage(owner, prey, ctx.getEffectiveDamage(owner, 12.5), -260, 0, {
            isCrit: true,
            sourceKind: 'wall',
          });
          ctx.spawnShockwave(
            prey.x,
            prey.y,
            145,
            '#facc15',
            6,
            owner.character.id,
            owner.character.series,
          );
        }
        ctx.addHitstop(0.06);
        ctx.addScreenShake(15);
        ctx.emitSfx({ type: 'ko', intensity: 1.2 });
      }
    }
  },
};
