import type { UltimateHandler } from './types';

export interface ArminUltimateData {
  steamPulses: number;
  steamCd: number;
  nukeFired: boolean;
  flash: number;
}

export const arminUltimateHandler: UltimateHandler = {
  characterId: 'armin',
  title: 'COLOSSAL TITAN: NUCLEAR TRANSFORMATION!',
  subtitle:
    'Transforms in golden lightning (+20% DMG, Enchanted Armor & Unstoppable), scorches foes with 3 Colossal Steam waves, and detonates a harbor-wiping Colossal Nuke!',
  bannerColor: '#f97316',
  castDuration: 0.26,
  duration: 4.1,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 20;
    owner.enchantArmorTimer = Math.max(owner.enchantArmorTimer, 3.8);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.8);

    const data: ArminUltimateData = {
      steamPulses: 0,
      steamCd: 0.34,
      nukeFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#facc15', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'COLOSSAL TITAN!!',
      '#f97316',
      'powerup',
    );
    ctx.addScreenShake(13);
    ctx.emitSfx({ type: 'powerup', intensity: 1.35 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ArminUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.nukeFired && data.steamPulses < 3) {
      data.steamCd -= dt;
      if (data.steamCd <= 0) {
        data.steamCd = 0.45;
        data.steamPulses += 1;
        for (const e of ctx.getEnemies(owner)) {
          e.burnTimer = Math.max(e.burnTimer, 3.5);
          e.burnDps = Math.max(e.burnDps, 8.5);
          e.burnOwnerUid = owner.uid;
          const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 8.0),
            Math.cos(ang) * 320,
            Math.sin(ang) * 320,
            { sourceKind: 'ability' },
          );
        }
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          230,
          '#f97316',
          8,
          owner.character.id,
          owner.character.series,
        );
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.15 });
      }
    }

    if (!data.nukeFired && state.elapsed >= 2.1) {
      data.nukeFired = true;
      data.flash = 1.5;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        e.burnTimer = Math.max(e.burnTimer, 5.0);
        e.burnDps = Math.max(e.burnDps, 10.0);
        e.burnOwnerUid = owner.uid;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 27.5),
          Math.cos(ang) * 680,
          Math.sin(ang) * 680,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        370,
        '#facc15',
        14,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'COLOSSAL NUKE DETONATION!!',
        '#facc15',
        'crit',
      );
      ctx.addScreenShake(22);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.5 });
    }
  },
};
