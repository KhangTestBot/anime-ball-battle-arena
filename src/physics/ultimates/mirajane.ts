import type { UltimateHandler } from './types';

export interface MirajaneUltimateData {
  beamFired: boolean;
  beamAngle: number;
  flash: number;
}

export const mirajaneUltimateHandler: UltimateHandler = {
  characterId: 'mirajane',
  title: 'SATAN SOUL: ALEGRIA · SOUL EXTINCTION',
  subtitle:
    'Unleashes demonic Satan Soul: Alegria inflicting Anti-Heal on all foes, then fires a catastrophic dark-magenta Soul Extinction beam!',
  bannerColor: '#c026d3',
  castDuration: 0.25,
  duration: 3.7,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.5);
    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;

    for (const e of ctx.getEnemies(owner)) {
      e.antiHealTimer = Math.max(e.antiHealTimer, 4.0);
    }

    const data: MirajaneUltimateData = {
      beamFired: false,
      beamAngle: ang,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, ang, '#c026d3', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'SATAN SOUL: ALEGRIA!',
      '#e879f9',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'beam-charge' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as MirajaneUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.beamFired && state.elapsed >= 1.25) {
      data.beamFired = true;
      data.flash = 1.35;
      const target = ctx.getNearestEnemy(owner);
      const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : data.beamAngle;
      data.beamAngle = ang;
      const lx = Math.cos(ang);
      const ly = Math.sin(ang);

      for (const e of ctx.getEnemies(owner)) {
        const px = e.x - owner.x;
        const py = e.y - owner.y;
        if (px * lx + py * ly >= -e.radius - 30 && Math.abs(px * ly - py * lx) <= e.radius + 86) {
          e.shieldTimer = 0;
          e.antiHealTimer = Math.max(e.antiHealTimer, 4.2);
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 22.5), lx * 520, ly * 520, {
            isCrit: true,
            bypassInvuln: true,
            sourceKind: 'ability',
          });
        }
      }
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'SOUL EXTINCTION!!',
        '#f0abfc',
        'crit',
      );
      ctx.addScreenShake(16);
      ctx.addHitstop(0.065);
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.35 });
    }
  },
};
