import type { UltimateHandler } from './types';

export interface YamatoOpUltimateData {
  fangsDone: number;
  fangCd: number;
  baguaFired: boolean;
  flash: number;
}

export const yamatoOpUltimateHandler: UltimateHandler = {
  characterId: 'yamato_op',
  title: 'MYTHICAL ZOAN: THUNDER BAGUA & GLACIAL FANG!',
  subtitle:
    "Transforms into Okuchi no Makami (+20% DMG, Mirror Mountain Shield & Unstoppable), chains 3 Glacial Fang dashes, and slams Conqueror's Thunder Bagua!",
  bannerColor: '#22d3ee',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 20;
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.5);
    owner.shieldColor = '#22d3ee';
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.4);

    const data: YamatoOpUltimateData = {
      fangsDone: 0,
      fangCd: 0.3,
      baguaFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#22d3ee', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'OKUCHI NO MAKAMI!',
      '#22d3ee',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as YamatoOpUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.baguaFired && data.fangsDone < 3) {
      data.fangCd -= dt;
      if (data.fangCd <= 0) {
        data.fangCd = 0.44;
        data.fangsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          owner.vx = Math.cos(ang) * 670;
          owner.vy = Math.sin(ang) * 670;
          target.frostTimer = Math.max(target.frostTimer, 3.5);
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 9.2),
            Math.cos(ang) * 340,
            Math.sin(ang) * 340,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.2 });
        }
      }
    }

    if (!data.baguaFired && state.elapsed >= 2.0) {
      data.baguaFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        e.frostTimer = Math.max(e.frostTimer, 4.0);
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 25.5),
          Math.cos(ang) * 620,
          Math.sin(ang) * 620,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        320,
        '#22d3ee',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'THUNDER BAGUA!!',
        '#ef4444',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
