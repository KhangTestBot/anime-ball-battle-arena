import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface AshbornUltimateData {
  legionWaves: number;
  waveCd: number;
  domainFired: boolean;
  flash: number;
}

export const ashbornUltimateHandler: UltimateHandler = {
  characterId: 'ashborn',
  title: 'ORIGINAL SHADOW MONARCH: ARISE!',
  subtitle:
    'Invokes ARISE! (Shadow Revive Totem, +22% DMG, Shadow Shield & Heal), unleashes 3 Shadow Legion pulses, and crushes all foes in the Domain of the Shadow Monarch!',
  bannerColor: '#a855f7',
  castDuration: 0.26,
  duration: 4.2,

  onCast(ctx, owner, state) {
    owner.totemActive = true;
    owner.dmgBonusPct += 22;
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.8);
    owner.shieldColor = '#a855f7';
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.8);
    const heal = Math.round(owner.maxHp * 0.14 * getHealMultiplier(owner));
    if (heal > 0) {
      owner.hp = Math.min(owner.maxHp, owner.hp + heal);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 14,
        `+${heal} SHADOW MONARCH`,
        '#c084fc',
        'heal',
      );
    }

    const data: AshbornUltimateData = {
      legionWaves: 0,
      waveCd: 0.34,
      domainFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#a855f7', 'ULT', true);
    ctx.spawnFloatingText(owner.x, owner.y - owner.radius - 28, 'ARISE!!', '#38bdf8', 'powerup');
    ctx.addScreenShake(13);
    ctx.emitSfx({ type: 'powerup', intensity: 1.35 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as AshbornUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.domainFired && data.legionWaves < 3) {
      data.waveCd -= dt;
      if (data.waveCd <= 0) {
        data.waveCd = 0.45;
        data.legionWaves += 1;
        for (const e of ctx.getEnemies(owner)) {
          e.armorShredTimer = Math.max(e.armorShredTimer, 3.5);
          const dx = owner.x - e.x;
          const dy = owner.y - e.y;
          const dist = Math.max(1, Math.hypot(dx, dy));
          e.vx += (dx / dist) * 240;
          e.vy += (dy / dist) * 240;
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 9.2), 0, 0, {
            isCrit: true,
            sourceKind: 'ability',
          });
        }
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          240,
          '#a855f7',
          8,
          owner.character.id,
          owner.character.series,
        );
        ctx.emitSfx({ type: 'powerup', intensity: 1.2 });
      }
    }

    if (!data.domainFired && state.elapsed >= 2.1) {
      data.domainFired = true;
      data.flash = 1.5;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        e.stunTimer = Math.max(e.stunTimer, 1.2);
        e.stunKind = 'fear';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 27.5),
          Math.cos(ang) * 630,
          Math.sin(ang) * 630,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        360,
        '#38bdf8',
        13,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'SHADOW MONARCH DOMAIN!!',
        '#a855f7',
        'crit',
      );
      ctx.addScreenShake(21);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.45 });
    }
  },

  onExpire(_ctx, owner) {
    if (!owner) return;
    owner.totemActive = false;
  },
};
