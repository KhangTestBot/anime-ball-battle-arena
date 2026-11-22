import type { UltimateHandler } from './types';

export interface ChaoticMoonNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  spin: number;
  radius: number;
}

export interface KokushiboUltimateData {
  waveCount: number;
  waveCd: number;
  chaoticMoons: ChaoticMoonNode[];
  sixteenthFired: boolean;
  slashFlash: number;
}

export const kokushiboUltimateHandler: UltimateHandler = {
  characterId: 'kokushibo',
  title: 'MOON BREATHING 16TH FORM: MOONBOW — HALF MOON',
  subtitle:
    'Swings his nine-eyed flesh katana unleashing 2 waves of Crescent Blades flanked by erratic Mini Moons → Finishes with 16th Form Moonbow breaking shields, bleeding & blocking healing!',
  bannerColor: '#a855f7',
  castDuration: 0.25,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.6);

    const data: KokushiboUltimateData = {
      waveCount: 0,
      waveCd: 0.08,
      chaoticMoons: [],
      sixteenthFired: false,
      slashFlash: 0.5,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#a855f7', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      200,
      '#c084fc',
      6.5,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'MOON BREATHING: PERPETUAL MOONS!',
      '#e9d5ff',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 22, '#a855f7', 80, 260, 3, 6, 'shard');
    ctx.addScreenShake(9);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'slash', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as KokushiboUltimateData;
    const enemies = ctx.getEnemies(owner);
    const { left, right, top, bottom } = ctx.bounds;

    if (data.slashFlash > 0) data.slashFlash = Math.max(0, data.slashFlash - dt);

    // Update erratic spinning miniature Chaotic Moon Blades
    for (let i = data.chaoticMoons.length - 1; i >= 0; i--) {
      const m = data.chaoticMoons[i];
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      m.spin += dt * 15;
      if (m.x <= left + 10 || m.x >= right - 10 || m.y <= top + 10 || m.y >= bottom - 10) {
        data.chaoticMoons.splice(i, 1);
      }
    }

    // Emit Moon Crescents + Chaotic Moon Rings over 2 early waves
    if (data.waveCount < 2) {
      data.waveCd -= dt;
      if (data.waveCd <= 0) {
        data.waveCd = 0.95;
        data.waveCount++;

        const target = ctx.getNearestEnemy(owner);
        const baseAng = target
          ? Math.atan2(target.y - owner.y, target.x - owner.x)
          : owner.facingAngle;

        for (let i = -2; i <= 2; i++) {
          const ang = baseAng + i * 0.28;
          ctx.projectiles.push({
            id: ctx.nextId('moon_crescent'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'sword-wave',
            x: owner.x + Math.cos(ang) * (owner.radius + 12),
            y: owner.y + Math.sin(ang) * (owner.radius + 12),
            vx: Math.cos(ang) * 590,
            vy: Math.sin(ang) * 590,
            radius: 17,
            damage: ctx.getEffectiveDamage(owner, 4.4),
            knockback: 45,
            color: '#a855f7',
            secondaryColor: '#f43f5e',
            angle: ang,
            life: 1.25,
            maxLife: 1.25,
            piercing: true,
            hitCooldowns: {},
            powerLevel: 6,
          });

          if (data.chaoticMoons.length < 18) {
            const erraticAng = ang + (i % 2 === 0 ? 0.14 : -0.14);
            data.chaoticMoons.push({
              x: owner.x + Math.cos(erraticAng) * (owner.radius + 18),
              y: owner.y + Math.sin(erraticAng) * (owner.radius + 18),
              vx: Math.cos(erraticAng) * 440,
              vy: Math.sin(erraticAng) * 440,
              spin: i * 1.1,
              radius: 11,
            });
          }
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.15 });
      }
    }

    // Climax (2.2s): 16TH FORM — MOONBOW HALVED MOON! Wide fan of crimson-violet crescent blades sealing healing & causing Karma Bleed!
    if (!data.sixteenthFired && state.elapsed >= 2.2) {
      data.sixteenthFired = true;
      data.slashFlash = 1.2;

      const target = ctx.getNearestEnemy(owner);
      const baseAng = target
        ? Math.atan2(target.y - owner.y, target.x - owner.x)
        : owner.facingAngle;

      for (let i = 0; i < 6; i++) {
        const ang = baseAng + (i - 2.5) * 0.22;
        ctx.beams.push({
          id: ctx.nextId('moonbow'),
          ownerUid: owner.uid,
          ownerCharId: owner.character.id,
          ownerSeries: owner.character.series,
          teamId: owner.teamId,
          originX: owner.x,
          originY: owner.y,
          angle: ang,
          width: 18,
          damagePerTick: ctx.getEffectiveDamage(owner, 3.0),
          color: '#a855f7',
          secondaryColor: '#ef4444',
          coreColor: '#fde68a',
          life: 0.72,
          maxLife: 0.72,
          tickTimer: 0.16,
          powerLevel: 7,
          style: 'gaster',
        });
      }

      for (const e of enemies) {
        if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 350 + e.radius) {
          e.shieldTimer = 0;
          e.antiHealTimer = Math.max(e.antiHealTimer, 3.2);
          e.karmaTimer = Math.max(e.karmaTimer, 2.5);
          e.karmaDps = Math.max(e.karmaDps, 7);
          e.karmaOwnerUid = owner.uid;
          e.karmaKind = 'kr';
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 13.5), 0, 0, {
            bypassInvuln: true,
            isCrit: true,
            sourceKind: 'ability',
          });
          ctx.spawnFloatingText(e.x, e.y - e.radius - 16, 'MOONBOW HALVED!', '#f0abfc', 'crit');
        }
      }

      ctx.spawnShockwave(
        owner.x,
        owner.y,
        260,
        '#a855f7',
        8,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 22,
        '16TH FORM: MOONBOW HALVED MOON!!',
        '#f5d0fe',
        'powerup',
      );
      ctx.addHitstop(0.08);
      ctx.addScreenShake(20);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};
