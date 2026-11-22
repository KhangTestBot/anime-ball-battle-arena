import type { UltimateHandler } from './types';

export interface KakyoinUltimateData {
  splashesDone: number;
  splashCd: number;
  barrageFired: boolean;
  flash: number;
}

export const kakyoinUltimateHandler: UltimateHandler = {
  characterId: 'kakyoin',
  title: '20-METER EMERALD SPLASH!!',
  subtitle:
    'Weaves a 20-meter Hierophant Web (Chained Stun), fires 3 relentless 5-way Emerald Splash volleys, and detonates Full Radius Splash!',
  bannerColor: '#10b981',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    for (const e of ctx.getEnemies(owner)) {
      e.stunTimer = Math.max(e.stunTimer, 1.0);
      e.stunKind = 'chained';
    }
    owner.dmgBonusPct += 18;

    const data: KakyoinUltimateData = {
      splashesDone: 0,
      splashCd: 0.28,
      barrageFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#10b981', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'NO ONE CAN DEFLECT THE EMERALD SPLASH!!',
      '#10b981',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as KakyoinUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.barrageFired && data.splashesDone < 3) {
      data.splashCd -= dt;
      if (data.splashCd <= 0) {
        data.splashCd = 0.42;
        data.splashesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.32, -0.16, 0, 0.16, 0.32]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('kakyoin_gem'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'zoltraak-orb',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 740,
            vy: Math.sin(a) * 740,
            radius: 10,
            damage: ctx.getEffectiveDamage(owner, 6.4),
            knockback: 180,
            color: '#10b981',
            secondaryColor: '#34d399',
            angle: a,
            life: 1.4,
            maxLife: 1.4,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.2 });
      }
    }

    if (!data.barrageFired && state.elapsed >= 2.0) {
      data.barrageFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 25.0),
          Math.cos(ang) * 610,
          Math.sin(ang) * 610,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        345,
        '#10b981',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        '20-METER EMERALD SPLASH!!',
        '#34d399',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
