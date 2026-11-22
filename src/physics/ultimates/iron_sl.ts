import type { UltimateHandler } from './types';

export interface IronSlUltimateData {
  tauntsDone: number;
  tauntCd: number;
  quakeFired: boolean;
  flash: number;
}

export const ironSlUltimateHandler: UltimateHandler = {
  characterId: 'iron_sl',
  title: 'SHADOW TANK: TAUNTING ROAR & AXE QUAKE!',
  subtitle:
    'Fortifies Shadow Armor (Shield + Enchanted Armor + Unstoppable), taunts and pulls all foes inward, and crushes them with Iron Axe Quake!',
  bannerColor: '#64748b',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.6);
    owner.shieldColor = '#a855f7';
    owner.enchantArmorTimer = Math.max(owner.enchantArmorTimer, 3.8);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.6);

    const data: IronSlUltimateData = {
      tauntsDone: 0,
      tauntCd: 0.34,
      quakeFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#a855f7', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'SHOUT OF PROVOCATION!',
      '#a855f7',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as IronSlUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.quakeFired && data.tauntsDone < 3) {
      data.tauntCd -= dt;
      if (data.tauntCd <= 0) {
        data.tauntCd = 0.45;
        data.tauntsDone += 1;
        for (const e of ctx.getEnemies(owner)) {
          e.confusedTimer = Math.max(e.confusedTimer, 1.8);
          const dx = owner.x - e.x;
          const dy = owner.y - e.y;
          const dist = Math.max(1, Math.hypot(dx, dy));
          e.vx += (dx / dist) * 320;
          e.vy += (dy / dist) * 320;
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 6.8), 0, 0, {
            sourceKind: 'ability',
          });
        }
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          200,
          '#64748b',
          7,
          owner.character.id,
          owner.character.series,
        );
        ctx.emitSfx({ type: 'powerup', intensity: 1.1 });
      }
    }

    if (!data.quakeFired && state.elapsed >= 2.0) {
      data.quakeFired = true;
      data.flash = 1.3;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.1);
        e.stunKind = 'airborne';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 22.5),
          Math.cos(ang) * 580,
          Math.sin(ang) * 580,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        295,
        '#a855f7',
        10,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'IRON AXE QUAKE!!',
        '#e2e8f0',
        'crit',
      );
      ctx.addScreenShake(17);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.3 });
    }
  },
};
