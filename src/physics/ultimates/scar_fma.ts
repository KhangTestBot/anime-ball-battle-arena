import type { UltimateHandler } from './types';

export interface ScarFmaUltimateData {
  deconsDone: number;
  deconCd: number;
  reconFired: boolean;
  flash: number;
}

export const scarFmaUltimateHandler: UltimateHandler = {
  characterId: 'scar_fma',
  title: 'DECONSTRUCTION & RECONSTRUCTION!',
  subtitle:
    'Shatters shields and armor with Right-Arm Deconstruction, triggers 3 explosive blasts, and impales foes with Reconstruction Spires!',
  bannerColor: '#dc2626',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 20;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.2);
    for (const e of ctx.getEnemies(owner)) {
      e.shieldTimer = 0;
      e.armorShredTimer = Math.max(e.armorShredTimer, 4.5);
    }

    const data: ScarFmaUltimateData = {
      deconsDone: 0,
      deconCd: 0.3,
      reconFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#dc2626', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'ISHVALAN DECONSTRUCTION!',
      '#dc2626',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'beam-fire', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ScarFmaUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.reconFired && data.deconsDone < 3) {
      data.deconCd -= dt;
      if (data.deconCd <= 0) {
        data.deconCd = 0.44;
        data.deconsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          owner.vx = Math.cos(ang) * 630;
          owner.vy = Math.sin(ang) * 630;
          target.shieldTimer = 0;
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 9.4),
            Math.cos(ang) * 350,
            Math.sin(ang) * 350,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.spawnShockwave(
            target.x,
            target.y,
            135,
            '#dc2626',
            7,
            owner.character.id,
            owner.character.series,
          );
          ctx.emitSfx({ type: 'wall', intensity: 1.2 });
        }
      }
    }

    if (!data.reconFired && state.elapsed >= 2.0) {
      data.reconFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 25.5),
          Math.cos(ang) * 610,
          Math.sin(ang) * 610,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        325,
        '#38bdf8',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'RECONSTRUCTION SPIRES!!',
        '#38bdf8',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
