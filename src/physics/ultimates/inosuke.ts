import type { UltimateHandler } from './types';

export interface InosukeUltimateData {
  rushesDone: number;
  rushCd: number;
  cuttingFired: boolean;
  flash: number;
}

export const inosukeUltimateHandler: UltimateHandler = {
  characterId: 'inosuke',
  title: 'BEAST BREATHING: CRAZY CUTTING!',
  subtitle:
    'Ferocious dual-serrated rampage (+18% DMG & Unstoppable), chains 4 armor-shredding Devouring Rushes, and shreds all foes with Crazy Cutting!',
  bannerColor: '#38bdf8',
  castDuration: 0.2,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 18;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.4);

    const data: InosukeUltimateData = {
      rushesDone: 0,
      rushCd: 0.26,
      cuttingFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'COMIN THROUGH!!',
      '#38bdf8',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'slash', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as InosukeUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.cuttingFired && data.rushesDone < 4) {
      data.rushCd -= dt;
      if (data.rushCd <= 0) {
        data.rushCd = 0.34;
        data.rushesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          owner.vx = Math.cos(ang) * 680;
          owner.vy = Math.sin(ang) * 680;
          target.armorShredTimer = Math.max(target.armorShredTimer, 3.4);
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 8.6),
            Math.cos(ang) * 320,
            Math.sin(ang) * 320,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.2 });
        }
      }
    }

    if (!data.cuttingFired && state.elapsed >= 2.0) {
      data.cuttingFired = true;
      data.flash = 1.3;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 23.5),
          Math.cos(ang) * 560,
          Math.sin(ang) * 560,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        300,
        '#38bdf8',
        10,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'BEAST BREATHING: CRAZY CUTTING!!',
        '#38bdf8',
        'crit',
      );
      ctx.addScreenShake(17);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'slash', intensity: 1.4 });
    }
  },
};
