import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface MahoragaUltimateData {
  wheelAngle: number;
  adaptTurns: number;
  turnCd: number;
  lastHp: number;
  worldSlashFired: boolean;
  slashX1: number;
  slashY1: number;
  slashX2: number;
  slashY2: number;
  slashFlash: number;
}

export const mahoragaUltimateHandler: UltimateHandler = {
  characterId: 'mahoraga',
  title: 'EIGHT-HANDLED SWORD DIVERGENT SILA: WHEEL OF ADAPTATION',
  subtitle:
    'Spins the 8-Spoke Dharma Wheel (*KLINK!*): Unstoppable + Absorbs projectiles & adapts to damage to LEVEL UP & heal → Unleashes World-Cutting Slash piercing invulnerability, shields & obstacles!',
  bannerColor: '#eab308',
  castDuration: 0.25,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.2);
    owner.enchantArmorTimer = Math.max(owner.enchantArmorTimer, 3.4);

    const healAmt = owner.maxHp * 0.08 * getHealMultiplier(owner);
    if (healAmt > 0.5) {
      owner.hp = Math.min(owner.maxHp, owner.hp + healAmt);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 14,
        `+${Math.round(healAmt)} ADAPT REGEN`,
        '#fde047',
        'heal',
      );
    }

    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;

    const data: MahoragaUltimateData = {
      wheelAngle: 0,
      adaptTurns: 1,
      turnCd: 0.65,
      lastHp: owner.hp,
      worldSlashFired: false,
      slashX1: owner.x,
      slashY1: owner.y,
      slashX2: owner.x + Math.cos(ang) * 900,
      slashY2: owner.y + Math.sin(ang) * 900,
      slashFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, ang, '#eab308', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      210,
      '#facc15',
      7,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      '*KLINK!* ADAPTATION BEGINS!',
      '#fef08a',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 24, '#facc15', 75, 250, 3, 6, 'star');
    ctx.addScreenShake(10);
    ctx.addHitstop(0.055);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as MahoragaUltimateData;
    const enemies = ctx.getEnemies(owner);

    data.wheelAngle += dt * (2.6 + data.adaptTurns * 0.65);
    if (data.slashFlash > 0) data.slashFlash = Math.max(0, data.slashFlash - dt);

    const triggerWheelTurn = (reason: string): void => {
      if (data.adaptTurns >= 8) return;
      data.adaptTurns++;
      data.wheelAngle += Math.PI / 4;
      owner.shieldTimer = Math.max(owner.shieldTimer, 1.0);
      const heal = owner.maxHp * 0.03 * getHealMultiplier(owner);
      if (heal > 0.5) {
        owner.hp = Math.min(owner.maxHp, owner.hp + heal);
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        130,
        '#facc15',
        4.5,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 16,
        `*KLINK!* ${reason} x${data.adaptTurns}`,
        '#fef08a',
        'callout',
      );
      ctx.emitSfx({ type: 'dodge', intensity: 1.05 });
    };

    // 1. Adapt to incoming projectiles & damage taken during Dharma Wheel phase!
    if (!data.worldSlashFired) {
      for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
        const p = ctx.projectiles[i];
        if (
          p.ownerUid !== owner.uid &&
          Math.hypot(p.x - owner.x, p.y - owner.y) <= owner.radius + 78
        ) {
          ctx.spawnParticles(p.x, p.y, 8, '#fde047', 45, 140, 2.5, 5, 'star');
          ctx.projectiles.splice(i, 1);
          triggerWheelTurn('ADAPTED');
        }
      }

      if (owner.hp < data.lastHp - 4) {
        triggerWheelTurn('ADAPTED');
      }
      data.lastHp = owner.hp;

      data.turnCd -= dt;
      if (data.turnCd <= 0) {
        data.turnCd = 0.7;
        triggerWheelTurn('WHEEL TURN');
      }
    }

    // 2. Climax (2.15s): WORLD-CUTTING SLASH (Adapted Sword of Extermination!)
    if (!data.worldSlashFired && state.elapsed >= 2.15) {
      data.worldSlashFired = true;
      data.slashFlash = 1.35;

      const target = ctx.getNearestEnemy(owner);
      const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
      const lx = Math.cos(ang);
      const ly = Math.sin(ang);

      data.slashX1 = owner.x - lx * 140;
      data.slashY1 = owner.y - ly * 140;
      data.slashX2 = owner.x + lx * 950;
      data.slashY2 = owner.y + ly * 950;

      // Cleave ALL obstacles & hostile projectiles along the World-Cutting Slash corridor!
      for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
        const obs = ctx.obstacles[i];
        const px = obs.x - owner.x;
        const py = obs.y - owner.y;
        const proj = px * lx + py * ly;
        const perp = Math.abs(px * ly - py * lx);
        if (proj >= -40 && perp <= 68) {
          ctx.obstacles.splice(i, 1);
        }
      }
      for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
        const p = ctx.projectiles[i];
        if (p.ownerUid === owner.uid) continue;
        const px = p.x - owner.x;
        const py = p.y - owner.y;
        const proj = px * lx + py * ly;
        const perp = Math.abs(px * ly - py * lx);
        if (proj >= -40 && perp <= 68) {
          ctx.projectiles.splice(i, 1);
        }
      }

      const slashDmg = 16.0 + data.adaptTurns * 2.1;
      for (const e of enemies) {
        const px = e.x - owner.x;
        const py = e.y - owner.y;
        const proj = px * lx + py * ly;
        const perp = Math.abs(px * ly - py * lx);
        if (proj >= -e.radius - 40 && perp <= e.radius + 72) {
          e.shieldTimer = 0;
          e.evadeTimer = 0;
          e.dodgeLockedTimer = Math.max(e.dodgeLockedTimer, 2.6);
          e.armorShredTimer = Math.max(e.armorShredTimer, 3.2);
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, slashDmg), lx * 580, ly * 580, {
            bypassInvuln: true,
            isCrit: true,
            sourceKind: 'ability',
          });
          ctx.spawnFloatingText(
            e.x,
            e.y - e.radius - 16,
            'WORLD-CUTTING SLASH!!',
            '#fef08a',
            'crit',
          );
        }
      }

      ctx.addHitstop(0.09);
      ctx.addScreenShake(24);
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        260,
        '#facc15',
        9,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 24,
        'ADAPTATION COMPLETE · WORLD SLASH!!',
        '#fef08a',
        'powerup',
      );
      ctx.emitSfx({ type: 'slash', intensity: 1.5 });
    }
  },
};
