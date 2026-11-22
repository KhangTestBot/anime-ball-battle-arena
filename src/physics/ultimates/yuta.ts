import { applyFighterStun } from '../domains';
import type { UltimateHandler } from './types';

export interface YutaUltimateData {
  stage: 'cursed-speech' | 'sky-breaker' | 'pure-love' | 'aftermath';
  rikaX: number;
  rikaY: number;
  beamTimer: number;
  beamX1: number;
  beamY1: number;
  beamX2: number;
  beamY2: number;
  beamAngle: number;
}

export const yutaUltimateHandler: UltimateHandler = {
  characterId: 'yuta',
  title: 'RIKA MANIFESTATION & PURE LOVE BEAM',
  subtitle:
    'Queen of Curses Rika guards Yuta · Cursed Speech "DON’T MOVE!" freezes foes → Thin Ice Breaker pierces armor → Pure Love Beam!',
  bannerColor: '#e879f9',
  castDuration: 0.25,
  duration: 4.4,

  onCast(ctx, owner, state) {
    // Stage 1: Cursed Speech Megaphone Seal -> "DON'T MOVE!" paralyzes nearby enemies!
    for (const e of ctx.getEnemies(owner)) {
      if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 290) {
        applyFighterStun(ctx, owner, e, 0.9, 'time-stop', "DON'T MOVE!");
      }
    }

    const data: YutaUltimateData = {
      stage: 'cursed-speech',
      rikaX: owner.x - Math.cos(owner.facingAngle) * 38,
      rikaY: owner.y - Math.sin(owner.facingAngle) * 38,
      beamTimer: 0,
      beamX1: owner.x,
      beamY1: owner.y,
      beamX2: owner.x + 600,
      beamY2: owner.y,
      beamAngle: owner.facingAngle,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#e879f9', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      260,
      '#e879f9',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      "RIKA! DON'T MOVE!",
      '#f0abfc',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 20, '#c084fc', 80, 260, 3, 6, 'star');
    ctx.addScreenShake(10);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as YutaUltimateData;
    const enemies = ctx.getEnemies(owner);

    // Full Rika Spirit follows closely behind Yuta & blocks projectiles from behind!
    data.rikaX += (owner.x - Math.cos(owner.facingAngle) * 42 - data.rikaX) * Math.min(1, dt * 8);
    data.rikaY += (owner.y - Math.sin(owner.facingAngle) * 42 - data.rikaY) * Math.min(1, dt * 8);
    for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
      const p = ctx.projectiles[i];
      if (
        p.ownerUid !== owner.uid &&
        Math.hypot(p.x - data.rikaX, p.y - data.rikaY) <= 34 + p.radius
      ) {
        ctx.spawnParticles(p.x, p.y, 7, '#a855f7', 50, 160, 2.5, 5, 'shard');
        ctx.projectiles.splice(i, 1);
      }
    }

    // Stage 2 (1.3s): Sky Manipulation -> Thin Ice Breaker piercing armor/shields!
    if (data.stage === 'cursed-speech' && state.elapsed >= 1.3) {
      data.stage = 'sky-breaker';
      const target = ctx.getNearestEnemy(owner);
      if (target) {
        target.shieldTimer = 0;
        target.armorShredTimer = Math.max(target.armorShredTimer, 3.0);
        ctx.applyDamage(owner, target, ctx.getEffectiveDamage(owner, 9.5), 0, 0, {
          bypassInvuln: true,
          sourceKind: 'ability',
        });
        ctx.spawnShockwave(
          target.x,
          target.y,
          110,
          '#38bdf8',
          5,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(
          target.x,
          target.y - target.radius - 16,
          'THIN ICE BREAKER!',
          '#7dd3fc',
          'crit',
        );
        ctx.emitSfx({ type: 'crit', intensity: 1.15 });
      }
    } else if (data.stage === 'sky-breaker' && state.elapsed >= 2.25) {
      // Stage 3 (2.25s): DUAL PURE LOVE BEAM (Yuta + Rika unison release)!
      data.stage = 'pure-love';
      data.beamTimer = 0.95;
      const target = ctx.getNearestEnemy(owner);
      const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
      data.beamAngle = ang;
      data.beamX1 = owner.x;
      data.beamY1 = owner.y;
      data.beamX2 = owner.x + Math.cos(ang) * 720;
      data.beamY2 = owner.y + Math.sin(ang) * 720;

      ctx.addHitstop(0.07);
      ctx.addScreenShake(17);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 20,
        'PURE LOVE BEAM!!',
        '#f0abfc',
        'powerup',
      );
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.35 });

      const dxL = Math.cos(ang);
      const dyL = Math.sin(ang);
      for (const e of enemies) {
        const rx = e.x - data.beamX1;
        const ry = e.y - data.beamY1;
        const along = rx * dxL + ry * dyL;
        const perp = Math.abs(-rx * dyL + ry * dxL);
        if (along >= -e.radius && perp <= e.radius + 48) {
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 16.5), dxL * 540, dyL * 540, {
            isCrit: true,
            sourceKind: 'ability',
          });
          ctx.spawnParticles(e.x, e.y, 18, '#e879f9', 90, 310, 3, 6, 'star');
        }
      }
    } else if (data.stage === 'pure-love') {
      if (data.beamTimer > 0) data.beamTimer = Math.max(0, data.beamTimer - dt);
      else data.stage = 'aftermath';
    }
  },
};
