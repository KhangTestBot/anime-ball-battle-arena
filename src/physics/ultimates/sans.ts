import type { UltimateHandler } from './types';

export interface BoneWallSweep {
  id: string;
  colorKind: 'blue' | 'orange';
  x: number;
  vx: number;
  width: number;
  hitUids: Record<string, boolean>;
}

export interface GasterBlasterUnit {
  id: string;
  x: number;
  y: number;
  angle: number;
  chargeTimer: number;
  fired: boolean;
  fadeTimer: number;
}

export interface SansUltimateData {
  gravityDir: number; // 0: DOWN, 1: RIGHT, 2: UP, 3: LEFT
  gravitySwitchTimer: number;
  boneWalls: BoneWallSweep[];
  nextWallTimer: number;
  wallsSpawned: number;
  blasters: GasterBlasterUnit[];
  blastersSpawned: boolean;
}

const GRAV_VECTORS: ReadonlyArray<{ gx: number; gy: number; label: string }> = [
  { gx: 0, gy: 1, label: 'BLUE SOUL ↓' },
  { gx: 1, gy: 0, label: 'BLUE SOUL →' },
  { gx: 0, gy: -1, label: 'BLUE SOUL ↑' },
  { gx: -1, gy: 0, label: 'BLUE SOUL ←' },
];

export const sansUltimateHandler: UltimateHandler = {
  characterId: 'sans',
  title: 'MEGALOVANIA: BLUE & ORANGE BONE GAUNTLET',
  subtitle:
    'Battle Box · Blue Bones (stand still to dodge) · Orange Bones (keep moving to dodge) · Karmic Retribution KR & 6 Gaster Blasters!',
  bannerColor: '#38bdf8',
  castDuration: 0.3,
  duration: 4.7,

  onCast(ctx, owner, state) {
    const data: SansUltimateData = {
      gravityDir: 0,
      gravitySwitchTimer: 1.2,
      boneWalls: [],
      nextWallTimer: 0.35,
      wallsSpawned: 0,
      blasters: [],
      blastersSpawned: false,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'BAD TIME · BLUE SOUL!',
      '#38bdf8',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 20, '#ffffff', 60, 220, 3, 6, 'pixel');
    ctx.addScreenShake(9);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'beam-charge' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as SansUltimateData;
    const { left, right, top, bottom } = ctx.bounds;
    const cx = (left + right) / 2;
    const cy = (top + bottom) / 2;
    const enemies = ctx.getEnemies(owner);

    // 1. Blue Soul Shifting Gravity Slam every 1.2s!
    const gv = GRAV_VECTORS[data.gravityDir % 4];
    for (const e of enemies) {
      e.vx += gv.gx * 560 * dt;
      e.vy += gv.gy * 560 * dt;
    }

    data.gravitySwitchTimer -= dt;
    if (data.gravitySwitchTimer <= 0) {
      data.gravitySwitchTimer = 1.2;
      data.gravityDir = (data.gravityDir + 1) % 4;
      const nextG = GRAV_VECTORS[data.gravityDir];
      ctx.spawnFloatingText(cx, top + 72, nextG.label, '#38bdf8', 'callout');
      ctx.addScreenShake(5);
      // Immediate Blue Soul slam impulse in the new direction!
      for (const e of enemies) {
        e.vx += nextG.gx * 240;
        e.vy += nextG.gy * 240;
      }
    }

    // 2. Spawn alternating Blue (Stand Still!) & Orange (Keep Moving!) Bone Walls sweeping across the Battle Box!
    if (data.wallsSpawned < 4) {
      data.nextWallTimer -= dt;
      if (data.nextWallTimer <= 0) {
        const isBlue = data.wallsSpawned % 2 === 0;
        const fromLeft = data.wallsSpawned % 2 === 0;
        data.boneWalls.push({
          id: ctx.nextId('bwall'),
          colorKind: isBlue ? 'blue' : 'orange',
          x: fromLeft ? left + 26 : right - 26,
          vx: fromLeft ? 290 : -290,
          width: 24,
          hitUids: {},
        });
        data.wallsSpawned += 1;
        data.nextWallTimer = 0.78;
        ctx.emitSfx({ type: 'slash', intensity: 0.9 });
      }
    }

    // Update Bone Walls and enforce authentic Undertale movement rules!
    for (let i = data.boneWalls.length - 1; i >= 0; i--) {
      const wall = data.boneWalls[i];
      wall.x += wall.vx * dt;

      for (const e of enemies) {
        if (wall.hitUids[e.uid]) continue;
        if (Math.abs(e.x - wall.x) <= wall.width * 0.5 + e.radius) {
          wall.hitUids[e.uid] = true;
          const speed = Math.hypot(e.vx, e.vy);
          const isHurt = wall.colorKind === 'blue' ? speed > 180 : speed < 260;

          if (isHurt) {
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 9.2), 0, 0, {
              bypassInvuln: true,
              sourceKind: 'ability',
            });
            // Inflict KARMA (KR) purple poison bypassing invuln!
            e.karmaTimer = Math.max(e.karmaTimer, 2.8);
            e.karmaDps = Math.max(e.karmaDps, ctx.getEffectiveDamage(owner, 2.9));
            e.karmaOwnerUid = owner.uid;
            e.karmaKind = 'kr';
            ctx.spawnFloatingText(
              e.x,
              e.y - e.radius - 14,
              wall.colorKind === 'blue' ? 'KR · MOVED!' : 'KR · STOPPED!',
              '#d946ef',
              'callout',
            );
          } else {
            ctx.spawnFloatingText(
              e.x,
              e.y - e.radius - 14,
              'SAFE!',
              wall.colorKind === 'blue' ? '#38bdf8' : '#fb923c',
              'callout',
            );
          }
        }
      }

      if (wall.x < left - 35 || wall.x > right + 35) {
        data.boneWalls.splice(i, 1);
      }
    }

    // 3. Climax at 3.0s: 6 Rotating Gaster Blaster Dragon Skulls firing clockwise sequentially!
    if (!data.blastersSpawned && state.elapsed >= 3.0) {
      data.blastersSpawned = true;
      const ringR = Math.min(right - left, bottom - top) * 0.38;
      for (let k = 0; k < 6; k++) {
        const a = (k * Math.PI * 2) / 6 - Math.PI / 2;
        const bx = cx + Math.cos(a) * ringR;
        const by = cy + Math.sin(a) * ringR;
        data.blasters.push({
          id: ctx.nextId('gsk'),
          x: bx,
          y: by,
          angle: Math.atan2(cy - by, cx - bx),
          chargeTimer: 0.25 + k * 0.14,
          fired: false,
          fadeTimer: 0.55,
        });
      }
      ctx.emitSfx({ type: 'beam-charge' });
    }

    for (let i = data.blasters.length - 1; i >= 0; i--) {
      const gb = data.blasters[i];
      if (!gb.fired) {
        gb.chargeTimer -= dt;
        if (gb.chargeTimer <= 0) {
          gb.fired = true;
          ctx.beams.push({
            id: ctx.nextId('gbeam'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            originX: gb.x,
            originY: gb.y,
            angle: gb.angle,
            width: 24,
            damagePerTick: ctx.getEffectiveDamage(owner, 4.0),
            color: '#38bdf8',
            secondaryColor: '#ffffff',
            coreColor: '#ffffff',
            life: 0.36,
            maxLife: 0.36,
            tickTimer: 0,
            powerLevel: 6,
            style: 'gaster',
          });
          ctx.addScreenShake(4.5);
          ctx.emitSfx({ type: 'beam-fire', intensity: 1.0 });
        }
      } else {
        gb.fadeTimer -= dt;
        if (gb.fadeTimer <= 0) {
          data.blasters.splice(i, 1);
        }
      }
    }
  },

  onExpire(ctx, owner) {
    if (!owner || !owner.alive) return;
    // Counterplay balance: Sans gets drowsy ("zzz...") for 0.9s after Bad Time ends (disables MISS! dodge)
    owner.drowsyTimer = 0.9;
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 16,
      'ZZZ... TIRED',
      '#94a3b8',
      'callout',
    );
  },
};
