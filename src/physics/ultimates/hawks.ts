import type { UltimateHandler } from './types';

export interface HawksUltimateData {
  feathersDone: number;
  featherCd: number;
  blitzFired: boolean;
  flash: number;
}

export const hawksUltimateHandler: UltimateHandler = {
  characterId: 'hawks',
  title: 'FIERCE WINGS: FEATHER BLADE STORM!',
  subtitle:
    'No. 2 Hero hyperspeed (+18% DMG & Auto-Dodge), launches 4 crimson Fierce Wings feather volleys, and slices all foes with Feather Blade Blitz!',
  bannerColor: '#ef4444',
  castDuration: 0.2,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 18;
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 3.0);

    const data: HawksUltimateData = {
      feathersDone: 0,
      featherCd: 0.26,
      blitzFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ef4444', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'FIERCE WINGS: FULL SPEED!',
      '#ef4444',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'dodge', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as HawksUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.blitzFired && data.feathersDone < 4) {
      data.featherCd -= dt;
      if (data.featherCd <= 0) {
        data.featherCd = 0.34;
        data.feathersDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.24, -0.08, 0.08, 0.24]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('hawks_feather'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'arrow-trident',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 740,
            vy: Math.sin(a) * 740,
            radius: 9,
            damage: ctx.getEffectiveDamage(owner, 6.4),
            knockback: 185,
            color: '#ef4444',
            secondaryColor: '#facc15',
            angle: a,
            life: 1.4,
            maxLife: 1.4,
            piercing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.2 });
      }
    }

    if (!data.blitzFired && state.elapsed >= 2.0) {
      data.blitzFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
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
        '#ef4444',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'CRIMSON FEATHER BLITZ!!',
        '#facc15',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'slash', intensity: 1.4 });
    }
  },
};
