import type { UltimateHandler } from './types';

export interface DestroyerOrb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  exploded: boolean;
}

export interface BeerusUltimateData {
  stage: 'destroyer-orbs' | 'hakai-snap';
  orbs: DestroyerOrb[];
  hakaiFired: boolean;
  hakaiFlash: number;
  erasedCount: number;
}

export const beerusUltimateHandler: UltimateHandler = {
  characterId: 'beerus',
  title: 'GOD OF DESTRUCTION: SPHERE OF DESTRUCTION & HAKAI',
  subtitle:
    'Scatters 5 hovering Spheres of Destruction that shred armor & block healing → Snaps his fingers for HAKAI!, erasing all projectiles, stripping shields + dodge & executing by missing HP%!',
  bannerColor: '#9333ea',
  castDuration: 0.25,
  duration: 3.8,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.5);
    const { left, right, top, bottom } = ctx.bounds;

    const orbs: DestroyerOrb[] = [];
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5;
      orbs.push({
        x: Math.max(left + 32, Math.min(right - 32, owner.x + Math.cos(a) * 115)),
        y: Math.max(top + 32, Math.min(bottom - 32, owner.y + Math.sin(a) * 115)),
        vx: Math.cos(a + 0.5) * 140,
        vy: Math.sin(a + 0.5) * 140,
        exploded: false,
      });
    }

    const data: BeerusUltimateData = {
      stage: 'destroyer-orbs',
      orbs,
      hakaiFired: false,
      hakaiFlash: 0,
      erasedCount: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#9333ea', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      195,
      '#c084fc',
      6.5,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'SPHERE OF DESTRUCTION!!',
      '#e9d5ff',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 22, '#9333ea', 80, 260, 3, 6, 'square');
    ctx.addScreenShake(10);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as BeerusUltimateData;
    const enemies = ctx.getEnemies(owner);
    const { left, right, top, bottom } = ctx.bounds;

    if (data.hakaiFlash > 0) data.hakaiFlash = Math.max(0, data.hakaiFlash - dt);

    // Drifting Destroyer Sun Mines detonate on proximity
    for (const orb of data.orbs) {
      if (orb.exploded) continue;
      orb.x = Math.max(left + 26, Math.min(right - 26, orb.x + orb.vx * dt));
      orb.y = Math.max(top + 26, Math.min(bottom - 26, orb.y + orb.vy * dt));
      if (orb.x <= left + 28 || orb.x >= right - 28) orb.vx = -orb.vx;
      if (orb.y <= top + 28 || orb.y >= bottom - 28) orb.vy = -orb.vy;

      for (const e of enemies) {
        if (Math.hypot(e.x - orb.x, e.y - orb.y) <= e.radius + 36) {
          orb.exploded = true;
          e.armorShredTimer = Math.max(e.armorShredTimer, 2.8);
          e.antiHealTimer = Math.max(e.antiHealTimer, 2.8);
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 6.2), 0, 0, {
            isCrit: true,
            sourceKind: 'ability',
          });
          ctx.spawnShockwave(
            orb.x,
            orb.y,
            120,
            '#f97316',
            5.5,
            owner.character.id,
            owner.character.series,
          );
          ctx.spawnParticles(orb.x, orb.y, 14, '#c084fc', 65, 220, 3, 5.5, 'square');
          ctx.emitSfx({ type: 'hit', intensity: 1.2 });
          break;
        }
      }
    }

    // Climax (2.0s): Snap fingers -> HAKAI!! Dissolve ALL projectiles & strip shields/evade!
    if (!data.hakaiFired && state.elapsed >= 2.0) {
      data.hakaiFired = true;
      data.stage = 'hakai-snap';
      data.hakaiFlash = 1.2;

      for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
        if (ctx.projectiles[i].ownerUid !== owner.uid) {
          data.erasedCount++;
          ctx.spawnParticles(
            ctx.projectiles[i].x,
            ctx.projectiles[i].y,
            6,
            '#9333ea',
            30,
            95,
            3,
            5,
            'square',
          );
          ctx.projectiles.splice(i, 1);
        }
      }

      ctx.addHitstop(0.08);
      ctx.addScreenShake(20);
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        260,
        '#a855f7',
        8.5,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(owner.x, owner.y - owner.radius - 22, 'HAKAI!!', '#e9d5ff', 'powerup');
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });

      for (const e of enemies) {
        const dx = e.x - owner.x;
        const dy = e.y - owner.y;
        const dist = Math.hypot(dx, dy);
        const d = Math.max(1, dist);
        const missingRatio = Math.max(0, Math.min(1, (e.maxHp - e.hp) / Math.max(1, e.maxHp)));
        e.shieldTimer = 0;
        e.evadeTimer = 0;
        e.dodgeLockedTimer = Math.max(e.dodgeLockedTimer, 2.2);
        e.armorShredTimer = Math.max(e.armorShredTimer, 2.8);
        e.antiHealTimer = Math.max(e.antiHealTimer, 2.8);
        const dmg = 11.5 * (1 + missingRatio * 0.75) + Math.min(5.0, data.erasedCount * 0.9);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, dmg),
          (dx / d) * 460,
          (dy / d) * 460,
          {
            bypassInvuln: true,
            isCrit: true,
            sourceKind: 'ability',
          },
        );
        ctx.spawnShockwave(e.x, e.y, 95, '#a855f7', 5, owner.character.id, owner.character.series);
        ctx.spawnFloatingText(e.x, e.y - e.radius - 16, 'DESTRUCTION!', '#d8b4fe', 'crit');
      }
    }
  },
};
