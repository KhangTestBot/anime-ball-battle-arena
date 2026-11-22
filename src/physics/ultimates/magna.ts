import type { UltimateHandler } from './types';

export interface MagnaUltimateData {
  fireballsDone: number;
  fireballCd: number;
  haymakerFired: boolean;
  flash: number;
}

export const magnaUltimateHandler: UltimateHandler = {
  characterId: 'magna',
  title: 'SOUL CHAIN DEATHMATCH!!',
  subtitle:
    'Links souls (Chained Stun + Silence + +24% DMG), blasts 3 Exploding Fireball volleys, and finishes with Soul Chain Haymaker!',
  bannerColor: '#ef4444',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.2);
    owner.dmgBonusPct += 24;
    for (const e of ctx.getEnemies(owner)) {
      e.stunTimer = Math.max(e.stunTimer, 1.0);
      e.stunKind = 'chained';
      e.silenceTimer = Math.max(e.silenceTimer, 2.5);
    }

    const data: MagnaUltimateData = {
      fireballsDone: 0,
      fireballCd: 0.3,
      haymakerFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ef4444', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'SOUL CHAIN DEATHMATCH!!',
      '#ef4444',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as MagnaUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.haymakerFired && data.fireballsDone < 3) {
      data.fireballCd -= dt;
      if (data.fireballCd <= 0) {
        data.fireballCd = 0.44;
        data.fireballsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.2, 0, 0.2]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('magna_fire'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'fireball',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 680,
            vy: Math.sin(a) * 680,
            radius: 12,
            damage: ctx.getEffectiveDamage(owner, 8.0),
            knockback: 220,
            color: '#ef4444',
            secondaryColor: '#f97316',
            angle: a,
            life: 1.45,
            maxLife: 1.45,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'wall', intensity: 1.2 });
      }
    }

    if (!data.haymakerFired && state.elapsed >= 2.0) {
      data.haymakerFired = true;
      data.flash = 1.4;
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
        330,
        '#ef4444',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'FLAME KNUCKLE KO!!',
        '#f97316',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};
