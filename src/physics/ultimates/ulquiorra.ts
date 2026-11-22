import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface UlquiorraUltimateData {
  stage: 'segunda-dash' | 'lanza-nuke' | 'aftermath';
  lanceX: number;
  lanceY: number;
  lanceVx: number;
  lanceVy: number;
  detonated: boolean;
  nukeX: number;
  nukeY: number;
  nukeFlash: number;
}

export const ulquiorraUltimateHandler: UltimateHandler = {
  characterId: 'ulquiorra',
  title: 'SEGUNDA ETAPA: LANZA DEL RELÁMPAGO',
  subtitle:
    'Segunda Etapa triggers High-Speed Regeneration (+7% HP) & evasion → Hurls the emerald Lightning Lance erupting in a colossal nuclear pillar shredding armor & erasing projectiles!',
  bannerColor: '#10b981',
  castDuration: 0.25,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.evadeTimer = Math.max(owner.evadeTimer, 1.3);
    const healAmt = owner.maxHp * 0.07 * getHealMultiplier(owner);
    if (healAmt > 0.5) {
      owner.hp = Math.min(owner.maxHp, owner.hp + healAmt);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 12,
        `+${Math.round(healAmt)} HOLLOW REGEN`,
        '#34d399',
        'heal',
      );
    }

    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;

    const data: UlquiorraUltimateData = {
      stage: 'segunda-dash',
      lanceX: owner.x + Math.cos(ang) * (owner.radius + 16),
      lanceY: owner.y + Math.sin(ang) * (owner.radius + 16),
      lanceVx: Math.cos(ang) * 760,
      lanceVy: Math.sin(ang) * 760,
      detonated: false,
      nukeX: target ? target.x : owner.x + Math.cos(ang) * 220,
      nukeY: target ? target.y : owner.y + Math.sin(ang) * 220,
      nukeFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, ang, '#10b981', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      195,
      '#34d399',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'SEGUNDA ETAPA!!',
      '#6ee7b7',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 22, '#09090b', 80, 260, 3, 6.5, 'star');
    ctx.addScreenShake(10);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as UlquiorraUltimateData;
    const enemies = ctx.getEnemies(owner);
    const { left, right, top, bottom } = ctx.bounds;

    if (data.nukeFlash > 0) data.nukeFlash = Math.max(0, data.nukeFlash - dt);

    if (data.stage === 'segunda-dash' && !data.detonated) {
      data.lanceX += data.lanceVx * dt;
      data.lanceY += data.lanceVy * dt;

      const hitEnemy = enemies.some(
        (e) => Math.hypot(e.x - data.lanceX, e.y - data.lanceY) <= e.radius + 32,
      );
      const hitWall =
        data.lanceX <= left + 20 ||
        data.lanceX >= right - 20 ||
        data.lanceY <= top + 20 ||
        data.lanceY >= bottom - 20;

      if (hitEnemy || hitWall || state.elapsed >= 1.65) {
        data.detonated = true;
        data.stage = 'lanza-nuke';
        data.nukeX = Math.max(left + 40, Math.min(right - 40, data.lanceX));
        data.nukeY = Math.max(top + 40, Math.min(bottom - 40, data.lanceY));
        data.nukeFlash = 1.35;

        // Erase projectiles inside nuclear Lanza blast radius!
        for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
          if (
            Math.hypot(ctx.projectiles[i].x - data.nukeX, ctx.projectiles[i].y - data.nukeY) <= 235
          ) {
            ctx.projectiles.splice(i, 1);
          }
        }

        ctx.addHitstop(0.085);
        ctx.addScreenShake(24);
        ctx.spawnShockwave(
          data.nukeX,
          data.nukeY,
          260,
          '#10b981',
          9,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(
          data.nukeX,
          data.nukeY - 26,
          'LANZA DEL RELÁMPAGO!!',
          '#6ee7b7',
          'powerup',
        );
        ctx.spawnParticles(data.nukeX, data.nukeY, 34, '#34d399', 110, 390, 3.5, 7.5, 'star');
        ctx.emitSfx({ type: 'ko', intensity: 1.45 });

        for (const e of enemies) {
          const dx = e.x - data.nukeX;
          const dy = e.y - data.nukeY;
          const dist = Math.hypot(dx, dy);
          if (dist <= 235 + e.radius) {
            e.armorShredTimer = Math.max(e.armorShredTimer, 2.8);
            const d = Math.max(1, dist);
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, 19.0),
              (dx / d) * 620,
              (dy / d) * 620,
              {
                isCrit: true,
                sourceKind: 'ability',
              },
            );
          }
        }
      }
      return;
    }

    if (data.stage === 'lanza-nuke' && data.nukeFlash <= 0) {
      data.stage = 'aftermath';
    }
  },
};
