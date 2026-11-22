import type { UltimateHandler } from './types';

export interface ShunsuiUltimateData {
  actsDone: number;
  actCd: number;
  act4Fired: boolean;
  flash: number;
}

export const shunsuiUltimateHandler: UltimateHandler = {
  characterId: 'shunsui',
  title: 'BANKAI: KATEN KYOKOTSU KARAMATSU SHINJU!',
  subtitle:
    'Tragic Four-Act Theater (Fear + Anti-Heal Plague + Abyss Drain), culminating in Act 4: Thread-Cutting Throat Sever!',
  bannerColor: '#ec4899',
  castDuration: 0.25,
  duration: 4.1,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.8);
    for (const e of ctx.getEnemies(owner)) {
      e.stunTimer = Math.max(e.stunTimer, 0.9);
      e.stunKind = 'fear';
      e.antiHealTimer = Math.max(e.antiHealTimer, 4.5);
    }

    const data: ShunsuiUltimateData = {
      actsDone: 0,
      actCd: 0.34,
      act4Fired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ec4899', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 28,
      'BANKAI: KARAMATSU SHINJU!',
      '#ec4899',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'powerup', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ShunsuiUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.act4Fired && data.actsDone < 3) {
      data.actCd -= dt;
      if (data.actCd <= 0) {
        data.actCd = 0.45;
        data.actsDone += 1;
        for (const e of ctx.getEnemies(owner)) {
          e.armorShredTimer = Math.max(e.armorShredTimer, 3.8);
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 9.0), 0, 0, {
            isCrit: true,
            sourceKind: 'ability',
          });
        }
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          230,
          '#ec4899',
          8,
          owner.character.id,
          owner.character.series,
        );
        ctx.emitSfx({ type: 'slash', intensity: 1.2 });
      }
    }

    if (!data.act4Fired && state.elapsed >= 2.1) {
      data.act4Fired = true;
      data.flash = 1.5;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 28.0),
          Math.cos(ang) * 630,
          Math.sin(ang) * 630,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        360,
        '#ec4899',
        13,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'ACT 4: THREAD-CUTTING SEVER!!',
        '#ec4899',
        'crit',
      );
      ctx.addScreenShake(21);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.5 });
    }
  },
};
