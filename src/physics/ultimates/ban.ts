import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface BanStealOrb {
  x: number;
  y: number;
  life: number;
}

export interface BanUltimateData {
  appliedBonusPct: number;
  whipAngle: number;
  whipCount: number;
  whipCd: number;
  regenTick: number;
  stealOrbs: BanStealOrb[];
}

export const banUltimateHandler: UltimateHandler = {
  characterId: 'ban',
  title: 'SNATCH: PHYSICAL HUNT & COURECHOUSE',
  subtitle:
    '3.6s Immortality + Fountain of Youth regen → Physical Hunt steals up to +24% DMG & shreds enemy armor before unleashing ultra-long-range 4-section Sacred Staff Courechouse strikes!',
  bannerColor: '#ef4444',
  castDuration: 0.24,
  duration: 3.7,

  onCast(ctx, owner, state) {
    owner.immortalTimer = Math.max(owner.immortalTimer, 3.6);
    const enemies = ctx.getEnemies(owner);
    const stealOrbs: BanStealOrb[] = [];
    let stolenStacks = 0;

    // Physical Hunt (SNATCH): Steal up to +24% attack bonus from nearby foes & shred their armor!
    for (const e of enemies) {
      if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 280) {
        e.armorShredTimer = Math.max(e.armorShredTimer, 2.8);
        e.dmgBonusPct = Math.max(0, e.dmgBonusPct - 8);
        if (stolenStacks < 3) {
          stolenStacks++;
        }
        stealOrbs.push({ x: e.x, y: e.y, life: 0.7 });
        ctx.spawnFloatingText(e.x, e.y - e.radius - 14, 'SNATCHED!', '#fca5a5', 'callout');
      }
    }

    const appliedBonusPct = stolenStacks * 8;
    owner.dmgBonusPct += appliedBonusPct;

    const data: BanUltimateData = {
      appliedBonusPct,
      whipAngle: owner.facingAngle,
      whipCount: 3,
      whipCd: 0.3,
      regenTick: 0,
      stealOrbs,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ef4444', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      200,
      '#ef4444',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      appliedBonusPct > 0 ? `PHYSICAL HUNT +${appliedBonusPct}%!` : 'FOUNTAIN IMMORTAL!',
      '#fca5a5',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 22, '#ef4444', 80, 260, 3, 6, 'star');
    ctx.addScreenShake(10);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as BanUltimateData;
    const enemies = ctx.getEnemies(owner);
    data.whipAngle += dt * 11;

    // Pull glowing stolen-power orbs toward Ban!
    for (let i = data.stealOrbs.length - 1; i >= 0; i--) {
      const orb = data.stealOrbs[i];
      orb.life -= dt;
      orb.x += (owner.x - orb.x) * Math.min(1, dt * 8);
      orb.y += (owner.y - orb.y) * Math.min(1, dt * 8);
      if (orb.life <= 0) data.stealOrbs.splice(i, 1);
    }

    // Immortal Fountain continuous HP regeneration respecting anti-heal multipliers!
    data.regenTick += dt;
    if (data.regenTick >= 0.5) {
      data.regenTick -= 0.5;
      const healAmt = owner.maxHp * 0.04 * getHealMultiplier(owner);
      if (healAmt > 0.1) {
        owner.hp = Math.min(owner.maxHp, owner.hp + healAmt);
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 12,
          `+${Math.round(healAmt)}`,
          '#4ade80',
          'heal',
        );
      }
    }

    // Sacred Treasure Courechouse Assault Hunt multi-segment whips!
    if (data.whipCount > 0) {
      data.whipCd -= dt;
      if (data.whipCd <= 0) {
        data.whipCd = 0.85;
        data.whipCount--;
        const isFinal = data.whipCount === 0;

        ctx.addScreenShake(isFinal ? 15 : 8);
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          195,
          '#f87171',
          5.5,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 18,
          isFinal ? 'ASSAULT HUNT!!' : 'COURECHOUSE WHIP!',
          '#fecaca',
          isFinal ? 'crit' : 'callout',
        );
        ctx.emitSfx({ type: 'slash', intensity: isFinal ? 1.3 : 1.0 });

        for (const e of enemies) {
          const dx = e.x - owner.x;
          const dy = e.y - owner.y;
          const dist = Math.hypot(dx, dy);
          if (dist <= 190 + e.radius) {
            const d = Math.max(1, dist);
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, isFinal ? 12.0 : 6.0),
              (dx / d) * 340,
              (dy / d) * 340,
              { isCrit: isFinal, sourceKind: 'ability' },
            );
            ctx.spawnParticles(e.x, e.y, 12, '#ef4444', 70, 230, 2.5, 5, 'shard');
          }
        }
      }
    }
  },

  onExpire(_ctx, owner, state) {
    if (owner) {
      const data = state.data as unknown as BanUltimateData;
      owner.dmgBonusPct = Math.max(0, owner.dmgBonusPct - (data.appliedBonusPct ?? 0));
    }
  },
};
