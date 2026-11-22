import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface KirbyUltimateData {
  inhalesDone: number;
  inhaleCd: number;
  devouredProjectiles: number;
  starRodFired: boolean;
  flash: number;
}

export const kirbyUltimateHandler: UltimateHandler = {
  characterId: 'kirby',
  title: 'HYPERNOVA INHALE: STAR ROD SUPERNOVA!',
  subtitle:
    'Activates Hypernova Inhale pulling all enemies and devouring projectiles for healing, then blasts out a Warp Star & Star Rod Supernova!',
  bannerColor: '#f472b6',
  castDuration: 0.22,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.6);
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.2);
    owner.shieldColor = '#f472b6';

    const data: KirbyUltimateData = {
      inhalesDone: 0,
      inhaleCd: 0.34,
      devouredProjectiles: 0,
      starRodFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#f472b6', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'POYO!! HYPERNOVA INHALE!',
      '#f472b6',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as KirbyUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    // Hypernova Inhale devours nearby enemy projectiles and heals Kirby!
    for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
      const p = ctx.projectiles[i];
      if (p.ownerUid === owner.uid || (owner.teamId && p.teamId === owner.teamId)) continue;
      if (Math.hypot(p.x - owner.x, p.y - owner.y) <= 200) {
        ctx.projectiles.splice(i, 1);
        data.devouredProjectiles += 1;
        const heal = Math.round(owner.maxHp * 0.03 * getHealMultiplier(owner));
        if (heal > 0) owner.hp = Math.min(owner.maxHp, owner.hp + heal);
      }
    }

    if (!data.starRodFired && data.inhalesDone < 3) {
      data.inhaleCd -= dt;
      if (data.inhaleCd <= 0) {
        data.inhaleCd = 0.45;
        data.inhalesDone += 1;
        for (const e of ctx.getEnemies(owner)) {
          const dx = owner.x - e.x;
          const dy = owner.y - e.y;
          const dist = Math.max(1, Math.hypot(dx, dy));
          e.vx += (dx / dist) * 400;
          e.vy += (dy / dist) * 400;
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 7.8), 0, 0, {
            sourceKind: 'ability',
          });
        }
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          225,
          '#f472b6',
          7,
          owner.character.id,
          owner.character.series,
        );
        ctx.emitSfx({ type: 'powerup', intensity: 1.15 });
      }
    }

    if (!data.starRodFired && state.elapsed >= 2.05) {
      data.starRodFired = true;
      data.flash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 26.5),
          Math.cos(ang) * 650,
          Math.sin(ang) * 650,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        350,
        '#facc15',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'STAR ROD SUPERNOVA!!',
        '#facc15',
        'crit',
      );
      ctx.addScreenShake(20);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};
