import type { UltimateHandler } from './types';

export interface KamusariArc {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  radius: number;
  life: number;
  hitUids: Record<string, boolean>;
}

export interface ShanksUltimateData {
  hakiPulseRadius: number;
  hakiPulseAlpha: number;
  wifiTargetUid: string | null;
  wifiPinTimer: number;
  kamusariArcs: KamusariArc[];
  slashesFired: number;
}

export const shanksUltimateHandler: UltimateHandler = {
  characterId: 'shanks',
  title: 'KAMUSARI · CONQUEROR HAKI & OBSERVATION KILLER',
  subtitle:
    'Conqueror’s Haki wave strips dodge (3s Observation Killer) & shatters shields · Pins foes with Wi-Fi Haki before cleaving with crimson-black Divine Departure Kamusari!',
  bannerColor: '#dc2626',
  castDuration: 0.25,
  duration: 3.9,

  onCast(ctx, owner, state) {
    const enemies = ctx.getEnemies(owner);
    // 1. Conqueror's Haki Observation Killer Wave: seals dodge, strips shields, destroys weak minions!
    for (const e of enemies) {
      e.dodgeLockedTimer = Math.max(e.dodgeLockedTimer, 3.0);
      e.spiritLockTimer = Math.max(e.spiritLockTimer, 2.0);
      e.shieldTimer = 0;
      const dx = e.x - owner.x;
      const dy = e.y - owner.y;
      const d = Math.max(1, Math.hypot(dx, dy));
      if (d <= 240) {
        e.vx += (dx / d) * 380;
        e.vy += (dy / d) * 380;
      }
      ctx.spawnFloatingText(e.x, e.y - e.radius - 16, 'OBS SEALED!', '#dc2626', 'callout');
    }

    // Knock out weak opponent minions/clones automatically via Haoshoku Haki pressure!
    for (let i = ctx.minions.length - 1; i >= 0; i--) {
      if (ctx.minions[i].ownerUid !== owner.uid) {
        ctx.spawnParticles(
          ctx.minions[i].x,
          ctx.minions[i].y,
          8,
          '#dc2626',
          60,
          180,
          2,
          5,
          'shard',
        );
        ctx.minions.splice(i, 1);
      }
    }

    // Lock onto farthest enemy with Wi-Fi Conqueror Haki Pin!
    let farTarget = enemies[0] ?? null;
    let maxD = -1;
    for (const e of enemies) {
      const d = Math.hypot(e.x - owner.x, e.y - owner.y);
      if (d > maxD) {
        maxD = d;
        farTarget = e;
      }
    }

    const data: ShanksUltimateData = {
      hakiPulseRadius: owner.radius,
      hakiPulseAlpha: 1.0,
      wifiTargetUid: farTarget ? farTarget.uid : null,
      wifiPinTimer: 0.55,
      kamusariArcs: [],
      slashesFired: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#dc2626', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      260,
      '#991b1b',
      7,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      "CONQUEROR'S HAKI!!",
      '#dc2626',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 24, '#dc2626', 90, 320, 3, 6.5, 'shard');
    ctx.addScreenShake(13);
    ctx.addHitstop(0.055);
    ctx.emitSfx({ type: 'ko', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ShanksUltimateData;
    const enemies = ctx.getEnemies(owner);

    if (data.hakiPulseAlpha > 0) {
      data.hakiPulseAlpha = Math.max(0, data.hakiPulseAlpha - dt * 1.15);
      data.hakiPulseRadius += dt * 390;
    }

    // Wi-Fi Haki Pin -> slows & silences pinned foe briefly before unleashing Kamusari Crescent Waves!
    if (data.wifiPinTimer > 0) {
      data.wifiPinTimer -= dt;
      const pinned = enemies.find((e) => e.uid === data.wifiTargetUid);
      if (pinned) {
        pinned.vx *= Math.pow(0.25, dt * 4);
        pinned.vy *= Math.pow(0.25, dt * 4);
        pinned.silenceTimer = Math.max(pinned.silenceTimer, 0.4);
      }
      if (data.wifiPinTimer <= 0 && data.slashesFired < 2) {
        data.slashesFired += 1;
        const aimEnemy = pinned ?? ctx.getNearestEnemy(owner);
        const ang = aimEnemy
          ? Math.atan2(aimEnemy.y - owner.y, aimEnemy.x - owner.x)
          : owner.facingAngle;
        owner.facingAngle = ang;

        // Dashed Kamusari surge + sweeping red-black Divine Departure crescent!
        owner.vx = Math.cos(ang) * 580;
        owner.vy = Math.sin(ang) * 580;
        data.kamusariArcs.push({
          x: owner.x + Math.cos(ang) * (owner.radius + 16),
          y: owner.y + Math.sin(ang) * (owner.radius + 16),
          vx: Math.cos(ang) * 680,
          vy: Math.sin(ang) * 680,
          angle: ang,
          radius: 44,
          life: 1.4,
          hitUids: {},
        });
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 18,
          'KAMUSARI!!',
          '#ef4444',
          'powerup',
        );
        ctx.addScreenShake(14);
        ctx.emitSfx({ type: 'slash', intensity: 1.35 });
        if (data.slashesFired < 2) data.wifiPinTimer = 0.85;
      }
    }

    // Update Kamusari Red-Black Crescent Arcs (cuts through projectiles!)
    for (let i = data.kamusariArcs.length - 1; i >= 0; i--) {
      const arc = data.kamusariArcs[i];
      arc.life -= dt;
      arc.x += arc.vx * dt;
      arc.y += arc.vy * dt;

      for (let pIdx = ctx.projectiles.length - 1; pIdx >= 0; pIdx--) {
        const p = ctx.projectiles[pIdx];
        if (
          p.ownerUid !== owner.uid &&
          Math.hypot(p.x - arc.x, p.y - arc.y) <= arc.radius + p.radius
        ) {
          ctx.spawnParticles(p.x, p.y, 5, '#dc2626', 50, 160, 2, 4, 'shard');
          ctx.projectiles.splice(pIdx, 1);
        }
      }

      for (const e of enemies) {
        if (arc.hitUids[e.uid]) continue;
        if (Math.hypot(e.x - arc.x, e.y - arc.y) <= arc.radius + e.radius) {
          arc.hitUids[e.uid] = true;
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 12.5),
            Math.cos(arc.angle) * 520,
            Math.sin(arc.angle) * 520,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.spawnParticles(e.x, e.y, 18, '#dc2626', 90, 320, 3, 6.5, 'shard');
          ctx.addHitstop(0.05);
        }
      }

      if (arc.life <= 0) data.kamusariArcs.splice(i, 1);
    }
  },
};
