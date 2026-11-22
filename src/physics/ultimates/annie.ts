import type { UltimateHandler } from './types';

export interface AnnieUltimateData {
  kicksDone: number;
  kickCd: number;
  roundhouseFired: boolean;
  flash: number;
}

export const annieUltimateHandler: UltimateHandler = {
  characterId: 'annie',
  title: 'FEMALE TITAN: CRYSTAL HARDENING!',
  subtitle:
    'Hardens crystal knuckles (+16% DMG, Shield & Auto-Dodge), chains 4 armor-shredding martial blinks, and shatters foes with Crystal Roundhouse!',
  bannerColor: '#38bdf8',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 16;
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.2);
    owner.shieldColor = '#38bdf8';
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 2.5);

    const data: AnnieUltimateData = {
      kicksDone: 0,
      kickCd: 0.28,
      roundhouseFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'CRYSTAL HARDENING!',
      '#38bdf8',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as AnnieUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.roundhouseFired && data.kicksDone < 4) {
      data.kickCd -= dt;
      if (data.kickCd <= 0) {
        data.kickCd = 0.36;
        data.kicksDone += 1;
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
          target.armorShredTimer = Math.max(target.armorShredTimer, 3.2);
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 8.8),
            Math.cos(ang) * 320,
            Math.sin(ang) * 320,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.spawnShockwave(
            target.x,
            target.y,
            120,
            '#38bdf8',
            6,
            owner.character.id,
            owner.character.series,
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.2 });
        }
      }
    }

    if (!data.roundhouseFired && state.elapsed >= 2.0) {
      data.roundhouseFired = true;
      data.flash = 1.3;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.1);
        e.stunKind = 'frozen';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 23.0),
          Math.cos(ang) * 560,
          Math.sin(ang) * 560,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        295,
        '#38bdf8',
        10,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'CRYSTAL SHATTER ROUNDHOUSE!!',
        '#facc15',
        'crit',
      );
      ctx.addScreenShake(17);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.3 });
    }
  },
};
