import type { UltimateHandler } from './types';

export interface KarnaUltimateData {
  flaresDone: number;
  flareCd: number;
  vasaviFired: boolean;
  flash: number;
}

export const karnaUltimateHandler: UltimateHandler = {
  characterId: 'karna',
  title: 'VASAVI SHAKTI: O SUN, ABIDE TO DEATH!',
  subtitle:
    'Golden Armor Kavacha & Kundala (Shield + Unstoppable), fires 3 Brahmastra Kundala solar volleys, and hurls VASAVI SHAKTI!',
  bannerColor: '#facc15',
  castDuration: 0.24,
  duration: 4.1,

  onCast(ctx, owner, state) {
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.4);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.6);
    owner.dmgBonusPct += 24;

    const data: KarnaUltimateData = {
      flaresDone: 0,
      flareCd: 0.3,
      vasaviFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#facc15', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'KNOW THE MERCY OF THE KING OF GODS!!',
      '#facc15',
      'powerup',
    );
    ctx.addScreenShake(13);
    ctx.emitSfx({ type: 'powerup', intensity: 1.35 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as KarnaUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.vasaviFired && data.flaresDone < 3) {
      data.flareCd -= dt;
      if (data.flareCd <= 0) {
        data.flareCd = 0.44;
        data.flaresDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.2, 0, 0.2]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('karna_sun'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'fireball',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 740,
            vy: Math.sin(a) * 740,
            radius: 14,
            damage: ctx.getEffectiveDamage(owner, 9.0),
            knockback: 235,
            color: '#facc15',
            secondaryColor: '#ef4444',
            angle: a,
            life: 1.5,
            maxLife: 1.5,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.25 });
      }
    }

    if (!data.vasaviFired && state.elapsed >= 2.05) {
      data.vasaviFired = true;
      data.flash = 1.5;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 29.0),
          Math.cos(ang) * 700,
          Math.sin(ang) * 700,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        375,
        '#facc15',
        13,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'VASAVI SHAKTI!!',
        '#ef4444',
        'crit',
      );
      ctx.addScreenShake(22);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.5 });
    }
  },
};
