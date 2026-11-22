import type { UltimateHandler } from './types';

export interface KishibeUltimateData {
  countersDone: number;
  counterCd: number;
  execFired: boolean;
  flash: number;
}

export const kishibeUltimateHandler: UltimateHandler = {
  characterId: 'kishibe',
  title: 'DEVIL HUNTER CAPTAIN: CLAW, KNIFE & NEEDLE!',
  subtitle:
    'Veteran CQC mastery (+18% DMG, Auto-Dodge & Unstoppable), chains 4 armor-shredding Knife Counters, and finishes with Captain Execution!',
  bannerColor: '#64748b',
  castDuration: 0.2,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 18;
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 3.0);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.2);

    const data: KishibeUltimateData = {
      countersDone: 0,
      counterCd: 0.28,
      execFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#dc2626', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'CLAW, KNIFE & NEEDLE!',
      '#dc2626',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'slash', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as KishibeUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.execFired && data.countersDone < 4) {
      data.counterCd -= dt;
      if (data.counterCd <= 0) {
        data.counterCd = 0.36;
        data.countersDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          owner.vx = Math.cos(ang) * 630;
          owner.vy = Math.sin(ang) * 630;
          target.armorShredTimer = Math.max(target.armorShredTimer, 3.8);
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 8.8),
            Math.cos(ang) * 320,
            Math.sin(ang) * 320,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.2 });
        }
      }
    }

    if (!data.execFired && state.elapsed >= 2.0) {
      data.execFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 24.5),
          Math.cos(ang) * 570,
          Math.sin(ang) * 570,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        305,
        '#dc2626',
        10,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'MASTER HUNTER EXECUTION!!',
        '#dc2626',
        'crit',
      );
      ctx.addScreenShake(17);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
