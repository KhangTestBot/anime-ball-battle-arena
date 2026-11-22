import type { UltimateHandler } from './types';

export interface SaberUltimateData {
  stage: 'avalon' | 'excalibur' | 'aftermath';
  nullifiedCount: number;
  windAngle: number;
  beamAngle: number;
  beamX1: number;
  beamY1: number;
  beamX2: number;
  beamY2: number;
  beamTimer: number;
  tickAccum: number;
}

export const saberUltimateHandler: UltimateHandler = {
  characterId: 'saber',
  title: 'AVALON → EXCALIBUR: SWORD OF PROMISED VICTORY',
  subtitle:
    'Avalon scabbard grants invulnerability while erasing enemy projectiles (charging power) → Releases Invisible Air & the golden EXCALIBUR beam pulling & sweeping across the arena!',
  bannerColor: '#eab308',
  castDuration: 0.25,
  duration: 3.7,

  onCast(ctx, owner, state) {
    owner.invulnTimer = Math.max(owner.invulnTimer, 1.15);

    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;

    const data: SaberUltimateData = {
      stage: 'avalon',
      nullifiedCount: 0,
      windAngle: 0,
      beamAngle: ang,
      beamX1: owner.x,
      beamY1: owner.y,
      beamX2: owner.x + Math.cos(ang) * 760,
      beamY2: owner.y + Math.sin(ang) * 760,
      beamTimer: 0,
      tickAccum: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, ang, '#eab308', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      175,
      '#facc15',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'AVALON SANCTUARY!',
      '#fef08a',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 20, '#fde047', 65, 220, 3, 6, 'star');
    ctx.addScreenShake(9);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as SaberUltimateData;
    const enemies = ctx.getEnemies(owner);
    data.windAngle += dt * 11;

    if (data.stage === 'avalon') {
      // Phase 1 (0 -> 1.15s): Avalon Sanctuary nullifies incoming enemy projectiles & Invisible Air pulls enemies slightly!
      for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
        const p = ctx.projectiles[i];
        if (
          p.ownerUid !== owner.uid &&
          Math.hypot(p.x - owner.x, p.y - owner.y) <= owner.radius + 58 + p.radius
        ) {
          data.nullifiedCount++;
          ctx.spawnParticles(p.x, p.y, 7, '#fde047', 50, 150, 2, 4.5, 'star');
          ctx.spawnFloatingText(
            owner.x,
            owner.y - owner.radius - 14,
            'AVALON NULLIFY!',
            '#fef08a',
            'callout',
          );
          ctx.projectiles.splice(i, 1);
        }
      }

      for (const e of enemies) {
        const dx = owner.x - e.x;
        const dy = owner.y - e.y;
        const dist = Math.hypot(dx, dy);
        if (dist > owner.radius + e.radius + 10 && dist <= 260) {
          e.vx += (dx / dist) * 140 * dt;
          e.vy += (dy / dist) * 140 * dt;
        }
      }

      if (state.elapsed >= 1.15) {
        // Phase 2: EXCALIBUR!!
        data.stage = 'excalibur';
        data.beamTimer = 1.45;
        data.tickAccum = 0;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        owner.facingAngle = ang;
        data.beamAngle = ang;
        data.beamX1 = owner.x;
        data.beamY1 = owner.y;
        data.beamX2 = owner.x + Math.cos(ang) * 780;
        data.beamY2 = owner.y + Math.sin(ang) * 780;

        ctx.addHitstop(0.075);
        ctx.addScreenShake(20);
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          260,
          '#facc15',
          7,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 22,
          'EX... CALIBURRR!!',
          '#fef08a',
          'powerup',
        );
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.4 });

        const bonusMult = 1 + Math.min(0.25, data.nullifiedCount * 0.06);
        const dxL = Math.cos(ang);
        const dyL = Math.sin(ang);
        for (const e of enemies) {
          const rx = e.x - data.beamX1;
          const ry = e.y - data.beamY1;
          const along = rx * dxL + ry * dyL;
          const perp = Math.abs(-rx * dyL + ry * dxL);
          if (along >= -e.radius && perp <= e.radius + 58) {
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, 13.5 * bonusMult),
              dxL * 560,
              dyL * 560,
              {
                isCrit: true,
                sourceKind: 'ability',
              },
            );
            ctx.spawnParticles(e.x, e.y, 18, '#fde047', 90, 320, 3, 6.5, 'star');
          }
        }
      }
      return;
    }

    if (data.stage === 'excalibur') {
      data.beamX1 = owner.x;
      data.beamY1 = owner.y;
      data.beamX2 = owner.x + Math.cos(data.beamAngle) * 780;
      data.beamY2 = owner.y + Math.sin(data.beamAngle) * 780;
      data.beamTimer = Math.max(0, data.beamTimer - dt);

      const dxL = Math.cos(data.beamAngle);
      const dyL = Math.sin(data.beamAngle);
      // Vaporize enemy projectiles caught inside Excalibur light wave
      for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
        const p = ctx.projectiles[i];
        if (p.ownerUid === owner.uid) continue;
        const rx = p.x - data.beamX1;
        const ry = p.y - data.beamY1;
        const along = rx * dxL + ry * dyL;
        const perp = Math.abs(-rx * dyL + ry * dxL);
        if (along >= 0 && perp <= 62 + p.radius) {
          ctx.spawnParticles(p.x, p.y, 5, '#fef08a', 40, 130, 2, 4, 'star');
          ctx.projectiles.splice(i, 1);
        }
      }

      data.tickAccum += dt;
      if (data.tickAccum >= 0.42) {
        data.tickAccum -= 0.42;
        for (const e of enemies) {
          const rx = e.x - data.beamX1;
          const ry = e.y - data.beamY1;
          const along = rx * dxL + ry * dyL;
          const perp = Math.abs(-rx * dyL + ry * dxL);
          if (along >= -e.radius && perp <= e.radius + 56) {
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 3.6), dxL * 220, dyL * 220, {
              sourceKind: 'ability',
            });
          }
        }
      }

      if (data.beamTimer <= 0) {
        data.stage = 'aftermath';
      }
    }
  },
};
