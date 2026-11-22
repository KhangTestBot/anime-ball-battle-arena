import type { UltimateHandler } from './types';

export interface VolibearUltimateData {
  boltsDone: number;
  boltCd: number;
  stormbringerFired: boolean;
  flash: number;
}

export const volibearUltimateHandler: UltimateHandler = {
  characterId: 'volibear',
  title: 'STORMBRINGER (R): THE RELENTLESS STORM!',
  subtitle:
    'Ascends as the Thunder Bear (+20% DMG, Enchanted Armor & Unstoppable), calls down 3 paralyzing Sky Splitter bolts, and slams down with Stormbringer!',
  bannerColor: '#38bdf8',
  castDuration: 0.24,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 20;
    owner.enchantArmorTimer = Math.max(owner.enchantArmorTimer, 3.8);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.8);

    const data: VolibearUltimateData = {
      boltsDone: 0,
      boltCd: 0.34,
      stormbringerFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'I AM THE STORM!!',
      '#38bdf8',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'powerup', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as VolibearUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.stormbringerFired && data.boltsDone < 3) {
      data.boltCd -= dt;
      if (data.boltCd <= 0) {
        data.boltCd = 0.45;
        data.boltsDone += 1;
        for (const e of ctx.getEnemies(owner)) {
          e.paralyzeTimer = Math.max(e.paralyzeTimer, 2.2);
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 8.4), 0, 0, {
            isCrit: true,
            sourceKind: 'ability',
          });
        }
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          225,
          '#38bdf8',
          8,
          owner.character.id,
          owner.character.series,
        );
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.2 });
      }
    }

    if (!data.stormbringerFired && state.elapsed >= 2.05) {
      data.stormbringerFired = true;
      data.flash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        e.paralyzeTimer = Math.max(e.paralyzeTimer, 3.0);
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
        '#38bdf8',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'STORMBRINGER CRASH!!',
        '#38bdf8',
        'crit',
      );
      ctx.addScreenShake(20);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};
