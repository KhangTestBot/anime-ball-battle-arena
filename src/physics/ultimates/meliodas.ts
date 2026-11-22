import type { UltimateHandler } from './types';

export interface LostvayneMirage {
  angle: number;
  x: number;
  y: number;
  hitCd: Record<string, number>;
}

export interface MeliodasUltimateData {
  stage: 'full-counter' | 'trillion-dark';
  lastHp: number;
  absorbedDmg: number;
  reflectedCount: number;
  clones: LostvayneMirage[];
  counterFlash: number;
  darkSalvosLeft: number;
  darkSalvoCd: number;
}

export const meliodasUltimateHandler: UltimateHandler = {
  characterId: 'meliodas',
  title: 'FULL COUNTER x2 & TRILLION DARK',
  subtitle:
    'Full Counter stance reflects enemy projectiles at 2x damage + 2 Lostvayne Clones → Erupts with Revenge Counter & a storm of Trillion Dark blades!',
  bannerColor: '#7e22ce',
  castDuration: 0.25,
  duration: 4.1,

  onCast(ctx, owner, state) {
    owner.shieldColor = '#facc15';

    const clones: LostvayneMirage[] = [
      { angle: 0, x: owner.x + 48, y: owner.y, hitCd: {} },
      { angle: Math.PI, x: owner.x - 48, y: owner.y, hitCd: {} },
    ];

    const data: MeliodasUltimateData = {
      stage: 'full-counter',
      lastHp: owner.hp,
      absorbedDmg: 0,
      reflectedCount: 0,
      clones,
      counterFlash: 0,
      darkSalvosLeft: 2,
      darkSalvoCd: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#7e22ce', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      185,
      '#9333ea',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'FULL COUNTER STANCE!',
      '#fde047',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 20, '#a855f7', 75, 240, 3, 6, 'shard');
    ctx.addScreenShake(9);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as MeliodasUltimateData;
    const enemies = ctx.getEnemies(owner);
    const { left, right, top, bottom } = ctx.bounds;

    if (data.counterFlash > 0) {
      data.counterFlash = Math.max(0, data.counterFlash - dt);
    }

    // Track absorbed damage for Revenge Counter climax
    if (owner.hp < data.lastHp) {
      data.absorbedDmg += data.lastHp - owner.hp;
    }
    data.lastHp = owner.hp;

    if (data.stage === 'full-counter') {
      // Reflect any incoming enemy projectile at 2.0x damage & 1.55x speed!
      for (const p of ctx.projectiles) {
        if (p.ownerUid === owner.uid) continue;
        if (owner.teamId !== null && p.teamId === owner.teamId) continue;
        if (Math.hypot(p.x - owner.x, p.y - owner.y) <= owner.radius + 52 + p.radius) {
          p.ownerUid = owner.uid;
          p.teamId = owner.teamId;
          p.vx = -p.vx * 1.55;
          p.vy = -p.vy * 1.55;
          p.damage = Math.max(p.damage * 2.0, ctx.getEffectiveDamage(owner, 9.0));
          p.color = '#facc15';
          p.secondaryColor = '#a855f7';
          p.angle = Math.atan2(p.vy, p.vx);
          p.hitCooldowns = {};
          data.reflectedCount++;
          data.counterFlash = 0.45;
          ctx.spawnShockwave(
            owner.x,
            owner.y,
            110,
            '#facc15',
            4.5,
            owner.character.id,
            owner.character.series,
          );
          ctx.spawnFloatingText(
            owner.x,
            owner.y - owner.radius - 16,
            'FULL COUNTER x2!',
            '#fde047',
            'crit',
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.25 });
        }
      }

      // Orbit 2 Lostvayne mirage clones slashing enemies who approach in melee!
      for (const clone of data.clones) {
        clone.angle += dt * 4.8;
        clone.x = Math.max(left + 16, Math.min(right - 16, owner.x + Math.cos(clone.angle) * 58));
        clone.y = Math.max(top + 16, Math.min(bottom - 16, owner.y + Math.sin(clone.angle) * 58));

        for (const uid of Object.keys(clone.hitCd)) {
          clone.hitCd[uid] -= dt;
          if (clone.hitCd[uid] <= 0) delete clone.hitCd[uid];
        }

        for (const e of enemies) {
          if (clone.hitCd[e.uid]) continue;
          if (Math.hypot(e.x - clone.x, e.y - clone.y) <= e.radius + 26) {
            clone.hitCd[e.uid] = 0.45;
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 3.8), 0, 0, {
              sourceKind: 'ability',
            });
            ctx.spawnParticles(e.x, e.y, 8, '#9333ea', 60, 190, 2.5, 5, 'shard');
          }
        }
      }

      if (state.elapsed >= 1.85) {
        data.stage = 'trillion-dark';
        data.clones = [];
        const bonusDmg = Math.min(11.0, data.reflectedCount * 2.2 + data.absorbedDmg * 0.45);
        const burstDmg = ctx.getEffectiveDamage(owner, 9.5 + bonusDmg);

        ctx.addHitstop(0.075);
        ctx.addScreenShake(18);
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          230,
          '#6b21a8',
          7.5,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 20,
          data.reflectedCount > 0 || data.absorbedDmg > 4
            ? 'REVENGE COUNTER · TRILLION DARK!'
            : 'ASSAULT TRILLION DARK!!',
          '#d8b4fe',
          'powerup',
        );
        ctx.emitSfx({ type: 'ko', intensity: 1.3 });

        for (const e of enemies) {
          const dx = e.x - owner.x;
          const dy = e.y - owner.y;
          const dist = Math.hypot(dx, dy);
          if (dist <= 185 + e.radius) {
            const d = Math.max(1, dist);
            ctx.applyDamage(owner, e, burstDmg, (dx / d) * 510, (dy / d) * 510, {
              isCrit: true,
              sourceKind: 'ability',
            });
            ctx.spawnParticles(e.x, e.y, 16, '#581c87', 80, 300, 3, 6, 'shard');
          }
        }
      }
      return;
    }

    // Stage 2: Trillion Dark Starburst Salvos homing gently toward enemies!
    if (data.darkSalvosLeft > 0) {
      data.darkSalvoCd -= dt;
      if (data.darkSalvoCd <= 0) {
        data.darkSalvosLeft--;
        data.darkSalvoCd = 0.55;
        const count = 6;
        const target = ctx.getNearestEnemy(owner);
        const baseAng = target
          ? Math.atan2(target.y - owner.y, target.x - owner.x)
          : owner.facingAngle;
        for (let i = 0; i < count; i++) {
          const ang = baseAng + (i - (count - 1) / 2) * 0.28;
          ctx.projectiles.push({
            id: ctx.nextId('tdark'),
            ownerUid: owner.uid,
            teamId: owner.teamId,
            kind: 'purple',
            x: owner.x + Math.cos(ang) * (owner.radius + 10),
            y: owner.y + Math.sin(ang) * (owner.radius + 10),
            vx: Math.cos(ang) * 560,
            vy: Math.sin(ang) * 560,
            radius: 10,
            damage: ctx.getEffectiveDamage(owner, 3.4),
            knockback: 210,
            color: '#1e1b4b',
            secondaryColor: '#a855f7',
            angle: ang,
            life: 1.3,
            maxLife: 1.3,
            piercing: false,
            homing: true,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 0.95 });
      }
    }
  },
};
