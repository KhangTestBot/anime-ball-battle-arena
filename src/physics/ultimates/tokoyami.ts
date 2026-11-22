import type { UltimateHandler } from './types';

export interface TokoyamiUltimateData {
  clawsDone: number;
  clawCd: number;
  ragnarokFired: boolean;
  flash: number;
}

export const tokoyamiUltimateHandler: UltimateHandler = {
  characterId: 'tokoyami',
  title: 'DARK SHADOW: RAGNAROK LIGHT OF BALDUR!',
  subtitle:
    'Unleashes colossal Dark Shadow (+22% DMG, Fear & Unstoppable), sweeps 3 abyssal shadow claws, and crushes foes with Ragnarok!',
  bannerColor: '#7e22ce',
  castDuration: 0.24,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 22;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.6);
    for (const e of ctx.getEnemies(owner)) {
      e.stunTimer = Math.max(e.stunTimer, 0.9);
      e.stunKind = 'fear';
    }

    const data: TokoyamiUltimateData = {
      clawsDone: 0,
      clawCd: 0.32,
      ragnarokFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#7e22ce', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'DARK SHADOW: RAGNAROK!!',
      '#a855f7',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'slash', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as TokoyamiUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.ragnarokFired && data.clawsDone < 3) {
      data.clawCd -= dt;
      if (data.clawCd <= 0) {
        data.clawCd = 0.44;
        data.clawsDone += 1;
        for (const e of ctx.getEnemies(owner)) {
          e.armorShredTimer = Math.max(e.armorShredTimer, 3.6);
          const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 9.0),
            Math.cos(ang) * 340,
            Math.sin(ang) * 340,
            { isCrit: true, sourceKind: 'ability' },
          );
        }
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          230,
          '#7e22ce',
          8,
          owner.character.id,
          owner.character.series,
        );
        ctx.emitSfx({ type: 'slash', intensity: 1.2 });
      }
    }

    if (!data.ragnarokFired && state.elapsed >= 2.05) {
      data.ragnarokFired = true;
      data.flash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 26.5),
          Math.cos(ang) * 640,
          Math.sin(ang) * 640,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        345,
        '#7e22ce',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'RAGNAROK: LIGHT OF BALDUR!!',
        '#a855f7',
        'crit',
      );
      ctx.addScreenShake(20);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};
