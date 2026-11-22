import type { UltimateHandler } from './types';

export interface TacticalClone {
  id: string;
  role: 'flank' | 'kite';
  x: number;
  y: number;
  vx: number;
  vy: number;
  alive: boolean;
  poofTimer: number;
}

export interface RasenshurikenDome {
  phase: 'flying' | 'expanding-dome' | 'done';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  spin: number;
  domeTimer: number;
  tickCd: number;
}

export interface NarutoUltimateData {
  clones: TacticalClone[];
  shuriken: RasenshurikenDome;
}

export const narutoUltimateHandler: UltimateHandler = {
  characterId: 'naruto',
  title: 'KURAMA AVATAR & MULTI-SHADOW CLONE RASENSHURIKEN',
  subtitle:
    'Nine-Tails Avatar + 4 AI Shadow Clones swarm & detonate stun smoke · Rasenshuriken Wind Dome shreds 30% Armor!',
  bannerColor: '#fb923c',
  castDuration: 0.25,
  duration: 4.5,

  onCast(ctx, owner, state) {
    const target = ctx.getNearestEnemy(owner);
    const angle = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
    owner.facingAngle = angle;

    // 4 Tactical Shadow Clones: 2 flankers intercepting ahead + 2 kiters circling!
    const clones: TacticalClone[] = [0, 1, 2, 3].map((idx) => {
      const a = angle + ((idx - 1.5) * Math.PI) / 2.2;
      return {
        id: ctx.nextId(`kage_${idx}`),
        role: idx < 2 ? 'flank' : 'kite',
        x: Math.max(
          ctx.bounds.left + 26,
          Math.min(ctx.bounds.right - 26, owner.x + Math.cos(a) * 58),
        ),
        y: Math.max(
          ctx.bounds.top + 26,
          Math.min(ctx.bounds.bottom - 26, owner.y + Math.sin(a) * 58),
        ),
        vx: Math.cos(a) * 280,
        vy: Math.sin(a) * 280,
        alive: true,
        poofTimer: 0,
      };
    });

    const data: NarutoUltimateData = {
      clones,
      shuriken: {
        phase: 'flying',
        x: owner.x + Math.cos(angle) * (owner.radius + 16),
        y: owner.y + Math.sin(angle) * (owner.radius + 16),
        vx: Math.cos(angle) * 520,
        vy: Math.sin(angle) * 520,
        radius: 26,
        spin: 0,
        domeTimer: 2.2,
        tickCd: 0.16,
      },
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, angle, '#fb923c', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'KURAMA · RASENSHURIKEN!',
      '#fb923c',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 22, '#fb923c', 70, 260, 3, 6, 'circle');
    ctx.addScreenShake(9);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as NarutoUltimateData;
    const { left, right, top, bottom } = ctx.bounds;
    const enemies = ctx.getEnemies(owner);
    const primary = ctx.getNearestEnemy(owner);

    // 1. Update 4 Tactical Shadow Clones (flank intercept vs kite surround -> POOF smoke micro-stun!)
    for (const c of data.clones) {
      if (!c.alive) {
        if (c.poofTimer > 0) c.poofTimer = Math.max(0, c.poofTimer - dt);
        continue;
      }

      if (primary) {
        const goalX =
          c.role === 'flank'
            ? primary.x + primary.vx * 0.25
            : primary.x + Math.cos(state.elapsed * 3) * 85;
        const goalY =
          c.role === 'flank'
            ? primary.y + primary.vy * 0.25
            : primary.y + Math.sin(state.elapsed * 3) * 85;
        const dx = goalX - c.x;
        const dy = goalY - c.y;
        const d = Math.max(1, Math.hypot(dx, dy));
        c.vx += (dx / d) * 880 * dt;
        c.vy += (dy / d) * 880 * dt;
        const spd = Math.hypot(c.vx, c.vy);
        if (spd > 380) {
          c.vx = (c.vx / spd) * 380;
          c.vy = (c.vy / spd) * 380;
        }
      }

      c.x = Math.max(left + 18, Math.min(right - 18, c.x + c.vx * dt));
      c.y = Math.max(top + 18, Math.min(bottom - 18, c.y + c.vy * dt));

      for (const e of enemies) {
        if (Math.hypot(e.x - c.x, e.y - c.y) <= e.radius + 18) {
          c.alive = false;
          c.poofTimer = 0.45;
          e.savedVx = e.vx;
          e.savedVy = e.vy;
          e.stunTimer = Math.max(e.stunTimer, 0.3);
          e.stunKind = 'void-overload';
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 4.8), 0, 0, {
            sourceKind: 'ability',
          });
          ctx.spawnParticles(c.x, c.y, 14, '#f8fafc', 50, 180, 4, 8, 'circle');
          ctx.spawnFloatingText(c.x, c.y - 16, 'POOF!', '#f8fafc', 'callout');
          ctx.emitSfx({ type: 'hit', intensity: 0.85 });
          break;
        }
      }
    }

    // 2. Giant Rasenshuriken -> expands into anchored 2.2s Cellular Wind Dome shredding armor!
    const sh = data.shuriken;
    sh.spin += dt * 26;

    if (sh.phase === 'flying') {
      sh.x += sh.vx * dt;
      sh.y += sh.vy * dt;

      let expand = false;
      for (const e of enemies) {
        if (Math.hypot(e.x - sh.x, e.y - sh.y) <= e.radius + sh.radius) {
          expand = true;
          break;
        }
      }
      if (
        !expand &&
        (sh.x <= left + 40 || sh.x >= right - 40 || sh.y <= top + 40 || sh.y >= bottom - 40)
      ) {
        expand = true;
      }

      if (expand) {
        sh.phase = 'expanding-dome';
        sh.x = Math.max(left + 85, Math.min(right - 85, sh.x));
        sh.y = Math.max(top + 85, Math.min(bottom - 85, sh.y));
        sh.radius = 126;
        sh.domeTimer = 2.2;
        sh.tickCd = 0.05;
        ctx.addScreenShake(12);
        ctx.spawnShockwave(
          sh.x,
          sh.y,
          sh.radius + 35,
          '#bae6fd',
          7,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(
          sh.x,
          sh.y - sh.radius * 0.6,
          'WIND DOME · CHAKRA CUT!',
          '#7dd3fc',
          'powerup',
        );
        ctx.emitSfx({ type: 'crit', intensity: 1.2 });
      }
    } else if (sh.phase === 'expanding-dome') {
      sh.domeTimer -= dt;
      sh.tickCd -= dt;
      const doTick = sh.tickCd <= 0;
      if (doTick) sh.tickCd = 0.24;

      for (const e of enemies) {
        const dx = sh.x - e.x;
        const dy = sh.y - e.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= sh.radius + e.radius) {
          // Gentle vortex pull inward + armor shred + micro wind-needle ticks
          if (dist > 6) {
            e.vx += (dx / dist) * 290 * dt;
            e.vy += (dy / dist) * 290 * dt;
          }
          if (doTick) {
            e.armorShredTimer = Math.max(e.armorShredTimer, 3.0);
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 3.8), 0, 0, {
              sourceKind: 'ability',
            });
            ctx.spawnParticles(e.x, e.y, 6, '#e0f2fe', 70, 210, 2, 4.5, 'shard');
          }
        }
      }

      if (sh.domeTimer <= 0) {
        sh.phase = 'done';
      }
    }
  },
};
