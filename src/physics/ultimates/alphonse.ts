import type { UltimateHandler } from './types';

export interface AlphonseUltimateData {
  pillarsDone: number;
  pillarCd: number;
  quakeFired: boolean;
  flash: number;
}

export const alphonseUltimateHandler: UltimateHandler = {
  characterId: 'alphonse',
  title: "PHILOSOPHER'S STONE: TRANSMUTATION FORTRESS!",
  subtitle:
    'Fortifies Soul-Bound Armor (Shield + Enchanted Armor + Unstoppable), erupts 3 Alchemical Pillars, and crushes foes with Fortress Quake!',
  bannerColor: '#94a3b8',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.8);
    owner.shieldColor = '#ef4444';
    owner.enchantArmorTimer = Math.max(owner.enchantArmorTimer, 3.8);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.6);

    const data: AlphonseUltimateData = {
      pillarsDone: 0,
      pillarCd: 0.32,
      quakeFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ef4444', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      "PHILOSOPHER'S STONE TRANSMUTE!",
      '#ef4444',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as AlphonseUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.quakeFired && data.pillarsDone < 3) {
      data.pillarCd -= dt;
      if (data.pillarCd <= 0) {
        data.pillarCd = 0.44;
        data.pillarsDone += 1;
        for (const e of ctx.getEnemies(owner)) {
          e.airborneTimer = Math.max(e.airborneTimer, 0.7);
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 8.2), 0, 0, {
            isCrit: true,
            sourceKind: 'ability',
          });
        }
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          215,
          '#ef4444',
          7,
          owner.character.id,
          owner.character.series,
        );
        ctx.emitSfx({ type: 'wall', intensity: 1.2 });
      }
    }

    if (!data.quakeFired && state.elapsed >= 2.0) {
      data.quakeFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.15);
        e.stunKind = 'airborne';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 24.5),
          Math.cos(ang) * 610,
          Math.sin(ang) * 610,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        320,
        '#94a3b8',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'IRON FORTRESS QUAKE!!',
        '#ef4444',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
