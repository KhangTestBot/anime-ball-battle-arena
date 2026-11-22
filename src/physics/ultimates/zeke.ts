import type { UltimateHandler } from './types';

export interface ZekeUltimateData {
  pitchesDone: number;
  pitchCd: number;
  perfectGameFired: boolean;
  flash: number;
}

export const zekeUltimateHandler: UltimateHandler = {
  characterId: 'zeke',
  title: 'BEAST TITAN: PERFECT GAME BARRAGE!',
  subtitle:
    'Unleashes Royal Scream (Fear Stun), hurls 4 supersonic boulder-shrapnel barrages, and finishes with a Mach-speed Perfect Game pitch!',
  bannerColor: '#d97706',
  castDuration: 0.24,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.2);
    for (const e of ctx.getEnemies(owner)) {
      e.stunTimer = Math.max(e.stunTimer, 0.85);
      e.stunKind = 'fear';
    }

    const data: ZekeUltimateData = {
      pitchesDone: 0,
      pitchCd: 0.28,
      perfectGameFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#d97706', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'PERFECT GAME!!',
      '#d97706',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ZekeUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.perfectGameFired && data.pitchesDone < 4) {
      data.pitchCd -= dt;
      if (data.pitchCd <= 0) {
        data.pitchCd = 0.36;
        data.pitchesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.24, -0.08, 0.08, 0.24]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('zeke_boulder'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'meteor',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 690,
            vy: Math.sin(a) * 690,
            radius: 10,
            damage: ctx.getEffectiveDamage(owner, 6.4),
            knockback: 210,
            color: '#d97706',
            secondaryColor: '#ef4444',
            angle: a,
            life: 1.4,
            maxLife: 1.4,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'wall', intensity: 1.15 });
      }
    }

    if (!data.perfectGameFired && state.elapsed >= 2.05) {
      data.perfectGameFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 25.0),
          Math.cos(ang) * 620,
          Math.sin(ang) * 620,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        320,
        '#ef4444',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'MACH BOULDER ANNIHILATION!!',
        '#d97706',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
