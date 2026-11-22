import type { UltimateHandler } from './types';

export interface KarsUltimateData {
  bladesDone: number;
  bladeCd: number;
  solarFired: boolean;
  flash: number;
}

export const karsUltimateHandler: UltimateHandler = {
  characterId: 'kars',
  title: 'ULTIMATE LIFEFORM: SOLAR HAMON!',
  subtitle:
    'Ascends with the Red Stone of Aja (Totem Revive + Unstoppable + +25% DMG), fires 3 Light Mode volleys, and unleashes 100x Solar Hamon!',
  bannerColor: '#a855f7',
  castDuration: 0.24,
  duration: 4.1,

  onCast(ctx, owner, state) {
    owner.totemActive = true;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.8);
    owner.dmgBonusPct += 25;

    const data: KarsUltimateData = {
      bladesDone: 0,
      bladeCd: 0.3,
      solarFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#a855f7', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'THE ULTIMATE LIFEFORM HAS AWAKENED!!',
      '#facc15',
      'powerup',
    );
    ctx.addScreenShake(13);
    ctx.emitSfx({ type: 'powerup', intensity: 1.35 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as KarsUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.solarFired && data.bladesDone < 3) {
      data.bladeCd -= dt;
      if (data.bladeCd <= 0) {
        data.bladeCd = 0.44;
        data.bladesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.2, 0, 0.2]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('kars_light'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'sword-wave',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 720,
            vy: Math.sin(a) * 720,
            radius: 13,
            damage: ctx.getEffectiveDamage(owner, 8.8),
            knockback: 230,
            color: '#facc15',
            secondaryColor: '#a855f7',
            angle: a,
            life: 1.45,
            maxLife: 1.45,
            piercing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.25 });
      }
    }

    if (!data.solarFired && state.elapsed >= 2.05) {
      data.solarFired = true;
      data.flash = 1.5;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 28.0),
          Math.cos(ang) * 670,
          Math.sin(ang) * 670,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        365,
        '#facc15',
        13,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        '100x SOLAR HAMON ERUPTION!!',
        '#facc15',
        'crit',
      );
      ctx.addScreenShake(22);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.5 });
    }
  },

  onExpire(_ctx, owner) {
    if (!owner) return;
    owner.totemActive = false;
  },
};
