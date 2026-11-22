import type { UltimateHandler } from './types';

export interface DanteBcUltimateData {
  singularitiesDone: number;
  singularityCd: number;
  crushFired: boolean;
  flash: number;
}

export const danteBcUltimateHandler: UltimateHandler = {
  characterId: 'dante_bc',
  title: 'PRESENCE OF THE DEMON KING!!',
  subtitle:
    'Immortal Body Magic (Totem Revive + +18% HP + Unstoppable), fires 3 Gravity Singularities, and crushes all with Demon King Gravity!',
  bannerColor: '#dc2626',
  castDuration: 0.24,
  duration: 4.1,

  onCast(ctx, owner, state) {
    owner.totemActive = true;
    owner.hp = Math.min(owner.maxHp, owner.hp + owner.maxHp * 0.18);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.6);
    owner.dmgBonusPct += 22;

    const data: DanteBcUltimateData = {
      singularitiesDone: 0,
      singularityCd: 0.3,
      crushFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#dc2626', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'PRESENCE OF THE DEMON KING!!',
      '#dc2626',
      'powerup',
    );
    ctx.addScreenShake(13);
    ctx.emitSfx({ type: 'heal', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as DanteBcUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.crushFired && data.singularitiesDone < 3) {
      data.singularityCd -= dt;
      if (data.singularityCd <= 0) {
        data.singularityCd = 0.44;
        data.singularitiesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.2, 0, 0.2]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('dante_grav'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'purple',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 650,
            vy: Math.sin(a) * 650,
            radius: 14,
            damage: ctx.getEffectiveDamage(owner, 8.8),
            knockback: 240,
            color: '#dc2626',
            secondaryColor: '#7f1d1d',
            angle: a,
            life: 1.5,
            maxLife: 1.5,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.25 });
      }
    }

    if (!data.crushFired && state.elapsed >= 2.05) {
      data.crushFired = true;
      data.flash = 1.5;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.1);
        e.stunKind = 'petrified';
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
        365,
        '#dc2626',
        13,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'GRAVITY SINGULARITY CRUSH!!',
        '#ef4444',
        'crit',
      );
      ctx.addScreenShake(21);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.5 });
    }
  },

  onExpire(_ctx, owner) {
    if (!owner) return;
    owner.totemActive = false;
  },
};
