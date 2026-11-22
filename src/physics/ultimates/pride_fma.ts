import type { UltimateHandler } from './types';

export interface PrideFmaUltimateData {
  tendrilsDone: number;
  tendrilCd: number;
  cageFired: boolean;
  flash: number;
}

export const prideFmaUltimateHandler: UltimateHandler = {
  characterId: 'pride_fma',
  title: 'FIRST HOMUNCULUS: SHADOW TENDRIL ABYSS!',
  subtitle:
    'Unleashes terrifying Shadow Tendrils (Fear + Unstoppable), lashes 4 dark-crimson blade waves, and consumes foes in Shadow Cage!',
  bannerColor: '#a855f7',
  castDuration: 0.22,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 20;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.6);
    for (const e of ctx.getEnemies(owner)) {
      e.stunTimer = Math.max(e.stunTimer, 0.9);
      e.stunKind = 'fear';
    }

    const data: PrideFmaUltimateData = {
      tendrilsDone: 0,
      tendrilCd: 0.28,
      cageFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#a855f7', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'PRIDE: THE FIRST HOMUNCULUS!',
      '#a855f7',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'slash', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as PrideFmaUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.cageFired && data.tendrilsDone < 4) {
      data.tendrilCd -= dt;
      if (data.tendrilCd <= 0) {
        data.tendrilCd = 0.36;
        data.tendrilsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.22, 0, 0.22]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('pride_shadow'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'sword-wave',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 690,
            vy: Math.sin(a) * 690,
            radius: 15,
            damage: ctx.getEffectiveDamage(owner, 7.6),
            knockback: 210,
            color: '#a855f7',
            secondaryColor: '#dc2626',
            angle: a,
            life: 1.4,
            maxLife: 1.4,
            piercing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.2 });
      }
    }

    if (!data.cageFired && state.elapsed >= 2.05) {
      data.cageFired = true;
      data.flash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        e.stunTimer = Math.max(e.stunTimer, 1.15);
        e.stunKind = 'chained';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 26.5),
          Math.cos(ang) * 610,
          Math.sin(ang) * 610,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        340,
        '#dc2626',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'SHADOW TENDRIL CAGE!!',
        '#a855f7',
        'crit',
      );
      ctx.addScreenShake(19);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};
