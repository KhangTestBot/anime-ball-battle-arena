import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface KaynUltimateData {
  scythesDone: number;
  scytheCd: number;
  trespassFired: boolean;
  flash: number;
}

export const kaynUltimateHandler: UltimateHandler = {
  characterId: 'kayn',
  title: 'UMBRAL TRESPASS (R): SHADOW & RHAAST!',
  subtitle:
    'Unleashes Darkin & Shadow Assassin (+20% DMG, Auto-Dodge & Rhaast Heal), hurls 4 Reaping Slash scythes, and erupts from inside foes with Umbral Trespass!',
  bannerColor: '#dc2626',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 20;
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 2.8);
    const heal = Math.round(owner.maxHp * 0.14 * getHealMultiplier(owner));
    if (heal > 0) {
      owner.hp = Math.min(owner.maxHp, owner.hp + heal);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 14,
        `+${heal} RHAAST DRAIN`,
        '#dc2626',
        'heal',
      );
    }

    const data: KaynUltimateData = {
      scythesDone: 0,
      scytheCd: 0.28,
      trespassFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#dc2626', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'UMBRAL TRESPASS!!',
      '#dc2626',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'slash', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as KaynUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.trespassFired && data.scythesDone < 4) {
      data.scytheCd -= dt;
      if (data.scytheCd <= 0) {
        data.scytheCd = 0.36;
        data.scythesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.18, 0.18]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('kayn_scythe'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'scythe',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 670,
            vy: Math.sin(a) * 670,
            radius: 13,
            damage: ctx.getEffectiveDamage(owner, 7.6),
            knockback: 205,
            color: '#dc2626',
            secondaryColor: '#3b82f6',
            angle: a,
            life: 1.4,
            maxLife: 1.4,
            piercing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.2 });
      }
    }

    if (!data.trespassFired && state.elapsed >= 2.0) {
      data.trespassFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 25.5),
          Math.cos(ang) * 590,
          Math.sin(ang) * 590,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        320,
        '#3b82f6',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'DARKIN REAPING!!',
        '#dc2626',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};
