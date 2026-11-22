import type { UltimateHandler } from './types';

export interface AmaterasuPatch {
  x: number;
  y: number;
  radius: number;
  life: number;
}

export interface IndraArrowBolt {
  active: boolean;
  fired: boolean;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  angle: number;
  chargeTimer: number;
  flashTimer: number;
}

export interface SasukeUltimateData {
  swapFlashX: number;
  swapFlashY: number;
  swapFlashTimer: number;
  amaterasuPatches: AmaterasuPatch[];
  arrow: IndraArrowBolt;
  tickCd: number;
}

export const sasukeUltimateHandler: UltimateHandler = {
  characterId: 'sasuke',
  title: "AMENOTEJIKARA & PERFECT SUSANOO: INDRA'S ARROW",
  subtitle:
    'Amenotejikara swaps enemies into Black Flames of Amaterasu · Susanoo Armor (-40% DMG) · Fires Indra’s Arrow piercing the entire arena!',
  bannerColor: '#a855f7',
  castDuration: 0.28,
  duration: 4.5,

  onCast(ctx, owner, state) {
    const { left, right, top, bottom } = ctx.bounds;
    const target = ctx.getNearestEnemy(owner);

    // Perfect Susanoo purple armor protection!
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.2);
    owner.shieldColor = '#a855f7';

    const patches: AmaterasuPatch[] = [];
    let swapX = owner.x;
    let swapY = owner.y;

    // 1. AMENOTEJIKARA: Instant Rinnegan space-swap placing enemy directly onto an Amaterasu Black Flame patch!
    if (target) {
      const kusanagiX = Math.max(
        left + target.radius + 22,
        Math.min(
          right - target.radius - 22,
          (left + right) / 2 + (owner.x > (left + right) / 2 ? -110 : 110),
        ),
      );
      const kusanagiY = Math.max(
        top + target.radius + 22,
        Math.min(bottom - target.radius - 22, (top + bottom) / 2 + (Math.random() - 0.5) * 120),
      );
      target.x = kusanagiX;
      target.y = kusanagiY;
      target.vx *= 0.25;
      target.vy *= 0.25;
      swapX = kusanagiX;
      swapY = kusanagiY;

      patches.push({ x: kusanagiX, y: kusanagiY, radius: 52, life: 4.0 });
      target.burnTimer = Math.max(target.burnTimer, 4.0);
      target.burnDps = Math.max(target.burnDps, ctx.getEffectiveDamage(owner, 2.5));
      target.burnOwnerUid = owner.uid;

      ctx.spawnFloatingText(
        target.x,
        target.y - target.radius - 18,
        'AMENOTEJIKARA!',
        '#c084fc',
        'powerup',
      );
      ctx.spawnShockwave(
        target.x,
        target.y,
        95,
        '#a855f7',
        5,
        owner.character.id,
        owner.character.series,
      );
    }

    const aimAng = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
    owner.facingAngle = aimAng;

    const data: SasukeUltimateData = {
      swapFlashX: swapX,
      swapFlashY: swapY,
      swapFlashTimer: 0.75,
      amaterasuPatches: patches,
      arrow: {
        active: true,
        fired: false,
        x1: owner.x,
        y1: owner.y,
        x2: owner.x + Math.cos(aimAng) * 760,
        y2: owner.y + Math.sin(aimAng) * 760,
        angle: aimAng,
        chargeTimer: 0.65, // 0.65s glowing lightning bow aim line (dodgeable perpendicularly!)
        flashTimer: 0.65,
      },
      tickCd: 0.3,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, aimAng, '#a855f7', 'ULT', true);
    ctx.spawnParticles(owner.x, owner.y, 20, '#a855f7', 70, 250, 3, 6, 'shard');
    ctx.addScreenShake(9);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'beam-charge' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as SasukeUltimateData;
    const { left, right, top, bottom } = ctx.bounds;
    const enemies = ctx.getEnemies(owner);

    if (data.swapFlashTimer > 0) {
      data.swapFlashTimer = Math.max(0, data.swapFlashTimer - dt);
    }

    // 1. Charge & Fire Piercing INDRA'S ARROW leaving Amaterasu flames along its path!
    const arrow = data.arrow;
    if (arrow.active && !arrow.fired) {
      arrow.chargeTimer -= dt;
      arrow.x1 = owner.x;
      arrow.y1 = owner.y;
      arrow.x2 = owner.x + Math.cos(arrow.angle) * 760;
      arrow.y2 = owner.y + Math.sin(arrow.angle) * 760;

      if (arrow.chargeTimer <= 0) {
        arrow.fired = true;
        arrow.flashTimer = 0.68;
        ctx.addHitstop(0.065);
        ctx.addScreenShake(16);
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 20,
          "INDRA'S ARROW!!",
          '#c084fc',
          'powerup',
        );
        ctx.emitSfx({ type: 'beam-fire' });

        // Leave 4 Amaterasu Black Flame patches along the arrow's piercing trajectory!
        for (let k = 1; k <= 4; k++) {
          const px = arrow.x1 + Math.cos(arrow.angle) * (k * 115);
          const py = arrow.y1 + Math.sin(arrow.angle) * (k * 115);
          if (px >= left + 20 && px <= right - 20 && py >= top + 20 && py <= bottom - 20) {
            data.amaterasuPatches.push({ x: px, y: py, radius: 38, life: 3.4 });
          }
        }

        // Pierce ALL enemies along the bolt ray (bypasses obstacles!)
        const dxL = Math.cos(arrow.angle);
        const dyL = Math.sin(arrow.angle);
        for (const e of enemies) {
          const rx = e.x - arrow.x1;
          const ry = e.y - arrow.y1;
          const along = rx * dxL + ry * dyL;
          const perp = Math.abs(-rx * dyL + ry * dxL);
          if (along >= -e.radius && perp <= e.radius + 32) {
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 19.5), dxL * 620, dyL * 620, {
              isCrit: true,
              sourceKind: 'ability',
            });
            e.burnTimer = Math.max(e.burnTimer, 4.0);
            e.burnDps = Math.max(e.burnDps, ctx.getEffectiveDamage(owner, 2.5));
            e.burnOwnerUid = owner.uid;
            ctx.spawnParticles(e.x, e.y, 18, '#c084fc', 90, 320, 3, 6, 'shard');
          }
        }
      }
    } else if (arrow.fired && arrow.flashTimer > 0) {
      arrow.flashTimer = Math.max(0, arrow.flashTimer - dt);
    }

    // 2. Burn enemies stepping on Amaterasu Black Flames!
    data.tickCd -= dt;
    const doBurn = data.tickCd <= 0;
    if (doBurn) data.tickCd = 0.34;

    for (let i = data.amaterasuPatches.length - 1; i >= 0; i--) {
      const patch = data.amaterasuPatches[i];
      patch.life -= dt;
      if (doBurn) {
        for (const e of enemies) {
          if (Math.hypot(e.x - patch.x, e.y - patch.y) <= patch.radius + e.radius) {
            e.burnTimer = Math.max(e.burnTimer, 3.5);
            e.burnDps = Math.max(e.burnDps, ctx.getEffectiveDamage(owner, 2.4));
            e.burnOwnerUid = owner.uid;
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 2.8), 0, 0, {
              sourceKind: 'dot',
              bypassInvuln: true,
            });
          }
        }
      }
      if (patch.life <= 0) {
        data.amaterasuPatches.splice(i, 1);
      }
    }
  },
};
