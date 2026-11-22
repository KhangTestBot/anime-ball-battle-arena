import type { UltimateHandler } from './types';

export interface TodorokiUltimateData {
  stage: 'ice-fire' | 'phosphor';
  iceWallIds: string[];
  phosphorDetonated: boolean;
  phosphorFlash: number;
}

export const todorokiUltimateHandler: UltimateHandler = {
  characterId: 'todoroki',
  title: 'PHOSPHOR: HEAVEN-PIERCING ICE & GREAT GLACIER AEGIR',
  subtitle:
    'Right side raises 3 physical Ice Walls blocking projectiles & inflicting Frost · Left side blasts Flames → Fuses Cold-Fire PHOSPHOR triggering thermal shock shattering ice walls & shields!',
  bannerColor: '#38bdf8',
  castDuration: 0.24,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.3);
    const { left, right, top, bottom } = ctx.bounds;
    const iceWallIds: string[] = [];

    for (let i = 0; i < 3; i++) {
      const a = owner.facingAngle + (i - 1) * 0.72;
      const wx = Math.max(left + 42, Math.min(right - 42, owner.x + Math.cos(a) * 105));
      const wy = Math.max(top + 42, Math.min(bottom - 42, owner.y + Math.sin(a) * 105));
      const id = ctx.nextId('shoto_ice');
      iceWallIds.push(id);
      ctx.obstacles.push({
        id,
        ownerUid: owner.uid,
        ownerCharId: owner.character.id,
        teamId: owner.teamId,
        kind: 'obsidian-block',
        x: wx,
        y: wy,
        w: 36,
        h: 36,
        hp: 90,
        maxHp: 90,
        life: 3.0,
        maxLife: 3.0,
        blocksProjectiles: true,
        restitution: 1.15,
        color: '#0284c7',
        secondaryColor: '#bae6fd',
      });
    }

    for (const e of ctx.getEnemies(owner)) {
      if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 235) {
        e.frostTimer = Math.max(e.frostTimer, 2.6);
      }
    }

    const data: TodorokiUltimateData = {
      stage: 'ice-fire',
      iceWallIds,
      phosphorDetonated: false,
      phosphorFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      195,
      '#38bdf8',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'HEAVEN-PIERCING ICE WALL!',
      '#bae6fd',
      'powerup',
    );
    ctx.addScreenShake(9);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as TodorokiUltimateData;
    const enemies = ctx.getEnemies(owner);

    if (data.phosphorFlash > 0) data.phosphorFlash = Math.max(0, data.phosphorFlash - dt);

    // Stage 2 (1.85s): PHOSPHOR COLD-FIRE THERMAL SHOCK!! Shatters spawned ice blocks into thermal blast!
    if (!data.phosphorDetonated && state.elapsed >= 1.85) {
      data.phosphorDetonated = true;
      data.stage = 'phosphor';
      data.phosphorFlash = 1.2;

      for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
        const obs = ctx.obstacles[i];
        if (data.iceWallIds.includes(obs.id)) {
          ctx.spawnParticles(obs.x, obs.y, 14, '#7dd3fc', 80, 260, 3, 6, 'shard');
          ctx.obstacles.splice(i, 1);
        }
      }

      for (const e of enemies) {
        const dx = e.x - owner.x;
        const dy = e.y - owner.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= 275 + e.radius) {
          const d = Math.max(1, dist);
          e.shieldTimer = 0;
          e.frostTimer = Math.max(e.frostTimer, 2.5);
          e.burnTimer = Math.max(e.burnTimer, 2.5);
          e.burnDps = Math.max(e.burnDps, 8);
          e.burnOwnerUid = owner.uid;
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 15.5),
            (dx / d) * 460,
            (dy / d) * 460,
            {
              isCrit: true,
              sourceKind: 'ability',
            },
          );
        }
      }

      ctx.spawnShockwave(
        owner.x,
        owner.y,
        255,
        '#c084fc',
        8.5,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 22,
        'GREAT GLACIER AEGIR!!',
        '#e0f2fe',
        'powerup',
      );
      ctx.addHitstop(0.08);
      ctx.addScreenShake(20);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};
