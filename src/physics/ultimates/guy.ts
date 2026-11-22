import type { UltimateHandler } from './types';

export interface SekizoPulse {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  hitUids: Record<string, boolean>;
}

export interface GuyUltimateData {
  stage: 'sekizo' | 'night-guy-charge' | 'night-guy-hit';
  sekizosLeft: number;
  sekizoCd: number;
  pulses: SekizoPulse[];
  dragonFlash: number;
  recoilApplied: boolean;
}

export const guyUltimateHandler: UltimateHandler = {
  characterId: 'guy',
  title: 'EIGHT GATES RELEASED: EVENING ELEPHANT & NIGHT GUY',
  subtitle:
    'Opens the Gate of Death (Unstoppable + Haste 3.5s) firing 3 Evening Elephant air cannons to pin foes → Becomes the Crimson Dragon NIGHT GUY charging at 860 px/s for a lethal finisher (6% self-HP cost)!',
  bannerColor: '#dc2626',
  castDuration: 0.25,
  duration: 3.8,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.5);
    owner.getExcitedTimer = Math.max(owner.getExcitedTimer, 3.5);

    const data: GuyUltimateData = {
      stage: 'sekizo',
      sekizosLeft: 3,
      sekizoCd: 0.12,
      pulses: [],
      dragonFlash: 0,
      recoilApplied: false,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#dc2626', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      200,
      '#ef4444',
      6.5,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'EIGHTH GATE OF DEATH: OPEN!!',
      '#fca5a5',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 26, '#dc2626', 85, 290, 3, 6.5, 'circle');
    ctx.addScreenShake(12);
    ctx.addHitstop(0.055);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as GuyUltimateData;
    const enemies = ctx.getEnemies(owner);

    if (data.dragonFlash > 0) {
      data.dragonFlash = Math.max(0, data.dragonFlash - dt);
    }

    // Update Sekizo compressed air cannon pulses!
    for (let i = data.pulses.length - 1; i >= 0; i--) {
      const p = data.pulses[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      for (const e of enemies) {
        if (!p.hitUids[e.uid] && Math.hypot(e.x - p.x, e.y - p.y) <= e.radius + 32) {
          p.hitUids[e.uid] = true;
          e.vx *= 0.25;
          e.vy *= 0.25;
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 4.8), p.vx * 0.25, p.vy * 0.25, {
            sourceKind: 'ability',
          });
          ctx.spawnFloatingText(e.x, e.y - e.radius - 12, 'SEKIZO!', '#fdba74', 'callout');
        }
      }
      if (p.life <= 0) data.pulses.splice(i, 1);
    }

    if (data.stage === 'sekizo') {
      if (data.sekizosLeft > 0) {
        data.sekizoCd -= dt;
        if (data.sekizoCd <= 0) {
          data.sekizoCd = 0.48;
          data.sekizosLeft--;
          const target = ctx.getNearestEnemy(owner);
          const ang = target
            ? Math.atan2(target.y - owner.y, target.x - owner.x)
            : owner.facingAngle;
          owner.facingAngle = ang;
          data.pulses.push({
            x: owner.x + Math.cos(ang) * (owner.radius + 14),
            y: owner.y + Math.sin(ang) * (owner.radius + 14),
            vx: Math.cos(ang) * 760,
            vy: Math.sin(ang) * 760,
            life: 0.9,
            hitUids: {},
          });
          ctx.emitSfx({ type: 'hit', intensity: 1.2 });
        }
      }

      if (state.elapsed >= 1.85) {
        data.stage = 'night-guy-charge';
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        owner.facingAngle = ang;
        owner.vx = Math.cos(ang) * 860;
        owner.vy = Math.sin(ang) * 860;
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 22,
          'NIGHT GUY!! DRAGON CHARGE!',
          '#ef4444',
          'powerup',
        );
        ctx.emitSfx({ type: 'beam-charge', intensity: 1.35 });
      }
      return;
    }

    if (data.stage === 'night-guy-charge') {
      owner.afterimages.push({
        x: owner.x,
        y: owner.y,
        alpha: 0.85,
        color: '#dc2626',
        formIndex: owner.formIndex,
      });

      for (const e of enemies) {
        if (Math.hypot(e.x - owner.x, e.y - owner.y) <= owner.radius + e.radius + 36) {
          data.stage = 'night-guy-hit';
          data.dragonFlash = 1.05;
          const dx = e.x - owner.x;
          const dy = e.y - owner.y;
          const d = Math.max(1, Math.hypot(dx, dy));

          ctx.addHitstop(0.085);
          ctx.addScreenShake(24);
          ctx.spawnShockwave(
            e.x,
            e.y,
            240,
            '#dc2626',
            8,
            owner.character.id,
            owner.character.series,
          );
          ctx.spawnFloatingText(e.x, e.y - e.radius - 22, 'NIGHT GUY IMPACT!!', '#fde047', 'crit');
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 19.5),
            (dx / d) * 700,
            (dy / d) * 700,
            {
              isCrit: true,
              sourceKind: 'ability',
            },
          );
          ctx.spawnParticles(e.x, e.y, 28, '#ef4444', 110, 380, 3.5, 7.5, 'shard');
          ctx.emitSfx({ type: 'ko', intensity: 1.45 });

          // Canon 8th Gate Blood Recoil (-6% current HP safely above KO floor)
          if (!data.recoilApplied) {
            data.recoilApplied = true;
            owner.hp = Math.max(15, owner.hp - owner.hp * 0.06);
          }
          break;
        }
      }

      if (state.elapsed >= 2.7 && data.stage === 'night-guy-charge') {
        data.stage = 'night-guy-hit';
        data.dragonFlash = 0.85;
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          195,
          '#dc2626',
          7,
          owner.character.id,
          owner.character.series,
        );
      }
    }
  },
};
