import type { UltimateHandler } from './types';

export interface Android18UltimateData {
  discsDone: number;
  discCd: number;
  accelFired: boolean;
  flash: number;
}

export const android18UltimateHandler: UltimateHandler = {
  characterId: 'android18',
  title: 'INFINITE ENERGY: DESTRUCTO DISC & ACCEL DANCE!',
  subtitle:
    'Infinite stamina blitz (+18% DMG & Auto-Dodge), hurls 3 piercing Destructo Discs, and finishes with Sadistic 18 Accel Dance!',
  bannerColor: '#facc15',
  castDuration: 0.2,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 18;
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 2.8);

    const data: Android18UltimateData = {
      discsDone: 0,
      discCd: 0.28,
      accelFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#facc15', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'DESTRUCTO DISC!!',
      '#facc15',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'slash', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as Android18UltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.accelFired && data.discsDone < 3) {
      data.discCd -= dt;
      if (data.discCd <= 0) {
        data.discCd = 0.44;
        data.discsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        ctx.projectiles.push({
          id: ctx.nextId('a18_disc'),
          ownerUid: owner.uid,
          ownerCharId: owner.character.id,
          ownerSeries: owner.character.series,
          teamId: owner.teamId,
          kind: 'boomerang',
          x: owner.x + Math.cos(ang) * (owner.radius + 10),
          y: owner.y + Math.sin(ang) * (owner.radius + 10),
          vx: Math.cos(ang) * 700,
          vy: Math.sin(ang) * 700,
          radius: 14,
          damage: ctx.getEffectiveDamage(owner, 9.4),
          knockback: 215,
          color: '#facc15',
          secondaryColor: '#3b82f6',
          angle: ang,
          life: 1.5,
          maxLife: 1.5,
          piercing: true,
          hitCooldowns: {},
          powerLevel: ctx.getForm(owner).powerLevel,
        });
        ctx.emitSfx({ type: 'slash', intensity: 1.2 });
      }
    }

    if (!data.accelFired && state.elapsed >= 2.0) {
      data.accelFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        e.armorShredTimer = Math.max(e.armorShredTimer, 3.8);
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 24.5),
          Math.cos(ang) * 580,
          Math.sin(ang) * 580,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        310,
        '#facc15',
        10,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'ACCEL DANCE!!',
        '#3b82f6',
        'crit',
      );
      ctx.addScreenShake(17);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
