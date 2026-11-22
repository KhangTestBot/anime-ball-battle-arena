import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface UraharaUltimateData {
  stitchedUids: string[];
  restitchTimer: number;
  slashFlash: number;
}

export const uraharaUltimateHandler: UltimateHandler = {
  characterId: 'urahara',
  title: 'BANKAI: KANNONBIRAKI BENIHIME ARATAME',
  subtitle:
    'Restructure: Stitches +12% Max HP back for himself & SLICES APART armor, shields & dodge of all nearby foes + Blood Mist Shield reflects projectiles!',
  bannerColor: '#22c55e',
  castDuration: 0.25,
  duration: 3.8,

  onCast(ctx, owner, state) {
    // 1. Kannonbiraki Benihime Aratame Restitch: Heals Kisuke + Unravels nearby enemy shields/armor/dodge!
    const healAmt = owner.maxHp * 0.12 * getHealMultiplier(owner);
    if (healAmt > 0.5) {
      owner.hp = Math.min(owner.maxHp, owner.hp + healAmt);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 14,
        `+${Math.round(healAmt)} RESTITCH!`,
        '#4ade80',
        'heal',
      );
    }

    const stitchedUids: string[] = [];
    for (const e of ctx.getEnemies(owner)) {
      if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 275) {
        stitchedUids.push(e.uid);
        e.shieldTimer = 0;
        e.armorShredTimer = Math.max(e.armorShredTimer, 3.2);
        e.dodgeLockedTimer = Math.max(e.dodgeLockedTimer, 2.0);
        ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 9.5), 0, 0, {
          isCrit: true,
          sourceKind: 'ability',
        });
        ctx.spawnFloatingText(e.x, e.y - e.radius - 16, 'RESTRUCTURED!', '#f43f5e', 'crit');
      }
    }

    const data: UraharaUltimateData = {
      stitchedUids,
      restitchTimer: 0,
      slashFlash: 0.85,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#f43f5e', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      240,
      '#f43f5e',
      7,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'KANNONBIRAKI BENIHIME ARATAME!!',
      '#fda4af',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 24, '#f43f5e', 75, 250, 3, 6, 'cross');
    ctx.addScreenShake(12);
    ctx.addHitstop(0.055);
    ctx.emitSfx({ type: 'slash', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as UraharaUltimateData;
    const enemies = ctx.getEnemies(owner);

    if (data.slashFlash > 0) data.slashFlash = Math.max(0, data.slashFlash - dt);

    // Chikasumi Crimson Blood-Mist Reflect Net around Urahara!
    for (const p of ctx.projectiles) {
      if (p.ownerUid === owner.uid) continue;
      if (owner.teamId !== null && p.teamId === owner.teamId) continue;
      if (Math.hypot(p.x - owner.x, p.y - owner.y) <= owner.radius + 42) {
        p.ownerUid = owner.uid;
        p.teamId = owner.teamId;
        p.vx = -p.vx * 1.4;
        p.vy = -p.vy * 1.4;
        p.color = '#f43f5e';
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 14,
          'CHIKASUMI NET!',
          '#fda4af',
          'callout',
        );
      }
    }

    // Periodic surgical stitch damage against restructured targets
    data.restitchTimer += dt;
    if (data.restitchTimer >= 0.7) {
      data.restitchTimer -= 0.7;
      for (const e of enemies) {
        if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 220) {
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 4.2), 0, 0, {
            sourceKind: 'ability',
          });
        }
      }
    }
  },
};
