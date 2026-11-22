import type { UltimateHandler } from './types';

export interface ZenonUltimateData {
  bonesDone: number;
  boneCd: number;
  ruptureFired: boolean;
  flash: number;
}

export const zenonUltimateHandler: UltimateHandler = {
  characterId: 'zenon',
  title: 'SPATIAL MANA DOMINATION: DEVIL BONE!',
  subtitle:
    'Seizes all mana in the arena (Silence + Unstoppable), skewers foes with 3 Devil Bone volleys, and triggers Spatial Rupture!',
  bannerColor: '#94a3b8',
  castDuration: 0.22,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.4);
    owner.dmgBonusPct += 22;
    for (const e of ctx.getEnemies(owner)) {
      e.silenceTimer = Math.max(e.silenceTimer, 3.0);
    }

    const data: ZenonUltimateData = {
      bonesDone: 0,
      boneCd: 0.28,
      ruptureFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#94a3b8', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'SPATIAL MANA DOMINATION!!',
      '#38bdf8',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'powerup', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ZenonUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.ruptureFired && data.bonesDone < 3) {
      data.boneCd -= dt;
      if (data.boneCd <= 0) {
        data.boneCd = 0.44;
        data.bonesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.22, 0, 0.22]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('zenon_bone'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'arrow-trident',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 740,
            vy: Math.sin(a) * 740,
            radius: 12,
            damage: ctx.getEffectiveDamage(owner, 8.6),
            knockback: 230,
            color: '#e2e8f0',
            secondaryColor: '#38bdf8',
            angle: a,
            life: 1.45,
            maxLife: 1.45,
            piercing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.2 });
      }
    }

    if (!data.ruptureFired && state.elapsed >= 2.05) {
      data.ruptureFired = true;
      data.flash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.1);
        e.stunKind = 'chained';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 27.0),
          Math.cos(ang) * 650,
          Math.sin(ang) * 650,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        355,
        '#38bdf8',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'ABSOLUTE SPATIAL RUPTURE!!',
        '#94a3b8',
        'crit',
      );
      ctx.addScreenShake(20);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.45 });
    }
  },
};
