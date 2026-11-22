import { applyFighterStun } from '../domains';
import type { UltimateHandler } from './types';

export interface FrozenKnife {
  x: number;
  y: number;
  angle: number;
  released: boolean;
  vx: number;
  vy: number;
  life: number;
}

export interface DioUltimateData {
  stage: 'time-stopped' | 'roller-drop';
  timeStopLeft: number;
  knives: FrozenKnife[];
  rollerX: number;
  rollerY: number;
  rollerFall: number; // 0 (sky) -> 1 (CRUSHED!)
  rollerSlammed: boolean;
  flashTimer: number;
}

export const dioUltimateHandler: UltimateHandler = {
  characterId: 'dio',
  title: 'ZA WARUDO · TOKI WO TOMARE & ROADA ROLLA!',
  subtitle:
    'Freezes time for all enemies & mid-air projectiles · Surrounds targets with hovering Knives → Crushes them with ROADA ROLLA DA as time resumes!',
  bannerColor: '#facc15',
  castDuration: 0.25,
  duration: 4.1,

  onCast(ctx, owner, state) {
    const enemies = ctx.getEnemies(owner);
    const knives: FrozenKnife[] = [];

    // 1. Freeze ALL enemy fighters & mid-air projectiles authentically!
    for (const e of enemies) {
      applyFighterStun(ctx, owner, e, 2.35, 'time-stop', 'TOKI WO TOMARE!');
      for (let k = 0; k < 4; k++) {
        const ang = (k * Math.PI) / 2 + 0.4;
        const kx = Math.max(
          ctx.bounds.left + 18,
          Math.min(ctx.bounds.right - 18, e.x + Math.cos(ang) * 76),
        );
        const ky = Math.max(
          ctx.bounds.top + 18,
          Math.min(ctx.bounds.bottom - 18, e.y + Math.sin(ang) * 76),
        );
        knives.push({
          x: kx,
          y: ky,
          angle: Math.atan2(e.y - ky, e.x - kx),
          released: false,
          vx: 0,
          vy: 0,
          life: 1.5,
        });
      }
    }

    for (const p of ctx.projectiles) {
      if (p.ownerUid === owner.uid) continue;
      if (owner.teamId !== null && p.teamId === owner.teamId) continue;
      p.frozenTimer = 2.35;
    }

    const focus = enemies[0] ?? owner;
    const data: DioUltimateData = {
      stage: 'time-stopped',
      timeStopLeft: 2.25,
      knives,
      rollerX: Math.max(ctx.bounds.left + 75, Math.min(ctx.bounds.right - 75, focus.x)),
      rollerY: Math.max(ctx.bounds.top + 75, Math.min(ctx.bounds.bottom - 75, focus.y)),
      rollerFall: 0,
      rollerSlammed: false,
      flashTimer: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#facc15', 'ULT', true);
    ctx.spawnFloatingText(
      (ctx.bounds.left + ctx.bounds.right) / 2,
      ctx.bounds.top + 64,
      'ZA WARUDO! TOKI WO TOMARE!',
      '#facc15',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.addHitstop(0.055);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as DioUltimateData;
    const enemies = ctx.getEnemies(owner);

    // Keep projectiles frozen while Time Stop is active
    if (data.stage === 'time-stopped') {
      for (const p of ctx.projectiles) {
        if (p.ownerUid === owner.uid) continue;
        if (owner.teamId !== null && p.teamId === owner.teamId) continue;
        p.frozenTimer = Math.max(p.frozenTimer ?? 0, 0.15);
      }

      data.timeStopLeft -= dt;
      // Track main enemy gently for Road Roller sky shadow during last 0.8s
      if (enemies[0] && data.timeStopLeft > 0.45) {
        data.rollerX += (enemies[0].x - data.rollerX) * Math.min(1, dt * 2.5);
        data.rollerY += (enemies[0].y - data.rollerY) * Math.min(1, dt * 2.5);
      }

      if (data.timeStopLeft <= 0) {
        data.stage = 'roller-drop';
        // Launch ALL frozen knives simultaneously as TIME RESUMES!
        for (const kn of data.knives) {
          kn.released = true;
          kn.vx = Math.cos(kn.angle) * 720;
          kn.vy = Math.sin(kn.angle) * 720;
        }
        ctx.spawnFloatingText(
          (ctx.bounds.left + ctx.bounds.right) / 2,
          ctx.bounds.top + 64,
          'TIME RESUMES · ROADA ROLLA DA!!',
          '#facc15',
          'powerup',
        );
        ctx.emitSfx({ type: 'slash', intensity: 1.2 });
      }
      return;
    }

    // 2. Time Resumes -> Knives fly + Steamroller crashes onto the arena floor!
    for (let i = data.knives.length - 1; i >= 0; i--) {
      const kn = data.knives[i];
      kn.life -= dt;
      kn.x += kn.vx * dt;
      kn.y += kn.vy * dt;
      let hit = false;
      for (const e of enemies) {
        if (Math.hypot(e.x - kn.x, e.y - kn.y) <= e.radius + 10) {
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 3.2),
            kn.vx * 0.12,
            kn.vy * 0.12,
            {
              bypassInvuln: true,
              sourceKind: 'ability',
            },
          );
          ctx.spawnParticles(kn.x, kn.y, 5, '#fef08a', 50, 140, 2, 4, 'shard');
          hit = true;
          break;
        }
      }
      if (hit || kn.life <= 0) data.knives.splice(i, 1);
    }

    if (!data.rollerSlammed) {
      data.rollerFall = Math.min(1, data.rollerFall + dt * 3.1);
      if (data.rollerFall >= 1) {
        data.rollerSlammed = true;
        data.flashTimer = 0.8;
        ctx.addHitstop(0.08);
        ctx.addScreenShake(18);
        ctx.spawnShockwave(
          data.rollerX,
          data.rollerY,
          195,
          '#facc15',
          8,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(data.rollerX, data.rollerY - 26, 'WRYYYYYY!!', '#facc15', 'powerup');
        ctx.emitSfx({ type: 'ko', intensity: 1.3 });

        for (const e of enemies) {
          const dx = e.x - data.rollerX;
          const dy = e.y - data.rollerY;
          const d = Math.hypot(dx, dy);
          if (d <= 155 + e.radius) {
            const nx = d > 0.1 ? dx / d : 1;
            const ny = d > 0.1 ? dy / d : 0;
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 15.5), nx * 580, ny * 580, {
              isCrit: true,
              bypassInvuln: true,
              sourceKind: 'ability',
            });
          }
        }
      }
    } else if (data.flashTimer > 0) {
      data.flashTimer = Math.max(0, data.flashTimer - dt);
    }
  },
};
