import type { UltimateHandler } from './types';

export interface SettUltimateData {
  gritBonusPct: number;
  punchesDone: number;
  punchCd: number;
  showstopperFired: boolean;
  flash: number;
}

export const settUltimateHandler: UltimateHandler = {
  characterId: 'sett',
  title: 'THE SHOW STOPPER (R): MAX GRIT HAYMAKER!',
  subtitle:
    'Stacks Haymaker Grit (+18% to +34% DMG scaling with missing HP, Shield & Unstoppable), slams 3 Knuckle Down punches, and suplexes all foes with The Show Stopper!',
  bannerColor: '#f59e0b',
  castDuration: 0.24,
  duration: 4.0,

  onCast(ctx, owner, state) {
    const missingRatio = Math.max(0, Math.min(1, 1 - owner.hp / Math.max(1, owner.maxHp)));
    const gritBonusPct = Math.round(18 + missingRatio * 16);
    owner.dmgBonusPct += gritBonusPct;
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.6);
    owner.shieldColor = '#f59e0b';
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.6);

    const data: SettUltimateData = {
      gritBonusPct,
      punchesDone: 0,
      punchCd: 0.32,
      showstopperFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#f59e0b', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      `MAX GRIT +${gritBonusPct}%!!`,
      '#f59e0b',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'powerup', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as SettUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.showstopperFired && data.punchesDone < 3) {
      data.punchCd -= dt;
      if (data.punchCd <= 0) {
        data.punchCd = 0.44;
        data.punchesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          owner.vx = Math.cos(ang) * 620;
          owner.vy = Math.sin(ang) * 620;
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 9.6),
            Math.cos(ang) * 350,
            Math.sin(ang) * 350,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'wall', intensity: 1.2 });
        }
      }
    }

    if (!data.showstopperFired && state.elapsed >= 2.05) {
      data.showstopperFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        e.stunTimer = Math.max(e.stunTimer, 1.2);
        e.stunKind = 'airborne';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 26.5),
          Math.cos(ang) * 660,
          Math.sin(ang) * 660,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        335,
        '#f59e0b',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'THE SHOW STOPPER!!',
        '#ef4444',
        'crit',
      );
      ctx.addScreenShake(20);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};
