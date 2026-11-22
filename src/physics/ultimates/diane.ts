import type { UltimateHandler } from './types';

export interface DianeUltimateData {
  quakesDone: number;
  quakeCd: number;
  catastropheFired: boolean;
  flash: number;
}

export const dianeUltimateHandler: UltimateHandler = {
  characterId: 'diane',
  title: 'CREATION: MOTHER CATASTROPHE!',
  subtitle:
    'Activates Heavy Metal (Enchanted Armor + Unstoppable), slams 3 Gideon seismic waves, and crushes the arena with Mother Catastrophe!',
  bannerColor: '#d97706',
  castDuration: 0.24,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.enchantArmorTimer = Math.max(owner.enchantArmorTimer, 3.8);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.8);
    owner.dmgBonusPct += 18;

    const data: DianeUltimateData = {
      quakesDone: 0,
      quakeCd: 0.34,
      catastropheFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#d97706', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'HEAVY METAL: CREATION!',
      '#d97706',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'wall', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as DianeUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.catastropheFired && data.quakesDone < 3) {
      data.quakeCd -= dt;
      if (data.quakeCd <= 0) {
        data.quakeCd = 0.45;
        data.quakesDone += 1;
        for (const e of ctx.getEnemies(owner)) {
          e.airborneTimer = Math.max(e.airborneTimer, 0.7);
          const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 8.4),
            Math.cos(ang) * 320,
            Math.sin(ang) * 320,
            { isCrit: true, sourceKind: 'ability' },
          );
        }
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          225,
          '#d97706',
          8,
          owner.character.id,
          owner.character.series,
        );
        ctx.emitSfx({ type: 'wall', intensity: 1.2 });
      }
    }

    if (!data.catastropheFired && state.elapsed >= 2.05) {
      data.catastropheFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.2);
        e.stunKind = 'airborne';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 25.5),
          Math.cos(ang) * 640,
          Math.sin(ang) * 640,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        340,
        '#d97706',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'MOTHER CATASTROPHE!!',
        '#ec4899',
        'crit',
      );
      ctx.addScreenShake(20);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};
