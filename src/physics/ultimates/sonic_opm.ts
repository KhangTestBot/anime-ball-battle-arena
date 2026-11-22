import type { UltimateHandler } from './types';

export interface SonicOpmUltimateData {
  wavesDone: number;
  waveCd: number;
  carnageFired: boolean;
  flash: number;
}

export const sonicOpmUltimateHandler: UltimateHandler = {
  characterId: 'sonic_opm',
  title: 'TEN SHADOWS BURIAL: HAIL OF CARNAGE!',
  subtitle:
    'Splits into 10 speed-clones, throws 3 volleys of Exploding Shuriken, and finishes with an inescapable Hail of Carnage ambush!',
  bannerColor: '#a855f7',
  castDuration: 0.2,
  duration: 3.8,

  onCast(ctx, owner, state) {
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 2.8);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.5);

    const data: SonicOpmUltimateData = {
      wavesDone: 0,
      waveCd: 0.3,
      carnageFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#a855f7', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'TEN SHADOWS BURIAL!',
      '#c084fc',
      'powerup',
    );
    ctx.addScreenShake(9);
    ctx.emitSfx({ type: 'dodge', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as SonicOpmUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.carnageFired && data.wavesDone < 3) {
      data.waveCd -= dt;
      if (data.waveCd <= 0) {
        data.waveCd = 0.44;
        data.wavesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.28, -0.1, 0.1, 0.28]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('sonic_shuriken'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'arrow-trident',
            x: owner.x + Math.cos(a) * (owner.radius + 8),
            y: owner.y + Math.sin(a) * (owner.radius + 8),
            vx: Math.cos(a) * 690,
            vy: Math.sin(a) * 690,
            radius: 9,
            damage: ctx.getEffectiveDamage(owner, 6.2),
            knockback: 165,
            color: '#a855f7',
            secondaryColor: '#e2e8f0',
            angle: a,
            life: 1.4,
            maxLife: 1.4,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.1 });
      }
    }

    if (!data.carnageFired && state.elapsed >= 1.95) {
      data.carnageFired = true;
      data.flash = 1.25;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 21.5),
          Math.cos(ang) * 470,
          Math.sin(ang) * 470,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        280,
        '#a855f7',
        9,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'HAIL OF CARNAGE!',
        '#e2e8f0',
        'crit',
      );
      ctx.addScreenShake(15);
      ctx.addHitstop(0.06);
      ctx.emitSfx({ type: 'slash', intensity: 1.35 });
    }
  },
};
