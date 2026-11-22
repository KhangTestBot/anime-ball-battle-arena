import type { UltimateHandler } from './types';

export interface FeitanUltimateData {
  painBonusPct: number;
  heatwavesDone: number;
  heatwaveCd: number;
  risingSunFired: boolean;
  flash: number;
}

export const feitanUltimateHandler: UltimateHandler = {
  characterId: 'feitan',
  title: 'PAIN PACKER: RISING SUN!',
  subtitle:
    'Converts pain into scorching power (+18% to +36% DMG scaling with missing HP + Heat Armor), emits 3 heatwaves, and drops a miniature Rising Sun!',
  bannerColor: '#ef4444',
  castDuration: 0.24,
  duration: 4.0,

  onCast(ctx, owner, state) {
    const missingRatio = Math.max(0, Math.min(1, 1 - owner.hp / Math.max(1, owner.maxHp)));
    const painBonusPct = Math.round(18 + missingRatio * 18);
    owner.dmgBonusPct += painBonusPct;
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.8);
    owner.shieldColor = '#ef4444';
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.6);

    const data: FeitanUltimateData = {
      painBonusPct,
      heatwavesDone: 0,
      heatwaveCd: 0.34,
      risingSunFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ef4444', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      `PAIN PACKER +${painBonusPct}%!!`,
      '#ef4444',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'beam-fire', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as FeitanUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.risingSunFired && data.heatwavesDone < 3) {
      data.heatwaveCd -= dt;
      if (data.heatwaveCd <= 0) {
        data.heatwaveCd = 0.44;
        data.heatwavesDone += 1;
        for (const e of ctx.getEnemies(owner)) {
          e.burnTimer = Math.max(e.burnTimer, 4.5);
          e.burnDps = Math.max(e.burnDps, 9.5);
          e.burnOwnerUid = owner.uid;
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 8.2), 0, 0, {
            isCrit: true,
            sourceKind: 'ability',
          });
        }
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          225,
          '#ef4444',
          8,
          owner.character.id,
          owner.character.series,
        );
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.2 });
      }
    }

    if (!data.risingSunFired && state.elapsed >= 2.05) {
      data.risingSunFired = true;
      data.flash = 1.5;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        e.burnTimer = Math.max(e.burnTimer, 5.0);
        e.burnDps = Math.max(e.burnDps, 11.0);
        e.burnOwnerUid = owner.uid;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 27.0),
          Math.cos(ang) * 640,
          Math.sin(ang) * 640,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        360,
        '#facc15',
        13,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'RISING SUN!!',
        '#facc15',
        'crit',
      );
      ctx.addScreenShake(21);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.45 });
    }
  },
};
