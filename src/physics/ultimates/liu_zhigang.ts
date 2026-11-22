import type { UltimateHandler } from './types';

export interface LiuZhigangUltimateData {
  wavesDone: number;
  waveCd: number;
  crossFired: boolean;
  flash: number;
}

export const liuZhigangUltimateHandler: UltimateHandler = {
  characterId: 'liu_zhigang',
  title: 'SEVEN-STAR HUNTER: TWIN-BLADE GALE!',
  subtitle:
    'Dual-wields crimson-gold sabers (+18% DMG), unleashes 4 crossing Seven-Star Sword Waves, and finishes with Cross Annihilation!',
  bannerColor: '#ef4444',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 18;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.0);

    const data: LiuZhigangUltimateData = {
      wavesDone: 0,
      waveCd: 0.3,
      crossFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ef4444', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'SEVEN-STAR HUNTER!',
      '#facc15',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'slash', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as LiuZhigangUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.crossFired && data.wavesDone < 4) {
      data.waveCd -= dt;
      if (data.waveCd <= 0) {
        data.waveCd = 0.36;
        data.wavesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.18, 0.18]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('liu_saber'),
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
            damage: ctx.getEffectiveDamage(owner, 7.8),
            knockback: 210,
            color: '#ef4444',
            secondaryColor: '#facc15',
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

    if (!data.crossFired && state.elapsed >= 2.0) {
      data.crossFired = true;
      data.flash = 1.3;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
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
        305,
        '#facc15',
        10,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'CROSS ANNIHILATION!!',
        '#ef4444',
        'crit',
      );
      ctx.addScreenShake(17);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
