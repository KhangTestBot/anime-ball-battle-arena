import type { UltimateHandler } from './types';

export interface ChoiJongInUltimateData {
  spearsFired: number;
  spearCd: number;
  prisonFired: boolean;
  flash: number;
}

export const choiJongInUltimateHandler: UltimateHandler = {
  characterId: 'choi_jongin',
  title: 'ULTIMATE SOLDIER: FLAME SPEAR MATRIX!',
  subtitle:
    'Conjures 4 barrages of blazing Flame Spears and incinerates the battlefield with Flame Dragon Prison!',
  bannerColor: '#f97316',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 16;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.8);

    const data: ChoiJongInUltimateData = {
      spearsFired: 0,
      spearCd: 0.28,
      prisonFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#f97316', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'FLAME SPEAR MATRIX!',
      '#f97316',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'beam-fire', intensity: 1.15 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ChoiJongInUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.prisonFired && data.spearsFired < 4) {
      data.spearCd -= dt;
      if (data.spearCd <= 0) {
        data.spearCd = 0.36;
        data.spearsFired += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.2, 0, 0.2]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('choi_spear'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'fireball',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 650,
            vy: Math.sin(a) * 650,
            radius: 11,
            damage: ctx.getEffectiveDamage(owner, 7.0),
            knockback: 185,
            color: '#f97316',
            secondaryColor: '#ef4444',
            angle: a,
            life: 1.45,
            maxLife: 1.45,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.05 });
      }
    }

    if (!data.prisonFired && state.elapsed >= 2.0) {
      data.prisonFired = true;
      data.flash = 1.3;
      for (const e of ctx.getEnemies(owner)) {
        e.burnTimer = Math.max(e.burnTimer, 4.5);
        e.burnDps = Math.max(e.burnDps, 9.5);
        e.burnOwnerUid = owner.uid;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 23.0),
          Math.cos(ang) * 520,
          Math.sin(ang) * 520,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        305,
        '#f97316',
        10,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'FLAME DRAGON PRISON!!',
        '#ef4444',
        'crit',
      );
      ctx.addScreenShake(16);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.4 });
    }
  },
};
