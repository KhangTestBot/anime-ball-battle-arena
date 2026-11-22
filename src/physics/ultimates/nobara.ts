import { applyFighterStun } from '../domains';
import type { UltimateHandler } from './types';

export interface FloatingNail {
  x: number;
  y: number;
  detonated: boolean;
}

export interface NobaraUltimateData {
  stage: 'resonance' | 'hairpin' | 'done';
  dollX: number;
  dollY: number;
  targetUid: string | null;
  nails: FloatingNail[];
  resonanceFlash: number;
  hairpinFlash: number;
}

export const nobaraUltimateHandler: UltimateHandler = {
  characterId: 'nobara',
  title: 'RESONANCE & HAIRPIN!',
  subtitle:
    'Scatters 5 Cursed Nails around targets then drives a Straw Doll Resonance strike bypassing shield direction → Snaps fingers to detonate HAIRPIN simultaneously!',
  bannerColor: '#f97316',
  castDuration: 0.25,
  duration: 3.6,

  onCast(ctx, owner, state) {
    const target = ctx.getNearestEnemy(owner);
    const tx = target ? target.x : owner.x + 90;
    const ty = target ? target.y : owner.y;
    const { left, right, top, bottom } = ctx.bounds;

    const nails: FloatingNail[] = [];
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5;
      nails.push({
        x: Math.max(left + 32, Math.min(right - 32, tx + Math.cos(a) * 66)),
        y: Math.max(top + 32, Math.min(bottom - 32, ty + Math.sin(a) * 66)),
        detonated: false,
      });
    }

    // Immediate Straw Doll Resonance Hammer strike echoing straight into enemy soul!
    if (target) {
      target.armorShredTimer = Math.max(target.armorShredTimer, 2.5);
      ctx.applyDamage(owner, target, ctx.getEffectiveDamage(owner, 9.5), 0, 0, {
        isCrit: true,
        sourceKind: 'ability',
      });
      ctx.spawnFloatingText(
        target.x,
        target.y - target.radius - 18,
        'RESONANCE!!',
        '#fb923c',
        'crit',
      );
    }

    const data: NobaraUltimateData = {
      stage: 'resonance',
      dollX: owner.x + Math.cos(owner.facingAngle) * 30,
      dollY: owner.y + Math.sin(owner.facingAngle) * 30,
      targetUid: target ? target.uid : null,
      nails,
      resonanceFlash: 0.9,
      hairpinFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#f97316', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      175,
      '#fb923c',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'STRAW DOLL RESONANCE!',
      '#fdba74',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'hit', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as NobaraUltimateData;
    const enemies = ctx.getEnemies(owner);
    data.dollX = owner.x + Math.cos(owner.facingAngle) * 28;
    data.dollY = owner.y + Math.sin(owner.facingAngle) * 28;

    if (data.resonanceFlash > 0) data.resonanceFlash = Math.max(0, data.resonanceFlash - dt);
    if (data.hairpinFlash > 0) data.hairpinFlash = Math.max(0, data.hairpinFlash - dt);

    // Stage 2 (1.55s): Snap fingers -> HAIRPIN!! Detonate all 5 hovering Iron Nails simultaneously!
    if (data.stage === 'resonance' && state.elapsed >= 1.55) {
      data.stage = 'hairpin';
      data.hairpinFlash = 1.0;

      ctx.addHitstop(0.075);
      ctx.addScreenShake(18);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 20,
        'HAIRPIN!!',
        '#ef4444',
        'powerup',
      );
      ctx.emitSfx({ type: 'ko', intensity: 1.3 });

      for (const nail of data.nails) {
        nail.detonated = true;
        ctx.spawnShockwave(
          nail.x,
          nail.y,
          115,
          '#ef4444',
          5.5,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnParticles(nail.x, nail.y, 14, '#f97316', 75, 250, 3, 6, 'shard');
        for (const e of enemies) {
          if (Math.hypot(e.x - nail.x, e.y - nail.y) <= 95 + e.radius) {
            applyFighterStun(ctx, owner, e, 0.55, 'void-overload', 'NAIL BLAST!');
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 5.2), 0, 0, {
              isCrit: true,
              sourceKind: 'ability',
            });
          }
        }
      }
    } else if (data.stage === 'hairpin' && data.hairpinFlash <= 0) {
      data.stage = 'done';
    }
  },
};
