import type { UltimateHandler } from './types';

export interface GiyuUltimateData {
  stage: 'dead-calm' | 'constant-flux';
  calmRadius: number;
  nullifiedCount: number;
  counterCd: number;
  fluxFired: boolean;
  calmFlash: number;
}

export const giyuUltimateHandler: UltimateHandler = {
  characterId: 'giyu',
  title: 'WATER BREATHING 11TH FORM: DEAD CALM',
  subtitle:
    'Dead Calm mirror surface (2.1s · Perfect Dodge + Destroys ALL projectiles within 210px) · Instant auto-counter slashes intruders → Constant Flux water dragon shatters shields!',
  bannerColor: '#0284c7',
  castDuration: 0.24,
  duration: 3.8,

  onCast(ctx, owner, state) {
    owner.evadeTimer = Math.max(owner.evadeTimer, 2.1);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.3);

    const data: GiyuUltimateData = {
      stage: 'dead-calm',
      calmRadius: 210,
      nullifiedCount: 0,
      counterCd: 0.2,
      fluxFired: false,
      calmFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#0284c7', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      210,
      '#38bdf8',
      6.5,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      '11TH FORM: DEAD CALM!',
      '#bae6fd',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 20, '#38bdf8', 50, 170, 2.5, 5, 'circle');
    ctx.addScreenShake(7);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'dodge' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as GiyuUltimateData;
    const enemies = ctx.getEnemies(owner);

    if (data.calmFlash > 0) data.calmFlash = Math.max(0, data.calmFlash - dt);

    // 1. Dead Calm: Zero-ripple mirror surface dissolves EVERY hostile projectile entering calmRadius!
    if (data.stage === 'dead-calm') {
      for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
        const p = ctx.projectiles[i];
        if (
          p.ownerUid !== owner.uid &&
          Math.hypot(p.x - owner.x, p.y - owner.y) <= data.calmRadius + p.radius
        ) {
          data.nullifiedCount++;
          ctx.spawnParticles(p.x, p.y, 6, '#7dd3fc', 35, 110, 2.5, 4.5, 'circle');
          ctx.spawnFloatingText(p.x, p.y - 10, 'CALM NULL!', '#7dd3fc', 'callout');
          ctx.projectiles.splice(i, 1);
        }
      }

      // Instant silent counter-slashes on anyone stepping inside Dead Calm!
      data.counterCd -= dt;
      if (data.counterCd <= 0) {
        data.counterCd = 0.42;
        for (const e of enemies) {
          if (Math.hypot(e.x - owner.x, e.y - owner.y) <= data.calmRadius + e.radius) {
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 4.8), 0, 0, {
              isCrit: true,
              sourceKind: 'ability',
            });
            ctx.emitSfx({ type: 'slash', intensity: 1.05 });
          }
        }
      }

      // Climax (2.05s): 10TH FORM CONSTANT FLUX WATER DRAGON SURGE!!
      if (!data.fluxFired && state.elapsed >= 2.05) {
        data.fluxFired = true;
        data.stage = 'constant-flux';
        data.calmFlash = 1.1;

        for (const e of enemies) {
          const dx = e.x - owner.x;
          const dy = e.y - owner.y;
          const dist = Math.hypot(dx, dy);
          if (dist <= 245 + e.radius) {
            const d = Math.max(1, dist);
            e.shieldTimer = 0;
            e.armorShredTimer = Math.max(e.armorShredTimer, 2.5);
            const dmg = 13.0 + Math.min(6.0, data.nullifiedCount * 1.1);
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, dmg),
              (dx / d) * 510,
              (dy / d) * 510,
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
          250,
          '#0ea5e9',
          8.5,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 22,
          'CONSTANT FLUX: WATER DRAGON!',
          '#e0f2fe',
          'powerup',
        );
        ctx.addHitstop(0.075);
        ctx.addScreenShake(18);
        ctx.emitSfx({ type: 'slash', intensity: 1.4 });
      }
    }
  },
};
