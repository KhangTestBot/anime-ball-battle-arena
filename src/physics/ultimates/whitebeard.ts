import type { UltimateHandler } from './types';

export interface AirCrackLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  branchX: number;
  branchY: number;
}

export interface WhitebeardUltimateData {
  cracks: AirCrackLine[];
  quakeCount: number;
  quakeCd: number;
  tiltAngle: number;
  shakeFlash: number;
}

export const whitebeardUltimateHandler: UltimateHandler = {
  characterId: 'whitebeard',
  title: 'GURA GURA NO MI: GREAT SEAQUAKE',
  subtitle:
    'Punches the air cracking it like glass to shatter all protective shields → Unleashes 3 Quake Shockwaves tilting the arena & flinging away enemy projectiles!',
  bannerColor: '#0ea5e9',
  castDuration: 0.25,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.2);
    const { left, right, top, bottom } = ctx.bounds;
    const cx = (left + right) / 2;
    const cy = (top + bottom) / 2;

    // Shatter enemy shields & crack obstacles across the arena on impact!
    for (const e of ctx.getEnemies(owner)) {
      e.shieldTimer = 0;
    }
    for (const obs of ctx.obstacles) {
      obs.hp = Math.max(0, obs.hp - 45);
    }

    const cracks: AirCrackLine[] = [];
    for (let i = 0; i < 7; i++) {
      const a = (i * Math.PI * 2) / 7 + 0.2;
      const len = 135 + (i % 3) * 45;
      const x1 = Math.max(left + 12, Math.min(right - 12, owner.x + Math.cos(a) * 14));
      const y1 = Math.max(top + 12, Math.min(bottom - 12, owner.y + Math.sin(a) * 14));
      const x2 = Math.max(left + 12, Math.min(right - 12, cx + Math.cos(a) * len));
      const y2 = Math.max(top + 12, Math.min(bottom - 12, cy + Math.sin(a) * len));
      cracks.push({
        x1,
        y1,
        x2,
        y2,
        branchX: (x1 + x2) * 0.5 + Math.cos(a + 1.1) * 42,
        branchY: (y1 + y2) * 0.5 + Math.sin(a + 1.1) * 42,
      });
    }

    const data: WhitebeardUltimateData = {
      cracks,
      quakeCount: 3,
      quakeCd: 0.1,
      tiltAngle: 1,
      shakeFlash: 1.0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      260,
      '#e0f2fe',
      7,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'GURA GURA!! AIR CRACK!',
      '#bae6fd',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 26, '#e0f2fe', 90, 320, 3, 6.5, 'shard');
    ctx.addScreenShake(16);
    ctx.addHitstop(0.06);
    ctx.emitSfx({ type: 'wall', intensity: 1.35 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as WhitebeardUltimateData;
    const enemies = ctx.getEnemies(owner);

    if (data.shakeFlash > 0) {
      data.shakeFlash = Math.max(0, data.shakeFlash - dt);
    }

    // 3 Arena-tilting Seaquakes knocking fighters & scrambling projectile trajectories!
    if (data.quakeCount > 0) {
      data.quakeCd -= dt;
      if (data.quakeCd <= 0) {
        data.quakeCount--;
        data.quakeCd = 1.05;
        data.tiltAngle = data.quakeCount % 2 === 0 ? 1 : -1;
        data.shakeFlash = 1.0;

        ctx.addHitstop(0.055);
        ctx.addScreenShake(19);
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          290,
          '#7dd3fc',
          7.5,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 18,
          data.quakeCount === 0 ? 'SEAQUAKE · KABUTOWARI!!' : 'TREMOR SHOCKWAVE!!',
          '#e0f2fe',
          'crit',
        );
        ctx.emitSfx({ type: 'ko', intensity: 1.25 });

        // Scramble all enemy projectiles off-course via seaquake shock
        for (const p of ctx.projectiles) {
          if (p.ownerUid !== owner.uid) {
            p.vy += data.tiltAngle * 240;
            p.vx *= 0.72;
          }
        }

        const baseDmg = data.quakeCount === 0 ? 12.0 : 6.8;
        for (const e of enemies) {
          e.shieldTimer = 0;
          const dx = e.x - owner.x;
          const dy = e.y - owner.y;
          const d = Math.max(1, Math.hypot(dx, dy));
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, baseDmg),
            (dx / d) * 340 + data.tiltAngle * 240,
            (dy / d) * 340 - 160,
            { isCrit: data.quakeCount === 0, sourceKind: 'ability' },
          );
          ctx.spawnParticles(e.x, e.y, 12, '#bae6fd', 70, 260, 2.5, 5.5, 'shard');
        }
      }
    }
  },
};
