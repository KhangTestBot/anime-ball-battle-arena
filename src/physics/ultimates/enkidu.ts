import type { UltimateHandler } from './types';

export interface EnkiduUltimateData {
  chainsDone: number;
  chainCd: number;
  enumaFired: boolean;
  flash: number;
}

export const enkiduUltimateHandler: UltimateHandler = {
  characterId: 'enkidu',
  title: 'ENUMÁ ELISH: CHAINS OF HEAVEN!',
  subtitle:
    'Binds gods and mortals alike (Chained Stun + Silence), rains 3 Age of Babylon volleys, and fires ENUMÁ ELISH!',
  bannerColor: '#22c55e',
  castDuration: 0.24,
  duration: 4.1,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.6);
    owner.dmgBonusPct += 22;
    for (const e of ctx.getEnemies(owner)) {
      e.stunTimer = Math.max(e.stunTimer, 1.35);
      e.stunKind = 'chained';
      e.silenceTimer = Math.max(e.silenceTimer, 3.0);
    }

    const data: EnkiduUltimateData = {
      chainsDone: 0,
      chainCd: 0.28,
      enumaFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#22c55e', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'O HUMANS, LET US RESTRAIN THE GODS!!',
      '#facc15',
      'powerup',
    );
    ctx.addScreenShake(13);
    ctx.emitSfx({ type: 'powerup', intensity: 1.35 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as EnkiduUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.enumaFired && data.chainsDone < 3) {
      data.chainCd -= dt;
      if (data.chainCd <= 0) {
        data.chainCd = 0.44;
        data.chainsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.24, -0.08, 0.08, 0.24]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('enkidu_clay'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'arrow-trident',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 760,
            vy: Math.sin(a) * 760,
            radius: 11,
            damage: ctx.getEffectiveDamage(owner, 7.6),
            knockback: 215,
            color: '#facc15',
            secondaryColor: '#22c55e',
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

    if (!data.enumaFired && state.elapsed >= 2.05) {
      data.enumaFired = true;
      data.flash = 1.5;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 28.5),
          Math.cos(ang) * 690,
          Math.sin(ang) * 690,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        375,
        '#22c55e',
        13,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'ENUMÁ ELISH: COUNTER FORCE!!',
        '#22c55e',
        'crit',
      );
      ctx.addScreenShake(22);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.5 });
    }
  },
};
