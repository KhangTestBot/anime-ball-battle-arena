import type { UltimateHandler } from './types';

export interface BangUltimateData {
  strikesDone: number;
  strikeCd: number;
  deflectedCount: number;
  finisherFired: boolean;
  flash: number;
}

export const bangUltimateHandler: UltimateHandler = {
  characterId: 'bang',
  title: 'WATER STREAM ROCK SMASHING FIST!',
  subtitle:
    'Awakening Breath stance deflects enemy projectiles, chains 4 flowing martial counter-strikes with armor shred, and finishes with Flowing Dragon!',
  bannerColor: '#38bdf8',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 3.2);
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.0);
    owner.shieldColor = '#38bdf8';

    const data: BangUltimateData = {
      strikesDone: 0,
      strikeCd: 0.3,
      deflectedCount: 0,
      finisherFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'AWAKENING BREATH!',
      '#38bdf8',
      'powerup',
    );
    ctx.addScreenShake(9);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as BangUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    // Deflect nearby enemy projectiles with Water Stream technique
    for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
      const p = ctx.projectiles[i];
      if (p.ownerUid === owner.uid || (owner.teamId && p.teamId === owner.teamId)) continue;
      if (Math.hypot(p.x - owner.x, p.y - owner.y) <= owner.radius + 75) {
        p.ownerUid = owner.uid;
        p.teamId = owner.teamId;
        p.vx = -p.vx * 1.15;
        p.vy = -p.vy * 1.15;
        data.deflectedCount += 1;
      }
    }

    if (!data.finisherFired && data.strikesDone < 4) {
      data.strikeCd -= dt;
      if (data.strikeCd <= 0) {
        data.strikeCd = 0.36;
        data.strikesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          owner.vx = Math.cos(ang) * 560;
          owner.vy = Math.sin(ang) * 560;
          target.armorShredTimer = Math.max(target.armorShredTimer, 3.0);
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 8.2),
            Math.cos(ang) * 280,
            Math.sin(ang) * 280,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.spawnShockwave(
            target.x,
            target.y,
            110,
            '#38bdf8',
            5,
            owner.character.id,
            owner.character.series,
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.1 });
        }
      }
    }

    if (!data.finisherFired && state.elapsed >= 2.0) {
      data.finisherFired = true;
      data.flash = 1.25;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 21.5),
          Math.cos(ang) * 520,
          Math.sin(ang) * 520,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        280,
        '#38bdf8',
        9,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'FLOWING WATER DRAGON!',
        '#e2e8f0',
        'crit',
      );
      ctx.addScreenShake(15);
      ctx.addHitstop(0.06);
      ctx.emitSfx({ type: 'ko', intensity: 1.25 });
    }
  },
};
