import type { UltimateHandler } from './types';

export interface JellalUltimateData {
  semaX: number;
  semaY: number;
  progress: number;
  impacted: boolean;
  obsId: string | null;
}

export const jellalUltimateHandler: UltimateHandler = {
  characterId: 'jellal',
  title: 'TRUE HEAVENLY BODY MAGIC: SEMA',
  subtitle:
    'Opens a celestial vortex pulling all enemies toward the impact point, then drops the planetary Sema meteor crushing shields & spawning a crater boulder!',
  bannerColor: '#6366f1',
  castDuration: 0.26,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.4);
    const target = ctx.getNearestEnemy(owner);
    const sx = target
      ? Math.max(ctx.bounds.left + 75, Math.min(ctx.bounds.right - 75, target.x))
      : (ctx.bounds.left + ctx.bounds.right) * 0.5;
    const sy = target
      ? Math.max(ctx.bounds.top + 75, Math.min(ctx.bounds.bottom - 75, target.y))
      : (ctx.bounds.top + ctx.bounds.bottom) * 0.5;

    const data: JellalUltimateData = {
      semaX: sx,
      semaY: sy,
      progress: 0,
      impacted: false,
      obsId: null,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, sx, sy, 0, '#6366f1', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'HEAVENLY BODY: SEMA!',
      '#a5b4fc',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'beam-charge' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as JellalUltimateData;

    if (!data.impacted) {
      // Celestial gravity vortex pulls enemies toward Sema impact zone
      for (const e of ctx.getEnemies(owner)) {
        const dx = data.semaX - e.x;
        const dy = data.semaY - e.y;
        const d = Math.max(1, Math.hypot(dx, dy));
        if (d <= 280) {
          e.vx += (dx / d) * 380 * dt;
          e.vy += (dy / d) * 380 * dt;
        }
      }

      data.progress = Math.min(1, state.elapsed / 1.75);
      if (data.progress >= 1) {
        data.impacted = true;
        const obsId = ctx.nextId('jellal_sema');
        data.obsId = obsId;
        ctx.obstacles.push({
          id: obsId,
          ownerUid: owner.uid,
          ownerCharId: owner.character.id,
          teamId: owner.teamId,
          kind: 'stone-meteor',
          x: data.semaX,
          y: data.semaY,
          w: 70,
          h: 70,
          hp: 4,
          maxHp: 4,
          life: 2.2,
          maxLife: 2.2,
          blocksProjectiles: true,
          restitution: 1.25,
          color: '#312e81',
          secondaryColor: '#facc15',
        });

        for (const e of ctx.getEnemies(owner)) {
          if (Math.hypot(e.x - data.semaX, e.y - data.semaY) <= 255 + e.radius) {
            e.shieldTimer = 0;
            const ang = Math.atan2(e.y - data.semaY, e.x - data.semaX);
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, 23.0),
              Math.cos(ang) * 560,
              Math.sin(ang) * 560,
              {
                isCrit: true,
                bypassInvuln: true,
                sourceKind: 'ability',
              },
            );
          }
        }
        ctx.spawnShockwave(
          data.semaX,
          data.semaY,
          275,
          '#facc15',
          9,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnParticles(data.semaX, data.semaY, 36, '#818cf8', 110, 360, 3.5, 7.5, 'star');
        ctx.spawnFloatingText(data.semaX, data.semaY - 30, 'SEMA IMPACT!!', '#fde047', 'crit');
        ctx.addScreenShake(18);
        ctx.addHitstop(0.075);
        ctx.emitSfx({ type: 'ko', intensity: 1.35 });
      }
    }
  },
};
