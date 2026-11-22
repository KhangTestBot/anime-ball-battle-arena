import type { UltimateHandler } from './types';

export interface ArmstrongUltimateData {
  bouldersDone: number;
  boulderCd: number;
  statueFired: boolean;
  flash: number;
}

export const armstrongUltimateHandler: UltimateHandler = {
  characterId: 'armstrong',
  title: 'STRONG ARM ALCHEMIST: PASSED DOWN FOR GENERATIONS!',
  subtitle:
    'Sparkling muscle alchemy (+20% DMG, Shield & Unstoppable), punches 4 spiked boulder volleys, and finishes with Sparkling Statue Slam!',
  bannerColor: '#f59e0b',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 20;
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.4);
    owner.shieldColor = '#f472b6';
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.4);

    const data: ArmstrongUltimateData = {
      bouldersDone: 0,
      boulderCd: 0.28,
      statueFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#f472b6', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'PASSED DOWN THE ARMSTRONG LINE!!',
      '#f472b6',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ArmstrongUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.statueFired && data.bouldersDone < 4) {
      data.boulderCd -= dt;
      if (data.boulderCd <= 0) {
        data.boulderCd = 0.36;
        data.bouldersDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.18, 0, 0.18]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('armstrong_rock'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'meteor',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 680,
            vy: Math.sin(a) * 680,
            radius: 12,
            damage: ctx.getEffectiveDamage(owner, 7.6),
            knockback: 230,
            color: '#f59e0b',
            secondaryColor: '#f472b6',
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

    if (!data.statueFired && state.elapsed >= 2.0) {
      data.statueFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.15);
        e.stunKind = 'airborne';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 25.0),
          Math.cos(ang) * 640,
          Math.sin(ang) * 640,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        325,
        '#f472b6',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'SPARKLING STATUE SLAM!!',
        '#f59e0b',
        'crit',
      );
      ctx.addScreenShake(19);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
