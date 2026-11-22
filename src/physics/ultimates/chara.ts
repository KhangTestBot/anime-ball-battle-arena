import type { UltimateHandler } from './types';

export interface CharaUltimateData {
  slashesDone: number;
  slashCd: number;
  eraseFired: boolean;
  flash: number;
}

export const charaUltimateHandler: UltimateHandler = {
  characterId: 'chara',
  title: 'REAL KNIFE: 999999999 ERASE WORLD!',
  subtitle:
    'Crimson genocide aura (+24% DMG & Unstoppable), chains 4 Real Knife teleports inflicting Armor Shred, and erases the arena with 999999999 Slash!',
  bannerColor: '#ef4444',
  castDuration: 0.24,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 24;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.6);

    const data: CharaUltimateData = {
      slashesDone: 0,
      slashCd: 0.28,
      eraseFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ef4444', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'SINCE WHEN WERE YOU IN CONTROL?',
      '#ef4444',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'slash', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as CharaUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.eraseFired && data.slashesDone < 4) {
      data.slashCd -= dt;
      if (data.slashCd <= 0) {
        data.slashCd = 0.36;
        data.slashesDone += 1;
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
          target.armorShredTimer = Math.max(target.armorShredTimer, 4.0);
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 9.6),
            Math.cos(ang) * 280,
            Math.sin(ang) * 280,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.25 });
        }
      }
    }

    if (!data.eraseFired && state.elapsed >= 2.05) {
      data.eraseFired = true;
      data.flash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 27.5),
          Math.cos(ang) * 620,
          Math.sin(ang) * 620,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        350,
        '#ef4444',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        '999999999 ERASE!!',
        '#ef4444',
        'crit',
      );
      ctx.addScreenShake(21);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.45 });
    }
  },
};
