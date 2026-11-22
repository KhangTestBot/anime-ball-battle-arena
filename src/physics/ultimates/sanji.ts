import { applyFighterBurn, getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface SkyWalkRing {
  x: number;
  y: number;
  life: number;
}

export interface SanjiUltimateData {
  kicksLeft: number;
  kickCd: number;
  rings: SkyWalkRing[];
  trailPoints: { x: number; y: number; life: number }[];
  boefBursted: boolean;
}

export const sanjiUltimateHandler: UltimateHandler = {
  characterId: 'sanji',
  title: 'IFRIT JAMBE: BOEUF BURST & SKY WALK',
  subtitle:
    'Awakens Germa Exoskeleton healing 12% HP + Sky Walk speed · Chains 5 kicks leaving blue-white plasma flames → Finishes with an explosive BOEUF BURST kick!',
  bannerColor: '#3b82f6',
  castDuration: 0.22,
  duration: 3.85,

  onCast(ctx, owner, state) {
    owner.getExcitedTimer = Math.max(owner.getExcitedTimer, 3.6);
    owner.evadeTimer = Math.max(owner.evadeTimer, 1.5);

    // Exoskeleton rapid recovery respecting anti-heal multipliers!
    const healAmt = Math.max(0, (owner.maxHp - owner.hp) * 0.12) * getHealMultiplier(owner);
    if (healAmt > 0.5) {
      owner.hp = Math.min(owner.maxHp, owner.hp + healAmt);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 12,
        `+${Math.round(healAmt)} EXOSKELETON!`,
        '#60a5fa',
        'heal',
      );
    }

    const data: SanjiUltimateData = {
      kicksLeft: 5,
      kickCd: 0.08,
      rings: [{ x: owner.x, y: owner.y, life: 0.7 }],
      trailPoints: [],
      boefBursted: false,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#3b82f6', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      170,
      '#60a5fa',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'IFRIT JAMBE!!',
      '#93c5fd',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 20, '#38bdf8', 90, 290, 3, 6, 'spark');
    ctx.addScreenShake(9);
    ctx.addHitstop(0.045);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as SanjiUltimateData;
    const enemies = ctx.getEnemies(owner);
    const { left, right, top, bottom } = ctx.bounds;

    for (let i = data.rings.length - 1; i >= 0; i--) {
      data.rings[i].life -= dt;
      if (data.rings[i].life <= 0) data.rings.splice(i, 1);
    }
    for (let i = data.trailPoints.length - 1; i >= 0; i--) {
      data.trailPoints[i].life -= dt;
      if (data.trailPoints[i].life <= 0) data.trailPoints.splice(i, 1);
    }

    // Drop white-cobalt plasma ember trail along Sanji's Sky Walk motion
    if (Math.hypot(owner.vx, owner.vy) > 90 && data.trailPoints.length < 36) {
      data.trailPoints.push({ x: owner.x, y: owner.y, life: 0.65 });
    }

    // 5 High-speed Sky Walk homing dashes & plasma kicks
    if (data.kicksLeft > 0) {
      data.kickCd -= dt;
      if (data.kickCd <= 0) {
        data.kicksLeft--;
        data.kickCd = 0.44;
        data.rings.push({ x: owner.x, y: owner.y, life: 0.75 });

        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const dx = target.x - owner.x;
          const dy = target.y - owner.y;
          const d = Math.max(1, Math.hypot(dx, dy));
          owner.facingAngle = Math.atan2(dy, dx);
          // Snap close safely inside arena walls on Sky Walk burst!
          owner.x = Math.max(
            left + owner.radius + 8,
            Math.min(
              right - owner.radius - 8,
              target.x - (dx / d) * (owner.radius + target.radius + 10),
            ),
          );
          owner.y = Math.max(
            top + owner.radius + 8,
            Math.min(
              bottom - owner.radius - 8,
              target.y - (dy / d) * (owner.radius + target.radius + 10),
            ),
          );
          owner.vx = (dx / d) * 620;
          owner.vy = (dy / d) * 620;
          data.rings.push({ x: owner.x, y: owner.y, life: 0.75 });

          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 4.8),
            (dx / d) * 260,
            (dy / d) * 260,
            {
              sourceKind: 'ability',
            },
          );
          applyFighterBurn(target, owner.uid, 2.2, ctx.getEffectiveDamage(owner, 2.5));
          ctx.spawnParticles(target.x, target.y, 12, '#60a5fa', 80, 260, 2.5, 5.5, 'spark');
          ctx.emitSfx({ type: 'hit', intensity: 1.15 });
        }
      }
      return;
    }

    // Climax BOEUF BURST!! (2.4s+): Supersonic cobalt plasma cannon kick!
    if (!data.boefBursted && state.elapsed >= 2.45) {
      data.boefBursted = true;
      const target = ctx.getNearestEnemy(owner);
      const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
      ctx.addHitstop(0.075);
      ctx.addScreenShake(18);
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        225,
        '#3b82f6',
        7.5,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 22,
        'BOEUF BURST!!',
        '#bfdbfe',
        'powerup',
      );
      ctx.emitSfx({ type: 'crit', intensity: 1.4 });

      for (const e of enemies) {
        if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 170 + e.radius) {
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 14.5),
            Math.cos(ang) * 720,
            Math.sin(ang) * 720,
            {
              isCrit: true,
              sourceKind: 'ability',
            },
          );
          applyFighterBurn(e, owner.uid, 3.0, ctx.getEffectiveDamage(owner, 3.0));
        }
      }
    }
  },
};
