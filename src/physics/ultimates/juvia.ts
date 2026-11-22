import type { UltimateHandler } from './types';

export interface JuviaUltimateData {
  nebulaFired: boolean;
  swirlAngle: number;
  flash: number;
}

export const juviaUltimateHandler: UltimateHandler = {
  characterId: 'juvia',
  title: 'WATER BODY FLOOD · WATER NEBULA',
  subtitle:
    'Dissolves into untargetable Water Body, floods the arena slowing all foes, then erupts twin spiral Water Nebula geysers!',
  bannerColor: '#0ea5e9',
  castDuration: 0.24,
  duration: 3.6,

  onCast(ctx, owner, state) {
    owner.evadeTimer = Math.max(owner.evadeTimer, 2.5);
    owner.untargetableTimer = Math.max(owner.untargetableTimer, 0.75);
    for (const e of ctx.getEnemies(owner)) {
      e.frostTimer = Math.max(e.frostTimer, 3.4);
    }

    const data: JuviaUltimateData = {
      nebulaFired: false,
      swirlAngle: 0,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, 0, '#0ea5e9', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'WATER BODY FLOOD!',
      '#38bdf8',
      'powerup',
    );
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as JuviaUltimateData;
    data.swirlAngle += dt * 11;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.nebulaFired && state.elapsed >= 1.45) {
      data.nebulaFired = true;
      data.flash = 1.2;
      for (const e of ctx.getEnemies(owner)) {
        if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 270 + e.radius) {
          e.shieldTimer = 0;
          const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 20.5),
            Math.cos(ang) * 520,
            Math.sin(ang) * 520,
            {
              isCrit: true,
              bypassInvuln: true,
              sourceKind: 'ability',
            },
          );
        }
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        270,
        '#0ea5e9',
        8,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'WATER NEBULA!!',
        '#7dd3fc',
        'crit',
      );
      ctx.addScreenShake(14);
      ctx.addHitstop(0.06);
      ctx.emitSfx({ type: 'crit', intensity: 1.25 });
    }
  },
};
