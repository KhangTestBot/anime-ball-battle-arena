import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface NezukoUltimateData {
  burstsDone: number;
  burstCd: number;
  awakeningFired: boolean;
  flash: number;
}

export const nezukoUltimateHandler: UltimateHandler = {
  characterId: 'nezuko',
  title: 'BLOOD DEMON ART: EXPLODING BLOOD!',
  subtitle:
    'Awakens Demon Form (+20% DMG, Demon Regen & Unstoppable), ignites 3 burning pink Exploding Blood waves, and detonates Crimson Lotus Awakening!',
  bannerColor: '#ec4899',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 20;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.4);
    const heal = Math.round(owner.maxHp * 0.16 * getHealMultiplier(owner));
    if (heal > 0) {
      owner.hp = Math.min(owner.maxHp, owner.hp + heal);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 14,
        `+${heal} DEMON REGEN`,
        '#ec4899',
        'heal',
      );
    }

    const data: NezukoUltimateData = {
      burstsDone: 0,
      burstCd: 0.32,
      awakeningFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ec4899', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'BLOOD DEMON ART: EXPLODING BLOOD!',
      '#ec4899',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'beam-fire', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as NezukoUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.awakeningFired && data.burstsDone < 3) {
      data.burstCd -= dt;
      if (data.burstCd <= 0) {
        data.burstCd = 0.44;
        data.burstsDone += 1;
        for (const e of ctx.getEnemies(owner)) {
          e.burnTimer = Math.max(e.burnTimer, 4.0);
          e.burnDps = Math.max(e.burnDps, 9.0);
          e.burnOwnerUid = owner.uid;
          e.antiHealTimer = Math.max(e.antiHealTimer, 3.5);
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 8.4), 0, 0, {
            isCrit: true,
            sourceKind: 'ability',
          });
        }
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          210,
          '#ec4899',
          7,
          owner.character.id,
          owner.character.series,
        );
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.15 });
      }
    }

    if (!data.awakeningFired && state.elapsed >= 2.0) {
      data.awakeningFired = true;
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
        310,
        '#f97316',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'CRIMSON LOTUS AWAKENING!!',
        '#ec4899',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
