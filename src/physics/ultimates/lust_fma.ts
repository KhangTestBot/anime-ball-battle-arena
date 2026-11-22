import type { UltimateHandler } from './types';

export interface LustFmaUltimateData {
  spearsDone: number;
  spearCd: number;
  piercerFired: boolean;
  flash: number;
}

export const lustFmaUltimateHandler: UltimateHandler = {
  characterId: 'lust_fma',
  title: 'ULTIMATE SPEAR: CRIMSON CLAW BARRAGE!',
  subtitle:
    'Extends razor-sharp Ultimate Spear fingers (+18% DMG & Armor Shred), fires 4 piercing Spear volleys, and impales foes with Heart Piercer!',
  bannerColor: '#e11d48',
  castDuration: 0.2,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 18;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.0);

    const data: LustFmaUltimateData = {
      spearsDone: 0,
      spearCd: 0.28,
      piercerFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#e11d48', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'THE ULTIMATE SPEAR!!',
      '#e11d48',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'slash', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as LustFmaUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.piercerFired && data.spearsDone < 4) {
      data.spearCd -= dt;
      if (data.spearCd <= 0) {
        data.spearCd = 0.36;
        data.spearsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.18, 0, 0.18]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('lust_spear'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'arrow-trident',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 730,
            vy: Math.sin(a) * 730,
            radius: 10,
            damage: ctx.getEffectiveDamage(owner, 7.6),
            knockback: 205,
            color: '#e11d48',
            secondaryColor: '#f8fafc',
            angle: a,
            life: 1.45,
            maxLife: 1.45,
            piercing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.2 });
      }
    }

    if (!data.piercerFired && state.elapsed >= 2.0) {
      data.piercerFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        e.armorShredTimer = Math.max(e.armorShredTimer, 4.5);
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 25.0),
          Math.cos(ang) * 580,
          Math.sin(ang) * 580,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        315,
        '#e11d48',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'HEART PIERCER!!',
        '#e11d48',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
