import { applyFighterStun } from '../domains';
import type { UltimateHandler } from './types';

export interface TsukuyomiCrow {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

export interface ItachiUltimateData {
  stage: 'tsukuyomi-crows' | 'totsuka-yata';
  crows: TsukuyomiCrow[];
  totsukaStruck: boolean;
  totsukaFlash: number;
  slashX1: number;
  slashY1: number;
  slashX2: number;
  slashY2: number;
}

export const itachiUltimateHandler: UltimateHandler = {
  characterId: 'itachi',
  title: 'TSUKUYOMI 72H & SUSANOO TOTSUKA BLADE',
  subtitle:
    'Crimson Moon slows & scrambles foes · Crow Flock blocks projectiles · Yata Mirror reflects attacks & Totsuka Blade seals targets!',
  bannerColor: '#dc2626',
  castDuration: 0.25,
  duration: 4.2,

  onCast(ctx, owner, state) {
    const enemies = ctx.getEnemies(owner);
    const crows: TsukuyomiCrow[] = [];

    // Summon 6 Tsukuyomi Crow illusions swarming outward toward enemies!
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI * 2) / 6;
      crows.push({
        x: owner.x + Math.cos(a) * (owner.radius + 14),
        y: owner.y + Math.sin(a) * (owner.radius + 14),
        vx: Math.cos(a) * 320,
        vy: Math.sin(a) * 320,
        life: 1.9,
      });
    }

    for (const e of enemies) {
      e.confusedTimer = Math.max(e.confusedTimer, 1.8);
    }

    const data: ItachiUltimateData = {
      stage: 'tsukuyomi-crows',
      crows,
      totsukaStruck: false,
      totsukaFlash: 0,
      slashX1: owner.x,
      slashY1: owner.y,
      slashX2: owner.x,
      slashY2: owner.y,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ef4444', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'TSUKUYOMI!!',
      '#ef4444',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 20, '#09090b', 70, 240, 3, 6, 'shard');
    ctx.addScreenShake(9);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ItachiUltimateData;
    const enemies = ctx.getEnemies(owner);

    // 1. Time dilation inside Red-Moon Tsukuyomi + Crows intercepting enemy projectiles!
    if (data.stage === 'tsukuyomi-crows') {
      for (const e of enemies) {
        e.vx *= Math.pow(0.45, dt * 2.8);
        e.vy *= Math.pow(0.45, dt * 2.8);
      }
      for (let i = data.crows.length - 1; i >= 0; i--) {
        const c = data.crows[i];
        c.life -= dt;
        const target = enemies[i % Math.max(1, enemies.length)];
        if (target) {
          const dx = target.x - c.x;
          const dy = target.y - c.y;
          const d = Math.max(1, Math.hypot(dx, dy));
          c.vx += (dx / d) * 650 * dt;
          c.vy += (dy / d) * 650 * dt;
        }
        c.x += c.vx * dt;
        c.y += c.vy * dt;

        // Crows shatter incoming projectiles & disperse into feathers!
        for (let pIdx = ctx.projectiles.length - 1; pIdx >= 0; pIdx--) {
          const p = ctx.projectiles[pIdx];
          if (p.ownerUid !== owner.uid && Math.hypot(p.x - c.x, p.y - c.y) <= p.radius + 16) {
            ctx.spawnParticles(c.x, c.y, 7, '#09090b', 60, 170, 2.5, 5, 'shard');
            ctx.projectiles.splice(pIdx, 1);
            c.life = 0;
            break;
          }
        }
        if (c.life <= 0) data.crows.splice(i, 1);
      }

      if (state.elapsed >= 1.75) {
        data.stage = 'totsuka-yata';
        const nearest = ctx.getNearestEnemy(owner);
        if (nearest) {
          const dx = nearest.x - owner.x;
          const dy = nearest.y - owner.y;
          const d = Math.max(1, Math.hypot(dx, dy));
          owner.facingAngle = Math.atan2(dy, dx);
          owner.vx = (dx / d) * 260;
          owner.vy = (dy / d) * 260;
        }
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 18,
          'YATA MIRROR · TOTSUKA!',
          '#f97316',
          'powerup',
        );
      }
    } else {
      // 2. Crimson Armored Susanoo Phase: Yata Mirror reflects frontal projectiles!
      for (const p of ctx.projectiles) {
        if (p.ownerUid === owner.uid) continue;
        if (owner.teamId !== null && p.teamId === owner.teamId) continue;
        if (Math.hypot(p.x - owner.x, p.y - owner.y) <= owner.radius + 42) {
          p.ownerUid = owner.uid;
          p.teamId = owner.teamId;
          p.vx = -p.vx * 1.4;
          p.vy = -p.vy * 1.4;
          p.color = '#f97316';
          ctx.spawnFloatingText(
            owner.x,
            owner.y - owner.radius - 14,
            'YATA REFLECT!',
            '#f97316',
            'callout',
          );
        }
      }

      // Sweep Ethereal Totsuka Gourd Sword -> seals target inside gourd (1.2s Genjutsu + soul seal damage!)
      if (!data.totsukaStruck && state.elapsed >= 2.25) {
        data.totsukaStruck = true;
        data.totsukaFlash = 0.9;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        data.slashX1 = owner.x;
        data.slashY1 = owner.y;
        data.slashX2 = owner.x + Math.cos(ang) * 280;
        data.slashY2 = owner.y + Math.sin(ang) * 280;

        ctx.addHitstop(0.065);
        ctx.addScreenShake(15);
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          240,
          '#f97316',
          7,
          owner.character.id,
          owner.character.series,
        );
        ctx.emitSfx({ type: 'slash', intensity: 1.3 });

        for (const e of enemies) {
          if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 245 + e.radius) {
            applyFighterStun(ctx, owner, e, 1.2, 'genjutsu', 'TOTSUKA SEALED!!');
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 15.5), 0, 0, {
              isCrit: true,
              sourceKind: 'ability',
            });
            e.burnTimer = Math.max(e.burnTimer, 3.0);
            e.burnDps = Math.max(e.burnDps, ctx.getEffectiveDamage(owner, 2.2));
            e.burnOwnerUid = owner.uid;
          }
        }
      }

      if (data.totsukaFlash > 0) data.totsukaFlash = Math.max(0, data.totsukaFlash - dt);
    }
  },
};
