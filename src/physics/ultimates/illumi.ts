import type { UltimateHandler } from './types';

export interface IllumiUltimateData {
  needlesDone: number;
  needleCd: number;
  ambushFired: boolean;
  flash: number;
}

export const illumiUltimateHandler: UltimateHandler = {
  characterId: 'illumi',
  title: 'NEEDLEMAN: ZOLDYCK BLOODLUST!',
  subtitle:
    'Emanates paralyzing Zoldyck Bloodlust (Fear + Confusion), throws 4 volleys of Nen Needles, and triggers Needle People Ambush!',
  bannerColor: '#10b981',
  castDuration: 0.2,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 2.8);
    for (const e of ctx.getEnemies(owner)) {
      e.stunTimer = Math.max(e.stunTimer, 0.9);
      e.stunKind = 'fear';
      e.confusedTimer = Math.max(e.confusedTimer, 2.6);
    }

    const data: IllumiUltimateData = {
      needlesDone: 0,
      needleCd: 0.28,
      ambushFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#10b981', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'ZOLDYCK BLOODLUST!',
      '#10b981',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as IllumiUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.ambushFired && data.needlesDone < 4) {
      data.needleCd -= dt;
      if (data.needleCd <= 0) {
        data.needleCd = 0.36;
        data.needlesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.22, -0.07, 0.07, 0.22]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('illumi_needle'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'arrow-trident',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 730,
            vy: Math.sin(a) * 730,
            radius: 8,
            damage: ctx.getEffectiveDamage(owner, 6.2),
            knockback: 180,
            color: '#10b981',
            secondaryColor: '#f8fafc',
            angle: a,
            life: 1.4,
            maxLife: 1.4,
            piercing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.15 });
      }
    }

    if (!data.ambushFired && state.elapsed >= 2.0) {
      data.ambushFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        e.armorShredTimer = Math.max(e.armorShredTimer, 3.8);
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 24.0),
          Math.cos(ang) * 560,
          Math.sin(ang) * 560,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        305,
        '#10b981',
        10,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'NEEDLE PEOPLE AMBUSH!!',
        '#10b981',
        'crit',
      );
      ctx.addScreenShake(17);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
