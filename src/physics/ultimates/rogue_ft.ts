import type { UltimateHandler } from './types';

export interface RogueFtUltimateData {
  ambushesDone: number;
  ambushCd: number;
  roarFired: boolean;
  roarAngle: number;
  flash: number;
}

export const rogueFtUltimateHandler: UltimateHandler = {
  characterId: 'rogue_ft',
  title: "SHADOW DRIVE AMBUSH · SHADOW DRAGON'S ROAR",
  subtitle:
    'Melts into untargetable shadows executing 3 ambush strikes from behind, then unleashes a pitch-black Shadow Dragon Roar!',
  bannerColor: '#4c1d95',
  castDuration: 0.22,
  duration: 3.7,

  onCast(ctx, owner, state) {
    owner.untargetableTimer = Math.max(owner.untargetableTimer, 0.65);
    owner.evadeTimer = Math.max(owner.evadeTimer, 2.0);
    const data: RogueFtUltimateData = {
      ambushesDone: 0,
      ambushCd: 0.28,
      roarFired: false,
      roarAngle: owner.facingAngle,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#4c1d95', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'SHADOW DRIVE!',
      '#a855f7',
      'powerup',
    );
    ctx.emitSfx({ type: 'dodge', intensity: 1.15 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as RogueFtUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.roarFired && data.ambushesDone < 3) {
      data.ambushCd -= dt;
      if (data.ambushCd <= 0) {
        data.ambushCd = 0.42;
        data.ambushesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          owner.x = Math.max(
            ctx.bounds.left + owner.radius,
            Math.min(ctx.bounds.right - owner.radius, target.x - Math.cos(target.facingAngle) * 58),
          );
          owner.y = Math.max(
            ctx.bounds.top + owner.radius,
            Math.min(
              ctx.bounds.bottom - owner.radius,
              target.y - Math.sin(target.facingAngle) * 58,
            ),
          );
          target.armorShredTimer = Math.max(target.armorShredTimer, 2.8);
          ctx.applyDamage(owner, target, ctx.getEffectiveDamage(owner, 7.2), 0, 0, {
            sourceKind: 'ability',
          });
          ctx.spawnParticles(target.x, target.y, 12, '#6d28d9', 50, 180, 2.5, 5.5, 'shard');
          ctx.emitSfx({ type: 'slash', intensity: 1.1 });
        }
      }
    }

    if (!data.roarFired && state.elapsed >= 1.95) {
      data.roarFired = true;
      data.flash = 1.3;
      const target = ctx.getNearestEnemy(owner);
      const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
      data.roarAngle = ang;
      const lx = Math.cos(ang);
      const ly = Math.sin(ang);

      for (const e of ctx.getEnemies(owner)) {
        const px = e.x - owner.x;
        const py = e.y - owner.y;
        if (px * lx + py * ly >= -e.radius - 30 && Math.abs(px * ly - py * lx) <= e.radius + 82) {
          e.shieldTimer = 0;
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 20.5), lx * 500, ly * 500, {
            isCrit: true,
            bypassInvuln: true,
            sourceKind: 'ability',
          });
        }
      }
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        "SHADOW DRAGON'S ROAR!",
        '#c084fc',
        'crit',
      );
      ctx.addScreenShake(15);
      ctx.addHitstop(0.06);
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.3 });
    }
  },
};
