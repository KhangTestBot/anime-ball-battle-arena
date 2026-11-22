import type { UltimateHandler } from './types';

export interface EstarossaUltimateData {
  wavesDone: number;
  waveCd: number;
  sunFired: boolean;
  flash: number;
}

export const estarossaUltimateHandler: UltimateHandler = {
  characterId: 'estarossa',
  title: 'ARCHANGEL MAEL: GREATEST SUN & HELLBLAZE!',
  subtitle:
    'Dual Sunshine & Commandment power (+22% DMG, Fear Stun & Unstoppable), blasts 3 Hellblaze waves, and drops Greatest Sun!',
  bannerColor: '#dc2626',
  castDuration: 0.24,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 22;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.6);
    for (const e of ctx.getEnemies(owner)) {
      e.stunTimer = Math.max(e.stunTimer, 0.85);
      e.stunKind = 'fear';
    }

    const data: EstarossaUltimateData = {
      wavesDone: 0,
      waveCd: 0.32,
      sunFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#f8fafc', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'SUNSHINE: ARCHANGEL MAEL!',
      '#f8fafc',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'powerup', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as EstarossaUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.sunFired && data.wavesDone < 3) {
      data.waveCd -= dt;
      if (data.waveCd <= 0) {
        data.waveCd = 0.44;
        data.wavesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.18, 0, 0.18]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('mael_fire'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'fireball',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 650,
            vy: Math.sin(a) * 650,
            radius: 13,
            damage: ctx.getEffectiveDamage(owner, 8.4),
            knockback: 220,
            color: '#dc2626',
            secondaryColor: '#f8fafc',
            angle: a,
            life: 1.5,
            maxLife: 1.5,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.2 });
      }
    }

    if (!data.sunFired && state.elapsed >= 2.05) {
      data.sunFired = true;
      data.flash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        e.burnTimer = Math.max(e.burnTimer, 5.0);
        e.burnDps = Math.max(e.burnDps, 10.0);
        e.burnOwnerUid = owner.uid;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 27.0),
          Math.cos(ang) * 640,
          Math.sin(ang) * 640,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        350,
        '#f8fafc',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'GREATEST SUN!!',
        '#facc15',
        'crit',
      );
      ctx.addScreenShake(20);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.45 });
    }
  },
};
