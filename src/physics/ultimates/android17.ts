import type { UltimateHandler } from './types';

export interface Android17UltimateData {
  blockedProjectiles: number;
  volleysDone: number;
  volleyCd: number;
  strikeFired: boolean;
  flash: number;
}

export const android17UltimateHandler: UltimateHandler = {
  characterId: 'android17',
  title: 'ANDROID BARRIER: SUPER ELECTRIC STRIKE!',
  subtitle:
    'Raises Infinite Energy Barrier (Shield + Enchanted Armor + erases enemy projectiles), fires 3 ki volleys, and unleashes Super Electric Strike!',
  bannerColor: '#10b981',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.8);
    owner.shieldColor = '#10b981';
    owner.enchantArmorTimer = Math.max(owner.enchantArmorTimer, 3.8);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.4);

    const data: Android17UltimateData = {
      blockedProjectiles: 0,
      volleysDone: 0,
      volleyCd: 0.3,
      strikeFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#10b981', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'ANDROID BARRIER!!',
      '#10b981',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as Android17UltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    // Android Barrier erases enemy projectiles on contact!
    for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
      const p = ctx.projectiles[i];
      if (p.ownerUid === owner.uid || (owner.teamId && p.teamId === owner.teamId)) continue;
      if (Math.hypot(p.x - owner.x, p.y - owner.y) <= owner.radius + 90) {
        ctx.projectiles.splice(i, 1);
        data.blockedProjectiles += 1;
      }
    }

    if (!data.strikeFired && data.volleysDone < 3) {
      data.volleyCd -= dt;
      if (data.volleyCd <= 0) {
        data.volleyCd = 0.44;
        data.volleysDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.18, 0, 0.18]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('a17_ki'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'zoltraak-orb',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 680,
            vy: Math.sin(a) * 680,
            radius: 10,
            damage: ctx.getEffectiveDamage(owner, 7.6),
            knockback: 200,
            color: '#10b981',
            secondaryColor: '#f97316',
            angle: a,
            life: 1.45,
            maxLife: 1.45,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.15 });
      }
    }

    if (!data.strikeFired && state.elapsed >= 2.0) {
      data.strikeFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        e.paralyzeTimer = Math.max(e.paralyzeTimer, 2.2);
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 24.5),
          Math.cos(ang) * 580,
          Math.sin(ang) * 580,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        315,
        '#10b981',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'SUPER ELECTRIC STRIKE!!',
        '#10b981',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.45 });
    }
  },
};
