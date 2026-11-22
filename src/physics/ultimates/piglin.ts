import type { UltimateHandler } from './types';

export interface PiglinUltimateData {
  cleavesDone: number;
  cleaveCd: number;
  flash: number;
}

export const piglinUltimateHandler: UltimateHandler = {
  characterId: 'piglin',
  title: 'BASTION BRUTE: GOLDEN AXE SHIELD-BREAKER',
  subtitle:
    'Charges in unstoppable Bastion Rage, immediately shatters enemy shields & shreds armor with 3 heavy Golden Battleaxe cleaves!',
  bannerColor: '#eab308',
  castDuration: 0.24,
  duration: 3.6,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.0);
    const data: PiglinUltimateData = {
      cleavesDone: 0,
      cleaveCd: 0.4,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#eab308', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'BASTION BRUTE RAGE!',
      '#facc15',
      'powerup',
    );
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as PiglinUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (data.cleavesDone < 3) {
      data.cleaveCd -= dt;
      if (data.cleaveCd <= 0) {
        data.cleaveCd = 0.72;
        data.cleavesDone += 1;
        data.flash = 0.55;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          owner.vx = Math.cos(ang) * 460;
          owner.vy = Math.sin(ang) * 460;
        }
        for (const e of ctx.getEnemies(owner)) {
          if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 220 + e.radius) {
            e.shieldTimer = 0;
            e.armorShredTimer = Math.max(e.armorShredTimer, 3.6);
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, data.cleavesDone === 3 ? 18.5 : 11.0),
              0,
              0,
              {
                isCrit: data.cleavesDone === 3,
                bypassInvuln: data.cleavesDone === 3,
                sourceKind: 'ability',
              },
            );
          }
        }
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          220,
          '#facc15',
          7,
          owner.character.id,
          owner.character.series,
        );
        ctx.addScreenShake(12);
        ctx.emitSfx({ type: 'crit', intensity: 1.2 });
      }
    }
  },
};
