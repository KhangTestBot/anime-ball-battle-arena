import { applyFighterBurn } from '../domains';
import type { UltimateHandler } from './types';

export interface ToadOilPool {
  x: number;
  y: number;
  radius: number;
  ignited: boolean;
  life: number;
}

export interface JiraiyaUltimateData {
  stage: 'toad-oil' | 'goemon-blaze' | 'cho-odama';
  pools: ToadOilPool[];
  burnTick: number;
  odamaStruck: boolean;
  odamaFlash: number;
  odamaX: number;
  odamaY: number;
}

export const jiraiyaUltimateHandler: UltimateHandler = {
  characterId: 'jiraiya',
  title: 'SAGE ART: BATH OF BOILING OIL & MASSIVE RASENGAN',
  subtitle:
    'Sage Mode summons 2 Toad Sages, coating the floor in slippery Toad Oil then igniting Goemon inferno → Slams down a colossal Massive Rasengan!',
  bannerColor: '#ef4444',
  castDuration: 0.25,
  duration: 4.1,

  onCast(ctx, owner, state) {
    owner.getExcitedTimer = Math.max(owner.getExcitedTimer, 3.0);
    const { left, right, top, bottom } = ctx.bounds;
    const pools: ToadOilPool[] = [];
    const target = ctx.getNearestEnemy(owner);

    // Scatter 3 slick Toad Oil puddles around the center & nearest enemy
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      const baseX = target && i === 0 ? target.x : (left + right) / 2 + Math.cos(a) * 90;
      const baseY = target && i === 0 ? target.y : (top + bottom) / 2 + Math.sin(a) * 90;
      pools.push({
        x: Math.max(left + 50, Math.min(right - 50, baseX)),
        y: Math.max(top + 50, Math.min(bottom - 50, baseY)),
        radius: 56,
        ignited: false,
        life: 3.4,
      });
    }

    const data: JiraiyaUltimateData = {
      stage: 'toad-oil',
      pools,
      burnTick: 0,
      odamaStruck: false,
      odamaFlash: 0,
      odamaX: owner.x,
      odamaY: owner.y,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ef4444', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      185,
      '#f97316',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'SAGE MODE: TOAD OIL!',
      '#fdba74',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 20, '#d97706', 70, 230, 3, 6, 'circle');
    ctx.addScreenShake(9);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as JiraiyaUltimateData;
    const enemies = ctx.getEnemies(owner);
    const { left, right, top, bottom } = ctx.bounds;

    if (data.odamaFlash > 0) {
      data.odamaFlash = Math.max(0, data.odamaFlash - dt);
    }

    for (let i = data.pools.length - 1; i >= 0; i--) {
      data.pools[i].life -= dt;
      if (data.pools[i].life <= 0) data.pools.splice(i, 1);
    }

    // Slow enemies stepping inside oil puddles; burn heavily once ignited by Goemon!
    for (const e of enemies) {
      for (const pool of data.pools) {
        if (Math.hypot(e.x - pool.x, e.y - pool.y) <= pool.radius + e.radius) {
          e.vx *= Math.pow(0.5, dt * 2.8);
          e.vy *= Math.pow(0.5, dt * 2.8);
          break;
        }
      }
    }

    // Stage 2 (1.05s): Ignite all Toad Oil Seas into Goemon Inferno + fire Oil Flame Bombs!
    if (data.stage === 'toad-oil' && state.elapsed >= 1.05) {
      data.stage = 'goemon-blaze';
      for (const pool of data.pools) {
        pool.ignited = true;
        ctx.spawnShockwave(
          pool.x,
          pool.y,
          95,
          '#f97316',
          5,
          owner.character.id,
          owner.character.series,
        );
      }
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 20,
        'SAGE ART: GOEMON INFERNO!',
        '#f97316',
        'powerup',
      );
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.25 });
    }

    if (data.stage === 'goemon-blaze' || data.stage === 'cho-odama') {
      data.burnTick += dt;
      if (data.burnTick >= 0.35) {
        data.burnTick -= 0.35;
        for (const e of enemies) {
          for (const pool of data.pools) {
            if (pool.ignited && Math.hypot(e.x - pool.x, e.y - pool.y) <= pool.radius + e.radius) {
              ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 3.2), 0, 0, {
                sourceKind: 'dot',
              });
              applyFighterBurn(e, owner.uid, 3.0, ctx.getEffectiveDamage(owner, 2.8));
              break;
            }
          }
        }
      }
    }

    // Stage 3 (2.4s): Slam CHŌ ŌDAMA RASENGAN!
    if (!data.odamaStruck && state.elapsed >= 2.4) {
      data.odamaStruck = true;
      data.stage = 'cho-odama';
      data.odamaFlash = 1.05;
      const target = ctx.getNearestEnemy(owner);
      const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
      if (target) {
        owner.x = Math.max(
          left + owner.radius + 8,
          Math.min(
            right - owner.radius - 8,
            target.x - Math.cos(ang) * (owner.radius + target.radius + 10),
          ),
        );
        owner.y = Math.max(
          top + owner.radius + 8,
          Math.min(
            bottom - owner.radius - 8,
            target.y - Math.sin(ang) * (owner.radius + target.radius + 10),
          ),
        );
      }
      data.odamaX = owner.x + Math.cos(ang) * 28;
      data.odamaY = owner.y + Math.sin(ang) * 28;

      ctx.addHitstop(0.08);
      ctx.addScreenShake(20);
      ctx.spawnShockwave(
        data.odamaX,
        data.odamaY,
        215,
        '#38bdf8',
        7.5,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 22,
        'ULTRA-BIG BALL RASENGAN!!',
        '#7dd3fc',
        'powerup',
      );
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });

      for (const e of enemies) {
        const dx = e.x - data.odamaX;
        const dy = e.y - data.odamaY;
        const dist = Math.hypot(dx, dy);
        if (dist <= 165 + e.radius) {
          const d = Math.max(1, dist);
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 16.5),
            (dx / d) * 560,
            (dy / d) * 560,
            {
              isCrit: true,
              sourceKind: 'ability',
            },
          );
          ctx.spawnParticles(e.x, e.y, 18, '#38bdf8', 90, 320, 3, 6.5, 'star');
        }
      }
    }
  },
};
