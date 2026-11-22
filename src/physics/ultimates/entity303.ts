import type { UltimateHandler } from './types';

export interface CorruptedChunk {
  id: string;
  x: number;
  y: number;
  size: number;
  code: string;
  flashTimer: number;
}

export interface GlitchScytheOrb {
  angle: number;
  dist: number;
  x: number;
  y: number;
}

export interface Entity303UltimateData {
  chunks: CorruptedChunk[];
  scythes: GlitchScytheOrb[];
  glitchIntensity: number;
  scytheHitCds: Record<string, number>;
}

const ERROR_CODES = ['ERR_303', 'NULL_PTR', '0xDEAD'];

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export const entity303UltimateHandler: UltimateHandler = {
  characterId: 'entity303',
  title: 'CORRUPTED CHUNK: ERROR_303.EXE',
  subtitle: '3 Corrupted Chunks invert movement & teleport · Blocks healing (4s Anti-Heal) · Scythe deflects projectiles!',
  bannerColor: '#ff1f5a',
  castDuration: 0.35,
  duration: 4.8,

  onCast(ctx, owner, state) {
    const { left, right, top, bottom } = ctx.bounds;
    const cx = (left + right) / 2;
    const cy = (top + bottom) / 2;
    const span = Math.min(right - left, bottom - top);
    const chunkSize = 78;
    const margin = chunkSize * 0.5 + 36;

    // Place 3 well-spaced Corrupted Chunks in a triangle across the arena (always safely inside walls!)
    const chunks: CorruptedChunk[] = [];
    const baseA = Math.random() * Math.PI * 2;
    for (let i = 0; i < 3; i++) {
      const a = baseA + (i * Math.PI * 2) / 3;
      const dist = span * 0.27;
      chunks.push({
        id: ctx.nextId('chunk'),
        x: clamp(cx + Math.cos(a) * dist, left + margin, right - margin),
        y: clamp(cy + Math.sin(a) * dist, top + margin, bottom - margin),
        size: chunkSize,
        code: ERROR_CODES[i % ERROR_CODES.length],
        flashTimer: 0.4,
      });
    }

    const scythes: GlitchScytheOrb[] = [
      { angle: 0, dist: owner.radius + 54, x: owner.x + owner.radius + 54, y: owner.y },
      { angle: Math.PI, dist: owner.radius + 54, x: owner.x - owner.radius - 54, y: owner.y },
    ];

    const data: Entity303UltimateData = {
      chunks,
      scythes,
      glitchIntensity: 1.0,
      scytheHitCds: {},
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.triggerCameraGlitch(0.55);
    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ff1f5a', 'ULT', true);
    ctx.spawnParticles(owner.x, owner.y, 26, '#ff1f5a', 90, 320, 3, 6.5, 'pixel');
    ctx.addScreenShake(11);
    ctx.addHitstop(0.055);
    ctx.emitSfx({ type: 'slash', intensity: 1.25 });

    // Immediate Anti-Heal corruption wave on cast to nearby enemies
    for (const e of ctx.getEnemies(owner)) {
      if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 240) {
        e.antiHealTimer = Math.max(e.antiHealTimer, 4.0);
        ctx.spawnFloatingText(e.x, e.y - e.radius - 14, 'ANTI-HEAL 4s!', '#ff1f5a', 'callout');
      }
    }
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as Entity303UltimateData;
    const { left, right, top, bottom } = ctx.bounds;
    const enemies = ctx.getEnemies(owner);

    data.glitchIntensity = Math.max(0.15, data.glitchIntensity - dt * 1.4);
    for (const key of Object.keys(data.scytheHitCds)) {
      data.scytheHitCds[key] -= dt;
      if (data.scytheHitCds[key] <= 0) delete data.scytheHitCds[key];
    }

    // 1. Check Corrupted Chunks -> Glitch Teleport + Velocity Reversal + Anti-Heal (with strict 0.9s cooldown!)
    for (let cIdx = 0; cIdx < data.chunks.length; cIdx++) {
      const ch = data.chunks[cIdx];
      if (ch.flashTimer > 0) ch.flashTimer = Math.max(0, ch.flashTimer - dt);
      const half = ch.size * 0.5;

      for (const e of enemies) {
        if (e.glitchTeleportCd > 0) continue;
        if (
          Math.abs(e.x - ch.x) <= half + e.radius * 0.6 &&
          Math.abs(e.y - ch.y) <= half + e.radius * 0.6
        ) {
          const dest = data.chunks[(cIdx + 1) % data.chunks.length];
          e.glitchTeleportCd = 0.9; // Prevents infinite teleport ping-pong!
          e.antiHealTimer = Math.max(e.antiHealTimer, 4.0);
          ch.flashTimer = 0.35;
          dest.flashTimer = 0.35;

          e.afterimages.push({
            x: e.x,
            y: e.y,
            alpha: 0.9,
            color: '#ff1f5a',
            formIndex: e.formIndex,
          });
          e.x = clamp(dest.x, left + e.radius + 16, right - e.radius - 16);
          e.y = clamp(dest.y, top + e.radius + 16, bottom - e.radius - 16);
          // Reverse velocity vector suddenly!
          e.vx = -e.vx * 1.05;
          e.vy = -e.vy * 1.05;

          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 10.5), 0, 0, {
            bypassInvuln: false,
            isCrit: true,
            sourceKind: 'ability',
          });
          ctx.spawnFloatingText(
            e.x,
            e.y - e.radius - 16,
            'ERR_303 · ANTI-HEAL!',
            '#ff1f5a',
            'callout',
          );
          ctx.spawnParticles(e.x, e.y, 14, '#d946ef', 70, 240, 3, 6, 'pixel');
          ctx.emitSfx({ type: 'dodge' });
          ctx.addScreenShake(6);
        }
      }
    }

    // 2. Orbit 2 Corrupted Glitch Scythes -> Deflect/Corrupt enemy projectiles & slice enemies!
    for (const sc of data.scythes) {
      sc.angle += dt * 5.8;
      sc.x = owner.x + Math.cos(sc.angle) * sc.dist;
      sc.y = owner.y + Math.sin(sc.angle) * sc.dist;

      // Bend & corrupt enemy projectiles passing near the scythe!
      for (const p of ctx.projectiles) {
        if (p.ownerUid === owner.uid) continue;
        if (owner.teamId !== null && p.teamId === owner.teamId) continue;
        if (Math.hypot(p.x - sc.x, p.y - sc.y) <= 48 + p.radius) {
          const curAng = Math.atan2(p.vy, p.vx);
          const spd = Math.max(280, Math.hypot(p.vx, p.vy));
          const bend = (Math.random() < 0.5 ? 1 : -1) * (1.2 + Math.random() * 1.1);
          const nextA = curAng + bend;
          p.vx = Math.cos(nextA) * spd;
          p.vy = Math.sin(nextA) * spd;
          p.angle = nextA;
          p.color = '#ff1f5a';
          p.secondaryColor = '#09090b';
          p.ownerUid = owner.uid;
          p.ownerCharId = owner.character.id;
          p.ownerSeries = owner.character.series;
          p.teamId = owner.teamId;
          ctx.spawnParticles(p.x, p.y, 6, '#ff1f5a', 40, 150, 2.5, 5, 'pixel');
        }
      }

      // Slice enemies touched by the orbiting Glitch Scythes
      for (const e of enemies) {
        if (data.scytheHitCds[e.uid]) continue;
        if (Math.hypot(e.x - sc.x, e.y - sc.y) <= 22 + e.radius) {
          data.scytheHitCds[e.uid] = 0.45;
          e.antiHealTimer = Math.max(e.antiHealTimer, 4.0);
          const ang = Math.atan2(e.y - sc.y, e.x - sc.x);
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 8.2),
            Math.cos(ang) * 280,
            Math.sin(ang) * 280,
            { sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.0 });
        }
      }
    }
  },
};
