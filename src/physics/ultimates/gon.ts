import type { UltimateHandler } from './types';

export interface GonUltimateData {
  step: 0 | 1 | 2 | 3; // 0: start, 1: CHI, 2: PA, 3: GUU finished
  sacrificedHp: number;
  guuFlash: number;
}

export const gonUltimateHandler: UltimateHandler = {
  characterId: 'gon',
  title: 'VOW & LIMITATION: ADULT GON — JAJANKEN (ROCK · SCISSORS · PAPER)',
  subtitle:
    'Sacrifices 10% current HP to awaken Adult Gon (Unstoppable + Giant) · Chains Jajanken Scissors (Chi) → Paper (Pa) → Closes in for Rock (GUU!) shattering shields with massive knockback!',
  bannerColor: '#16a34a',
  castDuration: 0.24,
  duration: 3.7,

  onCast(ctx, owner, state) {
    owner.giantTimer = Math.max(owner.giantTimer, 3.2);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.0);
    owner.getExcitedTimer = Math.max(owner.getExcitedTimer, 3.2);

    const sacrifice = owner.hp > owner.maxHp * 0.25 ? owner.hp * 0.1 : 0;
    if (sacrifice > 0) {
      owner.hp = Math.max(1, owner.hp - sacrifice);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 12,
        `-${Math.round(sacrifice)} VOW!`,
        '#f97316',
        'callout',
      );
    }

    const data: GonUltimateData = {
      step: 0,
      sacrificedHp: sacrifice,
      guuFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#f97316', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      195,
      '#eab308',
      6.5,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'ADULT GON AWAKENED!!',
      '#fde047',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as GonUltimateData;
    const enemies = ctx.getEnemies(owner);
    const { left, right, top, bottom } = ctx.bounds;

    if (data.guuFlash > 0) data.guuFlash = Math.max(0, data.guuFlash - dt);

    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;

    // Form 1 (0.3s): JAJANKEN: CHI (Scissors piercing energy blade)
    if (data.step === 0 && state.elapsed >= 0.3) {
      data.step = 1;
      ctx.projectiles.push({
        id: ctx.nextId('gon_chi'),
        ownerUid: owner.uid,
        ownerCharId: owner.character.id,
        ownerSeries: owner.character.series,
        teamId: owner.teamId,
        kind: 'sword-wave',
        x: owner.x + Math.cos(ang) * (owner.radius + 10),
        y: owner.y + Math.sin(ang) * (owner.radius + 10),
        vx: Math.cos(ang) * 650,
        vy: Math.sin(ang) * 650,
        radius: 17,
        damage: ctx.getEffectiveDamage(owner, 6.2),
        knockback: 220,
        color: '#f59e0b',
        secondaryColor: '#ef4444',
        angle: ang,
        life: 1.0,
        maxLife: 1.0,
        piercing: true,
        hitCooldowns: {},
        powerLevel: 6,
      });
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 16,
        'JAN KEN: CHI!',
        '#fcd34d',
        'callout',
      );
      ctx.emitSfx({ type: 'slash', intensity: 1.1 });
      return;
    }

    // Form 2 (0.95s): JAJANKEN: PA (Paper heavy emission orb)
    if (data.step === 1 && state.elapsed >= 0.95) {
      data.step = 2;
      ctx.projectiles.push({
        id: ctx.nextId('gon_pa'),
        ownerUid: owner.uid,
        ownerCharId: owner.character.id,
        ownerSeries: owner.character.series,
        teamId: owner.teamId,
        kind: 'ki-blast',
        x: owner.x + Math.cos(ang) * (owner.radius + 12),
        y: owner.y + Math.sin(ang) * (owner.radius + 12),
        vx: Math.cos(ang) * 540,
        vy: Math.sin(ang) * 540,
        radius: 22,
        damage: ctx.getEffectiveDamage(owner, 7.2),
        knockback: 310,
        color: '#f97316',
        secondaryColor: '#fef08a',
        angle: ang,
        life: 1.3,
        maxLife: 1.3,
        piercing: false,
        explosiveRadius: 85,
        hitCooldowns: {},
        powerLevel: 6,
      });
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 16,
        'JAN KEN: PA!',
        '#fb923c',
        'callout',
      );
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.1 });
      return;
    }

    // Climax Form 3 (1.75s): JAJANKEN: GUU!! (Rock Colossal Finish)
    if (data.step === 2 && state.elapsed >= 1.75) {
      data.step = 3;
      data.guuFlash = 1.25;

      if (target) {
        const dx = target.x - owner.x;
        const dy = target.y - owner.y;
        const d = Math.max(1, Math.hypot(dx, dy));
        const ux = dx / d;
        const uy = dy / d;
        owner.x = Math.max(
          left + owner.radius + 8,
          Math.min(right - owner.radius - 8, target.x - ux * (owner.radius + target.radius + 6)),
        );
        owner.y = Math.max(
          top + owner.radius + 8,
          Math.min(bottom - owner.radius - 8, target.y - uy * (owner.radius + target.radius + 6)),
        );
      }

      for (const e of enemies) {
        const dx = e.x - owner.x;
        const dy = e.y - owner.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= 200 + e.radius) {
          const d = Math.max(1, dist);
          e.shieldTimer = 0;
          e.armorShredTimer = Math.max(e.armorShredTimer, 3.0);
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 18.5),
            (dx / d) * 660,
            (dy / d) * 660,
            {
              bypassInvuln: true,
              isCrit: true,
              sourceKind: 'ability',
            },
          );
        }
      }

      ctx.spawnShockwave(
        owner.x,
        owner.y,
        240,
        '#f59e0b',
        9,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 24,
        'JAN KEN: GUUUU!!',
        '#fef08a',
        'powerup',
      );
      ctx.addHitstop(0.085);
      ctx.addScreenShake(24);
      ctx.emitSfx({ type: 'ko', intensity: 1.45 });
    }
  },
};
