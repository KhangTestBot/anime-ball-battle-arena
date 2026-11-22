import type { FighterState } from '../../types/game';
import type { AbilityContext } from '../abilities';
import { applyFighterStun, getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface FallingAnvil {
  id: string;
  x: number;
  targetY: number;
  progress: number; // 0 -> 1 falling, >1 brief impact dust
  landed: boolean;
}

export interface SteveUltimateData {
  anvils: FallingAnvil[];
  nextAnvilTimer: number;
  anvilsDropped: number;
  fortressBuilt: boolean;
  midVolleyFired: boolean;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function spawnSteveEnderDragon(ctx: AbilityContext, f: FighterState): void {
  const form = ctx.getForm(f);
  const existing = ctx.minions.find((m) => m.ownerUid === f.uid && m.kind === 'ender-dragon');
  if (existing) {
    existing.life = 14.0;
    existing.maxLife = 14.0;
    existing.maxHp = 165 + form.powerLevel * 32;
    existing.hp = existing.maxHp;
    existing.damage = ctx.getEffectiveDamage(f, 14.5 + form.powerLevel * 2.2);
    ctx.spawnShockwave(
      existing.x,
      existing.y,
      115,
      '#c084fc',
      5,
      f.character.id,
      f.character.series,
    );
    return;
  }

  const sx = clamp(f.x, ctx.bounds.left + 44, ctx.bounds.right - 44);
  const sy = clamp(f.y - 45, ctx.bounds.top + 44, ctx.bounds.bottom - 44);
  const ang = f.facingAngle;

  ctx.minions.push({
    id: ctx.nextId('dragon'),
    ownerUid: f.uid,
    ownerCharId: f.character.id,
    ownerSeries: f.character.series,
    teamId: f.teamId,
    kind: 'ender-dragon',
    x: sx,
    y: sy,
    vx: Math.cos(ang) * 390,
    vy: Math.sin(ang) * 390,
    radius: 28,
    hp: 165 + form.powerLevel * 32,
    maxHp: 165 + form.powerLevel * 32,
    damage: ctx.getEffectiveDamage(f, 14.5 + form.powerLevel * 2.2),
    life: 14.0,
    maxLife: 14.0,
    color: '#18181b',
    accentColor: '#c084fc',
    attackTimer: 0.35,
    wingPhase: 0,
    hitCooldowns: {},
  });
}

function fireChannelingTridentVolley(ctx: AbilityContext, owner: FighterState): void {
  const target = ctx.getNearestEnemy(owner);
  const baseAng = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
  const count = 6;
  const spread = 0.88;

  for (let i = 0; i < count; i++) {
    const a = baseAng - spread * 0.5 + (spread * i) / (count - 1);
    ctx.projectiles.push({
      id: ctx.nextId('trident'),
      ownerUid: owner.uid,
      ownerCharId: owner.character.id,
      ownerSeries: owner.character.series,
      teamId: owner.teamId,
      kind: 'arrow-trident',
      x: owner.x + Math.cos(a) * (owner.radius + 10),
      y: owner.y + Math.sin(a) * (owner.radius + 10),
      vx: Math.cos(a) * 640,
      vy: Math.sin(a) * 640,
      radius: 10,
      damage: ctx.getEffectiveDamage(owner, 13.2),
      knockback: 310,
      color: '#22d3ee',
      secondaryColor: '#a855f7',
      angle: a,
      life: 2.0,
      maxLife: 2.0,
      piercing: true,
      hitCooldowns: {},
      powerLevel: ctx.getForm(owner).powerLevel,
    });
  }
  ctx.spawnShockwave(
    owner.x,
    owner.y,
    130,
    '#22d3ee',
    5,
    owner.character.id,
    owner.character.series,
  );
  ctx.emitSfx({ type: 'slash', intensity: 1.2 });
}

function buildObsidianFortress(ctx: AbilityContext, owner: FighterState): void {
  // Remove any older obstacles owned by this Steve so we never exceed 4 blocks per Steve
  for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
    if (ctx.obstacles[i].ownerUid === owner.uid) {
      ctx.obstacles.splice(i, 1);
    }
  }

  const target = ctx.getNearestEnemy(owner);
  const aimAngle = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;

  // Build a 4-block protective Obsidian/Bedrock arc facing the enemy, keeping safe spacing from walls & fighters!
  const blockSize = 38;
  const dist = owner.radius + 54;
  const offsets = [-0.72, -0.24, 0.24, 0.72];

  for (let i = 0; i < offsets.length; i++) {
    const a = aimAngle + offsets[i];
    const bx = clamp(
      owner.x + Math.cos(a) * dist,
      ctx.bounds.left + blockSize * 0.5 + 34,
      ctx.bounds.right - blockSize * 0.5 - 34,
    );
    const by = clamp(
      owner.y + Math.sin(a) * dist,
      ctx.bounds.top + blockSize * 0.5 + 34,
      ctx.bounds.bottom - blockSize * 0.5 - 34,
    );

    // Avoid spawning directly on top of any fighter
    const overlapsFighter = ctx.fighters.some(
      (f) => f.alive && Math.hypot(f.x - bx, f.y - by) < f.radius + blockSize * 0.65,
    );
    if (overlapsFighter) continue;

    ctx.obstacles.push({
      id: ctx.nextId('obs'),
      ownerUid: owner.uid,
      ownerCharId: owner.character.id,
      teamId: owner.teamId,
      kind: i === 1 || i === 2 ? 'obsidian-block' : 'bedrock-block',
      x: bx,
      y: by,
      w: blockSize,
      h: blockSize,
      hp: 5, // Reinforced Netherite-era Obsidian/Bedrock blocks!
      maxHp: 5,
      life: 5.8,
      maxLife: 5.8,
      blocksProjectiles: true,
      restitution: 1.35,
      color: '#3b0764',
      secondaryColor: '#a855f7',
    });
    ctx.spawnParticles(bx, by, 8, '#a855f7', 50, 170, 3, 6, 'pixel');
  }
}

export const steveUltimateHandler: UltimateHandler = {
  characterId: 'steve',
  title: 'NETHERITE FORTRESS & TOTEM OF UNDYING',
  subtitle:
    'Creative Mode: Durable Obsidian fortress · Enchanted Armor + Unstoppable + Totem · 6 Tridents, 4 shield-breaking Anvils & Ender Dragon!',
  bannerColor: '#a855f7',
  castDuration: 0.3,
  duration: 5.0,

  onCast(ctx, owner, state) {
    const data: SteveUltimateData = {
      anvils: [],
      nextAnvilTimer: 0.42,
      anvilsDropped: 0,
      fortressBuilt: false,
      midVolleyFired: false,
    };
    state.data = data as unknown as Record<string, unknown>;

    // 1. Enchanted Netherite Armor buff + Unstoppable Creative Mode + Notch Apple Heal + Totem of Undying!
    owner.enchantArmorTimer = 6.2;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 5.5);
    owner.totemActive = true;
    owner.invulnTimer = Math.max(owner.invulnTimer, 0.85);

    const notchHeal = owner.maxHp * 0.12 * getHealMultiplier(owner);
    if (notchHeal > 0.5) {
      owner.hp = Math.min(owner.maxHp, owner.hp + notchHeal);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 32,
        `+${Math.round(notchHeal)} NOTCH APPLE`,
        '#fde047',
        'heal',
      );
    }

    // 2. Summon empowered Ender Dragon + fire opening Channeling Trident volley
    spawnSteveEnderDragon(ctx, owner);
    fireChannelingTridentVolley(ctx, owner);

    // 3. Feedback juice
    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#a855f7', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'CREATIVE MODE · TOTEM ARMED!',
      '#facc15',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 28, '#c084fc', 90, 320, 3, 6.5, 'pixel');
    ctx.addScreenShake(12);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as SteveUltimateData;

    // Build physical Obsidian Fortress right as cast phase finishes
    if (!data.fortressBuilt && state.elapsed >= state.castDuration * 0.6) {
      data.fortressBuilt = true;
      buildObsidianFortress(ctx, owner);
      ctx.emitSfx({ type: 'wall', intensity: 1.2 });
    }

    // Mid-Ultimate bonus Channeling Trident volley at 2.4s!
    if (!data.midVolleyFired && state.elapsed >= 2.4) {
      data.midVolleyFired = true;
      fireChannelingTridentVolley(ctx, owner);
    }

    // Drop up to 4 Falling Iron Anvils onto enemy positions!
    if (data.anvilsDropped < 4) {
      data.nextAnvilTimer -= dt;
      if (data.nextAnvilTimer <= 0) {
        const enemies = ctx.getEnemies(owner);
        const focus = enemies[data.anvilsDropped % Math.max(1, enemies.length)];
        if (focus) {
          data.anvils.push({
            id: ctx.nextId('anvil'),
            x: clamp(focus.x, ctx.bounds.left + 32, ctx.bounds.right - 32),
            targetY: clamp(focus.y, ctx.bounds.top + 40, ctx.bounds.bottom - 32),
            progress: 0,
            landed: false,
          });
          data.anvilsDropped += 1;
          data.nextAnvilTimer = 0.92;
          ctx.emitSfx({ type: 'beam-charge' });
        }
      }
    }

    // Update falling anvils (0.52s fall telegraph -> heavy slam + shield shatter + 0.75s stun!)
    for (let i = data.anvils.length - 1; i >= 0; i--) {
      const anvil = data.anvils[i];
      anvil.progress += dt / 0.52;
      if (!anvil.landed && anvil.progress >= 1.0) {
        anvil.landed = true;
        ctx.addScreenShake(12);
        ctx.spawnShockwave(
          anvil.x,
          anvil.targetY,
          125,
          '#94a3b8',
          6,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnParticles(anvil.x, anvil.targetY, 22, '#cbd5e1', 80, 300, 3, 6, 'pixel');
        ctx.emitSfx({ type: 'crit', intensity: 1.25 });
        ctx.spawnFloatingText(
          anvil.x,
          anvil.targetY - 22,
          'NETHERITE ANVIL!',
          '#e2e8f0',
          'callout',
        );

        for (const enemy of ctx.getEnemies(owner)) {
          const dist = Math.hypot(enemy.x - anvil.x, enemy.y - anvil.targetY);
          if (dist <= 78 + enemy.radius) {
            const ang = Math.atan2(enemy.y - anvil.targetY, enemy.x - anvil.x);
            enemy.shieldTimer = 0;
            enemy.armorShredTimer = Math.max(enemy.armorShredTimer, 2.5);
            ctx.applyDamage(
              owner,
              enemy,
              ctx.getEffectiveDamage(owner, 22.5),
              Math.cos(ang) * 480,
              Math.sin(ang) * 480,
              { isCrit: true, sourceKind: 'ability' },
            );
            applyFighterStun(ctx, owner, enemy, 0.75, 'chained', 'CRUSHED!');
          }
        }
      }
      if (anvil.progress >= 1.45) {
        data.anvils.splice(i, 1);
      }
    }
  },

  onExpire(ctx, owner) {
    if (!owner) return;
    // Cleanly disarm unused Totem when ultimate ends
    owner.totemActive = false;
    owner.enchantArmorTimer = Math.min(owner.enchantArmorTimer, 0.2);
    // Remaining Steve obstacles fade out naturally via their life timer
    for (const obs of ctx.obstacles) {
      if (obs.ownerUid === owner.uid) {
        obs.life = Math.min(obs.life, 0.35);
      }
    }
  },
};
