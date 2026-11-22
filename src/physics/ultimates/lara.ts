import type { UltimateHandler } from './types';

export interface LaraUltimateData {
  volleysDone: number;
  volleyCd: number;
  hammerFired: boolean;
  flash: number;
}

export const laraUltimateHandler: UltimateHandler = {
  characterId: 'lara',
  title: 'WAR HAMMER TITAN: CRYSTAL SPIKE ARSENAL!',
  subtitle:
    'Encases in hardened War Hammer crystal (Shield + Enchanted Armor), fires 3 Crystal Crossbow volleys, and impales the arena with Colossal War Hammer Smash!',
  bannerColor: '#e2e8f0',
  castDuration: 0.24,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.6);
    owner.shieldColor = '#e2e8f0';
    owner.enchantArmorTimer = Math.max(owner.enchantArmorTimer, 3.6);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.4);

    const data: LaraUltimateData = {
      volleysDone: 0,
      volleyCd: 0.34,
      hammerFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'WAR HAMMER TITAN!',
      '#e2e8f0',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as LaraUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.hammerFired && data.volleysDone < 3) {
      data.volleyCd -= dt;
      if (data.volleyCd <= 0) {
        data.volleyCd = 0.44;
        data.volleysDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.18, 0, 0.18]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('lara_bolt'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'arrow-trident',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 700,
            vy: Math.sin(a) * 700,
            radius: 10,
            damage: ctx.getEffectiveDamage(owner, 7.8),
            knockback: 215,
            color: '#e2e8f0',
            secondaryColor: '#38bdf8',
            angle: a,
            life: 1.45,
            maxLife: 1.45,
            piercing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.15 });
      }
    }

    if (!data.hammerFired && state.elapsed >= 2.05) {
      data.hammerFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.15);
        e.stunKind = 'petrified';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 25.5),
          Math.cos(ang) * 610,
          Math.sin(ang) * 610,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        325,
        '#38bdf8',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'COLOSSAL WAR HAMMER SMASH!!',
        '#e2e8f0',
        'crit',
      );
      ctx.addScreenShake(19);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
