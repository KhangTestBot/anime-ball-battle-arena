import type { UltimateHandler } from './types';

export interface NanamiUltimateData {
  targetUid: string | null;
  slashesLeft: number;
  slashCd: number;
  collapsed: boolean;
  collapseFlash: number;
}

export const nanamiUltimateHandler: UltimateHandler = {
  characterId: 'nanami',
  title: 'RATIO TECHNIQUE: 7:3 COLLAPSE (OVERTIME!)',
  subtitle:
    'Enters Overtime (Unstoppable + Haste) · Locks 7:3 Weakpoints for guaranteed Crits shattering all shields → Triggers Collapse ground quake!',
  bannerColor: '#eab308',
  castDuration: 0.24,
  duration: 3.7,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.8);
    owner.getExcitedTimer = Math.max(owner.getExcitedTimer, 3.3);
    const target = ctx.getNearestEnemy(owner);

    const data: NanamiUltimateData = {
      targetUid: target ? target.uid : null,
      slashesLeft: 3,
      slashCd: 0.25,
      collapsed: false,
      collapseFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#eab308', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      185,
      '#facc15',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      "IT'S OVERTIME! RATIO 7:3!",
      '#fde047',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 20, '#eab308', 80, 250, 3, 6, 'shard');
    ctx.addScreenShake(10);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as NanamiUltimateData;
    const enemies = ctx.getEnemies(owner);
    const { left, right, top, bottom } = ctx.bounds;

    if (data.collapseFlash > 0) data.collapseFlash = Math.max(0, data.collapseFlash - dt);

    // 3 Guaranteed 7:3 Ratio Critical Cleaves breaking shield reduction & shredding armor!
    if (data.slashesLeft > 0) {
      data.slashCd -= dt;
      if (data.slashCd <= 0) {
        data.slashCd = 0.56;
        data.slashesLeft--;
        const target =
          enemies.find((e) => e.uid === data.targetUid && e.alive) ?? ctx.getNearestEnemy(owner);
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
          target.shieldTimer = 0;
          target.armorShredTimer = Math.max(target.armorShredTimer, 2.5);
          ctx.applyDamage(owner, target, ctx.getEffectiveDamage(owner, 6.5), ux * 160, uy * 160, {
            isCrit: true,
            sourceKind: 'ability',
          });
          ctx.spawnFloatingText(
            target.x,
            target.y - target.radius - 16,
            '7:3 CRIT!',
            '#fef08a',
            'crit',
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.2 });
        }
      }
      return;
    }

    // Climax (2.3s): RATIO TECHNIQUE: COLLAPSE!! Shockwave shattering nearby obstacles & foes!
    if (!data.collapsed && state.elapsed >= 2.3) {
      data.collapsed = true;
      data.collapseFlash = 1.0;
      for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
        if (Math.hypot(ctx.obstacles[i].x - owner.x, ctx.obstacles[i].y - owner.y) <= 230) {
          ctx.obstacles.splice(i, 1);
        }
      }

      ctx.addHitstop(0.08);
      ctx.addScreenShake(20);
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        240,
        '#eab308',
        8,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 22,
        'RATIO: COLLAPSE!!',
        '#fef08a',
        'powerup',
      );
      ctx.emitSfx({ type: 'wall', intensity: 1.4 });

      for (const e of enemies) {
        const dx = e.x - owner.x;
        const dy = e.y - owner.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= 200 + e.radius) {
          const d = Math.max(1, dist);
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 14.5),
            (dx / d) * 520,
            (dy / d) * 520,
            {
              isCrit: true,
              sourceKind: 'ability',
            },
          );
          ctx.spawnParticles(e.x, e.y, 18, '#facc15', 90, 310, 3, 6.5, 'shard');
        }
      }
    }
  },
};
