import type { UltimateHandler } from './types';

export interface FatherFmaUltimateData {
  wavesDone: number;
  waveCd: number;
  sunFired: boolean;
  flash: number;
}

export const fatherFmaUltimateHandler: UltimateHandler = {
  characterId: 'father_fma',
  title: 'TRUTH ABSORBED: MINIATURE SUN IN MY PALM!',
  subtitle:
    'Absorbs God (+24% DMG, Totem Revive, Enchanted Armor & Unstoppable), blasts 3 Philosopher Stone waves, and detonates a Miniature Nuclear Sun!',
  bannerColor: '#facc15',
  castDuration: 0.26,
  duration: 4.2,

  onCast(ctx, owner, state) {
    owner.totemActive = true;
    owner.dmgBonusPct += 24;
    owner.enchantArmorTimer = Math.max(owner.enchantArmorTimer, 4.0);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 4.0);

    const data: FatherFmaUltimateData = {
      wavesDone: 0,
      waveCd: 0.34,
      sunFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#facc15', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 28,
      'I HAVE SWALLOWED GOD!!',
      '#facc15',
      'powerup',
    );
    ctx.addScreenShake(13);
    ctx.emitSfx({ type: 'powerup', intensity: 1.4 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as FatherFmaUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.sunFired && data.wavesDone < 3) {
      data.waveCd -= dt;
      if (data.waveCd <= 0) {
        data.waveCd = 0.45;
        data.wavesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.22, 0, 0.22]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('father_stone'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'fireball',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 660,
            vy: Math.sin(a) * 660,
            radius: 13,
            damage: ctx.getEffectiveDamage(owner, 8.6),
            knockback: 230,
            color: '#facc15',
            secondaryColor: '#dc2626',
            angle: a,
            life: 1.55,
            maxLife: 1.55,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.25 });
      }
    }

    if (!data.sunFired && state.elapsed >= 2.1) {
      data.sunFired = true;
      data.flash = 1.5;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        e.burnTimer = Math.max(e.burnTimer, 5.0);
        e.burnDps = Math.max(e.burnDps, 10.5);
        e.burnOwnerUid = owner.uid;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 28.5),
          Math.cos(ang) * 670,
          Math.sin(ang) * 670,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        370,
        '#facc15',
        14,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'MINIATURE NUCLEAR SUN!!',
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
