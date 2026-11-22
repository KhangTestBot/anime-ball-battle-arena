import type { UltimateHandler } from './types';

export interface ClapLink {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  life: number;
}

export interface TodoUltimateData {
  swapsLeft: number;
  swapCd: number;
  links: ClapLink[];
  blackFlashed: boolean;
  clapFlash: number;
}

export const todoUltimateHandler: UltimateHandler = {
  characterId: 'todo',
  title: 'BOOGIE WOOGIE: 530,000 IQ SWAP & BLACK FLASH',
  subtitle:
    '*CLAP!* Claps 4 times swapping positions rapidly to disorient foes & redirect enemy projectiles → Finishes with a 530,000 IQ Black Flash punch!',
  bannerColor: '#3b82f6',
  castDuration: 0.22,
  duration: 3.7,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.5);
    const data: TodoUltimateData = {
      swapsLeft: 4,
      swapCd: 0.12,
      links: [],
      blackFlashed: false,
      clapFlash: 0.5,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#3b82f6', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      '*CLAP!* MY BESTO FRIENDO!',
      '#60a5fa',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 18, '#3b82f6', 75, 240, 3, 6, 'star');
    ctx.addScreenShake(8);
    ctx.addHitstop(0.045);
    ctx.emitSfx({ type: 'dodge' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as TodoUltimateData;
    const enemies = ctx.getEnemies(owner);
    const { left, right, top, bottom } = ctx.bounds;

    if (data.clapFlash > 0) data.clapFlash = Math.max(0, data.clapFlash - dt);

    for (let i = data.links.length - 1; i >= 0; i--) {
      data.links[i].life -= dt;
      if (data.links[i].life <= 0) data.links.splice(i, 1);
    }

    // 4 Rapid Boogie Woogie Position Swaps confusing targets & redirecting enemy projectiles!
    if (data.swapsLeft > 0) {
      data.swapCd -= dt;
      if (data.swapCd <= 0) {
        data.swapCd = 0.54;
        data.swapsLeft--;
        data.clapFlash = 0.45;
        const target = enemies[data.swapsLeft % Math.max(1, enemies.length)];
        if (target) {
          const oldOx = owner.x;
          const oldOy = owner.y;
          const oldTx = target.x;
          const oldTy = target.y;

          owner.x = Math.max(left + owner.radius + 6, Math.min(right - owner.radius - 6, oldTx));
          owner.y = Math.max(top + owner.radius + 6, Math.min(bottom - owner.radius - 6, oldTy));
          target.x = Math.max(left + target.radius + 6, Math.min(right - target.radius - 6, oldOx));
          target.y = Math.max(top + target.radius + 6, Math.min(bottom - target.radius - 6, oldOy));

          target.confusedTimer = Math.max(target.confusedTimer, 1.1);
          data.links.push({ x1: oldOx, y1: oldOy, x2: oldTx, y2: oldTy, life: 0.6 });

          // Reverse incoming enemy projectiles on swap!
          for (const p of ctx.projectiles) {
            if (p.ownerUid !== owner.uid) {
              p.vx = -p.vx * 1.15;
              p.vy = -p.vy * 1.15;
            }
          }

          ctx.spawnShockwave(
            owner.x,
            owner.y,
            90,
            '#60a5fa',
            4.5,
            owner.character.id,
            owner.character.series,
          );
          ctx.spawnFloatingText(
            owner.x,
            owner.y - owner.radius - 16,
            '*CLAP!* BOOGIE WOOGIE!',
            '#93c5fd',
            'callout',
          );
          ctx.emitSfx({ type: 'dodge', intensity: 1.1 });
        }
      }
      return;
    }

    // Climax (2.45s): 530,000 IQ BLACK FLASH SMASH!!
    if (!data.blackFlashed && state.elapsed >= 2.45) {
      data.blackFlashed = true;
      const target = ctx.getNearestEnemy(owner);
      if (target) {
        const dx = target.x - owner.x;
        const dy = target.y - owner.y;
        const d = Math.max(1, Math.hypot(dx, dy));
        const ux = dx / d;
        const uy = dy / d;
        owner.x = Math.max(
          left + owner.radius + 8,
          Math.min(right - owner.radius - 8, target.x - ux * (owner.radius + target.radius + 8)),
        );
        owner.y = Math.max(
          top + owner.radius + 8,
          Math.min(bottom - owner.radius - 8, target.y - uy * (owner.radius + target.radius + 8)),
        );

        ctx.addHitstop(0.08);
        ctx.addScreenShake(20);
        ctx.spawnShockwave(
          target.x,
          target.y,
          210,
          '#09090b',
          8,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(
          target.x,
          target.y - target.radius - 20,
          '530,000 IQ BLACK FLASH!!',
          '#ef4444',
          'crit',
        );
        ctx.applyDamage(owner, target, ctx.getEffectiveDamage(owner, 17.5), ux * 580, uy * 580, {
          isCrit: true,
          sourceKind: 'ability',
        });
        ctx.spawnParticles(target.x, target.y, 24, '#09090b', 100, 350, 3, 7, 'star');
        ctx.emitSfx({ type: 'ko', intensity: 1.4 });
      }
    }
  },
};
