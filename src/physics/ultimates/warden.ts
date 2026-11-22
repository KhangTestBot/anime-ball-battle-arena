import type { UltimateHandler } from './types';

export interface SculkSensorNode {
  id: string;
  x: number;
  y: number;
  cooldown: number;
  shriekFlash: number;
}

export interface VibrationWave {
  id: string;
  fromX: number;
  fromY: number;
  sensorId: string;
  targetX: number;
  targetY: number;
  progress: number; // 0 -> 1 traveling to sensor
}

export interface WardenUltimateData {
  sensors: SculkSensorNode[];
  vibrations: VibrationWave[];
  enemyLastSkill: Record<string, string>;
  heartbeatPhase: number;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export const wardenUltimateHandler: UltimateHandler = {
  characterId: 'warden',
  title: 'DEEP DARK DARKNESS & SCULK SHRIEKER',
  subtitle:
    'Heartbeat Darkness · 3 Sculk Sensors detect vibrations (fast movement/casting → armor-piercing Sonic Boom)!',
  bannerColor: '#22d3ee',
  castDuration: 0.35,
  duration: 5.0,

  onCast(ctx, owner, state) {
    const { left, right, top, bottom } = ctx.bounds;
    const cx = (left + right) / 2;
    const cy = (top + bottom) / 2;
    const span = Math.min(right - left, bottom - top);

    // Place 3 Sculk Sensors strategically around the arena
    const sensors: SculkSensorNode[] = [];
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3 - Math.PI / 2;
      sensors.push({
        id: ctx.nextId('sculk'),
        x: clamp(cx + Math.cos(a) * span * 0.28, left + 52, right - 52),
        y: clamp(cy + Math.sin(a) * span * 0.28, top + 52, bottom - 52),
        cooldown: 0.25,
        shriekFlash: 0.5,
      });
    }

    const enemyLastSkill: Record<string, string> = {};
    for (const e of ctx.getEnemies(owner)) {
      enemyLastSkill[e.uid] = e.lastSkillName;
    }

    const data: WardenUltimateData = {
      sensors,
      vibrations: [],
      enemyLastSkill,
      heartbeatPhase: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#22d3ee', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      190,
      '#22d3ee',
      5,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnParticles(owner.x, owner.y, 24, '#22d3ee', 60, 240, 3, 6, 'pixel');
    ctx.addScreenShake(10);
    ctx.addHitstop(0.055);
    ctx.emitSfx({ type: 'beam-charge' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as WardenUltimateData;
    const enemies = ctx.getEnemies(owner);
    data.heartbeatPhase += dt * 4.2;

    for (const s of data.sensors) {
      if (s.cooldown > 0) s.cooldown = Math.max(0, s.cooldown - dt);
      if (s.shriekFlash > 0) s.shriekFlash = Math.max(0, s.shriekFlash - dt);
    }

    // 1. Detect vibrations from enemies moving FAST (>315 px/s) OR casting ANY skill!
    // Slow / still enemies ("sneaking") do NOT trigger Sculk Sensors!
    for (const e of enemies) {
      const speed = Math.hypot(e.vx, e.vy);
      const castSkill = e.lastSkillName !== (data.enemyLastSkill[e.uid] ?? '');
      data.enemyLastSkill[e.uid] = e.lastSkillName;

      if (speed > 315 || castSkill) {
        // Find nearest ready Sculk Sensor
        let best: SculkSensorNode | null = null;
        let bestDist = Infinity;
        for (const s of data.sensors) {
          if (s.cooldown > 0) continue;
          const d = Math.hypot(e.x - s.x, e.y - s.y);
          if (d < bestDist) {
            bestDist = d;
            best = s;
          }
        }
        if (best) {
          best.cooldown = 0.85; // Balanced 0.85s cooldown per sensor!
          best.shriekFlash = 0.45;
          data.vibrations.push({
            id: ctx.nextId('vib'),
            fromX: e.x,
            fromY: e.y,
            sensorId: best.id,
            targetX: e.x,
            targetY: e.y,
            progress: 0,
          });
          ctx.spawnFloatingText(best.x, best.y - 22, 'VIBRATION!', '#22d3ee', 'callout');
        }
      }
    }

    // 2. Advance white Vibration Waves -> when wave arrives at Sculk Sensor, fire piercing Sonic Boom!
    for (let i = data.vibrations.length - 1; i >= 0; i--) {
      const v = data.vibrations[i];
      v.progress += dt / 0.34;
      if (v.progress >= 1.0) {
        const sensor = data.sensors.find((s) => s.id === v.sensorId);
        if (sensor) {
          sensor.shriekFlash = 0.5;
          const ang = Math.atan2(v.targetY - sensor.y, v.targetX - sensor.x);
          // Fire shield-piercing, obstacle-piercing cyan Sonic Boom!
          ctx.projectiles.push({
            id: ctx.nextId('wsonic'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'sonic-boom',
            x: sensor.x + Math.cos(ang) * 18,
            y: sensor.y + Math.sin(ang) * 18,
            vx: Math.cos(ang) * 720,
            vy: Math.sin(ang) * 720,
            radius: 30,
            damage: ctx.getEffectiveDamage(owner, 11.8),
            knockback: 420,
            color: '#22d3ee',
            secondaryColor: '#ffffff',
            angle: ang,
            life: 1.35,
            maxLife: 1.35,
            piercing: true,
            blocksProjectiles: true,
            hitCooldowns: {},
            powerLevel: 6,
          });
          ctx.addScreenShake(6);
          ctx.emitSfx({ type: 'beam-fire', intensity: 1.05 });
        }
        data.vibrations.splice(i, 1);
      }
    }
  },
};
