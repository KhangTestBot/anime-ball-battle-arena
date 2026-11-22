import type { ProjectileKind } from '../../types/game';
import { applyFighterStun } from '../domains';
import type { UltimateHandler } from './types';

export interface GatePortal {
  x: number;
  y: number;
  angle: number;
  flash: number;
}

export interface GilgameshUltimateData {
  stage: 'barrage' | 'enuma-charge' | 'enuma-fire';
  gates: GatePortal[];
  firedCount: number;
  fireCd: number;
  chainTargetUid: string | null;
  eaAngle: number;
  eaX1: number;
  eaY1: number;
  eaX2: number;
  eaY2: number;
  eaFlash: number;
  spinPhase: number;
}

const GATE_WEAPONS: ProjectileKind[] = ['sword-wave', 'spear', 'dagger-blade', 'axe', 'scythe'];

export const gilgameshUltimateHandler: UltimateHandler = {
  characterId: 'gilgamesh',
  title: 'GATE OF BABYLON & ENUMA ELISH',
  subtitle:
    'Chains of Heaven Enkidu bind the strongest enemy (longer vs higher tiers) → Opens 8 Golden Gates firing 24 Noble Phantasms → Sword of Rupture Ea tears space apart with Enuma Elish!',
  bannerColor: '#eab308',
  castDuration: 0.25,
  duration: 4.45,

  onCast(ctx, owner, state) {
    const enemies = ctx.getEnemies(owner);
    // Pick strongest enemy (highest powerLevel/maxHp) for Golden Enkidu Chains of Heaven!
    let chainTarget = enemies[0] ?? null;
    let bestScore = -1;
    for (const e of enemies) {
      const score = ctx.getForm(e).powerLevel * 1000 + e.hp;
      if (score > bestScore) {
        bestScore = score;
        chainTarget = e;
      }
    }

    if (chainTarget) {
      const bindDuration = ctx.getForm(chainTarget).powerLevel >= 4 ? 2.1 : 1.45;
      applyFighterStun(ctx, owner, chainTarget, bindDuration, 'chained', 'ENKIDU CHAINS!');
      ctx.spawnParticles(chainTarget.x, chainTarget.y, 16, '#fbbf24', 60, 210, 2.5, 5.5, 'star');
    }

    const baseAng = chainTarget
      ? Math.atan2(chainTarget.y - owner.y, chainTarget.x - owner.x)
      : owner.facingAngle;
    const gates: GatePortal[] = [];
    for (let i = 0; i < 8; i++) {
      const offsetAng = baseAng + Math.PI + (i - 3.5) * 0.34;
      gates.push({
        x: owner.x + Math.cos(offsetAng) * 58,
        y: owner.y + Math.sin(offsetAng) * 58,
        angle: baseAng,
        flash: 1.0,
      });
    }

    const data: GilgameshUltimateData = {
      stage: 'barrage',
      gates,
      firedCount: 0,
      fireCd: 0.05,
      chainTargetUid: chainTarget ? chainTarget.uid : null,
      eaAngle: baseAng,
      eaX1: owner.x,
      eaY1: owner.y,
      eaX2: owner.x + Math.cos(baseAng) * 760,
      eaY2: owner.y + Math.sin(baseAng) * 760,
      eaFlash: 0,
      spinPhase: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, baseAng, '#fbbf24', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      200,
      '#f59e0b',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'GATE OF BABYLON!!',
      '#fde047',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 22, '#fbbf24', 80, 270, 3, 6, 'star');
    ctx.addScreenShake(10);
    ctx.addHitstop(0.055);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as GilgameshUltimateData;
    const enemies = ctx.getEnemies(owner);
    data.spinPhase += dt * 14;

    if (data.eaFlash > 0) {
      data.eaFlash = Math.max(0, data.eaFlash - dt);
    }

    // Reposition halo portals behind Gilgamesh
    const primaryTarget =
      enemies.find((e) => e.uid === data.chainTargetUid && e.alive) ?? ctx.getNearestEnemy(owner);
    const faceAng = primaryTarget
      ? Math.atan2(primaryTarget.y - owner.y, primaryTarget.x - owner.x)
      : owner.facingAngle;
    owner.facingAngle = faceAng;
    for (let i = 0; i < data.gates.length; i++) {
      const offsetAng = faceAng + Math.PI + (i - 3.5) * 0.34;
      data.gates[i].x = owner.x + Math.cos(offsetAng) * 58;
      data.gates[i].y = owner.y + Math.sin(offsetAng) * 58;
      data.gates[i].angle = faceAng;
      data.gates[i].flash = Math.max(0.25, data.gates[i].flash - dt * 2.2);
    }

    if (data.stage === 'barrage') {
      data.fireCd -= dt;
      while (data.fireCd <= 0 && data.firedCount < 24) {
        data.fireCd += 0.1;
        const gateIdx = data.firedCount % data.gates.length;
        const gate = data.gates[gateIdx];
        gate.flash = 1.0;

        const target = primaryTarget ?? ctx.getNearestEnemy(owner);
        const aimX = target ? target.x : gate.x + Math.cos(faceAng) * 260;
        const aimY = target ? target.y : gate.y + Math.sin(faceAng) * 260;
        const jitter = ((data.firedCount % 5) - 2) * 0.045;
        const shotAng = Math.atan2(aimY - gate.y, aimX - gate.x) + jitter;
        const kind = GATE_WEAPONS[data.firedCount % GATE_WEAPONS.length];
        const speed = 720 + (data.firedCount % 3) * 70;

        ctx.projectiles.push({
          id: ctx.nextId('gob'),
          ownerUid: owner.uid,
          teamId: owner.teamId,
          kind,
          x: gate.x,
          y: gate.y,
          vx: Math.cos(shotAng) * speed,
          vy: Math.sin(shotAng) * speed,
          radius: 9,
          damage: ctx.getEffectiveDamage(owner, 2.35),
          knockback: 185,
          color: '#fbbf24',
          secondaryColor: '#ef4444',
          angle: shotAng,
          life: 1.5,
          maxLife: 1.5,
          piercing: false,
          ownerCharId: owner.character.id,
          ownerSeries: owner.character.series,
          hitCooldowns: {},
          powerLevel: ctx.getForm(owner).powerLevel,
        });

        data.firedCount++;
        if (data.firedCount % 3 === 1) {
          ctx.emitSfx({ type: 'slash', intensity: 0.7 });
        }
      }

      if (state.elapsed >= 2.65) {
        data.stage = 'enuma-charge';
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 20,
          'SWORD OF RUPTURE: EA!',
          '#ef4444',
          'powerup',
        );
        ctx.emitSfx({ type: 'beam-charge', intensity: 1.3 });
      }
      return;
    }

    if (data.stage === 'enuma-charge' && state.elapsed >= 3.05) {
      data.stage = 'enuma-fire';
      data.eaFlash = 1.25;
      const aimAng = primaryTarget
        ? Math.atan2(primaryTarget.y - owner.y, primaryTarget.x - owner.x)
        : owner.facingAngle;
      data.eaAngle = aimAng;
      data.eaX1 = owner.x;
      data.eaY1 = owner.y;
      data.eaX2 = owner.x + Math.cos(aimAng) * 780;
      data.eaY2 = owner.y + Math.sin(aimAng) * 780;

      ctx.addHitstop(0.085);
      ctx.addScreenShake(22);
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        265,
        '#dc2626',
        8,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 22,
        'ENUMA ELISH!!',
        '#fca5a5',
        'powerup',
      );
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.45 });

      const dxL = Math.cos(aimAng);
      const dyL = Math.sin(aimAng);

      // Tear enemy projectiles out of existence along Enuma Elish corridor
      for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
        const p = ctx.projectiles[i];
        if (p.ownerUid === owner.uid) continue;
        const rx = p.x - data.eaX1;
        const ry = p.y - data.eaY1;
        const along = rx * dxL + ry * dyL;
        const perp = Math.abs(-rx * dyL + ry * dxL);
        if (along >= 0 && perp <= 64 + p.radius) {
          ctx.spawnParticles(p.x, p.y, 6, '#ef4444', 50, 160, 2.5, 5, 'shard');
          ctx.projectiles.splice(i, 1);
        }
      }

      for (const e of enemies) {
        const rx = e.x - data.eaX1;
        const ry = e.y - data.eaY1;
        const along = rx * dxL + ry * dyL;
        const perp = Math.abs(-rx * dyL + ry * dxL);
        if (along >= -e.radius && perp <= e.radius + 54) {
          e.shieldTimer = 0;
          e.armorShredTimer = Math.max(e.armorShredTimer, 2.5);
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 17.5), dxL * 590, dyL * 590, {
            isCrit: true,
            sourceKind: 'ability',
          });
          ctx.spawnParticles(e.x, e.y, 20, '#ef4444', 90, 340, 3, 6.5, 'shard');
        }
      }
    }
  },
};
