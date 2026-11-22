import type { UltimateHandler } from './types';

export interface BoaUltimateData {
  arrowsDone: number;
  arrowCd: number;
  femurFired: boolean;
  flash: number;
}

export const boaUltimateHandler: UltimateHandler = {
  characterId: 'boa',
  title: 'MERO MERO MELLOW: PERFUME FEMUR!',
  subtitle:
    'Charms & petrifies enemies with Love-Love Beam, fires 3 Slave Arrow volleys, and shatters stone foes with Perfume Femur!',
  bannerColor: '#e11d48',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 2.6);
    for (const e of ctx.getEnemies(owner)) {
      e.charmTimer = Math.max(e.charmTimer, 2.0);
      e.charmOwnerUid = owner.uid;
      e.stunTimer = Math.max(e.stunTimer, 0.9);
      e.stunKind = 'petrified';
    }

    const data: BoaUltimateData = {
      arrowsDone: 0,
      arrowCd: 0.3,
      femurFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#f472b6', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'MERO MERO MELLOW!!',
      '#f472b6',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as BoaUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.femurFired && data.arrowsDone < 3) {
      data.arrowCd -= dt;
      if (data.arrowCd <= 0) {
        data.arrowCd = 0.44;
        data.arrowsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.2, 0, 0.2]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('boa_arrow'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'arrow-trident',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 680,
            vy: Math.sin(a) * 680,
            radius: 10,
            damage: ctx.getEffectiveDamage(owner, 7.6),
            knockback: 200,
            color: '#f472b6',
            secondaryColor: '#e11d48',
            angle: a,
            life: 1.45,
            maxLife: 1.45,
            piercing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.15 });
      }
    }

    if (!data.femurFired && state.elapsed >= 2.0) {
      data.femurFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.15);
        e.stunKind = 'petrified';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 24.0),
          Math.cos(ang) * 570,
          Math.sin(ang) * 570,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        305,
        '#f472b6',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'PERFUME FEMUR SHATTER!!',
        '#e11d48',
        'crit',
      );
      ctx.addScreenShake(17);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
