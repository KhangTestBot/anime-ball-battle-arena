import type { UltimateHandler } from './types';

export interface KenpachiUltimateData {
  cleavesLeft: number;
  cleaveCd: number;
  slashAngle: number;
  slashFlash: number;
}

export const kenpachiUltimateHandler: UltimateHandler = {
  characterId: 'kenpachi',
  title: 'BANKAI: RED DEMON NOZARASHI — HEAVEN SPLITTER',
  subtitle:
    'Rips off his eyepatch to become an unstoppable giant Red Demon · Swings Nozarashi twice, SHATTERING obstacles, erasing shields & cleaving armor!',
  bannerColor: '#eab308',
  castDuration: 0.25,
  duration: 3.7,

  onCast(ctx, owner, state) {
    owner.giantTimer = Math.max(owner.giantTimer, 3.5);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.5);

    const data: KenpachiUltimateData = {
      cleavesLeft: 2,
      cleaveCd: 0.55,
      slashAngle: owner.facingAngle,
      slashFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#eab308', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      210,
      '#dc2626',
      7,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'EYEPATCH OFF · BANKAI NOZARASHI!',
      '#fde047',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 26, '#eab308', 90, 310, 3, 6.5, 'shard');
    ctx.addScreenShake(14);
    ctx.addHitstop(0.06);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as KenpachiUltimateData;
    const enemies = ctx.getEnemies(owner);

    if (data.slashFlash > 0) {
      data.slashFlash = Math.max(0, data.slashFlash - dt);
    }

    if (data.cleavesLeft > 0) {
      data.cleaveCd -= dt;
      if (data.cleaveCd <= 0) {
        data.cleavesLeft--;
        data.cleaveCd = 1.25;
        data.slashFlash = 0.85;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        data.slashAngle = ang;
        owner.facingAngle = ang;
        owner.vx = Math.cos(ang) * 520;
        owner.vy = Math.sin(ang) * 520;

        // Destroy ALL obstacles inside Nozarashi's colossal cleave reach instantly!
        for (let oIdx = ctx.obstacles.length - 1; oIdx >= 0; oIdx--) {
          const obs = ctx.obstacles[oIdx];
          if (Math.hypot(obs.x - owner.x, obs.y - owner.y) <= 240) {
            ctx.spawnParticles(obs.x, obs.y, 12, '#eab308', 60, 220, 3, 6, 'shard');
            ctx.obstacles.splice(oIdx, 1);
          }
        }

        const isFinal = data.cleavesLeft === 0;
        ctx.addHitstop(0.075);
        ctx.addScreenShake(isFinal ? 22 : 15);
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          235,
          '#eab308',
          7.5,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 20,
          isFinal ? 'NOZARASHI · SPLIT HEAVEN!!' : 'NOZARASHI CLEAVE!',
          '#fef08a',
          'crit',
        );
        ctx.emitSfx({ type: 'slash', intensity: 1.4 });

        for (const e of enemies) {
          const dx = e.x - owner.x;
          const dy = e.y - owner.y;
          const dist = Math.hypot(dx, dy);
          if (dist <= 220 + e.radius) {
            e.shieldTimer = 0;
            e.enchantArmorTimer = 0;
            e.armorShredTimer = Math.max(e.armorShredTimer, 2.8);
            const d = Math.max(1, dist);
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, isFinal ? 16.5 : 10.5),
              (dx / d) * 520,
              (dy / d) * 520,
              { isCrit: true, sourceKind: 'ability' },
            );
            ctx.spawnParticles(e.x, e.y, 20, '#ef4444', 90, 320, 3, 6.5, 'shard');
          }
        }
      }
    }
  },

  onExpire(_ctx, owner) {
    if (owner) {
      owner.giantTimer = 0;
    }
  },
};
