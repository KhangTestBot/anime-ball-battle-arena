import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface RequiemSnapshot {
  uid: string;
  x: number;
  y: number;
}

export interface GiornoUltimateData {
  stage: 'requiem-zero' | 'muda-loop';
  snapshots: RequiemSnapshot[];
  returnedToZero: boolean;
  zeroCount: number;
  mudaLeft: number;
  mudaCd: number;
  zeroFlash: number;
}

export const giornoUltimateHandler: UltimateHandler = {
  characterId: 'giorno',
  title: 'GOLD EXPERIENCE REQUIEM: RETURN TO ZERO & MUDA LOOP',
  subtitle:
    'Heals +10% Max HP · Records positions & forces RETURN TO ZERO, rewinding foes back while erasing shields/projectiles → Unleashes a 5-hit Infinite MUDA Loop blocking healing!',
  bannerColor: '#facc15',
  castDuration: 0.25,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.evadeTimer = Math.max(owner.evadeTimer, 1.9);
    owner.immortalTimer = Math.max(owner.immortalTimer, 1.7);

    const healAmt = owner.maxHp * 0.1 * getHealMultiplier(owner);
    if (healAmt > 0.5) {
      owner.hp = Math.min(owner.maxHp, owner.hp + healAmt);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 14,
        `+${Math.round(healAmt)} LIFE GIVER`,
        '#fde047',
        'heal',
      );
    }

    const snapshots: RequiemSnapshot[] = ctx.getEnemies(owner).map((e) => ({
      uid: e.uid,
      x: e.x,
      y: e.y,
    }));

    const data: GiornoUltimateData = {
      stage: 'requiem-zero',
      snapshots,
      returnedToZero: false,
      zeroCount: 0,
      mudaLeft: 5,
      mudaCd: 0.26,
      zeroFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#facc15', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      195,
      '#fef08a',
      6.5,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'GOLD EXPERIENCE REQUIEM!',
      '#fef08a',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 20, '#facc15', 70, 230, 3, 6, 'star');
    ctx.addScreenShake(9);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as GiornoUltimateData;
    const enemies = ctx.getEnemies(owner);
    const { left, right, top, bottom } = ctx.bounds;

    if (data.zeroFlash > 0) data.zeroFlash = Math.max(0, data.zeroFlash - dt);

    // Nullify hostile projectiles reaching Giorno to ZERO!
    for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
      const p = ctx.projectiles[i];
      if (p.ownerUid === owner.uid) continue;
      if (owner.teamId !== null && p.teamId === owner.teamId) continue;
      if (Math.hypot(p.x - owner.x, p.y - owner.y) <= owner.radius + 54 + p.radius) {
        data.zeroCount++;
        ctx.spawnParticles(p.x, p.y, 7, '#fef08a', 40, 140, 2.5, 5, 'circle');
        ctx.spawnFloatingText(p.x, p.y - 12, 'ZERO!', '#fef08a', 'callout');
        ctx.projectiles.splice(i, 1);
      }
    }

    // 1. RETURN TO ZERO at 1.2s: forcibly rewind enemy positions & erase defensive buffs!
    if (!data.returnedToZero && state.elapsed >= 1.2) {
      data.returnedToZero = true;
      data.zeroFlash = 1.0;

      for (const e of enemies) {
        const snap = data.snapshots.find((s) => s.uid === e.uid);
        if (snap) {
          e.x = Math.max(left + e.radius + 8, Math.min(right - e.radius - 8, snap.x));
          e.y = Math.max(top + e.radius + 8, Math.min(bottom - e.radius - 8, snap.y));
        }
        e.shieldTimer = 0;
        e.getExcitedTimer = 0;
        e.armorShredTimer = Math.max(e.armorShredTimer, 2.6);
        e.antiHealTimer = Math.max(e.antiHealTimer, 3.0);
        ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 9.5 + data.zeroCount * 1.4), 0, 0, {
          isCrit: true,
          sourceKind: 'ability',
        });
        ctx.spawnShockwave(e.x, e.y, 105, '#facc15', 5, owner.character.id, owner.character.series);
      }

      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 20,
        'RETURN TO ZERO!!',
        '#fef08a',
        'powerup',
      );
      ctx.addHitstop(0.065);
      ctx.addScreenShake(15);
      ctx.emitSfx({ type: 'powerup', intensity: 1.25 });
      return;
    }

    // 2. MUDA DEATH LOOP after 1.75s: 5 consecutive infinite-loop punches!
    if (state.elapsed >= 1.75 && data.mudaLeft > 0) {
      data.stage = 'muda-loop';
      data.mudaCd -= dt;
      if (data.mudaCd <= 0) {
        data.mudaCd = 0.28;
        data.mudaLeft--;

        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const dx = target.x - owner.x;
          const dy = target.y - owner.y;
          const dist = Math.max(1, Math.hypot(dx, dy));
          const ux = dx / dist;
          const uy = dy / dist;

          owner.x = Math.max(
            left + owner.radius + 8,
            Math.min(right - owner.radius - 8, target.x - ux * (owner.radius + target.radius + 8)),
          );
          owner.y = Math.max(
            top + owner.radius + 8,
            Math.min(bottom - owner.radius - 8, target.y - uy * (owner.radius + target.radius + 8)),
          );
          owner.facingAngle = Math.atan2(dy, dx);

          const isFinal = data.mudaLeft === 0;
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, isFinal ? 8.2 : 4.2),
            isFinal ? ux * 420 : ux * 60,
            isFinal ? uy * 420 : uy * 60,
            {
              bypassInvuln: true,
              isCrit: isFinal,
              sourceKind: 'ability',
            },
          );
          ctx.spawnFloatingText(
            target.x,
            target.y - target.radius - 14,
            isFinal ? 'MUDA! TRUTH NEVER REACHED!' : 'MUDA!',
            '#fde047',
            isFinal ? 'crit' : 'callout',
          );
          ctx.emitSfx({ type: 'hit', intensity: 1.1 });
        }
      }
    }
  },
};
