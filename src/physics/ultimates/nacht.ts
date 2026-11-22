import type { UltimateHandler } from './types';

export interface NachtUltimateData {
  strikesDone: number;
  strikeCd: number;
  monumentFired: boolean;
  flash: number;
}

export const nachtUltimateHandler: UltimateHandler = {
  characterId: 'nacht',
  title: 'DEVIL UNION: MONUMENT OF ATONEMENT!',
  subtitle:
    'Unites with Gimodelo & Slotos (Auto-Dodge), warps 3 times through shadow portals, and seals foes in Monument of Atonement!',
  bannerColor: '#a855f7',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 3.0);
    owner.dmgBonusPct += 20;

    const data: NachtUltimateData = {
      strikesDone: 0,
      strikeCd: 0.28,
      monumentFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#334155', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'DEVIL UNION: MODE CANIS & EQUUS!!',
      '#a855f7',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'dodge', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as NachtUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.monumentFired && data.strikesDone < 3) {
      data.strikeCd -= dt;
      if (data.strikeCd <= 0) {
        data.strikeCd = 0.42;
        data.strikesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          const pad = owner.radius + 8;
          owner.x = Math.max(
            ctx.bounds.left + pad,
            Math.min(
              ctx.bounds.right - pad,
              target.x + Math.cos(ang) * (owner.radius + target.radius + 8),
            ),
          );
          owner.y = Math.max(
            ctx.bounds.top + pad,
            Math.min(
              ctx.bounds.bottom - pad,
              target.y + Math.sin(ang) * (owner.radius + target.radius + 8),
            ),
          );
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 9.6),
            Math.cos(ang) * 320,
            Math.sin(ang) * 320,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.2 });
        }
      }
    }

    if (!data.monumentFired && state.elapsed >= 2.0) {
      data.monumentFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.2);
        e.stunKind = 'fear';
        e.silenceTimer = Math.max(e.silenceTimer, 2.5);
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
        340,
        '#a855f7',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'MONUMENT OF ATONEMENT!!',
        '#c084fc',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};
