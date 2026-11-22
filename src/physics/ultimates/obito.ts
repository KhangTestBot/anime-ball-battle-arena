import { applyFighterBurn } from '../domains';
import type { UltimateHandler } from './types';

export interface ObitoUltimateData {
  stage: 'intangible' | 'nunoboko' | 'aftermath';
  phasedIds: Record<string, boolean>;
  phasedCount: number;
  shurikensLeft: number;
  shurikenCd: number;
  nunobokoFlash: number;
  slashX1: number;
  slashY1: number;
  slashX2: number;
  slashY2: number;
}

export const obitoUltimateHandler: UltimateHandler = {
  characterId: 'obito',
  title: 'INTANGIBLE KAMUI & SWORD OF NUNOBOKO',
  subtitle:
    'Phases through enemy projectiles with Kamui while launching Giant Swirling Shuriken → Materializes behind foes cleaving with the Truth-Seeking Sword of Nunoboko to shatter shields!',
  bannerColor: '#ea580c',
  castDuration: 0.25,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.invulnTimer = Math.max(owner.invulnTimer, 2.0);
    owner.untargetableTimer = Math.max(owner.untargetableTimer, 1.85);

    const data: ObitoUltimateData = {
      stage: 'intangible',
      phasedIds: {},
      phasedCount: 0,
      shurikensLeft: 4,
      shurikenCd: 0.15,
      nunobokoFlash: 0,
      slashX1: owner.x,
      slashY1: owner.y,
      slashX2: owner.x,
      slashY2: owner.y,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ea580c', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      175,
      '#f97316',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'KAMUI PHANTOM!',
      '#fb923c',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 18, '#f97316', 70, 230, 3, 6, 'star');
    ctx.addScreenShake(8);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'dodge' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ObitoUltimateData;
    const enemies = ctx.getEnemies(owner);
    const { left, right, top, bottom } = ctx.bounds;

    if (data.nunobokoFlash > 0) {
      data.nunobokoFlash = Math.max(0, data.nunobokoFlash - dt);
    }

    if (data.stage === 'intangible') {
      // Count enemy projectiles phasing harmlessly through Obito's Kamui distortion!
      for (const p of ctx.projectiles) {
        if (p.ownerUid === owner.uid || data.phasedIds[p.id]) continue;
        if (Math.hypot(p.x - owner.x, p.y - owner.y) <= owner.radius + p.radius + 14) {
          data.phasedIds[p.id] = true;
          data.phasedCount++;
          ctx.spawnFloatingText(
            owner.x,
            owner.y - owner.radius - 12,
            'PHASED!',
            '#fdba74',
            'callout',
          );
        }
      }

      // Eject swirling Giant Kamui Shuriken from eye spiral portal!
      if (data.shurikensLeft > 0) {
        data.shurikenCd -= dt;
        if (data.shurikenCd <= 0) {
          data.shurikenCd = 0.42;
          data.shurikensLeft--;
          const target = ctx.getNearestEnemy(owner);
          const ang = target
            ? Math.atan2(target.y - owner.y, target.x - owner.x)
            : owner.facingAngle;
          ctx.projectiles.push({
            id: ctx.nextId('kamui_star'),
            ownerUid: owner.uid,
            teamId: owner.teamId,
            kind: 'shuriken-star',
            x: owner.x + Math.cos(ang) * (owner.radius + 12),
            y: owner.y + Math.sin(ang) * (owner.radius + 12),
            vx: Math.cos(ang) * 590,
            vy: Math.sin(ang) * 590,
            radius: 15,
            damage: ctx.getEffectiveDamage(owner, 4.5),
            knockback: 220,
            color: '#ea580c',
            secondaryColor: '#09090b',
            angle: ang,
            life: 1.5,
            maxLife: 1.5,
            piercing: false,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
          ctx.emitSfx({ type: 'slash', intensity: 0.9 });
        }
      }

      // Stage 2 (2.0s): Materialize behind target & swing DNA-Helix SWORD OF NUNOBOKO!
      if (state.elapsed >= 2.0) {
        data.stage = 'nunoboko';
        owner.untargetableTimer = 0;
        data.nunobokoFlash = 1.05;

        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        if (target) {
          owner.x = Math.max(
            left + owner.radius + 8,
            Math.min(
              right - owner.radius - 8,
              target.x - Math.cos(ang) * (owner.radius + target.radius + 18),
            ),
          );
          owner.y = Math.max(
            top + owner.radius + 8,
            Math.min(
              bottom - owner.radius - 8,
              target.y - Math.sin(ang) * (owner.radius + target.radius + 18),
            ),
          );
        }

        data.slashX1 = owner.x;
        data.slashY1 = owner.y;
        data.slashX2 = owner.x + Math.cos(ang) * 260;
        data.slashY2 = owner.y + Math.sin(ang) * 260;

        ctx.addHitstop(0.075);
        ctx.addScreenShake(18);
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          230,
          '#09090b',
          7,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 20,
          'SWORD OF NUNOBOKO!!',
          '#fdba74',
          'powerup',
        );
        ctx.emitSfx({ type: 'ko', intensity: 1.35 });

        const bonus = Math.min(6, data.phasedCount * 2);
        for (const e of enemies) {
          if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 235 + e.radius) {
            e.shieldTimer = 0;
            const dx = e.x - owner.x;
            const dy = e.y - owner.y;
            const d = Math.max(1, Math.hypot(dx, dy));
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, 15.0 + bonus),
              (dx / d) * 520,
              (dy / d) * 520,
              {
                isCrit: true,
                sourceKind: 'ability',
              },
            );
            applyFighterBurn(e, owner.uid, 2.8, ctx.getEffectiveDamage(owner, 2.4));
          }
        }
      }
      return;
    }

    if (data.stage === 'nunoboko' && data.nunobokoFlash <= 0) {
      data.stage = 'aftermath';
    }
  },

  onExpire(_ctx, owner) {
    if (owner) {
      owner.untargetableTimer = 0;
    }
  },
};
