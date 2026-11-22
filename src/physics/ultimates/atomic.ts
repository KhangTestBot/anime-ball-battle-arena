import type { UltimateHandler } from './types';

export interface AtomicUltimateData {
  wavesDone: number;
  waveCd: number;
  focusedFired: boolean;
  flash: number;
}

export const atomicUltimateHandler: UltimateHandler = {
  characterId: 'atomic',
  title: 'ATOMIC SLASH: SUN BLADE!',
  subtitle:
    'Draws the Sun Blade (+18% DMG), slices enemy projectiles out of the air, unleashes 4 Atomic Slash waves, and finishes with Focused Atomic Slash!',
  bannerColor: '#ef4444',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 18;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.8);

    const data: AtomicUltimateData = {
      wavesDone: 0,
      waveCd: 0.3,
      focusedFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ef4444', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'SUN BLADE UNSHEATHED!',
      '#facc15',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'slash', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as AtomicUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    // Slice apart nearby enemy projectiles
    for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
      const p = ctx.projectiles[i];
      if (p.ownerUid === owner.uid || (owner.teamId && p.teamId === owner.teamId)) continue;
      if (Math.hypot(p.x - owner.x, p.y - owner.y) <= 135) {
        ctx.projectiles.splice(i, 1);
      }
    }

    if (!data.focusedFired && data.wavesDone < 4) {
      data.waveCd -= dt;
      if (data.waveCd <= 0) {
        data.waveCd = 0.34;
        data.wavesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.22, 0, 0.22]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('atomic_slash'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'sword-wave',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 680,
            vy: Math.sin(a) * 680,
            radius: 14,
            damage: ctx.getEffectiveDamage(owner, 6.8),
            knockback: 190,
            color: '#ef4444',
            secondaryColor: '#facc15',
            angle: a,
            life: 1.2,
            maxLife: 1.2,
            piercing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.25 });
      }
    }

    if (!data.focusedFired && state.elapsed >= 2.0) {
      data.focusedFired = true;
      data.flash = 1.3;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        e.armorShredTimer = Math.max(e.armorShredTimer, 4.0);
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 24.5),
          Math.cos(ang) * 510,
          Math.sin(ang) * 510,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        300,
        '#facc15',
        10,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'FOCUSED ATOMIC SLASH!!',
        '#ef4444',
        'crit',
      );
      ctx.addScreenShake(17);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'slash', intensity: 1.45 });
    }
  },
};
