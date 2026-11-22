import type { UltimateHandler } from './types';

export interface MarioUltimateData {
  fireVolleys: number;
  fireCd: number;
  poundFired: boolean;
  flash: number;
}

export const marioUltimateHandler: UltimateHandler = {
  characterId: 'mario',
  title: 'SUPER STAR: INVINCIBLE FIREBALL RAMPAGE!',
  subtitle:
    'Grabs a Rainbow Super Star (Invincible + Unstoppable), tosses 4 Fire Flower volleys, and stomps the arena with Mega Ground Pound!',
  bannerColor: '#ef4444',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.invulnTimer = Math.max(owner.invulnTimer, 2.8);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.5);
    owner.dmgBonusPct += 18;

    const data: MarioUltimateData = {
      fireVolleys: 0,
      fireCd: 0.28,
      poundFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#facc15', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'SUPER STAR POWER!!',
      '#facc15',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as MarioUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.poundFired && data.fireVolleys < 4) {
      data.fireCd -= dt;
      if (data.fireCd <= 0) {
        data.fireCd = 0.36;
        data.fireVolleys += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.2, 0, 0.2]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('mario_fire'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'fireball',
            x: owner.x + Math.cos(a) * (owner.radius + 8),
            y: owner.y + Math.sin(a) * (owner.radius + 8),
            vx: Math.cos(a) * 630,
            vy: Math.sin(a) * 630,
            radius: 11,
            damage: ctx.getEffectiveDamage(owner, 7.2),
            knockback: 200,
            color: '#ef4444',
            secondaryColor: '#facc15',
            angle: a,
            life: 1.45,
            maxLife: 1.45,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.1 });
      }
    }

    if (!data.poundFired && state.elapsed >= 2.0) {
      data.poundFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.1);
        e.stunKind = 'airborne';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 24.0),
          Math.cos(ang) * 600,
          Math.sin(ang) * 600,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        310,
        '#facc15',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'WAHOO! MEGA GROUND POUND!!',
        '#ef4444',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
