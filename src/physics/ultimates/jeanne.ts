import type { UltimateHandler } from './types';

export interface JeanneUltimateData {
  raysDone: number;
  rayCd: number;
  blockedProjectiles: number;
  sanctuaryFired: boolean;
  flash: number;
}

export const jeanneUltimateHandler: UltimateHandler = {
  characterId: 'jeanne',
  title: 'LUMINOSITÉ ETERNELLE: HOLY BANNER!',
  subtitle:
    'Raises an impenetrable sanctuary (Invulnerable + Shield + +20% HP + nullifies enemy projectiles) and unleashes Radiant Judgment!',
  bannerColor: '#3b82f6',
  castDuration: 0.24,
  duration: 4.1,

  onCast(ctx, owner, state) {
    owner.invulnTimer = Math.max(owner.invulnTimer, 2.4);
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.6);
    owner.hp = Math.min(owner.maxHp, owner.hp + owner.maxHp * 0.2);

    const data: JeanneUltimateData = {
      raysDone: 0,
      rayCd: 0.3,
      blockedProjectiles: 0,
      sanctuaryFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#facc15', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'LUMINOSITÉ ETERNELLE!!',
      '#facc15',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'heal', intensity: 1.35 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as JeanneUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    // Holy Banner sanctuary nullifies all nearby enemy projectiles!
    for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
      const p = ctx.projectiles[i];
      if (p.ownerUid === owner.uid) continue;
      if (owner.teamId !== null && p.teamId === owner.teamId) continue;
      if (Math.hypot(p.x - owner.x, p.y - owner.y) <= 150) {
        ctx.projectiles.splice(i, 1);
        data.blockedProjectiles += 1;
        ctx.spawnParticles(p.x, p.y, 8, '#facc15', 50, 170, 2.5, 5, 'spark');
      }
    }

    if (!data.sanctuaryFired && data.raysDone < 3) {
      data.rayCd -= dt;
      if (data.rayCd <= 0) {
        data.rayCd = 0.44;
        data.raysDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.18, 0, 0.18]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('jeanne_holy'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'zoltraak-orb',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 700,
            vy: Math.sin(a) * 700,
            radius: 12,
            damage: ctx.getEffectiveDamage(owner, 8.0),
            knockback: 220,
            color: '#facc15',
            secondaryColor: '#3b82f6',
            angle: a,
            life: 1.45,
            maxLife: 1.45,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.2 });
      }
    }

    if (!data.sanctuaryFired && state.elapsed >= 2.05) {
      data.sanctuaryFired = true;
      data.flash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 26.0),
          Math.cos(ang) * 640,
          Math.sin(ang) * 640,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        355,
        '#facc15',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'LA PUCELLE: HOLY JUDGMENT!!',
        '#3b82f6',
        'crit',
      );
      ctx.addScreenShake(19);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.45 });
    }
  },
};
