import type { UltimateHandler } from './types';

export interface TeemoUltimateData {
  shroomsFired: number;
  shroomCd: number;
  chainFired: boolean;
  flash: number;
}

export const teemoUltimateHandler: UltimateHandler = {
  characterId: 'teemo',
  title: 'NOXIOUS TRAP (R): SHROOM MINEFIELD!',
  subtitle:
    'Blinds all enemies (Confusion + Silence), tosses 4 toxic Noxious Trap volleys, and detonates a Grievous Wounds Shroom Chain Reaction!',
  bannerColor: '#22c55e',
  castDuration: 0.2,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 2.6);
    for (const e of ctx.getEnemies(owner)) {
      e.confusedTimer = Math.max(e.confusedTimer, 2.5);
      e.silenceTimer = Math.max(e.silenceTimer, 1.5);
    }

    const data: TeemoUltimateData = {
      shroomsFired: 0,
      shroomCd: 0.28,
      chainFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#22c55e', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'CAPTAIN TEEMO ON DUTY!!',
      '#22c55e',
      'powerup',
    );
    ctx.addScreenShake(9);
    ctx.emitSfx({ type: 'powerup', intensity: 1.15 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as TeemoUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.chainFired && data.shroomsFired < 4) {
      data.shroomCd -= dt;
      if (data.shroomCd <= 0) {
        data.shroomCd = 0.36;
        data.shroomsFired += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.24, 0, 0.24]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('teemo_shroom'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'dragon-acid',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 580,
            vy: Math.sin(a) * 580,
            radius: 12,
            damage: ctx.getEffectiveDamage(owner, 7.0),
            knockback: 185,
            color: '#22c55e',
            secondaryColor: '#a855f7',
            angle: a,
            life: 1.55,
            maxLife: 1.55,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'powerup', intensity: 1.05 });
      }
    }

    if (!data.chainFired && state.elapsed >= 2.0) {
      data.chainFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        e.antiHealTimer = Math.max(e.antiHealTimer, 4.5);
        e.burnTimer = Math.max(e.burnTimer, 4.5);
        e.burnDps = Math.max(e.burnDps, 9.5);
        e.burnOwnerUid = owner.uid;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 22.5),
          Math.cos(ang) * 520,
          Math.sin(ang) * 520,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        305,
        '#a855f7',
        10,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'TOXIC SHROOM DETONATION!!',
        '#22c55e',
        'crit',
      );
      ctx.addScreenShake(16);
      ctx.addHitstop(0.06);
      ctx.emitSfx({ type: 'ko', intensity: 1.3 });
    }
  },
};
