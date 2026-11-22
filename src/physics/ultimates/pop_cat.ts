import type { UltimateHandler } from './types';

export interface PopCatUltimateData {
  popsDone: number;
  popCd: number;
  omegaPopFired: boolean;
  flash: number;
}

export const popCatUltimateHandler: UltimateHandler = {
  characterId: 'pop_cat',
  title: 'POP POP POP! SONIC BARRAGE!',
  subtitle:
    'Triggers supersonic cat reflexes (Auto-Dodge), blasts 5 rapid POP! acoustic bursts, and drops OMEGA POP SHOCKWAVE!!',
  bannerColor: '#f97316',
  castDuration: 0.18,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 3.0);
    owner.dmgBonusPct += 18;

    const data: PopCatUltimateData = {
      popsDone: 0,
      popCd: 0.2,
      omegaPopFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#f97316', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'POP! POP! POP! POP!!',
      '#f97316',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'dodge', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as PopCatUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.omegaPopFired && data.popsDone < 5) {
      data.popCd -= dt;
      if (data.popCd <= 0) {
        data.popCd = 0.28;
        data.popsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.18, 0, 0.18]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('pop_wave'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'zoltraak-orb',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 760,
            vy: Math.sin(a) * 760,
            radius: 11,
            damage: ctx.getEffectiveDamage(owner, 6.2),
            knockback: 210,
            color: '#f97316',
            secondaryColor: '#ffffff',
            angle: a,
            life: 1.35,
            maxLife: 1.35,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.spawnFloatingText(owner.x, owner.y - owner.radius - 16, 'POP!', '#f97316', 'callout');
        ctx.emitSfx({ type: 'wall', intensity: 1.15 });
      }
    }

    if (!data.omegaPopFired && state.elapsed >= 2.0) {
      data.omegaPopFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.0);
        e.stunKind = 'airborne';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 25.5),
          Math.cos(ang) * 680,
          Math.sin(ang) * 680,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        345,
        '#f97316',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'OMEGA POP SHOCKWAVE!!',
        '#ffffff',
        'crit',
      );
      ctx.addScreenShake(19);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};
