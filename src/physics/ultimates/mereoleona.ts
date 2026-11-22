import type { UltimateHandler } from './types';

export interface MereoleonaUltimateData {
  punchesDone: number;
  punchCd: number;
  purgatoryFired: boolean;
  flash: number;
}

export const mereoleonaUltimateHandler: UltimateHandler = {
  characterId: 'mereoleona',
  title: 'HELLFIRE INCARNATE: CALIDOS BRACHIUM!',
  subtitle:
    'Becomes living flame (Unstoppable + +24% DMG), chains 4 blazing rush punches, and incinerates all with Calidos Brachium Purgatory!',
  bannerColor: '#f97316',
  castDuration: 0.2,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.8);
    owner.dmgBonusPct += 24;

    const data: MereoleonaUltimateData = {
      punchesDone: 0,
      punchCd: 0.26,
      purgatoryFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#f97316', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'HELLFIRE INCARNATE!!',
      '#f97316',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'powerup', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as MereoleonaUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.purgatoryFired && data.punchesDone < 4) {
      data.punchCd -= dt;
      if (data.punchCd <= 0) {
        data.punchCd = 0.34;
        data.punchesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          const pad = owner.radius + 8;
          owner.x = Math.max(
            ctx.bounds.left + pad,
            Math.min(
              ctx.bounds.right - pad,
              target.x - Math.cos(ang) * (owner.radius + target.radius + 8),
            ),
          );
          owner.y = Math.max(
            ctx.bounds.top + pad,
            Math.min(
              ctx.bounds.bottom - pad,
              target.y - Math.sin(ang) * (owner.radius + target.radius + 8),
            ),
          );
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 9.8),
            Math.cos(ang) * 350,
            Math.sin(ang) * 350,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'wall', intensity: 1.25 });
        }
      }
    }

    if (!data.purgatoryFired && state.elapsed >= 2.0) {
      data.purgatoryFired = true;
      data.flash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 27.5),
          Math.cos(ang) * 660,
          Math.sin(ang) * 660,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        355,
        '#f97316',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'CALIDOS BRACHIUM PURGATORY!!',
        '#ef4444',
        'crit',
      );
      ctx.addScreenShake(20);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.45 });
    }
  },
};
