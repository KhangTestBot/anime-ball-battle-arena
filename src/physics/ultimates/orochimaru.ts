import type { UltimateHandler } from './types';

export interface OrochimaruUltimateData {
  serpentsDone: number;
  serpentCd: number;
  hydraFired: boolean;
  flash: number;
}

export const orochimaruUltimateHandler: UltimateHandler = {
  characterId: 'orochimaru',
  title: 'EIGHT BRANCHES TECHNIQUE: WHITE SNAKE!',
  subtitle:
    'Immortal White Snake shedding (Totem Revive + Venom Anti-Heal), fires 3 Kusanagi & Snake volleys, and crushes foes with Eight-Headed Serpent!',
  bannerColor: '#a855f7',
  castDuration: 0.22,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.totemActive = true;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.2);
    for (const e of ctx.getEnemies(owner)) {
      e.antiHealTimer = Math.max(e.antiHealTimer, 4.5);
    }

    const data: OrochimaruUltimateData = {
      serpentsDone: 0,
      serpentCd: 0.3,
      hydraFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#a855f7', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'EIGHT BRANCHES TECHNIQUE!',
      '#a855f7',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as OrochimaruUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.hydraFired && data.serpentsDone < 3) {
      data.serpentCd -= dt;
      if (data.serpentCd <= 0) {
        data.serpentCd = 0.44;
        data.serpentsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.2, 0, 0.2]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('oro_snake'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'dragon-acid',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 630,
            vy: Math.sin(a) * 630,
            radius: 12,
            damage: ctx.getEffectiveDamage(owner, 7.8),
            knockback: 205,
            color: '#a855f7',
            secondaryColor: '#22c55e',
            angle: a,
            life: 1.5,
            maxLife: 1.5,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.15 });
      }
    }

    if (!data.hydraFired && state.elapsed >= 2.05) {
      data.hydraFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.antiHealTimer = Math.max(e.antiHealTimer, 5.0);
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 24.5),
          Math.cos(ang) * 580,
          Math.sin(ang) * 580,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        320,
        '#a855f7',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'EIGHT-HEADED SERPENT!!',
        '#22c55e',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },

  onExpire(_ctx, owner) {
    if (!owner) return;
    owner.totemActive = false;
  },
};
