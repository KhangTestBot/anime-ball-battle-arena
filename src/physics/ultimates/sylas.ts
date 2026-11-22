import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface SylasUltimateData {
  lashesDone: number;
  lashCd: number;
  hijackFired: boolean;
  flash: number;
}

export const sylasUltimateHandler: UltimateHandler = {
  characterId: 'sylas',
  title: 'HIJACK (R): PETRICITE CHAINS!',
  subtitle:
    'Steals enemy Ultimate energy (+20% DMG & Kingslayer Heal), lashes 3 Petricite Chain waves, and unleashes Hijacked Cataclysm!',
  bannerColor: '#38bdf8',
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
        `+${heal} KINGSLAYER`,
        '#38bdf8',
        'heal',
      );
    }

    const data: SylasUltimateData = {
      lashesDone: 0,
      lashCd: 0.3,
      hijackFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#a855f7', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'ULTIMATE HIJACKED!!',
      '#a855f7',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as SylasUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.hijackFired && data.lashesDone < 3) {
      data.lashCd -= dt;
      if (data.lashCd <= 0) {
        data.lashCd = 0.44;
        data.lashesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.18, 0.18]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('sylas_chain'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'sword-wave',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 670,
            vy: Math.sin(a) * 670,
            radius: 14,
            damage: ctx.getEffectiveDamage(owner, 8.2),
            knockback: 210,
            color: '#38bdf8',
            secondaryColor: '#a855f7',
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

    if (!data.hijackFired && state.elapsed >= 2.0) {
      data.hijackFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        e.armorShredTimer = Math.max(e.armorShredTimer, 4.0);
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
        315,
        '#a855f7',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'NO MORE CHAINS!!',
        '#38bdf8',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
