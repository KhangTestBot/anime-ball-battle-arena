import { applyFighterBurn } from '../domains';
import type { UltimateHandler } from './types';

export interface AshSkeleton {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  hitCd: Record<string, number>;
}

export interface YamamotoUltimateData {
  vaporizedCount: number;
  skeletons: AshSkeleton[];
  burnCloakCd: Record<string, number>;
  tenchiFired: boolean;
  tenchiFlash: number;
  slashX1: number;
  slashY1: number;
  slashX2: number;
  slashY2: number;
}

export const yamamotoUltimateHandler: UltimateHandler = {
  characterId: 'yamamoto',
  title: 'BANKAI: ZANKA NO TACHI (15 MILLION DEGREES)',
  subtitle:
    'West (15-million-degree Sun Armor) melts enemy projectiles & scorches melee · South summons the Ash Skeleton Army · North Tenchi Kaijin cleaves with incandescent fire!',
  bannerColor: '#f97316',
  castDuration: 0.25,
  duration: 4.1,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.8);
    const skeletons: AshSkeleton[] = [];
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI * 2) / 4;
      skeletons.push({
        x: owner.x + Math.cos(a) * (owner.radius + 20),
        y: owner.y + Math.sin(a) * (owner.radius + 20),
        vx: Math.cos(a) * 240,
        vy: Math.sin(a) * 240,
        life: 2.3,
        hitCd: {},
      });
    }

    const data: YamamotoUltimateData = {
      vaporizedCount: 0,
      skeletons,
      burnCloakCd: {},
      tenchiFired: false,
      tenchiFlash: 0,
      slashX1: owner.x,
      slashY1: owner.y,
      slashX2: owner.x + 500,
      slashY2: owner.y,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#f97316', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      220,
      '#ea580c',
      7,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'ZANKA NO TACHI · 15,000,000°C!',
      '#fde047',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 26, '#f97316', 85, 290, 3, 6.5, 'circle');
    ctx.addScreenShake(12);
    ctx.addHitstop(0.055);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as YamamotoUltimateData;
    const enemies = ctx.getEnemies(owner);

    if (data.tenchiFlash > 0) {
      data.tenchiFlash = Math.max(0, data.tenchiFlash - dt);
    }

    for (const uid of Object.keys(data.burnCloakCd)) {
      data.burnCloakCd[uid] -= dt;
      if (data.burnCloakCd[uid] <= 0) delete data.burnCloakCd[uid];
    }

    // Zanjitsu Gokui (West): 15,000,000-degree Sun Cloak vaporizes ALL touching enemy projectiles!
    const solarR = owner.radius + 46;
    for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
      const p = ctx.projectiles[i];
      if (
        p.ownerUid !== owner.uid &&
        Math.hypot(p.x - owner.x, p.y - owner.y) <= solarR + p.radius
      ) {
        data.vaporizedCount++;
        ctx.spawnParticles(p.x, p.y, 7, '#fef08a', 55, 175, 2.5, 5, 'circle');
        ctx.projectiles.splice(i, 1);
      }
    }

    for (const e of enemies) {
      if (
        !data.burnCloakCd[e.uid] &&
        Math.hypot(e.x - owner.x, e.y - owner.y) <= solarR + e.radius
      ) {
        data.burnCloakCd[e.uid] = 0.4;
        ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 4.2), 0, 0, {
          sourceKind: 'ability',
        });
        applyFighterBurn(e, owner.uid, 3.2, ctx.getEffectiveDamage(owner, 2.6));
      }
    }

    // South (Kaka Jumanokushi Dai-sojin): Burnt Ash Skeletons chase & ignite foes
    for (let i = data.skeletons.length - 1; i >= 0; i--) {
      const sk = data.skeletons[i];
      sk.life -= dt;
      const target = enemies[i % Math.max(1, enemies.length)];
      if (target) {
        const dx = target.x - sk.x;
        const dy = target.y - sk.y;
        const d = Math.max(1, Math.hypot(dx, dy));
        sk.vx += (dx / d) * 520 * dt;
        sk.vy += (dy / d) * 520 * dt;
      }
      sk.x += sk.vx * dt;
      sk.y += sk.vy * dt;

      for (const uid of Object.keys(sk.hitCd)) {
        sk.hitCd[uid] -= dt;
        if (sk.hitCd[uid] <= 0) delete sk.hitCd[uid];
      }
      for (const e of enemies) {
        if (!sk.hitCd[e.uid] && Math.hypot(e.x - sk.x, e.y - sk.y) <= e.radius + 18) {
          sk.hitCd[e.uid] = 0.55;
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 2.8), 0, 0, {
            sourceKind: 'ability',
          });
          applyFighterBurn(e, owner.uid, 2.5, ctx.getEffectiveDamage(owner, 2.0));
        }
      }
      if (sk.life <= 0) data.skeletons.splice(i, 1);
    }

    // North (Tenchi Kaijin, 2.35s): Horizontal Solar Ash Incineration Slash!
    if (!data.tenchiFired && state.elapsed >= 2.35) {
      data.tenchiFired = true;
      data.tenchiFlash = 1.1;
      const target = ctx.getNearestEnemy(owner);
      const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
      data.slashX1 = owner.x;
      data.slashY1 = owner.y;
      data.slashX2 = owner.x + Math.cos(ang) * 680;
      data.slashY2 = owner.y + Math.sin(ang) * 680;

      ctx.addHitstop(0.08);
      ctx.addScreenShake(22);
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        260,
        '#fde047',
        8,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 22,
        'NORTH: TENCHI KAIJIN!!',
        '#fef08a',
        'powerup',
      );
      ctx.emitSfx({ type: 'slash', intensity: 1.45 });

      const dxL = Math.cos(ang);
      const dyL = Math.sin(ang);
      for (const e of enemies) {
        const rx = e.x - data.slashX1;
        const ry = e.y - data.slashY1;
        const along = rx * dxL + ry * dyL;
        const perp = Math.abs(-rx * dyL + ry * dxL);
        if (along >= -e.radius && perp <= e.radius + 54) {
          e.shieldTimer = 0;
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 17.5), dxL * 540, dyL * 540, {
            isCrit: true,
            sourceKind: 'ability',
          });
          applyFighterBurn(e, owner.uid, 4.0, ctx.getEffectiveDamage(owner, 3.2));
        }
      }
    }
  },
};
