import { applyFighterBurn } from '../domains';
import type { UltimateHandler } from './types';

export interface AceEmberPatch {
  x: number;
  y: number;
  radius: number;
  life: number;
}

export interface AceUltimateData {
  stage: 'hiken-pillars' | 'dai-enkai' | 'detonated';
  sunX: number;
  sunY: number;
  sunRadius: number;
  shotsLeft: number;
  shotCd: number;
  burnTick: number;
  patches: AceEmberPatch[];
  detonateFlash: number;
}

export const aceUltimateHandler: UltimateHandler = {
  characterId: 'ace',
  title: 'FLAME EMPEROR (DAI ENKAI: ENTEI)',
  subtitle:
    'Unleashes Fire Fist & Flame Lance scorching the ground into ash zones → Condenses a colossal sun of fire overhead → Hurls Flame Emperor to obliterate the arena!',
  bannerColor: '#f97316',
  castDuration: 0.25,
  duration: 4.1,

  onCast(ctx, owner, state) {
    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
    owner.facingAngle = ang;

    const data: AceUltimateData = {
      stage: 'hiken-pillars',
      sunX: owner.x,
      sunY: owner.y - owner.radius - 28,
      sunRadius: 16,
      shotsLeft: 6,
      shotCd: 0.08,
      burnTick: 0,
      patches: [],
      detonateFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, ang, '#f97316', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      180,
      '#ea580c',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'HIKEN · FIRE FIST!',
      '#fb923c',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 20, '#f97316', 75, 250, 3, 6, 'circle');
    ctx.addScreenShake(9);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as AceUltimateData;
    const enemies = ctx.getEnemies(owner);
    const { left, right, top, bottom } = ctx.bounds;

    if (data.detonateFlash > 0) {
      data.detonateFlash = Math.max(0, data.detonateFlash - dt);
    }

    // Update burning cinder patches on the arena floor
    for (let i = data.patches.length - 1; i >= 0; i--) {
      data.patches[i].life -= dt;
      if (data.patches[i].life <= 0) {
        data.patches.splice(i, 1);
      }
    }

    data.burnTick += dt;
    if (data.burnTick >= 0.35) {
      data.burnTick -= 0.35;
      for (const e of enemies) {
        for (const patch of data.patches) {
          if (Math.hypot(e.x - patch.x, e.y - patch.y) <= patch.radius + e.radius) {
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 2.2), 0, 0, {
              sourceKind: 'dot',
            });
            applyFighterBurn(e, owner.uid, 2.6, ctx.getEffectiveDamage(owner, 2.4));
            break;
          }
        }
      }
    }

    if (data.stage === 'hiken-pillars') {
      if (data.shotsLeft > 0) {
        data.shotCd -= dt;
        if (data.shotCd <= 0) {
          data.shotCd = 0.22;
          data.shotsLeft--;
          const target = ctx.getNearestEnemy(owner);
          const ang = target
            ? Math.atan2(target.y - owner.y, target.x - owner.x)
            : owner.facingAngle;
          const spread = ((data.shotsLeft % 3) - 1) * 0.18;
          const shotAng = ang + spread;

          ctx.projectiles.push({
            id: ctx.nextId('ace_fire'),
            ownerUid: owner.uid,
            teamId: owner.teamId,
            kind: 'fireball',
            x: owner.x + Math.cos(shotAng) * (owner.radius + 10),
            y: owner.y + Math.sin(shotAng) * (owner.radius + 10),
            vx: Math.cos(shotAng) * 630,
            vy: Math.sin(shotAng) * 630,
            radius: 12,
            damage: ctx.getEffectiveDamage(owner, 4.4),
            knockback: 210,
            color: '#f97316',
            secondaryColor: '#fde047',
            angle: shotAng,
            life: 1.4,
            maxLife: 1.4,
            piercing: false,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });

          // Drop lingering blazing cinder zone near cast path
          const px = Math.max(left + 44, Math.min(right - 44, owner.x + Math.cos(shotAng) * 115));
          const py = Math.max(top + 44, Math.min(bottom - 44, owner.y + Math.sin(shotAng) * 115));
          data.patches.push({ x: px, y: py, radius: 42, life: 2.8 });
          ctx.emitSfx({ type: 'slash', intensity: 0.85 });
        }
      }

      if (state.elapsed >= 1.45) {
        data.stage = 'dai-enkai';
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 20,
          'DAI ENKAI: ENTEI!',
          '#fde047',
          'powerup',
        );
        ctx.emitSfx({ type: 'beam-charge', intensity: 1.25 });
      }
      return;
    }

    if (data.stage === 'dai-enkai') {
      // Colossal Fire Sun expands overhead cleanly clamped inside arena
      data.sunX = owner.x;
      data.sunY = Math.max(top + data.sunRadius + 8, owner.y - owner.radius - 36);
      data.sunRadius = Math.min(82, data.sunRadius + dt * 66);

      if (state.elapsed >= 2.55) {
        data.stage = 'detonated';
        data.detonateFlash = 1.1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          data.sunX = Math.max(left + 50, Math.min(right - 50, target.x));
          data.sunY = Math.max(top + 50, Math.min(bottom - 50, target.y));
        }

        ctx.addHitstop(0.08);
        ctx.addScreenShake(22);
        ctx.spawnShockwave(
          data.sunX,
          data.sunY,
          240,
          '#f97316',
          8,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(data.sunX, data.sunY - 26, 'ENTEI EXPLOSION!!', '#fde047', 'powerup');
        ctx.spawnParticles(data.sunX, data.sunY, 34, '#f97316', 110, 380, 3.5, 7.5, 'circle');
        ctx.emitSfx({ type: 'ko', intensity: 1.4 });

        // Leave central Entei scorched ground crater!
        data.patches.push({ x: data.sunX, y: data.sunY, radius: 95, life: 2.0 });

        for (const e of enemies) {
          const dx = e.x - data.sunX;
          const dy = e.y - data.sunY;
          const dist = Math.hypot(dx, dy);
          if (dist <= 220 + e.radius) {
            const d = Math.max(1, dist);
            e.armorShredTimer = Math.max(e.armorShredTimer, 2.2);
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, 17.0),
              (dx / d) * 600,
              (dy / d) * 600,
              {
                isCrit: true,
                sourceKind: 'ability',
              },
            );
            applyFighterBurn(e, owner.uid, 3.5, ctx.getEffectiveDamage(owner, 3.0));
          }
        }
      }
    }
  },
};
