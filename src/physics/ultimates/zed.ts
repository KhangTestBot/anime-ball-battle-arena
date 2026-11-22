import type { UltimateHandler } from './types';

export interface ZedShadow {
  x: number;
  y: number;
}

export interface ZedUltimateData {
  shadows: ZedShadow[];
  markedUid: string | null;
  shurikenVolleys: number;
  volleyCd: number;
  markDetonated: boolean;
  detonateX: number;
  detonateY: number;
  detonateFlash: number;
}

export const zedUltimateHandler: UltimateHandler = {
  characterId: 'zed',
  title: 'DEATH MARK (R) · LIVING SHADOW TRIANGLE',
  subtitle:
    'Spawns 2 untargetable Living Shadows in a triangle around the marked prey, fires synchronized triple Razor Shurikens, then detonates Death Mark!',
  bannerColor: '#dc2626',
  castDuration: 0.22,
  duration: 3.6,

  onCast(ctx, owner, state) {
    owner.untargetableTimer = Math.max(owner.untargetableTimer, 0.55);
    const target = ctx.getNearestEnemy(owner);
    const cx = target ? target.x : (ctx.bounds.left + ctx.bounds.right) * 0.5;
    const cy = target ? target.y : (ctx.bounds.top + ctx.bounds.bottom) * 0.5;
    const clampX = (x: number) =>
      Math.max(ctx.bounds.left + 36, Math.min(ctx.bounds.right - 36, x));
    const clampY = (y: number) =>
      Math.max(ctx.bounds.top + 36, Math.min(ctx.bounds.bottom - 36, y));

    const shadows: ZedShadow[] = [
      { x: clampX(cx - 115), y: clampY(cy - 88) },
      { x: clampX(cx + 115), y: clampY(cy + 88) },
    ];

    if (target) {
      target.slayerMarkTimer = Math.max(target.slayerMarkTimer, 2.3);
      target.armorShredTimer = Math.max(target.armorShredTimer, 2.8);
      ctx.spawnFloatingText(
        target.x,
        target.y - target.radius - 20,
        'DEATH MARK!',
        '#ef4444',
        'callout',
      );
    }

    const data: ZedUltimateData = {
      shadows,
      markedUid: target?.uid ?? null,
      shurikenVolleys: 0,
      volleyCd: 0.32,
      markDetonated: false,
      detonateX: cx,
      detonateY: cy,
      detonateFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#dc2626', 'ULT', true);
    ctx.spawnParticles(owner.x, owner.y, 18, '#ef4444', 60, 210, 2.5, 5.5, 'shard');
    ctx.addScreenShake(8);
    ctx.addHitstop(0.04);
    ctx.emitSfx({ type: 'slash', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ZedUltimateData;
    if (data.detonateFlash > 0) data.detonateFlash = Math.max(0, data.detonateFlash - dt);

    const marked =
      (data.markedUid ? ctx.fighters.find((f) => f.uid === data.markedUid && f.alive) : null) ??
      ctx.getNearestEnemy(owner);
    if (marked) {
      data.detonateX = marked.x;
      data.detonateY = marked.y;
    }

    // 1. Synchronized Triple Razor Shuriken volleys from Zed + both Living Shadows!
    if (!data.markDetonated && data.shurikenVolleys < 3 && marked) {
      data.volleyCd -= dt;
      if (data.volleyCd <= 0) {
        data.volleyCd = 0.5;
        data.shurikenVolleys += 1;
        const origins = [{ x: owner.x, y: owner.y }, ...data.shadows];
        for (const o of origins) {
          const ang = Math.atan2(marked.y - o.y, marked.x - o.x);
          ctx.projectiles.push({
            id: ctx.nextId('zed_q'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'shuriken-star',
            x: o.x,
            y: o.y,
            vx: Math.cos(ang) * 610,
            vy: Math.sin(ang) * 610,
            radius: 10,
            damage: ctx.getEffectiveDamage(owner, 6.8),
            knockback: 140,
            color: '#ef4444',
            secondaryColor: '#09090b',
            angle: ang,
            life: 1.4,
            maxLife: 1.4,
            piercing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.0 });
      }
    }

    // 2. Climax (1.95s): DEATH MARK DETONATION!
    if (!data.markDetonated && state.elapsed >= 1.95) {
      data.markDetonated = true;
      data.detonateFlash = 1.1;

      if (marked) {
        marked.shieldTimer = 0;
        marked.dodgeLockedTimer = Math.max(marked.dodgeLockedTimer, 2.0);
        const popDmg = ctx.getEffectiveDamage(owner, 22.5);
        ctx.applyDamage(owner, marked, popDmg, 0, 0, {
          isCrit: true,
          bypassInvuln: true,
          sourceKind: 'ability',
        });
        ctx.spawnShockwave(
          marked.x,
          marked.y,
          175,
          '#dc2626',
          7,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnParticles(marked.x, marked.y, 32, '#ef4444', 90, 320, 3, 7, 'shard');
        ctx.spawnFloatingText(
          marked.x,
          marked.y - marked.radius - 26,
          'DEATH MARK POP!',
          '#ef4444',
          'crit',
        );
        ctx.addScreenShake(14);
        ctx.addHitstop(0.06);
        ctx.emitSfx({ type: 'ko', intensity: 1.2 });
      }
    }
  },
};
