import type { UltimateHandler } from './types';

export interface GohanUltimateData {
  stage: 'beast-charge' | 'makankosappo' | 'done';
  aimAngle: number;
  beamFired: boolean;
  beamX1: number;
  beamY1: number;
  beamX2: number;
  beamY2: number;
  beamFlash: number;
}

export const gohanUltimateHandler: UltimateHandler = {
  characterId: 'gohan',
  title: 'BEAST GOHAN: SILVER-CRIMSON AURA & MAKANKOSAPPO',
  subtitle:
    'Erupts with Silver-Crimson Beast Ki knocking back nearby foes & locking dodge (Dodge Lock) → Charges twin energy streams into Special Beam Cannon piercing all obstacles & shields!',
  bannerColor: '#9333ea',
  castDuration: 0.24,
  duration: 3.6,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.5);
    const enemies = ctx.getEnemies(owner);

    // Beast Awakening aura shockwave locks enemy evade & repels close threats
    for (const e of enemies) {
      const dx = e.x - owner.x;
      const dy = e.y - owner.y;
      const dist = Math.hypot(dx, dy);
      e.dodgeLockedTimer = Math.max(e.dodgeLockedTimer, 2.6);
      if (dist <= 200) {
        const d = Math.max(1, dist);
        e.armorShredTimer = Math.max(e.armorShredTimer, 2.5);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 6.2),
          (dx / d) * 420,
          (dy / d) * 420,
          {
            sourceKind: 'ability',
          },
        );
      }
    }

    const target = ctx.getNearestEnemy(owner);
    const aimAngle = target
      ? Math.atan2(target.y - owner.y, target.x - owner.x)
      : owner.facingAngle;

    const data: GohanUltimateData = {
      stage: 'beast-charge',
      aimAngle,
      beamFired: false,
      beamX1: owner.x,
      beamY1: owner.y,
      beamX2: owner.x + Math.cos(aimAngle) * 760,
      beamY2: owner.y + Math.sin(aimAngle) * 760,
      beamFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, aimAngle, '#ef4444', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      200,
      '#e2e8f0',
      6.5,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'BEAST GOHAN: DODGE LOCKED!',
      '#fca5a5',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 24, '#e2e8f0', 80, 260, 3, 6, 'spark');
    ctx.addScreenShake(10);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'beam-charge' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as GohanUltimateData;
    const enemies = ctx.getEnemies(owner);

    if (data.beamFlash > 0) data.beamFlash = Math.max(0, data.beamFlash - dt);

    if (data.stage === 'beast-charge') {
      const target = ctx.getNearestEnemy(owner);
      if (target) {
        data.aimAngle = Math.atan2(target.y - owner.y, target.x - owner.x);
      }

      // Beast repulsive aura pushes melee attackers away during two-finger charge
      for (const e of enemies) {
        const dx = e.x - owner.x;
        const dy = e.y - owner.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 1 && dist <= 125) {
          e.vx += (dx / dist) * 340 * dt;
          e.vy += (dy / dist) * 340 * dt;
        }
      }

      // Climax (1.3s): MAKANKOSAPPO!! Piercing twin-helix Special Beam Cannon!
      if (!data.beamFired && state.elapsed >= 1.3) {
        data.beamFired = true;
        data.stage = 'makankosappo';
        data.beamFlash = 1.25;
        data.beamX1 = owner.x;
        data.beamY1 = owner.y;
        data.beamX2 = owner.x + Math.cos(data.aimAngle) * 900;
        data.beamY2 = owner.y + Math.sin(data.aimAngle) * 900;

        ctx.beams.push({
          id: ctx.nextId('makankosappo'),
          ownerUid: owner.uid,
          ownerCharId: owner.character.id,
          ownerSeries: owner.character.series,
          teamId: owner.teamId,
          originX: owner.x,
          originY: owner.y,
          angle: data.aimAngle,
          width: 34,
          damagePerTick: ctx.getEffectiveDamage(owner, 4.2),
          color: '#dc2626',
          secondaryColor: '#a855f7',
          coreColor: '#ffffff',
          life: 1.05,
          maxLife: 1.05,
          tickTimer: 0.16,
          powerLevel: 7,
          style: 'final-flash',
        });

        // Immediate piercing Special Beam Cannon line burst tearing through shields & obstacles
        const lx = Math.cos(data.aimAngle);
        const ly = Math.sin(data.aimAngle);
        for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
          const obs = ctx.obstacles[i];
          const px = obs.x - owner.x;
          const py = obs.y - owner.y;
          const proj = px * lx + py * ly;
          const perp = Math.abs(px * ly - py * lx);
          if (proj >= 0 && perp <= 46) {
            ctx.obstacles.splice(i, 1);
          }
        }

        for (const e of enemies) {
          const px = e.x - owner.x;
          const py = e.y - owner.y;
          const proj = px * lx + py * ly;
          const perp = Math.abs(px * ly - py * lx);
          if (proj >= -e.radius && perp <= e.radius + 46) {
            e.shieldTimer = 0;
            e.dodgeLockedTimer = Math.max(e.dodgeLockedTimer, 2.2);
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 18.5), lx * 520, ly * 520, {
              bypassInvuln: true,
              isCrit: true,
              sourceKind: 'ability',
            });
          }
        }

        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 22,
          'MAKANKOSAPPO!!',
          '#fca5a5',
          'powerup',
        );
        ctx.addHitstop(0.08);
        ctx.addScreenShake(20);
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.4 });
      }
    }
  },
};
