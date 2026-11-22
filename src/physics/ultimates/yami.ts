import type { UltimateHandler } from './types';

export interface YamiUltimateData {
  slashesDone: number;
  slashCd: number;
  devouredProjectiles: number;
  equinoxFired: boolean;
  flash: number;
}

export const yamiUltimateHandler: UltimateHandler = {
  characterId: 'yami',
  title: 'DARK MAGIC: DIMENSION SLASH EQUINOX!',
  subtitle:
    'Manifests Black Moon to devour enemy spells, fires 3 Dark Cloaked slashes, and cleaves shields with DIMENSION SLASH EQUINOX!',
  bannerColor: '#9333ea',
  castDuration: 0.22,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.6);
    owner.dmgBonusPct += 22;

    const data: YamiUltimateData = {
      slashesDone: 0,
      slashCd: 0.28,
      devouredProjectiles: 0,
      equinoxFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#9333ea', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'SURPASS YOUR LIMITS! BLACK MOON!!',
      '#9333ea',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'powerup', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as YamiUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    // Black Moon swallows nearby enemy projectiles!
    for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
      const p = ctx.projectiles[i];
      if (p.ownerUid === owner.uid) continue;
      if (owner.teamId !== null && p.teamId === owner.teamId) continue;
      if (Math.hypot(p.x - owner.x, p.y - owner.y) <= 145) {
        ctx.projectiles.splice(i, 1);
        data.devouredProjectiles += 1;
        ctx.spawnParticles(p.x, p.y, 8, '#9333ea', 50, 170, 2.5, 5, 'shard');
      }
    }

    if (!data.equinoxFired && data.slashesDone < 3) {
      data.slashCd -= dt;
      if (data.slashCd <= 0) {
        data.slashCd = 0.44;
        data.slashesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.18, 0, 0.18]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('yami_dark'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'getsuga',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 740,
            vy: Math.sin(a) * 740,
            radius: 14,
            damage: ctx.getEffectiveDamage(owner, 8.8),
            knockback: 230,
            color: '#9333ea',
            secondaryColor: '#09090b',
            angle: a,
            life: 1.45,
            maxLife: 1.45,
            piercing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.25 });
      }
    }

    if (!data.equinoxFired && state.elapsed >= 2.05) {
      data.equinoxFired = true;
      data.flash = 1.5;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 28.0),
          Math.cos(ang) * 670,
          Math.sin(ang) * 670,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        365,
        '#9333ea',
        13,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'DIMENSION SLASH: EQUINOX!!',
        '#c084fc',
        'crit',
      );
      ctx.addScreenShake(21);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.45 });
    }
  },
};
