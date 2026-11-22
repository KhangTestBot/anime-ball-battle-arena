import type { UltimateHandler } from './types';

export interface MeruemUltimateData {
  stage: 'photonic-en' | 'rage-blast';
  enRadius: number;
  dashCd: number;
  blastFired: boolean;
  blastFlash: number;
}

export const meruemUltimateHandler: UltimateHandler = {
  characterId: 'meruem',
  title: 'POST-ROSE MERUEM: PHOTONIC EN & RAGE BLAST',
  subtitle:
    'Radiates Photonic En slowing all enemies & locking dodge arena-wide (Dodge Lock) · Blitzed tail whip → Detonates a Nuclear Photon Blast wiping obstacles & shields!',
  bannerColor: '#10b981',
  castDuration: 0.24,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.7);
    owner.getExcitedTimer = Math.max(owner.getExcitedTimer, 3.3);
    for (const e of ctx.getEnemies(owner)) {
      e.dodgeLockedTimer = Math.max(e.dodgeLockedTimer, 2.8);
    }

    const data: MeruemUltimateData = {
      stage: 'photonic-en',
      enRadius: 265,
      dashCd: 0.28,
      blastFired: false,
      blastFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#10b981', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      240,
      '#facc15',
      6.5,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'PHOTONIC EN: THE KING!',
      '#bbf7d0',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 26, '#facc15', 75, 250, 2.5, 5, 'spark');
    ctx.addScreenShake(10);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as MeruemUltimateData;
    const enemies = ctx.getEnemies(owner);
    const { left, right, top, bottom } = ctx.bounds;

    if (data.blastFlash > 0) data.blastFlash = Math.max(0, data.blastFlash - dt);

    if (data.stage === 'photonic-en') {
      // Slow down enemies illuminated inside Meruem's Photonic En!
      for (const e of enemies) {
        if (Math.hypot(e.x - owner.x, e.y - owner.y) <= data.enRadius + e.radius) {
          e.vx *= Math.pow(0.55, dt * 3);
          e.vy *= Math.pow(0.55, dt * 3);
        }
      }

      // Superhuman Chimera King blitz stinger strikes!
      data.dashCd -= dt;
      if (data.dashCd <= 0) {
        data.dashCd = 0.56;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const dx = target.x - owner.x;
          const dy = target.y - owner.y;
          const d = Math.max(1, Math.hypot(dx, dy));
          owner.afterimages.push({
            x: owner.x,
            y: owner.y,
            alpha: 0.85,
            color: '#10b981',
            formIndex: owner.formIndex,
          });
          owner.x = Math.max(
            left + owner.radius + 8,
            Math.min(
              right - owner.radius - 8,
              target.x - (dx / d) * (owner.radius + target.radius + 8),
            ),
          );
          owner.y = Math.max(
            top + owner.radius + 8,
            Math.min(
              bottom - owner.radius - 8,
              target.y - (dy / d) * (owner.radius + target.radius + 8),
            ),
          );
          ctx.applyDamage(owner, target, ctx.getEffectiveDamage(owner, 6.0), 0, 0, {
            isCrit: true,
            sourceKind: 'ability',
          });
          ctx.emitSfx({ type: 'hit', intensity: 1.1 });
        }
      }

      // Climax (1.9s): RAGE BLAST!! Post-Rose Photon Cannon explosion!
      if (!data.blastFired && state.elapsed >= 1.9) {
        data.blastFired = true;
        data.stage = 'rage-blast';
        data.blastFlash = 1.2;

        for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
          if (Math.hypot(ctx.obstacles[i].x - owner.x, ctx.obstacles[i].y - owner.y) <= 230) {
            ctx.obstacles.splice(i, 1);
          }
        }

        ctx.addHitstop(0.08);
        ctx.addScreenShake(22);
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          255,
          '#34d399',
          8.5,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 22,
          'RAGE BLAST!!',
          '#fef08a',
          'powerup',
        );
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.45 });

        for (const e of enemies) {
          const dx = e.x - owner.x;
          const dy = e.y - owner.y;
          const dist = Math.hypot(dx, dy);
          if (dist <= 245 + e.radius) {
            const d = Math.max(1, dist);
            e.shieldTimer = 0;
            e.armorShredTimer = Math.max(e.armorShredTimer, 2.8);
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, 16.0),
              (dx / d) * 520,
              (dy / d) * 520,
              {
                bypassInvuln: true,
                isCrit: true,
                sourceKind: 'ability',
              },
            );
          }
        }
      }
    }
  },
};
