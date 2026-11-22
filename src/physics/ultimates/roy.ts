import type { UltimateHandler } from './types';

export interface RoyUltimateData {
  snapsDone: number;
  snapCd: number;
  blastX: number;
  blastY: number;
  blastFlash: number;
}

export const royUltimateHandler: UltimateHandler = {
  characterId: 'roy',
  title: 'FLAME ALCHEMY: SNAP INCINERATION',
  subtitle:
    'Snaps his ignition gloves 4 times creating pinpoint oxygen-compressed explosions directly on enemies, inflicting Burn & Drowsy blind!',
  bannerColor: '#ef4444',
  castDuration: 0.22,
  duration: 3.7,

  onCast(ctx, owner, state) {
    const data: RoyUltimateData = {
      snapsDone: 0,
      snapCd: 0.38,
      blastX: owner.x,
      blastY: owner.y,
      blastFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ef4444', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      '*SNAP!* FLAME ALCHEMY!',
      '#fb923c',
      'powerup',
    );
    ctx.emitSfx({ type: 'slash', intensity: 1.15 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as RoyUltimateData;
    if (data.blastFlash > 0) data.blastFlash = Math.max(0, data.blastFlash - dt);

    if (data.snapsDone < 4) {
      data.snapCd -= dt;
      if (data.snapCd <= 0) {
        data.snapCd = 0.62;
        data.snapsDone += 1;
        data.blastFlash = 0.52;
        const enemies = ctx.getEnemies(owner);
        const target =
          enemies[data.snapsDone % Math.max(1, enemies.length)] ?? ctx.getNearestEnemy(owner);
        if (target) {
          data.blastX = target.x;
          data.blastY = target.y;
          target.burnTimer = Math.max(target.burnTimer, 4.0);
          target.burnDps = Math.max(target.burnDps, ctx.getEffectiveDamage(owner, 4.6));
          target.burnOwnerUid = owner.uid;
          target.drowsyTimer = Math.max(target.drowsyTimer, 1.4);
          if (data.snapsDone === 4) {
            target.shieldTimer = 0;
          }
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, data.snapsDone === 4 ? 17.0 : 9.2),
            0,
            0,
            {
              isCrit: data.snapsDone === 4,
              bypassInvuln: data.snapsDone === 4,
              sourceKind: 'ability',
            },
          );
          ctx.spawnShockwave(
            target.x,
            target.y,
            175,
            '#f97316',
            6,
            owner.character.id,
            owner.character.series,
          );
          ctx.spawnParticles(target.x, target.y, 24, '#facc15', 80, 280, 3, 6.5, 'circle');
          ctx.spawnFloatingText(
            target.x,
            target.y - target.radius - 22,
            '*SNAP!* INCINERATE!',
            '#facc15',
            'callout',
          );
          ctx.addScreenShake(12);
          ctx.emitSfx({ type: 'crit', intensity: 1.2 });
        }
      }
    }
  },
};
