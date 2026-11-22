import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface RimuruUltimateData {
  coneAngle: number;
  coneRange: number;
  devouredCount: number;
  beamFired: boolean;
  beamTimer: number;
  beamX1: number;
  beamY1: number;
  beamX2: number;
  beamY2: number;
  slimeSlowCd: Record<string, number>;
  veldoraStrikeStage: number;
}

function angleDiff(a: number, b: number): number {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export const rimuruUltimateHandler: UltimateHandler = {
  characterId: 'rimuru',
  title: 'CIEL & VOID GOD AZATHOTH: TURN NULL!',
  subtitle:
    'Shatters enemy shields · Ciel & Azathoth devour all projectiles/traps (+4% HP & +4% DMG per projectile!) · Calls Veldora Black Lightning then fires Turn Null shredding armor & blocking healing!',
  bannerColor: '#06b6d4',
  castDuration: 0.25,
  duration: 4.4,

  onCast(ctx, owner, state) {
    owner.shieldTimer = Math.max(owner.shieldTimer, 4.3);
    owner.shieldColor = '#22d3ee';
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.4);

    // Predation Wave strips shields from nearby foes immediately!
    for (const e of ctx.getEnemies(owner)) {
      if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 265) {
        e.shieldTimer = 0;
      }
    }

    const target = ctx.getNearestEnemy(owner);
    const angle = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
    owner.facingAngle = angle;

    const data: RimuruUltimateData = {
      coneAngle: angle,
      coneRange: 285,
      devouredCount: 0,
      beamFired: false,
      beamTimer: 0,
      beamX1: owner.x,
      beamY1: owner.y,
      beamX2: owner.x + Math.cos(angle) * 740,
      beamY2: owner.y + Math.sin(angle) * 740,
      slimeSlowCd: {},
      veldoraStrikeStage: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, angle, '#06b6d4', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      '[CIEL: AZATHOTH UNLOCKED!]',
      '#22d3ee',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 24, '#a855f7', 75, 270, 3, 6.5, 'star');
    ctx.addScreenShake(10);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'beam-charge' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as RimuruUltimateData;
    const enemies = ctx.getEnemies(owner);
    const nearest = ctx.getNearestEnemy(owner);
    if (nearest && !data.beamFired) {
      data.coneAngle = Math.atan2(nearest.y - owner.y, nearest.x - owner.x);
      owner.facingAngle = data.coneAngle;
    }

    for (const uid of Object.keys(data.slimeSlowCd)) {
      data.slimeSlowCd[uid] -= dt;
      if (data.slimeSlowCd[uid] <= 0) delete data.slimeSlowCd[uid];
    }

    // 1. Azathoth Slime Viscosity Drain: heavy slow + rapid HP steal on melee contact!
    for (const e of enemies) {
      if (Math.hypot(e.x - owner.x, e.y - owner.y) <= owner.radius + e.radius + 24) {
        e.vx *= Math.pow(0.4, dt * 3.8);
        e.vy *= Math.pow(0.4, dt * 3.8);
        if (!data.slimeSlowCd[e.uid]) {
          data.slimeSlowCd[e.uid] = 0.45;
          const dealt = ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 5.2), 0, 0, {
            sourceKind: 'ability',
          });
          const hMult = getHealMultiplier(owner);
          if (dealt > 0 && hMult > 0) {
            const heal = Math.min(
              owner.maxHp - owner.hp,
              Math.max(1, Math.round(dealt * 0.45 * hMult)),
            );
            if (heal > 0) owner.hp += heal;
          }
        }
      }
    }

    // 2. Veldora Storm Dragon Black Lightning bursts at 1.1s & 2.0s!
    if (
      (data.veldoraStrikeStage === 0 && state.elapsed >= 1.1) ||
      (data.veldoraStrikeStage === 1 && state.elapsed >= 2.0)
    ) {
      data.veldoraStrikeStage++;
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 16,
        'VELDORA STORM LIGHTNING!',
        '#c084fc',
        'callout',
      );
      ctx.emitSfx({ type: 'crit', intensity: 1.15 });
      for (const e of enemies) {
        if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 270) {
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 7.8), 0, 0, {
            sourceKind: 'ability',
          });
          ctx.spawnShockwave(
            e.x,
            e.y,
            70,
            '#a855f7',
            4,
            owner.character.id,
            owner.character.series,
          );
          ctx.spawnParticles(e.x, e.y, 10, '#c084fc', 60, 210, 2.5, 5, 'star');
        }
      }
    }

    // 3. Soul Consumption Cone & 360° Raphael Auto-Predation Aura (devours projectiles & bombs -> Permanent DMG + HP!)
    if (!data.beamFired) {
      const halfCone = 0.82;

      for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
        const p = ctx.projectiles[i];
        if (p.ownerUid === owner.uid) continue;
        if (owner.teamId !== null && p.teamId === owner.teamId) continue;
        const d = Math.hypot(p.x - owner.x, p.y - owner.y);
        const ang = Math.atan2(p.y - owner.y, p.x - owner.x);
        const inCone = d <= data.coneRange && Math.abs(angleDiff(ang, data.coneAngle)) <= halfCone;
        const inAura = d <= owner.radius + 68 + p.radius;
        if (inCone || inAura) {
          ctx.projectiles.splice(i, 1);
          data.devouredCount = Math.min(12, data.devouredCount + 1);
          owner.dmgBonusPct += 4;
          owner.shieldTimer = Math.max(owner.shieldTimer, 4.0);
          owner.shieldColor = '#22d3ee';
          const hMult = getHealMultiplier(owner);
          if (hMult > 0) {
            const heal = Math.min(
              owner.maxHp - owner.hp,
              Math.max(3, Math.round(owner.maxHp * 0.04 * hMult)),
            );
            if (heal > 0) owner.hp += heal;
          }
          ctx.spawnParticles(p.x, p.y, 8, '#a855f7', 50, 180, 2.5, 5.5, 'star');
          ctx.spawnFloatingText(
            owner.x,
            owner.y - owner.radius - 14,
            'DEVOURED +4% DMG!',
            '#22d3ee',
            'callout',
          );
        }
      }

      for (let i = ctx.bombs.length - 1; i >= 0; i--) {
        const b = ctx.bombs[i];
        if (b.ownerUid === owner.uid) continue;
        if (owner.teamId !== null && b.teamId === owner.teamId) continue;
        const d = Math.hypot(b.x - owner.x, b.y - owner.y);
        if (d <= data.coneRange) {
          ctx.bombs.splice(i, 1);
          data.devouredCount = Math.min(12, data.devouredCount + 1);
          owner.dmgBonusPct += 4;
          owner.shieldTimer = Math.max(owner.shieldTimer, 4.0);
        }
      }

      // 4. Climax (2.7s): IMAGINARY COLLAPSE (TURN NULL!!) Supreme Void Annihilation Beam!
      if (state.elapsed >= 2.7) {
        data.beamFired = true;
        data.beamTimer = 0.95;
        data.beamX1 = owner.x;
        data.beamY1 = owner.y;
        data.beamX2 = owner.x + Math.cos(data.coneAngle) * 760;
        data.beamY2 = owner.y + Math.sin(data.coneAngle) * 760;

        const devourMult = 1 + data.devouredCount * 0.18;
        ctx.addHitstop(0.075);
        ctx.addScreenShake(19);
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          225,
          '#06b6d4',
          8,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 22,
          'AZATHOTH: TURN NULL!!',
          '#c084fc',
          'powerup',
        );
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.4 });

        const dxL = Math.cos(data.coneAngle);
        const dyL = Math.sin(data.coneAngle);
        for (const e of enemies) {
          const rx = e.x - data.beamX1;
          const ry = e.y - data.beamY1;
          const along = rx * dxL + ry * dyL;
          const perp = Math.abs(-rx * dyL + ry * dxL);
          if (along >= -e.radius && perp <= e.radius + 54) {
            e.shieldTimer = 0;
            e.armorShredTimer = Math.max(e.armorShredTimer, 3.2);
            e.antiHealTimer = Math.max(e.antiHealTimer, 2.2);
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, 26.0 * devourMult),
              dxL * 560,
              dyL * 560,
              { isCrit: true, sourceKind: 'ability' },
            );
            ctx.spawnParticles(e.x, e.y, 20, '#22d3ee', 90, 320, 3, 6.5, 'star');
          }
        }
      }
    } else if (data.beamTimer > 0) {
      data.beamTimer = Math.max(0, data.beamTimer - dt);
    }
  },
};
