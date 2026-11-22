import type { UltimateHandler } from './types';

export interface EzrealUltimateData {
  shotsDone: number;
  shotCd: number;
  barrageFired: boolean;
  barrageAngle: number;
  barrageFlash: number;
}

export const ezrealUltimateHandler: UltimateHandler = {
  characterId: 'ezreal',
  title: 'TRUESHOT BARRAGE (R): ARCANE SHIFT!',
  subtitle:
    'Blinks with Arcane Shift (Auto-Dodge), fires 3 Mystic Shot volleys, and unleashes a global Trueshot Barrage wave!',
  bannerColor: '#38bdf8',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 2.8);
    owner.dmgBonusPct += 16;
    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;

    const data: EzrealUltimateData = {
      shotsDone: 0,
      shotCd: 0.3,
      barrageFired: false,
      barrageAngle: ang,
      barrageFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, ang, '#38bdf8', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'TIME FOR A TRUE DISPLAY OF SKILL!',
      '#facc15',
      'powerup',
    );
    ctx.addScreenShake(9);
    ctx.emitSfx({ type: 'dodge', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as EzrealUltimateData;
    if (data.barrageFlash > 0) data.barrageFlash = Math.max(0, data.barrageFlash - dt);

    if (!data.barrageFired && data.shotsDone < 3) {
      data.shotCd -= dt;
      if (data.shotCd <= 0) {
        data.shotCd = 0.44;
        data.shotsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        data.barrageAngle = ang;
        for (const offset of [-0.14, 0, 0.14]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('ezreal_q'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'zoltraak-orb',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 720,
            vy: Math.sin(a) * 720,
            radius: 10,
            damage: ctx.getEffectiveDamage(owner, 7.8),
            knockback: 185,
            color: '#38bdf8',
            secondaryColor: '#facc15',
            angle: a,
            life: 1.45,
            maxLife: 1.45,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.1 });
      }
    }

    if (!data.barrageFired && state.elapsed >= 2.0) {
      data.barrageFired = true;
      data.barrageFlash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 24.5),
          Math.cos(ang) * 560,
          Math.sin(ang) * 560,
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
        'TRUESHOT BARRAGE!!',
        '#38bdf8',
        'crit',
      );
      ctx.addScreenShake(17);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.45 });
    }
  },
};
