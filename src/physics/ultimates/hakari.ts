import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface HakariTrainDoor {
  x: number;
  y: number;
  angle: number;
  gap: number;
  slammed: boolean;
  life: number;
}

export interface HakariUltimateData {
  phase: 'spinning' | 'jackpot';
  reels: [number, number, number];
  spinTimer: number;
  regenTick: number;
  surgeTick: number;
  doors: HakariTrainDoor[];
  notePhase: number;
}

export const hakariUltimateHandler: UltimateHandler = {
  characterId: 'hakari',
  title: 'IDLE DEATH GAMBLE: 7-7-7 JACKPOT!',
  subtitle:
    'Spins the Pachinko Machine + Subway Doors clamp → Hits 7-7-7 Jackpot: 4.11s IMMORTALITY, heals 4.5% HP every 0.5s, +50% speed & serrated energy pulses!',
  bannerColor: '#10b981',
  castDuration: 0.24,
  duration: 5.26,

  onCast(ctx, owner, state) {
    const target = ctx.getNearestEnemy(owner);
    const angle = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
    const doors: HakariTrainDoor[] = [];

    if (target) {
      doors.push({
        x: target.x,
        y: target.y,
        angle: angle + Math.PI / 2,
        gap: 64,
        slammed: false,
        life: 1.15,
      });
    }

    const data: HakariUltimateData = {
      phase: 'spinning',
      reels: [1, 3, 5],
      spinTimer: 0,
      regenTick: 0,
      surgeTick: 0,
      doors,
      notePhase: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, angle, '#10b981', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'IDLE DEATH GAMBLE!!',
      '#34d399',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 18, '#10b981', 70, 240, 3, 6, 'star');
    ctx.addScreenShake(8);
    ctx.addHitstop(0.045);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as HakariUltimateData;
    data.notePhase += dt * 7;

    if (data.phase === 'spinning') {
      data.spinTimer += dt;
      // Cycle reels fast during Pachinko Riichi spin!
      const step = Math.floor(state.elapsed * 22);
      data.reels = [(step % 7) + 1, ((step + 2) % 7) + 1, ((step + 5) % 7) + 1];

      // Update subway train doors closing in to crush nearby enemies
      for (let i = data.doors.length - 1; i >= 0; i--) {
        const door = data.doors[i];
        door.life -= dt;
        door.gap = Math.max(8, door.gap - dt * 78);
        if (!door.slammed && door.gap <= 14) {
          door.slammed = true;
          ctx.spawnShockwave(
            door.x,
            door.y,
            85,
            '#10b981',
            5,
            owner.character.id,
            owner.character.series,
          );
          ctx.emitSfx({ type: 'wall', intensity: 1.1 });
          for (const e of ctx.getEnemies(owner)) {
            if (Math.hypot(e.x - door.x, e.y - door.y) <= e.radius + 54) {
              ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 6.0), 0, 0, {
                sourceKind: 'ability',
              });
              e.frostTimer = Math.max(e.frostTimer, 1.2);
              ctx.spawnFloatingText(e.x, e.y - e.radius - 14, 'DOOR CRUSH!', '#34d399', 'callout');
            }
          }
        }
        if (door.life <= 0) {
          data.doors.splice(i, 1);
        }
      }

      // Hit 7-7-7 JACKPOT at 1.15s -> 4.11s remaining immortal fever!
      if (state.elapsed >= 1.15) {
        data.phase = 'jackpot';
        data.reels = [7, 7, 7];
        data.doors = [];
        owner.immortalTimer = Math.max(owner.immortalTimer, 4.11);
        owner.getExcitedTimer = Math.max(owner.getExcitedTimer, 4.11);
        owner.vx *= 1.35;
        owner.vy *= 1.35;

        ctx.addHitstop(0.065);
        ctx.addScreenShake(15);
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          240,
          '#10b981',
          7,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 22,
          '7-7-7 JACKPOT! IMMORTAL 4.11s!',
          '#fde047',
          'powerup',
        );
        ctx.spawnParticles(owner.x, owner.y, 30, '#34d399', 100, 340, 3, 7, 'star');
        ctx.emitSfx({ type: 'heal', intensity: 1.3 });
      }
      return;
    }

    // Phase 2: TUCA DONKA / JACKPOT FEVER!
    owner.immortalTimer = Math.max(
      owner.immortalTimer,
      Math.max(0, state.duration - state.elapsed),
    );

    data.regenTick += dt;
    if (data.regenTick >= 0.5) {
      data.regenTick -= 0.5;
      const healMult = getHealMultiplier(owner);
      const healAmount = owner.maxHp * 0.045 * healMult;
      if (healAmount > 0.1) {
        owner.hp = Math.min(owner.maxHp, owner.hp + healAmount);
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 12,
          `+${Math.round(healAmount)}`,
          '#4ade80',
          'heal',
        );
        ctx.spawnParticles(owner.x, owner.y, 8, '#4ade80', 40, 140, 2.5, 5, 'star');
      } else {
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 12,
          'HEAL SEALED!',
          '#f87171',
          'callout',
        );
      }
    }

    // Serrated emerald cursed energy aura rush & bursts every 0.42s
    data.surgeTick += dt;
    if (data.surgeTick >= 0.42) {
      data.surgeTick -= 0.42;
      const target = ctx.getNearestEnemy(owner);
      if (target) {
        const dx = target.x - owner.x;
        const dy = target.y - owner.y;
        const dist = Math.max(1, Math.hypot(dx, dy));
        owner.vx += (dx / dist) * 190;
        owner.vy += (dy / dist) * 190;
        owner.facingAngle = Math.atan2(dy, dx);
      }

      for (const e of ctx.getEnemies(owner)) {
        const dx = e.x - owner.x;
        const dy = e.y - owner.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= owner.radius + e.radius + 54) {
          const d = Math.max(1, dist);
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 4.6),
            (dx / d) * 320,
            (dy / d) * 320,
            {
              sourceKind: 'ability',
            },
          );
          ctx.spawnParticles(e.x, e.y, 10, '#10b981', 70, 210, 2.5, 5.5, 'shard');
        }
      }
    }
  },
};
