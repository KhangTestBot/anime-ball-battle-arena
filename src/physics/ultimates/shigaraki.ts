import type { UltimateHandler } from './types';

export interface ShigarakiUltimateData {
  decayX: number;
  decayY: number;
  decayRadius: number;
  decayTickCd: number;
  rivetBurstFired: boolean;
}

export const shigarakiUltimateHandler: UltimateHandler = {
  characterId: 'shigaraki',
  title: 'DECAY WAVE & ALL FOR ONE SINGULARITY',
  subtitle:
    'Touches the floor to unleash a 295px Decay Wave: crumbles all obstacles, drains HP through shields, shreds armor & BLOCKS HEALING → Finishes with crimson Rivet Stab!',
  bannerColor: '#38bdf8',
  castDuration: 0.25,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.5);

    const data: ShigarakiUltimateData = {
      decayX: owner.x,
      decayY: owner.y,
      decayRadius: 90,
      decayTickCd: 0.25,
      rivetBurstFired: false,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ef4444', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      195,
      '#94a3b8',
      6.5,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'EVERYTHING TURNS TO DUST!',
      '#fca5a5',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 24, '#64748b', 70, 230, 3, 6, 'shard');
    ctx.addScreenShake(10);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ShigarakiUltimateData;
    const enemies = ctx.getEnemies(owner);

    // Expanding Decay Wave spreads steadily outward & disintegrates all obstacles!
    data.decayRadius = Math.min(295, data.decayRadius + dt * 115);

    for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
      if (
        Math.hypot(ctx.obstacles[i].x - data.decayX, ctx.obstacles[i].y - data.decayY) <=
        data.decayRadius + 24
      ) {
        ctx.spawnParticles(
          ctx.obstacles[i].x,
          ctx.obstacles[i].y,
          10,
          '#94a3b8',
          50,
          170,
          2.5,
          5,
          'pixel',
        );
        ctx.obstacles.splice(i, 1);
      }
    }

    data.decayTickCd -= dt;
    if (data.decayTickCd <= 0 && state.elapsed < 2.2) {
      data.decayTickCd = 0.42;
      for (const e of enemies) {
        if (Math.hypot(e.x - data.decayX, e.y - data.decayY) <= data.decayRadius + e.radius) {
          e.shieldTimer = 0;
          e.armorShredTimer = Math.max(e.armorShredTimer, 3.0);
          e.antiHealTimer = Math.max(e.antiHealTimer, 3.2);
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 4.4), 0, 0, {
            bypassInvuln: true,
            sourceKind: 'ability',
          });
          ctx.spawnFloatingText(e.x, e.y - e.radius - 12, 'DECAY!', '#cbd5e1', 'callout');
        }
      }
    }

    // Climax (2.2s): All For One Singularity Rivet Stab Burst!
    if (!data.rivetBurstFired && state.elapsed >= 2.2) {
      data.rivetBurstFired = true;
      for (const e of enemies) {
        if (Math.hypot(e.x - data.decayX, e.y - data.decayY) <= 290 + e.radius) {
          e.shieldTimer = 0;
          e.antiHealTimer = Math.max(e.antiHealTimer, 3.2);
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 12.5), 0, 0, {
            bypassInvuln: true,
            isCrit: true,
            sourceKind: 'ability',
          });
        }
      }
      ctx.spawnShockwave(
        data.decayX,
        data.decayY,
        285,
        '#dc2626',
        8,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 22,
        'ALL FOR ONE: DECAY WAVE!!',
        '#fecaca',
        'powerup',
      );
      ctx.addHitstop(0.08);
      ctx.addScreenShake(20);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};
