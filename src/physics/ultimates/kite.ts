import type { UltimateHandler } from './types';

export interface KiteUltimateData {
  scythesDone: number;
  scytheCd: number;
  waltzFired: boolean;
  flash: number;
}

export const kiteUltimateHandler: UltimateHandler = {
  characterId: 'kite',
  title: 'CRAZY SLOTS #2: SILENT WALTZ!',
  subtitle:
    'Rolls Crazy Slots #2 Reaper Scythe (+20% DMG & Unstoppable), sweeps 3 piercing scythe waves, and cleaves the entire arena with Silent Waltz!',
  bannerColor: '#3b82f6',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 20;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.4);

    const data: KiteUltimateData = {
      scythesDone: 0,
      scytheCd: 0.3,
      waltzFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#3b82f6', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'CRAZY SLOTS #2... BAD SPIN.',
      '#ef4444',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'slash', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as KiteUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.waltzFired && data.scythesDone < 3) {
      data.scytheCd -= dt;
      if (data.scytheCd <= 0) {
        data.scytheCd = 0.44;
        data.scythesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.2, 0.2]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('kite_scythe'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'scythe',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 680,
            vy: Math.sin(a) * 680,
            radius: 15,
            damage: ctx.getEffectiveDamage(owner, 8.6),
            knockback: 225,
            color: '#3b82f6',
            secondaryColor: '#ef4444',
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

    if (!data.waltzFired && state.elapsed >= 2.0) {
      data.waltzFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        e.armorShredTimer = Math.max(e.armorShredTimer, 4.0);
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 26.0),
          Math.cos(ang) * 610,
          Math.sin(ang) * 610,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        335,
        '#ef4444',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'SILENT WALTZ!!',
        '#3b82f6',
        'crit',
      );
      ctx.addScreenShake(19);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'slash', intensity: 1.45 });
    }
  },
};
