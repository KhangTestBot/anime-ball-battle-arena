import type { UltimateHandler } from './types';

export interface MagmaCrater {
  x: number;
  y: number;
  radius: number;
}

export interface AkainuUltimateData {
  craters: MagmaCrater[];
  meteorsLeft: number;
  meteorCd: number;
  burnTickCd: number;
  eruptionFlash: number;
}

export const akainuUltimateHandler: UltimateHandler = {
  characterId: 'akainu',
  title: 'RYUSEI KAZAN (METEOR VOLCANO) & GREAT ERUPTION',
  subtitle:
    'Creates 4 Magu-Magu Magma Craters scorching the floor (12 DPS Burn) & breaking shields → Rains down 6 Ryusei Kazan volcanic meteor fists shattering obstacles!',
  bannerColor: '#dc2626',
  castDuration: 0.24,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.5);
    const { left, right, top, bottom } = ctx.bounds;

    const craters: MagmaCrater[] = [];
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI * 2) / 4;
      craters.push({
        x: Math.max(left + 48, Math.min(right - 48, owner.x + Math.cos(a) * 115)),
        y: Math.max(top + 48, Math.min(bottom - 48, owner.y + Math.sin(a) * 115)),
        radius: 56,
      });
    }

    const data: AkainuUltimateData = {
      craters,
      meteorsLeft: 6,
      meteorCd: 0.2,
      burnTickCd: 0.35,
      eruptionFlash: 0.5,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#dc2626', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      195,
      '#f97316',
      6.5,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'RYUSEI KAZAN!!',
      '#fed7aa',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as AkainuUltimateData;
    const enemies = ctx.getEnemies(owner);
    const { left, right, top, bottom } = ctx.bounds;

    if (data.eruptionFlash > 0) data.eruptionFlash = Math.max(0, data.eruptionFlash - dt);

    // 1. Molten Magma Craters ignite & melt enemy shields
    data.burnTickCd -= dt;
    if (data.burnTickCd <= 0) {
      data.burnTickCd = 0.45;
      for (const e of enemies) {
        if (data.craters.some((c) => Math.hypot(e.x - c.x, e.y - c.y) <= c.radius + e.radius)) {
          e.burnTimer = Math.max(e.burnTimer, 3.2);
          e.burnDps = Math.max(e.burnDps, 12);
          e.burnOwnerUid = owner.uid;
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 3.8), 0, 0, {
            sourceKind: 'ability',
          });
        }
      }
    }

    // 2. Rain 6 Magma Fist Meteors crushing shields & obstacles!
    if (data.meteorsLeft > 0) {
      data.meteorCd -= dt;
      if (data.meteorCd <= 0) {
        data.meteorCd = 0.38;
        data.meteorsLeft--;

        const target = ctx.getNearestEnemy(owner);
        const mx = Math.max(left + 32, Math.min(right - 32, target ? target.x : owner.x));
        const my = Math.max(top + 32, Math.min(bottom - 32, target ? target.y : owner.y));
        const isLast = data.meteorsLeft === 0;
        if (isLast) data.eruptionFlash = 1.0;

        for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
          if (Math.hypot(ctx.obstacles[i].x - mx, ctx.obstacles[i].y - my) <= 155) {
            ctx.obstacles.splice(i, 1);
          }
        }

        ctx.spawnShockwave(mx, my, 125, '#dc2626', 6, owner.character.id, owner.character.series);
        ctx.spawnParticles(mx, my, 16, '#f97316', 80, 260, 3, 6, 'star');
        for (const e of enemies) {
          if (Math.hypot(e.x - mx, e.y - my) <= 110 + e.radius) {
            if (isLast) e.shieldTimer = 0;
            e.burnTimer = Math.max(e.burnTimer, 3.5);
            e.burnDps = Math.max(e.burnDps, 12);
            e.burnOwnerUid = owner.uid;
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, isLast ? 10.5 : 4.8), 0, 0, {
              isCrit: isLast,
              sourceKind: 'ability',
            });
          }
        }
        ctx.emitSfx({ type: 'hit', intensity: 1.2 });
      }
    }
  },
};
