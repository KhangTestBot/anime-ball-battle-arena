import type { UltimateHandler } from './types';

export interface AizenUltimateData {
  stage: 'kyoka-hypnosis' | 'kurohitsugi-charge' | 'imploded';
  coffinX: number;
  coffinY: number;
  coffinSize: number;
  spearsProgress: number;
  decoys: { angle: number; x: number; y: number }[];
  implodeFlash: number;
}

export const aizenUltimateHandler: UltimateHandler = {
  characterId: 'aizen',
  title: 'KYOKA SUIGETSU & HADO #90: KUROHITSUGI',
  subtitle:
    'Shatters Kyoka Suigetsu to disorient the entire arena + 2 Illusion Clones deflect enemy projectiles → Seals targets inside the Black Coffin to crush them with gravity!',
  bannerColor: '#a855f7',
  castDuration: 0.25,
  duration: 4.1,

  onCast(ctx, owner, state) {
    const enemies = ctx.getEnemies(owner);
    // Complete Hypnosis confuses every enemy on the arena!
    for (const e of enemies) {
      e.confusedTimer = Math.max(e.confusedTimer, 2.8);
    }

    const target = ctx.getNearestEnemy(owner);
    const tx = target ? target.x : owner.x + 90;
    const ty = target ? target.y : owner.y;

    const data: AizenUltimateData = {
      stage: 'kyoka-hypnosis',
      coffinX: tx,
      coffinY: ty,
      coffinSize: 82,
      spearsProgress: 0,
      decoys: [
        { angle: 0, x: owner.x + 56, y: owner.y },
        { angle: Math.PI, x: owner.x - 56, y: owner.y },
      ],
      implodeFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#a855f7', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      240,
      '#c084fc',
      7,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'SHATTER, KYOKA SUIGETSU!',
      '#e9d5ff',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 24, '#e2e8f0', 80, 290, 3, 6.5, 'shard');
    ctx.addScreenShake(10);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as AizenUltimateData;
    const enemies = ctx.getEnemies(owner);

    if (data.implodeFlash > 0) {
      data.implodeFlash = Math.max(0, data.implodeFlash - dt);
    }

    // Kyoka Suigetsu mirage decoys orbit Aizen & misdirect nearby enemy projectiles!
    for (const d of data.decoys) {
      d.angle += dt * 3.4;
      d.x = owner.x + Math.cos(d.angle) * 62;
      d.y = owner.y + Math.sin(d.angle) * 62;
      for (const p of ctx.projectiles) {
        if (p.ownerUid !== owner.uid && Math.hypot(p.x - d.x, p.y - d.y) <= 28 + p.radius) {
          p.vy += (Math.random() - 0.5) * 320;
          p.vx *= 0.88;
        }
      }
    }

    if (data.stage === 'kyoka-hypnosis' && state.elapsed >= 0.95) {
      data.stage = 'kurohitsugi-charge';
      const target = ctx.getNearestEnemy(owner);
      if (target) {
        data.coffinX = target.x;
        data.coffinY = target.y;
      }
      ctx.spawnFloatingText(
        data.coffinX,
        data.coffinY - 40,
        'HADO #90: KUROHITSUGI!',
        '#c084fc',
        'powerup',
      );
      ctx.emitSfx({ type: 'beam-charge', intensity: 1.35 });
    }

    if (data.stage === 'kurohitsugi-charge') {
      data.spearsProgress = Math.min(1, (state.elapsed - 0.95) / 1.45);
      // Gravity containment slows targets inside the Black Coffin
      for (const e of enemies) {
        if (Math.hypot(e.x - data.coffinX, e.y - data.coffinY) <= data.coffinSize + e.radius) {
          e.vx *= Math.pow(0.25, dt * 3.5);
          e.vy *= Math.pow(0.25, dt * 3.5);
        }
      }

      if (state.elapsed >= 2.4) {
        data.stage = 'imploded';
        data.implodeFlash = 1.1;
        ctx.addHitstop(0.08);
        ctx.addScreenShake(21);
        ctx.spawnShockwave(
          data.coffinX,
          data.coffinY,
          220,
          '#6b21a8',
          8,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(
          data.coffinX,
          data.coffinY - 30,
          'KUROHITSUGI SHATTER!!',
          '#e9d5ff',
          'crit',
        );
        ctx.spawnParticles(data.coffinX, data.coffinY, 30, '#581c87', 100, 350, 3.5, 7, 'shard');
        ctx.emitSfx({ type: 'ko', intensity: 1.4 });

        for (const e of enemies) {
          const dx = e.x - data.coffinX;
          const dy = e.y - data.coffinY;
          const dist = Math.hypot(dx, dy);
          if (dist <= data.coffinSize + 55 + e.radius) {
            e.shieldTimer = 0;
            e.armorShredTimer = Math.max(e.armorShredTimer, 2.5);
            const d = Math.max(1, dist);
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, 18.0),
              -(dx / d) * 180,
              -(dy / d) * 180,
              {
                isCrit: true,
                sourceKind: 'ability',
              },
            );
          }
        }
      }
    }
  },
};
