import type { UltimateHandler } from './types';

export interface LuciusUltimateData {
  judgmentsDone: number;
  judgmentCd: number;
  paladinFired: boolean;
  flash: number;
}

export const luciusUltimateHandler: UltimateHandler = {
  characterId: 'lucius',
  title: 'PALADIN EMPEROR: SACRED JUDGMENT!',
  subtitle:
    'Wields Soul, Time & Gravity Magic (Totem Revive + Time-Stop Stun + +24% DMG), fires 3 Sacred Light volleys, and passes Absolute Judgment!',
  bannerColor: '#facc15',
  castDuration: 0.24,
  duration: 4.1,

  onCast(ctx, owner, state) {
    owner.totemActive = true;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.8);
    owner.dmgBonusPct += 24;
    for (const e of ctx.getEnemies(owner)) {
      e.stunTimer = Math.max(e.stunTimer, 1.3);
      e.stunKind = 'time-stop';
    }

    const data: LuciusUltimateData = {
      judgmentsDone: 0,
      judgmentCd: 0.3,
      paladinFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#facc15', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 28,
      'TRUE WIZARD KING: SOUL & TIME!!',
      '#facc15',
      'powerup',
    );
    ctx.addScreenShake(14);
    ctx.emitSfx({ type: 'powerup', intensity: 1.35 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as LuciusUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.paladinFired && data.judgmentsDone < 3) {
      data.judgmentCd -= dt;
      if (data.judgmentCd <= 0) {
        data.judgmentCd = 0.44;
        data.judgmentsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.22, 0, 0.22]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('lucius_holy'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'zoltraak-orb',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 730,
            vy: Math.sin(a) * 730,
            radius: 13,
            damage: ctx.getEffectiveDamage(owner, 9.0),
            knockback: 235,
            color: '#facc15',
            secondaryColor: '#f8fafc',
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

    if (!data.paladinFired && state.elapsed >= 2.05) {
      data.paladinFired = true;
      data.flash = 1.5;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 28.5),
          Math.cos(ang) * 680,
          Math.sin(ang) * 680,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        375,
        '#facc15',
        13,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'ABSOLUTE PALADIN JUDGMENT!!',
        '#f8fafc',
        'crit',
      );
      ctx.addScreenShake(22);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.5 });
    }
  },

  onExpire(_ctx, owner) {
    if (!owner) return;
    owner.totemActive = false;
  },
};
