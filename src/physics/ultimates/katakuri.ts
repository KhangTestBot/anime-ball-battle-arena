import type { UltimateHandler } from './types';

export interface MochiPuddle {
  x: number;
  y: number;
  radius: number;
}

export interface KatakuriUltimateData {
  stage: 'future-sight-mochi' | 'zan-giri' | 'done';
  puddles: MochiPuddle[];
  donutsLeft: number;
  donutCd: number;
  zanGiriSlammed: boolean;
  slamFlash: number;
}

export const katakuriUltimateHandler: UltimateHandler = {
  characterId: 'katakuri',
  title: 'FUTURE SIGHT & ZAN GIRI MOCHI (BUZZ CUT MOCHI)',
  subtitle:
    'Kenbunshoku Future Sight (2.6s Dodge) + Sticky Mochi Puddles slow enemies → Opens Donut Portals firing 4 Haki Fists → Spiked Zan Giri Mochi smashes obstacles & breaks shields!',
  bannerColor: '#c026d3',
  castDuration: 0.24,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.evadeTimer = Math.max(owner.evadeTimer, 2.6);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.2);
    const { left, right, top, bottom } = ctx.bounds;

    const target = ctx.getNearestEnemy(owner);
    const tx = target ? target.x : owner.x + 80;
    const ty = target ? target.y : owner.y;

    const puddles: MochiPuddle[] = [];
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI * 2) / 4;
      puddles.push({
        x: Math.max(left + 44, Math.min(right - 44, tx + Math.cos(a) * 58)),
        y: Math.max(top + 44, Math.min(bottom - 44, ty + Math.sin(a) * 58)),
        radius: 52,
      });
    }

    const data: KatakuriUltimateData = {
      stage: 'future-sight-mochi',
      puddles,
      donutsLeft: 4,
      donutCd: 0.25,
      zanGiriSlammed: false,
      slamFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#c026d3', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      190,
      '#e879f9',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'FUTURE SIGHT: MOCHI WORLD!',
      '#f5d0fe',
      'powerup',
    );
    ctx.addScreenShake(9);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as KatakuriUltimateData;
    const enemies = ctx.getEnemies(owner);
    const { left, right, top, bottom } = ctx.bounds;

    if (data.slamFlash > 0) data.slamFlash = Math.max(0, data.slamFlash - dt);

    // Sticky Awakened Mochi Floor Puddles heavily slow trapped enemies!
    for (const e of enemies) {
      if (data.puddles.some((p) => Math.hypot(e.x - p.x, e.y - p.y) <= p.radius + e.radius)) {
        e.vx *= Math.pow(0.35, dt * 4);
        e.vy *= Math.pow(0.35, dt * 4);
      }
    }

    // Floating Power Mochi Donut Portals shoot Haki-infused fists!
    if (data.stage === 'future-sight-mochi' && data.donutsLeft > 0) {
      data.donutCd -= dt;
      if (data.donutCd <= 0) {
        data.donutCd = 0.44;
        data.donutsLeft--;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const portalAng = data.donutsLeft * 1.65;
          const px = Math.max(left + 30, Math.min(right - 30, target.x + Math.cos(portalAng) * 95));
          const py = Math.max(top + 30, Math.min(bottom - 30, target.y + Math.sin(portalAng) * 95));
          const shotAng = Math.atan2(target.y - py, target.x - px);
          ctx.projectiles.push({
            id: ctx.nextId('power_mochi'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'fist-wave',
            x: px,
            y: py,
            vx: Math.cos(shotAng) * 580,
            vy: Math.sin(shotAng) * 580,
            radius: 17,
            damage: ctx.getEffectiveDamage(owner, 4.8),
            knockback: 310,
            color: '#c026d3',
            secondaryColor: '#18181b',
            angle: shotAng,
            life: 1.0,
            maxLife: 1.0,
            piercing: false,
            homing: true,
            hitCooldowns: {},
            powerLevel: 6,
          });
          ctx.spawnFloatingText(px, py - 14, 'POWER MOCHI!', '#e879f9', 'callout');
          ctx.emitSfx({ type: 'hit', intensity: 1.0 });
        }
      }
    }

    // Climax (2.3s): ZAN GIRI MOCHI (Buzz Cut Mochi Donut Mace Smash!)
    if (!data.zanGiriSlammed && state.elapsed >= 2.3) {
      data.zanGiriSlammed = true;
      data.stage = 'zan-giri';
      data.slamFlash = 1.0;

      const target = ctx.getNearestEnemy(owner);
      if (target) {
        const dx = target.x - owner.x;
        const dy = target.y - owner.y;
        const dist = Math.max(1, Math.hypot(dx, dy));
        const ux = dx / dist;
        const uy = dy / dist;
        owner.x = Math.max(
          left + owner.radius + 8,
          Math.min(right - owner.radius - 8, target.x - ux * (owner.radius + target.radius + 6)),
        );
        owner.y = Math.max(
          top + owner.radius + 8,
          Math.min(bottom - owner.radius - 8, target.y - uy * (owner.radius + target.radius + 6)),
        );
        target.shieldTimer = 0;
        target.armorShredTimer = Math.max(target.armorShredTimer, 2.5);
        ctx.applyDamage(owner, target, ctx.getEffectiveDamage(owner, 16.5), ux * 580, uy * 580, {
          isCrit: true,
          sourceKind: 'ability',
        });
      }

      for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
        if (Math.hypot(ctx.obstacles[i].x - owner.x, ctx.obstacles[i].y - owner.y) <= 200) {
          ctx.obstacles.splice(i, 1);
        }
      }

      ctx.spawnShockwave(
        owner.x,
        owner.y,
        225,
        '#c026d3',
        8,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 22,
        'ZAN GIRI MOCHI!!',
        '#f5d0fe',
        'powerup',
      );
      ctx.addHitstop(0.08);
      ctx.addScreenShake(20);
      ctx.emitSfx({ type: 'wall', intensity: 1.4 });
    }
  },
};
