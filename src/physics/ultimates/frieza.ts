import type { UltimateHandler } from './types';

export interface FriezaUltimateData {
  stage: 'saucers-charge' | 'supernova-drop' | 'done';
  sunRadius: number;
  sunX: number;
  sunY: number;
  beamCd: number;
  saucersSpawned: boolean;
  detonated: boolean;
  nukeFlash: number;
}

export const friezaUltimateHandler: UltimateHandler = {
  characterId: 'frieza',
  title: 'BLACK FRIEZA: TWIN DEATH SAUCERS & SUPERNOVA',
  subtitle:
    'Launches 2 homing boomerang Death Saucers that pierce armor · Snipes with purple Death Beams → Drops a Supernova sun crushing obstacles & erasing shields!',
  bannerColor: '#a855f7',
  castDuration: 0.25,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.4);
    const target = ctx.getNearestEnemy(owner);
    const baseAng = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;

    // Launch 2 signature Homing + Boomerang Purple Death Saucers!
    for (const offset of [-0.45, 0.45]) {
      const ang = baseAng + offset;
      ctx.projectiles.push({
        id: ctx.nextId('saucer'),
        ownerUid: owner.uid,
        ownerCharId: owner.character.id,
        ownerSeries: owner.character.series,
        teamId: owner.teamId,
        kind: 'chakram-ring',
        x: owner.x + Math.cos(ang) * (owner.radius + 14),
        y: owner.y + Math.sin(ang) * (owner.radius + 14),
        vx: Math.cos(ang) * 560,
        vy: Math.sin(ang) * 560,
        radius: 17,
        damage: ctx.getEffectiveDamage(owner, 6.2),
        knockback: 260,
        color: '#a855f7',
        secondaryColor: '#e879f9',
        angle: ang,
        life: 2.3,
        maxLife: 2.3,
        piercing: true,
        boomerang: true,
        homing: true,
        hitCooldowns: {},
        powerLevel: 6,
      });
    }

    const data: FriezaUltimateData = {
      stage: 'saucers-charge',
      sunRadius: 16,
      sunX: owner.x,
      sunY: Math.max(ctx.bounds.top + 36, owner.y - owner.radius - 32),
      beamCd: 0.45,
      saucersSpawned: true,
      detonated: false,
      nukeFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, baseAng, '#a855f7', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      185,
      '#c084fc',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'DEATH SAUCERS & SUPERNOVA!',
      '#e879f9',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'beam-charge' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as FriezaUltimateData;
    const enemies = ctx.getEnemies(owner);
    const { left, right, top, bottom } = ctx.bounds;

    if (data.nukeFlash > 0) data.nukeFlash = Math.max(0, data.nukeFlash - dt);

    if (data.stage === 'saucers-charge') {
      data.sunX = owner.x;
      data.sunY = Math.max(top + 36, owner.y - owner.radius - 34);
      data.sunRadius = Math.min(62, data.sunRadius + dt * 26);

      // Fire snappy Death Beams while Supernova charges overhead!
      data.beamCd -= dt;
      if (data.beamCd <= 0) {
        data.beamCd = 0.58;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          ctx.projectiles.push({
            id: ctx.nextId('dbeam'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'ki-blast',
            x: owner.x + Math.cos(ang) * (owner.radius + 10),
            y: owner.y + Math.sin(ang) * (owner.radius + 10),
            vx: Math.cos(ang) * 780,
            vy: Math.sin(ang) * 780,
            radius: 10,
            damage: ctx.getEffectiveDamage(owner, 4.5),
            knockback: 180,
            color: '#e879f9',
            secondaryColor: '#ffffff',
            angle: ang,
            life: 1.2,
            maxLife: 1.2,
            piercing: true,
            hitCooldowns: {},
            powerLevel: 5,
          });
          ctx.emitSfx({ type: 'beam-fire', intensity: 0.9 });
        }
      }

      // Climax (1.9s): Crush down Black-Crimson SUPERNOVA!!
      if (state.elapsed >= 1.9 && !data.detonated) {
        data.detonated = true;
        data.stage = 'supernova-drop';
        data.nukeFlash = 1.25;

        const target = ctx.getNearestEnemy(owner);
        const dropX = Math.max(
          left + 48,
          Math.min(right - 48, target ? target.x : (left + right) / 2),
        );
        const dropY = Math.max(
          top + 48,
          Math.min(bottom - 48, target ? target.y : (top + bottom) / 2),
        );
        data.sunX = dropX;
        data.sunY = dropY;

        // Planetary obliteration clears nearby obstacles cleanly
        for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
          if (Math.hypot(ctx.obstacles[i].x - dropX, ctx.obstacles[i].y - dropY) <= 220) {
            ctx.obstacles.splice(i, 1);
          }
        }

        ctx.addHitstop(0.08);
        ctx.addScreenShake(22);
        ctx.spawnShockwave(
          dropX,
          dropY,
          245,
          '#ef4444',
          8.5,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnShockwave(
          dropX,
          dropY,
          175,
          '#facc15',
          5.5,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(dropX, dropY - 26, 'SUPERNOVA!!', '#fde047', 'powerup');
        ctx.spawnParticles(dropX, dropY, 34, '#f97316', 100, 360, 3.5, 7.5, 'star');
        ctx.emitSfx({ type: 'ko', intensity: 1.4 });

        for (const e of enemies) {
          const dx = e.x - dropX;
          const dy = e.y - dropY;
          const dist = Math.hypot(dx, dy);
          if (dist <= 205 + e.radius) {
            const d = Math.max(1, dist);
            e.shieldTimer = 0;
            e.armorShredTimer = Math.max(e.armorShredTimer, 2.8);
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, 17.0),
              (dx / d) * 520,
              (dy / d) * 520,
              {
                isCrit: true,
                sourceKind: 'ability',
              },
            );
          }
        }
      }
    }
  },
};
