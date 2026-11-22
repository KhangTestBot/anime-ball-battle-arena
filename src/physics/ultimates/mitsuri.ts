import type { UltimateHandler } from './types';

export interface MitsuriUltimateData {
  whipsDone: number;
  whipCd: number;
  wildclawFired: boolean;
  flash: number;
}

export const mitsuriUltimateHandler: UltimateHandler = {
  characterId: 'mitsuri',
  title: 'LOVE BREATHING: CATLOVE SHOWER!',
  subtitle:
    'Ribbon whip-blade dance (+18% DMG & Auto-Dodge), launches 4 sweeping Love Whip waves, and finishes with Swaying Love, Wildclaw!',
  bannerColor: '#f472b6',
  castDuration: 0.2,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 18;
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 2.8);

    const data: MitsuriUltimateData = {
      whipsDone: 0,
      whipCd: 0.28,
      wildclawFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#f472b6', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'LOVE BREATHING: CATLOVE SHOWER!',
      '#f472b6',
      'powerup',
    );
    ctx.addScreenShake(9);
    ctx.emitSfx({ type: 'slash', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as MitsuriUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.wildclawFired && data.whipsDone < 4) {
      data.whipCd -= dt;
      if (data.whipCd <= 0) {
        data.whipCd = 0.36;
        data.whipsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.24, 0, 0.24]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('mitsuri_whip'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'sword-wave',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 670,
            vy: Math.sin(a) * 670,
            radius: 14,
            damage: ctx.getEffectiveDamage(owner, 7.2),
            knockback: 195,
            color: '#f472b6',
            secondaryColor: '#84cc16',
            angle: a,
            life: 1.35,
            maxLife: 1.35,
            piercing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.2 });
      }
    }

    if (!data.wildclawFired && state.elapsed >= 2.0) {
      data.wildclawFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 24.0),
          Math.cos(ang) * 550,
          Math.sin(ang) * 550,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        305,
        '#f472b6',
        10,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'SWAYING LOVE, WILDCLAW!!',
        '#84cc16',
        'crit',
      );
      ctx.addScreenShake(17);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'slash', intensity: 1.4 });
    }
  },
};
