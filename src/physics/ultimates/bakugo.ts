import type { UltimateHandler } from './types';

export interface ClusterSpark {
  x: number;
  y: number;
  timer: number;
  detonated: boolean;
}

export interface BakugoUltimateData {
  stage: 'cluster-orbit' | 'howitzer-impact';
  dashesLeft: number;
  dashCd: number;
  sparks: ClusterSpark[];
  impacted: boolean;
  howitzerFlash: number;
}

export const bakugoUltimateHandler: UltimateHandler = {
  characterId: 'bakugo',
  title: 'HOWITZER IMPACT: CLUSTER SUPERNOVA',
  subtitle:
    'Activates Nitroglycerin Cluster (Speed + Unstoppable), spiraling 3 beats to scatter Cluster Beads around the target → Dives into a HOWITZER IMPACT vortex smashing obstacles & shredding armor!',
  bannerColor: '#f97316',
  castDuration: 0.22,
  duration: 3.7,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.7);
    owner.getExcitedTimer = Math.max(owner.getExcitedTimer, 3.2);

    const data: BakugoUltimateData = {
      stage: 'cluster-orbit',
      dashesLeft: 3,
      dashCd: 0.14,
      sparks: [],
      impacted: false,
      howitzerFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#f97316', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      185,
      '#fb923c',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'CLUSTER EXPLOSION!!',
      '#fed7aa',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 24, '#f97316', 90, 300, 3, 6, 'star');
    ctx.addScreenShake(10);
    ctx.addHitstop(0.045);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as BakugoUltimateData;
    const enemies = ctx.getEnemies(owner);
    const { left, right, top, bottom } = ctx.bounds;

    if (data.howitzerFlash > 0) data.howitzerFlash = Math.max(0, data.howitzerFlash - dt);

    // Explode Cluster Sweat Sparks
    for (let i = data.sparks.length - 1; i >= 0; i--) {
      const sp = data.sparks[i];
      sp.timer -= dt;
      if (sp.timer <= 0 && !sp.detonated) {
        sp.detonated = true;
        ctx.spawnShockwave(
          sp.x,
          sp.y,
          95,
          '#f59e0b',
          4.5,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnParticles(sp.x, sp.y, 10, '#f97316', 65, 210, 2.5, 5, 'star');
        for (const e of enemies) {
          if (Math.hypot(e.x - sp.x, e.y - sp.y) <= 85 + e.radius) {
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 4.4), 0, 0, {
              sourceKind: 'ability',
            });
          }
        }
        data.sparks.splice(i, 1);
      }
    }

    if (data.stage === 'cluster-orbit' && data.dashesLeft > 0) {
      data.dashCd -= dt;
      if (data.dashCd <= 0) {
        data.dashCd = 0.45;
        data.dashesLeft--;
        const target = ctx.getNearestEnemy(owner);
        const orbitAng = data.dashesLeft * 2.1;
        const tx = target ? target.x : owner.x;
        const ty = target ? target.y : owner.y;
        owner.afterimages.push({
          x: owner.x,
          y: owner.y,
          alpha: 0.8,
          color: '#f97316',
          formIndex: owner.formIndex,
        });
        owner.x = Math.max(
          left + owner.radius + 8,
          Math.min(right - owner.radius - 8, tx + Math.cos(orbitAng) * 85),
        );
        owner.y = Math.max(
          top + owner.radius + 8,
          Math.min(bottom - owner.radius - 8, ty + Math.sin(orbitAng) * 85),
        );
        data.sparks.push({ x: tx, y: ty, timer: 0.35, detonated: false });
        ctx.emitSfx({ type: 'hit', intensity: 1.05 });
      }
    }

    // Climax (1.75s): HOWITZER IMPACT!! Molten Cyclone Crash breaking obstacles & shields!
    if (!data.impacted && state.elapsed >= 1.75) {
      data.impacted = true;
      data.stage = 'howitzer-impact';
      data.howitzerFlash = 1.15;

      const target = ctx.getNearestEnemy(owner);
      if (target) {
        owner.x = Math.max(left + owner.radius + 8, Math.min(right - owner.radius - 8, target.x));
        owner.y = Math.max(top + owner.radius + 8, Math.min(bottom - owner.radius - 8, target.y));
      }

      for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
        if (Math.hypot(ctx.obstacles[i].x - owner.x, ctx.obstacles[i].y - owner.y) <= 230) {
          ctx.obstacles.splice(i, 1);
        }
      }

      for (const e of enemies) {
        const dx = e.x - owner.x;
        const dy = e.y - owner.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= 220 + e.radius) {
          const d = Math.max(1, dist);
          e.shieldTimer = 0;
          e.armorShredTimer = Math.max(e.armorShredTimer, 2.8);
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 16.0),
            (dx / d) * 560,
            (dy / d) * 560,
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
        240,
        '#f97316',
        9,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 22,
        'HOWITZER IMPACT!!',
        '#fef08a',
        'powerup',
      );
      ctx.addHitstop(0.08);
      ctx.addScreenShake(22);
      ctx.emitSfx({ type: 'ko', intensity: 1.45 });
    }
  },
};
