import type { UltimateHandler } from './types';

export interface SanemiUltimateData {
  typhoonsFired: number;
  typhoonCd: number;
  swirlAngle: number;
  climaxFired: boolean;
}

export const sanemiUltimateHandler: UltimateHandler = {
  characterId: 'sanemi',
  title: 'WIND BREATHING: IDATEN TYPHOON · MARECHI HAZE',
  subtitle:
    'Disorients enemies with Marechi Blood mist, erases projectiles with 4 emerald gale blades, and shreds armor in a massive Idaten Typhoon!',
  bannerColor: '#22c55e',
  castDuration: 0.24,
  duration: 3.7,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.4);
    for (const e of ctx.getEnemies(owner)) {
      e.confusedTimer = Math.max(e.confusedTimer, 2.4);
    }

    const data: SanemiUltimateData = {
      typhoonsFired: 0,
      typhoonCd: 0.35,
      swirlAngle: 0,
      climaxFired: false,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#22c55e', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'MARECHI TYPHOON!',
      '#4ade80',
      'powerup',
    );
    ctx.addScreenShake(9);
    ctx.emitSfx({ type: 'slash', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as SanemiUltimateData;
    data.swirlAngle += dt * 14;

    // Shred nearby enemy projectiles
    for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
      const p = ctx.projectiles[i];
      if (
        p.ownerUid !== owner.uid &&
        Math.hypot(p.x - owner.x, p.y - owner.y) <= owner.radius + 78
      ) {
        ctx.projectiles.splice(i, 1);
      }
    }

    if (data.typhoonsFired < 4) {
      data.typhoonCd -= dt;
      if (data.typhoonCd <= 0) {
        data.typhoonCd = 0.45;
        data.typhoonsFired += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        ctx.projectiles.push({
          id: ctx.nextId('sanemi_gale'),
          ownerUid: owner.uid,
          ownerCharId: owner.character.id,
          ownerSeries: owner.character.series,
          teamId: owner.teamId,
          kind: 'tornado',
          x: owner.x,
          y: owner.y,
          vx: Math.cos(ang) * 540,
          vy: Math.sin(ang) * 540,
          radius: 16,
          damage: ctx.getEffectiveDamage(owner, 9.2),
          knockback: 260,
          color: '#22c55e',
          secondaryColor: '#bbf7d0',
          angle: ang,
          life: 1.6,
          maxLife: 1.6,
          piercing: true,
          hitCooldowns: {},
          powerLevel: ctx.getForm(owner).powerLevel,
        });
        ctx.emitSfx({ type: 'slash', intensity: 1.1 });
      }
    }

    if (!data.climaxFired && state.elapsed >= 2.2) {
      data.climaxFired = true;
      for (const e of ctx.getEnemies(owner)) {
        if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 255 + e.radius) {
          e.shieldTimer = 0;
          e.armorShredTimer = Math.max(e.armorShredTimer, 3.2);
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 17.5), 0, 0, {
            isCrit: true,
            bypassInvuln: true,
            sourceKind: 'ability',
          });
        }
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        255,
        '#22c55e',
        8,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'IDATEN TYPHOON!',
        '#4ade80',
        'crit',
      );
      ctx.addScreenShake(14);
      ctx.emitSfx({ type: 'crit', intensity: 1.25 });
    }
  },
};
