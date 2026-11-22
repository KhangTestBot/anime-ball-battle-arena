import type { UltimateHandler } from './types';

export interface IskandarUltimateData {
  volleysDone: number;
  volleyCd: number;
  chargeFired: boolean;
  flash: number;
}

export const iskandarUltimateHandler: UltimateHandler = {
  characterId: 'iskandar',
  title: 'IONIOI HETAIROI: ARMY OF THE KING!',
  subtitle:
    'Summons his immortal Companions (Unstoppable + +22% DMG), launches 3 Gordius Wheel volleys, and leads the Grand Cavalry Charge!',
  bannerColor: '#dc2626',
  castDuration: 0.24,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.8);
    owner.dmgBonusPct += 22;

    const data: IskandarUltimateData = {
      volleysDone: 0,
      volleyCd: 0.3,
      chargeFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#dc2626', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'IONIOI HETAIROI!! CHARGE!!',
      '#facc15',
      'powerup',
    );
    ctx.addScreenShake(13);
    ctx.emitSfx({ type: 'powerup', intensity: 1.35 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as IskandarUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.chargeFired && data.volleysDone < 3) {
      data.volleyCd -= dt;
      if (data.volleyCd <= 0) {
        data.volleyCd = 0.44;
        data.volleysDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.28, -0.1, 0.1, 0.28]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('iskandar_cav'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'sword-wave',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 700,
            vy: Math.sin(a) * 700,
            radius: 13,
            damage: ctx.getEffectiveDamage(owner, 7.6),
            knockback: 230,
            color: '#dc2626',
            secondaryColor: '#facc15',
            angle: a,
            life: 1.45,
            maxLife: 1.45,
            piercing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'wall', intensity: 1.25 });
      }
    }

    if (!data.chargeFired && state.elapsed >= 2.05) {
      data.chargeFired = true;
      data.flash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 27.5),
          Math.cos(ang) * 690,
          Math.sin(ang) * 690,
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
        'ALALALALALALAI!!',
        '#facc15',
        'crit',
      );
      ctx.addScreenShake(21);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.5 });
    }
  },
};
