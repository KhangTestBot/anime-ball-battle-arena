import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface TechnobladeUltimateData {
  comboStrikes: number;
  strikeCd: number;
  climaxFired: boolean;
  flash: number;
}

export const technobladeUltimateHandler: UltimateHandler = {
  characterId: 'technoblade',
  title: 'BLOOD GOD: TECHNOBLADE NEVER DIES!',
  subtitle:
    'Arms Totem of Undying + Potato Crown (+20% DMG & Notch Heal), unleashes 3 Wither-Skull blitzes, and finishes with an Orphan Obliterator cleave!',
  bannerColor: '#f43f5e',
  castDuration: 0.24,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.totemActive = true;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.2);
    owner.enchantArmorTimer = Math.max(owner.enchantArmorTimer, 3.4);
    owner.dmgBonusPct += 20;

    const heal = Math.round(owner.maxHp * 0.14 * getHealMultiplier(owner));
    if (heal > 0) {
      owner.hp = Math.min(owner.maxHp, owner.hp + heal);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 16,
        `+${heal} BLOOD GOD`,
        '#fda4af',
        'heal',
      );
    }

    const data: TechnobladeUltimateData = {
      comboStrikes: 0,
      strikeCd: 0.35,
      climaxFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#facc15', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 28,
      'TECHNOBLADE NEVER DIES!!',
      '#facc15',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as TechnobladeUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.climaxFired && data.comboStrikes < 3) {
      data.strikeCd -= dt;
      if (data.strikeCd <= 0) {
        data.strikeCd = 0.45;
        data.comboStrikes += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        ctx.projectiles.push({
          id: ctx.nextId('techno_wither'),
          ownerUid: owner.uid,
          ownerCharId: owner.character.id,
          ownerSeries: owner.character.series,
          teamId: owner.teamId,
          kind: 'wither-skull',
          x: owner.x,
          y: owner.y,
          vx: Math.cos(ang) * 590,
          vy: Math.sin(ang) * 590,
          radius: 12,
          damage: ctx.getEffectiveDamage(owner, 9.6),
          knockback: 240,
          color: '#18181b',
          secondaryColor: '#facc15',
          angle: ang,
          life: 1.7,
          maxLife: 1.7,
          piercing: false,
          hitCooldowns: {},
          powerLevel: ctx.getForm(owner).powerLevel,
        });
        ctx.emitSfx({ type: 'slash', intensity: 1.15 });
      }
    }

    if (!data.climaxFired && state.elapsed >= 2.05) {
      data.climaxFired = true;
      data.flash = 1.3;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        e.armorShredTimer = Math.max(e.armorShredTimer, 3.5);
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 23.0),
          Math.cos(ang) * 560,
          Math.sin(ang) * 560,
          {
            isCrit: true,
            bypassInvuln: true,
            sourceKind: 'ability',
          },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        285,
        '#facc15',
        9,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'BLOOD FOR THE BLOOD GOD!',
        '#f43f5e',
        'crit',
      );
      ctx.addScreenShake(17);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },

  onExpire(_ctx, owner) {
    if (!owner) return;
    owner.totemActive = false;
  },
};
