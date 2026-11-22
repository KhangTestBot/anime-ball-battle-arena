import type { UltimateHandler } from './types';

export interface GrimmjowUltimateData {
  clawsDone: number;
  clawCd: number;
  desgarronFired: boolean;
  flash: number;
}

export const grimmjowUltimateHandler: UltimateHandler = {
  characterId: 'grimmjow',
  title: 'RESURRECCION: PANTERA — DESGARRON!',
  subtitle:
    'Releases Pantera (+20% DMG & Unstoppable), chains 4 armor-shredding Panther Claw dashes, and rips the arena with Desgarron!',
  bannerColor: '#38bdf8',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 20;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.5);

    const data: GrimmjowUltimateData = {
      clawsDone: 0,
      clawCd: 0.26,
      desgarronFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'GRIND, PANTERA!!',
      '#38bdf8',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'slash', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as GrimmjowUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.desgarronFired && data.clawsDone < 4) {
      data.clawCd -= dt;
      if (data.clawCd <= 0) {
        data.clawCd = 0.34;
        data.clawsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          owner.vx = Math.cos(ang) * 700;
          owner.vy = Math.sin(ang) * 700;
          target.armorShredTimer = Math.max(target.armorShredTimer, 3.6);
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 9.0),
            Math.cos(ang) * 340,
            Math.sin(ang) * 340,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.25 });
        }
      }
    }

    if (!data.desgarronFired && state.elapsed >= 2.0) {
      data.desgarronFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 26.0),
          Math.cos(ang) * 610,
          Math.sin(ang) * 610,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        330,
        '#38bdf8',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(owner.x, owner.y - owner.radius - 26, 'DESGARRON!!', '#38bdf8', 'crit');
      ctx.addScreenShake(19);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'slash', intensity: 1.45 });
    }
  },
};
