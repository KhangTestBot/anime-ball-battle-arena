import type { UltimateHandler } from './types';

export interface BlackFlashBolt {
  x: number;
  y: number;
  life: number;
}

export interface YujiUltimateData {
  flashesLeft: number;
  flashCd: number;
  comboCount: number;
  bolts: BlackFlashBolt[];
}

export const yujiUltimateHandler: UltimateHandler = {
  characterId: 'yuji',
  title: '8 CONSECUTIVE BLACK FLASHES',
  subtitle:
    'Rushes in chaining 8 crimson-black Black Flash punches scaling damage per combo hit, shredding armor + shield-piercing Soul Dismantle!',
  bannerColor: '#f43f5e',
  castDuration: 0.22,
  duration: 3.4,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.8);
    owner.getExcitedTimer = Math.max(owner.getExcitedTimer, 3.2);

    const data: YujiUltimateData = {
      flashesLeft: 8,
      flashCd: 0.08,
      comboCount: 0,
      bolts: [],
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#f43f5e', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      185,
      '#dc2626',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'BLACK FLASH COMBO x8!!',
      '#fca5a5',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 20, '#09090b', 80, 260, 3, 6, 'star');
    ctx.addScreenShake(9);
    ctx.addHitstop(0.045);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, _state, dt) {
    const data = _state.data as unknown as YujiUltimateData;
    const { left, right, top, bottom } = ctx.bounds;

    for (let i = data.bolts.length - 1; i >= 0; i--) {
      data.bolts[i].life -= dt;
      if (data.bolts[i].life <= 0) data.bolts.splice(i, 1);
    }

    if (data.flashesLeft > 0) {
      data.flashCd -= dt;
      if (data.flashCd <= 0) {
        data.flashCd = 0.34;
        data.flashesLeft--;

        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const dx = target.x - owner.x;
          const dy = target.y - owner.y;
          const d = Math.max(1, Math.hypot(dx, dy));
          const ux = dx / d;
          const uy = dy / d;

          owner.afterimages.push({
            x: owner.x,
            y: owner.y,
            alpha: 0.85,
            color: '#f43f5e',
            formIndex: owner.formIndex,
          });
          // Snap straight into melee range safely inside arena walls
          owner.x = Math.max(
            left + owner.radius + 8,
            Math.min(right - owner.radius - 8, target.x - ux * (owner.radius + target.radius + 6)),
          );
          owner.y = Math.max(
            top + owner.radius + 8,
            Math.min(bottom - owner.radius - 8, target.y - uy * (owner.radius + target.radius + 6)),
          );
          owner.facingAngle = Math.atan2(dy, dx);

          data.comboCount++;
          data.bolts.push({ x: target.x, y: target.y, life: 0.45 });

          const isFinal = data.flashesLeft === 0;
          if (isFinal) {
            target.shieldTimer = 0; // Final Soul Dismantle Black Flash shatters shields!
          }
          target.armorShredTimer = Math.max(target.armorShredTimer, 2.0);
          const comboMult = 1 + data.comboCount * 0.14;

          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, (isFinal ? 7.2 : 3.2) * comboMult),
            ux * (isFinal ? 540 : 180),
            uy * (isFinal ? 540 : 180),
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.spawnFloatingText(
            target.x,
            target.y - target.radius - 16,
            `BLACK FLASH x${data.comboCount}!`,
            isFinal ? '#fde047' : '#fb7185',
            'crit',
          );
          ctx.spawnParticles(target.x, target.y, 14, '#09090b', 90, 310, 3, 6.5, 'star');
          ctx.spawnParticles(target.x, target.y, 10, '#ef4444', 90, 310, 2.5, 5.5, 'spark');
          ctx.addScreenShake(isFinal ? 18 : 9);
          ctx.emitSfx({ type: 'crit', intensity: isFinal ? 1.45 : 1.1 });
        }
      }
    }
  },
};
