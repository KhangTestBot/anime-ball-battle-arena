import type { UltimateHandler } from './types';

export interface ShinobuUltimateData {
  stabsDone: number;
  stabCd: number;
  trailPts: Array<{ x: number; y: number }>;
  centipedeFired: boolean;
  flash: number;
}

export const shinobuUltimateHandler: UltimateHandler = {
  characterId: 'shinobu',
  title: 'INSECT BREATHING: DANCE OF THE CENTIPEDE',
  subtitle:
    'Weaves 4 untargetable zigzag strikes injecting lethal Wisteria Poison (DoT + Anti-Heal), climaxing in the Hundred-Legged Centipede Thrust!',
  bannerColor: '#a855f7',
  castDuration: 0.2,
  duration: 3.5,

  onCast(ctx, owner, state) {
    owner.evadeTimer = Math.max(owner.evadeTimer, 2.2);
    owner.untargetableTimer = Math.max(owner.untargetableTimer, 0.45);
    const data: ShinobuUltimateData = {
      stabsDone: 0,
      stabCd: 0.25,
      trailPts: [{ x: owner.x, y: owner.y }],
      centipedeFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#a855f7', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'DANCE OF THE CENTIPEDE!',
      '#e879f9',
      'powerup',
    );
    ctx.emitSfx({ type: 'dodge', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ShinobuUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    // 4 rapid zigzag Wisteria stabs
    if (!data.centipedeFired && data.stabsDone < 4) {
      data.stabCd -= dt;
      if (data.stabCd <= 0) {
        data.stabCd = 0.34;
        data.stabsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang =
            Math.atan2(target.y - owner.y, target.x - owner.x) +
            (data.stabsDone % 2 === 0 ? 0.8 : -0.8);
          owner.x = Math.max(
            ctx.bounds.left + owner.radius,
            Math.min(ctx.bounds.right - owner.radius, target.x + Math.cos(ang) * 65),
          );
          owner.y = Math.max(
            ctx.bounds.top + owner.radius,
            Math.min(ctx.bounds.bottom - owner.radius, target.y + Math.sin(ang) * 65),
          );
          data.trailPts.push({ x: owner.x, y: owner.y });

          target.karmaTimer = Math.max(target.karmaTimer, 4.2);
          target.karmaDps = Math.max(target.karmaDps, ctx.getEffectiveDamage(owner, 4.5));
          target.karmaOwnerUid = owner.uid;
          target.karmaKind = 'kr';
          target.antiHealTimer = Math.max(target.antiHealTimer, 4.0);
          ctx.applyDamage(owner, target, ctx.getEffectiveDamage(owner, 6.4), 0, 0, {
            sourceKind: 'ability',
          });
          ctx.spawnParticles(target.x, target.y, 10, '#c084fc', 55, 180, 2.5, 5, 'circle');
          ctx.emitSfx({ type: 'slash', intensity: 1.05 });
        }
      }
    }

    // Climax (1.9s): Hundred-Legged Centipede Thrust!
    if (!data.centipedeFired && state.elapsed >= 1.9) {
      data.centipedeFired = true;
      data.flash = 1.0;
      const target = ctx.getNearestEnemy(owner);
      if (target) {
        target.shieldTimer = 0;
        target.antiHealTimer = Math.max(target.antiHealTimer, 4.5);
        target.karmaTimer = Math.max(target.karmaTimer, 4.5);
        target.karmaDps = Math.max(target.karmaDps, ctx.getEffectiveDamage(owner, 5.4));
        target.karmaOwnerUid = owner.uid;
        target.karmaKind = 'kr';
        ctx.applyDamage(owner, target, ctx.getEffectiveDamage(owner, 18.5), 0, 0, {
          isCrit: true,
          bypassInvuln: true,
          sourceKind: 'ability',
        });
        ctx.spawnShockwave(
          target.x,
          target.y,
          175,
          '#a855f7',
          6,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(
          target.x,
          target.y - target.radius - 24,
          'WISTERIA LETHAL DOSE!',
          '#e879f9',
          'crit',
        );
        ctx.addScreenShake(13);
        ctx.addHitstop(0.055);
        ctx.emitSfx({ type: 'crit', intensity: 1.25 });
      }
    }
  },
};
