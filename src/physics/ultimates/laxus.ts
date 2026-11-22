import type { UltimateHandler } from './types';

export interface LaxusUltimateData {
  fairyLawFired: boolean;
  roarFired: boolean;
  roarAngle: number;
  flash: number;
}

export const laxusUltimateHandler: UltimateHandler = {
  characterId: 'laxus',
  title: "FAIRY LAW · RED LIGHTNING DRAGON'S ROAR",
  subtitle:
    'Judges all enemies with golden Fairy Law paralyzing the arena, then blasts a crimson Red Lightning Dragon Roar shattering shields!',
  bannerColor: '#facc15',
  castDuration: 0.25,
  duration: 3.8,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.8);
    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;

    const data: LaxusUltimateData = {
      fairyLawFired: false,
      roarFired: false,
      roarAngle: ang,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, ang, '#facc15', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'FAIRY LAW!!',
      '#fef08a',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'beam-charge' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as LaxusUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    // 1. Fairy Law (0.85s): Arena-wide golden judgment paralyzing enemies!
    if (!data.fairyLawFired && state.elapsed >= 0.85) {
      data.fairyLawFired = true;
      for (const e of ctx.getEnemies(owner)) {
        e.paralyzeTimer = Math.max(e.paralyzeTimer, 3.0);
        ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 11.5), 0, 0, {
          sourceKind: 'ability',
        });
        ctx.spawnShockwave(e.x, e.y, 145, '#facc15', 5, owner.character.id, owner.character.series);
      }
      ctx.addScreenShake(12);
      ctx.emitSfx({ type: 'crit', intensity: 1.2 });
    }

    // 2. Climax (1.95s): RED LIGHTNING DRAGON'S ROAR!
    if (!data.roarFired && state.elapsed >= 1.95) {
      data.roarFired = true;
      data.flash = 1.3;
      const target = ctx.getNearestEnemy(owner);
      const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : data.roarAngle;
      data.roarAngle = ang;
      const lx = Math.cos(ang);
      const ly = Math.sin(ang);

      for (const e of ctx.getEnemies(owner)) {
        const px = e.x - owner.x;
        const py = e.y - owner.y;
        if (px * lx + py * ly >= -e.radius - 30 && Math.abs(px * ly - py * lx) <= e.radius + 84) {
          e.shieldTimer = 0;
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 22.0), lx * 530, ly * 530, {
            isCrit: true,
            bypassInvuln: true,
            sourceKind: 'ability',
          });
        }
      }
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'RED LIGHTNING ROAR!',
        '#ef4444',
        'crit',
      );
      ctx.addScreenShake(16);
      ctx.addHitstop(0.065);
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.35 });
    }
  },
};
