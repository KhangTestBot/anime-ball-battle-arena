import { applyFighterBurn } from '../domains';
import type { UltimateHandler } from './types';

export interface RengokuUltimateData {
  stage: 'flame-tiger' | 'purgatory-dragon' | 'aftermath';
  dragonAngle: number;
  dragonFlash: number;
  trailCd: Record<string, number>;
  burnAuraCd: Record<string, number>;
}

export const rengokuUltimateHandler: UltimateHandler = {
  characterId: 'rengoku',
  title: 'FLAME BREATHING 9TH FORM: RENGOKU (PURGATORY)',
  subtitle:
    'Undying will "Set Your Heart Ablaze" prevents death (2.2s) & Flame Tiger vortex blocks projectiles → Charges through as the blazing Crimson Dragon Rengoku scorching the entire line!',
  bannerColor: '#ea580c',
  castDuration: 0.25,
  duration: 3.8,

  onCast(ctx, owner, state) {
    owner.immortalTimer = Math.max(owner.immortalTimer, 2.2);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.8);
    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;

    const data: RengokuUltimateData = {
      stage: 'flame-tiger',
      dragonAngle: ang,
      dragonFlash: 0,
      trailCd: {},
      burnAuraCd: {},
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, ang, '#ea580c', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      190,
      '#f97316',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'SET YOUR HEART ABLAZE!!',
      '#fde047',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 24, '#f97316', 85, 290, 3, 6.5, 'star');
    ctx.addScreenShake(10);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as RengokuUltimateData;
    const enemies = ctx.getEnemies(owner);

    if (data.dragonFlash > 0) {
      data.dragonFlash = Math.max(0, data.dragonFlash - dt);
    }

    for (const uid of Object.keys(data.burnAuraCd)) {
      data.burnAuraCd[uid] -= dt;
      if (data.burnAuraCd[uid] <= 0) delete data.burnAuraCd[uid];
    }

    // Flame Tiger Vortex melts projectiles near Rengoku & ignites close enemies!
    for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
      const p = ctx.projectiles[i];
      if (
        p.ownerUid !== owner.uid &&
        !p.piercing &&
        Math.hypot(p.x - owner.x, p.y - owner.y) <= owner.radius + 36 + p.radius
      ) {
        ctx.spawnParticles(p.x, p.y, 6, '#fb923c', 50, 160, 2.5, 5, 'circle');
        ctx.projectiles.splice(i, 1);
      }
    }

    for (const e of enemies) {
      if (
        !data.burnAuraCd[e.uid] &&
        Math.hypot(e.x - owner.x, e.y - owner.y) <= owner.radius + e.radius + 40
      ) {
        data.burnAuraCd[e.uid] = 0.45;
        ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 4.0), 0, 0, {
          sourceKind: 'ability',
        });
        applyFighterBurn(e, owner.uid, 3.0, ctx.getEffectiveDamage(owner, 2.4));
      }
    }

    // Stage 2 (1.55s): NINTH FORM: RENGOKU (Purgatory Flame Dragon Charge!)
    if (data.stage === 'flame-tiger' && state.elapsed >= 1.55) {
      data.stage = 'purgatory-dragon';
      data.dragonFlash = 1.25;
      const target = ctx.getNearestEnemy(owner);
      const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
      data.dragonAngle = ang;
      owner.facingAngle = ang;
      owner.vx = Math.cos(ang) * 780;
      owner.vy = Math.sin(ang) * 780;

      ctx.addHitstop(0.075);
      ctx.addScreenShake(19);
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        230,
        '#ea580c',
        7.5,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 22,
        'NINTH FORM: RENGOKU!!',
        '#fde047',
        'powerup',
      );
      ctx.emitSfx({ type: 'slash', intensity: 1.4 });
    }

    if (data.stage === 'purgatory-dragon') {
      owner.afterimages.push({
        x: owner.x,
        y: owner.y,
        alpha: 0.85,
        color: '#ea580c',
        formIndex: owner.formIndex,
      });
      for (const uid of Object.keys(data.trailCd)) {
        data.trailCd[uid] -= dt;
        if (data.trailCd[uid] <= 0) delete data.trailCd[uid];
      }
      for (const e of enemies) {
        if (
          !data.trailCd[e.uid] &&
          Math.hypot(e.x - owner.x, e.y - owner.y) <= owner.radius + e.radius + 48
        ) {
          data.trailCd[e.uid] = 0.65;
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 17.5),
            Math.cos(data.dragonAngle) * 520,
            Math.sin(data.dragonAngle) * 520,
            { isCrit: true, sourceKind: 'ability' },
          );
          applyFighterBurn(e, owner.uid, 3.8, ctx.getEffectiveDamage(owner, 3.0));
          ctx.spawnParticles(e.x, e.y, 20, '#f97316', 100, 340, 3, 6.5, 'star');
        }
      }
      if (data.dragonFlash <= 0) {
        data.stage = 'aftermath';
      }
    }
  },
};
