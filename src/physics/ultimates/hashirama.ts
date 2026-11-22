import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface HashiramaUltimateData {
  salvosLeft: number;
  salvoCd: number;
  pollenTick: number;
  buddhaAngle: number;
}

export const hashiramaUltimateHandler: UltimateHandler = {
  characterId: 'hashirama',
  title: 'SAGE ART WOOD STYLE: TRUE SEVERAL THOUSAND HANDS',
  subtitle:
    'Deep Forest Bloom spreads Pollen to disorient foes & regenerates Wood Style vitality · Summons the Thousand-Armed Buddha raining shield-breaking fists across the arena!',
  bannerColor: '#15803d',
  castDuration: 0.28,
  duration: 4.3,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.5);
    const enemies = ctx.getEnemies(owner);
    for (const e of enemies) {
      if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 290) {
        e.confusedTimer = Math.max(e.confusedTimer, 1.8);
      }
    }

    const healAmt = owner.maxHp * 0.08 * getHealMultiplier(owner);
    if (healAmt > 0.5) {
      owner.hp = Math.min(owner.maxHp, owner.hp + healAmt);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 12,
        `+${Math.round(healAmt)} WOOD SAGE`,
        '#4ade80',
        'heal',
      );
    }

    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;

    const data: HashiramaUltimateData = {
      salvosLeft: 6,
      salvoCd: 0.15,
      pollenTick: 0,
      buddhaAngle: ang,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, ang, '#22c55e', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      240,
      '#16a34a',
      7,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'TRUE SEVERAL THOUSAND HANDS!!',
      '#86efac',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 24, '#4ade80', 75, 250, 3, 6, 'petal');
    ctx.addScreenShake(12);
    ctx.addHitstop(0.055);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as HashiramaUltimateData;
    const enemies = ctx.getEnemies(owner);

    const nearest = ctx.getNearestEnemy(owner);
    if (nearest) {
      data.buddhaAngle = Math.atan2(nearest.y - owner.y, nearest.x - owner.x);
      owner.facingAngle = data.buddhaAngle;
    }

    // Deep Forest Emergence Pollen saps enemies slowly while soothing Hashirama
    data.pollenTick += dt;
    if (data.pollenTick >= 0.6) {
      data.pollenTick -= 0.6;
      for (const e of enemies) {
        if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 275) {
          e.vx *= 0.8;
          e.vy *= 0.8;
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 2.5), 0, 0, {
            sourceKind: 'dot',
          });
        }
      }
    }

    // Shinsu Senju 1000-Armed Buddha rapid golden fist-wave salvos!
    if (data.salvosLeft > 0) {
      data.salvoCd -= dt;
      if (data.salvoCd <= 0) {
        data.salvoCd = 0.56;
        data.salvosLeft--;
        const isFinal = data.salvosLeft === 0;
        const fists = isFinal ? 5 : 3;

        for (let i = 0; i < fists; i++) {
          const ang = data.buddhaAngle + (i - (fists - 1) / 2) * 0.24;
          ctx.projectiles.push({
            id: ctx.nextId('buddha_fist'),
            ownerUid: owner.uid,
            teamId: owner.teamId,
            kind: 'fist-wave',
            x: owner.x + Math.cos(ang) * (owner.radius + 14),
            y: owner.y + Math.sin(ang) * (owner.radius + 14),
            vx: Math.cos(ang) * 650,
            vy: Math.sin(ang) * 650,
            radius: isFinal ? 16 : 12,
            damage: ctx.getEffectiveDamage(owner, isFinal ? 5.6 : 3.6),
            knockback: isFinal ? 340 : 210,
            color: '#d97706',
            secondaryColor: '#fde047',
            angle: ang,
            life: 1.4,
            maxLife: 1.4,
            piercing: isFinal,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }

        // Massive direct Shinsu Senju shock-slap shattering nearby shields on final salvo!
        if (isFinal) {
          for (const e of enemies) {
            if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 190 + e.radius) {
              e.shieldTimer = 0;
              ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 9.5), 0, 0, {
                isCrit: true,
                sourceKind: 'ability',
              });
            }
          }
          ctx.spawnFloatingText(
            owner.x,
            owner.y - owner.radius - 20,
            'TOP TRANSFORMED BUDDHA!!',
            '#fde047',
            'crit',
          );
        }
        ctx.addScreenShake(isFinal ? 16 : 7);
        ctx.emitSfx({ type: 'hit', intensity: isFinal ? 1.35 : 0.95 });
      }
    }
  },
};
