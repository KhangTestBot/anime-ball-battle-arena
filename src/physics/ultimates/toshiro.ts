import { applyFighterStun } from '../domains';
import type { UltimateHandler } from './types';

export interface ToshiroUltimateData {
  petalsLeft: number;
  petalCd: number;
  hyoketsuTriggered: boolean;
  crystalFlash: number;
}

export const toshiroUltimateHandler: UltimateHandler = {
  characterId: 'toshiro',
  title: 'DAIGUREN HYORINMARU: SHIKAI HYOKETSU',
  subtitle:
    '4 Ice Petals count down → When the final petal fades, awakens ADULT FORM SHIKAI HYOKETSU freezing all enemies, LOCKING SKILLS (Silence + Dodge Lock) & crushing them in Ice Lotus!',
  bannerColor: '#38bdf8',
  castDuration: 0.24,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.6);

    const data: ToshiroUltimateData = {
      petalsLeft: 4,
      petalCd: 0.35,
      hyoketsuTriggered: false,
      crystalFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      195,
      '#2dd4bf',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'DAIGUREN HYORINMARU!',
      '#99f6e4',
      'powerup',
    );
    ctx.addScreenShake(9);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ToshiroUltimateData;
    const enemies = ctx.getEnemies(owner);

    if (data.crystalFlash > 0) data.crystalFlash = Math.max(0, data.crystalFlash - dt);

    // 4 Ice Flower Petals Fall Down Counting to Adult Toshiro's Shikai Hyoketsu!
    if (data.petalsLeft > 0) {
      data.petalCd -= dt;
      if (data.petalCd <= 0) {
        data.petalCd = 0.42;
        data.petalsLeft--;
        for (const e of enemies) {
          if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 230 + e.radius) {
            e.frostTimer = Math.max(e.frostTimer, 2.2);
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 3.2), 0, 0, {
              sourceKind: 'ability',
            });
          }
        }
        ctx.spawnParticles(owner.x, owner.y, 8, '#7dd3fc', 40, 140, 2.5, 5, 'petal');
      }
      return;
    }

    // All 4 Petals Fallen -> SHIKAI HYOKETSU (Four-Second Freeze & Power Nullification!)
    if (!data.hyoketsuTriggered && state.elapsed >= 1.8) {
      data.hyoketsuTriggered = true;
      data.crystalFlash = 1.25;

      for (const e of enemies) {
        e.shieldTimer = 0;
        e.silenceTimer = Math.max(e.silenceTimer, 2.4);
        e.dodgeLockedTimer = Math.max(e.dodgeLockedTimer, 2.4);
        e.armorShredTimer = Math.max(e.armorShredTimer, 2.8);
        applyFighterStun(ctx, owner, e, 1.45, 'frozen', 'SHIKAI HYOKETSU!');
        ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 15.0), 0, 0, {
          bypassInvuln: true,
          isCrit: true,
          sourceKind: 'ability',
        });
      }

      ctx.spawnShockwave(
        owner.x,
        owner.y,
        260,
        '#2dd4bf',
        9,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 22,
        'SHIKAI HYOKETSU!!',
        '#ccfbf1',
        'powerup',
      );
      ctx.addHitstop(0.085);
      ctx.addScreenShake(20);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};
