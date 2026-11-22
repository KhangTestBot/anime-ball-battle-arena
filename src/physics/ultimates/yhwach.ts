import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface AlmightyFutureTrap {
  x: number;
  y: number;
  timer: number;
  exploded: boolean;
}

export interface YhwachUltimateData {
  traps: AlmightyFutureTrap[];
  trapCd: number;
  auswahlenFired: boolean;
  lightFlash: number;
  arrowsFired: number;
}

export const yhwachUltimateHandler: UltimateHandler = {
  characterId: 'yhwach',
  title: 'THE ALMIGHTY & AUSWÄHLEN JUDGMENT',
  subtitle:
    'Sees the future to plant Future Traps ahead of enemy paths · Rains Heilig Pfeil light arrows → Calls down Auswählen erasing shields & draining life!',
  bannerColor: '#dc2626',
  castDuration: 0.25,
  duration: 4.1,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.5);
    owner.evadeTimer = Math.max(owner.evadeTimer, 1.5);

    const data: YhwachUltimateData = {
      traps: [],
      trapCd: 0.25,
      auswahlenFired: false,
      lightFlash: 0,
      arrowsFired: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#dc2626', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      210,
      '#09090b',
      6.5,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'THE ALMIGHTY: REWRITE FUTURE!',
      '#fca5a5',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 22, '#09090b', 75, 250, 3, 6.5, 'star');
    ctx.addScreenShake(10);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as YhwachUltimateData;
    const enemies = ctx.getEnemies(owner);
    const { left, right, top, bottom } = ctx.bounds;

    if (data.lightFlash > 0) data.lightFlash = Math.max(0, data.lightFlash - dt);

    // Plant Almighty Future Traps along predicted enemy paths!
    if (state.elapsed < 2.2) {
      data.trapCd -= dt;
      if (data.trapCd <= 0) {
        data.trapCd = 0.65;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const predX = Math.max(left + 32, Math.min(right - 32, target.x + target.vx * 0.28));
          const predY = Math.max(top + 32, Math.min(bottom - 32, target.y + target.vy * 0.28));
          data.traps.push({ x: predX, y: predY, timer: 0.45, exploded: false });
          ctx.spawnFloatingText(predX, predY - 14, 'ALMIGHTY TRAP', '#f87171', 'callout');
        }
      }
    }

    for (let i = data.traps.length - 1; i >= 0; i--) {
      const tr = data.traps[i];
      tr.timer -= dt;
      if (tr.timer <= 0 && !tr.exploded) {
        tr.exploded = true;
        ctx.spawnShockwave(
          tr.x,
          tr.y,
          95,
          '#dc2626',
          5,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnParticles(tr.x, tr.y, 12, '#09090b', 60, 210, 2.5, 5, 'shard');
        for (const e of enemies) {
          if (Math.hypot(e.x - tr.x, e.y - tr.y) <= 75 + e.radius) {
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 6.2), 0, 0, {
              sourceKind: 'ability',
            });
          }
        }
        data.traps.splice(i, 1);
      }
    }

    // Fire 8 Quincy Heilig Pfeil arrows!
    if (data.arrowsFired === 0 && state.elapsed >= 0.75) {
      data.arrowsFired = 8;
      const target = ctx.getNearestEnemy(owner);
      const baseAng = target
        ? Math.atan2(target.y - owner.y, target.x - owner.x)
        : owner.facingAngle;
      for (let i = 0; i < 8; i++) {
        const ang = baseAng + (i - 3.5) * 0.22;
        ctx.projectiles.push({
          id: ctx.nextId('heilig'),
          ownerUid: owner.uid,
          teamId: owner.teamId,
          kind: 'arrow-trident',
          x: owner.x + Math.cos(ang) * (owner.radius + 10),
          y: owner.y + Math.sin(ang) * (owner.radius + 10),
          vx: Math.cos(ang) * 710,
          vy: Math.sin(ang) * 710,
          radius: 9,
          damage: ctx.getEffectiveDamage(owner, 3.0),
          knockback: 180,
          color: '#38bdf8',
          secondaryColor: '#ef4444',
          angle: ang,
          life: 1.4,
          maxLife: 1.4,
          piercing: false,
          ownerCharId: owner.character.id,
          ownerSeries: owner.character.series,
          hitCooldowns: {},
          powerLevel: ctx.getForm(owner).powerLevel,
        });
      }
      ctx.emitSfx({ type: 'slash', intensity: 1.1 });
    }

    // Climax (2.35s): AUSWÄHLEN!! Sky Light Columns strip enemy shields & siphon HP back to Yhwach!
    if (!data.auswahlenFired && state.elapsed >= 2.35) {
      data.auswahlenFired = true;
      data.lightFlash = 1.1;
      ctx.addHitstop(0.08);
      ctx.addScreenShake(20);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 22,
        'AUSWÄHLEN JUDGMENT!!',
        '#fef08a',
        'powerup',
      );
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.4 });

      let totalSiphoned = 0;
      for (const e of enemies) {
        e.shieldTimer = 0;
        e.dodgeLockedTimer = Math.max(e.dodgeLockedTimer, 1.5);
        const dealt = ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 15.0), 0, 0, {
          isCrit: true,
          sourceKind: 'ability',
        });
        totalSiphoned += Math.max(dealt, e.maxHp * 0.04);
        ctx.spawnShockwave(e.x, e.y, 110, '#facc15', 6, owner.character.id, owner.character.series);
      }

      const healAmt = Math.min(owner.maxHp * 0.16, totalSiphoned * 0.45) * getHealMultiplier(owner);
      if (healAmt > 0.5) {
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
  },
};
