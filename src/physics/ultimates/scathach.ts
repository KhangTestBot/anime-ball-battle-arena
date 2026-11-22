import type { UltimateHandler } from './types';

export interface ScathachUltimateData {
  spearsDone: number;
  spearCd: number;
  gateFired: boolean;
  flash: number;
}

export const scathachUltimateHandler: UltimateHandler = {
  characterId: 'scathach',
  title: 'GÁE BOLG ALTERNATIVE: GATE OF SKYE!',
  subtitle:
    'Invokes Primordial Runes (Silence + Auto-Dodge), hurls 3 Twin Crimson Spear volleys, and opens the abyssal GATE OF SKYE!',
  bannerColor: '#9333ea',
  castDuration: 0.22,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 3.0);
    owner.dmgBonusPct += 22;
    for (const e of ctx.getEnemies(owner)) {
      e.silenceTimer = Math.max(e.silenceTimer, 2.8);
    }

    const data: ScathachUltimateData = {
      spearsDone: 0,
      spearCd: 0.28,
      gateFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#9333ea', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'GÁE BOLG ALTERNATIVE!!',
      '#ef4444',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'powerup', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ScathachUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.gateFired && data.spearsDone < 3) {
      data.spearCd -= dt;
      if (data.spearCd <= 0) {
        data.spearCd = 0.44;
        data.spearsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.16, 0, 0.16]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('scath_spear'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'arrow-trident',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 780,
            vy: Math.sin(a) * 780,
            radius: 12,
            damage: ctx.getEffectiveDamage(owner, 8.8),
            knockback: 230,
            color: '#ef4444',
            secondaryColor: '#9333ea',
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

    if (!data.gateFired && state.elapsed >= 2.05) {
      data.gateFired = true;
      data.flash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.15);
        e.stunKind = 'fear';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 27.5),
          Math.cos(ang) * 660,
          Math.sin(ang) * 660,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        360,
        '#9333ea',
        13,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'GATE OF SKYE: LAND OF SHADOWS!!',
        '#c084fc',
        'crit',
      );
      ctx.addScreenShake(20);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.45 });
    }
  },
};
