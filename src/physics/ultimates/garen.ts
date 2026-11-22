import type { UltimateHandler } from './types';

export interface GarenUltimateData {
  spinTicks: number;
  spinCd: number;
  spinAngle: number;
  justiceDropped: boolean;
  justiceX: number;
  justiceY: number;
  justiceFlash: number;
}

export const garenUltimateHandler: UltimateHandler = {
  characterId: 'garen',
  title: 'JUDGMENT (E) · DEMACIAN JUSTICE (R)',
  subtitle:
    'Spins Judgment with Courage shield shredding enemy armor on every rotation, then calls down a colossal golden Demacian Justice sky-sword!',
  bannerColor: '#eab308',
  castDuration: 0.24,
  duration: 3.7,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.6);
    owner.shieldTimer = Math.max(owner.shieldTimer, 2.8);
    owner.shieldColor = '#eab308';
    const target = ctx.getNearestEnemy(owner);

    const data: GarenUltimateData = {
      spinTicks: 0,
      spinCd: 0.28,
      spinAngle: 0,
      justiceDropped: false,
      justiceX: target ? target.x : owner.x,
      justiceY: target ? target.y : owner.y,
      justiceFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#eab308', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'FOR DEMACIA!!',
      '#fde047',
      'powerup',
    );
    ctx.addScreenShake(9);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as GarenUltimateData;
    data.spinAngle += dt * 16;
    if (data.justiceFlash > 0) data.justiceFlash = Math.max(0, data.justiceFlash - dt);

    // 4 Judgment spin ticks shredding armor!
    if (!data.justiceDropped && data.spinTicks < 4) {
      data.spinCd -= dt;
      if (data.spinCd <= 0) {
        data.spinCd = 0.34;
        data.spinTicks += 1;
        for (const e of ctx.getEnemies(owner)) {
          if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 185 + e.radius) {
            e.armorShredTimer = Math.max(e.armorShredTimer, 3.0);
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 5.8), 0, 0, {
              sourceKind: 'ability',
            });
          }
        }
        ctx.emitSfx({ type: 'slash', intensity: 0.95 });
      }
    }

    // Climax (1.9s): DEMACIAN JUSTICE giant golden sky sword!
    if (!data.justiceDropped && state.elapsed >= 1.9) {
      data.justiceDropped = true;
      data.justiceFlash = 1.25;
      const target = ctx.getNearestEnemy(owner);
      if (target) {
        data.justiceX = target.x;
        data.justiceY = target.y;
        target.shieldTimer = 0;
        const missingRatio = Math.max(0, 1 - target.hp / Math.max(1, target.maxHp));
        const dmg = ctx.getEffectiveDamage(owner, 19.0 + missingRatio * 14);
        ctx.applyDamage(owner, target, dmg, 0, 0, {
          isCrit: true,
          bypassInvuln: true,
          sourceKind: 'ability',
        });
        ctx.spawnShockwave(
          target.x,
          target.y,
          210,
          '#facc15',
          8,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnParticles(target.x, target.y, 32, '#fde047', 90, 320, 3, 7, 'star');
        ctx.spawnFloatingText(
          target.x,
          target.y - target.radius - 28,
          'DEMACIAN JUSTICE!',
          '#fef08a',
          'crit',
        );
        ctx.addScreenShake(16);
        ctx.addHitstop(0.065);
        ctx.emitSfx({ type: 'ko', intensity: 1.3 });
      }
    }
  },
};
