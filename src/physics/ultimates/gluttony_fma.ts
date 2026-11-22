import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface GluttonyFmaUltimateData {
  devouredProjectiles: number;
  inhalesDone: number;
  inhaleCd: number;
  erasureFired: boolean;
  flash: number;
}

export const gluttonyFmaUltimateHandler: UltimateHandler = {
  characterId: 'gluttony_fma',
  title: 'FALSE GATE OF TRUTH: DEVOUR EVERYTHING!',
  subtitle:
    'Opens the False Gate ribcage pulling enemies and devouring projectiles for healing, then blasts False Gate Erasure!',
  bannerColor: '#dc2626',
  castDuration: 0.22,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.6);

    const data: GluttonyFmaUltimateData = {
      devouredProjectiles: 0,
      inhalesDone: 0,
      inhaleCd: 0.34,
      erasureFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#dc2626', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'CAN I EAT THEM?! FALSE GATE!',
      '#dc2626',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as GluttonyFmaUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    // False Gate devours incoming enemy projectiles and heals Gluttony!
    for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
      const p = ctx.projectiles[i];
      if (p.ownerUid === owner.uid || (owner.teamId && p.teamId === owner.teamId)) continue;
      if (Math.hypot(p.x - owner.x, p.y - owner.y) <= 210) {
        ctx.projectiles.splice(i, 1);
        data.devouredProjectiles += 1;
        const heal = Math.round(owner.maxHp * 0.03 * getHealMultiplier(owner));
        if (heal > 0) owner.hp = Math.min(owner.maxHp, owner.hp + heal);
      }
    }

    if (!data.erasureFired && data.inhalesDone < 3) {
      data.inhaleCd -= dt;
      if (data.inhaleCd <= 0) {
        data.inhaleCd = 0.44;
        data.inhalesDone += 1;
        for (const e of ctx.getEnemies(owner)) {
          const dx = owner.x - e.x;
          const dy = owner.y - e.y;
          const dist = Math.max(1, Math.hypot(dx, dy));
          e.vx += (dx / dist) * 380;
          e.vy += (dy / dist) * 380;
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 8.0), 0, 0, {
            sourceKind: 'ability',
          });
        }
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          225,
          '#dc2626',
          7,
          owner.character.id,
          owner.character.series,
        );
        ctx.emitSfx({ type: 'powerup', intensity: 1.15 });
      }
    }

    if (!data.erasureFired && state.elapsed >= 2.05) {
      data.erasureFired = true;
      data.flash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 26.0),
          Math.cos(ang) * 630,
          Math.sin(ang) * 630,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        340,
        '#a855f7',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'FALSE GATE ERASURE!!',
        '#dc2626',
        'crit',
      );
      ctx.addScreenShake(19);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};
