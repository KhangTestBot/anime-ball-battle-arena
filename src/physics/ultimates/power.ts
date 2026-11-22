import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface PowerUltimateData {
  spearsDone: number;
  spearCd: number;
  bloodRainFired: boolean;
  flash: number;
}

export const powerUltimateHandler: UltimateHandler = {
  characterId: 'power',
  title: 'BLOOD DEVIL: THOUSAND TERRA BLOOD RAIN!',
  subtitle:
    'True Blood Devil form (+20% DMG, Blood Drain Heal & Anti-Heal), launches 4 Blood Spear volleys, and impales the arena with Blood Rain!',
  bannerColor: '#ef4444',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 20;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.2);
    const heal = Math.round(owner.maxHp * 0.16 * getHealMultiplier(owner));
    if (heal > 0) {
      owner.hp = Math.min(owner.maxHp, owner.hp + heal);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 14,
        `+${heal} BLOOD DRAIN`,
        '#ef4444',
        'heal',
      );
    }

    const data: PowerUltimateData = {
      spearsDone: 0,
      spearCd: 0.28,
      bloodRainFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ef4444', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'BOW BEFORE THE BLOOD DEVIL!!',
      '#ef4444',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'slash', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as PowerUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.bloodRainFired && data.spearsDone < 4) {
      data.spearCd -= dt;
      if (data.spearCd <= 0) {
        data.spearCd = 0.36;
        data.spearsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.2, 0, 0.2]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('power_blood'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'arrow-trident',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 690,
            vy: Math.sin(a) * 690,
            radius: 10,
            damage: ctx.getEffectiveDamage(owner, 7.4),
            knockback: 205,
            color: '#ef4444',
            secondaryColor: '#facc15',
            angle: a,
            life: 1.45,
            maxLife: 1.45,
            piercing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.2 });
      }
    }

    if (!data.bloodRainFired && state.elapsed >= 2.0) {
      data.bloodRainFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.antiHealTimer = Math.max(e.antiHealTimer, 4.5);
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 25.0),
          Math.cos(ang) * 590,
          Math.sin(ang) * 590,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        320,
        '#ef4444',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'THOUSAND TERRA BLOOD RAIN!!',
        '#ef4444',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
