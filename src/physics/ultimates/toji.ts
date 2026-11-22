import type { UltimateHandler } from './types';

export interface TojiUltimateData {
  strikesLeft: number;
  strikeCd: number;
  chainX1: number;
  chainY1: number;
  chainX2: number;
  chainY2: number;
  chainFlash: number;
}

export const tojiUltimateHandler: UltimateHandler = {
  characterId: 'toji',
  title: 'HEAVENLY RESTRICTION: INVERTED SPEAR OF HEAVEN',
  subtitle:
    'Zero-cursed-energy blitz unleashes 3 Chain of a Thousand Miles whips + Inverted Spear of Heaven: NULLIFIES IMMORTALITY & SHIELDS (bypasses invuln), silences skills & yanks targets!',
  bannerColor: '#10b981',
  castDuration: 0.22,
  duration: 3.4,

  onCast(ctx, owner, state) {
    owner.getExcitedTimer = Math.max(owner.getExcitedTimer, 3.3);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.5);

    const data: TojiUltimateData = {
      strikesLeft: 3,
      strikeCd: 0.08,
      chainX1: owner.x,
      chainY1: owner.y,
      chainX2: owner.x,
      chainY2: owner.y,
      chainFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#10b981', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      175,
      '#059669',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'HEAVENLY RESTRICTION!!',
      '#34d399',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 20, '#10b981', 90, 290, 3, 6, 'shard');
    ctx.addScreenShake(10);
    ctx.addHitstop(0.045);
    ctx.emitSfx({ type: 'slash', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as TojiUltimateData;
    const { left, right, top, bottom } = ctx.bounds;

    if (data.chainFlash > 0) {
      data.chainFlash = Math.max(0, data.chainFlash - dt);
    }

    // 3 High-speed Chain-of-a-Thousand-Miles + Inverted Spear of Heaven strikes!
    if (data.strikesLeft > 0) {
      data.strikeCd -= dt;
      if (data.strikeCd <= 0) {
        data.strikesLeft--;
        data.strikeCd = 0.72;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const dx = target.x - owner.x;
          const dy = target.y - owner.y;
          const d = Math.max(1, Math.hypot(dx, dy));
          const ux = dx / d;
          const uy = dy / d;

          data.chainX1 = owner.x;
          data.chainY1 = owner.y;
          data.chainX2 = target.x;
          data.chainY2 = target.y;
          data.chainFlash = 0.55;

          // Canon Inverted Spear of Heaven: cancels enemy shields, invulnerability & enchanted armor, then silences CT!
          target.shieldTimer = 0;
          target.invulnTimer = 0;
          target.enchantArmorTimer = 0;
          target.silenceTimer = Math.max(target.silenceTimer, 2.5);
          target.armorShredTimer = Math.max(target.armorShredTimer, 3.0);

          const isFinal = data.strikesLeft === 0;
          // Final strike dashes Toji right into melee finish safely inside arena!
          if (isFinal) {
            owner.afterimages.push({
              x: owner.x,
              y: owner.y,
              alpha: 0.85,
              color: '#10b981',
              formIndex: owner.formIndex,
            });
            owner.x = Math.max(
              left + owner.radius + 8,
              Math.min(
                right - owner.radius - 8,
                target.x - ux * (owner.radius + target.radius + 10),
              ),
            );
            owner.y = Math.max(
              top + owner.radius + 8,
              Math.min(
                bottom - owner.radius - 8,
                target.y - uy * (owner.radius + target.radius + 10),
              ),
            );
          }

          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, isFinal ? 13.5 : 6.8),
            // Chain whip pulls enemy toward Toji on hits 1-2, then blasts away on final Split Soul Katana cut!
            isFinal ? ux * 520 : -ux * 340,
            isFinal ? uy * 520 : -uy * 340,
            { isCrit: isFinal, bypassInvuln: true, sourceKind: 'ability' },
          );
          ctx.spawnFloatingText(
            target.x,
            target.y - target.radius - 16,
            isFinal ? 'SPLIT SOUL KATANA!!' : 'CT CANCELLED!',
            '#6ee7b7',
            isFinal ? 'crit' : 'callout',
          );
          ctx.spawnParticles(target.x, target.y, 16, '#10b981', 80, 290, 2.5, 6, 'shard');
          ctx.addScreenShake(isFinal ? 16 : 9);
          ctx.emitSfx({ type: 'slash', intensity: isFinal ? 1.35 : 1.1 });
        }
      }
    }
  },
};
