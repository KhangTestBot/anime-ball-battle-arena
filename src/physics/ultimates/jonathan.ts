import type { UltimateHandler } from './types';

export interface JonathanUltimateData {
  wavesDone: number;
  waveCd: number;
  sunlightFired: boolean;
  flash: number;
}

export const jonathanUltimateHandler: UltimateHandler = {
  characterId: 'jonathan',
  title: 'SUNLIGHT YELLOW OVERDRIVE!!',
  subtitle:
    'Channels pure solar Hamon (Unstoppable + +16% HP), unleashes 3 Pluck & Hamon waves, and blazes with Sunlight Yellow Overdrive!',
  bannerColor: '#facc15',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.hp = Math.min(owner.maxHp, owner.hp + owner.maxHp * 0.16);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.4);
    owner.dmgBonusPct += 20;

    const data: JonathanUltimateData = {
      wavesDone: 0,
      waveCd: 0.3,
      sunlightFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#facc15', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'HAMON BREATHING: OVERDRIVE!!',
      '#facc15',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as JonathanUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.sunlightFired && data.wavesDone < 3) {
      data.waveCd -= dt;
      if (data.waveCd <= 0) {
        data.waveCd = 0.44;
        data.wavesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.18, 0, 0.18]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('jonathan_pluck'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'sword-wave',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 690,
            vy: Math.sin(a) * 690,
            radius: 13,
            damage: ctx.getEffectiveDamage(owner, 8.2),
            knockback: 225,
            color: '#facc15',
            secondaryColor: '#3b82f6',
            angle: a,
            life: 1.4,
            maxLife: 1.4,
            piercing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.2 });
      }
    }

    if (!data.sunlightFired && state.elapsed >= 2.0) {
      data.sunlightFired = true;
      data.flash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 26.5),
          Math.cos(ang) * 640,
          Math.sin(ang) * 640,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        340,
        '#facc15',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'SUNLIGHT YELLOW OVERDRIVE!!',
        '#facc15',
        'crit',
      );
      ctx.addScreenShake(19);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};
