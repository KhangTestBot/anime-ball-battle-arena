import type { UltimateHandler } from './types';

export interface ColossalFootprint {
  id: string;
  x: number;
  y: number;
  radius: number;
  stompPulse: number;
}

export interface ErenUltimateData {
  marchAxis: 'x' | 'y';
  marchDir: 1 | -1;
  marchPos: number;
  footprints: ColossalFootprint[];
  stompTimer: number;
  lightningFlash: number;
}

function rebuildFootprints(
  marchPos: number,
  axis: 'x' | 'y',
  left: number,
  right: number,
  top: number,
  bottom: number,
): ColossalFootprint[] {
  const count = 4;
  const footprints: ColossalFootprint[] = [];
  const start = axis === 'x' ? top : left;
  const span = axis === 'x' ? bottom - top : right - left;
  // Wide safe alleys between each Colossal Titan footprint (~145-160px spacing vs 44px radius!)
  for (let i = 0; i < count; i++) {
    const lane = start + ((i + 0.5) / count) * span;
    footprints.push({
      id: `ft_${i}`,
      x: axis === 'x' ? marchPos : lane,
      y: axis === 'x' ? lane : marchPos,
      radius: 42,
      stompPulse: 1.0,
    });
  }
  return footprints;
}

export const erenUltimateHandler: UltimateHandler = {
  characterId: 'eren',
  title: 'THE RUMBLING: FOUNDING TITAN MARCH',
  subtitle:
    'Golden lightning transforms into a 1.45x Unstoppable giant · 4 Colossal Titan footprints stomp across the arena with narrow safe gaps!',
  bannerColor: '#f59e0b',
  castDuration: 0.28,
  duration: 4.5,

  onCast(ctx, owner, state) {
    const { left, right, top, bottom } = ctx.bounds;
    // Grow Eren 1.45x into Founding Titan form + 2.5s Unstoppable!
    owner.giantTimer = Math.max(owner.giantTimer, 3.6);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.6);

    const target = ctx.getNearestEnemy(owner);
    const marchDir: 1 | -1 = target && target.x < (left + right) / 2 ? -1 : 1;
    const marchPos = marchDir === 1 ? left + 52 : right - 52;
    const footprints = rebuildFootprints(marchPos, 'x', left, right, top, bottom);

    const data: ErenUltimateData = {
      marchAxis: 'x',
      marchDir,
      marchPos,
      footprints,
      stompTimer: 0.65,
      lightningFlash: 0.72,
    };
    state.data = data as unknown as Record<string, unknown>;

    // Golden Titan Transformation Lightning Bolt from sky!
    ctx.lightningBolts.push({
      id: ctx.nextId('eren_bolt'),
      ownerCharId: owner.character.id,
      ownerSeries: owner.character.series,
      points: [
        { x: owner.x, y: top },
        { x: owner.x + 14, y: (top + owner.y) * 0.5 },
        { x: owner.x, y: owner.y },
      ],
      color: '#facc15',
      coreColor: '#ffffff',
      width: 11,
      life: 0.55,
      maxLife: 0.55,
    });

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#f59e0b', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'THE RUMBLING!!',
      '#fbbf24',
      'powerup',
    );
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      175,
      '#f59e0b',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnParticles(owner.x, owner.y, 24, '#facc15', 80, 300, 3, 6.5, 'star');
    ctx.addScreenShake(12);
    ctx.addHitstop(0.055);
    ctx.emitSfx({ type: 'ko', intensity: 1.1 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ErenUltimateData;
    const { left, right, top, bottom } = ctx.bounds;
    const enemies = ctx.getEnemies(owner);

    if (data.lightningFlash > 0) data.lightningFlash = Math.max(0, data.lightningFlash - dt);

    // Advance the Colossal Titan formation steadily across the arena!
    data.marchPos += data.marchDir * 135 * dt;
    if (data.marchPos > right - 36) data.marchPos = right - 36;
    if (data.marchPos < left + 36) data.marchPos = left + 36;

    const updated = rebuildFootprints(data.marchPos, data.marchAxis, left, right, top, bottom);
    for (let i = 0; i < data.footprints.length; i++) {
      data.footprints[i].x = updated[i].x;
      data.footprints[i].y = updated[i].y;
      data.footprints[i].stompPulse = Math.max(0, data.footprints[i].stompPulse - dt * 1.4);
    }

    // Periodic Colossal Titan Stomp every 0.72s!
    data.stompTimer -= dt;
    if (data.stompTimer <= 0) {
      data.stompTimer = 0.72;
      ctx.addScreenShake(9);
      ctx.emitSfx({ type: 'wall', intensity: 1.15 });

      for (const fp of data.footprints) {
        fp.stompPulse = 1.0;
        ctx.spawnShockwave(
          fp.x,
          fp.y,
          fp.radius * 2.0,
          '#f97316',
          4.5,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnParticles(fp.x, fp.y, 10, '#f8fafc', 50, 170, 3, 6, 'circle');

        for (const e of enemies) {
          const dx = e.x - fp.x;
          const dy = e.y - fp.y;
          const d = Math.hypot(dx, dy);
          if (d <= fp.radius + e.radius + 14) {
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, 6.2),
              data.marchDir * 310,
              (dy / Math.max(1, d)) * 180,
              { isCrit: true, sourceKind: 'ability' },
            );
            e.burnTimer = Math.max(e.burnTimer, 2.2);
            e.burnDps = Math.max(e.burnDps, ctx.getEffectiveDamage(owner, 1.8));
            e.burnOwnerUid = owner.uid;
            ctx.spawnFloatingText(
              e.x,
              e.y - e.radius - 14,
              'RUMBLING STOMP!',
              '#f97316',
              'callout',
            );
          }
        }
      }
    }
  },

  onExpire(_ctx, owner) {
    if (owner) owner.giantTimer = 0;
  },
};
