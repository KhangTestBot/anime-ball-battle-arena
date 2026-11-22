import type { UltimateHandler } from './types';

export interface ThomasAndreUltimateData {
  capturesDone: number;
  captureCd: number;
  smashFired: boolean;
  flash: number;
}

export const thomasAndreUltimateHandler: UltimateHandler = {
  characterId: 'thomas_andre',
  title: 'GOLIATH: REINFORCEMENT & CAPTURE!',
  subtitle:
    'Activates Golden Goliath Reinforcement (+20% DMG, Shield & Enchanted Armor), pulls foes into a black-hole Capture vortex, and obliterates them with Power Smash!',
  bannerColor: '#f59e0b',
  castDuration: 0.24,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 20;
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.6);
    owner.shieldColor = '#f59e0b';
    owner.enchantArmorTimer = Math.max(owner.enchantArmorTimer, 3.6);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.6);

    const data: ThomasAndreUltimateData = {
      capturesDone: 0,
      captureCd: 0.34,
      smashFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#f59e0b', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'GOLIATH REINFORCEMENT!!',
      '#eab308',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'powerup', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ThomasAndreUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.smashFired && data.capturesDone < 3) {
      data.captureCd -= dt;
      if (data.captureCd <= 0) {
        data.captureCd = 0.45;
        data.capturesDone += 1;
        for (const e of ctx.getEnemies(owner)) {
          const dx = owner.x - e.x;
          const dy = owner.y - e.y;
          const dist = Math.max(1, Math.hypot(dx, dy));
          e.vx += (dx / dist) * 380;
          e.vy += (dy / dist) * 380;
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 8.2), 0, 0, {
            sourceKind: 'ability',
          });
        }
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          210,
          '#f59e0b',
          7,
          owner.character.id,
          owner.character.series,
        );
        ctx.emitSfx({ type: 'powerup', intensity: 1.15 });
      }
    }

    if (!data.smashFired && state.elapsed >= 2.05) {
      data.smashFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        e.stunTimer = Math.max(e.stunTimer, 1.15);
        e.stunKind = 'airborne';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 26.5),
          Math.cos(ang) * 650,
          Math.sin(ang) * 650,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        335,
        '#eab308',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'GOLIATH POWER SMASH!!',
        '#f59e0b',
        'crit',
      );
      ctx.addScreenShake(20);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};
