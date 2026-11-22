import type { UltimateHandler } from './types';

export interface AkiUltimateData {
  nailsDone: number;
  nailCd: number;
  curseFired: boolean;
  flash: number;
}

export const akiUltimateHandler: UltimateHandler = {
  characterId: 'aki',
  title: 'FOX DEVIL KON! & CURSE DEVIL NAIL!',
  subtitle:
    'Future Devil foresight (Auto-Dodge) + Fox Devil Kon!, pierces foes 3 times with Curse Nail, and triggers fatal 3rd Nail Execution!',
  bannerColor: '#38bdf8',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 3.0);
    owner.dmgBonusPct += 18;

    const data: AkiUltimateData = {
      nailsDone: 0,
      nailCd: 0.3,
      curseFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'KON!! FOX DEVIL!',
      '#38bdf8',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as AkiUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.curseFired && data.nailsDone < 3) {
      data.nailCd -= dt;
      if (data.nailCd <= 0) {
        data.nailCd = 0.44;
        data.nailsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          target.armorShredTimer = Math.max(target.armorShredTimer, 3.6);
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 9.0),
            Math.cos(ang) * 280,
            Math.sin(ang) * 280,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.spawnShockwave(
            target.x,
            target.y,
            125,
            '#38bdf8',
            6,
            owner.character.id,
            owner.character.series,
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.2 });
        }
      }
    }

    if (!data.curseFired && state.elapsed >= 2.0) {
      data.curseFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        e.antiHealTimer = Math.max(e.antiHealTimer, 4.0);
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 25.5),
          Math.cos(ang) * 580,
          Math.sin(ang) * 580,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        320,
        '#38bdf8',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'CURSE DEVIL: FIRE!!',
        '#ef4444',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};
