import type { UltimateHandler } from './types';

export interface DekuUltimateData {
  stage: 'overdrive' | 'detroit-smashed' | 'recoil';
  lowGearUid: string | null;
  lowGearTimer: number;
  faJinCharge: number; // 0 -> 100 kinetic energy!
  whipVisualTimer: number;
  whipTargetX: number;
  whipTargetY: number;
  smashFlash: number;
  smashX: number;
  smashY: number;
  hitCd: Record<string, number>;
}

export const dekuUltimateHandler: UltimateHandler = {
  characterId: 'deku',
  title: 'GEARSHIFT: OVERDRIVE + FA JIN + BLACKWHIP',
  subtitle:
    'Blackwhip pulls & forces enemies into Low Gear (-75% speed) · Deku shifts to Top Gear (+80% speed) charging Fa Jin for a 120% Detroit Smash!',
  bannerColor: '#10b981',
  castDuration: 0.22,
  duration: 4.5,

  onCast(ctx, owner, state) {
    const target = ctx.getNearestEnemy(owner);
    if (target) {
      owner.facingAngle = Math.atan2(target.y - owner.y, target.x - owner.x);
      // Blackwhip snap pull + force enemy into LOW GEAR (25% speed)!
      const dx = owner.x - target.x;
      const dy = owner.y - target.y;
      const d = Math.max(1, Math.hypot(dx, dy));
      target.vx = (dx / d) * 140;
      target.vy = (dy / d) * 140;
      ctx.spawnFloatingText(
        target.x,
        target.y - target.radius - 16,
        'LOW GEAR!',
        '#ef4444',
        'callout',
      );
    }

    const data: DekuUltimateData = {
      stage: 'overdrive',
      lowGearUid: target ? target.uid : null,
      lowGearTimer: 2.2,
      faJinCharge: 35,
      whipVisualTimer: 0.65,
      whipTargetX: target ? target.x : owner.x + 80,
      whipTargetY: target ? target.y : owner.y,
      smashFlash: 0,
      smashX: owner.x,
      smashY: owner.y,
      hitCd: {},
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#10b981', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'TOP GEAR · OVERDRIVE!',
      '#4ade80',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 20, '#10b981', 80, 260, 2.5, 5.5, 'star');
    ctx.addScreenShake(8);
    ctx.addHitstop(0.045);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as DekuUltimateData;
    const enemies = ctx.getEnemies(owner);
    if (data.whipVisualTimer > 0) data.whipVisualTimer = Math.max(0, data.whipVisualTimer - dt);

    for (const uid of Object.keys(data.hitCd)) {
      data.hitCd[uid] -= dt;
      if (data.hitCd[uid] <= 0) delete data.hitCd[uid];
    }

    // Apply LOW GEAR (25% speed sluggishness) onto snagged target!
    if (data.lowGearTimer > 0 && data.lowGearUid) {
      data.lowGearTimer -= dt;
      const slowVictim = enemies.find((e) => e.uid === data.lowGearUid);
      if (slowVictim) {
        slowVictim.vx *= Math.pow(0.25, dt * 3.8);
        slowVictim.vy *= Math.pow(0.25, dt * 3.8);
        data.whipTargetX = slowVictim.x;
        data.whipTargetY = slowVictim.y;
      }
    }

    // Phase 1: TOP GEAR (+80% speed kinetic blitz building Fa Jin 100%) -> Detroit Smash 120%!
    if (data.stage === 'overdrive') {
      const target = ctx.getNearestEnemy(owner);
      if (target) {
        const dx = target.x - owner.x;
        const dy = target.y - owner.y;
        const d = Math.max(1, Math.hypot(dx, dy));
        owner.vx = (dx / d) * 760;
        owner.vy = (dy / d) * 760;
        owner.facingAngle = Math.atan2(dy, dx);
      }
      data.faJinCharge = Math.min(100, data.faJinCharge + dt * 28);

      for (const e of enemies) {
        if (data.hitCd[e.uid]) continue;
        if (Math.hypot(e.x - owner.x, e.y - owner.y) <= owner.radius + e.radius + 16) {
          data.hitCd[e.uid] = 0.45;
          data.faJinCharge = Math.min(100, data.faJinCharge + 35);
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 6.2),
            owner.vx * 0.35,
            owner.vy * 0.35,
            {
              sourceKind: 'ability',
            },
          );
          ctx.emitSfx({ type: 'hit', intensity: 1.1 });
        }
      }

      if (state.elapsed >= 3.25) {
        data.stage = 'detroit-smashed';
        data.smashFlash = 0.8;
        data.smashX = owner.x;
        data.smashY = owner.y;
        const faJinMult = 1 + (data.faJinCharge / 100) * 0.65;

        ctx.addHitstop(0.075);
        ctx.addScreenShake(17);
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          205,
          '#10b981',
          8,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnParticles(owner.x, owner.y, 28, '#10b981', 110, 390, 3, 7, 'star');
        ctx.spawnParticles(owner.x, owner.y, 18, '#ef4444', 90, 320, 3, 6, 'spark');
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 22,
          'DETROIT SMASH 120%!',
          '#4ade80',
          'powerup',
        );
        ctx.emitSfx({ type: 'ko', intensity: 1.3 });

        for (const e of enemies) {
          const dx = e.x - owner.x;
          const dy = e.y - owner.y;
          const d = Math.hypot(dx, dy);
          if (d <= 200 + e.radius) {
            const nx = d > 0.1 ? dx / d : 1;
            const ny = d > 0.1 ? dy / d : 0;
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, 14.5 * faJinMult),
              nx * 640,
              ny * 640,
              { isCrit: true, sourceKind: 'ability' },
            );
          }
        }
      }
    } else if (data.stage === 'detroit-smashed') {
      if (data.smashFlash > 0) data.smashFlash = Math.max(0, data.smashFlash - dt);
      if (state.elapsed >= 3.45) {
        data.stage = 'recoil';
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 14,
          'GEARSHIFT RECOIL!',
          '#fb923c',
          'callout',
        );
      }
    } else {
      // Phase 3: Canon Gearshift Oxygen Deprivation Recoil (-30% speed for final ~1s!)
      owner.vx *= Math.pow(0.55, dt * 3.0);
      owner.vy *= Math.pow(0.55, dt * 3.0);
    }
  },
};
