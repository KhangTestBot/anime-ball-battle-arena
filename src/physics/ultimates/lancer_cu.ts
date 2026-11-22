import type { UltimateHandler } from './types';

export interface LancerCuUltimateData {
  spearsDone: number;
  spearCd: number;
  gaeBolgFired: boolean;
  flash: number;
}

export const lancerCuUltimateHandler: UltimateHandler = {
  characterId: 'lancer_cu',
  title: 'GÁE BOLG: BARBED SPEAR OF CAUSALITY!',
  subtitle:
    'Battle Continuation (Totem Revive + Auto-Dodge), hurls 3 Crimson Rune-Spears, and reverses causality with GÁE BOLG!',
  bannerColor: '#dc2626',
  castDuration: 0.22,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.totemActive = true;
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 2.8);
    owner.dmgBonusPct += 22;

    const data: LancerCuUltimateData = {
      spearsDone: 0,
      spearCd: 0.28,
      gaeBolgFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#dc2626', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'BATTLE CONTINUATION: GÁE BOLG!!',
      '#dc2626',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'powerup', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as LancerCuUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.gaeBolgFired && data.spearsDone < 3) {
      data.spearCd -= dt;
      if (data.spearCd <= 0) {
        data.spearCd = 0.44;
        data.spearsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.18, 0, 0.18]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('cu_spear'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'arrow-trident',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 780,
            vy: Math.sin(a) * 780,
            radius: 12,
            damage: ctx.getEffectiveDamage(owner, 8.6),
            knockback: 230,
            color: '#dc2626',
            secondaryColor: '#2563eb',
            angle: a,
            life: 1.4,
            maxLife: 1.4,
            piercing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.25 });
      }
    }

    if (!data.gaeBolgFired && state.elapsed >= 2.05) {
      data.gaeBolgFired = true;
      data.flash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 27.5),
          Math.cos(ang) * 660,
          Math.sin(ang) * 660,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        355,
        '#dc2626',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'GÁE BOLG: HEART PIERCED!!',
        '#dc2626',
        'crit',
      );
      ctx.addScreenShake(20);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.45 });
    }
  },

  onExpire(_ctx, owner) {
    if (!owner) return;
    owner.totemActive = false;
  },
};
