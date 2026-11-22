import { applyFighterStun } from '../domains';
import type { UltimateHandler } from './types';

export interface OraImpact {
  x: number;
  y: number;
  angle: number;
  life: number;
}

export interface JotaroUltimateData {
  stage: 'time-stopped' | 'resumed';
  timeStopLeft: number;
  punchesLeft: number;
  punchCd: number;
  impacts: OraImpact[];
  pendingKnockTargetUid: string | null;
  pendingKnockX: number;
  pendingKnockY: number;
}

export const jotaroUltimateHandler: UltimateHandler = {
  characterId: 'jotaro',
  title: 'STAR PLATINUM: THE WORLD — ORA ORA BARRAGE!',
  subtitle:
    'Localized time stop (1.9s) freezes enemies & halts all projectiles in range → Unleashes a rapid 6-hit ORA ORA ORA barrage → Impact force erupts when time resumes!',
  bannerColor: '#8b5cf6',
  castDuration: 0.24,
  duration: 3.7,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.7);
    const enemies = ctx.getEnemies(owner);

    for (const e of enemies) {
      if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 380) {
        applyFighterStun(ctx, owner, e, 1.95, 'time-stop', 'THE WORLD!');
      }
    }

    for (const p of ctx.projectiles) {
      if (p.ownerUid === owner.uid) continue;
      if (owner.teamId !== null && p.teamId === owner.teamId) continue;
      if (Math.hypot(p.x - owner.x, p.y - owner.y) <= 380) {
        p.frozenTimer = Math.max(p.frozenTimer ?? 0, 1.95);
      }
    }

    const focus = ctx.getNearestEnemy(owner);
    const data: JotaroUltimateData = {
      stage: 'time-stopped',
      timeStopLeft: 1.9,
      punchesLeft: 6,
      punchCd: 0.14,
      impacts: [],
      pendingKnockTargetUid: focus ? focus.uid : null,
      pendingKnockX: 0,
      pendingKnockY: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#8b5cf6', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      210,
      '#a78bfa',
      7,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'STAR PLATINUM: THE WORLD!!',
      '#ddd6fe',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.addHitstop(0.055);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as JotaroUltimateData;
    const enemies = ctx.getEnemies(owner);
    const { left, right, top, bottom } = ctx.bounds;

    for (let i = data.impacts.length - 1; i >= 0; i--) {
      data.impacts[i].life -= dt;
      if (data.impacts[i].life <= 0) data.impacts.splice(i, 1);
    }

    if (data.stage === 'time-stopped') {
      data.timeStopLeft -= dt;

      // Maintain localized projectile time freeze & deflect bullets caught near Star Platinum
      for (const p of ctx.projectiles) {
        if (p.ownerUid === owner.uid) continue;
        if (owner.teamId !== null && p.teamId === owner.teamId) continue;
        const d = Math.hypot(p.x - owner.x, p.y - owner.y);
        if (d <= 110) {
          p.ownerUid = owner.uid;
          p.teamId = owner.teamId;
          p.vx = -p.vx * 1.25;
          p.vy = -p.vy * 1.25;
          p.color = '#a78bfa';
          p.frozenTimer = Math.max(p.frozenTimer ?? 0, 0.2);
        } else if (d <= 380) {
          p.frozenTimer = Math.max(p.frozenTimer ?? 0, 0.15);
        }
      }

      if (data.punchesLeft > 0) {
        data.punchCd -= dt;
        if (data.punchCd <= 0) {
          data.punchCd = 0.25;
          data.punchesLeft--;

          const target =
            enemies.find((e) => e.uid === data.pendingKnockTargetUid && e.alive) ??
            ctx.getNearestEnemy(owner);
          if (target) {
            const dx = target.x - owner.x;
            const dy = target.y - owner.y;
            const dist = Math.max(1, Math.hypot(dx, dy));
            const ux = dx / dist;
            const uy = dy / dist;

            owner.x = Math.max(
              left + owner.radius + 8,
              Math.min(
                right - owner.radius - 8,
                target.x - ux * (owner.radius + target.radius + 8),
              ),
            );
            owner.y = Math.max(
              top + owner.radius + 8,
              Math.min(
                bottom - owner.radius - 8,
                target.y - uy * (owner.radius + target.radius + 8),
              ),
            );
            owner.facingAngle = Math.atan2(dy, dx);

            data.pendingKnockTargetUid = target.uid;
            data.pendingKnockX = ux * 560;
            data.pendingKnockY = uy * 560;
            data.impacts.push({ x: target.x, y: target.y, angle: owner.facingAngle, life: 0.36 });

            const isFinal = data.punchesLeft === 0;
            ctx.applyDamage(
              owner,
              target,
              ctx.getEffectiveDamage(owner, isFinal ? 7.4 : 3.8),
              0,
              0,
              {
                bypassInvuln: true,
                isCrit: isFinal,
                sourceKind: 'ability',
              },
            );
            ctx.spawnParticles(target.x, target.y, 10, '#c084fc', 55, 190, 2.5, 5.5, 'star');
            ctx.spawnFloatingText(
              target.x,
              target.y - target.radius - 14,
              isFinal ? 'ORA!!' : 'ORA!',
              '#ddd6fe',
              isFinal ? 'crit' : 'callout',
            );
            ctx.emitSfx({ type: 'hit', intensity: 1.15 });
          }
        }
      }

      if (data.timeStopLeft <= 0) {
        data.stage = 'resumed';
        const target = enemies.find((e) => e.uid === data.pendingKnockTargetUid && e.alive);
        if (target) {
          target.armorShredTimer = Math.max(target.armorShredTimer, 2.6);
          target.shieldTimer = 0;
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 6.0),
            data.pendingKnockX,
            data.pendingKnockY,
            {
              bypassInvuln: true,
              isCrit: true,
              sourceKind: 'ability',
            },
          );
          ctx.spawnShockwave(
            target.x,
            target.y,
            180,
            '#8b5cf6',
            6.5,
            owner.character.id,
            owner.character.series,
          );
        }
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 22,
          'TIME RESUMES!!',
          '#c4b5fd',
          'powerup',
        );
        ctx.addHitstop(0.065);
        ctx.addScreenShake(16);
        ctx.emitSfx({ type: 'ko', intensity: 1.2 });
      }
    }
  },
};
