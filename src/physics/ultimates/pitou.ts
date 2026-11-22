import type { UltimateHandler } from './types';

export interface PitouUltimateData {
  pouncesDone: number;
  pounceCd: number;
  rendFired: boolean;
  flash: number;
}

export const pitouUltimateHandler: UltimateHandler = {
  characterId: 'pitou',
  title: 'TERPSICHORA: POST-MORTEM NEN!',
  subtitle:
    'Puppeteer Nen refuses death (Totem Revive + +20% DMG & Unstoppable), chains 4 blinding Terpsichora blinks, and tears through all foes!',
  bannerColor: '#ec4899',
  castDuration: 0.2,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.totemActive = true;
    owner.dmgBonusPct += 20;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.6);

    const data: PitouUltimateData = {
      pouncesDone: 0,
      pounceCd: 0.26,
      rendFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ec4899', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'TERPSICHORA!!',
      '#ec4899',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'slash', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as PitouUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.rendFired && data.pouncesDone < 4) {
      data.pounceCd -= dt;
      if (data.pounceCd <= 0) {
        data.pounceCd = 0.34;
        data.pouncesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          const pad = owner.radius + 8;
          owner.x = Math.max(
            ctx.bounds.left + pad,
            Math.min(
              ctx.bounds.right - pad,
              target.x - Math.cos(ang) * (owner.radius + target.radius + 8),
            ),
          );
          owner.y = Math.max(
            ctx.bounds.top + pad,
            Math.min(
              ctx.bounds.bottom - pad,
              target.y - Math.sin(ang) * (owner.radius + target.radius + 8),
            ),
          );
          target.armorShredTimer = Math.max(target.armorShredTimer, 3.8);
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 9.6),
            Math.cos(ang) * 320,
            Math.sin(ang) * 320,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.25 });
        }
      }
    }

    if (!data.rendFired && state.elapsed >= 2.05) {
      data.rendFired = true;
      data.flash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 26.5),
          Math.cos(ang) * 620,
          Math.sin(ang) * 620,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        340,
        '#ec4899',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'POST-MORTEM TERPSICHORA!!',
        '#38bdf8',
        'crit',
      );
      ctx.addScreenShake(20);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },

  onExpire(_ctx, owner) {
    if (!owner) return;
    owner.totemActive = false;
  },
};
